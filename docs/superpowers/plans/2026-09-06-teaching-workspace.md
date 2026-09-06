# Teaching Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Remove the exposed body-surface view and make the acupoint catalogue large, adjustable, and readable.

**Architecture:** Extract display policy and catalogue layout bounds into small pure modules, apply them at scene and UI boundaries, and keep existing learning state untouched. Add pointer/keyboard resizing at the catalogue edge and a reading expansion state; collapse long filters without hiding search or counts.

**Tech Stack:** React19, TypeScript, Three.js, CSS, node:test, existing browser preview.

## Global Constraints

- Work in the existing codex/tcm-learning-atlas checkout; preserve unrelated changes and all original geometry.
- Preserve local learning records and the warm ivory/brown palette.
- Preserve continuous explosion0–100 and anatomy panels hidden by default.
- Do not invent medical facts, placements, quiz items, or claim professional review.
- No package additions. Do not clear or seed localStorage. Do not change question-bank or terminology data in this task.

### Task 1: Teaching display and readable catalogue

**Files:**
- Create `app/tcm/teaching-display.ts`, `app/tcm/catalogue-layout.ts`, `app/tcm/CatalogueResizeHandle.tsx`.
- Modify `app/tcm/TcmApp.tsx`, `app/tcm/AtlasScene.tsx`, `app/tcm/tcm.css`.
- Test `tests/teaching-display.test.ts`, `tests/catalogue-layout.test.ts`.

**Interfaces:**
- Consumes existing Layer/SystemId, catalogue sidebar markup and scene visibility pipeline.
- Produces `teachingSystems(ids: SystemId[]): SystemId[]` filtering only integumentary; use at the scene rendering boundary to prevent exposed Skin rendering while preserving its geometry for depth projection.
- Produces `catalogueWidth(requested: number, viewportWidth: number): number`, clamp between260 and min520/40%viewport (lower bound260 on sufficiently wide desktop); finite invalid requests fall back320. Pointer and keyboard changes use this helper.
- Produces `CatalogueResizeHandle` with current width and onWidth callback; labelled ARIA separator, keyboard arrows adjust16px, Home/End bounds; pointer capture to track drag and release on cancel/up.

- [ ] Step1: Write failing tests using literal expected results and real functions. Tests catch leaked skin and unbounded resize, not source-text changes.
```ts
assert.deepEqual(teachingSystems(['skeletal','integumentary','muscular']), ['skeletal','muscular']);
assert.deepEqual(teachingSystems(['reproductive']), ['reproductive']);
assert.equal(catalogueWidth(100,1440),260);
assert.equal(catalogueWidth(900,1440),520);
assert.equal(catalogueWidth(Number.NaN,1440),320);
assert.equal(catalogueWidth(400,1000),400);
```
- [ ] Step2: Run `node --experimental-strip-types --test tests/teaching-display.test.ts tests/catalogue-layout.test.ts`; confirm expected failures before implementation.
- [ ] Step3: Implement policy. Only muscle/skeleton/neuro remain selectable teaching layers; remove surface/transparent entry buttons and normalize any obsolete layer choice to muscle. Anatomy default visible systems exclude integumentary and reproductive; reproductive remains explicitly selectable in anatomy catalogue. Skin must remain invisible even if an old catalogue toggle requests it. Retain source data and skin projection for existing markers. Do not hide all organs or remove mesh data.
```ts
export const teachingSystems = (ids: SystemId[]) => ids.filter(id => id !== 'integumentary');
export function catalogueWidth(requested: number, viewportWidth: number) {
  const maximum = Math.max(260, Math.min(520, viewportWidth * .4));
  return Math.max(260, Math.min(maximum, Number.isFinite(requested) ? requested : 320));
}
```
- [ ] Step4: Implement catalogue UI with `filtersOpen=false`, `catalogueExpanded=false`, and `sidebarWidth=320`. Keep search, catalogue count and filters toggle above the scroll list. Group scope/region/tag/meridian selectors into a collapsible section; selected filters still apply when collapsed and show a compact active-filter summary. Compact rows to~48px, list flex1/min-height0/overflowauto; footer must never overlay rows. Collapsed filters allow >=4 visible rows at desktop1280×720.
```tsx
<button aria-expanded={filtersOpen} onClick={()=>setFiltersOpen(v=>!v)}>筛选条件</button>
<button aria-pressed={catalogueExpanded} onClick={()=>setCatalogueExpanded(v=>!v)}>{catalogueExpanded?'退出放大':'放大目录'}</button>
```
Desktop >=1100px: use CSS variable for first grid column, handle between catalogue and canvas. Re-clamp after viewport resize. Expanded catalogue is an overlay within workspace, width min760px/calc100%-32px and full available height; other mode switching closes expansion. <=900px existing drawer behavior remains with clear close button; no horizontal overflow, handle not shown. Expanded mode must not trap the user with its close control scrolled away. Search and close stay accessible.
- [ ] Step5: Run focused tests GREEN, TypeScript, full suite/build and diff check. Browser inspect0/37/100 slider, no body-surface buttons, directory collapse and expansion, keyboard resize, list scroll and selection, return between anatomy and TCM, mobile/narrow if available. Record unavailable checks honestly. Main agent handles browser, implementer must not share browser control.
- [ ] Step6: Commit only task-owned files, write report with RED/GREEN evidence, run independent task review and fix important findings before declaring complete.
