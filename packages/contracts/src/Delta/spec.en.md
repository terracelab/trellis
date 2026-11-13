---
props:
  value: Change value (+ increase, − decrease)
  format: Format (percent 12.4%, point 0.3%p, amount in won, number with a unit)
  polarity: What the color means (finance means red for increase and blue for decrease)
  label: Comparison baseline, such as `전월 대비` (vs. last month)
  unit: Unit for the number format, such as `건` (items) or `EA`
  digits: Decimal places (1 for percent and point, 0 otherwise)
  size: Text size (sm is caption, md is body)
examples:
  Finance: Finance convention — Red for an increase and blue for a decrease. The sign and arrow always show.
  Polarity: Good or bad — Only the icon takes a status color, and hidden text says better or worse.
  InTable: In a table cell — `sm` keeps the row height, and the baseline goes in the column header.
  States: Directions and formats — Up, down and zero in each format. A value that rounds to zero has no sign.
---
# Delta
## Purpose
Use it to show one change against a baseline with a sign, an arrow and a color (vs. last month +12.4%, vs. yesterday +4 items). It is the change line inside KpiCard, and it also goes into table cells (DataGrid render), Card and drawer headers as is. For a trend use Sparkline, and for progress against a target use BulletBar or RadialMeter.
## Anatomy
root (`span`, sits inside a line of text) · label (comparison baseline, `fg.tertiary`) · value (direction icon and change text, `font.weight.600`, tabular) · icon (trending-up · trending-down · minus 16) · hidden text (better or worse for up-good and up-bad).
## Props
Generated from the contract.
## Variants
3 polarities × 3 directions × 2 sizes. Color only shows direction.

| polarity | Increase | Decrease | Zero |
|---|---|---|---|
| finance (default) | text and icon `finance.income` (red) | text and icon `finance.expense` (blue) | `finance.neutral` |
| up-good | icon `status.success.default`, text `fg.secondary` | icon `status.danger.default`, text `fg.secondary` | icon `fg.tertiary` |
| up-bad | icon `status.danger.default`, text `fg.secondary` | icon `status.success.default`, text `fg.secondary` | icon `fg.tertiary` |

size sm uses `type.caption` (secondary text in cards and table cells), md uses `density.body-font-size`.
## States
default only. It is not pressable. hover, active, focus, disabled, loading and error do not apply (while loading, the parent draws a Skeleton).
## Behavior
Text comes only from the contracts function `formatDelta(value, format, { unit, digits })`. A sign is always shown (+ or U+2212 −). percent is a relative change (+12.4%), point is a difference between two rates (+0.3%p for defect rate, share or margin), amount is in won (`+12,400,000원`), and number adds the unit (`+4건`). The direction comes from the value rounded to the visible digits (`deltaDirection`). 0.04% shows as 0.0% with no sign and a minus icon. The baseline goes before the value (content.md §4, `전월 대비 +12.4%`). Finance colors follow the Korean convention, where red means income or increase and blue means expense or decrease.
## Accessibility
Direction shows through the sign and the arrow shape, not only through color. The icon is decorative (aria-hidden), and the sign is read. up-good and up-bad use color to say good or bad, so hidden text `개선` (better) or `악화` (worse) is added. finance only shows direction, so nothing is added. Text contrast of `finance.*` and `fg.secondary` is above 4.5:1.
## Density
Sizes do not depend on density. size md follows `density.body-font-size`, and sm stays at caption size.
## Platform differences
Native draws two Text elements and one icon with the same format function and color tokens.
## Avoid
Green for increase and red for decrease (the Western convention). Color without a sign. Adding + and commas with string templates. % on a rate difference (use point). Code review checks these.
## Stories
Finance · Polarity · InTable · States.
## References
content.md §4 (change, color shows direction only), principle 3 (income red, expense blue), KpiCard, components.md §11 numbers.
