---
props:
  items: History items
  dense: Tight spacing
  ariaLabel: List name
examples:
  Receiving: Receiving history — Uses the tone and label from the vocabulary as they are.
  Approval: Approval history — A rejection is shown by color and by the title text together.
---
# Timeline
## Purpose
Use it to show what happened to one record, in order, on a vertical line (receiving history, approval history, batch run log). For progress through approval line steps, use Stepper. For a list of many records, use a table.
## Anatomy
list (`<ol>`) · item · rail (marker + line) · marker (8 dot in the tone's `status.*.default`; with an icon, a 24 circle with a `status.*.subtle` background and a 16 icon in the tone color) · line (`border.divider` 2) · title (`type.label` 600 `fg.primary`) · meta (time · actor, `type.caption` `fg.tertiary`, tabular) · description (`type.caption` `fg.secondary`).
## Props
Generated from the contract.
## Variants
2 markers (dot · icon) × 5 tones × with or without dense.
## States
default.
## Behavior
Items render from top to bottom in the order given. The screen decides whether the newest item goes on top. The last item draws no line below it. time is text the screen has already formatted (2026-11-07 14:20). Items such as failures and rejections get their color from tone and also state it in the title text.
## Accessibility
`<ol>` (ordered list). Name the list with `aria-label`, for example `결재 이력` (approval history). The marker is decorative, and the title text states the status.
## Density
`space.16` below each item, `space.8` with dense.
## Platform differences
None.
## Avoid
Using it for approval line progress (use a horizontal Stepper). Showing a failure by color alone. Different time formats from item to item. Code review checks these.
## Stories
Receiving · Approval · BatchLog · Dense.
## References
D-48 vocabulary (receiving · batch jobs), content.md §4 times and dates.
