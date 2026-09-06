import { useEffect, useMemo, useState } from 'react';
import { ACUPOINTS } from './data';
import { placementCounts } from './placement-quality';
import { CALIBRATION_DRAFT_STORAGE_KEY, parseCalibrationDrafts, upsertCalibrationDraft, undoCalibrationDraft, exportCalibrationDraftPackage, type CalibrationDraft, type CalibrationDraftStore, type PlacementSide } from './calibration';
import { persistCalibrationDrafts } from './calibration-ui';
import type { CalibrationPick, CalibrationSelection } from './calibration-pick';

type Props = {
  open: boolean; modelVersion: string; selection: CalibrationSelection; pick?: CalibrationPick;
  onSelection: (selection: CalibrationSelection) => void; onClose: () => void;
};
const sideNames = { left: '左侧', right: '右侧', midline: '正中' };

export default function CalibrationPanel({ open, modelVersion, selection, pick, onSelection, onClose }: Props) {
  const context = useMemo(() => ({ knownPointIds: new Set(ACUPOINTS.map(p => p.id)), bilateralPointIds: new Set(ACUPOINTS.filter(p => p.bilateral).map(p => p.id)), atlasVersion: modelVersion }), [modelVersion]);
  const [store, setStore] = useState<CalibrationDraftStore>(() => parseCalibrationDrafts(null, context));
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const point = ACUPOINTS.find(p => p.id === selection.pointId)!;
  const current = store.drafts.find(d => d.pointId === selection.pointId && d.side === selection.side);
  const counts = placementCounts(ACUPOINTS.map(p => p.id));
  useEffect(() => {
    try { setStore(parseCalibrationDrafts(localStorage.getItem(CALIBRATION_DRAFT_STORAGE_KEY), context)); }
    catch (e) { setWarning(`未能读取已有草稿，当前会话可以继续：${e instanceof Error ? e.message : '存储不可用'}`); }
    setLoaded(true);
  }, [context]);

  const commit = (next: CalibrationDraftStore) => {
    setStore(next);
    try {
      const saved = persistCalibrationDrafts(next, context, { setItem: (key, value) => localStorage.setItem(key, value) });
      setWarning(saved.warning); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : '草稿验证失败'); }
  };

  useEffect(() => {
    if (!pick || !loaded) return;
    const existing = store.drafts.find(d => d.pointId === pick.pointId && d.side === pick.side);
    const candidate: CalibrationDraft = {
      id: existing?.id ?? `${pick.pointId}-${pick.side}`, pointId: pick.pointId, side: pick.side,
      status: 'pending-review', position: pick.position, normal: pick.normal, evidence: existing?.evidence ?? '', reviewer: existing?.reviewer ?? '', modelVersion: pick.modelVersion, updatedAt: new Date().toISOString(),
    };
    try { commit(upsertCalibrationDraft(store, candidate, pick, context)); }
    catch (e) { setError(e instanceof Error ? e.message : '拾取结果验证失败'); }
    // A pick is an event; metadata edits must not replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick, loaded]);

  useEffect(() => {
    const preview = current ? { position: current.position, normal: current.normal, surfaceDistance: 0 } : undefined;
    onSelection({ ...selection, preview });
    // Only a changed draft updates the independent scene preview.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const edit = (changes: Partial<CalibrationDraft>) => {
    if (!current) return;
    const next = { ...current, ...changes, updatedAt: new Date().toISOString() };
    try { commit(upsertCalibrationDraft(store, next, { position: next.position, normal: next.normal, surfaceDistance: 0 }, context)); }
    catch (e) { setError(e instanceof Error ? e.message : '编辑验证失败'); }
  };
  const download = () => {
    try {
      const json = exportCalibrationDraftPackage(store, context, { requireReviewDetails: true });
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'jingwei-calibration-drafts.json';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : '导出失败'); }
  };
  return <aside id="calibration-panel" hidden={!open} className="detail-panel calibration-panel" aria-label="三维坐标校准草稿">
    <div className="calibration-heading"><h2>坐标校准草稿</h2><button type="button" className="outline-button" onClick={onClose}>关闭校准</button></div>
    <p>正式数据：已校准 {counts.calibrated} · 待专业校准 {counts['pending-review']} · 未登记 {counts.unregistered}</p>
    <p>草稿仅为 pending-review；须经专业复核与代码审查后才能提升为正式校准数据。</p>
    <label>穴位（383）<select aria-label="校准穴位" value={point.id} onChange={e => { const next = ACUPOINTS.find(p => p.id === e.target.value)!; onSelection({ enabled: false, pointId: next.id, side: next.bilateral ? 'left' : 'midline' }); }}>
      {ACUPOINTS.map(p => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
    </select></label>
    <label>侧别<select aria-label="校准侧别" value={selection.side} onChange={e => onSelection({ ...selection, enabled: false, side: e.target.value as PlacementSide, preview: undefined })}>
      {(point.bilateral ? ['left', 'right'] as const : ['midline'] as const).map(side => <option key={side} value={side}>{sideNames[side]}</option>)}
    </select></label>
    <button type="button" className="primary-button" aria-pressed={selection.enabled} disabled={!loaded} onClick={() => onSelection({ ...selection, enabled: !selection.enabled })}>{selection.enabled ? '取消表面拾取' : '开始表面拾取'}</button>
    <p role="status">{selection.enabled ? '点击人体表面保存一个草稿点；拖动仍可旋转。Escape 先退出拾取。' : '选择穴位和侧别后，在模型上拾取表面位置。'}</p>
    {current ? <>
      <p className="calibration-vector">模型坐标（米）：{current.position.map(n => n.toFixed(4)).join(' / ')}<br/>法线：{current.normal.map(n => n.toFixed(3)).join(' / ')}</p>
      <div className="calibration-nudge" aria-label="坐标微调">
        {(['x', 'y', 'z'] as const).map((axis, i) => <div key={axis}><span>{axis}</span>{([-1, 1] as const).map(direction => <button type="button" key={direction} className="outline-button" onClick={() => { const position = [...current.position] as [number, number, number]; position[i] += direction * .001; edit({ position }); }}>{axis} {direction < 0 ? '−' : '+'}0.001 m</button>)}</div>)}
      </div>
      <button type="button" className="outline-button" onClick={() => commit(undoCalibrationDraft(store, current.id))}>撤销坐标编辑（最多十步）</button>
      <label>定位依据（导出必填）<textarea aria-label="定位依据" value={current.evidence} onChange={e => edit({ evidence: e.target.value })}/></label>
      <label>复核人（导出必填）<input aria-label="复核人" value={current.reviewer} onChange={e => edit({ reviewer: e.target.value })}/></label>
    </> : <p>此穴此侧暂无草稿；不会生成猜测坐标。</p>}
    <button type="button" className="outline-button" disabled={!store.drafts.length} onClick={download}>导出校准草稿 JSON（{store.drafts.length}）</button>
    <small>导出包中的每条草稿都须填写定位依据与复核人。切换穴位可继续编辑已有草稿。</small>
    {warning && <p role="status">{warning}</p>}{error && <p role="alert">{error}</p>}
  </aside>;
}
