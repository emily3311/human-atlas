import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseExamBank } from '../app/tcm/exam-bank.ts';
import { selectCmbQuestions } from '../scripts/import-cmb.ts';

const row = {
  exam_type: '医师考试',
  exam_class: '执业医师',
  exam_subject: '中医执业医师',
  question_type: '单项选择题',
  question: '测试题',
  option: { A: '甲', B: '乙', C: '丙', D: '丁', E: '戊' },
  answer: 'B',
};

test('selects only the exact CMB examination category', () => {
  const variants = [
    row,
    { ...row, exam_type: '护士考试' },
    { ...row, exam_class: '执业助理医师' },
    { ...row, exam_subject: '中西医结合执业医师' },
  ];
  const selected = selectCmbQuestions(variants);
  assert.equal(selected.questions.length, 1);
  assert.equal(selected.questions[0]?.sourceIndex, 0);
});

test('rejects non-single-choice and structurally invalid records', () => {
  const variants: unknown[] = [
    { ...row, question_type: '多项选择题' },
    { ...row, question: '' },
    { ...row, question: 123 },
    { ...row, option: { ...row.option, E: '' } },
    { ...row, option: { ...row.option, E: 5 } },
    { ...row, answer: 'F' },
    { ...row, answer: 'E', option: { ...row.option, E: ' ' } },
    { ...row, metadata: { damaged: '\uFFFD' } },
    null,
  ];
  const selected = selectCmbQuestions(variants);
  assert.equal(selected.questions.length, 0);
  assert.deepEqual(selected.report.reasonCounts, {
    invalidRecord: 1,
    wrongQuestionType: 1,
    missingOrNonStringField: 4,
    replacementCharacter: 1,
    invalidAnswer: 1,
    answerOptionMismatch: 1,
  });
});

test('trims display fields but uses normalized content to collapse same-answer duplicates', () => {
  const duplicate = {
    ...row,
    question: ' 　测\n试题 ',
    option: { A: ' 甲 ', B: '乙', C: '丙', D: '丁', E: '戊' },
  };
  const selected = selectCmbQuestions([row, duplicate]);
  assert.equal(selected.questions.length, 1);
  assert.equal(selected.questions[0]?.question, '测试题');
  assert.equal(selected.questions[0]?.sourceIndex, 0);
  assert.equal(selected.report.duplicateRows, 1);
});

test('quarantines every member of a normalized duplicate group with conflicting answers', () => {
  const conflicting = {
    ...row,
    question: ' 测 \n试 题 ',
    answer: 'C',
  };
  const selected = selectCmbQuestions([row, conflicting]);
  assert.equal(selected.questions.length, 0);
  assert.equal(selected.report.conflictGroups, 1);
  assert.deepEqual(selected.report.conflictSourceIndices, [[0, 1]]);
});

test('stable IDs do not depend on input order and retain original source indices', () => {
  const second = { ...row, question: '另一题', answer: 'A' };
  const firstPass = selectCmbQuestions([row, second]).questions;
  const reordered = selectCmbQuestions([second, row]).questions;
  const firstIds = Object.fromEntries(firstPass.map((question) => [question.question, question.id]));
  const secondIds = Object.fromEntries(reordered.map((question) => [question.question, question.id]));
  assert.deepEqual(firstIds, secondIds);
  assert.deepEqual(firstPass.map((question) => question.sourceIndex), [0, 1]);
  assert.deepEqual(reordered.map((question) => question.sourceIndex), [0, 1]);
});

test('parseExamBank accepts a complete bank and rejects malformed or duplicate data', () => {
  const question = selectCmbQuestions([row]).questions[0]!;
  const bank = {
    schemaVersion: 1,
    source: 'CMB',
    sourceSha256: 'a'.repeat(64),
    questions: [question],
  };
  assert.deepEqual(parseExamBank(bank), bank);
  assert.throws(() => parseExamBank({ schemaVersion: 1, questions: [{}] }), /exam bank/i);
  assert.throws(() => parseExamBank({ ...bank, questions: [question, question] }), /duplicate/i);
  assert.throws(() => parseExamBank({ ...bank, questions: [{ ...question, answer: 'F' }] }), /answer/i);
});
