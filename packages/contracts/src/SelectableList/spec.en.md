---
props:
  items: Rows (id, title, secondary, avatar, icon, presence, meta, value, count, muted, group, disabled)
  selected: Selected row (controlled)
  defaultSelected: Initially selected row
  onSelect: Called when a row is picked (press, Enter or Space)
  label: List name (accessibility)
  variant: Selected row look (a background step or a full 1px ring)
  size: "`sm` is one line (avatar 24), `md` is two lines (avatar 32)"
  countLabel: Name read for the unread count (defaults to `읽지 않음`, unread)
  emptyText: Text for an empty list
  loading: Loading (Skeleton rows)
examples:
  Rooms: Chat room list — Group headings (channels, chats), a leading icon or avatar with a presence dot, and the time and unread count at the end. Counts of muted rooms are dimmed.
  People: Employee list — Person rows look like PersonLabel (avatar, name, role, work status). Arrows move and Enter picks.
  Months: Pay month list — No leading part, just title, secondary text and a value at the end, with the 1px ring look (`ring`).
  Compact: One line, loading and empty — `sm` uses avatar 24 with the secondary text beside the title. While loading it shows Skeleton rows of the same shape.
---
# SelectableList
## Purpose
Use it to pick one item from the vertical list on the left of a master-detail screen and show it in the detail on the right (messenger rooms, the employee list in HR master, pay months in the payslip screen, R-T22). For rows with many columns use DataGrid, for folder hierarchies FolderTree, for screen navigation SideNav, and for large choice cards (plans, methods) SelectableCard.
## Anatomy
root (`div` with role group, `tl-selectable-list`) · group (group heading in `type.caption` 600 `fg.secondary` and a `ul`) · item (`button`, corner `radius.md`, minimum height `density.row-height`) · leading (Avatar 32, 24 in sm, decorative, with a presence dot, or an icon tile in `bg.sunken` and `fg.secondary`) · title (500, 600 when selected, 700 when unread, truncates) · muted (`bell-off` 16 in `fg.tertiary`) · secondary (`type.caption` in `fg.secondary`, truncates) · presence (StatusDot sm, a dot and words in md, a dot only in sm) · end (meta in `type.caption` `fg.secondary` tabular, value 600 tabular, count in `type.caption` 600 `fg.link`, or `fg.secondary` when muted).
## Props
Generated from the contract.
## Variants
2 variants × 2 sizes.

| variant | Selected row | Hovered row |
|---|---|---|
| background (default) | background `bg.rowSelected` | background mixes 5% of `fg.primary` |
| ring | full 1px border `border.selected`, no background | background mixes 5% of `fg.primary` |

| size | Avatar or icon tile | Lines | Padding |
|---|---|---|---|
| sm | 24 | one line: secondary text beside the title, work status as a dot only | `space.6` `space.8` |
| md (default) | 32 | two lines: secondary text and work status dot with words under the title | `space.8` |

There is no thick colored stripe on the left (D-57). The unread count is a caption number, not a gray pill (99+ above 99).
## States
default · hover (background mixes 5% of `fg.primary`, `duration.fast`) · active (mixes 10%) · focus (focus ring `border.focus` 2px inside the row) · disabled (per row with `disabled`: text `fg.disabled`, no focus, cannot be picked) · loading (`loading`: Skeleton list with 5 rows, `aria-busy`). error does not apply (the caller shows EmptyState when loading fails).
## Behavior
Pressing a row or hitting Enter or Space calls `onSelect(id)`. With `selected` it is controlled, with `defaultSelected` uncontrolled. The selected row has `aria-current="true"`.

| Key | Action |
|---|---|
| Tab | Enters the list (the last focused row, then the selected row, then the first row). Tab again leaves the list |
| ↓ · ↑ | Moves focus to the next or previous row (skipping disabled rows) without picking |
| Home · End | Moves focus to the first or last row |
| Enter · Space | Picks the focused row |

There is one tab stop (roving tabindex). Arrows do not pick, so a screen that loads the detail does not load it for every row passed. A group heading appears wherever `group` changes, and the arrows continue across groups. The search box and the collapsed layout on narrow screens belong to the caller (the block).
## Accessibility
The root has `role="group"` and `aria-label` (label), and each group `ul` is named by its heading (`aria-labelledby`). Rows are buttons named by the title, the messenger status (hidden text), the secondary text, the work status, the time or value, and the unread count ("Unread: 3", `countLabel`). The muted icon is named "Notifications off". Avatars are decorative. The selected row uses `aria-current`, so selection is not conveyed by color alone. Contrast: title `fg.primary`, secondary text and time `fg.secondary` (4.5:1), count `fg.link`. The focus ring sits inside the row, so a scrolling box does not clip it.
## Density
Minimum row height `density.row-height` (compact 36, comfortable 40, touch 48), text `density.body-font-size`. A two-line (md) row is 48 with avatar 32 and padding 8.
## Platform differences
Native uses FlatList with Pressable rows and `accessibilityState={{ selected }}`, and screen reader swipes instead of arrow keys. Props are the same.
## Avoid
Blocks building a pick list with li, button and CSS (R-T22, use SelectableList). A thick colored stripe on the left for the selected row (D-57, check-blocks blocks it). Gray pills for unread counts. Arrows that pick right away (the detail loads for every row passed). Buttons inside a row. Code review checks these.
## Stories
Rooms · People · Months · Compact.
## References
R-T22 (vertical pick list), SY-7 and SY-15, R-T26 (relationship of the people-status vocabularies, contracts `_shared/presence.ts`), PersonLabel (same person shape), FolderTree (roving keyboard), DataGrid `bg.rowSelected`. Blocks: `groupware/messenger/chat`, `erp/hr-payroll/hr-master`, `erp/hr-payroll/payslip`. Benchmarks for structure only.
