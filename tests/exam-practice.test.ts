import assert from 'node:assert/strict';
import test from 'node:test';
import type { ExamQuestion } from '../app/tcm/exam-bank.ts';
import { renderableViewport } from '../app/tcm/scene-viewport.ts';
import {
  createExamSession,
  moveExamSession,
  parseExamProgress,
  recordExamAnswer,
  resetExamSession,
  searchExamQuestions,
  selectExamAnswer,
  shuffleQuestionIds,
  submitExamSelection,
} from '../app/tcm/exam-practice.ts';

const question: ExamQuestion = {
  id: 'q1',
  sourceIndex: 8,
  question: '下列哪项正确？',
  options: { A: '甲', B: '乙', C: '丙', D: '丁', E: '戊' },
  answer: 'B',
};

test('search finds option text after trimming the query', () => {
  assert.equal(searchExamQuestions([question], ' 乙 ').length, 1);
  assert.equal(searchExamQuestions([question], ' 不存在 ').length, 0);
});

test('shuffle uses Fisher-Yates without changing the input', () => {
  const ids = ['a', 'b', 'c'];
  assert.deepEqual(shuffleQuestionIds(ids, () => 0), ['b', 'c', 'a']);
  assert.deepEqual(ids, ['a', 'b', 'c']);
});

test('progress parser rejects malformed, unknown, and prototype-bearing records', () => {
  assert.deepEqual(parseExamProgress('{broken', new Set(['q1'])), {});
  const parsed = parseExamProgress(
    JSON.stringify({
      q1: { answer: 'B', correct: true, attempts: 2 },
      unknown: { answer: 'A', correct: false, attempts: 1 },
      bad: { answer: 'Z', correct: true, attempts: -1 },
      __proto__: { answer: 'A', correct: true, attempts: 1 },
    }),
    new Set(['q1', 'bad']),
  );
  assert.deepEqual({ ...parsed }, { q1: { answer: 'B', correct: true, attempts: 2 } });
  assert.equal(Object.hasOwn(parsed, '__proto__'), false);
});

test('answer records compare with source answer and increment attempts', () => {
  const first = recordExamAnswer({}, question, 'A');
  assert.equal(first[question.id].correct, false);
  const second = recordExamAnswer(first, question, 'B');
  assert.deepEqual(second[question.id], { answer: 'B', correct: true, attempts: 2 });
  assert.equal(first[question.id].attempts, 1);
});

test('submission requires a selection and reveals only after submit', () => {
  const initial = createExamSession(['q1', 'q2']);
  assert.equal(initial.selected, null);
  assert.equal(initial.submitted, false);
  assert.deepEqual(submitExamSelection(initial), initial);
  const selected = selectExamAnswer(initial, 'A');
  assert.equal(selected.submitted, false);
  assert.equal(submitExamSelection(selected).submitted, true);
});

test('navigation respects bounds and clears selection and reveal', () => {
  const answered = submitExamSelection(selectExamAnswer(createExamSession(['q1', 'q2']), 'A'));
  assert.deepEqual(moveExamSession(answered, -1), answered);
  const next = moveExamSession(answered, 1);
  assert.equal(next.index, 1);
  assert.equal(next.selected, null);
  assert.equal(next.submitted, false);
  assert.deepEqual(moveExamSession(next, 1), next);
});

test('changing the active collection resets position, selection, and reveal', () => {
  const active = moveExamSession(
    submitExamSelection(selectExamAnswer(createExamSession(['q1', 'q2']), 'A')),
    1,
  );
  assert.deepEqual(resetExamSession(active, ['q3']), createExamSession(['q3']));
});

test('hidden canvas dimensions never produce an invalid camera viewport', () => {
  assert.equal(renderableViewport(0, 600), null);
  assert.equal(renderableViewport(900, 0), null);
  assert.deepEqual(renderableViewport(900, 600), { width: 900, height: 600, aspect: 1.5 });
});
