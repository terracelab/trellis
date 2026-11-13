import { SwitchContract, type SwitchProps } from '@terracelab/trellis-contracts';
import { useId, type ReactNode } from 'react';
import { Switch as S } from '../_headless/index.js';
import { cx, def } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';

export type SwitchWebProps = Omit<SwitchProps, 'children'> & {
  children?: ReactNode;
  className?: string;
  /** 라벨이 없을 때의 접근성 이름 */
  'aria-label'?: string;
};

export function Switch({
  checked,
  defaultChecked,
  onChange,
  children,
  description,
  disabled,
  size,
  name,
  id,
  testID,
  className,
  'aria-label': ariaLabel,
}: SwitchWebProps) {
  const field = useFieldControl({ id, disabled });
  const descId = useId();
  const describedBy = [description ? descId : undefined, field.describedBy]
    .filter(Boolean)
    .join(' ');
  return (
    <span
      className={cx('tl-switch', className)}
      data-size={size ?? 'md'}
      // size를 주지 않았으면 touch 밀도에서 lg로 그린다(CSS). 값을 준 것은 그대로 둔다
      data-size-auto={size === undefined || undefined}
      data-state={field.disabled ? 'disabled' : undefined}
    >
      <label className="tl-switch__row">
        <S.Root
          {...def({ checked, defaultChecked, name })}
          className="tl-switch__track tl-focusable"
          id={field.id}
          data-testid={testID}
          disabled={field.disabled}
          aria-label={ariaLabel}
          aria-describedby={describedBy || undefined}
          onCheckedChange={(next) => onChange?.(next)}
        >
          <S.Thumb className="tl-switch__thumb" />
        </S.Root>
        {children != null && <span className="tl-switch__label">{children}</span>}
      </label>
      {description && (
        <span className="tl-switch__description" id={descId}>
          {description}
        </span>
      )}
    </span>
  );
}
Switch.displayName = SwitchContract.name;
