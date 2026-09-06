import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createExplosionLayout} from '../app/explosion-layout.ts';
import {PointerTap} from '../app/pointer-tap.ts';
import {atlasTools} from '../app/agent-tools.ts';
import { ACUPOINTS, MERIDIANS } from '../app/tcm/data.ts';
import { buildPointCards, buildAnatomyCards, buildPointEffectCards } from '../app/tcm/knowledge-cards.ts';
import { placementDisplayControl, markerPresentation, placementRecord, placementCounts } from '../app/tcm/placement-quality.ts';
import { calibrationEscape, persistCalibrationDrafts } from '../app/tcm/calibration-ui.ts';
import { parseCalibrationDrafts, upsertCalibrationDraft, undoCalibrationDraft, exportCalibrationDraftPackage } from '../app/tcm/calibration.ts';
import { startValidationServer, launchValidationBrowser, isolateStorage } from './validate-server.mjs';

for (const file of ['atlas.json']) {
  const atlas=JSON.parse(await readFile(new URL(`../public/models/${file}`,import.meta.url)));
  const groups=[atlas.parts,...[...new Set(atlas.parts.map(p=>p.system))].map(system=>atlas.parts.filter(p=>p.system===system))];
  for(const group of groups) for(const aspect of [.46,1,1.7]) {
    const layout=createExplosionLayout(group,aspect),cells=[...layout.cells.values()];
    assert.equal(cells.length,group.length);
    for(let i=0;i<cells.length;i++) {
      const a=cells[i];
      assert.ok(Math.abs(a.x)+a.width/2<=layout.width/2+1e-8);
      assert.ok(Math.abs(a.y)+a.height/2<=layout.height/2+1e-8);
      for(let j=i+1;j<cells.length;j++) {
        const b=cells[j];
        assert.ok(Math.abs(a.x-b.x)>=(a.width+b.width)/2-1e-8 || Math.abs(a.y-b.y)>=(a.height+b.height)/2-1e-8,'Exploded pieces overlap');
      }
    }
  }
  let selected=null;
  const [find,inspect]=atlasTools(atlas,c=>{selected=c;});
  const results=find.execute({query:'femur'});
  assert.ok(results.length>0);
  inspect.execute({id:results[0].id});
  const previous=selected;
  assert.throws(()=>inspect.execute({id:'nonexistent-structure'}));
  assert.equal(selected,previous);
  assert.throws(()=>find.execute({query:' '}));
  console.log(`${file}: packing at desktop/mobile aspect ratios and search/inspection contracts passed.`);
}
const tap=new PointerTap();
tap.down(1,10,10,5);assert.equal(tap.up(1,12,11),true);
tap.down(1,10,10,5);tap.move(1,40,10);assert.equal(tap.up(1,10,10),false);
tap.down(1,10,10,12);tap.down(2,20,20,12);assert.equal(tap.up(2,20,20),false);assert.equal(tap.up(1,10,10),false);
tap.down(1,10,10,5);tap.cancel(1);assert.equal(tap.up(1,10,10),false);
tap.down(1,10,10,5);assert.equal(tap.up(1,10,10),true);
assert.equal(createExplosionLayout([]).cells.size,0);
console.log('Tap, drag, multitouch, cancellation, and empty-view checks passed.');

