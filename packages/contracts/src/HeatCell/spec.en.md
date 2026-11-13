---
props:
  value: Value. null leaves the cell empty
  max: Maximum value across the whole table
  format: Value format
  unit: Unit
  align: Text alignment
  empty: Text for an empty cell
examples:
  Aging: Aging table — One scale based on the maximum of the whole table.
---
# HeatCell
## Purpose
Use it to show which cells of a row × column table are heaviest (aging, weekday × branch). It is a conditionally colored cell.
## Anatomy
cell (background `chart.heat-1~5`, 0 and null get `chart.track` or the empty text) · value (steps 1 to 3 `fg.primary`, 4 to 5 `fg.inverse`, tabular).
## Props
Generated from the contract.
## Variants
Steps 0 to 5.
## States
default.
## Behavior
Step = ceil(value / max × 5). Step 0 is an empty cell.
## Accessibility
`title` holds the value and unit. The step rule keeps text contrast at 4.5:1 or higher.
## Density
Padding `space.4`/`space.8`.
## Platform differences
None.
## Avoid
Mixing `max` values from different tables. Showing size with status colors. Code review checks these.
## Stories
Steps · InTable · Empty.
## References
None.
