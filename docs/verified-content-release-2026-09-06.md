# Verified content release — 2026-09-06

基于提交 `ba9a099c621a96e976d814724c815c025e3e0502` 的 Task 9 发布验收。本次只新增完整性测试和发布报告、扩展服务器与交互门禁；未修改正式题库、术语、坐标或用户存储。

## 可复现计数

以下 JSON 直接捕获自 `node --experimental-strip-types --test tests/content-integrity.test.ts` 的 `RELEASE_COUNTS` 输出。测试实时读取两份题库 JSON、两份生成报告、原始术语证据、atlas 和生产 card builders，断言报告与生成产物相符；没有手填统计值。

```json
{
  "terminology": {
    "sourceRows": 122,
    "matchedCores": 122,
    "matchedParts": 285,
    "excludedRows": 3,
    "translatedTotal": 877,
    "unresolvedTotal": 1357,
    "total": 2234
  },
  "questions": {
    "total": 4086,
    "matched": 336,
    "conflicts": 2,
    "withoutExplanation": 3750
  },
  "placements": {
    "total": 383,
    "unregistered": 344,
    "pending-review": 39,
    "calibrated": 0
  },
  "decks": {
    "point": 755,
    "anatomy": 1384,
    "exam-wrong": 0,
    "point-effects": 14
  },
  "wrongDeckAllWrongFixture": 4086,
  "uniqueCardsAllWrongFixture": 6239
}
```

四组默认完整范围（有定位文本的穴位、默认 calibrated-only）为穴位 755、解剖 1384、执医错题 0、穴位作用 14。错题计数依赖本机最新作答；这里使用空白隔离账户。浏览器单道错题 fixture 显示 1，改正后显示 0；另用全部题目均答错的内存 fixture 验证 4086 个 exam ID 与其他三组的 ID 全局唯一，共 6239 张。

中文标签覆盖 877/2234，其中能由 anatomyNameEvidence 返回逐项来源的 692 个网格才产生双向解剖卡。其余 185 个已有中文标签不能据此认定具备同等级逐项来源，未进入新解剖卡组。此次 Fudan 导入 122 条证据、122 个核心名、覆盖 285 个网格；明确排除 3 条歧义候选。

## 真实验收范围与隔离方式

门禁必须启动 Playwright 浏览器，不再允许因缺少环境变量而静默跳过。未提供 INTERACTION_BROWSER_URL 时，自动在临时空闲端口启动当前 dist 的 server.mjs，结束时关闭。每个浏览器页面使用全新临时 context；所有作答、卡片、草稿存储注入内存 Map。下载的 pending JSON 留在 Playwright 临时下载目录并随 context 清理。没有读取、清空或修改真实用户资料。

- 1440×900 与 390×844：默认无待校准可见标记，质量数为 0/39/344；主动勾选后注册 39 个不同 seed ID。双侧点会产生多个 DOM marker，背面点由相机遮挡，因此不把 DOM 数量或同时可见数量冒充穴位数量。验证每个 pending marker 的空心透明背景、虚线边框和待专业校准标签。
- 两种尺寸均实际拾取模型表面、再次拾取、微调、撤销，验证 normal 和 position 恢复，模拟存储配额失败，导出的 Blob JSON 始终 pending-review 且保留 atlas 版本。正式数据保持不变。
- 五个静态 JSON 路径均验证 HTTP 200、application/json 与 JSON 可解析性；异常 HTTP fixture 对 404、HTML 回退、坏 JSON 均拒绝。
- 解析 JSON 404 时，两种尺寸仍显示真实题库 shell、五个选项并可提交原始答案，状态是“解析暂不可用”。正常加载的真实已匹配、未匹配题目分别提交后显示“参考解析”“暂无解析”。
- 四组卡片在 1440×900、390×844、320×568 验证真实计数、正反面 DOM 互斥、鼠标/Enter/Space、长解析、评分、已改正错题移除、加载/离线不误报空组，以及独立新旧存储。390px 检查涵盖卡组、校准、题库、解剖详情、经穴、自测、课堂、情境练习，页面无横向溢出。
- 两种尺寸验证“左颈阔肌”中文搜索与选择、可开关的结构详情、散开滑块 0→100→0。桌面通过“复原模型”按钮复原；手机现有布局隐藏此按钮，使用滑块 Home 键复原。Emily AI 链接实际点击后打开正确目的地的新标签，目标站网络被隔离 fixture 接管，没有向外站写入。

