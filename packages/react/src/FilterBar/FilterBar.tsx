import {
  FilterBarContract,
  formatAmount,
  multiSelectSummary,
  type FilterBarProps,
  type SelectOption,
} from '@terracelab/trellis-contracts';
import {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../_internal/cx.js';
import { Sheet, useSheetMode } from '../_internal/sheet.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { useLocale, useMessages } from '../_internal/locale.js';

export type FilterBarWebProps = Omit<FilterBarProps, 'children' | 'search' | 'actions'> & {
  children?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

// 한 줄 조회 필터(PR-27): 이름이 있는 고르기 컨트롤은 "이름 값 ▾" 칩 하나로 묶는다.
// 기본값(빈 값 · 'all' · 첫 옵션 = "전체")인 칩은 회색, 다른 값을 고른 칩만 선택 테두리 + 옅은 브랜드 바탕.
// 모든 칩이 파랗게 서면 검색 칸이 묻히고 무엇을 걸러 놓았는지도 안 보인다
const CHIP_CONTROLS = new Set(['Select', 'MultiSelect', 'PeriodPicker']);
/** 시트 안에서 선택지를 칩 묶음으로 바로 펼치는 최대 개수(넘으면 컨트롤이 시트를 하나 더 연다, PR-30) */
export const FILTER_INLINE_MAX = 6;

type ControlProps = {
  label?: unknown;
  name?: unknown;
  value?: unknown;
  options?: readonly SelectOption[];
  onChange?: (value: unknown) => void;
};
type Control = ReactElement<ControlProps>;

const typeOf = (child: Control) => (child.type as { displayName?: string }).displayName ?? '';
const labelOf = (child: ReactNode): string | null =>
  isValidElement<ControlProps>(child) && typeof child.props.label === 'string'
    ? child.props.label
    : null;
/** 칩으로 묶는 컨트롤: label이 있는 Select · MultiSelect · PeriodPicker */
const isChip = (child: ReactNode): child is Control =>
  isValidElement<ControlProps>(child) && !!labelOf(child) && CHIP_CONTROLS.has(typeOf(child));

function chipActive(type: string, props: ControlProps): boolean {
  const v = props.value;
  if (type === 'MultiSelect') return Array.isArray(v) && v.length > 0;
  if (type === 'PeriodPicker') return false;
  if (v == null || v === '' || v === 'all') return false;
  return v !== props.options?.[0]?.value;
}

/** 해제하면 돌아갈 값: Select = 첫 선택지("전체"), MultiSelect = 빈 목록 */
const resetValueOf = (type: string, props: ControlProps): unknown =>
  type === 'MultiSelect' ? [] : (props.options?.[0]?.value ?? null);

/** 접힌 grid 요약 · 칩에 쓰는 지금 값 글자 */
function valueText(type: string, props: ControlProps, placeholder: string, locale: 'ko' | 'en') {
  const options = props.options ?? [];
  if (type === 'MultiSelect' && Array.isArray(props.value))
    return multiSelectSummary(options, props.value as string[], placeholder, locale);
  if (type === 'PeriodPicker') {
    const p = props.value as { from?: string; to?: string } | null | undefined;
    return p?.from && p.to ? `${p.from} ~ ${p.to}` : placeholder;
  }
  return options.find((o) => o.value === props.value)?.label ?? placeholder;
}

/** 시트 안 칩 묶음으로 펼칠 수 있는지: 값을 화면이 들고(value + onChange) 선택지가 적은 Select · MultiSelect */
const inlineable = (type: string, props: ControlProps) =>
  (type === 'Select' || type === 'MultiSelect') &&
  props.value !== undefined &&
  typeof props.onChange === 'function' &&
  (props.options?.length ?? 0) > 0 &&
  (props.options?.length ?? 0) <= FILTER_INLINE_MAX;

function InlineChoices({
  type,
  props,
  labelId,
}: {
  type: string;
  props: ControlProps;
  labelId: string;
}) {
  const multi = type === 'MultiSelect';
  const picked = multi ? ((props.value as readonly string[]) ?? []) : [props.value];
  return (
    <div
      className="tl-filter-bar__choices"
      role={multi ? 'group' : 'radiogroup'}
      aria-labelledby={labelId}
    >
      {props.options?.map((o) => {
        const checked = picked.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={checked}
            disabled={o.disabled}
            className="tl-filter-bar__choice tl-focusable"
            onClick={() => {
              if (!multi) props.onChange?.(o.value);
              else
                props.onChange?.(
                  checked ? picked.filter((v) => v !== o.value) : [...picked, o.value],
                );
            }}
          >
            {checked && <Icon name="check" size={16} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterBar({
  children,
  search,
  onReset,
  resultCount,
  activeCount,
  actions,
  layout = 'inline',
  columns = 2,
  onSearch,
  searching = false,
  collapsible = false,
  onClearFilter,
  label,
  id,
  testID,
  className,
}: FilterBarWebProps) {
  const t = useMessages();
  const regionName = label ?? t('filterBar.label');
  const locale = useLocale();
  const sheet = useSheetMode();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const baseId = useId();
  const gridId = `${baseId}-grid`;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const hasEnd = resultCount != null || actions != null;
  const count = resultCount != null && (
    <span className="tl-filter-bar__count" aria-live="polite">
      {t('filterBar.result')}{' '}
      <span className="tl-filter-bar__count-value">
        {t('common.items', { count: formatAmount(resultCount) })}
      </span>
    </span>
  );
  const end = hasEnd && (
    <div className="tl-filter-bar__end">
      {count}
      {actions != null && <div className="tl-filter-bar__actions">{actions}</div>}
    </div>
  );

  /** 기본값이 아닌 칩의 해제 동작. onClearFilter가 없으면 컨트롤 onChange에 기본값(값을 화면이 들 때만) */
  const clearOf = (child: Control): (() => void) | null => {
    const type = typeOf(child);
    const { props } = child;
    if (!chipActive(type, props)) return null;
    const name = typeof props.name === 'string' ? props.name : String(props.label);
    if (onClearFilter) return () => onClearFilter(name);
    if (props.value !== undefined && typeof props.onChange === 'function') {
      const next = resetValueOf(type, props);
      return () => props.onChange?.(next);
    }
    return null;
  };
  const clearButton = (child: Control, label: string) => {
    const clear = clearOf(child);
    return (
      clear && (
        <button
          type="button"
          className="tl-filter-bar__chip-clear tl-focusable"
          aria-label={t('filterBar.clearFilter', { label })}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            // 해제 단추는 사라진다. 포커스를 칩의 컨트롤로(접힌 요약 칩은 펼치기 단추로) 옮겨 잃지 않게 한다
            const chip = e.currentTarget.closest('.tl-filter-bar__chip');
            const control = chip?.querySelector<HTMLElement>(
              'button:not(.tl-filter-bar__chip-clear), input, [tabindex]',
            );
            clear();
            (control ?? toggleRef.current)?.focus();
          }}
        >
          <Icon name="x" size={16} />
        </button>
      )
    );
  };
  /** "이름 값 ▾" 칩. 기본값이 아닌 칩은 칠하고 해제 단추를 단다(PR-30) */
  const chipOf = (child: ReactNode, i: number): ReactNode => {
    if (!isChip(child)) return child;
    const label = labelOf(child)!;
    return (
      <div
        key={child.key ?? i}
        className="tl-filter-bar__chip"
        data-active={chipActive(typeOf(child), child.props) || undefined}
      >
        {/* 컨트롤이 같은 이름을 이미 읽으므로 화면 낭독기에는 숨긴다 */}
        <span className="tl-filter-bar__chip-label" aria-hidden="true">
          {label}
        </span>
        {child}
        {clearButton(child, label)}
      </div>
    );
  };

  // 좁은 화면(PR-30): 검색 한 줄 + "필터 N" 단추로 시작하는 칩 가로 줄. 칩은 그 조건의 시트를 바로 연다.
  // 칩이 아닌 컨트롤(label 없는 것)은 "검색 조건" 시트에만 놓인다
  if (sheet && children != null) {
    const all = Children.toArray(children);
    return (
      <div
        className={cx('tl-filter-bar', className)}
        id={id}
        data-testid={testID}
        data-mode="sheet"
        role="search"
        aria-label={regionName}
      >
        {search != null && (
          <div className="tl-filter-bar__row">
            <div className="tl-filter-bar__search">{search}</div>
          </div>
        )}
        <div className="tl-filter-bar__chips">
          <Button
            icon="sliders-horizontal"
            className="tl-filter-bar__filter"
            aria-haspopup="dialog"
            aria-expanded={open}
            onPress={() => setOpen(true)}
          >
            {activeCount
              ? t('filterBar.filterCount', { count: activeCount })
              : t('filterBar.filter')}
          </Button>
          {all.filter(isChip).map(chipOf)}
        </div>
        {end}
        <Sheet
          open={open}
          onOpenChange={setOpen}
          title={t('filterBar.label')}
          className="tl-filter-bar__sheet"
          footer={
            <>
              {onReset && (
                <Button variant="secondary" icon="rotate-ccw" onPress={onReset}>
                  {t('common.reset')}
                </Button>
              )}
              <Button variant="primary" onPress={() => setOpen(false)}>
                {resultCount != null
                  ? t('filterBar.showResults', { count: formatAmount(resultCount) })
                  : t('common.close')}
              </Button>
            </>
          }
        >
          <div className="tl-filter-bar__sheet-filters">
            {all.map((child, i) => {
              // label을 가진 컨트롤은 위에 이름을 보인다. 선택지가 적은 Select · MultiSelect는
              // 시트를 하나 더 열지 않고 칩 묶음으로 바로 펼친다(PR-30). 이때 이름이 묶음의 접근성 이름이다
              const label = labelOf(child);
              if (!label || !isValidElement<ControlProps>(child)) return child;
              const type = typeOf(child);
              const labelId = `${baseId}-l${i}`;
              const inline = inlineable(type, child.props);
              return (
                <div key={child.key ?? i} className="tl-filter-bar__sheet-field">
                  <span
                    id={labelId}
                    className="tl-filter-bar__sheet-label"
                    aria-hidden={inline ? undefined : 'true'}
                  >
                    {label}
                  </span>
                  {inline ? (
                    <InlineChoices type={type} props={child.props} labelId={labelId} />
                  ) : (
                    child
                  )}
                </div>
              );
            })}
          </div>
        </Sheet>
      </div>
    );
  }

  // 조회 화면(PR-26): 라벨 열 + 입력 칸 격자, 아래 줄에 건수 · 초기화 · 검색 · 동작
  if (layout === 'grid') {
    const fieldOf = (child: ReactNode, i: number) => (
      <div key={i} className="tl-filter-bar__field">
        {/* 컨트롤이 같은 이름을 이미 가지므로 화면 낭독기에는 숨긴다 */}
        <span className="tl-filter-bar__field-label" aria-hidden="true">
          {labelOf(child)}
        </span>
        <div className="tl-filter-bar__field-control">{child}</div>
      </div>
    );
    // 접으면(PR-30) 격자 대신 적용한 조건을 칩 한 줄로 요약한다. 격자는 숨기기만 해서 입력한 글자가 남는다
    const applied = Children.toArray(children).filter(
      (child): child is Control => isChip(child) && chipActive(typeOf(child), child.props),
    );
    const keyword =
      isValidElement<{ value?: unknown }>(search) &&
      typeof search.props.value === 'string' &&
      search.props.value.trim()
        ? search.props.value.trim()
        : null;
    const summary = (
      <div className="tl-filter-bar__summary" role="group" aria-label={t('filterBar.applied')}>
        {keyword && (
          <span className="tl-filter-bar__chip" data-active>
            <span className="tl-filter-bar__chip-label">{t('filterBar.keyword')}</span>
            <span className="tl-filter-bar__chip-value">{keyword}</span>
          </span>
        )}
        {applied.map((child, i) => {
          const label = labelOf(child)!;
          return (
            <span key={child.key ?? i} className="tl-filter-bar__chip" data-active>
              <span className="tl-filter-bar__chip-label">{label}</span>
              <span className="tl-filter-bar__chip-value">
                {valueText(typeOf(child), child.props, t('select.placeholder'), locale)}
              </span>
              {clearButton(child, label)}
            </span>
          );
        })}
        {!keyword && applied.length === 0 && (
          <span className="tl-filter-bar__summary-empty">{t('filterBar.noConditions')}</span>
        )}
      </div>
    );
    return (
      <form
        className={cx('tl-filter-bar', className)}
        id={id}
        data-testid={testID}
        data-layout="grid"
        data-columns={columns}
        data-collapsed={(collapsible && collapsed) || undefined}
        role="search"
        aria-label={regionName}
        aria-busy={searching || undefined}
        onSubmit={(e) => {
          e.preventDefault();
          if (!searching) onSearch?.();
        }}
      >
        <div className="tl-filter-bar__grid" id={gridId} hidden={collapsible && collapsed}>
          {Children.toArray(children).map(fieldOf)}
          {search != null && (
            <div className="tl-filter-bar__field" data-wide>
              <span className="tl-filter-bar__field-label" aria-hidden="true">
                {t('filterBar.keyword')}
              </span>
              <div className="tl-filter-bar__field-control">{search}</div>
            </div>
          )}
        </div>
        {collapsible && collapsed && summary}
        <div className="tl-filter-bar__foot">
          {count}
          <div className="tl-filter-bar__foot-buttons">
            {collapsible && (
              <Button
                ref={toggleRef}
                variant="ghost"
                icon={collapsed ? 'chevron-down' : 'chevron-up'}
                aria-expanded={!collapsed}
                aria-controls={gridId}
                onPress={() => setCollapsed((c) => !c)}
              >
                {collapsed ? t('filterBar.expand') : t('filterBar.collapse')}
              </Button>
            )}
            {onReset && (
              <Button variant="secondary" icon="rotate-ccw" onPress={onReset}>
                {t('common.reset')}
              </Button>
            )}
            {onSearch && (
              <Button variant="primary" icon="search" type="submit" loading={searching}>
                {t('filterBar.search')}
              </Button>
            )}
            {actions != null && <div className="tl-filter-bar__actions">{actions}</div>}
          </div>
        </div>
      </form>
    );
  }

  return (
    <div
      className={cx('tl-filter-bar', className)}
      id={id}
      data-testid={testID}
      role="search"
      aria-label={regionName}
    >
      {search != null && <div className="tl-filter-bar__search">{search}</div>}
      {children != null && (
        <div className="tl-filter-bar__filters">{Children.map(children, chipOf)}</div>
      )}
      {onReset && (
        // 한 줄의 검색 · 칩이 md(PR-30)라 초기화도 md. 칩 밖 컨트롤도 md로 둔다(R-37 5, D-135)
        <Button variant="ghost" icon="rotate-ccw" onPress={onReset}>
          {t('common.reset')}
        </Button>
      )}
      {end}
    </div>
  );
}
FilterBar.displayName = FilterBarContract.name;
