import assert from 'node:assert/strict';
import test from 'node:test';

import { emptyStore, parseStore } from '../app/tcm/study.ts';
import {
  KNOWLEDGE_REVIEW_KEY,
  knowledgeReviewQueue,
  parseKnowledgeReviewStore,
  rateKnowledgeCard,
} from '../app/tcm/knowledge-review.ts';

const examId = `exam:${'a'.repeat(64)}`;
const cardIds = ['point:ST36:location', 'anatomy:mesh-heart:zh-to-en', examId];
const validReview = { due: 10, interval: 1, repetitions: 2, lapses: 0, lastRating: 'good', lastReviewed: 4 };

function assertRejectedReview(review: unknown, label: string): void {
  const raw = JSON.stringify({ version: 1, reviews: { [cardIds[0]]: review, [examId]: validReview } });
  assert.deepEqual(parseKnowledgeReviewStore(raw, cardIds).reviews, { [examId]: validReview }, label);
}

for (const field of ['due', 'interval', 'repetitions', 'lapses', 'lastReviewed']) {
  test(`knowledge review parser rejects missing, nonnumeric, negative and nonfinite ${field}`, () => {
    for (const invalid of [undefined, null, '1', true, {}, [], -1]) {
      assertRejectedReview({ ...validReview, [field]: invalid }, `${field} = ${JSON.stringify(invalid)}`);
    }
    // JSON.stringify converts Infinity/NaN to null; exponent literals reach the finite-number guard.
    for (const number of ['1e400', '-1e400']) {
      const raw = `{"version":1,"reviews":{"${cardIds[0]}":${JSON.stringify({ ...validReview, [field]: 'overflow' }).replace('"overflow"', number)},"${examId}":${JSON.stringify(validReview)}}}`;
      assert.deepEqual(parseKnowledgeReviewStore(raw, cardIds).reviews, { [examId]: validReview }, `${field} = ${number}`);
    }
  });
}

test('knowledge review parser rejects missing or unsupported ratings while retaining valid siblings', () => {
  for (const lastRating of [undefined, null, '', 'easy', 'GOOD', 1, true, {}, []]) {
    assertRejectedReview({ ...validReview, lastRating }, `lastRating = ${JSON.stringify(lastRating)}`);
  }
});

test('knowledge review parser rejects malformed individual review records', () => {
  for (const review of [undefined, null, false, 1, 'review', [], [validReview], {}]) {
    assertRejectedReview(review, JSON.stringify(review) ?? 'missing');
  }
});

test('knowledge review parser accepts all ratings and finite nonnegative numeric boundaries', () => {
  for (const lastRating of ['again', 'hard', 'good']) {
    for (const value of [0, 0.5, Number.MAX_VALUE]) {
      const review = { due: value, interval: value, repetitions: value, lapses: value, lastReviewed: value, lastRating };
      const raw = JSON.stringify({ version: 1, reviews: { [cardIds[0]]: review } });
      assert.deepEqual(parseKnowledgeReviewStore(raw, cardIds).reviews, { [cardIds[0]]: review });
    }
  }
});

test('knowledge review parser rejects missing, mistyped and unsupported versions', () => {
  for (const version of [undefined, null, '1', true, 0, -1, 2, 1.5, {}, []]) {
    const raw = JSON.stringify({ version, reviews: { [cardIds[0]]: validReview } });
    assert.deepEqual(parseKnowledgeReviewStore(raw, cardIds), { version: 1, reviews: {} }, `version = ${JSON.stringify(version)}`);
  }
});

test('knowledge review parser rejects malformed roots and review containers', () => {
  for (const raw of [null, '', 'null', 'false', '1', '"store"', '[]', '{}']) {
    assert.deepEqual(parseKnowledgeReviewStore(raw, cardIds), { version: 1, reviews: {} }, String(raw));
  }
  for (const reviews of [undefined, null, false, 1, 'reviews', []]) {
    assert.deepEqual(parseKnowledgeReviewStore(JSON.stringify({ version: 1, reviews }), cardIds), { version: 1, reviews: {} });
  }
});

test('knowledge review parser rejects unsafe or malformed IDs even when supplied as available', () => {
  const invalidIds = ['__proto__', 'prototype', 'constructor', 'ST36', 'point:ST36:invented', 'point::location', 'point:ST 36:location', 'anatomy:heart:invented', 'anatomy::zh-to-en', 'exam:', `exam:${'A'.repeat(64)}`, `exam:${'a'.repeat(63)}`];
  const reviews = Object.fromEntries([...invalidIds.map((id) => [id, validReview]), [examId, validReview]]);
  assert.deepEqual(parseKnowledgeReviewStore(JSON.stringify({ version: 1, reviews }), [...cardIds, ...invalidIds]).reviews, { [examId]: validReview });
});

test('knowledge review storage uses its own key and ignores non-card or unavailable IDs', () => {
  assert.equal(KNOWLEDGE_REVIEW_KEY, 'jingwei-knowledge-cards:v1');
  const store = parseKnowledgeReviewStore(JSON.stringify({
    version: 1,
    reviews: {
      'point:ST36:location': { due: 10, interval: 1, repetitions: 2, lapses: 0, lastRating: 'good', lastReviewed: 4 },
      LI4: { due: 10, interval: 1, repetitions: 2, lapses: 0, lastRating: 'good', lastReviewed: 4 },
      'point:missing:location': { due: 10, interval: 1, repetitions: 2, lapses: 0, lastRating: 'good', lastReviewed: 4 },
    },
  }), cardIds);
  assert.deepEqual(store.reviews, {
    'point:ST36:location': { due: 10, interval: 1, repetitions: 2, lapses: 0, lastRating: 'good', lastReviewed: 4 },
  });
});

test('knowledge review parser rejects malformed state and cannot change the old point store fixture', () => {
  const legacyRaw = JSON.stringify({ version: 1, reviews: { LI4: { due: 5, interval: 1, repetitions: 1, lapses: 0, lastRating: 'good', lastReviewed: 1 } }, favorites: ['LI4'], course: { name: '旧课', pointIds: ['LI4'], notes: {} }, attempts: 1, correct: 1 });
  const before = parseStore(legacyRaw, ['LI4']);
  assert.deepEqual(parseKnowledgeReviewStore('{broken', cardIds), { version: 1, reviews: {} });
  assert.deepEqual(parseKnowledgeReviewStore(legacyRaw, cardIds), { version: 1, reviews: {} });
  assert.deepEqual(parseStore(legacyRaw, ['LI4']), before);
  assert.notDeepEqual(before, emptyStore());
});

test('knowledge review queue and rating use schedule semantics without mutating the old store', () => {
  const available = new Set(cardIds);
  const first = rateKnowledgeCard({ version: 1, reviews: {} }, 'point:ST36:location', 'again', available, 0);
  assert.equal(first.reviews['point:ST36:location'].due, 600000);
  assert.deepEqual(knowledgeReviewQueue([...cardIds, 'exam:', 'point:ST36:invented'], first.reviews, 100), ['anatomy:mesh-heart:zh-to-en', examId]);
  assert.deepEqual(rateKnowledgeCard(first, 'exam:', 'good', available, 1), first);
  assert.deepEqual(rateKnowledgeCard(first, 'point:ST36:invented', 'good', available, 1), first);
  assert.deepEqual(rateKnowledgeCard(first, 'anatomy:missing:zh-to-en', 'good', available, 1), first);
});
