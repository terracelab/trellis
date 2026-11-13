// 자리(placeholder). 토큰 밖 값 금지 규칙은 P1-03에서 docs/spec/components.md §5대로 채운다.
/** @type {import('stylelint').Config} */
export default {
  plugins: ['./scripts/stylelint/hover-transition.mjs'],
  ignoreFiles: [
    '**/dist/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/storybook-static/**',
    '**/__snapshots__/**',
  ],
  rules: {
    'color-no-invalid-hex': true,
  },
  overrides: [
    {
      // 미리보기는 P1-03 전에 먼저 생겨서 components.md §5의 핵심 규칙만 미리 건다(D-33).
      files: ['apps/preview/**/*.css'],
      rules: {
        'color-no-hex': true,
        'color-named': 'never',
        'function-disallowed-list': [
          'rgb',
          'rgba',
          'hsl',
          'hsla',
          'hwb',
          'lab',
          'lch',
          'oklab',
          'oklch',
        ],
        'unit-disallowed-list': [
          ['px'],
          { ignoreMediaFeatureNames: { px: ['width', 'min-width', 'max-width'] } },
        ],
        'declaration-property-value-allowed-list': {
          'font-family': ['/^var\\(--tl-/'],
          font: ['inherit'],
        },
        // 미리보기 자체 클래스는 tl-preview-*, 실제 컴포넌트(react 패키지) 클래스를 덮어쓸 때는 tl-<kebab>(__part)
        'selector-class-pattern': '^tl-(preview(-[a-z0-9]+)*|[a-z0-9-]+(__[a-z0-9-]+)?)$',
      },
    },
    {
      // 사이트(apps/docs · apps/one · apps/site): 미리보기와 같은 규칙. 사이트 클래스는 tl-site-*, Starlight 변수(--sl-*)는 값이 var(--tl-*)일 때만
      // Storybook 미리보기(apps/storybook)도 같은 규칙, 자체 클래스는 tl-storybook-*
      files: [
        'apps/docs/**/*.css',
        'apps/one/**/*.css',
        'apps/site/**/*.css',
        'apps/demo/**/*.css',
        'apps/storybook/**/*.css',
        'blocks/**/*.css',
      ],
      rules: {
        'color-no-hex': true,
        'color-named': 'never',
        'function-disallowed-list': [
          'rgb',
          'rgba',
          'hsl',
          'hsla',
          'hwb',
          'lab',
          'lch',
          'oklab',
          'oklch',
        ],
        'unit-disallowed-list': [
          ['px'],
          { ignoreMediaFeatureNames: { px: ['width', 'min-width', 'max-width'] } },
        ],
        'declaration-property-value-allowed-list': {
          'font-family': ['/^var\\(--tl-/'],
          font: ['inherit'],
        },
        'selector-class-pattern': '^(tl-[a-z0-9-]+(__[a-z0-9-]+)?|sl-[a-z0-9-]+)$',
      },
    },
    {
      // react 패키지 컴포넌트 CSS: components.md §5의 핵심 규칙(선행 적용, P1-03에서 플러그인으로 정식화)
      files: ['packages/react/src/**/*.css'],
      rules: {
        'color-no-hex': true,
        'color-named': 'never',
        'function-disallowed-list': [
          'rgb',
          'rgba',
          'hsl',
          'hsla',
          'hwb',
          'lab',
          'lch',
          'oklab',
          'oklch',
        ],
        'unit-disallowed-list': [
          ['px'],
          { ignoreMediaFeatureNames: { px: ['width', 'min-width', 'max-width'] } },
        ],
        'declaration-property-value-allowed-list': {
          'font-family': ['/^var\\(--tl-/'],
          font: ['inherit'],
        },
        'selector-class-pattern': '^(tl-[a-z0-9-]+(__[a-z0-9-]+)?|recharts-[a-z0-9-]+)$',
        // hover가 색을 바꾸면 transition(PR-26, components.md §8 상태 전환)
        'trellis/hover-transition': true,
      },
    },
    {
      // primitive 색 변수 직접 참조 금지(CLAUDE.md 절대 규칙, eslint trellis/no-primitive-token과 같은 기준).
      // primitive를 정의하는 packages/tokens는 빠진다. brand는 숫자 단계만 primitive(brand-default 등은 semantic).
      // 미리보기(apps/preview)는 현재 값을 그대로 보여 주는 명세 페이지라 예외(D-33)
      files: [
        'packages/react/src/**/*.css',
        'apps/!(preview)/**/*.css',
        'blocks/**/*.css',
        'starters/*/app/**/*.css',
      ],
      rules: {
        'declaration-property-value-disallowed-list': [
          {
            '/.*/': [
              '/--tl-color-(alpha|base|cvd)-/',
              '/--tl-color-(brand|neutral|graphite|blue|red|green|amber|violet|teal|shell)-[0-9]+(?![\\w-])/',
              // 움직임은 의미 이름만(PR-26): duration.fast · normal · slow · slower · spin · pulse, easing.standard · enter · exit
              '/--tl-duration-[0-9]+(?![\\w-])/',
              '/--tl-easing-(decelerate|accelerate)(?![\\w-])/',
            ],
          },
          {
            message: (property, value) =>
              /--tl-(duration|easing)-/.test(value)
                ? `숫자 움직임 변수를 직접 쓴다(${property}: ${value}). --tl-duration-fast · normal · slow · slower · spin · pulse와 --tl-easing-standard · enter · exit를 쓴다`
                : `primitive 색 변수를 직접 쓴다(${property}: ${value}). semantic 변수(--tl-color-bg-* · fg-* · brand-default · status-* …)를 쓰고, 없으면 토큰 PR을 먼저 낸다`,
          },
        ],
      },
    },
  ],
};
