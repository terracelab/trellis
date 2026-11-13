# Figma library

File: [Trellis · Design System & Showcase](https://www.figma.com/design/uNZmEBsbRnkivkF79zdd2L). You need team access.

**Code is the source of truth and Figma is generated from it.** A value changed in Figma counts only once it is reflected in code (token JSON). The next sync overwrites it.

| Page | Contents |
| --- | --- |
| Foundations | Color (semantic Light/Dark) · type · spacing · radius · shadow · density · modules · chart palette |
| Components | Buttons · badges · inputs · cards · tabs · tables · 15 chart sets · sidebar parts · 48 icons · 21 module tiles |
| Showcase · Screens | The current look of the preview screens (light · dark · 1024 · 390) |

- Variable names match CSS variables 1:1, for example `color/bg/surface` ↔ `--tl-color-bg-surface` (Dev Mode shows the code syntax).
- Component variant axes match the props in code (for example `Chart / BulletBar` State = default · reached · warning · over).
- Request changes as an issue in the Trellis repository, not in Figma.
