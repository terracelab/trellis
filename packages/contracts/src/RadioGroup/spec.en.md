---
props:
  options: Options
  value: Value (controlled)
  defaultValue: Initial value (uncontrolled)
  onChange: Called when the value changes
  orientation: Layout direction
  disabled: Disables the whole group
  name: Form name
  label: Accessible name (outside a Field)
examples:
  Vertical: Tax type — The Field label becomes the group name.
  Horizontal: Horizontal layout — Three short labels or fewer.
---
# RadioGroup
## Purpose
Use it to pick one of 2 to 5 options (tax type, payment terms). For more options, use Select. To switch views, use SegmentedControl. Exception: in cells inside a row, like LineItemsEditor or DataGrid cells, use Select even for 2 to 5 options (a radio group does not fit in a row height).
## Anatomy
root (radiogroup) · option · radio (16 circle, `fg.tertiary` border, `bg.surface`) · dot (when selected, the radio gets a `brand.default` background + `fg.inverse` dot) · label (`density.body-font-size`) · description (`type.caption`, `fg.tertiary`).
## Props
Generated from the contract.
## Variants
orientation vertical (when options have descriptions) · horizontal (three short labels or fewer).
## States
default · hover (radio `border.focus`) · focus (radio ring) · disabled (the whole group or one option, `fg.disabled`) · error (with a Field error, radio border `status.danger.default`). active and loading do not apply.
## Behavior
Built on Base UI RadioGroup. Tabbing into the group focuses the selected option, or the first option when none is selected. The arrow keys move focus and select at the same time. Pressing a label also selects. Passing value makes it controlled, and defaultValue makes it uncontrolled.
## Accessibility
`role="radiogroup"` + `role="radio"` on each option. Inside a Field, the Field label names the group through `aria-labelledby`. Outside a Field, the label prop becomes `aria-label`. Option descriptions use the radio's `aria-describedby`. The `fg.tertiary` radio border has at least 3:1 contrast against the background. The focus ring always shows on the radio.
## Density
radio fixed at 16. vertical `space.8` between options, horizontal `space.16` between options.
## Platform differences
Native uses a Pressable list. Users press each option instead of using the arrow keys.
## Avoid
A RadioGroup with one option (use Checkbox). More than 6 options (use Select). A group with no name. Code review checks these.
## Stories
Vertical · Horizontal · Description · Error · Disabled.
## References
Base UI Radio Group.
