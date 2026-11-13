---
props:
  title: One sentence in the past tense
  description: One supporting sentence
  tone: Status tone (icon color)
  action: One button
  duration: Time until it closes on its own (ms). 0 keeps it open. Without it, danger is 0 and a toast with an action is 10000
  onClose: Called when it closes
examples:
  AboveBottomActions: Above bottom actions — With a sticky ActionBar, a bottom drawer footer or the phone tab bar, toasts appear above them.
  ShowToast: Showing a toast — Wrap the app root once in ToastProvider and show toasts with useToast().show. Showing the same toast again counts it as ×N.
  Tones: Tones — The text is neutral, and the tone shows through the leading icon.
---
# Toast
## Purpose
Use it to briefly report the result of an action the user just took (saved, rejected). If the user must read it and decide, use Dialog. If it must stay on the screen, use Banner.
## Anatomy
viewport (fixed at the bottom right, `z.toast`) · root (`tl-toast`, `bg.elevated`, `border.default`, `shadow.lg`, `radius.md`, no left accent stripe per D-57) · icon (tone color, none for neutral) · title (`type.label` 600 `fg.primary`) · count ("×N" after the title, `fg.secondary` 400 tabular) · description (`type.caption` `fg.secondary`) · action (text button in link color) · close (x icon).
## Props
Generated from the contract.
## Variants
tone 5 (neutral · info · success · warning · danger). All text is neutral, and the tone shows through the icon color (neutral has no icon).
## States
default. Appearing, disappearing and stacking are behavior. The other states do not apply.
## Behavior
Wrap the app root in `ToastProvider` and show a toast with `useToast().show(options)`. `show` returns an id, and `close(id)` closes that toast. Calling it again with the same id updates the content instead of stacking a new toast. The timer pauses on mouse hover or when focus moves inside.

When `duration` is given, that is the time before it closes. Without it, danger stays until closed (0), a toast with an action closes after 10 seconds, and the rest close after 4 seconds. Errors need time to read and fix, and undo needs time to press. The app setting for display time (WCAG 2.2.1) goes on top. Default keeps these rules, long doubles every non-zero time, and manual keeps every toast until it is closed. `ToastProvider` reads the setting from TrellisProvider, and a change applies to toasts shown after it.

When a toast with the same title and tone arrives while one is shown, no new toast stacks. The shown toast counts it with "×N" after the title and restarts its timer. The description and action change to those of the latest call, and `show` returns the id of the shown toast. A matching toast hidden beyond the stack limit is closed and shown again at the front, keeping its count. A call with an id is a content update and is not counted. Up to 3 toasts stack, and they spread out on hover. Swipe down or right to close one. Pressing the action runs onPress and then closes the toast. The `<Toast>` component is a static rendering with the same look (docs, visual regression tests, fixed notices inside a screen). When something occupies the bottom of the screen (an open bottom drawer, the footer of a drawer that fills the phone screen, a sheet footer, the phone tab bar, a sticky ActionBar), the height from its top edge to the bottom of the screen is collected into `--tl-toast-offset-bottom` (the largest wins) and toasts sit above it, so the next action under the thumb is not covered for seconds. Only elements reaching into the lower half of the screen count (an action row scrolled up does not), and it is measured again on scroll and resize. The footer of a right drawer on wide screens counts too (the toast sits in the same bottom-right corner and covered the buttons people press with the drawer open). The layer order (`z.toast` 500, D-63) is unchanged; only the position moves.

| Key | Action |
| --- | --- |
| F6 | Move to the notification region |
| Tab | Action and close buttons |
| Enter | Run the button |
| Escape | Close the toast when focus is inside |
## Accessibility
The notification region is a landmark. Regular toasts are announced politely, and danger uses `priority: 'high'` so it is read right away. Only the title and description text are read. The visible "×N" is hidden from screen readers. Each time the count grows, a hidden status region reads `같은 알림 N번째. <title>` (same notification, Nth time) once, politely. The close button's name is `닫기` (close). Neutral text keeps the 4.5:1 contrast. With reduced motion, toasts appear and disappear without sliding.
## Density
Width 352 (`space.64` × 5.5) and inner padding `space.12`, regardless of density.
## Platform differences
Native uses its own overlay (bottom center, same options). Swipe to close works downward only.
## Avoid
More than one sentence. More than one button. Reporting the cause of an error only in a toast (form errors go in Field). Exclamation marks. Apology wording. Code review checks these (content.md §5).
## Stories
ShowToast · Tones · AboveBottomActions. Stacking, ×N and display time are covered by `packages/react/test/toast-duration.test.tsx`.
## References
Base UI Toast, content.md §5 (toast wording).
