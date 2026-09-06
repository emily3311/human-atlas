import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { once } from 'node:events';
import type { Atlas } from '../app/anatomy.ts';
import { ACUPOINTS, MERIDIANS } from '../app/tcm/data.ts';
import { parseExamBank } from '../app/tcm/exam-bank.ts';
import { parseExamExplanationBank, explanationIndex } from '../app/tcm/exam-explanations.ts';
import { placementCounts, placementRecord } from '../app/tcm/placement-quality.ts';
import { anatomyNameEvidence } from '../app/tcm/anatomy-zh.ts';
import { parseCalibrationDrafts } from '../app/tcm/calibration.ts';
import { buildAnatomyCards, buildPointCards, buildPointEffectCards, buildWrongExamCards } from '../app/tcm/knowledge-cards.ts';
import { isKnowledgeCardId, parseKnowledgeReviewStore } from '../app/tcm/knowledge-review.ts';
import { coverageForFudanBatch, validateFudanBatch, excludedRowsForFudanBatch } from '../scripts/import-fudan-anatomy-terms.ts';

const json = async (path: string) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
const examBank = parseExamBank(await json('public/data/cmb-tcm.json'));
const explanationBank = parseExamExplanationBank(await json('public/data/cmb-tcmle-explanations.json'), examBank.questions);
const matchReport = await json('public/data/cmb-tcmle-match-report.json');
const termReport = await json('public/data/anatomy-term-import-report.json');
const evidence = await json('data/sources/fudan-anatomy-terms-batch-1.json');
const atlas: Atlas = await json('public/models/atlas.json');
const questionById = new Map(examBank.questions.map(item => [item.id, item]));
const ids = ACUPOINTS.map(item => item.id);
const points = ACUPOINTS.filter(item => item.location);
const context = { knownPointIds: new Set(ids), bilateralPointIds: new Set(ACUPOINTS.filter(item => item.bilateral).map(item => item.id)), atlasVersion: atlas.version };
const decks = { point: buildPointCards(points, MERIDIANS), anatomy: buildAnatomyCards(atlas.parts), 'exam-wrong': buildWrongExamCards(examBank.questions, {}, explanationIndex(explanationBank)), 'point-effects': buildPointEffectCards(points) };

test('release artifacts agree on sourced terminology, explanations, placement states and four deck IDs', () => {
  assert.equal(examBank.questions.length, 4086);
  assert.equal(explanationBank.explanations.length, 336);
  assert.ok(explanationBank.explanations.every(item => questionById.get(item.questionId)?.answer === item.answer));
  assert.equal(matchReport.accepted, explanationBank.explanations.length);
  assert.equal(matchReport.answerConflicts, 2);
  assert.equal(matchReport.strictMatches, matchReport.accepted + matchReport.answerConflicts);
  assert.equal(examBank.questions.length - explanationBank.explanations.length, 3750);
  const counts = placementCounts(ids);
  // The public API is keyed by PlacementStatus; total is the sum, not a new API field.
  assert.equal(Object.values(counts).reduce((sum, count) => sum + count, 0), 383);
  assert.deepEqual(counts, { unregistered: 344, 'pending-review': 39, calibrated: 0 });
  const terms = validateFudanBatch(evidence, atlas.parts);
  assert.deepEqual(terms.errors, []);
  assert.equal(termReport.sourceRows, evidence.length);
  assert.equal(termReport.matchedCores, terms.matchedCores);
  assert.equal(termReport.matchedParts, terms.matchedParts);
  assert.equal(termReport.excludedRows, excludedRowsForFudanBatch(evidence));
  const coverage = coverageForFudanBatch(evidence, atlas.parts);
  assert.equal(termReport.translatedTotal, coverage.translated);
  assert.equal(termReport.unresolvedTotal, coverage.unresolved);
  const sourcedMeshes = atlas.parts.filter(item => anatomyNameEvidence(item.name)).length;
  assert.equal(decks.anatomy.length, sourcedMeshes * 2);
  assert.ok(sourcedMeshes <= coverage.translated, 'legacy translations without term evidence do not create cards');
  assert.equal(decks['point-effects'].length, points.filter(item => item.traditionalEvidence.length > 0).length);
  const wrongProgress = Object.fromEntries(examBank.questions.map(item => [item.id, { answer: item.answer === 'A' ? 'B' as const : 'A' as const, correct: false, attempts: 1 }]));
  const allKnowledgeCards = [...Object.values(decks).flat(), ...buildWrongExamCards(examBank.questions, wrongProgress, explanationIndex(explanationBank))];
  assert.equal(new Set(allKnowledgeCards.map(item => item.id)).size, allKnowledgeCards.length);
  assert.ok(allKnowledgeCards.every(item => isKnowledgeCardId(item.id)));
  console.log('RELEASE_COUNTS ' + JSON.stringify({ terminology: { ...termReport, total: coverage.total }, questions: { total: examBank.questions.length, matched: explanationBank.explanations.length, conflicts: matchReport.answerConflicts, withoutExplanation: examBank.questions.length - explanationBank.explanations.length }, placements: { total: ids.length, ...counts }, decks: Object.fromEntries(Object.entries(decks).map(([name, cards]) => [name, cards.length])), wrongDeckAllWrongFixture: examBank.questions.length, uniqueCardsAllWrongFixture: allKnowledgeCards.length }));
});

