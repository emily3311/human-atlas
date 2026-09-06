import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { EmilyAboutSection, EmilyProjectLink } from "../app/tcm/EmilyLinks.ts";

function anchors(markup: string) {
  return [...markup.matchAll(/<a\s+([^>]+)>(.*?)<\/a>/g)].map((match) => ({
    attributes: match[1],
    label: match[2].replace(/<[^>]+>/g, ""),
  }));
}

function assertSafeExternalLink(
  anchor: { attributes: string; label: string },
  expectedLabel: string,
  expectedUrl: string,
) {
  assert.equal(anchor.label, expectedLabel);
  assert.match(anchor.attributes, new RegExp(`href="${expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  assert.match(anchor.attributes, /target="_blank"/);
  assert.match(anchor.attributes, /rel="noopener noreferrer"/);
}

test("project links lead to Emily AI without replacing the learning session", () => {
  const header = anchors(
    renderToStaticMarkup(createElement(EmilyProjectLink, { placement: "header" })),
  );
  const footer = anchors(
    renderToStaticMarkup(createElement(EmilyProjectLink, { placement: "footer" })),
  );

  assert.equal(header.length, 1);
  assertSafeExternalLink(header[0], "更多 AI 项目 ↗", "https://emilyailab.com/");
  assert.equal(footer.length, 1);
  assertSafeExternalLink(footer[0], "更多项目 · Emily AI ↗", "https://emilyailab.com/");
});

test("About introduces Emily AI and offers both safe external destinations", () => {
  const markup = renderToStaticMarkup(createElement(EmilyAboutSection));
  const links = anchors(markup);

  assert.match(markup, />认识 Emily AI<\/h3>/);
  assert.match(
    markup,
    />将 AI 用于真实的学习与工作场景，提供学习工具、AI 咨询与项目落地服务。<\/p>/,
  );
  assert.equal(links.length, 2);
  assertSafeExternalLink(links[0], "查看更多项目 ↗", "https://emilyailab.com/");
  assertSafeExternalLink(
    links[1],
    "了解 AI 咨询 ↗",
    "https://emilyailab.com/consulting",
  );
});
