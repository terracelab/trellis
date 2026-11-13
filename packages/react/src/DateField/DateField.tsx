import {
  DateFieldContract,
  formatDate,
  type DateFieldOutOfRange,
  type DateFieldProps,
} from '@terracelab/trellis-contracts';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type Ref,
} from 'react';
import { Popover as P } from '../_headless/index.js';
import { Calendar } from '../_internal/calendar.js';
import { cx } from '../_internal/cx.js';
import { useDateText } from '../_internal/date-text.js';
import { useFieldControl, useFieldMessage } from '../_internal/field.js';
import { OwnErrorNote } from '../_internal/own-note.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { Icon } from '../Icon/Icon.js';
import { useMessages } from '../_internal/locale.js';

export type DateFieldWebProps = DateFieldProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    keyof DateFieldProps | 'children' | 'type' | 'size' | 'value' | 'defaultValue' | 'onChange'
  > & {
    className?: string;
    ref?: Ref<HTMLInputElement>;
  };

export function DateField({
  value,
  defaultValue,
  onChange,
  min,
  max,
  outOfRangeText,
  onOutOfRangeChange,
  today,
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
  placeholder = 'YYYY-MM-DD',
  'aria-describedby': ownDescribedBy,
  onBlur,
  onKeyDown,
  ...rest
}: DateFieldWebProps) {
  const t = useMessages();
  const field = useFieldControl({ id, invalid, required, disabled });
  const sheet = useSheetMode();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const [inner, setInner] = useState<string | null>(defaultValue ?? null);
  const current = value === undefined ? inner : value;
  const [open, setOpen] = useState(false);
  const commit = (next: string | null) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const text = useDateText({ current, commit, min, max });
  const pick = (iso: string) => {
    text.set(iso);
    commit(iso);
    setOpen(false);
  };
  // 범위 밖 날을 쳤을 때: 값은 그대로, 안내는 Field 오류 칸(Field 밖이면 칸 아래)
  const bound = text.outOfRange;
  const boundDate = bound === 'min' ? min : bound === 'max' ? max : undefined;
  const message =
    bound && boundDate
      ? (outOfRangeText?.(bound, formatDate(boundDate)) ??
        t(bound === 'min' ? 'dateField.afterMin' : 'dateField.beforeMax', {
          date: formatDate(boundDate),
        }))
      : null;
  const typed = text.outOfRangeDate;
  const rangeKey = message && bound && boundDate && typed ? `${bound}|${typed}|${message}` : '';
  // 앱에 알리기: 상태가 생기거나 바뀔 때 그 내용, 걷힐 때 null. 값은 그대로라 앱은 이것으로 저장을 막는다
  const reported = useRef('');
  const latest = useRef(onOutOfRangeChange);
  useEffect(() => {
    latest.current = onOutOfRangeChange;
  });
  useEffect(() => {
    if (reported.current === rangeKey) return;
    reported.current = rangeKey;
    const error: DateFieldOutOfRange | null =
      message && bound && boundDate && typed
        ? { bound, date: boundDate, typed, text: message }
        : null;
    latest.current?.(error);
  }, [rangeKey, message, bound, boundDate, typed]);
  // 칸이 사라질 때 상태가 남아 있으면 걷는다(폼 어댑터가 저장을 영영 막지 않게)
  useEffect(
    () => () => {
      if (reported.current) latest.current?.(null);
    },
    [],
  );
  // 브라우저 제약 검사: form.checkValidity() · reportValidity()가 실패하고 기본 제출이 막힌다
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef.current?.setCustomValidity(rangeKey ? (message ?? '') : '');
  }, [rangeKey, message]);
  const setInput = useCallback(
    (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );
  const inField = useFieldMessage(message);
  const noteId = useId();
  const ownNote = message && !inField ? noteId : undefined;
  const isInvalid = field.invalid || Boolean(message);
  const describedBy = [field.describedBy, ownNote, ownDescribedBy].filter(Boolean).join(' ');
  const calendar = (
    <Calendar
      mode="single"
      value={current}
      min={min}
      max={max}
      today={today}
      autoFocus
      onSelect={pick}
    />
  );
  const title = field.labelText ?? label ?? t('dateField.title');

  return (
    <>
      <span
        ref={rootRef}
        className={cx('tl-date-field', className)}
        data-size={size}
        data-state={isInvalid ? 'error' : field.disabled ? 'disabled' : undefined}
        data-empty={!text.value || undefined}
      >
        <input
          {...rest}
          ref={setInput}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder={placeholder}
          className="tl-date-field__control"
          id={field.id}
          data-testid={testID}
          value={text.value}
          disabled={field.disabled}
          required={field.required}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy || undefined}
          aria-label={field.labelId ? undefined : label}
          onChange={text.onChange}
          onBlur={(e) => {
            text.onBlur();
            onBlur?.(e);
          }}
          onKeyDown={(e) => {
            // Alt + ↓: 달력 열기(콤보 상자 관례)
            if (e.altKey && e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
            onKeyDown?.(e);
          }}
        />
        {name && <input type="hidden" name={name} value={current ?? ''} />}
        {sheet ? (
          <>
            <button
              type="button"
              className="tl-date-field__picker tl-focusable"
              aria-label={t('dateField.open')}
              aria-haspopup="dialog"
              aria-expanded={open}
              disabled={field.disabled}
              onClick={() => setOpen(true)}
            >
              <Icon name="calendar" />
            </button>
            <Sheet open={open} onOpenChange={setOpen} title={title}>
              {calendar}
            </Sheet>
          </>
        ) : (
          <P.Root open={open} onOpenChange={setOpen}>
            <P.Trigger
              className="tl-date-field__picker tl-focusable"
              aria-label={t('dateField.open')}
              disabled={field.disabled}
            >
              <Icon name="calendar" />
            </P.Trigger>
            <P.Portal>
              <P.Positioner
                className="tl-date-field__positioner"
                anchor={rootRef}
                sideOffset={4}
                align="start"
              >
                <P.Popup className="tl-date-field__popup" aria-label={title}>
                  {calendar}
                </P.Popup>
              </P.Positioner>
            </P.Portal>
          </P.Root>
        )}
      </span>
      {ownNote && message && <OwnErrorNote id={ownNote} message={message} />}
    </>
  );
}
DateField.displayName = DateFieldContract.name;
