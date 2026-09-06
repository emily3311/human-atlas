# Review fix report

## Fixes

- Quiz review feedback now retains only the answered target in a presentation queue after scheduling removes it from the due queue. “下一题” advances to the next actually due filtered item; an exhausted review queue offers “练习全部题目”. Skip feedback is also retained and no longer renders an undefined selected point.
- Changing search, scope, region, classification, meridian, or mode intentionally clears answer/reveal state.
- Unrevealed 归经 cards conceal the stage meridian, selected-point overlay, model names/codes, sidebar rows, and meridian filter. The point name remains in the question; card type remains owned by the parent across point changes.
- Classification cards now show only specific-point classifications. Each verified source names exactly the tags it supports, while uncovered tags are explicitly marked pending; the GB location standard is no longer the classification-answer fallback.
- The content-source cross-check count is corrected from 8 to 14.

## Regression coverage

- `tests/study.test.ts`: answered target retention is separate from the true due list, including exhausted and remaining-queue cases.
- `tests/content.test.ts`: classification evidence cannot claim tags outside the displayed classifications, and every unsupported remainder must be pending; representative partial-support cases are asserted.

## Status

- `npm test`: 14/14 passing.
- `npm run check`: passing.
- Browser/mobile verification is intentionally left to the root task as requested.
