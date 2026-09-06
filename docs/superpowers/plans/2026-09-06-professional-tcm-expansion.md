# Professional TCM Atlas Expansion Implementation Plan

> **For agentic workers:** Use subagent-driven-development for the independently owned scene task and reviews; controller handles catalogue integration. User approved expanding the learning library for physician trainees and explicitly requires original exploded anatomy and structure names integrated with TCM learning.

**Goal:** Restore the original exploded anatomy experience inside the Chinese workbench, expand standard-based acupoint lookup, and clearly separate exam scope from approximate 3D coverage.

**Architecture:** Reuse original GPU-batched per-part offsets and packing layout. Keep anatomy and TCM as modes in one interface, sharing selection. Standard point facts are imported as a separate typed dataset, merged with existing richer point notes; unsupported 3D points are not fabricated. Map the official 2025 syllabus used in 2026 as an independently cited list.

**Tech Stack:** React, TypeScript, Three.js, Node tests, local JSON/TypeScript data. No new app dependencies.

## Global Constraints

- Work only in human-atlas-tcm on codex/tcm-learning-atlas; preserve prior progress and original English explorer.
- Preserve BodyParts3D and upstream attribution.
- Do not remove original structure picking, isolated viewing, exploded layout, or English fallback names.
- During explosion and isolated anatomy, hide all acupoint markers, routes and proportional guides. Restore only on reassembly.
- The 39 existing placements are approximate. New factual records without calibrated coordinates must not receive arbitrary positions.
- Do not claim that catalogue completeness means complete clinical content, medically calibrated 3D, or full exam preparation coverage.
- Unverified traditional-use/classification text is not authoritative exam answer evidence. No fabricated teacher review, official questions or frequency statistics.
- Independent surface picture is optional; retain switchable skin, transparent, muscles, bone and neurovascular views.

### Task 1: Integrated exploded anatomy scene

**Files:** Modify app/tcm/AtlasScene.tsx; create app/tcm/anatomy-explosion.ts and tests/anatomy-explosion.test.ts only if useful to isolate pure per-part math. Do not edit TcmApp.tsx, tcm.css, data.ts, or other application files; controller owns UI integration.

**Interfaces:** Extend SceneOptions with optional `explode?: number` (0..1), `visibleSystems?: SystemId[]` (override presets in anatomy mode), `anatomyLabels?: boolean` (hover/selection labels; default true). Preserve existing Props callbacks. Parent will add one-click explode/reset, anatomy system filters and search. Use `partName` (inspect actual export in anatomy-zh.ts) or existing name translator for Chinese + English labels. No need for every label visible simultaneously: hover/tap each part must show its name as in upstream.

- [ ] Write a failing behavior test for offset endpoints (zero preserves original position; full spread reaches packed cell), overlay eligibility at nonzero explosion, and selected-part translated bounds if extracting math. Use real original createExplosionLayout and known simple bounds, not source text assertions.
- [ ] Reuse app/explosion-layout.ts and original app/scene.tsx approach: vertex partIndex + float DataTexture offsets with batching. Update pickers with exactly the same transforms. Do not create 2234 visible drawcalls. Preserve highlights using translated positions.
- [ ] Smoothly interpolate explosion, fit packed grid on desktop/mobile aspect changes, disable orbit/autorotate in full grid in favor of pan, and retain independent zoom. Enforce reduced-motion if user prefers it.
- [ ] Show Chinese/English structure hover name; clicking every visible part reports the actual Part through onPart. Reuse projected-cell fallback targeting for tiny packed structures as original does.
- [ ] Surface projection uses unshifted skin before explosion; markers/routes/guides stay hidden through transition and until amount returns approximately zero. Picking in anatomy mode ignores skin when solid visible structures exist.
- [ ] Preserve all existing modes, local focus, isolated structure framing, error reporting, cleanup and abort behavior. Dispose textures and DOM labels.
- [ ] Run focused tests, npm test and npm run check. Commit only owned files and write task report with red/green evidence.

### Task 2: Standard catalogue and exam mapping

**Files:** Create scripts/extract-standard-points.py, app/tcm/standard-points.ts, app/tcm/catalogue.ts, app/tcm/exam-scope.ts, tests/catalogue.test.ts. Modify data.ts/types.ts only to expose existing curated records and source status; preserve IDs/local storage compatibility.

- [ ] Extract chapter 5 of the downloaded GB/T12346—2021 PDF to facts: id, Chinese name, pinyin, meridian, body region, location, section and PDF page. Stop at appendices; validate 362 unique sequential IDs with per-meridian counts 11/20/45/21/9/19/67/27/9/23/44/14/29/24. Do not include duplicate chapter3 reference points.
- [ ] Write failing tests for complete coverage, GV24+ 印堂 (verified in source section5.13.25, not GV29), preserving original39 rich notes, rejecting model quizzes without a placement, and exam list references resolving to real entries. The督脉 has GV1–GV28 plus GV24+; section ordinal is not the acupoint code.
- [ ] Use extracted location facts and explicit source-page links. New records do not invent traditional functions, classifications, anatomy-keywords or landmark instructions: represent absence, show pending states, and allow location/meridian study only.
- [ ] Map exact official practical-skills acupoint list after researching actual2025 PDF. Any required extra points outside362 are separate entries with verified standard facts or clearly source-linked pending location, never guessed.
- [ ] Keep official syllabus designation separate from knowledge verification and 3D coverage. Question pools only include records whose answer fields exist; no pending text as quiz answers.

### Task 3: User interface, integration and delivery

**Files:** Modify TcmApp.tsx, StudyPanel.tsx, tcm.css, README-TCM.md and tests. Create AnatomyPanel.tsx and content coverage helper as needed.

- [ ] Add integrated 解剖图谱 mode with original-system visibility, complete structure search, Chinese/English selected name, one-click scatter/reassemble and isolated viewing. Existing body-layer presets remain in TCM mode.
- [ ] Add catalogue-scope switch: all standard points, official practical-skills set, existing3D demonstration points. Show separate counts and a clear unavailable3D card for a selected point lacking coordinates. Never keep a different point's marker as if it represented the selected entry.
- [ ] Make flashcards retain location/meridian question types for full verified fact library; unavailable classification or image questions explain why and switch to valid question type without phantom scoring. Preserve queued feedback and user notes.
- [ ] Actual CUA checks: explosion/reassembly, hover/click structure names, structure search/isolate, full-catalogue search for a previously missing point, official exam subset filtering, missing3D state, flip cards, review navigation, desktop/mobile. Do not mutate local storage by script.
- [ ] Run npm test, check, build, atlas/interactions/static-server validators. Independent review task1 and whole change; fix important findings, document actual completeness and remaining clinical calibration. Leave updated localhost:3016 running and open.
