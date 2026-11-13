---
props:
  data: Slices (5 or fewer, plus an other slice)
  unit: Unit (`원`, `건`, `%`). Used in the subtitle, tooltip and table header, not added to value text
  height: Chart height (SVG user units). The card fixes the height so the layout does not jump while loading
  centerLabel: Small label in the center
  centerValue: Large value in the center
  legend: Side legend (with values and shares)
  format: Value format. Defaults to formatAmount (thousands separators)
  ariaLabel: The chart in one sentence (what, which period, from where to where). Name of `role="img"`
examples:
  Basic: Basic — Total in the center and a side legend (values and shares).
---
# Donut
## Purpose
Use it to show each part's share of a whole (5 slices or fewer). When there are many slices or the labels are long, use SegmentedBar or a horizontal BarList.
## Anatomy
root · ring (thickness 28% of the radius, 2px `bg.surface` gap between slices, color `Slice.color` or `series-n` in order) · center (label `type.caption` fg.secondary, value `type.amount` fg.primary) · legend (beside the ring, label · value · share) · tooltip.
## Props
Generated from the contract.
## Variants
With or without legend, with or without center.
## States
default · hover (no slice expansion, tooltip only).
## Behavior
More than 5 slices triggers a warning in development mode (the caller folds the rest into `기타`, meaning other). Slices with a value of 0 are not drawn and appear only in the legend.
## Accessibility
Follows `charts/README.md`. Shares in the legend use one decimal place.
## Density
At a width of 390, the legend moves below the ring.
## Platform differences
None.
## Avoid
A pie (no hole). 3D. More than 5 slices. Code review checks these.
## Stories
Default · NoLegend · WithCenter · Density.
## References
None.
