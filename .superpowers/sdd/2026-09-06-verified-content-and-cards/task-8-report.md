# Task 8 — 四类可翻面知识卡 UI

状态：完成；报告随实现提交。

## 实现

- 新增 `KnowledgeCardsPanel`，接入 Task 7 的四个 builders，展示「穴位 / 解剖 / 执医错题 / 穴位作用」及构建数组的真实数量。当前默认完整范围为 755 / 1384 / 由本机最新错题决定 / 14；题型和坐标显示范围改变时按 builders 重算。穴位筛选为空不会挡住其它卡组。
- 保留旧 `StudyPanel.placementDisplayMode`、定位/归经/分类/认穴切换、三维揭示和旧 `ratePoint` store。穴位评分后从当前筛选范围的到期队列选择下一穴；可不评分直接下一张。
- 新增 `knowledge-card-ui.ts` 作为组件实际使用的纯 view-model 和 React 卡面渲染边界。`knowledgeDeckOptions` 只读实际数组；`visibleCardFace` 只返回当前面；`flipKeyAction` 只接受卡片自身有焦点的 Enter / Space。新旧 UI 都只挂载一个卡面分支，未翻面时背面及答案来源不会留在 DOM。翻面按钮具有更新的 accessible label、`aria-pressed`，并阻止 Space 默认滚动。
- 新增 `knowledge-card-resources.ts`，不依赖 ExamPanel state。每次 cards 模式挂载独立请求两份资源，通过现有 parser 校验；读取当前 `jingwei-cmb-progress-v1` 时使用有效 CMB IDs。CMB 失败仅显示错题卡组错误；解析失败保留 CMB 原始答案并在错题卡组说明。其它三组持续可用。离开再进入会重读进度，也监听跨窗口 storage/focus 刷新。已改正题目从当前卡组消失时自动显示首张剩余卡，CMB attempts 不被写入或删除。
- 解剖、错题、功用评分调用 `rateKnowledgeCard`，传入从当前 available cards 构建的 `ReadonlySet`；保存在独立 knowledge store。评分后使用当前 deck 的 due queue；存储异常保留会话评分并提示。
- 四种空态分别使用简报要求的文案。手机卡组横向滚动，焦点环可见，翻面区域全宽且至少 280px，长答案自然增高和换行。题型、卡组、评分、下一张和来源链接的手机点击区域至少 44px。

## TDD 与自审

采用 test-driven-development 和 verification-before-completion。新增测试使用真实生产 view-model、React server rendering、真实浏览器 DOM / 键盘 / 鼠标 / 存储边界，未使用源码 grep 断言。

实际观察到的 RED：

1. 首轮聚焦测试 21 项中 2 项失败：四组数量/单面 view-model 和焦点键盘策略缺失。
2. 资源读取回归失败：独立 loader 尚不存在；实现后验证解析失败仍能构建错题答案卡、改正后消失且 attempts 保留、CMB 请求失败给出错题错误。
3. 浏览器无法找到「知识卡组」，确认新四组 UI 缺失。
4. 浏览器检查旧穴位评分后仍顺序进入「条口」，而当前首张到期卡是「中府」；改为按更新后的旧 store 到期队列选择后通过。
5. 真实功用卡 React 渲染包含旧免责声明中的「疗效」「针刺深度」。在 view-model 中仅将两句警示改述为「不能据此推断临床结论」「本资料不提供侵入性操作建议」，仍保留「请勿自行针刺」以及孕期/深部结构警示。正式资料和 builders 未修改。全部真实功用卡与字面 fixture 的 SSR 用例通过，浏览器也验证实际卡背无禁词。
6. 浏览器发现手机来源链接不足 44px；扩展来源行点击区域后回归通过。

自审核对：新 store 调用点明确携带当前集合，旧 store 独立；资源错误没有提升为 TcmApp 全局错误；卡组为空仍能切换；正面 DOM 不含错题正确答案/解析；另一卡组的背面不会残留；保存 CMB 历史不是新卡片组件的职责。截图检查 390 / 320 宽度下的真实功用卡排版，临时截图位于 `/tmp/task8-preview.uS7hA7/`，未提交截图。

## 最终验证

- `node --experimental-strip-types --test tests/knowledge-cards.test.ts tests/content.test.ts`：23 / 23，通过。
- `npm test`：140 / 140，通过，0 failures。
- `npm run check`：退出 0。
- `npm run build`：退出 0；保留已有 >500kB bundle 提示。
- `node scripts/validate-interactions.mjs`：退出 0。默认仅运行已有确定性交互策略，并明确提示真实浏览器需要环境变量。
- 使用以下命令运行完整浏览器 validator：退出 0。四组 UI 在 1440×1000、390×844、320×568 均通过；原 Task 6 的 1440px / 390px 校准检查也通过。
- `git diff --check`：退出 0。

```sh
INTERACTION_BROWSER_URL=http://127.0.0.1:3028/ \
PLAYWRIGHT_MODULE=/Users/emily/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs \
node scripts/validate-interactions.mjs
```

四组浏览器覆盖：真实 builder 计数、鼠标翻面、Enter / Space 翻面、卡片外键盘不翻面、背面/正面互斥 DOM、超长解析不溢出卡片、评分后首张到期卡、旧/新 store 路由、改正后重新进入错题数量归零且 attempts=4、CMB 503 时其它三组正常、穴位过滤为空时解剖卡正常、手机无横向页面溢出及 44px 控件/来源链接。

所有自动化浏览器使用新建的临时 Chromium context。卡片流程把 Storage API 注入为内存 Map，CMB 题目/解析来自完整格式的 route fixture；未读取、清空或提交真实用户 localStorage。
