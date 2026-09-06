import type { Vec3 } from './types.ts';

export type PlacementSide = 'left' | 'right' | 'midline';

export type CalibrationDraft = {
  id: string;
  pointId: string;
  side: PlacementSide;
  status: 'pending-review';
  position: Vec3;
  normal: Vec3;
  evidence: string;
  reviewer: string;
  modelVersion: string;
  updatedAt: string;
};

export type CalibrationDraftStore = { version: 1; drafts: CalibrationDraft[] };

export type SurfaceHit = {
  position: Vec3;
  normal: Vec3;
  surfaceDistance: number;
};

export type CalibrationContext = {
  knownPointIds: ReadonlySet<string>;
  bilateralPointIds: ReadonlySet<string>;
  atlasVersion: string;
};

export type CalibrationRecord = {
  pointId: string;
  side: PlacementSide;
  status: 'calibrated';
  position: Vec3;
  normal: Vec3;
  surfaceDistance: number;
};

export type CalibrationPackage = {
  schemaVersion: 1;
  atlasVersion: string;
  reviewedBy: string;
  reviewedAt: string;
  evidence: string;
  records: CalibrationRecord[];
};

export type CalibrationPackageValidation = {
  ok: boolean;
  errors: string[];
  records: CalibrationRecord[];
};

export const CALIBRATION_DRAFT_STORAGE_KEY = 'jingwei-calibration-drafts:v1';

const NORMAL_TOLERANCE = 0.02;
const NORMAL_BOUNDARY_EPSILON = 1e-12;
const MAX_EVIDENCE_LENGTH = 2000;
const MAX_REVIEWER_LENGTH = 100;
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

type DraftHistory = Map<string, Vec3[]>;
const histories = new WeakMap<CalibrationDraftStore, DraftHistory>();

const emptyStore = (): CalibrationDraftStore => ({ version: 1, drafts: [] });

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

const assertSafeObject: (value: unknown, label: string) => asserts value is Record<string, unknown> = (value, label) => {
  if (!isObject(value)) throw new Error(`${label} must be a plain object without a custom prototype`);
  for (const key of Object.keys(value)) {
    if (DANGEROUS_KEYS.has(key)) throw new Error(`${label} contains forbidden prototype key: ${key}`);
  }
};

const assertOnlyKeys = (value: Record<string, unknown>, allowed: readonly string[], label: string): void => {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`${label} has unexpected key: ${key}`);
  }
};

const isFiniteVec3 = (value: unknown): value is Vec3 =>
  Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === 'number' && Number.isFinite(item));

const cloneVec3 = (value: Vec3): Vec3 => [value[0], value[1], value[2]];

const validateVec3 = (value: unknown, name: string, errors?: string[]): value is Vec3 => {
  if (isFiniteVec3(value)) return true;
  const message = `${name} must be a finite three-component vector`;
  if (errors) {
    errors.push(message);
    return false;
  }
  throw new Error(message);
};

const validateNormal = (value: unknown, errors?: string[]): value is Vec3 => {
  if (!validateVec3(value, 'normal', errors)) return false;
  const length = Math.hypot(value[0], value[1], value[2]);
  if (Math.abs(length - 1) <= NORMAL_TOLERANCE + NORMAL_BOUNDARY_EPSILON) return true;
  const message = `normal must be a unit normal within tolerance ${NORMAL_TOLERANCE}`;
  if (errors) {
    errors.push(message);
    return false;
  }
  throw new Error(message);
};

const isIsoDate = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return false;
  if (match[7] && (Number(match[8]) > 23 || Number(match[9]) > 59)) return false;
  return day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
};

const validateString = (
  value: unknown,
  label: string,
  maximum: number,
  options: { required?: boolean; errors?: string[] } = {},
): value is string => {
  const valid = typeof value === 'string' && value.length <= maximum && (!options.required || value.trim().length > 0);
  if (valid) return true;
  const message = `${label} must be ${options.required ? 'a non-empty ' : 'a '}string of at most ${maximum} characters`;
  if (options.errors) {
    options.errors.push(message);
    return false;
  }
  throw new Error(message);
};

