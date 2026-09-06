import { scheduleReview, type Rating, type Review } from './study.ts';

export const KNOWLEDGE_REVIEW_KEY = 'jingwei-knowledge-cards:v1';

export type KnowledgeReviewStore = { version: 1; reviews: Record<string, Review> };

const emptyKnowledgeReviewStore = (): KnowledgeReviewStore => ({ version: 1, reviews: {} });
const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);
const ratings: readonly Rating[] = ['again', 'hard', 'good'];

/** The only persistence IDs emitted by the four knowledge-card builders. */
export function isKnowledgeCardId(id: string): boolean {
  return /^point:[^:\s]+:(?:location|meridian|tags|identify|effects)$/.test(id)
    || /^anatomy:[^:\s]+:(?:zh-to-en|en-to-zh)$/.test(id)
    || /^exam:[a-f0-9]{64}$/.test(id);
}

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
    const available = new Set(availableCardIds.filter(isKnowledgeCardId));
    for (const [id, review] of Object.entries(value.reviews as Record<string, unknown>)) {
      if (unsafeKeys.has(id) || !available.has(id) || !isKnowledgeCardId(id) || !isReview(review)) continue;
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
  return [...new Set(cardIds.filter(isKnowledgeCardId))]
    .filter((id) => !reviews[id] || reviews[id].due <= now)
    .sort((left, right) => (reviews[left]?.due ?? 0) - (reviews[right]?.due ?? 0));
}

/** Legacy point IDs are intentionally ignored so this store cannot rate the old point deck. */
export function rateKnowledgeCard(
  store: KnowledgeReviewStore,
  cardIdValue: string,
  rating: Rating,
  availableCardIds: ReadonlySet<string>,
  now = Date.now(),
): KnowledgeReviewStore {
  if (!isKnowledgeCardId(cardIdValue) || !availableCardIds.has(cardIdValue)) return store;
  return {
    ...store,
    reviews: { ...store.reviews, [cardIdValue]: scheduleReview(store.reviews[cardIdValue], rating, now) },
  };
}
