---
props:
  options: Options (value · label · disabled · leading · note)
  value: Value (controlled)
  defaultValue: Initial value
  onChange: Called on change
  placeholder: Shown when there is no value
  size: Height
  disabled: Disabled
  invalid: Error
  required: Required
  name: Form name
  width: Width
  label: Accessible name outside a Field
examples:
  Basic: Warehouse selection — The Field label gives the accessible name.
  Marks: Leading mark and note — Dot colors come only from chart series, status tone and approval state names. The chosen option's mark also shows in the closed field.
  Empty: Empty list — When there is no option to choose, the popup shows one line of guidance.
---
# Select
## Purpose
Use it to pick one option from a fixed set (status, warehouse, tax type). Use CodeSearch when there are many options and search is needed.
## Anatomy
trigger (same border and height as Input) · mark (leading mark of the chosen option) · value · chevron · popup (`bg.elevated`, `shadow.md`, `radius.md`, `z.dropdown`) · item (height `density.row-height`, leading mark, name, note and a check on the selected item) · mark (a `space.8` dot colored by its tone token, or a 16 icon in `fg.secondary`) · note (`type.caption` in `fg.secondary`, regular weight even on the selected row, `fg.disabled` on disabled rows) · empty (message when there are no options, `fg.secondary`). Narrow screen: sheet (title = label) · option (height `space.48`, leading mark, name, note and a check on the chosen item).
## Props
Generated from the contract.
## Variants
5 sizes (xs · sm · md · lg · xl), width auto · full. The leading mark of an option is a dot (`kind: 'dot'`) or an icon (`kind: 'icon'`). A dot's tone takes token names only (`SelectMarkTone`): chart series slots series-1 to 5 · compare · income · expense · success · warning · danger (`color.chart.*` · `color.finance.*` · `color.status.*.default`, the same colors as the legend), status tones info · neutral (the same colors as StatusDot), and the five approval states draft · pending · approved · rejected · withdrawn (`color.approval.*.default`, the same colors as the approval badge dot). The type rejects hex and CSS color strings.
## States
default · hover · focus · disabled · error.
## Behavior
Built on Base UI Select. Typing a character moves to the item that starts with it (it matches the name only, not the note). When it opens, the list is positioned at the selected item. When the chosen option has a leading mark, the mark also shows before the name in the closed field. The note shows only in the list. note is separate from disabled: an option can be usable and `사용 중` (in use), or unusable and `운영 종료` (closed). The check shows only on the selected row, and the other rows keep its space so notes line up at the same edge. When the width is narrower than `breakpoint.sm`, it opens as a sheet at the bottom of the screen, and pressing an item selects it and closes the sheet. The sheet can be closed by swiping down. When there are no options, the popup and the sheet show `선택할 항목이 없습니다` (No options, messages `select.empty`) instead of an empty list.
## Accessibility
On a wide screen, the trigger is `role="combobox"` with a listbox. On a narrow screen, an `aria-haspopup="dialog"` button opens a `role="dialog"` sheet (title = label) that holds a `role="radiogroup"`. The Field label gives the accessible name. The leading mark is decoration, so it is `aria-hidden`, and the name carries the meaning (color is never the only cue). The note is part of the option text and is read with it, like `CRM 이전 사용 중` (CRM migration, in use). Note text contrast is at least 4.5:1 on `bg.elevated` (`fg.secondary`). The empty message is `role="status"`, and the listbox or radiogroup is not drawn then.
## Density
Trigger `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56), item `density.row-height`. Trigger text uses `density.input-font-size` from xs to md, and the larger of that and `type.body` at lg and xl (touch keeps 16). Sheet rows are `space.48` regardless of density (finger size).
## Platform differences
Native uses a bottom sheet (components.md §9).
## Avoid
A Select for 2 options (use RadioGroup or SegmentedControl; cells inside LineItemsEditor or DataGrid rows are the exception and use Select). Lists of more than 20 options (use CodeSearch). Passing a dot color as hex or a CSS variable (the type rejects it, use a tone name). A dot without a name to carry the meaning. A long explanation in note (one or two words). Code review checks these.
## Stories
Default · Placeholder · Error · Disabled · Marks (leading mark and note) · Empty (no options) · Narrow (sheet).
## References
Base UI Select. The dot color rules match chart `ChartColor` (components.md §11), the status vocabulary tones (vocab.ts) and the approval badge.
