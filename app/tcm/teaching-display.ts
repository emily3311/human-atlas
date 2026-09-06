import type { SystemId } from "../anatomy";

export const teachingSystems = (ids: SystemId[]): SystemId[] =>
  ids.filter((id) => id !== "integumentary");

export const canIsolateTeachingPart = (system: SystemId): boolean =>
  system !== "integumentary";
