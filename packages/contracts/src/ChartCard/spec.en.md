---
props:
  title: Block title
  subtitle: Unit, period and what the dashed line means
  legend: Legend. Always pass it when there are two or more series
  action: Action at the top right
  height: Chart area height (fixed)
  loading: Skeleton
  refreshing: Reloading (dimmed)
  error: Error message
  empty: Empty state message
  onRetry: Retry from the error state
  table: Data for the table alternative
  children: One chart
examples:
  Basic: Basic — Title, subtitle, legend and table view.
  States: States — Loading, error and empty. The height stays fixed so the layout does not jump.
---
# ChartCard
## Purpose
Use it to put one chart in a card with a title, legend, top-right action and a fixed-height chart area. The subtitle gives the unit, the period and what a dashed line means, and a `표로 보기` (view as table) toggle shows the data as a table. Do not use it for a number block without a chart (use StatCard). For a composite block that mixes several pieces, use Card.
## Anatomy
root (`bg.surface` · `border.default` · `radius.lg`) · head (title `type.h3` fg.primary, subtitle `type.caption` fg.secondary) · action · legend (Legend) · body (fixed height, chart or skeleton/error/empty/table) · toggle (view as table, ghost Button sm, `aria-pressed`).
## Props
Generated from the contract.
## Variants
No variants. The caller sets only the height.
## States
default · loading (skeleton `bg.sunken`, height kept) · error (`status.danger.default` icon + message + retry). hover · active · focus apply only to the toggle button (Button rules). disabled does not apply.
## Behavior
When `table` is set, a toggle appears. Pressing it puts a `<table>` in place of the chart (same height, vertical scroll). With `refreshing`, the chart is set to `opacity.disabled` (0.5) and stays interactive. When `error` is set, it takes priority over loading.
## Accessibility
The root is `<figure aria-labelledby=title>` (the figure's own role; role="group" is not allowed on figure). The table puts the title in `<caption>`, and number columns use `<th scope="col">`. The toggle uses `aria-pressed`. The error message has `role="status"`.
## Density
head padding `density.card-padding`, toggle height `density.control-height-sm`.
## Platform differences
Native has no toggle. A long press opens the table in a sheet instead. Everything else is the same.
## Avoid
Passing only a chart and leaving `table` empty (code review, because it removes the way to check the numbers). A layout jump during loading because no height is set. The default of 240 enforces a height.
## Stories
Default · States (loading · error · empty · refreshing) · WithTable · WithLegendAndAction · Density.
## References
Original plan §5 (dashboard blocks). Only the structure is used as a reference (no third-party assets).
