---
props:
  data: Values only. No axes or labels. It shows the shape only
  width: Width
  height: Height
  area: Light area under the line
  color: Line color
  ariaLabel: The chart in one sentence (what, which period, from what to what). Name for role="img"
examples:
  InStat: Inside a stat card — Shape only, without axes or values.
---
# Sparkline
## Purpose
Use it to show a small trend line inside a number tile. It has no axes, values or legend. It shows the shape only. When people need to read the values, use TrendChart.
## Anatomy
svg (`role="img"`) · area (light area, line color at opacity 0.12) · line (1.5px `color`) · end dot (r 2.5).
## Props
Generated from the contract.
## Variants
With or without area.
## States
default. The other states do not apply (no tooltip).
## Behavior
With fewer than 2 values, it draws a flat line. It draws its own SVG (no Recharts).
## Accessibility
Put the start and end values in `ariaLabel`.
## Density
In a tile footer, width 140 · height 24 is recommended.
## Platform differences
None.
## Avoid
Using it as decoration on every stat tile (a trend with no value). Code review checks this.
## Stories
Default · NoArea · InStatCard.
## References
None.
