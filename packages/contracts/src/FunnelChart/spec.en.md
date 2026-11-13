---
props:
  data: "Stages in order from top to bottom. `{ label, value }`"
  unit: Unit (`원` won, `건` count, `%`). Used in the subtitle, tooltip and table header, not in the value text
  format: Value format. formatAmount (thousands separators) by default
  color: Bar color slot. It does not change per stage
  conversion: "Rate column: from the previous stage · from the first stage · both"
  summary: One line below with the overall conversion
  ariaLabel: The chart in one sentence (what, which period, from where to where). The name for `role="img"`
examples:
  Pipeline: Sales stages — Count reaching each stage and the conversion from the previous stage. The table view shows the same numbers.
  Both: Both rates — Conversion from the previous stage and cumulative conversion from the first stage side by side.
  Amount: Amount — An amount funnel in `원` (won) without the summary line.
---
# FunnelChart
## Purpose
Use it to show how many remain at each stage of an ordered process and the conversion rate between stages (inquiry → quote → negotiation → contract, visit → cart → order). Use BarList to compare categories without stages, TrendChart for change over time, and Stepper for the stages of a single item.
## Anatomy
root (`role="img"`) · row (one row per stage, height `density.row-height`) · label (stage name `type.label`, `fg.primary`) · track (`chart.track`, `radius.sm`) · bar (one color `series-1` or the color slot, left aligned, end `radius.sm`, `space.4` between rows) · value (`type.label` 600 tabular, `fg.primary`) · rate (rate column on the right, `type.caption` tabular, `fg.secondary`, empty for the first stage) · head (rate column heading `전 단계 대비` (from previous stage) · `누적 전환율` (cumulative conversion), `type.caption` `fg.secondary`) · summary (one line below such as `문의에서 계약까지 전환율 6.3%` (conversion from inquiry to contract 6.3%), `type.caption` `fg.secondary`, `border.divider` above).
## Props
Generated from the contract. A stage (FunnelStage) is `{ label, value }` and the array order is the stage order. `funnelSteps(data)` (contracts) does the math. rate is the conversion from the previous stage (%), overall the conversion from the first stage (%), and drop how many left after the previous stage. Use the same function to build the table view.
## Variants
3 conversion modes (previous · overall · both) × with or without summary. One color slot (`series-1` by default).
## States
default · hover (row background `bg.sunken`, value and rate in the bar title). focus, active, disabled, loading and error do not apply (ChartCard handles them).
## Behavior
Bar length is relative to the largest value, not the first stage, so a middle stage that grows again does not overflow. All bars start at the left. A centered funnel shape makes lengths hard to compare, so it is not used. A stage with value 0 keeps its row without a bar. When the previous stage is 0, the rate shows "–". Rates have one decimal place (`formatPercent`). There is no limit on the number of stages and nothing folds into "other" because there is only one color. Above 7 stages a table works better.
## Accessibility
See `charts/README.md`. The root is `role="img"` with ariaLabel, and the ChartCard table view covers reading the numbers. Stage names, values and rates use text tokens (`fg.*`), never the bar color. Bars keep 3:1 or more on `chart.track`.
## Density
Row height `density.row-height` (compact 36 · comfortable 40 · touch 48). Below `breakpoint.sm`, the stage name moves to its own line above the bar and only one rate column shows (from the previous stage when both).
## Platform differences
Native draws `react-native-svg` bars with the same props (Phase 3). Instead of a tooltip, pressing a row pins the value and rate.
## Avoid
A different color per stage (it is one measure, code review) · a centered funnel shape (code review) · no table view (code review) · computing conversion in screen code (use `funnelSteps`, code review).
## Stories
Pipeline (sales stages) · Both (previous and cumulative) · Amount (amount unit, no summary).
## References
SY-12 · PG-40. dataviz skill: one measure gets one color, and bars start from the same baseline.
