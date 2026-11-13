// Recharts 툴팁 내용. 색은 계열 스와치, 값은 tabular. 툴팁 wrapper 스타일은 charts.css.
import type { ReactNode } from 'react';
import type { TooltipContentProps } from 'recharts';
import { CURSOR } from './colors.js';
import { num } from './format.js';

type Row = { name?: unknown; value?: unknown; color?: string; dataKey?: unknown };

export interface ChartTooltipOptions {
  unit?: string;
  format?: (v: number) => string;
  labelFormat?: (label: string | number) => ReactNode;
  /** 행을 직접 만들 때(워터폴 누계 등) */
  rows?: (
    payload: Row[],
    label: unknown,
  ) => { name: ReactNode; value: ReactNode; color?: string }[];
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  unit,
  format = num,
  labelFormat,
  rows,
}: Partial<TooltipContentProps> & ChartTooltipOptions) {
  if (!active || !payload || payload.length === 0) return null;
  const items = rows
    ? rows(payload as unknown as Row[], label)
    : (payload as unknown as Row[])
        .filter((p) => typeof p.value === 'number')
        .map((p) => ({
          name: String(p.name ?? p.dataKey ?? ''),
          value: `${format(p.value as number)}${unit ?? ''}`,
          color: p.color,
        }));
  const title =
    label === undefined || label === null
      ? null
      : labelFormat
        ? labelFormat(label as string | number)
        : String(label);
  return (
    <div className="tl-chart-tooltip" role="presentation">
      {title !== null && <div className="tl-chart-tooltip__label">{title}</div>}
      <dl className="tl-chart-tooltip__rows">
        {items.map((it, i) => (
          <div className="tl-chart-tooltip__row" key={i}>
            <dt>
              {it.color && (
                <span className="tl-chart-tooltip__swatch" style={{ background: it.color }} />
              )}
              {it.name}
            </dt>
            <dd>{it.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** <Tooltip {...tooltipProps(opts)} /> */
export function tooltipProps(opts: ChartTooltipOptions = {}) {
  return {
    cursor: { stroke: CURSOR, strokeWidth: 1, strokeDasharray: '3 3' },
    isAnimationActive: false as const,
    wrapperStyle: { outline: 'none', zIndex: 1 },
    content: (p: TooltipContentProps) => <ChartTooltipContent {...p} {...opts} />,
  };
}

/** 축 공통 props: 선·눈금선 없음, 글자는 chart.axis(글자 크기는 charts.css) */
export const axisProps = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  tick: { fill: 'var(--tl-color-chart-axis)' },
} as const;
