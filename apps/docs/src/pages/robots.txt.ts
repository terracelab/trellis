// 공개 범위 승인(GD) 전에는 색인을 막는다. 배포 환경에서 SITE_INDEXABLE=1이면 허용 + 사이트맵.
// 소개 사이트와 한 묶음으로 나갈 때는 소개 사이트의 robots.txt가 이 파일을 대신한다(같은 함수로 만든다).
import type { APIRoute } from 'astro';
import { robotsTxt } from '@terracelab/seo';

export const GET: APIRoute = ({ site }) => {
  // 사이트가 경로 아래에 놓이면(SITE_BASE) 사이트맵도 그 경로에 있다
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const body = robotsTxt({
    sitemaps: site ? [new URL(`${base}sitemap-index.xml`, site).href] : [],
  });
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
