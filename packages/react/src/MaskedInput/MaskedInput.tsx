import {
  applyMask,
  bankAccountFormat,
  formatRrn,
  isValidBizNo,
  MASK_EXAMPLES,
  MaskedInputContract,
  type MaskedInputProps,
  type MaskPreset,
} from '@terracelab/trellis-contracts';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type InputHTMLAttributes,
  type Ref,
} from 'react';
import { cx } from '../_internal/cx.js';
import { useFieldControl, useFieldMessage } from '../_internal/field.js';
import { useMessages } from '../_internal/locale.js';
import { OwnErrorNote } from '../_internal/own-note.js';
import { Icon } from '../Icon/Icon.js';
import { applyEdit, caretAfterSlots, hideDigits } from './edit.js';

export type MaskedInputWebProps = MaskedInputProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    keyof MaskedInputProps | 'children' | 'type' | 'size'
  > & {
    className?: string;
    ref?: Ref<HTMLInputElement>;
  };

/** rrn 가림: 뒷자리 첫 숫자(7번째)까지 보이고 그 뒤 여섯 자리를 가린다 */
const RRN_HIDE_FROM = 7;
/** 방금 친 숫자를 보여 주는 시간(휴대폰 비밀번호 칸과 같은 관례) */
const PEEK_MS = 1000;

/** 예시 값: bankAccount는 고른 은행의 예시(없으면 숫자 예시), 프리셋은 그 예시, 패턴은 #을 0으로 */
const examplePlaceholder = (mask: string, bank?: string | null) =>
  (mask === 'bankAccount' ? bankAccountFormat(bank)?.example : undefined) ??
  (mask in MASK_EXAMPLES ? MASK_EXAMPLES[mask as MaskPreset] : mask.replace(/#/g, '0'));

interface Selection {
  start: number;
  end: number;
}

export function MaskedInput({
  mask,
  bank,
  value,
  defaultValue,
  onChange,
  placeholder,
  secret = false,
  validate = false,
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
  'aria-describedby': ownDescribedBy,
  onBlur,
  ...rest
}: MaskedInputWebProps) {
  const t = useMessages();
  const field = useFieldControl({ id, invalid, required, disabled });
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caret = useRef<Selection | null>(null);
  const options = { bank };
  const [inner, setInner] = useState(() => applyMask(defaultValue ?? '', mask, options).raw);
  // 값이 그대로여도(자리 수가 찼는데 더 친 경우) 다시 그려 커서를 되돌린다
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const masked = applyMask(value !== undefined ? value : inner, mask, options);

  // 가림(rrn만). revealed = 보기 버튼으로 펼침, peek = 방금 친 숫자 칸
  const hiding = secret && mask === 'rrn';
  const [revealed, setRevealed] = useState(false);
  const [peek, setPeek] = useState<number | null>(null);
  const peekTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const covered = hiding && !revealed;
  const display = covered ? hideDigits(masked.formatted, RRN_HIDE_FROM, peek) : masked.formatted;

  // 검증 숫자(bizNo만): 다 친 번호가 틀리면 오류 문구
  const checkFailed = validate && mask === 'bizNo' && masked.complete && !isValidBizNo(masked.raw);
  const message = checkFailed ? t('maskedInput.bizNoInvalid') : null;
  const inField = useFieldMessage(message);
  const noteId = useId();
  const ownNote = message && !inField ? noteId : undefined;
  const isInvalid = field.invalid || Boolean(message);
  const describedBy = [field.describedBy, ownNote, ownDescribedBy].filter(Boolean).join(' ');

  useEffect(() => () => clearTimeout(peekTimer.current), []);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (caret.current == null || !el || el.ownerDocument.activeElement !== el) return;
    el.setSelectionRange(caret.current.start, caret.current.end);
    caret.current = null;
  });

  /** 화면 글자만 바뀌는 다시 그리기(가림 · 펼침) 앞에 지금 커서를 잡아 둔다 */
  const holdCaret = () => {
    const el = inputRef.current;
    if (!el || el.ownerDocument.activeElement !== el) return;
    caret.current = { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
  };

  const stopPeek = () => {
    clearTimeout(peekTimer.current);
    setPeek(null);
  };

  const setRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <>
      <span
        ref={rootRef}
        className={cx('tl-masked-input', className)}
        data-size={size}
        data-mask={mask in MASK_EXAMPLES ? mask : 'pattern'}
        data-complete={masked.complete || undefined}
        data-secret={hiding || undefined}
        data-state={isInvalid ? 'error' : field.disabled ? 'disabled' : undefined}
        onBlur={(e) => {
          // 칸 · 보기 버튼 밖으로 나가면 다시 가린다
          if (!hiding || rootRef.current?.contains(e.relatedTarget as Node | null)) return;
          setRevealed(false);
          stopPeek();
        }}
      >
        <input
          {...rest}
          ref={setRefs}
          type="text"
          className="tl-masked-input__control"
          id={field.id}
          data-testid={testID}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={display}
          placeholder={
            placeholder ??
            (hiding ? formatRrn(examplePlaceholder(mask)) : examplePlaceholder(mask, bank))
          }
          disabled={field.disabled}
          required={field.required}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy || undefined}
          aria-label={field.labelId ? undefined : label}
          onBlur={onBlur}
          onChange={(e) => {
            const el = e.target;
            const edit = applyEdit({
              before: display,
              raw: masked.raw,
              after: el.value,
              caret: el.selectionStart ?? el.value.length,
              inputType: (e.nativeEvent as InputEvent).inputType,
            });
            const next = applyMask(edit.raw, mask, options);
            if (covered) {
              clearTimeout(peekTimer.current);
              // 가린 칸에 숫자 하나를 쳤을 때만 잠깐 보인다(붙여 넣기는 보이지 않는다)
              const typed =
                edit.inserted === 1 && edit.at >= RRN_HIDE_FROM && edit.at < next.raw.length;
              setPeek(typed ? edit.at : null);
              if (typed)
                peekTimer.current = setTimeout(() => {
                  holdCaret();
                  setPeek(null);
                }, PEEK_MS);
            }
            const at = caretAfterSlots(next.formatted, Math.min(edit.caretSlots, next.raw.length));
            caret.current = { start: at, end: at };
            if (value === undefined) setInner(next.raw);
            rerender();
            if (next.raw !== masked.raw)
              onChange?.(next.raw, hiding ? formatRrn(next.raw) : next.formatted);
          }}
        />
        {hiding && (
          <button
            type="button"
            className="tl-masked-input__reveal tl-focusable"
            aria-label={t('maskedInput.reveal')}
            aria-pressed={revealed}
            aria-controls={field.id}
            disabled={field.disabled}
            // 누를 때 칸의 포커스 · 커서를 그대로 둔다
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              holdCaret();
              stopPeek();
              setRevealed((r) => !r);
              // 칸 밖에서 눌러 펼쳤으면 칸으로 포커스를 옮긴다(나갈 때 다시 가리도록)
              if (!rootRef.current?.contains(rootRef.current.ownerDocument.activeElement))
                inputRef.current?.focus();
            }}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} />
          </button>
        )}
        {name && <input type="hidden" name={name} value={masked.raw} />}
      </span>
      {ownNote && message && <OwnErrorNote id={ownNote} message={message} />}
    </>
  );
}
MaskedInput.displayName = MaskedInputContract.name;
