import { useRef, useState } from "react";
import { Download, Upload, Check, Plus, BookOpen } from "lucide-react";
import type { Acupoint } from "./types";
import { parseStore, type StudyStore } from "./study";
export default function CoursePanel({
  store,
  points,
  point,
  onChange,
  onSelect,
  onCourseFilter,
}: {
  store: StudyStore;
  points: Acupoint[];
  point: Acupoint;
  onChange: (store: StudyStore) => void;
  onSelect: (id: string) => void;
  onCourseFilter: () => void;
}) {
  const input = useRef<HTMLInputElement>(null),
    [message, setMessage] = useState("");
  const selected = store.course.pointIds.includes(point.id);
  const toggle = () =>
    onChange({
      ...store,
      course: {
        ...store.course,
        pointIds: selected
          ? store.course.pointIds.filter((id) => id !== point.id)
          : [...store.course.pointIds, point.id],
      },
    });
  const exportCourse = () => {
    const content = JSON.stringify({ version: 1, course: store.course }, null, 2),
      url = URL.createObjectURL(new Blob([content], { type: "application/json" })),
      link = document.createElement("a");
    link.href = url;
    link.download = "经络课堂.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("课程已导出，包含所选穴位和个人笔记。");
  };
  const importCourse = async (file: File) => {
    try {
      if (file.size > 1024 * 1024) throw new Error("文件需小于 1 MB");
      const text = await file.text(),
        raw = JSON.parse(text);
      if (
        raw?.version !== 1 ||
        !raw.course ||
        typeof raw.course.name !== "string" ||
        !Array.isArray(raw.course.pointIds) ||
        !raw.course.pointIds.every(
          (id: unknown) => typeof id === "string" && points.some((p) => p.id === id),
        )
      )
        throw new Error("课程格式不正确，或包含未收录穴位");
      const parsed = parseStore(
        text,
        points.map((p) => p.id),
      );
      onChange({ ...store, course: parsed.course });
      setMessage("已导入课程；你的复习记录保持不变。");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "导入失败，请检查课程文件。");
    }
  };
  return (
    <section className="course-panel">
      <div className="section-kicker">
        <BookOpen size={14} /> 个人课程
      </div>
      <h2>把课堂，带到模型上。</h2>
      <p className="muted">选定学习范围，留下自己的理解。</p>
      <label className="field-label" htmlFor="course-name">
        课程名称
      </label>
      <input
        id="course-name"
        className="text-input"
        maxLength={80}
        value={store.course.name}
        onChange={(e) => onChange({ ...store, course: { ...store.course, name: e.target.value } })}
      />
      <div className="course-heading">
        <strong>已选穴位 · {store.course.pointIds.length}</strong>
        <button className="text-button" onClick={onCourseFilter}>
          在左侧筛选
        </button>
      </div>
      <div className="course-chips">
        {store.course.pointIds.length ? (
          store.course.pointIds.map((id) => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={id === point.id ? "active" : ""}
            >
              {points.find((p) => p.id === id)?.name}
            </button>
          ))
        ) : (
          <p className="empty-inline">从左侧选择穴位，然后加入课程。</p>
        )}
      </div>
      <button className="outline-button full" onClick={toggle}>
        {selected ? <Check size={16} /> : <Plus size={16} />}{" "}
        {selected ? `从课程移除${point.name}` : `将${point.name}加入课程`}
      </button>
      <label className="field-label" htmlFor="course-note">
        {point.name} · 课堂笔记
      </label>
      <textarea
        id="course-note"
        maxLength={5000}
        rows={6}
        placeholder="记录老师的定位口诀、易错点或需要核对的内容…"
        value={store.course.notes[point.id] ?? ""}
        onChange={(e) =>
          onChange({
            ...store,
            course: {
              ...store.course,
              notes: { ...store.course.notes, [point.id]: e.target.value },
            },
          })
        }
      />
      <p className="quiet-note">个人笔记 · 自动保存在此浏览器 · 不代表专业审校</p>
      <div className="two-buttons">
        <button className="outline-button" onClick={exportCourse}>
          <Download size={15} />
          导出课程
        </button>
        <button className="outline-button" onClick={() => input.current?.click()}>
          <Upload size={15} />
          导入课程
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        hidden
        aria-label="导入课程文件"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importCourse(file);
          e.currentTarget.value = "";
        }}
      />
      {message && (
        <p role="status" className="inline-message">
          {message}
        </p>
      )}
    </section>
  );
}
