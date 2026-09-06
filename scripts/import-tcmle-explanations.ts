import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { parseExamBank, type AnswerKey, type ExamBank, type ExamQuestion } from '../app/tcm/exam-bank.ts';
import type { ExamExplanation, ExamExplanationBank } from '../app/tcm/exam-explanations.ts';

const ANSWER_KEYS: readonly AnswerKey[] = ['A', 'B', 'C', 'D', 'E'];
const EXPECTED_TCMLE_COMMIT = '39e92cda586860c29a0ee00e4e29e15aedabb359';
// Dashes remain meaningful inside medical terms (for example, Q-T), so they
// are deliberately outside the punctuation equivalence set.
const AGREED_PUNCTUATION = /[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~，。！？、；：‘’“”（）【】《》〈〉〔〕「」『』［］｛｝…]/gu;

export type TcmleQuestion = {
  query: string;
  options: Record<AnswerKey, string>;
  answer: AnswerKey;
  reason: string;
  sourceFile: string;
  sourceQuestionIndex: number;
};

type MatchReport = {
  schemaVersion: 1;
  source: 'TCMLE';
  sourceCommit: string;
  subsetFiles: string[];
  strictMatches: number;
  accepted: number;
  answerConflicts: number;
  strictMatchQuestionIds: string[];
  conflictQuestionIds: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAnswerKey(value: unknown): value is AnswerKey {
  return typeof value === 'string' && ANSWER_KEYS.includes(value as AnswerKey);
}

export function normalizeExamText(value: string): string {
  return value.normalize('NFKC').replace(/\s/gu, '').replace(AGREED_PUNCTUATION, '');
}

export function strictQuestionMatch(cmb: ExamQuestion, candidate: TcmleQuestion): boolean {
  return normalizeExamText(cmb.question) === normalizeExamText(candidate.query)
    && ANSWER_KEYS.every((key) => normalizeExamText(cmb.options[key]) === normalizeExamText(candidate.options[key]));
}

export function classifyMatch(cmb: ExamQuestion, candidate: TcmleQuestion):
  | { kind: 'none' }
  | { kind: 'conflict' }
  | { kind: 'accepted'; explanation: string } {
  if (!strictQuestionMatch(cmb, candidate)) return { kind: 'none' };
  if (cmb.answer !== candidate.answer) return { kind: 'conflict' };
  if (!candidate.reason.trim() || candidate.reason.includes('\uFFFD')) return { kind: 'none' };
  return { kind: 'accepted', explanation: candidate.reason.trim() };
}

function listJsonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = resolve(directory, entry.name);
      if (entry.isDirectory()) return listJsonFiles(fullPath);
      return entry.isFile() && entry.name.endsWith('.json') ? [fullPath] : [];
    })
    .sort();
}

function parseTcmleQuestion(value: unknown, sourceFile: string, sourceQuestionIndex: number): TcmleQuestion | undefined {
  if (!isRecord(value)
    || typeof value.query !== 'string'
    || typeof value.reason !== 'string'
    || !isAnswerKey(value.answer)
    || !Number.isSafeInteger(value.question_num)
    || (value.question_num as number) < 1
    || !isRecord(value.options)) return undefined;
  if (!value.reason.trim() || value.reason.includes('\uFFFD')) return undefined;
  const options = value.options;
  if (ANSWER_KEYS.some((key) => typeof options[key] !== 'string')) return undefined;
  return {
    query: value.query,
    options: Object.fromEntries(ANSWER_KEYS.map((key) => [key, options[key] as string])) as Record<AnswerKey, string>,
    answer: value.answer,
    reason: value.reason,
    sourceFile,
    sourceQuestionIndex: value.question_num as number,
  };
}

function readLicensedQuestions(tcmleDir: string): { files: string[]; questions: TcmleQuestion[] } {
  const licensedDirectory = resolve(tcmleDir, 'Licensed');
  const files = listJsonFiles(licensedDirectory).map((file) => relative(tcmleDir, file));
  const questions = files.flatMap((sourceFile) => {
    const parsed: unknown = JSON.parse(readFileSync(resolve(tcmleDir, sourceFile), 'utf8'));
    if (!Array.isArray(parsed)) throw new Error(`TCMLE source file must contain an array: ${sourceFile}`);
    return parsed.flatMap((value, index) => {
      const question = parseTcmleQuestion(value, sourceFile, index + 1);
      return question ? [question] : [];
    });
  });
  return { files, questions };
}

