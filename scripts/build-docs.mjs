// 동봉 문서 생성기 — docs/spec/distribution.md §2 (PD-01)
// 입력: contracts(dist 메타 + spec.md) · react 예시(<Name>.examples.tsx) · tokens(dist flat · src 설명 · modules)
//       · docs/guides/*.md · CHANGELOG(없으면 .changeset 미배포 목록) · components.md §10(패턴)
// 출력: packages/react/dist/docs/{manifest.json, llms.txt, llms-full.txt, tokens.md, CHANGELOG.md, components/*.md, guides/*.md}
//   node scripts/build-docs.mjs            기본 출력 위치에 생성 + 검증
//   node scripts/build-docs.mjs --out <d>  다른 위치에
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { z } from 'zod';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
const P = (...s) => join(ROOT, ...s);
// 금칙어 = 문구 규격(content.md §2)의 수식어 + 저장소에 적지 않는 목록(타사 제품명 등).
// 저장소 밖 목록: 루트 `.forbidden-words`(한 줄에 하나, gitignore) 또는 CI 비밀 값 TRELLIS_FORBIDDEN_WORDS(쉼표 구분)
const ADJECTIVES = [
  '손쉽게',
  '간편하게',
  '강력한',
  '완벽한',
  '혁신',
  '매끄러운',
  '직관적',
  '스마트한',
  '최적화된',
  '놀라운',
  '최고의',
];
function privateForbidden() {
  const fromEnv = (process.env['TRELLIS_FORBIDDEN_WORDS'] ?? '').split(',');
  const file = join(ROOT, '.forbidden-words');
  const fromFile = existsSync(file) ? readFileSync(file, 'utf8').split('\n') : [];
  return [...fromEnv, ...fromFile].map((w) => w.trim()).filter((w) => w && !w.startsWith('#'));
}
export const FORBIDDEN = [...ADJECTIVES, ...privateForbidden()];

export const DEFAULT_OUT = P('packages/react/dist/docs');
// llms는 색인이라 작게 둔다. 컴포넌트가 110종을 넘으면서 4KB에서 6KB로 올렸다(D-119)
export const LIMITS = { manifest: 300 * 1024, llms: 6 * 1024, llmsFull: 1536 * 1024 }; // D-134: 1 MB → 1.5 MB(2026-11-11, 컴포넌트 120개 전후에서 넘었다)
/** 소비 앱용 문서에서 뺄 spec 절(DS 내부용) */
const INTERNAL_SECTIONS = new Set(['스토리', '참고']);
export const SITE = 'https://trellis.terracelab.co.kr';

/** 소비 앱이 지키는 규칙(llms.txt · manifest.rules). 출처: CLAUDE.md 절대 규칙 · components.md §5 */
export const CONSUMER_RULES = [
  '값은 --tl-* CSS 변수 또는 @terracelab/trellis-tokens의 TS 객체로만 쓴다. raw hex · px(0 제외) · font-family 리터럴 금지',
  'semantic 토큰만 쓴다(--tl-color-bg-surface). primitive(--tl-color-brand-500) 직접 참조 금지',
  'manifest.components에 있는 컴포넌트만 쓴다. 없으면 앱에서 새로 만들지 말고 서비스 저장소의 .trellis/requests.md에 요청을 한 줄 적는다',
  'props · 이벤트 이름은 문서 그대로(onPress · onChange · onOpenChange). 컴포넌트 내부 클래스를 className으로 덮어쓰지 않는다',
  '상태 7(default · hover · active · focus · disabled · loading · error) · 결재 5(기안 · 진행 · 승인 · 반려 · 회수) 고정',
  '수입 = finance.income(빨강), 지출 = finance.expense(파랑). 서양식 반전 금지. 금액은 원 단위 · 천 단위 구분 · 우측 정렬',
  '차트 색은 슬롯 이름(series-1~5 · compare)만, 축은 하나, ChartCard table로 표 대체 제공',
  '밀도 기본 compact. 키보드로 모든 조작, 포커스 링 유지, 텍스트 대비 4.5:1 이상',
];

