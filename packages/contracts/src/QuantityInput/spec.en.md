---
props:
  label: Accessible name outside a Field
  value: Quantity (controlled)
  defaultValue: Initial quantity (uncontrolled)
  onChange: Called when the quantity changes
  unit: Unit (the selected unit when units is set)
  units: Units to choose from (factor = how many base units; shows the base quantity when set)
  onUnitChange: Called when the unit changes
  step: Step size
  min: Minimum
  max: Maximum
  digits: Decimal places
  showStepper: − / + buttons
  disabled: Disabled
  invalid: Error (automatic when the Field has an error)
  required: Required
  size: Height
  name: Form name
examples:
  Basic: Purchase order quantity — − / + and the arrow keys change it by step. Units keep the labels used on site.
  Conversion: Unit conversion — With factor on units, picking a unit other than the base unit shows the base quantity below the field.
---
# QuantityInput
## Purpose
Use it to enter a quantity with its unit (purchase order quantity, receiving quantity, inventory adjustment). For amounts, use AmountInput.
## Anatomy
root (same border · height · radius as Input) · decrement · increment (IconButton minus · plus) · control (right-aligned, `font.numeric`) · unit (`fg.tertiary`; a unit picker when units is set) · base (the base quantity "= 240EA" under the field on the right when converting, `type.caption` `fg.secondary` tabular).
## Props
Generated from the contract.
## Variants
5 sizes (xs · sm · md · lg · xl), with or without showStepper, fixed unit · unit picker (units) · conversion (units[].factor), digits 0 (EA · BOX) · 1 to 3 (kg · L).
## States
default · hover (`border.strong`) · focus (`border.focus` + ring) · disabled (`bg.sunken`, buttons `fg.disabled`) · error (`status.danger.default` border). At min or max, the button on that side is disabled. active and loading do not apply.
## Behavior
Built on Base UI NumberField. Type a number, or change it by step with − / + or ArrowUp · ArrowDown. With Shift held, it changes by 10 times the step. Holding a button down keeps changing the value. When focus leaves the field, the value is clamped to min and max and shown with thousands separators and digits decimal places. Clearing the field sets null.

Conversion (PG-38): with `{ unit, factor }` in units, the unit whose factor is 1 is the base unit (BOX = 24 EA is `[{ unit: 'EA', factor: 1 }, { unit: 'BOX', factor: 24 }]`). Picking a unit other than the base unit shows the base quantity under the field on the right (10BOX → "= 240EA"). Changing the unit keeps the typed number and only recalculates the base quantity (you pick the unit you counted in; the quantity does not move). value and onChange are in the picked unit. Code that adds or subtracts quantities in mixed units (count differences, picking shortages) uses `toBaseQuantity(value, unit, units)`. Without factor, or without a unit whose factor is 1, nothing changes (the unit is only picked). Plain unit strings such as `units={['EA', 'BOX']}` still work.

Touch input: at touch density, at phone width (below `breakpoint.sm`) and with a coarse pointer (`pointer: coarse`), the field is at least `size.touch.min` (44) tall, and − / + become squares as tall as the field that fill both ends. A `border.default` divider sits on the inner side of each button.
## Accessibility
`<input>` with the Field label, description and error linked automatically. The − / + buttons are out of the Tab order (the arrow keys do the same thing) and are named `수량 줄이기` (decrease quantity) · `수량 늘리기` (increase quantity). The unit picker is a `<select>` with `aria-label="단위"` (unit). The focus ring shows on root. A value changed with − / + is read from hidden text with `aria-live="polite"` (`10BOX`, `formatQuantity`). A typed value is not announced again because the screen reader already reads it. The base quantity line is linked to the field with `aria-describedby` (`기준 수량 240EA`, base quantity 240EA) and is added to the − / + announcement (`10BOX, 기준 수량 240EA`).
## Density
Height `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). − / + are squares the field height minus `space.8` (minus `space.6` at xs), and squares as tall as the field for touch input. Input text follows Input.
## Platform differences
Native uses TextInput with keyboardType numeric + Pressable − / +, and the unit picker opens in a bottom sheet.
## Avoid
Won (KRW) units on a quantity. A number without a unit. Multiplying converted quantities on screen by hand (use `toBaseQuantity`). Two base units (two units with factor 1). digits on a unit with no decimals (EA). Negative inventory without an explicit min. Code review checks these.
## Stories
Default · Units · Decimal · Error · Disabled · Conversion.
## References
Base UI Number Field. content.md §4 quantities (`formatQuantity`). Conversion SY-11 · PG-38 (blocks `scm/inventory/count` · `scm/warehouse/picking`).
