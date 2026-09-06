# Task 2 implementation report

## Status

DONE

## Implemented

- Added an independent, full-width `执医题库` practice mode that loads and validates `/data/cmb-tcm.json` asynchronously with abort, error, retry, and empty states.
- Added question/option search, all/wrong scopes, sequential/random order, stable question-ID sessions, bounded navigation, selection/submission, text-and-icon answer feedback, `答案：X`, and `暂无解析`.
- Wrong-question sessions remain frozen while answering; changing search, scope, or order intentionally restarts the collection. Random order changes only during those intentional resets.
- Added validated module-specific local progress (`jingwei-cmb-progress-v1`), attempt counts, refresh hydration after bank validation, storage failure warnings, and confirmed/cancellable clearing limited to the exam key.
- Integrated exam mode minimally into the existing header/app shell. The model workspace remains mounted but is both `hidden` and inline `display:none`; compare/model overlays are suppressed, rotation is cleared by the existing mode transition, and the About/footer remain available.
- Expanded About and README with the 4,086 count, strict candidate scope, upstream attribution, Apache-2.0 link, local-record behavior, import command, missing-explanation constraint, and explicit non-official/non-reviewed limitations.
- Kept the current warm visual language and added scoped desktop/mobile exam CSS without broad resets.

## TDD evidence

### RED — practice behavior

Command:

```text
npm test -- tests/exam-practice.test.ts
```

Expected failure observed before production implementation:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../app/tcm/exam-practice.ts'
tests/exam-practice.test.ts: not ok
49 passed, 1 failed
```

The failure was expected because the new search, shuffle, storage, answer-recording, and session contracts did not exist.

### GREEN — practice behavior

Command:

```text
node --experimental-strip-types --test tests/exam-practice.test.ts
```

Result after minimal helper implementation: `7/7 passing`.

### RED/GREEN — hidden canvas regression

After identifying the concrete integration risk, added a behavioral viewport test first. RED command and expected output:

```text
node --experimental-strip-types --test tests/exam-practice.test.ts
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../app/tcm/scene-viewport.ts'
0 passed, 1 failed
```

GREEN after the narrow guard: `8/8 passing`. The test verifies zero width or height produces no renderable viewport and a valid `900×600` viewport produces aspect `1.5`.

## Final verification

- Focused: `node --experimental-strip-types --test tests/exam-practice.test.ts` → `8/8 passing`.
- Full suite: `npm test` → `57/57 passing`, no test warnings.
- Typecheck: `npm run check` → exit 0, no diagnostics.
- Production build: `npm run build` → exit 0; Vite emitted its non-blocking large-chunk advisory for the existing 1.12 MB application bundle.
- Whitespace: `git diff --check` → exit 0.

## Files changed

- Created `app/tcm/ExamPanel.tsx`
- Created `app/tcm/exam-practice.ts`
- Created `app/tcm/exam.css`
- Created `tests/exam-practice.test.ts`
- Modified `app/tcm/TcmApp.tsx`
- Modified `README.md`
- Additional narrow integration-risk files: created `app/tcm/scene-viewport.ts` and modified `app/tcm/AtlasScene.tsx`. No geometry or scene content changed; only zero-sized resize/render work is skipped. A later non-zero ResizeObserver callback restores camera size/aspect when returning exam → anatomy/workspace.

## Self-review

- Confirmed answers are absent until submission and no CMB/source/review banner is repeated on question cards.
- Confirmed correctness means equality with the source answer only; no generated explanation or medical-verification claim was added.
- Confirmed storage is neither read before bank validation nor written during first hydration, malformed/foreign records are discarded, and clear touches only the exam key.
- Confirmed option and stem text wrap and the scoped 390px layout avoids fixed-width content.
- No speculative redesign or new dependency was introduced.

## Remaining acceptance

- Controller-owned CUA acceptance is still required for desktop/390px appearance, complete interaction flow, persistence reload, console checks, and exam → anatomy visual restoration.
