# 可核验内容与四类知识卡 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不伪造医学内容的前提下，分批补全可溯源解剖中文名、336 条 CMB 严格同题参考解析、全量穴位坐标质量状态与校准工具，并交付穴位、解剖、执医错题和穴位作用四类可翻面知识卡。

**Architecture:** 离线导入脚本只生成可审计的静态数据，运行时解析器对静态数据和本地记录做二次验证。坐标数据以“未配准 / 待专业校准 / 已校准”为独立域模型，三维场景仅渲染当前显示策略允许的坐标。知识卡以统一只读 `KnowledgeCard` 视图模型驱动，但保留旧穴位学习记录，新卡片使用独立的间隔复习存储。

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, Three.js 0.159, Node `node:test`, browser `localStorage`, checked-in JSON data.

## Global Constraints

- Node.js 最低版本保持 `>=22.13.0`；不新增运行时依赖。
- 现有 4086 道 CMB 题干、A–E 选项、答案、题目 ID 和 `jingwei-cmb-progress-v1` 记录不得被重写或迁移。
- 只有题干和全部五个选项严格规范化后完全一致，且 CMB/TCMLE 答案一致的记录才生成参考解析。
- 固定数据版本的验收值是 338 道严格同题、336 道答案一致、2 道冲突隔离。
- 题目页不显示来源标签或“未经医学逐题复核”标签；来源、许可、匹配规则和限制集中放在“关于题库”。
- 解剖中文名只允许英文核心名称与来源英文术语精确对应；不使用机器翻译、词片拼接或模糊匹配。
- 解剖中文名第一批目标约 120 个术语核心、250–290 个模型条目；最终数量由排除规则决定，不为达到 290 放宽匹配。
- 383 个穴位目录条目必须各有且仅有一个坐标质量状态；现有 39 个坐标为 `pending-review`，其余为 `unregistered`。
- 三维图默认只显示 `calibrated`；`pending-review` 仅在用户主动打开“显示教学示意”后显示，且视觉与文案明确区分。
- 未获得合法且适配 BodyParts3D 的坐标数据或教师逐点校准前，不宣称全量穴位已有准确三维坐标。
- 校准草稿不能直接成为 `calibrated`；正式数据只接受通过脚本校验并经代码评审纳入的校准包。
- 穴位作用卡只从具有明确机构资料依据的 `traditionalEvidence` 生成；“待逐条来源核验”内容不得进入可评分答案。
- 知识卡正面不得在 DOM 或无障碍树中提前暴露答案；点击、Enter 和空格均可翻面。
- 不通过提交真实答题、清空用户学习数据或污染正式 `localStorage` 来做验收。

---

## File Structure

- `data/sources/fudan-anatomy-terms-batch-1.json`: 手工去歧义后的第一批复旦术语证据表。
- `scripts/import-fudan-anatomy-terms.ts`: 验证证据表与当前 atlas 精确对应，生成静态 TypeScript 数据和覆盖报告。
- `app/tcm/anatomy-terms-fudan-batch-1.ts`: 生成的来源明确中文名映射。
- `public/data/anatomy-term-import-report.json`: 新增、排除和剩余名称数量快照。
- `scripts/import-tcmle-explanations.ts`: 从固定 TCMLE 版本严格匹配 CMB 并输出解析/冲突报告。
- `app/tcm/exam-explanations.ts`: 题库解析数据模型、运行时验证和索引。
- `public/data/cmb-tcmle-explanations.json`: 按 CMB 稳定 ID 存储的 336 条参考解析。
- `public/data/cmb-tcmle-match-report.json`: 338/336/2 严格匹配报告及 TCMLE 版本证据。
- `docs/TCMLE-ATTRIBUTION.md`: 集中记录 TCMLE 来源、Apache-2.0 标记和转换规则。
- `app/tcm/placement-quality.ts`: 坐标状态、显示策略与全量统计。
- `app/tcm/calibration.ts`: 草稿、审核元数据、本地存储、导出和正式校准包原子校验。
- `app/tcm/CalibrationPanel.tsx`: 选点、左右侧、微调、撤销、依据/校对人和导出界面。
- `app/tcm/knowledge-cards.ts`: 四类卡片的统一视图模型和纯函数构建器。
- `app/tcm/knowledge-review.ts`: 新卡片独立复习记录的解析、过滤和调度。
- `app/tcm/KnowledgeCardsPanel.tsx`: 题库范围、真实数量、翻面、评分和空状态。
- `tests/*.test.ts`: 对导入、错配防护、状态门槛、卡片泄答和旧存储不变的自动化验收。

### Task 1: 导入第一批可溯源解剖中文名

**Files:**
- Create: `data/sources/fudan-anatomy-terms-batch-1.json`
- Create: `scripts/import-fudan-anatomy-terms.ts`
- Create: `app/tcm/anatomy-terms-fudan-batch-1.ts`
- Create: `public/data/anatomy-term-import-report.json`
- Modify: `app/tcm/anatomy-terms.ts`
- Test: `tests/anatomy-term-import.test.ts`
- Modify: `tests/anatomy-zh.test.ts`

**Interfaces:**
- Consumes: `Atlas.parts: Part[]` from `public/models/atlas.json`; each evidence row is `{ core: string; zh: string; sourceEntry: string; pdfPage: number; sourceEnglish: string }`.
- Produces: `FUDAN_BATCH_1_TERMS: Record<string, AnatomyTerm>` and report `{ sourceRows, matchedCores, matchedParts, excludedRows, translatedTotal, unresolvedTotal }`.

