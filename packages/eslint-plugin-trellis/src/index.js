// @terracelab/eslint-plugin-trellis — CLAUDE.md 절대 규칙 중 eslint로 지키는 것(components.md §5).
// CSS 파일은 stylelint.config.js가 본다.
import dependencyDirection from './rules/dependency-direction.js';
import noFontFamily from './rules/no-font-family.js';
import noPrimitiveToken from './rules/no-primitive-token.js';
import noPx from './rules/no-px.js';
import noRawColor from './rules/no-raw-color.js';

const plugin = {
  meta: { name: '@terracelab/eslint-plugin-trellis', version: '1.0.0' },
  rules: {
    'no-raw-color': noRawColor,
    'no-px': noPx,
    'no-font-family': noFontFamily,
    'no-primitive-token': noPrimitiveToken,
    'dependency-direction': dependencyDirection,
  },
};

/** 토큰 밖 값 4규칙(컴포넌트 · 블록 · 앱 코드) */
export const tokenRules = {
  'trellis/no-raw-color': 'error',
  'trellis/no-px': 'error',
  'trellis/no-font-family': 'error',
  'trellis/no-primitive-token': 'error',
};

export default plugin;