const validateSide = (pointId: string, side: unknown, context: CalibrationContext, errors?: string[]): side is PlacementSide => {
  let message: string | undefined;
  if (typeof side !== 'string' || !['left', 'right', 'midline'].includes(side)) {
    message = 'side must be left, right, or midline';
  } else if (!context.knownPointIds.has(pointId)) {
    message = `unknown point ID: ${pointId}`;
  } else if (context.bilateralPointIds.has(pointId) && side === 'midline') {
    message = `bilateral point ${pointId} requires a left or right side`;
  } else if (!context.bilateralPointIds.has(pointId) && side !== 'midline') {
    message = `unilateral point ${pointId} requires the midline side`;
  }
  if (!message) return true;
  if (errors) {
    errors.push(message);
    return false;
  }
  throw new Error(message);
};

const cloneDraft = (draft: CalibrationDraft): CalibrationDraft => ({
  ...draft,
  position: cloneVec3(draft.position),
  normal: cloneVec3(draft.normal),
});

const cloneHistory = (history: DraftHistory | undefined): DraftHistory =>
  new Map([...history ?? []].map(([id, positions]) => [id, positions.map(cloneVec3)]));

const setHistory = (store: CalibrationDraftStore, history: DraftHistory): CalibrationDraftStore => {
  histories.set(store, history);
  return store;
};

const checkedContext = (context: CalibrationContext): CalibrationContext => {
  if (!context || !(context.knownPointIds instanceof Set) || !(context.bilateralPointIds instanceof Set)
    || typeof context.atlasVersion !== 'string' || context.atlasVersion.length === 0) {
    throw new Error('Calibration context requires point sets and a non-empty atlas version');
  }
  return context;
};

const parseDraft = (value: unknown, context: CalibrationContext): CalibrationDraft => {
  assertSafeObject(value, 'draft');
  assertOnlyKeys(value, ['id', 'pointId', 'side', 'status', 'position', 'normal', 'evidence', 'reviewer', 'modelVersion', 'updatedAt'], 'draft');
  if (typeof value.id !== 'string' || value.id.length === 0) throw new Error('draft id must be a non-empty string');
  if (typeof value.pointId !== 'string' || !context.knownPointIds.has(value.pointId)) throw new Error(`unknown point ID: ${String(value.pointId)}`);
  const side = value.side;
  const position = value.position;
  const normal = value.normal;
  const evidence = value.evidence;
  const reviewer = value.reviewer;
  const modelVersion = value.modelVersion;
  const updatedAt = value.updatedAt;
  validateSide(value.pointId, side, context);
  if (value.status !== 'pending-review') throw new Error('draft status must be pending-review');
  validateVec3(position, 'position');
  validateNormal(normal);
  validateString(evidence, 'evidence', MAX_EVIDENCE_LENGTH);
  validateString(reviewer, 'reviewer', MAX_REVIEWER_LENGTH);
  if (typeof modelVersion !== 'string' || modelVersion !== context.atlasVersion) {
    throw new Error(`draft modelVersion must exactly match atlas version ${context.atlasVersion}`);
  }
  if (!isIsoDate(updatedAt)) throw new Error('updatedAt must be a valid ISO date');
  return {
    id: value.id,
    pointId: value.pointId,
    side: side as PlacementSide,
    status: 'pending-review',
    position: cloneVec3(position as Vec3),
    normal: cloneVec3(normal as Vec3),
    evidence: evidence as string,
    reviewer: reviewer as string,
    modelVersion,
    updatedAt,
  };
};

const parseDraftStoreValue = (value: unknown, context: CalibrationContext): CalibrationDraftStore => {
  assertSafeObject(value, 'draft store');
  assertOnlyKeys(value, ['version', 'drafts'], 'draft store');
  if (value.version !== 1 || !Array.isArray(value.drafts)) throw new Error('draft store must have version 1 and a drafts array');
  const drafts = value.drafts.map((draft) => parseDraft(draft, context));
  const ids = new Set<string>();
  const placements = new Set<string>();
  for (const draft of drafts) {
    if (ids.has(draft.id)) throw new Error(`draft ID is duplicated: ${draft.id}`);
    const placement = `${draft.pointId}\u0000${draft.side}`;
    if (placements.has(placement)) throw new Error(`draft placement is duplicated: ${draft.pointId}/${draft.side}`);
    ids.add(draft.id);
    placements.add(placement);
  }
  return setHistory({ version: 1, drafts }, new Map());
};

