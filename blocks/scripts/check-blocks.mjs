// 블록 검사: block.json 스키마, id = 경로, index.tsx 있음, 모듈이 modules.json에 있음,
// 쓰는 컴포넌트가 react 동봉 manifest에 있음, 제목 · intent에 금칙어 없음,
// 블록 코드에 샘플 고유명사(회사 · 창고 · 상품 · 사람 이름) 없음(PR-11, sample-nouns.mjs).
// do-dont(스킬 references/do-dont.md, R-T20): 표 칸 두 줄은 DataGridLines(`tl-block-cell-2` 금지),
// 블록 CSS가 Trellis 안쪽 파트(`.tl-<컴포넌트>__<파트>` · 표 안 table · tr · td)를 덮지 않는다.
// prop이 없어 꼭 덮어야 하면 바로 위 주석에 `inner-override: <이유>(보강 요청)`를 적는다.
// 블록은 주소를 window.location에서 읽지 않는다(useScreenParams, R-T08).
// block.json slots마다 코드에 `slot: <이름>` … `slot: <이름> end` 표시가 있는지 본다(없으면 경고, R-T09).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BlockSchema } from './block-schema.mjs';
import { findNouns, sampleNouns, visibleText } from './sample-nouns.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src');
const require = createRequire(import.meta.url);
const modules = JSON.parse(
  readFileSync(require.resolve('@terracelab/trellis-tokens/modules'), 'utf8'),
);
const moduleIds = new Set([...modules.modules.map((m) => m.id), 'platform', 'home']);
let known = null;
try {
  const manifest = JSON.parse(
    readFileSync(require.resolve('@terracelab/trellis-react/docs/manifest.json'), 'utf8'),
  );
  known = new Set(manifest.components.map((c) => c.name));
} catch {
  console.warn('react 동봉 manifest가 없어 컴포넌트 이름 검사를 건너뛴다(pnpm build 뒤 다시)');
}
const forbidden = (await import('../../scripts/build-docs.mjs')).FORBIDDEN;
// 샘플 데이터에만 있는 이름. 블록은 이 이름을 데이터에서 읽어야 데이터를 바꿔 끼운 회사에서도 맞다
const nouns = sampleNouns(SRC);
const RAIL =
  /border-(left|inline-start)(-width)?\s*:\s*var\(--tl-(border-width-[2-9]|space-)|inset\s+var\(--tl-[a-z0-9-]+\)\s+0\s+0\s+var/;
/** Trellis 컴포넌트 안쪽 파트(블록 자기 클래스 tl-block-*는 빼고) */
const INNER_PART = /\.tl-(?!block-)[a-z0-9-]+__[a-z0-9-]+/;
/** DataGrid 안 표 요소를 태그로 덮기 */
const INNER_TABLE = /(^|[\s>+~(,])(table|thead|tbody|tfoot|tr|th|td)(?=$|[\s.:[>+~,)])/;
/** 주소 읽기: location.hash · search · pathname (대입은 빼고) */
const LOCATION_READ = /\blocation\.(hash|search|pathname)\b(?!\s*=[^=])/;

/**
 * 블록 CSS에서 안쪽 덮기 규칙을 찾는다. 규칙 앞(이전 규칙 끝과 선택자 사이) 주석에
 * `inner-override:`가 있으면 허용(보강 요청이 있는 자리).
 */
function innerOverrides(css) {
  const found = [];
  for (const m of css.matchAll(/([^{}]*)\{/g)) {
    const head = m[1];
    const comments = [...head.matchAll(/\/\*[\s\S]*?\*\//g)].map((c) => c[0]);
    const selector = head.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!selector || selector.startsWith('@')) continue;
    if (!INNER_PART.test(selector) && !INNER_TABLE.test(selector)) continue;
    if (comments.some((c) => c.includes('inner-override:'))) continue;
    found.push(selector.replace(/\s+/g, ' '));
  }
  return found;
}

const errors = [];
const warnings = [];
const blocks = [];
for (const group of readdirSync(SRC, { withFileTypes: true })) {
  if (!group.isDirectory() || group.name.startsWith('_')) continue;
  for (const mod of readdirSync(join(SRC, group.name), { withFileTypes: true })) {
    if (!mod.isDirectory()) continue;
    for (const screen of readdirSync(join(SRC, group.name, mod.name), { withFileTypes: true })) {
      if (!screen.isDirectory()) continue;
      const dir = join(SRC, group.name, mod.name, screen.name);
      const rel = relative(SRC, dir);
      const file = join(dir, 'block.json');
      if (!existsSync(file)) {
        errors.push(`${rel}: block.json 없음`);
        continue;
      }
      const parsed = BlockSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
      if (!parsed.success) {
        errors.push(
          `${rel}: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join(', ')}`,
        );
        continue;
      }
      const b = parsed.data;
      blocks.push(b);
      if (b.id !== rel.split('\\').join('/')) errors.push(`${rel}: id(${b.id})가 경로와 다르다`);
      if (!existsSync(join(dir, 'index.tsx'))) errors.push(`${rel}: index.tsx 없음`);
      if (!moduleIds.has(b.module)) errors.push(`${rel}: 모듈 ${b.module}이 modules.json에 없다`);
      if (known)
        for (const c of b.components)
          if (!known.has(c)) errors.push(`${rel}: 컴포넌트 ${c}가 없다`);
      for (const w of forbidden)
        if (`${b.title} ${b.intent}`.includes(w)) errors.push(`${rel}: 금칙어 "${w}"`);
      const src = readFileSync(join(dir, 'index.tsx'), 'utf8');
      if (/#[0-9a-fA-F]{3,8}\b|\b\d+px\b/.test(src)) errors.push(`${rel}: 토큰 밖 값(hex · px)`);
      const named = findNouns(`${visibleText(src)} ${b.title} ${b.intent}`, nouns);
      if (named.length)
        errors.push(`${rel}: 샘플 고유명사 ${named.join(', ')}. _data(profile.ts 등)에서 읽으세요`);
      // 왼쪽 강조 띠 금지(D-57): 2px 이상 왼쪽 테두리, 왼쪽에서만 그리는 inset 그림자
      const css = existsSync(join(dir, 'style.css'))
        ? readFileSync(join(dir, 'style.css'), 'utf8')
        : '';
      if (RAIL.test(css))
        errors.push(`${rel}: 왼쪽 강조 띠(border-left 2px 이상 · inset 왼쪽 그림자)`);
      // do-dont: 표 칸 두 줄은 DataGridLines, 목록 줄 두 줄은 _ui Lines
      if (/\btl-block-cell-2\b/.test(`${src}\n${css}`))
        errors.push(
          `${rel}: tl-block-cell-2(두 줄 직접). 표 칸은 DataGridLines, 목록 · 카드 줄은 _ui Lines, 사람은 PersonLabel`,
        );
      for (const sel of innerOverrides(css))
        errors.push(
          `${rel}: 안쪽 덮기 "${sel}". props · variant로 바꾸고, prop이 없으면 바로 위 주석에 inner-override: 이유(보강 요청)`,
        );
      if (LOCATION_READ.test(src))
        errors.push(
          `${rel}: window.location 읽기. 화면 값은 useScreenParams(), 이동은 useScreens()`,
        );
      // slot 경계 표시: // slot: <이름> … // slot: <이름> end (JSX 안은 {/* … */})
      const code = readdirSync(dir)
        .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
        .map((f) => readFileSync(join(dir, f), 'utf8'))
        .join('\n');
      for (const slot of b.slots) {
        const name = slot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const start = new RegExp(`slot:\\s*${name}(?![\\w-])(?!\\s+end\\b)`).test(code);
        const end = new RegExp(`slot:\\s*${name}\\s+end\\b`).test(code);
        if (!start || !end)
          warnings.push(
            `${rel}: slot "${slot}" 경계 표시 ${!start ? '시작' : ''}${!start && !end ? ' · ' : ''}${!end ? '끝' : ''} 없음`,
          );
      }
    }
  }
}
if (errors.length) {
  console.error(`블록 검사 실패 ${errors.length}건:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
if (warnings.length) {
  const missing = new Set(warnings.map((w) => w.split(':')[0]));
  // 전체 목록은 --slots(블록이 많아 기본은 요약 한 줄)
  console.warn(
    process.argv.includes('--slots')
      ? `slot 경계 표시 경고 ${warnings.length}건(blocks/README.md "slot 표시"):\n- ${warnings.join('\n- ')}`
      : `slot 경계 표시 경고: 블록 ${missing.size}개 · slot ${warnings.length}개에 표시가 없다(blocks/README.md "slot 표시", 목록은 --slots)`,
  );
}
const byGroup = blocks.reduce(
  (m, b) => m.set(b.id.split('/')[0], (m.get(b.id.split('/')[0]) ?? 0) + 1),
  new Map(),
);
console.log(
  `블록 ${blocks.length}개 통과 · ${[...byGroup].map(([g, n]) => `${g} ${n}`).join(' · ')} · 샘플 고유명사 ${nouns.size}개 없음`,
);
