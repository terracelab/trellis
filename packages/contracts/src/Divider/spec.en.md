---
props:
  orientation: Direction (horizontal or vertical line)
  variant: Line color (`subtle` is border.divider, `strong` is border.strong)
  spacing: Outer space (none 0, sm 8, md 16, lg 24)
  label: Text in the middle (horizontal only)
  decorative: Hide from screen readers (a purely visual line)
examples:
  Basic: Horizontal line — Between groups. `spacing` sets the space in one place.
  Vertical: Vertical line — Between metadata or toolbar items. It follows the line height.
  Labelled: Middle text and strong line — The text becomes the separator name. `strong` goes above totals and between large groups.
---
# Divider
## Purpose
Use it to split content with one line, between groups (horizontal) or between metadata and tools (vertical). Text such as "earlier records" can sit in the middle. Cards, tables and panels draw their own borders, so do not stack a Divider on them. Large group titles belong to FormSection or the Card header, and date lines belong to MessageThread.
## Anatomy
root (`div`, `tl-divider`, role separator) · line (`border.width.1`, color `border.divider`, or `border.strong` for strong) · label (middle of a horizontal line, `type.caption` in `fg.secondary`, with the lines on both sides drawn by pseudo-elements).
## Props
Generated from the contract.
## Variants
2 orientations × 2 variants × 4 spacings.

| variant | Line color | Where |
|---|---|---|
| subtle (default) | `border.divider` | between groups and metadata |
| strong | `border.strong` | above totals, between large groups |

`spacing` is the space outside the line (above and below a horizontal line, left and right of a vertical one): none 0, sm `space.8`, md `space.16`, lg `space.24`. A vertical line fills the height of a flex row, and inside a line of text it takes the caption line height.
## States
default only. It is not pressable. hover, active, focus, disabled, loading and error do not apply.
## Behavior
There is no motion and no keyboard interaction. The middle text only shows on horizontal lines (vertical lines ignore `label`).
## Accessibility
By default it has `role="separator"` and `aria-orientation`. Middle text becomes the `aria-label`, and the visible text is aria-hidden (children of a separator are not read). A purely visual line (a decoration such as an underline under a card header) uses `decorative` to leave the screen reader (`aria-hidden`). A line is not text, so the contrast rule does not apply, but `border.divider` stays visible on surfaces. The middle text in `fg.secondary` is above 4.5:1.
## Density
Line width and spacing do not depend on density. To follow density, the caller wraps it with `density.gutter`.
## Platform differences
Native uses a View (`border.width.1` instead of a hairline), with no `accessibilityRole` for the separator and a Text for the label. Props are the same.
## Avoid
Stacking a Divider on card or table borders. Lines of 2px or more for emphasis. Status-colored lines (including left accent stripes, D-57). Using `spacing` only to make empty space. Code review checks these.
## Stories
Basic · Vertical · Labelled.
## References
SY-13 (Divider), components.md §8 (no left accent stripes, D-57), tokens `border.divider` and `border.strong`. Benchmarks for structure only.
