import {
  LineItemsEditorContract,
  formatAmount,
  formatCurrency,
  formatDate,
  formatPercent,
  type LineItemsColumn,
  type LineItemsEditorProps,
} from '@terracelab/trellis-contracts';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Button } from '../Button/Button.js';
import { cx } from '../_internal/cx.js';
import { FieldContext } from '../_internal/field.js';
import { useMessages } from '../_internal/locale.js';
import { useNarrowScreen } from '../_internal/sheet.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';

export interface LineCellContext<L> {
  /** 0부터 */
  index: number;
  /** 칸 접근성 이름("품목 2 단가"). 입력의 label로 넘긴다 */
  label: string;
  /** 이 칸에 오류가 있는지(cellError). 칸 안 Trellis 입력은 저절로 invalid가 된다 */
  invalid: boolean;
  /** 칸 입력 크기. 표 칸은 늘 sm */
  size: 'sm';
  /** 이 줄만 바꾼다 */
  update: (patch: Partial<L>) => void;
}

export type LineItemsWebColumn<L> = Omit<LineItemsColumn, 'render' | 'value' | 'tone'> & {
  render?: (line: L, ctx: LineCellContext<L>) => ReactNode;
  value?: (line: L) => unknown;
  /** 읽기 칸 상태. 앞 아이콘 색 + 숨은 상태 글자 */
  tone?: (line: L) => 'danger' | 'warning' | 'success' | undefined;
};

export interface LineItemsTotal {
  label: string;
  value: ReactNode;
}

export type LineItemsEditorWebProps<L extends object> = Omit<
  LineItemsEditorProps,
  | 'value'
  | 'onChange'
  | 'lineKey'
  | 'columns'
  | 'newLine'
  | 'lineError'
  | 'cellError'
  | 'totals'
  | 'footnote'
> & {
  value: readonly L[];
  onChange: (lines: L[]) => void;
  lineKey: keyof L & string;
  columns: readonly LineItemsWebColumn<L>[];
  newLine: () => L;
  /** 줄 전체 오류(합계 참여율 120% · 차변과 대변 함께). 줄 아래 한 줄 */
  lineError?: (line: L, index: number) => string | null | undefined;
  /** 칸 오류. 칸 아래 글자 + 칸 입력 aria-invalid · aria-describedby */
  cellError?: (line: L, index: number, key: string) => string | null | undefined;
  /** 표 아래 오른쪽 숫자 묶음(공급가액 · 세액 · 합계) */
  totals?: readonly LineItemsTotal[];
  /** 합계 아래 한 줄(한글 금액) */
  footnote?: ReactNode;
  /** 줄 추가 단추 옆에 둘 내용(대차 상태 · 환산 금액) */
  footer?: ReactNode;
  className?: string;
};

const NUMERIC = new Set(['amount', 'number', 'quantity', 'percent', 'currency']);
const WIDTH_UNITS: Record<string, number> = { xs: 1, sm: 1.75, md: 2, lg: 3, xl: 4, auto: 2.5 };
/** 번호 · 삭제 열 폭(단위 = space.64) */
const SIDE_UNITS = 0.625;

const alignOf = (c: Pick<LineItemsColumn, 'align' | 'format'>) =>
  c.align ?? (NUMERIC.has(c.format ?? 'text') ? 'right' : 'left');

/** 카드 · 줄 모양에서 칸 자리: title(머리 줄) · full · half · hidden */
const spanOf = (c: Pick<LineItemsColumn, 'mobile' | 'width'>) =>
  c.mobile ?? (['lg', 'xl', 'auto'].includes(c.width ?? 'auto') ? 'full' : 'half');

function formatValue(v: unknown, c: Pick<LineItemsColumn, 'format' | 'currency'>): string {
  if (v == null || v === '') return '–';
  const n = Number(v);
  switch (c.format) {
    case 'amount':
      return formatAmount(n);
    case 'number':
    case 'quantity':
      return formatAmount(n, { digits: Number.isInteger(n) ? 0 : 1 });
    case 'percent':
      return formatPercent(n);
    case 'currency':
      return formatCurrency(n, c.currency ?? 'KRW');
    case 'date':
      return formatDate(String(v));
    default:
      return String(v);
  }
}

/**
 * Enter로 옮겨 갈 수 있는 칸: 입력 · 고르기 단추(시트 모드 Select · CodeSearch) · 콤보박스.
 * 부품 안의 숨은 입력(QuantityInput 숫자 칸 · Select 값 칸)과 보조 단추(CodeSearch 목록 열기)는
 * tabindex="-1"이라 뺀다(R-34)
 */
const FOCUSABLE = [
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])',
  'button[aria-haspopup]',
  '[role="combobox"]',
  'select',
  'textarea',
]
  .map((s) => `[data-line-cell] ${s}:not(:disabled):not([tabindex="-1"]):not([aria-hidden="true"])`)
  .join(', ');

