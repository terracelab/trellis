# Screen patterns

Each screen type has a set combination. Start a new screen by copying the matching screen block (`pnpm ds:add --list`, [Starting a service](service.md)). If no block fits, assemble the screen by the composition below. `Page` · `Grid` · `Col` · `Stack` · `Split` from `@terracelab/trellis-blocks/ui` handle the screen layout.

| Pattern | Code name | Composition | Rules | Example block |
| --- | --- | --- | --- | --- |
| Notification card home | `NotificationHome` | AppShell + Grid (12 columns) + NotificationCard + KpiCard | Card widths of 4 · 6 · 12 columns only, count badge at top right, pressing a card navigates | `home/dashboard/trade` |
| List · detail | `ListDetail` | FilterBar + DataGrid + Pagination + Drawer (Split on wide screens) | Filters on one line, the table takes all remaining height, no Drawer inside a Drawer | `erp/tax/invoice-list` |
| Form · registration | `FormRegister` | FormSection (2 columns) + Field + ActionBar fixed at the bottom | One FormSection per group, required fields marked with a dot, save at bottom right and cancel to its left | `erp/purchasing/po-form` |
| Approval | `ApprovalFlow` | ApprovalLine + body + Attachment + approve · reject · withdraw | Status only through the approval badge, reasons for rejecting or withdrawing in a ReasonDialog, approval line as horizontal steps | `groupware/approval/document` |
| Conversational work | `ConversationalWork` | MessageThread + Composer + result cards + CommandPalette | Answers as card components, data changes only after ProposalCard approval, input fixed at the bottom | `platform/assistant/chat` |

Error screens use the block pattern `ErrorPage`. They are built from EmptyState (`notFound` · `forbidden`) and buttons and stay out of the menu (blocks `platform/errors/not-found` · `platform/errors/forbidden`). The expired-session screen passes the screen in view to sign-in with `?next=`.

A pattern name names a screen type. It is not a component. Every pattern works at phone width: lists become cards, details open in a bottom sheet and forms use one column.

## Screens with numbers

Stack dashboard and statistics blocks in the order **number → trend → composition → comparison → table (action)**. For each block, pick the form from the table in [Choosing a chart](charts.md). Users end up acting in the table. If bars (DataBar) or shading (HeatCell) in the table cells make the data readable, do not draw a separate chart. Parts, states and phone rules are in [Building dashboards](dashboards.md), and agent conversations are in [Building agent conversation screens](conversation.md).

## Modules

The business modules (ERP · groupware · ECM · CRM · distribution · e-commerce · manufacturing) are registered in `@terracelab/trellis-tokens/modules`. The sidebar, launcher and notification cards take labels and icons from this list. Module tile illustrations come from `@terracelab/trellis-icons/module-tiles`.

```ts
import { moduleTileSprite, moduleTileByModule } from '@terracelab/trellis-icons/module-tiles';
// Put the sprite in the document once, then
// <svg aria-hidden="true"><use href={`#tl-tile-${moduleTileByModule.approval}`} /></svg>
```
