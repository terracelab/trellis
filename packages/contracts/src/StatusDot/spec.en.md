---
props:
  tone: Status tone (dot color)
  size: Size
  pulse: Pulse for a state that is in progress
  children: Status label
examples:
  JobStates: Batch jobs — Pass the vocabulary's tone and pulse only while running.
  Machines: Equipment status — Use sm in table cells.
---
# StatusDot
## Purpose
Use it to show one status as a dot and a label in a table cell or list row. Use it in dense tables where a badge background is too heavy (equipment status, batch runs). Use Badge for an emphasized status in a card header.
## Anatomy
root (inline-flex) · dot (circle, the tone's `status.*.default`, `fg.tertiary` for neutral) · pulse (ring spreading behind the dot, same color) · label (`fg.primary`, `density.body-font-size` at md, `type.caption` at sm).
## Props
Generated from the contract.
## Variants
tone 5 × size 2. pulse can be turned on with any tone.
## States
default (a data state, not an interaction state).
## Behavior
Turn on `pulse` only for a state that is in progress right now (running, operating, in customs clearance). Do not turn it on for a finished state. Several pulses in one table scatter attention, so keep it to the rows that are in progress.
## Accessibility
Status is shown by color, dot and text. The text uses a neutral color (status-colored text does not reach 4.5:1). The dot has `aria-hidden`. With `prefers-reduced-motion`, the pulse stops.
## Density
md dot 8 · sm dot 6. Text follows `density.body-font-size`.
## Platform differences
The native pulse uses Animated and follows the reduce motion accessibility setting.
## Avoid
A dot with no label. Using it for approval status (use Badge `approval`). A pulse on a finished state. Code review checks these.
## Stories
Tones · Pulse · InTable.
## References
D-48 industry vocabulary (vocab.ts), Badge.
