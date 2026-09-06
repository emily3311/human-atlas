import type { AnswerKey, ExamQuestion } from './exam-bank';

export const EXAM_PROGRESS_KEY = 'jingwei-cmb-progress-v1';

export type ExamProgress = Record<
  string,
  { answer: AnswerKey; correct: boolean; attempts: number }
>;

export type ExamSession = {
  ids: string[];
  index: number;
  selected: AnswerKey | null;
  submitted: boolean;
};

const answerKeys: AnswerKey[] = ['A', 'B', 'C', 'D', 'E'];

export function searchExamQuestions(questions: ExamQuestion[], query: string): ExamQuestion[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return questions;
  return questions.filter((item) =>
    [item.question, ...answerKeys.map((key) => item.options[key])]
      .join('\n')
      .toLocaleLowerCase()
      .includes(needle),
  );
}

export function shuffleQuestionIds(
  ids: readonly string[],
  random: () => number = Math.random,
): string[] {
  const shuffled = [...ids];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function parseExamProgress(raw: string | null, validIds: ReadonlySet<string>): ExamProgress {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
    const progress: ExamProgress = {};
    for (const [id, record] of Object.entries(value)) {
      if (id === '__proto__' || id === 'prototype' || id === 'constructor' || !validIds.has(id)) continue;
      if (typeof record !== 'object' || record === null || Array.isArray(record)) continue;
      const candidate = record as Record<string, unknown>;
      if (
        !answerKeys.includes(candidate.answer as AnswerKey) ||
        typeof candidate.correct !== 'boolean' ||
        !Number.isSafeInteger(candidate.attempts) ||
        (candidate.attempts as number) < 1
      ) continue;
      progress[id] = {
        answer: candidate.answer as AnswerKey,
        correct: candidate.correct,
        attempts: candidate.attempts as number,
      };
    }
    return progress;
  } catch {
    return {};
  }
}

export function recordExamAnswer(
  progress: ExamProgress,
  question: ExamQuestion,
  answer: AnswerKey,
): ExamProgress {
  return {
    ...progress,
    [question.id]: {
      answer,
      correct: answer === question.answer,
      attempts: (progress[question.id]?.attempts ?? 0) + 1,
    },
  };
}

export function createExamSession(ids: readonly string[]): ExamSession {
  return { ids: [...ids], index: 0, selected: null, submitted: false };
}

export function resetExamSession(_session: ExamSession, ids: readonly string[]): ExamSession {
  return createExamSession(ids);
}

export function selectExamAnswer(session: ExamSession, answer: AnswerKey): ExamSession {
  return session.submitted ? session : { ...session, selected: answer };
}

export function submitExamSelection(session: ExamSession): ExamSession {
  return session.selected === null ? session : { ...session, submitted: true };
}

export function moveExamSession(session: ExamSession, direction: -1 | 1): ExamSession {
  const index = session.index + direction;
  if (index < 0 || index >= session.ids.length) return session;
  return { ...session, index, selected: null, submitted: false };
}
