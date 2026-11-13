---
props:
  title: What changes (noun phrase)
  summary: One or two sentences of reasoning or impact
  changes: Fields that change (diffFields)
  status: Handling state (controlled)
  defaultStatus: Initial state (uncontrolled)
  onApprove: Approves
  onReject: Rejects (a reason is required)
  reason: Reason for rejection (after handling)
  resolvedBy: Who handled it and when
  reasonMinLength: Fewest characters for the reason
  approveLabel: Approve button text (Approve by default)
  rejectLabel: Reject button text (Reject by default)
  loading: In progress
  disabled: Cannot be handled (no permission)
  error: Error text
  headingLevel: Heading level (context when not set)
  children: Area under the change table (sources, run steps)
examples:
  Waiting: Awaiting review — The change table shows the fields the agent wants to change, and a person approves or rejects with a reason.
  Approved: Approved — After handling, the result and who handled it and when replace the buttons.
  Rejected: Rejected — The reason given in the reason dialog shows under the result.
  WithSources: With evidence — Sources go in the area under the change table. The approve button text can name the result.
---
# ProposalCard
## Purpose
Use it when a person checks a data change an agent proposed (unit price, payment date, vendor account) and approves or rejects it. ChangeDiff shows the fields that change, and rejecting takes a reason in ReasonDialog. Use ApprovalFlow (ApprovalLine and Badge approval) for approving electronic approval documents, and ChangeDiff alone to only view a change history.
## Anatomy
root (`article`, `tl-proposal-card`, `bg.surface`, 1px `border.divider`, `radius.lg`, `density.card-padding` padding, `data-status`) · head (title `type.h3` `fg.strong` and a status Badge: awaiting review warning, approved success, rejected danger) · summary (one or two sentences of reasoning or impact, `fg.secondary`) · changes (ChangeDiff table) · extra (children: sources, run steps) · footer (1px `border.divider` on top: while awaiting review, error and actions [Reject Button, Approve primary Button]; after handling, result [icon, result text 600, who and when in `type.caption` `fg.secondary`, reason for rejection]) · ReasonDialog (reason for rejection).
## Props
Generated from the contract.
## Variants
Three statuses. Color only goes on the status Badge and the result icon.

| status | Badge | Bottom row |
|---|---|---|
| waiting (default) | Awaiting review · warning | [Reject] [Approve] |
| approved | Approved · success | circle-check (`status.success.default`) and "Approved" and who and when |
| rejected | Rejected · danger | circle-x (`status.danger.default`) and "Rejected" and who and when and the reason |
## States
default · disabled (`disabled`: both buttons off, `data-state="disabled"`) · loading (`loading` or an approve Promise in progress: the approve button is busy and reject is off, `aria-busy` and `data-state="loading"`) · error (`error` or a failed approve: `status.danger.default` text above the buttons with `role="alert"`, `data-state="error"`). The buttons inside carry hover, active and focus.
## Behavior
- Approve: pressing calls `onApprove()`. With a Promise it stays in progress until it ends; on success it becomes approved, and on failure it stays awaiting review with "Could not complete. Try again" (or the `error` text when given).
- Reject: pressing opens ReasonDialog ("Reject this proposal", the title as the description, a "Reason for rejection" field, the reject text as the confirm button, danger). When the reason is shorter than `reasonMinLength` (default 1, spaces at the ends not counted) confirm is off, and pressing outside does not close it (the ApprovalFlow rule). Confirming calls `onReject(reason)`. With a Promise the dialog shows progress, and on failure the dialog stays open with an error.
- After handling: a result row replaces the buttons. The reason shown is `reason`, or the text entered in the dialog. Focus moves to the result row only right after handling in this card (the buttons disappear). Focus does not move when the status changes from outside.
- Controlled or uncontrolled: with `status` the app holds the state (and changes it after handling); without it the card starts from `defaultStatus` and changes it itself.
- Button text: the approve button can say the result (Apply change · Register). Do not use "OK".

| Key | Action |
| --- | --- |
| Tab | Sources, Reject and Approve in order |
| Enter · Space | Approve or Reject (opens the reason dialog) |
| Ctrl+Enter | Confirms the rejection in the reason dialog |
| Escape | Closes the reason dialog only when it is empty |
## Accessibility
The root is an `article` named by its title (`aria-labelledby`). The heading level follows the Card context (h2 right under the page, h3 inside a card) and `headingLevel` changes it. The status is read as the badge text and the result text, not only shown by color. Right after handling, focus moves to the result row (`tabindex="-1"`) so the result is read. Errors use `role="alert"`. The change table follows ChangeDiff accessibility (hidden "to" and "none"). The focus ring always shows.
## Density
Padding is `density.card-padding` (16 compact, 20 comfortable, 16 touch), the bottom row has `space.12` above and below, and blocks are `space.12` apart. Buttons are Button md.
## Platform differences
Native draws the same card with View, and the reason uses the native ReasonDialog (bottom sheet). At phone width the two buttons share the width. Props are the same.
## Avoid
Rejecting without a reason, approving automatically without a person, showing the status with the five approval badges (Badge approval is for electronic approval only), a left status stripe on the card (D-57), and an "OK" confirm button. Code review checks these.
## Stories
Waiting · Approved · Rejected · WithSources.
## References
patterns/ConversationalWork, components.md §10 ApprovalFlow (reason rule), ChangeDiff and ReasonDialog (PR-30), AGENT_RUN_STATES.waiting (D-116).
