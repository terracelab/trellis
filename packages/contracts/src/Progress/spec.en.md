---
props:
  value: Current value (null = end unknown)
  max: Maximum value
  label: What is in progress
  showValue: Shows the value text
  unit: Unit (when set, shows value / max)
  tone: Bar color (brand if not set)
  size: Bar thickness
examples:
  Default: Progress — A percent without a unit, the value and maximum with a unit.
  Indeterminate: Unknown end — When the number of items to process is not known yet.
---
# Progress
## Purpose
Use it to show the progress of a task with a known end as a bar (spreadsheet upload, month-end checklist, batch job). Use BulletBar for a value against a target or limit, and Spinner for actions that finish within a second.
## Anatomy
root (2-column grid) · label (`type.label` `fg.secondary`) · value (`type.label` 600 `fg.primary`, tabular) · track (`chart.track`, radius full, md `space.8` · sm `space.4`) · indicator (`brand.default` by default, `status.*.default` with a tone, `fg.tertiary` for neutral).
## Props
Generated from the contract.
## Variants
size md · sm × tone (none = brand, 5 tones).
## States
default. When `value` is null, the end is unknown and the bar moves back and forth.
## Behavior
Without a unit, the value text is `formatPercent(value / max × 100, 0)` (62%). With a unit, it is `formatAmount(value) / formatAmount(max) + unit` (`124 / 200건`, 124 / 200 items). The value is clamped between 0 and `max`. Width changes animate over `duration.300`.
## Accessibility
Built on Base UI Progress (`role="progressbar"`, `aria-valuenow/min/max`). The name comes from `label`, and `aria-valuetext` matches the visible value text. With `prefers-reduced-motion`, the width transition and the moving bar stop.
## Density
Bar thickness does not depend on density.
## Platform differences
Native animates the View width, and the accessible value uses accessibilityValue.
## Avoid
Using it for achievement against a target (use BulletBar). Using status colors as decoration. Leaving the bar moving for a task that has stalled. Code review checks these.
## Stories
Default · Units · Tones · Indeterminate.
## References
Base UI Progress, BulletBar.
