// 테라스원 소개는 한 페이지다. 사이트맵은 그 한 주소만 알린다.
import type { APIRoute } from 'astro';
import { sitemapXml } from '@terracelab/seo';

export const GET: APIRoute = ({ site }) =>
  new Response(sitemapXml([new URL('/', site).href]), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
