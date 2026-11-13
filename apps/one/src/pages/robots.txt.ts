// 공개 범위 승인(GD) 전에는 색인을 막는다. 배포 환경에서 SITE_INDEXABLE=1이면 허용하고 사이트맵을 알린다.
import type { APIRoute } from 'astro';
import { robotsTxt } from '@terracelab/seo';

export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt({ sitemaps: [new URL('/sitemap.xml', site).href] }), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
