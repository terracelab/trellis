---
props:
  steps: Run steps (top to bottom in run order)
  label: List name (Run steps by default)
  defaultExpanded: Step ids expanded at first (failed and awaiting review when not set)
  collapsible: Collapses into a one line summary
  defaultOpen: Open at first when collapsible
examples:
  AllStates: Six run states — Queued, running, awaiting review, done, failed and stopped. The state shows through the dot color and text together.
  Collapsed: One line summary — Above an answer it starts collapsed. It shows the state, step count and time taken, and opens when pressed.
  Details: Expanded details — Failed and awaiting review steps start expanded. Pressing a row collapses or expands it.
---
# RunSteps
## Purpose
Use it to show the steps an agent ran to build an answer (lookups, calculations, tool runs) in order, with state and time taken. Above an answer it collapses into a one line summary (`collapsible`). Use Timeline for a history of human actions, DataGrid with StatusDot (JOB_STATES) for batch jobs, and ApprovalLine for approval steps.
## Anatomy
root (`tl-run-steps`, `data-run-state` = overall state) · summary (collapsible: a row button with a 1px `border.divider` = state dot, "Run steps 4", overall state text, total time and an expand icon) · list (`ol`) · step (`li`, `data-run-state`) · row (expand button when there is detail, `density.control-height-sm` high, `radius.md`) · dot (StatusDot, AGENT_RUN_STATES tone, pulse only while running) · name (500) · description (`type.caption` `fg.secondary`) · state (state text `type.caption` `fg.secondary`, failed and awaiting review use `fg.primary` 600) · duration (tabular, right aligned) · chevron (`fg.tertiary`) · detail (expanded detail, `bg.sunken` · `radius.md` · `type.caption`, indented to start under the dot).
## Props
Generated from the contract.
## Variants
There is no variant prop. For each step the six run states (D-116) set the dot tone and text.

| state | Text | Dot tone | Other |
|---|---|---|---|
| queued | Queued | neutral (`fg.tertiary`) | name `fg.secondary` 400 |
| running | Running | info | dot pulses (stops under reduced motion) |
| waiting | Awaiting review | warning | state text `fg.primary` 600, expanded at first |
| succeeded | Done | success | |
| failed | Failed | danger | state text `fg.primary` 600, expanded at first |
| canceled | Stopped | neutral | name `fg.secondary` 400 |
## States
default · hover (expandable rows and the summary row use `bg.sunken`) · focus (focus ring, inside the row). Run states are a separate axis from the seven component states (streaming = loading lives in RichText, and the error state is not used). active, disabled, loading and error do not apply.
## Behavior
- Order: top to bottom in run order. When the app changes `steps` (state or time taken) it redraws as given.
- Time taken: `durationMs` shows as 1.2s under 10 seconds, 12s under a minute and 2m 5s after that (`formatRunDuration`). While running, the app passes the time so far.
- Expanding: only steps with `detail` have a row that is an expand button. At first `defaultExpanded` is used, otherwise failed and awaiting review steps are expanded.
- Summary (`collapsible`): the overall state comes from the contracts function `runStepsState` (failed, then stopped, awaiting review, running, queued, done; finished steps mixed with queued ones count as running). The total time is the sum of the step times. At first `defaultOpen` is used, otherwise it opens only when something is running, awaiting review or failed.

| Key | Action |
| --- | --- |
| Tab | Summary row, then expandable rows in order |
| Enter · Space | Expands or collapses step detail or the summary |
## Accessibility
The list is an `ol` with a name (label, "Run steps" by default). The state is read as text (Done, Failed and so on), not only shown by the dot color. Expand buttons have `aria-expanded` and `aria-controls` (detail or list). The dot is decorative (aria-hidden) and the pulse stops under reduced motion. Text contrast of `fg.secondary` and `fg.primary` is above 4.5:1, and the focus ring always shows.
## Density
Row height is `density.control-height-sm` (44 under touch), text uses `density.body-font-size`. The detail indent and padding do not depend on density.
## Platform differences
Native draws the same rows with Pressable and expands detail below the row. Props are the same.
## Avoid
State by color alone, a left state stripe on rows (D-57), icon decoration per step, new run state names (the six AGENT_RUN_STATES are fixed, D-116), and a percent progress bar instead of steps. Code review checks these.
## Stories
AllStates · Collapsed · Details.
## References
D-116 AGENT_RUN_STATES, patterns/ConversationalWork, MessageThread (answer `steps`), ProposalCard (awaiting review), StatusDot.
