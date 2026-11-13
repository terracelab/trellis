---
props:
  nodes: Folders (children for subfolders)
  selected: Selected folder (controlled)
  defaultSelected: First selected folder
  onSelect: Called when a folder is chosen
  expanded: Expanded folders (controlled)
  defaultExpanded: First expanded folders
  onExpandedChange: Called when expansion changes
  label: Tree name ("Folders" by default)
examples:
  Documents: Document folders — The screen keeps the expanded and selected folders. Numbers count documents including subfolders.
  Mailboxes: Mailboxes — A flat list without subfolders uses the same tree. Numbers are unread mails.
---
# FolderTree
## Purpose
Use it to show nested groups such as folders or mailboxes as a tree and to choose one. The list next to it (DataGrid · mail list) shows the chosen folder's content. Use SideNav for a menu of screens, DataGrid childrenKey for hierarchical rows inside a table (chart of accounts · BOM), and Select to pick one value.
## Anatomy
root (`role="tree"`) · item (row height `density.row-height`, `radius.md`, `space.12` indent per level, text `density.body-font-size` `fg.secondary`) · toggle (square expand cell `density.control-height-sm`, chevron-right 16 `fg.tertiary`, turned 90 degrees when expanded) · icon (16 `fg.tertiary`, folder by default) · label (ellipsis) · count (muted number `type.caption` `fg.secondary` tabular, no pill).
## Props
Generated from the contract. A folder (FolderTreeNode) has id · label · icon · count · children · disabled.
## Variants
None. A flat list with no subfolders at all (mailboxes) starts at the icon, without the expand cell.
## States
default · hover (row `bg.sunken`, text `fg.primary`) · focus (ring inside the row) · disabled (`fg.disabled`, cannot be chosen, still focusable). The chosen folder has a `brand.subtle` background with `fg.link` 600 (the icon also uses `fg.link`). active, loading and error do not apply.
## Behavior
Pressing a row chooses that folder (onSelect) and moves focus to the row. Pressing the expand cell only expands or collapses and does not choose. A double press on a row expands or collapses it. Children of a collapsed folder are not drawn. Passing selected · expanded makes it controlled. With only defaultSelected · defaultExpanded the component keeps the state. Choosing and focus are separate. Arrow keys move focus and Enter · Space chooses.

| Key | Action |
| --- | --- |
| ArrowDown · ArrowUp | Next · previous visible row |
| ArrowRight | Expands a collapsed folder. On an expanded folder, moves to its first child |
| ArrowLeft | Collapses an expanded folder. Otherwise moves to the parent |
| Home · End | First row · last row |
| Enter · Space | Chooses |
| Typing a character | Moves to the next row that starts with it (keep typing to refine) |
## Accessibility
Uses `role="tree"` with flat `treeitem` rows (`aria-level` · `aria-setsize` · `aria-posinset`). Rows with children get `aria-expanded`, the chosen row has `aria-selected="true"`, and rows that cannot be used get `aria-disabled`. Only one row of the tree is in the tab order (the last focused row, then the chosen row, then the first row). A row is named "folder name, N items" (the unit is hidden text). The tree name is label, or "Folders" when missing. The chevron direction and `aria-expanded` both tell the expanded state. With reduced motion the chevron does not turn. On phones (touch) rows are 48 and the expand cell is 40.
## Density
Row height `density.row-height` (compact 32 · comfortable 40 · touch 48), expand cell `density.control-height-sm`, text `density.body-font-size`.
## Platform differences
Native uses the same props for a list of rows, with the same expand cell and row press. There are no arrow keys or type-ahead (Phase 3).
## Avoid
Counts as pill badges (D-56, code review). A colored stripe on the left of the chosen row (D-57, code review). Buttons inside a row (the whole row is one target, apart from the expand cell). Trees deeper than five levels (rethink the screen structure, code review).
## Stories
Documents · Mailboxes.
## References
PF-15 candidate FolderTree (ecm/my-docs/browser · groupware/mail/inbox blocks). Keyboard follows the WAI-ARIA APG Tree View pattern.
