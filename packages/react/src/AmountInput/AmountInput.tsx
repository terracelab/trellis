import {
  AmountInputContract,
  formatAmount,
  formatCurrency,
  formatKoreanAmount,
  type AmountInputProps,
  type CurrencyCode,
} from '@terracelab/trellis-contracts';
import {
  useId,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type Ref,
} from 'react';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { useMessages } from '../_internal/locale.js';

export type AmountInputWebProps = AmountInputProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    keyof AmountInputProps | 'children' | 'type' | 'size' | 'prefix'
  > & {
    className?: string;
    ref?: Ref<HTMLInputElement>;
  };

const MINUS = '−';
/** Number로 정확히 다룰 수 있는 정수 자리(9천조 미만) */
const MAX_INT_DIGITS = 15;

interface Parsed {
  neg: boolean;
  int: string;
  frac: string;
  dot: boolean;
}

/** 통화의 소수 자릿수는 formatCurrency가 정한 것을 따른다(USD 2 · JPY 0) */
const fractionDigits = (currency: CurrencyCode) =>
  (formatCurrency(0, currency).split('.')[1] ?? '').length;

/** 입력 글자 → 부호 · 정수 · 소수. 숫자 · 소수점 · 음수 기호 밖의 글자는 버린다 */
function parse(text: string, digits: number, allowNegative: boolean, pasted = false): Parsed {
  const neg = allowNegative && /^\s*[-−]/.test(text);
  let body = text.replace(/[^0-9.]/g, '');
  // 소수가 없는 통화: 붙여 넣은 "1,234.56"은 소수점 뒤를 버리고, 타자로 친 점은 무시한다
  if (digits === 0) body = pasted ? (body.split('.')[0] ?? '') : body.replace(/\./g, '');
  const at = body.indexOf('.');
  const dot = at >= 0;
  const intRaw = dot ? body.slice(0, at) : body;
  const frac = dot
    ? body
        .slice(at + 1)
        .replace(/\./g, '')
        .slice(0, digits)
    : '';
  const int = intRaw.replace(/^0+(?=\d)/, '').slice(0, MAX_INT_DIGITS);
  return { neg, int, frac, dot };
}

function show(p: Parsed): string {
  const sign = p.neg ? MINUS : '';
  if (!p.int && !p.dot) return sign;
  return `${sign}${formatAmount(Number(p.int || '0'))}${p.dot ? `.${p.frac}` : ''}`;
}

function toNumber(p: Parsed): number | null {
  if (!p.int && !p.frac) return null;
  const n = Number(`${p.int || '0'}.${p.frac || '0'}`);
  return p.neg && n !== 0 ? -n : n;
}

const fromNumber = (v: number | null | undefined, digits: number) =>
  v == null || !Number.isFinite(v) ? '' : formatAmount(v, { digits });

const significant = (s: string) => s.replace(/[^0-9.]/g, '').length;

/** 커서 왼쪽의 의미 있는 글자(숫자 · 소수점) 수 → 서식 뒤 같은 자리 */
function caretAfter(text: string, count: number): number {
  if (count <= 0) return text.startsWith(MINUS) ? 1 : 0;
  let seen = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (/[0-9.]/.test(text[i] ?? '')) seen += 1;
    if (seen === count) return i + 1;
  }
  return text.length;
}

