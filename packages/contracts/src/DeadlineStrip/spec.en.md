---
props:
  items: Deadlines (id · date · title · color · category · done)
  caption: Strip name (accessibility)
  start: First day (ISO, today by default)
  days: Number of days (7~60)
  today: "Day to treat as today (ISO, device date by default)"
  onItemPress: When a deadline is pressed (the point becomes a button)
examples:
  ThirtyDays: 30-day deadlines — 30 days from today as points on a horizontal axis. Several deadlines on one day become a number group, today has a vertical line and the word Today, and finished deadlines are hollow dots.
  OverdueAndPress: Past deadlines and pressing — Unfinished deadlines before the first day sit in a "n past" group at the left end. A single point calls onItemPress right away, and a group opens that day's list below.
  TwoWeeks: Two weeks and a start day — days changes the period. When start is before today the today line sits at its own day, and past deadlines count from the first day.
---
# DeadlineStrip
## Purpose
Use it to put the deadlines of N days (30 by default) from a start day as points on a horizontal date axis (the 30-day deadlines on a company status page, tax · HR · operations deadlines, R-40). Past deadlines stay at the left end as "n past". Use MonthCalendar for a whole month of events, TeamSchedule for people × days of leave and attendance, and DueBadge for the days left on one deadline.
## Anatomy
root (`tl-deadline-strip`, `container-type` on its own width) · track (the axis and the point list overlap on the same column grid, `space.12` on both sides) · axis (decoration; a `border.default` line through the middle of the `space.32` point row, date text `type.caption` `fg.secondary` tabular: "11/1" for the first day and the 1st of a month, the day number elsewhere) · today (today's column: a `border-width.2` `fg.strong` line through the point row and the word "Today" below in `fg.strong` 600; never the brand color) · points (ol, one li per date group, same columns as the axis) · point (a `space.24` round button, `bg.sunken` on hover): dot (`space.12` circle in the color slot with a `border-width.2` ring in the background color so it floats over the axis line) · count (several on one day: a `space.20` circle with a `border.strong` border and a caption 600 number) · overdue (past-deadline column `space.64` + `space.8` with a dashed `border.strong` right edge, a "circle-alert" icon in `status.danger.default` and "n past" in caption 600) · panel (pressing a group opens a `border.divider` `radius.md` box below the strip: a head with the group name and a close IconButton sm, then deadline rows) · row (dot · title · category `fg.secondary` caption · days left "D-3" · "2일 경과" · "Done" tabular, minimum height `density.row-height`) · empty ("No deadlines in this period", caption `fg.secondary`). Narrow screen (below breakpoint.sm): list (ol, a head per date "11월 10일(화)" label 600 `fg.secondary` plus deadline rows, `border.divider` between days) · today-tag (beside today's head, `fg.strong` background with `fg.inverse` text "Today").
## Props
Generated from the contract.
## Variants
days is 7~60 (30 by default). Without start it begins today. With onItemPress a single point opens that deadline directly; without it the point opens that day's list (panel). The past-deadline column appears only when there are unfinished deadlines before the first day.
## States
default · hover (point and row `bg.sunken`) · focus (`.tl-focusable` ring). A finished deadline is a hollow dot with dimmed, struck-through text (row); a late row has a warning icon and the days-left text in `fg.primary` 600. active, disabled, loading and error do not apply (the caller shows Skeleton while loading, and a display part has no action to turn off).
## Behavior
contracts `groupDeadlines(items, start, days)` groups the deadlines: unfinished ones before the first day become one past group (by date), ones in range group by date (unfinished first, then in the given order), and dates after the end and finished ones before the first day are left out. Several on one day are one number group. Pressing a single point calls onItemPress with that deadline; without onItemPress, or for a group or the past group, that day's list opens below the strip (press again, Esc or Close to close it). In a wide box (over 960) every day has its date text; in a narrow box only the first day, the 1st of a month, Mondays and today do. Below breakpoint.sm the horizontal axis becomes a vertical list by date (past deadlines first, and today gets a row even with no deadline). It does not overflow sideways anywhere from 344 to 1440. The point color only tells the category; the category text and title carry the meaning. When the category color tokens (R-38) land, color takes those slots too.
## Accessibility
The structure is a list by date (`ol`, named by caption) and the horizontal layout is CSS. The date axis is `aria-hidden`. A single point is named "11월 10일(화) · 이서연 4대보험 취득신고 · 사람 · D-4" ("Done" when finished), a group "11월 10일(화), 3 items" and the past group "2 past deadlines"; group and past buttons point at the panel with `aria-expanded` · `aria-controls`. The point list has one Tab stop and ← → Home End move between points. Enter and Space open. When the panel opens (with onItemPress) focus moves to its first row, and Esc closes it and returns to the point that opened it. The panel is `role="group"` named after the group. Today also shows as the word "Today" (not by color alone).
## Density
Point row height `space.32`, pressable area `space.24` (it does not shrink in narrow columns and overlaps the next column). Deadline rows are at least `density.row-height`, text `density.body-font-size`. The narrow screen follows touch density.
## Platform differences
Web only. Native comes after 1.0 (D-101) and starts with the vertical list on the same contract.
## Don'ts
Drawing the deadline axis with a chart library (R-40) → DeadlineStrip · marking today with the brand color only (it clashes with the danger color, R-43) · using status colors (success · warning · danger) as categories · a left color stripe (D-57) → review.
## Stories
ThirtyDays · OverdueAndPress · TwoWeeks.
## References
R-40 (service 30-day deadline timeline), D-138 (option B: a new component instead of generalizing TeamSchedule), `groupDeadlines` · `deadlineItemText` (contracts), the days-left text of DueBadge (`formatDueDays`), R-38 category colors (dot color slot).
