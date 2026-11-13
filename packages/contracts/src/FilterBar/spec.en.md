---
props:
  children: Filter controls
  search: Search input at the front
  onReset: Reset (shows a button when set)
  resultCount: Number of search results
  activeCount: Number of changed filters (filter button on narrow screens)
  actions: Actions on the right
  layout: One-row toolbar or labelled grid (lookup screen)
  columns: Fields per row in grid
  onSearch: Grid search button and Enter in a field
  searching: Grid search in progress (search button loading)
  collapsible: Grid collapse (collapsed, the applied conditions show as chips)
  onClearFilter: Chip clear button (without it, the control onChange gets its default)
examples:
  LookupGrid: Lookup screen — A label column with fields in a grid; pick conditions, then search (`layout="grid"`). It collapses to a chip summary.
  AppliedFilters: Clearing chips — A chip on a non-default value gets a clear button that sends the default back to the control.
  ReceivingList: Above the receiving list — Attach it to the first row of a Card so it forms one unit with the table. It holds search, filters, reset, count and actions.
---
# FilterBar
## Purpose
Use it to put search, filters, reset, result count and bulk actions in one row directly above a DataGrid on a list screen. For a detailed search that lays out many conditions, use a Form inside a Drawer.
## Anatomy
root (`tl-filter-bar`, no background or divider of its own) · search (first) · filters (`space.8` between controls. PR-27: a Select, MultiSelect or PeriodPicker with a label becomes one "name value ▾" chip (`border.default` · `radius.md`, name `fg.secondary`, value 600). A chip on its default value (empty, `all` or the first option, usually "all") stays gray, and only a chip with another value gets `border.selected`, a `brand.subtle` background and the name in `fg.link`. search has the chips' `control-height-md` even when the app passes sm, width `space.64` × 5, a `border.strong` border and a `fg.secondary` icon, so the row's first action does not fade) · chip-clear (PR-30: a × button at the end of a non-default chip, full chip height, at least `space.32` wide, icon 16 `fg.secondary`, `fg.primary` on hover) · reset (ghost Button md, rotate-ccw. It matches the `control-height-md` of the search and chips in the row, so do not shrink it to sm. Keep controls that are not chips (SegmentedControl and others) at md in the row too, D-135) · count (`검색 결과 128건` (128 search results), `type.caption` `fg.secondary`, number `fg.primary` 500 tabular) · actions (far right). Narrow screen (PR-30): search (full row) · chips (one row that scrolls sideways; first the filter secondary Button with sliders-horizontal, `필터 2` (filters 2), then the chips; chips and the button are `size.touch.min` tall) · sheet (title `검색 조건` (search conditions), control height `space.40`, footer with reset · show count) · choices (chip group inside the sheet, chips `size.touch.min` tall with `border.default` · `radius.md`; a picked chip gets `border.selected` + `brand.subtle` + `fg.link` 600 and a check icon).
It is a toolbar row with no surface of its own. It uses the background of the place it sits on (`bg.canvas` on a screen). Place it directly above the DataGrid, closer to the table than to the part above it (header, banner). Block spacing is `space.12`. grid (PR-26): root (`border.divider` · `radius.lg` · `bg.surface`) · field (label column `space.64` × 1.5 in `bg.sunken` · `type.label` fg.secondary, plus the control; `border.divider` between fields and rows. The row divider runs to the right edge even when the fields do not fill the row, for example two fields in three columns) · keyword (search, full row) · foot (count · collapse ghost · reset secondary · search primary · actions) · summary (PR-30: one row of applied condition chips when the grid is collapsed, chips `control-height-sm` tall; with no conditions, `걸린 조건 없음` (no conditions applied) in `type.caption` `fg.secondary`).
## Props
Generated from the contract.
## Variants
search · reset · count · actions, each present or absent. layout inline (default) · grid (columns 2 · 3). Chip clear (onClearFilter or the control onChange) · grid searching · grid collapsible (PR-30).
## States
default. The controls inside carry the states. In grid, searching puts the search button in its loading shape (it is not a FilterBar state). The rest do not apply.
## Behavior
One row is the default, and it wraps when the width is narrow (actions keep the right end). When onReset is set, a reset button appears. The screen holds the values, and FilterBar only handles layout (use the controls with `value` + `onChange`).

**Clearing chips (PR-30).** A chip on a non-default value (the tinted chip from PR-27) gets a × button at its end. Pressing it calls `onClearFilter(name)`. name is the control's `name`, or its `label` when there is no name. Without onClearFilter, the control's `onChange` receives its default: the first option value for Select ("all") and an empty list for MultiSelect. A control whose value the screen does not hold (no `value`) gets no clear button. PeriodPicker has no default, so it is never tinted or cleared. The clear button goes away, so focus moves to that chip's control (for a collapsed summary chip, to the show conditions button).