export function AmountInput({
  value,
  defaultValue,
  onChange,
  currency = 'KRW',
  allowNegative = false,
  showKorean = false,
  min,
  max,
  placeholder,
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
  onBlur,
  'aria-describedby': ownDescribedBy,
  ...rest
}: AmountInputWebProps) {
  const t = useMessages();
  const field = useFieldControl({ id, invalid, required, disabled });
  const koreanId = useId();
  const digits = fractionDigits(currency);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const composing = useRef(false);
  const caret = useRef<number | null>(null);
  const [text, setText] = useState(() =>
    fromNumber(value !== undefined ? value : defaultValue, digits),
  );
  // 제어 값이 바깥에서 바뀌면(입력으로 생긴 값이 아니면) 글자를 다시 만든다
  const [seen, setSeen] = useState(value);
  if (!Object.is(value, seen)) {
    setSeen(value);
    if (value !== undefined && !Object.is(value, toNumber(parse(text, digits, allowNegative))))
      setText(fromNumber(value, digits));
  }

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (caret.current == null || !el || el.ownerDocument.activeElement !== el) return;
    el.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });

  const number = toNumber(parse(text, digits, allowNegative));
  const outOfRange =
    number != null && ((min != null && number < min) || (max != null && number > max));
  const isInvalid = field.invalid || outOfRange;
  const korean = showKorean && currency === 'KRW' && number != null;
  const describedBy = [field.describedBy, korean ? koreanId : undefined, ownDescribedBy]
    .filter(Boolean)
    .join(' ');

  // 마지막으로 알린 값. 한글 입력기 조합 중에는 글자만 바뀌고(number도 따라 바뀐다) 알리지 않으므로,
  // 조합이 끝났을 때 이 값과 비교해야 onChange가 빠지지 않는다
  const notified = useRef(number);
  useEffect(() => {
    if (!composing.current) notified.current = number;
  }, [number]);

  const apply = (raw: string, cursor: number | null, pasted: boolean) => {
    const p = parse(raw, digits, allowNegative, pasted);
    const next = show(p);
    if (cursor != null) caret.current = caretAfter(next, significant(raw.slice(0, cursor)));
    setText(next);
    const n = toNumber(p);
    if (!Object.is(n, notified.current)) {
      notified.current = n;
      onChange?.(n);
    }
  };

  const setRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <span
      className={cx('tl-amount-input', className)}
      data-size={size}
      data-currency={currency}
      data-state={isInvalid ? 'error' : field.disabled ? 'disabled' : undefined}
    >
      <span className="tl-amount-input__box">
        {currency !== 'KRW' && <span className="tl-amount-input__affix">{currency}</span>}
        <input
          {...rest}
          ref={setRefs}
          type="text"
          className="tl-amount-input__control"
          id={field.id}
          data-testid={testID}
          inputMode={allowNegative ? 'text' : digits > 0 ? 'decimal' : 'numeric'}
          autoComplete="off"
          value={text}
          placeholder={placeholder}
          disabled={field.disabled}
          required={field.required}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy || undefined}
          aria-label={field.labelId ? undefined : label}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={(e) => {
            composing.current = false;
            apply(e.currentTarget.value, e.currentTarget.selectionStart, false);
          }}
          onChange={(e) => {
            // 한글 입력기 조합 중에는 고치지 않는다(조합이 끝나면 정리)
            if (composing.current) {
              setText(e.target.value);
              return;
            }
            const inputType = (e.nativeEvent as InputEvent).inputType;
            let raw = e.target.value;
            let cursor = e.target.selectionStart;
            // 쉼표만 지워졌으면 그 옆 숫자를 지운다(지운 것이 다시 생기지 않게)
            if (cursor != null && significant(raw) === significant(text)) {
              if (inputType === 'deleteContentBackward' && cursor > 0) {
                raw = raw.slice(0, cursor - 1) + raw.slice(cursor);
                cursor -= 1;
              } else if (inputType === 'deleteContentForward') {
                raw = raw.slice(0, cursor) + raw.slice(cursor + 1);
              }
            }
            apply(raw, cursor, inputType === 'insertFromPaste');
          }}
          onBlur={(e) => {
            onBlur?.(e);
            setText(fromNumber(number, digits));
          }}
        />
        {currency === 'KRW' && (
          <span className="tl-amount-input__affix">{t('common.unitWon')}</span>
        )}
      </span>
      {name && <input type="hidden" name={name} value={number ?? ''} />}
      {korean && (
        <span className="tl-amount-input__korean" id={koreanId}>
          {formatKoreanAmount(number)}
        </span>
      )}
    </span>
  );
}
AmountInput.displayName = AmountInputContract.name;
