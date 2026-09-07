import type { SystemId } from "../anatomy";
import { ANATOMY_TERMS, type AnatomyTerm } from "./anatomy-terms.ts";
import { anatomyZhWithTerms } from './anatomy-zh-base.ts';
export const SYSTEM_ZH: Record<SystemId, string> = {
  skeletal: "骨骼",
  muscular: "肌肉",
  cardiac: "心脏",
  sensory: "感觉器官",
  arterial: "动脉",
  venous: "静脉",
  nervous: "神经",
  respiratory: "呼吸系统",
  digestive: "消化系统",
  urinary: "泌尿系统",
  lymphatic: "淋巴系统",
  endocrine: "内分泌",
  reproductive: "生殖系统",
  integumentary: "体表",
  connective: "结缔组织",
};
export function anatomyZh(name: string): string {
  return anatomyZhWithTerms(name, ANATOMY_TERMS);
}

export function anatomyNameEvidence(name: string): AnatomyTerm | null {
  const lower = name.trim().toLowerCase();
  const core = lower.startsWith("left ") ? lower.slice(5) : lower.startsWith("right ") ? lower.slice(6) : lower;
  return ANATOMY_TERMS[core] ?? null;
}

export function anatomyNameCoverage(parts: ReadonlyArray<{ name: string }>): {
  total: number;
  translated: number;
  unresolved: number;
} {
  const translated = parts.reduce((count, part) => count + Number(anatomyZh(part.name) !== part.name), 0);
  return { total: parts.length, translated, unresolved: parts.length - translated };
}

/** Chinese-first display only; do not pretend untranslated source names were verified. */
export function anatomyLabel(name: string, id: string, system?: SystemId): string {
  const translated = anatomyZh(name);
  return translated === name && /[a-z]/i.test(name)
    ? `${system ? SYSTEM_ZH[system] : '解剖'}结构 ${id}（中文名待校对）`
    : translated;
}
