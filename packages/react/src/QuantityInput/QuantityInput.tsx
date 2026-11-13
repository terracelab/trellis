import {
  baseUnitOf,
  formatQuantity,
  QuantityInputContract,
  toBaseQuantity,
  unitName,
  type QuantityInputProps,
} from '@terracelab/trellis-contracts';
import { useId, useState } from 'react';
import { NumberField as NF } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { useMessages } from '../_internal/locale.js';

export function QuantityInput({
  value,
  defaultValue,
  onChange,
  unit,
  units,
  onUnitChange,
  step = 1,
  min = 0,
  max,
  digits = 0,
  showStepper = true,
  disabled,
  invalid,
  required,
  size = 'md',
  name,
  label,
  id,
  testID,
  className,
}: QuantityInputProps & { className?: string }) {
  const t = useMessages();
  const field = useFieldControl({ id, invalid, required, disabled });
  const [innerUnit, setInnerUnit] = useState(
    unit ?? (units?.[0] != null ? unitName(units[0]) : 'EA'),
  );
  const currentUnit = unit ?? innerUnit;
  // − / + 로 바뀐 값만 읽는다(직접 친 숫자는 화면 낭독기가 이미 읽는다)
  const [announce, setAnnounce] = useState('');
  // 환산(PG-38): 고른 단위가 기준 단위가 아니고 factor가 있으면 칸 아래에 기준 수량을 보인다
  const [shown, setShown] = useState<number | null>(value ?? defaultValue ?? null);
  const current = value !== undefined ? value : shown;
  const base = baseUnitOf(units);
  const baseQty =
    base && base.unit !== currentUnit ? toBaseQuantity(current, currentUnit, units) : null;
  const baseId = useId();
  const baseText = (q: number) => formatQuantity(q, base?.unit ?? '', decimalsOf(q));
  const describedBy = [field.describedBy, baseQty != null ? baseId : undefined]
    .filter(Boolean)
    .join(' ');
  return (
    <NF.Root
      className={cx('tl-quantity-input', className)}
      id={field.id}
      data-size={size}
      data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
      data-converted={baseQty != null || undefined}
      {...(value !== undefined ? { value } : {})}
      {...(defaultValue != null ? { defaultValue } : {})}
      onValueChange={(v, details) => {
        if (details.reason === 'increment-press' || details.reason === 'decrement-press') {
          const b =
            base && base.unit !== currentUnit ? toBaseQuantity(v, currentUnit, units) : null;
          const text = v == null ? '' : formatQuantity(v, currentUnit, digits);
          setAnnounce(
            b == null ? text : t('quantityInput.announceBase', { value: text, base: baseText(b) }),
          );
        }
        setShown(v);
        onChange?.(v);
      }}
      min={min}
      {...(max != null ? { max } : {})}
      step={step}
      largeStep={step * 10}
      format={{ minimumFractionDigits: digits, maximumFractionDigits: digits }}
      locale="ko-KR"
      disabled={field.disabled}
      required={field.required}
      name={name}
    >
      <NF.Group className="tl-quantity-input__box">
        {showStepper && (
          <NF.Decrement
            render={
              <IconButton
                icon="minus"
                label={t('quantityInput.decrease')}
                size="sm"
                className="tl-quantity-input__step"
              />
            }
          />
        )}
        <NF.Input
          className="tl-quantity-input__control"
          data-testid={testID}
          aria-roledescription={t('quantityInput.role')}
          aria-invalid={field.invalid || undefined}
          aria-describedby={describedBy || undefined}
          aria-label={field.labelId ? undefined : label}
        />
        {units && units.length > 0 ? (
          <span className="tl-quantity-input__unit-picker">
            <select
              className="tl-quantity-input__unit-select tl-focusable"
              aria-label={t('quantityInput.unit')}
              value={currentUnit}
              disabled={field.disabled}
              onChange={(e) => {
                if (unit === undefined) setInnerUnit(e.target.value);
                onUnitChange?.(e.target.value);
              }}
            >
              {units.map((u) => (
                <option key={unitName(u)} value={unitName(u)}>
                  {unitName(u)}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" className="tl-quantity-input__unit-chevron" />
          </span>
        ) : (
          <span className="tl-quantity-input__unit">{currentUnit}</span>
        )}
        {showStepper && (
          <NF.Increment
            render={
              <IconButton
                icon="plus"
                label={t('quantityInput.increase')}
                size="sm"
                className="tl-quantity-input__step"
              />
            }
          />
        )}
      </NF.Group>
      {baseQty != null && (
        <span className="tl-quantity-input__base" id={baseId}>
          <span className="tl-sr-only">{t('quantityInput.base')} </span>
          <span aria-hidden="true">= </span>
          {baseText(baseQty)}
        </span>
      )}
      <span className="tl-sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </span>
    </NF.Root>
  );
}
QuantityInput.displayName = QuantityInputContract.name;

/** 기준 수량 소수 자릿수: 정수면 0, 아니면 3자리까지(0.5KG × 3 = 1.5KG) */
function decimalsOf(q: number): number {
  if (Number.isInteger(q)) return 0;
  return Math.min(3, String(q).split('.')[1]?.length ?? 0);
}
