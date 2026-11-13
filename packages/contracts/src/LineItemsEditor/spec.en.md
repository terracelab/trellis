---
props:
  caption: Table name (accessibility)
  value: Lines
  onChange: Called when lines change (add · remove · cell edit)
  lineKey: Column that identifies a line
  columns: Column definitions (editable cells use render)
  newLine: New line for Add line
  minLines: Lines that must stay
  maxLines: Maximum number of lines
  numbered: Number column
  lineError: Error for the whole line (under the line)
  cellError: Cell error (under the cell)
  totals: Totals group under the table
  footnote: One line under the totals
  empty: Text when there are no lines
  summary: Total row
  summaryLabel: First cell text of the total row
  addLabel: Add line button text
  addIcon: Add line button icon
  enterToNext: Enter moves to the next cell · adds a line at the last cell
  disabled: Blocks adding and removing
  name: Form name
examples:
  PurchaseLines: Purchase order lines — Enter an item, quantity and unit price, and the amount and total follow. Enter moves to the next cell, and Enter in the last cell adds a line.
  JournalLines: Journal lines — Two lines must stay, and a line with both debit and credit shows the reason under it.
  TaxInvoiceLines: Tax invoice items — Item is required, with supply amount, tax, total and the amount in Korean words below.
  BudgetLines: Budget items — Picking inside a cell uses Select (no RadioGroup in row cells). When labor costs pass 40% of the grant, the reason shows under that line.
  StaffLines: Project staff — Staff in a CodeSearch cell, role in a Select. A participation rate over 100% is a cell error.
  EmptyLines: Empty state — With minLines 0 every line can be removed, and the empty state says what to do next.
  CellErrors: Cell errors — The error text sits right under its input, and the other inputs, read-only cells, number and remove button of the line stay on one line.
  EmptyTotals: Totals with no lines — With zero lines, the total row, totals group and amount in words are not drawn. Only the empty text and Add line remain.
---
# LineItemsEditor
## Purpose
Use it for entry tables where you add and remove lines and fill in cells (journal lines, tax invoice items, purchase order items, quote items). Cells hold Trellis inputs (CodeSearch · AmountInput · QuantityInput · Input · DateField) through render. This component handles adding and removing lines, moving with Enter, totals, line errors and cards on narrow screens. For lists you browse or pick from, use DataGrid (for editing a single cell, DataGrid editable). Picking inside a row cell uses Select even for 2 to 5 options (an exception to the RadioGroup rule; a radio group does not fit in a row height).
## Anatomy
wrapper (`bg.surface`, `border.divider`, `radius.lg`, horizontal scroll) · head (`bg.canvas`, `type.label` fg.secondary, 600) · row (cell padding `space.4` `space.8`, `border.divider` below, cells aligned to the top) · number (xs number column, fg.secondary, tabular) · cell (an sm input fills editable cells; read-only cells put numbers on the right, tabular) · remove (IconButton sm trash-2 at the end of the line) · error (one line under the line, circle-alert + `status.danger.default` text `type.label`) · foot (total `bg.canvas` 600 + Add line Button sm plus) · required (`status.danger.default` 4 dot after the header text, hidden "(required)") · cell-error (`status.danger.default` text `type.label` right under the cell input, never breaking inside a Korean word) · totals (number group at the bottom right: name `type.label` fg.secondary above, value `type.amount` below, `space.24` apart) · footnote (one fg.secondary `type.label` line under the totals, the amount in Korean words) · empty (centered fg.secondary text when there are no lines). When the table does not fit (the box is narrower than the sum of minimum column widths, as in a drawer or on a tablet): rows (no header row, `border.divider` between lines, a head line with number + title field + remove, other fields in a grid with the name above and the input below, at least `space.64`×2.5 wide). Narrow screens (below `breakpoint.sm`): card (one per line, `bg.surface` · `border.divider` · `radius.lg`, padding `space.12`) · card-head (number + title field + remove, remove on the right; the number and remove button sit on the line of the title input) · card-fields (two-column grid, field name in `type.label` fg.secondary above and the input below; full fields take the whole row) · cards-foot (total + Add line).
## Props
Generated from the contract.
## Variants
numbered · summary · totals · footnote · minLines (0 shows empty) · maxLines · enterToNext · column.required · column.mobile (title · full · half · hidden). The width picks the shape: table (all columns fit) · rows (they do not) · cards (below `breakpoint.sm`).
## States
default · focus (cell) · disabled (adding and removing blocked; cell inputs get disabled too) · error (per cell with cellError, per line with lineError). Hover and active belong to the cell inputs. There is no loading state: an editing table changes values already there, so the screen shows a Skeleton while loading.
## Behavior
The parent holds the value (value · onChange), and a cell's render changes only its own line with `update(patch)`. Add line appends newLine() and focuses the first cell of the new line. After removing a line, focus goes to the same cell of the line above (its remove button, or that line's first cell when the button is off), or to the Add line button when there is no line above. Lines cannot go below minLines (the remove button turns off), and Add line turns off at maxLines. Tab moves between cells. Enter moves to the next input cell and adds a line at the last cell of the last line (enterToNext). Enter is left alone during Korean composition, with Shift+Enter, and in a cell whose list is open (aria-expanded=true, picking in CodeSearch). The total row adds the values of total: 'sum' columns and shows them with format. A line error shows the text lineError returns under the line as "<table name> <n>: text" and is linked to the line's first input cell through aria-describedby. A cell error shows the text cellError(line, index, key) returns under the cell. Cell renders are drawn inside FieldContext, so Trellis inputs in a cell get aria-invalid, aria-describedby and required automatically (the render ctx also passes invalid and size). Form errors (useTrellisForm's lines.0.qty) are passed through cellError. totals is a number group at the bottom right, one per line on phones, and footnote is the line under it. With zero lines the empty text shows (default "No lines yet. Use Add line to start"), and the total row (summary), the totals group (totals) and footnote are not drawn in any of the three shapes. Zero totals would hide what the empty state has to say (what to do next). They come back once a line is added. footer is app content and stays.

