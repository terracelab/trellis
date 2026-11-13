---
props:
  label: Accessible name when used outside a Field
  mask: Preset or `#` pattern
  bank: Bank code for bankAccount (3 digits; digits only when omitted, ignored for other masks)
  value: Digits only (controlled)
  defaultValue: Initial digits (uncontrolled)
  onChange: Called when the value changes
  placeholder: Example value (the preset example when omitted)
  secret: Hides the last six digits of an rrn and adds a show button (ignored for other masks)
  validate: Checks the bizNo check digit (a complete number that fails shows an error; ignored for other masks)
  disabled: Disabled
  invalid: Error (set automatically by a Field error)
  required: Required
  size: Height
  name: Form name (submits digits only)
examples:
  Presets: Registering a business partner — Type only digits and the separators go in. The stored value is digits only.
  Pattern: Custom pattern and error — In the pattern, `#` stands for one digit.
  BankAccount: Registering a payment account — Pick the bank first and the account number takes that bank's separators. Without a bank it takes digits only.
  Secret: Registering an employee — The resident registration number shows only the first digit after the hyphen and hides the rest. The business registration number checks its check digit with validate.
---
# MaskedInput
## Purpose
Use it to enter fixed-length numbers with separators (business, corporate, resident or foreigner registration number, phone number, postal code, bank account number). Use Input for text.
## Anatomy
root (same border, height and radius as Input) · control (`font.numeric`) · reveal (show button on the right when secret is set, eye icon in `fg.tertiary`, pressed state `bg.sunken` with `fg.primary`, same shape as the DateField calendar button) · note (an error the input found on its own outside a Field, same look as the Field error slot).
## Props
Generated from the contract.
## Variants
mask bizNo (###-##-#####, the Korean 3-2-5 business registration number) · corpNo (######-#######) · rrn (######-#######, the Korean resident registration number) · phone (set automatically for 02, 010, area codes and main business numbers) · zip (#####) · bankAccount (different per bank: the format of `bank`, digits only without one) · custom pattern (`#` is one digit). A foreigner registration number has the same format as a resident registration number (only the first digit after the hyphen is 5 to 8), so it uses rrn too. 5 sizes (xs · sm · md · lg · xl).
## States
default · hover (`border.strong`) · focus (`border.focus` + ring) · disabled (`bg.sunken`, the show button is disabled too) · error (`status.danger.default` border, from a Field error, invalid or a failed validate check). When every position is filled, root gets `data-complete`. active · loading do not apply.
## Behavior
It accepts only digits and inserts separators automatically. Deleting skips over separators (Backspace removes the digit before, Delete the digit after). The cursor stays where you were typing. A pasted "123 45 67890" is cleaned up too. onChange passes both the digits only (raw) and the displayed value (formatted). A digit count validation error shows as a Field error.

secret (rrn only): the first digit after the hyphen stays visible and the other six digits show as ● (900101-1●●●●●●). A digit typed into a hidden position shows for about one second and then hides, like a phone password field. Pasted digits do not show. Deleting, inserting, replacing a selection and pasting all work in the middle of the hidden digits, and the cursor position decides which digit is edited. The show button reveals the number. Pressing it again, or moving focus out of the field and the button, hides it again. Pressing the button keeps focus and the cursor in the field. The raw value in onChange is always all 13 digits, and formatted is the hidden text (`formatRrn`). Form submission (name) sends all digits. Other masks ignore secret.

Checking: rrn checks only the digit count (13). Since October 2020, newly issued resident registration numbers use six random digits after the gender digit, so the old check digit formula no longer holds. Blocking on the formula would reject numbers issued since then.

bankAccount (PG-37): Korean account numbers differ in length and grouping by bank. Pass the bank code (the 3-digit Korea Financial Telecommunications and Clearings Institute code) in `bank` and the separators follow that bank's format in `BANK_ACCOUNT_FORMATS` (`기업은행 003` = `024-118420-01-011`, `국민은행 004` = `421701-01-284519`, `신한은행 088` = `110-123-456789`). When every position is filled the root gets `data-complete`. Without `bank`, or with a bank that is not in the table, it takes digits only without separators, up to 16 digits, and counts 10 digits or more as complete (the same as the "digits only" rule of banking apps). The formats follow the accounts banks open today, so an old-format account (a different digit count) is entered with `bank` left empty. For a bank that is not in the table, pass a pattern as mask. When `bank` changes, the same digits show in the new format. The default placeholder is that bank's example, or a digits-only example without a bank. In tables and details, pass `maskAccount(formatBankAccount(raw, bank))` to MaskedValue so only the last four digits show. Store the digits and the bank code.

validate (bizNo only, off by default): when all 10 digits are typed and the check digit (`isValidBizNo`) fails, the field turns to the error state and raises `사업자등록번호가 맞지 않습니다. 사업자등록증의 번호를 확인하세요` (the number is not valid, check the certificate) in the Field error slot, or below the field outside a Field. A partial number is not checked. The message clears as soon as the number is fixed. A Field error wins when it is set. It is off by default because a correct check digit does not prove that the tax office issued the number, and apps often check with a server lookup or a form schema. The app checks before submitting with `isValidBizNo`. Other masks ignore validate.
## Accessibility
Renders `<input inputmode="numeric" autocomplete="off">`, so password managers stay out. Inside a Field, the label, description and error are linked automatically. The placeholder is the preset example value (123-45-67890, 900101-1●●●●●● with secret, or the chosen bank's example for bankAccount) and does not replace the label. The show button is a `<button>` reachable with Tab, named `주민등록번호 보기` (Show registration number). Its revealed state is `aria-pressed`, and `aria-controls` links it to the field. Screen readers read the hidden digits as the mask character. The validate message appears while typing, so it is read at once through `role="alert"`.
## Density
Height `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). Input text uses `density.input-font-size` from xs to md, and the larger of that and `type.body` at lg and xl (touch keeps 16). Show button width `density.control-height-sm`, and `density.control-height-lg` on narrow screens.
## Platform differences
Native uses TextInput with keyboardType number-pad and the same applyMask. secret uses the same hiding rule (`formatRrn`), and the show button is a Pressable on the right of the field.
## Avoid
Storing the number with its separators (store digits only). Storing an account number without its bank code (its format cannot be restored). Storing the hidden text (●) as the value. Building a business registration number field from Input and a regular expression. A placeholder that is not an example value, such as `번호를 입력하세요` (enter the number). Showing a full resident registration number in tables, details or payslips (`formatRrn` hides it by default). Blocking resident registration numbers with the check digit formula. Code review checks these.
## Stories
Presets · Pattern · Secret · BankAccount · Complete · Error · Disabled.
## References
content.md §4 business registration number 3-2-5 (`formatBizNo`). Hiding the resident registration number 6-7 is `formatRrn` (contracts `_shared/format.ts`), and the business registration number check digit is `isValidBizNo` (contracts `_shared/validate.ts`). Hiding an account number is `maskAccount` (contracts `_shared/hr.ts`), and the bank formats are `BANK_ACCOUNT_FORMATS` · `formatBankAccount` (SY-10, PG-37). Ministry of the Interior and Safety change to how resident registration numbers are issued (2020-10).
