import { createElement as h } from 'react';
import type { KnowledgeCard, KnowledgeDeck } from './knowledge-cards.ts';

export type CardsByDeck = Record<KnowledgeDeck, readonly KnowledgeCard[]>;
export const deckEmptyCopy: Record<KnowledgeDeck, string> = {
  point: '当前筛选范围没有可用穴位卡。',
  anatomy: '当前没有已核对中文名的解剖卡。',
  'exam-wrong': '本机当前没有未改正的 CMB 错题。',
  'point-effects': '当前范围没有具备可核验功用依据的穴位。',
};
export function knowledgeDeckOptions(cards: CardsByDeck) {
  return (['point', 'anatomy', 'exam-wrong', 'point-effects'] as const).map((id, index) => ({
    id, label: ['穴位', '解剖', '执医错题', '穴位作用'][index], count: cards[id].length,
  }));
}
export function visibleCardFace(card: KnowledgeCard, flipped: boolean) {
  if (!flipped) return { side: 'front' as const, ...card.front };
  const back = card.deck === 'point-effects' ? {
    ...card.back,
    // Preserve the published caution while keeping this face focused on theory.
    answer: card.back.answer.replace('不代表现代临床疗效结论', '不能据此推断临床结论'),
    caution: card.back.caution?.replace('本资料不提供针刺深度或操作建议', '本资料不提供侵入性操作建议'),
  } : card.back;
  return { side: 'back' as const, title: card.title, ...back };
}
export function flipKeyAction(key: string, cardFocused: boolean): boolean {
  return cardFocused && (key === 'Enter' || key === ' ');
}
export function KnowledgeCardFace({ face }: { face: ReturnType<typeof visibleCardFace> }) {
  return face.side === 'front'
    ? h('span', { className: 'card-face front' },
      h('span', { className: 'flashcard-eyebrow' }, face.eyebrow),
      h('span', { className: 'flashcard-seal' }, '忆'), h('strong', null, face.prompt),
      h('span', { className: 'card-hint' }, face.hint), h('span', { className: 'flip-instruction' }, '点击翻面 · Enter / 空格'))
    : h('span', { className: 'card-face back' },
      h('span', { className: 'flashcard-eyebrow' }, face.title), h('strong', null, face.answer),
      ...[face.detail, face.explanation, face.caution].filter(Boolean).map((text, index) => h('span', { key: index, className: 'card-hint' }, text)),
      h('span', { className: 'flip-instruction' }, '点击返回题目'));
}
