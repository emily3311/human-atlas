# CMB Question Bank Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a usable, source-preserving CMB Chinese TCM physician practice bank, separate from the anatomy learning tools.

**Architecture:** Offline deterministic importer produces static JSON and audit/attribution assets. A validated data boundary and pure practice state helpers feed an independent wide React exam workspace, fetched only on entry. Existing model workspace stays mounted but hidden while practising, preserving its canvas lifecycle.

**Tech Stack:** Existing React 19, TypeScript 5.9, Node >=22.13.0, Vite 8, node:test; no new dependencies.

## Global Constraints

- Work in `/Users/emily/Documents/ChatGPT/3D模型真实街景/human-atlas-tcm` on existing `codex/tcm-learning-atlas`; preserve unrelated edits and existing user records. Do not create another server or replace model geometry.
- User approved implementation and no per-question source/review banners. Answer UI uses `答案` and `暂无解析`; source/license/content boundaries belong to About. Never call it official, current-year complete, or medically reviewed.
- Strict source classification: `医师考试`, `执业医师`, `中医执业医师`, `单项选择题`. Exclude assistant/integrated/other exams and multiple answers. No generated medical explanations, repaired medical text, guessed subjects, years or A1/A2/B1/A3/A4 groups.
- Fixed source archive `/tmp/atlas-cmb-research.zip`, SHA256 `c2e4288127fa5e6c03cc3659d893b0bbb19e699f74fdadce8e7fa10ac5bfdd94`; archive entry `CMB/CMB-Exam/CMB-train/CMB-train-merge.json`. Preserve original source index/content and Apache-2.0 attribution. Never execute downloaded code.
- Use apply_patch for edits; the importer may generate its own output assets as the explicit normal data-conversion step. No external posts, pushes, purchases, or paid scraping.
- Main controls browser acceptance via CUA. Implementers use automated tests, typecheck/build; no standalone Playwright/CDP browser automation.

### Task 1: Deterministic CMB import and validated exam data boundary

**Files:**
- Create `scripts/import-cmb.ts`, `app/tcm/exam-bank.ts`, `tests/exam-bank.test.ts`.
- Generate `public/data/cmb-tcm.json`, `public/data/cmb-import-report.json`, `public/licenses/CMB-Apache-2.0.txt`, `public/CMB-ATTRIBUTION.md`.
- Update `docs/exam-bank-source-audit-2026-09-06.md` with actual import counts and procedure, preserving prior research.

**Interfaces:**
- Produces `ExamQuestion = { id: string; sourceIndex: number; question: string; options: Record<AnswerKey,string>; answer: AnswerKey }`, `AnswerKey = 'A'|'B'|'C'|'D'|'E'`, `ExamBank = { schemaVersion:1; source: 'CMB'; sourceSha256:string; questions:ExamQuestion[] }`.
- Produces `parseExamBank(value: unknown): ExamBank` throwing a readable Error for invalid payload or duplicate IDs; no silent partial load.
- Importer exports pure `selectCmbQuestions(records: unknown[]): { questions: ExamQuestion[]; report: object }` for tests; run CLI only under an import.meta.url entry guard.

- [ ] **Step 1: Write failing behavior tests, then run focused RED.**

```ts
const row = {exam_type:'医师考试',exam_class:'执业医师',exam_subject:'中医执业医师',question_type:'单项选择题',question:'测试题',option:{A:'甲',B:'乙',C:'丙',D:'丁',E:'戊'},answer:'B'};
assert.equal(selectCmbQuestions([row,{...row,exam_class:'执业助理医师'}]).questions.length,1);
assert.equal(selectCmbQuestions([{...row,option:{...row.option,E:''}}]).questions.length,0);
assert.equal(selectCmbQuestions([row,{...row,answer:'C'}]).questions.length,0);
assert.throws(()=>parseExamBank({schemaVersion:1,questions:[{}]}));
```

Add literal fixtures for wrong exam_type/subject, multi-select, missing/non-string fields, U+FFFD anywhere in full record, invalid answer, answer-option mismatch, duplicate-with-same-answer collapse and normalized conflict group quarantine. Test IDs remain stable across reordering and preserve the selected row's original index. Tests must exercise results, not source text.

Run `node --experimental-strip-types --test tests/exam-bank.test.ts`; document expected missing implementation failure, then actual assertion RED before final behavior.

- [ ] **Step 2: Implement pure filter and deterministic importer.**

Read archive using `execFileSync('unzip',['-p',archive,ENTRY],{maxBuffer:160_000_000})` after SHA256 checking. Reject malformed root. Keep 4417 exact-category records; structural rules yield at most4085 valid candidates. Trim leading/trailing display whitespace only. Key for dedup is JSON of question then A–E options with NFKC and whitespace removal; do NOT strip punctuation. Quarantine every row in a key group containing differing answers; same-answer duplicates keep first source row. SHA256 of normalized key plus answer gives stable ID. Preserve original sourceIndex, never use array position as UI identity. Report mutually understood stage counts plus reason counts and source indices; no full rejected medical content needed.

CLI signature: `node --experimental-strip-types scripts/import-cmb.ts /tmp/atlas-cmb-research.zip`. Generated JSON output uses schema above. About attribution includes archive/hash, source GitHub links, authors per README, conversion/filtering description, no medical audit completed, no claimed official endorsement. Obtain license verbatim from GitHub via gh API or raw URL, preserve text and version; no guessed boilerplate authors.

- [ ] **Step 3: Validate actual conversion and regression tests.**

