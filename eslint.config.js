// @ts-check
import js from '@eslint/js';
import trellis, { tokenRules } from '@terracelab/eslint-plugin-trellis';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const CODE = '*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}';

/** 컴포넌트 · 블록 · 앱 소스: 토큰 밖 값 금지(components.md §5). tokens 패키지는 primitive를 정의하는 곳이라 빠진다 */
const COMPONENT_SOURCES = [
  'packages/react/src',
  'packages/native/src',
  'packages/contracts/src',
  'packages/icons/src',
  'blocks/src',
  'apps/*/src',
  'starters/*/app/src',
].map((dir) => `${dir}/**/${CODE}`);

/** 의존 방향은 워크스페이스 전부(테스트 · 스크립트 포함) */
const WORKSPACE = [
  'packages/{tokens,icons,contracts,react,native}',
  'blocks',
  'apps/*',
  'starters/*/app',
  'templates',
].map((dir) => `${dir}/**/${CODE}`);

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/coverage/**',
    '**/.turbo/**',
    '**/storybook-static/**',
    '**/node_modules/**',
    '**/__snapshots__/**',
    '**/.astro/**',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: COMPONENT_SOURCES,
    ignores: ['**/*.test.*', '**/test/**', '**/__tests__/**'],
    plugins: { trellis },
    rules: tokenRules,
  },
  {
    // 미리보기는 현재 값을 그대로 보여 주는 명세 페이지라 primitive 색을 직접 쓴다(D-33)
    files: ['apps/preview/**'],
    rules: { 'trellis/no-primitive-token': 'off' },
  },
  {
    files: WORKSPACE,
    plugins: { trellis },
    rules: { 'trellis/dependency-direction': 'error' },
  },
  {
    // 예시(<Name>.examples.tsx)는 패키지 entry로 나가지 않아 소스 경로로 가져온다: 생성 스토리(gitignore),
    // 문서 사이트 라이브 예시, 소개 사이트의 예시 그림(빌드 때 서버에서만 그린다).
    // 라이브 예시는 예시와 같은 소스 모듈의 TrellisProvider를 써야 문구 사전이 하나로 이어진다
    files: [
      'apps/storybook/generated/**',
      'apps/docs/src/components/LiveExample.tsx',
      'apps/site/src/lib/examples.ts',
    ],
    rules: { 'trellis/dependency-direction': 'off' },
  },
]);
