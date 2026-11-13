---
props:
  totalMinutes: Minutes worked this week (the sum of days when days is set)
  days: Work by day (regular, overtime, leave, holiday)
  regularLimit: Standard weekly minutes (40 hours)
  overtimeBasis: How overtime is counted (`week` = time past the standard week, `day` = the sum of overtime recorded each day)
  limit: Maximum weekly minutes (52 hours)
  warnAt: Minutes where the warning starts (defaults to the maximum minus 4 hours)
  period: Period
  today: Today as `YYYY-MM-DD` (highlights the day bar)
  title: Card title
  loading: Loading (skeleton)
examples:
  Week: This week (weekly basis) — Regular up to a running total of 40 hours, overtime color from the day that passes it. The summary, legend and day bars use the same basis.
  DailyBasis: Daily basis — Time recorded past 8 hours each day is overtime. Overtime can appear even when the week stays under 40 hours.
  Limits: Limits — A warning icon from 48 hours, and past 52 hours it says how far over.
---
# WorkHoursMeter
## Purpose
Use it to compare a week's hours with the Korean 40-hour standard week and the 52-hour weekly maximum (my attendance, team hours). For today's record use TimeClock.
## Anatomy
Card (title, period subtitle) · total (`type.display`) with the maximum after a slash (`fg.tertiary`) · one bar (regular `chart.series.1`, then overtime `status.warning`, then over the limit `status.danger`, on `chart.track`) · ticks at 40 and 52 (`border.strong` line with a caption) · one status line (warning icon and words) · legend · day bars (optional, h:mm text, leave, holiday) · basis line (when there are day bars, `type.caption` `fg.tertiary`).
## Props
Generated from the contract.
## Variants
With days (day bars) or without (totalMinutes only). 3 states (room left, warning, over). Overtime basis `overtimeBasis` week (default) · day.
## States
default · loading (skeleton).
## Behavior
The bar ends at 52 hours, or at the total when it is larger. It fills regular, then overtime, then over the limit, and anything past 52 uses the over-limit color. From warnAt (48 hours by default) a warning icon shows, and at 52 hours or more a danger icon and how far over. Day bars stack regular below and overtime above. A leave day shows the leave name and a holiday is empty.

Overtime basis (R-T33): the summary bar, the legend's overtime and the day bars all count with one `overtimeBasis`, so they never disagree.

| overtimeBasis | Overtime | Day bars |
| --- | --- | --- |
| `week` (default) | Time the week's total passes regularLimit (40 hours) | Days are added in date order. The overtime color starts on the day the running total passes 40 hours. A record's overtimeMinutes only adds to that day's total |
| `day` | The sum of `days[].overtimeMinutes` (time past each day's standard hours, as recorded) | Regular and overtime as recorded. Overtime can appear even when the week stays under 40 hours |

A basis line shows under the day bars (`연장은 주 40시간을 넘은 시간입니다` · `연장은 날마다 소정 근로를 넘은 시간의 합입니다`). Without days the daily basis cannot be counted, so it counts by week. The legal limit (52 hours a week) uses the weekly total on both bases.
## Accessibility
The bar is `role="meter"` with the value in minutes and a value text such as 38h this week, 52h max. Each day bar reads regular and overtime through hidden text. Warnings use an icon and words.
## Density
Inner padding `density.card-padding`.
## Platform differences
None.
## Avoid
Splitting the bar into separate regular and overtime bars. Painting the whole card red past the limit. Code review checks these.
## Stories
Week · DailyBasis · Limits.
## References
Labor Standards Act articles 50 and 53 (12 hours of overtime a week).
