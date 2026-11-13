---
props:
  open: Open (controlled)
  defaultOpen: Open at first
  onOpenChange: Called when open changes
  trigger: Button that opens it
  title: Title
  description: One-sentence description
  label: Reason field label (`사유` by default, reason)
  placeholder: Example reason
  confirmLabel: Confirm button (says the result)
  minLength: Minimum length (leading and trailing spaces excluded)
  maxLength: Maximum length
  tone: Weight of the confirmation
  note: One line of guidance at the bottom
  onConfirm: Confirm (the reason without leading and trailing spaces)
  loading: In progress
  error: Error text
examples:
  Reject: Reject an approval — The reject button stays off until the reason has five characters. Clicking outside does not close it.
  Withdraw: Withdraw an approval — After confirming, it stays in progress until the request finishes, then closes.
  States: States — Confirm off, in progress, and an error message, each opened from its own button.
---
# ReasonDialog
## Purpose
Use it to confirm an action that needs a reason (rejecting or withdrawing an approval, deleting, revealing hidden details). It is a Dialog with one reason field and a confirm button that says the result. For a confirmation without a reason use Dialog, and for input with several fields use Drawer or a screen form.
## Anatomy
Dialog (sm width, `bg.elevated`, shadow and border follow Dialog) · head (title `type.h3`, description `fg.secondary`, triangle-alert `status.danger.default` when danger) · field (Field with Textarea, label `사유` (reason) by default, required dot, character count) · help (minimum length hint, `type.caption` `fg.tertiary`) · error (Field error text, `status.danger.default`) · note (one line at the bottom, `type.caption` `fg.tertiary`) · footer (Cancel secondary, confirm primary or danger).
## Props
Generated from the contract.
## Variants
tone default (primary confirm) · danger (danger confirm and a warning icon before the title). size is fixed at sm.
## States
default · disabled (confirm is off while the reason is shorter than minLength) · loading (spinner on confirm, Cancel and Escape blocked, reason field read-only) · error (error text under the reason field, `aria-invalid`). hover, active and focus follow the Button and Textarea inside.
## Behavior
The reason is counted without leading and trailing spaces. While it is too short, confirm is off, and with minLength 2 or more a hint shows the minimum length. With maxLength, a character count shows and input stops at the limit. Confirm calls `onConfirm(reason)`. If it returns a Promise, the dialog stays in loading until it settles. On success it closes and clears the reason. On failure it stays open and shows `처리하지 못했습니다. 다시 시도하세요` (could not complete, try again), or the error prop when given. Closing rules: clicking outside never closes it, so a reason being typed is not lost. Escape closes it only while the reason field is empty. With text in the field, only Cancel closes it. There is no close button at the top right. When it opens, focus goes to the reason field, and when it closes, focus returns to the opening button. With open it is controlled, without it the trigger opens it.
## Accessibility
`role="dialog"` with `aria-modal`, named by title and described by description. The reason field is tied to the Field label, and help, error and count are read through `aria-describedby`. The reason confirm is off (the minimum length) shows as text on screen. Keyboard: Tab cycles inside, Ctrl+Enter (Cmd+Enter on Mac) confirms, Escape closes when the field is empty. The focus ring is always visible.
## Density
Follows Dialog. The reason field has 4 rows (`rows=4`), and text uses `density.input-font-size`.
## Platform differences
Native uses Modal with a multiline TextInput. The hardware back button follows the Escape rule (closes only when the field is empty).
## Avoid
`확인` or `예` (OK or yes) on the confirm button. Rejecting or withdrawing without a reason. Closing on an outside click and losing the reason. Several reason fields (use a form). Taking a rejection reason only through a Toast. Code review checks these.
## Stories
Reject · Withdraw · States.
## References
Dialog, Field, Textarea, components.md §10 ApprovalFlow (reasons for rejecting and withdrawing), content.md §5 (buttons say the result), MaskedValue.
