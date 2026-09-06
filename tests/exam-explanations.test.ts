import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { test } from 'node:test';

import { explanationIndex, parseExamExplanationBank } from '../app/tcm/exam-explanations.ts';
import { assertCleanTcmleCheckout, classifyMatch, normalizeExamText, readLicensedQuestions, strictQuestionMatch } from '../scripts/import-tcmle-explanations.ts';

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

const licensedFixture = '[{"question_num":1,"reason":"original","query":"原题","options":{"A":"甲","B":"乙","C":"丙","D":"丁","E":"戊"},"answer":"A"}]\n';

function temporaryGitCheckout(): { directory: string; trackedFile: string } {
  const directory = mkdtempSync(resolve(tmpdir(), 'tcmle-cleanliness-'));
  const trackedFile = resolve(directory, 'Licensed/Theory_Questions/Year_1/Mock.json');
  mkdirSync(resolve(directory, 'Licensed/Theory_Questions/Year_1'), { recursive: true });
  writeFileSync(trackedFile, licensedFixture);
  execFileSync('git', ['init', '--quiet', directory]);
  execFileSync('git', ['-C', directory, 'config', 'user.email', 'test@example.invalid']);
  execFileSync('git', ['-C', directory, 'config', 'user.name', 'TCMLE test']);
  execFileSync('git', ['-C', directory, 'add', '.']);
  execFileSync('git', ['-C', directory, 'commit', '--quiet', '-m', 'fixture']);
  return { directory, trackedFile };
}

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

test('checkout cleanliness rejects tracked changes and untracked candidate JSON files', () => {
  const { directory, trackedFile } = temporaryGitCheckout();
  try {
    assert.doesNotThrow(() => assertCleanTcmleCheckout(directory));

    writeFileSync(trackedFile, licensedFixture.replace('original', 'changed'));
    assert.throws(
      () => assertCleanTcmleCheckout(directory),
      /TCMLE checkout has tracked changes/i,
    );

    writeFileSync(trackedFile, licensedFixture);
    writeFileSync(resolve(directory, 'Licensed/Theory_Questions/Year_1/Injected.json'), '[]\n');
    assert.throws(
      () => assertCleanTcmleCheckout(directory),
      /TCMLE checkout has untracked files/i,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('licensed questions come only from the committed tree despite ignored worktree injection', () => {
  const { directory, trackedFile } = temporaryGitCheckout();
  try {
    const commit = execFileSync('git', ['-C', directory, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    appendFileSync(resolve(directory, '.git/info/exclude'), 'Licensed/Theory_Questions/Year_1/000-injected.json\n');
    writeFileSync(resolve(directory, 'Licensed/Theory_Questions/Year_1/000-injected.json'), '[{"question_num":1,"reason":"injected","query":"注入题","options":{"A":"甲","B":"乙","C":"丙","D":"丁","E":"戊"},"answer":"A"}]\n');

    const imported = readLicensedQuestions(directory, commit);
    assert.deepEqual(imported.files, ['Licensed/Theory_Questions/Year_1/Mock.json']);
    assert.deepEqual(imported.questions.map((question) => question.reason), ['original']);

    writeFileSync(trackedFile, licensedFixture.replace('original', 'working-tree change'));
    const reimported = readLicensedQuestions(directory, commit);
    assert.deepEqual(reimported.questions.map((question) => question.reason), ['original']);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('licensed questions ignore Git replacement objects for the fixed commit', () => {
  const { directory, trackedFile } = temporaryGitCheckout();
  try {
    const fixedCommit = execFileSync('git', ['-C', directory, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    writeFileSync(trackedFile, licensedFixture.replace('original', 'replacement'));
    execFileSync('git', ['-C', directory, 'add', '.']);
    execFileSync('git', ['-C', directory, 'commit', '--quiet', '-m', 'replacement']);
    const replacementCommit = execFileSync('git', ['-C', directory, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    execFileSync('git', ['-C', directory, 'replace', fixedCommit, replacementCommit]);

    const imported = readLicensedQuestions(directory, fixedCommit);
    assert.deepEqual(imported.questions.map((question) => question.reason), ['original']);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
