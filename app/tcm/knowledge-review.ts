import { scheduleReview, type Rating, type Review } from './study.ts';
import type { KnowledgeDeck } from './knowledge-cards.ts';

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

/** Preserve validated raw records for decks whose complete ID list is not known yet.
 * The returned payload is for persistence only: unresolved records never become
 * current review state or expand the available IDs accepted by rateKnowledgeCard.
 */
export function mergeKnowledgeReviewForPersistence(
  raw: string | null,
  current: KnowledgeReviewStore,
  knownCardIds: ReadonlySet<string>,
  unresolvedDecks: ReadonlySet<KnowledgeDeck>,
): KnowledgeReviewStore {
  const retainedIds = new Set(knownCardIds);
  try {
    const parsed: unknown = JSON.parse(raw ?? 'null');
    if (parsed && typeof parsed === 'object' && 'reviews' in parsed && parsed.reviews && typeof parsed.reviews === 'object') {
      for (const id of Object.keys(parsed.reviews)) {
        if (!isKnowledgeCardId(id)) continue;
        const deck: KnowledgeDeck = id.startsWith('exam:') ? 'exam-wrong'
          : id.startsWith('anatomy:') ? 'anatomy'
          : id.endsWith(':effects') ? 'point-effects' : 'point';
        if (unresolvedDecks.has(deck)) retainedIds.add(id);
      }
    }
  } catch { /* The shared parser below handles malformed storage. */ }
  const saved = parseKnowledgeReviewStore(raw, [...retainedIds]);
  const verifiedCurrent = parseKnowledgeReviewStore(JSON.stringify(current), [...knownCardIds]);
  return { version: 1, reviews: { ...saved.reviews, ...verifiedCurrent.reviews } };
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
