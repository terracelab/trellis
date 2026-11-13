---
props:
  due: Due date (ISO date)
  today: Baseline date (ISO, defaults to today)
  warnDays: Days left at which the color changes to warning
  done: Finished (neutral label)
  doneLabel: Label when done
  size: Size
examples:
  Ranges: Days left — Overdue is danger, within 3 days is warning, later is neutral.
  Done: Finished — Finished items show a done label instead of the due date.
---
# DueBadge
## Purpose
Use it to show the days left until a due date, or the days past it, as a badge. The text reads like `D-3` (3 days left), `D-day` or `2일 경과` (2 days overdue). Use it in cells for filing deadlines, expected receiving dates, approval deadlines and expiry dates.
## Anatomy
One Badge (`tl-badge tl-due-badge`) · text (`<time datetime>`, tabular figures). Colors use the Badge tones as they are.
## Props
Generated from the contract.
## Variants
overdue = danger solid · 0 to warnDays days left = warning subtle · more days left = neutral subtle · done = neutral subtle `완료` (done). 2 sizes. Only the urgent step (warning) has a dot. The neutral steps (later and done) are text only, following the Badge rule (PR-38). Overdue is solid, so it has no dot either.
## States
default.
## Behavior
The text comes from `formatDueDays(due, today)` and the day count from `dueDays`. Only dates are compared, and the time of day is ignored. Without today, the date of rendering is the baseline, so stories, tests and VRT fix today. Items that are finished use done to remove the due date.
## Accessibility
`<time datetime="2026-11-12">` and `title` (`기한 2026-11-12`, due 2026-11-12) also give the actual date. Overdue is marked by the text `경과` (overdue), not only by color.
## Density
Same as Badge (md 20 · sm 16).
## Platform differences
None.
## Avoid
Building a due badge from Badge by hand (the day count would differ from screen to screen). Showing overdue on finished items. Code review checks these.
## Stories
Ranges · Done · FixedToday.
## References
content.md §4 (dates, relative time), D-48.
