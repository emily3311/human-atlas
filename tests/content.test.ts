import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExamAbout } from '../app/tcm/exam-about.ts';
import { CURATED_ACUPOINTS as ACUPOINTS, CASES, MERIDIANS } from '../app/tcm/data.ts';

const REQUIRED = 'LU1 LU5 LU7 LU9 LI4 LI10 LI11 LI20 ST25 ST36 ST40 ST44 SP6 SP9 SP10 HT7 SI3 SI11 BL13 BL20 BL23 BL40 BL60 KI1 KI3 PC6 PC7 TE5 TE14 GB20 GB21 GB34 LR3 GV14 GV20 CV4 CV6 CV12 CV17'.split(' ');

test('exports the complete curated catalogue', () => {
  assert.equal(MERIDIANS.filter(m=>m.id!=='EX').length, 14);
  assert.equal(ACUPOINTS.length, 39);
  assert.equal(CASES.length, 3);
  assert.deepEqual(ACUPOINTS.map((p) => p.id).sort(), REQUIRED.sort());
});

test('identifiers are unique and point meridians exist', () => {
  assert.equal(new Set(MERIDIANS.map((m) => m.id)).size, MERIDIANS.length);
  assert.equal(new Set(ACUPOINTS.map((p) => p.id)).size, ACUPOINTS.length);
  const meridians = new Set(MERIDIANS.map((m) => m.id));
  for (const point of ACUPOINTS) assert.ok(meridians.has(point.meridian), `${point.id} meridian`);
});

test('every point is source-linked and structured for landmark learning', () => {
  for (const point of ACUPOINTS) {
    assert.equal(point.landmarks.length, 3, `${point.id} landmarks`);
    assert.ok(point.sources.length > 0, `${point.id} sources`);
    assert.ok(point.sources.every((s) => /^https:\/\//.test(s.url) && s.title), `${point.id} source quality`);
    assert.ok(point.anatomy.length > 0, `${point.id} anatomy keywords`);
    assert.equal(point.bilateral, !['GV', 'CV'].includes(point.meridian), `${point.id} laterality`);
  }
});

test('traditional summaries declare whether point-specific support was verified', () => {
  const verified = new Set(['LU5','LU9','LI4','ST36','SP9','BL13','BL20','BL23','KI1','PC6','GB34','LR3','GV20','CV4']);
  for (const point of ACUPOINTS) {
    assert.match(point.traditional, /传统常用于|传统功用/);
    assert.doesNotMatch(point.traditional, /相关传统主治须/);
    assert.ok(point.sources.some((s) => s.section?.includes(point.id)), `${point.id} point-specific section`);
    if (verified.has(point.id)) {
      assert.match(point.traditional, /机构资料已交叉核对/);
      assert.ok(point.sources.some((s) => /大学|医院/.test(s.title) && !/GB\/T|WHO/.test(s.title)), `${point.id} institution source`);
    } else assert.match(point.traditional, /待逐条来源核验/);
  }
});

test('reviewed national-standard details stay exact', () => {
  const byId = new Map(ACUPOINTS.map((p) => [p.id, p]));
  assert.match(byId.get('ST36')!.location, /犊鼻与解溪连线上/);
  assert.equal(byId.get('CV17')!.pinyin, 'Dànzhōng');
  assert.deepEqual(byId.get('CV12')!.landmarks, ['找到脐中央','找到剑突尖','在脐中与剑突尖连线中点取点']);
});

test('representative specific-point classifications are filterable', () => {
  const byId = new Map(ACUPOINTS.map((p) => [p.id, p]));
  for (const [id, tag] of [['LI4','原穴'],['LU7','络穴'],['ST36','下合穴'],['BL13','背俞穴'],['ST25','募穴'],['PC6','八脉交会穴'],['GB34','八会穴']]) {
    assert.ok(byId.get(id)?.tags.includes(tag), `${id} ${tag}`);
  }
});

test('classification evidence names supported tags and leaves every remainder pending', () => {
  for (const point of ACUPOINTS) {
    const classifications = point.tags.slice(2);
    const supported = new Set(point.classificationEvidence.flatMap((item) => item.tags));
    assert.ok(
      point.classificationEvidence.every((item) =>
        item.tags.length > 0 && item.tags.every((tag) => classifications.includes(tag)),
      ),
      `${point.id} evidence scope`,
    );
    assert.deepEqual(
      point.pendingClassificationTags,
      classifications.filter((tag) => !supported.has(tag)),
      `${point.id} pending classifications`,
    );
  }

  const byId = new Map(ACUPOINTS.map((point) => [point.id, point]));
  assert.deepEqual(byId.get('LU9')!.classificationEvidence.flatMap((item) => item.tags).sort(), ['八会穴', '原穴'].sort());
  assert.deepEqual(byId.get('LU9')!.pendingClassificationTags, ['输穴']);
  assert.deepEqual(byId.get('GB34')!.pendingClassificationTags, ['合穴']);
  assert.deepEqual(byId.get('LU5')!.pendingClassificationTags, ['合穴']);
});

test('anatomy keywords are concrete atlas structure names', () => {
  const vague = new Set(['skull','facial muscles','cervical muscles','thorax','abdominal wall','sternum','vertebral column','back muscles','upper limb','forearm muscles','hand bones','lower limb','leg muscles','foot bones']);
  const atlas = JSON.parse(readFileSync(new URL('../public/models/atlas.json', import.meta.url), 'utf8')) as { parts:{name:string}[] };
  const names = atlas.parts.map((part) => part.name.toLowerCase());
  for (const point of ACUPOINTS) {
    assert.ok(point.anatomy.every((name) => !vague.has(name)), `${point.id} anatomy specificity`);
    assert.ok(point.anatomy.every((keyword) => names.some((name) => name.includes(keyword))), `${point.id} anatomy atlas match`);
  }
});

test('cases only reference known points and carry sources', () => {
  const ids = new Set(ACUPOINTS.map((p) => p.id));
  for (const item of CASES) {
    assert.ok(item.answer >= 0 && item.answer < item.options.length, `${item.id} answer`);
    assert.ok(item.pointIds.length > 0 && item.pointIds.every((id) => ids.has(id)), `${item.id} pointIds`);
    assert.ok(item.sources.length > 0, `${item.id} sources`);
    assert.match(item.explanation, /原创|教学|未审阅/);
  }
});

test('about question bank centralizes verified explanation limits and project links', () => {
  const markup = renderToStaticMarkup(createElement(ExamAbout));

  assert.match(markup, /4086 题/);
  assert.match(markup, /336 条参考解析/);
  assert.match(markup, /2 道答案冲突已隔离/);
  assert.match(markup, /题干、A–E 选项全部一致且答案一致/);
  assert.match(markup, /未匹配题不生成 AI 解析/);
  assert.match(markup, /href="https:\/\/github\.com\/FreedomIntelligence\/CMB"/);
  assert.match(markup, /href="https:\/\/huggingface\.co\/datasets\/Bolin97\/TCMLE"/);
  assert.doesNotMatch(markup, /来源标签|来源答案|逐题复核/);
});
