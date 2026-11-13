---
props:
  label: Accessible name outside a Field
  value: "Value in `HH:MM` (controlled)"
  defaultValue: Initial value (uncontrolled)
  onChange: Called when the time changes
  step: Interval of the list and arrow keys in minutes
  min: First time that can be chosen
  max: Last time that can be chosen
  durationFrom: Shows the time taken from this time at the end of each list row (give the start time to an end field)
  disabled: Disabled
  invalid: Error (automatic with a Field error)
  required: Required
  size: Height
  name: Form name
examples:
  Meeting: Meeting time — Start and end fields. The end field only offers times after the start and shows how long each choice takes.
  Steps: Steps and ranges — Clock-in in 10-minute steps from 07:00 to 11:00 and shifts in 1-hour steps. Typing still accepts times between steps.
  Typed: Typing and errors — Typing 930 or 9:30 gives 09:30. Text that cannot be read or a time out of range shows an error under the field.
---
# TimeField
## Purpose
Use it to enter one time (meeting start · clock-in · end of a booking). People type it (930 → 09:30) or pick it from a list in steps (30 minutes by default). Use DateField for a date, PeriodPicker for dates and periods, and TimeClock · WorkTimeline to show the clock-in record of a day.
## Anatomy
root (`tl-time-field`, the same box as DateField: `bg.surface`, 1px `border.strong`, `radius.md`, height `density.control-height-*`) · control (`input` with role combobox, text `density.input-font-size`, tabular) · picker (clock button `clock` 16, `fg.tertiary`, `bg.sunken` on hover) · popup (below the box, `bg.elevated` · `border.default` · `shadow.md` · `z.dropdown`, at most `space.64` × 4 tall) · option (row height `density.row-height`, highlighted row `bg.sunken`, current value 600 with a check in `fg.link`) · note (time taken, `type.caption` `fg.secondary`) · sheet (bottom sheet on narrow screens, `_internal/sheet.tsx`) · error text (the Field error slot or below the box).
## Props
Generated from the contract.
## Variants
Five sizes (xs 26 · sm 30 · md 36 · lg 42 · xl 48), shaped like DateField. With durationFrom each list row ends with the time taken from that time (`1시간 30분`).
## States
default · hover (border `border.hover`) · focus (border and 1px ring `border.focus`) · disabled (`bg.sunken`, no border, clock button `fg.disabled`) · error (border `status.danger.default`, `aria-invalid`. The component finds format and range errors itself). active and loading do not apply.
## Behavior
Typed text is read when focus leaves the field (Enter · Tab · pressing outside). 9 → 09:00, 930 · 0930 → 09:30, 18:5 → 18:05 (contracts `parseTimeText`). Text that cannot be read shows "Enter a time like 09:30" and a time outside min · max shows "Enter a time between {min} and {max}". The value stays unchanged in both cases. An empty field gives null. Typing also accepts times between steps (09:10). Only the list and arrow keys follow step.

| Key | Action |
| --- | --- |
| ↓ · ↑ | Opens the list and highlights the time closest to the value (or to the typed text). When open, the next · previous time |
| Home · End | First · last time when the list is open |
| Enter | Picks the highlighted time. Without a highlighted row it reads the typed text |
| Escape | Closes the list only (not a surrounding dialog) |
| Tab | Reads the text and moves to the next field |

Pressing the clock button opens the list and keeps focus in the input. Pressing a row does not take focus away from the input. On narrow screens (below `breakpoint.sm`) the clock button opens a bottom sheet that starts with focus on the current value (D-60). Passing value makes it controlled, defaultValue keeps the state inside. When value changes from outside, the text follows.
## Accessibility
The input is `role="combobox"` with `aria-expanded` · `aria-controls` · `aria-activedescendant`. The list is `role="listbox"` named by the Field label and rows are `role="option"` with `aria-selected` on the highlighted row. The clock button is named "Open time list" and is left out of the tab order on wide screens, since the input drives the list. Error text is read from the Field error slot or from a `role="alert"` line below the box. Contrast: text `fg.primary`, placeholder `fg.tertiary`, secondary `fg.secondary` (4.5:1 on elevated).
## Density
Box height `density.control-height-*` (touch 44 · 48 · 56), input text `density.input-font-size` (16 on touch), list rows `density.row-height`, sheet rows `space.48`.
## Platform differences
On native, pressing the field opens a time list in a bottom sheet (or the OS time picker). Typing and props are the same.
## Avoid
Blocks building their own 30-minute Select (use TimeField). 12-hour AM/PM times (24-hour, content.md §4). Saving the raw Input text as a time without a format check (code review).
## Stories
Meeting · Steps · Typed.
## References
SY-14 · PG-42 (the 30-minute Select in groupware/calendar/month). DateField (same box and sheet rules), TagInput (combobox with aria-activedescendant), WAI-ARIA APG Combobox (list selection). Benchmarks are for structure only.