/** 보이는 칸만(접힌 · inert · display none 안의 요소는 빼고) */
const cellsIn = (root: Element | null | undefined): HTMLElement[] =>
  Array.from(root?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
    (el) =>
      !el.closest('[hidden], [inert]') &&
      (typeof el.checkVisibility !== 'function' || el.checkVisibility()),
  );

const TONE_ICON = {
  danger: 'circle-alert',
  warning: 'triangle-alert',
  success: 'circle-check',
} as const;

type Mode = 'table' | 'rows' | 'cards';
type FocusTarget = { line: number; remove: boolean } | 'add' | null;

export function LineItemsEditor<L extends object>({
  caption,
  value,
  onChange,
  lineKey,
  columns,
  newLine,
  minLines = 1,
  maxLines,
  numbered = false,
  lineError,
  cellError,
  summary = false,
  summaryLabel,
  totals: totalsProp,
  footnote,
  empty,
  addLabel,
  addIcon = 'plus',
  enterToNext = true,
  disabled = false,
  footer,
  id,
  testID,
  className,
}: LineItemsEditorWebProps<L>) {
  const t = useMessages();
  const uid = useId();
  const narrow = useNarrowScreen();
  const rootRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<FocusTarget>(null);
  const keyOf = (line: L) => String((line as Record<string, unknown>)[lineKey]);
  const canAdd = !disabled && (maxLines === undefined || value.length < maxLines);
  const canRemove = !disabled && value.length > minLines;
  const minUnits = columns.reduce(
    (a, c) => a + (WIDTH_UNITS[c.width ?? 'auto'] ?? 2.5),
    SIDE_UNITS + (numbered ? SIDE_UNITS : 0),
  );

  // 표가 들어가지 않는 폭(서랍 · 태블릿)이면 머리 없는 줄 모양. 폭은 화면이 아니라 이 상자에서 잰다
  const [tight, setTight] = useState(false);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const width = el.clientWidth;
      // jsdom처럼 폭을 모르면(0) 표로 둔다
      if (!width) return;
      const unit = Number.parseFloat(getComputedStyle(el).getPropertyValue('--tl-space-64')) || 64;
      setTight(width < minUnits * unit);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [minUnits]);
  const mode: Mode = narrow ? 'cards' : tight ? 'rows' : 'table';

  useEffect(() => {
    const target = focusTarget.current;
    if (target === null) return;
    focusTarget.current = null;
    if (target === 'add') {
      addRef.current?.focus();
      return;
    }
    const line = rootRef.current?.querySelectorAll('[data-line]')[target.line];
    const removeButton = line?.querySelector<HTMLButtonElement>(
      '[data-line-remove]:not(:disabled)',
    );
    (target.remove && removeButton ? removeButton : cellsIn(line)[0])?.focus();
  });

  const update = (index: number, patch: Partial<L>) =>
    onChange(value.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const add = () => {
    if (!canAdd) return;
    focusTarget.current = { line: value.length, remove: false };
    onChange([...value, newLine()]);
  };
  /** 지우면 윗줄의 같은 칸(삭제 단추, 꺼져 있으면 첫 칸)으로. 윗줄이 없으면 줄 추가 단추 */
  const remove = (index: number) => {
    if (!canRemove) return;
    focusTarget.current = index > 0 ? { line: index - 1, remove: true } : 'add';
    onChange(value.filter((_, i) => i !== index));
  };

  /** Enter: 다음 칸으로, 마지막 칸이면 줄 추가. 한글 조합 · Shift · 목록이 열린 칸은 그대로 둔다 */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!enterToNext || e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    const target = e.target as HTMLElement;
    if (!(target instanceof HTMLInputElement) || target.getAttribute('aria-expanded') === 'true')
      return;
    const cells = cellsIn(rootRef.current);
    const at = cells.indexOf(target);
    if (at < 0) return;
    e.preventDefault();
    const next = cells[at + 1];
    if (next) next.focus();
    else add();
  };

  const sums = columns.map((c) =>
    summary && c.total === 'sum'
      ? formatValue(
          value.reduce((a, l) => a + (Number(raw(l, c)) || 0), 0),
          c,
        )
      : null,
  );
  const totalLabel = summaryLabel ?? t('lineItems.total');
  const firstEditable = columns.findIndex((c) => c.render);
  const ids = (index: number, key?: string) => ({
    cell: `${uid}-${index}-${key}`,
    error: `${uid}-${index}-${key}-error`,
    line: `${uid}-${index}-line-error`,
  });

  /** 칸 하나: 입력(render)은 FieldContext로 감싸 invalid · 설명 · 필수가 저절로 이어진다 */
  const cell = (line: L, index: number, c: LineItemsWebColumn<L>, ci: number) => {
    if (!c.render) {
      // 읽기 칸 상태(합계 참여율 100% 초과 등): 앞 아이콘 색 + 숨은 상태 글자. 글자는 본문 색
      const tone = c.tone?.(line);
      const text = formatValue(raw(line, c), c);
      return tone ? (
        <span className="tl-line-items__tone" data-tone={tone}>
          <Icon name={TONE_ICON[tone]} className="tl-line-items__tone-icon" />
          {text}
          <span className="tl-sr-only"> {t(`lineItems.tone.${tone}`)}</span>
        </span>
      ) : (
        text
      );
    }
    const error = cellError?.(line, index, c.key) || null;
    const rowError = ci === firstEditable ? lineError?.(line, index) || null : null;
    const id = ids(index, c.key);
    const describedBy = [error ? id.error : null, rowError ? id.line : null]
      .filter(Boolean)
      .join(' ');
    return (
      <>
        <FieldContext.Provider
          value={{
            id: id.cell,
            describedBy: describedBy || undefined,
            invalid: !!error,
            required: !!c.required,
            disabled,
          }}
        >
          {c.render(line, {
            index,
            label: t('lineItems.cell', { label: caption, row: index + 1, column: c.header }),
            invalid: !!error,
            size: 'sm',
            update: (patch) => update(index, patch),
          })}
        </FieldContext.Provider>
        {error && (
          <span className="tl-line-items__cell-error" id={id.error}>
            {error}
          </span>
        )}
      </>
    );
  };
  const removeButton = (index: number) => (
    <IconButton
      icon="trash-2"
      size="sm"
      label={t('lineItems.remove', { label: caption, row: index + 1 })}
      disabled={!canRemove}
      data-line-remove
      onPress={() => remove(index)}
    />
  );
  const lineErrorNote = (line: L, index: number) => {
    const message = lineError?.(line, index) || null;
    return message ? (
      <p className="tl-line-items__error" id={ids(index).line} role="status">
        <Icon name="circle-alert" />
        {t('lineItems.error', { label: caption, row: index + 1, message })}
      </p>
    ) : null;
  };
  const required = (c: LineItemsWebColumn<L>) =>
    c.required ? (
      <>
        <span className="tl-line-items__required" aria-hidden="true" />
        <span className="tl-sr-only">{t('common.required')}</span>
      </>
    ) : null;
  const addButton = (
    <Button ref={addRef} size="sm" icon={addIcon} disabled={!canAdd} onPress={add}>
      {addLabel ?? t('lineItems.add')}
    </Button>
  );
  const emptyNote = <p className="tl-line-items__empty">{empty ?? t('lineItems.empty')}</p>;
  // 줄이 없으면 합계 행 · 합계 묶음 · 한글 금액을 그리지 않는다(모든 모양). 빈 상태 글자와 줄 추가만 남는다
  const hasLines = value.length > 0;
  const totalsBlock = !hasLines ? null : totalsProp && totalsProp.length > 0 ? (
    <div className="tl-line-items__totals-wrap">
      <dl className="tl-line-items__totals">
        {totalsProp.map((tt) => (
          <div key={tt.label} className="tl-line-items__total">
            <dt>{tt.label}</dt>
            <dd>{tt.value}</dd>
          </div>
        ))}
      </dl>
      {footnote != null && <p className="tl-line-items__footnote">{footnote}</p>}
    </div>
  ) : footnote != null ? (
    <p className="tl-line-items__footnote">{footnote}</p>
  ) : null;
  const foot = (
    <div className="tl-line-items__foot">
      <div className="tl-line-items__foot-start">
        {addButton}
        {footer}
      </div>
      {totalsBlock}
    </div>
  );

  // 표가 안 들어가는 폭: 줄(태블릿 · 서랍) 또는 카드(휴대폰). 칸 이름이 입력 위에 선다
  if (mode !== 'table') {
    const titleCol = columns.find((c) => spanOf(c) === 'title');
    return (
      <div
        ref={rootRef}
        className={cx('tl-line-items', className)}
        id={id}
        data-testid={testID}
        data-mode={mode}
        role="region"
        aria-label={caption}
        onKeyDown={onKeyDown}
      >
        {value.length === 0 ? (
          emptyNote
        ) : (
          <ol className="tl-line-items__cards">
            {value.map((line, index) => {
              const hasError = !!lineError?.(line, index);
              const field = (c: LineItemsWebColumn<L>) => {
                const ci = columns.indexOf(c);
                return (
                  <div
                    key={c.key}
                    className="tl-line-items__card-field"
                    data-span={spanOf(c)}
                    data-align={c.render ? undefined : alignOf(c)}
                    data-line-cell={c.render ? true : undefined}
                  >
                    {/* 보이는 칸 이름. 입력 이름("품목 1 수량")이 이 글자를 담는다 */}
                    <span className="tl-line-items__card-label" aria-hidden="true">
                      {c.header}
                      {required(c)}
                    </span>
                    {c.render ? (
                      cell(line, index, c, ci)
                    ) : (
                      <span className="tl-line-items__value">
                        <span className="tl-sr-only">{c.header} </span>
                        {cell(line, index, c, ci)}
                      </span>
                    )}
                  </div>
                );
              };
              return (
                <li
                  key={keyOf(line)}
                  className="tl-line-items__card"
                  data-line
                  data-error={hasError || undefined}
                >
                  <div className="tl-line-items__card-head">
                    <span className="tl-line-items__number">{index + 1}</span>
                    {titleCol && field(titleCol)}
                    {removeButton(index)}
                  </div>
                  <div className="tl-line-items__card-fields">
                    {columns
                      .filter((c) => c !== titleCol && spanOf(c) !== 'hidden')
                      .map((c) => field(c))}
                  </div>
                  {lineErrorNote(line, index)}
                </li>
              );
            })}
          </ol>
        )}
        {summary && hasLines && sums.some(Boolean) && (
          <dl className="tl-line-items__card-totals">
            {columns.map((c, i) =>
              sums[i] ? (
                <div key={c.key}>
                  <dt>
                    {totalLabel} · {c.header}
                  </dt>
                  <dd>{sums[i]}</dd>
                </div>
              ) : null,
            )}
          </dl>
        )}
        {foot}
      </div>
    );
  }

  const colCount = columns.length + 1 + (numbered ? 1 : 0);
  const firstTotal = sums.findIndex(Boolean);

  return (
    <div
      ref={rootRef}
      className={cx('tl-line-items', className)}
      id={id}
      data-testid={testID}
      data-mode="table"
      onKeyDown={onKeyDown}
    >
      <div className="tl-line-items__scroll" role="region" aria-label={caption} tabIndex={0}>
        <table
          className="tl-line-items__table"
          style={{ minWidth: `calc(var(--tl-space-64) * ${minUnits})` }}
        >
          <caption className="tl-sr-only">{caption}</caption>
          <colgroup>
            {numbered && <col data-width="side" />}
            {columns.map((c) => (
              <col key={c.key} data-width={c.width ?? 'auto'} />
            ))}
            <col data-width="side" />
          </colgroup>
          <thead>
            <tr>
              {numbered && (
                <th scope="col" className="tl-line-items__cell" data-kind="number">
                  {t('lineItems.number')}
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} scope="col" className="tl-line-items__cell" data-align={alignOf(c)}>
                  {c.header}
                  {required(c)}
                </th>
              ))}
              <th scope="col" className="tl-line-items__cell" data-kind="remove">
                <span className="tl-sr-only">{t('lineItems.removeHeader')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {value.length === 0 && (
              <tr>
                <td colSpan={colCount} className="tl-line-items__cell" data-kind="empty">
                  {emptyNote}
                </td>
              </tr>
            )}
            {value.map((line, index) => {
              const note = lineErrorNote(line, index);
              const key = keyOf(line);
              return [
                <tr
                  key={key}
                  className="tl-line-items__row"
                  data-line
                  data-error={note ? true : undefined}
                >
                  {numbered && (
                    <td className="tl-line-items__cell" data-kind="number">
                      {index + 1}
                    </td>
                  )}
                  {columns.map((c, ci) => (
                    <td
                      key={c.key}
                      className="tl-line-items__cell"
                      data-align={c.render ? undefined : alignOf(c)}
                      data-line-cell={c.render ? true : undefined}
                    >
                      {cell(line, index, c, ci)}
                    </td>
                  ))}
                  <td className="tl-line-items__cell" data-kind="remove">
                    {removeButton(index)}
                  </td>
                </tr>,
                note ? (
                  <tr key={`${key}-error`} className="tl-line-items__error-row">
                    <td colSpan={colCount}>{note}</td>
                  </tr>
                ) : null,
              ];
            })}
          </tbody>
          {summary && firstTotal >= 0 && hasLines && (
            <tfoot>
              <tr>
                {numbered && <td className="tl-line-items__cell" />}
                {columns.map((c, i) => (
                  <td key={c.key} className="tl-line-items__cell" data-align={alignOf(c)}>
                    {sums[i] ?? (i === 0 ? totalLabel : '')}
                  </td>
                ))}
                <td className="tl-line-items__cell" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {foot}
    </div>
  );
}
LineItemsEditor.displayName = LineItemsEditorContract.name;

function raw<L>(line: L, c: { key: string; value?: (line: L) => unknown }): unknown {
  return c.value ? c.value(line) : (line as Record<string, unknown>)[c.key];
}
