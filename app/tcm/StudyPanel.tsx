import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw, Check, Eye, BookOpen, Brain } from "lucide-react";
import type { Acupoint, Meridian, PlacementDisplayMode } from "./types";
import type { Rating, Review } from "./study";
import { questionAvailable } from './catalogue';
export type CardType = "location" | "meridian" | "tags" | "identify";
export default function StudyPanel({
  point,
  meridian,
  index,
  total,
  review,
  type,
  onRate,
  onNext,
  onType,
  onReveal,
  onExplore,
  placementDisplayMode = 'calibrated-only',
}: {
  point: Acupoint;
  meridian: Meridian;
  index: number;
  total: number;
  review?: Review;
  type: CardType;
  onRate: (rating: Rating) => void;
  onNext: () => void;
  onType: (type: CardType) => void;
  onReveal: (revealed: boolean) => void;
  onExplore: () => void;
  placementDisplayMode?: PlacementDisplayMode;
}) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    setFlipped(false);
    onReveal(false);
  }, [point.id, type]);
  const flip = () => {
    setFlipped((v) => !v);
    onReveal(!flipped);
  };
  const question =
    type === "location"
      ? `${point.name}在哪里？`
      : type === "meridian"
        ? `${point.name}属于哪条经脉？`
        : type === "tags"
          ? `${point.name}有哪些特定穴分类？`
          : "模型中标记的穴位叫什么？";
  const answer =
    type === "location"
      ? point.location
      : type === "meridian"
        ? meridian.name
        : type === "tags"
          ? point.tags.slice(2).join(" · ") || "暂无特定穴分类"
          : `${point.name} · ${point.id}`;
  return (
    <section className="study-panel">
      <div className="section-kicker">
        <Brain size={14} /> 主动回忆
      </div>
      <h2>先想一想，再翻面。</h2>
      <p className="muted">把知道，变成记得住。</p>
      <div className="card-types" role="group" aria-label="记忆卡题型">
        {(
          [
            ["location", "定位"],
            ["meridian", "归经"],
            ["tags", "分类"],
            ["identify", "认穴"],
          ] as const
        ).map(([id, name]) => (
          <button key={id} disabled={!questionAvailable(point,id,placementDisplayMode)} title={!questionAvailable(point,id,placementDisplayMode)?'此题型的资料或当前显示范围的三维定位尚未就绪':undefined} className={type === id ? "active" : ""} onClick={() => onType(id)}>
            {name}
          </button>
        ))}
      </div>
      <p className="quiet-note">灰色题型尚未具备可核对答案或三维示意；不会作为考试答案练习。</p>
      {!questionAvailable(point, 'identify', placementDisplayMode) && <p className="quiet-note">当前显示范围没有可用于认穴的三维坐标；仍可练习文字定位。</p>}
      <div className="card-counter">
        <span>
          学习卡 {index + 1} / {total}
        </span>
        <span>{review ? `已练习 ${review.repetitions} 次` : "初次学习"}</span>
      </div>
      <button
        className={`flip-card ${flipped ? "flipped" : ""}`}
        onClick={flip}
        aria-label={flipped ? "翻回题目" : "翻面查看答案"}
        aria-pressed={flipped}
      >
        <span className="flip-inner">
          <span className="card-face front" aria-hidden={flipped}>
            <span className="flashcard-eyebrow">
              {type === "identify"
                ? "辨认练习"
                : type === "meridian"
                  ? "归经练习"
                  : `${point.displayCode??point.id} · 知识卡`}
            </span>
            <span className="flashcard-seal">{type === "identify" ? "辨" : "忆"}</span>
            <strong>{question}</strong>
            <span className="card-hint">
              {type === "identify"
                ? "观察人体上的高亮点，回忆它的名字。"
                : "先在脑海里回答，再核对答案。"}
            </span>
            <span className="flip-instruction">
              <RotateCcw size={14} /> 点击翻面 · Enter / 空格
            </span>
          </span>
          <span className="card-face back" aria-hidden={!flipped}>
            <span className="flashcard-eyebrow">参考答案</span>
            <strong>{answer}</strong>
            <span className="card-hint">
              {type === "identify" ? point.location : point.landmarks[0]}
            </span>
            <span className="flip-instruction">点击返回题目</span>
          </span>
        </span>
      </button>
      {flipped ? (
        <>
          <p className="rating-caption">这次记得怎么样？</p>
          <div className="rating-buttons">
            <button
              onClick={() => {
                setFlipped(false);
                onReveal(false);
                onRate("again");
              }}
            >
              <RotateCcw size={15} />
              不会<small>10 分钟后</small>
            </button>
            <button
              onClick={() => {
                setFlipped(false);
                onReveal(false);
                onRate("hard");
              }}
            >
              <Brain size={15} />
              模糊<small>明天复习</small>
            </button>
            <button
              onClick={() => {
                setFlipped(false);
                onReveal(false);
                onRate("good");
              }}
            >
              <Check size={15} />
              记住了<small>逐步延长间隔</small>
            </button>
          </div>
        </>
      ) : (
        <p className="quiet-note">
          <Eye size={14} /> 翻面后，可标记掌握程度并安排复习
        </p>
      )}
      <div className="study-actions">
        <button className="text-button" onClick={onExplore}>
          <BookOpen size={15} />
          完整讲解
        </button>
        <button
          className="text-button"
          onClick={() => {
            setFlipped(false);
            onReveal(false);
            onNext();
          }}
        >
          下一张
          <ArrowRight size={15} />
        </button>
      </div>
      {flipped && type === "tags" ? (
        <div>
          {point.classificationEvidence.map(({ source, tags }) => (
            <a
              className="small-source"
              href={source.url}
              target="_blank"
              rel="noreferrer"
              key={`${source.url}-${tags.join("-")}`}
            >
              已核对 {tags.join("、")}：{source.title}
            </a>
          ))}
          {point.pendingClassificationTags.length > 0 && (
            <p className="quiet-note">
              待逐项核验：{point.pendingClassificationTags.join("、")}
            </p>
          )}
          {!point.classificationEvidence.length && !point.pendingClassificationTags.length && (
            <p className="quiet-note">当前无特定穴分类标签。</p>
          )}
        </div>
      ) : flipped ? (
        <a className="small-source" href={point.sources[0].url} target="_blank" rel="noreferrer">
          答案依据：{point.sources[0].title}
        </a>
      ) : null}
    </section>
  );
}