**Narrow screens (PR-30).** When the width is narrower than `breakpoint.sm`, it becomes a search row, a chip row and a row with the count and actions. The chip row is one line that scrolls sideways. First comes the filter button (`필터 2`, filters 2, with activeCount), then each Select, MultiSelect or PeriodPicker that has a label, as the same chip used on wide screens. Pressing a chip opens that condition's sheet (the control's own sheet) right away. Chips and the button are finger sized (`size.touch.min`). Controls without a label are not in the chip row; they appear only in the `검색 조건` (search conditions) sheet. The filter button opens that sheet with every condition, one per row. The sheet footer has reset and `837건 보기` (show 837 results), which closes the sheet. In the sheet, controls that have a label show that name as text above them. Screen readers skip this text because they already read the control's name.

**Chip groups in the sheet (PR-30).** Inside the search conditions sheet, a Select or MultiSelect with 6 options or fewer (`FILTER_INLINE_MAX`) whose value the screen holds (`value` + `onChange`) opens as a chip group in place, with no second sheet on top. A Select becomes radio chips (one pick, applied at once) and a MultiSelect becomes checkbox chips. Chips are finger sized and wrap to the next line. With 7 options or more, or when the screen does not hold the value, the control stays as it is and opens another sheet on top when pressed (PeriodPicker too). `layout="grid"` is for lookup screens where people set several conditions and then search (the Korean ERP lookup pattern, PR-26). A control with a `label` shows that name in the label column, and `search` takes a full row named `검색어` (Keyword). With `onSearch`, a search button appears and Enter in a field also searches (form submit). Below 1024 it shows one field per row; below `breakpoint.sm` it uses the same chip row and sheet as inline. With `searching` (PR-30), the search button takes its loading shape and cannot be pressed, Enter in a field does not call onSearch, and the form gets `aria-busy`. With `collapsible` (PR-30), the foot gets a `조건 접기` (hide conditions) button. Collapsing hides the grid (typed text stays) and shows the applied conditions as one row of chips in its place. Summary chips are the label controls on non-default values (`입고 상태 입고 완료`, receiving status: received) and the keyword (when search is an input with `value`), and control chips have a clear button. With no conditions it reads `걸린 조건 없음` (no conditions applied). It starts expanded. Collapse it after searching to see more of the table.
## Accessibility
Uses `role="search"` + `aria-label` (`label`, or `검색 조건` (search conditions) when absent). With more than one FilterBar on a screen, give each a different `label` (two search regions with the same name cannot be told apart, axe landmark-unique). The result count uses `aria-live="polite"`, so it is read when the filters change. Every control needs an accessible name (a Select without a label gets an aria name, not a placeholder). PR-30: the chip clear button is named "Clear <name>". Chip groups in the sheet are `role="radiogroup"` (Select) or `role="group"` (MultiSelect), and the name text above becomes the group name through `aria-labelledby`. Chips are `role="radio"` or `role="checkbox"` with `aria-checked`, and a picked chip also shows a check icon, not only a color. The collapse button has `aria-expanded` + `aria-controls` (the grid), and the collapsed summary is `role="group"` named "Applied conditions". The narrow chip row holds only buttons, so Tab moves through it and scrolls each into view.

| Key | Action |
|---|---|
| Tab | Search, chips, clear buttons, reset and actions in order |
| Enter (grid field) | Search (ignored while searching) |
| Space · Enter | Clear a chip, collapse, pick a chip in the sheet |
## Density
Vertical padding `space.8`, horizontal padding `density.card-padding`. Control height `density.control-height-md`. Narrow-screen chips, the filter button and chips in the sheet are `size.touch.min` (44) at every density.
## Platform differences
Native matches the narrow web screen (one search row + filter button → bottom sheet). The props are the same.
## Avoid
More than two rows (use a detailed search). An outside label on each filter. A separate search button (changes apply right away). Wrapping the narrow chip row onto several lines (it scrolls sideways). Opening a second sheet for a few options inside the sheet. Code review checks these (components.md §10 ListDetail).
## Stories
Default · WithActions · Narrow (chip row + sheet). LookupGrid (grid · collapsible) · AppliedFilters (chip clear).
## References
components.md §10 ListDetail. PR-26 (grid). PR-30 (narrow chip row · chip clear · chip groups in the sheet · searching · collapsible; notes/component-parity-2026-11.md §5 items 18 to 21).
