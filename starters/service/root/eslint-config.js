// @ts-check
// (시작 템플릿에서는 eslint-config.js, create-service가 eslint.config.js로 바꿔 둔다)
// 서비스 린트: JS · TS 기본 규칙 + Trellis 규칙(토큰 밖 색 · px · 글꼴, primitive 토큰 참조).
// Trellis 규칙 플러그인은 하위 모듈(trellis/packages/eslint-plugin-trellis)에서 온다. pnpm ds:doctor와 pnpm check가 나머지를 본다
import js from '@eslint/js';
import trellis, { tokenRules } from '@terracelab/eslint-plugin-trellis';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['trellis/', '**/dist/', '**/node_modules/', 'check-results/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // 앱 소스(복사한 블록 포함). theme.css 같은 생성물은 CSS라 여기 들지 않는다
    files: ['apps/*/src/**/*.{ts,tsx,js,jsx}'],
    plugins: { trellis },
    rules: tokenRules,
  },
]);
