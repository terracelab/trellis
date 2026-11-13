// 조립된 묶음(dist = 소개 사이트 + 문서 + 데모)의 검색 · 답변 엔진 값(SEO · AEO · GEO) 검사(D-152).
// 모든 HTML을 글로 읽는다. 브라우저를 띄우지 않아 1초 안에 끝나고, 소개 사이트뿐 아니라 문서 전부를 본다.
//   node scripts/seo.mjs [--json <파일>]       pnpm --filter @terracelab/site check:seo
//   SITE_BASE · SITE_URL · SITE_INDEXABLE · SITE_DIST는 check.mjs와 같다(빌드할 때와 같은 값을 준다)
// check.mjs가 auditSeo()를 불러 같은 검사를 먼저 돌린다.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { displayWidth } from '@terracelab/seo';

/** 페이지가 아닌 폴더(생성물 · 원문 파일) */
const SKIP = ['_astro', 'pagefind', 'api'];
/** 글자 수 기준. 제목은 폭(한글 2)으로, 설명은 글자 수로 본다 */
const LIMIT = { titleWidth: 60, descMin: { ko: 40, en: 50 }, descMax: 220 };

const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? null;
/** 태그 하나. 속성 값 안의 > 에서 끊기지 않게 따옴표를 따라간다 */
const tags = (html, name) =>
  html.match(new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, 'g')) ?? [];
const unescape = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

function walk(dir, rel = '', out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (rel === '' && SKIP.includes(entry.name)) continue;
      walk(join(dir, entry.name), `${rel}${entry.name}/`, out);
    } else if (entry.name.endsWith('.html')) out.push(`${rel}${entry.name}`);
  }
  return out;
}

