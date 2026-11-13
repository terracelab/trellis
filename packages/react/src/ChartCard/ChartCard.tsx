import { ChartCardContract, type ChartCardProps } from '@terracelab/trellis-contracts';
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { Glyph } from '../_internal/chart/Glyph.js';
import { Legend } from '../Legend/Legend.js';
import { useMessages } from '../_internal/locale.js';

export interface ChartCardWebProps extends Omit<
  ChartCardProps,
  'title' | 'subtitle' | 'action' | 'children'
> {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function ChartCard({
  title,
  subtitle,
  legend,
  action,
  height = 240,
  loading = false,
  refreshing = false,
  error,
  empty,
  onRetry,
  table,
  children,
  id,
  testID,
  className,
  style,
}: ChartCardWebProps) {
  const t = useMessages();
  const uid = useId();
  const headingId = `${uid}-title`;
  const [showTable, setShowTable] = useState(false);
  const state = error ? 'error' : loading ? 'loading' : 'default';

  let body: ReactNode;
  if (error) {
    body = (
      <div className="tl-chart-card__state" data-kind="error" role="status">
        <Glyph name="circle-alert" />
        <span>{error}</span>
        {onRetry && (
          <button type="button" className="tl-chart-card__retry" onClick={onRetry}>
            {t('common.retry')}
          </button>
        )}
      </div>
    );
  } else if (loading) {
    body = (
      <div className="tl-chart-card__skeleton" role="status" aria-busy="true">
        <span className="tl-chart-card__sr">{t('common.loading')}</span>
      </div>
    );
  } else if (empty) {
    body = (
      <div className="tl-chart-card__state" data-kind="empty">
        <span>{empty}</span>
      </div>
    );
  } else if (showTable && table) {
    body = (
      <div className="tl-chart-card__table" tabIndex={0}>
        <table>
          <caption className="tl-chart-card__sr">
            {typeof title === 'string' ? title : t('chart.table')}
          </caption>
          <thead>
            <tr>
              {table.columns.map((c, i) => (
                <th scope="col" key={i} data-num={i > 0 || undefined}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) =>
                  c === 0 ? (
                    <th scope="row" key={c}>
                      {cell}
                    </th>
                  ) : (
                    <td key={c} data-num>
                      {typeof cell === 'number' ? cell.toLocaleString('ko-KR') : cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else {
    body = children;
  }

  return (
    <figure
      className={cx('tl-chart-card', className)}
      aria-labelledby={headingId}
      data-state={state}
      data-refreshing={refreshing || undefined}
      id={id}
      data-testid={testID}
      style={style}
    >
      <figcaption className="tl-chart-card__head">
        <div className="tl-chart-card__titles">
          <h3 className="tl-chart-card__title" id={headingId}>
            {title}
          </h3>
          {subtitle && <p className="tl-chart-card__subtitle">{subtitle}</p>}
        </div>
        <div className="tl-chart-card__tools">
          {action}
          {table && (
            <button
              type="button"
              className="tl-chart-card__toggle"
              aria-pressed={showTable}
              onClick={() => setShowTable((v) => !v)}
            >
              {showTable ? t('chart.showChart') : t('chart.showTable')}
            </button>
          )}
        </div>
      </figcaption>
      {legend && legend.length > 0 && <Legend items={legend} />}
      <div
        className="tl-chart-card__body"
        style={{ ['--tl-chart-card-height' as string]: `${height}px` }}
      >
        {body}
      </div>
    </figure>
  );
}
ChartCard.displayName = ChartCardContract.name;
