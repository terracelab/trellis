import { RadialMeterContract, type RadialMeterProps } from '@terracelab/trellis-contracts';
import { chartColor } from '../_internal/chart/colors.js';
import { formatAmount } from '../_internal/chart/format.js';
import { cx } from '../_internal/cx.js';

const DIAMETER = { sm: 80, md: 120, lg: 160 } as const;
const TONE = {
  accent: 'series-1',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
} as const;

export function RadialMeter({
  value,
  max = 100,
  label,
  caption,
  unit = '%',
  size = 'md',
  tone = 'accent',
  digits = 0,
  id,
  testID,
  className,
}: RadialMeterProps & { className?: string }) {
  const d = DIAMETER[size];
  const stroke = Math.round(d * 0.09);
  const r = (d - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const text = formatAmount(value, { digits });
  return (
    <div
      className={cx('tl-radial-meter', className)}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      aria-valuetext={`${text}${unit}`}
      id={id}
      data-testid={testID}
      data-size={size}
      data-tone={tone}
    >
      <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} aria-hidden="true" focusable="false">
        <circle
          cx={d / 2}
          cy={d / 2}
          r={r}
          fill="none"
          stroke="var(--tl-color-chart-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={d / 2}
          cy={d / 2}
          r={r}
          fill="none"
          stroke={chartColor(TONE[tone])}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(c * ratio).toFixed(2)} ${c.toFixed(2)}`}
          transform={`rotate(-90 ${d / 2} ${d / 2})`}
        />
      </svg>
      <div className="tl-radial-meter__text" aria-hidden="true">
        <strong className="tl-radial-meter__value">
          {text}
          <span className="tl-radial-meter__unit">{unit}</span>
        </strong>
      </div>
      <div className="tl-radial-meter__label">{label}</div>
      {caption && <div className="tl-radial-meter__caption">{caption}</div>}
    </div>
  );
}
RadialMeter.displayName = RadialMeterContract.name;
