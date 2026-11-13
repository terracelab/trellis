import { CheckboxContract, type CheckboxProps } from '@terracelab/trellis-contracts';
import { useId, type ReactNode } from 'react';
import { Checkbox as C } from '../_headless/index.js';
import { useCheckboxOption } from '../_internal/checkbox-option.js';
import { cx, def } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { Spinner } from '../Spinner/Spinner.js';

export type CheckboxWebProps = Omit<CheckboxProps, 'children'> & {
  children?: ReactNode;
  className?: string;
  /** 라벨이 없을 때(표 행 선택)의 접근성 이름 */
  'aria-label'?: string;
};

export function Checkbox({
  checked,
  defaultChecked,
  onChange,
  indeterminate = false,
  children,
  description,
  disabled,
  invalid,
  name,
  value,
  id,
  testID,
  className,
  'aria-label': ariaLabel,
}: CheckboxWebProps) {
  const t = useMessages();
  const field = useFieldControl({ id, invalid, disabled });
  // CheckboxGroup 선택지 안에서만: 저장 중(pending) · 줄 끝 정보 설명
  const option = useCheckboxOption();
  const descId = useId();
  // 저장 중: 읽기 전용(포커스는 남는다) + aria-busy + 상자 옆 Spinner. 비활성이면 비활성이 이긴다
  const busy = Boolean(option?.busy) && !field.disabled;
  const describedBy = [description ? descId : undefined, field.describedBy, option?.describedBy]
    .filter(Boolean)
    .join(' ');
  return (
    <span
      className={cx('tl-checkbox', className)}
      data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
      data-loading={busy || undefined}
    >
      <label className="tl-checkbox__row">
        <C.Root
          {...def({ checked, defaultChecked, name, value })}
          className="tl-checkbox__box tl-focusable"
          id={field.id}
          data-testid={testID}
          indeterminate={indeterminate}
          disabled={field.disabled}
          readOnly={busy}
          required={field.required}
          aria-busy={busy || undefined}
          aria-label={ariaLabel}
          aria-invalid={field.invalid || undefined}
          aria-describedby={describedBy || undefined}
          onCheckedChange={(next) => onChange?.(next)}
        >
          <C.Indicator className="tl-checkbox__indicator">
            <Icon name={indeterminate ? 'minus' : 'check'} size={16} />
          </C.Indicator>
        </C.Root>
        {children != null && <span className="tl-checkbox__label">{children}</span>}
      </label>
      {busy && <Spinner size={16} label={t('common.saving')} className="tl-checkbox__spinner" />}
      {description && (
        <span className="tl-checkbox__description" id={descId}>
          {description}
        </span>
      )}
    </span>
  );
}
Checkbox.displayName = CheckboxContract.name;
