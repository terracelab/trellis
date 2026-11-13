---
props:
  columns: Column definitions
  rows: Rows
  rowKey: Column that identifies a row
  caption: Table name (accessibility)
  selectable: Row selection checkboxes
  selected: Selected rows (controlled)
  onSelectedChange: Called when the selection changes
  onRowPress: Called when a row is pressed
  activeRowKey: Open row
  sort: Sort (controlled)
  defaultSort: Initial sort
  onSortChange: Called when the sort changes (without it, the table sorts by itself)
  loading: Skeleton rows
  empty: Empty state
  summary: Total row
  height: Height
  rowTone: Row status value (data-tone). Draws no stripe or background. The status column shows the status
  mobile: Layout on narrow screens
  onCellChange: Called when a cell edit is saved
  filters: Column filters (controlled)
  defaultFilters: Initial column filters
  onFiltersChange: Called when the column filters change
  columnSettings: Column settings button (hide · order; storageKey saves on this device)
  columnState: Column order and hidden columns (controlled)
  onColumnStateChange: Called when the column settings change
  groupBy: Column to group by (subtotal rows)
  groupLabel: Group heading text
  childrenKey: Column that holds child rows (tree)
  defaultExpanded: Tree rows open at first
  virtualize: Draw only visible rows (auto = fill and more than 200 rows)
  rowActions: Row action cell at the end (one main action plus More)
  dividers: Cell dividers (auto = vertical lines when 4 or more number columns)
  error: Load error (an error block with retry instead of rows)
  filtered: Outside search or filters are applied (the empty state becomes no results)
  groups: Column group headers (column.group)
  isDirty: Unsaved cell (corner dot plus hidden text)
  dirtyHint: Hidden text for unsaved cells
  scrollToKey: Scroll this row into view
  flashKey: Give this row the selected background for one second (a row that just changed)
examples:
  Receivables: Amounts to collect — Number columns side by side: dividers (auto), header unit (`원`), result column, two-line cell, link column and row actions.
  Invoices: Tax invoice list — Amount formatting, sort, selection and totals.
  EmptyAndLoading: Empty state and loading
  Editable: Cell editing — Move between cells with the arrow keys and edit with Enter or F2. Enter saves, Esc cancels, Tab goes to the next editable cell, and quantity must be 1 or more. Edited cells get the unsaved dot, and saving gives the last edited row the selected background for one second.
  FiltersAndColumns: Column filters and settings — Filter the partner name by text and region or grade by value. Column settings are saved on this device.
  Grouped: Group subtotals — Group by department with a subtotal per group and a total at the bottom. Press a group heading to collapse it.
  Tree: Tree rows — Rows with levels, like a chart of accounts. Buttons open and close them. The total adds only the lowest level.
  ThousandRows: 1,000 rows — With height="fill" and more than 200 rows, only visible rows are drawn. The header, sort and filters work as usual.
  ErrorAndNoResult: Load error and no results — An error block with the request ID and retry, and the no-results shape when outside filters are applied.
  ColumnGroups: Column group headers — Supply value and tax under "Amount". The memo column hides between 1024 and 1279.
