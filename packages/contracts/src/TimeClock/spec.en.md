---
props:
  status: Clock status (not started, working, on break, clocked out)
  now: Current time as `YYYY-MM-DDTHH:mm` (the device clock when omitted)
  clockIn: Clock-in time as `HH:mm`
  clockOut: Clock-out time as `HH:mm`
  schedule: Scheduled hours and break
  place: Work place
  workType: Work type name
  workedMinutes: Minutes worked today (calculated when omitted)
  title: Card title
  loading: A clock request is in progress
  onClockIn: Clock in
  onClockOut: Clock out
  onBreakStart: Start a break (button shows only when set)
  onBreakEnd: End a break (button shows only when set)
examples:
  Working: Working — The current time is large, a late clock-in is marked, and the time left until the scheduled end shows.
  States: States — Clock in before work, end break during a break, and no buttons after clocking out, with overtime shown.
---
# TimeClock
## Purpose
Use it to record today's clock-in and clock-out and show the current work status (home, my attendance). For the weekly total use WorkHoursMeter, and for the team's days use TeamSchedule.
## Anatomy
Card (title, date subtitle, StatusDot on the right) · current time (`type.display`, tabular) · one line with place, work type and scheduled hours (`fg.tertiary`) · three cells for in, out and worked (`border.divider` lines above and below) · progress line (`brand.default` on `chart.track`, `status.warning` on break, `fg.tertiary` after clocking out) · primary button.
## Props
Generated from the contract.
## Variants
4 statuses (before · working · break · done) × buttons (only those with handlers).
## States
default · loading (the primary button is busy, `aria-busy`).
## Behavior
Before work shows clock in. Working shows clock out, plus start break when onBreakStart is set. On break shows end break. After clocking out there are no buttons. A clock-in after the scheduled start adds a late mark, and leaving before the scheduled end adds an early mark, each as a dot and words. Without workedMinutes, worked time runs from clock-in to clock-out (or now) and subtracts the break once the span passes 4 hours. Past the scheduled hours the line is full and the overtime shows. Without now, the device clock is read every 30 seconds.
## Accessibility
The title is the Card heading (h2). The current time is a `<time>` element and the line is `role="progressbar"` with a value text such as 5h 30m of 8h scheduled. Status and lateness show as words, not only as color.
## Density
Inner padding `density.card-padding`. The time size does not depend on density.
## Platform differences
Native uses Pressable buttons, and the app passes now to refresh the time.
## Avoid
A large location map or photo inside the card. A red background for lateness. Times inside button labels. Code review checks these.
## Stories
Working · States.
## References
Labor Standards Act articles 50 (scheduled hours) and 54 (breaks), D-56 (no left rails or tints).
