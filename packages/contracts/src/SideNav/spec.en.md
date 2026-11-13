---
props:
  sections: Menu sections
  activeId: Current screen
  onNavigate: Called when an item is pressed
  collapsed: Icons only (follows the AppShell when not given)
  onSectionOpenChange: Called when a section opens or closes (header press, revealing the current screen)
  revealActive: Opens a collapsed section when the current screen is inside it
  header: Top area
  footer: Bottom area
  label: Navigation name
examples:
  Trade: Trading company menu — Group color dots, counts and sub-features.
  ControlledSections: Controlled sections — The app decides and remembers which sections are open with open and onSectionOpenChange. When the current screen moves into a collapsed section, SideNav reports it with onSectionOpenChange(id, true).
  ActiveInCollapsed: Current screen in a collapsed section — The section header turns to the current-screen color and weight, and screen readers read `지금 화면 있음` (current page inside).
---
# SideNav
## Purpose
Use it to show the sidebar menu with home, favorites, module sections (group color dots) and sub-features. Place it in the sidebar slot of AppShell.
## Anatomy
header · section (label `type.caption` 600 fg.tertiary, group color dot, collapse chevron) · item (height `density.row-height`, icon 16 fg.tertiary, label, count on the right, the selected item gets a `brand.subtle` background + `fg.link`) · child item (indented) · footer. PR-27: surface `bg.nav` (brand 950, same in light and dark), text `nav.fg`, section names, icons and chevrons `nav.fgMuted`, hover `nav.hover` + `nav.fgActive`, current screen `nav.selected` surface + `nav.fgActive` 600 (no left rail), dividers `nav.border`, focus ring `nav.focus`. Icons 20 at the top level and 16 below, top-level text 500, children indented to the parent text. Counts are plain white `type.caption` 600 numbers with no pill (delays and errors add a 6px `status.danger.default` dot before the number, because red text lacks contrast on the dark surface).
## Props
Generated from the contract.
## Variants
collapsed (icons only, the label goes in title), collapsible sections.
## States
default · hover (`bg.sunken`) · active (selected) · focus.
## Behavior
The section and parent of the selected item start expanded. An item with href is a link. Without href, it is a button.

Section open state (R-42): uncontrolled sections start from `defaultOpen` (collapsible sections are closed without it), but the section holding the current screen (activeId) opens even when defaultOpen is false, as long as `revealActive` is on (the default). So an app passing its remembered state does not have to handle the current section separately. For controlled sections, give each section `open`. Pressing a header then only calls `onSectionOpenChange(id, open)`. Uncontrolled sections call the same callback so the app can remember them.

Revealing the current screen (R-42): when activeId moves into a collapsed section or submenu (also when the move comes from outside the sidebar: a link in the content, a tab or the assistant), that section opens. A controlled section reports it with `onSectionOpenChange(id, true)` and the app changes open. A controlled section that starts closed while holding the current screen reports it once on the first render. Nothing is re-mounted, so the scroll position and submenu state stay. If the person closes the current section, it stays closed until activeId changes. Turn this off with `revealActive={false}`.

Current screen inside a collapsed section (R-42): when the section holding the current screen is closed, its header text turns `nav.fgActive` at weight 700 (one step bolder). It differs by weight as well as color, and screen readers read `지금 화면 있음` (current page inside) after the header name.

Section headers and sections carry `data-section-id` (the section id). Tests and automation (agent replay) find sections by it instead of by label text.

Without `collapsed`, SideNav follows the AppShell sidebar collapse (R-41). Outside an AppShell it is expanded.

Scrolling: an overflowing list scrolls inside the sidebar. The scrollbar thumb is `nav.hover` to suit the dark surface, and `nav.fgMuted` on hover or keyboard focus inside. The gutter is always reserved (`scrollbar-gutter: stable`), so items do not shift when the scrollbar appears (R-37).
## Accessibility
`<nav aria-label>`. The selected item has `aria-current="page"`. Section buttons have `aria-expanded`. Lists are rendered only when open, so `aria-controls` is set only when open (it never points at a missing id while closed). Submenu buttons work the same way. A current screen inside a collapsed section is announced with the hidden text `지금 화면 있음` (current page inside).
## Density
rows `density.row-height`, `space.16` between sections.
## Platform differences
Not available on native (tab bar + full menu screen instead).
## Avoid
Coloring each item (color is only for group dots and danger counts, D-40).
## Stories
Trade · ControlledSections · ActiveInCollapsed.
## References
D-40 · R-42 (section open control, revealing and marking the current screen, D-131) · R-37 (sidebar scrollbar).
