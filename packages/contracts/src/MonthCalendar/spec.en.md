---
props:
  events: Events
  month: Visible month (YYYY-MM, controlled)
  defaultMonth: First visible month (month of the selected day or today when missing)
  onMonthChange: Called when the month changes
  selected: Selected day (ISO, controlled)
  defaultSelected: First selected day (ISO)
  onSelectDay: Called when a day is chosen
  onEventPress: Called when an event is pressed (chips become buttons when set)
  today: Day treated as today (ISO, device date by default)
  maxEvents: Events shown in one day cell
  actions: Slot on the right of the header
  agenda: List of the selected day's events on narrow screens
  label: Prefix of the calendar name
  view: View (controlled). Month, week time grid or day time grid
  defaultView: First view
  onViewChange: Called when the view changes
  views: Views offered in the header switch (none when only one)
  timeRange: Time grid range for week and day (08:00~20:00 by default, grows to fit events)
  now: "Current time (HH:MM). The now line in week and day views"
  size: Size. sm = short cells with dots and a count (a side calendar)
  onDayPress: Called with that day's events when a day is pressed
examples:
  TeamSchedule: Team schedule — Each cell shows up to three events and then "N more". Today is a filled circle and the selected day is one background step darker.
  WeekView: Week view — views switches between month, week and day. A 7-day time grid with an all-day row, timed events, overlapping events side by side and a now line in today's column.
  DayView: Day view and pressing events — The day grid also shows secondary text such as the place. Arrow keys move the day and Tab reaches that day's events.
  PressEvents: Pressing events — With onEventPress the chips become buttons. Tab reaches the chips of the selected day and Escape returns to the day.
  SmallWithList: Small calendar with a side list — size="sm" leaves only dots and a count in short cells. Pressing a day passes that day's events to onDayPress for the list beside it.
---
# MonthCalendar
## Purpose
Use it to place a month of events (meetings · leave · deadlines · business trips) on day cells. With views it switches to week and day time grids that place timed events on hours (PG-42). Choosing a day shows that day's events in a side panel or in the list below. Use DateField to enter one date, PeriodPicker for a period, CalendarHeatmap for an amount per day (shipments · sales) shown as shade, and TeamSchedule for many people's leave and work bars.
## Anatomy
root (`bg.surface`, 1px `border.divider`, `radius.lg`) · head (previous and next IconButton, period name `type.h2`, today Button sm, count `type.label` `fg.secondary`, view switch SegmentedControl sm, actions slot for the app) · weekdays (weekday headers `type.caption` 600 `fg.secondary`, `bg.canvas`) · day (cell `bg.surface`, other months `bg.canvas`, `border.divider` between cells) · date (day button that covers the whole cell, number `type.label` 600) · chip (`bg.sunken`, `radius.xs`, `type.caption`, marks + time `fg.secondary` + title) · marks (R-37 8: one dot 8, or up to four for colors plus "+n" in `fg.secondary` 600, then a type icon 16 in `fg.secondary`; a late event shows circle-alert in `status.danger.default` in the icon spot) · more (`type.caption` 600 `fg.secondary`) · agenda (event list on narrow screens, `border.divider` between rows).
Week and day views: heads (day headers `bg.sunken`, weekday `type.caption` 600 + number, selected day `brand.subtle`) · allday (all-day row, chips) · hours (hour labels `type.caption` `fg.secondary` tabular, just under each hour line) · columns (one column per day, a `border.divider` line every hour, one hour is `space.48`) · block (timed event: `bg.sunken` · 1px `border.default` · `radius.sm`, dot + time `fg.secondary` + title 600, plus meta in the day view) · now (now line 2px `fg.strong` with an 8 dot, neutral rather than the danger red) · week-list (narrow week view: a header and an event list per day).
Event colors use `color.chart.series.1~5` · `color.status.*.default` for the dot only. Chip and block backgrounds stay neutral.
## Props
Generated from the contract.
## Variants
Three views: month (default) · week (7-day time grid) · day (one-day time grid). With two or more views the header gets a view switch. The default views = ['month'] keeps the same month calendar as before. Two layouts: grid (wide screens) · compact (narrow screens). The screen width picks the layout. It is not a prop. Two sizes (R-43 5): md (default, chips in cells) · sm (cells at least `space.48`, three dots under the day number plus a count in `type.caption` `fg.secondary` tabular from two events; a side calendar next to a list, and week and day views are the same as md). On narrow screens the month view shows number + three dots + event list below, the week view shows an event list per day and the day view keeps a one-column time grid. With onEventPress chips and blocks are buttons.
## States
default · hover (cell `bg.sunken`, day header `bg.canvas`, chip buttons `bg.canvas` + 1px `border.default`, block buttons `bg.canvas` + `border.strong`) · focus (the day button ring is drawn inside the cell, chip and block buttons get a ring around them). Today is a filled circle around the number (`fg.strong` · `fg.inverse`, neutral rather than the company color so it never reads like a danger badge on the same screen, D-146 proposal). The selected day is one background step (`brand.subtle`) on its cell or day header. On narrow screens the selected day puts `brand.subtle` behind the number, and a selected today keeps the filled circle. Weekend numbers use `fg.secondary` and numbers from other months use `fg.tertiary`. Event states (R-37 8): done = hollow dot + title in `fg.secondary` struck through, late = warning icon in `status.danger.default`. Both are also read as hidden text at the end of the name ("끝남" (Done) · "지연" (Late)). active, disabled, loading and error do not apply.
## Behavior
Weeks start on Sunday and only the weeks the month touches (five or six) are drawn. Multi-day events (endDate) appear on every day in between. Inside a cell, all-day events come first, then events by start time. Past maxEvents (default 3) the cell shows "N more". Pressing the cell chooses that day. Choosing a day from another month, or moving there by keyboard, switches to that month. The today button goes to the period with today and chooses today. The header count is the number of events that touch the visible period. Choosing a day calls onDayPress (the day, its events including multi-day ones, all-day first then by time) together with onSelectDay. With size="sm" use it to fill the side list. When a chip title is cut off by the cell width, its full title is set as `title` only on hover (chips that fit and titles set by the app are left alone). Pressing a text chip also chooses its day. colors puts several dots on one chip when the same event on the same day spans several categories (payday at three companies). When the company colors (R-01 entity tokens) land, it takes those slots too.

