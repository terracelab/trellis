---
props:
  module: Module id
  title: One-line status
  description: One supporting line
  count: Count (99+)
  time: When it happened (formatted text)
  tone: Count badge color
  unread: Unread dot
  onPress: Called when pressed (the whole card is a button)
examples:
  Home: Notification card home — Module tile, one status line and one number. Only overdue items use the danger color.
  NoCount: No number — Hide the badge when there is nothing to handle.
---
# NotificationCard
## Purpose
Use it to show one module's pending work on the home screen with a single number (unread mail, approvals older than 3 days). For metric numbers, use KpiCard. For long lists, use Card.
## Anatomy
root (`bg.surface`, `border.divider`, `radius.lg`, padding `density.card-padding`) · icon (ModuleIcon 40) · unread (dot `brand.default`) · title (`type.label` 600 `fg.primary`) · description (`type.caption` `fg.secondary`) · time (`type.caption` `fg.tertiary`) · count (solid Badge at the top right, neutral `bg.sunken` · overdue `status.danger`).
## Props
Generated from the contract.
## Variants
tone neutral · danger (count badge color) × with or without unread × with or without onPress.
## States
default · hover (`border.strong`, `bg.canvas`) · active (`bg.sunken`) · focus (ring). hover, active and focus apply only when onPress is set.
## Behavior
The count uses `formatCount` (99+). When it is 0 or missing, the badge is hidden. Use danger only for overdue items and errors (D-35). time shows text the screen has already formatted (09:12 · `3일 전` (3 days ago), content.md §4). When onPress is set, the whole card is a button.
## Accessibility
With onPress it is a `<button>`, and its name reads in this order: module label, title, supporting line, count (`12건`, 12 items), time. Unread is conveyed by the dot and the hidden text `읽지 않음` (unread). The count number is hidden and the text `12건` is read instead.
## Density
Padding `density.card-padding` (12 · 16). The tile stays at 40.
## Platform differences
Native uses Pressable and has no hover. The mobile home stacks the cards in one column.
## Avoid
Greetings in the title. Exclamation marks. Two or more numbers. The danger color as the default count color. Code review checks these. The NotificationHome pattern enforces the card span rules.
## Stories
Default · Overdue · Unread · Grid.
## References
D-35 (notification card home), content.md §5 notification cards, components.md §10 NotificationHome.
