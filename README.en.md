# Trellis

[한국어](README.md) | English

Trellis is TerraceLab's design system. TerraceLab's B2B products and the custom builds of Terrace One use it for business screens such as accounting, electronic approval, purchasing and customer management. This monorepo holds the tokens, icons, component contracts, React components, copy-in screen blocks and the docs site.

The token JSON in `packages/tokens` is the single source. Web (React), desktop (Tauri), mobile (Expo), Django and Figma all use what is generated from it.

- Docs: `trellis.terracelab.co.kr` (English pages under `/en/`). Run it locally with `pnpm --filter @terracelab/docs dev`.
- Status: version 1.0.0. `@terracelab/trellis-tokens`, `-icons`, `-contracts` and `-react` are on npm. Screen blocks, the agent skill and the check tool come with the git submodule (see below).
- Open source: Apache-2.0 ([LICENSE](LICENSE), [NOTICE](NOTICE)). The source is at `terracelab/trellis` on GitHub.

## Korean business conventions

Trellis is made for Korean business software, and some rules differ from Western defaults.

- Income is red and expense is blue (`finance.income`, `finance.expense`). In Korea, red means income or increase and blue means expense or decrease. Do not swap them.
- Amounts are in won (KRW) with thousands separators, right-aligned, for example `874,479,500원`. Use the `formatAmount` family of functions from `@terracelab/trellis-contracts`.
- Approvals have five fixed states: draft, in progress, approved, rejected and withdrawn (`draft · pending · approved · rejected · withdrawn`).
- Product copy is Korean by default. `<TrellisProvider locale="en">` switches the built-in component text (buttons, accessible names, empty states, calendars) to English. Number formats stay the same in both languages.

## Packages

All packages share one version (fixed group).

| Package | Contents |
| --- | --- |
| `@terracelab/trellis-tokens` | Tokens as CSS variables (`--tl-*`), a TS object, a Tailwind preset and Figma variables. Pretendard font files are included. Company theme generator |
| `@terracelab/trellis-icons` | UI icons and module tiles |
| `@terracelab/trellis-contracts` | Component contracts (props, states, accessibility) and specs, plus amount and date formatting |
| `@terracelab/trellis-react` | React components for the web and the bundled docs (`dist/docs`: manifest.json, llms.txt, component docs) |
| `@terracelab/trellis-native` | Expo (React Native) components with the same contracts. Planned, not published |
| `@terracelab/trellis-tailwind` | Placeholder. The Tailwind v4 theme is in `@terracelab/trellis-tokens/tailwind`. Not published |
| `@terracelab/trellis-skill` | Agent skill and checks for service repositories (`install`, `doctor`, `docs`). Runs from the git submodule, not published |
| `@terracelab/trellis-blocks` | Copy-in screen blocks, platform base types and sample data |

## Requirements

| Tool | Version |
| --- | --- |
| Node | 22.12 or later (Trellis is developed on 26) |
| pnpm | 12 |
| React | 19 |
| Tested setups | Vite 8 with TypeScript 6 (starter template), Vite 7 with TypeScript 5.9 (existing app) |

## Quick start: a new service from the starter template

```bash
# In this repository
node scripts/create-service.mjs ~/dev/Projects/my-service --title "My service"
cd ~/dev/Projects/my-service
pnpm ds:theme --preset forest        # company theme. --brand "#0B7A5C" --neutral warm also works
pnpm ds:add erp/tax/invoice-list     # copy a screen block
pnpm dev
```

This creates a Vite, React and React Router app in `apps/web` with the app shell, menu, notifications, theme and density switch and screen settings. It also adds the `trellis/` submodule and pnpm workspace, the `ds:*` scripts, a `CLAUDE.md` for the service and the agent skill in `.claude/skills/trellis/`. The first commit already has the install, Trellis build and checks done. Options: `--name <package name>`, `--submodule <git url>`, `--no-install`. The template source is [starters/service](starters/service).

## Add Trellis to an existing project

These steps assume the app is at the repository root. In a monorepo, change `src` to the app folder (for example `apps/web/src`).

**1. Submodule and workspace**

```bash
git submodule add https://github.com/terracelab/trellis.git trellis
```

Add three lines to `pnpm-workspace.yaml` (create the file if it does not exist). The `trellis` root is needed so the Trellis build tools are installed.

```yaml
packages:
  - trellis
  - trellis/packages/*
  - trellis/blocks
```

**2. package.json**

```jsonc
{
  "dependencies": {
    "@terracelab/trellis-react": "workspace:*",
    "@terracelab/trellis-tokens": "workspace:*",
    "@terracelab/trellis-icons": "workspace:*",
    "@terracelab/trellis-contracts": "workspace:*",
    "@terracelab/trellis-blocks": "workspace:*" // only if you use screen blocks
  },
  "scripts": {
    "ds:build": "pnpm --filter \"@terracelab/trellis-react...\" build",
    "ds:doctor": "node trellis/packages/skill/bin/trellis-skill.mjs doctor --app .",
    "ds:docs": "node trellis/packages/skill/bin/trellis-skill.mjs docs",
    "ds:skill": "node trellis/packages/skill/bin/trellis-skill.mjs install",
    "ds:add": "node trellis/scripts/add-block.mjs --to src/blocks",
    "ds:theme": "node trellis/packages/tokens/scripts/gen-theme.mjs --out src/theme.css",
    "ds:update": "git -C trellis switch main && git -C trellis pull --ff-only && pnpm install && pnpm ds:build && pnpm ds:skill && pnpm ds:add --outdated"
  }
}
```

