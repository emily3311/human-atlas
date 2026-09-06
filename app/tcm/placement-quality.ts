import { ACUPOINTS } from './data.ts';
import {
  BODY_PARTS_3D_MODEL_VERSION,
  CALIBRATED_PLACEMENTS,
  PENDING_PLACEMENTS,
} from './placements.ts';
import type { Placement, PlacementDisplayMode, PlacementRecord, PlacementStatus } from './types.ts';

export type { Placement, PlacementDisplayMode, PlacementRecord, PlacementStatus, Vec3 } from './types.ts';

const knownPointIds = new Set(ACUPOINTS.map((point) => point.id));
const registeredPlacements = new Map<string, PlacementRecord>();

for (const [expectedStatus, records] of [
  ['pending-review', PENDING_PLACEMENTS],
  ['calibrated', CALIBRATED_PLACEMENTS],
] as const) {
  for (const record of Object.values(records)) {
    if (!knownPointIds.has(record.pointId)) {
      throw new Error(`Placement record has unknown point ID: ${record.pointId}`);
    }
    if (record.status !== expectedStatus) {
      throw new Error(`Placement record for ${record.pointId} has status ${record.status}, expected ${expectedStatus}`);
    }
    if (registeredPlacements.has(record.pointId)) {
      throw new Error(`Placement record is duplicated for point ID: ${record.pointId}`);
    }
    registeredPlacements.set(record.pointId, record);
  }
}

const uniqueIds = (ids: readonly string[]) => [...new Set(ids)];

const assertKnownPoint = (id: string): void => {
  if (!knownPointIds.has(id)) throw new Error(`Unknown acupoint placement ID: ${id}`);
};

export function placementRecord(id: string): PlacementRecord {
  assertKnownPoint(id);
  return registeredPlacements.get(id) ?? {
    pointId: id,
    status: 'unregistered',
    source: 'No BodyParts3D placement is registered for this point',
    modelVersion: BODY_PARTS_3D_MODEL_VERSION,
  };
}

export function placementCounts(ids: readonly string[]): Record<PlacementStatus, number> {
  const counts: Record<PlacementStatus, number> = {
    unregistered: 0,
    'pending-review': 0,
    calibrated: 0,
  };
  for (const id of uniqueIds(ids)) counts[placementRecord(id).status] += 1;
  return counts;
}

const isVisible = (status: PlacementStatus, displayMode: PlacementDisplayMode): boolean =>
  status === 'calibrated' || (displayMode === 'include-pending' && status === 'pending-review');

export function visiblePlacementIds(ids: readonly string[], displayMode: PlacementDisplayMode): string[] {
  return uniqueIds(ids).filter((id) => isVisible(placementRecord(id).status, displayMode));
}

export function hasPlacement(id: string, displayMode: PlacementDisplayMode): boolean {
  return visiblePlacementIds([id], displayMode).length === 1;
}

export function placementDisplayControl(ids: readonly string[], mode: PlacementDisplayMode = 'calibrated-only') {
  const counts = placementCounts(ids);
  return { mode, counts, label: `显示教学示意（${counts['pending-review']}）`, pointIds: visiblePlacementIds(ids, mode) };
}

export function markerPresentation(record: PlacementRecord, pointName: string) {
  const pending = record.status === 'pending-review';
  return {
    className: pending ? 'acu-marker--pending' : 'acu-marker--calibrated',
    label: `${pointName} · ${pending ? '待专业校准·教学示意' : record.status === 'calibrated' ? '已校准' : '未登记三维坐标'}`,
  };
}

/** Input is the full ordered catalogue path, including its unregistered entries. */
export function placementRouteSegments(ids: readonly string[], mode: PlacementDisplayMode, visibleIds: readonly string[] = ids): string[][] {
  const visible = new Set(visiblePlacementIds(visibleIds, mode));
  const segments: string[][] = [];
  let current: string[] = [];
  for (const id of ids) {
    if (visible.has(id)) current.push(id);
    else { if (current.length > 1) segments.push(current); current = []; }
  }
  if (current.length > 1) segments.push(current);
  return segments;
}
