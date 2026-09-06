export type Rating = "again" | "hard" | "good";
export interface Review {
  due: number;
  interval: number;
  repetitions: number;
  lapses: number;
  lastRating: Rating;
  lastReviewed: number;
}
export interface Course {
  name: string;
  pointIds: string[];
  notes: Record<string, string>;
}
export interface StudyStore {
  version: 1;
  reviews: Record<string, Review>;
  favorites: string[];
  course: Course;
  attempts: number;
  correct: number;
}
export const STORE_KEY = "human-atlas-tcm:v1";
export const emptyStore = (): StudyStore => ({
  version: 1,
  reviews: {},
  favorites: [],
  course: { name: "我的经络课", pointIds: [], notes: {} },
  attempts: 0,
  correct: 0,
});
export function scheduleReview(
  previous: Review | undefined,
  rating: Rating,
  now = Date.now(),
): Review {
  const interval =
    rating === "again"
      ? 0
      : rating === "hard"
        ? 1
        : previous?.lastRating === "good"
          ? Math.min(60, Math.max(3, previous.interval * 2))
          : 1;
  return {
    due: now + (rating === "again" ? 10 * 60 * 1000 : interval * 86400000),
    interval,
    repetitions: (previous?.repetitions ?? 0) + 1,
    lapses: (previous?.lapses ?? 0) + (rating === "again" ? 1 : 0),
    lastRating: rating,
    lastReviewed: now,
  };
}
export function parseStore(raw: string | null, knownIds: string[]): StudyStore {
  const base = emptyStore();
  if (!raw) return base;
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1) return base;
    const known = new Set(knownIds),
      ids = (v: unknown) =>
        Array.isArray(v)
          ? [...new Set(v.filter((id): id is string => typeof id === "string" && known.has(id)))]
          : [];
    base.favorites = ids(value.favorites);
    if (value.reviews && typeof value.reviews === "object")
      for (const [id, r] of Object.entries(value.reviews) as [string, Review][]) {
        if (
          known.has(id) &&
          r &&
          [r.due, r.interval, r.repetitions, r.lapses, r.lastReviewed].every(
            (n) => Number.isFinite(n) && n >= 0,
          ) &&
          ["again", "hard", "good"].includes(r.lastRating)
        )
          base.reviews[id] = r;
      }
    if (value.course && typeof value.course === "object") {
      base.course.name =
        typeof value.course.name === "string" ? value.course.name.slice(0, 80) : base.course.name;
      base.course.pointIds = ids(value.course.pointIds);
      if (value.course.notes && typeof value.course.notes === "object")
        for (const [id, note] of Object.entries(value.course.notes))
          if (known.has(id) && typeof note === "string")
            base.course.notes[id] = note.slice(0, 5000);
    }
    base.attempts =
      Number.isSafeInteger(value.attempts) && value.attempts >= 0 ? value.attempts : 0;
    base.correct =
      Number.isSafeInteger(value.correct) && value.correct >= 0
        ? Math.min(value.correct, base.attempts)
        : 0;
    return base;
  } catch {
    return base;
  }
}
export function reviewQueue(
  ids: string[],
  reviews: Record<string, Review>,
  now = Date.now(),
): string[] {
  return ids
    .filter((id) => !reviews[id] || reviews[id].due <= now)
    .sort((a, b) => (reviews[a]?.due ?? 0) - (reviews[b]?.due ?? 0));
}
export function ratePoint(
  store: StudyStore,
  id: string,
  rating: Rating,
  now = Date.now(),
): StudyStore {
  return {
    ...store,
    reviews: { ...store.reviews, [id]: scheduleReview(store.reviews[id], rating, now) },
  };
}
export function nextId(ids: string[], current: string): string | undefined {
  return ids.length ? ids[(ids.indexOf(current) + 1) % ids.length] : undefined;
}
