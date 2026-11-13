---
props:
  items: Label and value pairs
  columns: Number of columns
  layout: Label position. `horizontal` puts the label on the left (120 in compact), `vertical` puts it above
examples:
  Vendor: Business partner details — Labels on the left in 2 columns, with a copy button on numbers.
  Vertical: In a drawer — Narrow widths use 1 column with labels above.
---
# DescriptionList
## Purpose
Use it to show the attributes of one record as label and value pairs on a detail screen or in a drawer. Typical attributes are business partner, business registration number and payment terms. Use FormSection with Field for input, and a table to compare several records.
## Anatomy
list (`<dl>`, grid of `columns` columns) · item (`<div>`) · label (`<dt>`, `type.label` `fg.tertiary`) · value (`<dd>`, `density.body-font-size` `fg.primary`) · copy (IconButton sm, copy → check).
## Props
Generated from the contract.
## Variants
columns 1 · 2 · 3 × layout horizontal (label column 120 in compact, 140 in comfortable) · vertical (label above). span 1 · 2 · 3 per item.
## States
default · hover · focus (copy button).
## Behavior
span is reduced so it never exceeds columns. Pressing the copy button of a copyable item writes copyText to the clipboard. Without copyText, it writes the value when the value is text or a number. The icon then changes to check for 2 seconds. An empty value shows `–`. On narrow screens (under 640), the list becomes 1 column.
## Accessibility
Uses `<dl>` · `<dt>` · `<dd>` pairs. The copy button's name is `<라벨> 복사` (copy <label>). After copying, screen readers read the hidden status text `복사했습니다` (copied). Tab reaches the copy button, and Enter or Space presses it.
## Density
Row spacing `space.12`, horizontal label column 120 (compact) · 140 (comfortable).
## Platform differences
Native always draws close to a 1-column vertical layout, and copying uses the Clipboard API.
## Avoid
Input fields in the value slot (use FormSection). Colons in labels. Amounts as left-aligned strings (amounts are right-aligned). Code review checks these.
## Stories
Horizontal · Vertical · Copyable · ThreeColumns.
## References
content.md §4 (business registration numbers, amounts), Field (label column 120).
