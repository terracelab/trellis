---
props:
  errors: Error list (field id · name · sentence)
  title: Title ("Fields to check: N" when missing)
  focusKey: Moves focus to the summary when it changes (submit count)
  onSelect: Called when an item is pressed (default moves to the field)
examples:
  Default: Error summary after submit — Press an item to go to that field. Pass useTrellisForm's form.summary as is.
---
# ErrorSummary
## Purpose
Use it at the top of a form to gather the errors after a submit that still has fields to fix. Pressing an item moves to that field. It helps when a form has many fields, or when errors sit in a collapsed group or further down the screen. One field's error sentence belongs to Field, and a result for the whole form, like a failed save, belongs to Banner · Toast.
## Anatomy
root (`radius.md`, `bg.surface`, 1px `status.danger.default` border; no tone background and no left stripe) · head (circle-alert icon `status.danger.default` 16 + title `type.label` 600 `fg.primary`) · list (`space.4` between items) · item (link `fg.link`, underlined, "field name · sentence").
## Props
Generated from the contract.
## Variants
None.
## States
default · focus (focus ring around the whole summary).
## Behavior
When errors is empty, nothing is drawn. When focusKey changes (on every submit) and there are errors, focus moves to the summary and the screen scrolls up to it. Items are `href="#<field id>"` links. Pressing one moves focus to that field and scrolls it to the center (onSelect is called instead when given). Items follow the order of fields on screen. Fixing a field removes its item, and fixing all of them removes the summary. Pass `form.summary` from useTrellisForm (`@terracelab/trellis-react/form`) as is.
## Accessibility
`role="alert"` + `tabIndex=-1` (when it gets focus, the title and list are read), with the title linked through `aria-labelledby`. Items are links, reached with Tab and Enter. Errors show through the icon and text, not color alone.
## Density
Padding `space.12` × `density.card-padding`, text `density.body-font-size`.
## Platform differences
Native puts the same list at the top of the ScrollView, and pressing an item scrolls to and focuses that field (Phase 3).
## Avoid
Showing it before the first submit (do not pour errors on someone who has just started typing). Items as plain text instead of links. Sentences with no cause, like "An error occurred". Exclamation marks.
## Stories
Default · WithForm (useTrellisForm).
## References
content.md §5 error copy, docs/guides/forms.md.
