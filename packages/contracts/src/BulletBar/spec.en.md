---
props:
  label: Row name
  value: Current value
  target: Target or limit (vertical marker)
  max: Track maximum
  unit: Unit
  format: Value format
  polarity: Whether an increase is good (`up-good`) or bad (`up-bad`)
  warnAt: Warning threshold ratio
  caption: Secondary text
  size: Row height
  showState: State chip
  targetLabel: Reference name (average). Put before the reference value instead of the target
  showRatio: Ratio on the right (value ÷ target)
examples:
  List: List — Default, achieved, warning and over (`up-bad`). The values are already percentages of a target of 100, so the ratio on the right is off.
  Budget: Budget spending — With amount against amount, the ratio (value ÷ target) appears on the right.
  Average: Compared with the average — When the line is a reference rather than a target, give targetLabel and turn off the state chip and the ratio.
---
# BulletBar
## Purpose
Use it to show progress against a target or limit in one row (purchase order usage, budget spending, goal achievement). It is meant for a list of several rows.
## Anatomy
row (`role="meter"`) · label (`type.label` fg.primary) · track (`chart.track`, radius full) · fill (state color: default `series-1`, achieved `status.success`, warning `status.warning`, over `status.danger`) · target tick (`fg.primary` 2px) · value (`tabular`, "value / target", or "value / reference name reference value" with targetLabel) · state chip (icon + text, showState) · ratio (right end, value ÷ target as a whole percent, `fg.strong` 600, fixed width 44 right-aligned, showRatio).
## Props
Generated from the contract.
## Variants
size 2 × state 4 (default · achieved · warning · over).
## States
default (the four states are data states, not interaction states).
## Behavior
The state comes from `ratio = value / target`. With up-good, a ratio of 1 or more is achieved, a ratio of warnAt or more is warning, and anything else is default. With up-bad, a ratio above 1 is over, a ratio of warnAt or more is warning, and anything else is default.

The right end shows the ratio (value ÷ target, as a whole percent), so the ratios of several rows line up. When the value is already a percentage of a target of 100, the ratio equals the value, so turn it off with `showRatio={false}`. With a target of 0 no ratio is shown.

To compare with a reference such as an average instead of a target, give its name in `targetLabel`. The value text becomes `16.5% / 평균 9.1%` (16.5% / average 9.1%), and the accessible text uses that name instead of `목표` (target). Achieved and warning mean nothing here, so pass `showState={false}` and `showRatio={false}` as well. With showState false the bar also uses the default color (`series-1`), so the state is never shown by color alone.
## Accessibility
Uses `role="meter" aria-valuenow/max aria-label`. `aria-valuetext` reads value, target, ratio against the target, then state, and leaves out what is not shown. State is shown with color, an icon and text.
## Density
md row `density.row-height`, sm 24.
## Platform differences
None.
## Avoid
Using status colors to show size. Code review checks this.
## Stories
List · Budget · Average.
## References
None.