Week and day views: the visible day is the tab stop day (last visited → selected → today → the 1st of the month), and the week view shows the week of that day (starting on Sunday). Previous and next move one week or one day and call onMonthChange with that day's month. The time grid range is timeRange (08:00~20:00 by default) and grows to the hour when an event falls outside it. Events without an end time take a 30-minute slot. Overlapping events share the column side by side (contracts `layoutCalendarDay`). All-day and multi-day events go to the all-day row as chips, with "N more" past maxEvents. When now is within the range, today's column draws a now line (without now, the device time is used only when today is not given).

| Key | Action |
| --- | --- |
| ArrowLeft · ArrowRight | One day back · forward (also in week and day views, where the visible week or day follows) |
| ArrowUp · ArrowDown | One week back · forward |
| Home · End | Sunday · Saturday of that week |
| PageUp · PageDown | One month back · forward (one year with Shift) |
| Enter · Space | Chooses the day (onSelectDay) |
| Tab | Only one cell of the grid or day headers is in the tab order. With onEventPress it continues to that day's chips and blocks |
| Escape | Returns from a chip or block to its day |

Passing month · selected · view makes it controlled. With only defaultMonth · defaultSelected · defaultView the component keeps the state. On narrow screens (below `breakpoint.sm`) the month view shows only the number and three dots in a cell, and with agenda on, the selected day's events (time · title · meta) follow the calendar. Turn agenda off when the screen draws its own event panel. The narrow week view lists the events of each of the 7 days (columns would be narrower than 44, so no time grid).
## Accessibility
Month view: `role="grid"` with `row` · `columnheader` (long weekday name) · `gridcell` (`aria-selected`). The grid name is "label + period name" (`팀 일정 2026년 11월`). The day button name adds hidden text after the visible number, so it reads like "6, Friday, today, selected, 5 events" (WCAG 2.5.3). Text chips are hidden from screen readers and only the count is read. A chip button is named like "09:00~10:00 Weekly meeting". The period name is `aria-live="polite"`, so changing it is announced.
Week and day views: the day headers are a one-row `role="grid"` (same day button names and keys). When time grid blocks are text, the blocks are hidden and a hidden event list is read instead (per day "Fri 2026-11-06, 5 events" + time · title · meta). When blocks are buttons, each is named like "Fri 2026-11-06 09:00~10:00 Weekly meeting Place" and there is no hidden list (so nothing is read twice). The name is not an aria-label. It is built from hidden date and time text plus the visible title (and meta in the day view), so the visible text stays inside the name (WCAG 2.5.3) and the time stays in the name when a narrow column hides it. The now line and hour labels are decorative. Event color is only a dot and the text carries the meaning. The focus ring is always visible. Cells and day headers on narrow screens are finger height (`density.row-height` 48).
## Density
Minimum cell height 112 on wide screens (96 below 1024), cell padding `space.4`, chip text `type.caption`. One hour of the time grid is `space.48`, the hour column is `space.48` + `space.8` wide, day headers are `density.row-height`. Below 1024 the week view hides block times and keeps titles. It does the same on a wide screen when a day column is narrower than 112 (in an aside or a card). On narrow screens the cell height is `density.row-height`, the number circle is 32 and list rows are `density.row-height`. Header side padding is `density.card-padding`.
## Platform differences
Native uses the same props with the compact look (number + dots), the event list below and the day time grid. Instead of arrow keys, people press cells and swipe sideways to change the period (Phase 3). On the web, a width below `breakpoint.sm` switches to the same look (D-61).
## Avoid
Filling chip or block backgrounds with the calendar color (dots only, code review). A colored stripe on the left of a chip or block (D-57, code review). Counts as pill badges (D-56, code review). Growing cell height to fit every event (cut with maxEvents). Red Sundays (weekends use `fg.secondary`, code review). Blocks drawing their own time grid (use view="week" · "day").
## Stories
TeamSchedule · WeekView · DayView · PressEvents · SmallWithList.
## References
PF-15 candidate MonthCalendar (groupware/calendar/month block), SY-14 · PG-42 (week and day views). Keyboard matches `_internal/calendar.tsx` (the DateField calendar).
