import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALIAS, PKG, PRIMITIVE_FILES, fileLeaves, tokenMap } from './helpers';

const SEMANTIC = [
  'semantic/color.light.json',
  'semantic/color.dark.json',
  'semantic/color.hc-light.json',
  'semantic/color.hc-dark.json',
  'semantic/chart.cvd-light.json',
  'semantic/chart.cvd-dark.json',
];
const primitives = tokenMap(PRIMITIVE_FILES);

/** docs/spec/tokens.md §2 표의 첫 열에서 semantic 토큰 이름을 펼친다. `{…}`는 같은 그룹에서 직전에 펼친 목록을 뜻한다. */
function specNames(): string[] {
  const spec = readFileSync(join(PKG, '../../docs/spec/tokens.md'), 'utf8');
  const section = spec.split('## 2. Semantic 색 토큰')[1]?.split('\n## ')[0] ?? '';
  const lastSet = new Map<string, string[]>();
  const names: string[] = [];
  for (const line of section.split('\n')) {
    const cell = /^\| `([^`]+)` \|/.exec(line)?.[1];
    if (!cell) continue;
    const brace = /^(.*?)\{([^}]*)\}(.*)$/.exec(cell);
    if (!brace) {
      names.push(cell);
      continue;
    }
    const [, head = '', inner = '', tail = ''] = brace;
    const items = inner === '…' ? (lastSet.get(head) ?? []) : inner.split(',').map((s) => s.trim());
    lastSet.set(head, items);
    for (const item of items) names.push(`${head}${item}${tail}`);
  }
  return names;
}

describe('alias-only: semantic은 primitive alias만', () => {
  it.each(SEMANTIC)('%s: 모든 $value가 primitive 색을 가리키는 alias', (file) => {
    const errors: string[] = [];
    for (const leaf of fileLeaves(file)) {
      const m = typeof leaf.$value === 'string' ? ALIAS.exec(leaf.$value) : null;
      if (!m) {
        errors.push(`${leaf.path}: raw 값 ${JSON.stringify(leaf.$value)}`);
        continue;
      }
      const target = primitives.get(m[1]!);
      if (!target) errors.push(`${leaf.path}: {${m[1]}}는 primitive가 아니다`);
      else if (target.$type !== 'color') errors.push(`${leaf.path}: {${m[1]}}는 색이 아니다`);
    }
    expect(errors).toEqual([]);
  });

  it.each(SEMANTIC)('%s: 모든 토큰에 용도 $description', (file) => {
    const missing = fileLeaves(file)
      .filter((l) => !l.$description)
      .map((l) => l.path);
    expect(missing).toEqual([]);
  });

  it('paper.json: 색은 primitive 색 alias, 그림자는 primitive 그림자 alias, 모든 토큰에 $description', () => {
    const errors: string[] = [];
    for (const leaf of fileLeaves('paper.json')) {
      if (!leaf.$description) errors.push(`${leaf.path}: $description 없음`);
      if (leaf.$type !== 'color' && leaf.$type !== 'shadow') continue;
      const m = typeof leaf.$value === 'string' ? ALIAS.exec(leaf.$value) : null;
      const target = m ? primitives.get(m[1]!) : undefined;
      if (!target || target.$type !== leaf.$type)
        errors.push(`${leaf.path}: primitive ${leaf.$type} alias가 아니다(${String(leaf.$value)})`);
    }
    expect(errors).toEqual([]);
  });

  it('paper 이름이 tokens.md §9 표와 1:1(추가·누락 0)', () => {
    const spec = readFileSync(join(PKG, '../../docs/spec/tokens.md'), 'utf8');
    const section = spec.split('## 9. 종이(Paper) 토큰')[1]?.split('\n## ')[0] ?? '';
    const names = [...section.matchAll(/^\| `(paper\.[^`]+)` \|/gm)].map((m) => m[1]!).sort();
    expect(names).toEqual(
      fileLeaves('paper.json')
        .map((l) => l.path)
        .sort(),
    );
  });

  it('semantic 이름이 tokens.md §2 표와 1:1(추가·누락 0)', () => {
    const expected = specNames().sort();
    expect(expected.length).toBeGreaterThan(50);
    const actual = fileLeaves('semantic/color.light.json')
      .map((l) => l.path)
      .sort();
    expect(actual).toEqual(expected);
  });
});
