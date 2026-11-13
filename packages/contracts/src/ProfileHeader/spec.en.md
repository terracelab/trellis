---
props:
  name: Full name
  nameEn: Name in English
  nameHanja: Name in Hanja
  src: Photo URL
  department: Department or team
  role: Role, such as team lead
  position: Title
  grade: Grade. Shown once when it equals the title
  status: Employment status as a Badge (`active`, `leave`, `leaving`, `resigned`)
  presence: Today's work status
  employeeNo: Employee number
  hireDate: Hire date (YYYY-MM-DD). Also shows the tenure
  employmentType: Employment type
  today: Date used to count tenure (defaults to today)
  facts: More summary items after the built-in ones
  actions: Actions on the right (edit, appointment, certificate)
  headingLevel: Heading level of the name (2 by default, 1 at the top of a screen)
examples:
  Member: Member detail — Name, employment status and today's status, department line, then employee number, hire date, tenure and employment type.
  OnLeave: Fixed-term member on leave — One Badge for status, extra summary items through `facts`.
---
# ProfileHeader
## Purpose
Use it at the top of a member detail screen or drawer to introduce one person. It puts a large avatar, a bold name, employment status, a department line, a summary (employee number, hire date, tenure, employment type) and actions on the right (edit, appointment, certificate) in one band. Use PersonLabel in list cells.
## Anatomy
avatar (64, 48 on phones) · name (heading `type.h1` 700) · alt (Hanja and English names, `fg.tertiary`) · status (Badge sm) · presence (StatusDot sm) · meta (department, role, title and grade, `fg.secondary`) · facts (`<dl>`, gray labels and 500 values, thin dividers between items; when the row wraps, the first item of each line starts at the left edge with no divider) · actions.
## Props
Generated from the contract.
## Variants
status active · on leave · leaving · resigned (Badge tones from `EMPLOYMENT_STATUS_TONES`). `facts` adds items, such as a return date or a contract end date.
## States
default.
## Behavior
Tenure counts full years and months from `hireDate` to `today` (`serviceLength`), for example `3년 11개월`. The grade appears once when it equals the title. On phones (under 640), actions move to their own row.
## Accessibility
The name is a heading (`headingLevel`, h2 by default, 1 at the top of a screen). The avatar is decorative. The summary is a `<dl>` with label and value pairs.
## Density
`space.20` between avatar and body, `space.12` above the summary. The size does not change with density.
## Platform differences
Native puts the actions on their own row.
## Avoid
Colored banners per status. A colored stripe left of the name. Summary numbers inside pills (D-56, D-57). Code review checks these.
## Stories
Member · OnLeave.
## References
PersonLabel, HrRecord, Badge.
