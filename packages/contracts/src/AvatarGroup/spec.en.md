---
props:
  people: People (name, src)
  max: Visible slots (the last one becomes +N on overflow)
  size: Diameter (size.avatar tokens)
  shape: Shape (rounded square or circle)
  label: Accessible name (defaults to "names and N more")
examples:
  Basic: Attendees — When the slots run out, the last slot shows "+N". It is read as "these names and N more".
  Sizes: Sizes and shapes — 24 for table cells and cards, 32 and 40 for headers. Circles match person chips.
  InRow: In a list row — Members overlap next to a room name. Hovering +N shows the hidden names.
---
# AvatarGroup
## Purpose
Use it to show several people, such as attendees, CC or room members, as overlapping avatars in one place. When the slots run out, the last slot shows "+N". For one person use Avatar or PersonLabel, for person chips that are added and removed use TagInput `person`, and when the names themselves are needed, list them as text.
## Anatomy
root (`span` with role img, `tl-avatar-group`) · item (Avatar, decorative, overlapping the previous avatar by `space.6` (24), `space.8` (32) or `space.10` (40), with a 2px `bg.surface` ring) · more ("+N", the same size as an avatar, `fg.primary` on `bg.sunken`, `type.micro` 600 tabular, hidden names in `title`).
## Props
Generated from the contract.
## Variants
3 sizes × 2 shapes.

| size | Avatar | Overlap | +N text |
|---|---|---|---|
| 24 (default) | `size.avatar.24` | `space.6` | `type.micro` |
| 32 | `size.avatar.32` | `space.8` | `type.caption` |
| 40 | `size.avatar.40` | `space.10` | `type.label` |

shape `square` (default) is the same rounded square as Avatar, `circle` is a circle (to match person chips and screens with round avatars).
## States
default only. It is not pressable. hover, active, focus, disabled, loading and error do not apply (to open a list, wrap it in a Popover trigger).
## Behavior
`avatarGroupSlots(people, max)` decides who shows and how many overflow. If there are max people or fewer, all show. Otherwise max − 1 people and "+N" show, so the slot count is always max. Each avatar covers the right side of the one before it (the status dot at the bottom right of the previous person would be hidden, so status dots are not passed).
## Accessibility
It is one image (`role="img"`). The name is `label` (such as "6 attendees"), or "these names and N more" (`avatarGroup.others`). Each avatar is decorative, so names are not read twice. Hidden names show in the `title` of +N on hover. The +N text in `fg.primary` on `bg.sunken` is above 4.5:1.
## Density
Sizes do not depend on density (avatar size tokens).
## Platform differences
Native overlaps Views (negative margin) with a Text "+N". Props are the same.
## Avoid
Status dots on overlapping avatars (they get hidden, use PersonLabel). Drawing every person until the row overflows. +N as a gray pill badge. Making initials by hand (follow the Avatar rule). Code review checks these.
## Stories
Basic · Sizes · InRow.
## References
SY-13 (AvatarGroup), PG-35, Avatar (initials rule R-T46), TagInput `person`. Benchmarks for structure only.