const read = (f) => readFileSync(f, 'utf8');
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const cell = (s) =>
  String(s ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');

/* ── 스키마 ───────────────────────────────────────────────── */
const Prop = z.object({
  name: z.string(),
  type: z.string(),
  default: z.unknown().optional(),
  required: z.boolean(),
  values: z.array(z.string()).optional(),
  description: z.string().min(1),
});
const Component = z.object({
  name: z.string(),
  summary: z.string().min(1),
  entry: z.string().startsWith('@terracelab/trellis-react'),
  category: z.enum(['chart', 'core']),
  cssClass: z.string().startsWith('tl-'),
  status: z.enum(['preview', 'stable']),
  props: z.array(Prop).min(1),
  states: z.array(z.enum(['default', 'hover', 'active', 'focus', 'disabled', 'loading', 'error'])),
  a11y: z.object({
    role: z.string().optional(),
    keyboard: z.array(z.string()),
    labelling: z.string(),
  }),
  platforms: z.object({ web: z.literal(true), native: z.boolean() }),
  examples: z.array(z.object({ name: z.string(), title: z.string(), description: z.string() })),
  doc: z.string(),
});
export const ManifestSchema = z.object({
  schemaVersion: z.literal(1),
  name: z.literal('Trellis'),
  version: z.string().regex(/^\d+\.\d+\.\d+/),
  docsVersion: z.string().regex(/^v\d+\.\d+$/),
  generatedAt: z.string(),
  site: z.string().url(),
  packages: z.record(z.string(), z.string()),
  rules: z.array(z.string()).min(5),
  principles: z.array(z.string()).length(6),
  install: z.object({
    status: z.enum(['workspace', 'registry']),
    npm: z.array(z.string()),
    css: z.array(z.string()).length(3),
    htmlAttributes: z.record(z.string(), z.array(z.string())),
    provider: z.string().nullable(),
    tailwind: z.string(),
  }),
  tokens: z.object({
    cssPrefix: z.literal('--tl-'),
    count: z.number().int().positive(),
    semantic: z.array(
      z.object({
        name: z.string(),
        css: z.string(),
        light: z.string(),
        dark: z.string(),
        description: z.string(),
      }),
    ),
    density: z.array(
      z.object({
        css: z.string(),
        compact: z.string(),
        comfortable: z.string(),
        description: z.string(),
      }),
    ),
    scale: z.array(z.object({ css: z.string(), value: z.string(), description: z.string() })),
    chart: z.object({ series: z.array(z.string()).length(5), compare: z.string() }),
  }),
  components: z.array(Component).min(1),
  patterns: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      composition: z.string(),
      rules: z.string(),
      status: z.literal('planned'),
    }),
  ),
  modules: z.unknown(),
  guides: z.array(z.object({ slug: z.string(), title: z.string(), doc: z.string() })),
  figma: z.object({ file: z.string().url() }),
});

/* ── 입력 읽기 ────────────────────────────────────────────── */
async function loadContracts() {
  const mod = await import(pathToFileURL(P('packages/contracts/dist/index.js')).href);
  return Object.values(mod).filter(
    (v) => v && typeof v === 'object' && 'name' in v && 'props' in v && 'states' in v,
  );
}