---
# DataGrid
## Purpose
Use it to show the main body of a business list (purchase orders, tax invoices, inventory, ledgers). It handles column formatting, sorting, selection, totals, the empty state and loading in one consistent way. The same table also does cell editing, column filters, column settings, group subtotals, tree rows and virtual scrolling (1,000 rows).
## Anatomy
wrapper (`bg.surface`, `border.divider`, `radius.lg`, horizontal scroll) · head (sticky, `bg.canvas`, `type.label` fg.secondary) · row (height `density.row-height`, `border.divider` below, hover `bg.canvas`, the open row gets only a `brand.subtle` background) · cell (numbers right-aligned · tabular, units in fg.tertiary) · tone (sets only `data-tone`; it draws no left stripe or row background, and the status shows as the dot · badge in the status column) · foot (totals, sticky at the bottom, 600) · sort icon (visible on the sorted column only; on other columns it appears on hover or focus; always visible on touch screens) · status badge in a cell (a subtle Badge with a dot shrinks to the dot + text at 500 with no background; tags without a dot and solid badges stay as they are). Narrow screens (below `breakpoint.sm`): cards (one card per row, `bg.surface` · `border.divider` · `radius.lg`, padding `space.12` `space.16`) · card-top (title 500 + trailing `type.amount` on the right) · card-status (badge line) · card-meta (`type.label` fg.secondary, `·` between items, numbers prefixed with the column name) · chevron (when onRowPress is set) · cards-head (select all) · cards-foot (total = sum of the trailing column). Business features: head-cell (name + sort + 24 filter button; an active filter turns the button `fg.link` and its name becomes "Filter <column>, applied") · settings (last header column, pinned to the right) · popover (`bg.elevated` · `border.default` · `radius.md` · `shadow.md`, no shadow in dark) · group (group heading row `bg.canvas` 600 with an arrow, name and count in `fg.secondary`; subtotals sit in the total: 'sum' columns) · tree (the first cell is indented `space.20` per level, and leaf rows keep the 24 toggle space so text lines up) · edit (a button that shows the value, inset `border.default` outline on hover; while editing, a `border.focus` input; an invalid value gets a `status.danger.default` border and the reason under the cell) · card-group (group heading between cards, subtotal of the trailing column). PR-26: header text fg.primary 600 (never lighter than the body) · head-unit (`(원)` after the header of amount columns, the currency code for currency, fg.secondary 400; cells do not repeat `원`) · dividers (with `all`, vertical `border.divider` between cells; `auto` = 4 or more right-aligned columns) · emphasis column (`border.strong` on the left + 600, no background) · link column (`fg.primary` 500, underlined on hover or keyboard focus in pressable rows. The link color `fg.link` is the company color, which sits next to danger-red badges and made names read like errors. The whole cell is the link and the row cue, underline and name already say it opens a detail, so color is not needed to tell it apart (WCAG 1.4.1), D-146 proposal) · actions (last cell: one sm button plus a More IconButton, right-aligned) · lines (DataGridLines: name + a `type.caption` fg.secondary second line; rows with it use `density.row-height-tall`). PR-30: group-head (column group header, centered over its columns at 600, `border.divider` vertical lines at both ends of the group, the second header row pinned below `density.row-height`) · dirty (a `space.6` `brand.default` dot at the top right of an unsaved cell plus the hidden text "Not saved"; no left stripe or cell background) · flash (the flashKey row gets `bg.row-selected` for one second; the change uses the row transition `duration.fast`) · block (error, empty and no-results blocks are one EmptyState sm cell; on cards they sit in a card box) · cell focus (in a grid, a cell with no button takes focus itself with an inset `border.focus` ring).
## Props
Generated from the contract.
## Variants
selectable · summary · height auto · fill (grows only up to the remaining height, and ends at the content when there are few rows) · column width xs to xl · mobile cards (default) · scroll · cell editing (column.editable + onCellChange) · column filters (column.filter text · values) · column settings (columnSettings, storageKey) · groups (groupBy) · tree (childrenKey) · virtual scrolling (virtualize). dividers rows · all · auto · rowActions · column.link · column.emphasis · column.headerUnit · DataGridLines (two-line cell). PR-30: error (error block) · filtered (no-results shape) · groups + column.group (column group headers) · isDirty · dirtyHint (unsaved cells) · scrollToKey · flashKey (find a row) · column.priority low (hidden between 1024 and 1279).
## States
default · hover · focus (row; cells in a table with editable cells) · loading (6 skeleton rows). An error is not a state. The `error` prop puts an error block in place of the rows.
## Behavior
Without onSortChange, the table sorts by itself (numbers by value, text in Korean order). Pressing a button, link or checkbox inside a row does not call onRowPress. The table has a minimum width of the fixed-width columns plus 160 for each auto column. On narrow screens, auto columns do not disappear and the table scrolls horizontally. When finance is on for an amount column, positive values are red and negative values are blue. This follows the Korean convention where red means income or increase and blue means expense or decrease. When the width is below `breakpoint.sm`, each row becomes a card (mobile=cards). `column.mobile` sets each column's place on the card. Without it, the first text column is the title and the first amount column (or the first number column if there is none) is the trailing value. The next columns in order become meta, up to three, and the rest are hidden. Cards have no sort header, so they follow the current sort (the default sort). Tables that compare columns (inventory matrix, trial balance) use mobile=scroll to keep the table as it is and scroll it horizontally. Empty values sort last in both directions.

