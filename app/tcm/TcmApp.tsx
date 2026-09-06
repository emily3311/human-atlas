import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  Layers,
  RotateCcw,
  RotateCw,
  Pause,
  Focus,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowRight,
  Check,
  Star,
  Target,
  Brain,
  GraduationCap,
  GitCompareArrows,
  X,
  Info,
  ExternalLink,
  Compass,
  Lightbulb,
  ArrowUpRight,
  Menu,
  FileQuestion,
} from "lucide-react";
import { DEFAULT_VISIBLE, type Atlas, type Part, type SystemId } from "../anatomy";
import { ACUPOINTS, MERIDIANS } from "./data";
import AtlasScene, { type Layer, type SceneOptions } from "./AtlasScene";
import StudyPanel, { type CardType } from "./StudyPanel";
import CoursePanel from "./CoursePanel";
import CasesPanel from "./CasesPanel";
import { anatomyZh, anatomyLabel, SYSTEM_ZH } from "./anatomy-zh";
import { Slider } from '@/components/ui/slider';
import { AnatomyCatalogue, AnatomyDetails } from './AnatomyPanel';
import { hasPlacement, questionAvailable } from './catalogue';
import CatalogueResizeHandle from './CatalogueResizeHandle';
import { catalogueWidth, nextCatalogueExpansion } from './catalogue-layout';
import { canIsolateTeachingPart, teachingSystems } from './teaching-display';
import { normalizeTeachingAtlas } from './teaching-atlas';
import { inCatalogue, examBadges, EXAM_SOURCE, PRACTICAL_NAMES, WRITTEN_NAMES, type CatalogueScope } from './exam-scope';
import {
  STORE_KEY,
  parseStore,
  ratePoint,
  reviewQueue,
  nextId,
  quizDisplayIds,
  type StudyStore,
  type Rating,
} from "./study";
import type { Acupoint } from "./types";
import ExamPanel from "./ExamPanel";
import { EmilyAboutSection, EmilyProjectLink } from "./EmilyLinks";
import "./tcm.css";
import "./mobile.css";
import { workspacePolicy, type LearningMode } from "./mobile-layout";

type Mode = LearningMode;
type Scope = "all" | "favorites" | "review" | "course";
const ids = ACUPOINTS.map((p) => p.id);
const studyIds=ACUPOINTS.filter(p=>!!p.location).map(p=>p.id);
const nav = [
  { id: "anatomy", label: "解剖图谱", icon: Layers },
  { id: "explore", label: "经穴图谱", icon: Compass },
  { id: "cards", label: "记忆卡片", icon: Brain },
  { id: "quiz", label: "取穴自测", icon: Target },
  { id: "exam", label: "执医题库", icon: FileQuestion },
  { id: "course", label: "我的课堂", icon: GraduationCap },
  { id: "cases", label: "情境练习", icon: Lightbulb },
] as const;
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f\s]/g, "")
    .toLowerCase();
