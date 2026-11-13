#!/usr/bin/env node
// 기본 테마 = createTheme(DEFAULT_BRAND)(D-98). 엔진 결과를 토큰 원본에 쓴다 — 기본 semantic 값을 손으로 적지 않는다.
//   src/primitive/color-brand.json   color.brand.50~950 · color.shell.* · color.alpha.brand.{8,16,24}
//   src/semantic/color.{light,dark,hc-light,hc-dark}.json   회사 색을 따라가는 토큰 · 회색 톤이 정하는 토큰의 alias
// 다른 semantic(status · finance · approval · module · chart · avatar · overlay)은 손으로 쓴 값을 그대로 둔다.
//
//   node scripts/gen-default-theme.mjs          파일을 쓴다
//   node scripts/gen-default-theme.mjs --check  최신이 아니면 종료 코드 1
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  BRAND_TOKENS,
  DEFAULT_BRAND,
  MODES,
  NEUTRAL_MAP,
  SHELL_L,
  createTheme,
} from '../theme/index.mjs';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));
export const FILES = {
  primitive: `${SRC}primitive/color-brand.json`,
  light: `${SRC}semantic/color.light.json`,
  dark: `${SRC}semantic/color.dark.json`,
  hcLight: `${SRC}semantic/color.hc-light.json`,
  hcDark: `${SRC}semantic/color.hc-dark.json`,
};

/** 새로 생기는 semantic의 설명(있는 토큰은 파일의 설명을 그대로 둔다) */
const DESCRIPTIONS = {
  'brand.default': '주요 액션(회사 색, D-97)',
  'brand.hover': '주요 액션 가리킴',
  'brand.active': '주요 액션 누름',
  'brand.subtle': '선택 바탕(선택 메뉴 · 선택 칩 · 선택 옵션). 위 글자는 fg.link',
  'brand.tint':
    '옅은 강조 면(기간 사이 띠 · 지금 고치는 칸 · 끌어 놓을 자리 · 진행 막대 트랙). 위 글자는 fg.primary(D-97)',
  'brand.accent':
    '회사 색 그대로의 강조(진행 막대 · 로고 · 선택 표시 점). 글자가 아닌 표시라 면 위 3:1(D-97)',
  'brand.onBrand': '브랜드 위 글자',
  'bg.rowSelected': '표 · 목록의 선택 행 바탕(D-97)',
  'fg.link': '링크 · 선택 글자 · 브랜드 글자',
  'border.focus': '포커스 링 2px. 면 · 바탕 위 3:1',
  'border.focusStrong':
    '포커스 강조 모드(data-focus="strong") · 고대비의 포커스 링. 면 · 바탕 위 4.5:1(D-97)',
  'border.selected': '선택 · 현재 표시 선(1px 테두리 · 탭 밑줄 · 진행 단계). 면 · 바탕 위 3:1',
  'bg.nav': '사이드바 면. 회사 색상의 저채도 짙은 톤(D-97)',
  'nav.fg': '사이드바 항목 글자(쉴 때)',
  'nav.fgMuted': '사이드바 묶음 이름 · 아이콘 · 하위 메뉴 글자',
  'nav.fgActive': '사이드바 지금 화면 · 가리킨 항목 글자',
  'nav.hover': '사이드바 항목을 가리켰을 때 면',
  'nav.selected': '사이드바 지금 화면 항목 면',
  'nav.border': '사이드바 안 구분선',
  'nav.sub': '사이드바 하위 메뉴 묶음 면(D-97)',
  'nav.focus': '사이드바 위 포커스 링(짙은 면 · 가리킴 · 선택 위 3:1)',
  'fg.strong': '제목 · 강조 값. fg.primary보다 한 단계 진하다(D-97)',
  'fg.primary': '본문',
  'fg.secondary': '보조 글자',
  'fg.tertiary': '힌트 · 타임스탬프',
  'fg.disabled': '비활성 글자',
  'fg.inverse': '진한 바탕 위 글자',
  'bg.canvas': '앱 바탕(회색, D-97 정한 것 3)',
  'bg.surface': '카드 · 패널',
  'bg.elevated': '드롭다운 · 팝오버',
  'bg.sunken': '면 안 옅은 칸 · 가리킴 · 스켈레톤',
  'border.default': '카드 · 표 테두리',
  'border.strong': '입력 칸 · 강조 테두리',
  'border.hover': '입력 칸을 가리켰을 때 테두리(식자재 ERP line-strong, D-97)',
  'border.divider': '구분선',
};
const HC_NOTE = { hcLight: '고대비: ', hcDark: '고대비: ' };

