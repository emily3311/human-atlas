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
test('source-backed expansion covers unambiguous muscle, bone, sensory, and nervous cores',()=>{
  assert.equal(anatomyZh('Left abductor pollicis longus'),'\u5de6\u62c7\u957f\u5c55\u808c');
  assert.equal(anatomyZh('Left maxilla'),'\u5de6\u4e0a\u988c\u9aa8');
  assert.equal(anatomyZh('Right cornea'),'\u53f3\u89d2\u819c');
  assert.equal(anatomyZh('Corpus callosum'),'\u80fc\u80dd\u4f53');
  assert.equal(anatomyZh('Right temporal bone'),'\u53f3\u989e\u9aa8');
  assert.equal(anatomyZh('Left trochlear nerve'),'\u5de6\u6ed1\u8f66\u795e\u7ecf');
  assert.equal(anatomyZh('Right subclavian artery'),'\u53f3\u9501\u9aa8\u4e0b\u52a8\u8109');
});
test('every sourced mapping has usable provenance and occurs as an exact model-name core',()=>{
  const cores=new Set(atlas.parts.map(part=>part.name.toLowerCase().replace(/^(left|right) /,'')));
  for(const [core,term] of Object.entries(ANATOMY_TERMS)){
    assert.ok(cores.has(core),`missing model core: ${core}`);
    assert.match(term.source,/^https:\/\//,`non-HTTPS source: ${core}`);
    assert.ok(term.sourceTerm.trim(),`empty source term: ${core}`);
  }
});
