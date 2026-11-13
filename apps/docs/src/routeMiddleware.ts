// 페이지마다 head와 사이드바를 고친다.
// 1) 사이드바의 /llms.txt · /llms-full.txt · /api/…는 언어와 관계없는 파일 하나다. Starlight는 영어 페이지의
//    사이드바 링크에 /en/을 붙이므로(/en/llms.txt → 404) 원래 주소로 되돌린다. 이전 · 다음 링크도 같다.
// 2) 검색 · 답변 엔진 값(D-152): 페이지별 구조화 데이터, 마크다운 짝, 언어별 og:locale · 기본 설명.
//    모든 페이지에 같은 값(robots · 공유 그림)은 astro.config.mjs의 head가 넣는다.
import {
  ROBOTS_CLOSED,
  TRELLIS,
  breadcrumbList,
  jsonLd,
  orgId,
  organization,
  trellisWebsite,
  verificationMeta,
  websiteId,
} from '@terracelab/seo';
import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';

// 사이트가 /trellis/ 같은 경로 아래에 놓이면(SITE_BASE) 링크는 /trellis/en/llms.txt 꼴이다. 경로를 떼고 본 뒤 다시 붙인다.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const SHARED = /^\/[a-z]{2}(?:-[A-Za-z]+)?(\/(?:llms(?:-full)?\.txt|api\/.*))$/;
function unlocalize(href: string) {
  if (BASE && !href.startsWith(`${BASE}/`)) return href;
  const shared = SHARED.exec(href.slice(BASE.length))?.[1];
  return shared ? BASE + shared : href;
}

type Entry = StarlightRouteData['sidebar'][number];
function fix(entries: Entry[]) {
  for (const e of entries) {
    if (e.type === 'link') e.href = unlocalize(e.href);
    else fix(e.entries);
  }
}

/** 사이트 홈의 절대 주소(끝 /). 소개 사이트와 한 묶음으로 나가도 같은 주소라 사이트 개체가 하나로 모인다 */
const HOME = new URL(`${BASE}/`, import.meta.env.SITE).href;
const TEXT = {
  ko: { home: HOME, locale: 'ko_KR', other: 'en_US', docs: '문서', components: '컴포넌트' },
  en: {
    home: `${HOME}en/`,
    locale: 'en_US',
    other: 'ko_KR',
    docs: 'Docs',
    components: 'Components',
  },
} as const;

/** 한국어 문서 페이지 → 같은 내용의 마크다운(동봉 문서, /api/latest/…). 에이전트가 HTML 대신 읽는다 */
function markdownOf(slug: string, title: string) {
  const [, section, name] = /^docs\/([^/]+)(?:\/(.+))?$/.exec(slug) ?? [];
  if (section === 'components' && name) return `components/${title}.md`;
  if (section === 'guide' && name) return `guides/${name}.md`;
  if (section === 'foundations' && name === 'tokens') return 'tokens.md';
  if (section === 'changelog') return 'CHANGELOG.md';
  return null;
}

type Head = StarlightRouteData['head'];
const meta = (head: Head, key: 'name' | 'property', value: string) =>
  head.find((h) => h.tag === 'meta' && h.attrs?.[key] === value);

function seo(route: StarlightRouteData) {
  const { head } = route;
  const lang = route.lang === 'en' ? 'en' : 'ko';
  const t = TEXT[lang];
  const slug = route.id.replace(/^en(\/|$)/, '');
  const { title, description } = route.entry.data;
  const canonical = head.find((h) => h.tag === 'link' && h.attrs?.rel === 'canonical')?.attrs?.href;

  // Starlight는 og:locale에 언어 코드만 넣는다(ko). Open Graph는 언어_지역(ko_KR)을 받는다
  const locale = meta(head, 'property', 'og:locale');
  if (locale?.attrs) locale.attrs.content = t.locale;
  head.push(
    { tag: 'meta', attrs: { property: 'og:locale:alternate', content: t.other } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: TRELLIS.imageAlt[lang] } },
  );

  // 설명이 없는 페이지는 설정의 기본 설명(한국어)을 받는다. 영어 페이지는 영어로 바꾼다
  if (!description && lang === 'en')
    for (const tag of [meta(head, 'name', 'description'), meta(head, 'property', 'og:description')])
      if (tag?.attrs) tag.attrs.content = TRELLIS.about.en;

  if (slug === '') for (const m of verificationMeta()) head.push({ tag: 'meta', attrs: m });

  // 없는 주소 안내 페이지는 색인이 열려도 검색에 나오면 안 된다
  const robots = meta(head, 'name', 'robots');
  if (slug === '404' && robots?.attrs) robots.attrs.content = ROBOTS_CLOSED;

  const nodes = [organization(HOME), trellisWebsite(HOME)];
  if (typeof canonical === 'string' && slug.startsWith('docs/')) {
    const markdown = lang === 'ko' ? markdownOf(slug, title) : null;
    if (markdown)
      head.push({
        tag: 'link',
        attrs: {
          rel: 'alternate',
          type: 'text/markdown',
          href: `${BASE}/api/latest/${markdown}`,
          title: 'Markdown',
        },
      });

    const inComponents = slug.startsWith('docs/components');
    const section = {
      name: inComponents ? t.components : t.docs,
      url: `${t.home}${inComponents ? 'docs/components/' : 'docs/guide/overview/'}`,
    };
    nodes.push(
      breadcrumbList([
        { name: TRELLIS.name, url: t.home },
        ...(section.url === canonical ? [] : [section]),
        { name: title, url: canonical },
      ]),
      {
        '@type': 'TechArticle',
        '@id': `${canonical}#article`,
        url: canonical,
        mainEntityOfPage: canonical,
        headline: title,
        ...(description ? { description } : {}),
        inLanguage: lang,
        image: new URL(`${BASE}/og.png`, import.meta.env.SITE).href,
        isPartOf: { '@id': websiteId(HOME) },
        about: { '@id': `${HOME}#software` },
        author: { '@id': orgId(HOME) },
        publisher: { '@id': orgId(HOME) },
      },
    );
  }
  head.push({ tag: 'script', attrs: { type: 'application/ld+json' }, content: jsonLd(nodes) });
}

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  fix(route.sidebar);
  for (const link of [route.pagination.prev, route.pagination.next])
    if (link) link.href = unlocalize(link.href);
  seo(route);
});
