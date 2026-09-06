import { parseExamBank } from './exam-bank.ts';
import { explanationIndex, parseExamExplanationBank } from './exam-explanations.ts';
import { EXAM_PROGRESS_KEY, parseExamProgress } from './exam-practice.ts';
import { buildWrongExamCards, type KnowledgeCard } from './knowledge-cards.ts';

type FetchResource = (url: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>;
export type WrongCardResources = { cards: KnowledgeCard[]; warning: string; status: 'ready' | 'error'; validCardIds: string[] | null };
export async function loadWrongCardResources(fetcher: FetchResource, storage: Pick<Storage, 'getItem'>): Promise<WrongCardResources> {
  const [bankResult, explanationsResult] = await Promise.allSettled(
    ['/data/cmb-tcm.json', '/data/cmb-tcmle-explanations.json'].map(async url => {
      const response = await fetcher(url);
      if (!response.ok) throw Error('resource unavailable');
      return response.json();
    }),
  );
  let questions;
  try {
    if (bankResult.status === 'rejected') throw bankResult.reason;
    questions = parseExamBank(bankResult.value).questions;
  } catch { return { cards: [], warning: '执医错题题库暂时无法加载，请重新进入记忆卡重试。', status: 'error', validCardIds: null }; }
  const validCardIds = questions.map(question => `exam:${question.id}`);
  let explanations;
  let warning = '';
  try {
    if (explanationsResult.status === 'rejected') throw explanationsResult.reason;
    explanations = explanationIndex(parseExamExplanationBank(explanationsResult.value, questions));
  } catch { warning = '执医错题解析暂时无法加载；仍可核对 CMB 原始答案。'; }
  try {
    const progress = parseExamProgress(storage.getItem(EXAM_PROGRESS_KEY), new Set(questions.map(q => q.id)));
    return { cards: buildWrongExamCards(questions, progress, explanations), warning, status: 'ready', validCardIds };
  } catch { return { cards: [], warning: '执医错题的本机学习记录暂时无法读取。', status: 'error', validCardIds }; }
}
