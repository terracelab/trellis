---
props:
  data: Array of rows
  x: x-axis field
  bars: Bar series. 1 or 2 side by side, 3 or more when stacked. From 6, everything after the fifth folds into `기타` (other)
  lines: Line series (comparison dashed line, target)
  stacked: Stacks the bars (composition over time). The tooltip gets a total row
  unit: Unit (`원` won, `건` count, `%`). Used in the subtitle, tooltip and table header, not in the value text
  height: Chart height (SVG user units). The card fixes the height so the layout does not jump while loading
  xFormat: x label format
  yFormat: y label format
  lower: Secondary chart below (different unit). Replaces a dual axis
  ariaLabel: The chart in one sentence (what, which period, from where to where). The name for `role="img"`
examples:
  Basic: Bars with a dashed line for last year — Monthly sales as bars and the same month last year as a dashed line.
  Lower: Lower chart — Show the margin rate, which has a different unit, in lower instead of a dual axis.
  Stacked: Stacked by channel — Monthly sales stacked by 3 sales channels. The tooltip adds the total.
  Other: Folding into other — With 7 categories the first 5 keep their colors and the rest become one gray `기타` (other) segment. The table view still shows all 7.
---
# ComboChart
## Purpose
Use it to show quantities (bars) and a trend or comparison (lines) on one axis. Stacked bars show composition over time (sales by channel or category) with 3 or more series. Put a secondary metric with a different unit (margin rate) in the small `lower` chart. This replaces a dual axis. Use BarList for bars only and TrendChart for lines only.
## Anatomy
root · grid · axes · bars (1 or 2 side by side · 3 or more stacked, `series-n`, from 6 everything after the fifth is `compare` other, end radius `radius.sm`, 2px gap between bars, 2px `bg.surface` between segments when stacked) · lines (comparison dashed `compare`, target solid) · tooltip · lower (same x axis, height 84, 1 or 2 series).
## Props
Generated from the contract.
## Variants
stacked × with or without lower.
## States
default · hover (one tooltip covers the upper and lower charts). The rest do not apply.
## Behavior
The upper and lower charts share x, and hover is synchronized between them. With 3 or more bars side by side, development mode shows a warning (no warning when stacked). When stacked, the first series is at the bottom and only the top segment has a rounded end. Segments are separated by a 2px `bg.surface` gap, and the tooltip ends with a total row.

Both charts use the same band scale for x. Even when the lower chart has only a line, its points sit at the centres of the upper bars. `yFormat` (upper and lower) is used only for axis ticks. The tooltip value is the number (at most one decimal place) followed by `unit` once, so a tick format that already contains the unit does not print it twice.

With 6 or more series, `foldSeries` (contracts) keeps the first 5 and adds the rest per row into one other series (gray `compare`). No new color slots are made. The caller decides which series come first (largest first), and colors stay fixed to the item. The legend also lists the other series, and the table view shows every folded series. The gray other segment sits next to the fifth (amber), which keeps the color vision simulation ΔE at 15.4 or more (next to the fourth, teal, it would be 3.0 and indistinguishable).
## Accessibility
See `charts/README.md`. Write the unit of lower in the subtitle.
## Density
At a width of 390, lower is hidden and replaced by a table.
## Platform differences
Native does not support lower (development warning) and shows a table instead.
## Avoid
A dual y axis. Code review checks this. 3 or more bars side by side. A warning flags this. Adding series colors (a sixth color). Code review checks this, fold into other instead.
## Stories
Default · Stacked (3-series composition) · Other (7 series → other) · WithLower · Compare · Density.
## References
dataviz anti-pattern "dual axis".
