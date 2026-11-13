import { RadioGroupContract, type RadioGroupProps } from '@terracelab/trellis-contracts';
import { useId } from 'react';
import { Radio, RadioGroup as RG } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';

export function RadioGroup({
  options,
  value,
  defaultValue,
  onChange,
  orientation = 'vertical',
  disabled,
  name,
  label,
  id,
  testID,
  className,
}: RadioGroupProps & { className?: string }) {
  const field = useFieldControl({ id, disabled });
  const base = useId();
  return (
    <RG
      className={cx('tl-radio-group', className)}
      id={field.id}
      data-testid={testID}
      data-orientation={orientation}
      data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
      {...(value !== undefined ? { value } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      onValueChange={(v) => onChange?.(v as string)}
      disabled={field.disabled}
      required={field.required}
      name={name}
      aria-labelledby={field.labelId}
      aria-label={field.labelId ? undefined : label}
      aria-describedby={field.describedBy}
      aria-invalid={field.invalid || undefined}
      aria-orientation={orientation}
    >
      {options.map((o, i) => {
        const descId = o.description ? `${base}-${i}-desc` : undefined;
        const off = field.disabled || o.disabled;
        return (
          <span className="tl-radio-group__option" key={o.value} data-disabled={off || undefined}>
            <label className="tl-radio-group__item">
              <Radio.Root
                className="tl-radio-group__radio tl-focusable"
                value={o.value}
                disabled={off}
                aria-describedby={descId}
              >
                <Radio.Indicator className="tl-radio-group__dot" />
              </Radio.Root>
              <span className="tl-radio-group__label">{o.label}</span>
            </label>
            {o.description && (
              <span className="tl-radio-group__description" id={descId}>
                {o.description}
              </span>
            )}
          </span>
        );
      })}
    </RG>
  );
}
RadioGroup.displayName = RadioGroupContract.name;
