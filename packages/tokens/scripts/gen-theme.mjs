#!/usr/bin/env node
// 서비스 테마(theme.css) 만들기(D-58 · D-97). 회사 메인 색 하나(+ 회색 톤 · 주 버튼 글자 규칙) → 회사 색 토큰을 덮는 CSS
//   라이트 · 다크 · 고대비 라이트 · 고대비 다크 4모드
//   node scripts/gen-theme.mjs --brand "#0B7A5C" --neutral warm --out apps/web/src/theme.css
//   node scripts/gen-theme.mjs --brand "#FE5C2B" --button-text input   주 버튼 = 입력 색 그대로(규칙 B)
//   node scripts/gen-theme.mjs --preset forest --out theme.css
//   node scripts/gen-theme.mjs --refresh --out apps/web/src/theme.css   파일 첫 줄의 고른 값으로 지금 생성기로 다시(R-T53)
//   node scripts/gen-theme.mjs --list      컬러칩 목록
// 대비(주 버튼 · 링크 · 선택 메뉴 · 포커스 · 본문)를 재고, 못 넘으면 단계를 옮긴다.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import {
  NEUTRAL_TONES,
  THEME_PRESETS,
  createTheme,
  readThemeChoice,
  themeCss,
} from '../theme/index.mjs';

const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);

if (args.includes('--list')) {
  for (const p of THEME_PRESETS)
    console.log(`${p.id.padEnd(8)} ${p.label.padEnd(4)} ${p.brand}  회색 ${p.neutral}`);
  console.log(`\n회색 톤: ${NEUTRAL_TONES.map((t) => `${t.id}(${t.label})`).join(' · ')}`);
  process.exit(0);
}

const out = opt('--out', null);
// --refresh: 지금 theme.css 첫 줄(trellis-theme {...})의 값으로 다시 만든다. 줄이 없으면 기본 테마라 그대로 둔다
let saved = null;
if (args.includes('--refresh')) {
  if (!out) {
    console.error('--refresh는 --out <theme.css>와 함께 쓴다');
    process.exit(1);
  }
  saved = existsSync(out) ? readThemeChoice(readFileSync(out, 'utf8')) : null;
  if (!saved) {
    console.error(`${out}: 고른 테마 줄(trellis-theme)이 없어 기본 테마다. 그대로 둔다`);
    process.exit(0);
  }
}

const preset = THEME_PRESETS.find((p) => p.id === opt('--preset', ''));
const brand = opt('--brand', saved?.brand ?? preset?.brand);
const neutral = opt('--neutral', saved?.neutral ?? preset?.neutral ?? 'cool');
const buttonText = opt('--button-text', saved?.buttonText ?? 'white');
if (!brand) {
  console.error(
    '사용법: gen-theme --brand "#RRGGBB" [--neutral cool|neutral|warm] [--button-text white|input] [--out 파일]  또는 --preset <id> · --refresh · --list',
  );
  process.exit(1);
}

const theme = createTheme({ brand, neutral, buttonText });
const failed = theme.checks.filter((c) => !c.pass);
console.error(`대비 검사 ${theme.checks.length}개(4모드) · 못 넘는 쌍 ${failed.length}개`);
for (const c of args.includes('--verbose') ? theme.checks : failed)
  console.error(
    `${c.pass ? '✓' : '✗'} ${c.mode.padEnd(7)} ${c.name.padEnd(24)} ${String(c.ratio).padStart(5)} ≥ ${c.min}`,
  );
for (const n of theme.notes) console.error(`· ${n}`);
for (const w of theme.warnings) {
  console.error(`! ${w.message}`);
  if (w.alternatives.length) console.error(`  대안 색: ${w.alternatives.join(' · ')}`);
  if (w.buttonTextAlternative) console.error(`  또는 --button-text ${w.buttonTextAlternative}`);
}
// 아주 밝은 회사 색: 흰 글자 규칙이 회사 색을 화면에서 지웠고 입력 색 바탕이 검사를 모두 넘는다(R-T52)
for (const s of theme.suggestions ?? []) {
  console.error(`? ${s.message}`);
  console.error(`  제안: --button-text ${s.buttonText}`);
}

const command = `pnpm ds:theme --brand ${brand} --neutral ${neutral}${buttonText !== 'white' ? ` --button-text ${buttonText}` : ''}`;
const css = themeCss(theme, { header: `생성물 — ${command}. 직접 고치지 말고 다시 만든다(D-58)` });
if (out) {
  writeFileSync(out, css);
  console.error(`\n썼음: ${out}${saved ? '(첫 줄의 고른 값으로 다시 만듦)' : ''}`);
} else process.stdout.write(css);
process.exit(theme.ok ? 0 : 1);
