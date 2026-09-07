import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as knowledgeReview from '../app/tcm/knowledge-review.ts';

import type { Part } from '../app/anatomy.ts';
import { ACUPOINTS, MERIDIANS } from '../app/tcm/data.ts';
import { placementRecord } from '../app/tcm/placement-quality.ts';
import type { Acupoint, Meridian, Source } from '../app/tcm/types.ts';
import {
  buildAnatomyCards,
  buildPointCards,
  buildPointEffectCards,
  buildWrongExamCards,
} from '../app/tcm/knowledge-cards.ts';

const source: Source = { title: '定位依据', url: 'https://example.test/location' };
const traditionalSource: Source = { title: '传统功用依据', url: 'https://example.test/effects' };
const meridians: Meridian[] = [
  { id: 'ST', name: '足阳明胃经', shortName: '胃经', color: '#eab308', description: 'fixture' },
  { id: 'EX', name: '经外奇穴', shortName: '经外奇穴', color: '#98755d', description: 'fixture' },
];

function point(overrides: Partial<Acupoint> = {}): Acupoint {
  return {
    id: 'ST36', name: '足三里', pinyin: 'Zúsānlǐ', meridian: 'ST', region: '下肢', bilateral: true,
    location: '犊鼻下3寸。', landmarks: ['找到犊鼻'], traditional: '传统功用（机构资料已核对）：健脾和胃。',
    caution: '仅作体表定位学习。', tags: ['胃经', '下肢', '下合穴'], anatomy: [], sources: [source],
    traditionalEvidence: [traditionalSource], classificationEvidence: [{ source, tags: ['下合穴'] }],
    pendingClassificationTags: [], catalogueKind: 'standard', annotationsReady: true,
    ...overrides,
  };
}

const anatomyParts = [
  { id: 'mesh-platysma', name: 'Left platysma', system: 'muscular' },
  { id: 'mesh-unknown', name: 'Invented posterior branch', system: 'arterial' },
] as Part[];

const question = {
  id: 'q-card', sourceIndex: 1, question: '哪项正确？',
  options: { A: '正确答案文本', B: '错误选项文本', C: '丙', D: '丁', E: '戊' }, answer: 'A' as const,
};

test('pending deck reviews survive another deck rating without entering current review state', () => {
  assert.equal(typeof knowledgeReview.mergeKnowledgeReviewForPersistence, 'function');
  const examId = `exam:${'a'.repeat(64)}`;
  const invalidExamId = `exam:${'b'.repeat(64)}`;
  const anatomyId = 'anatomy:mesh-platysma:zh-to-en';
  const review = { due: 0, interval: 2, repetitions: 7, lapses: 1, lastReviewed: 20, lastRating: 'good' as const };
  const raw = JSON.stringify({ version: 1, reviews: { [examId]: review, [invalidExamId]: { ...review, repetitions: -1 }, 'exam:garbage': review, 'point:unknown:effects': review } });
  const available = new Set([anatomyId]);
  const current = knowledgeReview.rateKnowledgeCard(knowledgeReview.parseKnowledgeReviewStore(raw, [...available]), anatomyId, 'good', available, 100);
  const merged = knowledgeReview.mergeKnowledgeReviewForPersistence(raw, current, available, new Set(['exam-wrong']));
  assert.deepEqual(Object.keys(merged.reviews).sort(), [anatomyId, examId]);
  assert.equal(merged.reviews[examId].repetitions, 7);
  assert.equal(current.reviews[examId], undefined);
  assert.equal(knowledgeReview.rateKnowledgeCard(current, examId, 'again', available), current);
  const hydrated = knowledgeReview.parseKnowledgeReviewStore(JSON.stringify(merged), [anatomyId, examId]);
  assert.equal(hydrated.reviews[examId].repetitions, 7);
  assert.equal(hydrated.reviews[anatomyId].repetitions, 1);
  const again = knowledgeReview.mergeKnowledgeReviewForPersistence(JSON.stringify(merged), current, available, new Set(['exam-wrong']));
  assert.equal(again.reviews[examId].repetitions, 7, 'failed resources remain unresolved');
  const completed = knowledgeReview.mergeKnowledgeReviewForPersistence(JSON.stringify(merged), current, available, new Set());
  assert.equal(completed.reviews[examId], undefined, 'resolved full ID list can reject a foreign ID');
});