- [ ] **Step 1: Write the failing import-contract test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import atlas from '../public/models/atlas.json' with { type: 'json' };
import evidence from '../data/sources/fudan-anatomy-terms-batch-1.json' with { type: 'json' };
import { validateFudanBatch } from '../scripts/import-fudan-anatomy-terms.ts';

test('Fudan batch contains unique exact cores with complete evidence', () => {
  const result = validateFudanBatch(evidence, atlas.parts);
  assert.equal(result.errors.length, 0);
  assert.ok(result.matchedCores >= 100 && result.matchedCores <= 130);
  assert.ok(result.matchedParts >= 250 && result.matchedParts <= 290);
});

test('ambiguous or side-specific source rows are rejected', () => {
  const result = validateFudanBatch([
    { core: 'inferior pulmonary vein', zh: '右下肺静脉', sourceEntry: 'x', pdfPage: 1, sourceEnglish: 'inferior pulmonary vein' },
  ], atlas.parts);
  assert.match(result.errors.join('\n'), /side-specific Chinese term/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails because the importer does not exist**

Run: `node --experimental-strip-types --test tests/anatomy-term-import.test.ts`

Expected: FAIL with module-not-found for `scripts/import-fudan-anatomy-terms.ts`.

- [ ] **Step 3: Build the curated evidence file from the previously extracted Fudan index**

Populate only rows for which `sourceEnglish.toLocaleLowerCase() === core`, record the printed source entry and PDF page, collapse a formal-term synonym row to its first formal Chinese term, and explicitly omit:

```text
arcuate artery            # source Chinese is contextual to fibular artery
inferior pulmonary vein   # source row says right; atlas contains left and right
central canal             # source context is spinal cord and cannot be proven from the atlas core
any row whose Chinese term embeds left/right while core does not
any row with one English core mapped to two anatomical concepts
```

The JSON must contain literal evidence, for example:

```json
[
  {
    "core": "accessory hemiazygos vein",
    "zh": "副半奇静脉",
    "sourceEntry": "05.1144",
    "pdfPage": 405,
    "sourceEnglish": "accessory hemiazygos vein"
  }
]
```

- [ ] **Step 4: Implement strict batch validation and deterministic generation**

Implement and export these exact signatures:

```ts
export type FudanEvidenceRow = {
  core: string;
  zh: string;
  sourceEntry: string;
  pdfPage: number;
  sourceEnglish: string;
};

export function atlasCore(name: string): string;
export function validateFudanBatch(
  rows: readonly FudanEvidenceRow[],
  parts: ReadonlyArray<{ id: string; name: string }>,
): { errors: string[]; matchedCores: number; matchedParts: number };
```

`atlasCore` may remove only a leading exact `left ` or `right `. Validation rejects duplicate cores, empty evidence, invalid pages, source/core differences after lowercase/trim normalization, side-specific Chinese terms without side-specific cores, cores absent from the atlas, and cores already present in `ANATOMY_TERMS`. The CLI writes stable, alphabetically ordered generated TS and JSON report only when there are zero errors.

- [ ] **Step 5: Run generation and the focused tests**

Run:

```bash
node --experimental-strip-types scripts/import-fudan-anatomy-terms.ts
node --experimental-strip-types --test tests/anatomy-term-import.test.ts tests/anatomy-zh.test.ts
```

Expected: both commands exit 0; the report records 250–290 newly matched model parts and a lower unresolved total than the existing 1642 baseline.

- [ ] **Step 6: Merge the generated record without weakening the fallback rules**

In `app/tcm/anatomy-terms.ts`, import and merge with an explicit duplicate assertion during tests:

```ts
import { FUDAN_BATCH_1_TERMS } from './anatomy-terms-fudan-batch-1.ts';

export const ANATOMY_TERMS: Record<string, AnatomyTerm> = {
  ...EXISTING_ANATOMY_TERMS,
  ...FUDAN_BATCH_1_TERMS,
};
```

Do not add a generic suffix translator to `anatomyZh`; unresolved English names must still pass through to `anatomyLabel(...中文名待校对)`.

- [ ] **Step 7: Add literal regression assertions for representative systems and unknown names**

```ts
assert.equal(anatomyZh('Accessory hemiazygos vein'), '副半奇静脉');
assert.equal(anatomyZh('invented posterior branch'), 'invented posterior branch');
assert.equal(anatomyNameEvidence('Accessory hemiazygos vein')?.sourceTerm.includes('05.1144'), true);
```

- [ ] **Step 8: Commit the terminology batch only**

```bash
git add data/sources/fudan-anatomy-terms-batch-1.json scripts/import-fudan-anatomy-terms.ts app/tcm/anatomy-terms-fudan-batch-1.ts app/tcm/anatomy-terms.ts public/data/anatomy-term-import-report.json tests/anatomy-term-import.test.ts tests/anatomy-zh.test.ts
git commit -m "feat: add sourced anatomy term batch"
```

### Task 2: 生成 336 条答案一致的 CMB 参考解析

**Files:**
- Create: `scripts/import-tcmle-explanations.ts`
- Create: `app/tcm/exam-explanations.ts`
- Create: `public/data/cmb-tcmle-explanations.json`
- Create: `public/data/cmb-tcmle-match-report.json`
- Create: `docs/TCMLE-ATTRIBUTION.md`
- Test: `tests/exam-explanations.test.ts`

**Interfaces:**
- Consumes: `ExamBank` from `app/tcm/exam-bank.ts`; a TCMLE checkout at commit `39e92cda586860c29a0ee00e4e29e15aedabb359`; CLI argument `--tcmle-dir <absolute-directory>`.
- Produces: `ExamExplanationBank`, `parseExamExplanationBank(value, validQuestions)`, and `explanationIndex(bank): ReadonlyMap<string, ExamExplanation>`.

- [ ] **Step 1: Write failing tests for normalization, exact matching, conflicts and runtime parsing**

```ts
test('normalizes width, whitespace and Chinese/ASCII punctuation only', () => {
  assert.equal(normalizeExamText('Ａ。 血 虚'), normalizeExamText('A. 血虚'));
});

test('changing one option prevents a match', () => {
  const tcmle = { ...fixture, options: { ...fixture.options, E: '改动选项' } };
  assert.equal(strictQuestionMatch(cmbFixture, tcmle), false);
});

test('same question with different answers is isolated', () => {
  assert.deepEqual(classifyMatch(cmbFixture, { ...fixture, answer: 'B' }), { kind: 'conflict' });
});

test('runtime parser rejects explanation ids or answers that do not match CMB', () => {
  assert.throws(() => parseExamExplanationBank(invalidPayload, [cmbFixture]), /Invalid exam explanations/);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --experimental-strip-types --test tests/exam-explanations.test.ts`

Expected: FAIL because `exam-explanations.ts` and importer exports are absent.

- [ ] **Step 3: Implement the runtime explanation schema and parser**

Use these exact public types:

```ts
export type ExamExplanation = {
  questionId: string;
  answer: AnswerKey;
  text: string;
  provenance: {
    dataset: 'TCMLE';
    sourceFile: string;
    sourceQuestionIndex: number;
    sourceCommit: string;
  };
};

export type ExamExplanationBank = {
  schemaVersion: 1;
  source: 'TCMLE';
  sourceCommit: string;
  explanations: ExamExplanation[];
};
```

`parseExamExplanationBank` must reject duplicate IDs, unknown CMB IDs, invalid answers, answer disagreement with CMB, empty explanation text, unsafe prototype keys, wrong source/commit shape, and malformed provenance. It returns no partially accepted result.

- [ ] **Step 4: Implement the offline matcher and conflict report**

Export:

```ts
export function normalizeExamText(value: string): string;
export function strictQuestionMatch(cmb: ExamQuestion, candidate: TcmleQuestion): boolean;
export function classifyMatch(cmb: ExamQuestion, candidate: TcmleQuestion):
  | { kind: 'none' }
  | { kind: 'conflict' }
  | { kind: 'accepted'; explanation: string };
```

Normalization is NFKC, trims/removes all Unicode whitespace, and removes only the agreed ASCII/Chinese punctuation set; it must not normalize medical synonyms or reorder content. Match on stem plus A–E independently, then compare answer keys. Reject empty reasons and strings containing U+FFFD. Record all 338 strict matches in the report, emit only 336 accepted explanations, and list the two conflict question IDs without their explanation text.

- [ ] **Step 5: Run the fixed-version import and verify exact counts**

Run:

```bash
node --experimental-strip-types scripts/import-tcmle-explanations.ts --tcmle-dir /tmp/tcmle.UaLMaH
node --experimental-strip-types --test tests/exam-explanations.test.ts
```

Expected: report fields are exactly `strictMatches: 338`, `accepted: 336`, `answerConflicts: 2`; generated explanation IDs are unique and every generated answer equals the current CMB answer.

- [ ] **Step 6: Document centralized attribution without adding per-question source labels**

`docs/TCMLE-ATTRIBUTION.md` must state the dataset URL, declared Apache-2.0 license metadata, fixed source commit, licensed-physician subset files consumed, exact-match transformation, 336 accepted/2 isolated count, and that the application does not replace CMB answers. The document must not be imported into the question-card component.

- [ ] **Step 7: Commit the deterministic importer and generated data**

```bash
git add scripts/import-tcmle-explanations.ts app/tcm/exam-explanations.ts public/data/cmb-tcmle-explanations.json public/data/cmb-tcmle-match-report.json docs/TCMLE-ATTRIBUTION.md tests/exam-explanations.test.ts
git commit -m "feat: add strict CMB reference explanations"
```

### Task 3: 在题库中安全加载解析并更新“关于题库”

**Files:**
- Modify: `app/tcm/ExamPanel.tsx`
- Modify: `app/tcm/TcmApp.tsx`
- Modify: `app/tcm/exam.css`
- Test: `tests/exam-explanations.test.ts`
- Test: `tests/content.test.ts`

**Interfaces:**
- Consumes: `parseExamExplanationBank(payload, bank.questions)` and `explanationIndex(parsed)` from Task 2.
- Produces: non-blocking explanation load state with `ready | unavailable`; submitted cards render only `参考解析` or `暂无解析` / `解析暂不可用`.

- [ ] **Step 1: Add failing feedback-state behavior tests**

Extract `examFeedback(question, explanationState, explanation)` as a pure view-model function. With literal fixtures, assert that an accepted explanation returns heading `参考解析` and its text, a ready state without a match returns `暂无解析`, and a failed explanation load returns `解析暂不可用`. Assert the returned question-card view model has no provenance/source-label field. Exercise `loadExamExplanations(fetcher, questions)` with a controlled fetcher to prove parsing occurs after the CMB questions are supplied and that failure resolves to the non-blocking unavailable state.

- [ ] **Step 2: Run tests and verify the new assertions fail**

Run: `npm test -- --test-name-pattern="reference explanation|about question bank"`

Expected: FAIL because the UI still always renders `暂无解析`.

- [ ] **Step 3: Load explanations independently from the main bank**

Add state:

```ts
const [explanations, setExplanations] = useState<ReadonlyMap<string, ExamExplanation>>(new Map());
const [explanationState, setExplanationState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
```

After `parseExamBank(payload)` succeeds, fetch and parse the explanation file with the same abort controller. A failure sets `unavailable` but keeps `bank`, `progress`, and the current session usable. Do not reuse the main `loadError` for explanation failures.

- [ ] **Step 4: Render answer-consistent feedback**

For a submitted question, read `explanations.get(question.id)`. Render its text beneath a `参考解析` heading; otherwise render `暂无解析`, except a failed explanation fetch renders `解析暂不可用`. Never render provenance in `ExamPanel`.

- [ ] **Step 5: Replace the obsolete About copy**

In the existing `执医题库` section, keep the CMB 4086 count and add a compact explanation paragraph stating: 336 条参考解析来自 Apache-2.0 标记的 TCMLE 数据，仅在题干、A–E 选项全部一致且答案一致时关联，2 道答案冲突已隔离；未匹配题不生成 AI 解析。Link to the CMB and TCMLE project pages only in this About section.

- [ ] **Step 6: Run focused and full tests, then commit**

Run:

```bash
npm test
npm run check
```

Expected: all tests pass and TypeScript reports no errors.

```bash
git add app/tcm/ExamPanel.tsx app/tcm/TcmApp.tsx app/tcm/exam.css tests/exam-explanations.test.ts tests/content.test.ts
git commit -m "feat: show verified reference explanations"
```

### Task 4: 建立 383 条穴位的坐标质量状态

**Files:**
- Create: `app/tcm/placement-quality.ts`
- Modify: `app/tcm/placements.ts`
- Modify: `app/tcm/catalogue.ts`
- Modify: `app/tcm/types.ts`
- Test: `tests/placement-quality.test.ts`
- Modify: `tests/catalogue.test.ts`

**Interfaces:**
- Consumes: all `ACUPOINTS` IDs and the existing 39 `PLACEMENTS` seeds.
- Produces: `PlacementStatus`, `PlacementRecord`, `placementRecord(id)`, `placementCounts(ids)`, `visiblePlacementIds(ids, displayMode)`, and `hasPlacement(id, displayMode)`.

- [ ] **Step 1: Write failing state-coverage tests**

```ts
test('all catalogue entries have exactly one honest placement state', () => {
  const records = ACUPOINTS.map((point) => placementRecord(point.id));
  assert.equal(records.length, 383);
  assert.equal(records.filter((item) => item.status === 'pending-review').length, 39);
  assert.equal(records.filter((item) => item.status === 'unregistered').length, 344);
  assert.equal(records.filter((item) => item.status === 'calibrated').length, 0);
  assert.equal(records.filter((item) => item.status === 'unregistered' && item.placement).length, 0);
});

test('default visibility excludes teaching demonstrations', () => {
  assert.deepEqual(visiblePlacementIds(['ST36', 'ST37'], 'calibrated-only'), []);
  assert.deepEqual(visiblePlacementIds(['ST36', 'ST37'], 'include-pending'), ['ST36']);
});
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --experimental-strip-types --test tests/placement-quality.test.ts tests/catalogue.test.ts`

Expected: FAIL because there is no status registry and existing `hasPlacement` treats every seed as ready.

- [ ] **Step 3: Replace the unqualified placement record with explicit quality records**

Define:

```ts
export type PlacementStatus = 'unregistered' | 'pending-review' | 'calibrated';
export type PlacementDisplayMode = 'calibrated-only' | 'include-pending';
export type PlacementRecord = {
  pointId: string;
  status: PlacementStatus;
  placement?: Placement;
  source: string;
  modelVersion: string;
  reviewedBy?: string;
  reviewedAt?: string;
};
```

Move the current 39 seeds to `PENDING_PLACEMENTS` with source `BodyParts3D adult male approximate teaching seed` and the current atlas version. `CALIBRATED_PLACEMENTS` begins as an empty checked-in record. `placementRecord` returns `unregistered` without coordinates for every known point absent from both maps and throws for an unknown point ID in validation paths.

- [ ] **Step 4: Make study/quiz availability depend on display mode**

Change the public functions to:

```ts
export function hasPlacement(id: string, displayMode: PlacementDisplayMode): boolean;
export function questionAvailable(
  point: Acupoint,
  type: StudyQuestion,
  displayMode: PlacementDisplayMode,
): boolean;
```

`identify` and three-dimensional quiz availability are true only when the selected display mode includes that record's state. Location, meridian and verified classification cards remain coordinate-independent.

- [ ] **Step 5: Run tests and commit the domain change**

Run: `node --experimental-strip-types --test tests/placement-quality.test.ts tests/catalogue.test.ts`

Expected: PASS with exact 383/39/344/0 counts.

```bash
git add app/tcm/placement-quality.ts app/tcm/placements.ts app/tcm/catalogue.ts app/tcm/types.ts tests/placement-quality.test.ts tests/catalogue.test.ts
git commit -m "feat: track acupoint placement quality"
```

### Task 5: 实现不可越级的校准草稿与正式包校验

**Files:**
- Create: `app/tcm/calibration.ts`
- Create: `scripts/validate-calibration-package.ts`
- Test: `tests/calibration.test.ts`

**Interfaces:**
- Consumes: known point IDs, bilateral rules, atlas version, a surface hit `{ position: Vec3; normal: Vec3; surfaceDistance: number }`.
- Produces: `CalibrationDraftStore`, `parseCalibrationDrafts`, `upsertCalibrationDraft`, `undoCalibrationDraft`, `exportCalibrationDraftPackage`, and `validateCalibrationPackage`.

- [ ] **Step 1: Write failing tests for drafts, storage filtering and atomic formal validation**

```ts
test('a browser draft can never claim calibrated status', () => {
  assert.throws(() => parseCalibrationDrafts(JSON.stringify({ version: 1, drafts: [{ ...draft, status: 'calibrated' }] }), knownIds), /draft status/);
});

test('invalid formal packages are rejected atomically', () => {
  const result = validateCalibrationPackage({ ...validPackage, records: [validRecord, { ...validRecord, position: [NaN, 0, 0] }] }, context);
  assert.equal(result.ok, false);
  assert.equal(result.records.length, 0);
});

test('unilateral points reject a right-side duplicate', () => {
  assert.match(validateCalibrationPackage(packageWithRightGV20, context).errors.join('\n'), /unilateral/);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --experimental-strip-types --test tests/calibration.test.ts`

Expected: FAIL because calibration domain functions are absent.

- [ ] **Step 3: Implement the draft schema and bounded edit operations**

Use the key `jingwei-calibration-drafts:v1` and these types:

```ts
export type PlacementSide = 'left' | 'right' | 'midline';
export type CalibrationDraft = {
  id: string;
  pointId: string;
  side: PlacementSide;
  status: 'pending-review';
  position: Vec3;
  normal: Vec3;
  evidence: string;
  reviewer: string;
  modelVersion: string;
  updatedAt: string;
};
export type CalibrationDraftStore = { version: 1; drafts: CalibrationDraft[] };
```

Reject unknown point IDs, mismatched side rules, non-finite vectors, non-unit normals outside tolerance `0.02`, strings above their specified limits (evidence 2000, reviewer 100), invalid ISO dates and the prototype keys. Keep an immutable history of the previous ten positions per draft in memory for undo; persisted JSON stores only the current draft.

- [ ] **Step 4: Implement formal package validation as an all-or-nothing operation**

A formal package must include `schemaVersion: 1`, exact atlas/model version, `reviewedBy`, `reviewedAt`, `evidence`, and unique `(pointId, side)` records. Require `surfaceDistance <= 0.01` model metres, valid side rules, finite position/normal, and status exactly `calibrated`. Return `{ ok: false, errors, records: [] }` on any invalid record. The CLI reads one explicit file path, prints errors without writing output, and exits non-zero when invalid.

- [ ] **Step 5: Run tests and commit**

Run: `node --experimental-strip-types --test tests/calibration.test.ts`

```bash
git add app/tcm/calibration.ts scripts/validate-calibration-package.ts tests/calibration.test.ts
git commit -m "feat: validate acupoint calibration drafts"
```

### Task 6: 将质量开关和校准工具接入三维界面

**Files:**
- Create: `app/tcm/CalibrationPanel.tsx`
- Modify: `app/tcm/AtlasScene.tsx`
- Modify: `app/tcm/TcmApp.tsx`
- Modify: `app/tcm/tcm.css`
- Modify: `app/tcm/mobile.css`
- Test: `tests/placement-quality.test.ts`
- Test: `tests/content.test.ts`
- Modify: `scripts/validate-interactions.mjs`

**Interfaces:**
- Consumes: Task 4 display helpers and Task 5 draft operations.
- Produces: `CalibrationPick = { pointId; side; position; normal; surfaceDistance; modelVersion }`; `AtlasScene` optional props `calibration` and `onCalibrationPick`.

- [ ] **Step 1: Add failing UI and scene-policy tests**

Exercise the real pure policy functions with literal fixtures: the default display policy is `calibrated-only`, the opt-in control view model returns label `显示教学示意（39）`, and switching to `include-pending` is the only route by which ST36 enters scene point IDs. Add `markerPresentation(record, pointName)` and assert that a pending record returns CSS class `acu-marker--pending` and accessible label suffix `待专业校准·教学示意`; the `AtlasScene` renderer consumes this returned presentation object.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --experimental-strip-types --test tests/placement-quality.test.ts tests/content.test.ts`

- [ ] **Step 3: Add placement display controls and honest empty states**

Store `placementDisplayMode` in component state only; do not persist it. Near the 3D controls show exact counts from `placementCounts(ids)` and a toggle. With zero calibrated points, show `当前无已校准三维穴位；可主动查看 39 个教学示意点。` Textual location and catalogue selection remain available. Quiz/identify empty states explain that the current display range has no usable coordinates.

- [ ] **Step 4: Render pending markers with separate semantics**

Build markers from `placementRecord` rather than direct `PLACEMENTS` lookup. Pending markers use a hollow/dashed ring, do not share calibrated marker styling, and append the quality label to their DOM `aria-label` and visible tooltip. Routes may connect only records visible under the same display mode; never bridge across unregistered points.

- [ ] **Step 5: Add a surface-pick calibration mode to AtlasScene**

When `calibration.enabled` is true, a pointer tap raycasts against `surfaceProjection`; select the nearest front-facing hit, return world/model position, normalized face normal, computed surface distance, point ID, side and atlas version through `onCalibrationPick`. Do not also trigger anatomical-part selection on the same tap. A calibration marker is visually separate and never appended to the normal acupoint marker array.

- [ ] **Step 6: Implement CalibrationPanel editing and JSON export**

The panel must:

1. select any of 383 point IDs and only valid side choices;
2. start/cancel surface-pick mode;
3. adjust x/y/z by ±0.001 m buttons and undo up to ten edits;
4. require evidence and reviewer before export;
5. save validated drafts to `jingwei-calibration-drafts:v1`, retaining in-memory state and showing a warning if storage fails;
6. export a `Blob` download whose records are all `pending-review`, never `calibrated`;
7. display current formal counts and explain that code review is required for promotion.

- [ ] **Step 7: Make the panel responsive and non-obstructive**

On desktop use the existing optional right-side detail area; on `<=680px` use a full-width drawer below the canvas with 44px minimum tap targets. The canvas remains at least 360px high; panel scrolling must not trap body scrolling; Escape exits pick mode before closing the panel.

- [ ] **Step 8: Validate interactions and commit**

Run:

```bash
npm test
npm run check
npm run build
node scripts/validate-interactions.mjs
```

Expected: all commands exit 0; interaction validator confirms default zero normal markers, 39 opt-in pending markers, panel open/close, and draft export without modifying formal data.

```bash
git add app/tcm/CalibrationPanel.tsx app/tcm/AtlasScene.tsx app/tcm/TcmApp.tsx app/tcm/tcm.css app/tcm/mobile.css tests/placement-quality.test.ts tests/content.test.ts scripts/validate-interactions.mjs
git commit -m "feat: add honest placement controls and calibration UI"
```

### Task 7: 建立四类知识卡数据模型和独立复习存储

**Files:**
- Create: `app/tcm/knowledge-cards.ts`
- Create: `app/tcm/knowledge-review.ts`
- Modify: `app/tcm/types.ts`
- Modify: `app/tcm/data.ts`
- Test: `tests/knowledge-cards.test.ts`
- Test: `tests/knowledge-review.test.ts`

**Interfaces:**
- Consumes: acupoints, meridians, atlas parts, anatomy translation evidence, CMB questions, current `ExamProgress`, optional explanations and current placement display mode.
- Produces: `KnowledgeCard`, four deck builders, `KNOWLEDGE_REVIEW_KEY`, `parseKnowledgeReviewStore`, `knowledgeReviewQueue`, and `rateKnowledgeCard`.

- [ ] **Step 1: Write failing tests for all card gates and answer isolation**

```ts
test('effect cards require explicit traditional evidence', () => {
  const cards = buildPointEffectCards(ACUPOINTS);
  assert.ok(cards.some((card) => card.id === 'point:ST36:effects'));
  assert.ok(!cards.some((card) => card.id === 'point:LU1:effects'));
});

test('anatomy cards only use verified Chinese names and retain mesh identity', () => {
  const cards = buildAnatomyCards(atlas.parts);
  assert.ok(cards.every((card) => anatomyNameEvidence(card.meta.english) !== null));
  assert.equal(new Set(cards.map((card) => card.id)).size, cards.length);
});

test('wrong cards disappear after the latest correct answer', () => {
  assert.equal(buildWrongExamCards(bank.questions, { [id]: { answer: 'B', correct: false, attempts: 1 } }, explanations).length, 1);
  assert.equal(buildWrongExamCards(bank.questions, { [id]: { answer: 'A', correct: true, attempts: 2 } }, explanations).length, 0);
});

test('front payload never includes a correct answer or explanation', () => {
  const card = buildWrongExamCards(bank.questions, wrongProgress, explanations)[0];
  assert.equal(JSON.stringify(card.front).includes(bank.questions[0].options[bank.questions[0].answer]), false);
  assert.equal(JSON.stringify(card.front).includes(card.back.explanation ?? ''), false);
});
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node --experimental-strip-types --test tests/knowledge-cards.test.ts tests/knowledge-review.test.ts`

- [ ] **Step 3: Add explicit traditional-effect evidence to the acupoint model**

Add `traditionalEvidence: Source[]` to `Acupoint`. In `data.ts`, populate it only from `traditionalSources[id]`; all generated standard/extra points without such evidence receive `[]`. Keep their existing non-card descriptive text unchanged. Do not derive trust from a string prefix.

- [ ] **Step 4: Implement the unified read-only card view model**

```ts
export type KnowledgeDeck = 'point' | 'anatomy' | 'exam-wrong' | 'point-effects';
export type KnowledgeCard = {
  id: string;
  deck: KnowledgeDeck;
  title: string;
  front: { eyebrow: string; prompt: string; hint?: string };
  back: { answer: string; detail?: string; explanation?: string; caution?: string };
  sourceLinks: Source[];
  meta: Record<string, string>;
};
```

IDs are exactly `point:<point-id>:<location|meridian|tags|identify|effects>`, `anatomy:<mesh-id>:zh-to-en`, `anatomy:<mesh-id>:en-to-zh`, and `exam:<question-id>`. Anatomy cards require `anatomyNameEvidence(part.name)` and include mesh ID/system; wrong cards use only records whose latest `correct === false`; effect cards require `traditionalEvidence.length > 0` and use the copy `传统功用提要` plus the point's existing safety caution.

- [ ] **Step 5: Preserve the old point store and implement the new-card store**

Use:

```ts
export const KNOWLEDGE_REVIEW_KEY = 'jingwei-knowledge-cards:v1';
export type KnowledgeReviewStore = { version: 1; reviews: Record<string, Review> };
export function parseKnowledgeReviewStore(raw: string | null, availableCardIds: readonly string[]): KnowledgeReviewStore;
export function rateKnowledgeCard(store: KnowledgeReviewStore, cardId: string, rating: Rating, now?: number): KnowledgeReviewStore;
```

Reuse `scheduleReview` but accept only namespaced IDs present in `availableCardIds`. Do not read from or write to `human-atlas-tcm:v1`; point location/meridian/tags/identify ratings continue through the existing `ratePoint` behavior.

- [ ] **Step 6: Run tests and commit the card domain**

Run: `node --experimental-strip-types --test tests/knowledge-cards.test.ts tests/knowledge-review.test.ts tests/study.test.ts tests/exam-practice.test.ts`

Expected: all pass, including assertions that parsing the new store cannot change an old `StudyStore` fixture.

```bash
git add app/tcm/knowledge-cards.ts app/tcm/knowledge-review.ts app/tcm/types.ts app/tcm/data.ts tests/knowledge-cards.test.ts tests/knowledge-review.test.ts
git commit -m "feat: add verified knowledge card decks"
```

### Task 8: 交付四类可翻面知识卡界面

**Files:**
- Create: `app/tcm/KnowledgeCardsPanel.tsx`
- Modify: `app/tcm/StudyPanel.tsx`
- Modify: `app/tcm/TcmApp.tsx`
- Modify: `app/tcm/tcm.css`
- Modify: `app/tcm/mobile.css`
- Test: `tests/knowledge-cards.test.ts`
- Test: `tests/content.test.ts`
- Modify: `scripts/validate-interactions.mjs`

**Interfaces:**
- Consumes: builders and storage from Task 7; placement display mode from Task 4; atlas from `TcmApp`; explanation bank and CMB progress from local/static resources.
- Produces: deck switch `穴位 / 解剖 / 执医错题 / 穴位作用`, real deck counts, one visible face at a time, and review controls.

- [ ] **Step 1: Add failing render-contract tests**

Exercise exported UI view-model functions against literal card arrays: `knowledgeDeckOptions(cardsByDeck)` returns all four deck labels with array-derived counts; `visibleCardFace(card, false)` returns only the front payload and `visibleCardFace(card, true)` returns only the back payload; `flipKeyAction(key, cardFocused)` accepts Enter/Space only when the card itself is focused. Render the pure effect-card back payload and assert it contains `传统功用提要` plus caution but no `治疗保证`, `疗效`, `针刺深度` or individual prescription language. `KnowledgeCardsPanel` must consume these functions rather than reimplementing the decisions.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node --experimental-strip-types --test tests/knowledge-cards.test.ts tests/content.test.ts`

- [ ] **Step 3: Build the panel resource loader without coupling it to ExamPanel state**

When `cards` mode mounts, fetch `/data/cmb-tcm.json` and `/data/cmb-tcmle-explanations.json`, parse each independently, and read `jingwei-cmb-progress-v1` against valid CMB IDs. A CMB/explanation failure affects only the wrong-card deck and shows a deck-specific empty/error message; point, anatomy and effect decks remain usable. Re-read progress whenever the user re-enters cards mode so newly corrected questions disappear.

- [ ] **Step 4: Implement deck switching and honest empty states**

Display each computed count next to its deck label. Empty copy must distinguish:

```text
穴位：当前筛选范围没有可用穴位卡。
解剖：当前没有已核对中文名的解剖卡。
执医错题：本机当前没有未改正的 CMB 错题。
穴位作用：当前范围没有具备可核验功用依据的穴位。
```

- [ ] **Step 5: Make flipping inaccessible to answer leakage**

Refactor `StudyPanel` and the new panel so the component renders only the active face branch:

```tsx
{flipped ? <CardBack card={card} /> : <CardFront card={card} />}
```

Do not keep the hidden answer face in the DOM with only CSS transforms or `aria-hidden`. The flip button has `aria-pressed`, an updating accessible label, and an `onKeyDown` that prevents default scrolling for Space.

- [ ] **Step 6: Connect ratings and next-card behavior**

Existing point-card ratings continue to call `ratePoint`. Anatomy, wrong-exam and effect cards call `rateKnowledgeCard`; after a rating, compute the next due ID from the current deck. A user may always click `下一张` without rating. If the currently displayed wrong card disappears because its exam record is now correct, move to the first remaining card without deleting its historical attempts.

- [ ] **Step 7: Add responsive layout**

Desktop keeps the current model/workspace relationship. On `<=680px`, deck tabs horizontally scroll with visible focus rings, the flip target is at least 280px high and full width, answer text wraps without horizontal overflow, and rating buttons remain 44px high. Test at 390×844 and 320×568.

- [ ] **Step 8: Run interaction checks and commit**

Run:

```bash
npm test
npm run check
npm run build
node scripts/validate-interactions.mjs
```

Expected: validator switches through all four decks, flips with pointer and keyboard, confirms front text lacks the answer, and uses an isolated in-memory progress fixture rather than the user's real storage.

```bash
git add app/tcm/KnowledgeCardsPanel.tsx app/tcm/StudyPanel.tsx app/tcm/TcmApp.tsx app/tcm/tcm.css app/tcm/mobile.css tests/knowledge-cards.test.ts tests/content.test.ts scripts/validate-interactions.mjs
git commit -m "feat: add four-deck flip card experience"
```

### Task 9: 全站数据一致性与桌面/手机验收

**Files:**
- Create: `tests/content-integrity.test.ts`
- Create: `docs/verified-content-release-2026-09-06.md`
- Modify: `scripts/validate-server.mjs`
- Modify: `scripts/validate-interactions.mjs`

**Interfaces:**
- Consumes: every generated data artifact and public parser from Tasks 1–8.
- Produces: one release report with exact terminology coverage, 4086/336/2 question figures, 383/39/0 placement figures, and actual four-deck card counts.

- [ ] **Step 1: Write the cross-dataset integrity test**

The test must assert:

```ts
assert.equal(examBank.questions.length, 4086);
assert.equal(explanationBank.explanations.length, 336);
assert.ok(explanationBank.explanations.every((item) => questionById.get(item.questionId)?.answer === item.answer));
assert.equal(placementCounts(ACUPOINTS.map((item) => item.id)).total, 383);
assert.equal(placementCounts(ACUPOINTS.map((item) => item.id)).pendingReview, 39);
assert.equal(placementCounts(ACUPOINTS.map((item) => item.id)).calibrated, 0);
assert.equal(new Set(allKnowledgeCards.map((item) => item.id)).size, allKnowledgeCards.length);
```

Also mutate one copied question option, answer, anatomy name, placement vector and card ID at a time and assert each corresponding parser rejects the mutated fixture.

- [ ] **Step 2: Run the integrity test and fix only real contract violations**

Run: `node --experimental-strip-types --test tests/content-integrity.test.ts`

Expected: PASS. Do not weaken a parser to accommodate a malformed generated record; correct the generator/source record instead.

- [ ] **Step 3: Extend server validation for every static artifact**

Check HTTP 200, JSON content type and parsability for:

```text
/data/cmb-tcm.json
/data/cmb-tcmle-explanations.json
/data/cmb-tcmle-match-report.json
/data/anatomy-term-import-report.json
/models/atlas.json
```

Also simulate a 404 for explanations and confirm the app still exposes the question bank shell.

- [ ] **Step 4: Perform isolated desktop and mobile browser acceptance**

Use a temporary browser profile or inject test-only in-memory storage. At desktop 1440×900 and mobile 390×844 verify:

1. default model shows no pending markers and the quality count is truthful;
2. opt-in displays 39 pending seeds with dashed/hollow semantics;
3. calibration draft can be picked, nudged, undone and exported only as pending;
4. a known matched submitted fixture displays `参考解析`, an unmatched one displays `暂无解析`;
5. all four card decks show real counts and flip cleanly;
6. no panel causes horizontal overflow at 390px;
7. the anatomy explosion slider, Chinese labels, optional right detail card and Emily AI project link remain functional.

- [ ] **Step 5: Write the release report with honest remaining work**

Record generated counts directly from the JSON reports, not hand-entered guesses. Include the remaining unresolved anatomy count, 3750 CMB questions without matched explanations, 344 unregistered/39 pending/0 calibrated placement counts, actual effect-card count based on `traditionalEvidence`, and the exact command outputs. State that these remaining items require new licensed data or professional review.

- [ ] **Step 6: Run the complete release gate**

Run:

```bash
npm test
npm run check
npm run build
node scripts/validate-server.mjs
node scripts/validate-interactions.mjs
git diff --check
```

Expected: every command exits 0, no new warnings appear, and `git diff --check` prints nothing.

- [ ] **Step 7: Commit the release verification**

```bash
git add tests/content-integrity.test.ts docs/verified-content-release-2026-09-06.md scripts/validate-server.mjs scripts/validate-interactions.mjs
git commit -m "test: verify content and card integrity"
```

## Self-Review Record

- Spec coverage: Tasks 1–3 cover sourced terminology and 336 explanation attachment; Tasks 4–6 cover all coordinate states, opt-in teaching markers and the calibration workflow; Tasks 7–8 cover all four card decks and separate review storage; Task 9 covers mismatch prevention, responsive acceptance and honest remaining counts.
- Completeness scan: every implementation step names its files, concrete validation rule, command and expected outcome.
- Type consistency: `PlacementDisplayMode`, `CalibrationDraft`, `ExamExplanationBank`, `KnowledgeCard`, `KnowledgeDeck`, storage keys and card ID namespaces are defined once and reused by later tasks with the same spelling.
- Approved plan corrections: Task 1 examples use a genuinely unresolved source term and Tasks 3/6/8 verify pure view-model and rendered behavior rather than searching source text.
- Existing dirty files: do not stage or modify `docs/Claude-Design-界面改版交接.md`, `design-handoff/`, `docs/cmb-question-bank-verification-2026-09-06.md`, or `docs/site-qa-mobile-2026-09-06.md` unless the user explicitly brings them into this implementation.
