---
props:
  value: Masked text
  label: Name of the value (used in button and dialog names)
  onReveal: Reason to original (the app checks permission and keeps the record)
  revealSeconds: How long the original shows (seconds)
  copyable: Copy button for the original
  canReveal: When false, a lock and the reason
  lockedReason: Why it cannot be shown
examples:
  Resident: Resident registration number — Show asks for a reason, then shows the original for 60 seconds and hides it again.
  Locked: No access — A lock and the reason replace the Show button.
  InRecord: In a description list — The account number shows only its last four digits, and the original can be copied while it shows.
  States: States — Read-only without onReveal, locked, and a failed reveal that keeps the dialog open with an error.
---
# MaskedValue
## Purpose
Use it to show masked personal data (resident registration number, account number, phone number, address) and briefly show the original after a reason is entered. Build the masked text with the contracts functions `formatRrn`, `maskAccount`, `maskPhone`, `maskName` and `maskAddress`. The app checks permission and keeps the access record inside `onReveal`. For a field that masks while typing use MaskedInput, and to open all hidden details at once use HrRecord `onRevealChange`.
## Anatomy
root (`span`, sits inside a line of text) · text (masked text or original, tabular, `fg.primary`) · toggle (IconButton ghost sm: eye to show, eye-off to hide again) · timer (timer icon and the remaining seconds, `type.caption` `fg.tertiary`) · copy (IconButton copy, only while the original shows) · lock (lock icon `fg.tertiary` and the reason in `type.caption` `fg.tertiary`; the reason wraps in narrow cells or large text, and the icon stays on the first line) · ReasonDialog (reason input) · hidden announcement region (`aria-live`).
## Props
Generated from the contract.
## Variants
Revealable (onReveal given, canReveal) · locked (canReveal false: a lock and the reason) · read-only (no onReveal: masked text only). While the original shows, the remaining time and, with copyable, a copy button are added.
## States
default · focus (focus ring on the Show and Copy buttons) · disabled (canReveal false, a lock instead of the button). Loading the original and a failed reveal show inside ReasonDialog (spinner on confirm, or `원문을 불러오지 못했습니다`, could not load the original). hover and active follow IconButton.
## Behavior
The Show button opens a ReasonDialog (titled `{label} 보기`, show the label, with the confirm button `원문 보기`, show original). Entering a reason and confirming calls `onReveal(reason)`, and the returned original shows for revealSeconds (60 seconds by default). The remaining time counts down every second, and at zero the value is masked again. The hide button masks it sooner. Masking again also clears the original from memory, and so does unmounting. If onReveal fails, the dialog stays open with an error message. Copy works only while the original shows, and announces `복사했습니다` (copied). Show and hide are the same button, so focus stays in place.
## Accessibility
The Show button is named `{label} 보기` (show the label), the hide button `{label} 다시 가리기` (hide the label again), and copy `{label} 복사` (copy the label). When the original shows, the hidden announcement region reads that the original is showing and hides again in 60 seconds. When masked again, it reads `다시 가렸습니다` (hidden again) (`aria-live="polite"`). The remaining time text changes every second outside the announcement region, so it is not read repeatedly. Mask characters ● are read as they are. The locked reason shows as text on screen.
## Density
Buttons are IconButton sm (`density.control-height-sm`). Text follows the parent line. It does not change the row height inside a table cell.
## Platform differences
Native uses the same buttons. Copy uses Clipboard, and announcements use AccessibilityInfo.announceForAccessibility.
## Avoid
Passing the original as a prop and masking only on screen (pass the masked text). Showing the original without a reason. Leaving the original visible with no time limit. Leaving permission checks or records to the component. Building masked text by hand with string templates. Code review checks these.
## Stories
Resident · Locked · InRecord · States.
## References
ReasonDialog, MaskedInput, HrRecord, content.md §4 (resident registration number notation), masking functions in `_shared/format.ts`.