**Cell editing.** When `column.editable` is set and `onCellChange` is given, the cell becomes a button that shows the value. Click it or press Enter to open the editor. Enter saves, Esc cancels, and leaving the cell saves (an invalid value is reverted). The editor comes from `column.editor`, or from the format: amount · currency give an amount editor (commas and the won sign are removed), number formats give a number editor, date gives a date editor (digits alone become YYYY-MM-DD, impossible dates are refused), `options` give a select that saves as soon as you pick, and everything else is text. Clearing a number or date gives null. When `validate(value, row)` returns text, nothing is saved and the text shows under the cell. The table does not change the value itself. The parent updates the row in onCellChange and passes it back. Esc cancels only the edit and does not close a surrounding Drawer or Dialog. For entry tables where lines are added and removed, use LineItemsEditor.

**Column filters.** `column.filter` text matches the typed text in the value or the shown text, ignoring case. values lists the values found in the rows (names and order from options when present, a count per value, a search box from 9 values). Picking everything is the same as no filter, and unchecking everything shows no rows. Filters work on the rows the table has. Conditions searched on the server go in FilterBar. Filters on hidden columns are not applied. When nothing matches, the table says "No rows match the filters" with a Clear all filters button. Totals and subtotals add only the filtered rows. Use `filters` · `onFiltersChange` to keep them in the parent and in the URL.

**Column settings.** With `columnSettings`, a button appears at the end of the header with a visibility checkbox per column, move up and move down buttons, and Reset. The order counts hidden columns too. `column.hidden` hides a column at first, and `hideable: false` cannot be turned off (the row name column). The last visible column cannot be turned off either. With `storageKey`, the settings are saved on this device (localStorage `trellis.dataGrid.<key>`) and read after mount. When columns change later, missing columns are dropped and new ones are added at the end. To save on the server, use `columnState` · `onColumnStateChange`. Cards on narrow screens use the visible columns.

**Group subtotals.** Rows are grouped by the `groupBy` column. Groups appear in the order they first show up in the sorted rows. Each heading shows the name (`groupLabel` or the column format), the count and the subtotal of each total: 'sum' column. The heading text spans the cells before the first subtotal column. Press the heading to collapse the group. Rows inside a group indent the first cell by the toggle width. A zero subtotal is drawn the way the data rows of that column draw zero. If the column's `render` returns a blank for zero (debit and credit in a trial balance), the subtotal is blank too, and a column with only a format shows `0`. The heading button is `density.control-height-xs` tall, so it becomes 44 in touch density (phones). groupBy and childrenKey are not used together.

**Tree rows.** The child array in the `childrenKey` column draws the levels. Sorting happens among siblings, and filters keep the ancestors of matching rows. Totals add leaf rows only, so a parent that already holds its children's sum is not counted twice. `defaultExpanded` (a key list or 'all') sets the rows open at first. Select all covers every filtered row, open or not.

**Virtual scrolling.** `virtualize` auto (default) turns on with height fill and more than 200 lines on screen (group headings included). Only the visible lines and 12 above and below are drawn, and line heights are measured after drawing (wrap columns work). The header and totals stay pinned, the table gets `aria-rowcount` and each line `aria-rowindex`. Cards on narrow screens scroll the page, so they do not use virtual scrolling. Pressing inside the row action cell (`rowActions`) does not call onRowPress, and neither does a click inside a Menu popup rendered in a portal. On narrow-screen cards the actions sit before the chevron. The header unit is skipped when the header already has parentheses (`금액(원)`), and `headerUnit={false}` turns it off. When 5 or more columns would get it automatically (narrow amount columns side by side, as in payroll), none get it because the headers would be cut off; state `단위 원` (in won) once in the table title, subtitle or count line instead.

