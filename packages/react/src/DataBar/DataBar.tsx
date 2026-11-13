import { DataBarContract, type DataBarProps } from '@terracelab/trellis-contracts';
import { chartColor } from '../_internal/chart/colors.js';
import { Glyph } from '../_internal/chart/Glyph.js';
import { num } from '../_internal/chart/format.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

const BAR_H = 8;

export function DataBar({
  value,
  max,
  width = 64,
  marker,
  warnBelow,
  format = num,
  unit,
  color = 'series-1',
  label,
  id,
  testID,
  className,
}: DataBarProps & { className?: string }) {
  const t = useMessages();
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const warn = warnBelow !== undefined && value < warnBelow;
  const fill = warn ? chartColor('danger') : chartColor(color);
  const text = `${format(value)}${unit ?? ''}`;
  return (
    <span
      className={cx('tl-data-bar', className)}
      role="img"
      aria-label={`${label ? `${label} ` : ''}${text}, ${t('chart.max', { value: `${format(max)}${unit ?? ''}` })}${warn ? `, ${t('chart.short')}` : ''}`}
      id={id}
      data-testid={testID}
      data-state={warn ? 'error' : 'default'}
    >
      <svg
        width={width}
        height={BAR_H}
        viewBox={`0 0 ${width} ${BAR_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={BAR_H}
          rx={BAR_H / 2}
          fill="var(--tl-color-chart-track)"
        />
        {ratio > 0 && (
          <rect
            x={0}
            y={0}
            width={Math.max(BAR_H, width * ratio)}
            height={BAR_H}
            rx={BAR_H / 2}
            fill={fill}
          />
        )}
        {marker !== undefined && max > 0 && (
          <rect
            x={Math.min(width - 1, (marker / max) * width) - 0.5}
            y={-1}
            width={1.5}
            height={BAR_H + 2}
            fill="var(--tl-color-fg-primary)"
          />
        )}
      </svg>
      <span className="tl-data-bar__value">{text}</span>
      {warn && <Glyph name="triangle-alert" className="tl-data-bar__warn" />}
    </span>
  );
}
DataBar.displayName = DataBarContract.name;
