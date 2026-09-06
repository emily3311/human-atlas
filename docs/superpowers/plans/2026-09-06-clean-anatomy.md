# Clean Chinese anatomy workspace implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this approved correction in the current session.

**Goal:** Restore continuous explosion control and a full-width anatomy canvas with opt-in panels and Chinese-first labels.

**Architecture:** Keep the existing scene mounted. Replace boolean explosion state with a numeric amount; hide anatomy sidebars by default with CSS, and expose independent catalogue/details toggles. Reuse the original Slider component. Preserve raw anatomy names only in explicit disclosure and search.

**Tech Stack:** React, TypeScript, Three.js, existing Slider and node tests.

## Global Constraints

- Preserve user localStorage, TCM learning modes, all model geometry, existing scene picking and warm palette.
- Default anatomy view: neither side panel visible. Selecting a structure must not force either panel open.
- Slider range 0–100, step1, scene receives value/100; moving it ends isolation and rotation.
- Chinese title for verified terms; unresolved names explicitly marked 中文名待校对 with structure identifier, never fabricated or silently presented as translated.
- Raw English remains available in a closed disclosure, not hover/title/compact selected card.
- No question-bank changes in this correction.

## Task 1: Chinese display contract

- [x] Add tests for `anatomyZh('Marginal artery of colon') === '结肠边缘动脉'`, sided tibialis names, and a new display helper returning Chinese fallback without English for unknown names.
- [x] Run focused test RED; extend verified terminology and helper; run GREEN.
- [x] Use display helper consistently in catalogue, hover, details and selected card. Preserve original names in search and closed disclosure.

## Task 2: Full-width opt-in panels and slider

- [x] Replace boolean exploded state with numeric amount0; scene receives amount directly; resets use0.
- [x] Add catalogue/details state reset on anatomy entry; remove default side-panel space using anatomy-specific absolute overlays, independent labelled toggles and close buttons.
- [x] Reuse `Slider` from components/ui/slider with `[amount*100]`, `min=0 max=100 step=1`; update via `setExplosionAmount(value/100)` and disable rotation/isolation. Controls remain accessible when both panels are hidden.
- [x] Change entry to 解剖结构浏览; preserve compact Chinese-only selected structure chip and an explicit 查看详情 action.
- [x] Browser check: slider partial37 and endpoints, no default panel space, select doesn't reopen details, panel close/reopen, screenshot example Chinese name, return to TCM restores learning panel.
- [ ] Dedicated phone390px visual check: unavailable in this browser session; do not claim verified.
- [x] Run TypeScript/full tests/build/static-server checks and independent review; document results.

## Verification and review

- `npm run check`, 30 node tests, `npm run build`, and `git diff --check` passed. Static preview returns HTTP200. Existing large-bundle warning remains.
- Browser1512×743: slider keyboard0/37/100; full-page screenshot shows continuous brown track, full-width scene, no side cards. Chinese catalogue selection closes catalogue without opening details; explicit details has 结肠边缘动脉 title and closed English disclosure. Both panel close controls work. TCM details return after mode switch. Existing learning indicator remains1/382; no storage writes or practice ratings were performed.
- Initial narrow583px visual check caught zero-height original slider track and duplicate mobile catalogue; added scoped track/control dimensions and conditionally omitted legacy button. Dedicated390px verification not completed because the in-app browser tabs became unavailable and Chrome exposes no viewport capability.
- Independent reviewer identified off-center oversized selected chip, binary camera snap, and duplicate mobile catalogue. All fixed and re-reviewed with no remaining important findings. Camera distance and yaw interpolation have a regression test (binary behavior failed at37%).
- Fine-grained untranslated labels remain explicitly pending; this is not a complete professionally reviewed Chinese anatomical terminology set. No question-bank changes.
