---
props:
  nodes: Organizations (children hold sub-organizations)
  selected: Selected organization (controlled)
  defaultSelected: Organization selected at first
  onSelect: Called when an organization is selected
  expanded: Expanded organizations (controlled)
  defaultExpanded: "Organizations expanded at first (`all` expands every one)"
  onExpandedChange: Called when expansion changes
  label: Tree name (defaults to `조직도`)
examples:
  Company: Company org chart — Each box shows the head and headcount. The selected organization gets a full outline.
  Collapsed: Expanded to divisions only — The circle button or the right arrow key opens sub-organizations.
---
# OrgChart
## Purpose
Use it to show the company structure as a top-down tree and to select an organization, so its members or approval policy open beside the chart. Each box holds the head (PersonLabel sm) and the headcount. Use FolderTree when only names are selected, as in folders or mailboxes.
## Anatomy
root (horizontal scroll) · tree (`ul role=tree`) · item (`li role=treeitem`) · node (box: name 700, head, headcount in caption `fg.tertiary`, `radius.lg` border) · toggle (circle on the middle of the bottom edge, plus or minus) · group (`ul role=group`) · connectors (structural lines, `border.strong` 1px).
## Props
Generated from the contract.
## Variants
`defaultExpanded` is `all` (default) or a list of ids. The selected organization gets a full outline (`border.selected`).
## States
default · hover (darker box border, `duration.fast`) · focus (focus ring on the box).
## Behavior
Pressing a box selects it (`onSelect`). Pressing the circle collapses or expands sub-organizations without selecting. Wide charts scroll horizontally. On phones (under 640), the chart becomes an indented list with a structural tree line left of each sub-group.
## Accessibility
ARIA tree in the navigation tree pattern: the item is the node box, and its child group is a sibling list linked with aria-owns. The tree has one Tab stop (roving tabindex). Up and Down move in visible order, Right expands or moves to the first child, Left collapses or moves to the parent, Home and End jump, Enter and Space select. Each item is named by all the visible text in its node box (organization name, head and headcount), so the visible label is part of the name (WCAG 2.5.3). The circle is for the mouse (aria-hidden).
## Density
Vertical gap `space.32`, `space.16` between siblings, boxes 192 to 256 wide. The same in every density.
## Platform differences
Native draws the indented list only.
## Avoid
A different background color per organization. Headcount inside pills. A colored stripe left of a box (D-56, D-57). Code review checks these.
## Stories
Company · Collapsed.
## References
FolderTree (keyboard rules), PersonLabel.
