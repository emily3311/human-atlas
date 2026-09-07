import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export async function validateStaticArtifacts(origin) {
  const paths = ['/data/cmb-tcm.json', '/data/cmb-tcmle-explanations.json', '/data/cmb-tcmle-match-report.json', '/data/anatomy-term-import-report.json', '/models/atlas.json'];
  for (const path of paths) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, `${path}: HTTP 200 required`);
    assert.match(response.headers.get('content-type') ?? '', /^application\/json\b/i, `${path}: JSON content type required`);
    await response.json();
  }
  return paths;
}

export async function launchValidationBrowser() {
  let runtime;
  try { runtime = await import(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
  catch { throw new Error('Release browser checks require Playwright. Set PLAYWRIGHT_MODULE to an installed playwright/index.mjs; checks must not be skipped.'); }
  return runtime.chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
}

export async function isolateStorage(page) {
  await page.addInitScript(() => {
    const memory = new Map();
    Storage.prototype.getItem = key => memory.get(String(key)) ?? null;
    Storage.prototype.setItem = (key, value) => { memory.set(String(key), String(value)); };
    Storage.prototype.removeItem = key => { memory.delete(String(key)); };
    Storage.prototype.clear = () => memory.clear();
  });
}

export async function assertPanelContentFits(page, label) {
  const violations = await page.evaluate(() => {
    const panels = '.exam-page, .exam-shell, .exam-card, #learning-content, .calibration-panel, .anatomy-catalogue, .anatomy-detail-content, .knowledge-cards-panel, .flip-card';
    // These strips intentionally scroll horizontally; their contained children are not panel overflow.
    const scrollers = '.main-nav, .knowledge-decks, .card-types';
    const failures = [];
    const shown = el => el.checkVisibility({ checkVisibilityCSS: true }) && el.getBoundingClientRect().width > 1;
    if (document.documentElement.scrollWidth > innerWidth + 1) failures.push('document exceeds viewport');
    for (const panel of document.querySelectorAll(panels)) {
      if (!shown(panel)) continue;
      const rect = panel.getBoundingClientRect();
      // Closed slide-out catalogues are intentionally positioned outside the viewport.
      if (rect.right <= 0 || rect.left >= innerWidth) continue;
      const name = panel.id ? `#${panel.id}` : `.${String(panel.className).trim().split(/\s+/).join('.')}`;
      if (panel.scrollWidth > panel.clientWidth + 1) failures.push(`${name}: scrollWidth ${panel.scrollWidth} > clientWidth ${panel.clientWidth}`);
      if (rect.left < -1 || rect.right > innerWidth + 1) failures.push(`${name}: bounds ${rect.left}..${rect.right} outside viewport ${innerWidth}`);
      for (const child of panel.querySelectorAll('*')) {
        if (!shown(child) || child.closest(scrollers) || child.closest('.sr-only')) continue;
        const style = getComputedStyle(child);
        if (style.clipPath === 'inset(50%)') continue; // Accessible native range input has no visual box.
        const box = child.getBoundingClientRect();
        if (box.left < rect.left - 1 || box.right > rect.right + 1) {
          failures.push(`${name}: ${child.tagName.toLowerCase()}.${child.className} bounds ${box.left}..${box.right} exceed panel ${rect.left}..${rect.right}`);
          break;
        }
      }
    }
    return failures;
  });
  assert.deepEqual(violations, [], `${label}: horizontal content overflow`);
}

export async function validateContainedOverflowRegression(page) {
  const panel = page.locator('.exam-card');
  const original = await panel.getAttribute('style');
  try {
    await panel.evaluate(el => { el.style.minWidth = '700px'; });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'fixture must reproduce overflow hidden from the document root');
    await assert.rejects(() => assertPanelContentFits(page, 'injected 700px exam card'), /horizontal content overflow/);
  } finally {
    await panel.evaluate((el, style) => style === null ? el.removeAttribute('style') : el.setAttribute('style', style), original);
  }
  await assertPanelContentFits(page, 'restored exam card');
  console.log('Contained overflow regression: a 700px exam card is rejected even while document width fits; restored panel passes.');
}

export async function validateExplanation404(browser, origin) {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    try {
      await isolateStorage(page);
      await page.route('**/data/cmb-tcmle-explanations.json', route => route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not found' }));
      await page.goto(origin);
      await page.getByRole('button', { name: '执医题库', exact: true }).click();
      await page.locator('.exam-card').waitFor();
      assert.equal(await page.getByRole('group', { name: '选择答案' }).getByRole('button').count(), 5);
      await page.getByRole('group', { name: '选择答案' }).getByRole('button').first().click();
      await page.getByRole('button', { name: '提交答案', exact: true }).click();
      await page.getByText('解析暂不可用', { exact: true }).waitFor();
      await assertPanelContentFits(page, `${width}px explanation 404 shell`);
      if (width === 390) await validateContainedOverflowRegression(page);
      console.log(`Explanations 404 ${width}×${height}: real 4086-question shell, five options and submitted 解析暂不可用 passed.`);
    } finally { await page.close(); }
  }
}

export async function startValidationServer() {
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, TCM_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const timeout = setTimeout(() => child.kill(), 10000);
  try {
    await Promise.race([
      once(child.stdout, 'data'),
      once(child, 'exit').then(() => { throw new Error('Server exited before startup'); }),
    ]);
  } catch (error) { child.kill(); throw error; }
  finally { clearTimeout(timeout); }
  return { origin: `http://127.0.0.1:${port}`, close: async () => {
    child.kill();
    if (child.exitCode === null) await once(child, 'exit');
  } };
}

// Exercise the actual built app server; imports do not start servers or browsers.
async function main() {
 const server = await startValidationServer();
 let browser;
 try {
  const { origin } = server;
  const page = await fetch(origin);
  assert.equal(page.status, 200, 'homepage must not be mistaken for an escaping path');
  const html = await page.text();
  assert.match(html, /<div id="root"><\/div>/);
  const script = html.match(/src="([^"]+\.js)"/)[1];
  const js = await fetch(origin + script, { method: 'HEAD' });
  assert.equal(js.status, 200);
  assert.match(js.headers.get('content-type'), /javascript/);
  const artifacts = await validateStaticArtifacts(origin);
  const atlas = await fetch(origin + '/models/atlas.json');
  assert.ok((await atlas.json()).parts.length > 2000, 'the served atlas retains the complete structure catalogue');
  const model = await fetch(origin + '/models/body-0.bin.gz', { method: 'HEAD' });
  assert.equal(model.status, 200);
  assert.equal(model.headers.get('content-encoding'), null, 'client performs gzip decoding');
  const traversal = await fetch(origin + '/..%2fpackage.json');
  assert.equal(traversal.status, 403, 'files outside dist stay inaccessible');
  assert.equal((await fetch(origin + '/missing-file')).status, 404);
  assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  console.log(`Static server: ${artifacts.length} JSON artifacts HTTP 200 / application/json / parse passed; homepage, assets, model headers, path/method boundaries passed.`);
  browser = await launchValidationBrowser();
  await validateExplanation404(browser, origin);
 } finally {
  if (browser) await browser.close();
  await server.close();
 }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
