// 동봉 문서(@terracelab/trellis-react/dist/docs) → Starlight 콘텐츠 · /api · /llms.txt
// 사이트는 동봉 문서를 렌더할 뿐이다(D-42). 여기서 만드는 파일은 전부 생성물(.gitignore).
// 영어판(/en/, PR-12): 가이드는 docs/guides/en/*.md, 컴포넌트는 spec.en.md + manifest의 props 타입 · 기본값.
// 동봉 문서와 /api는 한국어 그대로다.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { componentDescription, guideDescription } from './descriptions.mjs';
import {
  GUIDES_EN,
  INTERNAL_EN,
  I18N_DATA,
  forbiddenHits,
  readSpecEn,
  specEnPath,
  splitExample,
  titleFromName,
  translationStatus,
} from './i18n.mjs';

const APP = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
let DOCS;
try {
  DOCS = dirname(require.resolve('@terracelab/trellis-react/docs/manifest.json'));
} catch {
  console.error(
    '동봉 문서가 없다. 먼저 `pnpm --filter @terracelab/trellis-react build`(또는 pnpm build)를 실행한다.',
  );
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(join(DOCS, 'manifest.json'), 'utf8'));
export const SITE = manifest.site;
/**
 * 사이트가 실제로 놓이는 주소(끝 / 없음). 기본은 동봉 문서의 원본(manifest.site)이다.
 * 다른 곳에 올릴 때(SITE_URL · SITE_BASE, D-148)는 사이트가 내주는 파일(/llms.txt · /api · 가이드 본문)에 적힌
 * 원본 주소를 그쪽으로 바꿔, 배포된 /llms.txt를 읽는 에이전트가 열리는 주소를 받게 한다.
 * 패키지에 동봉된 문서(dist/docs)와 build-docs.mjs의 원본 주소는 그대로 둔다.
 */
/** 사이트 경로(끝 / 없음). 도메인 루트면 '', /trellis/ 아래면 '/trellis'. 본문에 만드는 링크 앞에 붙인다 */
const BASE = (process.env.SITE_BASE ?? '/').replace(/\/?$/, '/').replace(/\/$/, '');
const LIVE = (process.env.SITE_URL ?? SITE).replace(/\/$/, '') + BASE;
const live = (text) => (LIVE === SITE ? text : text.replaceAll(SITE, LIVE));
const CONTENT = join(APP, 'src/content/docs/docs');
const CONTENT_EN = join(APP, 'src/content/docs/en/docs');
const GENERATED = join(APP, 'src/generated');
const PUBLIC = join(APP, 'public');
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const yaml = (s) => JSON.stringify(s);
const cell = (s) =>
  String(s ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
const warnings = [];
const errors = [];

/** 동봉 문서의 상대 링크 → 사이트 경로. lang = 언어 경로('' 또는 '/en'). 사이트 경로(BASE)를 앞에 붙인다 */
function rewriteLinks(md, from, lang = '') {
  const prefix = BASE + lang;
  return md.replace(/\]\(([^)\s]+?)\.md(#[^)]*)?\)/g, (_m, path, hash = '') => {
    const base = path.split('/').pop();
    if (base === 'tokens') return `](${prefix}/docs/foundations/tokens/${hash})`;
    if (base === 'CHANGELOG') return `](${prefix}/docs/changelog/${hash})`;
    if (path.includes('components/') || (from === 'components' && !path.includes('/')))
      return `](${prefix}/docs/components/${kebab(base)}/${hash})`;
    return `](${prefix}/docs/guide/${base}/${hash})`;
  });
}

