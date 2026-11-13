---
props:
  module: Module id
  size: Side length (size.module-icon token)
  label: Accessible name (defaults to the module label)
  decorative: Decorative (when the module name is next to it)
examples:
  Tiles: Illustrated tiles — Modules that have a tile draw the illustration.
  Fallback: Generated fallback — Modules without a tile get a group color gradient and a line icon.
  Sizes: Sizes — Favorites 32 · notification card 40 · launcher 48.
---
# ModuleIcon
## Purpose
Use it to show one business module (accounting, mail, inventory and so on) as an app icon tile. It appears in the launcher, favorites, notification cards and the sidebar header. For general UI icons, use Icon.
## Anatomy
root (square, `size.module-icon-32/40/48`, radius 22%) · tile (illustration SVG, `@terracelab/trellis-icons/module-tiles`) or fallback (vertical gradient `color.module.<group>.gradient-from → gradient-to` + the module's Lucide icon in `fg.inverse` at 56% of the tile).
## Props
Generated from the contract.
## Variants
3 sizes × 2 artworks (illustrated tile · generated fallback). The module id decides which artwork is used.
## States
default.
## Behavior
When `moduleTileByModule[module]` exists, it draws that illustration. Otherwise it draws a fallback with the group color and icon from modules.json (D-36). SVG ids inside the illustration get a prefix per instance, so gradients do not collide when the same module appears several times on one screen. For an unknown module id, it draws a gray grid icon and warns in development mode.
## Accessibility
`role="img"` + `aria-label` (defaults to the modules.json label). When the module name appears as text next to it, hide it with `decorative`. The `<title>` inside the illustration is removed, so only the outer label is read.
## Density
Size does not depend on density. Sidebar favorites 32, notification card 40, launcher 48.
## Platform differences
Native draws the same tiles with react-native-svg. The props are the same.
## Avoid
Putting a count inside the tile (counts belong on the card or badge). Arbitrary colors instead of the group color. Third-party app icons. Code review checks these.
## Stories
Tiles · Fallback · Sizes.
## References
D-36 (module app icons), components.md §7 module registry.
