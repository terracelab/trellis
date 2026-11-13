---
props:
  title: Group title
  description: One-sentence description
  columns: Number of grid columns
  action: Action to the right of the title
  collapsible: Collapsible section (optional fields)
  open: Open (controlled)
  defaultOpen: Open at first (uncontrolled)
  onOpenChange: Called when open changes
  children: Field list
examples:
  OptionalCollapsed: Collapsed optional fields — Kept collapsed under the required fields. When collapsed it shows how many fields are filled, and it opens on its own when an error appears inside.
  TwoColumns: Two columns — Recipient details.
---
# FormSection
## Purpose
Use it to group one part of a form (basic information, recipient, payment terms). It lays out Field components in a grid.
## Anatomy
`<fieldset>` · legend (title `type.h3`) · description (`type.caption`) · action · grid (1 · 2 · 3 columns, gap `density.gutter`).
## Props
Generated from the contract.
## Variants
columns 1 · 2 · 3. A Field's span merges cells.
## States
default only. The section itself is not interactive. The `collapsible` toggle follows the button grammar (hover, `tl-focusable` focus ring), and the content is `inert` while collapsed.
## Behavior
Below 1024, it is one column regardless of columns. **Collapsing**: with collapsible, the title row becomes an expand button (leading chevron, rotated 90 degrees when open), collapsed by default (defaultOpen · open/onOpenChange). It folds away the optional fields of a form sheet (memo, receipt, serial, business type, address) so the save button is closer on phones. When collapsed, the number of filled fields shows next to the title (`입력 2개`, "2 filled", muted text, nothing at zero). A Field counts as filled when it has input text, a checked box, a hidden input value or `data-filled` (button-style inputs). Inputs stay while collapsed (inert keeps them out of focus and screen readers), so values are kept. When a Field error newly appears inside (after validation), the section opens on its own so no error stays hidden; collapsing it again does not reopen it for the same error. Opening animates height (`duration.200`), instantly under reduced motion.
## Accessibility
`<fieldset>` and `<legend>` give the group a name that screen readers read. The fieldset is named by the title (aria-labelledby). In a collapsible section the title button has aria-expanded and aria-controls and opens with Enter or Space.
## Density
Grid gap `density.gutter`.
## Platform differences
Native is always one column. Collapsing on native is the next Phase (same contract).
## Avoid
A group inside a group.
## Stories
TwoColumns · WithAction.
## References
components.md §10 FormRegister.
