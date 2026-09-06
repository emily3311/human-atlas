# Back and Brain Terminology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Replace 44 unresolved mesh labels using 22 exact, source-checked terminology cores.

**Architecture:** Add only exact ANATOMY_TERMS entries consumed by existing anatomyZh/anatomyNameEvidence. Existing left/right parsing and pending-name fallback remain unchanged.

**Tech Stack:** TypeScript, node:test, existing anatomy model metadata.

## Global Constraints

- Use only the 22 rows in `docs/anatomy-back-brain-evidence-2026-09-06.md`, which the parent has visually checked against source PDF pages.
- Do not modify UI, anatomy-zh parsing rules, model assets, source answers, point coordinates or user records.
- Do not copy source definitions; store the term, entry number and direct PDF page URL only. Describe this as source correspondence, not professional medical review.
- Preserve unrelated changes; existing live checkout on codex/tcm-learning-atlas.

### Task 1: Add source-checked exact name mappings

**Files:** Modify `app/tcm/anatomy-terms.ts`; create `tests/anatomy-back-brain.test.ts`. Parent owns source evidence document; include it in this scoped commit.

**Interfaces:** Existing `ANATOMY_TERMS: Record<string, AnatomyTerm>` and `anatomyZh(name)`, `anatomyNameEvidence(name)`, `anatomyNameCoverage(parts)` remain stable.

- [x] Add table-driven tests with literal expected English and Chinese pairs from the evidence table, not expectations derived from production data. For each row exercise `anatomyZh('Left '+core)` and `anatomyZh('Right '+core)`, and assert source evidence has the exact page and term ID. Include hand-derived distinctions:

```ts
assert.equal(anatomyZh('Left precentral gyrus'), '左中央前回');
assert.equal(anatomyZh('Right postcentral gyrus'), '右中央后回');
assert.equal(anatomyZh('Left inferior frontal gyrus branch'), 'Left inferior frontal gyrus branch');
```

- [x] Run `node --experimental-strip-types --test tests/anatomy-back-brain.test.ts` before changing production mapping; expect untranslated English vs Chinese assertion failures.
- [x] Add a small helper if useful:

```ts
const sourcedDirect = (zh: string, english: string, entry: string, page: number): AnatomyTerm => ({
  zh,
  source: `${MAINLAND_TERMS}#page=${page}`,
  sourceTerm: `${entry}: ${zh} / ${english}`,
  note: '已核对原文条目与图谱名称；属于来源对应核查，未宣称专业审校。',
});
```

Add all 22 exact entries using the evidence table. No new fuzzy/suffix/generalized anatomical grammar. Test actual source IDs per core by parsing public/models/atlas.json and confirm each selected pair occurs; overall coverage should increase from548to592 (remaining1642), but compute and report real counts instead of changing unrelated historical test baselines.

- [x] Rerun focused tests then `npm test`, `npm run check`, `git diff --check`; record RED/GREEN and actual coverage. Parent will rebuild and browser verify representative terms after review.
- [x] Commit mapping/test/evidence only. Write full report to the provided SDD workspace with command outputs, changed files, evidence basis and remaining limitations. Do not claim all Chinese names are finished.
