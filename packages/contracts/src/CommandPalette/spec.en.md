---
props:
  open: Open (controlled; ignored when inline)
  defaultOpen: Initially open
  onOpenChange: Called when the open state changes
  title: Accessible name (not shown)
  placeholder: Hint in the search field
  query: Search text (controlled)
  defaultQuery: Initial search text
  onQueryChange: Called when the search text changes
  groups: Result groups
  onSelect: Called when a result is chosen
  closeOnSelect: Close after choosing
  filter: Filter by the search text (false = the app filters)
  suggestions: Quick questions under the field
  loading: Loading (skeleton rows)
  empty: Shown when there are no results
  children: Slot above the results (an answer or a note)
  inline: Draw in place without a dialog
examples:
  Inline: In place — The panel drawn without a dialog. The look of the open palette.
  Shortcut: ⌘K dialog — Press the button or ⌘K / Ctrl+K. Type part of a screen name and press Enter.
  Answer: Question and answer — A quick question fills the field, and the app shows its answer above the results.
  Empty: No results — Says what is missing and what to try next.
---
# CommandPalette
## Purpose
Use it to find a screen, a task or a business partner by typing and open it right away (⌘K · Ctrl+K). It is the main way experienced users move around, and it reaches a screen from part of its name without knowing the menu. To pick one value into a field, use CodeSearch. To filter a list, use FilterBar.
## Anatomy
backdrop (`bg.overlay`) · panel (`bg.elevated`, `radius.lg`, `shadow.lg`; dark uses `border.default` instead of a shadow; width 640, 12vh from the top) · search (search icon `fg.secondary` 16 · input in `type.h3` · Esc key cap on the right in `type.caption` with `border.default` · `border.divider` below) · suggestions (text chips under the field = SuggestionChips, the chip matching the current text looks pressed, `type.caption`, `border.default`, full radius) · extra (the children slot) · list (at most 60% of the screen height, scrolls inside) · group (heading `type.caption` `fg.secondary` 600) · item (at least `density.row-height` tall; icon 16 `fg.secondary` · label `fg.primary` · description `type.caption` `fg.secondary` on the same line after the label · meta on the right `type.caption` `fg.secondary`) · current result (`bg.sunken` background plus "Open ↵" on the right) · footer (`border.divider` above, key hints "↑↓ Move · Tab Next group · Enter Open · Esc Close" in `type.caption` `fg.secondary`).
## Props
Generated from the contract.
## Variants
Dialog (default) · inline. With or without suggestions, children, meta and description.
## States
default. The current row (keyboard or mouse) shows `bg.sunken`. A disabled result uses `fg.disabled` and cannot be chosen. Loading shows 4 skeleton rows. With zero results the empty slot shows (default "Nothing matches").
## Behavior
When it opens, focus moves to the field and the first result is current. While you type with filter on, only results whose label, description or keywords contain the text stay (case-insensitive, outer spaces ignored), and empty groups hide. With filter off the groups show as given (when the app searches on the server). ArrowDown and ArrowUp move the current result and wrap at the ends. Home and End go to the first and last. Tab goes to the first result of the next group (Shift+Tab to the previous group); with one group nothing happens. Enter or a press calls onSelect(item, group) and closes when closeOnSelect is on. Escape or a press outside closes it. Hovering a row makes it current, and the current result scrolls into view inside the list. Pressing a quick question puts its text in the field (onQueryChange) and focus stays in the field. When it reopens, uncontrolled search text is cleared. Opening and closing fade with a 4px vertical move over `duration.normal` (`easing.enter` in, `easing.exit` out).
## Accessibility
The field has `role="combobox"`, `aria-expanded`, `aria-controls` (the list), `aria-activedescendant` (the current result) and `aria-autocomplete="list"`. The list is `role="listbox"`, each group is `role="group"` labelled by its heading with `aria-labelledby`, and each result is `role="option"` with `aria-selected` (current) and `aria-disabled`. The dialog has `role="dialog"` and `aria-modal="true"`, named by the hidden title. When the result count changes, "N results" is announced politely with `role="status"`. Focus stays in the field and result rows are not Tab stops (combobox pattern). On close, focus returns to the button that opened it.
## Density
Result rows use `density.row-height` (compact 32 · comfortable 40), phone `space.48`. The search row is `space.48` tall. The field text is `type.h3`, and on phones `density.input-font-size` (16, prevents iOS zoom).
## Platform differences
Web only (native false). When the screen is narrower than `breakpoint.sm`, it opens as a full-width panel stuck to the top (rounded at the bottom only, up to the full screen height). It stays at the top so the field and the first results remain visible when the keyboard comes up from the bottom (unlike the bottom sheets of D-60). The key hint row hides on phones.
## Avoid
A visible title row or close button (it looks like a form dialog) · marking the current result with a colored left bar (D-57) · count pills on groups (D-56) · running an outward action (issue, transfer) from a result without confirmation → review.
## Stories
Inline · Shortcut · Answer · Empty.
## References
ARIA APG combobox (listbox popup) pattern. Base UI Dialog. Common palette conventions for experienced users (recent items, groups, key hints).
