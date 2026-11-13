import {
  formatQuantity,
  TextareaContract,
  type TextareaProps,
} from '@terracelab/trellis-contracts';
import { useId, useState, type Ref, type TextareaHTMLAttributes } from 'react';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';

export type TextareaWebProps = TextareaProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof TextareaProps | 'children'> & {
    className?: string;
    ref?: Ref<HTMLTextAreaElement>;
  };

export function Textarea({
  value,
  defaultValue,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
  disabled,
  readOnly = false,
  invalid,
  required,
  name,
  resize = 'vertical',
  id,
  testID,
  className,
  ...rest
}: TextareaWebProps) {
  const field = useFieldControl({ id, invalid, required, disabled });
  const countId = useId();
  const [inner, setInner] = useState(defaultValue ?? '');
  const current = value ?? inner;
  const counted = maxLength != null;
  const describedBy = [field.describedBy, counted ? countId : undefined].filter(Boolean).join(' ');
  return (
    <span
      className={cx('tl-textarea', className)}
      data-resize={resize}
      data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
      data-readonly={readOnly || undefined}
    >
      <textarea
        {...rest}
        className="tl-textarea__control"
        id={field.id}
        data-testid={testID}
        name={name}
        rows={rows}
        value={current}
        placeholder={placeholder}
        disabled={field.disabled}
        readOnly={readOnly}
        required={field.required}
        maxLength={maxLength}
        aria-invalid={field.invalid || undefined}
        aria-describedby={describedBy || undefined}
        onChange={(e) => {
          if (value === undefined) setInner(e.target.value);
          onChange?.(e.target.value);
        }}
      />
      {counted && (
        <span
          className="tl-textarea__count"
          id={countId}
          data-full={current.length >= maxLength || undefined}
        >
          {formatQuantity(current.length)} / {formatQuantity(maxLength)}
        </span>
      )}
    </span>
  );
}
Textarea.displayName = TextareaContract.name;
