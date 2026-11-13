---
props:
  name: Icon name (Lucide)
  size: Size
  label: Accessible name for an icon that carries meaning. Without it, the icon is decorative
examples:
  Sizes: Sizes — 16, 20 and 24. The color follows the text color.
---
# Icon
## Purpose
Use it for line icons next to buttons, menus and states. For module app icons (tiles), use ModuleIcon.
## Anatomy
svg (24 viewBox, stroke `currentColor` 1.5, no fill). The color follows the text color.
## Props
Generated from the contract.
## Variants
size 16 · 20 · 24.
## States
default.
## Behavior
Names come only from `ICON_NAMES` in `@terracelab/trellis-icons` (generated from Lucide). An unknown name is a type error.
## Accessibility
Without a label, the icon gets `aria-hidden`. For a button with only an icon, the IconButton label becomes the name.
## Density
Size does not change with density. It stays 16 in compact. The tokens `size.icon.16`, `20` and `24` set the size (`data-size` with a zero-specificity `:where` rule, R-37). When an app enlarges these tokens in a text size mode, icons grow too. Sizes a component sets itself (75% inside the MultiSelect box and so on) still win. The width and height attributes stay as a fallback without CSS (they equal the default token values, so nothing moves).
## Platform differences
Native draws the same data with react-native-svg.
## Avoid
Importing Lucide directly (the rule is one adapter in one place). Coloring an icon with a status color (use Badge or StatusDot for states).
## Stories
Sizes · InButton.
## References
Lucide (ISC).
