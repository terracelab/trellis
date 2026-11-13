---
props:
  options: Segments (2 to 5)
  value: Value (controlled)
  defaultValue: Initial value (the first segment if omitted)
  onChange: Called when the value changes
  size: Height
  fullWidth: Fills the parent width
  disabled: Disabled
  name: Form name
  label: Accessible name (outside Field)
examples:
  ApprovalFilter: Approval status filter — A count on each segment.
  Views: View switch — Icons, small size and full parent width.
---
# SegmentedControl
## Purpose
Use it to switch the view or range of the same list among 2 to 5 options (all · in progress · approved, day · week · month). Use Tabs when the whole content of the screen changes, and RadioGroup for a form value.
## Anatomy
root (`bg.sunken`, `radius.md`, inner padding 2) · segment (`radius.sm`, `type.label`, `fg.secondary`) · icon (16) · count (`font.numeric`, `fg.tertiary`).
The selected segment uses `bg.surface` + `shadow.sm` + `fg.primary` 600.
## Props
Generated from the contract.
## Variants
size sm · md (`density.control-height-sm/md`), fullWidth (equal-width segments), with or without icon and count.
## States
default · hover (segment `fg.primary`) · focus (segment ring) · disabled (all `fg.disabled`). active, loading and error do not apply.
## Behavior
A press changes the value right away. Tabbing in puts focus on the selected segment, and arrow keys move and select. One segment is always selected (the first one when there is no defaultValue). count shows 99+ above 99.
## Accessibility
Built on Base UI RadioGroup, with `role="radiogroup"` and `role="radio"` on each segment. A segment's name is its label plus the count, like `진행 12건` (in progress, 12 items), where `건` is hidden text on screen. Inside Field, the Field label is the group name. Outside Field, the label prop is. The focus ring always shows on the segment.
## Density
Height `density.control-height-sm/md`, horizontal segment padding `space.12` (sm `space.8`).
## Platform differences
Native is a row of Pressables with the same look and no arrow keys.
## Avoid
More than 5 segments (use Select or Tabs). A different action per segment (use a group of buttons). Icons without a label. Code review checks these.
## Stories
Default · Count · Icon · FullWidth · Sizes · Disabled.
## References
Base UI Radio Group. The count format in status filters is the same as the D-35 count badge.
