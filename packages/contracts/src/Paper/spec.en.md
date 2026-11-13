---
props:
  size: Paper size (paper.size.*)
  orientation: Portrait or landscape
  margin: Inner margin (paper.margin.*)
  density: compact shrinks table rows, cell padding and the signature area (forms with many cells)
  label: Accessible name of the page
  header: Top line (issue number, issuer)
  footer: Bottom line (verification, legal basis), at the bottom of the page
  children: Content of one page
  onOverflowChange: Called when the content grows taller than one sheet or fits again (an overflowing paper also gets data-overflow)
examples:
  EmploymentCertificate: Employment certificate — Field tables for the person, the company and employment, a confirmation sentence, then the date, company and seal. The top line holds the issue number and the bottom line the verification number.
  Payslip: Payslip — The earnings and deductions tables list item, amount and calculation method, and their total rows are the gross pay and total deductions. A pay statement has no signature area.
  TwoPages: Two-page document — An employment contract. Each page is one Paper, and printing puts each on its own sheet. The bottom of page 2 holds the employer and employee signatures.
  CompactForm: Form with many cells — density compact and margin sm. Fits a long table such as a business income withholding receipt on one sheet.
  DarkScreen: Dark screen — Even when the surrounding screen is dark, the paper stays white with black text through the paper tokens.
  SealImage: With and without a seal — A seal image is stamped over the `(인)` mark. Without an image only `(인)` remains.
  PrintButton: Print or save as PDF — The button sends only the paper to the print dialog. Saving as PDF there uses fileName as the file name. onOpen runs when the print dialog opens and onClose when it closes.
  Overflow: Paper taller than one sheet — When the content is taller than the paper, the preview draws a dashed line where sheet 1 ends and shows a note above. The app gets the same fact through onOverflowChange. Here it shows a button that switches to compact.
  LongTable: Table split across pages — paginateMoneyRows splits the rows per page. From page 2 a brought forward row comes first, every page but the last ends with a carried forward row, and the header row repeats on each page.
  AppTextSize: App text at 1.3× — When the app enlarges the type tokens for its text size mode, paper text stays the same because it uses the paper.type tokens. The paragraph above is app text and grows, and the printed page count does not change.
---
# Paper
## Purpose
Use it to preview A4 and A5 paper forms on screen and export them through browser printing (save as PDF): certificates of employment, career and retirement, payslips, employment contracts, withholding receipts, tax invoices, quotes and purchase orders. The paper is white with black text whatever the app theme. For groups of information on a screen use Card or DescriptionList, and for tables on a screen use DataGrid (do not use Paper outside paper forms).
## Anatomy
One Paper = header (top line, `paper.muted` `paper.type.caption`, spread to both ends) · body (stacks the parts, `space.16` between) · footer (bottom line at the very bottom of the page, 1px `paper.line` above). The paper uses `paper.bg` · `paper.fg` · `paper.shadow` (screen only), size `paper.size.*`, inner margin `paper.margin.*` and text `paper.type.body`. All text uses `paper.type.*` (pt), never the app's `type.*`. Parts and helpers from the same entry:

