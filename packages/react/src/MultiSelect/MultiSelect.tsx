import {
  MultiSelectContract,
  multiSelectSummary,
  type MultiSelectProps,
} from '@terracelab/trellis-contracts';
import { useId, useState } from 'react';
import { Select as S } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { OptionMark } from '../_internal/option-mark.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { useLocale, useMessages } from '../_internal/locale.js';

const EMPTY: readonly string[] = [];

export function MultiSelect({
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
}: MultiSelectProps & { className?: string }) {
  const t = useMessages();
  const locale = useLocale();
  const placeholder = placeholderProp ?? t('multiSelect.placeholder');
  const field = useFieldControl({ id, invalid, required, disabled });
  const sheet = useSheetMode();
  const valueId = useId();
  const [inner, setInner] = useState<readonly string[]>(defaultValue ?? EMPTY);
  const current = value === undefined ? inner : value;
  const [open, setOpen] = useState(false);
  // 선택지 순서로 돌려준다(누른 순서와 상관없이 같은 값이 같은 배열)
  const commit = (next: readonly string[]) => {
    const ordered = options.map((o) => o.value).filter((v) => next.includes(v));
    if (value === undefined) setInner(ordered);
    onChange?.(ordered);
  };
  const summary = multiSelectSummary(options, current, placeholder, locale);
  const empty = current.length === 0;
  // 닫힌 칸의 앞 표시 = 요약 글자에 이름이 보이는 첫 선택지의 표시
  const first = options.find((o) => current.includes(o.value));
  const trigger = {
    className: cx('tl-select', 'tl-multi-select', 'tl-focusable', className),
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
          aria-label={field.labelId ? undefined : label && `${label} ${summary}`}
          aria-labelledby={field.labelId ? `${field.labelId} ${valueId}` : undefined}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <OptionMark leading={first?.leading} />
          <span id={valueId} className="tl-select__value" data-placeholder={empty ? '' : undefined}>
            {summary}
          </span>
          <span className="tl-select__chevron" aria-hidden="true">
            <Icon name="chevron-down" />
          </span>
        </button>
        {name && current.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
        <Sheet
          open={open}
          onOpenChange={setOpen}
          title={title}
          footer={
            <>
              <Button variant="secondary" disabled={empty} onPress={() => commit(EMPTY)}>
                {t('multiSelect.clear')}
              </Button>
              <Button variant="primary" onPress={() => setOpen(false)}>
                {t('common.done')}
              </Button>
            </>
          }
        >
          {options.length === 0 ? (
            <p className="tl-select__empty" role="status">
              {t('select.empty')}
            </p>
          ) : (
            <div className="tl-sheet-options" role="group" aria-label={title}>
              {options.map((o) => {
                const checked = current.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    disabled={o.disabled}
                    className="tl-sheet-option tl-focusable"
                    onClick={() =>
                      commit(checked ? current.filter((v) => v !== o.value) : [...current, o.value])
                    }
                  >
                    <span className="tl-multi-select__box" data-checked={checked || undefined}>
                      {checked && <Icon name="check" />}
                    </span>
                    <OptionMark leading={o.leading} />
                    <span className="tl-sheet-option__label">{o.label}</span>
                    {o.note && <span className="tl-select__note">{o.note}</span>}
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
      multiple
      items={items}
      value={current as string[]}
      onValueChange={(v) => commit((v as string[] | null) ?? EMPTY)}
      open={open}
      onOpenChange={setOpen}
      disabled={field.disabled}
      required={field.required}
      name={name}
    >
      <S.Trigger {...trigger}>
        <OptionMark leading={first?.leading} />
        <S.Value className="tl-select__value" data-placeholder={empty ? '' : undefined}>
          {() => summary}
        </S.Value>
        <S.Icon className="tl-select__chevron">
          <Icon name="chevron-down" />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Positioner className="tl-select__positioner" sideOffset={4} alignItemWithTrigger={false}>
          <S.Popup className="tl-select__popup">
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
                  className="tl-select__item tl-multi-select__item"
                >
                  <span className="tl-multi-select__box">
                    <S.ItemIndicator className="tl-multi-select__check">
                      <Icon name="check" />
                    </S.ItemIndicator>
                  </span>
                  <span className="tl-select__item-label">
                    <OptionMark leading={o.leading} />
                    <S.ItemText className="tl-multi-select__text">{o.label}</S.ItemText>
                  </span>
                  {o.note && <span className="tl-select__note">{o.note}</span>}
                </S.Item>
              ))}
            </S.List>
          </S.Popup>
        </S.Positioner>
      </S.Portal>
    </S.Root>
  );
}
MultiSelect.displayName = MultiSelectContract.name;