const firstParagraph = (md) =>
  (
    md
      .split('\n\n')
      .find(
        (p) =>
          p.trim() &&
          !p.startsWith('#') &&
          !p.startsWith('|') &&
          !p.startsWith('```') &&
          !p.startsWith(':::'),
      ) ?? ''
  )
    .replace(/\s+/g, ' ')
    .replace(/[*`[\]]/g, '')
    .replace(/\(([^)]*)\)/g, (m) => (m.includes('/') ? '' : m))
    .trim();

/** 설명에 넣는 수. 손으로 적지 않고 manifest에서 센다 */
const FACTS = { charts: manifest.components.filter((c) => c.category === 'chart').length };

/** MDX에서 {, }, <, > 를 글자로(코드 블록 · 인라인 코드 · 줄머리 인용은 그대로) */
function escapeMdx(md) {
  let fence = false;
  return md
    .split('\n')
    .map((line) => {
      if (/^```/.test(line)) {
        fence = !fence;
        return line;
      }
      if (fence) return line;
      const quote = /^(\s*>\s?)/.exec(line)?.[1] ?? '';
      const rest = line.slice(quote.length);
      const esc = rest
        .split(/(`[^`]*`)/)
        .map((seg, i) =>
          i % 2
            ? seg
            : seg.replace(
                /[{}<>]/g,
                (c) => ({ '{': '&#123;', '}': '&#125;', '<': '&lt;', '>': '&gt;' })[c],
              ),
        )
        .join('');
      return quote + esc;
    })
    .join('\n');
}

function clean() {
  for (const base of [CONTENT, CONTENT_EN]) {
    rmSync(join(base, 'guide'), { recursive: true, force: true });
    rmSync(join(base, 'changelog.md'), { force: true });
    if (existsSync(join(base, 'components')))
      for (const f of readdirSync(join(base, 'components')))
        if (f !== 'index.mdx') rmSync(join(base, 'components', f));
  }
  rmSync(GENERATED, { recursive: true, force: true });
  rmSync(join(PUBLIC, 'api'), { recursive: true, force: true });
  for (const f of ['llms.txt', 'llms-full.txt']) rmSync(join(PUBLIC, f), { force: true });
}

function guides() {
  mkdirSync(join(CONTENT, 'guide'), { recursive: true });
  for (const g of manifest.guides) {
    const md = readFileSync(join(DOCS, g.doc), 'utf8');
    const body = live(rewriteLinks(md.replace(/^# .+\n+/, ''), 'guides'));
    const front = [
      '---',
      `title: ${yaml(g.title)}`,
      `description: ${yaml(guideDescription(g.slug, 'ko', firstParagraph(body), FACTS))}`,
      '---',
      '',
    ].join('\n');
    writeFileSync(join(CONTENT, 'guide', `${g.slug}.md`), `${front}\n${body}`);
  }
}

/** 동봉 문서 components/<Name>.md의 예시 코드 블록(예시 순서대로) */
function exampleCodes(c) {
  const md = readFileSync(join(DOCS, c.doc), 'utf8').replace(/^# .+\n+/, '');
  const [main, examplesMd = ''] = md.split(/\n## 예시\n/);
  return { main, codes: [...examplesMd.matchAll(/```tsx\n([\s\S]*?)```/g)].map((m) => m[1]) };
}

function components() {
  mkdirSync(join(CONTENT, 'components'), { recursive: true });
  for (const c of manifest.components) {
    const { main, codes } = exampleCodes(c);
    const examples = c.examples
      .map((e, i) =>
        [
          `### ${e.title}`,
          '',
          e.description ? `${escapeMdx(e.description)}\n` : '',
          `<LiveExample component="${c.name}" example="${e.name}" client:visible />`,
          '',
          '```tsx',
          (codes[i] ?? '').trim(),
          '```',
          '',
        ].join('\n'),
      )
      .join('\n');
    const front = [
      '---',
      `title: ${c.name}`,
      `description: ${yaml(componentDescription(c, 'ko', c.summary))}`,
      '---',
      '',
      "import LiveExample from '../../../../components/LiveExample.tsx';",
      '',
    ].join('\n');
    const body = escapeMdx(rewriteLinks(main.trim(), 'components'));
    writeFileSync(
      join(CONTENT, 'components', `${kebab(c.name)}.mdx`),
      `${front}\n${body}\n\n## 예시\n\n${examples}`,
    );
  }
}

