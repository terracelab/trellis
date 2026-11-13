---
props:
  label: Accessible name (outside a Field)
  options: Options
  value: Checked values (controlled)
  defaultValue: Initial values (uncontrolled)
  onChange: Called when the values change (in option order), with the options that changed and their new state
  pending: Options being saved (loading, cannot be toggled)
  orientation: Layout direction
  selectAll: Label of the select-all checkbox on top (true uses the default label)
  maxVisible: Number of options shown at first (the rest go behind Show more)
  disabled: Disables the whole group
  invalid: Error (automatic when the Field has an error)
  required: At least one is required (automatic when the Field is required)
  name: Form name (submits one value per checked option)
examples:
  Vertical: Social insurance enrollment — The Field label, required mark and help connect to the group.
  Horizontal: Horizontal layout — Short labels sit side by side and wrap when the row is full.
  ColorDots: Color dot legend — Like calendars to show, a category color dot (color) sits before each label. Color is only the dot and the label carries the meaning.
  SelectAll: Select all — Give selectAll a label to add it on top. It shows a dash when only some options are checked.
  Descriptions: Descriptions — Each option has a one-line description under its label.
  WithError: Error — With a Field error, every box gets an error border and aria-invalid.
  MaxVisible: Show more — With many options, only the first few show and the rest expand.
  WithMeta: Row end info — Put a count or a link in meta. It sits outside the label, so pressing the link does not toggle the box.
  ImmediateSave: Immediate save — Save only the options in the second onChange argument, and keep them in pending while saving so they show a Spinner and cannot be pressed.
---
# CheckboxGroup
## Purpose
Use it to turn several options on and off under one label (social insurance enrollment, company scope, an offboarding checklist, sales channels, calendars to show). To pick one, use RadioGroup. For list filters with little room, use MultiSelect. For options with long descriptions, use SelectableCard.
## Anatomy
root (group) · all (optional select-all Checkbox in its own row on top, indeterminate when only some are checked) · options (a list of Checkbox; box, label and description come from Checkbox) · dot (optional 8 color dot before the label, a `color.chart.*` · `status.*` slot, decorative. Calendar and category legends, R-T58) · meta (optional info at the end of a row, `fg.secondary`, numbers in `font.numeric`, links in `fg.link`, outside the label) · spinner (Spinner 16 right of the label of an option being saved, `fg.secondary`) · more ("Show n more" or "Show less" text button, `fg.link`, `type.label`).
## Props
Generated from the contract.
## Variants
orientation vertical (when options have descriptions) · horizontal (short labels, wrapping on narrow widths). With or without selectAll (a label, or true for the default `전체`). With or without maxVisible. With or without meta (vertical rows fill the group width and meta sits at the end; horizontal puts it right after the label). pending (immediate save).
## States
default · hover (box `border.focus`) · focus (box ring) · disabled (the whole group or one option, `fg.disabled`) · loading (each option in pending: a Spinner right of the label, `aria-busy`, read-only, `data-state="loading"` on the row) · error (with a Field error, every box gets a `status.danger.default` border + `aria-invalid`). active does not apply.
## Behavior
Each option is a Checkbox. Pressing the label or the box, or pressing Space, turns it on or off. Tab stops at every box. onChange receives an array sorted in option order. Values in value that are not in options stay at the end.

| Key | Action |
| --- | --- |
| Tab | Next box (including the Show more button) |
| Space | Turns the focused box on or off |
| Enter | Expands or collapses with the Show more button |

With selectAll, a select-all checkbox sits in its own row on top in either orientation. Its label is the selectAll text (`법인 전체`), or `전체` when it is true. It is checked when every option that can be picked is on, and shows a dash when only some are on. Pressing it turns all of those options on or off. Values of disabled options do not change.

When there are more options than maxVisible, only the first maxVisible show and "Show n more" expands the rest. Hidden options still submit their form values.

The second onChange argument, change, describes what changed. `values` holds the changed option values (in option order) and `checked` is their new state. Pressing one option gives that one. Pressing select-all gives every option whose state changed. Existing code that reads only the first argument (the whole array) keeps working.

Immediate save: a screen that saves to the server on every change learns what to send from change and puts those values in pending while saving. Options in pending are loading. A Spinner (hidden text `저장 중`, Saving) sits right of the label, and the box gets `aria-busy="true"` and becomes read-only (`aria-readonly`), so it cannot be pressed or toggled with Space until saving ends. Unlike disabled, focus stays where it is. While any option that can be picked is saving, select-all is loading too, because pressing it would clash with the value being saved. On failure, the app reverts value and reports it with a Toast. A single setting that saves at once is a Switch (the Checkbox Avoid rule still applies). Immediate save belongs to option groups only.

meta is optional info at the end of a row (a count, a badge, a link). It sits outside the label, so pressing a link does not toggle the box, and it is read as the box's `aria-describedby`. In vertical layout, rows fill the group width and meta sits at the end. In horizontal layout, it follows the label. It lines up with the first line of the label.

Passing value makes it controlled, and defaultValue makes it uncontrolled. With name, every checked option submits its value under the same name. Pass `form.bind(name)` from `useTrellisForm` as is (the value is an array).
## Accessibility
`role="group"`. Inside a Field, the Field label names the group through `aria-labelledby`. Outside a Field, the label prop becomes `aria-label`. The Field help and error become the group's `aria-describedby`. Required (the required prop or a required Field) means at least one option for the group, so the boxes do not get `required` one by one. `role="group"` has no `aria-required`, so the name carries the required mark instead: the Field label's `(필수)` inside a Field, or `(필수)` appended to the label outside one. The root gets `data-required`. The app (its schema) checks that at least one option is picked. The Checkboxes inside keep their own ids instead of the Field id. When focus arrives on the group from an error summary, it moves to the first box. A box being saved has `aria-busy="true"` and `aria-readonly="true"`, and the Spinner's `role="status"` reads `저장 중` (Saving). The box is not disabled, so focus stays on it after pressing. meta is read as the box's description. The Show more button has `aria-expanded` and `aria-controls`.
## Density
box fixed at 16. vertical `space.8` between rows, horizontal `space.16` between items. At phone width (touch), rows are `density.control-height-md` (40) tall.
## Platform differences
Native uses a Pressable list. Show more is the same button. The props are the same.
## Avoid
A group with one option (use Checkbox). A permission matrix of rows × columns as a CheckboxGroup (use Checkbox inside a table). Putting select-all in options (use selectAll). A group with no label. Stacking Checkboxes in a div without a group name. Code review checks these.
## Stories
Vertical · Horizontal · SelectAll · Descriptions · WithError · MaxVisible · WithMeta (row end info) · ColorDots · ImmediateSave (immediate save, pending) · States.
## References
PR-08 · service request R-27 (social insurance enrollment, company scope for user invites, offboarding checklist) · R-35 (row end info, immediate save). Replaces the stacked Checkbox groups in blocks (calendars to show, coupon channels, product option values, sales channels, the checklist before filing).
