// 소개 사이트(dist) 위에 문서(apps/docs/dist)와 데모(apps/demo/dist)를 얹어 한 묶음으로 만든다(D-148).
// 묶음 하나가 정적 호스팅 한 곳에 올라간다: / 소개 · /docs/ · /en/ · /llms.txt · /api/ 문서 · /demo/ 데모.
//   node scripts/assemble.mjs                    astro build 뒤에 돈다(package.json build)
//   SITE_DIST=<폴더> node scripts/assemble.mjs    다른 폴더에 조립한다(검사용)
// 세 앱은 같은 SITE_BASE로 빌드해야 한다(turbo가 환경 변수를 같이 넘긴다). 다르면 여기서 멈춘다.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const SITE = process.env.SITE_DIST ? resolve(process.env.SITE_DIST) : here('../dist');
const DOCS = here('../../docs/dist');
const DEMO = here('../../demo/dist');
const BASE = (process.env.SITE_BASE ?? '/').replace(/\/?$/, '/');

/** 문서 사이트에도 있지만 소개 사이트 것이 이기는 파일. 소개 사이트에 없으면 문서 것을 쓴다(index.html은 반드시 있어야 한다) */
const OWNED = [
  'index.html',
  '404.html',
  'favicon.svg',
  'favicon.ico',
  'apple-touch-icon.png',
  'og.png',
  'robots.txt',
];

/** 사이트맵 입구. 문서가 만든 파일에 소개 사이트의 사이트맵을 더해 다시 쓴다(겹침 검사에서 뺀다) */
const SITEMAP_INDEX = 'sitemap-index.xml';
const SITEMAP_SITE = 'sitemap-site.xml';

function fail(message) {
  console.error(`조립 실패: ${message}`);
  process.exit(1);
}

if (!existsSync(join(SITE, 'index.html')))
  fail(`소개 사이트 빌드가 없다(${SITE}). 먼저 astro build`);
if (!existsSync(join(DOCS, 'docs/guide/overview/index.html')))
  fail(
    '문서 빌드가 없다. pnpm --filter @terracelab/docs build 를 먼저(turbo는 의존으로 자동 실행)',
  );
if (!existsSync(join(DEMO, 'index.html')))
  fail(
    '데모 빌드가 없다. pnpm --filter @terracelab/demo build 를 먼저(turbo는 의존으로 자동 실행)',
  );

// 같은 경로로 빌드했는지: 문서의 내부 링크와 데모의 자산 주소가 BASE로 시작해야 한다
const docsPage = readFileSync(join(DOCS, 'docs/guide/overview/index.html'), 'utf8');
if (!docsPage.includes(`href="${BASE}docs/`))
  fail(
    `문서가 다른 경로로 빌드됐다(지금 SITE_BASE=${BASE}). 같은 SITE_BASE로 문서를 다시 빌드한다`,
  );
const demoPage = readFileSync(join(DEMO, 'index.html'), 'utf8');
if (!demoPage.includes(`"${BASE}demo/assets/`))
  fail(
    `데모가 다른 경로로 빌드됐다(지금 SITE_BASE=${BASE}). 같은 SITE_BASE로 데모를 다시 빌드한다`,
  );

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) walk(file, out);
    else out.push(file);
  }
  return out;
}

const same = (a, b) =>
  statSync(a).size === statSync(b).size && readFileSync(a).equals(readFileSync(b));

// 1) 문서. 소개 사이트가 가진 OWNED 파일은 건너뛰고, 그 밖에 같은 주소가 겹치면 내용이 같을 때만 넘어간다.
//    겹침을 먼저 다 찾고 나서 복사한다(실패하면 dist를 건드리지 않는다)
const collisions = [];
const todo = [];
const kept = [];
for (const file of walk(DOCS)) {
  const rel = relative(DOCS, file);
  const target = join(SITE, rel);
  if (rel === SITEMAP_INDEX) continue;
  if (!existsSync(target)) todo.push([file, target]);
  else if (OWNED.includes(rel.split(sep).join('/'))) kept.push(rel);
  else if (!same(file, target)) collisions.push(rel);
}
if (collisions.length)
  fail(
    `소개 사이트와 문서가 같은 주소에 다른 파일을 낸다(${collisions.length}개): ${collisions.slice(0, 8).join(', ')}` +
      `${collisions.length > 8 ? ' …' : ''}\n` +
      '  _astro/ 안이면 해시 이름이 겹친 것이고, 그 밖이면 한쪽 페이지 주소를 바꾼다. 이미 조립한 dist라면 astro build부터 다시 한다',
  );

// 2) 데모 → /demo/. 소개 사이트가 demo 주소의 페이지를 만들면 데모가 덮으므로 막는다
if (
  ['demo', 'demo.astro', 'demo.md', 'demo.mdx'].some((p) => existsSync(here(`../src/pages/${p}`)))
)
  fail('소개 사이트에 demo 주소의 페이지가 있다. 데모가 놓일 자리라 페이지 주소를 바꾼다');
for (const [file, target] of todo) {
  mkdirSync(dirname(target), { recursive: true });
  cpSync(file, target);
}
const DEMO_OUT = join(SITE, 'demo');
rmSync(DEMO_OUT, { recursive: true, force: true });
cpSync(DEMO, DEMO_OUT, { recursive: true });

// 3) 사이트맵 입구는 하나다: 문서의 sitemap-index.xml에 소개 사이트의 sitemap-site.xml을 더한다.
//    robots.txt와 검색 도구에는 이 주소 하나만 알린다
const docsIndex = join(DOCS, SITEMAP_INDEX);
if (!existsSync(docsIndex)) fail(`문서에 ${SITEMAP_INDEX}가 없다`);
if (!existsSync(join(SITE, SITEMAP_SITE))) fail(`소개 사이트에 ${SITEMAP_SITE}가 없다`);
const index = readFileSync(docsIndex, 'utf8');
const firstLoc = /<loc>([^<]+)<\/loc>/.exec(index)?.[1];
if (!firstLoc || !index.includes('</sitemapindex>'))
  fail(`${SITEMAP_INDEX}를 읽지 못했다(문서가 만드는 모양이 바뀌었다)`);
writeFileSync(
  join(SITE, SITEMAP_INDEX),
  index.replace(
    '</sitemapindex>',
    `<sitemap><loc>${firstLoc.replace(/[^/]+$/, SITEMAP_SITE)}</loc></sitemap></sitemapindex>`,
  ),
);

// 4) GitHub Pages가 _astro/처럼 밑줄로 시작하는 폴더를 내주게 한다
writeFileSync(join(SITE, '.nojekyll'), '');

console.log(
  `조립: 문서 ${todo.length}개 파일 → ${SITE} (소개 사이트 것 유지: ${kept.join(' · ') || '없음'}) · 데모 → demo/ · 사이트맵 입구 ${SITEMAP_INDEX} · 경로 ${BASE}`,
);
