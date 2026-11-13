---
props:
  children: Area that receives the menu
  items: Items, separators and group labels
  onOpenChange: Called when it opens or closes (the web also passes the element that opened it)
  disabled: Does not open (the browser menu shows)
  title: Narrow screen sheet title ("Actions" when missing)
examples:
  FileRows: File list — Right-click a row, long-press it, or press Shift+F10 on a focused row to open that row's menu. Phones get a bottom sheet.
---
# ContextMenu
## Purpose
Use it to open the actions of a list row, a file or a message right away with right-click, long-press or Shift+F10. Put visible buttons first (a row-end more Menu or the action buttons in a detail) and use this as a shortcut to them. Use Menu for actions attached to one button.
## Anatomy
area (`tl-context-menu`, a wrapper that draws no box with `display: contents`, so the wrapped list keeps its layout) · popup (same as Menu: `tl-menu`, `bg.elevated`, `border.default`, `shadow.md` (lines instead of a shadow in dark), `radius.md`, `z.dropdown`) · group-label · item (icon 16 `fg.secondary` · label `fg.primary` · shortcut) · separator (`border.divider`). Narrow screens use a bottom sheet (same rows as the Menu sheet).
## Props
Generated from the contract.
## Variants
Items are the same as Menu: default · danger (only the icon uses `status.danger.default`, the text stays neutral) · disabled · group label · separator.
## States
default · hover (item highlight `bg.sunken`) · focus (keyboard highlight uses the same `bg.sunken`) · disabled (with `disabled` it does not open and leaves the browser menu alone, a disabled item uses `fg.disabled`). active, loading and error do not apply.
## Behavior
- Opening: a right-click inside the area opens it at the pointer. Shift+F10 or the menu key on a focused element opens it at that element's bottom-left corner. On touch, a 500ms long-press opens it (moving more than 10 cancels). While it is open the browser menu does not show.
- Which row: when it opens, `onOpenChange(true, target)` passes the pressed element (or the focused element for the keyboard). The app finds the row, for example with `target.closest('[data-id]')`, and passes that row's items. When items are empty (an empty spot) it does not open.
- Choosing: it calls the item's `onSelect` and closes. Focus returns to the element that opened it.
- Narrow screens (below `breakpoint.sm`, D-60): the same gestures open a bottom sheet. The title is `title` (or "Actions"), rows are finger height (`space.48`), and choosing closes the sheet and then runs the item. The click that follows a long-press is swallowed once so the row does not open.

| Key | Action |
| --- | --- |
| Shift+F10 · menu key | Opens the menu of the focused element |
| ArrowUp · ArrowDown | Moves between items |
| Home · End | First · last item |
| Enter · Space | Runs an item |
| Escape | Closes and returns to the element that opened it |
## Accessibility
Uses `role="menu"` with `menuitem`. Groups use `group` linked to their label. Right-click and long-press are hidden gestures, so the same actions are also offered by visible buttons (a more Menu or detail actions). Keyboard users focus a row and press Shift+F10. Destructive actions are not marked by color alone (the label names the result). With reduced motion, it opens without a fade.
## Density
Item height `density.row-height` (compact 32 · comfortable 40), text `density.body-font-size`. Sheet rows are `space.48` in every density.
## Platform differences
Native opens a bottom sheet list on long-press (onLongPress). There is no right-click or keyboard. The second argument of the web `onOpenChange` (target) is web only, because on native the wrapping item already knows what was pressed. Props are the same.
## Avoid
Actions that exist only in this menu (no visible button). More than 10 items. Submenus. Red text on a danger item. Blocking the browser menu inside inputs (paste). Code review checks these.
## Stories
FileRows.
## References
Base UI Context Menu. The popup look and the item model are the same as Menu (MenuEntry). Used in the ecm/my-docs/browser (document rows) and groupware/messenger/chat (messages) blocks (PR-08).
