import assert from "node:assert/strict";
import test from "node:test";

import { teachingSystems } from "../app/tcm/teaching-display.ts";

test("teaching display never exposes the integumentary system", () => {
  assert.deepEqual(teachingSystems(["skeletal", "integumentary", "muscular"]), [
    "skeletal",
    "muscular",
  ]);
  assert.deepEqual(teachingSystems(["reproductive"]), ["reproductive"]);
});
