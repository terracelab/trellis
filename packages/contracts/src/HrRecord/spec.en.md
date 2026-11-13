---
props:
  record: The HR record to show (`HrMasterRecord`)
  sections: Sections to show and their order (all by default)
  revealed: Whether hidden details (resident registration number, account number) are shown
  onRevealChange: Called by the show hidden details button. Without it, there is no button
  onRevealField: Per-field reveal (reason in, the app checks permission and keeps the record, MaskedValue)
  nav: Section link row at the top
  today: Date used to count tenure (defaults to today)
  headingLevel: Heading level of section titles (2 by default)
examples:
  Full: HR record — Links at the top move between sections, and a button reveals hidden details such as the resident registration number and the account.
  NewHire: First week after hire — Sections with nothing yet show an empty line. `sections` picks the sections.
  RevealField: Per-field reveal — The Show button next to the resident registration number and account number asks for a reason, and after the app checks permission the original shows for 60 seconds.
---
# HrRecord
## Purpose
Use it to show a Korean HR record card (the HR master) on one screen. It draws personal details, employment, pay and insurance, military service, education, career, licenses, languages, family, appointments, and rewards and discipline. Each section uses label and value pairs (DescriptionList) or a small table. Values and types come from `HrMasterRecord` in contracts `_shared/hr.ts`. Use FormSection for input.
## Anatomy
bar (section link row and the hidden details button) · section (title `type.h3` 700 and content, `border.divider` between sections) · DescriptionList (2 columns) · table (header `fg.tertiary`, thin lines between rows) · empty (one line in `fg.tertiary`).
## Props
Generated from the contract.
## Variants
`sections` picks sections and their order (all of `HR_RECORD_SECTIONS` by default). `nav` false hides the link row. Without `onRevealChange` there is no hidden details button. With `onRevealField`, the resident registration number and account number fields each get a MaskedValue Show button.
## States
default · focus (links, button and the title moved to).
## Behavior
The resident registration number shows only the first back digit (`formatRrn`), and the account number only its last four digits (`maskAccount`). Both fields are drawn with MaskedValue. `revealed` shows everything, and the app checks permission. With `onRevealField`, pressing a field's Show button asks for a reason (ReasonDialog) and then calls `onRevealField(field, reason)`. The app checks permission and records the access. If it returns the original, that shows. If it returns nothing, the value from `record` shows for 60 seconds. If it refuses (the Promise fails), an error message stays in the dialog. Tenure counts from the hire date to the resignation date or `today`. Appointments and rewards list the latest first. Empty sections say `등록된 내용이 없습니다` (nothing recorded yet). Pressing a link moves to that section title and focuses it.
## Accessibility
The root is a group named `인사기록카드` (HR record), and the link row is a nav. Section titles use `headingLevel` (h2 by default). Tables have a hidden caption (the section name) and `th scope=col`. Hidden digits `●` are read as they are.
## Density
`space.24` above and below sections, `space.12` above and below table cells. Phones use 1 column for DescriptionList and wrap table cells.
## Platform differences
Native collapses sections instead of the link row.
## Avoid
Showing hidden details by default. Tinted cards per section. A colored stripe left of titles (D-56). The resident registration number as 13 plain digits in one cell. Code review checks these.
## Stories
Full · NewHire · RevealField.
## References
ProfileHeader, DescriptionList, content.md §4 (resident registration numbers, dates).
