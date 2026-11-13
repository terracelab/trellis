import { InputContract, type InputProps } from '@terracelab/trellis-contracts';
import { useState, type InputHTMLAttributes, type Ref } from 'react';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { Icon } from '../Icon/Icon.js';
import { useMessages } from '../_internal/locale.js';

export type InputWebProps = InputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof InputProps | 'children'> & {
    className?: string;
    ref?: Ref<HTMLInputElement>;
  };

export function Input({
  value,
  defaultValue,
  onChange,
  placeholder,
  type = 'text',
  size = 'md',
  icon,
  prefix,
  suffix,
  align = 'left',
  mono = false,
  clearable = false,
  disabled,
  readOnly = false,
  invalid,
  required,
  name,
  maxLength,
  inputMode,
  autoComplete,
  onEnter,
  label,
  id,
  testID,
  className,
  onKeyDown,
  ...rest
}: InputWebProps) {
  const t = useMessages();
  const field = useFieldControl({ id, invalid, required, disabled });
  const [inner, setInner] = useState(defaultValue ?? '');
  const current = value ?? inner;
  const set = (v: string) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };
  return (
    <span
      className={cx('tl-input', className)}
      data-size={size}
      data-align={align}
      data-mono={mono || undefined}
      data-clearable={clearable || undefined}
      data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
      data-readonly={readOnly || undefined}
    >
      {icon && <Icon name={icon} className="tl-input__icon" />}
      {prefix && <span className="tl-input__affix">{prefix}</span>}
      <input
        {...rest}
        className="tl-input__control"
        id={field.id}
        data-testid={testID}
        type={type}
        name={name}
        value={current}
        placeholder={placeholder}
        disabled={field.disabled}
        readOnly={readOnly}
        required={field.required}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        aria-label={
          field.labelId ? undefined : (label ?? (rest as { 'aria-label'?: string })['aria-label'])
        }
        onChange={(e) => set(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) onEnter?.();
          if (e.key === 'Escape' && clearable && current) set('');
        }}
      />
      {suffix && <span className="tl-input__affix">{suffix}</span>}
      {clearable && current && !field.disabled && !readOnly && (
        <button
          type="button"
          className="tl-input__clear tl-focusable"
          aria-label={t('common.clear')}
          onClick={() => set('')}
        >
          <Icon name="x" />
        </button>
      )}
    </span>
  );
}
Input.displayName = InputContract.name;
