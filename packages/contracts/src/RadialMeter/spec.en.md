---
props:
  value: Current value
  max: Maximum (one full turn of the ring)
  label: Metric name (achievement rate, repurchase rate)
  caption: Secondary text (against the target)
  unit: Value unit
  size: Diameter 80 · 120 · 160
  tone: Ring color
  digits: Decimal places
examples:
  Tones: Sizes and tones — Use one large ring per card.
---
# RadialMeter
## Purpose
Use it to show one ratio against a target or limit (achievement rate, repurchase rate) as a large ring. For several rows, use a BulletBar list.
## Anatomy
svg (`role="meter"`) · track (`chart.track`, thickness 9% of the diameter) · arc (tone color, round cap) · value (`type.amountLg` fg.primary + unit `type.caption`) · label (`type.caption` fg.secondary) · caption (`fg.tertiary`).
## Props
Generated from the contract.
## Variants
size 3 × tone 4. size is a diameter, not a control height, so it uses its own `RadialMeterSize` type (sm · md · lg) instead of the control `Size` (xs to xl).
## States
default.
## Behavior
When value is greater than max, the ring fills completely and the value is shown as it is.
## Accessibility
Uses `role="meter" aria-valuenow/min/max aria-label=label`.
## Density
None (fixed diameter).
## Platform differences
None.
## Avoid
More than one ring in a card. Code review checks this.
## Stories
Default · Sizes · Tones.
## References
None.
