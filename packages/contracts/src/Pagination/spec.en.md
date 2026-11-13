---
props:
  page: Current page (starts at 1)
  pageCount: Total number of pages (total ÷ pageSize if omitted)
  total: Total number of items
  pageSize: Items per page
  onPageChange: Called when a page is chosen
  pageSizeOptions: Page size options
  onPageSizeChange: Called when the page size changes
  showTotal: Shows the total count
  disabled: Disabled (loading)
examples:
  Default: Below a list — Total count, 7 page slots and page size. The screen holds the page state.
  Few: Few pages — Every page shows, with no ellipsis.
  Disabled: Loading — All buttons are blocked.
---
# Pagination
## Purpose
Use it to move between pages of a table or list. Place it below DataGrid. Do not use it for lists that keep appending (notifications, conversations).
## Anatomy
root (`tl-pagination`, `<nav>`) · total (`type.label` `fg.secondary`, tabular numbers) · first · prev · page (square `density.control-height-md`, `radius.md`) · ellipsis (`fg.tertiary`) · next · last · size (Select sm, `20건씩` (20 per page)). The current page has a `brand.subtle` background and `fg.link` text at 600.
## Props
Generated from the contract.
## Variants
With or without the total and the page size selector. Page numbers take at most 7 slots, and an ellipsis (…) fills the overflow (1 … 4 5 6 … 62).
## States
default · hover (`bg.sunken`) · active (`bg.sunken`) · focus (focus ring) · disabled (previous and next at the first and last pages, and everything in `fg.disabled` with the `disabled` prop). loading and error do not apply.
## Behavior
Pressing a number calls `onPageChange(n)`. Pressing the current page again does not call it. Without pageCount, it uses `ceil(total ÷ pageSize)`. Changing the page size calls `onPageSizeChange(size)`, and the screen resets the page to 1. Tab moves between buttons. On a phone (below `breakpoint.sm`), only previous, `3 / 12` and next show, in place of the number buttons and first and last (D-61).

| Key | Action |
| --- | --- |
| Tab | Next button |
| Enter · Space | Go to that page |
## Accessibility
Uses `<nav aria-label="페이지">` (pages), with `aria-current="page"` on the current page. Number buttons are named like `3페이지` (page 3), and the arrows are named first, previous, next and last page. The total count is read as text. The current page is marked by color and weight.
## Density
Buttons `density.control-height-md` (compact 28 · comfortable 32).
## Platform differences
Native shows previous, next and `3 / 62` (no number list). The props are the same.
## Avoid
8 or more page number slots. Building the total count text by hand (use formatQuantity). Counting pages from 0. Code review checks these.
## Stories
Default · Few · Many · PageSize · Disabled.
## References
components.md §10 ListDetail.
