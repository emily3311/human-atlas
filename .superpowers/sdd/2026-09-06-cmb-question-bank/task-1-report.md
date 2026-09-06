# Task 1 implementation report

## Implemented

- Added a strict `ExamBank` data boundary with readable validation errors and duplicate-ID rejection.
- Added a pure CMB selector plus a CLI importer that checks the fixed archive SHA-256, reads only the fixed JSON entry with `unzip -p`, rejects a malformed root, applies exact source-category and structural filters, preserves source indices and display content (apart from edge trimming), creates stable content IDs, collapses same-answer duplicates, and quarantines conflicting normalized groups.
- Generated the question bank, detailed rejection/import report, verbatim upstream Apache-2.0 license, and attribution/boundary notice.
- Appended the actual import procedure and corrected counts to the existing source audit. The earlier 4,417/4,085 figures were traced to per-chunk UTF-8 decoding; whole-buffer decoding of the fixed archive gives the reproducible figures below.

## Actual import

- Source records: 269,359
- Exact examination category: 4,420
- Single-choice: 4,255 (165 other question types rejected)
- Structural candidates: 4,091 (114 general missing/empty/non-string question or option rows and 50 answer-option mismatch rows rejected; no invalid A–E answer values or U+FFFD in this fixed archive)
- Same-answer duplicate rows collapsed: 5
- Conflicting normalized-key groups quarantined: 0
- Retained questions: 4,086
- Output sizes: bank 1,704,315 bytes; report 3,607,522 bytes; license 11,357 bytes; attribution 1,795 bytes

## TDD evidence

RED 1: `node --experimental-strip-types --test tests/exam-bank.test.ts`

- Failed with `ERR_MODULE_NOT_FOUND` for `app/tcm/exam-bank.ts`, as expected before the boundary/importer existed.

RED 2: same command after adding only minimal export stubs.

- Six behavioral tests executed and failed with real assertions, including `Expected values to be strictly equal: 0 !== 1`; this proved the tests exercised results rather than source text.

RED 3: after adding the explicit answer-option mismatch expectation.

- Five tests passed and the structural-rejection test failed because the implementation reported five generic missing fields and no `answerOptionMismatch`; this was the expected missing branch.

GREEN: `node --experimental-strip-types --test tests/exam-bank.test.ts`

- 6/6 passed after implementing filtering, normalization/deduplication, stable identity, and validation.

## Verification

- `node --experimental-strip-types scripts/import-cmb.ts /tmp/atlas-cmb-research.zip` run twice: both runs reported 269,359 / 4,420 / 4,091 / 4,086 / 5 duplicates / 0 conflicts.
- SHA-256 checks of both generated JSON files and the license were identical across the second run.
- Independent command parsed the shipped JSON through `parseExamBank`, independently extracted the archive, reran selection, and compared all retained questions: `{ source: 269359, questions: 4086, match: true }`.
- `cmp -s /tmp/CMB-LICENSE.txt public/licenses/CMB-Apache-2.0.txt`: verbatim match to the license obtained through `gh api`.
- `npm test`: 49/49 passed, output pristine.
- `npm run check`: passed, output pristine.

## Files changed

- `app/tcm/exam-bank.ts`
- `scripts/import-cmb.ts`
- `tests/exam-bank.test.ts`
- `public/data/cmb-tcm.json`
- `public/data/cmb-import-report.json`
- `public/licenses/CMB-Apache-2.0.txt`
- `public/CMB-ATTRIBUTION.md`
- `docs/exam-bank-source-audit-2026-09-06.md`
- `.superpowers/sdd/2026-09-06-cmb-question-bank/task-1-report.md`

## Self-review

- Confirmed the CLI entry guard prevents execution when imported by tests.
- Confirmed IDs depend only on normalized question/options plus answer, while `sourceIndex` remains the original array index and never serves as UI identity.
- Confirmed punctuation is retained in duplicate keys, and output question/option content is not NFKC-normalized or whitespace-collapsed.
- Confirmed malformed payloads never partially load.
- No unresolved implementation concerns. The corrected source counts are now explicitly documented instead of forcing the previous erroneous baseline.
