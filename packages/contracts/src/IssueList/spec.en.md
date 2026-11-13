---
props:
  items: Validation results (errors first)
  title: Header title
  onSelect: Called when an item is pressed (moves to that row)
  onDetail: Details button
  loading: Validating (Skeleton)
  empty: Text when there are no items
  maxHeight: Maximum list height (CSS length)
examples:
  BeforeSave: Before saving — Errors come first, then warnings. Pressing an item moves to that row.
  WithDetail: With details — Each item has a Details button that opens the rule explanation.
  States: States — Loading shows a Skeleton list, no items shows one line of text, and a long list scrolls inside maxHeight.
---
# IssueList
## Purpose
Use it to gather the errors and warnings found by validation before saving or requesting approval (grid editing, voucher entry, bulk import). Pressing an item moves to that row or cell. For form submit errors (field name and sentence, focus moves to the field) use ErrorSummary, for one field's error use Field, and for the save result use Toast or Banner.
## Anatomy
root (`bg.surface`) · head (title `type.label` 600 `fg.primary` and counts such as `오류 2 · 경고 3` (errors 2, warnings 3) in `type.caption` `fg.secondary`) · list (only the list scrolls past the maximum height) · item (icon, tag, title, message and details, `border.divider` between items) · icon (error circle-x `status.danger.default`, warning triangle-alert `status.warning.default`, 16) · tag (`type.caption` `fg.secondary`, 1px `border.default` outline, `radius.sm`) · title (`density.body-font-size` 600 `fg.primary`) · message (`type.caption` `fg.secondary`) · detail (ghost sm button) · empty (one line, `fg.tertiary`).
## Props
Generated from the contract.
## Variants
With onSelect, each item body is a button (moves to that row). Without it, items are text. With onDetail, each item gets a Details button. Levels differ by icon shape (an x in a circle, an exclamation mark in a triangle). No background colors and no left stripes (D-56, D-57).
## States
default · hover (pressable items get a `bg.sunken` background, `duration.fast`) · focus (focus ring on item buttons) · loading (Skeleton list with 3 rows, `aria-busy`). active, disabled and error do not apply (the list itself is the part that shows errors).
## Behavior
Errors come first, then warnings. Within a level, the given order (the row order on screen) stays. Pressing an item calls `onSelect(id)`, and the screen scrolls to that row and moves focus (for example with DataGrid `scrollToKey`). Details calls `onDetail(id)` (a rule explanation drawer or popover). With no items, the empty text shows (`확인할 항목이 없습니다` by default, nothing to check). Past maxHeight only the list scrolls and the header stays. Filtering by level (errors only, warnings only) is added by the screen with SegmentedControl.
## Accessibility
The root is `role="group"`, named by title (`확인할 항목` by default, issues to check). The list is a `ul`. Levels are announced through icon shape and hidden text (error or warning), not only through color. The count text is `aria-live="polite"`, so new counts are read after validation runs again. An item button is named by level, tag, title and message. A Details button is named `{title} 자세히` (details for the title). When a list without buttons scrolls, the list becomes a `tabIndex=0` region so the keyboard can scroll it.
## Density
Items use `density.row-height` (compact 36, comfortable 40, touch 48) as their minimum height, with `space.8` above and below. Text uses `density.body-font-size`.
## Platform differences
Native uses FlatList with Pressable items. Details is the same button, not a long press.
## Avoid
Splitting errors and warnings into colored cards. A colored stripe left of an item (D-57). Telling levels apart by color alone. Using it for form submit errors (use ErrorSummary). Warnings above errors. Code review checks these.
## Stories
BeforeSave · WithDetail · States.
## References
ErrorSummary, DataGrid, content.md §5 (errors say what is wrong and how to fix it).
