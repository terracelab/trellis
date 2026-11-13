// @vitest-environment node
// 동봉 문서(dist/docs) 생성기 검증 — docs/spec/distribution.md §2.3
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  FORBIDDEN,
  LIMITS,
  buildDocs,
  parseExamples,
  publicPaths,
} from '../../../scripts/build-docs.mjs';

const out = mkdtempSync(join(tmpdir(), 'trellis-docs-'));
const built = await buildDocs({ outDir: out, verifyNode: false });
const read = (rel: string) => readFileSync(join(out, rel), 'utf8');
afterAll(() => rmSync(out, { recursive: true, force: true }));

describe('build-docs', () => {
  it('manifest: 버전 · 컴포넌트 수 = spec 폴더 수 · 토큰', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    const m = built.manifest;
    expect(m.version).toBe(pkg.version);
    expect(m.components.length).toBe(built.report.components);
    expect(m.components.length).toBeGreaterThanOrEqual(14);
    expect(m.tokens.semantic.length).toBeGreaterThanOrEqual(76);
    expect(m.tokens.chart.series).toHaveLength(5);
    expect(m.principles).toHaveLength(6);
    expect(m.patterns.map((p) => p.name)).toContain('NotificationHome');
  });

  it('컴포넌트 문서: 필수 절 · Props 표 = contract · 예시 코드는 공개 entry import', () => {
    for (const c of built.manifest.components) {
      const md = read(c.doc);
      for (const h of ['## 용도', '## Props', '## States', '## 접근성', '## 예시'])
        expect(md, `${c.name} ${h}`).toContain(h);
      for (const p of c.props) expect(md, `${c.name}.${p.name}`).toContain(`| \`${p.name}\` |`);
      expect(md).toContain(`from '${c.entry}'`);
      expect(md).not.toMatch(/from '\.\.?\//);
      expect(md, '내부 절 제외').not.toContain('## 스토리');
    }
  });

  it('llms.txt · llms-full 크기 한도, 금칙어 0, 링크 유효', () => {
    expect(Buffer.byteLength(read('llms.txt'))).toBeLessThanOrEqual(LIMITS.llms);
    expect(Buffer.byteLength(read('llms-full.txt'))).toBeLessThanOrEqual(LIMITS.llmsFull);
    // 금칙어는 문서마다 0. 문구 가이드(guides/content.md)는 금칙어를 이름 붙여 금지하는 문서라 유일한 예외
    for (const rel of [
      ...built.manifest.components.map((c) => c.doc),
      ...built.manifest.guides.map((g) => g.doc),
      'tokens.md',
      'CHANGELOG.md',
    ]) {
      if (rel === 'guides/content.md') continue;
      for (const w of FORBIDDEN) expect(read(rel), `${rel} ${w}`).not.toContain(w);
    }
    expect(read('guides/content.md')).toContain('손쉽게');
    for (const m of read('llms.txt').matchAll(/\]\(([^)]+)\)/g)) {
      if (!m[1]!.startsWith('http')) expect(existsSync(join(out, m[1]!)), m[1]).toBe(true);
    }
  });

  it('가이드 · 토큰 표 · 변경 이력이 함께 들어간다', () => {
    for (const g of built.manifest.guides) expect(read(g.doc)).toMatch(/^# /);
    expect(read('tokens.md')).toContain('--tl-color-bg-surface');
    expect(read('CHANGELOG.md')).toMatch(/^# 변경 이력/);
  });

  it('parseExamples: 모듈 상수를 포함하고 상대 import를 entry로 바꾼다', () => {
    const src = `import { X } from './X.js';\nimport { f } from '@terracelab/trellis-contracts';\n\nconst DATA = [1, 2];\n\n/** 제목 — 설명 */\nexport function A() {\n  return <X data={DATA} format={f} />;\n}\n`;
    const [ex] = parseExamples(src, '@terracelab/trellis-react/charts');
    expect(ex).toMatchObject({ name: 'A', title: '제목', description: '설명' });
    expect(ex!.code).toContain("import { X } from '@terracelab/trellis-react/charts';");
    expect(ex!.code).toContain("import { f } from '@terracelab/trellis-contracts';");
    expect(ex!.code).toContain('const DATA = [1, 2];');
  });

  it('parseExamples: type import · 여러 줄 상수 · 상수가 쓰는 상수(R-T38)', () => {
    const src = [
      "import type { Row } from '@terracelab/trellis-contracts';",
      "import { X, type XProps } from './X.js';",
      '',
      "const KINDS = ['a', 'b'] as const;",
      'const ROWS: Row[] = [1, 2].map((n) => {',
      '  const kind = KINDS[n % 2]!;',
      '  return { n, kind };',
      '});',
      '',
      '/** 제목 */',
      'export function A() {',
      '  const props: XProps = { rows: ROWS };',
      '  return <X {...props} />;',
      '}',
      '',
    ].join('\n');
    const [ex] = parseExamples(src, '@terracelab/trellis-react');
    expect(ex!.code).toContain("import type { Row } from '@terracelab/trellis-contracts';");
    expect(ex!.code).toContain("import { X, type XProps } from '@terracelab/trellis-react';");
    expect(ex!.code).toContain("const KINDS = ['a', 'b'] as const;");
    expect(ex!.code).toContain('  return { n, kind };\n});');
    expect(ex!.code.indexOf('const KINDS')).toBeLessThan(ex!.code.indexOf('const ROWS'));
  });

  it('컴포넌트 문서에 저장소 안 경로(_shared/*.ts)가 없다', () => {
    expect(publicPaths('항목은 contracts `_shared/hr.ts`의 `HrMasterRecord`')).toBe(
      '항목은 `@terracelab/trellis-contracts`의 `HrMasterRecord`',
    );
    for (const c of built.manifest.components)
      expect(read(c.doc), c.name).not.toMatch(/`_shared\/[\w-]+\.ts`/);
  });
});
