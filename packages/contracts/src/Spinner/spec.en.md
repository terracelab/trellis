---
props:
  size: Size
  label: Accessible text for screen readers
examples:
  Sizes: Sizes — 16, 20 and 24.
---
# Spinner
## Purpose
Use it to show a short wait (about one second) inside a button or cell. For the first load of a full screen or a table, use Skeleton.
## Anatomy
A quarter arc (`currentColor`) spins on a circle outline (`border.default`).
## Props
Generated from the contract.
## Variants
size 16 · 20 · 24.
## States
loading.
## Behavior
With reduced motion, it blinks slowly instead of spinning.
## Accessibility
Uses `role="status"` with visually hidden text.
## Density
Size does not change with density.
## Platform differences
Native uses ActivityIndicator.
## Avoid
Using it for a full-screen load that takes more than one second.
## Stories
Sizes · InButton.
## References
None.
