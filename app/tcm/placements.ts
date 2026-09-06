// Approximate seeds for this fixed BodyParts3D adult male mesh, in model metres.
// Surface projection only corrects depth. It does NOT validate clinical location.
export type Vec3 = [number, number, number];
export interface Placement {
  position: Vec3;
  normal: Vec3;
}
const front: Vec3 = [0, 0, 1],
  back: Vec3 = [0, 0, -1];
const p = (x: number, y: number, z: number, normal: Vec3 = front): Placement => ({
  position: [x, y, z],
  normal,
});
export const PLACEMENTS: Record<string, Placement> = {
  LU1: p(0.14, 1.37, 0.07),
  LU5: p(0.23, 1.115, 0.015),
  LU7: p(0.276, 0.925, 0.032),
  LU9: p(0.277, 0.89, 0.03),
  LI4: p(0.287, 0.839, 0.044, back),
  LI10: p(0.247, 1.068, -0.005),
  LI11: p(0.246, 1.117, -0.013),
  LI20: p(0.019, 1.563, 0.091),
  ST25: p(0.046, 1.08, 0.105),
  ST36: p(0.105, 0.382, 0.006),
  ST40: p(0.121, 0.28, 0.002),
  ST44: p(0.082, 0.021, 0.1, [0, 1, 0.3]),
  SP6: p(0.041, 0.151, -0.024, [-1, 0, 0.2]),
  SP9: p(0.035, 0.42, -0.027, [-1, 0, 0]),
  SP10: p(0.058, 0.532, 0.024),
  HT7: p(0.237, 0.885, 0.039),
  SI3: p(0.23, 0.812, 0.045),
  SI11: p(0.114, 1.335, -0.117, back),
  BL13: p(0.037, 1.391, -0.098, back),
  BL20: p(0.038, 1.187, -0.094, back),
  BL23: p(0.039, 1.108, -0.107, back),
  BL40: p(0.077, 0.451, -0.078, back),
  BL60: p(0.107, 0.066, -0.052, [1, 0, 0]),
  KI1: p(0.073, 0.008, 0.06, [0, -1, 0]),
  KI3: p(0.04, 0.07, -0.048, [-1, 0, 0]),
  PC6: p(0.258, 0.951, 0.036),
  PC7: p(0.258, 0.889, 0.04),
  TE5: p(0.255, 0.954, -0.029, back),
  TE14: p(0.202, 1.381, -0.031, back),
  GB20: p(0.034, 1.5, -0.072, back),
  GB21: p(0.106, 1.438, -0.035, [0, 1, 0]),
  GB34: p(0.117, 0.406, -0.025, [1, 0, 0.2]),
  LR3: p(0.058, 0.042, 0.067, [0, 1, 0]),
  GV14: p(0, 1.445, -0.092, back),
  GV20: p(0, 1.718, -0.009, [0, 1, 0]),
  CV4: p(0, 0.999, 0.105),
  CV6: p(0, 1.04, 0.115),
  CV12: p(0, 1.176, 0.106),
  CV17: p(0, 1.315, 0.11),
};
