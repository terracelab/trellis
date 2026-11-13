---
props:
  period: Pay month as `YYYY-MM`
  payDate: Pay date as `YYYY-MM-DD`
  company: Company name
  employee: Employee (name with an employee number or a date of birth, department, position, grade)
  work: Days and hours worked (overtime, night, holiday)
  earnings: Earnings
  deductions: Deductions
  note: Note below
  headingLevel: Heading level
  loading: Loading (skeleton)
examples:
  Monthly: Monthly salary — Employee details, hours, the calculation of each item, deductions and net pay, all items Korean law requires on a pay statement.
  Hourly: Hourly part-timer — A date of birth instead of an employee number, and the weekly holiday pay calculation.
---
# Payslip
## Purpose
Use it to show a monthly pay statement on screen and in print (my pay statements, payroll results). For a payroll list use DataGrid, and for official forms such as a withholding receipt use Paper.
## Anatomy
article (`bg.surface`, `border.divider`, `radius.xl`) · head (company, title `type.h1`, pay date) · employee cells (name, employee number or date of birth, department, position, grade) · work (days, total hours, overtime, night, holiday) · the amount unit stated once · earnings table · deductions table (two columns, one on phones) · net pay (`type.display`, 2px `fg.primary` line above).
## Props
Generated from the contract.
## Variants
Employee number or date of birth × with or without work details × with or without calculations.
## States
default · loading (skeleton).
## Behavior
Amounts use formatAmount (thousands separators, right aligned, tabular) in won (KRW), and cells do not repeat the unit. The calculation (basis) is small text under the item name, and tax-free items get a word next to the name. With a code, the name comes from the message dictionary (national pension, health insurance, long-term care insurance, employment insurance, income tax, local income tax and more). Total rows use a heavy top line and bold text without a fill. Overtime, night and holiday hours show even at 0 because Korean law requires them. The employee cells label `employee.position` as `직위` (position) and `employee.grade` as `직급` (grade), the same names as ProfileHeader and HrRecord. When the grade equals the position it shows once. In print the statement switches to the paper tokens (white paper, black text).
## Accessibility
The `<article>` is named by its title. Each table has a caption (earnings, deductions), item names are `th scope="row"`, and a hidden label precedes each calculation.
## Density
Does not depend on density (a document).
## Platform differences
Native shares a PDF instead of printing.
## Avoid
Coloring deductions blue and earnings red (finance colors only mark income and expense direction). The unit in every cell. A fill behind net pay. Code review checks these.
## Stories
Monthly · Hourly.
## References
Labor Standards Act article 48 paragraph 2 and Enforcement Decree article 27-2 (pay statement items), content.md §4 (state the unit once).
