import assert from "node:assert/strict";
import test from "node:test";

import rawAtlas from "../public/models/atlas.json" with { type: "json" };
import type { Atlas, Part } from "../app/anatomy.ts";
import { normalizeTeachingAtlas } from "../app/tcm/teaching-atlas.ts";

const corrected = [
  ["FJ1409", "Right fibularis brevis"],
  ["FJ1409M", "Left fibularis brevis"],
  ["FJ1410", "Right fibularis longus"],
  ["FJ1410M", "Left fibularis longus"],
  ["FJ1411", "Right fibularis tertius"],
  ["FJ1411M", "Left fibularis tertius"],
] as const;

test("teaching atlas classifies the six sourced fibularis meshes as muscular without changing raw data", () => {
  const source = rawAtlas as unknown as Atlas;
  const teaching = normalizeTeachingAtlas(source);

  for (const [id, name] of corrected) {
    const raw = source.parts.find((part) => part.id === id)!;
    const normalized = teaching.parts.find((part) => part.id === id)!;
    assert.equal(raw.name, name);
    assert.equal(raw.system, "skeletal");
    assert.equal(normalized.system, "muscular");
    assert.deepEqual({ ...normalized, system: raw.system }, raw);
    assert.notEqual(normalized, raw);
  }
  assert.equal(source.parts.find((part) => part.id === "FJ1409")!.system, "skeletal");
});

test("teaching correction requires the exact source id, name, and old system", () => {
  const basis = rawAtlas.parts.find((part) => part.id === "FJ1409") as Part;
  const fixtures = [
    { ...basis, id: "FJ1409-wrong" },
    { ...basis, name: "Right fibularis brevis tendon" },
    { ...basis, system: "muscular" as const },
    rawAtlas.parts.find((part) => part.id === "FJ1412") as unknown as Part,
  ];
  const atlas = { ...(rawAtlas as unknown as Atlas), parts: fixtures };

  const teaching = normalizeTeachingAtlas(atlas);

  assert.equal(teaching, atlas);
  assert.equal(teaching.parts, fixtures);
  assert.deepEqual(teaching.parts, fixtures);
});
