# Task 1 implementation report

Status: DONE_WITH_CONCERNS — implementation and automated checks complete; parent browser acceptance remains required.

## Changes

- Added the <=680px workspace policy. Phone cards/course/cases place the keyed learning panel first and do not mount AtlasScene until explicitly expanded. Exam never mounts the scene at any width.
- Keyed task/model siblings change DOM order without remounting the learning panel on ordinary resize; no store keys, records, question data or medical content changed.
- Mode changes reset temporary expansion, focus, filters and panels, and scroll to the new beginning. Model controls use neutral wording for concealed cards; unmapped-point captions also respect concealment.
- Phone anatomy controls, chosen-part summary and collapsible continuous slider are in normal flow. Details/catalogue are closable full-height phone drawers and mutually exclusive. Application model focus offers a visible exit/Escape and restores prior body overflow and page scroll.
- Added phone quiz prompt near the model and an explicit selected-point details jump in explore. Added readable phone typography, 44px primary controls, compact no-wrap brand, retained Emily link/navigation, safe areas, search-first anatomy catalogue, collapsed native system filters and independently scrolling results.
- Scene mount resets progress/error. Retry remounts the scene (or retries metadata) without reloading the application. Existing unmount cleanup still cancels RAF, disconnects resize observation and disposes geometry, materials, textures, renderer and overlays.
- Extracted the existing three-worker scheduler into app/model-download.ts, a narrow lifecycle dependency beyond the initial listed UI files. Aborted sessions never schedule more chunks; failed chunks abort sibling requests. Decode completion checks the same abort state before allocating GPU resources. No buffer cache added.

## RED / GREEN

1. `node --experimental-strip-types --test tests/mobile-layout.test.ts`: RED for missing policy module; GREEN after actual policy implementation (1 test, 10 hand-derived mode/viewport cases).
2. `node --experimental-strip-types --test tests/model-download-workers.test.ts`: initial missing-export RED; extracted the old scheduler unchanged and reran for behavioral RED: all 3 tests failed (scheduled chunks 3–7 after abort, ran a pre-aborted session, did not abort on failure). GREEN after cancellation/error logic (3/3).
3. `node --experimental-strip-types --test tests/mobile-layout.test.ts tests/model-download-workers.test.ts`: 4/4 pass.

## Final verification

- `npm test`: 64/64 pass (baseline 60 plus 4 new tests).
- `npm run check`: pass. An intermediate test assertion narrowed an empty array to never[]; changed the empty assertion to length, then reran successfully.
- `npm run build`: pass. Existing >500kB bundle warning remains; final emitted assets index-CxY8_y__.css and index-oH8zg6gy.js.
- `node scripts/validate-interactions.mjs`: pass for packing, search/inspection, tap/drag/multitouch, cancellation and empty view.
- `git diff --check`: pass.

## Self-review and remaining browser evidence

Reviewed keyed sibling identity, exam scene gating, anonymous identify-card headings/toggles, stale error reset, worker scheduling after cancellation, normal-flow phone controls, drawer close exclusivity and focus cleanup. No user records or data files mutated. Preserved unrelated dirty handoff/doc files.

Parent must verify rebuilt dist across all seven modes at 320×568, 375×844, 390×844, 430×844, tablet 768 and desktop 1280/1512. Specifically check long questions, flipped cards and draft course/case state across resize/model expand-collapse; 0–100 slider and keyboard access; catalogue filtering/pagination/selection/search while results scroll; detail drawer exclusivity; focus exit/Escape and restoration; model canvas disappearance on collapse/exam and remount/retry behavior. Runtime GPU/observer teardown remains a browser acceptance item (unit coverage proves scheduler cancellation, not WebGL teardown). No shared browser operated and no actual phone testing claimed. Medical source/coordinate/explanation gaps remain the parent's separate deliverable.
