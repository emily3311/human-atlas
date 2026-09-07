import * as T from 'three';
import type { PlacementSide, SurfaceHit } from './calibration.ts';

export type CalibrationPick = SurfaceHit & { pointId: string; side: PlacementSide; modelVersion: string };
export type CalibrationSelection = { enabled: boolean; pointId: string; side: PlacementSide; preview?: SurfaceHit };

/** Calibration and anatomy selection own mutually exclusive tap paths, including misses. */
export function dispatchSceneTap(
  calibration: CalibrationSelection | undefined, surface: T.Mesh | undefined, ray: T.Raycaster,
  modelVersion: string, onPick: (pick: CalibrationPick) => void, onAnatomy: () => void,
): void {
  if (!calibration?.enabled) { onAnatomy(); return; }
  if (!surface) return;
  surface.updateMatrixWorld(true);
  for (const hit of ray.intersectObject(surface, false)) {
    if (!hit.face) continue;
    const worldNormal = hit.face.normal.clone().applyNormalMatrix(new T.Matrix3().getNormalMatrix(surface.matrixWorld)).normalize();
    if (worldNormal.dot(ray.ray.direction) >= 0) continue;
    const position = surface.worldToLocal(hit.point.clone());
    const triangle = new T.Triangle(
      surface.getVertexPosition(hit.face.a, new T.Vector3()),
      surface.getVertexPosition(hit.face.b, new T.Vector3()),
      surface.getVertexPosition(hit.face.c, new T.Vector3()),
    );
    const surfaceDistance = triangle.closestPointToPoint(position, new T.Vector3()).distanceTo(position);
    onPick({ pointId: calibration.pointId, side: calibration.side, position: position.toArray(), normal: hit.face.normal.clone().normalize().toArray(), surfaceDistance, modelVersion });
    return;
  }
}