```bash
pnpm install
pnpm ds:build      # build tokens, icons and components
pnpm ds:skill      # install the agent skill
```

If `pnpm install` stops with `ERR_PNPM_IGNORED_BUILDS`, a dependency of your project (for example esbuild) wants to run an install script. Allow it with `pnpm approve-builds esbuild`, which records it in `pnpm-workspace.yaml`. You can ignore the warning "settings in trellis/pnpm-workspace.yaml do not apply".

**3. CSS and html attributes**

Import in this order in your entry file (main.tsx or similar). `pnpm ds:doctor` checks the order.

```ts
import '@terracelab/trellis-tokens/fonts.css';  // Pretendard (included in the package, no external requests)
import '@terracelab/trellis-tokens/tokens.css'; // --tl-* variables
import './theme.css';                            // company theme (made by pnpm ds:theme; an empty file if you have none)
import '@terracelab/trellis-react/styles.css';  // components
import '@terracelab/trellis-blocks/ui.css';     // only if you use screen blocks
```

```html
<html lang="ko" data-theme="light" data-density="compact">
```

**4. Read the source directly (recommended)**

With the `@terracelab/source` condition in Vite and TypeScript, your app reads `trellis/packages/*/src` directly. Changes you make to Trellis components show up without a rebuild. Without it, the app uses the built `dist`, and you run `pnpm ds:build` after each Trellis change.

```ts
// vite.config.ts
export default defineConfig({
  resolve: {
    conditions: ['@terracelab/source', 'module', 'browser', 'development|production'],
    dedupe: ['react', 'react-dom'],
  },
});
```

```jsonc
// tsconfig.json
{ "compilerOptions": { "moduleResolution": "bundler", "customConditions": ["@terracelab/source"] } }
```

**5. Check**

```bash
pnpm ds:doctor     # build, CSS order, values outside tokens, theme scope, skill version
pnpm build
```

## Use components

```tsx
import { Badge, Button, DataGrid, PageHeader, TrellisProvider } from '@terracelab/trellis-react';
import { formatAmount } from '@terracelab/trellis-contracts';

<TrellisProvider locale="en">
  <Button variant="primary" onPress={save}>Save</Button>
</TrellisProvider>
```

- Read the docs for the Trellis version you installed: `pnpm ds:docs list` (list), `pnpm ds:docs DataGrid` (a component), `pnpm ds:docs guide service` (a guide). The bundled docs are in Korean. The English edition is on the docs site under `/en/`.
- Start screens from screen blocks. Pick one with `pnpm ds:add --list` and copy it with `pnpm ds:add <block id>`. A copied block becomes service code, and its source commit is recorded in `.trellis/blocks.lock`.
- Use only `--tl-*` variables for values. `pnpm ds:doctor` catches raw hex, px and font-family values.
- Pick a company theme from `pnpm ds:theme --list`, or make one with `--brand` and `--neutral cool | neutral | warm`. Status, income, expense and approval colors do not change with the theme. See [docs/guides/en/theme.md](docs/guides/en/theme.md).

## Update Trellis

```bash
pnpm ds:update
```

This moves `trellis/` to the main branch and pulls the latest commit, reinstalls dependencies and rebuilds Trellis, reinstalls the agent skill, and lists copied screen blocks that changed in Trellis. Restart the dev server if it was running. Then review the changes and commit the submodule pointer in your service repository.

```bash
git -C trellis log --oneline $(git rev-parse HEAD:trellis)..HEAD   # Trellis commits in this update
git diff --submodule                            # summary from the service side
pnpm ds:add --diff erp/tax/invoice-list         # changes in a copied block
pnpm typecheck && pnpm build && pnpm ds:doctor
git add trellis && git commit -m "chore: update Trellis"
```

Copied blocks do not change on their own. Use `--diff` and move over what you need, or run `pnpm ds:add <block id> --force` to copy the block again (your changes to it are lost). Changes are recorded in `trellis/.changeset/*.md` and `trellis/docs/plan/decisions.md`.

## When npm packages are published

The package names stay the same. Replace `workspace:*` with a version, then remove the three trellis lines from `pnpm-workspace.yaml` and the submodule. The source condition can stay; published packages contain only `dist`.

## Develop in this repository

```bash
pnpm install && pnpm build && pnpm lint && pnpm typecheck && pnpm test
pnpm --filter @terracelab/demo dev      # demo
pnpm --filter @terracelab/docs dev      # docs site
```

| Path | Contents |
| --- | --- |
| [packages/tokens](packages/tokens) | Token source (JSON) and generated CSS, TS, Tailwind and Figma files, company theme generator (`theme/`) |
| [packages/icons](packages/icons) | UI icons and module tiles |
| [packages/contracts](packages/contracts) | Component contracts (props, state words), `spec.md` and `spec.en.md`, amount and date formatting |
| [packages/react](packages/react) | React components for the web and the bundled docs (`dist/docs`) |
| [packages/skill](packages/skill) | Agent skill and checks for services (install, doctor, docs) |
| [blocks](blocks) | Copy-in screen blocks, platform base types, sample data |
| [starters/service](starters/service) | Service starter template |
| [scripts](scripts) | `create-service`, `add-block`, bundled docs generator |
| [apps/docs](apps/docs) | Docs site (Astro and Starlight), Korean and English |
| [docs](docs) | Specs (`spec`), plan (`plan`), guides (`guides`, English in `guides/en`) |

Rules for working in this repository are in [CLAUDE.md](CLAUDE.md) (Korean). The plan and progress are in [docs/plan/README.md](docs/plan/README.md) (Korean).
