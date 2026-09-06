import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyStore,
  parseStore,
  ratePoint,
  reviewQueue,
  scheduleReview,
  nextId,
  quizDisplayIds,
} from "../app/tcm/study.ts";
test("spaced practice repeats lapses in ten minutes, grows only after good recall", () => {
  const a = scheduleReview(undefined, "again", 100);
  assert.equal(a.due, 600100);
  assert.equal(a.lapses, 1);
  const b = scheduleReview(a, "good", 100);
  assert.equal(b.interval, 1);
  const c = scheduleReview(b, "good", 100);
  assert.equal(c.interval, 3);
  const d = scheduleReview(c, "hard", 100);
  assert.equal(d.interval, 1);
  assert.equal(scheduleReview(d, "good", 100).interval, 1);
});
test("due queue excludes future cards, includes unseen cards, no mutation", () => {
  const a = emptyStore(),
    b = ratePoint(a, "LI4", "again", 0);
  assert.deepEqual(a.reviews, {});
  assert.deepEqual(reviewQueue(["LI4", "ST36"], b.reviews, 100), ["ST36"]);
  assert.deepEqual(reviewQueue(["LI4", "ST36"], b.reviews, 600000), ["ST36", "LI4"]);
});
test("malformed/foreign persisted state recovers and validates every imported field", () => {
  assert.deepEqual(parseStore("{", []), emptyStore());
  assert.deepEqual(parseStore('{"version":2}', []), emptyStore());
  const result = parseStore(
    JSON.stringify({
      version: 1,
      reviews: { LI4: { due: -1 }, unknown: scheduleReview(undefined, "good") },
      favorites: ["LI4", "LI4", "bad"],
      course: { name: 12, pointIds: ["bad", "ST36"], notes: { LI4: "笔记", bad: "wrong" } },
      attempts: 2,
      correct: 20,
    }),
    ["LI4", "ST36"],
  );
  assert.deepEqual(result.reviews, {});
  assert.deepEqual(result.favorites, ["LI4"]);
  assert.equal(result.correct, 2);
  assert.deepEqual(result.course.pointIds, ["ST36"]);
  assert.deepEqual(result.course.notes, { LI4: "笔记" });
});
test("empty and filtered card navigation does not produce phantom points", () => {
  assert.equal(nextId([], "LI4"), undefined);
  assert.equal(nextId(["ST36"], "LI4"), "ST36");
  assert.equal(nextId(["LI4", "ST36"], "ST36"), "LI4");
});

test("answered review target stays visible without making scheduled cards due again", () => {
  assert.deepEqual(quizDisplayIds([], "ST36", "LI4"), ["ST36"]);
  assert.deepEqual(quizDisplayIds(["LI4"], "ST36", "LI4"), ["ST36", "LI4"]);
  assert.deepEqual(quizDisplayIds(["LI4"], "ST36", null), ["LI4"]);
});
