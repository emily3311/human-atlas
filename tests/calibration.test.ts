import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import {
  CALIBRATION_DRAFT_STORAGE_KEY,
  exportCalibrationDraftPackage,
  parseCalibrationDrafts,
  undoCalibrationDraft,
  upsertCalibrationDraft,
  validateCalibrationPackage,
  type CalibrationContext,
  type CalibrationDraft,
  type CalibrationPackage,
} from '../app/tcm/calibration.ts';

// These literals are deliberately independent of the atlas catalogue and placement seeds.
const context: CalibrationContext = {
  knownPointIds: new Set(['ST36', 'GV20']),
  bilateralPointIds: new Set(['ST36']),
  atlasVersion: 'fixture-atlas-v1',
};

const draft: CalibrationDraft = {
  id: 'draft-st36-left',
  pointId: 'ST36',
  side: 'left',
  status: 'pending-review',
  position: [1, 2, 3],
  normal: [0, 0, 1],
  evidence: 'fixture photo A',
  reviewer: 'Dr Fixture',
  modelVersion: 'fixture-atlas-v1',
  updatedAt: '2026-09-06T12:00:00.000Z',
};

const validRecord = {
  pointId: 'ST36',
  side: 'left' as const,
  status: 'calibrated' as const,
  position: [1, 2, 3] as [number, number, number],
  normal: [0, 0, 1] as [number, number, number],
  surfaceDistance: 0.005,
};

const validPackage: CalibrationPackage = {
  schemaVersion: 1,
  atlasVersion: 'fixture-atlas-v1',
  reviewedBy: 'Dr Fixture',
  reviewedAt: '2026-09-06T12:00:00.000Z',
  evidence: 'fixture photo A',
  records: [validRecord],
};

test('a browser draft can never claim calibrated status', () => {
  assert.throws(
    () => parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [{ ...draft, status: 'calibrated' }] }), context),
    /draft status/i,
  );
});

test('draft parsing rejects unknown IDs, bad side rules, vectors, normals, strings, dates, and prototype keys', () => {
  const invalids: Array<[string, unknown, RegExp]> = [
    ['unknown point', { ...draft, pointId: 'NOT-A-POINT' }, /unknown point/i],
    ['unilateral side', { ...draft, pointId: 'GV20', side: 'right' }, /unilateral/i],
    ['non-finite vector', { ...draft, position: [Infinity, 2, 3] }, /position.*finite/i],
    ['non-unit normal', { ...draft, normal: [0, 0, 1.03] }, /unit normal/i],
    ['long evidence', { ...draft, evidence: 'a'.repeat(2001) }, /evidence/i],
    ['long reviewer', { ...draft, reviewer: 'a'.repeat(101) }, /reviewer/i],
    ['invalid date', { ...draft, updatedAt: '2026-02-30T12:00:00Z' }, /ISO date/i],
  ];

  for (const [label, invalidDraft, error] of invalids) {
    assert.throws(() => parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [invalidDraft] }), context), error, label);
  }
  assert.throws(
    () => parseCalibrationDrafts('{"version":1,"drafts":[],"__proto__":{"polluted":true}}', context),
    /prototype key/i,
  );
});

test('upsert takes an authoritative surface hit and undo retains only ten in-memory positions', () => {
  let store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [] }), context);
  store = upsertCalibrationDraft(store, { ...draft, position: [99, 99, 99], normal: [1, 0, 0] }, {
    position: [0, 0, 0], normal: [0, 0, 1], surfaceDistance: 0.4,
  }, context);
  assert.deepEqual(store.drafts[0].position, [0, 0, 0]);
  assert.deepEqual(store.drafts[0].normal, [0, 0, 1]);

  for (let index = 1; index <= 11; index += 1) {
    store = upsertCalibrationDraft(store, draft, {
      position: [index, 0, 0], normal: [0, 0, 1], surfaceDistance: 0,
    }, context);
  }
  for (let index = 10; index >= 1; index -= 1) store = undoCalibrationDraft(store, draft.id);
  assert.deepEqual(store.drafts[0].position, [1, 0, 0]);
  assert.deepEqual(undoCalibrationDraft(store, draft.id).drafts[0].position, [1, 0, 0]);
});

test('draft exports reject a mutated store instead of serializing a calibration escalation', () => {
  const store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
  const mutated = store as unknown as { drafts: Array<Record<string, unknown>> };
  mutated.drafts[0].status = 'calibrated';
  assert.throws(() => exportCalibrationDraftPackage(store, context), /draft status/i);
});

