import type { Part } from '../anatomy.ts';
import { anatomyNameEvidence, anatomyZh, SYSTEM_ZH } from './anatomy-zh.ts';
import type { AnswerKey, ExamQuestion } from './exam-bank.ts';
import type { ExamExplanation } from './exam-explanations.ts';
import type { ExamProgress } from './exam-practice.ts';
import { questionAvailable } from './catalogue.ts';
import type { Acupoint, Meridian, PlacementDisplayMode, Source } from './types.ts';

export type KnowledgeDeck = 'point' | 'anatomy' | 'exam-wrong' | 'point-effects';

export type KnowledgeCard = {
  id: string;
  deck: KnowledgeDeck;
  title: string;
  front: { eyebrow: string; prompt: string; hint?: string };
  back: { answer: string; detail?: string; explanation?: string; caution?: string };
  sourceLinks: Source[];
  meta: Record<string, string>;
};

const card = (
  id: string,
  deck: KnowledgeDeck,
  title: string,
  front: KnowledgeCard['front'],
  back: KnowledgeCard['back'],
  sourceLinks: Source[],
  meta: Record<string, string>,
): KnowledgeCard => ({ id, deck, title, front, back, sourceLinks, meta });

const pointMeta = (point: Acupoint, type: string): Record<string, string> => ({
  pointId: point.id,
  pointName: point.name,
  meridianId: point.meridian,
  type,
});

const available = (point: Acupoint, type: 'location' | 'meridian' | 'tags' | 'identify', mode: PlacementDisplayMode): boolean => {
  try {
    return questionAvailable(point, type, mode);
  } catch {
    // Builders also accept isolated fixtures and future catalogue entries that
    // do not yet have a placement registry record.  Such entries cannot be a
    // 3D identify card, but their textual cards remain valid.
    return type !== 'identify' && questionAvailable(point, type, mode);
  }
};

/**
 * Read-only cards for the existing point-learning prompts.  This deliberately
 * delegates gates to the same policy used by StudyPanel so pending placements
 * never become identify cards in calibrated-only mode.
 */
export function buildPointCards(
  points: readonly Acupoint[],
  meridians: readonly Meridian[],
  placementDisplayMode: PlacementDisplayMode = 'calibrated-only',
): KnowledgeCard[] {
  const meridianById = new Map(meridians.map((meridian) => [meridian.id, meridian]));
  const cards: KnowledgeCard[] = [];
  for (const point of points) {
    const eyebrow = `${point.displayCode ?? point.id} · 穴位知识卡`;
    if (available(point, 'location', placementDisplayMode)) {
      cards.push(card(
        `point:${point.id}:location`, 'point', '穴位定位',
        { eyebrow, prompt: `${point.name}在哪里？`, hint: '先回忆体表定位，再翻面核对。' },
        { answer: point.location, detail: point.landmarks.join(' · ') || undefined, caution: point.caution },
        point.sources, pointMeta(point, 'location'),
      ));
    }
    const meridian = meridianById.get(point.meridian);
    if (meridian && available(point, 'meridian', placementDisplayMode)) {
      cards.push(card(
        `point:${point.id}:meridian`, 'point', '穴位归经',
        { eyebrow, prompt: `${point.name}属于哪条经脉？`, hint: '回忆完整经脉名称。' },
        { answer: meridian.name, detail: meridian.description, caution: point.caution },
        point.sources, pointMeta(point, 'meridian'),
      ));
    }
    if (available(point, 'tags', placementDisplayMode)) {
      const classifications = point.tags.slice(2);
      const evidence = point.classificationEvidence.flatMap((item) => item.source);
      cards.push(card(
        `point:${point.id}:tags`, 'point', '特定穴分类',
        { eyebrow, prompt: `${point.name}有哪些已核对的特定穴分类？`, hint: '只回忆有来源支撑的分类。' },
        { answer: classifications.join(' · '), caution: point.caution },
        evidence, pointMeta(point, 'tags'),
      ));
    }
    if (available(point, 'identify', placementDisplayMode)) {
      cards.push(card(
        `point:${point.id}:identify`, 'point', '三维认穴',
        { eyebrow: '三维认穴练习', prompt: '模型中标记的穴位叫什么？', hint: '观察标记位置，先在脑中作答。' },
        { answer: `${point.name} · ${point.id}`, detail: point.location, caution: point.caution },
        point.sources, pointMeta(point, 'identify'),
      ));
    }
  }
  return cards;
}

