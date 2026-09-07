import { CALIBRATION_DRAFT_STORAGE_KEY, exportCalibrationDraftPackage, type CalibrationContext, type CalibrationDraftStore } from './calibration.ts';

export function calibrationEscape(state: { open: boolean; enabled: boolean }) {
  return { open: state.enabled ? state.open : false, enabled: false };
}

export function persistCalibrationDrafts(store: CalibrationDraftStore, context: CalibrationContext, storage: Pick<Storage, 'setItem'>) {
  // Validation errors propagate; only storage failures retain the current validated state.
  const serialized = exportCalibrationDraftPackage(store, context);
  try { storage.setItem(CALIBRATION_DRAFT_STORAGE_KEY, serialized); return { store, warning: '' }; }
  catch { return { store, warning: '浏览器未能保存校准草稿；当前会话仍保留编辑，请及时导出。' }; }
}
