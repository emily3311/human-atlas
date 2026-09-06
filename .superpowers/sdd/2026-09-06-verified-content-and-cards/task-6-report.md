# Task 6 — 坐标质量开关与校准工具

状态：完成；全部要求已覆盖。本报告随实现一同提交。

## 实现

- `TcmApp` 的显示模式是组件内状态，默认 `calibrated-only`，不持久化。统一读取质量 API 得到 0 已校准、39 待专业校准、344 未登记；只有主动勾选“显示教学示意（39）”才允许这些点进入场景 ID。目录、认穴卡、自测均遵守当前模式，文字定位继续可用。
- `markerPresentation` 同时提供待校准 CSS class 与可见/aria 标签“待专业校准·教学示意”。场景使用独立空心虚线圈样式；路线根据完整经脉目录切段，遇到未登记或不在显示范围的点即断开。
- `calibration-pick.ts` 使用真实 Three.js Raycaster，选择最近正面表面命中，将位置转换回模型坐标，返回归一化面法线、相对命中三角面的计算距离、穴位/侧别与实际 `atlas.version`。校准和解剖部位选择通过同一个互斥调度函数处理，包括拾取未命中情形。
- `CalibrationPanel` 可选全部 383 个条目及有效侧别，支持开始/取消拾取、每轴 ±0.001 m、最多十步坐标撤销、依据和复核人编辑、独立蓝色草稿预览、合法草稿本地保存与 Blob JSON 下载。草稿始终是 `pending-review`，无正式坐标晋升入口。
- 复用 Task 5 的 parse/upsert/undo/export API；在共享导出 API 增加可选 `requireReviewDetails`，复用原有字符串验证器强制依据与复核人必填。默认草稿保存仍允许编辑过程中的空字段。修复仅修改依据/复核人时耗尽坐标撤销历史的问题。
- 桌面面板使用右侧详情位置；手机以画布下方自然文档流抽屉展示，保持 360px 最小画布、44px 控件、不拦截 body 滚动。Escape 先退出拾取，再关闭面板。

## TDD 与自审

遵循 test-driven-development：先运行纯策略/真实行为测试观察 RED，再实现对应策略；未用源代码文本搜索代替测试。

观察到的 RED：默认显示控制、pending marker presentation、路线分段函数尚未提供；新拾取/面板策略缺失；草稿导出缺少必填约束；12 次元数据编辑后撤销仍返回 0.001 而非 0。

浏览器自审补充两个 RED 并修复：默认质量模式打开校准面板仍显示覆盖人体的文字卡；选择“三维示意点”目录后仍列出 39 个不在当前显示模式的条目。

## 验证

- 聚焦：`node --experimental-strip-types --test tests/placement-quality.test.ts tests/content.test.ts`，20 项通过。
- `npm test`，126 项通过。
- `npm run check`，退出 0。
- `npm run build`，退出 0；保留项目原有的大体积 bundle 提示。
- `node scripts/validate-interactions.mjs`，退出 0。默认运行确定性的真实生产策略、草稿编辑/撤销/Blob 导出、正式数据不变检查；明确打印未执行浏览器测试，不将其冒充布局验证。
- 另使用现有 Playwright/Chromium 运行真实 UI，1440×1000 和 390×1000 均通过：初始零可见标记、主动 opt-in 后待校准圈、可见及 aria 质量说明、383 个选择项、双侧/正中侧别、两阶段 Escape、实际画布点击产生草稿、±0.001 m 与撤销、依据缺失拒绝导出、实际 Storage 配额失败保留内存草稿和警告、成功 Blob 下载、重新加载恢复默认质量开关、无解剖部位误选、手机不横向溢出/画布 ≥360px/控件 ≥44px/面板使用自然滚动。
- `git diff --check`，退出 0。

浏览器复现（先启动 `npm run dev -- --port 3026`；Playwright 路径可替换为本机安装）：

```sh
INTERACTION_BROWSER_URL=http://127.0.0.1:3026/ \
PLAYWRIGHT_MODULE=/Users/emily/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs \
node scripts/validate-interactions.mjs
```

## 范围与后续接口

新增 `calibration-pick.ts` 与 `calibration-ui.ts` 为可运行的生产策略边界，便于无浏览器时执行确定性验证。`StudyPanel` 仅新增 `placementDisplayMode` prop 与当前显示范围说明；后续 Task 7 重构须保留该策略入口。

正式资料文件未改变。39 表示可选穴位 ID 数，不把左右侧 DOM 标记数或单视角可见数量混为一谈。浏览器自动化只验证交互与几何机制，不宣称医学定位已通过专业复核。
