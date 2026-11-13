---
props:
  rows: Rows from top to bottom in calculation order
  title: Title
  unit: Amount unit, shown once in the header
  activeKey: Key of the row to raise one background step
  loading: Skeleton in the amount cells
  status: Calculation status
  updatedAt: Time text for the updated status
  onRecalculate: Recalculate (when status is error)
examples:
  Payroll: Net pay — Earnings minus deductions equals net pay. The unit appears once in the header.
  TaxInvoice: Tax invoice with the active row — The row tied to the field being edited is one background step higher.
  States: States — Loading shows a Skeleton in the amount cells, calculating keeps the last values, and an error offers Recalculate.
---
# AmountBreakdown
## Purpose
Use it to show row by row how an amount was reached, as in item + item − item = total (net pay, supply value, tax and total, settlement amount). It also shows how a value being edited in a form feeds the result. For many amount rows use DataGrid, for a step-by-step bar picture use WaterfallChart, and for a single number use KpiCard.
## Anatomy
root (`bg.surface`) · head (title `type.label` 600 `fg.primary` · unit text such as `단위 원` (unit: won) in `type.caption` `fg.tertiary` · status) · row (operator cell, label, hint and amount, `space.4` between rows) · op (+ · − · =, `fg.tertiary`, fixed-width cell) · label (`density.body-font-size` `fg.primary`) · hint (`type.caption` `fg.tertiary`) · amount (right aligned, tabular, `fg.strong`) · total (1px `border.default` line above, label 600, amount `type.amount-lg`) · status (Spinner while calculating, the time it was updated, or an error icon `status.danger.default` with Recalculate).
## Props
Generated from the contract.
## Variants
The header changes with title, unit and status. With none of the three, no header is drawn. The row with op '=' is the total row. The activeKey row raises its background one step to `brand.tint` (no left stripe, D-57).
## States
default · loading (a Skeleton in each amount cell, labels stay, `aria-busy`) · error (status error shows `계산하지 못했습니다` (could not calculate) in the header with a Recalculate button, `data-state="error"`). calculating shows a Spinner with `계산 중` (calculating) in the header and keeps the last amounts. hover, active, focus and disabled do not apply (the Recalculate button follows Button states).
## Behavior
Amounts come only from `formatAmount` (thousands separators, U+2212 for negatives). A subtracted row passes its value as a positive size and uses op '−'. The first row has no operator. The unit is not repeated in every cell. It appears once in the header as `단위 원` (principle 3). In development mode, a warning appears when the total row differs from the sum of the rows above it. status updated shows updatedAt as `{time} 기준` (as of the time). The Recalculate button appears only with onRecalculate.
## Accessibility
The root is `role="group"`, named by title (`금액 계산`, amount breakdown, when there is no title). Rows are a `dl` (label = `dt`, amount = `dd`). Operator glyphs are decorative (aria-hidden), and hidden text reads plus, minus or equals instead. The status text is `aria-live="polite"`, so calculating, the update time and errors are announced when they change. Amount contrast uses `fg.strong` and `fg.primary`, above 4.5:1.
## Density
Row height is the line height plus `space.4` above and below. Text follows `density.body-font-size`. The total amount uses `type.amount-lg` and does not depend on density. On a phone each row stays on one line (label left, amount right), and the hint moves under the label.
## Platform differences
Native draws the same rows as View rows and attaches the operator text through accessibilityLabel.
## Avoid
`원` in every amount cell. Subtracting twice with a negative value and the '−' operator. Highlighting the total row with a colored band. A left stripe on the active row (D-57). Adding commas with string templates. Code review checks these.
## Stories
Payroll · TaxInvoice · States.
## References
content.md §4 (amounts and units), principle 3 (unit once in the header), Payslip, WaterfallChart.
