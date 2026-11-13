---
props:
  children: Buttons (the main action goes on the far right)
  summary: Summary on the left
  sticky: Sticks to the bottom
  align: Alignment (`between` when there is a summary, `end` when there is none)
examples:
  FormFooter: Below a form — Save goes on the far right and Cancel goes to its left.
  StickyWithSummary: Selection summary, sticky — The selected count and total sit on the left, and the bar stays at the bottom while you scroll.
---
# ActionBar
## Purpose
Use it to group closing actions such as save and cancel in one row below a form or detail screen. For bulk actions above a table, use the FilterBar `actions` or the DataGrid toolbar.
## Anatomy
root (`tl-action-bar`) · summary (left, `type.label` `fg.secondary`) · actions (right, `space.8` between buttons). When sticky, a `border.divider` on top and a `bg.surface` background, no shadow.
## Props
Generated from the contract.
## Variants
align end · between × sticky or not. If align is omitted, it is between when there is a summary and end when there is none.
## States
default. The buttons inside carry the states. The rest do not apply.
## Behavior
The order rule is Save at the bottom right and Cancel to its left. There is one main action (primary), and it goes on the far right. If the primary button is not last, a warning shows in development mode. A sticky bar attaches to the bottom of the scroll area, so it stays visible when the content is long. With sticky, toasts appear above this row while it sits at the bottom of the screen (see Toast behavior). A sticky bar adds `env(safe-area-inset-bottom)` to its bottom padding, so the home indicator on a phone does not cover the buttons.
## Accessibility
Uses `role="group"`. Button labels name the result (Save, Request approval, Reject). Tab order follows the visual order.
## Density
Vertical padding `space.12`, horizontal padding (sticky) `density.card-padding`. The sticky bottom padding is `space.12` plus the safe area.
## Platform differences
Native sticks to the bottom of the screen by default, and the buttons share the width (main action on the right). The props are the same.
## Avoid
Two primary buttons. Cancel to the right of Save. A shadow cast upward. More than four buttons (move them to a Menu). Code review checks these (components.md §10 FormRegister).
## Stories
Default · WithSummary · Sticky.
## References
components.md §10 FormRegister.
