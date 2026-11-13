// 한국 주소 입력: 우편번호 · 도로명(검색으로 채움) · 상세 주소(사람이 친다).
// 검색은 앱이 넣는다(search prop · AddressSearchProvider · onSearchRequest). Trellis는 네트워크를 쓰지 않으므로
// 설치형 제품이 오프라인이어도 동작하고, 검색이 없으면 세 칸을 직접 입력한다.
import {
  AddressInputContract,
  type AddressInputProps,
  type AddressResult,
  type AddressSearch,
  type AddressValue,
} from '@terracelab/trellis-contracts';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Dialog as D } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { FieldContext, useFieldControl } from '../_internal/field.js';
import { useMessages } from '../_internal/locale.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Input } from '../Input/Input.js';

const AddressSearchContext = createContext<AddressSearch | null>(null);

/** 앱 전체의 주소 검색 함수. 앱 루트에서 한 번 감싼다. 칸의 search prop이 이긴다 */
export function AddressSearchProvider({
  search,
  children,
}: {
  search: AddressSearch | null;
  children?: ReactNode;
}) {
  return <AddressSearchContext.Provider value={search}>{children}</AddressSearchContext.Provider>;
}

const EMPTY: AddressValue = { postcode: '', road: '', detail: '' };

type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'done'; query: string; results: readonly AddressResult[] }
  | { status: 'error'; query: string };

