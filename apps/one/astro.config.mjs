// 테라스원 제품 소개 — https://one.terracelab.co.kr (D-45). 화면 조각은 apps/preview(쇼케이스·업무 홈)를 재사용한다.
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://one.terracelab.co.kr',
  integrations: [react()],
  vite: { resolve: { dedupe: ['react', 'react-dom'] } },
});
