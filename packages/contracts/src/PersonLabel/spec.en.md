---
props:
  name: Person's name (optional when vacant)
  meta: Secondary line (role and department)
  src: Photo URL
  presence: Today's work status (`working`, `remote`, `fieldwork`, `leave`, `off`). A dot and words in md, a dot only in sm
  status: Messenger status (`online`, `away`, `busy`, `offline`) as a dot on the avatar
  size: "`sm` is one line for table cells, `md` is two lines for lists"
  href: Link URL, such as the member detail page
  onPress: Press handler, such as opening a detail drawer
  vacant: Vacant seat (dashed avatar and "unassigned")
  vacantLabel: Vacant text (default "담당자 없음")
  action: Action at the end of a vacant row (assign)
examples:
  Team: Member list — Role and department under the name, with today's work status as a dot and words.
  InTable: In a table cell — `sm` stays on one line, so the row height does not change. Work status is a dot only, so the name keeps its width.
  Link: Link — Opens the member detail. Hovering underlines the name.
  Status: Messenger status — Messenger presence is the avatar dot (`status`), and today's work is a dot and words (`presence`). With only the work status, `presenceToStatus` makes the dot.
  Vacant: Vacant — With no owner, a dashed avatar and "담당자 없음" (unassigned). The row keeps the height of a filled row and an assign button goes in action.
---
# PersonLabel
## Purpose
Use it to show one person as avatar, name and one secondary line (role and department) in table cells, lists and next to approval lines. Today's work status can follow as a dot and words, and the messenger status (online, away, busy, offline) as a dot on the avatar. Use ProfileHeader for a detail header, Avatar for the photo alone, and SelectableList for a list of people to pick from (master-detail).
## Anatomy
root (`span`, `a` for a link, `button` for a press) · Avatar (decorative, 24 in sm, 32 in md, initials follow the Avatar rule of two given-name characters at every size, with a status dot at the bottom right when `status` is set) · name (`density.body` 600 `fg.primary`) · meta (caption `fg.secondary`) · presence (StatusDot sm, a dot and words in md, a dot only in sm).
## Props
Generated from the contract.
## Variants
size sm (one line, secondary text beside the name, work status as a dot only, keeps the table row height) · md (two lines, secondary text under the name, work status as a dot and words). `href` makes a link, `onPress` a button, neither plain text. Vacant (PR-34): a dashed avatar (Avatar vacant) and vacantLabel in the name slot (default "담당자 없음", `fg.secondary` regular weight). Avatar size, text and line count match a filled row, so the height is the same (pass meta to match two-line md rows). The row itself is not pressable (href and onPress are ignored); the assign action goes after the text through action (Button xs in a table cell sm, Button sm in a list md).
## States
default · hover (name underline when pressable, `duration.fast`) · focus (focus ring).
## Behavior
Name and secondary text stay on one line and truncate with an ellipsis. In sm the work status shrinks to one dot, so the name keeps its width even in an md table column (R-T35). The status words stay as hidden text for screen readers and as the dot's `title` (a tooltip on hover). Presence tones come from `PRESENCE_TONES`: working is success, remote and field work are info, vacation is warning, off is neutral.

There are two people-status vocabularies, and they stay separate (R-T26). `presence` (work status, `PresenceState`) says where someone works today (HR, attendance, org chart). `status` (messenger status, `AvatarStatus`) says whether they are on the messenger now (messenger, notifications). Both can be set. A screen that only knows the work status and wants the avatar dot converts it with the contracts helper `presenceToStatus` (working and remote become online, field work becomes away, vacation and off become offline). Labels come from `presenceLabel` and `avatarStatusLabel`.

`href` renders an `a` element. When TrellisProvider has `navigate`, in-app addresses open through that function without a page reload (R-T34). Ctrl, Cmd or middle clicks (new tab), outside addresses and `#id` links are left to the browser. `onPress` runs before navigation.
## Accessibility
The avatar is decorative (aria-hidden), so the name is not read twice. The messenger status is read as hidden text after the name. A link or button is named by the name, messenger status, secondary text and work status. Status comes through as words, not color alone. In md the words are visible, and in sm they are hidden text (`tl-sr-only`), so the status is still read in sm. A vacant row is read as the text "담당자 없음" (unassigned). The avatar is decorative.
## Density
sm fits a compact row (36). md is for lists and cards (two-line rows use `row.heightTall`).
## Platform differences
Native uses Pressable with the same presence tones.
## Avoid
A status pill on every row. A colored stripe left of the name (D-56). `onPress` inside a table cell when the grid has `onRowPress`, because the two presses overlap. Code review checks these.
## Stories
Team · InTable · Link · Status · Vacant (VRT).
## References
Avatar, ProfileHeader, DataGrid (render cells), Link and TrellisProvider navigate (R-T34), SelectableList (R-T22), contracts `_shared/presence.ts` (R-T26), R-T59 (status pass-through).