test('persistence distinguishes full known IDs from filters and preserves only validated pending decks', () => {
  assert.equal(typeof knowledgeReview.mergeKnowledgeReviewForPersistence, 'function');
  const review = { due: 0, interval: 2, repetitions: 7, lapses: 1, lastReviewed: 20, lastRating: 'good' as const };
  const knownIds = new Set(['point:LU5:effects', 'point:ST36:effects']);
  const raw = JSON.stringify({ version: 1, reviews: { 'anatomy:mesh-platysma:zh-to-en': review, 'point:ST36:effects': review, 'point:unknown:effects': review, 'anatomy:bad:typo': review } });
  const rated = knowledgeReview.rateKnowledgeCard({ version: 1, reviews: {} }, 'point:LU5:effects', 'good', new Set(['point:LU5:effects']), 100);
  const result = knowledgeReview.mergeKnowledgeReviewForPersistence(raw, rated, knownIds, new Set(['anatomy']));
  assert.deepEqual(Object.keys(result.reviews).sort(), ['anatomy:mesh-platysma:zh-to-en', 'point:LU5:effects', 'point:ST36:effects']);
  assert.deepEqual(knowledgeReview.mergeKnowledgeReviewForPersistence(raw.replace('"version":1', '"version":2'), rated, knownIds, new Set(['anatomy'])), rated);
});

test('view model derives four real counts and renders only the selected face', async () => {
  const ui = await import('../app/tcm/knowledge-card-ui.ts');
  assert.equal(typeof ui.knowledgeDeckOptions, 'function', 'deck view model must exist');
  const card = { id: 'point:ST36:effects', deck: 'point-effects' as const, title: '传统功用提要', front: { eyebrow: '传统功用', prompt: '请回忆' }, back: { answer: '健脾和胃', caution: '仅作理论学习。' }, sourceLinks: [], meta: {} };
  assert.deepEqual(ui.knowledgeDeckOptions({ point: [card, card], anatomy: [], 'exam-wrong': [card], 'point-effects': [card] }).map(({ label, count }) => [label, count]), [['穴位', 2], ['解剖', 0], ['执医错题', 1], ['穴位作用', 1]]);
  assert.deepEqual(ui.visibleCardFace(card, false), { side: 'front', ...card.front });
  const front = renderToStaticMarkup(createElement(ui.KnowledgeCardFace, { face: ui.visibleCardFace(card, false) }));
  assert.doesNotMatch(front, /健脾和胃|仅作理论学习/);
  const back = renderToStaticMarkup(createElement(ui.KnowledgeCardFace, { face: ui.visibleCardFace(card, true) }));
  assert.match(back, /传统功用提要/);
  assert.match(back, /健脾和胃/);
  assert.match(back, /仅作理论学习/);
  assert.doesNotMatch(back, /治疗保证|疗效|针刺深度|处方|请回忆/);
});

test('flip keys act only while the card itself has focus', async () => {
  const ui = await import('../app/tcm/knowledge-card-ui.ts');
  assert.equal(typeof ui.flipKeyAction, 'function');
  for (const [key, focused, expected] of [['Enter', true, true], [' ', true, true], ['Enter', false, false], [' ', false, false], ['Escape', true, false], ['ArrowRight', true, false]] as const) assert.equal(ui.flipKeyAction(key, focused), expected);
});

test('point cards honor location, meridian, verified classification, and current placement gates', () => {
  const cards = buildPointCards([
    point(),
    point({ id: 'EX-1', meridian: 'EX', location: '', pendingClassificationTags: ['待核验'], classificationEvidence: [] }),
  ], meridians, 'calibrated-only');
  assert.deepEqual(cards.map((card) => card.id), ['point:ST36:location', 'point:ST36:meridian', 'point:ST36:tags']);
  assert.equal(cards[0].back.answer, '犊鼻下3寸。');
  assert.equal(cards[1].back.answer, '足阳明胃经');
  assert.equal(cards[2].back.answer, '下合穴');
});

