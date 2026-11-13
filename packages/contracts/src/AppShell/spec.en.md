---
props:
  brand: Product name and logo
  brandCollapsed: Short logo or name at the top of the collapsed sidebar
  scope: Scope switcher (company, branch), right of the brand
  sidebar: Sidebar
  search: Global search
  actions: Icon actions on the right
  user: User (name, role, menu), far right
  userName: User's name. Names the avatar button at phone width, and is the default display when user is missing
  userMenu: User menu. The avatar button and the name button open it
  busy: Screen is loading (progress line under the bar)
  sidebarCollapsed: Collapsed sidebar (64, controlled)
  defaultSidebarCollapsed: Sidebar initially collapsed (uncontrolled; giving it adds the collapse button)
  onSidebarCollapsedChange: Called when the collapse button is pressed (giving it adds the collapse button)
  autoCollapseSidebar: Collapses the sidebar on its own when a docked side panel squeezes the main content below 1024
  mobileNavOpen: Mobile sidebar open (controlled)
  onMobileNavOpenChange: Called when the mobile sidebar opens or closes
  tabs: Bottom tab bar on phones (up to 4, plus More)
  activeTabId: Current tab
  onTabPress: Called when a tab is pressed
  fill: Height basis. `viewport` fills the screen height (apps), `contained` fills the parent (doc examples, demo frames)
  aside: Side panel content (right of the main content, a bottom sheet below 1024)
  asideTitle: Side panel title and landmark name
  asideActions: Side panel header actions (before close)
  asideOpen: Side panel open (controlled)
  defaultAsideOpen: Side panel initially open
  onAsideOpenChange: Called when the side panel opens or closes (close button, Escape)
  asideWidth: Side panel width (px, controlled). 320 to 720, main content at least 560
  defaultAsideWidth: Initial side panel width (uncontrolled)
  onAsideWidthChange: Called when the side panel width changes (dragging the handle, arrow keys, Home, End, Enter)
  children: Main content
examples:
  Frame: Frame — Global bar with scope and user, sidebar and main content (`contained` inside a doc page).
  Busy: Loading — Progress line under the bar (`busy`). Pass the router's loading state straight in.
  UserMenu: User menu — With only userName and userMenu, the frame draws an avatar and name button. At phone width (below 640) it shrinks to one avatar button that opens the same menu in a bottom sheet.
  CollapsibleSidebar: Collapsible sidebar — Giving onSidebarCollapsedChange adds a collapse button at the bottom of the sidebar. When collapsed, the frame passes collapsed to SideNav and the top shows brandCollapsed (a short name).
  AsideWidth: Side panel width — Drag the handle on the side panel's left edge, or use ← → Home End, to change the width (320 to 720, main content at least 560). Double-click or Enter restores the default. When the main content gets narrower than 1024, the sidebar collapses on its own.
  Aside: Side panel — A panel docked right of the main content. It is not modal, so the main content stays usable. Below 1024 it opens as a bottom sheet. Blocks fill it from inside the main content with AppShellAside.
---
# AppShell
## Purpose
Use it to frame a business app with a global bar, a sidebar and the main content. Every Terrace One screen sits inside it.
## Anatomy
skip link · bar (height `layout.global-bar-height` 48, or `density.control-height-md` when the controls in it are taller (when an app enlarges controls in a text size mode, R-37); always 48 at default values, `bg.surface`, `border.divider` below; holds menu button (mobile) · brand · scope (company or branch switcher) · search · actions · user (name, role and menu after a vertical `border.divider`, one avatar button at phone width); when busy, a 2px `brand.default` progress line under the bar) · sidebar (width `layout.sidebar-width` 240, collapsed 64, a column that runs up past the bar, `bg.nav` (brand 950) surface, brand at the top in `nav.fgActive` at bar height (brandCollapsed when collapsed), no right border, and with the collapse button on, a nav-foot at the bottom (`nav.border` line above, button `density.control-height-sm` with panel-left-close 20 and `메뉴 접기` (Collapse menu) in `nav.fgMuted`, hover `nav.hover` + `nav.fgActive`, only the panel-left-open icon when collapsed)) · main (`bg.canvas`, scrolls inside, padding `density.gutter`; absolutely positioned content is placed against the main area) · tabs (phones only; bottom tab bar `bg.surface` with `border.divider` on top, height 56 plus safe area, tab = icon 24 + `type.caption` label (at least 56 high, growing when text or icons grow), current tab `fg.link`, counts as a small number at the top right of the icon with no pill, the last tab `전체` (More) opens the sidebar overlay) · aside (side panel; a `space.8` wide separator on its left edge is the width handle, drawing a 2px `border.focus` line on hover, focus and while dragging).

