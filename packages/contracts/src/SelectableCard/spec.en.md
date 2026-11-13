---
props:
  options: Cards
  mode: Pick one (radio) or several (checkbox)
  value: Selected value (controlled). A string in single mode, an array in multiple mode
  defaultValue: Initial value (uncontrolled)
  onChange: Called when the selection changes. A string in single mode, an array in multiple mode
  columns: Cards per row (fewer in narrow spaces)
  disabled: Disables the whole group
  invalid: Error (automatic when the Field has an error)
  required: Required
  name: Form name (submits the selected values)
  label: Accessible name (outside a Field)
examples:
  Single: Shipping method — Pick one card. The Field label becomes the group name.
  Multiple: Pick several — With mode="multiple", every card shows a check box.
  WithContent: Pick one from a list — Show the picked card's details next to the list. Put progress below the description with content.
---
# SelectableCard
## Purpose
Use it to show options that need a description as large cards and pick one or several (shipping method, plan, where to receive notifications, the list item whose details to show). For 2 to 5 short labels, use RadioGroup or CheckboxGroup. To switch views, use SegmentedControl.
## Anatomy
root (radiogroup or group, a container whose width sets the column count) · grid (`space.12` gap) · card (`bg.surface`, 1px `border.default`, `radius.lg`, padding `density.card-padding`) · icon (20, `fg.secondary`; a swatch or logo element also works) · title (`density.body-font-size`, 600) · meta (right of the title, `type.label`, `fg.secondary`) · check (16 circle; when picked, a `brand.default` fill with an `fg.inverse` check; in multiple mode, a square box that is always visible) · description (`type.label`, `fg.secondary`) · content (figures or progress below the description).
## Props
Generated from the contract.
## Variants
mode single (radio) · multiple (checkbox). columns auto · 1 · 2 · 3 · 4. The icon, meta, description and content render only when given.
## States
default (`border.default`) · hover (`border.strong`) · focus (focus ring on the card) · picked (full 1px `brand.default` border + check; the background does not change) · disabled (the whole group or one card, `bg.sunken` + `fg.disabled`) · error (with a Field error, unpicked cards get a `status.danger.default` border). active and loading do not apply.
## Behavior
Single mode works like radio buttons. Tabbing into the group focuses the picked card, or the first card when none is picked. The arrow keys move focus and pick at the same time, wrapping from the last card to the first. Disabled cards are skipped. Once a card is picked, it cannot be turned off.

Multiple mode works like checkboxes. Every card is in the Tab order, and Space turns it on or off. onChange receives an array sorted in option order.

| Key | Action |
| --- | --- |
| Tab | Moves into or out of the group (every card in multiple mode) |
| ArrowUp · ArrowLeft | Single mode: moves to the previous card and picks it |
| ArrowDown · ArrowRight | Single mode: moves to the next card and picks it |
| Space · Enter | Picks the focused card (turns it on or off in multiple mode) |

Pressing anywhere on a card picks it. Passing value makes it controlled, and defaultValue makes it uncontrolled. With name, hidden inputs submit the picked values (one per value in multiple mode). Pass `form.bind(name)` from `useTrellisForm` as is.

The column count shrinks with the group width. 4 columns become 2 below 880 wide, 3 columns become 2 below 680, and everything becomes one column below 420 (phones).
## Accessibility
Single mode uses `role="radiogroup"` with `role="radio"` on each card. Multiple mode uses `role="group"` with `role="checkbox"` on each card. The card is named by its title (`aria-labelledby`), and the meta, description and content become `aria-describedby`. Inside a Field, the Field label names the group. Outside a Field, the label prop becomes `aria-label`. Single mode reports required and error with `aria-required` and `aria-invalid` on the group. Multiple mode reports errors with `aria-invalid` on each card. When focus arrives on the group from an error summary, it moves to the picked card, or the first card. The picked state is shown by the check shape and `aria-checked`, not only by the border color. The focus ring always shows on the card.
## Density
padding `density.card-padding`, title `density.body-font-size`. `space.12` between cards. At phone width (touch), cards are at least `density.control-height-lg` tall.
## Platform differences
Native uses a list of Pressable cards. Users press each card instead of using the arrow keys. The props are the same.
## Avoid
Marking the picked card with a thick colored stripe on the left or a filled background (D-57). Buttons, links or other pressable elements inside content. Cards for options that only have short labels (use RadioGroup or CheckboxGroup). Information cards that cannot be picked (use Card). Code review checks these. In blocks, `check-blocks.mjs` blocks left stripes.
## Stories
Single · Multiple · WithContent · States.
## References
PR-08. Replaces the channel, work order, receipt, finished product and color chip cards in blocks. Benchmarks are used for structure only.
