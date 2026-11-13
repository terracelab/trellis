---
props:
  label: Name (label above the field)
  placeholder: Example text
  onScan: Called when a scan completes
  keepFocus: Keeps focus
  recent: Recent scans
  disabled: Disabled
  size: Height (lg on site)
examples:
  Receiving: Receiving inspection — Each scan clears the field and adds the code to recent scans.
---
# ScanField
## Purpose
Use it for barcode and QR scanner input (receiving inspection, picking, stock counts). A keyboard wedge scanner types the characters and ends with Enter.
## Anatomy
label · root (Input shape, height `density.control-height-lg`) · scan icon · control · status line (waiting dot · `스캔 대기 중` (waiting for scan)) · recent (recent scan chips).
## Props
Generated from the contract.
## Variants
5 sizes (xs · sm · md · lg · xl), with or without recent.
## States
default · focus (the waiting dot moves, and stops under reduced-motion) · disabled.
## Behavior
Enter calls onScan(code) and clears the field. With keepFocus, if the field loses focus and no other input starts within 2 seconds, it takes focus back (rough site conditions, gloved hands). Enter during Korean text composition is ignored.
## Accessibility
Uses `<label for>`. Scan results are read through `aria-live="polite"`.
## Density
The scan field is one step taller than other fields of the same size. xs `control-height-xs` · sm `control-height-sm` · md `control-height-lg` · lg `control-height-lg` + `space.8` · xl `control-height-xl` + `space.8` (compact 26 · 30 · 42 · 50 · 56). On-site screens use lg. At board density (track E), the height is 56.
## Platform differences
Native adds a camera scan button (`expo-camera`).
## Avoid
A scan field with only a placeholder and no label. Taking focus away while another field is in use.
## Stories
Default · Recent · Disabled.
## References
Track E 2.5 · 2.9 scanner rules.
