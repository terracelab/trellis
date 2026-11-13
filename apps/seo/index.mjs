// 소개 사이트 · 문서 · 테라스원이 같이 쓰는 검색 · 답변 엔진 값(D-152).
// 회사 · 사이트 개체, 색인 여부, robots.txt, 사이트맵, 구조화 데이터를 여기 한 곳에서만 정한다.
// Astro 설정(astro.config.mjs, Node)과 페이지 코드가 같이 가져오므로 의존이 없는 ESM으로 둔다.

/**
 * 회사. 공식 주소가 정해지면 url 한 줄만 채운다.
 * 세 사이트의 구조화 데이터에 url이 들어가고, 회사 개체의 @id가 그 주소 하나로 모인다.
 */
export const ORG = {
  name: '테라스랩',
  alternateName: ['TerraceLab'],
  /** @type {string | undefined} 회사 공식 주소(끝 / 포함) */
  url: undefined,
  /** @type {string | undefined} 회사 로고 그림의 절대 주소. Trellis 표식은 제품 표식이라 여기에 쓰지 않는다 */
  logo: undefined,
  /** @type {string[]} 회사 공식 계정 주소 */
  sameAs: [],
};

/** Trellis를 한 문단으로 말하는 글. 구조화 데이터 · FAQ 첫 답 · 문서 기본 설명이 같은 글을 쓴다 */
export const TRELLIS = {
  name: 'Trellis',
  alternateName: ['트렐리스'],
  about: {
    ko: 'Trellis(트렐리스)는 테라스랩의 디자인 시스템입니다. 한국 업무 화면에 쓰는 토큰 · 컴포넌트 · 화면 블록 · 에이전트용 문서를 한 곳에서 관리합니다.',
    en: "Trellis is TerraceLab's design system. It keeps the tokens, components, screen blocks and agent docs for Korean business software in one place.",
  },
  imageAlt: {
    ko: 'Trellis, 테라스랩의 디자인 시스템',
    en: "Trellis, TerraceLab's design system",
  },
};

/* ── 색인 ─────────────────────────────────────────────────── */

/** 공개 범위 승인 전에는 색인을 막는다. 배포 환경에서 SITE_INDEXABLE=1이면 열린다 */
export const isIndexable = () => process.env.SITE_INDEXABLE === '1';

export const ROBOTS_OPEN =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const ROBOTS_CLOSED = 'noindex, nofollow';

/** <meta name="robots">의 값. noindex는 색인이 열려도 빼야 하는 페이지(404) */
export const robotsMeta = (noindex = false) =>
  isIndexable() && !noindex ? ROBOTS_OPEN : ROBOTS_CLOSED;

/**
 * robots.txt 본문. 검색 엔진과 답변 엔진 크롤러를 가르지 않는다(User-agent: * 하나).
 * 이 파일은 호스트 루트에 있을 때만 읽힌다. 경로 아래(/trellis/)에 올린 묶음은 루트의 robots.txt가 정한다.
 * @param {{ sitemaps?: string[] }} [options]
 */
export function robotsTxt({ sitemaps = [] } = {}) {
  if (!isIndexable()) return 'User-agent: *\nDisallow: /\n';
  return `User-agent: *\nAllow: /\n${sitemaps.length ? '\n' : ''}${sitemaps.map((s) => `Sitemap: ${s}\n`).join('')}`;
}

/**
 * 소유 확인 태그. 값은 배포 환경 변수로 받는다(저장소에 적지 않는다). 홈 한 곳에만 넣는다.
 * @returns {{ name: string, content: string }[]}
 */
export function verificationMeta() {
  return [
    ['google-site-verification', process.env.SITE_VERIFY_GOOGLE],
    ['naver-site-verification', process.env.SITE_VERIFY_NAVER],
    ['msvalidate.01', process.env.SITE_VERIFY_BING],
  ].flatMap(([name, content]) => (name && content ? [{ name, content }] : []));
}

/* ── 사이트맵 ─────────────────────────────────────────────── */

