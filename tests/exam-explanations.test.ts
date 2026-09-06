import assert from 'node:assert/strict';
import { test } from 'node:test';

import { explanationIndex, parseExamExplanationBank } from '../app/tcm/exam-explanations.ts';
import { classifyMatch, normalizeExamText, strictQuestionMatch } from '../scripts/import-tcmle-explanations.ts';

const cmbFixture = {
  id: 'a'.repeat(64),
  sourceIndex: 7,
  question: '血虚证的表现是？',
  options: { A: '面色淡白', B: '口苦', C: '盗汗', D: '发热', E: '腹痛' },
  answer: 'A' as const,
};

const tcmleFixture = {
  query: '血虚证的表现是?',
  options: { A: '面色淡白', B: '口苦', C: '盗汗', D: '发热', E: '腹痛' },
  answer: 'A' as const,
  reason: '血虚不能上荣，故见面色淡白。',
  sourceFile: 'Licensed/Theory_Questions/Year_1/Mock.json',
  sourceQuestionIndex: 12,
};

const validPayload = {
  schemaVersion: 1,
  source: 'TCMLE',
  sourceCommit: 'b'.repeat(40),
  explanations: [{
    questionId: 'a'.repeat(64),
    answer: 'A',
    text: '血虚不能上荣，故见面色淡白。',
    provenance: {
      dataset: 'TCMLE',
      sourceFile: 'Licensed/Theory_Questions/Year_1/Mock.json',
      sourceQuestionIndex: 12,
      sourceCommit: 'b'.repeat(40),
    },
  }],
};

test('normalizes width, whitespace and Chinese/ASCII punctuation only', () => {
  assert.equal(normalizeExamText('Ａ。 血 虚'), 'A血虚');
  assert.equal(normalizeExamText('A. 血虚'), 'A血虚');
  assert.equal(normalizeExamText('甲、乙'), '甲乙');
  assert.notEqual(normalizeExamText('Q—T'), normalizeExamText('Q-T'));
  assert.notEqual(normalizeExamText('血虚'), normalizeExamText('血瘀'));
});

test('changing one option prevents a strict match', () => {
  assert.equal(strictQuestionMatch(cmbFixture, tcmleFixture), true);
  assert.equal(strictQuestionMatch(cmbFixture, { ...tcmleFixture, options: { ...tcmleFixture.options, E: '改动选项' } }), false);
});

test('same strict question with different answers is isolated', () => {
  assert.deepEqual(classifyMatch(cmbFixture, { ...tcmleFixture, answer: 'B' }), { kind: 'conflict' });
  assert.deepEqual(classifyMatch(cmbFixture, { ...tcmleFixture, reason: '  ' }), { kind: 'none' });
  assert.deepEqual(classifyMatch(cmbFixture, { ...tcmleFixture, reason: '含有\uFFFD的文本' }), { kind: 'none' });
});

test('runtime parser accepts linked explanations and returns a lookup index', () => {
  const bank = parseExamExplanationBank(validPayload, [cmbFixture]);
  assert.equal(explanationIndex(bank).get('a'.repeat(64))?.text, '血虚不能上荣，故见面色淡白。');
});

test('runtime parser rejects IDs or answers that do not match CMB', () => {
  assert.throws(
    () => parseExamExplanationBank({ ...validPayload, explanations: [{ ...validPayload.explanations[0], questionId: 'c'.repeat(64) }] }, [cmbFixture]),
    /Invalid exam explanations: unknown question id/i,
  );
  assert.throws(
    () => parseExamExplanationBank({ ...validPayload, explanations: [{ ...validPayload.explanations[0], answer: 'B' }] }, [cmbFixture]),
    /Invalid exam explanations: answer disagrees/i,
  );
});

test('runtime parser rejects duplicate, unsafe, and malformed explanation data without partial acceptance', () => {
  assert.throws(
    () => parseExamExplanationBank({ ...validPayload, explanations: [validPayload.explanations[0], validPayload.explanations[0]] }, [cmbFixture]),
    /Invalid exam explanations: duplicate question id/i,
  );
  assert.throws(
    () => parseExamExplanationBank({ ...validPayload, explanations: [{ ...validPayload.explanations[0], text: ' ' }] }, [cmbFixture]),
    /Invalid exam explanations:.*text/i,
  );
  assert.throws(
    () => parseExamExplanationBank({ ...validPayload, explanations: [{ ...validPayload.explanations[0], provenance: { ...validPayload.explanations[0].provenance, sourceFile: '../secret.json' } }] }, [cmbFixture]),
    /Invalid exam explanations:.*provenance/i,
  );
  assert.throws(
    () => parseExamExplanationBank(JSON.parse('{"schemaVersion":1,"source":"TCMLE","sourceCommit":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","explanations":[],"__proto__":{}}'), [cmbFixture]),
    /Invalid exam explanations: unsafe prototype key/i,
  );
});
