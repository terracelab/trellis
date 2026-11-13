---
props:
  kind: Kind (default icon, title and description; error is announced)
  icon: Icon (inside the circle; the kind's default when omitted)
  title: What is missing (the kind's default title and description when omitted)
  description: Hint for the next action
  requestId: Request ID line (kind="error" or "forbidden")
  action: Next action button
  headingLevel: Heading level (a paragraph when omitted, 1 for full-screen errors)
  size: Size
examples:
  Default: Empty list — What is missing and the next action.
  Search: No search results — Use sm inside tables and small cards.
  Kinds: Seven kinds — Each kind has a default icon, title and description.
  ErrorWithRequest: Load error — A retry button and the request ID line. The block is announced with role="alert".
  FullPage: Full-screen error — Screen blocks for a missing address, no access or an expired sign-in center this block with headingLevel 1 and up to two actions.
---
# EmptyState
## Purpose
Use it to show what is missing and the next action when a card, table or list has nothing to show. No search results, a load error, no access, being offline, a missing address and an expired sign-in use the same block with `kind`. Use Skeleton while loading. Use Banner for a notice that stays at the top of a screen (a deadline, a broken connection), and Toast for the result of an action such as saving.
## Anatomy
root (centered, vertical spacing `space.8`) · icon (circle 40, `bg.sunken` background, icon `fg.tertiary` 20; for error only the icon turns `status.danger.default`) · title (`type.body` 600 `fg.primary`, `type.label` at sm) · description (`type.caption` `fg.secondary`) · request (one request ID line, `type.caption` `fg.secondary` tabular; one press selects it all) · action (one Button).
## Props
Generated from the contract.
## Variants
size md · sm (circle 32, icon 16, half the padding). With `headingLevel` 1 or 2 it takes screen size (circle 48, title `type.h3`, description `type.body`, `space.12` above the actions). Seven kinds, each with a default icon and text.

| kind | Icon | Default title | Default description | Use |
|---|---|---|---|---|
| empty | inbox | Nothing to show | New items appear here | A list with no items yet |
| noResult | search | No items match | Change the search or filters | A search or filter returns nothing |
| error | circle-alert | Could not load the content | Try again in a moment | A load failed. Put a retry button in action |
| forbidden | lock | You do not have access | Ask your administrator for access | A screen or card the user may not see |
| offline | globe | You are offline | Try again once you are connected | While the connection is down |
| notFound | map-pin-off | There is no screen at this address | Check the address or find it again from home | No screen at the address (404). Block `platform/errors/not-found` |
| expired | timer-off | Your sign-in has expired | Sign in again to continue | The session ended. Block `platform/errors/expired` |

The text comes from `emptyState.<kind>.title · description` (ko · en) in contracts `_shared/messages.ts`. Error blocks in other components, such as the KpiCard error, use the same dictionary.
## States
default. An error is drawn with kind="error", not as a state.
## Behavior
The title is one sentence on what is missing, and the description is one sentence on the next action, for example `이번 달 전표가 없습니다` (there are no vouchers this month) and `전표 입력에서 추가하세요` (add one in voucher entry). When a search or filter returns nothing, use kind="noResult" with a sentence that asks the user to change the conditions. action holds one button only. Only errors that take a whole screen (the notFound, forbidden and expired full-screen blocks) have up to two: the main action and "Previous screen".

Without title, both the title and the description are the kind's defaults. With title, only the description you pass is shown (no default description is added under a title the app wrote). Without icon, the kind's default icon is used.

kind="error" is the block that stands in place of a list or card when loading failed. It says what went wrong and the next action, and action holds a "Try again" button. With `requestId`, a "Request ID req-8f2a" line appears under the description. Users copy this value to their administrator. DataGrid `error` uses this block. kind="forbidden" also takes a request ID (the administrator finds the denial in the audit log).

Full-screen errors: when there is no screen at the address (notFound), no access (forbidden) or the sign-in expired (expired), the screen blocks `platform/errors/*` center this block in the area. They pass `headingLevel={1}` so the title becomes the screen title.
## Accessibility
The title is a paragraph (`<p>`) and does not create a heading level. With `headingLevel` it is a heading of that level (`h1` to `h4`). Leave it out inside cards and tables. Only error blocks that take a whole screen pass 1. The icon is decorative (`aria-hidden`). Inside a table, put it in a row with a single cell that spans all columns. With kind="error" the root has `role="alert"`, so the title, description and request ID are read when it appears. Other kinds are not announced. An error is not shown by the icon color alone; the title says it in words.
## Density
md `space.32` top and bottom, sm `space.16` top and bottom. It does not depend on density.
## Platform differences
None.
## Avoid
Apologies (`죄송합니다`, we are sorry). Exclamation marks. Illustrated mascots. Two or more buttons (full-screen errors may have two). Decorative large numbers such as 404. A red background or left stripe on the error block (D-56 · D-57). Code review checks these.
## Stories
Default · Small · WithAction · Search · Kinds (seven kinds) · ErrorWithRequest · FullPage.
## References
content.md §5 (empty state and error copy). PR-30 (kind · requestId; absorbs the food ERP ErrorState). PG-44 (notFound · expired · headingLevel, full-screen error blocks).
