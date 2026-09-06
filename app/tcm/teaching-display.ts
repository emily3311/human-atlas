import type { SystemId } from "../anatomy";

export const teachingSystems = (ids: SystemId[]): SystemId[] =>
  ids.filter((id) => id !== "integumentary");
