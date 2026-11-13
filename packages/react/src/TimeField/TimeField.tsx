import {
  parseTimeText,
  TimeFieldContract,
  timeOptions,
  timeToMinutes,
  type TimeFieldProps,
} from '@terracelab/trellis-contracts';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { Popover as P } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { useFieldControl, useFieldMessage } from '../_internal/field.js';
import { useMessages } from '../_internal/locale.js';
import { OwnErrorNote } from '../_internal/own-note.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { Icon } from '../Icon/Icon.js';
import { durationText } from '../TimeClock/time.js';

export type TimeFieldWebProps = TimeFieldProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    keyof TimeFieldProps | 'children' | 'type' | 'size' | 'value' | 'defaultValue' | 'onChange'
  > & {
    className?: string;
    ref?: Ref<HTMLInputElement>;
  };

/** 목록에서 v에 가장 가까운 시각의 자리(같으면 그 자리). v가 없으면 -1 */
function nearest(options: readonly string[], v: string | null): number {
  if (!v || options.length === 0) return -1;
  const target = timeToMinutes(v);
  if (Number.isNaN(target)) return -1;
  let best = 0;
  options.forEach((o, i) => {
    if (Math.abs(timeToMinutes(o) - target) < Math.abs(timeToMinutes(options[best]!) - target))
      best = i;
  });
  return best;
}

/**
 * 시각 입력. 글자로 치거나(930 → 09:30) 목록에서 고른다(step 간격, 기본 30분).
 * 입력 칸은 콤보박스(aria-activedescendant)이고 목록은 칸 아래 팝업, 좁은 화면은 아래 시트다
 */
