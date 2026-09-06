import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's strip-types runner requires the explicit extension; the app tsconfig disallows it.
import { ACUPOINTS, CASES, MERIDIANS } from '../app/tcm/data.ts';

const REQUIRED = 'LU1 LU5 LU7 LU9 LI4 LI10 LI11 LI20 ST25 ST36 ST40 ST44 SP6 SP9 SP10 HT7 SI3 SI11 BL13 BL20 BL23 BL40 BL60 KI1 KI3 PC6 PC7 TE5 TE14 GB20 GB21 GB34 LR3 GV14 GV20 CV4 CV6 CV12 CV17'.split(' ');

test('exports the complete curated catalogue', () => {
  assert.equal(MERIDIANS.length, 14);
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

test('cases only reference known points and carry sources', () => {
  const ids = new Set(ACUPOINTS.map((p) => p.id));
  for (const item of CASES) {
    assert.ok(item.answer >= 0 && item.answer < item.options.length, `${item.id} answer`);
    assert.ok(item.pointIds.length > 0 && item.pointIds.every((id) => ids.has(id)), `${item.id} pointIds`);
    assert.ok(item.sources.length > 0, `${item.id} sources`);
    assert.match(item.explanation, /原创|教学|未审阅/);
  }
});
