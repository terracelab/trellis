---
props:
  days: One day per row (date · clockIn · clockOut · minutes · off · status)
  schedule: Scheduled hours (start · end · breakMinutes). Past end counts as overtime
  range: Ruler range (07:00~23:00 by default)
  today: "Today (ISO). That row is one background step darker"
  now: "Current time (HH:MM). End of the in-progress bar"
  label: Table name (accessibility)
  legend: Legend (regular · overtime · working)
examples:
  ThisWeek: This week — Clock-in to clock-out bars over a dashed 09~18 frame. The part past 18:00 is overtime and today runs until now.
  Weekend: Weekend and range — Saturday and Sunday show a holiday word instead of a bar. Without statuses there is no status column, and the ruler is widened to 06~24.
---
# WorkTimeline
## Purpose
Use it to show a week of clock-in and clock-out times as one bar per day (my attendance · a team member's attendance detail, R-T23). The bar runs from clock-in to clock-out and the part past scheduled hours is overtime. Use TimeClock for today's clock-in button, WorkHoursMeter for the 52-hour weekly total and TeamSchedule for many people's leave and schedules.
## Anatomy
root (`tl-work-timeline`, `container-type` on its own width) · table (role table, hidden name = label) · head (day · ruler · in · out · worked · status, `type.caption` 600 `fg.secondary`) · ruler (ticks at both ends of the range and every 3 hours, tabular) · row (minimum height `density.row-height` + `space.4`, `border.divider` between rows, today `bg.sunken`) · day (weekday 600 + date `type.caption` `fg.secondary`) · bar (track `chart.track`, height `space.16`, `radius.sm`) · regular (dashed frame for scheduled hours, `chart.axis`) · segment (regular `chart.series.1` · overtime `status.warning.default` · working `chart.compare`, `radius.xs`) · off (text instead of a bar, `type.caption` `fg.secondary`) · in-out · worked (tabular, right aligned) · status (StatusDot dot + word) · legend (Legend).
## Props
Generated from the contract.
## Variants
The status column appears only when some day has a status or is in progress. The legend shows by default and can be turned off. The ruler range is range (07:00~23:00 by default).
## States
default (data state). Today's row is one background step (`bg.sunken`). Today's row before clock-out shows the working bar up to now and the status "Working". hover, active, focus, disabled, loading and error do not apply (the caller shows Skeleton while loading).
## Behavior
Display only. contracts `workSegments` decides the segments. Clock-in to the scheduled end (schedule.end) is regular (live while working), and the part past the scheduled end is overtime. A clock-in after the scheduled end is all overtime. Worked minutes use minutes when given, otherwise clock-in to clock-out (now while working) minus schedule.breakMinutes when the span is over 4 hours (`workMinutes`). A day without clock-in shows the off text instead of a bar (annual leave · holiday, or "No record"). In a box narrower than 640 the in · out and status columns are folded on screen only (screen readers still read them) and the ruler keeps half its ticks.
## Accessibility
`role="table"` with `row` · `columnheader` · `rowheader` (day) · `cell`, named by label. The bar cell hides the bar and reads the segments as hidden text ("Regular 08:52~18:00, Overtime 18:00~18:40"). The ruler header has the hidden name "Work bars". Color only tells the kind of segment. The legend, hidden text and in · out column carry the meaning. Status is a dot + word.
## Density
Minimum row height `density.row-height` + `space.4` (compact 40 · comfortable 44), text `density.body-font-size`. Bar height `space.16`, segments inset `space.4` top and bottom.
## Platform differences
Native draws a bar (react-native-svg) and worked time per day row with the same props. The narrow box rule is the same.
## Avoid
Blocks drawing bars with role table and inline styles (R-T23, use WorkTimeline). Overtime in red or the expense color (overtime is status.warning, not a finance color). A colored stripe on the left of today's row (D-57, code review).
## Stories
ThisWeek · Weekend.
## References
R-T23 (weekly clock-in bars), SY-14 · PG-42, TimeClock · WorkHoursMeter (same work vocabulary, `_shared/worktime.ts`), Labor Standards Act articles 50 and 53 (scheduled and overtime work). Block: `groupware/attendance/my`.
