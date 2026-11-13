// 컴포넌트 문구는 사전(contracts _shared/messages.ts)에서만 온다(D-65).
// 소스(예시 제외)에 한국어 문자열 · JSX 글자가 있으면 실패. 주석 · 개발 경고(console.warn · warnDev)는 예외.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// vitest 루트 = packages/react
const SRC = join(process.cwd(), 'src');
const HANGUL = /[가-힣]/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return files(p);
    return /\.tsx?$/.test(f) && !/\.examples\.tsx$/.test(f) ? [p] : [];
  });
}

function hangulLiterals(source: string): string[] {
  const code = source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    // 개발자에게만 보이는 경고
    .replace(/(console\.warn|warnDev)\(([\s\S]*?)\);/g, '');
  const hits: string[] = [];
  for (const m of code.matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g))
    if (HANGUL.test(m[2]!)) hits.push(m[2]!);
  for (const m of code.matchAll(/>([^<>{}]*[가-힣][^<>{}]*)</g)) hits.push(m[1]!.trim());
  return hits;
}

describe('컴포넌트 문구', () => {
  it('소스에 한국어 문구가 박혀 있지 않다(사전을 쓴다)', () => {
    const found = files(SRC).flatMap((f) =>
      hangulLiterals(readFileSync(f, 'utf8')).map((h) => `${f.slice(SRC.length + 1)}: ${h}`),
    );
    expect(found).toEqual([]);
  });
});
