# Regional Anatomy Terminology Continuation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Continue the approved source-backed terminology expansion for still-unresolved eye, nearby nerve and lower-limb muscle labels.

**Architecture:** Add only inspected exact atlas-name cores to the existing ANATOMY_TERMS table. Existing exact lookup, side preservation, evidence disclosure and coverage UI remain unchanged. This is another bounded evidence batch, not completion of all pending anatomy names.

**Tech Stack:** Existing TypeScript, node:test, FIPAT TA2 and NAER terminology sources; no new dependency.

## Global Constraints

- Work in the existing codex/tcm-learning-atlas checkout; preserve unrelated changes and all original geometry.
- Preserve all model geometry, learning storage, current UI theme and continuous explosion interaction.
- No package additions. Do not modify question or acupoint placement data.
- Never mark machine translation as professional review or remove the pending marker from an unresolved term.
- Each new core translation must retain an inspected primary-source term/row or exact page URL; references alone are not proof that unrelated terms were verified.
- Preserve laterality, ordinal, subdivision, and whole-versus-part distinctions. Do not map a tendon to its muscle or a nerve branch to its parent.

### Task 1: Eye and lower-limb exact-term evidence batch

**Files:** Modify `app/tcm/anatomy-terms.ts`, `tests/anatomy-zh.test.ts`, `docs/anatomy-terminology-sources.md`. Create `docs/anatomy-terminology-continuation-evidence.md`. No UI or renderer changes.

**Interfaces:** Existing `ANATOMY_TERMS:Record<string,AnatomyTerm>`, `AnatomyTerm={zh:string;source:string;sourceTerm:string;note?:string}`, `anatomyZh(name:string):string`, `anatomyNameEvidence(name:string):AnatomyTerm|null`, and `anatomyNameCoverage(parts:ReadonlyArray<{name:string}>):{total:number;translated:number;unresolved:number}` stay unchanged.

- [ ] Step 1: Inspect only these currently unresolved exact cores as this batch's candidate boundary: `choroid`, `lacrimal canaliculus`, `lacrimal gland`, `lacrimal lake`, `lens`, `inferior oblique`, `inferior rectus`, `lateral rectus`, `levator palpebrae superioris`, `medial rectus`, `superior oblique`, `superior rectus`, `lacrimal nerve`, `nasociliary nerve`, `optic nerve`, `long ciliary nerve`, `short ciliary nerve`, `supra-orbital nerve`, `flexor accessorius`, `gemellus inferior`, `gemellus superior`, `gluteus maximus`, `gluteus medius`, `gluteus minimus`, `iliacus`, `semimembranosus`, `semitendinosus`. Use primary-source English/Latin equivalence plus NAER Chinese records; reject ambiguity rather than inventing a quota.
- [ ] Step 2: Source files already cached at `/tmp/atlas-anatomy-naer.csv`, `/tmp/atlas-ta2-viewer.js`, `/tmp/atlas-ta2-data.js`. Origin pages are `https://data.gov.tw/en/datasets/14549`, `https://libraries.dal.ca/Fipat/ta2.html`, and `https://ta2viewer.openanatomy.org/`. The first two were rechecked this turn; NAER is Government Open Data License 1.0, individual TA2 terms are public domain. Parse remote JS as TypeScript AST string literals plus JSON.parse only, NEVER execute it. Treat multilingual user-added viewer fields as unverified, not Chinese source evidence. NAER's source column is often Latin despite its English heading. Read each candidate record and preserve exact TA2 ID, English/Latin, NAER row/source Chinese. Use agent-reach for further internet research; separate mainland terms require an additional inspected primary source, not unchecked synonym modernization.
- [ ] Step 3: For accepted candidates write literal expected Chinese fixtures before table edits; confirm focused test fails because the name remains untranslated. Example test structure (literal expected term determined from inspected evidence):
```ts
assert.equal(anatomyZh('Left optic nerve'), '左视神经');
assert.equal(anatomyZh('Right optic nerve'), '右视神经');
assert.ok(anatomyNameEvidence('Left optic nerve')?.source.startsWith('https://'));
assert.equal(anatomyZh('Imaginary branch of left optic nerve'), 'Imaginary branch of left optic nerve');
assert.equal(anatomyZh('Left  optic nerve'), 'Left  optic nerve');
```
Run `node --experimental-strip-types --test tests/anatomy-zh.test.ts` and record actual RED output. If a candidate lacks evidence, omit its mapping and explain why in evidence docs instead of weakening tests.
- [ ] Step 4: Add accepted cores using existing `bridged(...)` or explicit `AnatomyTerm` records; no algorithm change, generic string replacement, partial-name or serial composition. Preserve concise original source terms, Chinese normalization notes and source links. Do not remove old records. Each new mapping must occur in actual `public/models/atlas.json` names. Check each literal fixture against source evidence, not values generated from the dictionary itself.
- [ ] Step 5: Record a compact complete evidence table for all candidates: accepted/rejected, atlas core, actual source row and Latin/Chinese, TA2 English/Latin and ID where used, reason/normalization. Calculate before/after using real 2234 mesh entries (baseline 490 translated, 1744 unresolved), keep old figures as historical, append remaining-system counts. Do not claim source-backed names are professionally reviewed.
- [ ] Step 6: Run focused tests GREEN, full `npm test`, `npm run check`, `npm run build`, `git diff --check`. Existing provenance/model-use test must include all new table entries. Report RED/GREEN commands/output, actual counts, any rejected candidates and build warnings. Commit only these task-owned files. Controller verifies representative browser labels and unchanged question/model assets separately; independent task review follows.
