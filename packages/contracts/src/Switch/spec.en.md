---
props:
  checked: On (controlled)
  defaultChecked: On at first (uncontrolled)
  onChange: Called when it changes (applies right away)
  children: Label
  description: Description below the label
  disabled: Disabled
  size: Size (lg by default at touch density)
  name: Form name
examples:
  Settings: Settings that apply right away — The label says what turning it on does.
  Sizes: Sizes — sm · md · lg. lg (48 × 28) is finger size, and a switch without size is drawn as lg at touch density.
---
# Switch
## Purpose
Use it for an on and off setting that applies as soon as it is pressed (auto issue, email notifications). For a value submitted with a save button, use Checkbox.
## Anatomy
root · track (`radius.full`, off `fg.tertiary` · on `brand.default`) · thumb (`bg.surface`, `shadow.sm`) · label (`density.body-font-size`) · description (`type.caption`, `fg.tertiary`).
## Props
Generated from the contract.
## Variants
size sm (track 28 × 16) · md (track 32 × 20) · lg (track 48 × 28, thumb 24, finger size). The label always sits on the right.
## States
default · hover (off track `fg.secondary` · on `brand.hover`) · focus (ring on the track) · disabled (track `bg.sunken`, label `fg.disabled`). active · loading · error do not apply (a failed save is reported with a toast and the value is reverted).
## Behavior
Press it, or use Space or Enter, to toggle it. onChange is called as soon as it changes. The thumb moves over `duration.150`. With reduced motion, there is no movement animation. Passing checked makes it controlled, and defaultChecked makes it uncontrolled.
## Accessibility
Built on Base UI Switch. Uses `role="switch"` + `aria-checked`. The wrapping `<label>` is the name, and the description is linked with `aria-describedby`. The off track `fg.tertiary` has a contrast of 3:1 or more against the background. The focus ring always shows on the track.
## Density
size sets the track size (sm `space.24` + `space.4` × `space.16`, md `space.32` × `space.20`, lg `space.48` × `space.28`). Without size, the switch is drawn as lg at touch density (`data-density="touch"` and phone width). The contract default stays md and only CSS changes (root `data-size-auto`). A switch with size keeps that size at any density. `space.8` between the track and the label.
## Platform differences
Native passes token colors (trackColor · thumbColor) to the RN Switch.
## Avoid
A Switch inside a form that has a save button (use Checkbox). `켜기 / 끄기` (on / off) as the label (name what it turns on with a noun). Code review checks these.
## Stories
Default · Sizes · Description · Disabled.
## References
Base UI Switch.
