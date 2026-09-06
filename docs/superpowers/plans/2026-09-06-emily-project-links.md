# Emily AI Project Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the user-approved, unobtrusive website promotion entry points to the existing atlas.

**Architecture:** Render ordinary external anchors in the existing header, About modal and footer. A small presentation-only module owns these links and the About introduction; no router, state, tracking or new modal.

**Tech Stack:** React 19, TypeScript, existing CSS, Node test runner and react-dom/server.

## Global Constraints

- Header text: 更多 AI 项目 ↗; destination https://emilyailab.com/; adjacent to 我的学习 and separate from learning-mode navigation.
- About section title: 认识 Emily AI; description: 将 AI 用于真实的学习与工作场景，提供学习工具、AI 咨询与项目落地服务。
- About links: 查看更多项目 ↗ to https://emilyailab.com/ and 了解 AI 咨询 ↗ to https://emilyailab.com/consulting.
- Footer supplementary link: 更多项目 · Emily AI ↗ to https://emilyailab.com/.
- Every new external link uses target="_blank" and rel="noopener noreferrer"; no learning-state change, no popup, no tracking, no model overlay.
- Preserve Human Atlas, BodyParts3D, CMB and medical source attributions; keep Emily AI introduction separate from source attribution.
- Preserve ivory/dark-brown/orange styling, readable keyboard focus, and usable header/nav at desktop and mobile widths.
- No dependencies, model/medical/question data changes, storage changes, deployment, or edits to existing Claude Design handoff materials.

---

### Task 1: Add responsive project links and About introduction

**Files:**
- Create: `app/tcm/EmilyLinks.ts` (presentation-only React components, createElement keeps this tiny module directly testable by the existing strip-types runner)
- Modify: `app/tcm/TcmApp.tsx` (header/About/footer mounts only)
- Modify: `app/tcm/tcm.css` (scoped styles and responsive placement)
- Create: `tests/emily-links.test.ts`

**Interfaces:**
- Consumes: React createElement and existing header/modal/footer containers.
- Produces: `EmilyProjectLink({ placement }: { placement: 'header' | 'footer' })`, `EmilyAboutSection()`.

- [ ] Write real-render tests before implementation. Import the components and render using `renderToStaticMarkup(createElement(...))`. Parse anchor attributes from rendered HTML to assert literal destinations, new-tab and opener isolation for header/footer and both About links. A missing link, wrong destination, missing target or missing rel token must fail. Do not grep production source or install DOM packages.

```ts
const markup = renderToStaticMarkup(createElement(EmilyProjectLink, { placement: 'header' }));
assert.match(markup, /href="https:\/\/emilyailab\.com\/"/);
assert.match(markup, /target="_blank"/);
assert.match(markup, /rel="noopener noreferrer"/);
```

- [ ] Run focused test with `node --experimental-strip-types --test tests/emily-links.test.ts`; document expected initial missing-component failure, then actual contract assertions on GREEN. Use literal expected URLs; no mocked React.
- [ ] Implement `EmilyProjectLink` with a native anchor; select only display label/class from placement, use the fixed homepage URL. Add an accessible new-tab hint using title. Implement `EmilyAboutSection` as a labelled section with heading, description and two links, using the exact copy/URLs above.

```ts
return createElement('a', {
  className: `emily-project-link emily-project-link--${placement}`,
  href: 'https://emilyailab.com/', target: '_blank', rel: 'noopener noreferrer',
  title: '在新标签页打开 Emily AI',
}, placement === 'header' ? '更多 AI 项目 ↗' : '更多项目 · Emily AI ↗');
```

- [ ] Mount header link immediately before header-progress; put About introduction after existing lead description and before medical/model sections, visually separated. Put footer link next to existing footer text. Do not rename/remove the existing 资料与署名 entry.
- [ ] Add restrained outline styling for header, simple footer text link and bounded About section. Use min-width:0/overflow for learning nav rather than page overflow; retain complete link label on mobile, use a header first row brand+link and second row horizontally scrollable learning nav if needed. Avoid adding vertical space to the desktop header or any model overlay. Check 1512, 1280, 1024, 768 and 390 px widths via controller browser after build.
- [ ] Run focused test, full `npm test`, `npm run check`, `npm run build`, `git diff --check`; no browser mutation by implementer (controller owns live tab).
- [ ] Self-review, commit only task files and report RED/GREEN, test totals, changed files and concerns. Do not stage unrelated dirty handoff docs.

Controller acceptance: verify visible link/URLs/target/rel in live DOM, safe external navigation keeps atlas tab/state, About source links remain, no header overlap or horizontal page overflow at named widths, slider remains usable, restore original viewport. Record results before final handoff. Work remains in the established feature checkout serving localhost:3016; do not create a second server/worktree.