/** spec.md → { 절 이름: 본문 } (H1 제외, 순서 유지) */
function parseSpec(md) {
  const parts = md.split(/\n(?=## )/);
  const sections = [];
  for (const part of parts) {
    const m = /^## (.+)\n([\s\S]*)$/.exec(part.trim());
    if (m) sections.push([m[1].trim(), m[2].trim()]);
  }
  return sections;
}

/** <Name>.examples.tsx → [{ name, title, description, code }] — 코드는 공개 entry import로 바꿔 복사해 쓸 수 있게 */
export function parseExamples(src, entry) {
  const lines = src.split('\n');
  const consts = new Map();
  for (let i = 0; i < lines.length; i += 1) {
    const m = /^const (\w+)/.exec(lines[i]);
    if (!m) continue;
    // 괄호 깊이가 0으로 돌아온 줄의 `;`에서 끝난다. 안쪽 함수 줄의 `;`에서 끊지 않는다
    let j = i;
    let depth = 0;
    for (; j < lines.length; j += 1) {
      const code = lines[j].replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g, '');
      depth += (code.match(/[([{]/g) ?? []).length - (code.match(/[)\]}]/g) ?? []).length;
      if (depth <= 0 && /;\s*$/.test(lines[j])) break;
    }
    consts.set(m[1], lines.slice(i, j + 1).join('\n'));
  }
  // `import type { A }`는 이름마다 `type A`로 둔다(문서 예시에서도 type import를 지킨다)
  const imports = [...src.matchAll(/^import (type )?\{([^}]+)\} from '([^']+)';$/gm)].map((m) => ({
    names: m[2]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (m[1] && !s.startsWith('type ') ? `type ${s}` : s)),
    from: m[3],
  }));
  const out = [];
  const re = /\/\*\*\s*([\s\S]*?)\s*\*\/\nexport function (\w+)\(\)/g;
  let m;
  while ((m = re.exec(src))) {
    const start = m.index + m[0].indexOf('export function');
    const endIdx = src.indexOf('\n}\n', start);
    const fn = src.slice(start, endIdx === -1 ? src.length : endIdx + 2).replace(/^export /, '');
    const [title, ...rest] = m[1].replace(/\n\s*\*\s?/g, ' ').split(' — ');
    // 예시가 쓰는 상수와, 그 상수가 쓰는 상수까지(소스 순서대로)
    const used = new Set();
    let scan = fn;
    for (let grew = true; grew;) {
      grew = false;
      for (const [name, code] of consts) {
        if (used.has(name) || !new RegExp(`\\b${name}\\b`).test(scan)) continue;
        used.add(name);
        scan += `\n${code}`;
        grew = true;
      }
    }
    const usedConsts = [...consts].filter(([name]) => used.has(name)).map(([, code]) => code);
    const body = [...usedConsts, fn].join('\n\n');
    const local = new Set();
    const ext = new Map();
    for (const imp of imports) {
      for (const name of imp.names) {
        const bare = name.replace(/^type\s+/, '');
        if (!new RegExp(`\\b${bare}\\b`).test(body)) continue;
        if (imp.from.startsWith('.')) local.add(name);
        else ext.set(imp.from, [...(ext.get(imp.from) ?? []), name]);
      }
    }
    // 이름이 전부 type이면 `import type { … }`
    const importLine = (names, from) =>
      names.every((n) => n.startsWith('type '))
        ? `import type { ${names.map((n) => n.replace(/^type\s+/, '')).join(', ')} } from '${from}';`
        : `import { ${names.join(', ')} } from '${from}';`;
    const head = [
      ...[...ext].map(([from, names]) => importLine(names, from)),
      ...(local.size ? [importLine([...local], entry)] : []),
    ].join('\n');
    out.push({
      name: m[2],
      title: title.trim(),
      description: rest.join(' — ').trim(),
      code: `${head}\n\n${body.trim()}\n`,
    });
  }
  return out;
}

function propsTable(contract) {
  const rows = Object.entries(contract.props)
    .filter(([name]) => name !== 'id' && name !== 'testID')
    .map(([name, meta]) => {
      // 배열 · 객체 기본값은 쉼표 뒤에 공백을 둬 표 칸 안에서 줄바꿈되게 한다(표 가로 넘침 방지)
      const def =
        meta.default === undefined
          ? ''
          : `\`${JSON.stringify(meta.default).replace(/,(?=\S)/g, ', ')}\``;
      return `| \`${name}\` | \`${cell(meta.type)}\` | ${def} | ${meta.required ? '필수' : ''} | ${cell(meta.description)} |`;
    });
  return [
    '| 이름 | 타입 | 기본값 | 필수 | 설명 |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
  ].join('\n');
}

function tokenDescriptions() {
  const map = new Map();
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.json') && !e.name.startsWith('modules')) {
        const visit = (node, path) => {
          if (!node || typeof node !== 'object') return;
          if ('$value' in node) {
            const css = `--tl-${path.map(kebab).join('-')}`;
            if (node.$description && !map.has(css)) map.set(css, node.$description);
            return;
          }
          for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) visit(v, [...path, k]);
        };
        visit(JSON.parse(read(p)), []);
      }
    }
  };
  walk(P('packages/tokens/src'));
  return map;
}

