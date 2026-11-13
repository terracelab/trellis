---
props:
  rows: Changed field rows (build them with diffFields)
  layout: Shape (table or one-line list)
  maxRows: Rows to show first (more shows a `외 N건` button, N more)
  empty: Text when there are no rows
  caption: Table title (hidden)
examples:
  Confirm: Confirm before saving — A table of target, field and change. Before values are struck through.
  History: Change history — One line per change in monospace text, showing two rows first.
  States: Empty and collapsed — With no rows it shows one line of empty text. Past maxRows, the rest opens with a button.
---
# ChangeDiff
## Purpose
Use it to show before and after for each field, before saving or in a change history (unit price 1,200 to 1,350, approval line, due date change). Build the rows with the contracts function `diffFields(before, after, fields)`. For a time-ordered record use Timeline, and for errors before saving use IssueList.
## Anatomy
table layout: table (hidden caption, header `type.caption` `fg.tertiary`, `border.divider` between rows) · target · field (`fg.secondary`) · change (before, arrow, after). list layout: list (one line per row, text in `font.family.mono` and `type.mono`) · lead (target and field in `fg.secondary`). Both: before (strikethrough, `fg.tertiary`) · arrow (arrow-right 16 `fg.tertiary` with hidden text) · after (`fg.primary` 600) · empty value (a dash with hidden text) · more (ghost button for the remaining rows).
## Props
Generated from the contract.
## Variants
layout table (confirm dialogs and detail screens) · list (change history and narrow areas). When no row has a target, the target column is not drawn.
## States
default · focus (focus ring on the more button). hover, active, disabled, loading and error do not apply (while loading, the parent draws a Skeleton).
## Behavior
Values arrive as already formatted text (diffFields formats numbers with thousands separators and dates as ISO). Empty or null values show as a dash. With more rows than maxRows, only the first maxRows rows show, and the more button opens them all (pressing again collapses them). With no rows, one line of empty text shows (`바뀐 내용이 없습니다` by default, no changes).
## Accessibility
The table has a `caption` (`변경 내용` by default, changes, hidden) and `th scope="col"`. The list is a `ul` named by the caption. Before values are `del` and after values are `ins`, so screen readers announce deletion and insertion. The arrow is decorative, and hidden text reads instead (`에서` in Korean, to in English). The expand button has `aria-expanded`. The before value in `fg.tertiary` is secondary information that always comes with a strikethrough. After values use `fg.primary`.
## Density
Table rows are at least `density.row-height`, text uses `density.body-font-size`. List rows are a `type.mono` line plus `space.4`. On a phone the table also stacks each row into two lines (field above, change below).
## Platform differences
Native draws only the list layout, and the table becomes two-line cards with the same rows. Strikethrough uses textDecorationLine.
## Avoid
Red for before values and green for after values. A left stripe on changed rows (D-57). Listing fields that did not change. Formatting values outside the component with string templates. Code review checks these.
## Stories
Confirm · History · States.
## References
`_shared/diff.ts` (diffFields), Timeline, IssueList, content.md §4 (numbers and dates).