function changelog() {
  const md = readFileSync(join(DOCS, 'CHANGELOG.md'), 'utf8').replace(/^# .+\n+/, '');
  writeFileSync(
    join(CONTENT, 'changelog.md'),
    `---\ntitle: 변경 이력\ndescription: ${yaml(`Trellis ${manifest.version}까지의 변경 이력입니다. 사용자에게 보이는 변화만 적습니다.`)}\n---\n\n${rewriteLinks(md, 'root')}`,
  );
}

/* ── 영어판 /en/ ──────────────────────────────────────────── */

function guidesEn() {
  mkdirSync(join(CONTENT_EN, 'guide'), { recursive: true });
  for (const g of manifest.guides) {
    const file = join(GUIDES_EN, `${g.slug}.md`);
    let title;
    let body;
    if (existsSync(file)) {
      const md = readFileSync(file, 'utf8');
      const hits = forbiddenHits(md, { adjectives: g.slug !== 'content' });
      if (hits.length) errors.push(`docs/guides/en/${g.slug}.md: 금칙어 ${hits.join(', ')}`);
      title = /^# (.+)$/m.exec(md)?.[1]?.trim() ?? titleFromName(g.slug);
      body = live(rewriteLinks(md.replace(/^# .+\n+/, ''), 'guides', '/en'));
    } else {
      warnings.push(`docs/guides/en/${g.slug}.md 없음 — 영어 페이지는 한국어 가이드 링크만 둔다`);
      title = titleFromName(g.slug[0].toUpperCase() + g.slug.slice(1));
      body = `:::note\nThis guide is not translated yet. Read the [Korean guide](${BASE}/docs/guide/${g.slug}/).\n:::\n`;
    }
    const front = [
      '---',
      `title: ${yaml(title)}`,
      `description: ${yaml(guideDescription(g.slug, 'en', firstParagraph(body), FACTS))}`,
      '---',
      '',
    ].join('\n');
    writeFileSync(join(CONTENT_EN, 'guide', `${g.slug}.md`), `${front}\n${body}`);
  }
}

/** 영어 Props 표 — 타입 · 기본값 · 필수는 manifest(contract), 설명은 spec.en.md front matter props */
function propsTableEn(c, descriptions) {
  const withDesc = Boolean(descriptions);
  const rows = c.props.map((p) => {
    // 배열 · 객체 기본값은 쉼표 뒤에 공백을 둬 표 칸 안에서 줄바꿈되게 한다(build-docs와 같다)
    const def =
      p.default === undefined ? '' : `\`${JSON.stringify(p.default).replace(/,(?=\S)/g, ', ')}\``;
    const base = `| \`${p.name}\` | \`${cell(p.type)}\` | ${def} | ${p.required ? 'Yes' : ''} |`;
    return withDesc ? `${base} ${cell(descriptions[p.name] ?? '')} |` : base;
  });
  const head = withDesc
    ? ['| Name | Type | Default | Required | Description |', '| --- | --- | --- | --- | --- |']
    : ['| Name | Type | Default | Required |', '| --- | --- | --- | --- |'];
  return [...head, ...rows].join('\n');
}

function componentsEn() {
  mkdirSync(join(CONTENT_EN, 'components'), { recursive: true });
  const summaries = {};
  for (const c of manifest.components) {
    const { codes } = exampleCodes(c);
    const spec = readSpecEn(c.name);
    const out = [
      `> \`${c.entry}\` · CSS \`.${c.cssClass}\` · ${c.status === 'preview' ? 'Preview' : 'Stable'} · Web${c.platforms.native ? ' · Native (same props)' : ''}`,
      '',
      '```ts',
      `import { ${c.name} } from '${c.entry}';`,
      '```',
      '',
    ];
    if (spec) {
      const hits = forbiddenHits(readFileSync(specEnPath(c.name), 'utf8'));
      if (hits.length) errors.push(`${c.name}/spec.en.md: 금칙어 ${hits.join(', ')}`);
      for (const [title, body] of spec.sections) {
        if (INTERNAL_EN.has(title)) continue;
        let text =
          title === 'Props'
            ? propsTableEn(c, spec.props)
            : body
                .replace(/`charts\/README\.md`/g, '[Choosing a chart](../guides/charts.md)')
                // 저장소 안 경로 → 패키지 이름(build-docs publicPaths와 같다)
                .replace(
                  /(?:contracts )?`_shared\/[\w-]+\.ts`/g,
                  '`@terracelab/trellis-contracts`',
                );
        if (title === 'States')
          text = `Supported states: ${c.states.map((s) => `\`${s}\``).join(' · ')}\n\n${text}`;
        out.push(`## ${title}`, '', text, '');
      }
    } else {
      warnings.push(
        `${c.name}: spec.en.md 없음 — 영어 페이지는 Props 표(타입)와 예시만 있는 최소판`,
      );
      out.push(
        ':::note',
        `This component has no English description yet. The [Korean page](${BASE}/docs/components/${kebab(c.name)}/) has the full text.`,
        ':::',
        '',
        '## Props',
        '',
        propsTableEn(c, null),
        '',
        '## States',
        '',
        `Supported states: ${c.states.map((s) => `\`${s}\``).join(' · ')}`,
        '',
      );
    }
    const examples = c.examples
      .map((e, i) => {
        const t = spec?.examples[e.name]
          ? splitExample(spec.examples[e.name])
          : { title: titleFromName(e.name), description: '' };
        return [
          `### ${t.title}`,
          '',
          t.description ? `${escapeMdx(t.description)}\n` : '',
          `<LiveExample component="${c.name}" example="${e.name}" locale="en" client:visible />`,
          '',
          '```tsx',
          (codes[i] ?? '').trim(),
          '```',
          '',
        ].join('\n');
      })
      .join('\n');
    const summary = spec?.summary || `${c.name} props, states and examples`;
    summaries[c.name] = summary;
    const front = [
      '---',
      `title: ${c.name}`,
      `description: ${yaml(componentDescription(c, 'en', spec?.summary ?? ''))}`,
      '---',
      '',
      "import LiveExample from '../../../../../components/LiveExample.tsx';",
      '',
    ].join('\n');
    const body = escapeMdx(rewriteLinks(out.join('\n').trim(), 'components', '/en'));
    const intro =
      'Examples render inside `TrellisProvider locale="en"`, so component text such as buttons, accessible names and empty states is in English. The sample data is Korean business data and stays in Korean.';
    writeFileSync(
      join(CONTENT_EN, 'components', `${kebab(c.name)}.mdx`),
      `${front}\n${body}\n\n## Examples\n\n${intro}\n\n${examples}`,
    );
  }
  mkdirSync(GENERATED, { recursive: true });
  writeFileSync(
    join(GENERATED, 'components.en.json'),
    `${JSON.stringify({ summaries }, null, 2)}\n`,
  );
}

