import { useState } from "react";
import { Lightbulb, Check, ArrowRight } from "lucide-react";
import { CASES, ACUPOINTS } from "./data";
export default function CasesPanel({ onSelect }: { onSelect: (id: string) => void }) {
  const [index, setIndex] = useState(0),
    [answer, setAnswer] = useState<number | null>(null),
    [submitted, setSubmitted] = useState(false);
  const item = CASES[index];
  return (
    <section className="case-panel">
      <div className="section-kicker">
        <Lightbulb size={14} /> 教学推理
      </div>
      <h2>知道答案，也知道为什么。</h2>
      <p className="muted">定位、归经与安全边界的情境练习。</p>
      <div className="case-progress">
        练习 {index + 1} / {CASES.length}
        <span className="pill">{item.level}</span>
      </div>
      <h3>{item.title}</h3>
      <p className="case-question">{item.prompt}</p>
      <div className="case-options">
        {item.options.map((option, i) => (
          <button
            key={option}
            className={`${answer === i ? "chosen" : ""} ${submitted && i === item.answer ? "correct" : ""}`}
            disabled={submitted}
            onClick={() => setAnswer(i)}
          >
            <span>{String.fromCharCode(65 + i)}</span>
            {option}
            {submitted && i === item.answer && <Check size={16} />}
          </button>
        ))}
      </div>
      {!submitted ? (
        <button
          className="primary-button full"
          disabled={answer === null}
          onClick={() => setSubmitted(true)}
        >
          提交并查看解析
          <ArrowRight size={16} />
        </button>
      ) : (
        <div className="case-explanation" role="status">
          <strong>{answer === item.answer ? "回答正确" : "再看一看推理依据"}</strong>
          <p>{item.explanation}</p>
          <div className="course-chips">
            {item.pointIds.map((id) => (
              <button key={id} onClick={() => onSelect(id)}>
                {ACUPOINTS.find((p) => p.id === id)?.name} ↗
              </button>
            ))}
          </div>
          <a className="small-source" href={item.sources[0].url} target="_blank" rel="noreferrer">
            查看参考来源
          </a>
          <button
            className="text-button"
            onClick={() => {
              setIndex((index + 1) % CASES.length);
              setAnswer(null);
              setSubmitted(false);
            }}
          >
            下一题
            <ArrowRight size={15} />
          </button>
        </div>
      )}
      <p className="quiet-note">原创教学练习，尚未经教师审阅。临床辨证选穴病例需另行专业编审。</p>
    </section>
  );
}
