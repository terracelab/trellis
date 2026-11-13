---
props:
  open: Open (controlled)
  defaultOpen: Initially open
  onOpenChange: Called when the open state changes
  title: Title
  description: One-sentence description
  size: Width (400 · 560 · 800)
  trigger: Button that opens it
  footer: Actions at the bottom
  tone: Weight of the confirmation
  closable: Close button
  children: Content
examples:
  Confirm: Issue confirmation — Buttons name the result.
  Danger: Danger — A press outside does not close it.
---
# Dialog
## Purpose
Use it to confirm or collect short input without leaving the screen (rejection reason, delete confirmation, issue confirmation). Use Drawer for long input or detail views.
## Anatomy
backdrop (`bg.overlay`) · popup (`bg.elevated`, `radius.lg`, `shadow.lg`, width sm 400 · md 560 · lg 800) · head (title `type.h2`, description, close) · body · footer (right-aligned buttons).
## Props
Generated from the contract.
## Variants
3 sizes, tone default · danger (warning icon before the title).
## States
default.
## Behavior
Built on Base UI Dialog. When it opens, focus moves to the first input or the first button. When it closes, focus returns to the button that opened it. Escape or a press outside closes it. The danger tone does not close on a press outside.
## Accessibility
Uses `role="dialog"` with `aria-modal`. The title and description are connected to the dialog. Focus is trapped inside it. Focus is trapped in the window: Tab on the last element moves to the first and Shift+Tab on the first moves to the last, right in keydown, so fast Tab presses (automated checks, key repeat) never leave the window. The window has aria-modal="true" (R-33).
## Density
Inner padding `space.24`, `space.8` between buttons.
## Platform differences
Native uses Modal (components.md §9).
## Avoid
A dialog inside a dialog. "Yes" or "OK" buttons. Long forms.
## Stories
Confirm · Danger · Form.
## References
Base UI Dialog, content.md §5 (confirmation questions).
