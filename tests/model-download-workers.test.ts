import assert from 'node:assert/strict';
import test from 'node:test';
import { loadModelChunks } from '../app/model-download.ts';

test('aborting a scene prevents later chunks even when active decode work finishes', async () => {
  const controller = new AbortController();
  const started: number[] = [];
  let release!: () => void;
  const decoding = new Promise<void>(resolve => { release = resolve; });
  const loading = loadModelChunks(8, controller, async index => {
    started.push(index);
    await decoding;
  });
  assert.deepEqual(started, [0, 1, 2]);
  controller.abort();
  release();
  await loading;
  assert.deepEqual(started, [0, 1, 2]);
});

test('a new scene session can load every chunk after the previous session was aborted', async () => {
  const controller = new AbortController();
  controller.abort();
  const loaded: number[] = [];
  await loadModelChunks(4, controller, async index => { loaded.push(index); });
  assert.equal(loaded.length, 0);
  await loadModelChunks(4, new AbortController(), async index => { loaded.push(index); });
  assert.deepEqual(loaded.sort(), [0, 1, 2, 3]);
});

test('a failed chunk aborts its sibling requests and propagates the failure', async () => {
  const controller = new AbortController();
  await assert.rejects(loadModelChunks(8, controller, async () => {
    throw new Error('download failed');
  }), /download failed/);
  assert.equal(controller.signal.aborted, true);
});
