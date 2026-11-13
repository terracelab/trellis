// @vitest-environment node
// 동봉 문서의 예시 코드가 그대로 타입 검사를 통과하는지(R-T38). 소비 앱처럼 패키지 이름으로 import한다.
// 예시 소스(<Name>.examples.tsx)는 react typecheck가 보고, 여기서는 문서로 옮긴 결과(import · 상수 포함)를 본다.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterAll, describe, expect, it } from 'vitest';
import { buildDocs } from '../../../scripts/build-docs.mjs';

const PKG = fileURLToPath(new URL('..', import.meta.url));
// 패키지 안에 둬야 node_modules · 자기 이름 import가 풀린다(gitignore: test/.examples/)
const dir = join(PKG, 'test', '.examples');
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const out = join(dir, 'docs');
const built = await buildDocs({ outDir: out, verifyNode: false });

/** 문서 md에서 예시 tsx 블록을 꺼낸다 */
function examplesOf(md: string): string[] {
  const sec = md.split('\n## 예시\n')[1] ?? '';
  return [...sec.matchAll(/```tsx\n([\s\S]*?)\n```/g)].map((m) => m[1]!);
}

describe('문서 예시 타입 검사', () => {
  it('모든 컴포넌트 문서의 예시가 import와 상수만으로 컴파일된다', () => {
    const files: string[] = [];
    for (const c of built.manifest.components) {
      examplesOf(readFileSync(join(out, c.doc), 'utf8')).forEach((code, i) => {
        const file = join(dir, `${c.name}-${i}.tsx`);
        // 예시 함수는 export하지 않아 쓰지 않는 선언 경고가 나지 않게 내보낸다
        writeFileSync(file, `${code.replace(/^function (\w+)/gm, 'export function $1')}\n`);
        files.push(file);
      });
    }
    expect(files.length).toBeGreaterThan(100);
    const program = ts.createProgram(files, {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      customConditions: ['@terracelab/source'],
      jsx: ts.JsxEmit.ReactJSX,
      lib: ['lib.es2023.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
      strict: true,
      noUncheckedIndexedAccess: true,
      verbatimModuleSyntax: true,
      isolatedModules: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
    });
    const problems = ts
      .getPreEmitDiagnostics(program)
      .filter((d) => d.file && d.file.fileName.startsWith(dir))
      .map((d) => {
        const { line } = d.file!.getLineAndCharacterOfPosition(d.start ?? 0);
        const name = d.file!.fileName.slice(dir.length + 1);
        return `${name}:${line + 1} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`;
      });
    expect(problems).toEqual([]);
  }, 180_000);
});
