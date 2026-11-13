---
props:
  trigger: Element that opens the menu
  items: Items, separators and group labels
  align: Alignment relative to the trigger
  disabled: Does not open
  title: Narrow screen sheet title (trigger name when missing)
examples:
  RowActions: Row-end more menu — Gathers the secondary actions of a table row. Delete shows the danger color on its icon only.
  Groups: Groups — Group items under a label and split groups with separators. Items that cannot be used are disabled, and a tooltip gives the reason.
---
# Menu
## Purpose
Use it to open several actions attached to one button (more menu at the end of a row, more menu in a toolbar). Use Select to pick a value and Sidebar for a list of screens to go to.
## Anatomy
trigger (IconButton · Button) · popup (`tl-menu`, `bg.elevated`, `border.default`, `shadow.md`, `radius.md`, `z.dropdown`) · group-label (`type.caption` `fg.tertiary`) · item (height `density.row-height`, icon 16 `fg.secondary` · label `fg.primary` · shortcut `type.caption` `fg.tertiary`) · separator (`border.divider`).
## Props
Generated from the contract.
## Variants
align start · end. Items are default · danger (only the icon uses `status.danger.default`, the text stays neutral) · disabled (with `disabledReason` when there is a reason).
## States
default · hover (item highlight `bg.sunken`) · focus (keyboard highlight uses the same `bg.sunken`, the trigger shows the focus ring) · disabled (with the `disabled` prop the menu does not open, a disabled item uses `fg.disabled`, and with disabledReason it looks the same but takes focus and shows a tooltip). active, loading and error do not apply.
## Behavior
Built on Base UI Menu. Pressing the trigger opens the menu and moves focus to the first item. Choosing an item calls `onSelect`, closes the menu and returns focus to the trigger. A `label` entry groups the items up to the next separator or the next label.

Items (`items`, R-T39) mix three kinds.

| Kind | Field | Notes |
| --- | --- | --- |
| Action item `MenuActionItem` | `id` · `label` | Required. The label is a verb stem or a noun (edit, copy, delete) |
| | `icon` | Icon name (`IconName` from the icons package). Drawn at 16 before the label in both the popup and the sheet. When any item has an icon, items without one keep the slot empty so the labels line up |
| | `shortcut` | Shortcut label (Ctrl+D). Display only. Hidden in the sheet |
| | `danger` · `disabled` · `disabledReason` | Destructive action (only the icon gets the danger color) · disabled · reason for being disabled |
| | `onSelect` | Called when chosen |
| Separator | `type: 'separator'` | Line between groups |
| Group label | `type: 'label'` · `label` | Groups the items up to the next separator or group label |

Narrow screens (below `breakpoint.sm`, D-60): the same trigger opens a bottom sheet (a dialog) instead of the popup. The sheet title is `title`, or the trigger's name (IconButton label · Button text), or "Actions" (`동작`). Items are finger-height row buttons (`space.48`), not menu items. Tab and Shift+Tab move between items (no arrow keys or type-ahead), Enter and Space run an item, and Escape, the close button, pressing outside or swiping down closes the sheet. Choosing an item closes the sheet and then calls onSelect. Icons, group labels, separators and the danger color are the same as in the popup, and shortcut labels are hidden. disabledReason shows as secondary text at the end of the row instead of a tooltip.

Disabled reason: when an item has both `disabled` and `disabledReason` (the same name as on Button), the arrow keys reach it, and pointing at it or reaching it with the keyboard shows the reason in a Trellis Tooltip on the right. It cannot be chosen (onSelect is not called).

| Key | Action |
| --- | --- |
| Enter · Space | Opens from the trigger, runs an item |
| ArrowUp · ArrowDown | Moves between items (wraps from the end to the start) |
| Home · End | First · last item |
| Escape | Closes and returns to the trigger |
| Typing a character | Moves to the item that starts with that character |
## Accessibility
The wide-screen popup uses `role="menu"` with `menuitem`. Groups use `group` linked to their label. The trigger gets `aria-haspopup` and `aria-expanded`. The narrow-screen sheet is `role="dialog"` (`aria-modal`, named by the sheet title), and its items are `button`s, not `menuitem`s. Groups are `role="group"` with `aria-labelledby` (the group label), and the trigger gets `aria-haspopup="dialog"` · `aria-expanded`. Tab stays inside the sheet, and focus returns to the trigger when it closes. Screen check scripts have to look for a different role at each width (menuitem when wide, button inside a dialog when narrow). When the trigger is an IconButton, its `label` is the name. Disabled items use `aria-disabled`, so they take focus, and disabledReason is hidden text (`hidden`) inside the item linked with `aria-describedby`, read as a description. Destructive actions are not marked by color alone (the label names the result, like delete or reject). With reduced motion, the menu opens without a fade.
## Density
Item height `density.row-height` (compact 32 · comfortable 40), text `density.body-font-size`.
## Platform differences
Native uses a bottom sheet list (same items). Shortcut labels are hidden on native. On the web, when the width is below `breakpoint.sm`, the same trigger opens a bottom sheet (D-60 · PR-10). The title is `title`, or the trigger's name (IconButton label · Button text), or "Actions". Items are finger-height rows (`space.48`), group labels use `type.label` fg.secondary, separators use `border.divider`, and danger actions color only the icon. Choosing an item closes the sheet and then calls onSelect. Shortcut labels are hidden in the sheet. disabledReason shows as secondary text at the end of the row (`type.caption` `fg.secondary`) instead of a tooltip, and that row is an `aria-disabled` button that takes focus but does not run when pressed. The trigger gets `aria-haspopup="dialog"` · `aria-expanded`.
## Avoid
More than 10 items (use a screen or a Dialog). Submenus two or more levels deep. An input inside a menu. Red text on a danger item. An item blocked by a permission that is disabled without a reason. Code review checks these.
## Stories
Default · RowActions · Groups · Disabled.
## References
Base UI Menu. The popup looks the same as Select.
