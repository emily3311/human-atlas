import test from "node:test";
import assert from "node:assert/strict";
import type { Part } from "../app/anatomy.ts";
import { createExplosionLayout } from "../app/explosion-layout.ts";
import {
  explosionOffset,
  overlaysAllowed,
  sceneDecorVisibility,
  shouldUpdateExplosionTransforms,
  translatedBounds,
} from "../app/tcm/anatomy-explosion.ts";

const part = (id: string, bounds: [number[], number[]]): Part => ({
  id,
  name: id,
  conceptId: id,
  system: "skeletal",
  chunk: 0,
  positions: 0,
  normals: 0,
  indices: 0,
  vertexCount: 3,
  indexCount: 3,
  bounds,
});

test("explosion endpoints preserve the source and center a part in its packed cell", () => {
  const source = part("heart", [[0.1, 0.4, -0.2], [0.3, 0.8, 0.2]]);
  const layout = createExplosionLayout([source], 1);
  const cell = layout.cells.get(source.id)!;
  assert.deepEqual(explosionOffset(source, cell, 0), [0, 0, 0]);
  const offset = explosionOffset(source, cell, 1);
  assert.ok(Math.abs(offset[0] - (cell.x - 0.2)) < 1e-12);
  assert.ok(Math.abs(offset[1] - (cell.y + 0.85 - 0.6)) < 1e-12);
  assert.equal(Math.abs(offset[2]), 0);
});

test("TCM overlays remain suppressed until the explosion has returned to zero", () => {
  assert.equal(overlaysAllowed(0), true);
  assert.equal(overlaysAllowed(0.0005), true);
  assert.equal(overlaysAllowed(0.002), false);
  assert.equal(overlaysAllowed(1), false);
});

test("routes and stage decorations restore as the explosion animation returns", () => {
  assert.deepEqual(sceneDecorVisibility(0.4, false), { overlays: false, stage: true });
  assert.deepEqual(sceneDecorVisibility(0, false), { overlays: true, stage: true });
  assert.deepEqual(sceneDecorVisibility(0, true), { overlays: true, stage: false });
});

test("selected-part bounds translate with its rendered offset", () => {
  assert.deepEqual(
    translatedBounds([[0, 1, -2], [2, 4, 3]], [0.5, -1, 2]),
    [[0.5, 0, 0], [2.5, 3, 5]],
  );
});

test("a settled explosion updates transforms when its packed layout changes", () => {
  assert.equal(shouldUpdateExplosionTransforms(1, 1, false, false), false);
  assert.equal(shouldUpdateExplosionTransforms(1, 1, false, true), true);
});
