---
props:
  data: Parts (their sum is the whole). Colors come from a fixed per-item map
  unit: Unit (`원` won, `건` count, `%`). Used in the subtitle, tooltip and table header, not in the value text
  size: Thickness
  legend: Legend below (value · share)
  format: Value format. Defaults to formatAmount (thousands separators)
  ariaLabel: The chart in one sentence (what, which period, from where to where). The name for `role="img"`
examples:
  Basic: Basic — Part-to-whole in one bar, with a legend.
  Thin: Thin — Ranking track (the rest uses compare).
---
# SegmentedBar
## Purpose
Use it to show the parts of a whole in one bar. It is the default part-to-whole chart. Use thin for a ranking track, where the rest is `chart.track`.
## Anatomy
root · track (`chart.track`, radius `radius.full`) · segments (`Slice.color` or `series-n`, 2px background gap between them, `title` gives label, value and share) · legend (below: label · value · share).
Segments contain no text. 12px text on a series color cannot guarantee 4.5:1 (4.2 on green.500). The legend and the tooltip (title) carry the value and share.
## Props
Generated from the contract.
## Variants
2 sizes.
## States
default · hover (segment tooltip).
## Behavior
When the sum is 0, only the track is drawn, with the text `데이터 없음` (no data).
## Accessibility
See `charts/README.md`. Each segment gives its label and value through `title`.
## Density
tall height `size.control-md` (32), thin 8.
## Platform differences
None.
## Avoid
7 or more segments. Code review checks this.
## Stories
Default · Thin · NoLegend · Density.
## References
None.
