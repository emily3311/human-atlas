# Task 1 implementation report

## Implemented

- Added 158 term-by-term reviewed, exact atlas-name cores with `zh`, HTTPS source, inspected source term/row, and normalization notes. Seventy-three use an exact FIPAT TA2 English–Latin bridge to an inspected NAER Latin–Chinese row.
- Added strict case/outer-trim normalization and explicit left/right composition. Unknown, malformed, branch, subdivision, and other non-exact names remain unchanged.
- Added `anatomyNameEvidence` and actual-entry `anatomyNameCoverage` APIs while retaining the existing public label APIs and legacy translations.
- Added catalogue coverage wording: “已提供中文名称”, explicit pending count, and “名称对照不等同于专业审校”.
- Added a collapsed selected-name source disclosure. The existing original English disclosure remains closed by default.
- Documented provenance, license, matching policy, actual before/after coverage, remaining categories, and ambiguity policy.

No geometry, storage, theme, continuous-explosion behavior, packages, questions, or placement data was changed.

## Coverage

- Before: 185 / 2,234 actual mesh entries translated; 2,049 unresolved.
- After: 490 / 2,234 translated; 1,744 unresolved.
- Added source table: 158 unique exact cores covering 305 actual mesh entries.
- Remaining unresolved: arterial 577, venous 370, muscular 240, skeletal 169, nervous 97, respiratory 117, digestive 85, sensory 26, connective 31, cardiac 23, reproductive 5, endocrine 2, lymphatic 2, integumentary 0, urinary 0.

## Sources inspected

- `/tmp/atlas-anatomy-naer.csv`: 6,233 records from <https://data.gov.tw/en/datasets/14549>, Government Open Data License 1.0 (<https://data.gov.tw/license>). Selected records retain the CSV row ID plus original Latin/source and Chinese values.
- Platysma mainland term confirmation: <https://www.imaios.cn/cn/e-anatomy/anatomical-structures/platysma-1541115436>; evidence also notes NAER row 4426.
- FIPAT TA2 official terminology and public-domain term status: <https://libraries.dal.ca/Fipat/ta2.html>; linked TA2 Viewer: <https://ta2viewer.openanatomy.org/>. The viewer bundle was parsed as a string-literal JSON payload with the installed TypeScript AST parser (never evaluated), yielding 7,112 records.

## TDD evidence

RED:

- Command: `npm test -- tests/anatomy-zh.test.ts`
- Expected failure: `SyntaxError: ... anatomy-zh.ts does not provide an export named 'anatomyNameCoverage'`.
- Reason: regression/API tests were added before the terminology implementation, proving the new contract was absent.

GREEN:

- Focused command: `node --experimental-strip-types --test tests/anatomy-zh.test.ts`
- Result: 10/10 passing.
- Full command: `npm test`
- Result: 38/38 passing, no test warnings.
- TypeScript: `npm run check` passed.
- Production build: `npm run build` passed. Vite emitted its existing-style advisory that the main minified chunk exceeds 500 kB; it is non-fatal and unrelated to this data/UI change.
- Integrity script: 158 records, 158 unique keys, 0 invalid records, 305 matching mesh entries. Every record has a nonempty Chinese value, HTTPS source, nonempty source term, and at least one exact atlas core.
- CSV evidence comparison caught and corrected five transcription issues during self-review; the final selected row evidence matches the inspected CSV values.

## Ambiguity blockers

- The CSV heading says English, but most entries are Latin; no unrestricted cross-language equivalence was inferred.
- Unsafe or incomplete rows remain unresolved, including `axis` → `軸`, `radius` → `半徑`, and `Putamen` → `殼`.
- Whole-structure evidence was not extended to branches, named parts, digits, serial groups, or other subdivisions. Side, ordinal, subdivision, and whole-versus-part distinctions remain intact.
- Legacy translations count as translated but were not relabeled as newly source-verified.

## Files changed

- `app/tcm/anatomy-terms.ts` (new)
- `app/tcm/anatomy-zh.ts`
- `app/tcm/AnatomyPanel.tsx`
- `tests/anatomy-zh.test.ts`
- `docs/anatomy-terminology-sources.md` (new)
- `.superpowers/sdd/2026-09-06-anatomy-terminology/task-1-report.md` (new)

## Self-review

- Confirmed strict lookup has no substring substitution and malformed input remains unchanged.
- Confirmed evidence is returned only for newly sourced terms, not legacy mappings.
- Confirmed all new keys occur in the current model and all evidence URLs are HTTPS.
- Confirmed user-facing text does not claim professional review and unresolved counts remain explicit.
- No remaining correctness concern identified within the selected evidence set; further coverage requires additional primary-source resolution rather than inference.

## Fix round 1 (review of `4e54724`)

- Added a failing literal regression for all three fibularis outputs. RED showed `左第三腫骨肌` instead of `左腓骨第三肌`; corrected the three outputs to the cited NAER rows 624/623/622: `腓骨第三肌`, `腓骨长肌`, and `腓骨短肌`.
- Audited all 158 records by rendering `core`, runtime `zh`, and runtime `sourceTerm` side by side, then reviewing every line for source-character transcription, side/direction, ordinal, anatomy component, and documented Simplified Chinese/mainland word-order normalization. For TA2-bridged entries, the stored NAER row Chinese was also mechanically compared with `/tmp/atlas-anatomy-naer.csv`.
- The audit found two additional output defects: `plantaris` had `跛肌` instead of source-normalized `跖肌`, and `middle colic artery` had inverted `结肠中动脉` instead of the cited `中结肠动脉`. A second failing literal regression captured these before correction.
- No terms were added or removed. Coverage remains exactly 490 / 2,234 translated and 1,744 unresolved; 158 source-backed cores cover 305 mesh entries.
- Verification: focused anatomy tests 12/12 passing; full suite, TypeScript check, production build, and integrity/coverage checks were rerun after the corrections. The build retains the non-fatal main-chunk-size advisory.

Fix-round verification commands and recorded output:

- `node --experimental-strip-types --test tests/anatomy-zh.test.ts` — exit 0; 12 tests passed, 0 failed.
- `npm test` — exit 0; 40 tests passed, 0 failed.
- `npm run check` — exit 0; `tsc --noEmit` completed without diagnostics.
- `npm run build` — exit 0; Vite transformed 2,496 modules and completed the production build successfully. It emitted the non-fatal advisory that a minified chunk exceeds 500 kB.
- Post-build integrity/coverage script — exit 0; `{ total: 2234, translated: 490, unresolved: 1744 }`, 158 records, 158 unique keys, 0 invalid records, and 305 matching mesh entries.
