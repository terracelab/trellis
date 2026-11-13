---
props:
  data: Values per category
  unit: Unit (`원`, `건`, `%`). Used in the subtitle, tooltip and table header, not added to value text
  layout: Bar direction
  height: Chart height (SVG user units). The card fixes the height so the layout does not jump while loading
  showValues: Value text at the end of each bar
  format: Value format. Defaults to formatAmount (thousands separators)
  max: Fixes the axis maximum
  color: Bar color (one color)
  extremes: Value text only on the highest and lowest bars
  onBarPress: Called when a bar is pressed. When given, the bars become buttons (Tab · Enter · Space)
  ariaLabel: The chart in one sentence (what, which period, from where to where). Name of `role="img"`
examples:
  Vertical: Vertical — Short categories such as days of the week.
  Horizontal: Horizontal with value text — Use it when names are long or there are more than 6 items.
  Extremes: Highest and lowest only — With many bars, only the ends get value text.
  Pressable: Bars as buttons — With onBarPress, pressing a bar opens that category's list. Tab and Enter work too.
---
# BarList
## Purpose
Use it to compare values across categories (day of the week, branch, classification). Nominal categories use one color. For part to whole use SegmentedBar or Donut, and for a time axis use TrendChart.
## Anatomy
root · axis (category labels `chart.axis`) · bars (`color`, end radius `radius.sm`, 2px apart) · value labels (`fg.secondary` tabular, showValues) · extreme labels (extremes, highest `fg.strong` 600 · lowest `fg.secondary`) · focus ring (onBarPress, `border.focus` 2 outside the bar) · tooltip.
## Props
Generated from the contract.
## Variants
2 layouts. Use a per-item `Slice.color` only when each category has a fixed color of its own (channels).
## States
default · hover (bar highlight and tooltip) · focus (focus ring outside the bar with onBarPress). The rest do not apply.
## Behavior
When names are long or there are more than 6 items, horizontal is recommended (a warning in development mode).

With `extremes`, only the highest and lowest bars get value text, and every category name stays on the axis. It lets the reader see just the ends when there are many bars. Ties all get the text. Given together with `showValues`, extremes wins.

With `onBarPress`, each bar becomes a button that leads to that category's list. Pressing it passes the item (`Slice`). Each bar is reached with Tab and pressed with Enter or Space. The cursor is a pointer.

| Key | Action |
| --- | --- |
| Tab | Next bar (with onBarPress) |
| Enter · Space | Press that bar |
## Accessibility
Follows `charts/README.md`. With `onBarPress`, the root is `role="group"` (named by `ariaLabel`) instead of `role="img"`, and each bar has `role="button"`, `tabIndex=0` and the name "category value unit" (for example `금 171건`), because buttons inside an img are hidden from screen readers. The focus ring is drawn 2 outside the bar with `border.focus` 2, so it never blends into the bar color.
## Density
Bar thickness follows the number of items automatically, up to 32.
## Platform differences
None.
## Avoid
Recoloring bars by value size. Rainbow bars. Code review checks these.
## Stories
Vertical · Horizontal · Extremes · Pressable.
## References
None.
