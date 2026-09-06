import { scheduleReview, type Rating, type Review } from './study.ts';

export const KNOWLEDGE_REVIEW_KEY = 'jingwei-knowledge-cards:v1';

export type KnowledgeReviewStore = { version: 1; reviews: Record<string, Review> };

const emptyKnowledgeReviewStore = (): KnowledgeReviewStore => ({ version: 1, reviews: {} });
const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);
const cardId = /^(?:point|anatomy|exam):/;
const ratings: readonly Rating[] = ['again', 'hard', 'good'];

function isReview(value: unknown): value is Review {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const review = value as Record<string, unknown>;
  return [review.due, review.interval, review.repetitions, review.lapses, review.lastReviewed]
    .every((number) => typeof number === 'number' && Number.isFinite(number) && number >= 0)
    && ratings.includes(review.lastRating as Rating);
}

/** Parses only the separate namespaced-card payload; it never interprets the legacy point store. */
export function parseKnowledgeReviewStore(
  raw: string | null,
  availableCardIds: readonly string[],
): KnowledgeReviewStore {
  const store = emptyKnowledgeReviewStore();
  if (!raw) return store;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return store;
    const value = parsed as Record<string, unknown>;
    if (value.version !== 1 || !value.reviews || typeof value.reviews !== 'object' || Array.isArray(value.reviews)) return store;
    const available = new Set(availableCardIds.filter((id) => cardId.test(id)));
    for (const [id, review] of Object.entries(value.reviews as Record<string, unknown>)) {
      if (unsafeKeys.has(id) || !available.has(id) || !cardId.test(id) || !isReview(review)) continue;
      store.reviews[id] = { ...review };
    }
    return store;
  } catch {
    return store;
  }
}

export function knowledgeReviewQueue(
  cardIds: readonly string[],
  reviews: Record<string, Review>,
  now = Date.now(),
): string[] {
  return [...new Set(cardIds.filter((id) => cardId.test(id)))]
    .filter((id) => !reviews[id] || reviews[id].due <= now)
    .sort((left, right) => (reviews[left]?.due ?? 0) - (reviews[right]?.due ?? 0));
}

/** Legacy point IDs are intentionally ignored so this store cannot rate the old point deck. */
export function rateKnowledgeCard(
  store: KnowledgeReviewStore,
  cardIdValue: string,
  rating: Rating,
  now = Date.now(),
): KnowledgeReviewStore {
  if (!cardId.test(cardIdValue)) return store;
  return {
    ...store,
    reviews: { ...store.reviews, [cardIdValue]: scheduleReview(store.reviews[cardIdValue], rating, now) },
  };
}