const xml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * 주소 목록 → 사이트맵. lastmod는 넣지 않는다(빌드 날짜는 고친 날짜가 아니라서 넣으면 틀린 값이 된다).
 * @param {(string | { loc: string, alternates?: { hreflang: string, href: string }[] })[]} urls
 */
export function sitemapXml(urls) {
  const rows = urls.map((u) => {
    const { loc, alternates = [] } = typeof u === 'string' ? { loc: u } : u;
    const links = alternates
      .map(
        (a) => `<xhtml:link rel="alternate" hreflang="${xml(a.hreflang)}" href="${xml(a.href)}"/>`,
      )
      .join('');
    return `  <url><loc>${xml(loc)}</loc>${links}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${rows.join('\n')}\n</urlset>\n`;
}

/* ── 구조화 데이터(schema.org JSON-LD) ────────────────────── */

/** 회사 개체의 @id. 공식 주소가 있으면 그 주소, 없으면 사이트 홈 */
export const orgId = (home) => `${ORG.url ?? home}#organization`;
export const websiteId = (home) => `${home}#website`;

/** @param {string} home 사이트 홈의 절대 주소(끝 / 포함) */
export function organization(home) {
  return {
    '@type': 'Organization',
    '@id': orgId(home),
    name: ORG.name,
    alternateName: ORG.alternateName,
    ...(ORG.url ? { url: ORG.url } : {}),
    ...(ORG.logo ? { logo: ORG.logo } : {}),
    ...(ORG.sameAs.length ? { sameAs: ORG.sameAs } : {}),
  };
}

/**
 * 사이트 개체. 한 주소에는 하나만 둔다(소개 사이트와 문서가 같은 묶음이면 같은 값을 낸다).
 * @param {string} home
 * @param {{ name: string, alternateName?: string[], description: string, inLanguage: string | string[] }} site
 */
export function website(home, site) {
  return {
    '@type': 'WebSite',
    '@id': websiteId(home),
    url: home,
    name: site.name,
    ...(site.alternateName?.length ? { alternateName: site.alternateName } : {}),
    description: site.description,
    inLanguage: site.inLanguage,
    publisher: { '@id': orgId(home) },
  };
}

/** Trellis 사이트 개체(소개 사이트 · 문서 공통) */
export const trellisWebsite = (home) =>
  website(home, {
    name: TRELLIS.name,
    alternateName: TRELLIS.alternateName,
    description: TRELLIS.about.ko,
    inLanguage: ['ko', 'en'],
  });

/** @param {{ name: string, url: string }[]} items 홈부터 지금 페이지까지 */
export function breadcrumbList(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** 개체 여러 개 → <script type="application/ld+json">에 넣을 글. 빈 값은 뺀다 */
export function jsonLd(...nodes) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes.flat().filter(Boolean),
  }).replace(/</g, '\\u003c');
}

/* ── 글자 수 ──────────────────────────────────────────────── */

/** 검색 결과에서 차지하는 폭. 한글 · 한자 · 전각은 2, 그 밖은 1 */
export function displayWidth(text) {
  let w = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0) ?? 0;
    w +=
      (c >= 0x1100 && c <= 0x115f) ||
      (c >= 0x2e80 && c <= 0xa4cf) ||
      (c >= 0xac00 && c <= 0xd7a3) ||
      (c >= 0xf900 && c <= 0xfaff) ||
      (c >= 0xfe30 && c <= 0xfe4f) ||
      (c >= 0xff00 && c <= 0xff60) ||
      (c >= 0xffe0 && c <= 0xffe6)
        ? 2
        : 1;
  }
  return w;
}

/**
 * 첫 문단에서 문장 단위로 끊은 설명. 글자 수(max)를 넘기 전의 문장까지만 쓴다.
 * 첫 문장이 max보다 길면 낱말 경계에서 끊고 말줄임표를 붙인다.
 * @param {string} text
 * @param {number} max
 */
export function firstSentences(text, max) {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const sentences = flat.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) ?? [flat];
  let out = '';
  for (const s of sentences) {
    if ((out + s).trim().length > max) break;
    out += s;
  }
  out = out.trim();
  if (out) return out;
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), Math.floor(max / 2))).trim()}…`;
}
