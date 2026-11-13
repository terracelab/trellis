---
props:
  granted: Days granted
  used: Days used
  planned: Days planned (subtracted from the remaining days)
  basis: Grant basis (fiscal year or hire date)
  period: Use period
  expiresOn: Expiry date
  types: Rows by leave type
  promotion: Leave use reminder
  action: Action below (request leave)
  title: Card title
  loading: Loading (skeleton)
examples:
  Annual: Fiscal year basis — Remaining days are large, approved future leave is subtracted, and the use reminder is one line without a tint.
  FirstYear: First year — One day accrues each month, and using more than accrued shows as leave used in advance.
---
# LeaveBalance
## Purpose
Use it to show annual leave granted, used and remaining, and leave by type (home, my leave, member detail). For the team's leave days use TeamSchedule.
## Anatomy
Card (title, subtitle with period and grant basis, action on the right) · remaining label and days (`type.display`) · bar (used `brand.default`, planned light brand, rest `chart.track`) · granted, used and planned text · expiry line · rows by type (name, used of granted, remaining) · use reminder line (icon and words, `border.divider` above).
## Props
Generated from the contract.
## Variants
2 bases (fiscal year · hire date) × with or without types × reminder step 1 or 2.
## States
default · loading (skeleton).
## Behavior
Remaining = granted − used − planned (approved future leave). A negative value shows with U+2212 and a used-in-advance mark. Days show down to a half day (0.5) and a quarter day (0.25). Types without a grant, such as family event leave or sick leave, show only the days used. Reminder step 1 asks the employee to set when they will use the remaining days. Step 2 asks them to check the dates the company set.
## Accessibility
The title is the Card heading. The bar is `role="img"` and its name lists granted, used, planned and remaining. Reminder and expiry use an icon and words.
## Density
Inner padding `density.card-padding`.
## Platform differences
None.
## Avoid
A yellow banner for the reminder. A colored pill per type. Remaining days shown only as a percentage. Code review checks these.
## Stories
Annual · FirstYear.
## References
Labor Standards Act articles 60 (annual leave) and 61 (leave use promotion), D-56 · D-57.
