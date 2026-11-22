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
| `@terracelab/trellis-skill` (agent skill and check tool) | Published. Run it with `npx`, no install needed |
| `@terracelab/trellis-blocks` (screen blocks) | Not published. Use the git submodule |

## Agent skill and check tool

Run these from the root of your service repository.

```bash
npx @terracelab/trellis-skill install        # puts the agent skill in .claude/skills/trellis/
npx @terracelab/trellis-skill doctor         # checks the install, CSS order, font and values outside tokens
npx @terracelab/trellis-skill add dashboard  # copies the dashboard starter screen to src/dashboard/
```

`doctor` finds missing packages and CSS imports and prints the command and lines to add. The commands are described in [Developing with agents](agents.md).

## Use the git submodule

To copy screen blocks or to fix Trellis in place while you build a service, add Trellis to your service repository as a submodule and join it to the same pnpm workspace. The source is in the GitHub repository `terracelab/trellis`. The steps are in [Starting a service](service.md).

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
