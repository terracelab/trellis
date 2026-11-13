// 공개 범위 승인(GD) 전에는 색인을 막는다. 배포 환경에서 SITE_INDEXABLE=1이면 허용하고 사이트맵 입구 하나를 알린다.
// 이 파일은 호스트 루트에 놓일 때만 크롤러가 읽는다. /trellis/ 같은 경로 아래에 올린 묶음은 호스트 루트의
// robots.txt가 정하므로, 배포 스크립트(scripts/deploy.mjs)가 둘이 어긋나면 알리고 --root-robots로 맞춘다.
import type { APIRoute } from 'astro';
import { robotsTxt } from '@terracelab/seo';
import { to } from '../lib/site';

export const GET: APIRoute = ({ site }) => {
  const body = robotsTxt({ sitemaps: [new URL(to('sitemap-index.xml'), site).href] });
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
