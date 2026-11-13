---
props:
  label: Table name (accessibility)
  resources: Rows (id · label · module · icon · description · disabled)
  actions: Columns (id · label · requires)
  value: Granted cells (controlled)
  defaultValue: Initially granted cells
  onChange: Called when a cell changes (the value after requires + the pressed cell)
  resourceHeader: First column header (defaults to `항목`, item)
  scopes: Data scope choices (adds a scope picker above the table)
  scope: Chosen scope (controlled)
  defaultScope: Initial scope
  onScopeChange: Called when the scope changes
  readOnly: Read only (check marks and dashes)
  disabled: Locks everything
examples:
  Role: Role permissions — Modules × 6 actions + 4 data scopes. Arrow keys move between cells and Space turns a cell on or off.
  ReadOnly: Read only — For people who cannot change permissions. Cells are check marks and dashes and the scope is text.
  Screens: Screens and locked rows — Screen rows with icons and descriptions. Screens of modules that are not turned on lock their row.
---
# PermissionMatrix
## Purpose
Use it to set or show the permissions of one role as a table of targets (modules · screens) × actions (read · create · update · delete · approve · download) plus a data scope (company · division · department · self) (platform/admin/roles). The caller picks the role with tabs or a list. For a few on/off settings use Switch · CheckboxGroup, and for tables that edit a value per person use DataGrid.
## Anatomy
root (`tl-permission-matrix`) · scope (data scope: label `type.label` 600 `fg.secondary` + horizontal RadioGroup, text when read only) · scroll (1px `border.divider`, `radius.md`, scrolls sideways when it overflows) · grid (role grid) · head (column headers `bg.sunken`, `type.label` 600 `fg.secondary`) · row (minimum height `density.row-height` + `space.8`, `border.divider` between rows, `bg.sunken` on hover) · resource (first column, sticky when scrolling sideways: ModuleIcon 32 or an icon tile `bg.sunken` · name 500 · secondary `type.caption` `fg.secondary`, "No permissions" when nothing is on) · box (checkbox: hit area `space.32`, visible 16 box with `fg.tertiary` border, `brand.default` with a `brand.on-brand` check when on) · mark (read only: check `fg.link` · dash `fg.tertiary`).
## Props
Generated from the contract.
## Variants
Edit (default) · read only (readOnly) · locked (disabled, cells take focus and do not change). Each row can be disabled (a module that is not turned on · a system row). With scopes a scope picker appears above the table.
## States
default · hover (row `bg.sunken`, box border `border.focus`) · focus (2px `border.focus` ring around the box, inside the cell when read only) · disabled (box `bg.sunken` · `border.default`, check `fg.disabled`, `aria-disabled`. A locked row keeps its name and description in `fg.tertiary` (4.5:1 or more, because the reason it is locked has to stay readable)). active, loading and error do not apply.
## Behavior
Pressing a cell or hitting Space · Enter turns it on or off. Turning an action on also turns on its requires (update → read), and turning one off also turns off every action that requires it (contracts `applyPermission`, followed transitively). onChange receives the whole value after that and the pressed cell (resource · action · granted). Actions in the value follow column order. Passing value makes it controlled, defaultValue keeps the state inside. scope works the same way.

| Key | Action |
| --- | --- |
| Tab | Enters the grid (the last cell visited). Tab again leaves it |
| ← · → · ↑ · ↓ | Moves between cells (stops at the edge) |
| Home · End | First · last cell of the row |
| Ctrl+Home · Ctrl+End | First cell · last cell |
| Space · Enter | Turns the cell on or off (read only and locked cells do not change) |

## Accessibility
`role="grid"` with `aria-label` (label), plus `aria-readonly` when read only. Headers are `columnheader` and the first column is `rowheader`. The box in a cell is `role="checkbox"` with `aria-checked`, named "target action" (`구매 조회`). Locked cells use `aria-disabled`, so they take focus and do not change. In read only mode the `gridcell` takes focus and reads the hidden word "Allowed · Not allowed". The scope picker is a RadioGroup named "Data scope". There is one tab stop (roving tabindex). Contrast: names `fg.primary`, secondary `fg.secondary`, box border `fg.tertiary` (3:1 or more, non-text).
## Density
Minimum row height `density.row-height` + `space.8` (compact 44 · comfortable 48), column width `space.64` to × 1.5, first column at least `space.64` × 3. The 32 hit area does not change with density.
## Platform differences
Native draws a collapsible group per target with a list of action Switches (six columns do not fit a narrow screen). Props and the requires rule are the same.
## Avoid
Blocks building permission tables from role table + Checkbox (use PermissionMatrix). Counting granted cells in gray pills. Red for "No permissions" (it is not a status). Writing requires rules per screen (use `applyPermission`, code review).
## Stories
Role · ReadOnly · Screens.
## References
SY-15 · PG-43, docs/spec/platform.md §3 (role = actions per module + data scope), blocks `_platform` ACTIONS · SCOPE_LABELS, WAI-ARIA APG Grid (data grid). Block: `platform/admin/roles`.
