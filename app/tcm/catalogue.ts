import type { Acupoint } from './types.ts';
import { PLACEMENTS } from './placements.ts';
export type StudyQuestion = 'location' | 'meridian' | 'tags' | 'identify';
export function hasPlacement(id:string) { return Object.hasOwn(PLACEMENTS,id); }
export function questionAvailable(point:Acupoint,type:StudyQuestion):boolean {
  if(type==='identify') return hasPlacement(point.id);
  if(type==='tags') return point.pendingClassificationTags.length===0 && point.classificationEvidence.some(item=>item.tags.length>0);
  if(type==='location') return !!point.location;
  return point.meridian!=='EX';
}
