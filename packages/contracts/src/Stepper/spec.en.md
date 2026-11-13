---
props:
  steps: Steps (name, description, state)
  orientation: Direction
  size: Size
  label: List name (aria-label)
examples:
  OrderStages: Order stages — The current step has a ring. Finished steps have a check and a darker line.
  ReceivingVertical: Receiving (vertical) — Vertical in a narrow panel. A stalled step uses the danger color.
---
# Stepper
## Purpose
Use it to show where a process is in a fixed sequence of steps (order stages, filing progress, receiving). Use ApprovalLine for the approval line in electronic approval, and Tabs for switching back and forth between views.
## Anatomy
root (`tl-stepper`, `<ol>`) · step · marker (circle, md `space.24` · sm `space.20`, number `type.caption` 600) · label (`type.label`) · description (`type.caption` `fg.tertiary`) · line (`border.default`, `brand.default` for completed segments).
## Props
Generated from the contract.
## Variants
orientation horizontal · vertical × size sm · md. 4 step states: done (`brand.default` background + check, `brand.onBrand`) · current (`brand.default` 2px border + number `fg.link`, name 600) · todo (`border.default` border + number `fg.tertiary`, name `fg.secondary`) · error (`status.danger.default` background + x, `status.danger.on`).
## States
default (it shows a data state and has no interaction). A step's error is drawn with the step states above. hover, active, focus, disabled and loading do not apply.
## Behavior
Display only. Pressing a step does not navigate. Horizontal divides the width by the number of steps and joins the steps with lines. Vertical puts each step on its own line and wraps long descriptions.
## Accessibility
The list is `<ol aria-label>` with the default name `진행 단계` (progress steps), and the current step has `aria-current="step"`. Each state is read through color, icon and hidden text (done, current, error).
## Density
Marker size is set by `size` and does not depend on density. Vertical spacing `space.12`.
## Platform differences
When horizontal, native puts the name below the marker (narrow width). Props are the same.
## Avoid
More than 7 steps. Using the colors of the 5 approval states (use ApprovalLine for approval lines). Sentences as step names. Code review checks these.
## Stories
Default · Vertical · Error · Small.
## References
D-48 industry vocabulary (ORDER_STAGES · FILING_STATES · RECEIVING_STATES).
