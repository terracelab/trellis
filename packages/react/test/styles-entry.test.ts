// @vitest-environment node
// src/styles.css(소스 조건용 @import 집합)가 컴포넌트 CSS 목록과 같은지 본다. 다르면 node scripts/build-css.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? cssFiles(join(dir, e.name))
      : e.name.endsWith('.css')
        ? [join(dir, e.name)]
        : [],
  );
}

describe('src/styles.css', () => {
  it('모든 컴포넌트 CSS를 빠짐없이 가져온다', () => {
    const expected = cssFiles(SRC)
      .filter((f) => f !== join(SRC, 'styles.css'))
      .map((f) => relative(SRC, f).split('\\').join('/'))
      .sort();
    const imported = [
      ...readFileSync(join(SRC, 'styles.css'), 'utf8').matchAll(/@import '\.\/(.+?)';/g),
    ]
      .map((m) => m[1])
      .sort();
    expect(imported).toEqual(expected);
  });
});