function loadTokens() {
  const flat = JSON.parse(read(P('packages/tokens/dist/json/flat.json')));
  const desc = tokenDescriptions();
  const semantic = [];
  const density = [];
  const scale = [];
  for (const [css, v] of Object.entries(flat)) {
    const description = desc.get(css) ?? '';
    if (v.light !== undefined)
      semantic.push({
        name: css.slice(5).replace(/-/g, '.'),
        css,
        light: String(v.light),
        dark: String(v.dark),
        description,
      });
    else if (v.compact !== undefined)
      density.push({
        css,
        compact: String(v.compact),
        comfortable: String(v.comfortable),
        description,
      });
    else if (!/^--tl-color-(brand|neutral|red|green|amber|violet|teal|base|alpha)-/.test(css))
      scale.push({ css, value: String(v.value), description });
  }
  return {
    cssPrefix: '--tl-',
    count: Object.keys(flat).length,
    semantic,
    density,
    scale,
    chart: {
      series: [1, 2, 3, 4, 5].map((n) => `--tl-color-chart-series-${n}`),
      compare: '--tl-color-chart-compare',
    },
  };
}

function loadPatterns() {
  const md = read(P('docs/spec/components.md'));
  const sec = md.split('## 10. 패턴·템플릿')[1]?.split('\n## ')[0] ?? '';
  return [...sec.matchAll(/^\| ([^|]+?) \| `(\w+)` \| ([^|]+?) \| ([^|]+?) \|$/gm)].map((m) => ({
    name: m[2],
    label: m[1].trim(),
    composition: m[3].trim(),
    rules: m[4].trim(),
    status: 'planned',
  }));
}

function loadPrinciples() {
  const md = read(P('CLAUDE.md'));
  const sec = md.split('## 디자인 원칙')[1]?.split('\n## ')[0] ?? '';
  return [...sec.matchAll(/^\d\. (.+)$/gm)].map((m) => m[1].replace(/\*\*/g, '').trim());
}

function loadGuides() {
  const dir = P('docs/guides');
  const order = [
    'overview',
    'install',
    'setup',
    'service',
    'theme',
    'principles',
    'content',
    'charts',
    'forms',
    'patterns',
    'dashboards',
    'conversation',
    'agents',
    'versions',
    'figma',
  ];
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  const slugs = [
    ...order.filter((s) => files.includes(`${s}.md`)),
    ...files.map((f) => f.slice(0, -3)).filter((s) => !order.includes(s)),
  ];
  return slugs.map((slug) => {
    const body = read(join(dir, `${slug}.md`));
    const title = /^# (.+)$/m.exec(body)?.[1] ?? slug;
    return { slug, title, body, doc: `guides/${slug}.md` };
  });
}

function loadChangelog(version) {
  if (existsSync(P('CHANGELOG.md'))) return read(P('CHANGELOG.md'));
  // changeset version이 만든 패키지 변경 이력. 첫 줄 제목(패키지 이름)만 문서 제목으로 바꾼다
  if (existsSync(P('packages/react/CHANGELOG.md')))
    return read(P('packages/react/CHANGELOG.md')).replace(/^# .+\n/, '# 변경 이력\n');
  const dir = P('.changeset');
  const entries = readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .sort()
    .map((f) => {
      const src = read(join(dir, f));
      const fm = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(src);
      if (!fm) return null;
      const bumps = [
        ...fm[1].matchAll(/'?(@terracelab\/[\w-]+|terracelab-trellis)'?:\s*(major|minor|patch)/g),
      ].map((m) => `${m[1]} ${m[2]}`);
      const text = fm[2].trim().split('\n\n')[0].replace(/\n/g, ' ');
      return { bumps, text };
    })
    .filter(Boolean);
  return [
    '# 변경 이력',
    '',
    `## 다음 릴리즈 (미배포 · 현재 ${version})`,
    '',
    '아직 릴리즈하지 않은 변경입니다. 릴리즈 파이프라인이 열리면 버전별 절로 바뀝니다.',
    '',
    ...entries.map((e) => `- ${e.text}${e.bumps.length ? ` _(${e.bumps.join(', ')})_` : ''}`),
    '',
  ].join('\n');
}

/** spec 본문의 저장소 안 경로를 소비 앱이 쓰는 이름으로(R-T38): contracts `_shared/hr.ts` → `@terracelab/trellis-contracts` */
export const publicPaths = (body) =>
  body
    .replace(/`charts\/README\.md`/g, '[차트 고르기](../guides/charts.md)')
    .replace(/(?:contracts )?`_shared\/[\w-]+\.ts`/g, '`@terracelab/trellis-contracts`');

/* ── 조립 ─────────────────────────────────────────────────── */
function componentDoc(c, spec, examples) {
  const out = [
    `# ${c.name}`,
    '',
    `> \`${c.entry}\` · CSS \`.${c.cssClass}\` · ${c.status === 'preview' ? '미리보기' : '안정'} · 웹${c.platforms.native ? ' · 네이티브(같은 props)' : ''}`,
    '',
    '```ts',
    `import { ${c.name} } from '${c.entry}';`,
    '```',
    '',
  ];
  for (const [title, body] of spec) {
    if (INTERNAL_SECTIONS.has(title)) continue;
    let text = title === 'Props' ? propsTable(c.contract) : publicPaths(body);
    if (title === 'States')
      text = `지원 상태: ${c.states.map((s) => `\`${s}\``).join(' · ')}\n\n${text}`;
    out.push(`## ${title}`, '', text, '');
  }
  if (examples.length) {
    out.push('## 예시', '');
    for (const e of examples) {
      out.push(`### ${e.title}`, '');
      if (e.description) out.push(e.description, '');
      out.push('```tsx', e.code.trim(), '```', '');
    }
  }
  return `${out.join('\n').trim()}\n`;
}

