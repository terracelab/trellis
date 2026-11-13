---
props:
  variant: Role. `primary` is the one main action on a screen, `secondary` is the default, `ghost` sits inside tables and toolbars, `danger` is for actions that cannot be undone
  size: Height (density token)
  icon: Leading icon
  iconEnd: Trailing icon (dropdown or next step)
  loading: In progress. The button cannot be pressed and shows a spinner
  disabled: Disabled
  disabledReason: Why it is disabled. Use with disabled. The button stays focusable and gives the reason in a tooltip and through aria-describedby
  fullWidth: Fills the parent width
  type: Form behavior
  onPress: Called when pressed
  children: Label
examples:
  Variants: Roles — Use one primary for the main action on a screen and danger for actions that cannot be undone.
  States: States — In progress, disabled and sizes.
  DisabledReason: Disabled reason — An action the user has no permission for or whose deadline has passed. The button stays focusable and a tooltip gives the reason.
---
# Button
## Purpose
Use it to run an action. A screen has one primary button (save, issue, request approval). Use a link to navigate.
## Anatomy
root (`tl-button`, height `density.control-height-*`, radius `radius.md`) · icon (16) · label (600. Text size xs · sm `type.caption` 12, md `type.label` 13, lg · xl `type.body` 14) · spinner (loading).
primary uses a `brand.default` background with `brand.onBrand` text, secondary uses `bg.surface` with `border.default`, ghost is transparent, danger uses `status.danger.default` with `status.danger.on`.
## Props
Generated from the contract.
## Variants
4 variants × 5 sizes (xs · sm · md · lg · xl).
## States
default · hover (`brand.hover` · `bg.canvas`) · active (`brand.active` · `bg.sunken`) · focus (ring) · disabled (`bg.sunken` with `fg.disabled`) · loading (spinner, width kept).
## Behavior
While loading, the button cannot be pressed and sets `aria-busy`. The label keeps its width so the button does not shrink. A submit button that is loading or disabled does not submit the form.

Disabled reason (disabledReason): when it is given with disabled, the button looks disabled but stays focusable. Pointing at it or focusing it with the keyboard shows the reason in a Trellis Tooltip. Pressing it does not call onPress. Use it for reasons the user cannot see on the screen, such as a missing permission or a passed deadline. Without disabled it is ignored.
## Accessibility
Renders `<button type>`. Use IconButton for a button with only an icon. Enter and Space press it. With disabledReason the button uses `aria-disabled="true"` instead of native `disabled`, so it stays in the Tab order. The reason is hidden text (`hidden`) linked with `aria-describedby`, so it is read as a description after the name. The tooltip only shows the same text.
## Density
xs · sm · md · lg · xl = `density.control-height-*` (compact and comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). Side padding xs `space.6` · sm `space.8` · md `space.12` · lg `space.16` · xl `space.20`.
## Platform differences
Native uses Pressable and has no hover.
## Avoid
Two primary buttons on one screen. "Yes" or "OK" in a confirmation dialog (use a label that names the result). A button that navigates instead of a link. An action blocked by a permission or a deadline that is disabled without a reason (use disabledReason). Code review checks these.
## Stories
Variants · Sizes · Icon · Loading · Disabled · DisabledReason.
## References
content.md §5 (button labels).
