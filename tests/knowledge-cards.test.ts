import assert from 'node:assert/strict';
import test from 'node:test';

import type { Part } from '../app/anatomy.ts';
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