function readPage(dist, file) {
  const html = readFileSync(join(dist, file), 'utf8');
  const cut = html.indexOf('</head>');
  const head = html.slice(0, cut);
  const body = html.slice(cut);
  const top = file.includes('/') ? file.split('/')[0] : '';
  const kind =
    top === 'demo' ? 'demo' : top === 'en' ? 'docs-en' : top === 'docs' ? 'docs' : 'site';
  const path = `/${file.replace(/index\.html$/, '')}`;
  const meta = new Map();
  for (const tag of tags(head, 'meta')) {
    const key = attr(tag, 'name') ?? attr(tag, 'property');
    if (key) meta.set(key, [...(meta.get(key) ?? []), unescape(attr(tag, 'content') ?? '')]);
  }
  const links = tags(head, 'link').map((tag) => ({
    rel: attr(tag, 'rel'),
    href: unescape(attr(tag, 'href') ?? ''),
    hreflang: attr(tag, 'hreflang'),
    type: attr(tag, 'type'),
  }));
  const ld = [];
  let ldError = false;
  for (const m of html.matchAll(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    try {
      const data = JSON.parse(m[1]);
      ld.push(...(data['@graph'] ?? [data]));
    } catch {
      ldError = true;
    }
  }
  const imgs = tags(body, 'img');
  return {
    file,
    path,
    kind,
    lang: attr(tags(html, 'html')[0] ?? '', 'lang'),
    missing: /(^|\/)404(\.html|\/index\.html)$/.test(file),
    title: unescape((/<title[^>]*>([\s\S]*?)<\/title>/.exec(head)?.[1] ?? '').trim()),
    meta,
    one: (key) => meta.get(key)?.[0] ?? '',
    canonical: links.filter((l) => l.rel === 'canonical').map((l) => l.href),
    hreflang: new Map(links.filter((l) => l.hreflang).map((l) => [l.hreflang, l.href])),
    markdown: links.filter((l) => l.rel === 'alternate' && l.type === 'text/markdown'),
    text: links.filter((l) => l.rel === 'alternate' && l.type === 'text/plain'),
    ld,
    ldError,
    types: ld.map((node) => node['@type']),
    h1: (body.match(/<h1\b/g) ?? []).length,
    imgs: imgs.length,
    imgsNoAlt: imgs.filter((tag) => !attr(tag, 'alt')).length,
    faqShown: (body.match(/class="tl-site-faq-item"/g) ?? []).length,
  };
}

/**
 * @param {{ dist: string, base?: string, siteUrl?: string, indexable?: boolean }} options
 * @returns {{ failures: string[], notes: string[], stats: Record<string, unknown>, pages: ReturnType<typeof readPage>[] }}
 */
export function auditSeo({ dist, base = '/', siteUrl, indexable = false }) {
  const BASE = base.replace(/\/?$/, '/');
  const failures = [];
  const notes = [];
  const pages = walk(dist)
    .sort()
    .map((file) => readPage(dist, file));
  const origin = siteUrl?.replace(/\/$/, '');
  /** 절대 주소 → dist 안 파일. 이 묶음 밖 주소면 null */
  const fileOf = (href) => {
    let pathname;
    try {
      pathname = new URL(href, origin ?? 'http://local.test').pathname;
    } catch {
      return null;
    }
    if (!pathname.startsWith(BASE)) return null;
    const rel = decodeURIComponent(pathname.slice(BASE.length));
    for (const candidate of [rel, `${rel}index.html`]) {
      const file = join(dist, candidate);
      if (candidate && !candidate.endsWith('/') && existsSync(file)) return file;
    }
    return null;
  };

  for (const p of pages) {
    const bad = [];
    const lang = p.kind === 'docs-en' ? 'en' : 'ko';
    const robots = p.one('robots');

    if (p.kind === 'demo') {
      // 데모는 색인에서 빼고 링크 미리보기만 둔다
      if (!robots.includes('noindex')) bad.push('데모는 noindex여야 한다');
      for (const key of ['og:title', 'og:description', 'og:url', 'og:image', 'twitter:card'])
        if (!p.one(key)) bad.push(`${key} 없음`);
      if (p.one('og:image') && !fileOf(p.one('og:image'))) bad.push('og:image 파일이 묶음에 없다');
      if (bad.length) failures.push(`${p.path}: ${bad.join(' · ')}`);
      continue;
    }

    if (p.lang !== lang) bad.push(`lang ${p.lang}(${lang}이어야 한다)`);
    if (!p.title) bad.push('제목 없음');
    else if (displayWidth(p.title) > LIMIT.titleWidth)
      bad.push(`제목 폭 ${displayWidth(p.title)}(${LIMIT.titleWidth} 이하)`);
    const desc = p.one('description');
    if (!desc) bad.push('설명 없음');
    else if (!p.missing && (desc.length < LIMIT.descMin[lang] || desc.length > LIMIT.descMax))
      bad.push(`설명 ${desc.length}자(${LIMIT.descMin[lang]}~${LIMIT.descMax})`);
    for (const [key, values] of p.meta)
      if (values.length > 1 && key !== 'generator') bad.push(`${key}가 ${values.length}번 나온다`);

    if (p.canonical.length !== 1) bad.push(`canonical ${p.canonical.length}개`);
    else {
      // 404는 호스팅이 없는 주소마다 돌려주는 파일이라 주소를 맞춰 보지 않는다
      const want = origin && !p.missing ? `${origin}${BASE}${p.path.slice(1)}` : null;
      if (!/^https?:\/\//.test(p.canonical[0])) bad.push('canonical이 절대 주소가 아니다');
      else if (want && p.canonical[0] !== want) bad.push(`canonical ${p.canonical[0]}(${want})`);
      if (p.one('og:url') !== p.canonical[0]) bad.push('og:url이 canonical과 다르다');
    }
    for (const key of ['og:title', 'og:description', 'og:type', 'og:site_name', 'og:image:alt'])
      if (!p.one(key)) bad.push(`${key} 없음`);
    if (!['ko_KR', 'en_US'].includes(p.one('og:locale')))
      bad.push(`og:locale ${p.one('og:locale')}`);
    if (p.one('twitter:card') !== 'summary_large_image') bad.push('twitter:card');
    const image = p.one('og:image');
    if (!/^https?:\/\//.test(image)) bad.push(`og:image ${image || '없음'}`);
    else if (!fileOf(image)) bad.push(`og:image 파일이 묶음에 없다(${image})`);

    const wantsNoindex = p.missing || !indexable;
    if (wantsNoindex !== robots.includes('noindex'))
      bad.push(`robots "${robots}"(색인 ${wantsNoindex ? '막음' : '허용'}이어야 한다)`);

    if (p.ldError) bad.push('구조화 데이터 JSON을 읽을 수 없다');
    for (const type of ['Organization', 'WebSite'])
      if (p.types.filter((t) => t === type).length !== 1)
        bad.push(`구조화 데이터 ${type}가 하나가 아니다`);

    if (p.kind === 'site') {
      if (p.h1 !== 1) bad.push(`h1 ${p.h1}개`);
      if (!p.text.length || !p.text.every((l) => fileOf(l.href))) bad.push('llms.txt 연결 없음');
      if (p.path === '/') {
        if (!p.types.includes('SoftwareSourceCode')) bad.push('홈에 SoftwareSourceCode 없음');
        for (const code of ['ko', 'en', 'x-default'])
          if (!p.hreflang.has(code)) bad.push(`홈에 hreflang ${code} 없음`);
      } else if (!p.missing && !p.types.includes('BreadcrumbList')) bad.push('BreadcrumbList 없음');
      if (!p.missing && !p.types.some((t) => t === 'WebPage' || t === 'FAQPage'))
        bad.push('WebPage 없음');
      if (p.path === '/faq/') {
        const faq = p.ld.find((node) => node['@type'] === 'FAQPage');
        const asked = faq?.mainEntity ?? [];
        if (asked.length < 5 || asked.length !== p.faqShown)
          bad.push(`FAQ 구조화 ${asked.length}개 · 화면 ${p.faqShown}개`);
        if (asked.some((q) => !q.name || !q.acceptedAnswer?.text)) bad.push('FAQ에 빈 질문 · 답');
      }
      if (p.path === '/blocks/' && p.imgsNoAlt) bad.push(`설명 없는 블록 그림 ${p.imgsNoAlt}개`);
    } else if (/^\/(en\/)?docs\//.test(p.path)) {
      if (p.h1 < 1) bad.push('h1 없음');
      for (const type of ['TechArticle', 'BreadcrumbList'])
        if (!p.types.includes(type)) bad.push(`${type} 없음`);
      for (const code of ['ko', 'en', 'x-default'])
        if (!p.hreflang.has(code)) bad.push(`hreflang ${code} 없음`);
      const wantsMarkdown =
        p.kind === 'docs' && /^\/docs\/(components|guide)\/[^/]+\/$/.test(p.path);
      if (wantsMarkdown && p.markdown.length !== 1) bad.push('마크다운 짝 없음');
      for (const l of p.markdown) if (!fileOf(l.href)) bad.push(`마크다운 짝 파일 없음(${l.href})`);
    }
    if (bad.length) failures.push(`${p.path}: ${bad.join(' · ')}`);
  }

  const real = pages.filter((p) => p.kind !== 'demo' && !p.missing);

  // 제목 · 설명은 언어 안에서 겹치지 않는다
  for (const lang of ['ko', 'en']) {
    const group = real.filter((p) => (p.kind === 'docs-en' ? 'en' : 'ko') === lang);
    for (const [label, get] of [
      ['제목', (p) => p.title],
      ['설명', (p) => p.one('description')],
    ]) {
      const seen = new Map();
      for (const p of group) seen.set(get(p), [...(seen.get(get(p)) ?? []), p.path]);
      for (const [value, paths] of seen)
        if (value && paths.length > 1)
          failures.push(
            `${label}이 겹친다(${lang}): "${value.slice(0, 40)}" ← ${paths.slice(0, 3).join(' ')}`,
          );
    }
  }

  // 회사 · 사이트 개체는 묶음 전체에서 하나씩이다
  for (const type of ['Organization', 'WebSite']) {
    const seen = new Set(
      real.flatMap((p) =>
        p.ld.filter((n) => n['@type'] === type).map((n) => `${n['@id']} "${n.name}"`),
      ),
    );
    if (seen.size !== 1)
      failures.push(`${type} 개체가 ${seen.size}가지로 나온다: ${[...seen].join(' / ')}`);
  }

  // 언어 짝은 서로를 가리킨다
  const byCanonical = new Map(real.map((p) => [p.canonical[0], p]));
  for (const p of real)
    for (const [code, href] of p.hreflang) {
      if (code === 'x-default' || href === p.canonical[0]) continue;
      const other = byCanonical.get(href);
      if (!other) failures.push(`${p.path}: hreflang ${code}가 없는 주소를 가리킨다(${href})`);
      else if (![...other.hreflang.values()].includes(p.canonical[0]))
        failures.push(`${p.path}: hreflang ${code}의 짝(${other.path})이 되돌아오지 않는다`);
    }

  // 사이트맵 입구는 하나이고, 색인 대상 페이지와 주소가 같다
  const read = (name) =>
    existsSync(join(dist, name)) ? readFileSync(join(dist, name), 'utf8') : null;
  const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => unescape(m[1]));
  const index = read('sitemap-index.xml');
  const listed = new Set();
  let sitemapFiles = 0;
  if (!index) failures.push('sitemap-index.xml 없음');
  else
    for (const child of locs(index)) {
      const file = fileOf(child);
      if (!file) failures.push(`사이트맵 ${child}가 묶음에 없다`);
      else {
        sitemapFiles += 1;
        for (const loc of locs(readFileSync(file, 'utf8'))) listed.add(loc);
      }
    }
  if (read('sitemap.xml'))
    failures.push('sitemap.xml이 남아 있다(입구는 sitemap-index.xml 하나다)');
  const wanted = new Set(real.map((p) => p.canonical[0]));
  const unlisted = [...wanted].filter((u) => !listed.has(u));
  const dangling = [...listed].filter((u) => !wanted.has(u));
  if (index && unlisted.length)
    failures.push(`사이트맵에 없는 페이지 ${unlisted.length}개: ${unlisted.slice(0, 4).join(' ')}`);
  if (dangling.length)
    failures.push(
      `페이지가 없는 사이트맵 주소 ${dangling.length}개: ${dangling.slice(0, 4).join(' ')}`,
    );

  // robots.txt는 색인 여부와 같고, 열리면 사이트맵 입구를 알린다
  const robots = read('robots.txt');
  if (!robots) failures.push('robots.txt 없음');
  else {
    const closed = /^Disallow:\s*\/\s*$/m.test(robots);
    if (closed === indexable) failures.push(`robots.txt가 색인 ${closed ? '막음' : '허용'}이다`);
    if (indexable && !/^Sitemap: \S+sitemap-index\.xml$/m.test(robots))
      failures.push('robots.txt에 사이트맵 입구가 없다');
  }

  // 알려 둘 것(실패는 아니다)
  const manyH1 = real.filter((p) => p.h1 > 1).map((p) => `${p.path}(${p.h1})`);
  if (manyH1.length) notes.push(`h1이 여러 개인 문서(예시가 그리는 제목): ${manyH1.join(' ')}`);

  const count = (kind) => pages.filter((p) => p.kind === kind).length;
  const descs = real.map((p) => p.one('description').length).sort((a, b) => a - b);
  return {
    failures,
    notes,
    pages,
    stats: {
      pages: pages.length,
      site: count('site'),
      docs: count('docs'),
      docsEn: count('docs-en'),
      demo: count('demo'),
      sitemapFiles,
      sitemapUrls: listed.size,
      indexablePages: wanted.size,
      articles: real.filter((p) => p.types.includes('TechArticle')).length,
      markdownPairs: real.filter((p) => p.markdown.length).length,
      descMin: descs[0],
      descMedian: descs[Math.floor(descs.length / 2)],
      descMax: descs.at(-1),
      indexable,
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dist = process.env.SITE_DIST
    ? resolve(process.env.SITE_DIST)
    : fileURLToPath(new URL('../dist', import.meta.url));
  if (!existsSync(join(dist, 'index.html'))) {
    console.error('dist 없음. 먼저 pnpm turbo run build --filter=@terracelab/site...');
    process.exit(1);
  }
  const { failures, notes, stats, pages } = auditSeo({
    dist,
    base: process.env.SITE_BASE,
    siteUrl: process.env.SITE_URL,
    indexable: process.env.SITE_INDEXABLE === '1',
  });
  const out = process.argv.indexOf('--json');
  if (out !== -1 && process.argv[out + 1])
    writeFileSync(
      process.argv[out + 1],
      JSON.stringify({
        stats,
        failures,
        notes,
        pages: pages.map((p) => ({
          path: p.path,
          kind: p.kind,
          title: p.title,
          description: p.one('description'),
          types: p.types,
        })),
      }),
    );
  console.log(report(stats));
  for (const note of notes) console.log(`참고: ${note}`);
  if (failures.length) {
    console.error(`SEO 실패 ${failures.length}건:\n- ${failures.slice(0, 40).join('\n- ')}`);
    process.exit(1);
  }
  console.log('SEO 통과');
}

/** 한 줄 요약 */
export function report(s) {
  return (
    `SEO: 페이지 ${s.pages}개(소개 ${s.site} · 문서 ${s.docs} · 영어 문서 ${s.docsEn} · 데모 ${s.demo}) · ` +
    `사이트맵 ${s.sitemapFiles}개 파일에 주소 ${s.sitemapUrls}개(색인 대상 ${s.indexablePages}) · ` +
    `문서 구조화 ${s.articles}쪽 · 마크다운 짝 ${s.markdownPairs}쪽 · ` +
    `설명 ${s.descMin}~${s.descMax}자(중앙 ${s.descMedian}) · 색인 ${s.indexable ? '허용' : '막음'}`
  );
}
