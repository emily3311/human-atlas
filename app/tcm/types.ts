export type Region = '头颈' | '胸腹' | '背腰' | '上肢' | '下肢';
export type Vec3 = [number, number, number];
export interface Placement {
  position: Vec3;
  normal: Vec3;
}
export type PlacementStatus = 'unregistered' | 'pending-review' | 'calibrated';
export type PlacementDisplayMode = 'calibrated-only' | 'include-pending';
export type PlacementRecord = {
  pointId: string;
  status: PlacementStatus;
  placement?: Placement;
  source: string;
  modelVersion: string;
  reviewedBy?: string;
  reviewedAt?: string;
};
export interface Source { title: string; url: string; section?: string }
export interface ClassificationEvidence { source: Source; tags: string[] }
export interface Meridian { id: string; name: string; shortName: string; color: string; description: string }
export interface Acupoint {
  id: string; name: string; pinyin: string; meridian: string; region: Region;
  bilateral: boolean; location: string; landmarks: string[];
  traditional: string; caution: string; tags: string[]; anatomy: string[];
  sources: Source[];
  /** Sources that explicitly support the traditional-function summary. */
  traditionalEvidence: Source[];
  classificationEvidence: ClassificationEvidence[];
  pendingClassificationTags: string[];
  catalogueKind?: 'standard' | 'extra';
  annotationsReady?: boolean;
  codeNote?: string;
  displayCode?: string;
  groupNote?: string;
}
export interface LearningCase {
  id: string; title: string; level: string; prompt: string;
  options: string[]; answer: number; explanation: string; pointIds: string[]; sources: Source[];
}
