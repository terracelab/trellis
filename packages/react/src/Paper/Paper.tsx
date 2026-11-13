// 종이 서식(D-77): 한 장(Paper)과 서식 조각. 색 · 글자는 paper.* 토큰이라 앱 테마 · 글자 크기 모드와 관계없다.
// 간격은 고정 토큰(space)이고 앱 밀도는 닿지 않는다. 미리보기는 PaperPreview, 인쇄는 printPapers.
// 내용이 한 장 높이를 넘으면 data-overflow · onOverflowChange로 알린다(R-35).
import {
  formatAmount,
  PaperContract,
  type PaperFieldRow,
  type PaperFieldsProps,
  type PaperMoneyColumn,
  type PaperMoneyTableProps,
  type PaperProps,
  type PaperSealProps,
  type PaperSignatureProps,
  type PaperSignPairProps,
  type PaperSignParty,
  type PaperTextProps,
  type PaperTitleProps,
} from '@terracelab/trellis-contracts';
import {
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages, type Translate } from '../_internal/locale.js';
import { PaperPreviewContext } from './context.js';

export type PaperWebProps = Omit<PaperProps, 'header' | 'footer' | 'children'> & {
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** offsetHeight는 정수로 반올림되고 한 장 높이는 1122.52px 같은 소수라 1px은 넘침으로 치지 않는다 */
const OVERFLOW_SLACK = 1;

/**
 * 내용이 한 장 높이를 넘는가. 종이는 최소 높이가 한 장이고 넘치면 늘어나므로 둘을 비교한다.
 * 잴 수 없으면(jsdom · 화면에서 display: none인 인쇄 뿌리) null
 */
function measureOverflow(el: HTMLElement): boolean | null {
  const page = parseFloat(getComputedStyle(el).minHeight);
  const height = el.offsetHeight;
  if (!(page > 0) || !height) return null;
  return height > page + OVERFLOW_SLACK;
}

/** 넘침을 ResizeObserver로 다시 잰다(내용 · 글꼴 · 이미지가 바뀌면 종이 높이가 바뀐다) */
function useOverflow(
  ref: RefObject<HTMLElement | null>,
  onChange: ((overflow: boolean) => void) | undefined,
): boolean {
  const [overflow, setOverflow] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const next = measureOverflow(el);
      if (next !== null) setOverflow(next);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  const latest = useRef(onChange);
  useLayoutEffect(() => {
    latest.current = onChange;
  });
  // 바뀔 때만 알린다. 처음 잰 값이 넘침이 아니면 부르지 않는다
  const reported = useRef(false);
  useEffect(() => {
    if (!reported.current && !overflow) return;
    reported.current = true;
    latest.current?.(overflow);
  }, [overflow]);
  return overflow;
}

/** 종이 한 장. 여러 쪽이면 Paper를 여러 개 둔다(인쇄에서 한 장씩 쪽이 나뉜다) */
export function Paper({
  size = 'a4',
  orientation = 'portrait',
  margin = 'md',
  density = 'regular',
  label,
  header,
  footer,
  children,
  onOverflowChange,
  id,
  testID,
  className,
}: PaperWebProps) {
  const t = useMessages();
  const ref = useRef<HTMLElement>(null);
  const overflow = useOverflow(ref, onOverflowChange);
  const preview = useContext(PaperPreviewContext);
  const key = useId();
  useEffect(() => {
    if (!preview || !overflow) return;
    preview.report(key, label, true);
    return () => preview.report(key, label, false);
  }, [preview, key, label, overflow]);

  return (
    <article
      ref={ref}
      className={cx('tl-paper', className)}
      id={id}
      data-testid={testID}
      data-size={size}
      data-orientation={orientation}
      data-margin={margin}
      data-density={density}
      data-overflow={overflow ? '' : undefined}
      // 안에 넣은 Trellis 컴포넌트도 라이트로 그린다(종이는 늘 흰 바탕)
      data-theme="light"
      aria-label={label}
    >
      {header != null && <header className="tl-paper__header">{header}</header>}
      <div className="tl-paper__body">{children}</div>
      {footer != null && <footer className="tl-paper__footer">{footer}</footer>}
      {/* 미리보기에서만: 1장이 끝나는 자리. 글로 된 안내는 PaperPreview가 줄이지 않은 글자로 한다 */}
      {overflow && preview && (
        <div className="tl-paper__overflow" aria-hidden="true">
          <span className="tl-paper__overflow-label">{t('paper.sheetEnd')}</span>
        </div>
      )}
    </article>
  );
}
Paper.displayName = PaperContract.name;

/** 'YYYY-MM-DD'는 사전의 날짜 문장(2026년 11월 9일)으로, 그 밖의 글자는 그대로 */
function paperDate(t: Translate, date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return date;
  return t('paper.date', { year: m[1]!, month: Number(m[2]), day: Number(m[3]), iso: date });
}

const isEmpty = (v: unknown) => v == null || v === '';

/* ── 제목 · 문단 ─────────────────────────────────────────── */

export type PaperTitleWebProps = Omit<PaperTitleProps, 'children' | 'subtitle'> & {
  children?: ReactNode;
  subtitle?: ReactNode;
};

/** 문서 제목(h1). 가운데 · 넓은 자간 */
export function PaperTitle({ children, subtitle }: PaperTitleWebProps) {
  return (
    <div className="tl-paper-title">
      <h1 className="tl-paper-title__text">{children}</h1>
      {!isEmpty(subtitle) && <p className="tl-paper-title__subtitle">{subtitle}</p>}
    </div>
  );
}

export type PaperTextWebProps = Omit<PaperTextProps, 'children'> & { children?: ReactNode };

/** 문단. statement = 가운데 확인 문장, note = 작은 주석(근거 법령 · 계산 기준) */
export function PaperText({ variant = 'body', children }: PaperTextWebProps) {
  return (
    <p className="tl-paper-text" data-variant={variant}>
      {children}
    </p>
  );
}

/* ── 칸 표 ─────────────────────────────────────────────── */

export type PaperFieldRowWeb = Omit<PaperFieldRow, 'value'> & { value: ReactNode };

export type PaperFieldsWebProps = Omit<PaperFieldsProps, 'rows' | 'note'> & {
  rows: readonly PaperFieldRowWeb[];
  note?: ReactNode;
};

/** 표의 줄: 4열이면 full이 아닌 칸을 둘씩 짝짓고, 2열이면 한 줄에 하나 */
function fieldLines(rows: readonly PaperFieldRowWeb[], columns: 2 | 4): PaperFieldRowWeb[][] {
  const lines: PaperFieldRowWeb[][] = [];
  let pair: PaperFieldRowWeb[] = [];
  const flush = () => {
    if (pair.length) lines.push(pair);
    pair = [];
  };
  for (const row of rows) {
    if (columns === 2 || row.full) {
      flush();
      lines.push([row]);
      continue;
    }
    pair.push(row);
    if (pair.length === 2) flush();
  }
  flush();
  return lines;
}

/** 묶음 제목(h2) · 표 위 설명 · 표. 제목은 표 이름, 설명은 표 설명으로 이어진다 */
function Block({
  root,
  title,
  note,
  children,
  data,
}: {
  root: string;
  title?: string | undefined;
  note?: ReactNode;
  children: (ids: { titleId?: string; noteId?: string }) => ReactNode;
  data?: Record<`data-${string}`, string | number>;
}) {
  const id = useId();
  const titleId = title ? `${id}-title` : undefined;
  const noteId = isEmpty(note) ? undefined : `${id}-note`;
  return (
    <div className={root} {...data}>
      {titleId && (
        <h2 id={titleId} className={`${root}__title`}>
          {title}
        </h2>
      )}
      {noteId && (
        <p id={noteId} className={`${root}__note`}>
          {note}
        </p>
      )}
      {children({
        ...(titleId ? { titleId } : {}),
        ...(noteId ? { noteId } : {}),
      })}
    </div>
  );
}

/** 이름 | 값 | 이름 | 값 칸 표. 값이 비면 – */
export function PaperFields({ title, note, rows, columns = 4 }: PaperFieldsWebProps) {
  const id = useId();
  const lines = fieldLines(rows, columns);
  return (
    <Block root="tl-paper-fields" title={title} note={note} data={{ 'data-columns': columns }}>
      {({ titleId, noteId }) => (
        <table className="tl-paper-table" aria-labelledby={titleId} aria-describedby={noteId}>
          <colgroup>
            <col data-role="label" />
            <col />
            {columns === 4 && (
              <>
                <col data-role="label" />
                <col />
              </>
            )}
          </colgroup>
          <tbody>
            {lines.map((line, r) => (
              <tr key={r}>
                {line.map((cell, c) => {
                  const head = `${id}-${r}-${c}`;
                  return (
                    <PaperFieldCell
                      key={`${cell.label}-${c}`}
                      head={head}
                      cell={cell}
                      span={line.length === 1 && columns === 4 ? 3 : undefined}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Block>
  );
}

function PaperFieldCell({
  head,
  cell,
  span,
}: {
  head: string;
  cell: PaperFieldRowWeb;
  span: number | undefined;
}) {
  return (
    <>
      {/* 한 줄에 이름 칸이 둘이라 scope 대신 headers로 값과 이름을 잇는다 */}
      <th id={head}>{cell.label}</th>
      <td headers={head} colSpan={span}>
        {isEmpty(cell.value) ? (cell.blank ? null : '–') : cell.value}
      </td>
    </>
  );
}

/* ── 금액 표 ───────────────────────────────────────────── */

export type PaperMoneyTableWebProps = Omit<
  PaperMoneyTableProps,
  'rows' | 'total' | 'note' | 'carryIn' | 'carryOut'
> & {
  rows: readonly (readonly ReactNode[])[];
  // undefined도 받는다: 쪽마다 그리는 표에서 paginateMoneyRows 결과를 그대로 넘긴다(total={last ? … : undefined})
  total?: readonly ReactNode[] | undefined;
  carryIn?: readonly ReactNode[] | undefined;
  carryOut?: readonly ReactNode[] | undefined;
  note?: ReactNode;
};

/** 칸 정렬: 열이 정하지 않으면 숫자는 오른쪽 */
const alignOf = (col: PaperMoneyColumn | undefined, value: ReactNode) =>
  col?.align ?? (typeof value === 'number' ? 'right' : 'left');
/** 숫자는 천 단위(formatAmount, 음수는 U+2212) */
const cellText = (value: ReactNode) => (typeof value === 'number' ? formatAmount(value) : value);

/** 첫 칸이 행 머리(th)인 줄: 합계 · 이월. 첫 칸이 비면(null · undefined) fallback 문구 */
function SummaryRow({
  cells,
  columns,
  fallback,
  carry,
}: {
  cells: readonly ReactNode[];
  columns: readonly PaperMoneyColumn[];
  fallback?: string;
  carry?: 'in' | 'out';
}) {
  return (
    <tr data-carry={carry}>
      {cells.map((value, c) => {
        const shown = c === 0 && value == null ? fallback : value;
        return c === 0 ? (
          <th key={c} scope="row" data-align={alignOf(columns[c], shown)}>
            {cellText(shown)}
          </th>
        ) : (
          <td key={c} data-align={alignOf(columns[c], value)}>
            {cellText(value)}
          </td>
        );
      })}
    </tr>
  );
}

/**
 * 금액 표. 숫자 칸은 천 단위 · 오른쪽 정렬, 합계 줄은 굵게 · 위 굵은 선.
 * 여러 쪽으로 나눈 표는 carryIn(앞 쪽 이월, 첫 줄) · carryOut(다음 쪽 이월, 맨 아래)을 받는다
 */
export function PaperMoneyTable({
  title,
  note,
  columns,
  rows,
  total,
  carryIn,
  carryOut,
}: PaperMoneyTableWebProps) {
  const t = useMessages();
  return (
    <Block root="tl-paper-money-table" title={title} note={note}>
      {({ titleId, noteId }) => (
        <table className="tl-paper-table" aria-labelledby={titleId} aria-describedby={noteId}>
          <colgroup>
            {columns.map((col, i) => (
              <col key={i} data-width={col.width ?? 'auto'} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} scope="col">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {carryIn && (
              <SummaryRow
                cells={carryIn}
                columns={columns}
                fallback={t('paper.carryIn')}
                carry="in"
              />
            )}
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((value, c) => (
                  <td key={c} data-align={alignOf(columns[c], value)}>
                    {cellText(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {(carryOut || total) && (
            <tfoot>
              {carryOut && (
                <SummaryRow
                  cells={carryOut}
                  columns={columns}
                  fallback={t('paper.carryOut')}
                  carry="out"
                />
              )}
              {total && <SummaryRow cells={total} columns={columns} />}
            </tfoot>
          )}
        </table>
      )}
    </Block>
  );
}

/* ── 직인 · 서명 ───────────────────────────────────────── */

/** 직인 자리: 이미지가 있으면 "(인)" 위에 찍고, 없으면 "(인)"만 */
export function PaperSeal({ src, name }: PaperSealProps) {
  const t = useMessages();
  return (
    <span className="tl-paper-seal" data-stamped={src ? '' : undefined}>
      <span className="tl-paper-seal__mark" aria-hidden={src ? true : undefined}>
        {t('paper.seal')}
      </span>
      {src && <img className="tl-paper-seal__image" src={src} alt={t('paper.sealAlt', { name })} />}
    </span>
  );
}

/** 아래 서명: 날짜 · 회사 · 대표 · 직인. 쪽 아래쪽으로 붙는다 */
export function PaperSignature({ date, company, role, representative, seal }: PaperSignatureProps) {
  const t = useMessages();
  return (
    <div className="tl-paper-signature">
      {date && <p className="tl-paper-signature__date">{paperDate(t, date)}</p>}
      <p className="tl-paper-signature__line">
        <span>{company}</span>
        <span>
          {role ?? t('paper.ceo')} {representative}
        </span>
        <PaperSeal src={seal ?? null} name={company} />
      </p>
    </div>
  );
}

export type PaperSignPartyWeb = Omit<PaperSignParty, 'rows'> & {
  rows: readonly PaperFieldRowWeb[];
};
export type PaperSignPairWebProps = Omit<PaperSignPairProps, 'left' | 'right'> & {
  left: PaperSignPartyWeb;
  right: PaperSignPartyWeb;
};

/** 두 사람 서명(근로계약서 사업주 · 근로자). 날짜는 위 가운데, 쪽 아래쪽으로 붙는다 */
export function PaperSignPair({ date, left, right }: PaperSignPairWebProps) {
  const t = useMessages();
  return (
    <div className="tl-paper-sign-pair">
      {date && <p className="tl-paper-sign-pair__date">{paperDate(t, date)}</p>}
      {[left, right].map((side, i) => (
        <PaperFields key={i} title={side.title} rows={side.rows} columns={2} />
      ))}
    </div>
  );
}
