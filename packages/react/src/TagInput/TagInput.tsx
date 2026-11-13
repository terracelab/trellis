import {
  filterTagSuggestions,
  splitTagText,
  TagInputContract,
  type TagInputProps,
  type TagSuggestion,
} from '@terracelab/trellis-contracts';
import {
  useId,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { cx } from '../_internal/cx.js';
import { useFieldControl } from '../_internal/field.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { PersonLabel } from '../PersonLabel/PersonLabel.js';
import { Tag } from '../Tag/Tag.js';

export type TagInputWebProps = TagInputProps & { className?: string };

type Option = { kind: 'suggestion'; item: TagSuggestion } | { kind: 'add'; text: string };

/**
 * 칩 입력. 글자를 치면 추천이 걸러져 아래 목록에 보이고, Enter · 누름으로 칩이 된다.
 * text 모드는 추천에 없는 글자도 Enter · 쉼표 · 붙여 넣기로 넣고(allowCustom), person 모드는 사람만 고른다(참조자 · 참석자).
 * 입력 칸은 콤보박스(aria-activedescendant)이고 칩 × 단추는 Tab으로 닿는다. 빈 칸에서 Backspace는 마지막 칩을 뺀다
 */
export function TagInput({
  value,
  defaultValue,
  onChange,
  suggestions = [],
  mode = 'text',
  allowCustom,
  max,
  placeholder,
  size = 'md',
  disabled,
  invalid,
  required,
  name,
  label,
  id,
  testID,
  className,
}: TagInputWebProps) {
  const t = useMessages();
  const field = useFieldControl({ id, invalid, required, disabled });
  const custom = allowCustom ?? mode === 'text';
  const [inner, setInner] = useState<string[]>(() => [...(defaultValue ?? [])]);
  const current = value !== undefined ? value : inner;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  // 사람 모드는 첫 추천을 바로 가리킨다(Enter = 첫 사람). 글자 모드는 화살표로 고를 때만(Enter = 친 글자)
  const firstActive = mode === 'person' ? 0 : -1;
  const [active, setActive] = useState(firstActive);
  const [announce, setAnnounce] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const full = max !== undefined && current.length >= max;

  const byValue = useMemo(() => new Map(suggestions.map((s) => [s.value, s])), [suggestions]);
  const labelOf = (v: string) => byValue.get(v)?.label ?? v;

  const q = query.trim();
  const found = filterTagSuggestions(suggestions, query, current);
  const known = q !== '' && (current.includes(q) || suggestions.some((s) => s.label === q));
  const options: Option[] = [
    ...found.map((item): Option => ({ kind: 'suggestion', item })),
    ...(custom && q && !known ? [{ kind: 'add', text: q } as const] : []),
  ];
  const showPopup = open && !full && !field.disabled && (options.length > 0 || q !== '');
  const showList = showPopup && options.length > 0;
  const optionId = (i: number) => `${listId}-${i}`;

  const commit = (next: string[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const resetQuery = () => {
    setQuery('');
    setActive(firstActive);
  };
  /** 값들을 한 번에 넣는다(붙여 넣기는 여러 개). 넣은 개수를 돌려준다 */
  const addAll = (entries: { value: string; label: string }[]): number => {
    const next = [...current];
    const added: string[] = [];
    for (const e of entries) {
      if (next.includes(e.value) || (max !== undefined && next.length >= max)) continue;
      next.push(e.value);
      added.push(e.label);
    }
    if (added.length === 0) return 0;
    commit(next);
    const reachedMax = max !== undefined && next.length >= max;
    setAnnounce(
      [
        t('tagInput.added', { label: added.join(', ') }),
        ...(reachedMax ? [t('tagInput.full', { count: max })] : []),
      ].join('. '),
    );
    resetQuery();
    return added.length;
  };
  /** 친 글자 하나를 값으로: 추천 이름 · 값과 같으면 그 추천, 아니면 allowCustom일 때 글자 그대로 */
  const entryOf = (text: string): { value: string; label: string } | null => {
    const match = suggestions.find((s) => s.label === text || s.value === text);
    if (match) return match.disabled ? null : { value: match.value, label: match.label };
    return custom ? { value: text, label: text } : null;
  };
  const commitText = (raw: string): boolean => {
    const text = raw.trim();
    const entry = text ? entryOf(text) : null;
    return entry ? addAll([entry]) > 0 : false;
  };
  const choose = (o: Option) => {
    if (o.kind === 'add') addAll([{ value: o.text, label: o.text }]);
    else if (!o.item.disabled) addAll([{ value: o.item.value, label: o.item.label }]);
    inputRef.current?.focus();
  };
  const remove = (v: string) => {
    commit(current.filter((x) => x !== v));
    setAnnounce(t('tagInput.removed', { label: labelOf(v) }));
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중 Enter · 쉼표는 글자를 끝내는 키다(칩으로 만들지 않는다)
    if (e.nativeEvent.isComposing) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!showList) {
          setOpen(true);
          setActive(0);
        } else setActive((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        if (!showList) return;
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case 'Enter': {
        const o = showList && active >= 0 ? options[active] : undefined;
        if (o) {
          e.preventDefault();
          choose(o);
        } else if (q) {
          // 폼 제출을 막고 친 글자를 칩으로(넣을 수 없으면 그대로 둔다)
          e.preventDefault();
          commitText(q);
        }
        break;
      }
      case ',':
        if (mode === 'text' && custom) {
          e.preventDefault();
          commitText(query);
        }
        break;
      case 'Backspace': {
        const last = current[current.length - 1];
        if (query === '' && last !== undefined) {
          e.preventDefault();
          remove(last);
        }
        break;
      }
      case 'Escape':
        if (showPopup) {
          e.preventDefault();
          setOpen(false);
        } else if (query) {
          e.preventDefault();
          resetQuery();
        }
        break;
      default:
    }
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (mode !== 'text' || !custom) return;
    const text = e.clipboardData.getData('text');
    if (!/[,\n\t]/.test(text)) return;
    e.preventDefault();
    const entries = splitTagText(text)
      .map(entryOf)
      .filter((x): x is { value: string; label: string } => x !== null);
    addAll(entries);
  };
  const focusInput = (e: MouseEvent<HTMLDivElement>) => {
    if (field.disabled) return;
    // 칩 × 단추를 누른 것은 그 단추가 처리한다
    if ((e.target as HTMLElement).closest('button')) return;
    inputRef.current?.focus();
    setOpen(true);
  };

  const chipSize = size === 'xs' || size === 'sm' ? 'sm' : 'md';
  return (
    <div
      className={cx('tl-tag-input', className)}
      data-size={size}
      data-mode={mode}
      data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
      data-open={showPopup || undefined}
    >
      {/* 칸 아무 데나 누르면 입력 칸으로(마우스 편의. 키보드는 입력 칸 · 칩 단추로 바로 간다) */}
      <div className="tl-tag-input__box" onClick={focusInput}>
        {current.length > 0 && (
          <ul className="tl-tag-input__tags" aria-label={t('tagInput.picked')}>
            {current.map((v) => {
              const s = byValue.get(v);
              const text = s?.label ?? v;
              return (
                <li key={v} className="tl-tag-input__tag">
                  {mode === 'person' ? (
                    <Tag
                      size={chipSize}
                      person={{ name: text, ...(s?.src ? { src: s.src } : {}) }}
                      label={text}
                      disabled={field.disabled}
                      onRemove={() => remove(v)}
                    />
                  ) : (
                    <Tag
                      size={chipSize}
                      label={text}
                      disabled={field.disabled}
                      onRemove={() => remove(v)}
                    >
                      {text}
                    </Tag>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <input
          ref={inputRef}
          className="tl-tag-input__control"
          id={field.id}
          data-testid={testID}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
          aria-label={field.labelId ? undefined : label}
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid || undefined}
          aria-required={field.required || undefined}
          disabled={field.disabled}
          readOnly={full}
          placeholder={
            full ? t('tagInput.full', { count: max }) : current.length ? '' : placeholder
          }
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setActive(firstActive);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => {
            setOpen(false);
            // 글자 모드는 칸을 떠날 때 남은 글자를 칩으로(넣을 수 없는 글자는 그대로 둔다)
            if (mode === 'text' && custom && q) commitText(q);
          }}
        />
      </div>
      {showPopup && (
        <div className="tl-tag-input__popup">
          {showList ? (
            <ul
              className="tl-tag-input__list"
              id={listId}
              role="listbox"
              aria-label={field.labelText ?? label}
            >
              {options.map((o, i) => (
                <li
                  key={o.kind === 'add' ? '\u0000add' : o.item.value}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={(o.kind === 'suggestion' && o.item.disabled) || undefined}
                  className="tl-tag-input__option"
                  data-highlighted={i === active || undefined}
                  data-add={o.kind === 'add' || undefined}
                  // 누르는 동안 입력 칸이 초점을 잃지 않게 한다
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(o)}
                >
                  {o.kind === 'add' ? (
                    <>
                      <Icon name="plus" className="tl-tag-input__add-icon" />
                      <span className="tl-tag-input__option-label">
                        {t('tagInput.add', { query: o.text })}
                      </span>
                    </>
                  ) : mode === 'person' ? (
                    <PersonLabel
                      size="sm"
                      name={o.item.label}
                      {...(o.item.meta ? { meta: o.item.meta } : {})}
                      {...(o.item.src ? { src: o.item.src } : {})}
                    />
                  ) : (
                    <>
                      <span className="tl-tag-input__option-label">{o.item.label}</span>
                      {o.item.meta && (
                        <span className="tl-tag-input__option-meta">{o.item.meta}</span>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="tl-tag-input__empty">{t('tagInput.empty')}</p>
          )}
        </div>
      )}
      <span className="tl-sr-only" aria-live="polite">
        {announce}
      </span>
      {name && current.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
    </div>
  );
}
TagInput.displayName = TagInputContract.name;