test('include-pending adds exactly the 39 pending-derived identify cards', () => {
  const defaultCards = buildPointCards(ACUPOINTS, MERIDIANS);
  const cards = buildPointCards(ACUPOINTS, MERIDIANS, 'include-pending');
  const identifyCards = cards.filter((card) => card.meta.type === 'identify');
  const expectedPointIds = [
    'LU1', 'LU5', 'LU7', 'LU9', 'LI4', 'LI10', 'LI11', 'LI20', 'ST25', 'ST36', 'ST40', 'ST44',
    'SP6', 'SP9', 'SP10', 'HT7', 'SI3', 'SI11', 'BL13', 'BL20', 'BL23', 'BL40', 'BL60',
    'KI1', 'KI3', 'PC6', 'PC7', 'TE5', 'TE14', 'GB20', 'GB21', 'GB34', 'LR3', 'GV14', 'GV20',
    'CV4', 'CV6', 'CV12', 'CV17',
  ];
  assert.equal(defaultCards.filter((card) => card.meta.type === 'identify').length, 0);
  assert.equal(identifyCards.length, 39);
  assert.deepEqual(identifyCards.map((card) => card.id).sort(), expectedPointIds.map((id) => `point:${id}:identify`).sort());
  assert.ok(identifyCards.every((card) => placementRecord(card.meta.pointId).status === 'pending-review'));
  assert.deepEqual(cards.filter((card) => card.meta.type !== 'identify'), defaultCards);
  assert.equal(identifyCards.find((card) => card.id === 'point:ST36:identify')?.back.answer, '足三里 · ST36');
});

test('effect cards require explicit traditional evidence rather than descriptive wording', () => {
  const cards = buildPointEffectCards([
    point(),
    point({ id: 'LU1', name: '中府', traditionalEvidence: [], traditional: '传统功用（机构资料已核对）：也有功用文字。' }),
  ]);
  assert.deepEqual(cards.map((card) => card.id), ['point:ST36:effects']);
  assert.equal(cards[0].title, '传统功用提要');
  assert.equal(cards[0].back.caution, '仅作体表定位学习。');
  assert.deepEqual(cards[0].sourceLinks, [traditionalSource]);
});

test('anatomy cards only use verified Chinese names and retain mesh identity', () => {
  const cards = buildAnatomyCards(anatomyParts);
  assert.deepEqual(cards.map((card) => card.id), ['anatomy:mesh-platysma:zh-to-en', 'anatomy:mesh-platysma:en-to-zh']);
  assert.equal(cards[0].back.answer, 'Left platysma');
  assert.equal(cards[1].back.answer, '左颈阔肌');
  assert.equal(cards[0].meta.meshId, 'mesh-platysma');
  assert.equal(cards[0].meta.system, 'muscular');
});

test('wrong cards require a genuinely wrong latest answer and disappear after correction', () => {
  const explanations = new Map([['q-card', {
    questionId: 'q-card', answer: 'A' as const, text: '独立解析文本',
    provenance: { dataset: 'TCMLE' as const, sourceFile: 'Licensed/Test.json', sourceQuestionIndex: 1, sourceCommit: 'a'.repeat(40) },
  }]]);
  assert.equal(buildWrongExamCards([question], { 'q-card': { answer: 'B', correct: false, attempts: 1 } }, explanations).length, 1);
  assert.equal(buildWrongExamCards([question], { 'q-card': { answer: 'A', correct: false, attempts: 1 } }, explanations).length, 0);
  assert.equal(buildWrongExamCards([question], { 'q-card': { answer: 'A', correct: true, attempts: 2 } }, explanations).length, 0);
  assert.equal(buildWrongExamCards([question], { 'q-card': { answer: 'B', correct: false, attempts: 0 } }, explanations).length, 0);
});

test('wrong-card front payload never includes the correct answer or explanation', () => {
  const explanation = '独立解析文本';
  const cards = buildWrongExamCards([question], { 'q-card': { answer: 'B', correct: false, attempts: 1 } }, new Map([['q-card', {
    questionId: 'q-card', answer: 'A' as const, text: explanation,
    provenance: { dataset: 'TCMLE' as const, sourceFile: 'Licensed/Test.json', sourceQuestionIndex: 1, sourceCommit: 'a'.repeat(40) },
  }]]));
  assert.equal(JSON.stringify(cards[0].front).includes('正确答案文本'), false);
  assert.equal(JSON.stringify(cards[0].front).includes(explanation), false);
  assert.equal(cards[0].back.answer, 'A · 正确答案文本');
  assert.equal(cards[0].back.explanation, explanation);
});
