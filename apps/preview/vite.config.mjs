// 단일 HTML 빌드(D-4). 폰트·CSS·JS를 전부 preview.html 하나에 인라인한다.
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input: 'preview.html' },
  },
});
