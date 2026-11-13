// '@terracelab/source' 조건: 개발 서버와 빌드가 Trellis 소스(trellis/packages/*/src)를 바로 읽는다.
// trellis/ 안에서 컴포넌트를 고치면 다시 빌드하지 않아도 화면에 바로 보인다. 토큰 값은 pnpm ds:build 뒤 반영
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    conditions: ['@terracelab/source', 'module', 'browser', 'development|production'],
    dedupe: ['react', 'react-dom', 'react-router'],
  },
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 1500 },
});
