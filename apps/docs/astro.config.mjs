// Trellis 문서 사이트 — https://trellis.terracelab.co.kr (D-41 Starlight · D-45 서브도메인)
// 다른 주소에 올릴 때는 SITE_URL(원본) · SITE_BASE(경로, 예 /trellis/)로 받는다(D-148). 없으면 위 주소의 루트다.
import { readFileSync } from 'node:fs';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { TRELLIS, robotsMeta } from '@terracelab/seo';
import { defineConfig } from 'astro/config';

/** 넓은 본문 표만 키보드로 스크롤하게 하는 작은 스크립트(src/markdown/table-scroll.js). 모든 페이지 head에 인라인 */
const TABLE_SCROLL = readFileSync(
  new URL('./src/markdown/table-scroll.js', import.meta.url),
  'utf8',
);

/** 사이트가 놓이는 경로. 아이콘 링크처럼 Starlight가 붙여 주지 않는 주소에 쓴다 */
const BASE = (process.env.SITE_BASE ?? '/').replace(/\/?$/, '/');

/**
 * 검색 · 답변 엔진 값(SEO · AEO · GEO). 모든 페이지에 같은 것만 여기서 넣고,
 * 페이지마다 다른 것(구조화 데이터 · 마크다운 짝 · 언어별 값)은 src/routeMiddleware.ts가 넣는다.
 * 값은 소개 사이트와 같은 곳에서 온다(@terracelab/seo). 그림은 apps/site/scripts/og.mjs가 만든다
 */
const ORIGIN = (process.env.SITE_URL ?? 'https://trellis.terracelab.co.kr').replace(/\/$/, '');
const OG_IMAGE = `${ORIGIN}${BASE}og.png`;

/** 사이드바 라벨(한국어 → 영어). 영어 페이지 주소는 Starlight가 /en/…으로 바꿔 준다 */
const item = (label, en, slug) => ({ label, translations: { en }, slug });

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://trellis.terracelab.co.kr',
  // 본문 링크의 경로는 sync-content.mjs(생성 문서)와 src/lib/site.ts(컴포넌트 · 404)가 붙인다
  base: BASE,
  integrations: [
    starlight({
      title: 'Trellis',
      // 설명이 없는 페이지(404)에 쓰는 기본 설명. 영어 페이지는 routeMiddleware가 영어로 바꾼다
      description: TRELLIS.about.ko,
      // 한국어가 루트(기존 주소 그대로), 영어는 /en/…(PR-12). 영어 본문은 sync-content.mjs가
      // packages/contracts/src/<Name>/spec.en.md · docs/guides/en/*.md에서 만든다
      defaultLocale: 'root',
      locales: {
        root: { label: '한국어', lang: 'ko' },
        en: { label: 'English', lang: 'en' },
      },
      favicon: '/favicon.svg',
      components: { Hero: './src/components/BrandHero.astro' },
      // 영어 사이드바의 /llms.txt · /api 링크를 /en/ 없이(언어와 관계없는 파일)
      routeMiddleware: './src/routeMiddleware.ts',
      lastUpdated: false,
      customCss: [
        '@terracelab/trellis-tokens/fonts.css',
        '@terracelab/trellis-tokens/tokens.css',
        '@terracelab/trellis-react/styles.css',
        './src/styles/starlight.css',
        './src/styles/site.css',
      ],
      head: [
        { tag: 'meta', attrs: { name: 'robots', content: robotsMeta() } },
        { tag: 'meta', attrs: { property: 'og:image', content: OG_IMAGE } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: OG_IMAGE } },
        // 아이콘 파일은 apps/site/scripts/favicons.mjs가 만든다(D-149). favicon.svg는 위 favicon 옵션이 건다
        { tag: 'link', attrs: { rel: 'icon', href: `${BASE}favicon.ico`, sizes: '32x32' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: `${BASE}apple-touch-icon.png` } },
        { tag: 'script', content: TABLE_SCROLL },
      ],
      sidebar: [
        {
          label: '시작하기',
          translations: { en: 'Get started' },
          items: [
            item('소개', 'Overview', 'docs/guide/overview'),
            item('설치', 'Installation', 'docs/guide/install'),
            item('CSS · 테마 · 밀도', 'CSS, themes and density', 'docs/guide/setup'),
            item('서비스 시작하기', 'Starting a service', 'docs/guide/service'),
            item('회사별 테마', 'Company themes', 'docs/guide/theme'),
            item('에이전트로 개발하기', 'Developing with agents', 'docs/guide/agents'),
          ],
        },
        {
          label: '기초',
          translations: { en: 'Foundations' },
          items: [
            item('원칙과 규칙', 'Principles and rules', 'docs/guide/principles'),
            item('문구', 'Content', 'docs/guide/content'),
            item('토큰', 'Tokens', 'docs/foundations/tokens'),
            item('모듈과 타일', 'Modules and tiles', 'docs/foundations/modules'),
          ],
        },
        {
          label: '컴포넌트',
          translations: { en: 'Components' },
          items: [{ autogenerate: { directory: 'docs/components' } }],
        },
        {
          label: '패턴',
          translations: { en: 'Patterns' },
          items: [
            item('차트 고르기', 'Choosing a chart', 'docs/guide/charts'),
            item('화면 패턴', 'Screen patterns', 'docs/guide/patterns'),
            item('대시보드 만들기', 'Building dashboards', 'docs/guide/dashboards'),
            item('에이전트 대화 화면', 'Agent conversation screens', 'docs/guide/conversation'),
          ],
        },
        {
          label: '리소스',
          translations: { en: 'Resources' },
          items: [
            item('버전 정책', 'Version policy', 'docs/guide/versions'),
            item('변경 이력', 'Changelog', 'docs/changelog'),
            item('Figma 라이브러리', 'Figma library', 'docs/guide/figma'),
            { label: 'llms.txt', link: '/llms.txt' },
            { label: 'manifest.json', link: '/api/latest/manifest.json' },
            {
              label: '테라스원',
              translations: { en: 'Terrace One' },
              link: 'https://one.terracelab.co.kr',
            },
          ],
        },
      ],
    }),
    react(),
  ],
  vite: { resolve: { dedupe: ['react', 'react-dom'] } },
});
