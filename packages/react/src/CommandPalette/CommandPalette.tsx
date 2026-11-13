import {
  CommandPaletteContract,
  type CommandPaletteGroup,
  type CommandPaletteItem,
  type CommandPaletteProps,
} from '@terracelab/trellis-contracts';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Dialog as D } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { trapTab } from '../_internal/focus-trap.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { SuggestionChips } from '../SuggestionChips/SuggestionChips.js';

export type CommandPaletteWebProps = Omit<CommandPaletteProps, 'empty' | 'children'> & {
  empty?: ReactNode;
  children?: ReactNode;
  className?: string;
};

interface Row {
  item: CommandPaletteItem;
  group: CommandPaletteGroup;
  /** 화면에 보이는 묶음 순번(Tab 이동) */
  groupIndex: number;
  domId: string;
}

const squash = (s: string) => s.toLowerCase().replace(/\s+/g, '');

/** 이름 · 설명 · keywords에 찾는 글자가 들어 있는지(대소문자 · 띄어쓰기 무시 — "부가세얼마"도 "부가세 얼마"를 찾는다) */
function matches(item: CommandPaletteItem, query: string): boolean {
  const q = squash(query);
  if (!q) return true;
  return [item.label, item.description ?? '', ...(item.keywords ?? [])].some((s) =>
    squash(s).includes(q),
  );
}

