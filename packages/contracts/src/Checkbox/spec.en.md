---
props:
  checked: Checked (controlled)
  defaultChecked: Initially checked (uncontrolled)
  onChange: Called when the checked state changes
  indeterminate: Partly selected
  children: Label
  description: Description under the label
  disabled: Disabled
  invalid: Error
  name: Form name
  value: Value sent with the form
examples:
  SelectAll: Select all — When only some rows are selected, the header checkbox shows as partly selected.
  States: Description, error and disabled — The description is one line under the label.
---
# Checkbox
## Purpose
Use it for one on/off choice or to select several items in a list. Use Switch for a setting that applies at once, and RadioGroup to pick one of several.
## Anatomy
root · box (16, `radius.xs`, `fg.tertiary` border, `bg.surface`) · indicator (check or minus, `fg.inverse`) · label (`density.body-font-size`, `fg.primary`) · description (`type.caption`, `fg.tertiary`).
When checked or partly selected, the box has a `brand.default` background.
## Props
Generated from the contract.
## Variants
Label only · label with description · no label (row selection in a table, which then needs aria-label).
## States
default · hover (box `border.focus`) · focus (ring on the box) · disabled (box `bg.sunken`, label `fg.disabled`) · error (box with a `status.danger.default` border). Partly selected shows a minus. active and loading do not apply.
## Behavior
Pressing the box or the label toggles it. Space toggles it (Enter submits the form). Passing checked makes it controlled, and defaultChecked makes it uncontrolled. indeterminate changes only the display, and the next click selects it.
## Accessibility
Built on Base UI Checkbox. It has `role="checkbox"` with `aria-checked` (mixed when partly selected). The wrapping `<label>` gives the accessible name, and the description is read through `aria-describedby`. The `fg.tertiary` box border has at least 3:1 contrast against the background. The focus ring is always visible on the box. The target is 24 (WCAG 2.5.8) while the visible box stays 16. The box is drawn with ::before and negative outer margins keep the row height and text position unchanged (R-33).
## Density
Box fixed at 16. Row height follows the content. `space.8` between the box and the label.
## Platform differences
Native uses Pressable with a check icon, and the whole label is pressable.
## Avoid
A Checkbox for a single setting that saves as soon as it is pressed (use Switch; for a group of options that saves at once, use CheckboxGroup pending). A Checkbox with no label and no aria-label. Negative labels such as `알림 받지 않기` (do not receive notifications). Code review checks these.
## Stories
Default · Indeterminate · Description · Error · Disabled.
## References
Base UI Checkbox.
