import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { AnswerKey, ExamBank, ExamQuestion } from '../app/tcm/exam-bank.ts';

const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E'];
const EXPECTED_ARCHIVE_SHA256 = 'c2e4288127fa5e6c03cc3659d893b0bbb19e699f74fdadce8e7fa10ac5bfdd94';
const ENTRY = 'CMB/CMB-Exam/CMB-train/CMB-train-merge.json';

type ImportReport = {
  sourceRecords: number;
  exactCategoryRecords: number;
  structurallyValidCandidates: number;
  retainedQuestions: number;
  duplicateRows: number;
  conflictGroups: number;
  conflictRows: number;
  reasonCounts: Record<string, number>;
  rejectedSourceIndices: Record<string, number[]>;
  duplicateSourceIndices: number[];
  conflictSourceIndices: number[][];
};

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

function normalizedKey(question: string, options: Record<AnswerKey, string>): string {
  return JSON.stringify([question, ...ANSWER_KEYS.map((key) => options[key])].map((part) => part.normalize('NFKC').replace(/\s/gu, '')));
}

function hasReplacementCharacter(value: unknown): boolean {
  try {
    return JSON.stringify(value).includes('\uFFFD');
  } catch {
    return false;
  }
}

function increment(report: ImportReport, reason: string, sourceIndex: number): void {
  report.reasonCounts[reason] = (report.reasonCounts[reason] ?? 0) + 1;
  (report.rejectedSourceIndices[reason] ??= []).push(sourceIndex);
}

export function selectCmbQuestions(records: unknown[]): {
  questions: ExamQuestion[];
  report: ImportReport;
} {
  const report: ImportReport = {
    sourceRecords: records.length,
    exactCategoryRecords: 0,
    structurallyValidCandidates: 0,
    retainedQuestions: 0,
    duplicateRows: 0,
    conflictGroups: 0,
    conflictRows: 0,
    reasonCounts: {},
    rejectedSourceIndices: {},
    duplicateSourceIndices: [],
    conflictSourceIndices: [],
  };
  const groups = new Map<string, ExamQuestion[]>();

  records.forEach((value, sourceIndex) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      increment(report, 'invalidRecord', sourceIndex);
      return;
    }
    const record = value as Record<string, unknown>;
    if (record.exam_type !== '医师考试' || record.exam_class !== '执业医师' || record.exam_subject !== '中医执业医师') {
      increment(report, 'wrongCategory', sourceIndex);
      return;
    }
    report.exactCategoryRecords += 1;
    if (record.question_type !== '单项选择题') {
      increment(report, 'wrongQuestionType', sourceIndex);
      return;
    }
    if (hasReplacementCharacter(record)) {
      increment(report, 'replacementCharacter', sourceIndex);
      return;
    }
    const option = record.option;
    if (typeof record.question !== 'string' || !record.question.trim() || typeof option !== 'object' || option === null || Array.isArray(option)) {
      increment(report, 'missingOrNonStringField', sourceIndex);
      return;
    }
    const rawOptions = option as Record<string, unknown>;
    if (typeof record.answer !== 'string' || !ANSWER_KEYS.includes(record.answer as AnswerKey)) {
      increment(report, 'invalidAnswer', sourceIndex);
      return;
    }
    const answer = record.answer as AnswerKey;
    if (typeof rawOptions[answer] !== 'string' || !(rawOptions[answer] as string).trim()) {
      increment(report, 'answerOptionMismatch', sourceIndex);
      return;
    }
    if (ANSWER_KEYS.some((key) => typeof rawOptions[key] !== 'string' || !(rawOptions[key] as string).trim())) {
      increment(report, 'missingOrNonStringField', sourceIndex);
      return;
    }
    const options = Object.fromEntries(ANSWER_KEYS.map((key) => [key, (rawOptions[key] as string).trim()])) as Record<AnswerKey, string>;
    const question = record.question.trim();
    const key = normalizedKey(question, options);
    const candidate: ExamQuestion = {
      id: sha256(`${key}\n${answer}`), sourceIndex, question, options, answer,
    };
    const group = groups.get(key);
    if (group) group.push(candidate);
    else groups.set(key, [candidate]);
    report.structurallyValidCandidates += 1;
  });

  const questions: ExamQuestion[] = [];
  for (const group of groups.values()) {
    const answers = new Set(group.map((question) => question.answer));
    if (answers.size > 1) {
      report.conflictGroups += 1;
      report.conflictRows += group.length;
      report.conflictSourceIndices.push(group.map((question) => question.sourceIndex));
      continue;
    }
    questions.push(group[0]!);
    if (group.length > 1) {
      report.duplicateRows += group.length - 1;
      report.duplicateSourceIndices.push(...group.slice(1).map((question) => question.sourceIndex));
    }
  }
  report.retainedQuestions = questions.length;
  return { questions, report };
}

function runCli(archivePath: string): void {
  const archive = readFileSync(archivePath);
  const sourceSha256 = sha256(archive);
  if (sourceSha256 !== EXPECTED_ARCHIVE_SHA256) {
    throw new Error(`CMB archive SHA-256 mismatch: expected ${EXPECTED_ARCHIVE_SHA256}, received ${sourceSha256}`);
  }
  const raw = execFileSync('unzip', ['-p', archivePath, ENTRY], { maxBuffer: 160_000_000, encoding: 'utf8' });
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('CMB training data root must be an array');
  const { questions, report } = selectCmbQuestions(parsed);
  const bank: ExamBank = { schemaVersion: 1, source: 'CMB', sourceSha256, questions };
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  mkdirSync(resolve(root, 'public/data'), { recursive: true });
  writeFileSync(resolve(root, 'public/data/cmb-tcm.json'), `${JSON.stringify(bank, null, 2)}\n`);
  writeFileSync(resolve(root, 'public/data/cmb-import-report.json'), `${JSON.stringify({ ...report, archiveSha256: sourceSha256, archiveEntry: ENTRY }, null, 2)}\n`);
  console.log(JSON.stringify({
    sourceRecords: report.sourceRecords,
    exactCategoryRecords: report.exactCategoryRecords,
    structurallyValidCandidates: report.structurallyValidCandidates,
    retainedQuestions: report.retainedQuestions,
    duplicateRows: report.duplicateRows,
    conflictGroups: report.conflictGroups,
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const archivePath = process.argv[2];
  if (!archivePath) throw new Error('Usage: node --experimental-strip-types scripts/import-cmb.ts <CMB.zip>');
  runCli(resolve(archivePath));
}
