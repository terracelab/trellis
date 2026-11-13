# Installation

## Install from npm

```bash
pnpm add @terracelab/trellis-tokens @terracelab/trellis-react
```

You do not need an `.npmrc` or a token. `@terracelab/trellis-icons` and `@terracelab/trellis-contracts` come in with the react package. If your app code calls the formatting functions (`formatAmount` and others) directly, add contracts as well.

```bash
pnpm add @terracelab/trellis-contracts
```

| Package | npm |
| --- | --- |
| `@terracelab/trellis-tokens` · `icons` · `contracts` · `react` | Published |
| `@terracelab/trellis-blocks` (screen blocks) · `@terracelab/trellis-skill` (agent skill and check tool) | Not published. Use the git submodule |

## Use the git submodule

To copy screen blocks, to use the agent skill and the check tool (`ds:doctor`), or to fix Trellis in place while you build a service, add Trellis to your service repository as a submodule and join it to the same pnpm workspace. The source is in the GitHub repository `terracelab/trellis`. The steps are in [Starting a service](service.md).

## Requirements

- React 19 and react-dom 19 (peer). Charts bring in Recharts 3 as a bundled dependency.
- Bundler: a tool that understands ESM, such as Vite, Next.js or Astro. The packages ship ESM only.
- Install **the same version** of every `@terracelab/trellis-*` package. If you mix versions, tokens and components fall out of step.

## Check

```ts
import { formatAmount } from '@terracelab/trellis-contracts';
formatAmount(1234567, { unit: '원' }); // "1,234,567원" (원 = won)
```

Next: [CSS, themes and density](setup.md)
