import {
  CodeSearchContract,
  type CodeOption,
  type CodeSearchProps,
} from '@terracelab/trellis-contracts';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Combobox as Cb } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { useMessages } from '../_internal/locale.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { useUnhideOutside } from '../_internal/unhide-outside.js';
import { Icon } from '../Icon/Icon.js';

/** 코드 · 이름 · 설명 어디에 걸려도 찾는다(대소문자 무시) */
function matches(o: CodeOption, query: string) {
  const q = query.trim().toLocaleLowerCase('ko-KR');
  if (!q) return true;
  return `${o.value} ${o.label} ${o.description ?? ''}`.toLocaleLowerCase('ko-KR').includes(q);
}

/** "새로 등록" 줄의 값. 실제 코드와 겹치지 않는다 */
const CREATE = '\u0000create';

export function CodeSearch({
  options,
  value,
  defaultValue,
  onChange,
  placeholder: placeholderProp,
  emptyText: emptyTextProp,
  size = 'md',
  disabled,
  invalid,
  required,
  name,
  label,
  onCreate,
  createLabel,
  allowCustomValue = false,
  onCustomValue,
  showCode = true,
  id,
  testID,
  className,
}: CodeSearchProps & { className?: string }) {
  const t = useMessages();
  const placeholder = placeholderProp ?? t('codeSearch.placeholder');
  const emptyText = emptyTextProp ?? t('codeSearch.empty');
  const field = useFieldControl({ id, invalid, required, disabled });
  const sheet = useSheetMode();
  const valueId = useId();
  const [open, setOpen] = useState(false);
  // 고른 값은 두 모양이 함께 쓴다(화면 폭이 바뀌어도 값이 남는다)
  const [inner, setInner] = useState<string | null>(defaultValue ?? null);
  const current = value === undefined ? inner : value;
  // 목록에 없는 글자로 받은 값(allowCustomValue). 코드를 고르면 지운다
  const [customText, setCustomText] = useState<string | null>(null);
  // 지우기 단추로 지울 때만 자유 입력 글자를 지운다(콤보박스는 칸을 떠날 때도 같은 이유로 지우려 한다)
  const clearing = useRef(false);
  const selected = options.find((o) => o.value === current);
  // 칸에 보이는 글자이자 찾는 대상. 코드를 보이면 "코드 이름", 아니면 이름만
  const labelOf = (o: CodeOption) => (showCode ? `${o.value} ${o.label}` : o.label);
  const [text, setText] = useState(() => (selected ? labelOf(selected) : ''));
  // 부모가 value를 바꾸면(새로 등록이 끝나 값을 넣을 때 포함) 칸 글자도 맞춘다
  const [seen, setSeen] = useState(current);
  if (current !== seen) {
    setSeen(current);
    setText(selected ? labelOf(selected) : (customText ?? ''));
  }
  // 접는 묶음(FormSection)이 "입력 N개"를 다시 세게 알린다. 목록에서 고르면 칸에 입력 이벤트가 나지 않는다
  const filledKey = current ?? customText ?? '';
  const lastFilled = useRef(filledKey);
  useEffect(() => {
    if (lastFilled.current === filledKey) return;
    lastFilled.current = filledKey;
    document
      .getElementById(field.id)
      ?.closest('.tl-code-search')
      ?.dispatchEvent(new Event('input', { bubbles: true }));
  }, [filledKey, field.id]);
  const choose = (next: string | null) => {
    if (value === undefined) setInner(next);
    if (next !== null) setCustomText(null);
    onChange?.(next);
  };
  const createText = (q: string) =>
    createLabel
      ? createLabel(q)
      : q
        ? t('codeSearch.createQuery', { query: q })
        : t('codeSearch.create');
  /** 목록에 없는 글자를 값으로 받는다. 이름 · 코드가 정확히 같은 항목이 있으면 그것을 고른다 */
  const commitText = (raw: string): boolean => {
    const q = raw.trim();
    if (!q) {
      // 받아 둔 자유 입력 글자를 사람이 지웠으면 부모에게 빈 글자로 알린다
      if (customText) {
        setCustomText(null);
        onCustomValue?.('');
        return true;
      }
      return false;
    }
    if (selected && q === labelOf(selected)) return false;
    const exact = options.find((o) => o.label === q || o.value === q || labelOf(o) === q);
    if (exact) {
      choose(exact.value);
      return true;
    }
    if (!allowCustomValue) return false;
    setCustomText(q);
    setText(q);
    if (current !== null) choose(null);
    onCustomValue?.(q);
    return true;
  };

  // 좁은 화면: 칸이 단추가 되고, 아래 시트에서 찾아 고른다(D-60). 키보드가 올라와도 목록이 가려지지 않는다
  if (sheet) {
    const title = field.labelText ?? label ?? placeholder;
    const q = text === (selected ? labelOf(selected) : '') ? '' : text;
    const found = options.filter((o) => matches(o, q));
    const shown = selected ? labelOf(selected) : (customText ?? placeholder);
    const hasExact = options.some((o) => o.label === q.trim() || o.value === q.trim());
    const close = () => setOpen(false);
    const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
      e.preventDefault();
      if (commitText(q)) close();
    };
    return (
      <>
        <div
          className={cx('tl-code-search', className)}
          data-mode="sheet"
          data-size={size}
          data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
        >
          <Icon name="search" className="tl-code-search__icon" />
          <button
            type="button"
            className="tl-code-search__control tl-code-search__button"
            id={field.id}
            data-testid={testID}
            disabled={field.disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            // 고른 값 · 받은 글자가 있다는 표시(FormSection이 센다. name이 없어 숨은 입력이 없을 때도)
            data-filled={selected || customText ? '' : undefined}
            aria-invalid={field.invalid || undefined}
            aria-describedby={field.describedBy}
            // 버튼은 aria-label이 내용을 덮는다. 이름 + 지금 값을 함께 읽게 한다(WCAG 2.5.3)
            aria-label={field.labelId ? undefined : label && `${label} ${shown}`}
            aria-labelledby={field.labelId ? `${field.labelId} ${valueId}` : undefined}
            onClick={() => {
              setText(selected ? labelOf(selected) : '');
              setOpen(true);
            }}
          >
            <span
              id={valueId}
              className="tl-code-search__value"
              data-placeholder={selected || customText ? undefined : ''}
            >
              {selected ? (
                <>
                  {showCode && (
                    <>
                      <span className="tl-code-search__code">{selected.value}</span>{' '}
                    </>
                  )}
                  {selected.label}
                </>
              ) : (
                (customText ?? placeholder)
              )}
            </span>
          </button>
          {(selected || customText) && !field.disabled && (
            <button
              type="button"
              className="tl-code-search__clear tl-focusable"
              aria-label={t('common.clear')}
              onClick={() => {
                if (customText) onCustomValue?.('');
                setCustomText(null);
                choose(null);
              }}
            >
              <Icon name="x" />
            </button>
          )}
        </div>
        {name && <input type="hidden" name={name} value={current ?? ''} />}
        <Sheet open={open} onOpenChange={setOpen} title={title} className="tl-code-search-sheet">
          <div className="tl-code-search-sheet__search">
            <Icon name="search" className="tl-code-search__icon" />
            <input
              type="search"
              className="tl-code-search-sheet__input"
              aria-label={title}
              placeholder={placeholder}
              enterKeyHint={allowCustomValue ? 'done' : 'search'}
              value={q}
              onChange={(e) => setText(e.currentTarget.value)}
              onKeyDown={onSearchKey}
            />
          </div>
          {found.length === 0 && (
            <p className="tl-code-search-sheet__empty" role="status">
              {emptyText}
            </p>
          )}
          <div className="tl-sheet-options" role="radiogroup" aria-label={title}>
            {found.map((o) => {
              const checked = o.value === current;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  className="tl-sheet-option tl-code-search-sheet__option tl-focusable"
                  onClick={() => {
                    choose(o.value);
                    close();
                  }}
                >
                  {showCode && <span className="tl-code-search__code">{o.value}</span>}
                  <span className="tl-code-search__text">
                    <span className="tl-code-search__label">{o.label}</span>
                    {o.description && (
                      <span className="tl-code-search__description">{o.description}</span>
                    )}
                  </span>
                  {o.meta && <span className="tl-code-search__meta">{o.meta}</span>}
                  {checked && <Icon name="check" className="tl-sheet-option__check" />}
                </button>
              );
            })}
          </div>
          {(allowCustomValue && q.trim() && !hasExact) || onCreate ? (
            <div className="tl-code-search-sheet__actions">
              {allowCustomValue && q.trim() && !hasExact && (
                <button
                  type="button"
                  className="tl-sheet-option tl-code-search-sheet__action tl-focusable"
                  onClick={() => {
                    if (commitText(q)) close();
                  }}
                >
                  <Icon name="check" className="tl-code-search__action-icon" />
                  <span className="tl-sheet-option__label">
                    {t('codeSearch.useText', { query: q.trim() })}
                  </span>
                </button>
              )}
              {onCreate && (
                <button
                  type="button"
                  className="tl-sheet-option tl-code-search-sheet__action tl-focusable"
                  onClick={() => {
                    close();
                    onCreate(q.trim());
                  }}
                >
                  <Icon name="plus" className="tl-code-search__action-icon" />
                  <span className="tl-sheet-option__label">{createText(q.trim())}</span>
                </button>
              )}
            </div>
          ) : null}
        </Sheet>
      </>
    );
  }

  // 넓은 화면: 콤보박스. 찾기는 직접 하고(filteredItems), "새로 등록"은 목록 맨 아래 항목이다
  const q = selected && text === labelOf(selected) ? '' : text;
  const found = options.filter((o) => matches(o, q));
  const createItem: CodeOption | null = onCreate
    ? { value: CREATE, label: createText(q.trim()) }
    : null;
  const shownItems = createItem ? [...found, createItem] : found;
  return (
    <DesktopCodeSearch
      options={options}
      createItem={createItem}
      shownItems={shownItems}
      foundCount={found.length}
      labelOf={labelOf}
      current={current}
      text={text}
      onText={(v, reason) => {
        // 항목을 고르면 콤보박스가 칸에 그 이름을 넣는다. "새로 등록" 이름은 칸에 넣지 않는다
        if (createItem && v === createItem.label) return;
        // 받은 자유 입력 글자는 칸을 떠나거나 닫을 때 지우지 않는다(사람이 지우거나 고칠 때만)
        if (customText && v === '' && reason !== 'input-change' && !clearing.current) return;
        clearing.current = false;
        setText(v);
      }}
      onValue={(v) => {
        if (v === CREATE) {
          onCreate?.(q.trim());
          return;
        }
        choose(v);
      }}
      onCommitText={() => commitText(text)}
      allowCustomValue={allowCustomValue}
      emptyText={emptyText}
      showCode={showCode}
      placeholder={placeholder}
      size={size}
      field={field}
      label={label}
      name={name}
      testID={testID}
      className={className}
      clearLabel={t('common.clear')}
      onClearPress={() => {
        clearing.current = true;
        setCustomText(null);
      }}
      customText={current === null ? customText : null}
      onClearText={() => {
        setCustomText(null);
        setText('');
        onCustomValue?.('');
      }}
      openLabel={t('codeSearch.open')}
    />
  );
}
CodeSearch.displayName = CodeSearchContract.name;

