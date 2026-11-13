---
props:
  value: Value (controlled)
  defaultValue: Initial value (uncontrolled)
  onChange: Called when the value changes
  placeholder: Example value
  rows: Number of visible lines
  maxLength: Maximum characters (shows a character count)
  disabled: Disabled
  readOnly: Read-only
  invalid: Error (set automatically by a Field error)
  required: Required
  name: Form name
  resize: Height adjustment
examples:
  Basic: Transaction description and rejection reason — When there is a character limit, the count shows at the bottom right.
---
# Textarea
## Purpose
Use it for multi-line text input (transaction descriptions, rejection reasons, remarks). For one line, use Input.
## Anatomy
root (same `bg.surface` · `border.default` · `radius.md` as Input) · control (`density.body-font-size` · `density.body-line-height`) · count (`type.caption`, `fg.tertiary`, bottom right).
## Props
Generated from the contract.
## Variants
resize vertical · none. With maxLength, a character count shows.
## States
default · hover (`border.strong`) · focus (`border.focus` with ring) · disabled (`bg.sunken`, `fg.disabled`) · error (`status.danger.default` border). Read-only uses the disabled background with `fg.primary` text. When the count reaches the limit, count turns `fg.secondary`. active and loading do not apply.
## Behavior
Enter inserts a line break (it does not submit the form). Input cannot go past maxLength. The height starts from rows, and with resize vertical the user can make it taller. Passing value makes it controlled, and defaultValue makes it uncontrolled.
## Accessibility
Renders `<textarea>`. Inside a Field, the label, description and error connect automatically, and the character count is also read through `aria-describedby`. Contrast of `fg.primary` on `bg.surface` is at least 4.5:1. The focus ring is always visible on root.
## Density
Text `density.body-font-size`, line height `density.body-line-height`, inner padding `space.4` (vertical) · `space.8` (horizontal).
## Platform differences
Native uses a multiline TextInput with no resize (it grows with the content).
## Avoid
A Textarea for one-line values (business partner name, amount). A placeholder in place of a label. Cutting text at the character limit with no error message. Code review checks these.
## Stories
Default · Count · Error · Disabled · ReadOnly.
## References
content.md §5 (help and error messages).
