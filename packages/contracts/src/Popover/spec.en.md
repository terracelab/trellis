---
props:
  trigger: Element that opens the panel
  title: Panel title (accessible name · sheet title)
  children: Content
  footer: Actions at the bottom
  open: Open (controlled)
  defaultOpen: Open at first
  onOpenChange: Called when it opens or closes
  side: Side of the trigger
  align: Alignment along the side
  closable: Close button
  initialFocus: Focus on open (first control · panel)
  width: Width (240 · 320 · 400)
  disabled: Does not open
examples:
  Members: Members — A read-only panel puts focus on the panel itself. Escape or a click outside closes it and returns to the trigger.
  Apply: Apply and reset — With controls inside, focus goes to the first one. The footer applies and closes.
---
# Popover
## Purpose
Use it to open a small panel next to a button for short content, such as a member list, a quick filter or a few settings, to read or change on the spot. Use Menu for a list of actions, Select to pick one value, Dialog for a confirmation or long input, and Tooltip for a hint on hover.
## Anatomy
trigger (Button · IconButton) · popup (`tl-popover`, `bg.elevated`, `border.default`, `shadow.md` (lines instead of a shadow in dark), `radius.md`, `z.dropdown`, width sm 240 · md 320 · lg 400) · head (title `density.body-font-size` 600, close IconButton sm) · body (scrolls when it overflows) · footer (right-aligned buttons, `border.divider` on top).
## Props
Generated from the contract.
## Variants
side top · bottom · left · right × align start · center · end, width sm · md · lg, with or without closable, with or without footer.
## States
default · disabled (the trigger is disabled and it does not open). Inside the panel, hover and focus belong to the elements inside. active, loading and error do not apply.
## Behavior
Built on Base UI Popover. Pressing the trigger opens it and pressing again closes it. Escape, a click outside or the close button closes it, and focus returns to the trigger. When there is no room it flips to the other side. It is not modal, so the screen behind stays usable.
- Initial focus: `first` focuses the first control in the content (input, button or link, or the panel when there is none). `panel` focuses the panel itself (a read-only list). When opened by touch, focus stays on the panel so the virtual keyboard does not open.
- Control: with `open` + `onOpenChange`, the app opens and closes it (for example, closing after apply). Without them it starts from `defaultOpen` and manages itself.
- Narrow screens (below `breakpoint.sm`, D-60): the same trigger opens a bottom sheet. The title and close sit in the sheet head, the footer sits at the bottom of the sheet (safe area padding), and a swipe down closes it.

| Key | Action |
| --- | --- |
| Enter · Space | Opens or closes from the trigger |
| Tab | Moves between elements in the panel |
| Escape | Closes and returns to the trigger |
## Accessibility
The popup is `role="dialog"` and its title is the name (`aria-labelledby`). The trigger gets `aria-haspopup="dialog"` · `aria-expanded`. The close button is named `닫기`. The focus ring always shows. With reduced motion, it opens without a fade.
## Density
Panel text `density.body-font-size`, head height `density.control-height-lg`, padding `space.12`.
## Platform differences
Native uses a bottom sheet (same title and footer). side and align are web only and native ignores them. Props are the same.
## Avoid
A popover inside a popover. Long forms (use Dialog or Drawer). Input that disappears unsaved without a footer. Opening on hover (use Tooltip). Code review checks these.
## Stories
Members · Apply.
## References
Base UI Popover. PeriodPicker and the DataGrid filter use the same headless part. Used in the groupware/messenger/chat block (members) (PR-08).