Look: `_internal/scrollbar.css` sets the scrollbars of the whole app (R-37). Thumb `border.strong`, transparent track, thin on Trellis elements. The sidebar scroll uses `nav.hover` (`nav.fgMuted` on hover or keyboard focus inside) with `scrollbar-gutter: stable`. Default browser scrollbars and controls follow `color-scheme` (light, dark) from tokens.css. Safari keeps its defaults.
## Props
Generated from the contract. `AppShellAside` (fills the side panel from inside the main content) is described under Behavior.
## Variants
fill viewport · contained, collapsed sidebar (with or without the collapse button, brandCollapsed), with or without tabs, with or without scope and user. Give the user one of three ways: user (your own content) · userName + userMenu (the frame draws an avatar and name button with the menu) · user + userName (user on wide screens, an avatar button at phone width).
## States
default · loading (busy: progress line under the bar, `aria-busy` on main).
## Behavior
With a sidebar, the brand sits at the top of the sidebar on wide screens and at the left of the bar below 1024. Below a width of 1024, the sidebar becomes a full-height overlay (brand included) that the menu button opens. Pressing outside it or pressing Escape closes it. With `tabs`, a bottom tab bar appears below `breakpoint.sm` (up to 4 tabs plus More), and the menu button in the bar is hidden. Pressing a tab calls `onTabPress(id)`. Pressing More opens the sidebar overlay. When `busy` turns on, the progress line appears after `duration.normal` (short loads do not flash) and sweeps left to right every `duration.pulse`. With reduced motion it is a still line. Pass the router's loading state straight in (React Router `useNavigation().state !== 'idle'`) (PR-26).

The bar at phone width (R-T12): below `breakpoint.sm`, with userName the user slot shrinks to one avatar button (`density.control-height-sm`, avatar 32). The button opens userMenu when there is one (a bottom sheet on narrow screens, titled with the name), or else the user slot content in a bottom sheet. With neither user nor userMenu only the avatar shows. The bar gap drops to `space.8` and the gap between actions to `space.4`, and the brand shrinks and clips first. Action and user buttons do not shrink. So at 344 the brand, two icon buttons, the menu button and the user button fit in the bar. With user and no userName, user is drawn as is even at phone width. When an app has to change something by width itself, `useBreakpoint()` (`@terracelab/trellis-react`) returns the current width step (`base` · `sm` · `md` · `lg` · `xl` · `2xl`, base = below sm). It reads the `breakpoint.*` tokens and re-renders when the width changes. Server rendering counts as `xl`.

Side panel (PG-33): fill it with `aside` (on the frame) or with `AppShellAside` inside the main content (blocks). Both render in the same place; use one at a time. It is not modal: the table and inputs in the main content stay usable while it is open. At `breakpoint.xl` (1280) and wider it is a column right of the main content (the main content gets narrower, nothing overlaps). Between `breakpoint.lg` and xl it overlaps the right side of the main content (`shadow.lg`). Below lg it opens as a bottom sheet (`_internal/sheet.tsx`, 85% high, modal). The open button belongs to the app; give it `aria-expanded` and `aria-controls` (`useAppShellAsideId()`). It closes with the close button in its header or Escape inside it (except an Escape a menu inside already handled). Closed on wide screens, the content stays hidden in place so typed text and scroll position survive. Width is `space.40` × 10 = 400 until the proposed token `layout.aside.width` lands.

| AppShellAside prop | Type | Description |
| --- | --- | --- |
| title | string | Header title and landmark name |
| open · defaultOpen · onOpenChange | boolean · boolean · (open) => void | Open state (controlled or uncontrolled, closed by default) |
| actions | ReactNode | Header actions (before close) |
| children | ReactNode | Panel content |

