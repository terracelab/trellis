---
props:
  icon: Icon
  label: Accessible name and tooltip
  variant: Role
  size: Square size
  count: Count badge (99+)
  countTone: Count color
  disabled: Disabled
  pressed: Toggle state (aria-pressed)
  onPress: Called when pressed
examples:
  GlobalBar: Global bar — The notification count uses the danger color, and the rest are gray.
---
# IconButton
## Purpose
Use it for a button that shows only an icon. Typical places are the global bar (notifications, settings), row actions in a table and close buttons.
## Anatomy
Square root (`density.control-height-*`) · icon (16 at xs · sm · md, 20 at lg, 24 at xl) · count (top right, `formatCount`; height and minimum width = `type.caption` text + `space.4`, 16 by default, so the badge grows with the number in a text size mode, R-37).
## Props
Generated from the contract.
## Variants
3 variants × 5 sizes (xs · sm · md · lg · xl), with or without count.
## States
default · hover · active · focus · disabled.
## Behavior
label becomes `aria-label` and shows in a Trellis Tooltip on pointer hover and keyboard focus. The browser `title` attribute is not used (it does not appear for keyboard users and looks different in every browser). When an outer Tooltip wraps it, only that Tooltip appears (for different text or placement). When there is a count, the number follows the name (`알림 6`, notifications 6). The name must use the same words as what is visible so that voice commands can press it too.
## Accessibility
The icon is decorative, and label gives the name. The tooltip text is the same as the name. When pressed is set, it sets `aria-pressed`. A natively disabled button shows no tooltip.
## Density
Square side `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). xs uses radius `radius.sm`.
## Platform differences
Native uses hitSlop for a touch area of at least 44.
## Avoid
Using it without label (a type error). A main action shown only as an icon.
## Stories
Variants · Count.
## References
None.
