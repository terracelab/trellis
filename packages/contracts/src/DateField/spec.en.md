---
props:
  label: Accessible name outside a Field
  value: Value as `YYYY-MM-DD` (controlled)
  defaultValue: Initial value (uncontrolled)
  onChange: Called when the date changes
  min: First selectable day
  max: Last selectable day
  outOfRangeText: Message when a typed day is outside min and max (a default message when omitted)
  onOutOfRangeChange: Called with the details when an out-of-range entry appears or changes, and with null when it clears
  today: Today in the calendar (device date if not set)
  disabled: Disabled
  invalid: Error (automatic with a Field error)
  required: Required
  size: Height
  name: Form name
examples:
  Basic: Voucher date and delivery date — The value is ISO `YYYY-MM-DD`.
  OutOfRange: Date outside the range — Typing a day outside min and max keeps the value and shows an error with a message. Typing a date in range or clearing the field removes it.
  RangeSignal: Telling the app — The value stays as it was, so the app gets the entry through onOutOfRangeChange and blocks saving.
  NativeForm: Blocking form submit — Out-of-range text fails the browser's constraint validation, so the default submit is blocked.
---
# DateField
## Purpose
Use it to enter one date (voucher date, delivery date, receiving date). Use PeriodPicker when there is a start and an end.
## Anatomy
root (same border, height and radius as Input) · control (text field, `YYYY-MM-DD`, `font.numeric`) · picker (calendar icon button, `fg.tertiary`) · popup (`bg.elevated`, `shadow.md`, `radius.md`, `z.dropdown`) · calendar (month name · previous · next · weekdays · day cells, square at `density.control-height-lg`, selected day filled with `brand.default`, today a 1px `border.strong` ring, days of other months and days that cannot be picked dimmed) · note (out-of-range message outside a Field, same look as the Field error slot). Narrow screen: calendar inside a sheet (title = label), day cells `space.40`.
## Props
Generated from the contract.
## Variants
5 sizes (xs · sm · md · lg · xl).
## States
default · hover (`border.strong`) · focus (`border.focus` + ring) · disabled (`bg.sunken`) · error (`status.danger.default` border, from a Field error, invalid or an out-of-range entry). active and loading do not apply.
## Behavior
Typing digits inserts hyphens to form `YYYY-MM-DD` (20261105 → 2026-11-05). When the typed date is complete, is a real date and falls within `min` and `max`, `onChange` is called. Clearing the field calls it with null. Leaving the field with a partial date restores the last value.

Out-of-range entry: when a complete day outside `min` and `max` is typed, the value stays as it was (onChange is not called), the field turns to the error state and a message shows. The default messages are `{min} 이후 날짜를 넣으세요` (enter a date on or after {min}) and `{max}까지 넣을 수 있습니다` (dates up to {max}), with dates from `formatDate` and the locale dictionary. `outOfRangeText(bound, date)` replaces them (bound = the side that was crossed, date = that boundary date). The message goes to the Field error slot (below the field in the same look outside a Field), and a Field error wins when it is set. The typed text is never reverted silently. It stays with the message after the field loses focus. The message clears when a date in range is typed and becomes the value, when the field is cleared, when a day is picked in the calendar, or when `value` changes from outside. It stays while the text is being fixed (a partial date), and leaving with a partial date restores the last value and clears it. The calendar keeps disabling out-of-range days.

Telling the app: out-of-range text is not a value, so an app that only reads `value` saves the previous date (service request R-35). Three signals cover this. (1) `onOutOfRangeChange` receives `{ bound, date, typed, text }` when the out-of-range state appears or changes (another date or the other side), and null when it clears. bound is the side that was crossed, date is that boundary date, typed is the typed date and text is the message shown. If the field unmounts while the state is still there, it receives null once more. (2) The text field gets the same message through `setCustomValidity`. `form.checkValidity()` and `reportValidity()` fail, and the browser blocks the submit of a form without `noValidate`. The validity message goes back to empty when the state clears. (3) With `useTrellisForm`, pass `form.bindDate(name)` instead of `form.bind`. While the state remains, `form.submit` does not save, and the message shows as that field's error (type `range`) and in the summary. It wins over a schema error on the same field. Before the first submit only the field message shows (Field error slot, `role="alert"`). After a submit it goes into the form errors at once, like other fields.

PeriodPicker has only `max` and uses the same "you can enter dates up to {max}" message (it has no `min`). The calendar button or Alt+↓ opens the calendar, and pressing a day closes it with that date. Month and weekday names in the calendar follow the TrellisProvider locale (Korean by default) and the week starts on Sunday. Arrow keys move by day, and PageUp and PageDown move by month. The display is always ISO, whatever the device language. When the width is narrower than `breakpoint.sm`, the calendar opens as a sheet at the bottom of the screen. Passing `today` marks that day as today (demos, tests). Passing `value` makes it controlled, and `defaultValue` makes it uncontrolled.
## Accessibility
The text field has `inputmode="numeric"` (number keypad on phones), and the placeholder shows the format. Inside a Field, the label, description and error are linked automatically. The out-of-range message is linked to the field with `aria-describedby` and appears while typing, so it is read at once through `role="alert"`. The calendar button is reachable with Tab, and its name is `달력 열기` (Open calendar). The calendar is `role="grid"`. Each day button is named with its visible number plus hidden text, like "12, Thursday, today, selected", and the grid name gives the year and month. Voice input can press a day by the number it shows (WCAG 2.5.3). When the calendar opens, focus goes to the selected day (or today if none is selected). When it closes, focus returns to the button.
## Density
Height `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). Input text uses `density.input-font-size` from xs to md, and the larger of that and `type.body` at lg and xl (touch keeps 16).
## Platform differences
Native uses a Pressable with the same field shape plus the platform date picker.
## Avoid
Taking dates as text in Input. Storing other formats such as `YYYY.MM.DD` (ISO only). Switching to the browser date input (`type="date"`), because its format differs by device. Code review checks these.
## Stories
Default · MinMax · OutOfRange (out-of-range message) · RangeSignal (telling the app) · NativeForm (blocking the default submit) · Error · Disabled · Narrow (sheet).
## References
content.md §4 dates (ISO in tables and inputs). D-74 (out-of-range entry keeps the value and shows a message) · service request R-35 (telling the app).
