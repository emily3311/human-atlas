import test from 'node:test';
import assert from 'node:assert/strict';
import atlas from '../public/models/atlas.json' with {type:'json'};
import { anatomyZh, anatomyLabel, anatomyNameCoverage, anatomyNameEvidence } from '../app/tcm/anatomy-zh.ts';
import { ANATOMY_TERMS } from '../app/tcm/anatomy-terms.ts';

test('screenshot structure is identified in Chinese',()=>{
  assert.equal(anatomyZh('Marginal artery of colon'),'结肠边缘动脉');
});
test('side-specific muscle labels remain accurate',()=>{
  assert.equal(anatomyZh('Right tibialis posterior'),'右胫骨后肌');
  assert.equal(anatomyZh('Left tibialis anterior'),'左胫骨前肌');
});
test('common vessels and organs have Chinese labels',()=>{
  assert.equal(anatomyZh('Left anterior tibial artery'),'左胫前动脉');
  assert.equal(anatomyZh('Ascending colon'),'升结肠');
});
test('pectoralis subdivisions preserve their side and specific part',()=>{
  assert.equal(anatomyZh('Clavicular part of left pectoralis major'),'左胸大肌锁骨部');
  assert.equal(anatomyZh('Sternocostal part of right pectoralis major'),'右胸大肌胸肋部');
});
test('unreviewed display labels are explicit, identifiable, and do not masquerade as translations',()=>{
  assert.equal(anatomyLabel('Unreviewed structure','FMA123'),'解剖结构 FMA123（中文名待校对）');
  assert.equal(anatomyLabel('Marginal artery of colon','FMA456'),'结肠边缘动脉');
});
test('FJ1558 platysma and its side-specific counterpart use the sourced Chinese core',()=>{
  assert.equal(anatomyLabel('Left platysma','FJ1558','muscular'),'\u5de6\u9888\u9614\u808c');
  assert.equal(anatomyZh('Right platysma'),'\u53f3\u9888\u9614\u808c');
});
test('new terminology exposes HTTPS evidence and coverage counts actual mesh entries',()=>{
  assert.ok(anatomyNameEvidence('Left platysma')?.source.startsWith('https://'));
  assert.deepEqual(
    anatomyNameCoverage([{name:'Left platysma'},{name:'Unreviewed structure'}]),
    {total:2,translated:1,unresolved:1},
  );
});
test('strict core lookup leaves unknown and malformed inputs unchanged',()=>{
  assert.equal(anatomyZh('Imaginary branch of left platysma'),'Imaginary branch of left platysma');
  assert.equal(anatomyZh('Left  platysma'),'Left  platysma');
});
test('Fudan batch keeps literal vessel evidence while unknown names remain unresolved',()=>{
  assert.equal(anatomyZh('Accessory hemiazygos vein'), '副半奇静脉');
  assert.equal(anatomyZh('invented posterior branch'), 'invented posterior branch');
  assert.equal(anatomyNameEvidence('Accessory hemiazygos vein')?.sourceTerm.includes('05.1144'), true);
});
test('Fudan generated labels preserve the corrected source pages across systems',()=>{
  assert.equal(anatomyZh('Left costocervical trunk'), '左肋颈干');
  assert.equal(anatomyNameEvidence('Right lateral ventricle')?.source, 'https://xtjp.fudan.edu.cn/Upload/Files/201804100314393640155.pdf#page=446');
  assert.equal(anatomyZh('Left serratus anterior'), '左前锯肌');
  assert.equal(anatomyNameEvidence('Right serratus anterior')?.sourceTerm, '大陆术语 02.1566: 前锯肌 / serratus anterior');
});
test('source-backed expansion covers unambiguous muscle, bone, sensory, and nervous cores',()=>{
  assert.equal(anatomyZh('Left abductor pollicis longus'),'\u5de6\u62c7\u957f\u5c55\u808c');
  assert.equal(anatomyZh('Left maxilla'),'\u5de6\u4e0a\u988c\u9aa8');
  assert.equal(anatomyZh('Right cornea'),'\u53f3\u89d2\u819c');
  assert.equal(anatomyZh('Corpus callosum'),'\u80fc\u80dd\u4f53');
  assert.equal(anatomyZh('Right temporal bone'),'\u53f3\u989e\u9aa8');
  assert.equal(anatomyZh('Left trochlear nerve'),'\u5de6\u6ed1\u8f66\u795e\u7ecf');
  assert.equal(anatomyZh('Right subclavian artery'),'\u53f3\u9501\u9aa8\u4e0b\u52a8\u8109');
});
test('fibularis source terms preserve the fibula character and muscle distinctions',()=>{
  assert.equal(anatomyZh('Left fibularis tertius'),'\u5de6\u8153\u9aa8\u7b2c\u4e09\u808c');
  assert.equal(anatomyZh('Right fibularis longus'),'\u53f3\u8153\u9aa8\u957f\u808c');
  assert.equal(anatomyZh('Left fibularis brevis'),'\u5de6\u8153\u9aa8\u77ed\u808c');
});
test('audited source terms preserve the plantar character and middle-colic word order',()=>{
  assert.equal(anatomyZh('Right plantaris'),'\u53f3\u8dd6\u808c');
  assert.equal(anatomyZh('Left middle colic artery'),'\u5de6\u4e2d\u7ed3\u80a0\u52a8\u8109');
});
test('source-backed eye and lower-limb cores preserve exact anatomical distinctions',()=>{
  assert.equal(anatomyZh('Left choroid'),'\u5de6\u8109\u7edc\u819c');
  assert.equal(anatomyZh('Left lacrimal canaliculus'),'\u5de6\u6cea\u5c0f\u7ba1');
  assert.equal(anatomyZh('Right lacrimal gland'),'\u53f3\u6cea\u817a');
  assert.equal(anatomyZh('Right lacrimal lake'),'\u53f3\u6cea\u6e56');
  assert.equal(anatomyZh('Left lens'),'\u5de6\u6676\u72b6\u4f53');
  assert.equal(anatomyZh('Right inferior oblique'),'\u53f3\u4e0b\u659c\u808c');
  assert.equal(anatomyZh('Left inferior rectus'),'\u5de6\u4e0b\u76f4\u808c');
  assert.equal(anatomyZh('Right lateral rectus'),'\u53f3\u5916\u76f4\u808c');
  assert.equal(anatomyZh('Left levator palpebrae superioris'),'\u5de6\u4e0a\u7751\u63d0\u808c');
  assert.equal(anatomyZh('Right medial rectus'),'\u53f3\u5185\u76f4\u808c');
  assert.equal(anatomyZh('Left superior oblique'),'\u5de6\u4e0a\u659c\u808c');
  assert.equal(anatomyZh('Right superior rectus'),'\u53f3\u4e0a\u76f4\u808c');
  assert.equal(anatomyZh('Left lacrimal nerve'),'\u5de6\u6cea\u817a\u795e\u7ecf');
  assert.equal(anatomyZh('Right nasociliary nerve'),'\u53f3\u9f3b\u776b\u795e\u7ecf');
  assert.equal(anatomyZh('Left optic nerve'),'\u5de6\u89c6\u795e\u7ecf');
  assert.equal(anatomyZh('Right long ciliary nerve'),'\u53f3\u776b\u72b6\u957f\u795e\u7ecf');
  assert.equal(anatomyZh('Short ciliary nerve'),'\u776b\u72b6\u77ed\u795e\u7ecf');
  assert.equal(anatomyZh('Left supra-orbital nerve'),'\u5de6\u7736\u4e0a\u795e\u7ecf');
  assert.equal(anatomyZh('Left flexor accessorius'),'\u5de6\u8db3\u5e95\u65b9\u808c');
  assert.equal(anatomyZh('Right gemellus inferior'),'\u53f3\u4e0b\u5b56\u808c');
  assert.equal(anatomyZh('Left gemellus superior'),'\u5de6\u4e0a\u5b56\u808c');
  assert.equal(anatomyZh('Right gluteus maximus'),'\u53f3\u81c0\u5927\u808c');
  assert.equal(anatomyZh('Left gluteus medius'),'\u5de6\u81c0\u4e2d\u808c');
  assert.equal(anatomyZh('Right gluteus minimus'),'\u53f3\u81c0\u5c0f\u808c');
  assert.equal(anatomyZh('Left iliacus'),'\u5de6\u9ac2\u808c');
  assert.equal(anatomyZh('Right semimembranosus'),'\u53f3\u534a\u819c\u808c');
  assert.equal(anatomyZh('Left semitendinosus'),'\u5de6\u534a\u8171\u808c');
  assert.ok(anatomyNameEvidence('Left lacrimal canaliculus')?.source.startsWith('https://'));
  assert.equal(anatomyZh('Imaginary branch of left lacrimal nerve'),'Imaginary branch of left lacrimal nerve');
  assert.equal(anatomyZh('Left  lacrimal nerve'),'Left  lacrimal nerve');
});
test('every sourced mapping has usable provenance and occurs as an exact model-name core',()=>{
  const cores=new Set(atlas.parts.map(part=>part.name.toLowerCase().replace(/^(left|right) /,'')));
  for(const [core,term] of Object.entries(ANATOMY_TERMS)){
    assert.ok(cores.has(core),`missing model core: ${core}`);
    assert.match(term.source,/^https:\/\//,`non-HTTPS source: ${core}`);
    assert.ok(term.sourceTerm.trim(),`empty source term: ${core}`);
  }
});
