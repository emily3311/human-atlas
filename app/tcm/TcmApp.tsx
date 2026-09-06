import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import type { Atlas, Part } from "../anatomy";
import { ACUPOINTS, MERIDIANS } from "./data";
import AtlasScene, { type Layer, type SceneOptions } from "./AtlasScene";
import StudyPanel, { type CardType } from "./StudyPanel";
import CoursePanel from "./CoursePanel";
import CasesPanel from "./CasesPanel";
import { anatomyZh, SYSTEM_ZH } from "./anatomy-zh";
import {
  STORE_KEY,
  parseStore,
  ratePoint,
  reviewQueue,
  nextId,
  type StudyStore,
  type Rating,
} from "./study";
import type { Acupoint } from "./types";
import "./tcm.css";

type Mode = "explore" | "cards" | "quiz" | "course" | "cases";
type Scope = "all" | "favorites" | "review" | "course";
const ids = ACUPOINTS.map((p) => p.id);
const nav = [
  { id: "explore", label: "经穴图谱", icon: Compass },
  { id: "cards", label: "记忆卡片", icon: Brain },
  { id: "quiz", label: "取穴自测", icon: Target },
  { id: "course", label: "我的课堂", icon: GraduationCap },
  { id: "cases", label: "情境练习", icon: Lightbulb },
] as const;
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f\s]/g, "")
    .toLowerCase();
