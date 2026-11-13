---
props:
  title: What happened, in one line
  body: Secondary text (up to two lines)
  time: Time it happened (ISO)
  now: Reference time for the relative time (now when missing)
  unread: Unread
  module: Module icon
  tone: A badge when danger or warning
  toneLabel: Badge text (default "확인 필요", needs attention)
  href: Link address
  onPress: Called when pressed (mark as read and open)
examples:
  Default: Row look — Unread dot and bold title, relative time (full time on hover), a needs-attention badge and two lines of body text.
  WithModule: Module icon — A list that mixes notifications from several modules puts a module icon (32) in front.
---
# NotificationItem
## Purpose
Use it to draw one row of a notification list (the notification drawer in the top bar, or a notifications screen). The module tile on the home screen (one number) is NotificationCard, and the whole list (date groups, mark all as read) is NotificationList.
## Anatomy
root (flex, `radius.md`, `space.12` padding) · mark (dot slot `space.8`, always there; a 6 `brand.default` dot when unread) · icon (ModuleIcon 32, optional) · head (title · badge · time) · title (`density.body` 500 `fg.primary`, 600 `fg.strong` when unread) · badge (Badge sm, only when tone is danger or warning) · time (`type.caption` `fg.tertiary` tabular, at the right end of the line, `<time datetime>`) · body (`type.label` `fg.secondary`, up to two lines with an ellipsis).
## Props
Generated from the contract.
## Variants
Read or unread × with or without a module icon × tone (neutral · warning · danger). href makes a link, onPress a button, neither plain text.
## States
default · hover (`bg.sunken`) · focus (`border.focus` 2px ring, inset). active, disabled, loading and error do not apply (a notification row cannot be turned off, and loading and errors belong to NotificationList or the drawer).
## Behavior
The time comes in as ISO and shows as relative time (`formatRelativeTime`, content.md §4: just now · N minutes ago · N hours ago · N days ago, a date after 7 days). On hover the full time (2026-11-09 14:04) shows as a tooltip (title). The time is never printed as raw ISO text. Pressing calls onPress (the caller marks it read and navigates). With href it opens through the router (TrellisProvider navigate).
## Accessibility
Unread is read through the dot (decorative) and hidden text "읽지 않음" (unread) before the title, never by color or dot alone. The link or button name is unread + title + badge + time + body. The badge has text ("확인 필요", needs attention) next to its color. On phones a row is at least `size.touch.min` tall.
## Density
The title uses `density.body-font-size`. Padding is `space.12` in every density.
## Platform differences
Native uses a pressable row. A long press shows the full time instead of a tooltip.
## Avoid
Module tiles at full size (40) or count badges in a row (use NotificationCard). Raw ISO time text. A tinted surface or colored left stripe per row. Unread shown only by colored text.
## Stories
Default (VRT) · WithModule. No Matrix (tone is a data value).
## References
Service review R-37 item 7 (the app hand-built its notification drawer and printed ISO times), PR-32. content.md §4 relative time.
