---
props:
  sources: Sources (number, document name, page, address)
  layout: Shape (list under an answer, number inside the text)
  onOpen: Called when a source is opened
  label: List name (Sources by default)
examples:
  List: Source list — Number, document name and page sit as chips under an answer. A source with an address opens in a new window.
  Inline: Number in the text — A small number sits at the end of a sentence. Hover or focus shows the document name.
  OpenInApp: Open in the app — With onOpen the app opens a document view instead of a new window.
---
# Citation
## Purpose
Use it to show and open the documents an answer relied on, with a number, document name and page. It has two shapes: a source list under an answer (list) and a number inside the text (inline). Use Attachment to download attached files and a link in the text (RichText) to move between documents.
## Anatomy
list: root (`tl-citation`, `data-layout="list"`) · label (list name "Sources", `type.caption` 500 `fg.secondary`) · list (`ol`, wrapping row, `space.6` × `space.8` gaps) · chip (`bg.surface`, full 1px `border.default`, `radius.md`, `density.control-height-sm` high, `type.caption`) · index (number box `bg.sunken` · `fg.secondary` 600 tabular · `radius.xs`) · title (document name, truncated when long) · location (page or section, `fg.secondary`) · external (new window icon `fg.tertiary`, only with href).
inline: root (`span`, `data-layout="inline"`, aligned to the top of the text line) · marker (16 number box, `type.micro` 600 · `bg.sunken` · `fg.secondary` · `radius.xs`) and a Tooltip (document name and page).
## Props
Generated from the contract.
## Variants
layout list or inline. Color stays neutral (a source is not a status).

| layout | Shape | Where |
|---|---|---|
| list | Number, document name and page chips in a wrapping row | Under an answer · evidence area of ProposalCard |
| inline | Small number box at the end of a sentence | Inside answer text (RichText turns `[1]` into it) |
## States
default · hover (chip `border.strong` and `bg.sunken`, number `brand.subtle` and `fg.primary`) · focus (focus ring). A source without a way to open it (href or onOpen) is plain text with no states. active, disabled, loading and error do not apply.
## Behavior
- Numbers: `index` when given, otherwise the list position (from 1, contracts `citationIndex`). The `[n]` in the text and the list number must match, so give an index to a filtered list.
- Opening: with `onOpen` the app opens it (an href stays as a link, so the middle button and new tabs still work). With only an href it is a new window link (`rel="noopener noreferrer"`), and with neither it is text that cannot be pressed.
- inline: hover or focus shows a Tooltip with the document name and page.

| Key | Action |
| --- | --- |
| Tab | Chips and numbers in order |
| Enter | Opens (link or button) |
| Space | Opens (button with only onOpen) |
## Accessibility
The list is an `ol` with a list name (label, `aria-labelledby`), so it reads as "Sources, list of 3". The chip text (number, document name, page) is the link or button name. An inline number shows a single digit, so its accessible name is "Source 1 · 2026 work rules · article 32" (hidden text when it cannot be pressed). The new window icon is decorative. Text contrast of `fg.secondary` and `fg.primary` on `bg.sunken` and `bg.surface` is above 4.5:1, and the focus ring always shows.
## Density
Chip height is `density.control-height-sm` (44 under touch). Text size and the number box do not depend on density.
## Platform differences
Native draws chips as a row of Pressables and opens links in the OS browser. Instead of the Tooltip on an inline number, pressing it opens a sheet with the document name. Props are the same.
## Avoid
Coloring sources with status colors, a left color stripe on chips (D-57), a document name without a number, and a list whose numbers differ from the numbers in the text. Code review checks these.
## Stories
List · Inline · OpenInApp.
## References
patterns/ConversationalWork, RichText (`citations`), MessageThread (answer), ProposalCard.