## 尚未完成的内容

仍有 1357 个解剖结构中文名称待核对；3750 道 CMB 题目没有严格匹配的参考解析，2 个答案冲突候选未被纳入已接受解析。穴位坐标为 344 未登记、39 待专业校准、0 已校准。功用卡仅有 14 张，因为必须有 traditionalEvidence，不能以文案中的功用描述代替证据。

这些剩余项目需要新增获许可的数据或专业审校；现有教学 seed 不构成临床定位确认，名称翻译与卡片计数也不构成医学有效性保证。

## 运行方式

本机复用已安装的 Codex Playwright 运行时及其 Chromium；不新增依赖、不下载浏览器。其他环境可安装与自身 Playwright 版本匹配的 Chromium 并设置同名环境变量。

```sh
export PLAYWRIGHT_MODULE=/Users/emily/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs
node --experimental-strip-types --test tests/content-integrity.test.ts
npm test
npm run check
npm run build
node scripts/validate-server.mjs
node scripts/validate-interactions.mjs
git diff --check
```

完整性测试最终 8/8，通过；全量测试最终 150/150，通过。无新增构建警告；原有 >500 kB bundle 提示仍存在。浏览器详细输出与退出码见下方最终门禁记录。

## 最终门禁输出

以下为最终实际命令输出（单元测试保留汇总，构建保留产物与已有警告；省略单项用例耗时）。各命令均退出 0。

```text
$ npm test
1..150
# tests 150
# suites 0
# pass 150
# fail 0
# cancelled 0
# skipped 0
# todo 0

$ npm run check
> anatomy-studio@0.1.0 check
> tsc --noEmit

$ npm run build
> anatomy-studio@0.1.0 build
> vite build

vite v8.0.13 building client environment for production...
transforming...✓ 2521 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.63 kB │ gzip:   0.47 kB
dist/assets/index-C8cW-ZzL.css    259.79 kB │ gzip:  44.52 kB
dist/assets/index-B2_ZEsZI.js   1,201.98 kB │ gzip: 342.28 kB

✓ built in 466ms
[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.

$ node scripts/validate-server.mjs
$ node scripts/validate-interactions.mjs
Static server: 5 JSON artifacts HTTP 200 / application/json / parse passed; homepage, assets, model headers, path/method boundaries passed.
Explanations 404 1440×900: real 4086-question shell, five options and submitted 解析暂不可用 passed.
Explanations 404 390×844: real 4086-question shell, five options and submitted 解析暂不可用 passed.
atlas.json: packing at desktop/mobile aspect ratios and search/inspection contracts passed.
Tap, drag, multitouch, cancellation, and empty-view checks passed.
Deterministic production contracts: default 0 / opt-in 39 point IDs, pending labels, Escape lifecycle, persisted/undoable draft Blob export, and immutable formal data passed.
Cards hydration: delayed and failed CMB preserve exam repetitions=7; loading/error never claim an empty deck.
Cards browser 1440×900: four decks, DOM isolation, pointer/keyboard, ratings, correction refresh and layout passed.
Cards browser 390×844: four decks, DOM isolation, pointer/keyboard, ratings, correction refresh and layout passed.
Cards browser 320×568: four decks, DOM isolation, pointer/keyboard, ratings, correction refresh and layout passed.
Browser 1440×900: default 0 / opt-in 39 seeds, truthful 0/39/344 counts, dashed hollow markers, surface pick, nudge/undo and pending-only Blob export passed.
Browser 390×844: default 0 / opt-in 39 seeds, truthful 0/39/344 counts, dashed hollow markers, surface pick, nudge/undo and pending-only Blob export passed.
Acceptance 1440×900: sourced matched/unmatched submissions, Chinese anatomy selection, optional details, 0–100% explosion/reset, Emily AI popup and all mode layouts passed.
Acceptance 390×844: sourced matched/unmatched submissions, Chinese anatomy selection, optional details, 0–100% explosion/reset, Emily AI popup and all mode layouts passed.

$ git diff --check
(no output)
```
