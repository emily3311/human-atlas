import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

// Exercise the actual built app server; catch path normalization rejecting valid assets.
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
  const origin = `http://127.0.0.1:${port}`;
  const page = await fetch(origin);
  assert.equal(page.status, 200, 'homepage must not be mistaken for an escaping path');
  const html = await page.text();
  assert.match(html, /<div id="root"><\/div>/);
  const script = html.match(/src="([^"]+\.js)"/)[1];
  const js = await fetch(origin + script, { method: 'HEAD' });
  assert.equal(js.status, 200);
  assert.match(js.headers.get('content-type'), /javascript/);
  const atlas = await fetch(origin + '/models/atlas.json');
  assert.equal(atlas.status, 200);
  assert.ok((await atlas.json()).parts.length > 2000);
  const model = await fetch(origin + '/models/body-0.bin.gz', { method: 'HEAD' });
  assert.equal(model.status, 200);
  assert.equal(model.headers.get('content-encoding'), null, 'client performs gzip decoding');
  const traversal = await fetch(origin + '/..%2fpackage.json');
  assert.equal(traversal.status, 403, 'files outside dist stay inaccessible');
  assert.equal((await fetch(origin + '/missing-file')).status, 404);
  assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  console.log('Static server homepage, assets, model headers, and path/method boundaries passed.');
} finally {
  clearTimeout(timeout);
  child.kill();
  if (child.exitCode === null) await once(child, 'exit');
}
