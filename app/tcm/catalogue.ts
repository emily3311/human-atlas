import type { Acupoint } from './types.ts';
import { hasPlacement } from './placement-quality.ts';
import type { PlacementDisplayMode } from './placement-quality.ts';
export type StudyQuestion = 'location' | 'meridian' | 'tags' | 'identify';
export { hasPlacement } from './placement-quality.ts';
export function questionAvailable(point:Acupoint,type:StudyQuestion,displayMode:PlacementDisplayMode):boolean {
  if(type==='identify') return hasPlacement(point.id,displayMode);
  if(type==='tags') return point.pendingClassificationTags.length===0 && point.classificationEvidence.some(item=>item.tags.length>0);
  if(type==='location') return !!point.location;
  return point.meridian!=='EX';
}
