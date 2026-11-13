---
props:
  text: A subset of markdown (headings, lists, tables, code, links, bold)
  streaming: Still being written (caret at the end and aria-busy)
  citations: Sources that the `[1]` marks in the text point to
  onCitationOpen: Called when a source mark is pressed
  onLinkPress: Called when a link is pressed (new window when not set)
  headingLevel: Level of the highest heading
examples:
  List: List — The highest heading becomes h3, and indented lines become a nested list.
  Table: Table — Number columns are right aligned with tabular digits. The unit is written once above the table.
  Code: Code — Inline code and code blocks use a monospace font, and a wide block scrolls sideways inside its box.
  Links: Links — http(s) opens a new window and app paths open in the same window. Addresses in the text become links too.
  Streaming: Streaming — A caret shows at the end and the root is aria-busy. An unclosed code block shows as plain text.
  Citations: Source marks — `[1]` in the text becomes a source number. Pressing it opens the source document.
---
# RichText
## Purpose
Use it to show formatted text, such as an agent answer, drawn from a subset of markdown (headings, lists, tables, code, links, bold). It is the body of a MessageThread answer (`kind: 'answer'`). Use the MessageThread bubble for plain messages from people, DataGrid for tables of input values, and the document editor block for editing formatted documents.
## Anatomy
root (`tl-rich-text`, `space.8` between blocks) · heading (the highest heading in the text uses `type.h4`, lower ones use body size at 600, `fg.strong`) · paragraph (line breaks kept) · list (`ol` · `ul`, `space.20` indent, `fg.secondary` markers) · table (sideways scroll box + `table`: head `bg.sunken` · `fg.secondary` · `type.label` 600, 1px `border.divider` between rows, number columns right aligned and tabular) · code (inline `bg.sunken` · `font.family.mono` · `type.mono`) · pre (code block `bg.sunken` · `radius.md` · sideways scroll) · link (`fg.link`, underlined) · cite (`[1]` in the text becomes Citation inline) · rule (1px `border.divider`) · caret (streaming caret, 2px `fg.secondary` bar).
## Props
Generated from the contract.
## Variants
There is no variant prop. The look comes from the block type (heading, paragraph, list, table, code, rule) and `headingLevel` (2, 3 or 4).

| Block | Syntax | Renders |
|---|---|---|
| Heading | `#` to `######` and a space | `h{headingLevel + relative level − 1}` (h6 at most) |
| List | `-` · `*` · `+` · `1.` · `1)` | `ul` · `ol` (keeps the first number), lines indented 2 or more spaces make a nested list |
| Table | GFM pipe table (header row and delimiter row) | Alignment from `:---` · `:---:` · `---:`, number columns without one are right aligned |
| Code block | ```` ``` ```` · `~~~` (language name optional) | `pre > code`, the text inside is not parsed |
| Inline | `**bold**` · `` `code` `` · `[text](https://…)` · http(s) addresses · `[1]` · `[^1]` | `strong` · `code` · `a` · Citation |
| Rule | `---` · `***` | `hr` |
## States
default · loading (`streaming`: caret at the end, root `aria-busy="true"` and `data-state="loading"`). Links, source marks and scroll boxes inside carry hover and focus. active, disabled and error do not apply (MessageThread reports a failed answer in text).
## Behavior
- Parsing: the contracts function `parseRichText(text)` builds a block tree, and the component draws only React elements. No HTML string goes in (no `dangerouslySetInnerHTML`). Web and native use the same parser.
- Streaming: the same text always gives the same result, so earlier blocks do not change as text arrives. An unclosed code block shows as plain text from that line to the end, and an unclosed `**`, backtick or `[text](` stays as typed. A table without a full delimiter row is a paragraph. Formatting applies once the closing text arrives.
- Paragraphs: a single newline is a line break (`br`), as in chat answers. A list marker ends a paragraph even without a blank line. More than three digits and a dot (2026.) is not a numbered list.
- Heading levels: the highest heading in the text maps to `headingLevel` (default 3), not the number of `#`. An answer that only uses `###` still starts at h3.
- Table numbers: a column whose body cells, apart from empty cells and `–`, are all numbers (sign, commas, decimals, short units such as `원`, %, %p, `건`, EA) is right aligned with tabular digits. The format is not changed (the writer of the answer uses `formatAmount`). The unit goes once in the sentence above the table.
- Links: only http, https, mailto, tel and app paths (`/` · `#`) become links (`safeHref`). Others such as `javascript:` keep only their text. http(s) opens a new window (`rel="noopener noreferrer"`) and app paths open in the same window. With `onLinkPress` the app opens every link (modifier keys and the middle button stay with the browser).
- Sources: with `citations`, `[n]` in the text becomes the Citation inline mark of source n. A number without a source stays as the text `[n]`. Pressing it calls `onCitationOpen(source)`, or opens the source href when that is not set.

| Key | Action |
| --- | --- |
| Tab | Links, source marks, tables and code blocks (sideways scroll boxes) in order |
| ArrowLeft · ArrowRight | Scrolls sideways when a table or code block has focus |
## Accessibility
Headings, lists and tables are real `h*`, `ol`, `ul` and `table` (`th scope="col"`) elements, so assistive technology reads the structure. Wide tables and code blocks have `tabindex="0"` so the keyboard can scroll them, and the table box is `role="group"` named "Table". While streaming the root is `aria-busy` so reading waits while text arrives, and hidden text "Writing the answer" is there before any text. The caret is decorative (aria-hidden). Link color `fg.link` and body `fg.primary` are above 4.5:1, and links are also underlined. The caret stops blinking under reduced motion (the bar stays).
## Density
Text uses `density.body-font-size` and `density.body-line-height`, table cells use `space.4` × `space.12` padding. `space.8` between blocks and `space.16` before headings do not depend on density.
## Platform differences
Native draws the same `parseRichText` result with Text and View (tables in a horizontal ScrollView, links through the OS browser or onLinkPress). Props are the same.
## Avoid
Passing HTML strings (`dangerouslySetInnerHTML`), linking addresses that are not safe to open, centering number columns, repeating the unit in every cell, guessing formatting for unclosed syntax while streaming, and left-stripe quotes (D-57). Code review checks these.
## Stories
List · Table · Code · Links · Streaming · Citations.
## References
patterns/ConversationalWork, MessageThread (answer), Citation. The parser has no dependency and lives in contracts `_shared/richtext.ts` (PG-30 decision, proposed for decisions.md §2).
