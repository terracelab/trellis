// Trellis 소개 사이트(D-148). 문서(apps/docs) · 데모(apps/demo)와 한 묶음으로 정적 호스팅에 올린다.
// 주소는 환경 변수로 받는다: SITE_URL(원본, 예 https://terracelab.github.io) · SITE_BASE(경로, 예 /trellis/).
// 둘 다 없으면 도메인 루트 기준으로 만든다(로컬 · 커스텀 도메인).
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

const base = (process.env.SITE_BASE ?? '/').replace(/\/?$/, '/');

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://trellis.terracelab.co.kr',
  base,
  trailingSlash: 'always',
  integrations: [react()],
  vite: { resolve: { dedupe: ['react', 'react-dom'] } },
});
