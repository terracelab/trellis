---
props:
  locale: Language of component text
  theme: Sets `data-theme` on `<html>`, or a company theme object (one main color → 21 company-color tokens × 4 modes)
  density: Sets `data-density` on `<html>`
  children: App
  scope: Apply theme and density only inside (previews, company settings screen)
  fontScale: Text size (`data-font-scale`)
  contrast: High contrast (`data-contrast`)
  focusRing: Strong focus ring (`data-focus`)
  linkUnderline: Always underline links (`data-links`)
  chartPalette: Colorblind-safe charts (`data-chart`)
  motion: Reduced motion (`data-motion`)
  contentWidth: Maximum body width (`data-content-width`)
  toastDuration: Toast display time setting (default · long · manual)
  navigate: App router navigation (in-app addresses of Link and PersonLabel href open without a page reload)
examples:
  English: English text — Buttons, accessible names, presets and the calendar switch to English. Number formats stay the same.
  CompanyTheme: Company theme — Pick a color chip and only the scoped preview changes, without a reload (D-98).
---
# TrellisProvider
## Purpose
Use it once at the top of an app to pick the component text language (`locale`), set the theme and density on `<html>` if wanted, and apply a company theme from one main color (D-98). Without it, every component works in Korean with the default theme (#FE5C2B) (D-65).
## Anatomy
No wrapping element. It only passes down the locale context. When scoped (`scope` or an inner provider) with a theme or density, it wraps children in one `div.tl-theme-scope[data-tl-theme]` (display: contents). The company theme is one `style[data-tl-theme-style]` in `<head>`.
## Props
Generated from the contract.
## Variants
locale ko · en. theme: a mode string (`'light' | 'dark'`) or a company theme object (`{ mode, brand, neutral, buttonText }`).
## States
default. The others do not apply.
## Behavior
Changing `locale` switches button labels, accessible names, empty states, error messages and calendar weekdays to that language. Number, amount and date formats keep Korean business conventions (won `원`, `만` for 10,000, `억` for 100,000,000, ISO dates). With `theme` or `density`, it sets `<html data-theme · data-density>`. Without them, it leaves the attributes the app set. It also sets `<html lang>` to match the locale. The attributes it changed go back to their old values when the provider unmounts. A provider inside another provider (part of a page in another language, like a docs example) changes only the text language and leaves `<html>` alone. Mark that part with `lang` on its wrapper element. App text (blocks, screens) is up to the app.

Company theme (D-98): with `theme={{ brand: '#hex' }}`, `createTheme` from `@terracelab/trellis-tokens/theme` computes the 21 company-color tokens for light, dark, high-contrast light and high-contrast dark and puts them in `<head>`. Changing the color applies at once without a reload (picking a color in company settings), and the style goes away when the provider unmounts. The same input gives the same values as the theme.css built by `pnpm ds:theme`. If the input matches the default theme (#FE5C2B · cool · white) or is not a valid color yet (still typing), nothing is added. With `scope` (or as an inner provider) it applies only inside, and `<html>` theme and density stay as they are (previews, one screen). Scoped selectors win over the page-wide theme by one step of specificity.

Accessibility modes (D-97, the same names as the food-ERP display settings): `fontScale` (text 112 · 125%), `contrast` (high contrast), `focusRing` (strong focus), `linkUnderline` (always underline links), `chartPalette` (colorblind-safe charts), `motion` (reduced motion) and `contentWidth` (maximum body width) set `data-font-scale`, `data-contrast`, `data-focus`, `data-links`, `data-chart`, `data-motion` and `data-content-width` on `<html>` (or on the wrapper when scoped). Default values set no attribute. Setting the attributes directly without the provider works the same (Django compatible). `toastDuration` (default · long · manual) changes the auto-close time of the ToastProvider below it (WCAG 2.2.1).

`navigate` (R-T34) is the app router's navigation function. When it is set, in-app addresses of Link and PersonLabel `href` (no scheme and not `#id`) open through this function instead of the default `a` navigation, which reloads the whole page. This applies only to a plain left click. Ctrl, Cmd, Shift, Alt or middle clicks (new tab), links with `target` and outside addresses are left to the browser. An inner provider without `navigate` inherits the outer one. Without it, links stay plain `a` elements, so they work without a provider.
## Accessibility
`<html lang>` decides how a screen reader pronounces text, so keep it the same as the locale. The aria names that components create use the same language.
## Density
Does not apply (with `density`, it only changes the html attribute).
## Platform differences
Native uses the same props to pass down the theme and density objects (`@terracelab/trellis-tokens/native`) and the text dictionary.
## Avoid
Nesting several page-wide Providers (one page-wide theme; use `scope` for previews and single screens). Overriding company colors with raw CSS variables (bypassing the engine skips the contrast checks). Putting app text in the Trellis dictionary (the dictionary holds component text only). Code review checks these.
## Stories
Korean · English · CompanyTheme (picking a color chip changes only the scoped area).
## References
contracts `_shared/messages.ts`, D-65, Link (R-T34).
