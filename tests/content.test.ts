import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExamAbout } from '../app/tcm/exam-about.ts';
import { CURATED_ACUPOINTS as ACUPOINTS, CASES, MERIDIANS } from '../app/tcm/data.ts';
import * as calibration from '../app/tcm/calibration.ts';
import * as T from 'three';
import { buildPointEffectCards } from '../app/tcm/knowledge-cards.ts';
import { KnowledgeCardFace, visibleCardFace } from '../app/tcm/knowledge-card-ui.ts';

test('real effect-card backs retain teaching cautions without procedural or outcome language', () => {
  for (const card of buildPointEffectCards(ACUPOINTS)) {
    const markup = renderToStaticMarkup(createElement(KnowledgeCardFace, { face: visibleCardFace(card, true) }));
    assert.match(markup, /传统功用提要/);
    assert.match(markup, /请勿自行针刺/);
    assert.doesNotMatch(markup, /治疗保证|疗效|针刺深度|为你开方|个人处方/);
  }
});

test('card resource loader isolates failed banks and rereads progress without changing attempts', async () => {
  const ui = await import('../app/tcm/knowledge-card-resources.ts');
  assert.equal(typeof ui.loadWrongCardResources, 'function');
  const id = 'a'.repeat(64);
  const q = { id, sourceIndex: 0, question: '题干', options: { A: '甲', B: '乙', C: '丙', D: '丁', E: '戊' }, answer: 'A' };
  const bank = { schemaVersion: 1, source: 'CMB', sourceSha256: 'b'.repeat(64), questions: [q] };
  let raw = JSON.stringify({ [id]: { answer: 'B', correct: false, attempts: 3 } });
  const storage = { getItem: () => raw };
  const fetcher = async (url: string) => ({ ok: true, json: async () => url.includes('explanations') ? {} : bank });
  const first = await ui.loadWrongCardResources(fetcher, storage);
  assert.equal(first.cards.length, 1);
  assert.equal(first.status, 'ready');
  assert.deepEqual(first.validCardIds, [`exam:${id}`]);
  assert.match(first.warning, /解析/);
  assert.equal(first.cards[0].meta.attempts, '3');
  raw = JSON.stringify({ [id]: { answer: 'A', correct: true, attempts: 4 } });
  const corrected = await ui.loadWrongCardResources(fetcher, storage);
  assert.equal(corrected.cards.length, 0);
  assert.equal(corrected.status, 'ready');
  assert.deepEqual(corrected.validCardIds, [`exam:${id}`], 'corrected questions remain valid persistence IDs');
  assert.equal(JSON.parse(raw)[id].attempts, 4);
  const failed = await ui.loadWrongCardResources(async () => { throw Error('offline'); }, storage);
  assert.deepEqual(failed.cards, []);
  assert.equal(failed.status, 'error');
  assert.equal(failed.validCardIds, null);
  assert.match(failed.warning, /错题.*题库/);
});

test('surface picking returns model coordinates and a front-facing normal, without anatomy selection', async () => {
  const pick = await import('../app/tcm/calibration-pick.ts');
  assert.equal(typeof pick.dispatchSceneTap, 'function');
  const mesh = new T.Mesh(new T.PlaneGeometry(2, 2), new T.MeshBasicMaterial({ side: T.DoubleSide }));
  mesh.position.z = 1; mesh.updateMatrixWorld(true);
  const ray = new T.Raycaster(new T.Vector3(0, 0, 3), new T.Vector3(0, 0, -1));
  let anatomy = 0; let result;
  pick.dispatchSceneTap({ enabled: true, pointId: 'ST36', side: 'left' }, mesh, ray, 'fixture-v2', hit => { result = hit; }, () => { anatomy++; });
  assert.equal(anatomy, 0);
  assert.deepEqual(result, { pointId: 'ST36', side: 'left', position: [0, 0, 0], normal: [0, 0, 1], surfaceDistance: 0, modelVersion: 'fixture-v2' });
  pick.dispatchSceneTap({ enabled: true, pointId: 'ST36', side: 'left' }, undefined, ray, 'fixture-v2', () => assert.fail('missing surface'), () => { anatomy++; });
  assert.equal(anatomy, 0);
  pick.dispatchSceneTap(undefined, mesh, ray, 'fixture-v2', () => assert.fail('inactive pick'), () => { anatomy++; });
  assert.equal(anatomy, 1);
  mesh.geometry.dispose(); mesh.material.dispose();
});

test('calibration Escape exits picking before closing and failed storage preserves validated drafts', async () => {
  const ui = await import('../app/tcm/calibration-ui.ts');
  assert.equal(typeof ui.calibrationEscape, 'function');
  assert.deepEqual(ui.calibrationEscape({ open: true, enabled: true }), { open: true, enabled: false });
  assert.deepEqual(ui.calibrationEscape({ open: true, enabled: false }), { open: false, enabled: false });
  const store: calibration.CalibrationDraftStore = { version: 1, drafts: [] };
  const context = { knownPointIds: new Set(['ST36']), bilateralPointIds: new Set(['ST36']), atlasVersion: 'fixture' };
  const result = ui.persistCalibrationDrafts(store, context, { setItem() { throw new Error('quota'); } });
  assert.equal(result.store, store);
  assert.match(result.warning, /当前会话/);
});

test('review export requires evidence and reviewer in the shared domain validator', () => {
  const context = { knownPointIds: new Set(['ST36']), bilateralPointIds: new Set(['ST36']), atlasVersion: 'fixture' };
  const draft = { id: 'ST36-left', pointId: 'ST36', side: 'left', status: 'pending-review', position: [0, 0, 0], normal: [0, 0, 1], evidence: '', reviewer: '', modelVersion: 'fixture', updatedAt: '2026-09-06T00:00:00.000Z' };
  const store = calibration.parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
  assert.throws(() => calibration.exportCalibrationDraftPackage(store, context, { requireReviewDetails: true }), /evidence/);
  store.drafts[0].evidence = 'surface photograph';
  assert.throws(() => calibration.exportCalibrationDraftPackage(store, context, { requireReviewDetails: true }), /reviewer/);
  store.drafts[0].reviewer = 'Reviewer';
  assert.equal(JSON.parse(calibration.exportCalibrationDraftPackage(store, context, { requireReviewDetails: true })).drafts[0].status, 'pending-review');
});

test('metadata edits do not consume coordinate undo history', () => {
  const context = { knownPointIds: new Set(['ST36']), bilateralPointIds: new Set(['ST36']), atlasVersion: 'fixture' };
  let store = calibration.parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [{ id: 'ST36-left', pointId: 'ST36', side: 'left', status: 'pending-review', position: [0, 0, 0], normal: [0, 0, 1], evidence: '', reviewer: '', modelVersion: 'fixture', updatedAt: '2026-09-06T00:00:00.000Z' }] }), context);
  store = calibration.upsertCalibrationDraft(store, store.drafts[0], { position: [.001, 0, 0], normal: [0, 0, 1], surfaceDistance: .001 }, context);
  for (let i = 0; i < 12; i++) store = calibration.upsertCalibrationDraft(store, { ...store.drafts[0], evidence: `Evidence ${i}` }, { position: [.001, 0, 0], normal: [0, 0, 1], surfaceDistance: .001 }, context);
  assert.deepEqual(calibration.undoCalibrationDraft(store, 'ST36-left').drafts[0].position, [0, 0, 0]);
});

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
