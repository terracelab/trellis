---
props:
  children: Label
  variant: Look (`subtle` light fill, `outline` border only). No status colors
  size: Height (`sm` 20, `md` 24)
  icon: Leading icon
  person: Leading avatar for a person (circle, 24)
  onRemove: Called when the × button is pressed (the button appears when set)
  label: Label used in the × button name (defaults to the children text or the person name)
  disabled: Disabled (no × button)
examples:
  Basic: Categories and keywords — One neutral color. A removable chip ends with an × button.
  Removable: Removing — The × button is named "Remove <label>" and is reached with Tab.
  People: Person chips — A circle avatar (24) and the name, for places where people are added and removed, such as CC and attendees.
  Sizes: Sizes — `sm` for table cells and cards, `md` for input boxes and filters. Disabled chips have no × button.
---
# Tag
## Purpose
Use it to show one label that is not a status, such as a category, keyword or person, as a chip. With `onRemove`, an × button removes it. For status meaning (approved, overdue, error) use Badge or StatusDot. For a set of chips to choose from, use FilterBar chips or SegmentedControl. For a box where chips are typed in, use TagInput.
## Anatomy
root (`span`, `tl-tag`) · icon (16, `fg.secondary`) or person (Avatar circle 24, decorative) · label (`type.label` 500, `type.caption` in sm, truncates with an ellipsis) · remove (`button`, 16 visible and 24 hit area, `x` icon in `fg.secondary`). Fill `bg.sunken`, border `border.divider` 1px, corner `radius.sm` (`radius.full` for person chips).
## Props
Generated from the contract.
## Variants
2 variants × 2 sizes. There is one neutral color and no tone prop (status belongs to Badge).

| variant | Fill | Border | Text |
|---|---|---|---|
| subtle (default) | `bg.sunken` | `border.divider` | `fg.primary` |
| outline | none | `border.strong` | `fg.primary` |

| size | Height | Side padding | Text |
|---|---|---|---|
| sm | `space.20` | `space.6` | `type.caption` |
| md (default) | `space.24` | `space.8` | `type.label` |

With `person`, the chip is 24 tall at either size, has no start padding, and is a pill with the circle avatar at its start.
## States
default · hover (× button fill mixes 10% of `fg.primary` and the icon turns `fg.primary`, `duration.fast`) · focus (focus ring on the × button) · disabled (text `fg.disabled`, no × button, `aria-disabled`). active, loading and error do not apply. The chip itself is not pressable.
## Behavior
Pressing the × button (mouse, Enter or Space) calls `onRemove`. Removing the chip from the list is up to the caller (controlled). The caller also moves focus afterwards (TagInput moves it to its input).

| Key | Action |
|---|---|
| Tab | Moves focus to the × button |
| Enter · Space | Removes (onRemove) |
## Accessibility
The × button is named "Remove <label>" (`tag.remove`). When the label is not text, pass `label`. A person chip's avatar is decorative and the name text is read. Text contrast of `fg.primary` on `bg.sunken` is above 4.5:1, and the × icon in `fg.secondary` is above 3:1. The hit area extends to 24 beyond the visible box (WCAG 2.5.8).
## Density
Sizes do not depend on density (the chip height matches a line of text). TagInput picks the size from its box size (xs and sm boxes use sm chips).
## Platform differences
Native uses View and Text, with a Pressable × button (hitSlop 4). Props are the same.
## Avoid
Status (approved, overdue) as Tag colors (use Badge or StatusDot). A row of colored chips on every table row (status is a dot and words). Making Tag pressable like a button. Drawing the person chip avatar by hand (follow the Avatar rule). Code review checks these.
## Stories
Basic · Removable · People · Sizes.
## References
SY-13 (removable Tag), R-T25 (CC chips), Badge (status), Avatar (person chips), TagInput. Benchmarks for structure only.