export function TimeField({
  value,
  defaultValue,
  onChange,
  step = 30,
  min = '00:00',
  max = '23:59',
  durationFrom,
  disabled,
  invalid,
  required,
  size = 'md',
  name,
  label,
  id,
  testID,
  className,
  ref,
  placeholder = 'HH:MM',
  'aria-describedby': ownDescribedBy,
  onBlur,
  onKeyDown,
  ...rest
}: TimeFieldWebProps) {
  const t = useMessages();
  const field = useFieldControl({ id, invalid, required, disabled });
  const sheet = useSheetMode();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();
  const noteId = useId();
  const [inner, setInner] = useState<string | null>(defaultValue ?? null);
  const current = value === undefined ? inner : value;
  const [text, setText] = useState(current ?? '');
  // 바깥에서 값이 바뀌면 칸 글자도 따라간다(치는 중인 글자는 값이 바뀔 때만 덮는다)
  const [seen, setSeen] = useState(current);
  if (seen !== current) {
    setSeen(current);
    setText(current ?? '');
  }
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [problem, setProblem] = useState<'format' | 'range' | null>(null);
  const options = useMemo(() => timeOptions(step, min, max), [step, min, max]);
  const from = durationFrom ? timeToMinutes(durationFrom) : Number.NaN;

  const commit = (next: string | null) => {
    if (next !== current) {
      if (value === undefined) setInner(next);
      onChange?.(next);
    }
  };
  const choose = (time: string) => {
    setText(time);
    setProblem(null);
    commit(time);
    setOpen(false);
    setActive(-1);
  };
  /** 친 글자를 값으로: 비면 null, 못 읽으면 형식 오류, 범위 밖이면 범위 오류(값은 그대로) */
  const commitText = () => {
    const raw = text.trim();
    if (!raw) {
      setProblem(null);
      commit(null);
      return;
    }
    const parsed = parseTimeText(raw);
    if (!parsed) {
      setProblem('format');
      return;
    }
    const v = timeToMinutes(parsed);
    if (v < timeToMinutes(min) || v > timeToMinutes(max)) {
      setText(parsed);
      setProblem('range');
      return;
    }
    setText(parsed);
    setProblem(null);
    commit(parsed);
  };

  const openList = (highlight: boolean) => {
    if (field.disabled || options.length === 0) return;
    setOpen(true);
    if (highlight) {
      const at = nearest(options, parseTimeText(text) ?? current);
      setActive(at >= 0 ? at : 0);
    }
  };

  // 열 때 · 가리킨 행이 바뀔 때 목록을 그 행으로 굴린다(가리킨 행이 없으면 지금 값 근처를 가운데로)
  useEffect(() => {
    if (!open || sheet) return;
    const list = listRef.current;
    if (!list) return;
    const at = active >= 0 ? active : nearest(options, parseTimeText(text) ?? current);
    const el = at >= 0 ? (list.children[at] as HTMLElement | undefined) : undefined;
    el?.scrollIntoView?.({ block: active >= 0 ? 'nearest' : 'center' });
  }, [open, sheet, active, options, text, current]);

  // 시트는 고른 시각(없으면 가까운 시각)에 초점을 두고 연다
  useEffect(() => {
    if (!open || !sheet) return;
    const id = window.setTimeout(() => {
      const at = nearest(options, current ?? parseTimeText(text));
      const el =
        sheetRef.current?.querySelectorAll<HTMLButtonElement>('button[role="radio"]')[
          Math.max(0, at)
        ];
      el?.scrollIntoView?.({ block: 'center' });
      el?.focus();
    }, 0);
    return () => window.clearTimeout(id);
    // 열 때 한 번만(고른 뒤 다시 굴리지 않는다)
  }, [open, sheet]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || sheet) {
      if (sheet && e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    const last = options.length - 1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open || active < 0) {
        openList(true);
        return;
      }
      setActive((a) => Math.min(last, Math.max(0, a + (e.key === 'ArrowDown' ? 1 : -1))));
    } else if (open && (e.key === 'Home' || e.key === 'End')) {
      e.preventDefault();
      setActive(e.key === 'Home' ? 0 : last);
    } else if (e.key === 'Enter') {
      if (open && active >= 0 && options[active]) {
        e.preventDefault();
        choose(options[active]);
      } else {
        commitText();
        setOpen(false);
      }
    } else if (e.key === 'Escape' && open) {
      // 대화 상자 안이어도 목록만 닫는다
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setActive(-1);
    }
  };

  const message =
    problem === 'format'
      ? t('timeField.invalid')
      : problem === 'range'
        ? t('timeField.range', { min, max })
        : null;
  const inField = useFieldMessage(message);
  const ownNote = message && !inField ? noteId : undefined;
  const isInvalid = field.invalid || Boolean(message);
  const describedBy = [field.describedBy, ownNote, ownDescribedBy].filter(Boolean).join(' ');
  const title = field.labelText ?? label ?? t('timeField.title');
  const optionId = (i: number) => `${listId}-o${i}`;
  const showList = open && !sheet;
  const durationOf = (o: string) => {
    const d = timeToMinutes(o) - from;
    return Number.isNaN(d) || d <= 0 ? null : durationText(t, d);
  };

  const setInput = useCallback(
    (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  return (
    <>
      <span
        ref={rootRef}
        className={cx('tl-time-field', className)}
        data-size={size}
        data-state={isInvalid ? 'error' : field.disabled ? 'disabled' : undefined}
        data-empty={!text || undefined}
      >
        <input
          {...rest}
          ref={setInput}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          placeholder={placeholder}
          className="tl-time-field__control"
          id={field.id}
          data-testid={testID}
          value={text}
          disabled={field.disabled}
          required={field.required}
          {...(sheet
            ? {}
            : {
                role: 'combobox',
                'aria-expanded': showList,
                'aria-controls': showList ? listId : undefined,
                'aria-autocomplete': 'none' as const,
                'aria-activedescendant': showList && active >= 0 ? optionId(active) : undefined,
              })}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy || undefined}
          aria-label={field.labelId ? undefined : label}
          onChange={(e) => {
            setText(e.currentTarget.value);
            setActive(-1);
            if (problem) setProblem(null);
          }}
          onBlur={(e) => {
            commitText();
            setOpen(false);
            setActive(-1);
            onBlur?.(e);
          }}
          onKeyDown={onKey}
        />
        {name && <input type="hidden" name={name} value={current ?? ''} />}
        <button
          type="button"
          className="tl-time-field__picker tl-focusable"
          aria-label={t('timeField.open')}
          aria-haspopup={sheet ? 'dialog' : 'listbox'}
          aria-expanded={open}
          // 넓은 화면은 입력 칸이 목록을 다룬다(Tab은 입력 칸에서 다음 칸으로)
          tabIndex={sheet ? undefined : -1}
          disabled={field.disabled}
          onMouseDown={(e) => {
            if (!sheet) e.preventDefault();
          }}
          onClick={() => {
            if (sheet) {
              setOpen(true);
              return;
            }
            inputRef.current?.focus();
            if (open) {
              setOpen(false);
              setActive(-1);
            } else openList(false);
          }}
        >
          <Icon name="clock" />
        </button>
        {!sheet && (
          <P.Root
            open={showList}
            onOpenChange={(next, details) => {
              if (next) return;
              // 칸 안(입력 · 시계 단추)을 누른 것은 바깥 누름이 아니다
              const target = details?.event?.target;
              if (target instanceof Node && rootRef.current?.contains(target)) return;
              setOpen(false);
              setActive(-1);
            }}
          >
            <P.Portal>
              <P.Positioner
                className="tl-time-field__positioner"
                anchor={rootRef}
                sideOffset={4}
                align="start"
              >
                <P.Popup className="tl-time-field__popup" initialFocus={false} finalFocus={false}>
                  <ul
                    ref={listRef}
                    className="tl-time-field__list"
                    id={listId}
                    role="listbox"
                    aria-label={title}
                  >
                    {options.map((o, i) => {
                      const note = durationFrom ? durationOf(o) : null;
                      return (
                        <li
                          key={o}
                          id={optionId(i)}
                          role="option"
                          aria-selected={i === active}
                          className="tl-time-field__option"
                          data-highlighted={i === active || undefined}
                          data-current={o === current || undefined}
                          // 누르는 동안 입력 칸이 초점을 잃지 않게 한다
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseMove={() => setActive(i)}
                          onClick={() => choose(o)}
                        >
                          <span className="tl-time-field__time">{o}</span>
                          {note && <span className="tl-time-field__note">{note}</span>}
                          {o === current && <Icon name="check" className="tl-time-field__check" />}
                        </li>
                      );
                    })}
                  </ul>
                </P.Popup>
              </P.Positioner>
            </P.Portal>
          </P.Root>
        )}
      </span>
      {sheet && (
        <Sheet open={open} onOpenChange={setOpen} title={title}>
          <div ref={sheetRef} className="tl-sheet-options" role="radiogroup" aria-label={title}>
            {options.map((o) => {
              const checked = o === current;
              const note = durationFrom ? durationOf(o) : null;
              return (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  className="tl-sheet-option tl-focusable"
                  onClick={() => choose(o)}
                >
                  <span className="tl-sheet-option__label tl-time-field__time">{o}</span>
                  {note && <span className="tl-time-field__note">{note}</span>}
                  {checked && <Icon name="check" className="tl-sheet-option__check" />}
                </button>
              );
            })}
          </div>
        </Sheet>
      )}
      {ownNote && message && <OwnErrorNote id={ownNote} message={message} />}
    </>
  );
}
TimeField.displayName = TimeFieldContract.name;
