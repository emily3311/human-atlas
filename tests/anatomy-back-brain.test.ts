import test from 'node:test';
import assert from 'node:assert/strict';
import atlas from '../public/models/atlas.json' with {type:'json'};
import { anatomyNameCoverage, anatomyNameEvidence, anatomyZh } from '../app/tcm/anatomy-zh.ts';

const SOURCE = 'https://xtjp.fudan.edu.cn/Upload/Files/201804100314393640155.pdf';

const cases = [
  ['levator scapulae', '肩胛提肌', '02.1514', 116, ['FJ1532', 'FJ1532M'], ['Right levator scapulae', 'Left levator scapulae']],
  ['serratus posterior inferior', '下后锯肌', '02.1515', 116, ['FJ1541', 'FJ1541M'], ['Right serratus posterior inferior', 'Left serratus posterior inferior']],
  ['serratus posterior superior', '上后锯肌', '02.1516', 116, ['FJ1542', 'FJ1542M'], ['Right serratus posterior superior', 'Left serratus posterior superior']],
  ['iliocostalis thoracis', '胸髂肋肌', '02.1522', 117, ['FJ1528', 'FJ1528M'], ['Right iliocostalis thoracis', 'Left iliocostalis thoracis']],
  ['longissimus thoracis', '胸最长肌', '02.1525', 117, ['FJ1535', 'FJ1535M'], ['Right longissimus thoracis', 'Left longissimus thoracis']],
  ['longissimus cervicis', '颈最长肌', '02.1526', 117, ['FJ1534', 'FJ1534M'], ['Right longissimus cervicis', 'Left longissimus cervicis']],
  ['spinalis thoracis', '胸棘肌', '02.1529', 117, ['FJ1544', 'FJ1544M'], ['Right spinalis thoracis', 'Left spinalis thoracis']],
  ['semispinalis thoracis', '胸半棘肌', '02.1534', 117, ['FJ1540', 'FJ1540M'], ['Right semispinalis thoracis', 'Left semispinalis thoracis']],
  ['semispinalis capitis', '头半棘肌', '02.1536', 118, ['FJ1538', 'FJ1538M'], ['Right semispinalis capitis', 'Left semispinalis capitis']],
  ['precentral gyrus', '中央前回', '06.0586', 339, ['FJ1800', 'FJ1801'], ['Left precentral gyrus', 'Right precentral gyrus']],
  ['superior frontal gyrus', '额上回', '06.0588', 339, ['FJ1833', 'FJ1834'], ['Left superior frontal gyrus', 'Right superior frontal gyrus']],
  ['middle frontal gyrus', '额中回', '06.0590', 339, ['FJ1787', 'FJ1788'], ['Left middle frontal gyrus', 'Right middle frontal gyrus']],
  ['inferior frontal gyrus', '额下回', '06.0591', 339, ['FJ1744', 'FJ1745'], ['Left inferior frontal gyrus', 'Right inferior frontal gyrus']],
  ['postcentral gyrus', '中央后回', '06.0598', 340, ['FJ1797', 'FJ1798'], ['Left postcentral gyrus', 'Right postcentral gyrus']],
  ['superior parietal lobule', '顶上小叶', '06.0600', 340, ['FJ1835', 'FJ1836'], ['Left superior parietal lobule', 'Right superior parietal lobule']],
  ['supramarginal gyrus', '缘上回', '06.0603', 340, ['FJ1841', 'FJ1842'], ['Left supramarginal gyrus', 'Right supramarginal gyrus']],
  ['angular gyrus', '角回', '06.0604', 340, ['FJ1732', 'FJ1733'], ['Left angular gyrus', 'Right angular gyrus']],
  ['occipital lobe', '枕叶', '06.0605', 340, ['FJ1791', 'FJ1792'], ['Left occipital lobe', 'Right occipital lobe']],
  ['middle temporal gyrus', '颞中回', '06.0613', 340, ['FJ1789', 'FJ1790'], ['Left middle temporal gyrus', 'Right middle temporal gyrus']],
  ['inferior temporal gyrus', '颞下回', '06.0614', 340, ['FJ1746', 'FJ1747'], ['Left inferior temporal gyrus', 'Right inferior temporal gyrus']],
  ['cingulate gyrus', '扣带回', '06.0626', 341, ['FJ1739', 'FJ1740'], ['Left cingulate gyrus', 'Right cingulate gyrus']],
  ['lamina terminalis', '终板', '06.0634', 341, ['FJ1764', 'FJ1812'], ['Lamina terminalis', 'Lamina terminalis']],
] as const;

test('22 source-checked cores translate both explicit sides and retain exact evidence', () => {
  for (const [core, zh, entry, page] of cases) {
    assert.equal(anatomyZh(`Left ${core}`), `左${zh}`, core);
    assert.equal(anatomyZh(`Right ${core}`), `右${zh}`, core);
    const evidence = anatomyNameEvidence(`Left ${core}`);
    assert.equal(evidence?.source, `${SOURCE}#page=${page}`, core);
    assert.equal(evidence?.sourceTerm, `${entry}: ${zh} / ${core}`, core);
  }
});

test('selected atlas mesh pairs have the exact expected source IDs and names', () => {
  for (const [core, , , , expectedIds, expectedNames] of cases) {
    const selected = atlas.parts.filter((part) => part.name.toLowerCase().replace(/^(left|right) /, '') === core);
    assert.deepEqual(selected.map((part) => part.id), [...expectedIds], `${core} IDs`);
    assert.deepEqual(selected.map((part) => part.name), [...expectedNames], `${core} names`);
  }
  assert.equal(cases.reduce((count, [, , , , ids]) => count + ids.length, 0), 44);
});

test('near matches stay untranslated while adjacent gyri remain distinct', () => {
  assert.equal(anatomyZh('Left precentral gyrus'), '左中央前回');
  assert.equal(anatomyZh('Right postcentral gyrus'), '右中央后回');
  assert.equal(anatomyZh('Left inferior frontal gyrus branch'), 'Left inferior frontal gyrus branch');
});

test('the complete atlas reports the source-backed coverage increase', () => {
  assert.deepEqual(anatomyNameCoverage(atlas.parts), {total:2234, translated:592, unresolved:1642});
});
