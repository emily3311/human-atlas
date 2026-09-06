import type { AnswerKey, ExamQuestion } from './exam-bank.ts';

export type ExamExplanation = {
  questionId: string;
  answer: AnswerKey;
  text: string;
  provenance: {
    dataset: 'TCMLE';
    sourceFile: string;
    sourceQuestionIndex: number;
    sourceCommit: string;
  };
};

export type ExamExplanationBank = {
  schemaVersion: 1;
  source: 'TCMLE';
  sourceCommit: string;
  explanations: ExamExplanation[];
};

const ANSWER_KEYS: readonly AnswerKey[] = ['A', 'B', 'C', 'D', 'E'];
const SHA1 = /^[a-f0-9]{40}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function fail(detail: string): never {
  throw new Error(`Invalid exam explanations: ${detail}`);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function assertSafe(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(assertSafe);
    return;
  }
  if (!isPlainRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (UNSAFE_KEYS.has(key)) fail('unsafe prototype key');
    assertSafe(child);
  }
}

function isSourceFile(value: unknown): value is string {
  return typeof value === 'string'
    && /^Licensed\/(?:[A-Za-z0-9_]+\/)*[A-Za-z0-9_]+\.json$/.test(value)
    && !value.includes('..');
}

export function parseExamExplanationBank(value: unknown, validQuestions: readonly ExamQuestion[]): ExamExplanationBank {
  assertSafe(value);
  if (!isPlainRecord(value)) fail('payload must be an object');
  if (value.schemaVersion !== 1) fail('schemaVersion must be 1');
  if (value.source !== 'TCMLE') fail('source must be TCMLE');
  if (typeof value.sourceCommit !== 'string' || !SHA1.test(value.sourceCommit)) fail('sourceCommit must be a lowercase SHA-1 commit');
  if (!Array.isArray(value.explanations)) fail('explanations must be an array');

  const questionsById = new Map(validQuestions.map((question) => [question.id, question]));
  const ids = new Set<string>();
  for (const [index, explanation] of value.explanations.entries()) {
    if (!isPlainRecord(explanation)) fail(`explanation ${index} must be an object`);
    if (typeof explanation.questionId !== 'string' || !SHA256.test(explanation.questionId)) fail(`explanation ${index} question id must be a SHA-256 digest`);
    if (ids.has(explanation.questionId)) fail(`duplicate question id ${explanation.questionId}`);
    ids.add(explanation.questionId);
    const question = questionsById.get(explanation.questionId);
    if (!question) fail(`unknown question id ${explanation.questionId}`);
    if (!ANSWER_KEYS.includes(explanation.answer as AnswerKey)) fail(`explanation ${index} answer must be A-E`);
    if (explanation.answer !== question.answer) fail(`answer disagrees with CMB for question id ${explanation.questionId}`);
    if (typeof explanation.text !== 'string' || !explanation.text.trim() || explanation.text.includes('\uFFFD')) {
      fail(`explanation ${index} text must be non-empty and not contain replacement characters`);
    }
    if (!isPlainRecord(explanation.provenance)) fail(`explanation ${index} provenance must be an object`);
    const provenance = explanation.provenance;
    if (provenance.dataset !== 'TCMLE'
      || !isSourceFile(provenance.sourceFile)
      || !Number.isSafeInteger(provenance.sourceQuestionIndex)
      || (provenance.sourceQuestionIndex as number) < 1
      || provenance.sourceCommit !== value.sourceCommit
      || typeof provenance.sourceCommit !== 'string'
      || !SHA1.test(provenance.sourceCommit)) {
      fail(`explanation ${index} provenance is malformed`);
    }
  }
  return value as ExamExplanationBank;
}

export function explanationIndex(bank: ExamExplanationBank): ReadonlyMap<string, ExamExplanation> {
  return new Map(bank.explanations.map((explanation) => [explanation.questionId, explanation]));
}
