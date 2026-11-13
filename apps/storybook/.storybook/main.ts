// Storybook 설정. 스토리는 scripts/gen-stories.mjs가 generated/에 만든다(손으로 쓰지 않는다).
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const REACT_SRC = fileURLToPath(new URL('../../../packages/react/src/', import.meta.url));

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../generated/*.stories.tsx'],
  addons: ['@storybook/addon-a11y'],
  // 외부 네트워크 0: 원격 측정 · 새 소식 알림을 끈다. 바탕은 테마 툴바가 정하므로 backgrounds도 끈다
  core: { disableTelemetry: true, disableWhatsNewNotifications: true },
  features: { backgrounds: false },
  // props 표는 contract가 원본(components.md §6)이라 react-docgen을 돌리지 않는다
  typescript: { reactDocgen: false },
  viteFinal: (vite) =>
    mergeConfig(vite, {
      // @terracelab/trellis-react는 소스로 읽는다. 예시가 소스 컴포넌트를 상대 경로로 가져오므로 같은 모듈
      // 하나만 있어야 Matrix의 요소 찾기 · TrellisProvider 문맥(locale)이 맞는다. CSS도 소스(고치면 바로 보인다).
      // tokens · icons · contracts는 dist(빌드 생성물에 의존하는 소스 파일이 있어 turbo 캐시와 어긋날 수 있다)
      resolve: {
        alias: [
          { find: /^@terracelab\/trellis-react$/, replacement: `${REACT_SRC}index.ts` },
          {
            find: /^@terracelab\/trellis-react\/charts$/,
            replacement: `${REACT_SRC}charts/index.ts`,
          },
          {
            find: /^@terracelab\/trellis-react\/styles\.css$/,
            replacement: `${REACT_SRC}styles.css`,
          },
        ],
        dedupe: ['react', 'react-dom'],
      },
      build: {
        // 모든 컴포넌트 · 예시가 한 미리보기에 들어간다(정적 빌드는 VRT · 검토용)
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
          // Base UI 파일 머리의 'use client'는 번들에서 의미가 없다(경고 수백 줄을 숨긴다)
          onwarn(warning, warn) {
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
            warn(warning);
          },
        },
      },
    }),
};

export default config;