test('a copied question with an empty option is rejected', () => {
  const mutated = structuredClone(examBank);
  mutated.questions[0].options.A = '';
  assert.throws(() => parseExamBank(mutated), /option A must be non-empty/);
});

test('a copied explanation with a different valid answer is rejected', () => {
  const mutated = structuredClone(explanationBank);
  mutated.explanations[0].answer = mutated.explanations[0].answer === 'A' ? 'B' : 'A';
  assert.throws(() => parseExamExplanationBank(mutated, examBank.questions), /answer disagrees/);
});

test('a copied question with an answer outside A–E is rejected', () => {
  const mutated = structuredClone(examBank) as unknown as { questions: { answer: string }[] };
  mutated.questions[0].answer = 'F';
  assert.throws(() => parseExamBank(mutated), /answer must be A-E/);
});

test('a copied anatomy name without matching evidence is rejected by the importer', () => {
  const mutated = structuredClone(evidence);
  mutated[0].core = 'invented anatomy structure';
  assert.match(validateFudanBatch(mutated, atlas.parts).errors.join('\n'), /source English differs from core|core is absent from atlas/);
});

test('a copied pending placement with an invalid vector is rejected by the draft parser', () => {
  const record = placementRecord('ST36');
  const draft = { id: 'ST36-left', pointId: 'ST36', side: 'left', status: 'pending-review', ...structuredClone(record.placement), evidence: record.source, reviewer: 'Integrity fixture', modelVersion: atlas.version, updatedAt: '2026-09-06T00:00:00.000Z' };
  const store = { version: 1, drafts: [draft] };
  assert.equal(parseCalibrationDrafts(JSON.stringify(store), context).drafts.length, 1);
  draft.position = [0, 1, Number.NaN];
  assert.throws(() => parseCalibrationDrafts(JSON.stringify(store), context), /position/);
});

test('a copied card ID cannot enter persisted reviews even if included in the supplied ID list', () => {
  const original = decks.anatomy[0].id;
  const review = { due: 0, interval: 1, repetitions: 1, lapses: 0, lastReviewed: 1, lastRating: 'good' };
  const payload = { version: 1, reviews: { [original]: review } };
  assert.equal(Object.keys(parseKnowledgeReviewStore(JSON.stringify(payload), [original]).reviews).length, 1);
  const mutated = original.replace(':zh-to-en', ':unrecognized');
  assert.deepEqual(parseKnowledgeReviewStore(JSON.stringify({ ...payload, reviews: { [mutated]: review } }), [mutated]).reviews, {});
});

test('the static release validator checks every JSON route and rejects 404, HTML fallback and broken JSON', async () => {
  const validation = await import('../scripts/validate-server.mjs');
  assert.equal(typeof validation.validateStaticArtifacts, 'function', 'the release gate must expose and execute the five-artifact HTTP validation');
  const paths = ['/data/cmb-tcm.json', '/data/cmb-tcmle-explanations.json', '/data/cmb-tcmle-match-report.json', '/data/anatomy-term-import-report.json', '/models/atlas.json'];
  let failure = '';
  const visited = new Set<string>();
  const server = createServer((request, response) => {
    visited.add(request.url!);
    const broken = request.url === paths[1];
    response.writeHead(broken && failure === 'status' ? 404 : 200, { 'content-type': broken && failure === 'type' ? 'text/html' : 'application/json' });
    response.end(broken && failure === 'json' ? '{broken' : '{}');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    const origin = `http://127.0.0.1:${address.port}`;
    await validation.validateStaticArtifacts(origin);
    assert.deepEqual([...visited].sort(), paths.sort());
    for (failure of ['status', 'type', 'json']) await assert.rejects(() => validation.validateStaticArtifacts(origin));
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});
