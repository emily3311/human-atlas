export type AnswerKey = 'A' | 'B' | 'C' | 'D' | 'E';

export type ExamQuestion = {
  id: string;
  sourceIndex: number;
  question: string;
  options: Record<AnswerKey, string>;
  answer: AnswerKey;
};

export type ExamBank = {
  schemaVersion: 1;
  source: 'CMB';
  sourceSha256: string;
  questions: ExamQuestion[];
};

const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E'];

function fail(detail: string): never {
  throw new Error(`Invalid exam bank: ${detail}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseExamBank(value: unknown): ExamBank {
  if (!isRecord(value)) fail('payload must be an object');
  if (value.schemaVersion !== 1) fail('schemaVersion must be 1');
  if (value.source !== 'CMB') fail('source must be CMB');
  if (typeof value.sourceSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.sourceSha256)) {
    fail('sourceSha256 must be a lowercase SHA-256 digest');
  }
  if (!Array.isArray(value.questions)) fail('questions must be an array');

  const ids = new Set<string>();
  for (const [index, question] of value.questions.entries()) {
    if (!isRecord(question)) fail(`question ${index} must be an object`);
    if (typeof question.id !== 'string' || !/^[a-f0-9]{64}$/.test(question.id)) {
      fail(`question ${index} id must be a SHA-256 digest`);
    }
    if (ids.has(question.id)) fail(`duplicate question id ${question.id}`);
    ids.add(question.id);
    if (!Number.isSafeInteger(question.sourceIndex) || (question.sourceIndex as number) < 0) {
      fail(`question ${index} sourceIndex must be a non-negative integer`);
    }
    if (typeof question.question !== 'string' || question.question.length === 0) {
      fail(`question ${index} text must be non-empty`);
    }
    if (!ANSWER_KEYS.includes(question.answer as AnswerKey)) {
      fail(`question ${index} answer must be A-E`);
    }
    if (!isRecord(question.options)) fail(`question ${index} options must be an object`);
    for (const key of ANSWER_KEYS) {
      if (typeof question.options[key] !== 'string' || question.options[key].length === 0) {
        fail(`question ${index} option ${key} must be non-empty`);
      }
    }
  }
  return value as ExamBank;
}
