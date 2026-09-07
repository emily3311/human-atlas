import { createElement } from "react";

const EMILY_AI_URL = "https://emilyailab.com/";
const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
  title: "在新标签页打开 Emily AI",
} as const;

export function EmilyProjectLink({ placement }: { placement: "header" | "footer" }) {
  return createElement(
    "a",
    {
      className: `emily-project-link emily-project-link--${placement}`,
      href: EMILY_AI_URL,
      ...EXTERNAL_LINK_PROPS,
    },
    placement === "header" ? "Emily AI 出品 ↗" : "更多项目 · Emily AI ↗",
  );
}

export function EmilyAboutSection() {
  return createElement(
    "section",
    { className: "emily-about", "aria-labelledby": "emily-about-title" },
    createElement("h3", { id: "emily-about-title" }, "认识 Emily AI"),
    createElement(
      "p",
      null,
      "将 AI 用于真实的学习与工作场景，提供学习工具、AI 咨询与项目落地服务。",
    ),
    createElement(
      "div",
      { className: "emily-about-links" },
      createElement("a", { href: EMILY_AI_URL, ...EXTERNAL_LINK_PROPS }, "查看更多项目 ↗"),
      createElement(
        "a",
        { href: "https://emilyailab.com/consulting", ...EXTERNAL_LINK_PROPS },
        "了解 AI 咨询 ↗",
      ),
    ),
  );
}
