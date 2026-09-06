import test from 'node:test';
import assert from 'node:assert/strict';
import atlas from '../public/models/atlas.json' with { type: 'json' };
import evidence from '../data/sources/fudan-anatomy-terms-batch-1.json' with { type: 'json' };
import { coverageForFudanBatch, excludedRowsForFudanBatch, validateFudanBatch } from '../scripts/import-fudan-anatomy-terms.ts';
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

test('representative Fudan evidence links exact atlas meshes to their printed pages', () => {
  const expected = [
    { core: 'costocervical trunk', zh: '肋颈干', sourceEntry: '05.0489', pdfPage: 422, ids: ['FJ2224', 'FJ2276'], names: ['Left costocervical trunk', 'Right costocervical trunk'] },
    { core: 'lateral ventricle', zh: '侧脑室', sourceEntry: '06.0779', pdfPage: 446, ids: ['FJ1767', 'FJ1814'], names: ['Left lateral ventricle', 'Right lateral ventricle'] },
    { core: 'serratus anterior', zh: '前锯肌', sourceEntry: '02.1566', pdfPage: 476, ids: ['FJ1459', 'FJ1459M'], names: ['Right serratus anterior', 'Left serratus anterior'] },
    { core: 'accessory hemiazygos vein', zh: '副半奇静脉', sourceEntry: '05.1144', pdfPage: 405, ids: ['FJ1981'], names: ['Accessory hemiazygos vein'] },
  ];

  for (const item of expected) {
    assert.deepEqual(evidence.find(row => row.core === item.core), {
      core: item.core, zh: item.zh, sourceEntry: item.sourceEntry, pdfPage: item.pdfPage, sourceEnglish: item.core,
    });
    const meshes = atlas.parts.filter(part => part.name.toLowerCase().replace(/^(left|right) /, '') === item.core);
    assert.deepEqual(meshes.map(part => part.id), item.ids);
    assert.deepEqual(meshes.map(part => part.name), item.names);
    assert.equal(FUDAN_BATCH_1_TERMS[item.core]?.source, `https://xtjp.fudan.edu.cn/Upload/Files/201804100314393640155.pdf#page=${item.pdfPage}`);
    assert.equal(FUDAN_BATCH_1_TERMS[item.core]?.sourceTerm, `大陆术语 ${item.sourceEntry}: ${item.zh} / ${item.core}`);
  }
});

test('explicitly excluded source candidates are rejected instead of counted as imported evidence', () => {
  const excluded = [
    { core: 'arcuate artery', zh: '[腓动脉]弓状动脉', sourceEntry: '05.0794', pdfPage: 411, sourceEnglish: 'arcuate artery' },
    { core: 'central canal of spinal cord', zh: '[脊髓]中央管', sourceEntry: '06.0151', pdfPage: 418, sourceEnglish: 'central canal of spinal cord' },
    { core: 'inferior pulmonary vein', zh: '右下肺静脉', sourceEntry: '05.0822', pdfPage: 472, sourceEnglish: 'inferior pulmonary vein' },
  ];
  const errors = validateFudanBatch(excluded, atlas.parts).errors.join('\n');
  assert.match(errors, /arcuate artery: excluded candidate/);
  assert.match(errors, /central canal of spinal cord: excluded candidate/);
  assert.match(errors, /inferior pulmonary vein: excluded candidate/);
  assert.equal(excludedRowsForFudanBatch(evidence), 3);
});

test('coverage is calculated from the supplied in-memory batch rather than a generated module', () => {
  assert.deepEqual(coverageForFudanBatch(evidence, atlas.parts), { total: 2234, translated: 877, unresolved: 1357 });
  const withoutAccessoryHemiazygos = evidence.filter(row => row.core !== 'accessory hemiazygos vein');
  assert.deepEqual(coverageForFudanBatch(withoutAccessoryHemiazygos, atlas.parts), { total: 2234, translated: 876, unresolved: 1358 });
});
