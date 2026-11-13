---
props:
  value: Value
  max: Column maximum
  width: Bar width
  marker: Reference line
  warnBelow: Warning threshold
  format: Value format
  unit: Unit
  color: Bar color
  label: Accessible name
examples:
  InTable: In a table — Scaled to the maximum of the same column, with a reference line (marker) and a low stock warning.
---
# DataBar
## Purpose
Use it to compare values in one table column (inventory, quantity) inside the cells. The values read without drawing a separate chart.
## Anatomy
cell (`role="img"`) · track (`chart.track`) · fill (`color`, `status.danger` below warnBelow) · marker (reference line, `fg.primary` 1px) · value (`tabular` fg.primary, on the right) · warn icon (`status.danger`).
## Props
Generated from the contract.
## Variants
With or without marker × with or without warning.
## States
default · error (below warnBelow: danger color and icon).
## Behavior
None.
## Accessibility
Sets `aria-label="{label} {value}{unit}, 최대 {max}"`, where `최대` means maximum.
## Density
Bar height 8 (compact) · 10 (comfortable), a quarter of `density.row-height`.
## Platform differences
None.
## Avoid
Mixing in the max of another column. Code review checks this.
## Stories
Default · WithMarker · Warn · InTable.
## References
None.
