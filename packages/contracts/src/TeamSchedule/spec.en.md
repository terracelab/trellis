---
props:
  people: Rows (people)
  events: Schedules (leave, work type, shifts)
  start: First day as `YYYY-MM-DD`
  days: Number of days (7, 14 or 28 to 31)
  today: Today (highlights the column)
  holidays: Public holidays
  caption: Table name (accessibility)
  onEventPress: Called when a schedule is pressed (it becomes a button)
  renderPerson: Replaces the name cell
  legend: Legend (only the kinds in use)
  loading: Loading (skeleton rows)
  empty: Shown when there are no people
examples:
  Week: One week — The name column stays, today's column is light gray, a half day fills half a cell, and overlapping schedules split into rows.
  Month: One month — Narrow cells keep the icon and shorten the text, and holidays are shaded like weekends.
  Shifts: Shifts — A two-week roster of day, night and off shifts.
---
# TeamSchedule
## Purpose
Use it to lay out team members' leave, remote work, trips, training and shifts on day cells (team attendance, leave management, rosters). For one person's month use MonthCalendar.
## Anatomy
Legend (only the kinds in use, icon and text) · horizontal scroll frame (`border.divider`, `radius.lg`) · table: name column (sticky, Avatar 24 with the two-character Avatar initials, name and meta) · day header (weekday and date, today is a `fg.strong` circle with `fg.inverse` text (neutral, D-146 proposal)) · cells (weekends and holidays light gray, today's column a light gray (`fg.primary` 8%, one step darker than the 4% weekend)) · schedules (`module.*.subtle` fill, kind icon in `module.*.default`, text, `radius.sm`).
## Props
Generated from the contract.
## Variants
7, 14 or 28 to 31 days (cell widths 96, 64 and 40) × with onEventPress (buttons) or without.
## States
default · hover (1px inner border on button schedules) · focus (ring) · loading (skeleton rows).
## Behavior
A multi-day schedule merges cells (colSpan). A schedule that continues past the range gets square corners on that side. When one person's schedules overlap, they split into rows and the name cell spans them. A morning half day fills the first half of the cell and an afternoon half day the second half. Kinds that share a color are told apart by icon and text (annual and compensatory leave brand, sick red, remote teal, trip and night violet, field green, training and day shift amber, off and other gray).
## Accessibility
A `<table>` with a hidden caption. Day headers read as the full date with the weekday and today (hidden text inside the cell; the visible weekday and date are aria-hidden. With only an aria-label the header counts as empty, R-37 9), and name cells are `th scope="row"`. A button schedule is named with the person, the kind, the dates and the note. The scroll frame takes Tab focus and scrolls with the arrow keys.
## Density
Cell height `density.row-height`.
## Platform differences
Native uses a horizontal scroll list with a sticky name column.
## Avoid
A colored left rail on schedules. A pill badge on every schedule. Dark weekend fills. Code review checks these.
## Stories
Week · Month · Shifts.
## References
D-56 (no left rails), Labor Standards Act article 60 (half days follow company rules).