interface DesktopProps {
  options: readonly CodeOption[];
  createItem: CodeOption | null;
  shownItems: CodeOption[];
  foundCount: number;
  labelOf: (o: CodeOption) => string;
  current: string | null;
  text: string;
  onText: (v: string, reason: string) => void;
  onValue: (v: string | null) => void;
  onCommitText: () => boolean;
  allowCustomValue: boolean;
  emptyText: string;
  showCode: boolean;
  placeholder: string;
  size: NonNullable<CodeSearchProps['size']>;
  field: ReturnType<typeof useFieldControl>;
  label?: string;
  name?: string;
  testID?: string;
  className?: string;
  clearLabel: string;
  openLabel: string;
  onClearPress: () => void;
  /** 받아 둔 자유 입력 글자(고른 값이 없을 때만) */
  customText: string | null;
  onClearText: () => void;
}

function DesktopCodeSearch({
  options,
  createItem,
  shownItems,
  foundCount,
  labelOf,
  current,
  text,
  onText,
  onValue,
  onCommitText,
  allowCustomValue,
  emptyText,
  showCode,
  placeholder,
  size,
  field,
  label,
  name,
  testID,
  className,
  clearLabel,
  openLabel,
  onClearPress,
  customText,
  onClearText,
}: DesktopProps) {
  const [open, setOpen] = useState(false);
  useUnhideOutside(open);
  const all = useMemo(
    () => (createItem ? [...options, createItem] : [...options]),
    [options, createItem],
  );
  const items = useMemo(
    () => Cb.createItems(all, { getValue: (o) => o.value, getLabel: labelOf }),
    // labelOf는 showCode에만 따른다
    [all, showCode],
  );
  return (
    <Cb.Root
      items={items}
      filteredItems={shownItems}
      value={current}
      onValueChange={(v) => onValue((v as string | null) ?? null)}
      inputValue={text}
      onInputValueChange={(v, details) => onText(v, String(details.reason))}
      onOpenChange={(next) => setOpen(next)}
      autoHighlight
      disabled={field.disabled}
      required={field.required}
      name={name}
    >
      <Cb.InputGroup
        className={cx('tl-code-search', className)}
        data-size={size}
        data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
      >
        <Icon name="search" className="tl-code-search__icon" />
        <Cb.Input
          className="tl-code-search__control"
          id={field.id}
          data-testid={testID}
          placeholder={placeholder}
          aria-invalid={field.invalid || undefined}
          aria-describedby={field.describedBy}
          aria-label={field.labelId ? undefined : label}
          onKeyDown={(e) => {
            // 고를 항목이 없으면 Enter로 친 글자를 받는다(allowCustomValue)
            if (
              e.key === 'Enter' &&
              !e.nativeEvent.isComposing &&
              allowCustomValue &&
              foundCount === 0 &&
              !createItem
            )
              onCommitText();
          }}
          onBlur={() => {
            if (allowCustomValue) onCommitText();
          }}
        />
        <Cb.Clear
          className="tl-code-search__clear tl-focusable"
          aria-label={clearLabel}
          onClick={onClearPress}
        >
          <Icon name="x" />
        </Cb.Clear>
        {/* 자유 입력 글자는 고른 값이 아니라서 Cb.Clear가 보이지 않는다. 같은 모양의 단추를 따로 둔다 */}
        {customText && !field.disabled && (
          <button
            type="button"
            tabIndex={-1}
            className="tl-code-search__clear tl-focusable"
            aria-label={clearLabel}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              onClearText();
              e.currentTarget.parentElement?.querySelector('input')?.focus();
            }}
          >
            <Icon name="x" />
          </button>
        )}
        <Cb.Trigger className="tl-code-search__trigger" aria-label={openLabel}>
          <Icon name="chevron-down" />
        </Cb.Trigger>
      </Cb.InputGroup>
      <Cb.Portal>
        <Cb.Positioner className="tl-code-search__positioner" sideOffset={4} align="start">
          <Cb.Popup className="tl-code-search__popup">
            {foundCount === 0 && <div className="tl-code-search__empty">{emptyText}</div>}
            <Cb.List className="tl-code-search__list">
              {(o: CodeOption) =>
                o === createItem ? (
                  <Cb.Item
                    key={o.value}
                    value={o.value}
                    className="tl-code-search__item"
                    data-create
                  >
                    <Icon name="plus" className="tl-code-search__action-icon" />
                    <span className="tl-code-search__label">{o.label}</span>
                  </Cb.Item>
                ) : (
                  <Cb.Item key={o.value} value={o.value} className="tl-code-search__item">
                    {showCode && <span className="tl-code-search__code">{o.value}</span>}
                    <span className="tl-code-search__text">
                      <span className="tl-code-search__label">{o.label}</span>
                      {o.description && (
                        <span className="tl-code-search__description">{o.description}</span>
                      )}
                    </span>
                    {o.meta && <span className="tl-code-search__meta">{o.meta}</span>}
                  </Cb.Item>
                )
              }
            </Cb.List>
          </Cb.Popup>
        </Cb.Positioner>
      </Cb.Portal>
    </Cb.Root>
  );
}
