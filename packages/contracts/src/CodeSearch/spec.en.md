---
props:
  label: Accessible name outside a Field
  options: Code list
  value: Selected code (controlled)
  defaultValue: Initial code (uncontrolled)
  onChange: Called when a code is picked or cleared
  placeholder: Hint in the empty field
  emptyText: Shown when there are no results
  size: Height
  disabled: Disabled
  invalid: Error (automatic when the Field has an error)
  required: Required
  name: Form name (submits the code)
  onCreate: Called when the "add new" row is chosen (the value stays)
  createLabel: Text of the "add new" row
  allowCustomValue: Accept text that is not in the list
  onCustomValue: Called when text not in the list is accepted
  showCode: Show codes (false = names only)
examples:
  CreateNew: Add new when it is missing — Choosing the bottom row opens the add screen. Here it adds to the list and selects it right away.
  FreeText: Free text — Pick from the list, or type a name that is not in it (the counterparty in a transaction entry).
  Basic: Account · business partner — Type part of a code or name and press Enter.
---
# CodeSearch
## Purpose
Use it to find one item by code or name and pick it (account, business partner, item, HS code). For a fixed list of 20 options or fewer, use Select.
## Anatomy
root (same border · height · radius as Input) · icon (search, `fg.tertiary`) · control · clear (x) · trigger (chevron) · popup (`bg.elevated`, `border.default`, `shadow.md`, `radius.md`, `z.dropdown`) · item (height `density.row-height`; code `font.numeric` `fg.tertiary` · label · meta on the right `fg.tertiary`) · empty (`fg.tertiary`).
## Props
Generated from the contract.
## Variants
5 sizes (xs · sm · md · lg · xl). With or without description · meta.
## States
default · hover (`border.strong`) · focus (`border.focus` + ring) · disabled (`bg.sunken`) · error (`status.danger.default` border). The highlighted item uses `bg.sunken` and the selected item uses weight 600. active and loading do not apply.
## Behavior
Built on Base UI Combobox. Typing searches codes and names together and highlights the first result. ArrowDown and ArrowUp move the highlight, and Enter picks. Escape closes the list, and a second Escape restores the input. After a pick, the field shows the code followed by the name. Clearing with x sets the value to null. The whole flow works without a mouse. **Add new**: with onCreate, an "add new" row (leading plus icon, `fg.link` text at 500, `border.divider` above) sits at the bottom of the list. With typed text it reads createLabel(q) (default `"q" 새로 등록`, "Add \"q\""), otherwise `새로 등록` (Add new). With zero results the same row sits under emptyText, and since nothing else matches, Enter picks it right away. Choosing it closes the popup and calls onCreate(q) without changing the value (when the parent finishes adding, it sets value and the field text follows). **Free text**: with allowCustomValue, text that is not in the list is accepted on Enter (when nothing matches) or when leaving the field; onCustomValue(text) is called and the text stays in the field (value is null). If an item's name or code matches exactly, that item is picked instead. Clearing accepted text and leaving calls onCustomValue(''). When accepted text is present, the x shows on wide screens too; pressing it empties the field and calls onCustomValue(''). With onCreate as well, the "add new" row wins, and free text applies when leaving without choosing it. In the narrow-screen sheet, a `"q" 그대로 쓰기` (use "q" as typed) row and Enter in the search box accept it. **Hidden codes**: with showCode=false only names show in the field and the list (no code column), meta stays, and value is still the unique key.
## Accessibility
Input with `role="combobox"` + listbox. The Field label becomes its name. When there are no results, emptyText is announced politely. The focus ring shows on root. The "add new" row is an option in the list, named by its visible text (`"누리" 새로 등록`), so its name tells it apart from code items. In the sheet it is a button below the list. Opening the list does not put aria-hidden on the rest of the page. Following the ARIA combobox pattern, other fields stay visible and focusable (R-35; Trellis removes what Base UI adds while the list is open).
## Density
Field `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56), items `density.row-height`, popup up to 8 rows. Input text uses `density.input-font-size` from xs to md, and the larger of that and `type.body` at lg and xl (touch keeps 16).
## Platform differences
Native uses a full-screen search sheet (input + list). On the web, when the width is below `breakpoint.sm`, the whole field becomes a button that opens a sheet (D-60 · PR-10). The button is named with the label and the current value (code and name), and a clear button (40) sits next to it when there is a value. With a value or accepted text, the button carries `data-filled`, so FormSection counts it in `입력 N개` ("N filled") even without name. A search box (pinned, 16 text) sits at the top of the sheet, with rows of code, name, description and meta below (`space.48`; the chosen row is 600 with a check). It matches the code, name or description, and shows emptyText with `role="status"` when nothing matches. Choosing a row closes the sheet. Code, description and meta text use `fg.secondary` (4.5:1 on dark elevated surfaces).
## Avoid
Showing the name without the code. Saving free-typed values (only codes in the list are valid). Passing thousands of options at once (the app filters them first). Code review checks these.
## Stories
Account · Partner · Empty · Error · Disabled.
## References
Base UI Combobox. 07-domain-coverage.md 2.5 (finishing with the keyboard alone).