| Part | Props | Look and tokens |
| --- | --- | --- |
| `PaperTitle` | `children` title · `subtitle?` one line below | h1, centered, `paper.type.display` 700, letter spacing `space.8`. subtitle in `paper.muted` |
| `PaperFields` | `rows: { label, value, full?, blank? }[]` · `columns?: 4 \| 2` (default 4) · `title?` · `note?` | label \| value \| label \| value table (4 columns pair two fields per row, `full` takes the whole row). Label cells `paper.fill` 600, an empty value shows –. A `blank` row stays empty (dates and signatures written by hand after printing) |
| `PaperMoneyTable` | `columns: { header, width?, align? }[]` · `rows: cell[][]` · `total?: cell[]` · `carryIn?: cell[]` · `carryOut?: cell[]` · `title?` · `note?` | Column widths through colgroup (`xs` · `sm` · `md` · `lg` · `xl` · `auto`, the same names as DataGrid). number cells use `formatAmount`, right aligned and tabular. The total row is 700 with 2px `paper.lineStrong` above, and its first cell is the row header. carryIn is the first body row (600, 2px `paper.lineStrong` below) and carryOut takes the total row position |
| `PaperText` | `variant?: 'body' \| 'statement' \| 'note'` · `children` | statement = centered confirmation sentence (`paper.type.h3`), note = small note (`paper.muted` `paper.type.caption`) |
| `PaperSignature` | `company` · `representative` · `role?` (default from the catalog, `대표이사`) · `date?` · `seal?` | Date (`paper.type.h3`) above company, title, name (`paper.type.h2` 700) and seal. Sits toward the bottom of the page |
| `PaperSignPair` | `left` · `right`: `{ title, rows }` · `date?` | Two columns (employer and employee), each a title and a two-column field table. The date is centered above. Sits toward the bottom of the page |
| `PaperSeal` | `name` · `src?` | With an image, a `space.40` × 2 square where the image is stamped over `(인)`. Without one, `(인)` follows the name as text |
| `PaperPreview` | `children` (one or more Papers) · `label?` | On-screen preview. Background `bg.sunken` · `radius.md` · padding `space.16` (`space.8` on phones), `space.16` between pages. The overflow note sits above the paper in unscaled app text (`type.caption` `fg.primary`, icon `circle-alert` in `status.danger.default`) |
| `printPapers(content, { fileName?, locale?, onOpen?, onClose? })` · `usePrintPapers()` | content = Paper elements or a DOM element on screen | Print helper (see Behavior) |
| `paginateMoneyRows(rows, { first, rest?, sum })` | Pure function in contracts | Splits a long money table per page and builds the carry rows (see Behavior) |

Tables (PaperFields · PaperMoneyTable) have a 2px `paper.lineStrong` outer border, 1px `paper.line` inner lines, `space.4` × 1.5 · `space.12` cell padding (33px rows) and `paper.fill` header cells. Korean text wraps between words (`word-break: keep-all`). Group titles are h2 `paper.type.h3` 600, and the note sits above the table in `paper.muted` `paper.type.caption`.

Overflow marks (inside PaperPreview only): a 1px dashed `status.danger.default` line where sheet 1 ends (the `paper.size.*` height from the top of the paper), with `End of sheet 1` (`paper.type.caption` 600 on `paper.bg`) above the line in the right margin. They are screen marks, not paper content, so they use a status color and never print.
## Props
Generated from the contract.
## Variants
size a4 · a5 × orientation portrait · landscape × margin md · sm × density regular · compact. Colors are the same in every combination (`paper.*`).

| Prop | Values | What changes |
| --- | --- | --- |
| size | a4 · a5 | Width and minimum height `paper.size.a4.*` · `paper.size.a5.*` |
| orientation | portrait · landscape | Landscape swaps width and height |
| margin | md · sm | Inner margin `paper.margin.md` (18mm) · `paper.margin.sm` (12mm) |
| density | regular · compact | See Density below |
## States
default only. Paper is a document, so hover, active, focus, disabled, loading and error do not apply (there is nothing to press or pick). Overflow is not a state. It is reported through the `data-overflow` attribute and `onOverflowChange`.
## Behavior
- One page = one Paper. Its minimum height is one sheet. When content is taller, the paper grows and printing continues on the next sheet. Split a form into pages yourself (a Paper for page 1 and page 2).
- Overflow detection: Paper compares its own height with the height of one sheet (its minimum height). More than 1px taller counts as overflow (rounding does not). It measures once after the first render, and again through ResizeObserver when content, fonts or images change the height.
  - An overflowing paper gets the `data-overflow` attribute. `onOverflowChange(overflow)` is called when the value changes. If the first measurement overflows it is called once then, and a paper that fits from the start never calls it.
  - Where it cannot measure (jsdom, server rendering, the print root hidden on screen) the value stays as it is. Screen and print render fonts slightly differently, so content right at the edge can be judged differently.
  - Inside PaperPreview, an overflowing paper draws the end of sheet line and the preview shows one line per page above the paper from the catalog key `paper.overflow` (`근로계약서 2쪽의 내용이 종이 한 장을 넘습니다. 인쇄하면 다음 장으로 이어집니다.`). The note is unscaled app text, so it stays readable on phones.
