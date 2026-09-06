# Mobile Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the approved phone layout and avoid forcing hidden 3D downloads, without changing medical data or user records.

**Architecture:** A small pure mobile-layout policy derives task priority and scene mounting from mode, viewport and explicit model expansion. TcmApp consumes it; focused CSS supplies normal-flow phone controls and application-level model focus. AnatomyCatalogue owns its collapsed filters and independent results scroller. Existing AtlasScene cleanup aborts downloads and disposes GPU resources when unmounted.

**Tech Stack:** React 19, TypeScript, Three.js, CSS, node:test, existing Vite build and CUA browser verification.

## Global Constraints

- Preserve 0–100% continuous explosion, structure picking/isolation, Chinese-first labels, desktop usability, cream/orange/brown palette and Emily AI links.
- Do not change StudyStore storage keys or user records. Do not invent medical names, point coordinates or question explanations.
- No dependency additions, public deployment or network binding changes.
- All mutations use apply_patch. Preserve existing uncommitted handoff files. Work in the existing codex/tcm-learning-atlas checkout used by the approved live preview.
- Phone verification covers 320×568, 375×844, 390×844 and 430×844; tablet 768 and desktop 1280/1512. No claim of actual phone testing.

### Task 1: Mobile workspace and on-demand scene lifecycle

**Files:**
- Create: `app/tcm/mobile-layout.ts`, `app/tcm/mobile.css`, `tests/mobile-layout.test.ts`.
- Modify: `app/tcm/TcmApp.tsx`, `app/tcm/AnatomyPanel.tsx`, and only if lifecycle requires it `app/tcm/AtlasScene.tsx`.
- Existing CSS `app/tcm/tcm.css` may be amended to remove overlapping obsolete mobile rules; no unrelated redesign.

**Interfaces:**
- `type LearningMode = 'anatomy' | 'explore' | 'cards' | 'quiz' | 'course' | 'cases' | 'exam'`.
- `workspacePolicy(mode: LearningMode, mobile: boolean, expanded: boolean): { taskFirst: boolean; showModel: boolean }`.
- Mobile means width <=680, consistent with the existing single-column breakpoint. taskFirst true only on mobile cards/course/cases. showModel false for exam on every width; mobile task-first shows model only when expanded; other modes show it.

- [x] Step 1: Add failing tests for the real policy, including this hand-derived table. Run `node --experimental-strip-types --test tests/mobile-layout.test.ts` and record RED.

```ts
assert.deepEqual(workspacePolicy('cards', true, false), {taskFirst:true, showModel:false});
assert.deepEqual(workspacePolicy('cards', true, true), {taskFirst:true, showModel:true});
assert.deepEqual(workspacePolicy('course', true, false), {taskFirst:true, showModel:false});
assert.deepEqual(workspacePolicy('cases', true, false), {taskFirst:true, showModel:false});
assert.deepEqual(workspacePolicy('quiz', true, false), {taskFirst:false, showModel:true});
assert.deepEqual(workspacePolicy('anatomy', true, false), {taskFirst:false, showModel:true});
assert.deepEqual(workspacePolicy('explore', true, false), {taskFirst:false, showModel:true});
assert.deepEqual(workspacePolicy('cards', false, false), {taskFirst:false, showModel:true});
assert.deepEqual(workspacePolicy('exam', false, true), {taskFirst:false, showModel:false});
assert.deepEqual(workspacePolicy('exam', true, true), {taskFirst:false, showModel:false});
```

- [x] Step 2: Implement the policy and wire it into actual scene mounting, not only CSS. The minimal derivation is:

```ts
const taskFirst = mobile && ['cards', 'course', 'cases'].includes(mode);
return {taskFirst, showModel: mode !== 'exam' && (!taskFirst || expanded)};
```

Use a matchMedia listener with cleanup to track viewport. Mode changes reset expansion/focus/temporary panels and scroll new task to its beginning; preserve store and quiz semantics. Render a clearly labeled model expand/collapse button next to task content. For identify cards, do not expose point name or answer in the toggle/heading.

- [x] Step 3: Make anatomy controls compact and in normal layout flow on phones. Keep slider adjustable across full range and keyboard access; add collapse button with aria-expanded. Place chosen-part summary in the control region rather than a separate absolutely positioned bar over the model. Detail and catalogue are explicit overlays with close controls; opening one should close the other on phones. Application-level focus hides unnecessary UI, includes a visible exit button and Escape handling, and restores previous scrolling on exit. No native fullscreen API required.

- [x] Step 4: Implement task-first phone order and quiz prompt near the model. Task-first pages start with the actual StudyPanel/CoursePanel/CasesPanel. Model can be expanded without losing task data. Explore has an explicit jump to the selected point's details. Avoid CSS order diverging from keyboard reading order by arranging responsive DOM intentionally without remounting/resetting learning panels on ordinary resize. Preserve desktop split workspace.

- [x] Step 5: Put AnatomyCatalogue search before optional filters. Use native details/summary for collapsed system filters; result list scrolls separately while search remains visible. Mobile drawer fills available height with safe-area padding. Search, filter, pagination and selected-item functions must still work. Increase phone body text to >=14px and auxiliary copy to >=12px where readable text is shown; ensure main touch targets >=44px, compact no-wrap brand at 320px, no lost business link. Keep header scrollable navigation.

- [x] Step 6: Ensure hidden model unmount stops its download workers (including scheduling additional chunks after abort), render loop, observers and GPU resources; remount clears stale loading/error state and retries without reloading the app/clearing data. Keep separate atlas metadata errors from scene errors if needed. Do not introduce an unbounded in-memory cache of model buffers. Existing HTTP asset caching may serve repeat loads. Use focused lifecycle tests where extractable or document concrete browser lifecycle checks; never substitute source-grep tests for behavior.

- [x] Step 7: Run focused policy tests, then `npm test`, `npm run check`, `npm run build`, `node scripts/validate-interactions.mjs`. Record commands/results. Commit only implementation/test files plus this task's report. Parent will handle CUA visual checks against rebuilt dist; do not operate the shared browser concurrently.

- [x] Step 8: Self-review scene lifecycle, small-height layout, mode switching and no answer leakage; write report and create scoped commit. Report any acceptance item still requiring parent browser evidence, not as silently complete.

## Parent acceptance and separate content work

After task review, parent rebuilds if fixes landed and runs the seven-mode viewport matrix, long question and card flip checks without submitting real answers. Parent reviews task diff independently through a reviewer and records results in `docs/mobile-remediation-verification-2026-09-06.md`.

Medical content remains a separate deliverable per approved design: research lawful source-backed nomenclature/coordinates/explanations and report precisely what can be imported. UI delivery does not fulfill those unresolved data gaps. Do not claim all site issues fixed while data or true-device acceptance is incomplete.
