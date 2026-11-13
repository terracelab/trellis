---
props:
  data: Array of rows
  x: Field for the x axis
  series: Series (line or area). A comparison uses `dashed` + `compare`
  unit: Unit (won, items, %). Used in the subtitle, tooltip and table header, not added to value text
  height: Chart height (SVG user units). The card fixes the height so the layout does not jump while loading
  xFormat: x label format (`MM-DD`, month)
  yFormat: y label format (`만`, `억`)
  curve: Line interpolation. Use linear for lines with corners, such as forecasts
  showDots: Marker on every point
  endLabel: Series that gets the end-point value label
  yDomain: y range
  band: Shaded reference range
  forecast: "Forecast: from row `from`, the same series continues as a dashed line, with `lower`~`upper` shaded as the confidence band"
  ariaLabel: The chart in one sentence (what, which period, from where to where). Name for role="img"
examples:
  Area: Area — Single series with an end value.
  Compare: Comparison — This period as a solid line and the previous period as a dashed line (`compare`).
  Band: Target range — Shaded band with a linear line.
  Forecast: Demand forecast — Actual sales as a solid line, then a dashed forecast line with a shaded confidence band from the forecast start.
---
# TrendChart
## Purpose
Use it to show change over time as a line or area. A single series is an area, and a comparison (previous period) is a dashed line. With forecast, a dashed forecast line and a shaded confidence band continue after the actuals (demand forecast · order recommendation). Use ComboChart when amounts (bars) and the trend must show together, and BarList to compare categories.
## Anatomy
root (`role="img"`) · grid (horizontal lines `chart.grid`) · x axis / y axis (`chart.axis`, `type.caption`) · band (`chart.track` shading + label) · series (line 2px `series-n`, area is a gradient of the same color from opacity 0.12 to 0, compare is a dashed `compare` line) · dots (end point r 4, `bg.surface` border 2) · end label (`fg.primary` tabular) · forecast (forecast line: 2px dashed 4 4 in the series color, confidence band: area in the same color at opacity 0.14, start marker: dashed vertical `border.strong` line with the label `예측` (forecast) in `chart.axis`) · tooltip (`bg.elevated` · `shadow.md` · `radius.md`).
## Props
Generated from the contract.
## Variants
curve 3 × (single area / multiple lines / dashed comparison / forecast). Colors are `series-n` and `compare`.
## States
default · hover (tooltip + vertical cursor line `border.strong`). focus, active, disabled, loading and error do not apply (ChartCard handles them).
## Behavior
On hover or touch move, the tooltip shows the values of all series at the nearest x. With more than 4 series, development mode shows a warning (splitting into small multiples is recommended).

Forecast (forecast): one series (key, or series[0] when omitted) splits at row `from`. Up to row `from` it is the actual solid line (with its area for an area series), and from row `from` it is the dashed forecast line. Row `from` is where the two lines meet, so the tooltip shows only the actual value there. When both `lower` and `upper` fields exist, the space between them is filled with a light area in the same color (confidence band), shown in the tooltip as one row such as "forecast range 120~150". A dashed vertical line with the label `예측` (forecast) marks the `from` position. In the legend (ChartCard legend), list actual (line · square) and forecast (dashed) in the same color. Actual values in forecast rows may be empty, and they are not drawn when present. The confidence band counts toward the y range.
## Accessibility
See `charts/README.md`. End labels use `fg.primary`, and axis text uses `chart.axis` (4.5:1 or higher).
## Density
The caller sets a fixed height. At a width of 390, x ticks are spaced wider (`interval="preserveStartEnd"`).
## Platform differences
Native uses a tooltip that stays in place on touch, with no animation.
## Avoid
Mixing series with different units (dual axes). Value labels on every point. Hex values in series colors. Types and code review catch these.
## Stories
Default (area) · Compare (dashed) · MultiSeries · Linear+EndLabel · Band · Forecast (actual → forecast + confidence band) · Density.
## References
dataviz skill line/area rules. The cash on hand trend on the preview home screen is the Default story.
