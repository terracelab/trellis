import { SuggestionChipsContract, type SuggestionChipsProps } from '@terracelab/trellis-contracts';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

export type SuggestionChipsWebProps = SuggestionChipsProps & { className?: string };

/** 같은 글인지(대소문자 · 띄어쓰기 무시). CommandPalette의 걸러 찾기와 같은 기준 */
const squash = (s: string) => s.toLowerCase().replace(/\s+/g, '');

export function SuggestionChips({
  items,
  onSelect,
  label,
  selected,
  disabled = false,
  id,
  testID,
  className,
}: SuggestionChipsWebProps) {
  const t = useMessages();
  if (items.length === 0) return null;
  return (
    <div
      className={cx('tl-suggestion-chips', className)}
      id={id}
      data-testid={testID}
      data-state={disabled ? 'disabled' : undefined}
      role="group"
      aria-label={label ?? t('suggestionChips.label')}
    >
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className="tl-suggestion-chips__chip tl-focusable"
          disabled={disabled}
          aria-pressed={selected === undefined ? undefined : squash(item) === squash(selected)}
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
SuggestionChips.displayName = SuggestionChipsContract.name;
