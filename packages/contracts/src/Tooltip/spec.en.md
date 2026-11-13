---
props:
  content: One line of supporting text
  children: One trigger element
  side: Position
  delay: Open delay (ms)
examples:
  IconToolbar: Icon toolbar — Wrap adjacent tooltips in TooltipProvider so that moving to the next one opens it right away.
---
# Tooltip
## Purpose
Use it to add one line of supporting text to an icon-only button or to truncated text. Put information users must know (errors, conditions) in Field help text or in a Popover.
## Anatomy
trigger (the wrapped element as it is) · popup (`tl-tooltip`, background `fg.primary`, text `fg.inverse`, `type.caption`, `radius.sm`, `z.dropdown`). No arrow. `space.4` gap from the trigger.
## Props
Generated from the contract.
## Variants
4 sides (top · bottom · left · right). It flips to the opposite side when there is no room.
## States
default. Open and closed are behavior, not visual states. hover, focus, active, disabled, loading and error do not apply (the trigger has them).
## Behavior
Built on Base UI Tooltip. It opens after `delay` (400ms by default) when the mouse rests on the trigger, and it also opens on keyboard focus. Pressing the trigger or Escape closes it. It does not open on touch devices. When several tooltips sit next to each other, wrap them in `TooltipProvider`. After one opens, the ones next to it open right away.

| Key | Action |
| --- | --- |
| Tab | Opens when focus reaches the trigger |
| Escape | Closes |
## Accessibility
Uses `role="tooltip"`. A tooltip is supplementary, so it does not replace the trigger's name. The trigger has its own `aria-label` (IconButton `label`), and content uses the same words. Contrast is 4.5:1 or higher with `fg.inverse` on `fg.primary`. With reduced motion, it appears at once without a fade.
## Density
`type.caption` at every density, inner padding `space.4` · `space.8`.
## Platform differences
Web only (`platforms.native=false`). On native, write the label on screen instead of using a long press.
## Avoid
Buttons or links inside a tooltip (use Popover). Two or more sentences. Attaching it directly to a disabled button, which cannot take focus (wrap the button in a span). Code review checks these.
## Stories
Default · Sides · IconToolbar (TooltipProvider).
## References
Base UI Tooltip, components.md §9 (Tooltip native=false).