test('draft exports validate the in-memory store before a tampered toJSON hook can conceal it', () => {
  const store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
  const mutated = store as unknown as { drafts: Array<Record<string, unknown>> };
  mutated.drafts[0].status = 'calibrated';
  Object.defineProperty(mutated.drafts[0], 'toJSON', { value: () => draft });
  assert.throws(() => exportCalibrationDraftPackage(store, context), /draft status/i);
});

test('draft export snapshots a pointId getter before it can change after validation', () => {
  const store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
  const mutated = store as unknown as { drafts: Array<Record<string, unknown>> };
  let reads = 0;
  Object.defineProperty(mutated.drafts[0], 'pointId', {
    enumerable: true,
    get: () => (reads += 1) <= 3 ? 'ST36' : 'NOT-A-POINT',
  });
  const exported = JSON.parse(exportCalibrationDraftPackage(store, context));
  assert.equal(exported.drafts[0].pointId, 'ST36');
});

test('draft export snapshots vector coordinates before a getter can become non-finite', () => {
  const store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
  const mutated = store as unknown as { drafts: Array<Record<string, unknown>> };
  const position = mutated.drafts[0].position as number[];
  let reads = 0;
  Object.defineProperty(position, '0', {
    enumerable: true,
    get: () => reads++ === 0 ? 1 : Infinity,
  });
  const exported = JSON.parse(exportCalibrationDraftPackage(store, context));
  assert.deepEqual(exported.drafts[0].position, [1, 2, 3]);
});

test('draft export turns a throwing source getter into a validation failure', () => {
  const store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
  const mutated = store as unknown as { drafts: Array<Record<string, unknown>> };
  Object.defineProperty(mutated.drafts[0], 'evidence', {
    enumerable: true,
    get: () => { throw new Error('source is unavailable'); },
  });
  assert.throws(() => exportCalibrationDraftPackage(store, context), /export snapshot failed/i);
});

test('draft export cannot let a shrinking Proxy length hide a second illegal draft', () => {
  const store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
  const illegalDraft = { ...draft, id: 'draft-st36-right', side: 'right', status: 'calibrated' };
  let lengthReads = 0;
  const sourceDrafts = new Proxy([draft, illegalDraft], {
    get: (target, property, receiver) => property === 'length'
      ? (++lengthReads === 1 ? 2 : 1)
      : Reflect.get(target, property, receiver),
  });
  (store as unknown as { drafts: unknown }).drafts = sourceDrafts;
  assert.throws(() => exportCalibrationDraftPackage(store, context), /draft status/i);
  assert.equal(lengthReads, 1);
});

