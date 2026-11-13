# Building dashboards

A dashboard is a screen that puts business numbers and their trends on one page. This guide is the order and the rules for assembling a dashboard from Trellis parts only. When a screen block fits, copy it and start there (see "Blocks to start from" below).

## Assembly order

Place five things from top to bottom. Users read the numbers, look at the trend for the reason, then act in the table.

| Order | Part | What it does |
| --- | --- | --- |
| 1 | [PageHeader](../components/PageHeader.md) | Screen name, reference date and unit. Layout editing and the download button go in `actions` |
| 2 | [FilterBar](../components/FilterBar.md) · [PeriodPicker](../components/PeriodPicker.md) | Query conditions and the period. Use PeriodPicker `compare` when a comparison is needed |
| 3 | A row of [KpiCard](../components/KpiCard.md) | About four numbers. The change goes in `delta` and the comparison target in `delta.label` |
| 4 | [DashboardGrid](../components/DashboardGrid.md) + [ChartCard](../components/ChartCard.md) | Chart widgets. Each widget sets `span` (columns out of 12) |
| 5 | [DataGrid](../components/DataGrid.md) + export | The list people act on. Put DataBar and HeatCell in table cells |

```tsx
<Page header={<PageHeader title="매출 분석" description="11월 6일 기준 · 단위 원" actions={<ExportButton module="sales" name="매출 분석" rows={rows} columns={CSV}>엑셀 다운로드</ExportButton>} />}>
  <FilterBar>
    <PeriodPicker label="기간" value={period} onChange={setPeriod} compare={compare} onCompareChange={setCompare} />
  </FilterBar>
  <DashboardGrid widgets={widgets} layout={layout} onLayoutChange={saveLayout} editing={editing} label="매출 분석 위젯" />
  <DataGrid caption="거래처별 매출" rows={rows} rowKey="partyId" columns={columns} summary />
</Page>
```

- **Comparing periods.** PeriodPicker `compare` offers the previous period, the same period last year and a custom range (narrow them with `compareModes`). `resolvePeriodCompare` (`@terracelab/trellis-contracts`) computes the comparison period. Keep KpiCard `delta.label` and the charts' `compare` series on the same comparison period.
- **Widget layout.** A widget is `{ id, title, span, content }`. Reordering and hiding happen in editing mode (`editing`) with the keyboard and buttons. There is no dragging. Save the array that `onLayoutChange` gives you as JSON and pass it back as `layout` next time. `dashboardLayoutOf` reconciles it when widgets are added or removed. Set `hideable: false` on the widget the screen is built around.
- **Export.** The button text is `엑셀 다운로드` (download for spreadsheets) and the file is CSV (UTF-8 BOM, amounts as plain numbers). Block screens use `ExportButton` (`@terracelab/trellis-blocks/ui`, blocked by `useCan(module, 'export')`). When building your own, use `toCsv` (contracts) and `downloadCsv` (react). Pass only the rows in view (after filters and data scope).

## Which chart

The table that picks a form from the question is in [Choosing a chart](charts.md). These four come up most on dashboards.

| Question | Component | Note |
| --- | --- | --- |
| How much will be needed | [TrendChart](../components/TrendChart.md) `forecast` | A solid actual line followed by a dashed forecast in the same color and a shaded range. `from` is the row where the forecast starts |
| How many remain at each step | [FunnelChart](../components/FunnelChart.md) | Left-aligned bars in one color with step conversion (`conversion`) |
| How does the mix change | [ComboChart](../components/ComboChart.md) `stacked` | Three or more series. From six series, everything after the fifth folds into other |
| How far against the target | [BulletBar](../components/BulletBar.md) · [RadialMeter](../components/RadialMeter.md) | A BulletBar list for several items, a RadialMeter for one |

Put a secondary measure in another unit (margin rate) in ComboChart `lower`. Do not split the axis in two. Pass `table` to every ChartCard to turn on the table view.

## States

| State | What to use |
| --- | --- |
| Loading | `loading` on KpiCard, ChartCard and DataGrid. The height stays, so the screen does not jump. For cards you build yourself, `Skeleton shape="kpi" · "card" · "table" · "list"` |
| No data | One sentence in ChartCard `empty` saying what is missing. DataGrid takes `empty`, and `filtered` when the conditions match nothing |
| Error | ChartCard `error` + `onRetry`, KpiCard `error` + `onRetry`, DataGrid `error` (request ID and retry). When the whole screen fails, `EmptyState kind="error"` |
| Reloading | ChartCard `refreshing`. The last chart stays and only a marker shows |

Do not cover the whole screen with one Spinner in the middle. Each card shows its own state.

## Phones

- Below 1280, DashboardGrid turns 2 and 3 column widgets into half rows. Widgets of 4 to 8 columns take a full row. Below 1024, only 2 and 3 column widgets sit two to a row and the rest take a full row. Below 640, there is one per row. The order is the same at every width.
- Below 640, KpiCard switches to two columns (name and value). DataGrid turns each row into a card.
- FilterBar becomes one row of chips, and PeriodPicker opens as a bottom sheet.
- Charts fill the parent width and keep their `height`. On the first phone screen, keep the numbers and one chart, and move the rest down.

## Fixed rules

- Income and increases are red (`finance.income`), expenses and decreases are blue (`finance.expense`). Say good or bad in words (`목표 미달`, below target).
- Write the unit once in the table header or the card subtitle (`단위 원`), not in every cell. Use `formatAmount` for amounts, `formatCompactWon` for axes and `formatPercent` for rates.
- Status shows as a dot and text (StatusDot, Badge in table cells). No row background colors, left stripes or gray pills.
- Chart colors use slot names only and stay fixed to the item. No dual axes.

## Blocks to start from

Copy with `pnpm ds:add <block id>`.

| Block id | Screen | What to look at |
| --- | --- | --- |
| `home/dashboard/trade` | Trading company dashboard | KpiCard row · ComboChart `lower` · BulletBar |
| `home/dashboard/people` | Home by role | Switching the view by role · Skeleton while loading |
| `erp/sales/analysis` | Sales analysis | Year-to-date comparison · mix charts · DataBar in table cells |
| `home/dashboard/forecast` | Demand forecast and order suggestions | Trend with a forecast range and order suggestions |
| `home/dashboard/franchise` | Franchise overview | Comparing numbers by franchise store |
