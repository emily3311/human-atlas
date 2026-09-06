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
import * as quality from '../app/tcm/placement-quality.ts';

test('display controls require explicit opt-in before ST36 can enter scene IDs', () => {
  assert.equal(typeof quality.placementDisplayControl, 'function');
  const control = quality.placementDisplayControl(ACUPOINTS.map(p => p.id));
  assert.equal(control.mode, 'calibrated-only');
  assert.equal(control.label, '显示教学示意（39）');
  assert.deepEqual(control.pointIds, []);
  assert.equal(quality.placementDisplayControl(['ST36', 'ST37'], 'include-pending').pointIds.includes('ST36'), true);
});

test('pending marker presentation exposes quality to sighted and screen reader users', () => {
  assert.equal(typeof quality.markerPresentation, 'function');
  const view = quality.markerPresentation({ pointId: 'ST36', status: 'pending-review', source: 'fixture', modelVersion: 'fixture' }, '足三里 ST36');
  assert.equal(view.className, 'acu-marker--pending');
  assert.equal(view.label, '足三里 ST36 · 待专业校准·教学示意');
});

test('route segments stop at unregistered or hidden catalogue entries', () => {
  assert.equal(typeof quality.placementRouteSegments, 'function');
  assert.deepEqual(quality.placementRouteSegments(['ST25', 'ST26', 'ST36', 'ST37', 'ST40'], 'include-pending'), []);
  assert.deepEqual(quality.placementRouteSegments(['LU1', 'LU5', 'LU7', 'LU9'], 'include-pending'), [['LU1', 'LU5', 'LU7', 'LU9']]);
  assert.deepEqual(quality.placementRouteSegments(['LU1', 'LU5'], 'calibrated-only'), []);
});

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
