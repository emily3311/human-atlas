import { readFileSync } from 'node:fs';
import { ACUPOINTS } from '../app/tcm/data.ts';
import { validateCalibrationPackage } from '../app/tcm/calibration.ts';
import { BODY_PARTS_3D_MODEL_VERSION } from '../app/tcm/placements.ts';

const inputPath = process.argv[2];
if (process.argv.length !== 3 || !inputPath) {
  console.error('Usage: node --experimental-strip-types scripts/validate-calibration-package.ts <package.json>');
  process.exitCode = 1;
} else {
  let source: string;
  try {
    source = readFileSync(inputPath, 'utf8');
  } catch (error) {
    console.error(`Unable to read calibration package: ${(error as Error).message}`);
    process.exitCode = 1;
    source = '';
  }
  if (!process.exitCode) {
    let packageValue: unknown;
    try {
      packageValue = JSON.parse(source);
    } catch {
      console.error('Calibration package contains invalid JSON');
      process.exitCode = 1;
    }
    if (!process.exitCode) {
      const result = validateCalibrationPackage(packageValue, {
        knownPointIds: new Set(ACUPOINTS.map((point) => point.id)),
        bilateralPointIds: new Set(ACUPOINTS.filter((point) => point.bilateral).map((point) => point.id)),
        atlasVersion: BODY_PARTS_3D_MODEL_VERSION,
      });
      if (!result.ok) {
        for (const error of result.errors) console.error(error);
        process.exitCode = 1;
      } else {
        console.log(`Calibration package is valid (${result.records.length} records).`);
      }
    }
  }
}