**Errors and empty states (PR-30).** Every block that stands in place of rows is an EmptyState sm, and the card layout (narrow screens) uses the same blocks. The order is loading (skeleton), then `error`, then no column filter matches, then an empty list. With `error`, a kind="error" block replaces the rows and totals. The title is `error.message` (or "Could not load the list"), the description is "Try again in a moment", `requestId` adds a "Request ID …" line, and `onRetry` adds a "Try again" button. When refreshing rows that are already shown fails, do not pass `error`; keep the rows and report it with a Toast. When the column filters match nothing, a kind="noResult" block says "No rows match the filters" with a "Clear all filters" button. An empty list uses `empty`. Text is split so the first sentence is the title and the rest is the description (`이번 달 전표가 없습니다. 전표 입력에서 추가하세요`, no vouchers this month; add one in voucher entry). A node is drawn as it is (when you pass an EmptyState yourself). Turn on `filtered` when outside conditions are applied (a FilterBar keyword or non-default filters). The empty list then takes the noResult shape with the search icon, and without `empty` the title is "No rows match the filters".

**Keyboard cell navigation (PR-30).** A table with editable cells (`column.editable` + `onCellChange`) becomes `role="grid"` and has one Tab stop inside (the current cell). On first entry it is the first editable cell of the first row. A cell with a button or input focuses that control; a cell without one takes focus itself. When a cell holds several buttons (the row action cell), Left and Right step through them. Header cells (sort, filter, column settings) are reached with Tab. A table without editable cells stays a table and rows open with Tab and Enter. There are no single-letter shortcuts (j · k). Virtual tables work the same way (moving to a line that is not drawn brings it into view, then focuses it).

| Key | Action |
|---|---|
| Right · Left | Next cell (or next and previous button when a cell has several). Stays at the ends |
| Down · Up | Same column in the row below or above |
| Home · End | First or last cell of the row |
| Ctrl+Home · Ctrl+End | First cell of the first row, last cell of the last row |
| PageDown · PageUp | One screen (visible rows − 1) down or up |
| Enter · F2 | Starts editing on an editable cell. On other cells Enter opens the row (onRowPress) |
| Enter (editing) | Saves and returns to the cell |
| Esc (editing) | Cancels and returns to the cell. A surrounding Drawer or Dialog stays open |
| Tab · Shift+Tab | Next or previous editable cell (saves first while editing). Leaves the table after the last or before the first editable cell |
| Space | Selection checkbox and buttons |

**Column group headers (PR-30).** `groups` (key · header · sticky) and `column.group` add one more header row over adjacent columns ("Amount" over supply value and tax). Keep the columns of a group next to each other. If they are apart, the group header is split. Columns without a group span both header rows (rowSpan 2). A `sticky` group pins its header cell to the left. Use it when the group's columns are sticky. When column settings or priority hide every column of a group, its header hides too.

**Unsaved cells (PR-30).** A cell where `isDirty(row, key)` is true gets a small dot at the top right (`brand.default`), and screen readers read `dirtyHint` (default "Not saved") at the end of the cell. On an editable cell it is added to the end of the edit button name ("6, Edit Quantity, Not saved"). Do not mark it with a left stripe, a cell background or bold text (D-57). The screen puts "3 cells not saved" and a save button in an ActionBar above the table. The card layout has no cell editing, so it shows no marker.

**Find a row (PR-30).** When `scrollToKey` changes, the table scrolls that row into view (a virtual table brings the line in). When `flashKey` changes, that row gets the selected row background (`bg.row-selected`) for one second. Pass both to point at a row that was just saved or added. To show the same row again, set it to null and back. Rows inside a collapsed group or tree are not found. With reduced motion only the fade time becomes 0, and the one-second highlight stays.

