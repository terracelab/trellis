---
props:
  items: In series order. Shapes match the chart
examples:
  Shapes: Shapes — Bars use square, lines use line, comparisons use dashed.
---
# Legend
## Purpose
Use it to name the series of a chart with two or more series. Do not use it for a single series (the title names it).
## Anatomy
list (`role="list"`, wraps horizontally, spacing `space.12`) · item (swatch 10×10 `radius.xs` or line 16×2 · dashed line, label `type.caption` fg.secondary).
## Props
Generated from the contract.
## Variants
shape: square · line · dashed.
## States
default.
## Behavior
None (static). Clicking does not toggle a series, because that would hide state.
## Accessibility
`<ul role="list">`. Series differ by shape (dashed) as well as by color.
## Density
None.
## Platform differences
None.
## Avoid
A solid line in the legend when the chart uses a dashed line. Code review checks this.
## Stories
Default · Shapes.
## References
None.
