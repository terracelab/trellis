# Choosing a chart

These are the 15 charts in `@terracelab/trellis-react/charts`. Pick the form from the question, then the component from the form.

| The user's question | Form | Component |
| --- | --- | --- |
| How much right now? | Number + small trend | Number card + [Sparkline](../components/Sparkline.md) |
| How does it change over time? | Line · area | [TrendChart](../components/TrendChart.md) |
| How much next? | Actual solid line + dashed forecast + shaded confidence band | [TrendChart](../components/TrendChart.md) `forecast` |
| Volume and flow together? | Bars + line (values in another unit go in the lower chart) | [ComboChart](../components/ComboChart.md) |
| How does the mix change? | Stacked bars (3 or more series) | [ComboChart](../components/ComboChart.md) `stacked` |
| How much per category? | Bars (horizontal · vertical, one color) | [BarList](../components/BarList.md) |
| What share of the whole? | Single-row bar · donut (5 slices or fewer) | [SegmentedBar](../components/SegmentedBar.md) · [Donut](../components/Donut.md) |
| How much per date? | One color in 5 shades | [CalendarHeatmap](../components/CalendarHeatmap.md) |
| What adds and what subtracts? | Waterfall (increase red · decrease blue, the Korean convention) | [WaterfallChart](../components/WaterfallChart.md) |
| How many remain at each stage? | Left-aligned horizontal bars (one color) + conversion rates | [FunnelChart](../components/FunnelChart.md) |
| Against a target or a limit? | One ring · list of target bars | [RadialMeter](../components/RadialMeter.md) · [BulletBar](../components/BulletBar.md) |
| Comparison inside a table? | Bar in a cell · conditional color | [DataBar](../components/DataBar.md) · [HeatCell](../components/HeatCell.md) |
| A card to hold the chart | Title · subtitle · legend · view as table | [ChartCard](../components/ChartCard.md) · [Legend](../components/Legend.md) |

## Rules

- **Colors by slot name only.** `series-1` to `series-5` · `compare` · `income` · `expense` · `success` · `warning` · `danger`. The types block hex values. Tokens handle dark mode and color vision deficiency.
- **Each item keeps its color.** Keep the channel → slot map as a constant, and do not change colors when a filter removes items. Do not recolor by rank.
- `series-1` = single series · current period, `compare` = previous period (dashed). Use status colors only for status, together with an icon and text.
- **One axis.** For values in different units, use the `lower` chart of `ComboChart` or two charts. No dual axes, 3D, radar charts or pie charts with 7 slices.
- **Table alternative.** Pass `table` to `ChartCard` to turn on `표로 보기` (view as table). It is for screen readers and for checking numbers, so pass it almost always.
- Every chart needs `ariaLabel` (required). Say what, for which period, and from where to where.
- Show value labels only at the end point and the maximum. The rest goes in tooltips and the table. Leave out an unfinished period (this month) or write `집계 중` (still counting) in the subtitle.
- Fix the height with `height` so the layout does not jump while loading. The width fills the parent.

## Number formats

Axes use `formatCompactWon` (`만` 10,000 · `억` 100,000,000), values use `formatAmount` (thousands separators · U+2212), and ratios use `formatPercent` (one decimal place, differences in `%p`, percentage points).

## Palette

| Slot | Light | Dark | Meaning |
| --- | --- | --- | --- |
| `series-1` | brand.500 | brand.400 | Single series · current period |
| `series-2` | green.500 | green.500 | Second series |
| `series-3` | violet.500 | violet.400 | Third series |
| `series-4` | teal.500 | teal.500 | Fourth series |
| `series-5` | amber.600 | amber.500 | Fifth series. Contrast in light is 3.0:1, so value labels and the table alternative are required |
| `compare` | neutral.400 | neutral.400 | Previous period (dashed) |

We checked that adjacent series differ by ΔE ≥ 15 in color vision deficiency simulations (protan · deutan). With more than 5 series, fold the rest into `기타` (other) or split them into several small charts. ComboChart folds everything after the fifth into one gray other series (`compare`) from 6 series on (`foldSeries`). No new colors are made.
