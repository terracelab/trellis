import {
  WaterfallChartContract,
  type WaterfallChartProps,
  type WaterfallStep,
} from '@terracelab/trellis-contracts';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type XAxisTickContentProps,
} from 'recharts';
import { AXIS, chartColor } from '../_internal/chart/colors.js';
import { axisWidth, formatCompactWon, num, signed, ticksOf } from '../_internal/chart/format.js';
import { axisProps, tooltipProps } from '../_internal/chart/Tooltip.js';
import { cx, isDev } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

export interface WaterfallRow {
  label: string;
  caption?: string;
  kind: WaterfallStep['kind'];
  /** 보이지 않는 받침 */
  base: number;
  /** 보이는 막대 길이 */
  size: number;
  value: number;
  /** 이 단계까지의 누계 */
  cumulative: number;
  direction: 'up' | 'down' | 'flat';
}

/** 누계를 계산해 막대(받침 + 길이)로 바꾼다. total 단계는 누계를 그린다 */
export function buildWaterfall(steps: readonly WaterfallStep[]): WaterfallRow[] {
  let cum = 0;
  return steps.map((s) => {
    if (s.kind === 'start') {
      cum = s.value;
      return { ...s, base: 0, size: s.value, cumulative: cum, direction: 'flat' as const };
    }
    if (s.kind === 'total') {
      if (isDev && Math.round(s.value) !== Math.round(cum))
        console.warn(`[trellis] WaterfallChart total(${s.value})이 누계(${cum})와 다릅니다.`);
      return { ...s, base: 0, size: cum, cumulative: cum, direction: 'flat' as const };
    }
    const prev = cum;
    cum += s.value;
    return {
      ...s,
      base: Math.min(prev, cum),
      size: Math.abs(s.value),
      cumulative: cum,
      direction:
        s.value > 0 ? ('up' as const) : s.value < 0 ? ('down' as const) : ('flat' as const),
    };
  });
}

function Tick({
  x = 0,
  y = 0,
  payload,
  rows,
}: {
  x?: number;
  y?: number;
  payload?: { value?: unknown };
  rows: WaterfallRow[];
}) {
  const value = payload?.value === undefined ? '' : String(payload.value);
  const row = rows.find((r) => r.label === value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={12} textAnchor="middle" fill={AXIS}>
        {value}
      </text>
      {row?.caption && (
        <text dy={26} textAnchor="middle" fill="var(--tl-color-fg-tertiary)">
          {row.caption}
        </text>
      )}
    </g>
  );
}

export function WaterfallChart({
  steps,
  unit,
  height = 220,
  format = num,
  polarity = 'updown',
  reference,
  ariaLabel,
  id,
  testID,
  className,
}: WaterfallChartProps & { className?: string }) {
  const t = useMessages();
  const rows = buildWaterfall(steps);
  const hasCaption = rows.some((r) => r.caption);
  const fillOf = (r: WaterfallRow) => {
    if (r.kind !== 'delta') return chartColor('series-1');
    if (polarity === 'neutral') return 'var(--tl-color-chart-heat-3)';
    return chartColor(r.direction === 'down' ? 'expense' : 'income');
  };
  // 눈금을 직접 정하고 그 글자로 축 폭을 잰다. 막대 끝값(1.1억)보다 눈금(7,500만)이 길 수 있다
  const lo = Math.min(0, ...rows.map((r) => r.base));
  const hi = Math.max(0, ...rows.map((r) => r.base + r.size));
  const yTicks = ticksOf(lo, hi);
  const yTop = Math.max(hi, yTicks[yTicks.length - 1] ?? hi);
  return (
    <div
      className={cx('tl-chart', 'tl-waterfall-chart', className)}
      role="img"
      aria-label={ariaLabel}
      id={id}
      data-testid={testID}
      data-polarity={polarity}
    >
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 480, height }}>
        <BarChart
          data={rows}
          accessibilityLayer={false}
          margin={{ top: 12, right: reference ? 56 : 12, bottom: hasCaption ? 16 : 0, left: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid vertical={false} stroke="var(--tl-color-chart-grid)" />
          <XAxis
            dataKey="label"
            {...axisProps}
            interval={0}
            tick={(p: XAxisTickContentProps) => (
              <Tick
                x={Number(p.x)}
                y={Number(p.y)}
                payload={p.payload as { value?: unknown }}
                rows={rows}
              />
            )}
            height={hasCaption ? 40 : 24}
          />
          <YAxis
            {...axisProps}
            width={axisWidth(yTicks.map(formatCompactWon))}
            tickFormatter={formatCompactWon}
            ticks={yTicks}
            domain={[yTicks[0] ?? lo, yTop]}
          />
          <Tooltip
            {...tooltipProps({
              rows: (_p, label) => {
                const r = rows.find((row) => row.label === label);
                if (!r) return [];
                return [
                  {
                    name: r.kind === 'delta' ? t('chart.delta') : t('common.value'),
                    value: `${r.kind === 'delta' ? signed(r.value) : format(r.value)}${unit ?? ''}`,
                  },
                  { name: t('chart.cumulative'), value: `${format(r.cumulative)}${unit ?? ''}` },
                ];
              },
            })}
            cursor={{ fill: 'var(--tl-color-bg-sunken)' }}
          />
          {reference && (
            <ReferenceLine
              y={reference.value}
              stroke={AXIS}
              strokeDasharray="3 3"
              label={{ value: reference.label, position: 'right', fill: AXIS }}
            />
          )}
          <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
          <Bar
            dataKey="size"
            stackId="w"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            isAnimationActive={false}
          >
            {rows.map((r, i) => (
              <Cell key={i} fill={fillOf(r)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
WaterfallChart.displayName = WaterfallChartContract.name;
