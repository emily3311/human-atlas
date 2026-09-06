import test from 'node:test';
import assert from 'node:assert/strict';
import { anatomyZh, anatomyLabel } from '../app/tcm/anatomy-zh.ts';

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
