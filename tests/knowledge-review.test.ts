import assert from 'node:assert/strict';
import test from 'node:test';

import { emptyStore, parseStore } from '../app/tcm/study.ts';
import {
  KNOWLEDGE_REVIEW_KEY,
  knowledgeReviewQueue,
  parseKnowledgeReviewStore,
  rateKnowledgeCard,
} from '../app/tcm/knowledge-review.ts';

const cardIds = ['point:ST36:location', 'anatomy:mesh-heart:zh-to-en', 'exam:q-card'];

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
  const first = rateKnowledgeCard({ version: 1, reviews: {} }, 'point:ST36:location', 'again', 0);
  assert.equal(first.reviews['point:ST36:location'].due, 600000);
  assert.deepEqual(knowledgeReviewQueue(cardIds, first.reviews, 100), ['anatomy:mesh-heart:zh-to-en', 'exam:q-card']);
  assert.deepEqual(rateKnowledgeCard(first, 'LI4', 'good', 1), first);
});
