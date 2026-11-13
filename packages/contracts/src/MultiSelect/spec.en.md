---
props:
  options: Options (value · label · disabled · leading · note)
  value: Selected values (controlled)
  defaultValue: Initial values
  onChange: Called on change (all selected values)
  placeholder: Shown when nothing is selected
  size: Height
  disabled: Disabled
  invalid: Error
  required: Required
  name: Form name
  width: Width
  label: Accessible name outside a Field, and the sheet title
examples:
  Basic: Several sales channels — Selecting nothing means all. With two or more, it shows `첫 이름 외 n` (first name and n more).
  Filter: In a filter bar — Content width (width auto). It is outside a Field, so label gives the accessible name.
  Marks: Approval state filter — The dots use the approval badge dot colors and the note shows a count. The closed field shows the dot of the first option whose name appears in the summary.
---
# MultiSelect
## Purpose
Use it to pick several options from a fixed set. It is mostly used in list filters (sales channel, status, warehouse). Use Select to pick one, and CodeSearch when there are many options and search is needed.
## Anatomy
trigger (same border, height and chevron as Select) · summary (placeholder when none, its name when one, `포근몰 외 2` (first name and 2 more) when several) · popup (same `bg.elevated` · `shadow.md` · `radius.md` · `z.dropdown` as Select) · item (height `density.row-height`, checkbox, leading mark, name and note) · box (`border.strong` border, `brand.default` background with a check when selected) · mark · note (same as Select: the dot uses its tone token, the note is `type.caption` in `fg.secondary`) · empty (message when there are no options, same as Select). The closed field shows the leading mark of the first option whose name appears in the summary, before the name. Narrow screen: sheet (title = label) · option (height `space.48`, checkbox, leading mark, name and note) · footer (clear selection · done).
## Props
Generated from the contract.
## Variants
5 sizes (xs · sm · md · lg · xl), width auto · full. The leading mark (dot or icon) and note use the same SelectOption and rules as Select (dot colors take `SelectMarkTone` token names only).
## States
default · hover (`border.strong`) · focus (`border.focus` with ring) · disabled (`bg.sunken`) · error (`status.danger.default` border). active and loading do not apply.
## Behavior
Built on Base UI Select (multiple). Each press on an item adds or removes it, and the popup stays open. Escape or a press outside closes it. Every change calls onChange with all selected values in option order. Filters apply at once (no apply button). Selecting nothing means `전체` (all). In a filter, use note for one or two words worth seeing before choosing, such as a count (`12건`, 12 items). When the width is narrower than `breakpoint.sm`, it opens as a sheet at the bottom of the screen. Pressing a row adds or removes it, and clear selection and done sit at the bottom. When there are no options, it shows the same `선택할 항목이 없습니다` (No options, messages `select.empty`) as Select.
## Accessibility
On a wide screen, the trigger is `role="combobox"` with an `aria-multiselectable` listbox. The Field label gives the accessible name. On a narrow screen, the trigger is an `aria-haspopup="dialog"` button, the sheet is `role="dialog"` with a title, and rows are `role="checkbox"` with `aria-checked`. The focus ring is always visible. The leading mark is `aria-hidden`, and the note is read with the option text. The empty message is `role="status"`.
## Density
Trigger `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56, the same CSS as Select), item `density.row-height`. Sheet rows are `space.48` regardless of density (finger size).
## Platform differences
Native uses a bottom sheet with the same check list and clear selection and done. The props are the same.
## Avoid
A MultiSelect for 2 or 3 options (use a group of Checkboxes or SegmentedControl). Lists of more than 20 options (use CodeSearch). An `전체` (all) option in the list (selecting nothing means all). Building the trigger text by hand (use `multiSelectSummary`). Code review checks these.
## Stories
Default · Filter (width auto) · Marks (approval state dots and count notes) · Error · Disabled · Narrow (sheet).
## References
Select · FilterBar. content.md §6 (`전체` for all, `외 n` for n more).