**Horizontal overflow and pinned columns (R-37 4, D-136).** When the table is wider than its frame, an inner shadow (`shadow.lg` + `shadow.md`, `space.32` from the edge) appears on each side that hides content. It goes away on the left when you scroll to the start and on the right when you reach the end. With pinned columns the shadow sits at the pinned column boundary instead of the frame edge. `column.sticky` is true · `'start'` (left) or `'end'` (right). Pin a result column (total deductions, net pay, `emphasis`) with `'end'` so it stays visible in a wide table. Several pinned columns on one side are offset by the width of the ones before them (keep left ones at the start of the table and right ones at the end). Keyboard movement and reading order follow the column order. With reduced motion only the fade time becomes 0. The horizontal scrollbar sits at the bottom of the table and can be below the first screen; use `height="fill"` so the table only grows to the remaining height and the scrollbar stays at the bottom of the visible frame. There is no separate scrollbar that follows the screen (one scroll drawn twice is picked up twice by keyboards and screen readers). A cell cut off with an ellipsis gets its full text as `title` only when you point at it (cells that are not cut, `wrap` cells and titles set by the app are left alone). Screen readers already read the full cell text.

**Hiding columns at mid widths (PR-30).** A column with `column.priority: 'low'` hides at widths from 1024 to 1279 (breakpoint.lg up to xl), such as a landscape tablet or a small laptop. It is separate from visibility in column settings, and a column filter on it stays applied while it is hidden. Widths of 1280 and up and the narrow-screen cards are not affected.
## Accessibility
`<table>` + `<caption>` (hidden). The scroll box has `role="region"` + the table name + `tabIndex=0` (horizontal scroll by keyboard). Sorted columns set `aria-sort`. Each selection checkbox is named with the row name followed by `선택` (select). Enter opens a row. Cards are a `<ul>` list, each card opens with Tab and Enter, and select all is a checkbox above the list. An editable cell's button is named with the visible value followed by ", Edit <column>" so voice input can press it by the value it shows. The editor is named with the column name, and an invalid value sets `aria-invalid` with the reason linked through `aria-describedby` (`role="alert"`). Filter, column settings and expand buttons have names and report their state through the name (filter applied) or `aria-expanded`. After moving a column, focus stays on the same column's button. Subtotal cells read a hidden "Subtotal" first. PR-30: a table with editable cells is `<table role="grid">` with `role="gridcell"` cells, `aria-rowcount` · `aria-colcount`, `aria-rowindex` on rows, `aria-colindex` on cells, and a roving tabindex (only the current cell is 0). Screen readers pass the arrow keys to the table inside it. Column group headers use `scope="colgroup"` + colSpan. The error block has `role="alert"`, so it is read when it appears. Unsaved cells are announced with hidden text, not only by the dot color. The cell focus ring is a 2px inset `border.focus`.
## Density
rows `density.row-height` (32 · 40 · 48), cell side padding `space.12`, text `density.body-font-size`. Cards keep `space.12` `space.16` padding at every density.
## Platform differences
Native uses ListTable (FlatList, sticky columns, no inline editing). Cell editing, column filters, column settings, groups, tree rows and virtual scrolling are web only for now (the props are in the contract and native ignores them).
## Avoid
Left-aligned numbers. Appending a won string to amounts by hand (use format). Different heights per row. Leaving a table with many columns in horizontal scroll on phones (only comparison matrices use scroll). Column filters on a server-paged list (they filter only the rows the table has; use FilterBar). A separate save button in every editable cell. Using groups and tree rows together. Marking unsaved cells with a left stripe or a cell background (D-57). Single-letter shortcuts in the table. Reporting a load error only with an empty table and a Toast (use error). Code review checks these.
## Stories
Ledger · Selectable · Empty · Loading · Fill · Cards (narrow screen) · Editable (keyboard cell navigation · unsaved cells · find a row) · FiltersAndColumns · Grouped · Tree · ThousandRows · ErrorAndNoResult · ColumnGroups.
## References
components.md §10 ListDetail, track E PE-07 (ledger preset). PR-26 (action cell · link column · dividers · header unit · result column · two-line cell). PR-30 (error and empty kinds · keyboard cell navigation · column groups · unsaved cells · find a row · priority; notes/component-parity-2026-11.md §5 items 25 to 29). WAI-ARIA APG Data Grid (structure only).
