# Overview

Trellis is TerraceLab's design system. TerraceLab's products share it, including its groupware and CRM. Terrace One, the business platform TerraceLab builds to fit each client company, is also built with it. Color, spacing, type and the state vocabulary are fixed as tokens. Web, desktop, mobile, Django and Figma all come from the same tokens.

## Name

A trellis is a lattice frame that supports climbing plants. The name means that each product grows in its own way and they share one frame. This is the only place the name is explained. Screens and docs do not use the lattice metaphor again ([Content](content.md)).

## What is included

| Package | Contents | Status |
| --- | --- | --- |
| `@terracelab/trellis-tokens` | CSS variables `--tl-*` · TS objects · React Native theme · Tailwind v4 theme · Pretendard Variable font | Available |
| `@terracelab/trellis-icons` | UI icons, 36 module tile illustrations (all 35 modules plus expense, sprite · SVG · manifest) | Available |
| `@terracelab/trellis-contracts` | Component props types · state vocabulary · number formatting (`formatAmount` and others) | Available |
| `@terracelab/trellis-react` | 121 web React components: 106 base components and 15 charts (`/charts`). Every component has a doc and examples, and the full list is in `manifest.json` in the bundled docs | Available |
| `@terracelab/trellis-blocks` | Screen blocks (copy-in source, `pnpm ds:add`), types for the platform's base features and screen layout helpers. The demo app is assembled from them | Available (git submodule) |
| `@terracelab/trellis-skill` | Agent skill and check tool for service repositories (install · doctor · docs) | Available (git submodule) |
| `@terracelab/trellis-native` | Expo components (same props) | After 1.0 |
| `terracelab-trellis` (PyPI) | Django static files · template tags · admin theme | After 1.0 |

Trellis is open source under the Apache-2.0 license. The source is in the GitHub repository `terracelab/trellis`, and tokens, icons, contracts and react are installed from npm ([Installation](install.md)).

All packages are released together under **the same version number**. From 1.0 on, token names and component props are renamed or removed only in a major version ([Version policy](versions.md)).

## The one-sentence rule

Every value on a screen comes from a token. Do not write raw hex, px or font names in code. Draw only with `--tl-*` variables and Trellis components. The full rules are in [Principles and rules](principles.md).

## Next

1. [Installation](install.md)
2. [CSS, themes and density](setup.md)
3. If you need to show numbers, [Choosing a chart](charts.md)
4. If you develop with agents, [Developing with agents](agents.md)
