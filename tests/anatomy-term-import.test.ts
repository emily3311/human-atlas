import test from 'node:test';
import assert from 'node:assert/strict';
import atlas from '../public/models/atlas.json' with { type: 'json' };
import evidence from '../data/sources/fudan-anatomy-terms-batch-1.json' with { type: 'json' };
import { validateFudanBatch } from '../scripts/import-fudan-anatomy-terms.ts';
import { EXISTING_ANATOMY_TERMS } from '../app/tcm/anatomy-terms.ts';
import { FUDAN_BATCH_1_TERMS } from '../app/tcm/anatomy-terms-fudan-batch-1.ts';

test('Fudan batch contains unique exact cores with complete evidence', () => {
  const result = validateFudanBatch(evidence, atlas.parts);
  assert.equal(result.errors.length, 0);
  assert.ok(result.matchedCores >= 100 && result.matchedCores <= 130);
  assert.ok(result.matchedParts >= 250 && result.matchedParts <= 290);
});

test('ambiguous or side-specific source rows are rejected', () => {
  const result = validateFudanBatch([
    { core: 'inferior pulmonary vein', zh: '右下肺静脉', sourceEntry: 'x', pdfPage: 1, sourceEnglish: 'inferior pulmonary vein' },
  ], atlas.parts);
  assert.match(result.errors.join('\n'), /side-specific Chinese term/);
});

test('Fudan batch never overwrites an existing sourced term', () => {
  const duplicates = Object.keys(FUDAN_BATCH_1_TERMS).filter(core => Object.hasOwn(EXISTING_ANATOMY_TERMS, core));
  assert.deepEqual(duplicates, []);
});