Alignment (R-35): when a cell error makes one cell taller, the inputs of that line still stay on one line. The table aligns row cells to the top (`vertical-align: top`), and inputs sit at the top of the cell rather than on the text baseline. Cells without an input (number, read-only cells, remove) use the input height (`density.control-height-sm`) as one line, so their text and button sit on the same line as the input text next to them. In the rows and cards shapes, read-only values are centered within the input height, and the number and remove button of the head line move down by the title field's name line so they sit on the title input's line. Error text sits right under its input. When the box is narrower than the sum of minimum column widths (a right drawer, a tablet), lines show without a header row; below `breakpoint.sm` each line becomes a card. Both shapes put field names above the inputs. The width is measured on this box, not the screen (ResizeObserver). Enter moves only between visible inputs, picker buttons and comboboxes. Hidden inputs inside parts (the QuantityInput number field, the Select value field) and helper buttons (CodeSearch's open list) have tabindex="-1" and are skipped, so Enter adds a line even when the last cell is a QuantityInput (R-34). Read-only cells show a status with column.tone(line): only the leading icon takes the status color (danger circle-alert, warning triangle-alert, success circle-check), the text stays body color, and hidden status text ("(needs attention)" and so on) is added. The Add line icon is addIcon (default plus, user-plus for staff).
## Accessibility
`<table>` + `<caption>` (hidden), and the scroll box has `role="region"` + the table name. The label passed to a cell's render is "<table name> <n> <column name>" (Korean `품목 2 단가`), used as the input's accessible name. Remove buttons are named "Remove <table name> <n>". Required columns get a hidden "(required)" in the header and required on the cell input. A line error is text in the row just below, not a description of the line's cells, and it is read through `role="status"` when it appears. On cards, the field name is visible text, and the input name ("Row 1 Quantity") contains that text (WCAG 2.5.3).
## Density
Row cell padding `space.4` `space.8`, inputs sm (`density.control-height-sm`). Card padding `space.12`, `space.8` `space.12` between fields.
## Platform differences
Native is the next Phase (this round is web only). It will use the same contract with one card per line (same columns · render) and the keyboard's next key (returnKeyType next) instead of Enter.
## Avoid
A save button in every cell. Reordering lines for no reason. Computing totals separately inside a cell render so they differ from the table. Leaving an entry table in horizontal scroll on phones.
## Stories
PurchaseLines · JournalLines · TaxInvoiceLines · BudgetLines · StaffLines · EmptyLines · CellErrors · EmptyTotals.
## References
components.md §10 forms · LedgerEntry pattern, docs/guides/forms.md (line items). Service request R-24 · R-34 · R-35 (cell error alignment, empty totals).
