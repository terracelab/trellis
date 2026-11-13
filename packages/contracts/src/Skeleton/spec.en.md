---
props:
  shape: Shape
  width: Width (CSS length)
  height: Height (CSS length)
  lines: Line count for text (last line 60%)
  columns: Column count for the table shape
  immediate: Show at once instead of after `duration.normal`
examples:
  Shapes: Shapes — Text lines, block and circle.
  ListPlaceholder: List placeholder — Match the real row size so nothing shifts after loading.
  ListShape: List shape — Avatar plus a two-line row. The row height matches a real two-line row (`row.heightTall`).
  TableShape: Table shape — Header plus rows and columns. The first column (name) is wider.
  CardShapes: KPI and card shapes — Placeholders for the first KPI row and the body cards of a screen.
---
# Skeleton
## Purpose
Use it to show the shape of content while it loads. For actions that finish within a second, use Spinner. For long tasks with a known end, use Progress.
## Anatomy
root · line (one per line for text, height `space.12`, line spacing `density.body-line-height`) · block (`bg.sunken` background, radius text `radius.xs` · rect `radius.md` · circle full). The shimmer is a band that moves between `bg.sunken` and `bg.surface`.
## Props
Generated from the contract.
## Variants
3 single shapes (text · rect · circle): text sets the line count with lines, and the last line is 60%. 4 group shapes (PR-27): list (rounded-square avatar + two lines, row height `density.row.heightTall`), table (header + lines rows × columns, wide first column), kpi (label, big number, comparison line, card border) and card (title + lines of text, card border). Pick the group that matches the content: a table screen uses table, a people list uses list, a number row uses kpi.
## States
loading (this component is itself the loading state).
## Behavior
For the first `duration.normal` (150ms) it stays invisible, then fades in. Apps render it as soon as loading starts, and fast responses do not flash. immediate shows it without the delay (stories and docs). width and height take CSS length strings (100% · 40% · var(--tl-space-64)). Pass token variables or percentages. Defaults are width 100% for text and rect, height 64 for rect, and 32 for circle. A circle without height uses its width. Size it like the real content so the screen does not shift after loading.
## Accessibility
`aria-hidden`. The parent of the loading area has `aria-busy="true"` and removes it when loading ends. With `prefers-reduced-motion`, the shimmer stops and only a still background shows.
## Density
text line spacing follows `density.body-line-height`.
## Platform differences
The native shimmer uses Animated and follows the reduce motion accessibility setting.
## Avoid
Leaving it on screen after loading ends. A shape different from the real content. Hiding an error behind a skeleton. Code review checks these.
## Stories
Shapes · ListPlaceholder · ListShape · TableShape · CardShapes.
## References
KpiCard loading, ChartCard loading.
