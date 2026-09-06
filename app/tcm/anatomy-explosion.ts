import type { Part } from "../anatomy";
import type { LayoutCell } from "../explosion-layout";

export type Vec3Tuple = [number, number, number];

export function explosionCameraPose(normalDistance: number, gridDistance: number, amount: number, view: string) {
  const yaw = view === 'back' ? Math.PI : view === 'side' ? Math.PI / 2 : 0.08;
  const t = Math.max(0, Math.min(1, amount));
  return { distance: normalDistance + (gridDistance - normalDistance) * t, yaw: yaw * (1 - t) };
}

export function explosionOffset(part: Part, cell: LayoutCell, amount: number): Vec3Tuple {
  const t = Math.max(0, Math.min(1, amount));
  if (t === 0) return [0, 0, 0];
  const center: Vec3Tuple = [
    (part.bounds[0][0] + part.bounds[1][0]) / 2,
    (part.bounds[0][1] + part.bounds[1][1]) / 2,
    (part.bounds[0][2] + part.bounds[1][2]) / 2,
  ];
  return [(cell.x - center[0]) * t, (cell.y + 0.85 - center[1]) * t, -center[2] * t];
}

/** The tolerance prevents a damped transition from leaving overlays hidden forever. */
export function overlaysAllowed(amount: number): boolean {
  return amount <= 0.001;
}

export function sceneDecorVisibility(amount: number, isolate: boolean) {
  return { overlays: overlaysAllowed(amount), stage: !isolate && amount < 0.5 };
}

export function shouldUpdateExplosionTransforms(
  previousAmount: number,
  amount: number,
  optionsChanged: boolean,
  layoutChanged: boolean,
): boolean {
  return amount !== previousAmount || optionsChanged || layoutChanged;
}

export function translatedBounds(
  bounds: [number[], number[]],
  offset: Vec3Tuple,
): [Vec3Tuple, Vec3Tuple] {
  return [
    [bounds[0][0] + offset[0], bounds[0][1] + offset[1], bounds[0][2] + offset[2]],
    [bounds[1][0] + offset[0], bounds[1][1] + offset[1], bounds[1][2] + offset[2]],
  ];
}