const pointIds = ACUPOINTS.map(p => p.id);
const formalBefore = JSON.stringify(pointIds.map(placementRecord));
assert.deepEqual(placementDisplayControl(pointIds).pointIds, []);
const optedIn = placementDisplayControl(pointIds, 'include-pending');
assert.equal(optedIn.pointIds.length, 39);
assert.ok(optedIn.pointIds.includes('ST36'));
for (const id of optedIn.pointIds) {
  assert.equal(markerPresentation(placementRecord(id), id).className, 'acu-marker--pending');
  assert.match(markerPresentation(placementRecord(id), id).label, /待专业校准·教学示意/);
}
let panel = { open: true, enabled: true };
panel = calibrationEscape(panel); assert.deepEqual(panel, { open: true, enabled: false });
panel = calibrationEscape(panel); assert.deepEqual(panel, { open: false, enabled: false });
const atlas = JSON.parse(await readFile(new URL('../public/models/atlas.json', import.meta.url)));
const context = { knownPointIds: new Set(pointIds), bilateralPointIds: new Set(ACUPOINTS.filter(p => p.bilateral).map(p => p.id)), atlasVersion: atlas.version };
const candidate = { id: 'ST36-left', pointId: 'ST36', side: 'left', status: 'pending-review', position: [0, 1, 0], normal: [0, 0, 1], evidence: 'Validator surface fixture', reviewer: 'Validator', modelVersion: atlas.version, updatedAt: '2026-09-06T00:00:00.000Z' };
let drafts = upsertCalibrationDraft(parseCalibrationDrafts(null, context), candidate, { position: [0, 1, 0], normal: [0, 0, 1], surfaceDistance: 0 }, context);
drafts = upsertCalibrationDraft(drafts, candidate, { position: [.001, 1, 0], normal: [0, 0, 1], surfaceDistance: .001 }, context);
drafts = undoCalibrationDraft(drafts, candidate.id);
assert.deepEqual(drafts.drafts[0].position, [0, 1, 0]);
assert.equal(persistCalibrationDrafts(drafts, context, { setItem() { throw Error('quota'); } }).store, drafts);
const blob = new Blob([exportCalibrationDraftPackage(drafts, context, { requireReviewDetails: true })], { type: 'application/json' });
assert.equal(JSON.parse(await blob.text()).drafts[0].status, 'pending-review');
assert.equal(JSON.stringify(pointIds.map(placementRecord)), formalBefore);
assert.deepEqual(placementCounts(pointIds), { unregistered: 344, 'pending-review': 39, calibrated: 0 });
console.log('Deterministic production contracts: default 0 / opt-in 39 point IDs, pending labels, Escape lifecycle, persisted/undoable draft Blob export, and immutable formal data passed.');

