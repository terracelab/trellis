---
props:
  label: Label
  required: Required (shows a dot)
  help: Help text
  error: Error message
  layout: Label position
  disabled: Disables the input inside
  span: Number of FormSection columns
  children: One input
examples:
  Basic: Label, required mark, help and error
---
# Field
## Purpose
Use it to attach a label, required mark, help text and error to one input. Every form field goes inside a Field.
## Anatomy
label (`type.label`, a `status.danger.default` dot when required) · control (child) · help (`type.caption` fg.tertiary) · error (`type.caption`, icon with `fg.primary` text, the field border turns the danger color).
## Props
Generated from the contract.
## Variants
layout vertical · horizontal (label column 120, compact), span 1 · 2 · 3.
## States
default · disabled · error.
## Behavior
Passes the id, description id, error, required and disabled state down to the child input (useFieldControl). When there is an error, the error shows in place of the help text. Errors an input finds on its own (a DateField date outside `min` and `max`, a failed MaskedInput `validate` check digit) show in the same error slot. The input raises and clears its message through an internal channel (`useFieldMessage`), and the `error` prop wins when it is set.
## Accessibility
Uses `<label for>`, `aria-describedby` (help and error) and `aria-invalid`. For a required field, a hidden `(필수)` (required) text is read with the label. An error raised by the input appears while the user types, so the error slot gets `role="alert"` and is read at once. An `error` prop error is read as the description on focus.
## Density
4 between the label and the field. Horizontal label column 120 (compact) · 140 (comfortable).
## Platform differences
Native does not use the horizontal layout (always vertical).
## Avoid
A field on its own without a Field. An error shown only as red text.
## Stories
Vertical · Horizontal · Error · Required.
## References
content.md §5 (form labels and error messages).
