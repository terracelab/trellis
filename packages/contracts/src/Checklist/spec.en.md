---
props:
  items: Items (id · title · description · state · due · owner · meta · action · disabled)
  label: List name (accessibility)
  onChange: Called when a check button is pressed (done ↔ to do can be toggled when set)
  showProgress: Progress summary (done count · bar)
  today: Reference date for due dates (ISO, today by default)
  loading: Loading (Skeleton rows)
  emptyText: Text when there are no items
examples:
  Closing: Month-end closing — Check buttons mark items done, and each item has one button that goes to the screen for that task.
  Onboarding: Onboarding — The state changes when the task is finished on another screen, so the list is read only without check buttons.
  Loading: Loading and empty — A Skeleton of the same shape while loading, and the next step when there are no items.
---
# Checklist
## Purpose
Use it to show work that is finished one item after another (month-end closing, onboarding a new hire, setting up a rollout) as a list of items with a progress summary. Each item can carry a state, a due date, an owner, a short note and one action button. Use IssueList for checks before saving, RunSteps for run steps (agents, batch jobs), ApprovalLine for approval steps and Stepper for ordered input steps on one screen.
## Anatomy
root (`div` role=group, `tl-checklist`) · summary (Progress sm "Done n / total" + counts of the remaining states in `type.caption` `fg.secondary`) · list (`ul`, 1px `border.divider` on top) · item (`li`, minimum height `density.row-height`, `space.8` above and below, 1px `border.divider` below) · mark (a `density.control-height-xs` square in front, a check button when onChange is set, 16 icon) · title (500, `fg.secondary` when done) · description (`type.caption` `fg.secondary`) · meta (state word in `fg.primary` 500 · owner · due date · note, `type.caption` `fg.secondary`, middle dots in `fg.tertiary`) · action (Button sm, ghost when the item is done).
## Props
Generated from the contract.
## Variants
There is no variant prop. The four states (`CHECKLIST_STATES`) differ by the shape and color of the mark and by a word.

| State | Mark | Color | Word |
|---|---|---|---|
| done | circle-check | `status.success.default` | `완료` (done) |
| doing | circle-dot | `status.info.default` | `진행` (in progress) |
| pending | empty ring (same diameter and stroke as the icon circles) | `border.strong` | `대기` (to do) |
| blocked | circle-pause | `status.warning.default` | `보류` (on hold) |

With onChange the mark is a check button that can be pressed; without it the list is read only. Rows have no background fill, no colored left rail and no gray count pill (D-56 · D-57).
## States
default · hover (check button background `bg.sunken`, `duration.fast`) · focus (check button focus ring `border.focus` 2px) · disabled (item `disabled` and blocked items: the check button cannot be pressed and a disabled item's title is `fg.secondary`; the action button stays) · loading (`loading`: Skeleton list with 4 rows, `aria-busy`). active and error do not apply (a load failure is an EmptyState from the caller).
## Behavior
With onChange the mark is a check button. Pressing it or Space calls `onChange(id, !done)`. The caller toggles done ↔ to do (and decides whether to go back to in progress). A blocked item cannot be pressed because an earlier task has to finish first. Without onChange the states are read only (a list whose state changes when the work is finished on another screen).

Due dates: an unfinished item shows `11월 25일 · D-19` (Nov 25 · D-19), "D-day" when due today, and `11월 4일 · 2일 경과` (Nov 4 · 2 days overdue) when past due (body color at 600 with a warning icon in `status.danger.default` in front). A finished item shows only the date. The reference date is `today` (today when omitted).

Progress summary: Progress (sm) shows done / total, and the bar turns to the success tone when everything is done. The line below counts the remaining states, such as `진행 1 · 보류 1 · 대기 2` (in progress 1 · on hold 1 · to do 2). Items keep the order they were given (the order of the work), without sorting.

| Key | Action |
| --- | --- |
| Tab | Check buttons and action buttons in order |
| Space | Check button: done ↔ to do |
| Enter | Presses the action button |
## Accessibility
The root is `role="group"` with `aria-label` (label). A check button is `role="checkbox"` with `aria-checked`, named `{title} 완료 표시` (mark {title} as done). The state also shows through the icon shape and a visible word, so it does not rely on color. Mark icons are decorative. Overdue text keeps the body color for 4.5:1 or more; only the warning icon carries color. The summary bar is Progress's `progressbar` (value text `2 / 6건`). With touch input the mark becomes 44 square.
## Density
Row minimum height `density.row-height` (compact 36 · comfortable 40 · touch 48), mark `density.control-height-xs` (26 · 26 · 44), body text `density.body-font-size`.
## Platform differences
Native uses a Pressable check mark (`accessibilityRole="checkbox"` · `accessibilityState={{ checked, disabled }}`) with the same icons, and Button for the action. Props are the same.
## Avoid
Filling rows with state colors, a thick colored left rail (D-57), a gray pill badge per row for the state, gray pills for the remaining counts, state by color only (without shape or word), strike-through on finished items, re-sorting items by state (the order of the work is lost) and more than one action button per item. Code review checks these. Blocks building a checklist from `ul` and Badge themselves → Checklist (SY-9).
## Stories
Closing · Onboarding · Loading.
## References
SY-9 · PG-37 (replaces the closing list in the trial balance block). Progress bar is Progress, due days are `dueDays` (contracts `_shared/format.ts`), state vocabulary `CHECKLIST_STATES` and summary `checklistProgress` (contract). IssueList (validation list with the same row shape). Block: `erp/accounting/trial-balance`. Benchmarks for structure only.
