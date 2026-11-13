---
props:
  title: Title
  subtitle: Unit or period
  action: Top-right action
  footer: Bottom area
  padding: Inner padding
  emphasis: Weight (strong once per screen, quiet for reference)
  tone: Status icon before the title (surface color stays)
  headingLevel: Heading level (context when missing: h2 on the page, h3 inside a card)
  landmark: Make it a region landmark (section)
  children: Content
examples:
  Emphasis: Three weights — strong only for the one "do this now" area, a regular card, and quiet for reference (no border or surface).
  Default: Default — Title, period, top-right action and a total at the bottom.
  NoBody: Card without a body — With no content the footer sits right under the title, and extra height in a grid stays below the card.
---
# Card
## Purpose
Use it to group one block of content on a screen (a list, a table or a summary). Use KpiCard for a single number and ChartCard for a chart.
## Anatomy
root (`bg.surface`, `border.divider`, `radius.lg`) · head (tone icon 16 · title `type.h3` · subtitle `type.caption` fg.tertiary · action) · body (`density.card-padding`) · footer (divider above).
## Props
Generated from the contract.
## Variants
padding default · none. emphasis has three levels (PR-38, where to look first on a screen):

| emphasis | Look | Use |
| --- | --- | --- |
| strong | `border.strong` border + `type.h2` title | The one "do this now" area. One per screen |
| default | `border.divider` border + `type.h3` title | Every other card |
| quiet | No border or surface (the page background), same inner padding | Reference information and secondary lists. Use it instead of a card inside a card |

Weight never comes from shadows, tinted surfaces or a colored left stripe (shadows disappear in dark mode, tints and stripes read as decoration). tone (info · success · warning · danger · neutral) only adds a status icon before the title (the Banner icon, in the tone color); the surface and border keep their colors. The title text carries the meaning ("2 overdue"). It is meant to go with strong.
## States
default.
## Behavior
When there is a title, it names the region through `aria-labelledby`. The heading level comes from headingLevel (2, 3 or 4), or from context: a card directly on the page is h2 (after the PageHeader h1) and a card inside a card is one level lower. By default a card is not a landmark (a div); with landmark it is a section and a region named by its title. Several cards with the same title (one per company) would otherwise make landmarks with the same name (R-33). The head and foot are divs, not header and footer elements, so they never become banner or contentinfo outside main. When children are empty the body is not drawn: the footer sits right under the title and extra height in a grid stays below the card. With a body, the footer sits at the bottom so footers line up across a row.
## Accessibility
With landmark it renders `<section>` linked to its title. The tone icon is decorative (aria-hidden), so the title text states the status.
## Density
Inner padding `density.card-padding` (12 · 16).
## Platform differences
None.
## Avoid
A card inside a card (use quiet). Emphasis with shadows (use a border in dark mode). Two strong cards on one screen, or more than three weights (KpiCard and ChartCard stay within the three). Tinted surfaces or a colored left stripe.
## Stories
Emphasis (VRT) · Default · NoBody.
## References
None.
