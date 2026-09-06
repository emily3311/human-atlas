# Source-backed Anatomy Terminology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace source-identifiable pending anatomy labels with accurate simplified Chinese, with traceable terminology evidence and honest remaining coverage.

**Architecture:** Keep the existing name API and layer a source-backed dictionary before legacy mappings. Resolve exact terms and strictly bounded side/ordinal compositions, never generic partial-word replacement. Export coverage so the catalogue distinguishes translated meshes from unresolved ones.

**Tech Stack:** TypeScript, React, node:test, existing source manifest and publicly available terminology.

## Global Constraints

- Preserve all model geometry, learning storage, current UI theme and continuous explosion interaction.
- No package additions. Do not modify question or acupoint placement data.
- Never mark machine translation as professional review or remove the pending marker from an unresolved term.
- Each new core translation must retain an inspected primary-source term/row or exact page URL; references alone are not proof that unrelated terms were verified.
- Preserve laterality, ordinal, subdivision, and whole-versus-part distinctions. Do not map a tendon to its muscle or a nerve branch to its parent.

### Task 1: Evidence-backed Chinese name expansion

**Files:** Create `app/tcm/anatomy-terms.ts`, `docs/anatomy-terminology-sources.md`; modify `app/tcm/anatomy-zh.ts`, `app/tcm/AnatomyPanel.tsx`, `tests/anatomy-zh.test.ts`.

**Interfaces:** Keep `anatomyZh(name:string):string` and `anatomyLabel(name:string,id:string,system?:SystemId):string`. Add `anatomyNameEvidence(name:string): {source:string; sourceTerm:string; note?:string} | null` and `anatomyNameCoverage(parts:ReadonlyArray<{name:string}>):{total:number;translated:number;unresolved:number}`. Coverage counts actual mesh entries, not unique names or source vocabulary size. Legacy translations count as translated, not newly verified.

- [ ] Step1: Add failing regression tests for screenshot FJ1558 and evidence/coverage APIs; run focused tests RED.
```ts
assert.equal(anatomyLabel('Left platysma','FJ1558','muscular'),'左颈阔肌');
assert.equal(anatomyZh('Right platysma'),'右颈阔肌');
assert.ok(anatomyNameEvidence('Left platysma')?.source.startsWith('https://'));
assert.equal(anatomyZh('Imaginary branch of left platysma'),'Imaginary branch of left platysma');
assert.deepEqual(anatomyNameCoverage([{name:'Left platysma'},{name:'Unreviewed structure'}]),{total:2,translated:1,unresolved:1});
```
- [ ] Step2: Inspect model names in `public/models/atlas.json` and expand every unambiguous mapping supported by the available primary-source terminology, prioritizing muscle, bone, sensory and nerve structures. Primary open source CSV is `/tmp/atlas-anatomy-naer.csv`, downloaded from the CSV link on `https://data.gov.tw/en/datasets/14549`, license `https://data.gov.tw/license` (Government Open Data License1.0). Its heading says English but most entries are LATIN; do not assume English equivalence or simply bulk-convert traditional Chinese. `M.` is musculus, and identical Latin muscle-name cores provide many exact matches. Store selected original row IDs, Latin text and Chinese text in evidence records with simplified/name normalization notes. Rows with variant/obsolete synonyms or ambiguous correspondence stay unresolved unless another primary source resolves them. Platysma is row4426 `Platysma`, `闊肌(頸)`; mainland confirmed at `https://www.imaios.cn/cn/e-anatomy/anatomical-structures/platysma-1541115436`. Do not copy IMAIOS definitions or proprietary translation databases wholesale. User authorized web research; use agent-reach skill when browsing.
```ts
export interface AnatomyTerm { zh:string; source:string; sourceTerm:string; note?:string }
export const ANATOMY_TERMS:Record<string,AnatomyTerm> = {
  platysma:{zh:'颈阔肌',source:'https://www.imaios.cn/cn/e-anatomy/anatomical-structures/platysma-1541115436',sourceTerm:'Platysma / 颈阔肌'}
};
```
- [ ] Step3: Perform lookup by normalized exact core (case and trim) and explicit left/right prefix; no unrestricted substring substitutions. For serial structures, a composition is allowed only with an explicit source-backed core and tested strict grammar that preserves side and numbering. Add literal tests for every implemented composition category, including unknown and malformed inputs staying unchanged. Data additions should be reviewed term-by-term; do not set an arbitrary coverage quota or invent entries to reach100%.
```ts
const side = lower.startsWith('left ') ? '左' : lower.startsWith('right ') ? '右' : '';
const core = side ? lower.slice(side === '左' ? 5 : 6) : lower;
const term = ANATOMY_TERMS[core];
if (term) return side + term.zh;
```
- [ ] Step4: Show computed Chinese translation coverage in the anatomy catalogue, and a collapsed source disclosure for a selected newly sourced name in details. Keep English closed by default. State `已提供中文名称` not `专业审校完成`; unresolved count stays explicit. Write provenance/license attribution and actual before/after counts in docs, including remaining category counts and why unresolved terms were retained.
```tsx
<p className="mini-note">已提供中文名称 {coverage.translated} / {coverage.total}；待核对 {coverage.unresolved}。名称对照不等同于专业审校。</p>
```
- [ ] Step5: Run focused/full tests, TypeScript and build; verify all new records have nonempty HTTPS evidence, no key duplicates, and every new mapping corresponds to at least one actual model name. Report actual coverage, ambiguity blockers, RED/GREEN and source research. Commit task-owned files only; independent task review follows.
