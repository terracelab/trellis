---
props:
  widgets: Widgets (id · title · span · rows · hideable · content). With widgets the grid can enter edit mode
  layout: "Layout (controlled): `{ id, hidden? }[]` in display order"
  defaultLayout: Initial layout (uncontrolled)
  onLayoutChange: Called with the whole layout when the order or a hidden flag changes (the app saves it)
  editing: Edit mode (move · hide)
  gap: Gap between cells
  label: Grid name (name of the edit mode list). Use the screen title
  children: DashboardGridItem elements when there are no widgets
examples:
  Editing: Edit layout — Change the order with the move handle and arrow keys or with the earlier and later buttons, and hide widgets. The app saves the layout from onLayoutChange.
  Static: Fixed layout — DashboardGridItem children without widgets. This is the 12-column grid that the block `_ui` Grid wraps.
  Saved: Saved layout — A layout loaded from storage with one widget hidden. A widget removed from the list drops out and a new widget joins at the end.
---
# DashboardGrid
## Purpose
Use it to lay out cards (KPI · chart · list) on a dashboard in a 12-column grid, and to save a layout after the user reorders or hides them. The home notification cards (pattern NotificationHome) and the block `_ui` Grid use this grid too. Use FormSection for form fields and the block Split for a list beside its detail.
## Anatomy
root (`tl-dashboard-grid`, 12-column CSS grid, gap `density.gutter`, `space.12` when tight) · item (`tl-dashboard-grid__item`, `data-span` · `data-rows`, the card inside fills the height) · edit mode only: bar (one row above the widget, height `density.control-height-sm`) · handle (`grip-vertical` icon + widget name `type.label` 600, `fg.primary`) · prev · next (IconButton sm `arrow-left` · `arrow-right`) · hide (IconButton sm `eye-off`) · item border (1px `border.default`, `radius.lg`, padding `space.8`, background `bg.canvas`) · hidden item (collapsed cell: the bar only, `숨김` (hidden) in `type.caption` `fg.secondary` beside the name, Button sm `eye` to show it, background `bg.sunken`) · live (`tl-sr-only`, `role="status"`).
## Props
Generated from the contract. A widget (DashboardWidget) has id · title · span (2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 12, default 4) · rows (1 · 2) · hideable (default true) · content. A layout (DashboardLayout) is `{ id, hidden? }[]`. The array order is the display order.

The web package also exports `DashboardGridItem` (span · rows · children) for fixed layouts. DashboardGridItem children without widgets give a grid without edit mode (the block `_ui` Grid and Col wrap it).
## Variants
Two gaps (gutter · tight). Fixed layout (children) · widget layout (widgets) · widget layout with edit mode (editing).
## States
default · hover (widget border `border.strong` in edit mode) · focus (ring `border.focus` on the handle and buttons). active, disabled, loading and error do not apply (the cards inside handle them).
## Behavior
The layout is layout (controlled) or defaultLayout (uncontrolled). `dashboardLayoutOf(widgets, layout)` fits a saved layout to the current widgets. It keeps the saved order, drops widgets that no longer exist and adds new widgets at the end. A widget that cannot be hidden (hideable: false) shows even when the saved value says hidden. Reordering or hiding calls onLayoutChange with the whole layout. The app stores that value as JSON and passes it back as layout next time. The pure functions `moveDashboardWidget` and `setDashboardWidgetHidden` are in contracts too.

The app turns edit mode (editing) on and off. Usually a `배치 편집` (edit layout) button in PageHeader turns it on and `완료` (done) turns it off. In edit mode each widget gets a row above it, and the content inside the widget is `inert`, so it cannot be pressed and Tab does not enter it. Hidden widgets stay in place as collapsed cells with a show button. Outside edit mode hidden widgets are not drawn.

There are two ways to move a widget and no dragging. Keyboard and touch use the same paths.
- Focus the handle and press the arrow keys.
- Press the earlier or later button. At the first or last place that button is disabled.

| Key (handle) | Action |
| --- | --- |
| ArrowLeft · ArrowUp | One place earlier |
| ArrowRight · ArrowDown | One place later |
| Home · End | First · last place |
| Tab | handle → earlier → later → hide → next widget |
| Enter · Space | Runs the button |

After a move, focus stays on the same button of the moved widget (the handle when that button becomes disabled). Hiding moves focus to the show button of that cell, and showing moves it to the hide button.

Responsive: below `breakpoint.xl` (1280), span 2 and 3 become 6, and span 4, 5, 7 and 8 become 12. Below `breakpoint.lg` (1024) every span is 12 except span 2 and 3, which become 6 (two per row). Below `breakpoint.sm` (640) phones get one widget per row and a `space.8` gap. The order is the same at every width.
## Accessibility
In edit mode the root is `role="list"` with the label (`대시보드` (dashboard) when there is none) and each widget is `role="listitem"`, so screen readers read "3 of 6". The handle is a `<button>` named "widget name + move", with the arrow key hint as its description (`aria-describedby`). The earlier, later and hide buttons include the widget name in their names. A `role="status"` region reads the result of moving, hiding and showing. Outside edit mode the root has no role and the cards inside carry their own titles. The focus ring is always visible. With reduced motion there is no movement besides the change of order.
## Density
Gap `density.gutter` (compact 16 · comfortable 24 · touch 16), edit row height `density.control-height-sm`, sm buttons. On phones (touch) buttons are 40 or more.
## Platform differences
Native draws a one-column list with the same props, and edit mode shows up and down buttons and a hide button. On the web the grid folds into 12 columns, 6 columns or one column by width.
## Avoid
Moving by dragging only (keyboard and buttons are required, code review) · a different background or a colored left stripe per widget (D-57, code review) · saving the layout by position instead of widget id (it drifts when widgets are added, code review) · leaving buttons inside widgets pressable in edit mode (the implementation blocks it with `inert`).
## Stories
Editing (edit mode) · Static (fixed layout) · Saved (saved layout with a hidden widget).
## References
SY-12 · PG-39. Promoted from the block `_ui` Grid and Col (12 columns, one column on phones per D-61). The 12 columns of pattern NotificationHome.
