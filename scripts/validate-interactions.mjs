import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createExplosionLayout} from '../app/explosion-layout.ts';
import {PointerTap} from '../app/pointer-tap.ts';
import {atlasTools} from '../app/agent-tools.ts';
import { ACUPOINTS } from '../app/tcm/data.ts';
import { placementDisplayControl, markerPresentation, placementRecord, placementCounts } from '../app/tcm/placement-quality.ts';
import { calibrationEscape, persistCalibrationDrafts } from '../app/tcm/calibration-ui.ts';
import { parseCalibrationDrafts, upsertCalibrationDraft, undoCalibrationDraft, exportCalibrationDraftPackage } from '../app/tcm/calibration.ts';

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

// Browser checks use an existing Playwright runtime and running app; no production test hooks.
if (process.env.INTERACTION_BROWSER_URL && process.env.PLAYWRIGHT_MODULE) {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE);
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, acceptDownloads: true });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.env.INTERACTION_BROWSER_URL);
      await page.getByRole('button', { name: '坐标校准工具', exact: true }).waitFor();
      await page.locator('.model-loading').waitFor({ state: 'hidden', timeout: 90000 });
      assert.equal(await page.locator('.acu-marker:not([hidden])').count(), 0);
      await page.getByLabel('显示教学示意（39）', { exact: true }).check();
      await page.waitForFunction(() => document.querySelectorAll('.acu-marker--pending:not([hidden])').length > 0);
      assert.equal(await page.locator('.acu-marker--calibrated').count(), 0);
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
      console.log(`Browser ${width}px: default and opt-in rendering, panel lifecycle, surface pick, undo, Blob download and layout passed.`);
    }
  } finally { await browser.close(); }
} else console.log('Browser layout/pointer checks not run; set INTERACTION_BROWSER_URL and PLAYWRIGHT_MODULE to run the real UI checks.');
