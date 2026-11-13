// 컴포넌트 CSS를 dist로 복사하고 dist/styles.css(@import 집합)를 만든다. tsc는 CSS를 다루지 않는다.
// src/styles.css도 같은 목록으로 만든다: 소비 앱이 '@terracelab/source' 조건으로 소스를 바로 읽을 때 쓴다(D-58).
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(PKG, 'src');
const DIST = join(PKG, 'dist');

function cssFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? cssFiles(join(dir, e.name))
      : e.name.endsWith('.css')
        ? [join(dir, e.name)]
        : [],
  );
}

const ENTRY = join(SRC, 'styles.css');
const files = cssFiles(SRC)
  .filter((f) => f !== ENTRY)
  .sort();
for (const file of files) {
  const out = join(DIST, relative(SRC, file));
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(file, out);
}
const entry = `/* 생성물 — scripts/build-css.mjs. 모든 컴포넌트 CSS의 @import 집합 */\n${files
  .map((f) => `@import './${relative(SRC, f).split('\\').join('/')}';`)
  .join('\n')}\n`;
writeFileSync(join(DIST, 'styles.css'), entry);
writeFileSync(ENTRY, entry);
console.log(`styles.css: ${files.length}개 CSS`);
