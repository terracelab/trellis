import {
  SelectableCardContract,
  type SelectableCardMultipleProps,
  type SelectableCardOption,
  type SelectableCardSingleProps,
} from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import {
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { Icon } from '../Icon/Icon.js';

export type SelectableCardWebOption = Omit<SelectableCardOption, 'icon' | 'meta' | 'content'> & {
  /** 아이콘 이름 또는 요소(색 견본 · 로고) */
  icon?: IconName | ReactElement;
  meta?: ReactNode;
  content?: ReactNode;
};

type WebOnly = { options: readonly SelectableCardWebOption[]; className?: string };

export type SelectableCardWebProps =
  | (Omit<SelectableCardSingleProps, 'options'> & WebOnly)
  | (Omit<SelectableCardMultipleProps, 'options'> & WebOnly);

const toList = (v: string | null | readonly string[] | undefined): readonly string[] =>
  v == null ? [] : typeof v === 'string' ? [v] : v;

const PREV = new Set(['ArrowUp', 'ArrowLeft']);
const NEXT = new Set(['ArrowDown', 'ArrowRight']);

export function SelectableCard(props: SelectableCardWebProps) {
  const {
    options,
    columns = 'auto',
    disabled,
    invalid,
    required,
    name,
    label,
    id,
    testID,
    className,
  } = props;
  const multiple = props.mode === 'multiple';
  const field = useFieldControl({ id, invalid, required, disabled });
  const base = useId();
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  // 값은 안에서 배열 하나로 다룬다(single은 길이 0 또는 1)
  const [inner, setInner] = useState<readonly string[]>(() => toList(props.defaultValue));
  const controlled = props.value !== undefined;
  const current = controlled ? toList(props.value) : inner;

  const commit = (next: string[]) => {
    if (!controlled) setInner(next);
    if (props.mode === 'multiple') props.onChange?.(next);
    else if (next[0] !== undefined) props.onChange?.(next[0]);
  };
  const off = (o: SelectableCardWebOption) => field.disabled || Boolean(o.disabled);
  const enabled = options.flatMap((o, i) => (off(o) ? [] : [i]));
  const picked = options.findIndex((o) => current.includes(o.value));
  // single: Tab으로 들어오면 고른 카드, 없으면 첫 카드(roving tabindex)
  const tabStop = picked >= 0 && enabled.includes(picked) ? picked : (enabled[0] ?? -1);

  const choose = (i: number) => {
    const o = options[i];
    if (!o || off(o)) return;
    if (multiple) {
      const set = new Set(current);
      if (set.has(o.value)) set.delete(o.value);
      else set.add(o.value);
      // 옵션 순서로 넘긴다. 옵션에 없는 값(서버에서 온 값)은 뒤에 그대로 둔다
      commit([
        ...options.filter((x) => set.has(x.value)).map((x) => x.value),
        ...current.filter((v) => set.has(v) && !options.some((x) => x.value === v)),
      ]);
    } else if (current.length !== 1 || current[0] !== o.value) commit([o.value]);
  };

  const move = (from: number, step: 1 | -1) => {
    if (enabled.length === 0) return;
    const at = enabled.indexOf(from);
    const to = enabled[(at + step + enabled.length) % enabled.length] ?? enabled[0]!;
    refs.current[to]?.focus();
    choose(to);
  };

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      choose(i);
    } else if (!multiple && (PREV.has(e.key) || NEXT.has(e.key))) {
      e.preventDefault();
      move(i, PREV.has(e.key) ? -1 : 1);
    }
  };

  // 오류 요약 · 라벨에서 묶음으로 포커스가 오면 카드로 넘긴다
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const to = multiple ? enabled[0] : tabStop;
    if (to !== undefined && to >= 0) refs.current[to]?.focus();
  };
  // 카드 사이 빈 곳을 눌러 묶음에 포커스가 가지 않게
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('.tl-selectable-card__item')) e.preventDefault();
  };

  return (
    <div
      className={cx('tl-selectable-card', className)}
      role={multiple ? 'group' : 'radiogroup'}
      id={field.id}
      data-testid={testID}
      data-mode={multiple ? 'multiple' : 'single'}
      data-columns={String(columns)}
      data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
      aria-labelledby={field.labelId}
      aria-label={field.labelId ? undefined : label}
      aria-describedby={field.describedBy}
      aria-invalid={(!multiple && field.invalid) || undefined}
      aria-required={(!multiple && field.required) || undefined}
      aria-disabled={field.disabled || undefined}
      tabIndex={-1}
      onFocus={onFocus}
      onMouseDown={onMouseDown}
    >
      <div className="tl-selectable-card__grid">
        {options.map((o, i) => {
          const selected = current.includes(o.value);
          const disabledCard = off(o);
          const ids = {
            title: `${base}-${i}-title`,
            meta: o.meta != null ? `${base}-${i}-meta` : undefined,
            description: o.description ? `${base}-${i}-desc` : undefined,
            content: o.content != null ? `${base}-${i}-content` : undefined,
          };
          const describedBy = [ids.meta, ids.description, ids.content].filter(Boolean).join(' ');
          return (
            <div
              key={o.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="tl-selectable-card__item tl-focusable"
              role={multiple ? 'checkbox' : 'radio'}
              aria-checked={selected}
              aria-disabled={disabledCard || undefined}
              aria-invalid={(multiple && field.invalid) || undefined}
              aria-labelledby={ids.title}
              aria-describedby={describedBy || undefined}
              tabIndex={disabledCard ? -1 : multiple || i === tabStop ? 0 : -1}
              data-selected={selected || undefined}
              data-disabled={disabledCard || undefined}
              onClick={() => choose(i)}
              onKeyDown={onKeyDown(i)}
            >
              <div className="tl-selectable-card__head">
                {o.icon != null && (
                  <span className="tl-selectable-card__icon">
                    {typeof o.icon === 'string' ? <Icon name={o.icon} size={20} /> : o.icon}
                  </span>
                )}
                <span className="tl-selectable-card__title" id={ids.title}>
                  {o.title}
                </span>
                {o.meta != null && (
                  <span className="tl-selectable-card__meta" id={ids.meta}>
                    {o.meta}
                  </span>
                )}
                <span className="tl-selectable-card__check" aria-hidden="true">
                  <Icon name="check" size={16} />
                </span>
              </div>
              {o.description && (
                <p className="tl-selectable-card__description" id={ids.description}>
                  {o.description}
                </p>
              )}
              {o.content != null && (
                <div className="tl-selectable-card__content" id={ids.content}>
                  {o.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {name &&
        (multiple ? (
          current.map((v) => <input key={v} type="hidden" name={name} value={v} />)
        ) : (
          <input type="hidden" name={name} value={current[0] ?? ''} />
        ))}
    </div>
  );
}
SelectableCard.displayName = SelectableCardContract.name;
