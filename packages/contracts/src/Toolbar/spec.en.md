---
props:
  label: Toolbar name (accessibility)
  groups: Groups (id · label · items · content). A divider sits between groups
  onPress: Called when a button is pressed
  end: Text at the end (no focus)
  size: Button size (sm 30 · md 36)
  orientation: Direction (arrow keys follow it)
  disabled: Locks everything
examples:
  Editor: Document formatting — Paragraph style (Select), text formatting (toggle buttons) and an insert group with dividers between them and a character count at the end. Arrow keys move between buttons.
  Labels: Labelled buttons and locked toolbar — showLabel writes the name next to the icon. A document under approval is locked with disabled and its buttons stay in arrow navigation.
---
# Toolbar
## Purpose
Use it to show a row of tool buttons (formatting · insert · list actions) in groups with dividers (the formatting row of ecm/doc-editor). Use PageHeader actions for the main actions of a screen, ActionBar for actions on several selected items, Menu for a more menu and SegmentedControl to pick one view.
## Anatomy
root (`tl-toolbar`, role toolbar, wrapping flex, `space.4` gaps) · group (role group, named by label) · separator (vertical line between groups, 1px `border.divider` × `space.20`) · button (height and minimum width `density.control-height-sm` · md, `radius.md`, text `fg.secondary`, the same tokens as a ghost IconButton. A 16 icon or a formatting letter in `type.body`, or icon + name with showLabel) · pressed (a pressed toggle is `brand.subtle` + `fg.link`) · content (slot for parts like a Select) · end (end text `type.caption` `fg.secondary` tabular, at the far end).
## Props
Generated from the contract.
## Variants
size sm (30, default) · md (36) × orientation horizontal (default) · vertical. Button kinds: push button (no pressed) · toggle button (pressed true · false) · icon + name (showLabel) · formatting letter (text + textStyle bold · italic · underline · strike).
## States
default · hover (background `bg.sunken`, text `fg.primary`) · active (`bg.sunken`, text `fg.strong`) · focus (2px `border.focus` ring, `tl-focusable`) · disabled (text `fg.disabled`, no background, `aria-disabled`. It stays in arrow navigation). A pressed toggle is one background step (`brand.subtle`) with no thick stripe. loading and error do not apply.
## Behavior
Pressing a button calls `onPress(id)`. Toggle buttons use the same onPress and the caller flips pressed (the document state is the truth). A locked button does not call onPress.

| Key | Action |
| --- | --- |
| Tab | Enters the toolbar (the last button visited). Tab again leaves it |
| → · ← (↓ · ↑ when vertical) | Next · previous button (wraps around). The first focusable element inside content (Select) is included |
| Home · End | First · last button |
| Enter · Space | Presses the button |

There is one tab stop (roving tabindex). The toolbar also sets the tabindex of parts inside content. Inside a text input the arrow keys move the text cursor. When space runs out, buttons wrap to the next line.
## Accessibility
`role="toolbar"` with `aria-label` (label) and `aria-orientation`. Groups are `role="group"` with a name and dividers are `role="separator"`. Buttons with only an icon or a formatting letter get `aria-label` (label) and a tooltip (`굵게 (Ctrl+B)` when there is a shortcut), and shortcuts go in `aria-keyshortcuts`. Toggle buttons use `aria-pressed`. Locked buttons use `aria-disabled`, so screen readers can still find them. The end text takes no focus. Contrast: text `fg.secondary` (4.5:1), a pressed toggle `fg.link` on `brand.subtle`.
## Density
Buttons `density.control-height-sm` (compact 30 · comfortable 30 · touch 44), md uses `density.control-height-md`. Gaps are `space.4` at every density.
## Platform differences
Native draws a horizontally scrolling row (a formatting bar above the keyboard). Screen reader swipes replace arrow keys. Props are the same.
## Avoid
Blocks writing their own role toolbar (a button row without roving, use Toolbar). Showing a pressed toggle with a thick bottom or left stripe. Main actions (save · request approval) in the toolbar (use PageHeader actions · ActionBar, code review).
## Stories
Editor · Labels.
## References
SY-15 · PG-43 (formatting row of ecm/doc-editor), WAI-ARIA APG Toolbar, IconButton (same tokens) · Tooltip. Benchmarks are for structure only.
