---
props:
  items: Notifications
  onItemPress: Called when a notification is pressed
  onMarkAllRead: A "모두 읽음" (mark all as read) button
  groupBy: Date groups
  now: Reference for relative times and groups (now when missing)
  emptyText: Text for an empty list
  label: List name (default "알림", notifications)
  headingLevel: Group heading level
examples:
  Default: Date groups — Today, yesterday, this week and earlier. Unread items come first in each group, with mark all as read at the top.
  Empty: Empty state — One line when there are no notifications.
  InDrawer: Notification drawer — The list inside a right drawer opened by the bell button in the top bar. Pressing a row marks it read and opens its screen.
---
# NotificationList
## Purpose
Use it to show several notifications as a list (the notification drawer opened by the bell in the top bar, or a notifications screen). One row is NotificationItem and the module tile on the home screen is NotificationCard.
## Anatomy
root (grid, `space.16` gap) · bar (unread count in `type.label` `fg.secondary` + a ghost sm Button "모두 읽음" (mark all as read), only with onMarkAllRead and when something is unread) · group (heading `type.caption` 600 `fg.secondary` + list) · list (`<ul>`, 1px `border.divider` between rows) · empty (one centered line in `fg.secondary`).
## Props
Generated from the contract.
## Variants
groupBy day (default: today · yesterday · this week · earlier) or none (one list). Empty list.
## States
default. While loading, the drawer or screen draws a Skeleton (list), since there is no list yet.
## Behavior
The order of items does not matter. Date groups count local dates (`relativeDayGroup`): today · yesterday · this week (starting Monday, outside today and yesterday) · earlier. Inside a group unread items come first, then the most recent. Empty groups are not drawn. Pressing a row calls onItemPress(id); the caller marks it read and navigates. Pressing mark all as read calls onMarkAllRead. Relative times and groups use now (the current time when missing).
## Accessibility
Each group has a heading (h3 by default, headingLevel) and a list named by that heading (`<ul aria-labelledby>`). Without groups the list name is label (default "알림", notifications). The empty state is `role="status"`. The unread count is read as text in the top bar.
## Density
Rows follow the NotificationItem density. `space.16` between groups.
## Platform differences
Native uses a SectionList (sticky group headers).
## Avoid
Blocks or apps hand-building a notification drawer. A card per row. Large group headings. Only a tinted surface for unread items.
## Stories
Default (VRT) · Empty · InDrawer (bell button and drawer).
## References
Service review R-37 item 7 (the app's `.app-note*`), PR-32. content.md §4 relative time.
