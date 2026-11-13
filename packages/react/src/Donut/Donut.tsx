import { DonutContract, type DonutProps } from '@terracelab/trellis-contracts';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { SURFACE, chartColor, slotAt } from '../_internal/chart/colors.js';
import { num, pct } from '../_internal/chart/format.js';
import { tooltipProps } from '../_internal/chart/Tooltip.js';
import { cx, isDev } from '../_internal/cx.js';

export function Donut({
  data,
  unit,
  height = 200,
  centerLabel,
  centerValue,
  legend = true,
  format = num,
  ariaLabel,
  id,
  testID,
  className,
}: DonutProps & { className?: string }) {
  if (isDev && data.length > 6) console.warn('[trellis] Donut 조각은 5개 + 기타까지입니다.');
  const total = data.reduce((s, d) => s + d.value, 0);
  const slices = data.map((d, i) => ({ ...d, fill: chartColor(slotAt(i, d.color)) }));
  const drawn = slices.filter((d) => d.value > 0);
  return (
    <div
      className={cx('tl-chart', 'tl-donut', className)}
      role="img"
      aria-label={ariaLabel}
      id={id}
      data-testid={testID}
      data-legend={legend || undefined}
      style={{ ['--tl-donut-size' as string]: `${height}px` }}
    >
      <div className="tl-donut__ring">
        <ResponsiveContainer
          width="100%"
          height={height}
          initialDimension={{ width: height, height }}
        >
          <PieChart accessibilityLayer={false} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Tooltip {...tooltipProps({ unit, format })} cursor={false} />
            <Pie
              data={drawn}
              dataKey="value"
              nameKey="label"
              innerRadius="66%"
              outerRadius="94%"
              paddingAngle={drawn.length > 1 ? 2 : 0}
              cornerRadius={2}
              startAngle={90}
              endAngle={-270}
              stroke={SURFACE}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {drawn.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {(centerLabel || centerValue) && (
          <div className="tl-donut__center" aria-hidden="true">
            {centerValue && <strong className="tl-donut__value">{centerValue}</strong>}
            {centerLabel && <span className="tl-donut__label">{centerLabel}</span>}
          </div>
        )}
      </div>
      {legend && (
        <ul className="tl-donut__legend" role="list">
          {slices.map((d, i) => (
            <li key={`${d.label}-${i}`} className="tl-donut__item">
              <span
                className="tl-donut__swatch"
                style={{ background: d.fill }}
                aria-hidden="true"
              />
              <span className="tl-donut__name">{d.label}</span>
              <span className="tl-donut__num">
                {format(d.value)}
                {unit ?? ''}
              </span>
              <span className="tl-donut__pct">{pct(d.value, total)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
Donut.displayName = DonutContract.name;
