---
props:
  open: Open (controlled)
  defaultOpen: Open at first
  onOpenChange: Called when the open state changes
  title: Title (document number or name)
  description: Secondary description
  side: Side it opens from
  width: Right panel width (480 · 640 · 880)
  height: Bottom sheet height (auto fits the content · full is 92% of the screen)
  trigger: Button that opens it
  actions: Actions to the right of the title
  footer: Actions fixed at the bottom
  onPrev: Go to the previous record. Adds a previous button to the head and the ← key (outside text fields only)
  onNext: Go to the next record. Adds a next button to the head and the → key (outside text fields only)
  prevLabel: Name of the previous button (default `이전 건`, previous item)
  nextLabel: Name of the next button (default `다음 건`, next item)
  children: Content
examples:
  Detail: Detail — Opens one record without leaving the list.
  Paging: Previous and next — With onPrev and onNext, the head shows previous and next buttons and the ← → keys move between records.
  Bottom: Bottom sheet — On a phone, the detail opens as a bottom sheet with a handle and closes with a downward swipe.
---
# Drawer
## Purpose
Use it for the detail view in a list and detail pattern, or for long input. It opens one record without leaving the list.
## Anatomy
backdrop · panel (full height on the right, `bg.elevated`, `shadow.lg`) · head (title `type.h2` · description · actions · nav · close, divider below) · body (scrolls) · footer (divider above, right-aligned). The nav is two IconButtons for previous and next (when `onPrev` or `onNext` is given). A bottom sheet (side bottom) uses a sheet instead of the panel (top corners `radius.xl`, divider above) with a handle (`border.strong` 40 × 4, `radius.full`). Its title is `type.h3` and its head has no divider.
## Props
Generated from the contract.
## Variants
side right · bottom, width md · lg · xl (right panel), height auto · full (bottom sheet). auto grows with the content and stops at 85% of the screen height. full is fixed at 92% of the screen height.
## States
default.
## Behavior
The right panel is a Base UI Dialog attached to the side. The bottom sheet (side bottom) opens with the same Base UI Drawer as the picker sheet (`_internal/sheet.tsx`), so it looks and moves the same way. It shows a handle and closes with a downward swipe, and the backdrop fades while you swipe. Footer buttons share the width like in the sheet. Opening another Drawer inside an open Drawer shows a warning in development mode (components.md §10). A bottom drawer (side bottom), and any drawer that fills the phone screen, raises toasts above its footer (see Toast behavior).

When `onPrev` or `onNext` is given, the head shows previous and next buttons and the ← → keys do the same. At the first or last record of a list, leave one out and only that button turns off while the layout stays the same. The button names are `prevLabel` and `nextLabel`, with `이전 건` (previous item) and `다음 건` (next item) as defaults. The keys are ignored while focus is in a field that edits text, such as input, textarea or contenteditable. They are also ignored inside widgets that use the arrow keys themselves, such as tabs, menus and lists. Keys pressed during Korean input composition or with a modifier (Alt · Ctrl · Meta · Shift) are ignored too. The app changes the content and title for the next record, and the Drawer stays open.

The footer adds `env(safe-area-inset-bottom)` to its bottom padding. The right panel also reaches the bottom of the screen, so on devices with a home indicator the buttons would otherwise be covered. Without a footer, the body bottom padding gets it instead.

| Key | Action |
| --- | --- |
| Escape | Close |
| Tab · Shift+Tab | Cycle inside the window |
| ← | Previous record (with `onPrev`, outside text fields) |
| → | Next record (with `onNext`, outside text fields) |
## Accessibility
Uses `role="dialog"` and links the title. Focus is trapped inside. When it closes, focus returns to the row that opened it. On open, first focus goes to the title (tabindex -1, no ring) (R-37 item 10, PR-32): even when the drawer opens straight from a URL without a row press, it does not start with a focus ring and an open "닫기" (close) tooltip on the close button, and screen readers start at the title. The next Tab goes to the head buttons and then the body. When a form sheet should start in its first field, put `data-autofocus` on that field. Focus is trapped in the window: Tab on the last element moves to the first and Shift+Tab on the first moves to the last, right in keydown, so fast Tab presses (automated checks, key repeat) never leave the window. The window has aria-modal="true" (R-33). The previous and next buttons are named IconButtons and announce ← and → with `aria-keyshortcuts`. A turned-off button leaves the Tab order. The bottom sheet handle is `aria-hidden`, and the sheet also closes with the close button, Escape or a press outside.
## Density
Inner padding `space.24` (compact `space.20`). The bottom sheet uses `space.8` for the head with `space.20` on the sides, and `space.12` · `space.16` for the footer. Its head buttons (previous, next, close) are finger sized `size.touch.min` (44) regardless of density.
## Platform differences
Native uses a bottom sheet. Previous and next are the same head buttons, and the keyboard shortcuts are web only.
## Avoid
A Drawer inside a Drawer. Navigating to a new screen instead of showing the detail. Single letter keys (j · k) for previous and next. Code review checks these.
## Stories
Detail · Paging · Bottom.
## References
components.md §10 ListDetail. `_internal/sheet.tsx` (picker sheet on narrow screens, D-60).
