---
props:
  title: Section title
  count: Count (muted text after the title)
  countLabel: Count text (when the unit is not items)
  description: Description under the title
  action: Action on the right
  headingLevel: Heading level (context when missing, h2 on the page)
  children: Content below (cards inside get a heading one level down)
examples:
  Default: Above a group of cards — Section title, count, description and one action. Wrapping the group moves the card titles inside one level down (h3).
  Plain: Title only — A short header above a table. Use countLabel when the unit is not items.
---
# SectionHeader
## Purpose
Use it to put a section title above a group of cards or a table (deadlines this month, members, reference material). The screen name is PageHeader and the title of one card is Card title. Every section title outside a card uses this one component, instead of each app building its own small label or medium heading.
## Anatomy
root (grid, `space.12` gap) · head (flex, aligned to the bottom) · title (`type.h2` `fg.strong`) · count (`space.8` after the title, `fg.tertiary` 500, tabular. Text, not a pill or badge) · description (`type.label` `fg.secondary`) · action (on the right, one button) · body (when there are children).
## Props
Generated from the contract.
## Variants
With or without children (wrapping a group, or a title only). count (a number shown as "12건", 12 items) · countLabel (when the unit is not items, "8명", 8 people).
## States
default.
## Behavior
With children it wraps that group and moves the heading level of the cards inside one step down (SectionHeader h2 → Card h3). The heading level comes from headingLevel (2, 3 or 4), or from context (h2 directly on the page). The size is `type.h2` whatever the level (screen h1 28 > section title > card title `type.h3`).
## Accessibility
The title is a heading element (h2 by default). The count is text inside the heading, so it is read together ("이번 달 기한 12건", 12 deadlines this month). It makes no landmark, so sections with the same name never collide.
## Density
The same in every density. `space.12` between the head and the content.
## Platform differences
None.
## Avoid
Mixing section titles as large titles inside a Card, small labels outside cards or colored text. A count as a pill or colored badge. More than one action (send "more" to a screen). A colored bar before the title.
## Stories
Default (VRT) · Plain.
## References
Service review R-43 item 7 (section titles in three different styles), PR-38. Guidance for screens with little content is in platform.md §7.3.
