import assert from 'node:assert/strict';
import test from 'node:test';
import { ACUPOINTS } from '../app/tcm/data.ts';
import {
  hasPlacement,
  placementCounts,
  placementRecord,
  visiblePlacementIds,
} from '../app/tcm/placement-quality.ts';
import { questionAvailable } from '../app/tcm/catalogue.ts';

test('all catalogue entries have exactly one honest placement state', () => {
  const records = ACUPOINTS.map((point) => placementRecord(point.id));

  assert.equal(records.length, 383);
  assert.equal(records.filter((item) => item.status === 'pending-review').length, 39);
  assert.equal(records.filter((item) => item.status === 'unregistered').length, 344);
  assert.equal(records.filter((item) => item.status === 'calibrated').length, 0);
  assert.equal(records.filter((item) => item.status === 'unregistered' && item.placement).length, 0);
  assert.deepEqual(placementCounts(ACUPOINTS.map((point) => point.id)), {
    unregistered: 344,
    'pending-review': 39,
    calibrated: 0,
  });
  assert.equal(placementRecord('ST36').source, 'BodyParts3D adult male approximate teaching seed');
  assert.equal(placementRecord('ST36').modelVersion, 'BodyParts3D 4.0');
});

test('default visibility excludes teaching demonstrations', () => {
  assert.deepEqual(visiblePlacementIds(['ST36', 'ST37'], 'calibrated-only'), []);
  assert.deepEqual(visiblePlacementIds(['ST36', 'ST37'], 'include-pending'), ['ST36']);
  assert.equal(hasPlacement('ST36', 'calibrated-only'), false);
  assert.equal(hasPlacement('ST36', 'include-pending'), true);
  const st36 = ACUPOINTS.find((point) => point.id === 'ST36')!;
  assert.equal(questionAvailable(st36, 'identify', 'calibrated-only'), false);
  assert.equal(questionAvailable(st36, 'identify', 'include-pending'), true);
  assert.equal(questionAvailable(st36, 'location', 'calibrated-only'), true);
});

test('placement state validation rejects unknown IDs and does not duplicate markers', () => {
  assert.throws(() => placementRecord('NOT-A-POINT'), /unknown.*NOT-A-POINT/i);
  assert.throws(() => visiblePlacementIds(['ST36', 'NOT-A-POINT'], 'include-pending'), /unknown.*NOT-A-POINT/i);
  assert.deepEqual(visiblePlacementIds(['ST36', 'ST36'], 'include-pending'), ['ST36']);
  assert.deepEqual(placementCounts(['ST36', 'ST36']), {
    unregistered: 0,
    'pending-review': 1,
    calibrated: 0,
  });
});