const alias = (ref) => `{color.${ref}}`;
const token = (value, description) => ({
  $value: value,
  $type: 'color',
  $description: description,
});

function primitiveTree(theme) {
  const brand = Object.fromEntries(
    Object.entries(theme.brand).map(([k, v]) => [
      k,
      token(
        v,
        k === '500'
          ? `회사 색(기본 ${DEFAULT_BRAND}). 생성물 — 테마 엔진 brandScale(D-98)`
          : k === '600' && theme.anchored
            ? `흰 글자 5:1을 넘는 가장 밝은 같은 색상(주 버튼 바탕, D-97 정한 것 1 A)`
            : undefined,
      ),
    ]),
  );
  const shell = Object.fromEntries(
    Object.entries(theme.shell).map(([k, v]) => [
      k,
      token(v, `사이드바 톤 L ${SHELL_L[k]}(D-97 정한 것 2)`),
    ]),
  );
  const alpha = Object.fromEntries(
    Object.entries(theme.alpha).map(([k, v]) => [
      k,
      token(
        v,
        `회사 색 ${Number(k)}% — ${k === '8' ? '라이트 선택 행' : k === '16' ? '다크 선택 바탕 · 선택 행' : '다크 옅은 강조 면'}`,
      ),
    ]),
  );
  for (const g of [brand, shell, alpha])
    for (const v of Object.values(g)) if (v.$description === undefined) delete v.$description;
  const GEN =
    '생성물: pnpm --filter @terracelab/trellis-tokens gen:theme. 회사 색 기본 테마(createTheme(DEFAULT_BRAND)). 직접 고치지 않는다(D-98)';
  return {
    color: {
      brand: { $description: GEN, ...brand },
      shell: { $description: `사이드바 톤. ${GEN}`, ...shell },
      alpha: { brand: { $description: GEN, ...alpha } },
    },
  };
}

/** path('brand.default')의 자리에 값을 둔다. 없으면 만들고 그룹 끝에 붙인다 */
function setToken(root, path, value, mode) {
  const keys = ['color', ...path.split('.')];
  let node = root;
  for (const k of keys.slice(0, -1)) {
    node[k] ??= {};
    node = node[k];
  }
  const last = keys.at(-1);
  const prev = node[last];
  const desc = `${HC_NOTE[mode] ?? ''}${DESCRIPTIONS[path] ?? path}`;
  node[last] = prev
    ? { ...prev, $value: value, ...(prev.$description ? {} : { $description: desc }) }
    : token(value, desc);
}

function semanticTree(file, mode, theme) {
  const root = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { color: {} };
  const paths = [...BRAND_TOKENS, ...Object.keys(NEUTRAL_MAP[mode] ?? {})];
  for (const path of paths) setToken(root, path, alias(theme.refs[mode][path]), mode);
  return root;
}

export function generate() {
  const theme = createTheme({ brand: DEFAULT_BRAND });
  if (!theme.ok) throw new Error('기본 테마가 대비 검사를 통과하지 못한다');
  const out = { [FILES.primitive]: primitiveTree(theme) };
  for (const mode of MODES) out[FILES[mode]] = semanticTree(FILES[mode], mode, theme);
  return Object.fromEntries(
    Object.entries(out).map(([f, tree]) => [f, `${JSON.stringify(tree, null, 2)}\n`]),
  );
}

function main(argv) {
  const files = generate();
  const stale = Object.entries(files).filter(
    ([f, text]) => !existsSync(f) || readFileSync(f, 'utf8') !== text,
  );
  if (argv.includes('--check')) {
    if (stale.length) {
      console.error(
        `기본 테마 생성물이 최신이 아니다: ${stale.map(([f]) => f.replace(SRC, 'src/')).join(', ')}\npnpm --filter @terracelab/trellis-tokens gen:theme 을 실행한다.`,
      );
      process.exitCode = 1;
    } else console.log('기본 테마 생성물 최신');
    return;
  }
  for (const [f, text] of stale) writeFileSync(f, text);
  console.log(`기본 테마(${DEFAULT_BRAND}) → ${stale.length}개 파일 갱신`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main(process.argv.slice(2));
