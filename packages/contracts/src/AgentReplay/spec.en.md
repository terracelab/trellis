---
props:
  status: Replay status. `running` while the agent works through screens, `done` when finished (summary and View result), `stopped` when a person stopped it
  label: Who is working (agent or owner name). First in the bar
  labelColor: Dot color before the label (chart slot name)
  caption: One line about the current step
  trail: Path to the current screen (menu names). Shown in the bar on wide screens only
  index: Current step (from 1)
  total: Number of steps
  remaining: Time or work left, as text
  pointer: Cursor position (px, viewport coordinates)
  ring: Outline position of the field being handled
  ripples: Press ripples
  onSkip: Skip to the end
  onStop: Stop (running) or close (done, stopped)
  summary: One-line summary when done
  onOpenResult: View result
examples:
  Running: Running — Cursor with a name tag, an outline around the field being filled and a progress bar with Skip and Stop.
  Done: Done — A check, the summary, View result and Close. The cursor and outline are gone.
  States: States — Running, stopped and done bars. Nothing outside the bar can be pressed, so there is no disabled, loading or error state (a failure is reported in the caption).
  Phone: Phone — The bar spans the full width just above the tab bar and hides the path.
---
# AgentReplay
## Purpose
Use it to show a person how an agent (the AI assistant) moves through screens, fills fields and submits. It draws a cursor, an outline around the field being handled, press ripples and a progress bar at the bottom (who, what, which step, Skip, Stop) on the top layer. The app performs the actions. This component only draws from coordinates the app measures. The conversation and result review stay in the side panel (AppShell `aside`) with MessageThread, RunSteps and ProposalCard.
## Anatomy
layer (whole screen `position: fixed`, `z.toast`, presses pass through) · ring (`space.4` outside the field, `border-width.2` `border.focus`, `radius.md`) · pointer (Icon `mouse-pointer-2` 20, fill `fg.strong` with a `bg.surface` outline, plus a name tag: `fg.strong` pill with `fg.inverse` `type.caption` 600 text and a dot before the label) · ripple (`space.32` circle with a `border.focus` outline that grows and fades) · bar (progress bar: `bg.elevated`, `border.default`, `radius.lg`, `shadow.lg`, at least `density.control-height-lg` tall, holding the dot and label (600 `fg.strong`), caption, trail (`type.caption` `fg.secondary`, such as `회계 › 세금계산서`), step and time left, and buttons).
## Props
Generated from the contract. On the web it also takes `container` (where to draw: a portal to document.body by default, in place when null).
## Variants
status running (cursor, outline and ripples, with Skip and Stop) · done (check icon, summary, View result and Close) · stopped (`멈춤 · ` (stopped) before the caption, and Close). labelColor takes chart slot names only (`series-1` to 5 and status colors). It will take the category color slots once those tokens exist (R-38).
## States
default · focus (focus ring on the bar buttons). hover and active follow Button. Only the bar can be pressed, so there is no disabled, loading or error state (a failure is reported in the caption).
## Behavior
The layer covers the screen with `pointer-events: none`, so the screen underneath stays usable. Only the bar takes presses. pointer, ring and ripples are px from the top left of the viewport (the same coordinates as getBoundingClientRect). When they change, the cursor glides over `duration.slow` and the outline over `duration.normal`. A ripple spreads once when a new id appears (`duration.slower`). The cursor, outline and ripples draw only while running.
On wide screens the bar floats at the bottom center and rises by `--tl-toast-offset-bottom` (the height of a bottom sheet, the phone tab bar or a sticky ActionBar, PR-19). Below `breakpoint.sm` it becomes a full-width bar just above the tab bar and hides the trail. A long caption is truncated (on phones it wraps to two lines).
Skip (onSkip) jumps to the end without showing the remaining steps. onStop stops while running and closes when done or stopped. View result (onOpenResult) shows only when done.
With reduced motion (`prefers-reduced-motion` or `data-motion="reduce"`) the cursor and ripples are not drawn and only the outline stays. The outline moves at once instead of gliding (time tokens are 0).
## Accessibility
The drawings on the layer (cursor, outline, ripples) are `aria-hidden`. The bar is a `section` named `{label} 작업 재생` ({label} replay), and its text part is `role="status"`, so the caption and step are read quietly when they change. The buttons are text buttons (`건너뛰기` Skip, `멈추기` Stop, `닫기` Close, `결과 보기` View result). The color dot is decoration and the label text says who is working. Done is shown by a check icon and the summary text, stopped by the text `멈춤` (stopped). It never moves focus, so the person keeps their place.
## Density
Bar buttons are Button sm (`density.control-height-sm`). The bar is at least `density.control-height-lg` tall. At phone touch density the buttons become finger-sized.
## Platform differences
Web only. The native app has no screen replay (after 1.0, D-101).
## Avoid
Letting the layer block presses (turning on `pointer-events`). Moving focus during a replay. Showing progress with cursor movement alone (the caption text is always there). Putting the bar at the top of the screen (it collides with the side panel and the bar). Finishing a data change through the replay alone (changes go through ProposalCard approval first).
## Stories
Running · Done · Phone · States.
## References
R-41 (service AI assistant), AppShell side panel (PG-33), patterns/ConversationalWork, D-130.
