---
props:
  items: Suggested questions
  onSelect: Called when one is picked
  label: Group name (Suggested questions by default)
  selected: Item that matches the current input (pressed look)
  disabled: Disabled
examples:
  Questions: Suggested questions — They sit above the input when a conversation starts. Pressing one puts its text in the input.
  Selected: Item matching the input — With selected, the chip with the same text looks pressed (frequent searches in CommandPalette).
---
# SuggestionChips
## Purpose
Use it to show suggested questions or frequent searches as a row of pill buttons that can be pressed. Composer (`suggestions`) and CommandPalette (quick questions) use the same part. Use SegmentedControl to pick one value and FilterBar for filter conditions.
## Anatomy
root (`tl-suggestion-chips`, `role="group"`, wrapping row, `space.8` gaps; the surrounding space is set by where it sits) · chip (`button`, `density.control-height-sm` high, `space.12` side padding, 1px `border.default`, `radius.full`, no background, `type.caption` `fg.secondary` text, truncated when long).
## Props
Generated from the contract.
## Variants
There is no variant prop. With `selected` the chips become toggle buttons (`aria-pressed`) and the chip with the same text looks pressed (`border.strong` · `fg.primary` · 600).
## States
default · hover (`border.strong` · `bg.sunken` · `fg.primary`) · focus (focus ring) · disabled (`border.divider` · `fg.disabled`, cannot be pressed, root `data-state="disabled"`). active, loading and error do not apply.
## Behavior
- Pressing calls `onSelect(text)`. The caller decides whether to put it in the input or send it right away. Composer and CommandPalette only put it in the input and keep the cursor there, so it can be edited before sending and no question reaches the agent without a person checking it.
- `selected`: a chip looks pressed when its text matches, ignoring case and spaces (the same rule as CommandPalette filtering).
- Nothing renders when there are no items.

| Key | Action |
| --- | --- |
| Tab | Chips in order |
| Enter · Space | Picks |
## Accessibility
The root is `role="group"` with a name (label, "Suggested questions" by default). The chip text is the button name. The pressed look also shows through `aria-pressed` and weight, not only color. Text contrast of `fg.secondary` is above 4.5:1, and the focus ring always shows. On phones (touch density) chips are 44 high.
## Density
Chip height is `density.control-height-sm` (30 for compact and comfortable, 44 for touch). Text size and gaps do not depend on density.
## Platform differences
Native uses a wrapping row of Pressables (scrolls sideways when it overflows). Props are the same.
## Avoid
Sending to the agent as soon as a chip is pressed (inside Composer), a different color per chip, icon or emoji decoration, and more than five chips. Code review checks these.
## Stories
Questions · Selected.
## References
patterns/ConversationalWork, Composer (`suggestions`), CommandPalette (`suggestions`).