function tcmleCommit(tcmleDir: string): string {
  return execFileSync('git', ['-C', tcmleDir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
}

export function assertCleanTcmleCheckout(tcmleDir: string): void {
  let status: string;
  try {
    status = execFileSync('git', ['-C', tcmleDir, 'status', '--porcelain=v1', '--untracked-files=all'], { encoding: 'utf8' });
  } catch {
    throw new Error(`Unable to verify TCMLE checkout cleanliness: ${tcmleDir}`);
  }
  const entries = status.trimEnd().split('\n').filter(Boolean);
  const trackedChanges = entries.filter((entry) => !entry.startsWith('?? '));
  if (trackedChanges.length > 0) {
    throw new Error(`TCMLE checkout has tracked changes; import requires a clean checkout: ${trackedChanges.join(', ')}`);
  }
  const untrackedFiles = entries.filter((entry) => entry.startsWith('?? '));
  if (untrackedFiles.length > 0) {
    throw new Error(`TCMLE checkout has untracked files; import requires a clean checkout: ${untrackedFiles.join(', ')}`);
  }
}

export function buildExplanationArtifacts(cmb: ExamBank, candidates: readonly TcmleQuestion[], sourceCommit: string, subsetFiles: string[]): {
  bank: ExamExplanationBank;
  report: MatchReport;
} {
  const explanations: ExamExplanation[] = [];
  const strictMatchQuestionIds: string[] = [];
  const conflictQuestionIds: string[] = [];
  for (const question of cmb.questions) {
    const matches = candidates.filter((candidate) => strictQuestionMatch(question, candidate));
    if (matches.length === 0) continue;
    strictMatchQuestionIds.push(question.id);
    if (matches.some((candidate) => candidate.answer !== question.answer)) {
      conflictQuestionIds.push(question.id);
      continue;
    }
    const accepted = matches.map((candidate) => classifyMatch(question, candidate)).find((match) => match.kind === 'accepted');
    if (accepted?.kind !== 'accepted') continue;
    const candidate = matches.find((entry) => classifyMatch(question, entry).kind === 'accepted');
    if (!candidate) continue;
    explanations.push({
      questionId: question.id,
      answer: question.answer,
      text: accepted.explanation,
      provenance: {
        dataset: 'TCMLE',
        sourceFile: candidate.sourceFile,
        sourceQuestionIndex: candidate.sourceQuestionIndex,
        sourceCommit,
      },
    });
  }
  return {
    bank: { schemaVersion: 1, source: 'TCMLE', sourceCommit, explanations },
    report: {
      schemaVersion: 1,
      source: 'TCMLE',
      sourceCommit,
      subsetFiles,
      strictMatches: strictMatchQuestionIds.length,
      accepted: explanations.length,
      answerConflicts: conflictQuestionIds.length,
      strictMatchQuestionIds,
      conflictQuestionIds,
    },
  };
}

function cliDirectory(): string {
  const argumentIndex = process.argv.indexOf('--tcmle-dir');
  const directory = argumentIndex === -1 ? undefined : process.argv[argumentIndex + 1];
  if (!directory || argumentIndex + 2 !== process.argv.length) {
    throw new Error('Usage: node --experimental-strip-types scripts/import-tcmle-explanations.ts --tcmle-dir <absolute-directory>');
  }
  if (!isAbsolute(directory)) throw new Error('--tcmle-dir must be an absolute directory');
  return resolve(directory);
}

function runCli(tcmleDir: string): void {
  assertCleanTcmleCheckout(tcmleDir);
  const sourceCommit = tcmleCommit(tcmleDir);
  if (sourceCommit !== EXPECTED_TCMLE_COMMIT) {
    throw new Error(`TCMLE commit mismatch: expected ${EXPECTED_TCMLE_COMMIT}, received ${sourceCommit}`);
  }
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const cmb = parseExamBank(JSON.parse(readFileSync(resolve(root, 'public/data/cmb-tcm.json'), 'utf8')));
  const { files, questions } = readLicensedQuestions(tcmleDir);
  const { bank, report } = buildExplanationArtifacts(cmb, questions, sourceCommit, files);
  if (report.strictMatches !== 338 || report.accepted !== 336 || report.answerConflicts !== 2) {
    throw new Error(`Unexpected TCMLE match counts: ${JSON.stringify({ strictMatches: report.strictMatches, accepted: report.accepted, answerConflicts: report.answerConflicts })}`);
  }
  writeFileSync(resolve(root, 'public/data/cmb-tcmle-explanations.json'), `${JSON.stringify(bank, null, 2)}\n`);
  writeFileSync(resolve(root, 'public/data/cmb-tcmle-match-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ strictMatches: report.strictMatches, accepted: report.accepted, answerConflicts: report.answerConflicts }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runCli(cliDirectory());
}
