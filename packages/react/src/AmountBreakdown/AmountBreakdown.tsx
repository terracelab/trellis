import {
  AmountBreakdownContract,
  formatAmount,
  type AmountBreakdownOp,
  type AmountBreakdownProps,
  type AmountBreakdownRow,
  type MessageKey,
} from '@terracelab/trellis-contracts';
import { useEffect, useId } from 'react';
import { cx, warnDev } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { Spinner } from '../Spinner/Spinner.js';

export type AmountBreakdownWebProps = AmountBreakdownProps & { className?: string };

/** 기호의 숨은 글자(화면에는 기호, 읽기 프로그램에는 낱말) */
const OP_WORD: Record<AmountBreakdownOp, MessageKey> = {
  '+': 'amountBreakdown.plus',
  '−': 'amountBreakdown.minus',
  '=': 'amountBreakdown.equals',
};

/** 합계 줄('=') 앞까지 더하고 뺀 값. 합계 줄 검산에 쓴다 */
export function breakdownTotal(rows: readonly AmountBreakdownRow[]): number {
  let sum = 0;
  for (const row of rows) {
    if (row.op === '=') break;
    sum += row.op === '−' ? -row.value : row.value;
  }
  return sum;
}

export function AmountBreakdown({
  rows,
  title,
  unit,
  activeKey,
  loading = false,
  status = 'idle',
  updatedAt,
  onRecalculate,
  id,
  testID,
  className,
}: AmountBreakdownWebProps) {
  const t = useMessages();
  const titleId = useId();
  const failed = status === 'error';

  // 합계 줄이 앞 줄의 계산과 다르면 개발 모드에서 알린다(화면에 틀린 합계가 나가지 않게)
  useEffect(() => {
    if (loading) return;
    const total = rows.find((r) => r.op === '=');
    if (!total) return;
    const expected = breakdownTotal(rows);
    if (Math.abs(expected - total.value) > 0.5)
      warnDev(
        `AmountBreakdown: 합계 줄 "${total.label}"(${total.value})이 앞 줄 계산(${expected})과 다르다`,
      );
  }, [rows, loading]);

  const statusText =
    status === 'calculating' ? (
      <>
        {/* 글자가 따로 있으니 스피너의 읽기 문구는 숨긴다 */}
        <span className="tl-amount-breakdown__spinner" aria-hidden>
          <Spinner size={16} />
        </span>
        {t('amountBreakdown.calculating')}
      </>
    ) : status === 'updated' && updatedAt ? (
      t('amountBreakdown.updated', { time: updatedAt })
    ) : failed ? (
      <>
        <Icon name="circle-alert" className="tl-amount-breakdown__error-icon" />
        {t('amountBreakdown.error')}
      </>
    ) : null;
  const hasHead = Boolean(title || unit || status !== 'idle');

  return (
    <div
      className={cx('tl-amount-breakdown', className)}
      id={id}
      data-testid={testID}
      data-state={loading ? 'loading' : failed ? 'error' : undefined}
      data-status={status}
      role="group"
      {...(title ? { 'aria-labelledby': titleId } : { 'aria-label': t('amountBreakdown.label') })}
      aria-busy={loading || undefined}
    >
      {hasHead && (
        <div className="tl-amount-breakdown__head">
          {title && (
            <span className="tl-amount-breakdown__title" id={titleId}>
              {title}
            </span>
          )}
          <span className="tl-amount-breakdown__meta">
            {/* 상태 글자가 바뀌면 읽는다. 영역은 늘 두어야 처음 바뀔 때도 읽힌다 */}
            <span className="tl-amount-breakdown__status" aria-live="polite" data-status={status}>
              {statusText}
            </span>
            {failed && onRecalculate && (
              <Button size="sm" variant="ghost" icon="refresh-cw" onPress={onRecalculate}>
                {t('amountBreakdown.recalculate')}
              </Button>
            )}
            {unit && (
              <span className="tl-amount-breakdown__unit">
                {t('amountBreakdown.unit', { unit })}
              </span>
            )}
          </span>
        </div>
      )}
      <dl className="tl-amount-breakdown__rows">
        {rows.map((row) => (
          <div
            key={row.key}
            className="tl-amount-breakdown__row"
            data-op={row.op}
            data-total={row.op === '=' || undefined}
            data-active={row.key === activeKey || undefined}
          >
            <dt className="tl-amount-breakdown__label">
              <span className="tl-amount-breakdown__op" aria-hidden>
                {row.op ?? ''}
              </span>
              {row.op && <span className="tl-sr-only">{t(OP_WORD[row.op])} </span>}
              <span className="tl-amount-breakdown__name">
                {row.label}
                {row.hint && (
                  <>
                    {' '}
                    <span className="tl-amount-breakdown__hint">{row.hint}</span>
                  </>
                )}
              </span>
            </dt>
            <dd className="tl-amount-breakdown__amount">
              {loading ? (
                <Skeleton
                  width="calc(var(--tl-space-64) + var(--tl-space-16))"
                  height={
                    row.op === '='
                      ? 'var(--tl-type-amount-lg-line-height)'
                      : 'var(--tl-density-body-line-height)'
                  }
                />
              ) : (
                formatAmount(row.value)
              )}
            </dd>
          </div>
        ))}
      </dl>
      {loading && <span className="tl-sr-only">{t('common.loading')}</span>}
    </div>
  );
}
AmountBreakdown.displayName = AmountBreakdownContract.name;
