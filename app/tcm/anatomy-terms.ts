import { FUDAN_BATCH_1_TERMS } from './anatomy-terms-fudan-batch-1.ts';
import { EXISTING_ANATOMY_TERMS } from './anatomy-terms-existing.ts';
import type { AnatomyTerm } from './anatomy-terms-existing.ts';

export type { AnatomyTerm } from './anatomy-terms-existing.ts';
export { EXISTING_ANATOMY_TERMS } from './anatomy-terms-existing.ts';

/** Exact atlas-name cores whose correspondence was checked against cited source rows. */
export const ANATOMY_TERMS: Record<string, AnatomyTerm> = {
  ...EXISTING_ANATOMY_TERMS,
  ...FUDAN_BATCH_1_TERMS,
};
