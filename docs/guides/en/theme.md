# Company themes

Build a company theme from one main color. The engine (`@terracelab/trellis-tokens/theme`) computes the 21 company-color tokens for light, dark, high-contrast light and high-contrast dark. Where contrast falls short, it moves to another step of the same hue until it passes. The default theme is the result for the food-ERP orange `#FE5C2B` (D-98).

## What changes and what does not

| Changes with the company color | Does not change |
|---|---|
| Primary button background · hover · pressed · text (`brand.default · hover · active · onBrand`) | Status colors (info · success · warning · danger) |
| Selected background · light accent area · selected row (`brand.subtle · tint`, `bg.rowSelected`) | Income red · expense blue (Korean convention: red for income, blue for expense) |
| The company color as is, for non-text accents: progress bar · logo · selection dot (`brand.accent`) | 5 approval colors, module colors, chart colors, avatar colors |
| Links · brand-colored text (`fg.link`) | Paper (print form) colors |
| Focus ring · strong focus · selected border · tab underline · current step (`border.focus · focusStrong · selected`) | Font · spacing · radius · type size · control height |
| The whole sidebar (`bg.nav`, `nav.*`): a dark, low-chroma tone of the company hue | |
| (When you pick a gray tone) the grays of background · surface · text · border | |

The gray tone (default · neutral · warm) keeps lightness as it is and changes only the tint. So text contrast stays almost the same as in the default theme.

## How the engine picks

- Scale: 50 to 950. 500 is the input color as is (if it is too light, only its lightness goes down).
- Primary button (default rule, "white text first"): if white text on the company color is under 4.5:1, it moves within the same hue to the lightest step where white text passes 5:1. The food-ERP orange becomes `#CC3A00`. The input color is used for non-text accents (`brand.accent`). With `buttonText: 'input'`, the input color stays as the background and the text is white or dark, whichever passes.
- Links and brand text: 4.5:1 on surface, gray canvas, sunken cells, popups, selected background and selected rows. Focus ring and selected border: 3:1 on surface and canvas. Strong focus: 4.5:1.
- Dark mode picks again from lighter steps. The primary button stays the same as in light mode. High contrast uses 7:1 for text and 4.5:1 for lines.
- The sidebar is a dark tone of the company hue with very low chroma. Its lightness follows the food-ERP cocoa steps, so orange gives a color you cannot tell apart from `#3A3330`.
- Each moved step leaves a reason in `theme.notes`.

## At runtime: change without a reload

This is for picking a color in company settings and seeing it at once.

```tsx
import { TrellisProvider } from '@terracelab/trellis-react';

// The whole page
<TrellisProvider theme={{ brand: company.color, neutral: 'cool', mode: 'light' }}>
  <App />
</TrellisProvider>

// Only inside one screen or a preview (the rest of the page stays as it is)
<TrellisProvider scope theme={{ brand: draftColor, mode: 'dark' }}>
  <ThemePreview />
</TrellisProvider>
```

- A string `theme` (`'light' | 'dark'`) only sets `<html data-theme>`, as before.
- If the input matches the default theme (`#FE5C2B` · default gray · white text first) or is not a valid color yet (still typing), nothing is overridden.
- An inner provider is scoped automatically. A scoped theme wins over the outer company theme.
- The same input gives the same values as the built theme.css (Node and the browser agree; `pnpm --filter @terracelab/demo check:theme`).

## At build time: keep it as theme.css

```bash
pnpm ds:theme --list                                  # list of color chips
pnpm ds:theme --preset forest                         # use a color chip as it is
pnpm ds:theme --brand "#0B7A5C" --neutral warm        # pick your own
pnpm ds:theme --brand "#FE5C2B" --button-text input   # primary button = the input color as is
pnpm ds:theme --brand "#0B7A5C" --verbose             # print every contrast check
pnpm ds:theme --refresh                               # rerun the current generator with the choice in the first line
```

This rewrites `src/theme.css`. Do not edit it by hand. Import it in the entry file after `tokens.css` and before `styles.css`. theme.css has four blocks (light · dark · high-contrast light · high-contrast dark) with the same selectors as tokens.css.

```ts
import { createTheme, themeCss } from '@terracelab/trellis-tokens/theme';

const theme = createTheme({ brand: '#0B7A5C', neutral: 'warm' });
theme.ok; // every contrast check passes
theme.checks; // contrast per item (4 modes)
theme.notes; // why steps moved
theme.warnings; // overlap warnings and alternatives
theme.suggestions; // a different rule to try (very light colors)
themeCss(theme); // the body of theme.css
themeCss(theme, { scope: '[data-preview]' }); // only inside that element
```

`pnpm ds:doctor` checks that theme.css overrides only the allowed variables. Numbered primitives (`--tl-color-brand-600` and so on) and status, finance, approval and chart colors cannot be overridden.

The comment on the first line of theme.css keeps the choice (`trellis-theme {"brand":…}`). `pnpm ds:theme --refresh` reruns the current generator with that choice. When the generator changes its blocks or values (for example the `@media (prefers-contrast: more)` block for the device high-contrast setting), `pnpm ds:doctor` reports the outdated theme.css, and `pnpm ds:update` calls `--refresh` at the end.

## When you get an overlap warning

If the company color (input · primary button · accent) is within ΔEOK 9 of the danger, income, success, warning, expense, info or first chart series color, you get a warning (D-99). Status and finance colors do not change. How to choose:

1. **Keep it.** Do not show status or amounts by color alone. Badges carry text, notices and toasts carry an icon, and changes carry a sign and an arrow. Trellis components already draw them that way. The default orange is also close to danger and income red, gets a warning, and is used this way.
2. **Pick an alternative.** The warning's `alternatives` keep lightness and chroma and only turn the hue to the nearest color that does not overlap.
3. **Change the primary button rule.** If `buttonTextAlternative` is `'input'`, the rule that keeps the input color as the background (B) clears the overlap.

Blue company colors overlap expense blue, info and the first chart series; green overlaps success; yellow overlaps warning. With such a color, check once more that one color does not carry two meanings on the screen.

## Very light company colors

For light colors such as yellow, sky blue and lime, the white-text rule (A) moves both the primary button and the accent to darker steps. With `#FFD400`, the primary button and the accent become `#856D00` (dark olive), and the company yellow shows nowhere on the screen. Every check still passes.

When the primary button and the accent both end up ΔEOK 15 or more away from the input color, and the input-color background rule (`buttonText: 'input'`) passes every contrast check without adding overlap warnings, the engine suggests that rule in `theme.suggestions`. The generator prints `? …` and `제안: --button-text input` (suggestion). With that rule, `#FFD400` gets a `#F3CA00` primary button (the input color with lower lightness) with dark text. If you want the company color to show, regenerate with the suggestion.

## Previewing

In the demo, open Demo settings → Theme color, or in the starter template open Display settings, and click a color chip to apply it to the whole screen. Copy and run the confirm command to keep the same theme as a file.
