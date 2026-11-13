// 데모는 사이트의 /demo/ 아래에 놓인다(apps/one · apps/site 빌드가 dist를 복사한다). 라우팅은 해시(#/…)라 서버 설정이 필요 없다.
// 사이트가 도메인 루트가 아닌 경로에 놓이면 SITE_BASE(예 /trellis/)를 받아 /trellis/demo/가 된다(D-148).
import { defineConfig } from 'vite';

const SITE_BASE = (process.env.SITE_BASE ?? '/').replace(/\/?$/, '/');
const SITE_URL = (process.env.SITE_URL ?? 'https://trellis.terracelab.co.kr').replace(/\/$/, '');

/**
 * 링크를 메신저에 붙였을 때 보이는 미리보기(Open Graph). 데모는 색인에서 빠져 있지만(noindex) 링크는 주고받는다.
 * 미리보기를 읽는 쪽은 절대 주소만 받으므로 빌드 때 배포 주소(SITE_URL · SITE_BASE)로 채운다.
 * 그림(public/og.jpg)은 apps/site/scripts/og.mjs가 데모 화면에서 만든다(D-152).
 */
function shareCard() {
  const url = `${SITE_URL}${SITE_BASE}demo/`;
  const meta = (key, name, content) => ({ tag: 'meta', attrs: { [key]: name, content } });
  return {
    name: 'trellis-demo-share-card',
    transformIndexHtml(html) {
      const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
      const description = /<meta\s+name="description"\s+content="([^"]*)"/.exec(html)?.[1] ?? '';
      return [
        meta('property', 'og:title', title),
        meta('property', 'og:description', description),
        meta('property', 'og:url', url),
        meta('property', 'og:type', 'website'),
        meta('property', 'og:locale', 'ko_KR'),
        meta('property', 'og:image', `${url}og.jpg`),
        meta('property', 'og:image:width', '1200'),
        meta('property', 'og:image:height', '630'),
        meta('property', 'og:image:alt', '테라스원 데모의 무역 회사 대시보드 화면'),
        meta('name', 'twitter:card', 'summary_large_image'),
        meta('name', 'twitter:image', `${url}og.jpg`),
      ].map((tag) => ({ ...tag, injectTo: 'head' }));
    },
  };
}

export default defineConfig({
  base: `${SITE_BASE}demo/`,
  plugins: [shareCard()],
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 1200 },
  resolve: { dedupe: ['react', 'react-dom'] },
});