Side panel width (R-41): on wide screens (lg and up) drag the handle on the panel's left edge to change its width. Dragging left widens it. The range is `space.40` × 8 (320) to × 18 (720). As a column next to the main content (xl and up) the main content never gets narrower than `space.40` × 14 (560). As an overlapping panel (lg to xl) it can grow to the main content width. Keyboard: ← widens and → narrows (by `space.16`), Home goes to the minimum, End to the maximum, Enter back to the default. A double-click also restores the default. While dragging only the screen changes, and on release `onAsideWidthChange(width)` is called once. The width is controlled (`asideWidth`) or uncontrolled (`defaultAsideWidth`, 400 by default), and the app decides whether to remember it. AppShellAside (blocks inside the main content) uses the same handle. The bottom sheet on narrow screens has no handle.

Collapsing the sidebar (R-41): giving `onSidebarCollapsedChange` or `defaultSidebarCollapsed` adds a collapse button at the bottom of the sidebar. The frame passes the collapsed state to the SideNav inside the sidebar (a `collapsed` given to SideNav directly wins), so the app does not have to pass the same value to both. The overlay sidebar below 1024 is always expanded and has no collapse button. The collapsed sidebar shows `brandCollapsed` (a short logo or name) at the top. Without it the brand is clipped.

Automatic collapse (R-41): when the side panel opens as a column (xl and up) and squeezes the main content below `layout.desktop.minWidth` (1024), that is frame width < sidebar 240 + panel width + 1024, the sidebar collapses. With a 400 panel that is a frame narrower than 1664. It comes back when the panel closes or the frame gets wider. If the person expands it again with the collapse button, it stays expanded until the panel closes. Turn it off with `autoCollapseSidebar={false}`. The automatic collapse does not call `onSidebarCollapsedChange` (the value the app remembered stays).
## Accessibility
Uses `<header>`, `<nav>` (inside the sidebar) and `<main id>`. The first Tab press lands on `본문으로 건너뛰기` (Skip to content). The tab bar is `<nav aria-label="주요 메뉴">` (Main menu), the current tab has `aria-current="page"`, and More has `aria-expanded`. The avatar button at phone width is named by the user's name (userName) and has `aria-haspopup="dialog"` · `aria-expanded`. The avatar is decorative, so the name is not read twice. The busy line is an indeterminate `role="progressbar"` named `불러오는 중` (Loading), and main gets `aria-busy`. The side panel width handle is `role="separator"` with `aria-orientation="vertical"`, named `{title} 폭` ({title} width), with `aria-valuenow` (current width), `aria-valuemin` 320, `aria-valuemax` (the widest it can go on this screen, 720 at most) and `aria-controls` (the panel), and Tab reaches it. The sidebar collapse button is named by its visible text `메뉴 접기` (Collapse menu) when expanded. When collapsed it shows only the icon, so it is named `메뉴 펴기` (Expand menu) through `aria-label` and `title`.
## Density
Bar height 48 (or the height of the controls in it when they are taller), main padding `density.gutter`.
## Platform differences
Native uses a tab bar plus a stack (components.md §9). It takes screens as props. It uses the same vocabulary as `tabs` on phone web.
## Avoid
Capping the main content width at 1440 (business screens are wide). A primary button in the bar. Putting the scope switcher or the user at the bottom of the sidebar (who you are and what scope you are viewing stay visible in the bar, PR-26). Passing the collapsed state to the frame and to SideNav separately so they drift apart. Fixing the side panel at an arbitrary px width (the handle range is 320 to 720).
## Stories
Default · Collapsed · Mobile · MobileTabs · UserMenu · CollapsibleSidebar · AsideWidth · Aside.
## References
D-40 (sidebar structure) · PR-26 (scope · user · busy) · PR-27 (full-height sidebar on the dark brand surface, brand at the top of the sidebar, the bar sits over the content column only) · R-T12 (avatar button for the user at phone width, useBreakpoint) · R-37 (scrollbars, color-scheme, bar height) · R-41 (side panel width, sidebar collapse, automatic collapse, brandCollapsed, D-130) · AgentReplay (replay layer).