function llmsTxt(m) {
  // 컴포넌트는 이름만(문서 경로 규칙은 한 번). 이름만 적어 6KB 한도 안에 둔다
  const names = (cat) =>
    m.components
      .filter((c) => c.category === cat)
      .map((c) => c.name)
      .join(' · ');
  return `# Trellis ${m.version} — 테라스랩 디자인 시스템

> 테라스랩의 디자인 시스템. 테라스랩의 업무 제품과 테라스원 맞춤 구축이 함께 쓴다. 토큰(--tl-*) · React 컴포넌트 · 차트 · 모듈 타일. 이 문서는 설치된 패키지 버전과 같다. 최신판: ${SITE}/llms.txt

## 규칙
${m.rules.map((r) => `- ${r}`).join('\n')}

## 설치
- 패키지: ${Object.keys(m.packages)
    .filter((p) => p.startsWith('@'))
    .join(', ')} — 전부 같은 버전
- CSS 순서: ${m.install.css.join(' → ')}
- <html data-theme="light|dark" data-density="compact|comfortable">

## 문서
- [manifest.json](manifest.json): 컴포넌트 · props · 상태 · 토큰 · 모듈(기계 읽기)
${m.guides.map((g) => `- [${g.title}](${g.doc})`).join('\n')}
- [토큰 표](tokens.md) · [변경 이력](CHANGELOG.md) · [전부 한 파일](llms-full.txt)
- [자주 묻는 질문](${SITE}/faq/): 무엇이고 어떻게 쓰는지 짧은 답
- 컴포넌트 문서는 components/<이름>.md(예: [Button](components/Button.md))
- 기본: ${names('core')}
- 차트: ${names('chart')}
`;
}

