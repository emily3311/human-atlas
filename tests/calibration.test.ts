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

test('draft exports persist only current drafts under the fixed storage schema', () => {
  const store = parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [draft] }), context);
  const exported = JSON.parse(exportCalibrationDraftPackage(store));
  assert.equal(CALIBRATION_DRAFT_STORAGE_KEY, 'jingwei-calibration-drafts:v1');
  assert.deepEqual(exported, { version: 1, drafts: [draft] });
});

test('formal packages enforce bilateral rules, duplicate pairs, and exact review metadata', () => {
  const accepted = validateCalibrationPackage(validPackage, context);
  assert.deepEqual(accepted, { ok: true, errors: [], records: [validRecord] });

  const rightGV20 = validateCalibrationPackage({
    ...validPackage,
    records: [{ ...validRecord, pointId: 'GV20', side: 'right' }],
  }, context);
  assert.equal(rightGV20.ok, false);
  assert.match(rightGV20.errors.join('\n'), /unilateral/i);

  const invalid = validateCalibrationPackage({
    ...validPackage,
    atlasVersion: 'wrong-version',
    reviewedBy: '',
    reviewedAt: 'not-a-date',
    evidence: '',
    records: [{ ...validRecord }, { ...validRecord }],
  }, context);
  assert.equal(invalid.ok, false);
  assert.match(invalid.errors.join('\n'), /atlas version|reviewedBy|ISO date|evidence|duplicate/i);
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
