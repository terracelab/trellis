---
props:
  people: Company directory (id · name · title · meta · code · src)
  drafter: Drafter (fixed first row)
  value: Approval line (controlled, person · role)
  defaultValue: Initial approval line
  onChange: Called when the approval line changes
  cc: CC person ids (controlled)
  defaultCc: Initial CC
  onCcChange: Called when CC changes
  showCc: Shows the CC field
  error: Approval line error text
  max: Most approvers allowed
  disabled: Disabled
examples:
  Expense: Expense approval line — Review, agreement and approval under the drafter. Alt + ↑ · ↓ on a row button changes the order, and CC people are person chips.
  Empty: Empty line and errors — With no approvers the list shows an empty row and the add field shows an error. When the last role is not approval a note appears.
---
# ApprovalLineEditor
## Purpose
Use it to edit the approval line (order of approvers · role review · agreement · approval) and CC people while drafting (draft · leave request, R-T25). To only show an approval line use ApprovalLine, and to only add people as chips use TagInput person.
## Anatomy
root (`tl-approval-line-editor`, `container-type` on its own width) · list (`ol`, 1px `border.divider`, `radius.md`, `status.danger.default` on error) · row (order | person | role | buttons, minimum height `density.row-height` + `space.16`, `border.divider` between rows) · drafter (fixed row 0, `bg.sunken`, role word "Drafter" `type.label` 600 `fg.secondary`) · no (order `type.label` `fg.tertiary` tabular) · who (PersonLabel: avatar · name and title · team) · role (Select sm: review · agreement · approval) · tools (IconButton sm: up · down · remove) · warn (icon `status.warning.default` + text `fg.secondary`, no background) · add (Field "Add approver" + CodeSearch) · cc (Field "CC" + TagInput person) · announcement line (`aria-live`).
## Props
Generated from the contract.
## Variants
With the CC field (default) · without it (showCc false). With a drafter, row 0 appears. When max is reached the add field locks and its help text becomes "Up to N approvers".
## States
default · hover (buttons, Select and fields follow their own rules) · focus (each part's ring) · disabled (Select, buttons, search and CC field all locked) · error (error text: list border `status.danger.default` + Field error on the add field). active and loading do not apply.
## Behavior
Adding an approver searches by name, employee number and team (CodeSearch, the employee number is code). The chosen person goes in before the last approval step as review (contracts `insertApprover`, or at the end when the last step is not approval). People already in the line or in CC, and the drafter, are left out of the candidates. Each row changes its role with a Select. The up · down buttons, or Alt + ↑ · ↓ on a row button, change the order (`moveApprover`), and focus stays on the same button of the moved row (the opposite button when it reaches the end and locks). Remove takes the row out and moves focus to a neighbouring row. Order changes, additions and removals are read by the announcement line ("Moved `정민호` to position 2"). When the last approver does not have the approval role a note appears under the list (it does not block). CC uses TagInput person (people chips; people in the line are left out of the suggestions). Passing value · cc makes it controlled, defaultValue · defaultCc keep the state inside.

| Key | Action |
| --- | --- |
| Tab | Role and buttons of each row, the add field, then the CC field |
| Alt + ↑ · ↓ | On the up, down or remove button, moves that row by one |
| Enter · Space | Presses the button |

## Accessibility
The list is an `ol` named "Approval line". Order numbers are decorative (the list order says it) and the list has a hidden hint "Use Alt with the up and down arrows to change the order". The role Select is named "Role of <name>" and buttons "Move <name> up · down · Remove <name>". The announcement line is `aria-live="polite"`. The note is `role="status"`. Errors are read from the Field error slot. Contrast: names `fg.primary`, team and note `fg.secondary`.
## Density
Minimum row height `density.row-height` + `space.16` (compact 52 · comfortable 56), role column `space.64` × 1.5, buttons × 1.75. Narrower than 560, role and buttons move to a line under the person.
## Platform differences
Native moves rows with a long press and drag (accessibility actions "move up · down") and searches approvers in a bottom sheet. Props are the same.
## Avoid
Blocks building the approval line list or CC chips in CSS (R-T25, use ApprovalLineEditor). Changing the approval vocabulary (content.md §6). Reordering only by dragging (keyboard and buttons are required, code review).
## Stories
Expense · Empty.
## References
R-T25 (approval line editing · CC chips), SY-15 · PG-43, ApprovalLine (display) · TagInput person · CodeSearch · PersonLabel, components.md §10 ApprovalFlow. Block: `groupware/approval/draft`.
