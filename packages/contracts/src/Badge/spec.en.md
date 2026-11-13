---
props:
  tone: Status tone
  approval: Approval status (electronic approval only)
  variant: Shape. `subtle` is a light background with a dot (default), `solid` is a strong background (counts, emphasis), `outline` is a border only
  dot: Leading dot (shown by default for subtle and outline, not for neutral)
  size: Size
  children: Label
examples:
  Vocabulary: Industry vocabulary — Pass the vocabulary's tone as it is (tax invoice states).
  Approval: Approval — The 5 states used only in electronic approval.
  Solid: Emphasis — Use the solid danger color for delays and errors.
---
# Badge
## Purpose
Use it to show one status of a row or card in a short word. The 5 approval states and the industry vocabulary (receiving, issued, equipment, and more) all follow this pattern.
## Anatomy
root (radius full, `type.caption` 600) · dot (the tone's default color) · label (`fg.primary`). Status-colored text does not reach 4.5:1 contrast, so the text stays neutral and the status shows through the dot and the background. Inside a DataGrid cell, a subtle badge with a dot shrinks to dot plus text with no background (a pill on every row would turn the whole column into a color stripe).
## Props
Generated from the contract.
## Variants
tone 5 · approval 5 × variant 3 × size 2.
## States
default (a data state, not an interaction state).
## Behavior
When `approval` is set and no label is given, the badge shows the approval label (draft, in progress, approved, rejected, withdrawn; in Korean `기안` · `진행` · `승인` · `반려` · `회수`). `solid` uses a `status.*.default` background with `status.*.on` text. The dot shows only when it says something (PR-38): subtle and outline have a dot by default, but a neutral tone has none (a gray dot carries no information; roles and due labels like D-10 are text only). Approval states always have a dot. An explicit `dot` wins. Dots mean only two things: status (StatusDot and the Badge dot) and category identity (the category tag, PR-33). Modules and roles are not shown as dots.
## Accessibility
Status is shown by color, dot and text. Color alone never tells states apart.
## Density
Height md 20 · sm 16.
## Platform differences
None.
## Avoid
Using approval colors for order or filing stages (use the vocabulary's tone). Putting a sentence in a badge.
## Stories
Tones · Approval · Solid.
## References
D-48 industry vocabulary, content.md §6.
