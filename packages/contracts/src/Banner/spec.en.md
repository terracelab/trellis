---
props:
  tone: Tone (icon color)
  title: Title
  children: Body
  action: Action on the right
  onClose: Close (shows a close button when set)
examples:
  Tones: Tones — Only the icon takes the status color. The surface and text stay neutral.
  WithAction: Action and close — An error is read out right away as an alert, with one button for the next step.
  Narrow: Narrow space — Below 560 wide the action button moves to a line under the text and close stays at the top right.
---
# Banner
## Purpose
Use it to show a notice or warning that must stay at the top of a screen or card (deadline soon, send failed, planned maintenance). For a result that shows briefly and goes away, use Toast. For an error in one field, use Field.
## Anatomy
root (`radius.md`, `bg.surface` background, 1px `border.default` border. No tone background and no left stripe) · icon (tone color, 16) · title (`type.label` 600 `fg.primary`) · message (`density.body-font-size` `fg.secondary`) · action (Button sm) · close (IconButton sm `닫기` (close)).
## Props
Generated from the contract.
## Variants
tone 5 (info · success · warning · danger · neutral). The tone sets the icon (info · circle-check · triangle-alert · circle-alert · info).
## States
default.
## Behavior
The close button shows only when onClose is set. The action button sits to the right of the text when the banner is 560 or wider, and moves to a line below the text, aligned with its start, when narrower (phones and narrow cards, a container query). Close always stays at the right of the first line (PR-38). The banner fills its parent's width. The screen decides whether the banner shows again after it is closed (controlled). Use only one action button. Write the text in the formal polite style (`합니다체`) and say what happened and what to do.
## Accessibility
Uses `role="status"`, and danger uses `role="alert"` (read right away). Text stays in neutral colors, and the state shows through the icon color and the title text (status-colored text does not reach 4.5:1). The close button has the name `닫기` (close) and is reachable with Tab.
## Density
Inner padding `space.8` × `density.card-padding`. Text uses `density.body-font-size`.
## Platform differences
None.
## Avoid
More than one banner on a screen. Keeping a success result on screen as a banner (use Toast). Apology wording. Exclamation marks. Code review checks these.
## Stories
Tones · WithAction · Narrow (narrow space).
## References
content.md §5 (error and confirmation wording).