const layerChoices: [Layer, string][] = [
  ["surface", "体表"],
  ["transparent", "透视"],
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
  const [layer, setLayer] = useState<Layer>("surface"),
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
    fetch("/models/atlas.json", { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw new Error("人体模型目录加载失败");
        return r.json();
      })
      .then((data) => setAtlas(data as Atlas))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => abort.abort();
  }, []);
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
        setComparisonOpen(false);
        setAbout(false);
        setSidebarOpen(false);
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
  const point = ACUPOINTS.find((p) => p.id === activeId) ?? ACUPOINTS[0],
    currentMeridian = MERIDIANS.find((m) => m.id === point.meridian)!;
  const dueIds = useMemo(() => reviewQueue(ids, store.reviews, now), [store.reviews, now]);
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
    [query, meridian, region, tag, scope, store.favorites, store.course.pointIds, dueIds],
  );
  const filteredIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  useEffect(() => {
    if (filtered.length && !filteredIds.includes(activeId)) {
      setActiveId(filtered[0].id);
      setQuizAnswer(null);
      setRevealed(false);
    }
  }, [filteredIds]);
  const concealed = mode === "cards" && cardType === "identify" && !revealed;
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
  };
  const chooseGlobal = (id: string) => {
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
    setMode(next);
    setRevealed(false);
    setQuizAnswer(null);
    setGuide(false);
    setChosenPart(null);
    setIsolate(false);
    setRotate(false);
    if (next === "quiz") {
      setLabels(false);
      setLayer("surface");
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
    () => (concealed ? [activeId] : filteredIds),
    [concealed, activeId, filteredIds],
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
    ],
  );
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
  return (
    <div className="tcm-app">
      <header className="app-header">
        <a className="brand" href="/">
          <span className="brand-seal">经</span>
          <span>
            <strong>
              经纬<span> · </span>人体图谱
            </strong>
            <small>中医经络学习工作台</small>
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
                "--progress": `${(masteredCount / ACUPOINTS.length) * 100}%`,
              } as React.CSSProperties
            }
          >
            <Check size={12} />
          </span>
          <span>
            我的学习
            <small>
              {reviewedCount} / {ACUPOINTS.length} 穴
            </small>
          </span>
        </button>
      </header>
      <div className="workspace">
        <aside
          className={`atlas-sidebar ${sidebarOpen ? "mobile-open" : ""}`}
          aria-label="穴位目录"
        >
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
                  ? "穴位名称暂时隐藏。翻面后，名称与定位会一起显示。"
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
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="搜索穴位"
                />
                {query ? (
                  <button aria-label="清空搜索" onClick={() => setQuery("")}>
                    <X size={13} />
                  </button>
                ) : (
                  <kbd>/</kbd>
                )}
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
                    onClick={() => setScope(id)}
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
                    onChange={(e) => setRegion(e.target.value)}
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
                    onChange={(e) => setTag(e.target.value)}
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
                  onChange={(e) => setMeridian(e.target.value)}
                >
                  <option value="all">十四经 · 全部</option>
                  {MERIDIANS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="catalogue-summary">
                <span>{filtered.length} 个穴位</span>
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
                        <span className="point-code">{p.id}</span>
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
            39 穴学习集 · 逐步扩充
            <button onClick={() => setAbout(true)} aria-label="了解数据范围">
              <Info size={14} />
            </button>
          </div>
        </aside>
        <main className="model-workspace">
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
                {concealed
                  ? "这个穴位，你认识吗？"
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
          <div className="model-controls">
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
            </div>
            <button
              className="mobile-catalogue outline-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={15} />
              目录
            </button>
          </div>
          <div className="model-stage">
            {atlas && (
              <AtlasScene
                atlas={atlas}
                points={ACUPOINTS}
                options={sceneOptions}
                onPoint={onPoint}
                onPart={(part) => {
                  setChosenPart(part);
                  setIsolate(false);
                }}
                onProgress={reportProgress}
                onError={setError}
              />
            )}
            <div className="stage-label">
              <span className="tiny-dot" />
              {concealed ? "辨认练习" : currentMeridian.name}
              <small>{mode === "quiz" ? "点击候选点作答" : "BodyParts3D · 成人男性参考"}</small>
            </div>
            <div className="stage-side-label">
              {view === "front"
                ? "ANTERIOR / 前面"
                : view === "back"
                  ? "POSTERIOR / 后面"
                  : "LATERAL / 侧面"}
            </div>
            {!concealed && mode !== "quiz" && filtered.length > 0 && (
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
            {guide && mode === "explore" && (
              <div className="guide-caption">
                <span>定位辅助 {guideStep + 1} / 3</span>
                {point.landmarks[guideStep]}
                <small>文字对照与比例示意，三维坐标待专业校准</small>
              </div>
            )}
            {progress < 100 && !error && (
              <div className="model-loading" role="status">
                <div className="loading-logo">经</div>
                <strong>正在准备人体模型</strong>
                <span>{progress}% · 2,234 个解剖结构</span>
                <div className="load-track">
                  <i style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {error && (
              <div className="model-loading" role="alert">
                <p>{error}</p>
                <button className="primary-button" onClick={() => location.reload()}>
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
                }}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div className="model-bottom">
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
                disabled={mode !== "explore"}
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
          </div>
          <div className="model-scope">
            <Info size={12} />
            <span>穴位标记为教学示意 · 尚未逐点专业校准</span>
            <button onClick={() => setAbout(true)}>
              来源与范围
              <ArrowUpRight size={12} />
            </button>
          </div>
        </main>
        <aside className="detail-panel" aria-label="学习内容">
          {!filtered.length && mode !== 'course' && mode !== 'cases' ? (
            <div className="empty-detail">
              <BookOpen size={32} />
              <h2>调整筛选，开始学习</h2>
              <p>学习卡与人体标记会同步到左侧目录。</p>
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
                      `你选择了${ACUPOINTS.find((p) => p.id === quizAnswer)?.name}。`}
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
                    <span>{point.id}</span>
                  </h2>
                  <p>
                    <i style={{ background: currentMeridian.color }} />
                    {currentMeridian.name}
                  </p>
                </div>
                <div className="detail-seal">{point.name.slice(-1)}</div>
              </div>
              <div className="point-tags">
                {point.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
                <span>{point.bilateral ? "双侧穴" : "正中单穴"}</span>
              </div>
              <div className="detail-shortcuts">
                <button
                  className="primary-button"
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
                <p className="location-text">{point.location}</p>
                <button
                  className="text-button"
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
              <section className="detail-section landmark-section">
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
              </section>
              <section className="detail-section">
                <h3>
                  <BookOpen size={15} />
                  传统功用与主治
                </h3>
                <p>{point.traditional}</p>
                <span className="content-status">传统理论学习 · 待教师审校</span>
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
                      {anatomyZh(p.name)}
                      <ChevronRight size={12} />
                    </button>
                  ))}
                  {!(anatomyQuery ? partResults : relatedParts).length && (
                    <p className="mini-note">没有匹配结构，可用英文名继续搜索。</p>
                  )}
                </div>
                <p className="mini-note">常用结构已有中文对照，细分名称暂保留原文。</p>
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
      </div>
      <footer className="app-footer">
        <span>经纬 · 让每一次学习，都有迹可循。</span>
        <span>
          <span className="tiny-dot" />
          本机学习记录
          <button onClick={() => setAbout(true)}>
            资料与署名
            <ExternalLink size={12} />
          </button>
        </span>
      </footer>
      {compared.length > 0 && (
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
      {chosenPart && (
        <div className="anatomy-selection">
          <div>
            <span>{SYSTEM_ZH[chosenPart.system]} · 解剖结构</span>
            <strong>{anatomyZh(chosenPart.name)}</strong>
            <small>{chosenPart.name}</small>
          </div>
          <button className="outline-button" onClick={() => setIsolate((v) => !v)}>
            {isolate ? "显示周围" : "单独查看"}
          </button>
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
              基于 Human Atlas 与 BodyParts3D 的中文教学扩展。当前学习集含 39
              个常用经穴，覆盖十四经，尚非完整经穴全集。
            </p>
            <h3>内容与模型</h3>
            <p>
              名称、体表定位参考 GB/T 12346—2021 与 WHO 定位资料。2021 国标收录 362 穴，与 WHO 361
              穴口径不同。每张卡保留来源，传统理论内容待教师复核。
            </p>
            <p>
              三维坐标为这一个成人男性模型上的近似标记；投射到皮肤表面不等于医学定位校准。选点虚线只连接当前收录穴位，不是完整经络循行。不同体型、女性模型和体位变化尚未加入。
            </p>
            <h3>学习记录与课堂</h3>
            <p>
              收藏、复习与个人课程保存在本浏览器。课程可以通过 JSON
              导出、导入；清除浏览器数据会删除本地记录。教师可使用笔记与课程文件组织教学，但系统不替代专业内容审校。
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