- Splitting a long money table with `paginateMoneyRows(rows, { first, rest?, sum })` (contracts):
  - The first page takes first rows and each later page takes rest rows (default first). Each returned page is `{ page, pages, rows, carryIn?, carryOut? }`.
  - carryIn is the running total of the previous pages (from page 2) and carryOut the running total through that page (every page but the last). Only the columns listed in sum are added. Column 0 (the label column) and cells that are not numbers are skipped. Decimals are cut at the number of places that came in.
  - Render one Paper per page with a PaperMoneyTable using the same columns, and pass carryIn and carryOut as they are. The header row repeats on each page, and the last page holds the app's total. A null first cell in carryIn or carryOut shows the catalog text `paper.carryIn` (`앞 쪽 이월`) or `paper.carryOut` (`다음 쪽 이월`).
  - The app decides how many rows fit on a page. The helper does not measure row heights to split automatically. The result is deterministic, so print, server rendering and tests get the same pages, and overflow detection reports a page whose cells wrap to two lines.
- PaperSignature and PaperSignPair sit toward the bottom of the body (they take the free space above them). The footer is at the very bottom of the page.
- A `date` in 'YYYY-MM-DD' becomes `2026년 11월 9일` through the catalog key `paper.date`. Other text shows as is.
- PaperPreview scales the pages down to the parent width, keeping the ratio (at most 1×). It measures again with ResizeObserver when the parent width or the content size changes, and takes only the scaled size, so nothing overflows horizontally. Where it cannot measure (jsdom, before the first paint) it keeps the original size and the outer box clips.
- Printing with `printPapers(content, { fileName, onOpen, onClose })` (call it from an event handler). It uses no iframe and calls `window.print()` on the current window:
  1. Appends `.tl-print-root` (data-theme light) to the end of body. A React element is rendered inside it (locale from the option; `usePrintPapers` passes the current Provider value). A DOM element is searched and only its `.tl-paper` elements are copied, without the overflow marks.
  2. Adds `@page { size: A4 portrait; margin: 0 }` from the first paper's size and orientation. Each paper also gets a named @page (`tl-paper-a4` · `tl-paper-a5-landscape` …), so a set with mixed sizes still matches page by page.
  3. Waits until fonts (`document.fonts.ready`) and images (seals) are ready, for at most 10 seconds.
  4. Sets `document.title` to fileName (a trailing .pdf is removed). Browsers use it as the PDF file name.
  5. Calls `window.print()`. Print CSS hides everything outside `.tl-print-root`, uses zero page margins, breaks the page after each paper (`break-after: page`), drops the shadow and sets `print-color-adjust: exact`. When the print dialog opens (`beforeprint`) it calls `onOpen` once. Browsers that never send beforeprint get it right after print() is called.
  6. On `afterprint` it restores the title, removes the root and then calls `onClose` once. Browsers that never send afterprint are cleaned up after 60 seconds. onClose only follows an onOpen, and the browser does not say whether the user printed or cancelled. The returned Promise resolves when cleanup is done.
  7. Calling it again before then cleans up the previous one first. If the previous one was still waiting for fonts or seals, it never opens the dialog (no onOpen or onClose) and its Promise resolves at once. If rendering the paper throws, the root is removed and the Promise rejects with that error.
- Printing the app screen normally, without `.tl-print-root`, changes nothing (the hiding rules only apply under `:has(.tl-print-root)`).
## Accessibility
- Paper renders `<article aria-label={label}>` (a page name such as `근로계약서 2쪽`). header and footer are `<header>` and `<footer>` (inside article they are not landmarks).
- PaperTitle is h1 and group titles are h2. Tables are `<table>`, linked to their title through `aria-labelledby` and to the note through `aria-describedby`. PaperFields has two label cells per row, so each value cell points to its own label cell with `headers`. PaperMoneyTable headers are `th scope="col"` and the first cell of the total and carry rows is `th scope="row"`.
- The seal image's alternative text comes from the catalog key `paper.sealAlt` (`<company> 직인`). With an image, the `(인)` mark underneath is `aria-hidden`.
- PaperPreview is `role="group"` with `label` (default `서식 미리보기`) and `tabIndex=0`. When a long preview sits in a dialog or drawer, focus the preview and scroll the surrounding area with the arrow keys (focus ring `tl-focusable`). Scaled-down paper is read with screen zoom, and print or PDF gives the full size.
- The overflow note lives in a `role="status"` region that is always present, so it is announced when overflow appears or goes away. While a note shows, it is the preview group's `aria-describedby`. The end of sheet line and text on the paper repeat the same fact, so they are `aria-hidden`.
- Contrast: `paper.fg` / `paper.bg` 21:1, `paper.muted` / `paper.bg` 6.33:1, `paper.muted` / `paper.fill` 5.11:1, cell lines `paper.line` 3.21:1 (graphics, 3:1). Text contrast inside the paper stays the same when the app is dark. Trellis components placed inside a paper use light tokens through Paper's `data-theme="light"`. Overflow marks: end of sheet text and line `status.danger.default` / `paper.bg` 5.35:1, note text `fg.primary` / `bg.sunken` 11.90:1 (dark 16.77:1), icon `status.danger.default` / `bg.sunken` 4.31:1 (dark 6.53:1, graphics 3:1).
- Paper itself has nothing to press and no motion (reduced motion does not apply).
## Density
App density (compact · comfortable · touch) and the app's text size mode do not reach the paper. Text uses `paper.type.*` (pt) and spacing uses fixed `space.*`. When an app overrides `type.*` to enlarge text, paper text and the printed page count stay the same (R-35). On phones the paper looks the same, only scaled down. The paper's own `density` steps text down by one size:

| Dimension | regular | compact |
| --- | --- | --- |
| Body text | `paper.type.body` (10.5pt, 14/20px) | `paper.type.label` (9.75pt, 13/18px) |
| Table cell padding | `space.4` × 1.5 · `space.12` (33px rows) | `space.4` · `space.8` (27px rows) |
| Between parts | `space.16` | `space.12` |
| Title | `paper.type.display`, letter spacing `space.8` | `paper.type.h1`, letter spacing `space.4` |
| Group title · confirmation sentence · signature date | `paper.type.h3` | `paper.type.body` |
| Signature line | `paper.type.h2` | `paper.type.h3` |
| Space above signature · seal image | `space.24` · `space.40` × 2 | `space.8` · `space.64` |

`data-density="compact"` also applies compact density tokens to Trellis components placed inside.
## Platform differences
Web only (`platforms.native = false`). Native comes in the next phase: a paper preview (scaled down) and PDF export (print and share) under the same part names, and native turns on then. The tokens are already in the native output (`paper`, mm × 96 / 25.4 and pt × 96 / 72 as numbers). `paginateMoneyRows` is a pure function in contracts, so native uses it as is.
## Avoid
- Coloring or sizing inside the paper with theme colors (`--tl-color-*`), density tokens or app type tokens (`--tl-type-*`) → review (paper uses `--tl-paper-*` only; the overflow marks are screen marks and use a status color)
- Overriding `--tl-paper-type-*` in the app's text size mode → review (the printed page count changes; paper text changes only through approved token values)
- Writing mm, pt or px values in app code → `trellis/no-px` · stylelint (sizes, margins and text come from `paper.size.*` · `paper.margin.*` · `paper.type.*`)
- Wrapping paper in `data-theme="light"` to borrow light colors → review (Paper is already theme independent)
- Emphasis with thick colored left rails, colored badges or tinted banners → review (D-57, paper looks like a document)
- Building on-screen information groups or tables with Paper → review (Card · DescriptionList · DataGrid)
- Making a separate print screen or changing the app-wide `@page` → review (printPapers prints only the print root)
- Passing amounts as preformatted text → review (pass a number and the table applies `formatAmount` and right alignment)
- Putting a table longer than one sheet in a single Paper and leaving the page break to the browser → review (no repeated header or carry rows; split with `paginateMoneyRows` into one Paper per page)
- Adding up carried amounts in the app and passing them as text → review (pass carryIn and carryOut from `paginateMoneyRows` as they are)
## Stories
EmploymentCertificate · Payslip · TwoPages · CompactForm · DarkScreen · SealImage · PrintButton · Overflow · LongTable · AppTextSize. Generated: Matrix (size a4 · a5, VRT target; the a5 cell shows the overflow marks because the employment certificate is taller than one A5 sheet).
## References
Service requests R-32 (preview and PDF of nine HR documents) and R-35 (paper type tokens, print dialog callbacks, overflow detection, splitting long tables), block tax invoice issue (`erp/tax/invoice-issue`) preview. Tokens in docs/spec/tokens.md §9, decision D-77 (values pending approval). Forms from the National Tax Service and the Ministry of Employment and Labor were used for cell layout only.