export function parseCalibrationDrafts(serialized: string | null | undefined, context: CalibrationContext): CalibrationDraftStore {
  checkedContext(context);
  if (serialized === null || serialized === undefined || serialized === '') return setHistory(emptyStore(), new Map());
  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    throw new Error('Calibration draft storage contains invalid JSON');
  }
  return parseDraftStoreValue(value, context);
}

export function upsertCalibrationDraft(
  store: CalibrationDraftStore,
  candidate: CalibrationDraft,
  hit: SurfaceHit,
  context: CalibrationContext,
): CalibrationDraftStore {
  checkedContext(context);
  const draft = parseDraft(candidate, context);
  validateVec3(hit?.position, 'surface hit position');
  validateNormal(hit?.normal);
  if (typeof hit?.surfaceDistance !== 'number' || !Number.isFinite(hit.surfaceDistance) || hit.surfaceDistance < 0) {
    throw new Error('surface hit distance must be a non-negative finite number');
  }
  const history = cloneHistory(histories.get(store));
  const existing = store.drafts.find((item) => item.id === draft.id);
  if (existing && existing.position.some((value, axis) => value !== hit.position[axis])) {
    const positions = history.get(draft.id) ?? [];
    history.set(draft.id, [...positions, cloneVec3(existing.position)].slice(-10));
  } else if (!existing) {
    history.delete(draft.id);
  }
  const updated: CalibrationDraft = { ...draft, position: cloneVec3(hit.position), normal: cloneVec3(hit.normal) };
  const duplicate = store.drafts.find((item) => item.id !== draft.id && item.pointId === draft.pointId && item.side === draft.side);
  if (duplicate) throw new Error(`draft placement is duplicated: ${draft.pointId}/${draft.side}`);
  return setHistory({
    version: 1,
    drafts: store.drafts.some((item) => item.id === draft.id)
      ? store.drafts.map((item) => item.id === draft.id ? updated : cloneDraft(item))
      : [...store.drafts.map(cloneDraft), updated],
  }, history);
}

export function undoCalibrationDraft(store: CalibrationDraftStore, draftId: string): CalibrationDraftStore {
  const history = cloneHistory(histories.get(store));
  const positions = history.get(draftId);
  if (!positions?.length) return setHistory({ version: 1, drafts: store.drafts.map(cloneDraft) }, history);
  const previous = positions[positions.length - 1];
  const remaining = positions.slice(0, -1);
  if (remaining.length) history.set(draftId, remaining);
  else history.delete(draftId);
  return setHistory({
    version: 1,
    drafts: store.drafts.map((draft) => draft.id === draftId ? { ...cloneDraft(draft), position: cloneVec3(previous) } : cloneDraft(draft)),
  }, history);
}

const snapshotVec3 = (value: unknown): unknown => {
  if (!Array.isArray(value) || value.length !== 3) return null;
  const x = value[0];
  const y = value[1];
  const z = value[2];
  return [x, y, z];
};

const snapshotDraftStoreForExport = (store: unknown): unknown => {
  try {
    assertSafeObject(store, 'draft store');
    assertOnlyKeys(store, ['version', 'drafts'], 'draft store');
    const version = store.version;
    const sourceDrafts = store.drafts;
    if (!Array.isArray(sourceDrafts)) throw new Error('draft store must have a drafts array');
    const draftCount = sourceDrafts.length;
    const drafts: Array<Record<string, unknown>> = [];
    for (let index = 0; index < draftCount; index += 1) {
      const sourceDraft = sourceDrafts[index];
      assertSafeObject(sourceDraft, `draft ${index}`);
      assertOnlyKeys(sourceDraft, ['id', 'pointId', 'side', 'status', 'position', 'normal', 'evidence', 'reviewer', 'modelVersion', 'updatedAt'], `draft ${index}`);
      const id = sourceDraft.id;
      const pointId = sourceDraft.pointId;
      const side = sourceDraft.side;
      const status = sourceDraft.status;
      const position = snapshotVec3(sourceDraft.position);
      const normal = snapshotVec3(sourceDraft.normal);
      const evidence = sourceDraft.evidence;
      const reviewer = sourceDraft.reviewer;
      const modelVersion = sourceDraft.modelVersion;
      const updatedAt = sourceDraft.updatedAt;
      drafts.push({ id, pointId, side, status, position, normal, evidence, reviewer, modelVersion, updatedAt });
    }
    return { version, drafts };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown snapshot error';
    throw new Error(`Calibration draft export snapshot failed: ${message}`);
  }
};

