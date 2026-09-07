import { createElement, Fragment } from 'react';

const cmbProject = createElement(
  'a',
  { href: 'https://github.com/FreedomIntelligence/CMB', target: '_blank', rel: 'noreferrer' },
  'CMB（Chinese Medical Benchmark）',
);

const tcmleProject = createElement(
  'a',
  { href: 'https://huggingface.co/datasets/Bolin97/TCMLE', target: '_blank', rel: 'noreferrer' },
  'TCMLE 数据',
);

export function ExamAbout() {
  return createElement(
    Fragment,
    null,
    createElement('h3', null, '执医题库'),
    createElement(
      'p',
      null,
      '题库从 ',
      cmbProject,
      ' 训练数据中按“医师考试 · 执业医师 · 中医执业医师 · 单项选择题”严格筛选，当前包含 4086 题。它不是官方或当年完整题库，也未做逐题医学审定。答题记录仅保存在本浏览器，与穴位学习记录分开。',
    ),
    createElement(
      'p',
      null,
      '336 条参考解析来自 Apache-2.0 标记的 ',
      tcmleProject,
      '，仅在题干、A–E 选项全部一致且答案一致时关联，2 道答案冲突已隔离；未匹配题不生成 AI 解析。',
    ),
  );
}
