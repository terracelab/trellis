---
props:
  approvers: Approvers (name, job title, role, state, time, comment)
  orientation: Direction (horizontal above the document body, vertical in a narrow panel)
  variant: A cell per person or dots + one step line (table cells)
examples:
  Purchase: Purchase request — Horizontal cells from drafting to approval. The cell that is up for approval now is highlighted.
  RejectedVertical: Rejected (vertical) — Use vertical in a narrow panel. The reason is cut to one line, and the full text shows on mouse hover.
  Narrow: Narrow card (344) — A long rejection comment stays on one line and does not widen the card it sits in.
  Compact: Dots (compact) — In table cells and list rows, dots in the five approval colors and one line like "3/4 review". Waiting is a hollow circle and hovering shows each step's state.
---
# ApprovalLine
## Purpose
Use it to show an electronic approval document's approval line (drafting, review, agreement, approval, cc) and each person's state. Approval inbox table cells and list rows use compact (dots in the five approval colors + `2/3 합의`, R-T24). To edit an approval line use ApprovalLineEditor, and for processing steps that are not approval, use Stepper.
## Anatomy
root (`tl-approval-line`, `<ol>`) · step (cell, `bg.surface`, `border.default`, `radius.md`) · role (header strip, `bg.canvas`, `type.caption` `fg.secondary`) · name (`type.label` 600) · title (job title, `type.caption` `fg.tertiary`) · badge (Badge approval, neutral while waiting) · time (`type.caption` `fg.tertiary`, tabular) · comment (`type.caption` `fg.secondary`, one line) · line (`border.default` between cells). compact: dots (8 dots with `space.4` between them, filled with the five approval colors `approval.*.default`, waiting is a hollow `border.strong` circle) · summary (`2/3 합의`, tabular, `density.body-font-size`).
## Props
Generated from the contract.
## Variants
variant default (a cell per person, default) · compact (dots + one step line). default uses orientation horizontal (above the document body, default) · vertical (narrow panel · mobile). The in-progress (pending) cell is highlighted with an `approval.pending.default` border. compact does not use orientation.
## States
default (data state). Approval states are drawn with the five approval colors of Badge plus waiting (neutral). hover · active · focus · disabled · loading · error do not apply.
## Behavior
Display only. If role is omitted, the first cell is `기안` (drafting), the last cell is `승인` (approval), and the cells between are `검토` (review). The comment is cut to one line, and the full text shows through the `title` attribute. To show a long rejection reason, the screen opens it in a Dialog. The compact step line is "number/total role" of the current step (the pending cell → a rejected or withdrawn cell → the last processed cell, contracts `approvalLineSummary`), and hovering shows "role name state" for each cell through `title`.

Narrow widths (R-T14): the root has `min-width: 0` and `max-width: 100%`, so it shrinks inside a flex or grid parent. The comment uses `contain: inline-size`, so its text width is left out of sizing and a long comment does not widen the minimum width of the approval line or its parent (an approval document header, a card). The main content does not overflow sideways even at 344. The cell decides the comment width (the cell width horizontally, the full row vertically).
## Accessibility
Renders `<ol aria-label="결재선">` (approval line), and the in-progress cell has `aria-current="step"`. Each cell reads role, name, job title and state text in that order. State is shown with color, a dot and text. compact hides the dots and reads hidden text after `3/4 검토` (the current state + role, name and state of each cell).
## Density
Minimum cell width `space.64` × 2, inner padding `space.8`. Does not change with density. compact uses `density.body-font-size` text and does not wrap.
## Platform differences
Native is vertical by default. Horizontal scrolls sideways when it overflows. The props are the same.
## Avoid
Drawing approval states in colors outside Badge approval. Changing the approval vocabulary (for example `상신` (submit), `완료` (done), `거부` (refuse)). Using Stepper for an approval line. Blocks drawing approval step dots in CSS (R-T24, use compact). Code review checks these (components.md §10 ApprovalFlow).
## Stories
Purchase · RejectedVertical · Narrow · Compact.
## References
components.md §10 ApprovalFlow, content.md §6 (approval vocabulary), R-T24 · PG-43 (compact, groupware/approval/inbox).
