---
props:
  items: Tabs
  value: Selected tab (controlled)
  defaultValue: Selected tab at first (the first tab by default)
  onChange: Called when the selection changes
  size: Height
  label: Name of the tab list
examples:
  Filter: Filter tabs — Tax invoice counts by status.
---
# Tabs
## Purpose
Use it to switch views within one screen (all, awaiting issue, send failed; or basic info, items, history). Use SideNav to move between screens.
## Anatomy
list (`border.divider` below) · tab (`type.h3` 16 600, resting tabs `fg.tertiary`, height `control-height-lg` + 8, 16 between tabs; selected is `fg.primary` 700 + a 2px `fg.primary` underline; sizes are in the Density section) (PR-27: the brand color stays on the sidebar and primary buttons, tabs use text color) · count (no pill, `type.caption` 500 `fg.secondary` tabular digits. Do not put a gray pill on each tab) · panel.
## Props
Generated from the contract.
## Variants
5 sizes (xs · sm · md · lg · xl), with or without content (filter type · panel type). md and lg are screen tabs, xs and sm are tabs inside a card or panel, and xl is a header tab for large screens.
## States
default · hover · active · focus · disabled.
## Behavior
Built on Base UI Tabs. Arrow keys move between tabs, and moving selects the tab right away. When the tabs overflow the width, they scroll sideways and the overflowing edge fades (`data-overflow`). If the selected tab is hidden, the list scrolls to show it.
## Accessibility
Uses `role="tablist" / "tab" / "tabpanel"` and `aria-selected`.
## Density
Tab height and text: xs `control-height-sm` · `type.caption`, sm `control-height-md` · `type.label`, md and lg `control-height-lg` + `space.8` · `type.h3`, xl `control-height-xl` + `space.8` · `type.h2`. Space between tabs xs 8 · sm 12 · md and lg 16 · xl 20.
## Platform differences
Native uses tabs that scroll sideways.
## Avoid
Tabs inside tabs. More than seven tabs (use Select).
## Stories
Filter · Panels · Count.
## References
Base UI Tabs.
