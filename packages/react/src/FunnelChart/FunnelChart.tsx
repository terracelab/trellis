import {
  FunnelChartContract,
  funnelSteps,
  type FunnelChartProps,
} from '@terracelab/trellis-contracts';
import { chartColor } from '../_internal/chart/colors.js';
import { formatPercent, num } from '../_internal/chart/format.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

const rateText = (v: number | null) => (v === null ? '–' : formatPercent(v));

export function FunnelChart({
  data,
  unit,
  format = num,
  color = 'series-1',
  conversion = 'previous',
  summary = true,
  ariaLabel,
  id,
  testID,
  className,
}: FunnelChartProps & { className?: string }) {
  const t = useMessages();
  const steps = funnelSteps(data);
  // 막대 길이는 가장 큰 값 대비(중간 단계가 다시 늘어도 넘치지 않는다)
  const max = Math.max(0, ...steps.map((s) => s.value)) || 1;
  const fill = chartColor(color);
  const showPrev = conversion !== 'overall';
  const showOverall = conversion !== 'previous';
  const first = steps[0];
  const last = steps[steps.length - 1];
  const total = steps.length > 1 && last && first ? last.overall : null;
  return (
    <div
      className={cx('tl-funnel-chart', className)}
      role="img"
      aria-label={ariaLabel}
      id={id}
      data-testid={testID}
      data-conversion={conversion}
    >
      {steps.length === 0 ? (
        <span className="tl-funnel-chart__empty">{t('common.noData')}</span>
      ) : (
        <div className="tl-funnel-chart__rows">
          <div className="tl-funnel-chart__head" aria-hidden="true">
            <span />
            <span />
            <span />
            {showPrev && <span className="tl-funnel-chart__rate">{t('funnel.previous')}</span>}
            {showOverall && <span className="tl-funnel-chart__rate">{t('funnel.overall')}</span>}
          </div>
          {steps.map((s, i) => {
            const pct = Math.max(0, (s.value / max) * 100);
            const title = [
              `${s.label} ${format(s.value)}${unit ?? ''}`,
              showPrev && i > 0 ? `${t('funnel.previous')} ${rateText(s.rate)}` : '',
              showOverall ? `${t('funnel.overall')} ${rateText(s.overall)}` : '',
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <div
                className="tl-funnel-chart__row"
                key={`${s.label}-${i}`}
                data-index={i}
                title={title}
              >
                <span className="tl-funnel-chart__label">{s.label}</span>
                <span className="tl-funnel-chart__track">
                  {s.value > 0 && (
                    <span
                      className="tl-funnel-chart__bar"
                      style={{ width: `${pct}%`, background: fill }}
                    />
                  )}
                </span>
                <span className="tl-funnel-chart__value">{format(s.value)}</span>
                {showPrev && (
                  <span className="tl-funnel-chart__rate">{i === 0 ? '' : rateText(s.rate)}</span>
                )}
                {showOverall && (
                  <span className="tl-funnel-chart__rate">{rateText(s.overall)}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
      {summary && total !== null && first && last && (
        <p className="tl-funnel-chart__summary">
          {t('funnel.summary', { first: first.label, last: last.label, rate: rateText(total) })}
        </p>
      )}
    </div>
  );
}
FunnelChart.displayName = FunnelChartContract.name;