// Browser checks are a required release gate. Every page has a fresh temporary context.
const server = process.env.INTERACTION_BROWSER_URL ? null : await startValidationServer();
const origin = process.env.INTERACTION_BROWSER_URL || server.origin;
let browser;
try {
  browser = await launchValidationBrowser();
  try {
    const hydrationFailures = [];
    for (const scenario of ['delayed', 'offline']) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const questionId = 'a'.repeat(64);
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      try {
        await page.addInitScript(({ questionId }) => {
          const memory = new Map([
            ['jingwei-cmb-progress-v1', JSON.stringify({ [questionId]: { answer: 'B', correct: false, attempts: 3 } })],
            ['jingwei-knowledge-cards:v1', JSON.stringify({ version: 1, reviews: { [`exam:${questionId}`]: { due: 0, interval: 2, repetitions: 7, lapses: 1, lastReviewed: 20, lastRating: 'good' } } })],
          ]);
          Storage.prototype.getItem = key => memory.get(key) ?? null;
          Storage.prototype.setItem = (key, value) => { memory.set(key, String(value)); };
          Storage.prototype.removeItem = key => { memory.delete(key); };
        }, { questionId });
        await page.route('**/data/cmb-tcm.json', async route => {
          if (scenario === 'offline') return route.fulfill({ status: 503, body: 'offline' });
          await gate;
          await route.fulfill({ json: { schemaVersion: 1, source: 'CMB', sourceSha256: 'b'.repeat(64), questions: [{ id: questionId, sourceIndex: 0, question: '延迟加载题干', options: { A: '正确', B: '错误', C: '丙', D: '丁', E: '戊' }, answer: 'A' }] } });
        });
        await page.route('**/data/cmb-tcmle-explanations.json', route => route.fulfill({ json: { schemaVersion: 1, source: 'TCMLE', sourceCommit: 'c'.repeat(40), explanations: [] } }));
        await page.goto(origin);
        await page.getByRole('button', { name: '记忆卡片', exact: true }).click();
        const decks = page.getByRole('group', { name: '知识卡组' });
        if (scenario === 'offline') {
          await decks.getByRole('button', { name: '执医错题 0', exact: true }).click();
          await page.getByText('执医错题题库暂时无法加载，请重新进入记忆卡重试。', { exact: true }).waitFor();
          assert.equal(await page.getByText('本机当前没有未改正的 CMB 错题。', { exact: true }).count(), 0, 'offline is not a successful empty deck');
        }
        await decks.getByRole('button', { name: /^解剖 [1-9]\d*$/ }).click();
        await page.locator('.flip-card').click();
        await page.getByRole('button', { name: /记住了/ }).click();
        assert.equal(await page.evaluate(questionId => JSON.parse(localStorage.getItem('jingwei-knowledge-cards:v1')).reviews[`exam:${questionId}`]?.repetitions, questionId), 7, `${scenario}: anatomy rating preserves unhydrated exam review`);
        if (scenario === 'delayed') {
          await decks.getByRole('button', { name: '执医错题 0', exact: true }).click();
          await page.getByText('正在读取本机错题…', { exact: true }).waitFor();
          assert.equal(await page.getByText('本机当前没有未改正的 CMB 错题。', { exact: true }).count(), 0, 'loading is not a successful empty deck');
          release();
          await page.getByText('已练习 7 次', { exact: true }).waitFor();
          assert.equal(await page.evaluate(() => Object.entries(JSON.parse(localStorage.getItem('jingwei-knowledge-cards:v1')).reviews).filter(([id, review]) => id.startsWith('anatomy:') && review.repetitions === 1).length), 1, 'hydration retains the new anatomy rating');
          await decks.getByRole('button', { name: /^解剖 [1-9]\d*$/ }).click();
          await page.getByText('已练习 1 次', { exact: true }).waitFor();
        }
      } catch (error) { hydrationFailures.push(`${scenario}: ${error.message}`); }
      finally { release(); await page.unrouteAll({ behavior: 'ignoreErrors' }); await page.close(); }
    }
    assert.deepEqual(hydrationFailures, [], 'partial hydration and empty-state regression');
    console.log('Cards hydration: delayed and failed CMB preserve exam repetitions=7; loading/error never claim an empty deck.');
    for (const [width, height] of [[1440, 900], [390, 844], [320, 568]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const questionId = 'a'.repeat(64);
      // Each page owns a temporary context. Progress exists only in this in-memory fixture.
      await page.addInitScript(({ questionId }) => {
        const memory = new Map([['jingwei-cmb-progress-v1', JSON.stringify({ [questionId]: { answer: 'B', correct: false, attempts: 3 } })]]);
        Storage.prototype.getItem = key => memory.get(key) ?? null;
        Storage.prototype.setItem = (key, value) => { memory.set(key, String(value)); };
        Storage.prototype.removeItem = key => { memory.delete(key); };
      }, { questionId });
      await page.route('**/data/cmb-tcm.json', route => route.fulfill({ json: { schemaVersion: 1, source: 'CMB', sourceSha256: 'b'.repeat(64), questions: [{ id: questionId, sourceIndex: 0, question: '卡片隔离测试题干', options: { A: '正确答案唯一文本', B: '错误选项', C: '丙', D: '丁', E: '戊' }, answer: 'A' }] } }));
      await page.route('**/data/cmb-tcmle-explanations.json', route => route.fulfill({ json: { schemaVersion: 1, source: 'TCMLE', sourceCommit: 'c'.repeat(40), explanations: [{ questionId, answer: 'A', text: '独立解析唯一文本。'.repeat(70), provenance: { dataset: 'TCMLE', sourceFile: 'Licensed/Test.json', sourceQuestionIndex: 1, sourceCommit: 'c'.repeat(40) } }] } }));
      await page.goto(origin);
      await page.getByRole('button', { name: '记忆卡片', exact: true }).click();
      const decks = page.getByRole('group', { name: '知识卡组' });
      await decks.waitFor({ timeout: 5000 });
      const expectedCounts = [buildPointCards(ACUPOINTS.filter(p => p.location), MERIDIANS).length, buildAnatomyCards(atlas.parts).length, 1, buildPointEffectCards(ACUPOINTS.filter(p => p.location)).length];
      await page.waitForFunction(counts => JSON.stringify([...document.querySelectorAll('.knowledge-decks button span')].map(el => Number(el.textContent))) === JSON.stringify(counts), expectedCounts);
      const card = page.locator('.flip-card');
      for (const label of ['穴位', '解剖', '执医错题', '穴位作用']) {
        await decks.getByRole('button', { name: new RegExp(`^${label} \\d+$`) }).click();
        await card.waitFor();
        assert.equal(await card.locator('.back').count(), 0);
        const front = await card.textContent();
        await page.locator('#learning-content').focus();
        await page.keyboard.press('Space');
        await page.keyboard.press('Enter');
        assert.equal(await card.getAttribute('aria-pressed'), 'false', 'keyboard outside card must not flip');
        if (label === '执医错题') assert.doesNotMatch(await page.locator('#learning-content').textContent(), /正确答案唯一文本|独立解析唯一文本/);
        await card.click();
        assert.equal(await card.getAttribute('aria-pressed'), 'true');
        assert.equal(await card.locator('.front').count(), 0);
        assert.ok(await card.evaluate(el => el.getBoundingClientRect().bottom >= el.querySelector('.card-face').getBoundingClientRect().bottom), 'long back stays within the flip target');
        if (label === '执医错题') assert.match(await card.textContent(), /正确答案唯一文本.*独立解析唯一文本/);
        if (label === '穴位作用') {
          assert.match(await card.textContent(), /传统功用提要.*请勿自行针刺/);
          assert.doesNotMatch(await card.textContent(), /治疗保证|疗效|针刺深度|个人处方/);
        }
        assert.ok((await page.locator('.rating-buttons button').evaluateAll(els => els.map(el => el.getBoundingClientRect().height))).every(value => value >= 44));
        if (width <= 680) assert.ok((await page.locator('.knowledge-cards-panel a').evaluateAll(els => els.map(el => el.getBoundingClientRect().height))).every(value => value >= 44), 'mobile source links have 44px tap targets');
        await card.press('Enter');
        assert.equal(await card.textContent(), front);
        await card.press('Space');
        assert.equal(await card.getAttribute('aria-pressed'), 'true');
        const next = page.getByRole('button', { name: '下一张', exact: true });
        await next.focus();
        await page.keyboard.press('Enter');
        assert.equal(await card.getAttribute('aria-pressed'), 'false');
        await card.click();
        await page.getByRole('button', { name: /记住了/ }).click();
        assert.equal(await card.getAttribute('aria-pressed'), 'false');
        if (label === '解剖' || label === '穴位作用') assert.equal(await card.textContent(), front, 'rating chooses first currently due card');
        if (label === '穴位') assert.match(await card.textContent(), /中府在哪里/, 'legacy rating chooses first currently due point');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px ${label} must not overflow`);
        assert.ok((await card.boundingBox()).height >= 280);
        assert.ok((await decks.getByRole('button').evaluateAll(els => els.map(el => el.getBoundingClientRect().height))).every(value => value >= 44));
      }
      assert.ok(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('jingwei-knowledge-cards:v1')).reviews).some(id => id.startsWith('exam:'))));
      assert.ok(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('human-atlas-tcm:v1')).reviews).length > 0), 'point ratings use the legacy store');
      assert.equal(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('jingwei-knowledge-cards:v1')).reviews).some(id => /^point:.*:(location|meridian|tags|identify)$/.test(id))), false);
      await page.getByRole('button', { name: '经穴图谱', exact: true }).click();
      await page.evaluate(questionId => localStorage.setItem('jingwei-cmb-progress-v1', JSON.stringify({ [questionId]: { answer: 'A', correct: true, attempts: 4 } })), questionId);
      await page.getByRole('button', { name: '记忆卡片', exact: true }).click();
      await decks.getByRole('button', { name: '执医错题 0', exact: true }).click();
      await page.getByText('本机当前没有未改正的 CMB 错题。', { exact: true }).waitFor();
      assert.equal(await page.evaluate(questionId => JSON.parse(localStorage.getItem('jingwei-cmb-progress-v1'))[questionId].attempts, questionId), 4);
      await page.getByRole('button', { name: '经穴图谱', exact: true }).click();
      await page.route('**/data/cmb-tcm.json', route => route.fulfill({ status: 503, body: 'offline' }));
      await page.getByRole('button', { name: '记忆卡片', exact: true }).click();
      await page.getByText('执医错题题库暂时无法加载，请重新进入记忆卡重试。', { exact: true }).waitFor();
      assert.equal(await page.getByText('本机当前没有未改正的 CMB 错题。', { exact: true }).count(), 0);
      for (const label of ['穴位', '解剖', '穴位作用']) {
        await decks.getByRole('button', { name: new RegExp(`^${label} \\d+$`) }).click();
        assert.equal(await card.isVisible(), true, `${label} survives CMB failure`);
      }
      await page.getByRole('button', { name: '经穴图谱', exact: true }).click();
      if (width <= 680) await page.getByRole('button', { name: '目录', exact: true }).click();
      await page.getByRole('button', { name: '筛选条件', exact: true }).click();
      await page.getByLabel('学习范围', { exact: true }).selectOption('model');
      await page.getByRole('button', { name: '记忆卡片', exact: true }).click();
      await decks.getByRole('button', { name: '穴位 0', exact: true }).click();
      await page.getByText('当前筛选范围没有可用穴位卡。', { exact: true }).waitFor();
      await decks.getByRole('button', { name: /^解剖 \d+$/ }).click();
      assert.equal(await card.isVisible(), true, 'empty point filter must not block anatomy deck');
      await page.close();
      console.log(`Cards browser ${width}×${height}: four decks, DOM isolation, pointer/keyboard, ratings, correction refresh and layout passed.`);
    }
    for (const [width, height] of [[1440, 900], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, acceptDownloads: true });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await isolateStorage(page);
      await page.goto(origin);
      await page.getByRole('button', { name: '坐标校准工具', exact: true }).waitFor();
      await page.locator('.model-loading').waitFor({ state: 'hidden', timeout: 90000 });
      assert.equal(await page.locator('.acu-marker:not([hidden])').count(), 0);
      await page.getByText('已校准 0 · 待专业校准 39 · 未登记 344', { exact: true }).waitFor();
      await page.getByLabel('显示教学示意（39）', { exact: true }).check();
      await page.waitForFunction(() => document.querySelectorAll('.acu-marker--pending:not([hidden])').length > 0);
      assert.equal(await page.locator('.acu-marker--calibrated').count(), 0);
      assert.equal(await page.locator('.acu-marker--pending').evaluateAll(elements => new Set(elements.map(el => el.dataset.point)).size), 39, '39 seed IDs, with bilateral markers and visibility determined by camera');
      assert.ok(await page.locator('.acu-marker--pending > i').evaluateAll(elements => elements.every(el => { const style = getComputedStyle(el); return style.borderTopStyle === 'dashed' && style.backgroundColor === 'rgba(0, 0, 0, 0)'; })), 'pending markers use hollow dashed dots');
      for (const label of await page.locator('.acu-marker--pending').evaluateAll(elements => elements.map(el => el.getAttribute('aria-label')))) assert.match(label, /待专业校准·教学示意/);
      await page.getByLabel('显示教学示意（39）', { exact: true }).uncheck();
      await page.getByRole('button', { name: '坐标校准工具', exact: true }).click();
      const panel = page.getByRole('complementary', { name: '三维坐标校准草稿' });
      await panel.waitFor();
      assert.equal(await page.locator('.unmapped-caption:visible').count(), 0, 'calibration must not cover the surface with a text card');
      assert.equal(await panel.getByLabel('校准穴位').locator('option').count(), 383);
      await panel.getByLabel('校准穴位').selectOption('CV17');
      assert.deepEqual(await panel.getByLabel('校准侧别').locator('option').allTextContents(), ['正中']);
      await panel.getByLabel('校准穴位').selectOption('ST36');
      assert.deepEqual(await panel.getByLabel('校准侧别').locator('option').allTextContents(), ['左侧', '右侧']);
      await panel.getByRole('button', { name: '开始表面拾取', exact: true }).click();
      await page.keyboard.press('Escape');
      assert.equal(await panel.isVisible(), true);
      await panel.getByRole('button', { name: '开始表面拾取', exact: true }).click();
      const canvas = page.locator('.atlas-canvas canvas');
      await canvas.scrollIntoViewIfNeeded();
      const bounds = await canvas.boundingBox();
      await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await panel.getByLabel('定位依据', { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('jingwei-calibration-drafts:v1')).drafts[0].status), 'pending-review');
      const initialVectors = await panel.locator('.calibration-vector').textContent();
      const initialNormal = await page.evaluate(() => JSON.parse(localStorage.getItem('jingwei-calibration-drafts:v1')).drafts[0].normal);
      await panel.getByRole('button', { name: '开始表面拾取', exact: true }).click();
      await canvas.scrollIntoViewIfNeeded();
      const repickBounds = await canvas.boundingBox();
      await page.mouse.click(repickBounds.x + repickBounds.width / 2, repickBounds.y + repickBounds.height * .4);
      await page.waitForFunction(previous => {
        const next = JSON.parse(localStorage.getItem('jingwei-calibration-drafts:v1')).drafts[0].normal;
        return next.some((value, axis) => value !== previous[axis]);
      }, initialNormal);
      await panel.getByRole('button', { name: '撤销坐标编辑（最多十步）', exact: true }).click();
      assert.equal(await panel.locator('.calibration-vector').textContent(), initialVectors, 'undo must restore both preview vectors after repicking another surface');
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('jingwei-calibration-drafts:v1')).drafts[0].normal), initialNormal);
      await panel.getByRole('button', { name: /导出校准草稿 JSON/ }).click();
      assert.match(await panel.getByRole('alert').textContent(), /evidence/);
      await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Simulated quota failure'); }; });
      const before = await panel.locator('.calibration-vector').textContent();
      await panel.getByRole('button', { name: 'x +0.001 m', exact: true }).click();
      assert.notEqual(await panel.locator('.calibration-vector').textContent(), before);
      assert.equal(await panel.getByText('浏览器未能保存校准草稿；当前会话仍保留编辑，请及时导出。', { exact: true }).isVisible(), true);
      await panel.getByLabel('定位依据', { exact: true }).fill('Browser surface fixture evidence');
      await panel.getByLabel('复核人', { exact: true }).fill('Interaction validator');
      await panel.getByRole('button', { name: '撤销坐标编辑（最多十步）', exact: true }).click();
      assert.equal(await panel.locator('.calibration-vector').textContent(), before);
      const downloadPromise = page.waitForEvent('download');
      await panel.getByRole('button', { name: /导出校准草稿 JSON/ }).click();
      const downloaded = await downloadPromise;
      const exported = JSON.parse(await readFile(await downloaded.path(), 'utf8'));
      assert.equal(exported.drafts.length, 1);
      assert.equal(exported.drafts[0].status, 'pending-review');
      assert.equal(exported.drafts[0].modelVersion, atlas.version);
      assert.equal(await page.locator('.anatomy-selection').count(), 0);
      if (width === 390) {
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '390px layout must not overflow');
        assert.ok(bounds.height >= 360, 'canvas minimum height');
        assert.ok(await panel.evaluate(el => getComputedStyle(el).position === 'static' && getComputedStyle(el).overflowY === 'visible'));
        assert.ok((await panel.getByRole('button').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().height))).every(height => height >= 44));
      }
      await page.keyboard.press('Escape');
      assert.equal(await panel.isVisible(), false);
      await page.reload();
      await page.getByRole('button', { name: '坐标校准工具', exact: true }).waitFor();
      assert.equal(await page.getByLabel('显示教学示意（39）', { exact: true }).isChecked(), false);
      if (width === 1440) {
        await page.getByRole('button', { name: '筛选条件', exact: true }).click();
        await page.getByLabel('学习范围', { exact: true }).selectOption('model');
        assert.equal(await page.locator('.point-list-item').count(), 0, 'model catalogue uses the active quality range');
      }
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Browser ${width}×${height}: default 0 / opt-in 39 seeds, truthful 0/39/344 counts, dashed hollow markers, surface pick, nudge/undo and pending-only Blob export passed.`);
    }
    const bank = JSON.parse(await readFile(new URL('../public/data/cmb-tcm.json', import.meta.url), 'utf8'));
    const explanations = JSON.parse(await readFile(new URL('../public/data/cmb-tcmle-explanations.json', import.meta.url), 'utf8'));
    const matched = bank.questions.find(question => question.id === explanations.explanations[0].questionId);
    const unmatched = bank.questions.find(question => !explanations.explanations.some(item => item.questionId === question.id));
    for (const [width, height] of [[1440, 900], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await isolateStorage(page);
      await page.route('**/data/cmb-tcm.json', route => route.fulfill({ json: { ...bank, questions: [matched, unmatched] } }));
      await page.route('**/data/cmb-tcmle-explanations.json', route => route.fulfill({ json: { ...explanations, explanations: [explanations.explanations[0]] } }));
      await page.goto(origin);
      await page.getByRole('button', { name: '执医题库', exact: true }).click();
      for (const heading of ['参考解析', '暂无解析']) {
        await page.getByRole('group', { name: '选择答案' }).getByRole('button').first().click();
        await page.getByRole('button', { name: '提交答案', exact: true }).click();
        await page.getByText(heading, { exact: true }).waitFor();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px submitted exam overflow`);
        if (heading === '参考解析') await page.getByRole('button', { name: '下一题', exact: true }).click();
      }
      await page.getByRole('button', { name: '解剖图谱', exact: true }).click();
      await page.locator('.model-loading').waitFor({ state: 'hidden', timeout: 90000 });
      const controls = page.locator('.anatomy-explode-controls');
      if (await controls.getByRole('button', { name: '隐藏全部面板', exact: true }).isVisible()) await controls.getByRole('button', { name: '隐藏全部面板', exact: true }).click();
      assert.equal(await page.locator('.anatomy-detail-content').isVisible(), false, 'detail card is optional');
      await controls.getByRole('button', { name: '结构目录', exact: true }).click();
      await page.getByRole('textbox', { name: '搜索全部解剖结构', exact: true }).fill('左颈阔肌');
      await page.locator('.anatomy-result-list').getByRole('button', { name: /左颈阔肌/ }).click();
      assert.match(await page.locator('.anatomy-selection').textContent(), /左颈阔肌/);
      await controls.getByRole('button', { name: '结构详情', exact: true }).click();
      await page.locator('.anatomy-detail-content').getByRole('heading', { name: '左颈阔肌', exact: true }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px anatomy details overflow`);
      await page.getByRole('button', { name: '关闭结构详情', exact: true }).click();
      const slider = page.getByRole('slider', { name: '结构散开', exact: true });
      if (!(await slider.isVisible())) await page.locator('.anatomy-slider-dock').getByRole('button', { name: '展开', exact: true }).click();
      await slider.focus();
      await slider.press('End');
      await page.waitForFunction(() => document.querySelector('.anatomy-slider-dock output')?.textContent === '100%');
      assert.equal(await slider.getAttribute('aria-valuenow'), '100');
      // Mobile intentionally hides the separate reset button; exercise both slider endpoints.
      if (width <= 680) await slider.press('Home');
      else await page.getByRole('button', { name: '复原模型', exact: true }).click();
      assert.equal(await slider.getAttribute('aria-valuenow'), '0');
      const project = page.getByRole('link', { name: '更多 AI 项目 ↗', exact: true });
      assert.equal(await project.getAttribute('href'), 'https://emilyailab.com/');
      await page.context().route('https://emilyailab.com/', route => route.fulfill({ contentType: 'text/html', body: '<title>Project destination fixture</title>' }));
      const popupPromise = page.waitForEvent('popup');
      await project.click();
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.equal(popup.url(), 'https://emilyailab.com/');
      await popup.close();
      for (const mode of ['经穴图谱', '取穴自测', '我的课堂', '情境练习']) {
        await page.getByRole('button', { name: mode, exact: true }).click();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px ${mode} panel overflow`);
      }
      assert.deepEqual(errors, []);
      await page.close();
      console.log(`Acceptance ${width}×${height}: sourced matched/unmatched submissions, Chinese anatomy selection, optional details, 0–100% explosion/reset, Emily AI popup and all mode layouts passed.`);
    }
  } finally { await browser.close(); }
} finally { if (server) await server.close(); }
