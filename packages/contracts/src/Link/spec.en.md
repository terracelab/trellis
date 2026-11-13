---
props:
  href: Address (in-app addresses go through TrellisProvider navigate, outside addresses open in a new tab)
  children: Link text
  external: Outside address that opens in a new tab. Without it, http(s) addresses count as outside
  variant: Color (`default` is the link color, `subtle` is the secondary text color, `plain` is the body text color for links inside tables and lists)
  underline: Underline (`hover` on hover, `always` always, for links inside a sentence)
  disabled: A link that cannot be followed (no address)
  onPress: Press handler (runs before navigation)
examples:
  Basic: In-app link — Link-colored text with an underline on hover. With a router it opens without a page reload.
  External: Outside link — http(s) addresses open in a new tab with an outside icon at the end. Screen readers hear "opens in a new tab".
  Variants: Inside a sentence, less important links and lists — Links inside a sentence are always underlined, sources or document names use `subtle`, and names in lists and tables use `plain` (body text color).
  InTable: Table cells and people — Goes into DataGrid render cells and next to PersonLabel as is. A link in a table cell takes the body text color (plain) on its own. Pressing the link does not trigger the row press.
  Router: Router connection — With TrellisProvider `navigate`, Link and PersonLabel href move through that function. Ctrl or Cmd clicks still open a new tab.
---
# Link
## Purpose
Use it to show a text link to another screen, document or outside site (an order number, approval settings, a source document). In-app addresses open through TrellisProvider `navigate` without a page reload (R-T34). For actions on the screen (save, open, delete) use Button. For a table where the whole row is pressable use DataGrid `onRowPress` with the column `link`. For people use PersonLabel `href`.
## Anatomy
root (`a`, `tl-link`, `data-tl-link`) · text (follows the surrounding font size, `font.weight.500`) · outside icon (`external-link` 16, decorative) · hidden text ("opens in a new tab", outside links only). Color is `fg.link` (default), `fg.secondary` (subtle), `fg.primary` (plain) or `fg.disabled` (disabled). The underline uses the text color at `border.width.1` with an offset of `border.width.3`.
## Props
Generated from the contract.
## Variants
3 variants × 2 underline modes.

| variant | At rest | hover | Where |
|---|---|---|---|
| default | `fg.link` | underline | numbers, screen names, document names |
| subtle | `fg.secondary` | `fg.primary` and underline | sources, less important links |
| plain | `fg.primary` 500 | underline (also on keyboard focus) | name links in table cells and lists |

plain (D-146 proposal): the link color `fg.link` is the company color, and the default orange (brand.600) sits ΔE 4.7 from the danger red (red.600). In tables and lists a name next to a danger badge read like an error, so links there use the body text color. The whole cell or row is the link and no non-link text surrounds it, so it is told apart without color (WCAG 1.4.1). Use plain only when the whole text of the cell or row is the link. When ordinary text follows the link on the same line, use default. A badge or a date, which look different, may sit next to it. Hover or keyboard focus adds the underline. A default link inside a DataGrid cell or a DescriptionList takes the plain look without setting the variant. Links inside a sentence stay default with `always`.

underline `hover` (default) underlines on hover, for places where a link is expected (table cells, lists). `always` keeps the underline, because a link inside a sentence must not rely on color alone (WCAG 1.4.1). With TrellisProvider `linkUnderline` (`data-links="underline"`), every link is always underlined.
## States
default · hover (underline, subtle text turns `fg.primary`, `duration.fast`) · active (underline at `border.width.2`) · focus (focus ring `border.focus` 2px, corner `radius.xs`) · disabled (no address, `fg.disabled`, `aria-disabled`). loading and error do not apply.
## Behavior
A press calls `onPress` first and then navigates. For an in-app address (no scheme and not `#id`, contracts `isAppHref`) with TrellisProvider `navigate` set, the default `a` navigation is prevented and `navigate(href)` is called. Ctrl, Cmd, Shift, Alt or middle clicks mean a new tab or window, so they are left to the browser. Without `navigate`, it stays a plain `a` element (the same without a provider and on Django screens).

Outside addresses (`external`, or by default addresses starting with http(s) or `//`, contracts `isExternalHref`) open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`, and an outside icon follows the text. `mailto:` and `tel:` are left to the browser without the outside mark.

| Key | Action |
|---|---|
| Tab | Moves focus to the link |
| Enter | Navigates (same as a press) |

In tables, DataGrid does not trigger the row press from presses on `a` or `button`, so a Link goes into a cell of a grid with `onRowPress` as is. This is different from the column `link` (body-colored 500 text that hints the row opens a detail). A Link in a cell goes to its own address.
## Accessibility
The link is named by its text. An outside link adds the hidden text "opens in a new tab" at the end of its name (the icon is decorative). A link that cannot be followed has `role="link"` and `aria-disabled="true"`, and with no address it takes no focus (its name is still read). Contrast of `fg.link` and `fg.secondary` is above 4.5:1 on surfaces (the company color engine tunes `fg.link`). The focus ring is `.tl-focusable`. The only motion is the color and underline transition, which drops to zero with reduced motion.
## Density
Sizes do not depend on density. The font size follows the surrounding text.
## Platform differences
Native uses Pressable and Text, in-app addresses use navigate (injected router), and outside addresses use `Linking.openURL`. Props are the same.
## Avoid
Link for actions on the screen such as save or delete (use Button). Styling a link to look like a button. underline `hover` on links inside a sentence (color alone). Unnamed links such as "here". Outside links in the same tab. Drawing an `a` element directly and bypassing the router. Code review checks these.
## Stories
Basic · External · Variants · InTable · Router.
## References
R-T34 (PersonLabel href reloaded the whole page under a router), TrellisProvider `navigate`, PersonLabel, DataGrid (column `link`, render), `_internal/a11y-modes.css` (`data-links`). Benchmarks for structure only.