const layerChoices: [Layer, string][] = [
  ["muscle", "肌肉"],
  ["skeleton", "骨骼"],
  ["neuro", "神经血管"],
];
function Sources({ point }: { point: Acupoint }) {
  return (
    <details className="sources">
      <summary>
        资料来源与内容状态 <ExternalLink size={13} />
      </summary>
      <p>
        文字为教学整理，三维标记为参考模型示意，尚未完成逐点专业校准。传统功用不等同于现代临床疗效证据。
      </p>
      {point.sources.map((s, i) => (
        <a key={`${s.url}-${i}`} href={s.url} target="_blank" rel="noreferrer">
          {s.title}
          {s.section && <small>{s.section}</small>}
          <ArrowUpRight size={13} />
        </a>
      ))}
    </details>
  );
}
export default function TcmApp() {
  const taskRef = useRef<HTMLElement>(null);
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 680px)").matches);
  const [modelExpanded, setModelExpanded] = useState(false);
  const [modelFocus, setModelFocus] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [sceneError, setSceneError] = useState("");
  const [sceneAttempt, setSceneAttempt] = useState(0);
  const [metadataAttempt, setMetadataAttempt] = useState(0);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 680px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!modelFocus) return;
    const x = window.scrollX, y = window.scrollY;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; window.scrollTo(x, y); };
  }, [modelFocus]);
  const [atlas, setAtlas] = useState<Atlas | null>(null),
    [progress, setProgress] = useState(0),
    [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("explore"),
    [activeId, setActiveId] = useState("ST36"),
    [query, setQuery] = useState(""),
    [meridian, setMeridian] = useState("all"),
    [region, setRegion] = useState("all"),
    [tag, setTag] = useState("all"),
    [scope, setScope] = useState<Scope>("all");
  const [catalogueScope,setCatalogueScope]=useState<CatalogueScope>('all');
  const [explosionAmount,setExplosionAmount]=useState(0),[anatomySystems,setAnatomySystems]=useState<SystemId[]>(DEFAULT_VISIBLE.filter(id=>id!=="integumentary"&&id!=="reproductive"));
  const [anatomyDetailsOpen,setAnatomyDetailsOpen]=useState(false);
  const [layer, setLayer] = useState<Layer>("muscle"),
    [labels, setLabels] = useState(true),
    [routes, setRoutes] = useState(false),
    [guide, setGuide] = useState(false),
    [guideStep, setGuideStep] = useState(0),
    [view, setView] = useState<"front" | "back" | "side">("front"),
    [rotate, setRotate] = useState(false),
    [focus, setFocus] = useState(0),
    [reset, setReset] = useState(0);
  const [cardType, setCardType] = useState<CardType>("location"),
    [revealed, setRevealed] = useState(false),
    [quizAnswer, setQuizAnswer] = useState<string | null>(null),
    [compared, setCompared] = useState<string[]>([]),
    [comparisonOpen, setComparisonOpen] = useState(false),
    [about, setAbout] = useState(false),
    [sidebarOpen, setSidebarOpen] = useState(false),
    [notice, setNotice] = useState(""),
    [storageError, setStorageError] = useState("");
  const [filtersOpen,setFiltersOpen]=useState(false),
    [catalogueExpanded,setCatalogueExpanded]=useState(false),
    [sidebarWidth,setSidebarWidth]=useState(320);
  const [chosenPart, setChosenPart] = useState<Part | null>(null),
    [isolate, setIsolate] = useState(false),
    [anatomyQuery, setAnatomyQuery] = useState("");
  const [store, setStore] = useState<StudyStore>(() => {
    try {
      return parseStore(localStorage.getItem(STORE_KEY), ids);
    } catch {
      return parseStore(null, ids);
    }
  });
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    setError("");
    fetch("/models/atlas.json", { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw new Error("人体模型目录加载失败");
        return r.json();
      })
      .then((data) => setAtlas(normalizeTeachingAtlas(data as Atlas)))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => abort.abort();
  }, [metadataAttempt]);
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      setStorageError("");
    } catch {
      setStorageError("浏览器未能保存学习记录；当前会话仍可继续。");
    }
  }, [store]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(()=>{
    if(!about&&!comparisonOpen)return;
    const prior=document.activeElement as HTMLElement|null;
    const key=(e:KeyboardEvent)=>{if(e.key!=='Tab')return;const modal=document.querySelector('.tcm-app [role="dialog"]');if(!modal)return;
      const items=[...modal.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],summary,input,textarea,select,[tabindex="0"]')].filter(el=>el.getClientRects().length>0);
      const first=items[0],last=items[items.length-1];if(!first)return;
      if(e.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){e.preventDefault();first.focus();}
    };document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);prior?.focus();};
  },[about,comparisonOpen]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModelFocus(false);
        setAnatomyDetailsOpen(false);
        setComparisonOpen(false);
        setAbout(false);
        setSidebarOpen(false);
        setCatalogueExpanded(false);
      }
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        document.getElementById("point-search")?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(()=>{
    const clamp=()=>setSidebarWidth(width=>catalogueWidth(width,window.innerWidth));
    clamp();
    window.addEventListener('resize',clamp);
    return()=>window.removeEventListener('resize',clamp);
  },[]);
  useEffect(()=>{
    if(layer==='surface'||layer==='transparent')setLayer('muscle');
  },[layer]);
  const point = ACUPOINTS.find((p) => p.id === activeId) ?? ACUPOINTS[0],
    currentMeridian = MERIDIANS.find((m) => m.id === point.meridian)!;
  const hasModel=hasPlacement(point.id);
  useEffect(()=>{
    if(!questionAvailable(point,cardType)) {setCardType('location');setRevealed(false);}
  },[point.id,cardType]);
  const dueIds = useMemo(() => reviewQueue(studyIds, store.reviews, now), [store.reviews, now]);
  const reviewedCount = Object.keys(store.reviews).length,
    masteredCount = Object.values(store.reviews).filter((r) => r.lastRating === "good").length;
  const filtered = useMemo(
    () =>
      ACUPOINTS.filter((p) => {
        const matches =
          !query ||
          normalize(
            [
              p.id,
              p.name,
              p.pinyin,
              MERIDIANS.find((m) => m.id === p.meridian)?.name,
              ...p.tags,
            ].join(" "),
          ).includes(normalize(query));
        return (
          inCatalogue(p,catalogueScope) &&
          (mode!=='quiz'||hasPlacement(p.id)) &&
          (mode!=='cards'||!!p.location) &&
          matches &&
          (meridian === "all" || p.meridian === meridian) &&
          (region === "all" || p.region === region) &&
          (tag === "all" || p.tags.includes(tag)) &&
          (scope === "all" ||
            (scope === "favorites" && store.favorites.includes(p.id)) ||
            (scope === "review" && dueIds.includes(p.id)) ||
            (scope === "course" && store.course.pointIds.includes(p.id)))
        );
      }),
    [query, meridian, region, tag, scope, catalogueScope, mode, store.favorites, store.course.pointIds, dueIds],
  );
  const filteredIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  const displayedIds = useMemo(
    () => mode === "quiz" ? quizDisplayIds(filteredIds, activeId, quizAnswer) : filteredIds,
    [mode, filteredIds, activeId, quizAnswer],
  );
  useEffect(() => {
    if (displayedIds.length && !displayedIds.includes(activeId)) {
      setActiveId(filtered[0].id);
      setQuizAnswer(null);
      setRevealed(false);
    }
  }, [displayedIds]);
  const concealed =
    mode === "cards" && (cardType === "identify" || cardType === "meridian") && !revealed;
  useEffect(()=>{if(concealed){setFocus(v=>v+1);setRotate(false);}},[concealed,activeId]);
  const quizPending = mode === "quiz" && !quizAnswer;
  const selectPoint = (id: string) => {
    setActiveId(id);
    setQuizAnswer(null);
    setRevealed(false);
    setChosenPart(null);
    setIsolate(false);
    setRotate(false);
    setGuideStep(0);
    setSidebarOpen(false);
    setCatalogueExpanded(false);
  };
  const chooseGlobal = (id: string) => {
    setCatalogueScope('all');
    setQuery("");
    setMeridian("all");
    setRegion("all");
    setTag("all");
    setScope("all");
    selectPoint(id);
    setFocus((f) => f + 1);
  };
  const onPoint = (id: string) => {
    if (mode === "quiz") {
      if (quizAnswer) return;
      setQuizAnswer(id);
      const correct = id === activeId;
      setStore((s) => ({
        ...ratePoint(s, activeId, correct ? "good" : "again"),
        attempts: s.attempts + 1,
        correct: s.correct + (correct ? 1 : 0),
      }));
    } else if (!concealed) selectPoint(id);
  };
  const showNext = () => {
    const next = nextId(filteredIds, activeId);
    if (next) selectPoint(next);
    else if (mode === "quiz") setQuizAnswer(null);
  };
  const rate = (rating: Rating) => {
    setStore((s) => ratePoint(s, activeId, rating));
    setNotice(
      rating === "again"
        ? "已加入复习 · 10 分钟后再练"
        : rating === "hard"
          ? "已安排明天复习"
          : "已记录掌握程度",
    );
    showNext();
  };
  const changeMode = (next: Mode) => {
    setModelExpanded(false);
    setModelFocus(false);
    setControlsOpen(true);
    setFiltersOpen(false);
    setMode(next);
    requestAnimationFrame(() => { taskRef.current?.scrollTo(0, 0); window.scrollTo(0, 0); });
    setRevealed(false);
    setQuizAnswer(null);
    setGuide(false);
    setChosenPart(null);
    setIsolate(false);
    setRotate(false);
    setExplosionAmount(0);
    setAnatomyDetailsOpen(false);
    setComparisonOpen(false);
    setSidebarOpen(false);
    setCatalogueExpanded(current=>nextCatalogueExpansion(current,'mode-change'));
    setReset(v=>v+1);
    if (next === "quiz") {
      setLabels(false);
      setLayer("muscle");
      setReset((v) => v + 1);
    } else setLabels(true);
  };
  const toggleCompare = (id: string) => {
    setCompared((v) =>
      v.includes(id) ? v.filter((x) => x !== id) : v.length < 3 ? [...v, id] : v,
    );
    if (compared.length >= 3 && !compared.includes(id))
      setNotice("最多比较三个穴位，请先移除一个。");
  };
  const sceneIds = useMemo(
    () => mode==='anatomy'||!hasModel ? [] : (concealed ? [activeId] : displayedIds),
    [mode,hasModel,concealed, activeId, displayedIds],
  );
  const sceneOptions = useMemo<SceneOptions>(
    () => ({
      layer,
      activeId,
      pointIds: sceneIds,
      labels: mode === "quiz" ? !!quizAnswer : labels,
      routes,
      guide,
      hiddenNames: concealed || quizPending,
      quiz: quizPending,
      view,
      rotate,
      focus,
      reset,
      selectedPart: chosenPart?.id ?? "",
      isolate,
      explode:explosionAmount,
      visibleSystems:mode==='anatomy'?anatomySystems:undefined,
      anatomyLabels:true,
    }),
    [
      layer,
      activeId,
      sceneIds,
      labels,
      mode,
      quizAnswer,
      routes,
      guide,
      concealed,
      quizPending,
      view,
      rotate,
      focus,
      reset,
      chosenPart,
      isolate,
      explosionAmount,anatomySystems,
    ],
  );
  const policy = workspacePolicy(mode, mobile, modelExpanded);
  const reportProgress = useCallback((n: number) => setProgress(n), []);
  const partResults = useMemo(
    () =>
      !atlas || !anatomyQuery
        ? []
        : atlas.parts
            .filter((p) =>
              normalize(`${p.name} ${anatomyZh(p.name)}`).includes(normalize(anatomyQuery)),
            )
            .slice(0, 15),
    [atlas, anatomyQuery],
  );
  const relatedParts = useMemo(
    () => [...new Map(point.anatomy.flatMap(keyword=>{
      const pattern=new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i');
      return atlas?.parts.filter(p=>pattern.test(p.name))??[];
    }).map(p=>[p.id,p])).values()].slice(0,8),
    [atlas, point],
  );
  const tags = useMemo(
    () =>
      [...new Set(ACUPOINTS.flatMap((p) => p.tags))].filter(
        (t) =>
          ![
            "头颈",
            "胸腹",
            "背腰",
            "上肢",
            "下肢",
            "定位学习",
            ...MERIDIANS.map((m) => m.shortName),
          ].includes(t),
      ),
    [],
  );
  const modelPanel = (
        <main key="model" id="model-workspace" tabIndex={-1} className="model-workspace" hidden={!policy.showModel}>
          {policy.taskFirst && <button className="outline-button model-expand-button" onClick={()=>{setModelExpanded(false);setModelFocus(false);taskRef.current?.focus();}}>收起模型，返回学习</button>}
          <div className="model-topbar">
            <div>
              <span className="section-kicker">
                {mode === "quiz"
                  ? "PRACTICE · 取穴练习"
                  : mode === "cards"
                    ? "RECALL · 记忆练习"
                    : "EXPLORE · 三维探索"}
              </span>
              <h1>
                {mode==='anatomy' ? '解剖图谱' : concealed
                  ? cardType === "meridian"
                    ? "循其所归，忆其经脉。"
                    : "这个穴位，你认识吗？"
                  : mode === "quiz"
                    ? "把知识，放回人体。"
                    : "循经识穴，知其所以。"}
              </h1>
            </div>
            <button
              className="icon-button about-button"
              onClick={() => setAbout(true)}
              aria-label="资料与使用说明"
            >
              <Info size={18} />
            </button>
          </div>
          <button className="outline-button model-focus-button" aria-pressed={modelFocus} onClick={()=>{setModelFocus(v=>!v);setSidebarOpen(false);setAnatomyDetailsOpen(false);}}>{modelFocus?"退出模型专注":"专注模型"}</button>
          {mode==="explore" && mobile && <button className="outline-button" onClick={()=>{taskRef.current?.scrollIntoView({block:"start"});taskRef.current?.focus({preventScroll:true});}}>查看「{point.name}」详情 ↓</button>}
          <div className="model-controls">
            {mode==='anatomy'?<div className="anatomy-explode-controls">
              <button className="outline-button" aria-expanded={sidebarOpen} onClick={()=>{setSidebarOpen(v=>!v);if(mobile)setAnatomyDetailsOpen(false);}}><Layers size={16}/>{sidebarOpen?'收起目录':'结构目录'}</button>
              <button className="outline-button" aria-expanded={anatomyDetailsOpen} onClick={()=>{setAnatomyDetailsOpen(v=>!v);if(mobile)setSidebarOpen(false);}}><BookOpen size={16}/>{anatomyDetailsOpen?'收起详情':'结构详情'}</button>
              {(sidebarOpen||anatomyDetailsOpen)&&<button className="text-button" onClick={()=>{setSidebarOpen(false);setAnatomyDetailsOpen(false);}}>隐藏全部面板</button>}
            </div>:
            <div className="layer-switch" role="group" aria-label="人体图层">
              {layerChoices.map(([id, label]) => (
                <button
                  key={id}
                  className={layer === id ? "active" : ""}
                  onClick={() => {
                    setLayer(id);
                    setChosenPart(null);
                    setIsolate(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>}
            {mode!=='anatomy'&&<button
              className="mobile-catalogue outline-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={15} />
              目录
            </button>}
          </div>
          {mode==="quiz" && mobile && <p className="mobile-quiz-prompt">找到「{point.name}」· 点击候选点作答</p>}
          <div className="model-stage">
            {atlas && policy.showModel && (
              <AtlasScene
                key={sceneAttempt}
                atlas={atlas}
                points={ACUPOINTS}
                options={sceneOptions}
                onPoint={onPoint}
                onPart={(part) => {
                  setChosenPart(part);
                  setIsolate(false);
                }}
                onProgress={reportProgress}
                onError={setSceneError}
              />
            )}
            <div className="stage-label">
              <span className="tiny-dot" />
              {mode==='anatomy'?'完整解剖结构':concealed ? (cardType === "meridian" ? "归经练习" : "辨认练习") : currentMeridian.name}
              <small>{mode === "quiz" ? "点击候选点作答" : "BodyParts3D · 成人男性参考"}</small>
            </div>
            <div className="stage-side-label">
              {view === "front"
                ? "ANTERIOR / 前面"
                : view === "back"
                  ? "POSTERIOR / 后面"
                  : "LATERAL / 侧面"}
            </div>
            {!concealed && mode !== "quiz" && mode!=='anatomy' && hasModel && filtered.length > 0 && (
              <div className="selected-floating">
                <span className="active-orbit" />
                <div>
                  {point.name}
                  <small>
                    {point.id} · {currentMeridian.shortName}
                  </small>
                </div>
                <button
                  aria-label={`聚焦${point.name}`}
                  onClick={() => {
                    setFocus((f) => f + 1);
                    setRotate(false);
                    setIsolate(false);
                  }}
                >
                  <Focus size={17} />
                </button>
              </div>
            )}
            {!concealed && !hasModel && mode!=='anatomy' && mode!=='quiz' && filtered.length>0 && <div className="unmapped-caption" role="status">
              <span className="section-kicker">{point.location?'定位资料已收录 · 三维定位待校准':'考纲已收录 · 定位资料待核验'}</span>
              <strong>{point.name}</strong><p>{point.location?'此穴暂不显示三维标记，避免误导定位。可在右侧查看文字来源、练习记忆卡。':'已核实考纲包含此条目，尚未开放定位练习。不会用猜测的位置补点。'}</p>
            </div>}
            {guide && hasModel && point.landmarks.length>0 && mode === "explore" && (
              <div className="guide-caption">
                <span>定位辅助 {guideStep + 1} / 3</span>
                {point.landmarks[guideStep]}
                <small>文字对照与比例示意，三维坐标待专业校准</small>
              </div>
            )}
            {progress < 100 && !error && !sceneError && (
              <div className="model-loading" role="status">
                <div className="loading-logo">经</div>
                <strong>正在准备人体模型</strong>
                <span>{progress}% · 2,234 个解剖结构</span>
                <div className="load-track">
                  <i style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {(error || sceneError) && (
              <div className="model-loading" role="alert">
                <p>{error || sceneError}</p>
                <button className="primary-button" onClick={() => { setSceneError(""); setProgress(0); if(error)setMetadataAttempt(v=>v+1);else setSceneAttempt(v=>v+1); }}>
                  重新加载
                </button>
              </div>
            )}
            <div className="view-bar" role="group" aria-label="相机视角">
              {(
                [
                  ["front", "正面"],
                  ["back", "背面"],
                  ["side", "侧面"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  className={view === id ? "active" : ""}
                  onClick={() => {
                    setView(id);
                    setReset((v) => v + 1);
                    setRotate(false);
                    setIsolate(false);
                  }}
                >
                  {label}
                </button>
              ))}
              <span />
              <button
                aria-label={rotate ? "暂停旋转" : "自动旋转"}
                onClick={() => setRotate((v) => !v)}
              >
                {rotate ? <Pause size={16} /> : <RotateCw size={16} />}
              </button>
              <button
                aria-label="复位模型"
                onClick={() => {
                  setReset((v) => v + 1);
                  setChosenPart(null);
                  setIsolate(false);
                  setRotate(false);
                  setExplosionAmount(0);
                }}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div className="model-bottom">
            {mode==="anatomy" && <button className="outline-button controls-toggle" aria-expanded={controlsOpen} onClick={()=>setControlsOpen(v=>!v)}>{controlsOpen?"收起散开控制":"展开散开控制"}</button>}
            {mode==='anatomy'?<div className="anatomy-slider-dock" hidden={!controlsOpen}>
              <div className="explode-label"><label id="tcm-explode-label">结构散开</label><output>{Math.round(explosionAmount*100)}%</output></div>
              <Slider aria-labelledby="tcm-explode-label" min={0} max={100} step={1} value={[explosionAmount*100]} onValueChange={value=>{setExplosionAmount((Array.isArray(value)?value[0]:value)/100);setIsolate(false);setRotate(false);}}/>
              <div className="slider-endpoints"><span>完整人体</span><span>逐个结构</span></div>
              <button className="text-button" onClick={()=>{setExplosionAmount(0);setIsolate(false);setRotate(false);setReset(v=>v+1);}}>复原模型</button>
            </div>:<>
            <div className="display-toggles">
              <button
                className={labels ? "active" : ""}
                disabled={mode === "quiz" || concealed}
                onClick={() => setLabels((v) => !v)}
              >
                {labels ? <Eye size={15} /> : <EyeOff size={15} />}穴位名称
              </button>
              <button
                className={routes ? "active" : ""}
                disabled={mode === "quiz" || concealed}
                onClick={() => setRoutes((v) => !v)}
              >
                <GitCompareArrows size={15} />
                选点连线
              </button>
              <button
                className={guide ? "active" : ""}
                disabled={mode !== "explore" || !hasModel || !point.landmarks.length}
                onClick={() => setGuide((v) => !v)}
              >
                <Target size={15} />
                定位辅助
              </button>
            </div>
            <p>
              {routes
                ? "虚线仅连接已收录穴位，不表示完整经络循行。"
                : "拖动旋转 · 滚轮缩放 · 点击穴位查看"}
            </p>
            <button className="text-button anatomy-entry" onClick={()=>changeMode('anatomy')}><Layers size={14}/>解剖结构浏览</button>
            </>}
          </div>
      {mode !== 'exam' && chosenPart && (
        <div className="anatomy-selection">
          <div>
            <span>{SYSTEM_ZH[chosenPart.system]} · 解剖结构</span>
            <strong>{anatomyLabel(chosenPart.name,chosenPart.id,chosenPart.system)}</strong>
          </div>
          {mode==='anatomy'&&<button className="outline-button" onClick={()=>setAnatomyDetailsOpen(v=>!v)}>{anatomyDetailsOpen?'收起详情':'查看详情'}</button>}
          {canIsolateTeachingPart(chosenPart.system)&&<button className="outline-button" onClick={() => setIsolate((v) => !v)}>
            {isolate ? "显示周围" : "单独查看"}
          </button>}
          <button
            className="icon-button"
            aria-label="关闭解剖结构"
            onClick={() => {
              setChosenPart(null);
              setIsolate(false);
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

          <div className="model-scope">
            <Info size={12} />
            <span>穴位标记为教学示意 · 尚未逐点专业校准</span>
            <button onClick={() => setAbout(true)}>
              来源与范围
              <ArrowUpRight size={12} />
            </button>
          </div>
        </main>
  );
  const taskPanel = (
        <aside key="task" ref={taskRef} tabIndex={-1} id="learning-content" className={`detail-panel ${mode==='anatomy'&&anatomyDetailsOpen?'anatomy-panel-open':''}`} aria-label="学习内容">
          {policy.taskFirst && <button className="outline-button model-expand-button" aria-expanded={modelExpanded} onClick={()=>{setModelExpanded(v=>!v);if(!modelExpanded)requestAnimationFrame(()=>document.getElementById('model-workspace')?.focus());}}>{modelExpanded?"收起三维模型":"展开三维模型"}</button>}
          {mode==='anatomy'&&<button className="anatomy-detail-close icon-button" aria-label="关闭结构详情" onClick={()=>setAnatomyDetailsOpen(false)}><X size={18}/></button>}
          {mode==='anatomy'?<AnatomyDetails part={chosenPart} isolate={isolate} onIsolate={()=>setIsolate(v=>!v)} onTcm={()=>changeMode('explore')}/>:!displayedIds.length && mode !== 'course' && mode !== 'cases' ? (
            <div className="empty-detail">
              <BookOpen size={32} />
              <h2>{mode === "quiz" && scope === "review" ? "本轮待复习已完成" : "调整筛选，开始学习"}</h2>
              <p>{mode === "quiz" && scope === "review" ? "可以切换到全部题目继续练习，或稍后回来复习。" : "学习卡与人体标记会同步到左侧目录。"}</p>
              {mode === "quiz" && scope === "review" && (
                <button
                  className="primary-button"
                  onClick={() => {
                    setScope("all");
                    setQuizAnswer(null);
                  }}
                >
                  练习全部题目
                </button>
              )}
            </div>
          ) : mode === "cards" ? (
            <StudyPanel
              key={point.id}
              point={point}
              meridian={currentMeridian}
              index={Math.max(0, filteredIds.indexOf(activeId))}
              total={filtered.length}
              review={store.reviews[activeId]}
              type={cardType}
              onRate={rate}
              onNext={showNext}
              onType={setCardType}
              onReveal={setRevealed}
              onExplore={() => changeMode("explore")}
            />
          ) : mode === "course" ? (
            <CoursePanel
              store={store}
              points={ACUPOINTS}
              point={point}
              onChange={setStore}
              onSelect={chooseGlobal}
              onCourseFilter={() => setScope("course")}
            />
          ) : mode === "cases" ? (
            <CasesPanel onSelect={chooseGlobal} />
          ) : mode === "quiz" ? (
            <section className="quiz-panel">
              <div className="section-kicker">
                <Target size={14} /> 模型辨认
              </div>
              <h2>找到「{point.name}」</h2>
              <p className="muted">在三维人体上，点击你认为正确的候选点。</p>
              <div className="quiz-target">
                <span>{point.id}</span>
                <strong>{point.name}</strong>
                <small>{point.region} · 可旋转或放大观察</small>
              </div>
              {quizAnswer ? (
                <div
                  className={`quiz-feedback ${quizAnswer === point.id ? "correct" : "incorrect"}`}
                  role="status"
                >
                  <strong>{quizAnswer === point.id ? "找对了！" : "再对照一下定位"}</strong>
                  <p>
                    {quizAnswer !== point.id &&
                      (quizAnswer === "skipped"
                        ? "已查看答案。"
                        : `你选择了${ACUPOINTS.find((p) => p.id === quizAnswer)?.name}。`)}
                    {point.location}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => {
                      setFocus((v) => v + 1);
                      setRotate(false);
                    }}
                  >
                    聚焦正确示意点
                    <Focus size={15} />
                  </button>
                  <button className="primary-button full" onClick={showNext}>
                    下一题
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className="outline-button full"
                    onClick={() => {
                      setView(
                        point.region === "背腰" || ["GB20", "GV14"].includes(point.id)
                          ? "back"
                          : "front",
                      );
                      setReset((v) => v + 1);
                    }}
                  >
                    调整到部位视角
                    <RotateCw size={15} />
                  </button>
                  <button
                    className="text-button full"
                    onClick={() => {
                      setQuizAnswer("skipped");
                      setStore((s) => ratePoint(s, activeId, "again"));
                    }}
                  >
                    暂时不会，查看定位
                  </button>
                </>
              )}
              <div className="quiz-stats">
                <div>
                  <strong>{store.attempts}</strong>
                  <span>累计作答</span>
                </div>
                <div>
                  <strong>
                    {store.attempts ? Math.round((store.correct / store.attempts) * 100) : 0}%
                  </strong>
                  <span>候选点辨认正确率</span>
                </div>
              </div>
              <p className="quiet-note">
                三维认穴仅使用已有示意标记的穴位，不覆盖全部考纲。{' '}
                本模式练习穴位辨认，不以模型坐标评分真人取穴精度。错题会进入复习计划。
              </p>
            </section>
          ) : (
            <>
              <div className="detail-top">
                <span className="section-kicker">
                  经穴档案
                  <span className="subtle-line" />
                </span>
                <button
                  className={`icon-button favorite ${store.favorites.includes(point.id) ? "saved" : ""}`}
                  aria-label={store.favorites.includes(point.id) ? "取消收藏" : "收藏穴位"}
                  onClick={() =>
                    setStore((s) => ({
                      ...s,
                      favorites: s.favorites.includes(point.id)
                        ? s.favorites.filter((id) => id !== point.id)
                        : [...s.favorites, point.id],
                    }))
                  }
                >
                  <Star
                    size={18}
                    fill={store.favorites.includes(point.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>
              <div className="point-heading">
                <div>
                  <span className="pinyin">{point.pinyin}</span>
                  <h2>
                    {point.name}
                    <span>{point.displayCode??point.id}</span>
                  </h2>
                  <p>
                    <i style={{ background: currentMeridian.color }} />
                    {currentMeridian.name}
                  </p>
                </div>
                <div className="detail-seal">{point.name.slice(-1)}</div>
              </div>
              <div className="point-tags">
                {examBadges(point).map(label=><span className="exam-tag" key={label}>{label}</span>)}
                {point.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
                <span>{point.groupNote??(point.bilateral ? "双侧穴" : "正中单穴")}</span>
              </div>
              {point.codeNote&&<p className="quiet-note code-note">{point.codeNote}</p>}
              <div className="detail-shortcuts">
                <button
                  className="primary-button"
                  disabled={!point.location}
                  onClick={() => {
                    changeMode("cards");
                    setCardType("location");
                  }}
                >
                  <Brain size={16} />
                  练习这张卡
                  <ArrowRight size={16} />
                </button>
                <button
                  className={`outline-button ${compared.includes(point.id) ? "active" : ""}`}
                  onClick={() => toggleCompare(point.id)}
                  aria-label={compared.includes(point.id) ? "移出对比" : "加入对比"}
                >
                  <GitCompareArrows size={17} />
                </button>
              </div>
              <section className="detail-section">
                <h3>
                  <Target size={15} />
                  体表定位
                </h3>
                <p className="location-text">{point.location||'定位资料待指定教材核验，暂不提供定位答案。'}</p>
                <button
                  className="text-button"
                  disabled={!hasModel||!point.landmarks.length}
                  onClick={() => {
                    setGuide((v) => !v);
                    setGuideStep(0);
                    setFocus((v) => v + 1);
                    setRotate(false);
                    setIsolate(false);
                  }}
                >
                  跟着标志找穴位
                  <ArrowUpRight size={14} />
                </button>
              </section>
              {point.landmarks.length>0&&<section className="detail-section landmark-section">
                <h3>
                  怎样找到它<span>3 步对照</span>
                </h3>
                <ol>
                  {point.landmarks.map((step, i) => (
                    <li key={step}>
                      <button
                        className={guide && guideStep === i ? "active" : ""}
                        onClick={() => {
                          setGuide(true);
                          setGuideStep(i);
                        }}
                      >
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {step}
                      </button>
                    </li>
                  ))}
                </ol>
                <p className="mini-note">骨度分寸是相对比例，不是固定厘米数。</p>
              </section>}
              <section className="detail-section">
                <h3>
                  <BookOpen size={15} />
                  传统功用与主治
                </h3>
                <p>{point.traditional||'此条目已补齐标准命名与定位。主治要点、特定穴分类及操作知识尚待逐条教材核验，不以自动生成内容充当备考答案。'}</p>
                <span className="content-status">{point.annotationsReady?'传统理论学习 · 待教师审校':'定位资料条目 · 临床知识待补充'}</span>
              </section>
              <section className="detail-section anatomy-section">
                <h3>
                  <Layers size={15} />
                  解剖对照<span>邻近结构</span>
                </h3>
                <p className="mini-note">按结构名关联，辅助观察；不代表针刺路径。</p>
                <div className="anatomy-search">
                  <Search size={13} />
                  <input
                    placeholder="搜索解剖结构，中 / 英文"
                    aria-label="搜索解剖结构"
                    value={anatomyQuery}
                    onChange={(e) => setAnatomyQuery(e.target.value)}
                  />
                </div>
                <div className="anatomy-links">
                  {(anatomyQuery ? partResults : relatedParts).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setChosenPart(p);
                        setLayer(
                          p.system === "skeletal"
                            ? "skeleton"
                            : p.system === "muscular"
                              ? "muscle"
                              : "neuro",
                        );
                        setIsolate(false);
                      }}
                    >
                      {anatomyLabel(p.name,p.id,p.system)}
                      <ChevronRight size={12} />
                    </button>
                  ))}
                  {!(anatomyQuery ? partResults : relatedParts).length && (
                    <p className="mini-note">没有匹配结构，可用英文名继续搜索。</p>
                  )}
                </div>
                <p className="mini-note">常用结构已有中文对照；未核验的细分名称标为“中文名待校对”。</p>
              </section>
              <details className="care-details">
                <summary>
                  <Info size={14} />
                  针灸与艾灸学习注意
                </summary>
                <p>{point.caution}</p>
                <p>
                  艾灸的适用性、禁忌与操作方法需按专门教材及教师指导学习，本卡不提供个体治疗方案。
                </p>
              </details>
              <Sources point={point} />
            </>
          )}
        </aside>
  );
  return (
    <div className={`tcm-app ${modelFocus?'model-focus':''} ${policy.taskFirst?'task-first':''} ${mode==='anatomy'?'anatomy-focus':''} ${mode==='exam'?'exam-mode':''} ${catalogueExpanded?'catalogue-expanded':''}`}>
      <header className="app-header">
        <a className="brand" href="/">
          <span className="brand-seal">经</span>
          <span>
            <strong>
              经纬<span> · </span>人体图谱
            </strong>
            <small>解剖 · 经穴 · 执医针灸专项</small>
          </span>
        </a>
        <nav className="main-nav" aria-label="学习模式">
          {nav.map((n) => (
            <button
              key={n.id}
              className={mode === n.id ? "active" : ""}
              onClick={() => changeMode(n.id)}
              aria-current={mode === n.id ? "page" : undefined}
            >
              <n.icon size={17} />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <EmilyProjectLink placement="header" />
        <button
          className="header-progress"
          onClick={() => {
            setScope("review");
            changeMode("cards");
          }}
        >
          <span
            className="progress-ring"
            style={
              {
                "--progress": `${(masteredCount / studyIds.length) * 100}%`,
              } as React.CSSProperties
            }
          >
            <Check size={12} />
          </span>
          <span>
            我的学习
            <small>
              {reviewedCount} / {studyIds.length} 可练
            </small>
          </span>
        </button>
      </header>
      <div hidden={mode === 'exam'} className="workspace" style={{"--catalogue-width":`${sidebarWidth}px`, display: mode === 'exam' ? 'none' : undefined} as React.CSSProperties}>
        <aside
          className={`atlas-sidebar ${sidebarOpen ? "mobile-open" : ""}`}
          aria-label="穴位目录"
        >
          {mode==='anatomy'&&atlas?<AnatomyCatalogue atlas={atlas} visible={anatomySystems} onVisible={systems=>{setAnatomySystems(systems);setChosenPart(null);setIsolate(false);}} onSelect={part=>{setChosenPart(part);setIsolate(false);setSidebarOpen(false);}} onClose={()=>setSidebarOpen(false)} selected={chosenPart?.id??''}/>:<>
          <div className="sidebar-title">
            <span>经络与腧穴</span>
            <button
              className="mobile-close icon-button"
              aria-label="关闭目录"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
            <span className="count-badge">{ACUPOINTS.length}</span>
          </div>
          {concealed || quizPending ? (
            <div className="quiet-study">
              <Target size={30} />
              <h3>{concealed ? "先观察，再回忆" : "在模型上寻找答案"}</h3>
              <p>
                {concealed
                  ? cardType === "meridian"
                    ? "归经名称与编码提示暂时隐藏。请先回答右侧问题，再翻面核对。"
                    : "穴位名称暂时隐藏。翻面后，名称与定位会一起显示。"
                  : "点击人体上的候选穴位圆点。可以旋转、缩放，或切换正面与背面。"}
              </p>
              <p className="quiet-note">本练习辨认的是模型上的示意点，不评估真人取穴精度。</p>
              <button className="outline-button" onClick={() => changeMode("explore")}>
                返回经穴目录
              </button>
            </div>
          ) : (
            <>
              <div className="search-field">
                <Search size={16} />
                <input
                  id="point-search"
                  placeholder="搜索穴名、拼音或编码"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setQuizAnswer(null);
                    setRevealed(false);
                  }}
                  aria-label="搜索穴位"
                />
                {query ? <button aria-label="清空搜索" onClick={()=>setQuery("")}><X size={13}/></button> : <kbd>/</kbd>}
              </div>
              <div className="catalogue-toolbar">
                <span>{filtered.length} 个条目</span>
                <button aria-expanded={filtersOpen} onClick={()=>setFiltersOpen(v=>!v)}><SlidersHorizontal size={13}/>筛选条件</button>
                <button className="catalogue-expand" aria-pressed={catalogueExpanded} onClick={()=>setCatalogueExpanded(current=>nextCatalogueExpansion(current,'toggle'))}>{catalogueExpanded?'退出放大':'放大目录'}</button>
              </div>
              {!filtersOpen&&<div className="active-filter-summary">
                {[catalogueScope!=='all'&&'考纲范围',scope!=='all'&&'学习状态',region!=='all'&&region,tag!=='all'&&tag,meridian!=='all'&&MERIDIANS.find(m=>m.id===meridian)?.shortName].filter(Boolean).join(' · ')||'全部穴位'}
              </div>}
              {filtersOpen&&<div className="catalogue-filters">
              <div className="exam-catalogue-control">
                <label htmlFor="catalogue-scope">学习范围</label>
                <select id="catalogue-scope" value={catalogueScope} onChange={e=>{setCatalogueScope(e.target.value as CatalogueScope);setQuizAnswer(null);setRevealed(false);}}>
                  <option value="all">全部学习条目 · {ACUPOINTS.length}</option>
                  <option value="standard">十四经穴 · 362</option>
                  <option value="practical">实践技能明列 · {PRACTICAL_NAMES.length}</option>
                  <option value="written">医学综合明列 · {WRITTEN_NAMES.length}</option>
                  <option value="model">三维示意点 · {ACUPOINTS.filter(p=>hasPlacement(p.id)).length}</option>
                </select>
                <a href={`${EXAM_SOURCE.url}#page=${catalogueScope==='written'?63:13}`} target="_blank" rel="noreferrer">2025版大纲 · 2026沿用 ↗</a>
                <p>明列清单不是考试全部知识；穴位条目数不等于左右或穴组点数。</p>
              </div>
              <div className="scope-tabs">
                {(
                  [
                    ["all", "全部"],
                    ["favorites", "收藏"],
                    ["review", "待复习"],
                    ["course", "课程"],
                  ] as const
                ).map(([id, name]) => (
                  <button
                    key={id}
                    className={scope === id ? "active" : ""}
                    onClick={() => {
                      setScope(id);
                      setQuizAnswer(null);
                      setRevealed(false);
                    }}
                  >
                    {name}
                    {id === "review" && <sup>{dueIds.length}</sup>}
                  </button>
                ))}
              </div>
              <div className="filters">
                <label>
                  <span>身体部位</span>
                  <select
                    aria-label="身体部位"
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      setQuizAnswer(null);
                      setRevealed(false);
                    }}
                  >
                    <option value="all">全部部位</option>
                    {["头颈", "胸腹", "背腰", "上肢", "下肢"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>特定穴分类</span>
                  <select
                    aria-label="特定穴分类"
                    value={tag}
                    onChange={(e) => {
                      setTag(e.target.value);
                      setQuizAnswer(null);
                      setRevealed(false);
                    }}
                  >
                    <option value="all">全部分类</option>
                    {tags.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="meridian-filter">
                <label htmlFor="meridian-select">
                  <SlidersHorizontal size={14} />
                  经脉
                </label>
                <select
                  id="meridian-select"
                  value={meridian}
                  onChange={(e) => {
                    setMeridian(e.target.value);
                    setQuizAnswer(null);
                    setRevealed(false);
                  }}
                >
                  <option value="all">全部经脉与奇穴</option>
                  {MERIDIANS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              </div>}
              <div className="catalogue-summary">
                <span>名称 / 编码</span>
              </div>
              <div className="point-list">
                {filtered.length ? (
                  filtered.map((p) => {
                    const m = MERIDIANS.find((m) => m.id === p.meridian)!;
                    return (
                      <button
                        className={`point-list-item ${p.id === activeId ? "active" : ""}`}
                        key={p.id}
                        onClick={() => selectPoint(p.id)}
                      >
                        <span
                          className="point-symbol"
                          style={{ "--meridian-color": m.color } as React.CSSProperties}
                        >
                          {p.id === activeId ? (
                            <span />
                          ) : store.reviews[p.id]?.lastRating === "good" ? (
                            <Check size={11} />
                          ) : (
                            <i />
                          )}
                        </span>
                        <span className="point-list-name">
                          {p.name}
                          <small>
                            {m.shortName} · {p.region}
                          </small>
                        </span>
                        <span className="point-code">{p.displayCode??p.id}</span>
                        <ChevronRight size={13} />
                      </button>
                    );
                  })
                ) : (
                  <div className="empty-list">
                    <Search size={24} />
                    <strong>{scope === "review" ? "当前没有到期卡片" : "没有匹配穴位"}</strong>
                    <p>
                      {scope === "course"
                        ? "可在「我的课堂」加入穴位。"
                        : "试试其他关键词或筛选条件。"}
                    </p>
                    <button
                      className="text-button"
                      onClick={() => {
                        setQuery("");
                        setRegion("all");
                        setMeridian("all");
                        setTag("all");
                        setScope("all");
                        setCatalogueScope('all');
                      }}
                    >
                      显示全部穴位
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <div className="sidebar-footer">
            <span className="tiny-dot" />
            362 经穴 · 考纲分组学习
            <button onClick={() => setAbout(true)} aria-label="了解数据范围">
              <Info size={14} />
            </button>
          </div>
          </>}
        </aside>
        {mode!=='anatomy'&&(
          <CatalogueResizeHandle width={sidebarWidth} onWidth={setSidebarWidth}/>
        )}
        {policy.taskFirst ? [taskPanel, modelPanel] : [modelPanel, taskPanel]}

      </div>
      {mode === 'exam' && <ExamPanel onAbout={() => setAbout(true)} />}
      <footer className="app-footer">
        <span className="footer-intro">
          <span>经纬 · 让每一次学习，都有迹可循。</span>
          <EmilyProjectLink placement="footer" />
        </span>
        <span>
          <span className="tiny-dot" />
          本机学习记录
          <button onClick={() => setAbout(true)}>
            资料与署名
            <ExternalLink size={12} />
          </button>
        </span>
      </footer>
      {mode !== 'exam' && compared.length > 0 && (
        <div className="compare-dock">
          <GitCompareArrows size={17} />
          <span>穴位对比</span>
          {compared.map((id) => (
            <button key={id} onClick={() => toggleCompare(id)}>
              {ACUPOINTS.find((p) => p.id === id)?.name}
              <X size={12} />
            </button>
          ))}
          <button
            className="primary-button"
            disabled={compared.length < 2}
            onClick={() => setComparisonOpen(true)}
          >
            开始对比
            <ArrowRight size={14} />
          </button>
        </div>
      )}
      {(notice || storageError) && (
        <div className="toast" role="status">
          <Check size={15} />
          {storageError || notice}
        </div>
      )}
      {comparisonOpen && (
        <div className="modal-backdrop" onClick={() => setComparisonOpen(false)}>
          <section
            className="modal compare-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              aria-label="关闭对比"
              onClick={() => setComparisonOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="section-kicker">COMPARE · 对照记忆</div>
            <h2 id="compare-title">相近之处，细辨不同。</h2>
            <div
              className="comparison-grid"
              style={{ gridTemplateColumns: `repeat(${compared.length},minmax(220px,1fr))` }}
            >
              {compared.map((id) => {
                const p = ACUPOINTS.find((x) => x.id === id)!;
                return (
                  <article key={id}>
                    <span className="pinyin">
                      {p.id} · {p.pinyin}
                    </span>
                    <h3>{p.name}</h3>
                    <dl>
                      <dt>归经</dt>
                      <dd>{MERIDIANS.find((m) => m.id === p.meridian)?.name}</dd>
                      <dt>定位</dt>
                      <dd>{p.location}</dd>
                      <dt>分类</dt>
                      <dd>{p.tags.join(" · ")}</dd>
                      <dt>传统理论</dt>
                      <dd>{p.traditional}</dd>
                      <dt>定位参照</dt>
                      <dd>{p.landmarks.join(" → ")}</dd>
                    </dl>
                    <button
                      className="text-button"
                      onClick={() => {
                        setComparisonOpen(false);
                        chooseGlobal(id);
                      }}
                    >
                      在模型查看
                      <ArrowUpRight size={14} />
                    </button>
                    <Sources point={p} />
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}
      {about && (
        <div className="modal-backdrop" onClick={() => setAbout(false)}>
          <section
            className="modal about-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              aria-label="关闭说明"
              onClick={() => setAbout(false)}
            >
              <X size={20} />
            </button>
            <div className="brand-seal">经</div>
            <h2 id="about-title">经纬 · 中医经络学习图谱</h2>
            <p>
              基于 Human Atlas 与 BodyParts3D 的中文教学扩展。当前包含362个十四经穴及21个考纲奇穴名称条目；原版滑杆散开、逐结构点选和名称浏览已集成。
            </p>
            <EmilyAboutSection />
            <h3>内容与模型</h3>
            <p>
              名称、体表定位参考 GB/T 12346—2021 与 WHO 定位资料。2021 国标收录 362 穴，与 WHO 361
              穴口径不同。实践技能明列90个名称、医学综合明列180个名称，两者与标准经穴总库不是同一个集合。每张卡保留来源，传统理论内容待教师复核。
            </p>
            <p>
              三维坐标仍只有39个穴位的近似示意，其他条目不显示猜测标记。投射到皮肤表面不等于医学定位校准。选点虚线不是完整经络循行。不同体型、女性模型和体位变化尚未加入。
            </p>
            <p>新增条目主要补齐命名与定位，主治、操作和禁忌并未全部完成；三角灸仅登记考纲范围、定位待核验。奇穴大学公开文本有排印异常，已在来源标注待正式版对校。本工具不是全科执医题库或实操考核替代品。</p>
            <h3>学习记录与课堂</h3>
            <p>
              收藏、复习与个人课程保存在本浏览器。课程可以通过 JSON
              导出、导入；清除浏览器数据会删除本地记录。教师可使用笔记与课程文件组织教学，但系统不替代专业内容审校。
            </p>
            <h3>执医题库</h3>
            <p>
              题库从 CMB（Chinese Medical Benchmark）训练数据中按“医师考试 · 执业医师 · 中医执业医师 · 单项选择题”严格筛选，当前包含 4086 题。它不是官方或当年完整题库，也未做逐题医学审定。源数据没有解析字段，因此页面只显示原答案和“暂无解析”。答题记录仅保存在本浏览器，与穴位学习记录分开。
            </p>
            <h3>来源与署名</h3>
            <a href="https://github.com/ashemag/human-atlas" target="_blank" rel="noreferrer">
              Human Atlas · ashemag · MIT
              <ExternalLink size={14} />
            </a>
            <a href="/ATTRIBUTION.md" target="_blank" rel="noreferrer">
              BodyParts3D · © The Database Center for Life Science · CC BY 4.0
              <ExternalLink size={14} />
            </a>
            <a href="/CMB-ATTRIBUTION.md" target="_blank" rel="noreferrer">
              CMB 数据转换与来源说明
              <ExternalLink size={14} />
            </a>
            <a href="/licenses/CMB-Apache-2.0.txt" target="_blank" rel="noreferrer">
              CMB · Apache License 2.0
              <ExternalLink size={14} />
            </a>
            <a
              href="https://www.ntcamsac.ac.cn/cms/content?id=353"
              target="_blank"
              rel="noreferrer"
            >
              GB/T 12346—2021《经穴名称与定位》
              <ExternalLink size={14} />
            </a>
            <a href="/?view=anatomy" target="_blank" rel="noreferrer">
              打开原版完整解剖浏览器（英文）
              <ExternalLink size={14} />
            </a>
          </section>
        </div>
      )}
    </div>
  );
}
