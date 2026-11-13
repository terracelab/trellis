// 소개 사이트 페이지 목록(사이트맵). 목록은 손으로 적지 않고 src/pages의 index.astro에서 모은다.
// 묶음을 조립할 때(scripts/assemble.mjs) 문서의 sitemap-index.xml에 이 파일이 더해져 사이트맵 입구가 하나가 된다.
// 404는 index.astro가 아니라 빠지고, 데모(noindex)는 다른 앱이라 여기에 없다.
import type { APIRoute } from 'astro';
import { sitemapXml } from '@terracelab/seo';
import { LINKS, to } from '../lib/site';

const PAGES = Object.keys(import.meta.glob('./**/index.astro'))
  .map((file) => file.replace(/^\.\//, '').replace(/index\.astro$/, ''))
  .sort();

export const GET: APIRoute = ({ site }) => {
  const abs = (path: string) => new URL(path, site).href;
  const urls = PAGES.map((path) =>
    path === ''
      ? {
          loc: abs(LINKS.home),
          alternates: [
            { hreflang: 'ko', href: abs(LINKS.home) },
            { hreflang: 'en', href: abs(LINKS.english) },
          ],
        }
      : abs(to(path)),
  );
  return new Response(sitemapXml(urls), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
