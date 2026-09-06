import type { Atlas, Part } from "../anatomy";

export interface TeachingSystemCorrection {
  id: string;
  name: string;
  from: Part["system"];
  to: Part["system"];
  rationale: string;
  sources: readonly string[];
}

/** Six inspected teaching corrections; this is not a general classification audit. */
export const TEACHING_SYSTEM_CORRECTIONS: readonly TeachingSystemCorrection[] = [
  ["FJ1409", "Right fibularis brevis", 2653, 622],
  ["FJ1409M", "Left fibularis brevis", 2653, 622],
  ["FJ1410", "Right fibularis longus", 2652, 623],
  ["FJ1410M", "Left fibularis longus", 2652, 623],
  ["FJ1411", "Right fibularis tertius", 2649, 624],
  ["FJ1411M", "Left fibularis tertius", 2649, 624],
].map(([id, name, ta2, naer]) => ({
  id: String(id), name: String(name), from: "skeletal", to: "muscular",
  rationale: `TA2 ${ta2} 将该结构列为 muscle，NAER ${naer} 对应条目为 M. fibularis。`,
  sources: ["https://libraries.dal.ca/Fipat/ta2.html", "https://data.gov.tw/en/datasets/14549"],
}));

const correctionById = new Map(TEACHING_SYSTEM_CORRECTIONS.map((record) => [record.id, record]));

/** Returns an immutable teaching view without modifying the raw manifest or input records. */
export function normalizeTeachingAtlas(atlas: Atlas): Atlas {
  let changed = false;
  const parts = atlas.parts.map((part) => {
    const correction = correctionById.get(part.id);
    if (!correction || part.name !== correction.name || part.system !== correction.from) return part;
    changed = true;
    return { ...part, system: correction.to };
  });
  return changed ? { ...atlas, parts } : atlas;
}