Run focused tests GREEN, importer, rerun importer and confirm identical outputs. Parse shipped bank with `parseExamBank`, independently count source categories and retained content matches. Run full `npm test` and `npm run check`; review and commit only task files. Report actual count, rejected/conflict/duplicate counts, output bytes, commands and RED/GREEN evidence.

### Task 2: Independent full-width exam practice UI and saved progress

**Files:**
- Create `app/tcm/ExamPanel.tsx`, `app/tcm/exam-practice.ts`, `app/tcm/exam.css`, `tests/exam-practice.test.ts`.
- Modify `app/tcm/TcmApp.tsx` (minimal integration), `README.md` (actual usage).

**Interfaces:**
- Consumes Task1 `ExamBank`, `ExamQuestion`, `AnswerKey`, `parseExamBank` from `./exam-bank`.
- Produces `<ExamPanel onAbout={() => setAbout(true)} />` with internal async data loading and practice state. No props coupling to acupoint filtering.
- Pure helper contracts: `searchExamQuestions(questions, query): ExamQuestion[]`; `shuffleQuestionIds(ids, random=Math.random):string[]`; `parseExamProgress(raw:string|null, validIds:ReadonlySet<string>):ExamProgress`; `recordExamAnswer(progress,question,answer):ExamProgress`.
- `ExamProgress = Record<string,{ answer:AnswerKey; correct:boolean; attempts:number }>`; storage key `jingwei-cmb-progress-v1`. Validate untrusted storage values and known IDs, don't inherit object prototypes. Correctness is agreement with source answer, not a medical-review claim.

- [ ] **Step 1: Write behavioral RED tests for search, shuffle, storage, and submission/navigation.**

```ts
assert.equal(searchExamQuestions([question],' 乙 ').length,1); // option search
assert.deepEqual(shuffleQuestionIds(['a','b','c'],()=>0),['b','c','a']);
assert.deepEqual(parseExamProgress('{broken',new Set(['q1'])),{});
assert.equal(recordExamAnswer({},question,'A')[question.id].correct,false);
assert.equal(recordExamAnswer(recordExamAnswer({},question,'A'),question,'B')[question.id].attempts,2);
```

Add pure session/reducer behavior where UI state warrants extraction (same file): no submit without selection, no revealed answer before submission, navigation resets selection/reveal, filter/order change resets session, previous/next respect bounds. Do not test source string presence. Run focused tests and document RED before implementation.

- [ ] **Step 2: Implement minimal helpers, then UI.**

ExamPanel loads `/data/cmb-tcm.json` on mount with AbortController; validates payload; loading/error/retry views and no fallback content. No answer in initial visible DOM. Use question IDs for keys and progress. Search input with label; scope `全部题目` / `错题回顾`; order `顺序练习` / `随机练习`; counts reflect actual active data. Shuffle only when intentionally selecting/changing order or collection, not on every render/selection. Freeze current wrong-question session IDs while answering so corrected answers don't disappear immediately; updating scope/search restarts set. Empty dataset has useful message and reset action.

Wide central card with current-set index/count, single-choice label, long stem and five wrapping buttons using aria-pressed. Submit disabled until selected. Submitted state shows chosen/answer distinction using text/icons as well as color, `答案：B` (actual letter), `暂无解析`; previous/next with disabled bounds and keyboard focus visibility. Do not print CMB or audit flags on answer card. Have a small `关于题库` button invoking onAbout.

Progress loads only after bank validation and saves to own key after submissions. Never clobber existing key on first mount before hydration. Catch read/write errors, preserve in-memory practice and show storage warning. Add confirmed clear action scoped to this key only, with cancel path. Refresh restores practice records; no requirement to restore current search/order/position. Source no explanation means no explanation field/UI invention.

Integrate Mode `'exam'` and nav item `执医题库`. Wrap existing workspace with `hidden={mode==='exam'}` and ensure `style.display` is `'none'` in exam mode (existing CSS display grid must not override hidden). Keep canvas mounted, but `rotate` cleared by changeMode; hide compare dock and any model overlays on exam page. Render ExamPanel only for exam mode. Preserve header/footer/About entry. Add dedicated scoped CSS flex/overflow sizing and 390px mobile responsiveness without broad resets. Existing workspace should restore when switching back, with no stale hidden dimensions; verify visually.

About modal adds CMB source, Apache link, attribution link, scope/candidate/content limitations centrally, not in question card. Existing sentence that tool isn't full-scope official exam bank stays truthful. Use no new deps and no explicit guessed chapter labels.

- [ ] **Step 3: Automated checks, documentation and commit.**

Run focused tests GREEN, `npm test`, `npm run check`, `npm run build`, `git diff --check`. Update README with navigation, local progress behavior, import command, count, provenance location and missing explanation constraint. Report no medical verification claim. Commit task files; report full RED/GREEN evidence and risks for controller browser testing.

## Controller acceptance and final review

- [ ] Inspect actual asset and audit counts, license retained; run current complete tests/typecheck/build.
- [ ] CUA on localhost3016: exam navigation, load, actual count; submit A—E, previous/next, search empty and option search, random, wrong session retaining submitted feedback, correct retry clearing wrong status, cancellation of clear, reload storage; ensure test-generated records cleaned only via module UI.
- [ ] Desktop plus 390px width: readable stem/options, no horizontal overflow, header accessible; console errors checked.
- [ ] Switch to anatomy and confirm continuous slider, model visible, no wide-page CSS regression; original acupoint records preserved.
- [ ] Independent task reviews and broad final review; fix any load-bearing findings before handoff. Serve built local site; do not push or deploy externally.
