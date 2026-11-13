---
props:
  name: Person's name (accessible name and initials). Optional when vacant
  src: Photo URL
  size: Diameter (`size.avatar` token)
  status: Work status dot
  decorative: Decorative (when the name is already next to it)
  shape: Shape. A rounded square by default for people
  tone: Color 1–6. Picked from the name when not given (the same person gets the same color)
  vacant: Vacant seat (dashed border and person icon)
examples:
  Sizes: Sizes — Table row 24, list 32, approval line 40, profile 48.
  Status: Work status — The dot at the bottom right and the accessible name, as used in messenger and org chart screens.
  WithName: Next to a name — Hidden as decorative when the name text is already there.
  ShapesAndTones: Shapes and colors — People default to a rounded square, and the color comes from the name (the same person gets the same color) (PR-27).
  Vacant: Vacant — A seat with no owner. A dashed border and a person icon, read as "담당자 없음" (unassigned). Size and shape match a person avatar.
---
# Avatar
## Purpose
Use it to show one person (drafter, approver, person in charge, worker) as a round photo or name initials. Use ModuleIcon for modules, and plain text for companies and business partners.
## Anatomy
root (rounded square with 30% corners, or a circle, `size.avatar-24/32/40/48`, background `avatar.{1~6}.bg`) · image (photo, cropped to the shape) · initials (`avatar.{1~6}.fg`, 600, a Korean name shows the two given-name characters without the family name, `type.micro` at 24, `type.caption` at 32, `type.label` at 40, `type.h3` at 48) · status (dot at the bottom right, `bg.surface` border 2).
## Props
Generated from the contract.
## Variants
shape 2 (square by default · circle) × tone 6 (picked from the name when not set, so a person has the same color everywhere, PR-27) × size 4 × status 5 (none · online `status.success` · away `status.warning` · busy `status.danger` · offline `fg.disabled`). Vacant (PR-34): a seat with no owner. No fill, a dashed 1px border (`border.strong`) and a person icon (`fg.tertiary`, 16 at 24 · 32, 20 at 40 · 48). Size and shape follow the person avatar, so rows keep the same height and alignment. It works without a name.
## States
default. While the photo loads and when it fails to load, the initials show.
## Behavior
For a Korean name the initials are the two given-name characters without the family name (`김테라` → `테라`, `남궁민수` → `민수`, a two-character name stays as it is). For an English name, they are the first letters of two words (Kim Tera → KT). The characters are the same at every size. At 24 it still shows two characters, and only the font size drops to `type.micro` (R-T46). Every component that draws a person (PersonLabel, OrgChart, TeamSchedule, ProfileHeader) uses Avatar and follows this one rule. Components do not make their own initials. The photo swaps in only after it has fully loaded, so it does not flicker.

`status` is the messenger status (`AvatarStatus`: online, away, busy, offline). It is a different vocabulary from today's work status (`PresenceState`: working, remote, field work, vacation, off, used by PersonLabel `presence`), and the two are not merged (R-T26). A screen that only knows the work status makes the dot with the contracts helper `presenceToStatus` (working and remote become online, field work becomes away, vacation and off become offline). Dot tones come from `AVATAR_STATUS_TONES`, labels from `avatarStatusLabel`. To overlap several people, use AvatarGroup.
## Accessibility
Uses `role="img"`, with the name in `aria-label` (name plus work status, for example `김테라, 자리 비움` (Kim Tera, away)). If the name text is already next to it, set `decorative` to hide it so the name is not read twice. The status dot is conveyed by the accessible name and `title`, not by color alone. A vacant avatar is read as "담당자 없음" (unassigned); the dashed line is never the only cue. The decorative rule is the same.
## Density
Size does not depend on density. Table rows use 24, lists and approval lines use 32, and profile cards use 48.
## Platform differences
Native falls back to the initials through the Image `onError`. Props are the same.
## Avoid
Using the status dot for approval status (use Badge `approval`). An illustrated mascot instead of a photo. Code review checks these.
## Stories
Sizes · Status · WithName · ShapesAndTones · Vacant (VRT).
## References
content.md §6 (person in charge, user). Base UI Avatar (image loading state). The relationship between the people-status vocabularies is in contracts `_shared/presence.ts` (R-T26).
