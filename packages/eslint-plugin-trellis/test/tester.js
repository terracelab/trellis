// RuleTester를 vitest에 붙이고, 케이스마다 TSX 파일 이름을 기본으로 준다.
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { afterAll, describe, it } from 'vitest';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

export const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const withFile = (c) =>
  typeof c === 'string'
    ? { code: c, filename: 'Component.tsx' }
    : { filename: 'Component.tsx', ...c };

/** 케이스마다 filename이 없으면 Component.tsx(JSX 파싱) */
export const tsx = ({ valid, invalid }) => ({
  valid: valid.map(withFile),
  invalid: invalid.map(withFile),
});
