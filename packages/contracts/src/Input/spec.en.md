---
props:
  value: Value (controlled)
  defaultValue: Initial value (uncontrolled)
  onChange: Called when the value changes
  placeholder: Example value
  type: Input type
  size: Height
  icon: Leading icon
  prefix: Leading text
  suffix: Trailing unit
  align: Text alignment
  mono: Monospace font (codes and numbers)
  clearable: Clear button
  disabled: Disabled
  readOnly: Read-only
  invalid: Error (automatic with a Field error)
  required: Required
  name: Form name
  maxLength: Maximum number of characters
  inputMode: Mobile keyboard
  autoComplete: Autocomplete
  onEnter: Called on Enter
  label: Accessible name outside a Field
examples:
  Kinds: Search, unit and error — Numbers are right-aligned.
  Mono: Code entry — Values you compare position by position, like item codes and account numbers, use a monospace font (mono).
---
# Input
## Purpose
Use it to enter one line of text. Use AmountInput for amounts, QuantityInput for quantities, MaskedInput for formatted numbers and CodeSearch for code search.
## Anatomy
root (`bg.surface`, `border.default`, `radius.md`, height `density.control-height-*`) · icon · prefix · control (with mono, `font.family.mono`, weight and letter spacing from `type.mono`) · suffix (`fg.tertiary`) · clear.
## Props
Generated from the contract.
## Variants
5 sizes (xs · sm · md · lg · xl), icon · prefix · suffix · clearable · mono.
## States
default · hover (`border.strong`) · focus (`border.focus` + ring) · disabled (`bg.sunken`) · error (`status.danger.default` border).
## Behavior
With `clearable`, a clear button appears when there is a value, and Escape also clears it. With `type="search"` and `clearable` together, the browser's own clear button (Chromium, Safari) is hidden, so only one clear button shows. Enter calls `onEnter`. With mono, only the font changes to monospace, and the text size follows the input field rule (16 at touch). Use it for values compared position by position, such as item codes, account numbers and times.
## Accessibility
Inside a Field, the label, description and error are linked automatically (`aria-describedby` · `aria-invalid`).
## Density
Height `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). Input text uses `density.input-font-size` from xs to md, and the larger of that and `type.body` at lg and xl (touch keeps 16).
## Platform differences
Native uses TextInput, and the clear button uses clearButtonMode.
## Avoid
A placeholder instead of a label. Left-aligned numbers. mono on prose such as names or notes. Code review checks these.
## Stories
Default · Icon · Suffix · Error · Disabled · Mono.
## References
None.