export function CommandPalette({
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  placeholder,
  query,
  defaultQuery = '',
  onQueryChange,
  groups,
  onSelect,
  closeOnSelect = true,
  filter = true,
  suggestions,
  loading = false,
  empty,
  children,
  inline = false,
  id,
  testID,
  className,
}: CommandPaletteWebProps) {
  const t = useMessages();
  const base = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ── 열림 · 찾는 글자: 제어 · 비제어 둘 다 ──
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isOpen = inline || (open ?? innerOpen);
  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };
  const [innerQuery, setInnerQuery] = useState(defaultQuery);
  const q = query ?? innerQuery;
  const setQuery = (next: string) => {
    if (query === undefined) setInnerQuery(next);
    onQueryChange?.(next);
  };
  // 다시 열면 비제어 글자는 처음으로(지난 검색이 남아 있으면 첫 결과가 엉뚱하다)
  const wasOpen = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !wasOpen.current && query === undefined) setInnerQuery(defaultQuery);
    wasOpen.current = isOpen;
  }, [isOpen, query, defaultQuery]);

  // ── 보이는 결과(빈 묶음은 숨긴다) ──
  const visible = useMemo(
    () =>
      groups
        .map((g) => ({ group: g, items: filter ? g.items.filter((i) => matches(i, q)) : g.items }))
        .filter((g) => g.items.length > 0),
    [groups, filter, q],
  );
  const rows = useMemo<Row[]>(
    () =>
      visible.flatMap((g, gi) =>
        g.items.map((item, ii) => ({
          item,
          group: g.group,
          groupIndex: gi,
          domId: `${base}-o${gi}-${ii}`,
        })),
      ),
    [visible, base],
  );
  const enabled = rows.filter((r) => !r.item.disabled);

  // ── 지금 결과: 글자가 바뀌면 첫 결과, 목록만 바뀌면 같은 결과를 지킨다 ──
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const keyOf = (r: Row) => `${r.group.id}\u0000${r.item.id}`;
  useEffect(() => setActiveKey(null), [q]);
  const active = enabled.find((r) => keyOf(r) === activeKey) ?? enabled[0] ?? null;
  const activeDomId = active?.domId;
  useEffect(() => {
    if (!activeDomId) return;
    document.getElementById(activeDomId)?.scrollIntoView?.({ block: 'nearest' });
  }, [activeDomId]);

  const choose = (r: Row) => {
    if (r.item.disabled) return;
    onSelect?.(r.item, r.group);
    if (closeOnSelect && !inline) setOpen(false);
  };
  const move = (to: Row | undefined) => to && setActiveKey(keyOf(to));
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 조합 중 Enter · 화살표는 입력기 몫
    const at = active ? enabled.indexOf(active) : -1;
    const n = enabled.length;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (n) move(enabled[(at + 1) % n]);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (n) move(enabled[(at - 1 + n) % n]);
        break;
      case 'Home':
        if (!n || q) break; // 글자가 있으면 칸 안 커서 이동
        e.preventDefault();
        move(enabled[0]);
        break;
      case 'End':
        if (!n || q) break;
        e.preventDefault();
        move(enabled[n - 1]);
        break;
      case 'Enter':
        if (!active) break;
        e.preventDefault();
        choose(active);
        break;
      case 'Tab': {
        // 다음(Shift: 앞) 묶음의 첫 결과. 끝 묶음에서는 기본 Tab(빠른 질문 · 바깥 단추로)
        if (!active || visible.length < 2) break;
        const gi = active.groupIndex + (e.shiftKey ? -1 : 1);
        const target = enabled.find((r) => r.groupIndex === gi);
        if (!target) break;
        e.preventDefault();
        move(target);
        break;
      }
      case 'Escape':
        // 대화상자는 Base UI가 닫는다. 제자리 모양은 글자만 비운다
        if (inline && q) {
          e.preventDefault();
          setQuery('');
        }
        break;
    }
  };

  const listId = `${base}-list`;
  const showList = !loading && rows.length > 0;
  const panel = (
    <>
      <div className="tl-command-palette__search">
        <Icon name="search" className="tl-command-palette__search-icon" />
        <input
          ref={inputRef}
          className="tl-command-palette__input"
          type="text"
          role="combobox"
          aria-label={title ?? t('commandPalette.title')}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? activeDomId : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={placeholder ?? t('commandPalette.placeholder')}
          value={q}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        {!inline && (
          <kbd className="tl-command-palette__key" aria-hidden>
            {t('commandPalette.keyEsc')}
          </kbd>
        )}
      </div>
      {suggestions && suggestions.length > 0 && (
        // 추천 질문 부품(Composer와 같이 쓴다). 지금 찾는 글자와 같은 칩이 눌린 모양
        <SuggestionChips
          className="tl-command-palette__suggestions"
          label={t('commandPalette.suggestions')}
          items={suggestions}
          selected={q}
          onSelect={(s) => {
            setQuery(s);
            inputRef.current?.focus();
          }}
        />
      )}
      {children != null && <div className="tl-command-palette__extra">{children}</div>}
      <div
        ref={listRef}
        className="tl-command-palette__list"
        id={listId}
        role="listbox"
        aria-label={t('commandPalette.results')}
        hidden={!showList}
      >
        {visible.map((g, gi) => {
          const headId = `${base}-g${gi}`;
          return (
            <div
              key={g.group.id}
              className="tl-command-palette__group"
              role="group"
              aria-labelledby={headId}
            >
              {/* 묶음 이름은 aria-labelledby로 읽힌다. 목록 안의 글자 줄로 따로 읽히지 않게 숨긴다 */}
              <div className="tl-command-palette__group-label" id={headId} aria-hidden>
                {g.group.label}
              </div>
              {rows
                .filter((r) => r.groupIndex === gi)
                .map((r) => {
                  const isActive = active === r;
                  return (
                    <div
                      key={r.item.id}
                      id={r.domId}
                      className="tl-command-palette__item"
                      role="option"
                      aria-selected={isActive}
                      aria-disabled={r.item.disabled || undefined}
                      data-active={isActive || undefined}
                      // 누르는 동안 초점이 입력을 떠나지 않게
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseMove={() => !r.item.disabled && !isActive && move(r)}
                      onClick={() => choose(r)}
                    >
                      {r.item.icon && (
                        <Icon name={r.item.icon} className="tl-command-palette__item-icon" />
                      )}
                      <span className="tl-command-palette__item-text">
                        <span className="tl-command-palette__item-label">{r.item.label}</span>
                        {r.item.description && (
                          <span className="tl-command-palette__item-description">
                            {r.item.description}
                          </span>
                        )}
                      </span>
                      {r.item.meta && (
                        <span className="tl-command-palette__item-meta">{r.item.meta}</span>
                      )}
                      {isActive && (
                        <span className="tl-command-palette__item-hint" aria-hidden>
                          {t('commandPalette.open')} ↵
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
      {loading && (
        <div className="tl-command-palette__loading" aria-hidden>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="tl-command-palette__skeleton">
              <Skeleton />
            </div>
          ))}
        </div>
      )}
      {!loading && rows.length === 0 && (
        <div className="tl-command-palette__empty">{empty ?? t('commandPalette.empty')}</div>
      )}
      <div className="tl-sr-only" role="status" aria-live="polite">
        {q && !loading ? t('commandPalette.count', { count: enabled.length }) : ''}
      </div>
      <div className="tl-command-palette__footer" aria-hidden>
        <span>
          <kbd className="tl-command-palette__key">↑↓</kbd> {t('commandPalette.hintMove')}
        </span>
        {visible.length > 1 && (
          <span>
            <kbd className="tl-command-palette__key">Tab</kbd> {t('commandPalette.hintGroup')}
          </span>
        )}
        <span>
          <kbd className="tl-command-palette__key">Enter</kbd> {t('commandPalette.hintOpen')}
        </span>
        {!inline && (
          <span>
            <kbd className="tl-command-palette__key">{t('commandPalette.keyEsc')}</kbd>{' '}
            {t('commandPalette.hintClose')}
          </span>
        )}
      </div>
    </>
  );

  if (inline)
    return (
      <div
        className={cx('tl-command-palette', className)}
        id={id}
        data-testid={testID}
        data-mode="inline"
      >
        {panel}
      </div>
    );

  return (
    <D.Root open={isOpen} onOpenChange={(next) => setOpen(next)}>
      <D.Portal>
        <D.Backdrop className="tl-command-palette__backdrop" />
        <D.Popup
          className={cx('tl-command-palette', className)}
          id={id}
          data-testid={testID}
          data-mode="dialog"
          initialFocus={inputRef}
          onKeyDown={trapTab}
          aria-modal="true"
        >
          <D.Title className="tl-sr-only">{title ?? t('commandPalette.title')}</D.Title>
          {panel}
        </D.Popup>
      </D.Portal>
    </D.Root>
  );
}
CommandPalette.displayName = CommandPaletteContract.name;
