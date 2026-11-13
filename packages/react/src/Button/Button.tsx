import { ButtonContract, type ButtonProps } from '@terracelab/trellis-contracts';
import { useContext, useId, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
import { cx } from '../_internal/cx.js';
import { Icon } from '../Icon/Icon.js';
import { Spinner } from '../Spinner/Spinner.js';
import { Tooltip, TooltipTriggerContext } from '../Tooltip/Tooltip.js';
import { useMessages } from '../_internal/locale.js';

export type ButtonWebProps = Omit<ButtonProps, 'children'> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps | 'children'> & {
    children?: ReactNode;
    className?: string;
    ref?: Ref<HTMLButtonElement>;
  };

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconEnd,
  loading = false,
  disabled = false,
  disabledReason,
  fullWidth = false,
  type = 'button',
  onPress,
  children,
  id,
  testID,
  className,
  onClick,
  'aria-describedby': describedBy,
  ...rest
}: ButtonWebProps) {
  const t = useMessages();
  const reasonId = useId();
  const wrapped = useContext(TooltipTriggerContext);
  const inert = disabled || loading;
  // 이유가 있는 비활성은 aria-disabled로 포커스를 남겨 이유를 읽을 수 있게 한다(native disabled는 Tab에서 빠진다)
  const explained = disabled && !loading && Boolean(disabledReason);
  const button = (
    <button
      {...rest}
      type={type}
      id={id}
      data-testid={testID}
      className={cx('tl-button', 'tl-focusable', className)}
      data-variant={variant}
      data-size={size}
      data-state={loading ? 'loading' : disabled ? 'disabled' : undefined}
      data-full={fullWidth || undefined}
      disabled={disabled && !explained}
      aria-busy={loading || undefined}
      aria-disabled={loading || explained || undefined}
      aria-describedby={
        [describedBy, explained ? reasonId : undefined].filter(Boolean).join(' ') || undefined
      }
      onClick={(e) => {
        if (inert) {
          // aria-disabled인 submit 단추가 폼을 보내지 않게
          e.preventDefault();
          return;
        }
        onClick?.(e);
        onPress?.();
      }}
    >
      {loading ? (
        <Spinner size={16} label={t('common.processing')} />
      ) : (
        icon && <Icon name={icon} />
      )}
      {children != null && <span className="tl-button__label">{children}</span>}
      {iconEnd && !loading && <Icon name={iconEnd} />}
      {/* 이름에는 들어가지 않고(hidden) 설명으로만 읽힌다 */}
      {explained && (
        <span id={reasonId} hidden>
          {disabledReason}
        </span>
      )}
    </button>
  );
  if (!explained || wrapped) return button;
  return <Tooltip content={disabledReason as string}>{button}</Tooltip>;
}
Button.displayName = ButtonContract.name;