/** Traditional function cards are withheld unless their specific claim has explicit evidence. */
export function buildPointEffectCards(points: readonly Acupoint[]): KnowledgeCard[] {
  return points.flatMap((point) => point.traditionalEvidence.length > 0
    ? [card(
      `point:${point.id}:effects`, 'point-effects', '传统功用提要',
      { eyebrow: `${point.displayCode ?? point.id} · 传统功用`, prompt: `${point.name}的传统功用提要是什么？`, hint: '仅作传统理论学习，不推断现代临床疗效。' },
      { answer: point.traditional, caution: point.caution },
      point.traditionalEvidence, pointMeta(point, 'effects'),
    )]
    : []);
}

export function buildAnatomyCards(parts: readonly Part[]): KnowledgeCard[] {
  const cards: KnowledgeCard[] = [];
  for (const part of parts) {
    const evidence = anatomyNameEvidence(part.name);
    if (!evidence) continue;
    const chinese = anatomyZh(part.name);
    const meta = { meshId: part.id, system: part.system, english: part.name, chinese };
    const source = [{ title: '解剖学术语依据', url: evidence.source, section: evidence.sourceTerm }];
    cards.push(card(
      `anatomy:${part.id}:zh-to-en`, 'anatomy', '解剖名词·中译英',
      { eyebrow: `${SYSTEM_ZH[part.system]} · 网格 ${part.id}`, prompt: `“${chinese}”对应的英文解剖名是什么？`, hint: '保留图谱的原始英文命名。' },
      { answer: part.name, detail: evidence.note }, source, { ...meta, direction: 'zh-to-en' },
    ));
    cards.push(card(
      `anatomy:${part.id}:en-to-zh`, 'anatomy', '解剖名词·英译中',
      { eyebrow: `${SYSTEM_ZH[part.system]} · 网格 ${part.id}`, prompt: `“${part.name}”的中文解剖名是什么？`, hint: '中文名称须有逐项术语依据。' },
      { answer: chinese, detail: evidence.note }, source, { ...meta, direction: 'en-to-zh' },
    ));
  }
  return cards;
}

const answerKeys: readonly AnswerKey[] = ['A', 'B', 'C', 'D', 'E'];

function matchingExplanation(
  question: ExamQuestion,
  explanations: ReadonlyMap<string, ExamExplanation> | undefined,
): string | undefined {
  const explanation = explanations?.get(question.id);
  return explanation?.questionId === question.id && explanation.answer === question.answer
    ? explanation.text
    : undefined;
}

/**
 * Only a current, internally consistent wrong record becomes a card.  The
 * front intentionally contains neither the correct option text nor a reason.
 */
export function buildWrongExamCards(
  questions: readonly ExamQuestion[],
  progress: ExamProgress,
  explanations?: ReadonlyMap<string, ExamExplanation>,
): KnowledgeCard[] {
  const cards: KnowledgeCard[] = [];
  for (const question of questions) {
    const record = progress[question.id];
    if (
      !record
      || record.correct !== false
      || !answerKeys.includes(record.answer)
      || record.answer === question.answer
      || !Number.isSafeInteger(record.attempts)
      || record.attempts < 1
    ) continue;
    const explanation = matchingExplanation(question, explanations);
    cards.push(card(
      `exam:${question.id}`, 'exam-wrong', '错题回顾',
      { eyebrow: 'CMB 错题', prompt: question.question, hint: '先重新作答，再翻面核对。' },
      { answer: `${question.answer} · ${question.options[question.answer]}`, explanation },
      [], { questionId: question.id, selectedAnswer: record.answer, attempts: String(record.attempts) },
    ));
  }
  return cards;
}