test('draft export reads source collection length and draft fields exactly once before validation', () => {
  const store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
  const reads = { length: 0, pointId: 0, position: 0, normal: 0 };
  const getterDraft: Record<string, unknown> = { ...draft };
  Object.defineProperties(getterDraft, {
    pointId: { enumerable: true, get: () => { reads.pointId += 1; return 'ST36'; } },
    position: { enumerable: true, get: () => { reads.position += 1; return [1, 2, 3]; } },
    normal: { enumerable: true, get: () => { reads.normal += 1; return [0, 0, 1]; } },
  });
  const sourceDrafts = new Proxy([getterDraft], {
    get: (target, property, receiver) => {
      if (property === 'length') reads.length += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  (store as unknown as { drafts: unknown }).drafts = sourceDrafts;
  assert.deepEqual(JSON.parse(exportCalibrationDraftPackage(store, context)).drafts, [draft]);
  assert.deepEqual(reads, { length: 1, pointId: 1, position: 1, normal: 1 });
});

test('draft exports reject mutated vectors and strings instead of serializing illegal JSON', () => {
  const invalidFields: Array<[string, (store: { drafts: Array<Record<string, unknown>> }) => void, RegExp]> = [
    ['position', (store) => { store.drafts[0].position = [Infinity, 0, 0]; }, /position.*finite/i],
    ['evidence', (store) => { store.drafts[0].evidence = 'a'.repeat(2001); }, /evidence/i],
  ];
  for (const [label, mutate, error] of invalidFields) {
    const store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
    mutate(store as unknown as { drafts: Array<Record<string, unknown>> });
    assert.throws(() => exportCalibrationDraftPackage(store, context), error, label);
  }
});

test('draft exports persist only current values after actual undo history exists', () => {
  let store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
  store = upsertCalibrationDraft(store, draft, { position: [8, 0, 0], normal: [0, 0, 1], surfaceDistance: 0 }, context);
  const exported = JSON.parse(exportCalibrationDraftPackage(store, context));
  assert.equal(CALIBRATION_DRAFT_STORAGE_KEY, 'jingwei-calibration-drafts:v1');
  assert.deepEqual(exported, { version: 1, drafts: [{ ...draft, position: [8, 0, 0] }] });
  assert.deepEqual(undoCalibrationDraft(store, draft.id).drafts[0].position, draft.position);
});

test('undo restores position and normal from the same surface pick before export', () => {
  let store = parseCalibrationDrafts(null, context);
  store = upsertCalibrationDraft(store, draft, { position: [0, 0, 1], normal: [0, 0, 1], surfaceDistance: 0 }, context);
  store = upsertCalibrationDraft(store, store.drafts[0], { position: [0, 1, 0], normal: [0, 1, 0], surfaceDistance: 0 }, context);

  const restored = undoCalibrationDraft(store, draft.id);
  assert.deepEqual(restored.drafts[0].position, [0, 0, 1]);
  assert.deepEqual(restored.drafts[0].normal, [0, 0, 1]);
  const exported = JSON.parse(exportCalibrationDraftPackage(restored, context, { requireReviewDetails: true }));
  assert.deepEqual(exported.drafts[0].position, [0, 0, 1]);
  assert.deepEqual(exported.drafts[0].normal, [0, 0, 1]);
  assert.equal(exported.drafts[0].status, 'pending-review');
  assert.deepEqual(store.drafts[0].normal, [0, 1, 0]);
});

test('normal-only surface edits are undoable without treating metadata as geometry', () => {
  let store = parseCalibrationDrafts(null, context);
  store = upsertCalibrationDraft(store, draft, { position: [0, 0, 1], normal: [0, 0, 1], surfaceDistance: 0 }, context);
  store = upsertCalibrationDraft(store, store.drafts[0], { position: [0, 0, 1], normal: [0, 1, 0], surfaceDistance: 0 }, context);
  for (let i = 0; i < 12; i++) {
    store = upsertCalibrationDraft(store, { ...store.drafts[0], evidence: `Updated evidence ${i}` }, { position: [0, 0, 1], normal: [0, 1, 0], surfaceDistance: 0 }, context);
  }
  const restored = undoCalibrationDraft(store, draft.id);
  assert.deepEqual(restored.drafts[0].position, [0, 0, 1]);
  assert.deepEqual(restored.drafts[0].normal, [0, 0, 1]);
  assert.equal(restored.drafts[0].evidence, 'Updated evidence 11');
});

test('formal package accepts both left and right placements for bilateral points', () => {
  const accepted = validateCalibrationPackage(validPackage, context);
  assert.deepEqual(accepted, { ok: true, errors: [], records: [validRecord] });
  const right = validateCalibrationPackage({ ...validPackage, records: [{ ...validRecord, side: 'right' }] }, context);
  assert.equal(right.ok, true);
  assert.deepEqual(right.records, [{ ...validRecord, side: 'right' }]);
});

test('formal package rejects an illegal right placement for a unilateral point', () => {
  const rightGV20 = validateCalibrationPackage({
    ...validPackage,
    records: [{ ...validRecord, pointId: 'GV20', side: 'right' }],
  }, context);
  assert.equal(rightGV20.ok, false);
  assert.match(rightGV20.errors.join('\n'), /unilateral/i);
});

test('formal package rejects a non-exact atlas version', () => {
  const result = validateCalibrationPackage({ ...validPackage, atlasVersion: 'wrong-version' }, context);
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /atlas version/i);
});

test('formal package rejects a missing reviewer', () => {
  const result = validateCalibrationPackage({ ...validPackage, reviewedBy: '' }, context);
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /reviewedBy/i);
});

test('formal package rejects missing evidence', () => {
  const result = validateCalibrationPackage({ ...validPackage, evidence: '' }, context);
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /evidence/i);
});

test('formal package rejects a duplicate point-side pair', () => {
  const result = validateCalibrationPackage({ ...validPackage, records: [{ ...validRecord }, { ...validRecord }] }, context);
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /duplicate/i);
});

test('invalid formal packages are rejected atomically', () => {
  const result = validateCalibrationPackage({
    ...validPackage,
    records: [validRecord, { ...validRecord, side: 'right', position: [NaN, 0, 0] }],
  }, context);
  assert.equal(result.ok, false);
  assert.equal(result.records.length, 0);
  assert.match(result.errors.join('\n'), /position.*finite/i);
});

