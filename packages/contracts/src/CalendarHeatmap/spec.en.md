---
props:
  data: Value per date. 0 or missing is an empty cell
  unit: Unit (`원` won, `건` count, `%`). Used in the subtitle, tooltip and table header, not in the value text
  format: Value format. Defaults to formatAmount (thousands separators)
  layout: Shape
  ariaLabel: The chart in one sentence (what, which period, from where to where). The name for `role="img"`
examples:
  Month: Month — Values per date in 5 shades of one color.
---
# CalendarHeatmap
## Purpose
Use it to show a value for each date (sales, attendance, logins). It uses 5 shades of one color. Use BarList to show only the weekday pattern.
## Anatomy
root · weekday labels (`chart.axis`) · cells (`chart.heat-1~5`, `chart.track` for 0 or no data, radius `radius.sm`, 2px gap) · month/year labels · tooltip (date · value).
## Props
Generated from the contract.
## Variants
layout: month (7 columns × up to 6 rows) · year (one column per week × 7 rows).
## States
default · hover (cell tooltip).
## Behavior
The 5 levels split the maximum value into 5 equal parts (linear). Today has a 1px `border.focus` border.
## Accessibility
See `charts/README.md`. Each cell gives its date and value through `title`.
## Density
Cell size is calculated from the width (month at least 24, year at least 10).
## Platform differences
None.
## Avoid
Status colors for magnitude (for example, red for the day with the most sales). Code review checks this.
## Stories
Month · Year · Empty · Density.
## References
None.
