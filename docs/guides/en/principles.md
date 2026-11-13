# Principles and rules

## Design principles

When two principles conflict, follow the one higher on the list.

1. **Density first.** compact is the default and comfortable is an option.
2. **Status shows first.** Count badges, status colors and approval steps look the same in every module.
3. **Korean business conventions.** Income is red and expense is blue, the approval vocabulary has five words, and amounts are in won with thousands separators, right-aligned. In Korea, red means income or increase and blue means expense or decrease.
4. **No values outside tokens.**
5. **One API across platforms, different implementations.**
6. **Accessibility is the default.** Text contrast of at least 4.5:1, every action by keyboard, a focus ring that is always visible, and respect for reduced motion.

## Rules for app code

| Rule | Do | Do not |
| --- | --- | --- |
| Values come from tokens | `var(--tl-color-bg-surface)` · `tokens.space[16]` | `#FFFFFF` · `16px` · `font-family: 'Pretendard'` |
| Semantic only | `--tl-color-brand-default` | `--tl-color-brand-500` (primitive) |
| Request missing parts | Request the component in a Trellis issue | Build a similar component in the app |
| Use props as documented | `onPress` · `onChange` · `onOpenChange` | Override internal classes with `className` |
| Chart colors are slots | `color="series-2"` | `color="#1F9D55"` |

## Fixed vocabulary

**7 states**

`default` · `hover` · `active` · `focus` · `disabled` · `loading` · `error`

**5 approval states**

| Key | Label | Color token |
| --- | --- | --- |
| `draft` | `기안` (draft) | `--tl-color-approval-draft-default` |
| `pending` | `진행` (in progress) | `--tl-color-approval-pending-default` |
| `approved` | `승인` (approved) | `--tl-color-approval-approved-default` |
| `rejected` | `반려` (rejected) | `--tl-color-approval-rejected-default` |
| `withdrawn` | `회수` (withdrawn) | `--tl-color-approval-withdrawn-default` |

**Finance colors**

Income `--tl-color-finance-income` (red) · expense `--tl-color-finance-expense` (blue) · no change `--tl-color-finance-neutral`. This is the Korean convention. Do not flip it to the Western one (green for increase, red for decrease).

## Naming rules

| Target | Rule | Example |
| --- | --- | --- |
| Token | Dot path → CSS `--tl-` + kebab case | `color.bg.surface` → `--tl-color-bg-surface` |
| Package | `@terracelab/trellis-<pkg>` | `@terracelab/trellis-react` |
| CSS class | `tl-` + component name in kebab case, variants as `data-*` | `<div class="tl-chart-card" data-state="loading">` |

## Numbers

```ts
import { formatAmount, formatCompactWon, formatPercent } from '@terracelab/trellis-contracts';
formatAmount(-1234); // "−1,234"(U+2212)
formatCompactWon(874_479_500); // "8.7억" (억 = 100,000,000)
formatPercent(12.34); // "12.3%"
```

Amount cells are right-aligned and use `font-variant-numeric: var(--tl-font-numeric)` (tabular figures).
