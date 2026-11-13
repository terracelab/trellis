---
props:
  label: Metric name
  value: Value
  unit: Unit (defaults to `원` for amount and compactWon)
  format: Number format (contracts format functions)
  currency: Currency when format = currency
  delta: Change against a baseline (Delta, defaults to percent and finance)
  caption: Basis or period
  icon: Icon before the label
  size: Value text size (amount · amount-lg · display)
  loading: Loading (skeleton)
  error: Could not load (text replaces the default message)
  onRetry: Retry (when error is set)
  masked: Masked value with one reason line (text replaces the default reason)
  onPress: Called when pressed (the whole card becomes a button)
examples:
  HomeRow: Home first row — Amounts show the won unit in small text, and the change puts the comparison baseline first.
  Polarity: Polarity — Metrics that are clearly good or bad use a status icon, and the text stays neutral.
  Loading: Loading — Only the value area shows a skeleton, and the label stays as it is.
  ErrorAndMasked: Error and masked — A failed metric offers Retry in the value area. A metric without access shows mask characters and one reason line.
  Small: Small metrics — `sm` sits several in a row in a drawer header or above a detail.
---
# KpiCard
## Purpose
Use it to show one metric and its change against a baseline on a card (cash on hand today, sales this month, awaiting approval). For a trend line use ChartCard with Sparkline, and for a list use Card.
## Anatomy
root (`bg.surface`, `border.divider`, `radius.lg`, inner padding `density.card-padding`, `space.8` × `space.12` at sm) · head (icon `fg.tertiary` 16 · label `type.label` `fg.secondary`, `type.caption` at sm · chevron) · value (`type.amount-lg`, `type.amount` at sm, `type.display` at lg, tabular) · unit (`type.label` `fg.tertiary`) · delta (Delta size sm: comparison baseline `fg.tertiary`, change value and direction icon) · error (circle-alert `status.danger.default`, `불러오지 못함` (could not load) in `fg.secondary`, and a ghost sm Retry button) · masked (mask characters in `fg.tertiary`, a lock icon and one reason line in `type.caption` `fg.tertiary`) · caption (`type.caption` `fg.tertiary`).
## Props
Generated from the contract.
## Variants
size sm · md · lg × 5 formats (number · amount · percent · currency · compactWon) × 3 delta polarities. sm is for a few small metrics side by side in a drawer header or above a detail. With onPress it is a button.
## States
default · hover (`border.strong`, `bg.canvas`) · active (`bg.sunken`) · focus (ring) · loading (Skeleton in the value and change areas, `aria-busy`) · error (could not load and Retry in the value area, `data-state="error"`). hover, active and focus apply only when onPress is set. masked is not a state. It is a way of showing the value (mask characters and a reason).
## Behavior
The change line is the Delta component (size sm). Numbers come only from the contracts format functions (number and amount use `formatAmount`, percent uses `formatPercent`, currency uses `formatCurrency`, compactWon uses `formatCompactWon`). Amounts are in won (KRW) with thousands separators. compactWon shortens large amounts with the Korean units `만` (10,000) and `억` (100,000,000). The unit follows the number in small text (amount and compactWon default to `원`). The change puts the comparison baseline first and always shows a sign (`전월 대비 +12.4%`, vs. last month +12.4%). A difference between two rates (defect rate, share, margin) uses delta.format point and shows %p (`전일 대비 +0.3%p`, vs. yesterday +0.3 percentage points). Putting % on a rate difference reads as a relative change. Color only shows direction. finance (the default) uses `finance.income` (red) for an increase and `finance.expense` (blue) for a decrease. This is the Korean convention, where red means income or increase and blue means expense or decrease. With up-good and up-bad, only the status icon (trending-up · trending-down, success · danger) has color, and the text is neutral. Zero shows a neutral minus icon. With error, the value and change are replaced by `불러오지 못함` (could not load), or by the error text when it is a string, and onRetry adds a Retry button. The card is then not a button even with onPress, so there is no button inside a button. With masked, the value, unit and change are replaced by mask characters and one reason line (the masked text when it is a string, otherwise `볼 권한이 없습니다`, you do not have access). The change is hidden too, because it would hint at the value.
## Accessibility
With onPress, the whole card is a `<button>`, and its accessible name is the label, value and change text in that order. Without it, the card is `role="group"` with `aria-labelledby` (the label). Direction shows through the sign (+ or −) and the icon, not only through color. The Retry button is named with the label (`{label} 다시 시도`, and in English `Try again to load {label}`), so several cards stay distinct. The name contains the words shown on the button (`다시 시도` · `Try again`, WCAG 2.5.3). Mask characters are decorative, and hidden text reads `가린 값` (hidden value). The focus ring is always visible.
## Density
Inner padding `density.card-padding` (12 · 16). Value text size does not depend on density. On a phone (below `breakpoint.sm`), the card does not stack vertically and uses two columns. The name and description sit on the left, the value and change on the right, and the arrow at the right center. The lg size also drops to `type.amount-lg` (D-61).
## Platform differences
Native uses Pressable and has no hover.
## Avoid
A sparkline or chart inside the card (use ChartCard). Western colors for change (green for increase, red for decrease). Adding commas with string templates. Code review checks these.
## Stories
HomeRow · Polarity · Loading · ErrorAndMasked · Small.
## References
content.md §4 (change and large amount summaries), D-35 (display text is for KPI numbers), principle 3 (income red, expense blue).
