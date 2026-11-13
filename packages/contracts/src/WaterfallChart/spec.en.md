---
props:
  steps: start → delta… → total. Labels are 2 to 4 characters
  unit: Unit (`원` won, `건` count, `%`). Used in the subtitle, tooltip and table header, not in the value text
  height: Chart height (SVG user units). The card fixes the height so the layout does not jump while loading
  format: Value format. Defaults to formatAmount (thousands separators)
  polarity: Color rule for increase and decrease
  reference: Reference line
  ariaLabel: The chart in one sentence (what, which period, from where to where). The name for `role="img"`
examples:
  Budget: Budget spending — Decrease in blue (expense) and increase in red (income), with a reference line.
  Price: Price breakdown — No increase or decrease colors (neutral).
---
# WaterfallChart
## Purpose
Use it to show how additions and subtractions lead from a start value to an end value. Examples are budget → spending → balance and base price → discount → quoted price. Use BarList for a simple comparison.
## Anatomy
root · axis · bars (start/total `series-1`; delta follows polarity: with updown, an increase is `income` (red) and a decrease is `expense` (blue); with neutral, all are a lighter `series-1`) · connectors (`border.strong` dashed) · captions (`fg.tertiary`) · reference line (`chart.axis` dashed + label) · tooltip.
The updown colors follow the Korean convention, where red means income or increase and blue means expense or decrease.
## Props
Generated from the contract.
## Variants
polarity 2 × with or without reference.
## States
default · hover (tooltip: step · value · running total).
## Behavior
The component calculates the running total (start → accumulated deltas → total, drawn from the running total). If a total value differs from the running total, development mode shows a warning.
## Accessibility
See `charts/README.md`. The tooltip and the table show a sign (+/−), so color is not the only cue for increase and decrease.
## Density
Step labels of 2 to 4 characters. Past 6 steps, group steps rather than scroll sideways.
## Platform differences
None.
## Avoid
The Western reversal (green for increase, red for decrease). Code review checks this (fixed finance colors).
## Stories
Default (updown) · Neutral (price breakdown) · WithReference · Density.
## References
None.