export function exportCalibrationDraftPackage(store: CalibrationDraftStore, context: CalibrationContext, options: { requireReviewDetails?: boolean } = {}): string {
  checkedContext(context);
  const verified = parseDraftStoreValue(snapshotDraftStoreForExport(store), context);
  if (options.requireReviewDetails) {
    if (!verified.drafts.length) throw new Error('请先拾取表面点并保存草稿');
    for (const draft of verified.drafts) {
      validateString(draft.evidence, 'evidence（定位依据）', MAX_EVIDENCE_LENGTH, { required: true });
      validateString(draft.reviewer, 'reviewer（复核人）', MAX_REVIEWER_LENGTH, { required: true });
    }
  }
  return JSON.stringify({ version: verified.version, drafts: verified.drafts.map(cloneDraft) });
}

const packageError = (value: unknown, label: string, errors: string[]): Record<string, unknown> | undefined => {
  try {
    assertSafeObject(value, label);
    return value;
  } catch (error) {
    errors.push(error instanceof Error ? error.message : `${label} is invalid`);
    return undefined;
  }
};

export function validateCalibrationPackage(value: unknown, context: CalibrationContext): CalibrationPackageValidation {
  checkedContext(context);
  const errors: string[] = [];
  const packageValue = packageError(value, 'package', errors);
  if (!packageValue) return { ok: false, errors, records: [] };
  try {
    assertOnlyKeys(packageValue, ['schemaVersion', 'atlasVersion', 'reviewedBy', 'reviewedAt', 'evidence', 'records'], 'package');
  } catch (error) {
    errors.push((error as Error).message);
  }
  if (packageValue.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (packageValue.atlasVersion !== context.atlasVersion) errors.push(`atlas version must exactly match ${context.atlasVersion}`);
  validateString(packageValue.reviewedBy, 'reviewedBy', MAX_REVIEWER_LENGTH, { required: true, errors });
  if (!isIsoDate(packageValue.reviewedAt)) errors.push('reviewedAt must be a valid ISO date');
  validateString(packageValue.evidence, 'evidence', MAX_EVIDENCE_LENGTH, { required: true, errors });
  if (!Array.isArray(packageValue.records)) {
    errors.push('records must be an array');
    return { ok: false, errors, records: [] };
  }

  const records: CalibrationRecord[] = [];
  const pairs = new Set<string>();
  for (const [index, valueRecord] of packageValue.records.entries()) {
    const record = packageError(valueRecord, `record ${index}`, errors);
    if (!record) continue;
    try {
      assertOnlyKeys(record, ['pointId', 'side', 'status', 'position', 'normal', 'surfaceDistance'], `record ${index}`);
    } catch (error) {
      errors.push((error as Error).message);
    }
    const pointId = record.pointId;
    if (typeof pointId !== 'string' || !context.knownPointIds.has(pointId)) {
      errors.push(`record ${index} has unknown point ID: ${String(pointId)}`);
      continue;
    }
    const side = record.side;
    const position = record.position;
    const normal = record.normal;
    const surfaceDistance = record.surfaceDistance;
    const sideValid = validateSide(pointId, side, context, errors);
    const positionValid = validateVec3(position, 'position', errors);
    const normalValid = validateNormal(normal, errors);
    if (record.status !== 'calibrated') errors.push(`record ${index} status must be calibrated`);
    if (typeof surfaceDistance !== 'number' || !Number.isFinite(surfaceDistance) || surfaceDistance < 0 || surfaceDistance > 0.01) {
      errors.push(`record ${index} surface distance must be finite and no more than 0.01 model metres`);
    }
    if (sideValid) {
      const pair = `${pointId}\u0000${side}`;
      if (pairs.has(pair)) errors.push(`duplicate calibration record for ${pointId}/${side}`);
      pairs.add(pair);
    }
    if (sideValid && positionValid && normalValid && record.status === 'calibrated'
      && typeof surfaceDistance === 'number' && Number.isFinite(surfaceDistance)
      && surfaceDistance >= 0 && surfaceDistance <= 0.01) {
      records.push({
        pointId,
        side,
        status: 'calibrated',
        position: cloneVec3(position),
        normal: cloneVec3(normal),
        surfaceDistance,
      });
    }
  }
  return errors.length ? { ok: false, errors, records: [] } : { ok: true, errors: [], records };
}
