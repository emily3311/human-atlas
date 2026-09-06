import type { ExamExplanation } from './exam-explanations.ts';
import { explanationIndex, parseExamExplanationBank } from './exam-explanations.ts';
import type { AnswerKey, ExamQuestion } from './exam-bank.ts';

export type ExplanationState = 'loading' | 'ready' | 'unavailable';

export type ExamFeedback =
  | { answer: AnswerKey; heading: '参考解析'; text: string }
  | { answer: AnswerKey; heading: '暂无解析' | '解析暂不可用' };

type ExplanationResponse = Pick<Response, 'ok' | 'json'>;
export type ExplanationFetcher = (url: string, init?: RequestInit) => Promise<ExplanationResponse>;

export type ExplanationLoadResult = {
  state: 'ready' | 'unavailable';
  explanations: ReadonlyMap<string, ExamExplanation>;
};

export function examFeedback(
  question: ExamQuestion,
  state: ExplanationState,
  explanation: ExamExplanation | undefined,
): ExamFeedback {
  if (state === 'ready' && explanation) {
    return { answer: question.answer, heading: '参考解析', text: explanation.text };
  }
  return { answer: question.answer, heading: state === 'unavailable' ? '解析暂不可用' : '暂无解析' };
}

export async function loadExamExplanations(
  fetcher: ExplanationFetcher,
  questions: readonly ExamQuestion[],
  signal?: AbortSignal,
): Promise<ExplanationLoadResult> {
  try {
    const response = await fetcher('/data/cmb-tcmle-explanations.json', { signal });
    if (!response.ok) throw new Error('解析加载失败');
    return {
      state: 'ready',
      explanations: explanationIndex(parseExamExplanationBank(await response.json(), questions)),
    };
  } catch {
    return { state: 'unavailable', explanations: new Map() };
  }
}
