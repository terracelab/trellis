---
props:
  title: Screen name
  description: One-sentence description
  breadcrumbs: Location
  actions: Actions on the right
  meta: Status next to the title (on the description line when there are siblings)
  onBack: Back
  tabs: Tabs below
  siblings: Title row tabs (2 to 4 screens of the same group)
  onSiblingPress: Called when a title row tab is pressed
examples:
  List: List screen — Location, name and actions.
  Detail: Detail screen — Back button and status.
  Siblings: Title row tabs — Screens of the same group sit side by side as large titles (dividers between, underline on hover). meta moves to the description line, and phones get one horizontally scrolling line (PR-27 · PR-38).
---
# PageHeader
## Purpose
Use it to show the name, location and actions at the top of a screen. Every business screen has one.
## Anatomy
breadcrumbs (`type.caption` `fg.tertiary`, `/` separator) · back (IconButton) · title (`type.h1` 28 · 700) · meta · description (`fg.secondary`) · actions (right) · tabs (below). PR-26: inside actions, a Button or IconButton with no size set (md) uses `density.control-height-lg` (screen actions are one step larger). Screen actions are labelled buttons by default; icon-only buttons are for tertiary actions.
## Props
Generated from the contract.
## Variants
With or without breadcrumbs · back · tabs. siblings (PR-27): 2 to 4 screens of the same group sit side by side. Only the current screen is an h1 (`type.h1`, `fg.primary`); the others are one step smaller, `type.h3` (`fg.tertiary`), on the h1's baseline. On hover they turn `fg.secondary` with a `border.width.2` underline, so it is clear which titles can be pressed (D-141, approved). Siblings sit `space.32` apart with a vertical divider (`border.strong`, half the line height) in the middle of the gap, so a name with middle dots (법인 · 임원 · 주주) and the gaps between siblings don't read as one long title. When the row wraps, the divider at the start of a new line is hidden. With Tabs below the title this makes two levels: the big group on the title row and the small group in the tabs.
## States
default.
## Behavior
Below a width of 1024, the actions move below the title. With siblings, the title line holds only the siblings and meta moves to the description line (PR-38). On phones (width below `breakpoint.sm`) the sibling line never wraps: it is one horizontally scrolling line (snapping), and only that line scrolls so the current screen is visible (the page does not move). The overflowing right end fades out. On phones (width below `breakpoint.sm`) and in touch density, the back button becomes a large thumb-sized button. Its size is `density.control-height-lg` and never smaller than `size.touch.min` (44). In touch density it is 56. The icon grows to 20, and a one-line title is centered on the button height.
## Accessibility
The title is `<h1>`, and the location is `<nav aria-label="위치">` (Breadcrumb).
## Density
Bottom spacing `density.gutter`. The back button is `density.control-height-md` on wide screens and max(`size.touch.min`, `density.control-height-lg`) on phones and in touch density.
## Platform differences
On native, the navigation bar takes its place.
## Avoid
A greeting as the title (content.md §5). Two primary buttons.
## Stories
List (VRT) · Detail · Siblings (VRT, 1280 · 390).
## References
content.md §5 (screen titles).
