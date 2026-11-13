---
props:
  label: Accessible name outside Field
  value: Amount (controlled)
  defaultValue: Initial amount (uncontrolled)
  onChange: Called when the amount changes
  currency: Currency. `KRW` puts `원` (won) after the number, others put the code before it with 2 decimals (0 for JPY)
  allowNegative: Allows negative numbers
  showKorean: Shows the amount in Korean words (KRW)
  min: Minimum (shows an error when the value is outside)
  max: Maximum (shows an error when the value is outside)
  placeholder: Example value
  disabled: Disabled
  invalid: Error (automatic when Field has an error)
  required: Required
  size: Height
  name: Form name (submits the plain number)
examples:
  Basic: Supply amount — Thousands separators while typing, and the amount in Korean words below.
  Currency: Foreign currency and range — The currency code goes first, with 2 decimals (0 for JPY).
---
# AmountInput
## Purpose
Use it to enter an amount of money (supply amount, unit price, payment amount). It inserts thousands separators while the user types. Use QuantityInput for quantities.
Amounts are in won (KRW, `원`), right-aligned, with thousands separators and tabular figures.
## Anatomy
root (same border, height and radius as Input) · prefix (foreign currency code, `fg.tertiary`) · control (right-aligned, `font.numeric`) · suffix (`원`, `fg.tertiary`) · korean (`type.caption`, `fg.tertiary`, the amount in Korean words below the field).
## Props
Generated from the contract.
## Variants
currency KRW (`원` after the number, no decimals) · USD · EUR · CNY (code before the number, 2 decimals) · JPY (code before the number, no decimals). showKorean (KRW only). 5 sizes (xs · sm · md · lg · xl).
## States
default · hover (`border.strong`) · focus (`border.focus` + ring) · disabled (`bg.sunken`) · error (`status.danger.default` border, also when the value is outside min or max). active and loading do not apply.
## Behavior
It accepts only digits, the decimal point and the minus sign (when allowNegative is set), and drops everything else. The cursor stays where the user was typing when commas are inserted. While a Korean input method is composing, the value is left alone. It is cleaned up when composition ends. Pasted `1,234,000원` becomes 1234000. On blur, missing decimal places are filled in (USD 12.5 → 12.50). A value outside min or max is not changed. It is shown as an error. An empty field is null.
## Accessibility
Renders `<input inputmode="numeric|decimal">`. Inside Field, the label, description and error are connected automatically, and the amount in Korean words is also read through `aria-describedby`. Negative numbers show with U+2212 (−). Contrast is the same as Input.
## Density
Height `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). Input text uses `density.input-font-size` from xs to md, and the larger of that and `type.body` at lg and xl (touch keeps 16).
## Platform differences
Native uses TextInput with keyboardType numeric or decimal-pad and the same formatting functions.
## Avoid
Left-aligned amounts. Commas typed into the string by hand (use `formatAmount`). `원` after a foreign currency. Negative numbers in parentheses. Code review checks these.
## Stories
Default · Currency · Korean · Negative · Error · Disabled.
## References
content.md §4 (amounts, negative numbers), components.md §8 (numbers, amounts).
