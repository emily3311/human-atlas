import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Info, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { parseExamBank, type AnswerKey, type ExamBank } from './exam-bank';
import { examFeedback, loadExamExplanations, type ExplanationState } from './exam-feedback';
import type { ExamExplanation } from './exam-explanations';
import {
  EXAM_PROGRESS_KEY,
  createExamSession,
  moveExamSession,
  parseExamProgress,
  recordExamAnswer,
  resetExamSession,
  searchExamQuestions,
  selectExamAnswer,
  shuffleQuestionIds,
  submitExamSelection,
  type ExamProgress,
  type ExamSession,
} from './exam-practice';
import './exam.css';

const ANSWERS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E'];
type Scope = 'all' | 'wrong';
type Order = 'sequential' | 'random';

function sessionIds(bank: ExamBank, progress: ExamProgress, query: string, scope: Scope, order: Order) {
  const searched = searchExamQuestions(bank.questions, query);
  const scoped = scope === 'wrong' ? searched.filter((item) => progress[item.id]?.correct === false) : searched;
  const ids = scoped.map((item) => item.id);
  return order === 'random' ? shuffleQuestionIds(ids) : ids;
}

export default function ExamPanel({ onAbout }: { onAbout: () => void }) {
  const [bank, setBank] = useState<ExamBank | null>(null);
  const [explanations, setExplanations] = useState<ReadonlyMap<string, ExamExplanation>>(new Map());
  const [explanationState, setExplanationState] = useState<ExplanationState>('loading');
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [progress, setProgress] = useState<ExamProgress>({});
  const [hydrated, setHydrated] = useState(false);
  const [storageWarning, setStorageWarning] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [order, setOrder] = useState<Order>('sequential');
  const [query, setQuery] = useState('');
  const [session, setSession] = useState<ExamSession>(() => createExamSession([]));
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoadError('');
    setBank(null);
    setHydrated(false);
    setExplanations(new Map());
    setExplanationState('loading');
    fetch('/data/cmb-tcm.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('题库加载失败');
        return response.json();
      })
      .then((payload) => {
        const parsed = parseExamBank(payload);
        let saved: ExamProgress = {};
        try {
          saved = parseExamProgress(
            localStorage.getItem(EXAM_PROGRESS_KEY),
            new Set(parsed.questions.map((item) => item.id)),
          );
        } catch {
          setStorageWarning('无法读取本机练习记录；当前会话仍可继续。');
        }
        setProgress(saved);
        setSession(createExamSession(parsed.questions.map((item) => item.id)));
        setBank(parsed);
        setHydrated(true);
        loadExamExplanations(fetch, parsed.questions, controller.signal).then((result) => {
          if (controller.signal.aborted) return;
          setExplanations(result.explanations);
          setExplanationState(result.state);
        });
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setLoadError(error.message || '题库加载失败');
      });
    return () => controller.abort();
  }, [loadAttempt]);

  const questionsById = useMemo(
    () => new Map(bank?.questions.map((item) => [item.id, item]) ?? []),
    [bank],
  );
  const question = questionsById.get(session.ids[session.index]);
  const feedback = question ? examFeedback(question, explanationState, explanations.get(question.id)) : null;
  const completed = Object.keys(progress).length;
  const wrong = Object.values(progress).filter((item) => !item.correct).length;

  const restart = (nextQuery: string, nextScope: Scope, nextOrder: Order) => {
    if (!bank) return;
    setSession((current) => resetExamSession(current, sessionIds(bank, progress, nextQuery, nextScope, nextOrder)));
  };
  const chooseScope = (next: Scope) => {
    setScope(next);
    restart(query, next, order);
  };
  const chooseOrder = (next: Order) => {
    setOrder(next);
    restart(query, scope, next);
  };
  const changeQuery = (next: string) => {
    setQuery(next);
    restart(next, scope, order);
  };
  const submit = () => {
    if (!hydrated || !question || !session.selected || session.submitted) return;
    const nextProgress = recordExamAnswer(progress, question, session.selected);
    setProgress(nextProgress);
    setSession((current) => submitExamSelection(current));
    try {
      localStorage.setItem(EXAM_PROGRESS_KEY, JSON.stringify(nextProgress));
      setStorageWarning('');
    } catch {
      setStorageWarning('无法保存本机练习记录；当前会话仍可继续。');
    }
  };
  const clearProgress = () => {
    setProgress({});
    setConfirmClear(false);
    if (bank) setSession(createExamSession(sessionIds(bank, {}, query, scope, order)));
    try {
      localStorage.removeItem(EXAM_PROGRESS_KEY);
      setStorageWarning('');
    } catch {
      setStorageWarning('无法清除本机练习记录；已清除当前会话记录。');
    }
  };

  if (loadError) {
    return <main className="exam-page exam-status" aria-live="polite"><AlertTriangle size={28}/><h1>题库暂时无法加载</h1><p>{loadError}</p><button className="exam-primary" onClick={() => setLoadAttempt((value) => value + 1)}><RotateCcw size={15}/>重试</button></main>;
  }
  if (!bank) {
    return <main className="exam-page exam-status" aria-live="polite"><span className="exam-loader"/><h1>正在加载题库</h1><p>请稍候……</p></main>;
  }

  return (
    <main className="exam-page">
      <div className="exam-shell">
        <header className="exam-heading">
          <div><span className="exam-kicker">PRACTICE · 单项选择题</span><h1>执医题库</h1><p>已作答 {completed} 题 · 当前错题 {wrong} 题</p></div>
          <button className="exam-about" onClick={onAbout}><Info size={15}/>关于题库</button>
        </header>

        <section className="exam-toolbar" aria-label="练习设置">
          <label className="exam-search" htmlFor="exam-search"><Search size={16}/><span className="sr-only">搜索题干或选项</span><input id="exam-search" value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="搜索题干或选项"/>{query && <button aria-label="清空题库搜索" onClick={() => changeQuery('')}><X size={14}/></button>}</label>
          <div className="exam-segment" role="group" aria-label="题目范围">
            <button className={scope === 'all' ? 'active' : ''} aria-pressed={scope === 'all'} onClick={() => chooseScope('all')}>全部题目</button>
            <button className={scope === 'wrong' ? 'active' : ''} aria-pressed={scope === 'wrong'} onClick={() => chooseScope('wrong')}>错题回顾</button>
          </div>
          <div className="exam-segment" role="group" aria-label="练习顺序">
            <button className={order === 'sequential' ? 'active' : ''} aria-pressed={order === 'sequential'} onClick={() => chooseOrder('sequential')}>顺序练习</button>
            <button className={order === 'random' ? 'active' : ''} aria-pressed={order === 'random'} onClick={() => chooseOrder('random')}>随机练习</button>
          </div>
        </section>

        {storageWarning && <div className="exam-warning" role="status"><AlertTriangle size={15}/>{storageWarning}</div>}

        {!question ? (
          <section className="exam-empty"><Search size={28}/><h2>{scope === 'wrong' ? '当前没有匹配的错题' : '没有匹配的题目'}</h2><p>试试更换关键词或恢复全部题目。</p><button className="exam-primary" onClick={() => { setQuery(''); setScope('all'); restart('', 'all', order); }}>显示全部题目</button></section>
        ) : (
          <article className="exam-card">
            <div className="exam-card-meta"><span>{session.index + 1} / {session.ids.length}</span><span>单项选择题</span></div>
            <h2>{question.question}</h2>
            <div className="exam-options" role="group" aria-label="选择答案">
              {ANSWERS.map((answer) => {
                const chosen = session.selected === answer;
                const correct = session.submitted && question.answer === answer;
                const incorrect = session.submitted && chosen && !correct;
                return <button key={answer} className={`${chosen ? 'selected' : ''} ${correct ? 'correct' : ''} ${incorrect ? 'incorrect' : ''}`} aria-pressed={chosen} disabled={session.submitted} onClick={() => setSession((current) => selectExamAnswer(current, answer))}><strong>{answer}</strong><span>{question.options[answer]}</span>{correct && <em><Check size={15}/>正确答案</em>}{incorrect && <em><X size={15}/>你的选择</em>}</button>;
              })}
            </div>
            {session.submitted && feedback && (
              <div className="exam-feedback" role="status">
                <strong>答案：{feedback.answer}</strong>
                <div className="exam-feedback-explanation">
                  <strong>{feedback.heading}</strong>
                  {'text' in feedback && <span>{feedback.text}</span>}
                </div>
              </div>
            )}
            <div className="exam-actions">
              <button className="exam-nav" disabled={session.index === 0} onClick={() => setSession((current) => moveExamSession(current, -1))}><ChevronLeft size={16}/>上一题</button>
              <button className="exam-primary" disabled={!session.selected || session.submitted} onClick={submit}>提交答案</button>
              <button className="exam-nav" disabled={session.index === session.ids.length - 1} onClick={() => setSession((current) => moveExamSession(current, 1))}>下一题<ChevronRight size={16}/></button>
            </div>
          </article>
        )}

        <div className="exam-progress-actions">
          {!confirmClear ? <button onClick={() => setConfirmClear(true)}><Trash2 size={14}/>清除本机题库记录</button> : <div role="group" aria-label="确认清除题库记录"><span>只清除本题库记录？</span><button className="danger" onClick={clearProgress}>确认清除</button><button onClick={() => setConfirmClear(false)}>取消</button></div>}
        </div>
      </div>
    </main>
  );
}