test('formal package validation checks vector, normal, distance, status, strings, date, and prototype keys', () => {
  const invalidRecords = [
    [{ ...validRecord, position: [Infinity, 0, 0] }, /position.*finite/i],
    [{ ...validRecord, normal: [0, 0, 0.97] }, /unit normal/i],
    [{ ...validRecord, surfaceDistance: 0.011 }, /surface distance/i],
    [{ ...validRecord, status: 'pending-review' }, /status/i],
  ] as const;
  for (const [record, error] of invalidRecords) {
    const result = validateCalibrationPackage({ ...validPackage, records: [record] }, context);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), error);
  }
  const tooLong = validateCalibrationPackage({ ...validPackage, evidence: 'a'.repeat(2001) }, context);
  assert.equal(tooLong.ok, false);
  assert.match(tooLong.errors.join('\n'), /evidence/i);
  const invalidDate = validateCalibrationPackage({ ...validPackage, reviewedAt: '2026-02-30T12:00:00Z' }, context);
  assert.equal(invalidDate.ok, false);
  assert.match(invalidDate.errors.join('\n'), /ISO date/i);
  const prototypeKey = validateCalibrationPackage(JSON.parse('{"schemaVersion":1,"atlasVersion":"fixture-atlas-v1","reviewedBy":"Dr Fixture","reviewedAt":"2026-09-06T12:00:00.000Z","evidence":"fixture","records":[],"constructor":{}}'), context);
  assert.equal(prototypeKey.ok, false);
  assert.match(prototypeKey.errors.join('\n'), /prototype key/i);
});

test('draft dates reject semantically invalid offsets and accept ISO boundary offsets', () => {
  for (const offset of ['+99:99', '+24:00', '+00:60']) {
    assert.throws(
      () => parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [{ ...draft, updatedAt: `2026-09-06T12:00:00${offset}` }] }), context),
      /ISO date/i,
      offset,
    );
  }
  assert.doesNotThrow(() => parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [{ ...draft, updatedAt: '2026-09-06T12:00:00+23:59' }] }), context));
});

test('formal package dates reject semantically invalid offsets and accept ISO boundary offsets', () => {
  for (const offset of ['+99:99', '+24:00', '+00:60']) {
    const result = validateCalibrationPackage({ ...validPackage, reviewedAt: `2026-09-06T12:00:00${offset}` }, context);
    assert.equal(result.ok, false, offset);
    assert.match(result.errors.join('\n'), /ISO date/i, offset);
  }
  assert.equal(validateCalibrationPackage({ ...validPackage, reviewedAt: '2026-09-06T12:00:00-23:59' }, context).ok, true);
});

test('draft normals include both tolerance boundaries and reject values outside them', () => {
  for (const length of [0.98, 1.02]) {
    assert.doesNotThrow(() => parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [{ ...draft, normal: [0, 0, length] }] }), context));
  }
  for (const length of [0.9799, 1.0201]) {
    assert.throws(() => parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [{ ...draft, normal: [0, 0, length] }] }), context), /unit normal/i);
  }
});

test('formal normals include both tolerance boundaries and reject values outside them', () => {
  for (const length of [0.98, 1.02]) {
    assert.equal(validateCalibrationPackage({ ...validPackage, records: [{ ...validRecord, normal: [0, 0, length] }] }, context).ok, true);
  }
  for (const length of [0.9799, 1.0201]) {
    const result = validateCalibrationPackage({ ...validPackage, records: [{ ...validRecord, normal: [0, 0, length] }] }, context);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /unit normal/i);
  }
});

test('the CLI reads exactly one explicit input path and writes nothing when validation fails', () => {
  const directory = mkdtempSync(join(tmpdir(), 'calibration-cli-'));
  try {
    const input = join(directory, 'invalid.json');
    const output = join(directory, 'must-not-exist.json');
    writeFileSync(input, JSON.stringify({ ...validPackage, records: [{ ...validRecord, position: [Infinity, 0, 0] }] }));
    const command = spawnSync(process.execPath, ['--experimental-strip-types', 'scripts/validate-calibration-package.ts', input, output], {
      cwd: process.cwd(), encoding: 'utf8',
    });
    assert.notEqual(command.status, 0);
    assert.match(command.stderr, /usage|exactly one/i);
    assert.throws(() => readFileSync(output), /ENOENT/);

    const invalid = spawnSync(process.execPath, ['--experimental-strip-types', 'scripts/validate-calibration-package.ts', input], {
      cwd: process.cwd(), encoding: 'utf8',
    });
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /position.*finite/i);
    assert.throws(() => readFileSync(output), /ENOENT/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