/** 변경 이력은 changeset(한국어)에서 만든다. 영어 페이지는 번역하지 않고 그 사실을 적는다 */
function changelogEn() {
  const md = readFileSync(join(DOCS, 'CHANGELOG.md'), 'utf8').replace(/^# .+\n+/, '');
  writeFileSync(
    join(CONTENT_EN, 'changelog.md'),
    [
      '---',
      'title: Changelog',
      `description: ${yaml(`Changes up to Trellis ${manifest.version}. Generated from Korean release notes.`)}`,
      '---',
      '',
      ':::note',
      'This changelog is generated from the release notes (changesets), which are written in Korean. It is not translated.',
      ':::',
      '',
      '<div lang="ko">',
      '',
      rewriteLinks(md, 'root', '/en').trim(),
      '',
      '</div>',
      '',
    ].join('\n'),
  );
}

/** 손으로 쓴 영어 데이터(토큰 설명 · 모듈 이름)도 금칙어를 본다 */
function dataEn() {
  for (const f of ['tokens.en.json', 'modules.en.json']) {
    const file = join(I18N_DATA, f);
    if (!existsSync(file)) continue;
    const hits = forbiddenHits(readFileSync(file, 'utf8'));
    if (hits.length) errors.push(`src/i18n/${f}: 금칙어 ${hits.join(', ')}`);
  }
}

/** 사이트 주소가 원본과 다를 때 폴더 안 글 파일(.md · .txt · .json)의 원본 주소를 바꾼다 */
function liveFiles(dir) {
  if (LIVE === SITE) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) liveFiles(file);
    else if (/\.(md|txt|json)$/.test(entry.name)) {
      const text = readFileSync(file, 'utf8');
      if (text.includes(SITE)) writeFileSync(file, live(text));
    }
  }
}

/** /api/latest · /api/v<x.y> = 동봉 문서 그대로(주소만 사이트 주소로), /llms.txt = 최신판(절대 링크) */
function api() {
  for (const v of ['latest', manifest.docsVersion])
    cpSync(DOCS, join(PUBLIC, 'api', v), { recursive: true });
  liveFiles(join(PUBLIC, 'api'));
  // 원본 주소를 먼저 바꾸고 상대 링크를 붙인다(LIVE가 원본으로 시작할 때 두 번 바뀌지 않게)
  const llms = live(readFileSync(join(DOCS, 'llms.txt'), 'utf8')).replace(
    /\]\((?!https?:)([^)]+)\)/g,
    (_m, href) => `](${LIVE}/api/latest/${href})`,
  );
  writeFileSync(join(PUBLIC, 'llms.txt'), llms);
  writeFileSync(
    join(PUBLIC, 'llms-full.txt'),
    live(readFileSync(join(DOCS, 'llms-full.txt'), 'utf8')),
  );
}

clean();
guides();
components();
changelog();
guidesEn();
componentsEn();
changelogEn();
dataEn();
api();

// 번역이 덜 된 것(빠진 props 설명 · 예시 제목 · 토큰 설명 · 모듈 이름)은 목록 대신 한 줄로. 자세히는 i18n-status
const status = translationStatus(manifest);
const partial = Object.values(status.components).filter(
  (issues) => !issues[0]?.startsWith('spec.en.md 없음'),
).length;
if (partial || status.tokens.length || status.modules.length)
  warnings.push(
    `영어 번역 손볼 것: 컴포넌트 ${partial} · 토큰 설명 ${status.tokens.length} · 모듈 이름 ${status.modules.length} — node scripts/i18n-status.mjs`,
  );
for (const w of warnings) console.warn(`경고(en): ${w}`);
if (errors.length) {
  console.error(`sync 실패:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
const enComponents = manifest.components.filter((c) => readSpecEn(c.name)).length;
console.log(
  `sync: 가이드 ${manifest.guides.length} · 컴포넌트 ${manifest.components.length} · 변경 이력 · /api/{latest,${manifest.docsVersion}} · /llms.txt (Trellis ${manifest.version})`,
);
console.log(
  `sync(en): 가이드 ${manifest.guides.length - status.guides.filter((g) => g.endsWith('없음')).length}/${manifest.guides.length} · 컴포넌트 spec.en.md ${enComponents}/${manifest.components.length} · 경고 ${warnings.length}`,
);
