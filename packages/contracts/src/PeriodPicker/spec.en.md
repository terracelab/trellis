---
props:
  value: Period (controlled)
  defaultValue: Initial period
  onChange: Called when a preset is chosen or apply is pressed
  presets: Preset list (in order)
  today: Baseline date for presets (today if omitted)
  max: Last date that can be picked (YYYY-MM-DD)
  maxDays: Recommended maximum number of days. Going over shows a warning (apply still works)
  placeholder: Shown when there is no value
  label: Name outside Field (the label text in a filter sheet)
  size: Height
  disabled: Disabled
  compare: Comparison period (controlled). Giving it adds the comparison row. null means no comparison
  defaultCompare: Initial comparison period (uncontrolled)
  onCompareChange: Called when the comparison changes. When the period changes, previous and same-period-last-year comparisons are recalculated and reported too
  compareModes: "Comparison modes: previous period · same period last year · custom"
examples:
  Basic: Query period — A preset applies right away. After editing the dates, press apply.
  VatPeriod: VAT return — Presets for VAT period 1 and period 2.
  Limits: Query limits — Days after max cannot be picked, and going over maxDays only shows a warning. The day count sits in the bottom row.
  Compare: Comparison period — Pick the previous period, the same period last year or a custom period below the dates. The trigger shows the comparison after the period.
---
# PeriodPicker
## Purpose
Use it to pick a query period with a preset or with a start and end date (voucher search, sales status, VAT return). Use DateField for a single date. When a dashboard needs a comparison period, compare adds previous period · same period last year · custom.
## Anatomy
trigger (same border and height as Select, calendar icon + `formatPeriod` value + chevron) · popup (`bg.elevated`, `border.default`, `shadow.md`, `radius.md`, `z.dropdown`) · presets (list on the left, item height `density.row-height`, `brand.subtle` background when selected) · dates (start date ~ end date text fields, the same fields as DateField) · calendar (range mode: first and last day filled with `brand.default`, a `bg.sunken` band between them) · error (`type.caption`, icon `status.danger.default`) · warning (when over maxDays, `type.caption`, icon `status.warning.default`) · days (the chosen day count `30일` (30 days), `type.caption` `fg.secondary`, left of apply) · apply (primary Button `적용` (apply)).
Narrow screens: sheet (title `기간 선택` (select period)) · presets (wrapping row of buttons, height `space.40`) · dates · calendar · footer (day count `6일` (6 days) + `2026-11-01~11-06 적용` (apply 2026-11-01~11-06)).
## Props
Generated from the contract.
## Variants
5 sizes (xs · sm · md · lg · xl). presets sets the list (today · this week · this month · last month · this quarter · VAT period 1 · VAT period 2 · this year).
## States
default · hover (`border.strong`) · focus (ring) · disabled (`bg.sunken`) · error (`status.danger.default` border when Field has an error). active and loading do not apply.
## Behavior
Built on Base UI Popover. Pressing the trigger opens it, and Escape or a press outside closes it. Pressing a preset applies that period right away and closes the popup. In the calendar, the first press sets the start and the next press sets the end. Pressing an earlier day swaps the two. A press after the range is complete starts a new range. Users can also type in the text fields, and the calendar moves to that month. Pressing apply commits the period. If the end date is before the start date, an error message shows and apply is blocked. Weeks start on Monday. Korean VAT has two taxable periods a year. VAT period 1 is January 1 to June 30, and period 2 is July 1 to December 31. When today is given, presets are calculated from that date and the calendar marks it as today. When the width is narrower than `breakpoint.sm`, it opens as a sheet at the bottom of the screen.

Day count: when both the start and end dates are set, the number of days counting both ends shows to the left of the apply button (11-01~11-30 = `30일`, 30 days, messages `periodPicker.days`). The narrow-screen sheet shows it in the bottom row (footer).

max: the last date that can be picked, 'YYYY-MM-DD'. Later days are blocked in the calendar. Typing a later day in a text field does not set the value and shows the same "you can enter dates up to {max}" message as DateField. Preset ends are cut back to max (when max is today, this month = the 1st to today). A preset that starts after max is disabled.

maxDays: the recommended maximum number of days (counting both ends). Going over shows a one-line warning, `{max}일이 넘는 기간입니다. 조회가 오래 걸릴 수 있습니다` (this period is longer than {max} days, loading may take a while, messages `periodPicker.overMaxDays`). Apply is not blocked. If it must be blocked, the app checks in onChange.
## Accessibility
The trigger is a `<button>`, and the Field label becomes its name. Outside Field (in a filter bar), giving label makes screen readers read the name and the period together, like `주문일 2026-11-01~11-06` (order date 2026-11-01~11-06). The popup has `role="dialog"` and `aria-label="기간 선택"` (select period). When it opens, focus moves to the first preset. When it closes, focus returns to the trigger. The preset that matches the current period has `aria-pressed="true"`. The date fields are named `시작일` (start date) and `종료일` (end date), and the calendar is `role="grid"` (same as DateField). The narrow-screen sheet is also `role="dialog"` with the title `기간 선택`. The focus ring is always visible. The reversed-dates and after-max messages are `role="alert"` and are linked to their field with `aria-describedby`. The maxDays warning does not block apply, so it is `role="status"` (polite). Day buttons after max are `disabled`.
## Density
Trigger `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56, trigger text follows Select), preset items `density.row-height`, popup inner padding `space.12`.
## Platform differences
Native shows the same preset list and two date fields in a bottom sheet.
## Avoid
Taking a period as two separate DateFields (start and end validation gets scattered). Changing preset labels to the casual `오늘` (today) or `이번 달` (this month) (content.md §6). Building the period text by hand (use `formatPeriod`). Code review checks these.
## Stories
Default · VatPeriod · Limits (max · maxDays · day count) · Empty · Disabled.
## References
content.md §4 (period format), §6 (`당일` · `당월` · `전월`, today · this month · last month). VAT taxable periods (period 1 · period 2).