export async function buildDocs({ outDir = DEFAULT_OUT, verifyNode = true } = {}) {
  const version = JSON.parse(read(P('packages/react/package.json'))).version;
  const [major, minor] = version.split('.');
  const pkgs = Object.fromEntries(
    ['tokens', 'icons', 'contracts', 'react', 'native', 'tailwind']
      .map((p) => P('packages', p, 'package.json'))
      .filter(existsSync)
      .map((f) => JSON.parse(read(f)))
      .map((j) => [j.name, j.version]),
  );
  const contracts = await loadContracts();
  const chartsIndex = read(P('packages/react/src/charts/index.ts'));
  const components = contracts
    .map((contract) => {
      const name = contract.name;
      const specFile = P('packages/contracts/src', name, 'spec.md');
      if (!existsSync(specFile)) throw new Error(`spec.md 없음: ${name}`);
      const isChart = chartsIndex.includes(`../${name}/`);
      const entry = isChart ? '@terracelab/trellis-react/charts' : '@terracelab/trellis-react';
      const exFile = P('packages/react/src', name, `${name}.examples.tsx`);
      const examples = existsSync(exFile) ? parseExamples(read(exFile), entry) : [];
      // 스토리는 apps/storybook/scripts/gen-stories.mjs가 만들고 커밋하지 않는다. 저장소에 남는 증거는
      // 그 스토리를 찍은 VRT 스냅샷 폴더다(컴포넌트 DoD 4 · 7). 손으로 쓴 스토리 파일이 있으면 그것도 센다
      const hasStory =
        existsSync(P('packages/react/src', name, `${name}.stories.tsx`)) ||
        existsSync(P('apps/storybook/vrt/__snapshots__', name));
      const spec = parseSpec(read(specFile));
      const purpose = spec.find(([t]) => t === '용도')?.[1] ?? '';
      const summary = (/^[^\n]*?[.。]/.exec(purpose)?.[0] ?? purpose.split('\n')[0])
        .replace(/[.。]$/, '')
        .trim();
      return {
        contract,
        spec,
        examples,
        name,
        summary,
        entry,
        category: isChart ? 'chart' : 'core',
        cssClass: `tl-${kebab(name)}`,
        status: hasStory ? 'stable' : 'preview',
        props: Object.entries(contract.props)
          .filter(([n]) => n !== 'id' && n !== 'testID')
          .map(([n, meta]) => ({
            name: n,
            type: meta.type,
            ...(meta.default !== undefined ? { default: meta.default } : {}),
            required: Boolean(meta.required),
            ...(meta.values ? { values: [...meta.values] } : {}),
            description: meta.description,
          })),
        states: [...contract.states],
        a11y: { ...contract.a11y, keyboard: [...contract.a11y.keyboard] },
        platforms: { ...contract.platforms },
        doc: `components/${name}.md`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const guides = loadGuides();
  const manifest = {
    schemaVersion: 1,
    name: 'Trellis',
    version,
    docsVersion: `v${major}.${minor}`,
    generatedAt: process.env.SOURCE_DATE_EPOCH
      ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
      : new Date().toISOString(),
    site: SITE,
    packages: pkgs,
    rules: CONSUMER_RULES,
    principles: loadPrinciples(),
    install: {
      status: 'workspace',
      npm: ['pnpm add @terracelab/trellis-tokens @terracelab/trellis-react'],
      css: [
        '@terracelab/trellis-tokens/fonts.css',
        '@terracelab/trellis-tokens/tokens.css',
        '@terracelab/trellis-react/styles.css',
      ],
      htmlAttributes: {
        'data-theme': ['light', 'dark'],
        'data-density': ['compact', 'comfortable'],
      },
      provider: null,
      tailwind: '@terracelab/trellis-tokens/tailwind',
    },
    tokens: loadTokens(),
    components: components.map(({ contract, spec, examples, ...c }) => ({
      ...c,
      examples: examples.map(({ name, title, description }) => ({ name, title, description })),
    })),
    patterns: loadPatterns(),
    modules: JSON.parse(read(P('packages/tokens/dist/json/modules.json'))),
    guides: guides.map(({ slug, title, doc }) => ({ slug, title, doc })),
    figma: { file: 'https://www.figma.com/design/uNZmEBsbRnkivkF79zdd2L' },
  };
  ManifestSchema.parse(manifest);

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, 'components'), { recursive: true });
  mkdirSync(join(outDir, 'guides'), { recursive: true });
  const write = (rel, text) => writeFileSync(join(outDir, rel), text);
  const componentDocs = components.map((c) => [c, componentDoc(c, c.spec, c.examples)]);
  for (const [c, md] of componentDocs) write(c.doc, md);
  for (const g of guides) write(g.doc, g.body);
  const tokensMd = read(P('packages/tokens/dist/docs/tokens.md'));
  write('tokens.md', tokensMd);
  const changelog = loadChangelog(version);
  write('CHANGELOG.md', changelog);
  // 기계 읽기 전용이라 들여쓰기 없이 쓴다(PR-27, 컴포넌트 75개에서 300 KB 한도를 넘었다)
  write('manifest.json', `${JSON.stringify(manifest)}\n`);
  const llms = llmsTxt(manifest);
  write('llms.txt', llms);
  const full = [
    llms,
    ...guides.map((g) => g.body),
    ...componentDocs.map(([, md]) => md),
    tokensMd,
    // 변경 이력은 llms.txt가 따로 링크한다. 화면을 만드는 데 필요 없어 한 파일에는 넣지 않는다(D-134)
  ].join('\n\n---\n\n');
  write('llms-full.txt', full);

  const report = verify(outDir, manifest);
  if (verifyNode) await verifyNodeImports();
  return { outDir, manifest, report };
}

/* ── 검증 ─────────────────────────────────────────────────── */
export function verify(outDir, manifest) {
  const errors = [];
  const size = (rel) => statSync(join(outDir, rel)).size;
  if (size('manifest.json') > LIMITS.manifest)
    errors.push(`manifest.json ${size('manifest.json')}B > ${LIMITS.manifest}`);
  if (size('llms.txt') > LIMITS.llms) errors.push(`llms.txt ${size('llms.txt')}B > ${LIMITS.llms}`);
  if (size('llms-full.txt') > LIMITS.llmsFull)
    errors.push(`llms-full.txt ${size('llms-full.txt')}B > ${LIMITS.llmsFull}`);
  const specDirs = readdirSync(P('packages/contracts/src'), { withFileTypes: true }).filter(
    (e) => e.isDirectory() && existsSync(P('packages/contracts/src', e.name, 'spec.md')),
  );
  if (specDirs.length !== manifest.components.length)
    errors.push(`컴포넌트 ${manifest.components.length} ≠ spec 폴더 ${specDirs.length}`);
  for (const c of manifest.components)
    if (c.examples.length === 0) errors.push(`${c.name}: 예시 없음(${c.name}.examples.tsx)`);
  // 모든 md의 상대 링크가 실제 파일을 가리킨다
  const mdFiles = [
    'llms.txt',
    ...manifest.components.map((c) => c.doc),
    ...manifest.guides.map((g) => g.doc),
  ];
  for (const rel of mdFiles) {
    const text = read(join(outDir, rel));
    for (const m of text.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
      const href = m[1];
      if (/^(https?:|mailto:)/.test(href)) continue;
      const target = resolve(dirname(join(outDir, rel)), href);
      if (!existsSync(target)) errors.push(`${rel}: 깨진 링크 ${href}`);
    }
  }
  // 금칙어는 파일마다 본다. 문구 가이드(guides/content.md)는 금칙어를 이름 붙여 금지하는 문서라 유일한 예외다
  for (const rel of [...mdFiles, 'tokens.md', 'CHANGELOG.md']) {
    if (rel === 'guides/content.md') continue;
    const text = read(join(outDir, rel));
    for (const w of FORBIDDEN) if (text.includes(w)) errors.push(`${rel}: 금칙어 "${w}" 포함`);
  }
  if (errors.length) throw new Error(`build-docs 검증 실패:\n- ${errors.join('\n- ')}`);
  return {
    components: manifest.components.length,
    examples: manifest.components.reduce((s, c) => s + c.examples.length, 0),
    guides: manifest.guides.length,
    sizes: {
      manifest: size('manifest.json'),
      llms: size('llms.txt'),
      llmsFull: size('llms-full.txt'),
    },
  };
}

/** 패키지 산출물이 번들러 없이 Node ESM으로 로드되는지(SSR 소비자) */
async function verifyNodeImports() {
  for (const f of ['packages/contracts/dist/index.js', 'packages/react/dist/charts/index.js']) {
    if (!existsSync(P(f))) continue;
    await import(pathToFileURL(P(f)).href);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const i = process.argv.indexOf('--out');
  const outDir = i > 0 ? resolve(process.argv[i + 1]) : DEFAULT_OUT;
  const { report } = await buildDocs({ outDir });
  console.log(
    `docs: 컴포넌트 ${report.components} · 예시 ${report.examples} · 가이드 ${report.guides} → ${relative(ROOT, outDir)} (manifest ${(report.sizes.manifest / 1024).toFixed(0)}KB · llms ${report.sizes.llms}B · full ${(report.sizes.llmsFull / 1024).toFixed(0)}KB)`,
  );
}
