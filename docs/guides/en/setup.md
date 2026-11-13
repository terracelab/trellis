# CSS, themes and density

## Import CSS in this order

```ts
// The app's entry point (main.tsx, layout.tsx, etc.). The order matters
import '@terracelab/trellis-tokens/fonts.css'; // Pretendard Variable (bundled in the package, no external requests)
import '@terracelab/trellis-tokens/tokens.css'; // --tl-* variables · light/dark · density
import '@terracelab/trellis-react/styles.css'; // Component CSS
```

The font is the woff2 file inside the package. It renders the same in TerraceLab's offline desktop app.

## Theme and density are two html attributes

```html
<html lang="ko" data-theme="light" data-density="compact">
```

| Attribute | Values | Default |
| --- | --- | --- |
| `data-theme` | `light` · `dark` | `light` |
| `data-density` | `compact` · `comfortable` · `touch` | `compact`. Work screens are dense and only dashboards use comfortable. On phones (under 640) the root switches to `touch` automatically (body 15 · controls 40 · input text 16) |

The attributes do not have to be on `<html>`. Set them on any element and only its contents change (like the dark phone screen in the preview). In a React app you can also set them through the `theme` and `density` props of `TrellisProvider` ([TrellisProvider](../components/TrellisProvider.md)). Tokens handle the user's `prefers-reduced-motion` setting (every animation duration becomes 0).

## One TrellisProvider sets the text language

```tsx
import { TrellisProvider } from '@terracelab/trellis-react';

<TrellisProvider locale="en">{app}</TrellisProvider>
```

Text that components draw themselves (close, filter, calendar weekdays, empty states, accessible names) uses the language you choose, `ko` or `en`. The default is `ko`, and components work in Korean without a Provider. Number, amount and date formats (`원` won, `만` 10,000, `억` 100,000,000, ISO dates) stay the same in every language. The app decides the text on its own screens.

## Values only through variables

```css
.invoice-total {
  padding: var(--tl-space-16);
  border-radius: var(--tl-radius-md);
  background: var(--tl-color-bg-surface);
  color: var(--tl-color-fg-primary);
  font-size: var(--tl-type-amount-font-size);
  font-variant-numeric: var(--tl-font-numeric);
}
```

In TS, use the object with the same names.

```ts
import { tokens } from '@terracelab/trellis-tokens';
tokens.color.bg.surface; // 'var(--tl-color-bg-surface)'
```

React Native uses resolved values. Import them with `import { themes, density } from '@terracelab/trellis-tokens/native'`.

## Tailwind v4

```css
@import 'tailwindcss';
@import '@terracelab/trellis-tokens/tokens.css';
@import '@terracelab/trellis-tokens/tailwind';
```

Semantic colors, spacing, radius, type and shadows become the Tailwind theme. Write classes like `bg-bg-surface text-fg-primary p-16 rounded-md`. Do not use the default Tailwind palette (`bg-blue-500` and so on).

## Django

The `terracelab-trellis` pip package (the `{% trellis_css %}` template tag and an admin theme) comes after 1.0. For now, copy `tokens.css` and `fonts.css` as static files.

Next: [Principles and rules](principles.md)
