#!/usr/bin/env node
// 추적 파일 전체에서 저장소 밖 금칙어(타사 제품명 등)를 찾는다(CLAUDE.md 절대 규칙, CI 게이트 PR-05).
// 목록: 루트 `.forbidden-words`(한 줄에 하나, gitignore) 또는 CI 비밀 값 TRELLIS_FORBIDDEN_WORDS(쉼표 · 줄 구분).
// 찾은 자리(파일 · 행)만 출력하고 단어는 출력하지 않는다. 목록이 없으면 CI에서는 경고만 남기고 넘어간다.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BINARY = /\.(png|jpe?g|gif|webp|avif|woff2?|ttf|otf|ico|pdf|zip|gz)$/i;

const raw = [
  process.env.TRELLIS_FORBIDDEN_WORDS ?? '',
  existsSync(join(ROOT, '.forbidden-words'))
    ? readFileSync(join(ROOT, '.forbidden-words'), 'utf8')
    : '',
].join('\n');
const words = [
  ...new Set(
    raw
      .split(/\r?\n|,/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w && !w.startsWith('#')),
  ),
];

if (words.length === 0) {
  const msg =
    '금칙어 목록이 없어 검사를 건너뛴다. 저장소 비밀 값 TRELLIS_FORBIDDEN_WORDS를 등록하면 PR마다 검사한다';
  console.log(process.env.CI ? `::warning::${msg}` : msg);
  process.exit(0);
}

const files = execFileSync('git', ['-C', ROOT, 'ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);
const hits = [];
for (const rel of files) {
  const lower = rel.toLowerCase();
  if (words.some((w) => lower.includes(w))) hits.push(`${rel}: 경로`);
  if (BINARY.test(rel) || !existsSync(join(ROOT, rel))) continue;
  const lines = readFileSync(join(ROOT, rel), 'utf8').toLowerCase().split('\n');
  lines.forEach((line, i) => {
    if (words.some((w) => line.includes(w))) hits.push(`${rel}:${i + 1}`);
  });
}

if (hits.length) {
  console.error(`금칙어 ${hits.length}곳(단어는 출력하지 않는다):`);
  for (const h of hits.slice(0, 50)) console.error(`  ${h}`);
  if (hits.length > 50) console.error(`  … ${hits.length - 50}곳 더`);
  process.exit(1);
}
console.log(`금칙어 검사 통과: 추적 파일 ${files.length}개 · 단어 ${words.length}개 · 0곳`);
