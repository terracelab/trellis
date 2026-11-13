import {
  formatCount,
  IconButtonContract,
  type IconButtonProps,
} from '@terracelab/trellis-contracts';
import { useContext, type ButtonHTMLAttributes, type Ref } from 'react';
import { cx } from '../_internal/cx.js';
import { Icon } from '../Icon/Icon.js';
import { Tooltip, TooltipTriggerContext } from '../Tooltip/Tooltip.js';

export type IconButtonWebProps = IconButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof IconButtonProps | 'children'> & {
    className?: string;
    ref?: Ref<HTMLButtonElement>;
  };

/** 아이콘 크기: 26 · 30 · 36 칸은 16, 42는 20, 48은 24 */
const ICON_SIZE = { xs: 16, sm: 16, md: 16, lg: 20, xl: 24 } as const;

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  count,
  countTone = 'danger',
  disabled = false,
  pressed,
  onPress,
  id,
  testID,
  className,
  onClick,
  ...rest
}: IconButtonWebProps) {
  // 바깥 Tooltip이 감쌌으면 그쪽 말풍선만 띄운다
  const wrapped = useContext(TooltipTriggerContext);
  const shown = count != null && count > 0;
  const button = (
    <button
      {...rest}
      type="button"
      id={id}
      data-testid={testID}
      className={cx('tl-icon-button', 'tl-focusable', className)}
      data-variant={variant}
      data-size={size}
      aria-label={shown ? `${label} ${formatCount(count)}` : label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        onPress?.();
      }}
    >
      <Icon name={icon} size={ICON_SIZE[size]} />
      {shown && (
        <span className="tl-icon-button__count" data-tone={countTone} aria-hidden>
          {formatCount(count)}
        </span>
      )}
    </button>
  );
  // 이름은 title 대신 Trellis 툴팁으로 보인다(가리킴 · 키보드 포커스). 접근성 이름은 aria-label이 맡는다
  return wrapped ? button : <Tooltip content={label}>{button}</Tooltip>;
}
IconButton.displayName = IconButtonContract.name;