/** 검색 창 안(대화상자 · 아래 시트가 같이 쓴다) */
function SearchPanel({
  search,
  onPick,
  inputRef,
}: {
  search: AddressSearch;
  onPick: (result: AddressResult) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const t = useMessages();
  const base = useId();
  const listId = `${base}-list`;
  const optionId = (i: number) => `${base}-option-${i}`;
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const [active, setActive] = useState(-1);
  const running = useRef<AbortController | null>(null);
  // 창이 닫히면(언마운트) 진행 중인 검색을 끊는다
  useEffect(() => () => running.current?.abort(), []);
  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`${base}-option-${active}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [active, base]);

  const run = async (q = query.trim()) => {
    if (!q) return;
    running.current?.abort();
    const controller = new AbortController();
    running.current = controller;
    setActive(-1);
    setState({ status: 'loading', query: q });
    try {
      const results = await search(q, controller.signal);
      if (controller.signal.aborted) return;
      setState({ status: 'done', query: q, results });
      setActive(results.length > 0 ? 0 : -1);
    } catch {
      if (controller.signal.aborted) return;
      setState({ status: 'error', query: q });
    }
  };

  const results = state.status === 'done' ? state.results : [];
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const picked = active >= 0 ? results[active] : undefined;
      if (picked) onPick(picked);
      else void run();
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
  };

  const status =
    state.status === 'idle'
      ? t('addressInput.hint')
      : state.status === 'loading'
        ? t('common.loading')
        : state.status === 'error'
          ? t('addressInput.failed')
          : results.length === 0
            ? t('addressInput.empty')
            : t('addressInput.results', { count: results.length });

  // 창은 포털로 뜨지만 문맥은 따라온다. 찾기 칸이 바깥 Field의 id · 라벨을 가져가지 않게 끊는다
  return (
    <FieldContext.Provider value={null}>
      <div className="tl-address-input-search" data-status={state.status}>
        <div className="tl-address-input-search__bar">
          <Input
            ref={inputRef}
            className="tl-address-input-search__field"
            type="search"
            icon="search"
            role="combobox"
            label={t('addressInput.query')}
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-autocomplete="none"
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
            placeholder={t('addressInput.queryPlaceholder')}
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(v) => {
              setQuery(v);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
          />
          <Button onPress={() => void run()} loading={state.status === 'loading'}>
            {t('addressInput.submit')}
          </Button>
        </div>
        <div className="tl-address-input-search__status" role="status">
          {state.status === 'loading' && (
            <Icon name="loader-circle" className="tl-address-input-search__spin" />
          )}
          <span>{status}</span>
          {state.status === 'error' && (
            <Button
              size="sm"
              variant="ghost"
              icon="refresh-cw"
              onPress={() => void run(state.query)}
            >
              {t('common.retry')}
            </Button>
          )}
        </div>
        <ul
          className="tl-address-input-search__list"
          id={listId}
          role="listbox"
          aria-label={t('addressInput.search')}
          hidden={results.length === 0}
        >
          {results.map((r, i) => (
            <li
              key={`${r.postcode}-${r.road}-${i}`}
              id={optionId(i)}
              className="tl-address-input-search__option"
              role="option"
              aria-selected={i === active}
              data-active={i === active || undefined}
              onMouseMove={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(r)}
            >
              <span className="tl-address-input-search__text">
                <span className="tl-address-input-search__road">
                  {r.road}
                  {r.building && (
                    <span className="tl-address-input-search__building"> {r.building}</span>
                  )}
                </span>
                {r.jibun && (
                  <span className="tl-address-input-search__jibun">
                    {t('addressInput.jibun')} {r.jibun}
                  </span>
                )}
              </span>
              <span className="tl-address-input-search__postcode">{r.postcode}</span>
            </li>
          ))}
        </ul>
      </div>
    </FieldContext.Provider>
  );
}

export function AddressInput({
  label,
  value,
  defaultValue,
  onChange,
  search: searchProp,
  onSearchRequest,
  disabled,
  invalid,
  required,
  readOnly = false,
  name,
  id,
  testID,
  className,
}: AddressInputProps & { className?: string }) {
  const t = useMessages();
  const field = useFieldControl({ id, invalid, required, disabled });
  const sheet = useSheetMode();
  const provided = useContext(AddressSearchContext);
  const search = searchProp ?? provided;
  const searchable = !readOnly && Boolean(onSearchRequest || search);
  const base = useId();
  const [inner, setInner] = useState<AddressValue | null>(defaultValue ?? null);
  const current = (value === undefined ? inner : value) ?? EMPTY;
  // onSearchRequest의 apply는 앱이 나중에 부른다. 그때의 값으로 합친다
  const latest = useRef(current);
  latest.current = current;
  const [open, setOpen] = useState(false);
  const picked = useRef(false);
  const queryRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLButtonElement>(null);

  const emit = (next: AddressValue) => {
    const empty = !next.postcode && !next.road && !next.detail;
    const out = empty ? null : next;
    if (value === undefined) setInner(out);
    onChange?.(out);
  };
  const apply = (r: AddressResult) => {
    const prev = latest.current;
    emit({
      postcode: r.postcode,
      road: r.road,
      ...(r.jibun ? { jibun: r.jibun } : {}),
      // 같은 건물을 다시 고르면 상세 주소를 남기고, 다른 건물이면 비운다
      detail: r.road === prev.road ? prev.detail : '',
    });
  };
  const pick = (r: AddressResult) => {
    apply(r);
    picked.current = true;
    setOpen(false);
    // 시트는 닫힌 뒤 포커스를 단추로 돌려주므로 한 박자 뒤에 상세 주소로 옮긴다
    if (sheet) setTimeout(() => detailRef.current?.focus(), 350);
  };
  const openSearch = () => {
    if (field.disabled || readOnly) return;
    if (onSearchRequest) {
      onSearchRequest((r) => {
        apply(r);
        requestAnimationFrame(() => detailRef.current?.focus());
      });
      return;
    }
    if (!search) return;
    picked.current = false;
    setOpen(true);
  };

  // 오류 요약 · 라벨에서 묶음으로 포커스가 오면 칸으로 넘긴다.
  // 검색이 있으면 비었을 때 검색 단추, 찬 뒤에는 상세 주소. 직접 입력이면 우편번호
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const target = searchable
      ? current.road
        ? detailRef.current
        : searchRef.current
      : e.currentTarget.querySelector<HTMLElement>('input:not([type="hidden"])');
    target?.focus();
  };
  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) e.preventDefault();
  };

  // 칸마다 Field 문맥을 새로 준다: 자기 id · 자기 이름, Field의 설명 · 오류 · 비활성은 그대로
  const part = (key: string, req = false) => ({
    id: `${base}-${key}`,
    describedBy: field.describedBy,
    invalid: field.invalid,
    required: req && field.required,
    disabled: field.disabled,
  });
  const fixed = searchable; // 검색이 있으면 우편번호 · 도로명은 검색으로만 채운다
  const sub = (key: 'postcode' | 'road' | 'jibun' | 'detail') =>
    name ? { name: `${name}.${key}` } : {};

  return (
    <div
      className={cx('tl-address-input', className)}
      role="group"
      id={field.id}
      data-testid={testID}
      data-mode={searchable ? 'search' : 'manual'}
      data-state={field.invalid ? 'error' : field.disabled ? 'disabled' : undefined}
      aria-labelledby={field.labelId}
      aria-label={field.labelId ? undefined : (label ?? t('addressInput.label'))}
      tabIndex={-1}
      onFocus={onFocus}
      onMouseDown={onMouseDown}
    >
      <div className="tl-address-input__row">
        <FieldContext.Provider value={part('postcode', true)}>
          <Input
            className="tl-address-input__postcode"
            label={t('addressInput.postcode')}
            placeholder={t('addressInput.postcode')}
            value={current.postcode}
            onChange={(v) => emit({ ...current, postcode: v.replace(/\D/g, '').slice(0, 5) })}
            readOnly={readOnly || fixed}
            inputMode="numeric"
            maxLength={5}
            autoComplete="postal-code"
            {...sub('postcode')}
            {...(fixed ? { onClick: openSearch, onEnter: openSearch } : {})}
          />
        </FieldContext.Provider>
        {searchable && (
          <Button
            ref={searchRef}
            className="tl-address-input__search"
            icon="search"
            disabled={field.disabled}
            aria-haspopup={onSearchRequest ? undefined : 'dialog'}
            aria-expanded={onSearchRequest ? undefined : open}
            onPress={openSearch}
          >
            {t('addressInput.search')}
          </Button>
        )}
      </div>
      <FieldContext.Provider value={part('road', true)}>
        <Input
          label={t('addressInput.road')}
          placeholder={t('addressInput.road')}
          value={current.road}
          onChange={(v) => emit({ ...current, road: v })}
          readOnly={readOnly || fixed}
          autoComplete="address-line1"
          {...sub('road')}
          {...(fixed ? { onClick: openSearch, onEnter: openSearch } : {})}
        />
      </FieldContext.Provider>
      {current.jibun && (
        <p className="tl-address-input__jibun">
          {t('addressInput.jibun')} {current.jibun}
        </p>
      )}
      <FieldContext.Provider value={part('detail')}>
        <Input
          ref={detailRef}
          label={t('addressInput.detail')}
          placeholder={t('addressInput.detail')}
          value={current.detail}
          onChange={(v) => emit({ ...current, detail: v })}
          readOnly={readOnly}
          autoComplete="address-line2"
          {...sub('detail')}
        />
      </FieldContext.Provider>
      {name && <input type="hidden" name={`${name}.jibun`} value={current.jibun ?? ''} />}
      {search &&
        !onSearchRequest &&
        (sheet ? (
          <Sheet open={open} onOpenChange={setOpen} title={t('addressInput.search')}>
            <SearchPanel search={search} onPick={pick} inputRef={queryRef} />
          </Sheet>
        ) : (
          <D.Root open={open} onOpenChange={(next) => setOpen(next)}>
            <D.Portal>
              <D.Backdrop className="tl-dialog__backdrop" />
              <D.Popup
                className="tl-dialog tl-address-input-dialog"
                data-size="md"
                initialFocus={queryRef}
                // 고르면 상세 주소로, 그냥 닫으면 검색 단추로
                finalFocus={() => (picked.current ? detailRef.current : true)}
              >
                <div className="tl-dialog__head">
                  <div className="tl-dialog__titles">
                    <D.Title className="tl-dialog__title">{t('addressInput.search')}</D.Title>
                  </div>
                  <D.Close render={<IconButton icon="x" label={t('common.close')} size="sm" />} />
                </div>
                <div className="tl-dialog__body">
                  <SearchPanel search={search} onPick={pick} inputRef={queryRef} />
                </div>
              </D.Popup>
            </D.Portal>
          </D.Root>
        ))}
    </div>
  );
}
AddressInput.displayName = AddressInputContract.name;
