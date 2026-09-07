import assert from 'node:assert/strict';
import test from 'node:test';
import { STANDARD_POINTS } from '../app/tcm/standard-points.ts';
import { ACUPOINTS, CURATED_ACUPOINTS } from '../app/tcm/data.ts';
import { hasPlacement, questionAvailable } from '../app/tcm/catalogue.ts';
import { PRACTICAL_NAMES, WRITTEN_NAMES, inCatalogue } from '../app/tcm/exam-scope.ts';

test('national-standard catalogue covers every sequential point in all fourteen meridians', () => {
  const counts = { LU:11, LI:20, ST:45, SP:21, HT:9, SI:19, BL:67, KI:27, PC:9, TE:23, GB:44, LR:14, GV:29, CV:24 };
  assert.equal(STANDARD_POINTS.length,362);
  assert.equal(new Set(STANDARD_POINTS.map(p=>p.id)).size,362);
  for(const [meridian,count] of Object.entries(counts)) {
    const expected = meridian==='GV'
      ? [...Array.from({length:24},(_,i)=>`GV${i+1}`),'GV24+',...Array.from({length:4},(_,i)=>`GV${i+25}`)]
      : Array.from({length:count},(_,i)=>`${meridian}${i+1}`);
    assert.deepEqual(STANDARD_POINTS.filter(p=>p.meridian===meridian).map(p=>p.id),expected);
  }
});

test('official named scope maps without confusing name entries, groups, and standard codes',()=>{
  assert.equal(ACUPOINTS.length,383);
  assert.equal(PRACTICAL_NAMES.length,90);
  assert.equal(WRITTEN_NAMES.length,180);
  assert.equal(ACUPOINTS.filter(p=>inCatalogue(p,'practical')).length,90);
  assert.equal(ACUPOINTS.filter(p=>inCatalogue(p,'written')).length,180);
  assert.equal(ACUPOINTS.filter(p=>inCatalogue(p,'standard')).length,362);
  assert.equal(ACUPOINTS.filter(p=>inCatalogue(p,'model')).length,39);
  for(const name of new Set([...PRACTICAL_NAMES,...WRITTEN_NAMES])) assert.equal(ACUPOINTS.filter(p=>p.name===name).length,1,name);
  const group=ACUPOINTS.find(p=>p.name==='夹脊')!;
  assert.match(group.groupNote??'',/34/);
  assert.equal(questionAvailable(group,'identify','include-pending'),false);
  const pending=ACUPOINTS.find(p=>p.name==='三角灸')!;
  assert.equal(questionAvailable(pending,'location','include-pending'),false);
  assert.equal(pending.displayCode,'定位待核验');
  const unassigned=ACUPOINTS.find(p=>p.name==='安眠')!;
  assert.equal(unassigned.displayCode,'未赋标准码');
  assert.equal(questionAvailable(ACUPOINTS.find(p=>p.id==='LU9')!,'tags','include-pending'),false);
});

test('merged library preserves annotated content but adds factual records without invented 3D or answers',()=>{
  assert.ok(ACUPOINTS.length>=362);
  for(const existing of CURATED_ACUPOINTS) {
    const point=ACUPOINTS.find(p=>p.id===existing.id)!;
    assert.equal(point.traditional,existing.traditional);
    assert.deepEqual(point.classificationEvidence,existing.classificationEvidence);
  }
  const missing=ACUPOINTS.find(p=>p.id==='LU6')!;
  assert.equal(hasPlacement('LU6','include-pending'),false);
  assert.equal(questionAvailable(missing,'location','include-pending'),true);
  assert.equal(questionAvailable(missing,'identify','include-pending'),false);
  assert.equal(questionAvailable(missing,'tags','include-pending'),false);
  assert.equal(questionAvailable(ACUPOINTS.find(p=>p.id==='ST36')!,'identify','include-pending'),true);
});

test('each location is a clean point-specific fact with a traceable source section and page', () => {
  for(const p of STANDARD_POINTS) {
    assert.ok(p.name && p.pinyin && p.location.length>=5,p.id);
    assert.match(p.section,/^5\.\d+\.\d+$/);
    assert.ok(p.page>=13 && p.page<=39,p.id);
    assert.doesNotMatch(p.location,/GB\/T|附录|5\.\d+\.\d+|注：/);
    assert.ok(['头颈','胸腹','背腰','上肢','下肢'].includes(p.region),p.id);
  }
  assert.equal(STANDARD_POINTS.find(p=>p.id==='GV24+')?.name,'印堂');
  assert.match(STANDARD_POINTS.find(p=>p.id==='LU6')?.location??'',/7寸/);
  assert.match(STANDARD_POINTS.find(p=>p.id==='ST36')?.location??'',/犊鼻/);
  assert.equal(STANDARD_POINTS.find(p=>p.id==='CV17')?.pinyin,'Dànzhōng');
});

test('dorsum of hand and foot are classified as limbs, not the back',()=>{
  for(const id of ['LI3','LI4','SI3','TE2','TE3']) assert.equal(STANDARD_POINTS.find(p=>p.id===id)?.region,'上肢',id);
  for(const id of ['ST42','ST43','ST44','BL63','GB41','GB42','GB43','LR2','LR3']) assert.equal(STANDARD_POINTS.find(p=>p.id===id)?.region,'下肢',id);
  assert.equal(STANDARD_POINTS.find(p=>p.id==='BL23')?.region,'背腰');
});
