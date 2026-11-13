import {
  CheckboxGroupContract,
  type CheckboxGroupChange,
  type CheckboxGroupOption,
  type CheckboxGroupProps,
} from '@terracelab/trellis-contracts';
import {
  useId,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { chartColor } from '../_internal/chart/colors.js';
import { CheckboxOptionContext } from '../_internal/checkbox-option.js';
import { cx } from '../_internal/cx.js';
import { FieldContext, useFieldControl } from '../_internal/field.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';

export type CheckboxGroupWebOption = Omit<CheckboxGroupOption, 'meta'> & {
  /** 줄 끝 보조 정보(건수 · 배지 · 링크). 라벨 밖이라 링크를 넣을 수 있다 */
  meta?: ReactNode;
};

export type CheckboxGroupWebProps = Omit<CheckboxGroupProps, 'options'> & {
  options: readonly CheckboxGroupWebOption[];
  className?: string;
};

export function CheckboxGroup({
  options,
  value,
  defaultValue,
  onChange,
  pending,
  orientation = 'vertical',
  selectAll = false,
  maxVisible,
  disabled,
  invalid,
  required,
  name,
  label,
  id,
  testID,
  className,
}: CheckboxGroupWebProps) {
  const t = useMessages();
  const field = useFieldControl({ id, invalid, required, disabled });
  const allLabel = typeof selectAll === 'string' ? selectAll : t('common.all');
  // 묶음(group)에는 aria-required가 없다. Field 밖이면 이름 뒤에 "(필수)"를 붙여 읽게 한다(Field 라벨과 같은 방식)
  const ownName = label && field.required ? `${label}${t('common.required')}` : label;
  const listId = useId();
  const [inner, setInner] = useState<readonly string[]>(defaultValue ?? []);
  const [expanded, setExpanded] = useState(false);
  const current = value ?? inner;
  const chosen = new Set(current);
  // 저장 중인 선택지(바로 저장): loading이고 끝날 때까지 누를 수 없다
  const saving = new Set(pending ?? []);

  const commit = (next: Set<string>, change: CheckboxGroupChange) => {
    // 옵션 순서로 넘긴다. 옵션에 없는 값(서버에서 온 값)은 뒤에 그대로 둔다
    const ordered = [
      ...options.filter((o) => next.has(o.value)).map((o) => o.value),
      ...current.filter((v) => next.has(v) && !options.some((o) => o.value === v)),
    ];
    if (value === undefined) setInner(ordered);
    onChange?.(ordered, change);
  };
  const toggle = (v: string, on: boolean) => {
    if (saving.has(v)) return;
    const next = new Set(current);
    if (on) next.add(v);
    else next.delete(v);
    commit(next, { values: [v], checked: on });
  };

  const off = (o: { disabled?: boolean }) => field.disabled || Boolean(o.disabled);
  // "전체"는 고를 수 있는 것만 켜고 끈다(비활성 선택지의 값은 그대로 둔다)
  const enabled = options.filter((o) => !off(o));
  const allOn = enabled.length > 0 && enabled.every((o) => chosen.has(o.value));
  const someOn = options.some((o) => chosen.has(o.value));
  // 고를 수 있는 선택지 중 하나라도 저장 중이면 전체 선택도 저장 중(누르면 저장 중인 값과 부딪친다)
  const allBusy = enabled.some((o) => saving.has(o.value));
  const setAll = (on: boolean) => {
    if (allBusy) return;
    const changed = enabled.filter((o) => chosen.has(o.value) !== on).map((o) => o.value);
    if (changed.length === 0) return;
    const next = new Set(current);
    for (const v of changed) {
      if (on) next.add(v);
      else next.delete(v);
    }
    commit(next, { values: changed, checked: on });
  };
  const hasMeta = options.some((o) => o.meta != null);

  const limit = maxVisible && maxVisible > 0 && options.length > maxVisible ? maxVisible : null;
  const hiddenCount = limit ? options.length - limit : 0;

  // 오류 요약 · 라벨에서 묶음으로 포커스가 오면 첫 체크박스로 넘긴다
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    e.currentTarget.querySelector<HTMLElement>('[role="checkbox"]:not([data-disabled])')?.focus();
  };
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) e.preventDefault();
  };

  return (
    <div
      className={cx('tl-checkbox-group', className)}
      role="group"
      id={field.id}
      data-testid={testID}
      data-orientation={orientation}
      data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
      data-required={field.required || undefined}
      data-meta={hasMeta || undefined}
      aria-labelledby={field.labelId}
      aria-label={field.labelId ? undefined : ownName}
      aria-describedby={field.describedBy}
      tabIndex={-1}
      onFocus={onFocus}
      onMouseDown={onMouseDown}
    >
      {/* 안의 Checkbox가 Field의 id · 필수를 가져가지 않게 끊는다(이름 · 오류는 묶음이 가진다) */}
      <FieldContext.Provider value={null}>
        {selectAll !== false && selectAll !== '' && (
          <span className="tl-checkbox-group__all" data-state={allBusy ? 'loading' : undefined}>
            <CheckboxOptionContext.Provider value={allBusy ? { busy: true } : null}>
              <Checkbox
                checked={allOn}
                indeterminate={!allOn && someOn}
                disabled={enabled.length === 0}
                invalid={field.invalid}
                onChange={setAll}
              >
                {allLabel}
              </Checkbox>
            </CheckboxOptionContext.Provider>
          </span>
        )}
        <div className="tl-checkbox-group__options" id={listId}>
          {options.map((o, i) => {
            // 줄 끝 정보는 라벨 밖(링크를 눌러도 상자가 바뀌지 않는다)이고 상자의 설명으로 잇는다
            const metaId = o.meta != null ? `${listId}-${i}-meta` : undefined;
            const busy = saving.has(o.value) && !off(o);
            return (
              <span
                key={o.value}
                className="tl-checkbox-group__option"
                data-value={o.value}
                data-state={busy ? 'loading' : undefined}
                hidden={limit !== null && !expanded && i >= limit}
              >
                <CheckboxOptionContext.Provider
                  value={busy || metaId ? { busy, describedBy: metaId } : null}
                >
                  <Checkbox
                    checked={chosen.has(o.value)}
                    disabled={off(o)}
                    invalid={field.invalid}
                    name={name}
                    value={o.value}
                    description={o.description}
                    onChange={(on) => toggle(o.value, on)}
                  >
                    {o.color && (
                      <span
                        className="tl-checkbox-group__dot"
                        style={
                          { '--tl-checkbox-group-color': chartColor(o.color) } as CSSProperties
                        }
                        aria-hidden="true"
                      />
                    )}
                    {o.label}
                  </Checkbox>
                </CheckboxOptionContext.Provider>
                {metaId && (
                  <span className="tl-checkbox-group__meta" id={metaId}>
                    {o.meta}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </FieldContext.Provider>
      {limit !== null && (
        <button
          type="button"
          className="tl-checkbox-group__more tl-focusable"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((x) => !x)}
        >
          {expanded ? t('checkboxGroup.less') : t('checkboxGroup.more', { count: hiddenCount })}
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} />
        </button>
      )}
    </div>
  );
}
CheckboxGroup.displayName = CheckboxGroupContract.name;
