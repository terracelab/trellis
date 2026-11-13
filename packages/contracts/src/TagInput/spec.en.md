---
props:
  value: Added values (controlled). Person ids in `person` mode
  defaultValue: Initial values
  onChange: Called on change (all values)
  suggestions: Suggestions (value, label, meta, src, disabled), filtered as you type
  mode: "`text` for text chips, `person` for person chips (avatar and name)"
  allowCustom: Add text that is not in the suggestions (defaults to true in `text`, false in `person`)
  max: Maximum count (the input locks when full)
  placeholder: Example text shown when empty
  size: Minimum height (the box grows when chips wrap)
  disabled: Disabled
  invalid: Error look
  required: Required
  name: Form name (one hidden input per value)
  label: Accessible name outside a Field
examples:
  Keywords: Keywords — Typing filters the suggestions. Text that is not suggested also becomes a chip with Enter, a comma or paste.
  People: CC — Person mode uses person chips (avatar and name) and only adds people from the list. Values are employee numbers.
  Limits: Limit, error and disabled — At `max` the input locks, and that is announced.
---
# TagInput
## Purpose
Use it to show a box where several values are added and removed as chips. `text` mode is for keywords and categories (text that is not suggested can be added too). `person` mode adds people as chips (avatar and name), such as CC, attendees or people in charge (R-T25). To pick several from fixed options only, use MultiSelect. To search and pick one, use CodeSearch. To show a single chip, use Tag.
## Anatomy
root (`tl-tag-input`) · box (same as Input: `bg.surface`, `border.strong` 1px, `radius.md`, minimum height `density.control-height-*`) · tags (`ul` of Tag chips, a circle avatar 24 in `person`) · control (`input` with role combobox, text at `density.input-font-size`) · popup (right below the box, `bg.elevated`, `border.default`, `shadow.md`, `z.dropdown`) · option (row height `density.row-height`, highlighted row `bg.sunken`, PersonLabel sm in `person`) · add row (`"text" 추가`, `fg.link` with a plus icon) · empty text · announcement line (`aria-live`) · hidden inputs (one per value when `name` is set).
## Props
Generated from the contract.
## Variants
2 modes × 5 sizes. The box height matches Input (xs 26, sm 30, md 36, lg 42, xl 48) and grows when chips wrap. Chips are Tag sm in xs and sm boxes, and Tag md from md up.

| mode | Chip | Suggestion row | Text not in the suggestions |
|---|---|---|---|
| text (default) | Tag text | label and secondary text | added (allowCustom defaults to true) |
| person | Tag person (circle avatar 24 and name) | PersonLabel sm (avatar, name, role) | not added (defaults to false) |
## States
default · hover (box border `border.hover`) · focus (box border and 1px ring `border.focus`) · disabled (fill `bg.sunken`, no border, no × buttons on chips) · error (border `status.danger.default`, `aria-invalid`). active and loading do not apply.
## Behavior
Typing filters the suggestions by label, value and secondary text and opens them below the box (contracts `filterTagSuggestions`, added values are left out). Clicking the box or pressing ↓ also opens them.

| Key | Action |
|---|---|
| ↓ · ↑ | Highlight a suggestion row (↓ opens the list when it is closed) |
| Enter | Adds the highlighted row. With no highlighted row, adds the typed text (the suggestion with the same label if there is one, otherwise the text as is when allowCustom) |
| Comma | Adds the typed text in `text` mode |
| Backspace | Removes the last chip from an empty input |
| Escape | Closes the list. When it is closed, clears the typed text |
| Tab | Moves to the chip × buttons and the next field |

`person` mode highlights the first suggestion right away, so Enter adds the first person. `text` mode highlights only when you use the arrows, so Enter adds the typed text. During Korean IME composition, Enter and the comma finish the composition and do not make a chip. Pasting text with commas, line breaks or tabs splits it and adds all parts at once (`splitTagText`, `text` mode). `text` mode turns leftover text into a chip when focus leaves the input. The input keeps focus while a suggestion is pressed. At `max` the input becomes read-only and the placeholder changes to say the limit was reached. With `value` it is controlled, with `defaultValue` uncontrolled. In `person` mode the values are person ids, and chip names and photos come from `suggestions`.
## Accessibility
The input has `role="combobox"` with `aria-expanded`, `aria-controls` and `aria-activedescendant` (the highlighted row). The list is `role="listbox"` and rows are `role="option"` with `aria-selected`. The name comes from the Field label (`<label for>`) or `label`. The added chips are a `ul` named "Added items", and each × button is named "Remove <name>". Adding, removing and the limit are read by an `aria-live` line ("Added Han Seoyeon"). Errors use the Field error text and `aria-invalid`. Contrast: text `fg.primary`, placeholder `fg.tertiary`, secondary text `fg.secondary` (4.5:1 on dark elevated surfaces).
## Density
Minimum box height `density.control-height-*` (44, 48 and 56 in touch), input text `density.input-font-size` (16 in touch to prevent iOS zoom), suggestion rows `density.row-height`.
## Platform differences
On the web the list sits right below the box (it also shows above dialogs, `z.dropdown`). Native searches in a bottom sheet instead of a list below the box. Props are the same.
## Avoid
TagInput for picking statuses (use MultiSelect). Person chips drawn with CSS (R-T25, use TagInput `person`). Adding a person who is not in the suggestions as text. Status shown through chip colors. Text such as "and 3 more" instead of chips inside the box. Code review checks these.
## Stories
Keywords · People · Limits.
## References
R-T25 (CC chips on the leave request), SY-13 (TagInput person chips), Tag, PersonLabel, MultiSelect, CodeSearch. The combobox follows the WAI-ARIA APG Combobox pattern (list autocomplete). Benchmarks for structure only.
