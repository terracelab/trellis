import { SegmentedBarContract, type SegmentedBarProps } from '@terracelab/trellis-contracts';
import { chartColor, slotAt } from '../_internal/chart/colors.js';
import { num, pct } from '../_internal/chart/format.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

export function SegmentedBar({
  data,
  unit,
  size = 'tall',
  legend = true,
  format = num,
  ariaLabel,
  id,
  testID,
  className,
}: SegmentedBarProps & { className?: string }) {
  const t = useMessages();
  const total = data.reduce((s, d) => s + d.value, 0);
  const parts = data.map((d, i) => ({
    ...d,
    fill: chartColor(slotAt(i, d.color)),
    ratio: total > 0 ? d.value / total : 0,
  }));
  return (
    <div
      className={cx('tl-segmented-bar', className)}
      role="img"
      aria-label={ariaLabel}
      id={id}
      data-testid={testID}
      data-size={size}
    >
      <div className="tl-segmented-bar__track">
        {total === 0 ? (
          <span className="tl-segmented-bar__empty">{t('common.noData')}</span>
        ) : (
          parts
            .filter((p) => p.value > 0)
            .map((p, i) => (
              <span
                key={`${p.label}-${i}`}
                className="tl-segmented-bar__segment"
                style={{ flexGrow: p.value, background: p.fill }}
                title={`${p.label} ${format(p.value)}${unit ?? ''} · ${pct(p.value, total)}`}
              />
            ))
        )}
      </div>
      {legend && (
        <ul className="tl-segmented-bar__legend" role="list">
          {parts.map((p, i) => (
            <li key={`${p.label}-${i}`} className="tl-segmented-bar__item">
              <span
                className="tl-segmented-bar__swatch"
                style={{ background: p.fill }}
                aria-hidden="true"
              />
              <span className="tl-segmented-bar__name">{p.label}</span>
              <span className="tl-segmented-bar__num">
                {format(p.value)}
                {unit ?? ''}
              </span>
              <span className="tl-segmented-bar__pct">{pct(p.value, total)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
SegmentedBar.displayName = SegmentedBarContract.name;
