import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import atlas from '../public/models/atlas.json' with { type: 'json' };
import evidence from '../data/sources/fudan-anatomy-terms-batch-1.json' with { type: 'json' };
import { EXISTING_ANATOMY_TERMS, type AnatomyTerm } from '../app/tcm/anatomy-terms-existing.ts';
import { anatomyZhWithTerms } from '../app/tcm/anatomy-zh-base.ts';

export type FudanEvidenceRow = {
  core: string;
  zh: string;
  sourceEntry: string;
  pdfPage: number;
  sourceEnglish: string;
};

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const FUDAN_SOURCE = 'https://xtjp.fudan.edu.cn/Upload/Files/201804100314393640155.pdf';
const EXCLUDED_CANDIDATES: Readonly<Record<string, string>> = {
  'arcuate artery': 'Chinese source term is contextual to the fibular artery',
  'central canal of spinal cord': 'Chinese source term is context-bound and cannot be proven from the atlas core',
  'inferior pulmonary vein': 'source row is right-specific while the core is not',
};

/** Remove only the atlas' leading laterality prefix. */
export function atlasCore(name: string): string {
  return name.replace(/^(?:left |right )/, '');
}

const normalized = (value: string) => value.trim().toLocaleLowerCase();

export function excludedRowsForFudanBatch(rows: readonly FudanEvidenceRow[]): number {
  const importedCores = new Set(rows.map(row => normalized(row.core)));
  return Object.keys(EXCLUDED_CANDIDATES).filter(core => !importedCores.has(core)).length;
}

export function validateFudanBatch(
  rows: readonly FudanEvidenceRow[],
  parts: ReadonlyArray<{ id: string; name: string }>,
): { errors: string[]; matchedCores: number; matchedParts: number } {
  const errors: string[] = [];
  const cores = new Set(parts.map(part => atlasCore(normalized(part.name))));
  const seen = new Set<string>();
  const validCores = new Set<string>();

  for (const row of rows) {
    const core = normalized(row.core);
    const sourceEnglish = normalized(row.sourceEnglish);
    const label = row.core || '(empty core)';
    let valid = true;
    if (!core || !row.zh?.trim() || !row.sourceEntry?.trim() || !sourceEnglish) {
      errors.push(`${label}: empty evidence`);
      valid = false;
    }
    if (!Number.isInteger(row.pdfPage) || row.pdfPage < 1) {
      errors.push(`${label}: invalid PDF page`);
      valid = false;
    }
    if (core !== sourceEnglish) {
      errors.push(`${label}: source English differs from core`);
      valid = false;
    }
    if (Object.hasOwn(EXCLUDED_CANDIDATES, core)) {
      errors.push(`${label}: excluded candidate (${EXCLUDED_CANDIDATES[core]})`);
      valid = false;
    }
    if (seen.has(core)) {
      errors.push(`${label}: duplicate core`);
      valid = false;
    }
    seen.add(core);
    if (/[左右]/u.test(row.zh) && !/\b(?:left|right)\b/u.test(core)) {
      errors.push(`${label}: side-specific Chinese term requires a side-specific core`);
      valid = false;
    }
    if (!cores.has(core)) {
      errors.push(`${label}: core is absent from atlas`);
      valid = false;
    }
    if (Object.hasOwn(EXISTING_ANATOMY_TERMS, core)) {
      errors.push(`${label}: core is already present in ANATOMY_TERMS`);
      valid = false;
    }
    if (valid) validCores.add(core);
  }

  const matchedParts = parts.filter(part => validCores.has(atlasCore(normalized(part.name)))).length;
  return { errors, matchedCores: validCores.size, matchedParts };
}

export function coverageForFudanBatch(
  rows: readonly FudanEvidenceRow[],
  parts: ReadonlyArray<{ name: string }>,
): { total: number; translated: number; unresolved: number } {
  const currentBatch: Record<string, AnatomyTerm> = Object.fromEntries(rows.map(row => [normalized(row.core), {
    zh: row.zh,
    source: `${FUDAN_SOURCE}#page=${row.pdfPage}`,
    sourceTerm: `大陆术语 ${row.sourceEntry}: ${row.zh} / ${row.sourceEnglish}`,
  }]));
  const terms = { ...EXISTING_ANATOMY_TERMS, ...currentBatch };
  const translated = parts.reduce(
    (count, part) => count + Number(anatomyZhWithTerms(part.name, terms) !== part.name),
    0,
  );
  return { total: parts.length, translated, unresolved: parts.length - translated };
}

function renderTerms(rows: readonly FudanEvidenceRow[]): string {
  const sorted = [...rows].sort((left, right) => left.core < right.core ? -1 : left.core > right.core ? 1 : 0);
  const record = sorted.map(row => {
    const term: AnatomyTerm = {
      zh: row.zh,
      source: `${FUDAN_SOURCE}#page=${row.pdfPage}`,
      sourceTerm: `大陆术语 ${row.sourceEntry}: ${row.zh} / ${row.sourceEnglish}`,
      note: '已核对复旦大学托管的《人体解剖学名词》原文条目；属于来源对应核查，未宣称专业审校。',
    };
    return `  ${JSON.stringify(row.core)}: ${JSON.stringify(term)},`;
  }).join('\n');
  return `import type { AnatomyTerm } from './anatomy-terms.ts';\n\nconst FUDAN_SOURCE = '${FUDAN_SOURCE}';\n\n/** Generated from data/sources/fudan-anatomy-terms-batch-1.json. */\nexport const FUDAN_BATCH_1_TERMS: Record<string, AnatomyTerm> = {\n${record}\n};\n`;
}

function run(): void {
  const rows = evidence as FudanEvidenceRow[];
  const result = validateFudanBatch(rows, atlas.parts);
  if (result.errors.length) {
    throw new Error(`Fudan anatomy batch validation failed:\n${result.errors.join('\n')}`);
  }

  writeFileSync(resolve(ROOT, 'app/tcm/anatomy-terms-fudan-batch-1.ts'), renderTerms(rows));
  const coverage = coverageForFudanBatch(rows, atlas.parts);
  const report = {
    sourceRows: rows.length,
    matchedCores: result.matchedCores,
    matchedParts: result.matchedParts,
    excludedRows: excludedRowsForFudanBatch(rows),
    translatedTotal: coverage.translated,
    unresolvedTotal: coverage.unresolved,
  };
  writeFileSync(resolve(ROOT, 'public/data/anatomy-term-import-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
