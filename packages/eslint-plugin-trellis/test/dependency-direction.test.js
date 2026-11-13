import { fileURLToPath } from 'node:url';
import rule from '../src/rules/dependency-direction.js';
import { tester, tsx } from './tester.js';

// fixtures/repo: 이름만 있는 package.json 트리(tokens · icons · contracts · react · native · blocks · apps/demo)
const at = (path) => fileURLToPath(new URL(`./fixtures/repo/${path}`, import.meta.url));

const LAYER = {
  tokens: '@terracelab/trellis-tokens',
  icons: '@terracelab/trellis-icons',
  contracts: '@terracelab/trellis-contracts',
  react: '@terracelab/trellis-react',
  native: '@terracelab/trellis-native',
  blocks: '@terracelab/trellis-blocks',
};
/** reverse 메시지 data */
const reverse = (fromLayer, to, toLayer) => ({
  messageId: 'reverse',
  data: { from: LAYER[fromLayer], fromLayer, to, toLayer },
});

tester.run(
  'dependency-direction',
  rule,
  tsx({
    valid: [
      {
        code: `import { tokens } from '@terracelab/trellis-tokens';\nimport { Icon } from '@terracelab/trellis-icons';\nimport type { ButtonContract } from '@terracelab/trellis-contracts';`,
        filename: at('packages/react/src/Button/Button.tsx'),
      },
      {
        code: `import { Button } from '@terracelab/trellis-react';\nimport { ICON_NAMES } from '@terracelab/trellis-icons';`,
        filename: at('blocks/src/erp/list/index.tsx'),
      },
      {
        // 앱은 아무 계층이나 가져온다
        code: `import { Journal } from '@terracelab/trellis-blocks';\nimport { Button } from '@terracelab/trellis-react';`,
        filename: at('apps/demo/src/App.tsx'),
      },
      {
        // 같은 패키지 안 상대 경로 · 자기 패키지 이름 · 저장소 루트 스크립트
        code: `import { cx } from '../_internal/cx.js';\nimport { Button } from '@terracelab/trellis-react';\nimport { buildDocs } from '../../../scripts/build-docs.mjs';`,
        filename: at('packages/react/test/docs.test.ts'),
      },
      {
        code: `import modules from '@terracelab/trellis-tokens/modules';\nimport { readFileSync } from 'node:fs';`,
        filename: at('packages/icons/scripts/module-tiles.mjs'),
      },
      {
        // 외부 패키지는 계층과 상관없다
        code: `import { useState } from 'react';`,
        filename: at('packages/react/src/a.tsx'),
      },
    ],
    invalid: [
      {
        code: `import { Button } from '@terracelab/trellis-react';`,
        filename: at('packages/contracts/src/Button/Button.contract.ts'),
        errors: [reverse('contracts', LAYER.react, 'react')],
      },
      {
        code: `import { Journal } from '@terracelab/trellis-blocks';\nexport * from '@terracelab/demo';`,
        filename: at('packages/react/src/index.ts'),
        errors: [
          reverse('react', LAYER.blocks, 'blocks'),
          reverse('react', '@terracelab/demo', 'app'),
        ],
      },
      {
        code: `import type { IconName } from '@terracelab/trellis-icons';`,
        filename: at('packages/tokens/sd/formats/web.mjs'),
        errors: [reverse('tokens', LAYER.icons, 'icons')],
      },
      {
        code: `const app = await import('@terracelab/demo/registry');`,
        filename: at('blocks/src/home/index.tsx'),
        errors: [reverse('blocks', '@terracelab/demo', 'app')],
      },
      {
        code: `import { View } from '@terracelab/trellis-native';`,
        filename: at('packages/react/src/a.tsx'),
        errors: [reverse('react', LAYER.native, 'native')],
      },
      {
        // contracts는 플랫폼 중립
        code: `import type { ReactNode } from 'react';`,
        filename: at('packages/contracts/src/Card/Card.contract.ts'),
        errors: [{ messageId: 'platform' }],
      },
      {
        // 역방향 상대 경로
        code: `import { cx } from '../../../react/src/_internal/cx.js';`,
        filename: at('packages/contracts/src/Button/Button.contract.ts'),
        errors: [reverse('contracts', LAYER.react, 'react')],
      },
      {
        // 방향은 맞아도 패키지 사이 상대 경로는 안 된다
        code: `import { Button } from '../../../packages/react/src/index.js';`,
        filename: at('apps/demo/src/App.tsx'),
        errors: [
          {
            messageId: 'relative',
            data: { to: LAYER.react, spec: '../../../packages/react/src/index.js' },
          },
        ],
      },
    ],
  }),
);
