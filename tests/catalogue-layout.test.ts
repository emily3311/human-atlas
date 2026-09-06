import assert from "node:assert/strict";
import test from "node:test";

import { catalogueWidth, nextCatalogueExpansion } from "../app/tcm/catalogue-layout.ts";

test("catalogue width remains readable without consuming the workspace", () => {
  assert.equal(catalogueWidth(100, 1440), 260);
  assert.equal(catalogueWidth(900, 1440), 520);
  assert.equal(catalogueWidth(Number.NaN, 1440), 320);
  assert.equal(catalogueWidth(400, 1000), 400);
});

test("changing learning modes always closes the expanded catalogue", () => {
  assert.equal(nextCatalogueExpansion(true, "mode-change"), false);
  assert.equal(nextCatalogueExpansion(false, "toggle"), true);
});
