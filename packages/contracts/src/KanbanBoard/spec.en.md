---
props:
  columns: Columns (stages)
  cards: Cards (order inside a column = array order)
  label: Board name (accessibility)
  onMove: Called when a card is moved (no moving when missing)
  onCardPress: Called when a card is pressed
  activeCardId: Open card
  summary: Amount total in the column header
  draggable: Drag with the mouse to move
  today: Reference date for due dates (ISO, today by default)
  warnDays: Days before the due date that switch to the warning color
  renderCard: Content inside a card (KanbanCard by default)
examples:
  Pipeline: Sales stages — Move a card with the move menu at its top right (keyboard · touch) or by dragging it with the mouse. Column headers show the count and the amount total.
  ReadOnly: Read only — Without onMove there is no move menu and no dragging. Cards without an amount draw no total.
---
# KanbanBoard
## Purpose
Use it to lay out work items that move through stages (sales opportunities · work orders · requests) as cards in stage columns, and to move them between stages. Column headers show the count and the amount total. Use DataGrid to filter and pick from one list without stages, and Stepper for the stages of a single item.
## Anatomy
root (`role="region"`) · column (`bg.canvas`, 1px `border.divider`, `radius.lg`, `space.12` between columns) · head (StatusDot + stage name 600 · count `type.caption` `fg.secondary` · trailing `type.caption` `fg.secondary` · total `type.h3` 700 tabular + unit `fg.secondary` · caption `type.caption` `fg.secondary`, `border.divider` below) · card (`bg.surface`, 1px `border.divider`, `radius.md`, padding `space.12`) · card content (KanbanCard: title `type.label` 600 · description `type.caption` `fg.secondary` · amount `type.body` 700 with trailing `type.caption` `fg.secondary` on its right · owner Avatar 24 + name · DueBadge or status Badge) · move (IconButton sm `ellipsis` at the card's top right → Menu. The right end of the title row is kept for this button) · drop (2px `border.focus` line where the card will land).
## Props
Generated from the contract. A card (KanbanCardItem) has id · column · title · description · trailing · amount · owner · meta · due · done · doneLabel · status · locked. A column (KanbanColumn) has id · title · tone · trailing · caption · locked.
## Variants
Two layouts. columns (wide screens, columns side by side that scroll sideways inside the board when they overflow) and tabs (narrow screens, stage tabs + one column for the chosen stage). Without onMove the board is read only (no move menu, no dragging). With renderCard the app draws only the content of a card, and the board still draws the frame, the move menu and dragging.
## States
default · hover (card border `border.strong`) · focus (ring on the card button). The open card (activeCardId) gets a 1px `brand.default` border all around plus 1px inside. The dragged card is dimmed and the column under it gets a `border.focus` border. active, disabled, loading and error do not apply.
## Behavior
The order of cards in a column is the order of the cards array. The board does not move cards itself. It reports moves with onMove(cardId, toColumn, index), and draws whatever cards the app passes back. For stages that need a confirmation, like a lost deal, open a dialog in onMove first. index is the position inside that column after the move (from 0).

There are three ways to move a card.
- Move menu. The button at the card's top right opens a "Move to" menu. The current column is left out and locked columns are disabled. Choosing one puts the card at the end of that column and returns focus to the moved card. Keyboard, touch and screen reader users all take this path.
- Dragging. Drag a card with the mouse to another column or to another spot in the same column (draggable, wide screens). A line shows where it will land.
- Narrow screens. The menu opens as a bottom sheet (Menu D-60).

| Key | Action |
| --- | --- |
| Tab | Cards and move buttons in order |
| ArrowUp · ArrowDown | Card above · below in the same column |
| ArrowLeft · ArrowRight | Card in the same row of the next column (empty columns are skipped) |
| Enter · Space | Opens the card (onCardPress) |

On narrow screens (below `breakpoint.sm`) the board shows stage Tabs (name + count) and one column for the chosen stage. Tabs are used instead of a sideways list of columns. The count of every stage stays visible at once (principle 2). There is no sideways scrolling inside a page that scrolls down. Cards take the full width, so titles are not cut. Boards often have six stages, so the board uses Tabs, which fade at the overflowing edge, instead of SegmentedControl, which allows up to five segments.
## Accessibility
The root is `role="region"` with the label. Each column is `role="group"` named "stage name, N cards". A card is a button inside a list item (when onCardPress is set) and its name is all of the card's text. The open card has `aria-current="true"`. The move button is named "Move title" and the menu or sheet title is "Move to". Dragging is a mouse-only shortcut, and the menu does the same thing. Status colors (StatusDot · DueBadge) always come with text. On narrow screens the move buttons and tabs are 40 or more.
## Density
Minimum column width 176 (224 · 80% below 1024), card padding `space.12`, `space.8` between cards, move button `density.control-height-sm`. On phones (touch) the button is 40.
## Platform differences
Native uses the same props with stage tabs + one column, and a long press on a card opens the move sheet. There is no dragging (Phase 3). On the web, a width below `breakpoint.sm` switches to the same look and turns dragging off.
## Avoid
Offering moves only by dragging (the menu is required, code review). Column counts as pill badges (D-56, code review). A status color stripe on the left of a card (D-57, code review). A different background per column (stage color only on the header dot, code review). Inputs inside a card.
## Stories
Pipeline · ReadOnly.
## References
PF-15 candidate KanbanBoard · KanbanCard (crm/opportunities/pipeline block). Picking on narrow screens is D-60 and phone density is D-61.
