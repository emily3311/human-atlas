import { useMemo, useState, useEffect } from 'react';
import { Search, Layers, ChevronRight, Focus, RotateCcw, X } from 'lucide-react';
import { SYSTEMS, type Atlas, type Part, type SystemId } from '../anatomy';
import { anatomyZh, anatomyLabel, SYSTEM_ZH } from './anatomy-zh';

export function AnatomyCatalogue({atlas,visible,onVisible,onSelect,onClose,selected}: {
  atlas:Atlas; visible:SystemId[]; onVisible:(ids:SystemId[])=>void; onSelect:(p:Part)=>void; onClose:()=>void; selected:string;
}) {
  const [query,setQuery]=useState(''),[page,setPage]=useState(0);
  const matches=useMemo(()=>atlas.parts.filter(p=>
    visible.includes(p.system)&&`${p.name} ${anatomyZh(p.name)} ${p.id}`.toLowerCase().includes(query.toLowerCase().trim())
  ),[atlas,query,visible]);
  useEffect(()=>setPage(0),[query,visible]);
  const totalPages=Math.max(1,Math.ceil(matches.length/40));
  return <div className="anatomy-catalogue">
    <div className="anatomy-catalogue-header">
      <div className="section-kicker">HUMAN ATLAS · 原版解剖能力</div>
      <button className="icon-button" aria-label="关闭目录" onClick={onClose}><X size={18}/></button>
    </div>
    <h3>从整体，到每一处。</h3>
    <p className="mini-note">{atlas.parts.length.toLocaleString()} 个可选结构 · 可散开、缩放与单独查看</p>
    <div className="anatomy-system-actions">
      <button onClick={()=>onVisible(SYSTEMS.filter(s=>s.id!=='integumentary').map(s=>s.id))}>显示内部系统</button>
      <button onClick={()=>onVisible([])}>清空图层</button>
    </div>
    <div className="anatomy-system-list" aria-label="解剖系统筛选">
      {SYSTEMS.map(s=><label key={s.id}>
        <input type="checkbox" checked={visible.includes(s.id)} onChange={()=>onVisible(visible.includes(s.id)?visible.filter(id=>id!==s.id):[...visible,s.id])}/>
        {SYSTEM_ZH[s.id]}
      </label>)}
    </div>
    <div className="search-field">
      <Search size={15}/><input aria-label="搜索全部解剖结构" placeholder="结构名称 / 中文或英文" value={query} onChange={e=>setQuery(e.target.value)}/>
    </div>
    <div className="catalogue-summary">{matches.length} 个匹配结构 <span>第 {Math.min(page+1,totalPages)} / {totalPages} 页</span></div>
    <div className="anatomy-result-list">
      {matches.slice(page*40,(page+1)*40).map(p=><button key={p.id} className={p.id===selected?'selected':''} onClick={()=>onSelect(p)}>
        <span>{anatomyLabel(p.name,p.id,p.system)}<small>{p.id} · {SYSTEM_ZH[p.system]}</small></span><ChevronRight size={13}/>
      </button>)}
      {!matches.length&&<p className="mini-note">当前系统中没有匹配结构。可显示其他系统或使用英文名搜索。</p>}
    </div>
    <div className="anatomy-pagination">
      <button disabled={page===0} onClick={()=>setPage(p=>p-1)}>上一页</button>
      <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)}>下一页</button>
    </div>
  </div>;
}

export function AnatomyDetails({part,isolate,onIsolate,onTcm}: {part:Part|null;isolate:boolean;onIsolate:()=>void;onTcm:()=>void}) {
 return <section className="anatomy-detail-content">
   <div className="section-kicker"><Layers size={14}/> 解剖结构档案</div>
   <h2>{part?anatomyLabel(part.name,part.id,part.system):'点选任意解剖结构'}</h2>
   {part&&<details className="anatomy-original" key={part.id}><summary>原始英文名称与编号</summary><p>{part.name}</p><small>{part.id} · {part.conceptId}</small></details>}
   {part?<>
    <div className="point-tags"><span>{SYSTEM_ZH[part.system]}</span><span>BodyParts3D</span></div>
    <button className="primary-button full" onClick={onIsolate}><Focus size={16}/>{isolate?'显示周围结构':'单独查看此结构'}</button>
    <dl className="anatomy-facts"><dt>原始结构编号</dt><dd>{part.id}</dd><dt>概念编号</dt><dd>{part.conceptId}</dd></dl>
   </>:<p className="muted">在人体或散开的网格中点击部位，也可以从左侧完整目录搜索。悬停显示名称，点选后可单独放大。</p>}
   <section className="detail-section"><h3>解剖与中医，分层学习</h3><p>此处保留原版逐结构浏览。切回经穴图谱后，可继续查标准定位、复习卡与考纲范围。中医脏腑概念不等同于同名解剖器官。</p></section>
   <p className="quiet-note">中文名称优先；尚未核验的译名会明确提示待校对，原始英文可展开查看。散开状态不显示穴位。</p>
   <button className="outline-button full" onClick={onTcm}><RotateCcw size={15}/>复原并学习经穴</button>
 </section>;
}
