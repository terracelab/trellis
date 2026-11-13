import { SelectContract, type SelectProps } from '@terracelab/trellis-contracts';
import { useId, useState } from 'react';
import { Select as S } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { OptionMark } from '../_internal/option-mark.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { Icon } from '../Icon/Icon.js';
import { useMessages } from '../_internal/locale.js';

export function Select({
  options,
  value,
  defaultValue,
  onChange,
  placeholder: placeholderProp,
  size = 'md',
  disabled,
  invalid,
  required,
  name,
  width = 'full',
  label,
  id,
  testID,
  className,
}: SelectProps & { className?: string }) {
  const t = useMessages();
  const placeholder = placeholderProp ?? t('select.placeholder');
  const field = useFieldControl({ id, invalid, required, disabled });
  const sheet = useSheetMode();
  const valueId = useId();
  const [inner, setInner] = useState<string | null>(defaultValue ?? null);
  const current = value === undefined ? inner : value;
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === current);
  const choose = (next: string | null) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const trigger = {
    className: cx('tl-select', 'tl-focusable', className),
    id: field.id,
    'data-testid': testID,
    'data-size': size,
    'data-width': width,
    'data-state': field.invalid ? 'error' : undefined,
    'aria-invalid': field.invalid || undefined,
    'aria-describedby': field.describedBy,
    'aria-label': field.labelId ? undefined : label,
    'aria-labelledby': field.labelId,
  };

  if (sheet) {
    const title = field.labelText ?? label ?? placeholder;
    return (
      <>
        <button
          {...trigger}
          type="button"
          disabled={field.disabled}
          data-disabled={field.disabled || undefined}
          data-popup-open={open || undefined}
          // 버튼은 aria-label이 내용을 덮는다. 이름 + 지금 값을 함께 읽게 한다(WCAG 2.5.3)
          aria-label={
            field.labelId ? undefined : label && `${label} ${selected?.label ?? placeholder}`
          }
          aria-labelledby={field.labelId ? `${field.labelId} ${valueId}` : undefined}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <OptionMark leading={selected?.leading} />
          <span
            id={valueId}
            className="tl-select__value"
            data-placeholder={selected ? undefined : ''}
          >
            {selected?.label ?? placeholder}
          </span>
          <span className="tl-select__chevron" aria-hidden="true">
            <Icon name="chevron-down" />
          </span>
        </button>
        {name && <input type="hidden" name={name} value={current ?? ''} />}
        <Sheet open={open} onOpenChange={setOpen} title={title}>
          {options.length === 0 ? (
            <p className="tl-select__empty" role="status">
              {t('select.empty')}
            </p>
          ) : (
            <div className="tl-sheet-options" role="radiogroup" aria-label={title}>
              {options.map((o) => {
                const checked = o.value === current;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    disabled={o.disabled}
                    className="tl-sheet-option tl-focusable"
                    onClick={() => {
                      choose(o.value);
                      setOpen(false);
                    }}
                  >
                    <OptionMark leading={o.leading} />
                    <span className="tl-sheet-option__label">{o.label}</span>
                    {o.note && <span className="tl-select__note">{o.note}</span>}
                    {checked && <Icon name="check" className="tl-sheet-option__check" />}
                  </button>
                );
              })}
            </div>
          )}
        </Sheet>
      </>
    );
  }

  const items = options.map((o) => ({ value: o.value, label: o.label }));
  return (
    <S.Root
      items={items}
      value={current}
      onValueChange={(v) => choose((v as string | null) ?? null)}
      open={open}
      onOpenChange={setOpen}
      disabled={field.disabled}
      required={field.required}
      name={name}
    >
      <S.Trigger {...trigger}>
        <OptionMark leading={selected?.leading} />
        <S.Value className="tl-select__value" placeholder={placeholder} />
        <S.Icon className="tl-select__chevron">
          <Icon name="chevron-down" />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Positioner className="tl-select__positioner" sideOffset={4} alignItemWithTrigger={false}>
          <S.Popup className="tl-select__popup">
            {/* 선택지가 0개면 빈 목록 대신 안내 한 줄(필터 결과 · 권한으로 비는 경우) */}
            {options.length === 0 && (
              <p className="tl-select__empty" role="status">
                {t('select.empty')}
              </p>
            )}
            <S.List hidden={options.length === 0}>
              {options.map((o) => (
                <S.Item
                  key={o.value}
                  value={o.value}
                  disabled={o.disabled}
                  className="tl-select__item"
                >
                  <span className="tl-select__item-label">
                    <OptionMark leading={o.leading} />
                    <S.ItemText>{o.label}</S.ItemText>
                  </span>
                  {o.note && <span className="tl-select__note">{o.note}</span>}
                  {/* 고르지 않은 줄에도 자리를 잡아 둔다(note가 줄마다 같은 끝에 선다) */}
                  <S.ItemIndicator className="tl-select__check" keepMounted>
                    <Icon name="check" />
                  </S.ItemIndicator>
                </S.Item>
              ))}
            </S.List>
          </S.Popup>
        </S.Positioner>
      </S.Portal>
    </S.Root>
  );
}
Select.displayName = SelectContract.name;
