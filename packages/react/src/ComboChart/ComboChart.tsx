import {
  ComboChartContract,
  foldSeries,
  MAX_CHART_SERIES,
  type ComboChartProps,
} from '@terracelab/trellis-contracts';
import { useId } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SURFACE, chartColor, slotAt } from '../_internal/chart/colors.js';
import { axisWidth, formatAmount, formatCompactWon, num } from '../_internal/chart/format.js';
import { axisProps, tooltipProps } from '../_internal/chart/Tooltip.js';
import { cx, def, isDev } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

export function ComboChart<T extends object>({
  data,
  x,
  bars: barsProp,
  lines = [],
  stacked = false,
  unit,
  height = 240,
  xFormat,
  yFormat = formatCompactWon,
  lower,
  ariaLabel,
  id,
  testID,
  className,
}: ComboChartProps<T> & { className?: string }) {
  const syncId = useId();
  const t = useMessages();
  if (isDev && !stacked && barsProp.length > 2)
    console.warn(
      '[trellis] ComboChart 나란한 막대는 1~2개가 읽기 쉽습니다. 구성이면 stacked, 아니면 표로 보여 주세요.',
    );
  if (isDev && barsProp.length > MAX_CHART_SERIES)
    console.warn(
      `[trellis] ComboChart 막대 계열이 ${barsProp.length}개입니다. 앞 ${MAX_CHART_SERIES}개 뒤는 "기타"로 접습니다. 범례에도 기타를 두세요.`,
    );
  // 색 슬롯(5)보다 많으면 앞 다섯을 남기고 나머지를 "기타"(compare) 하나로 접는다. 색을 새로 만들지 않는다
  const folded = foldSeries(data, barsProp, { label: t('chart.other') });
  const bars = folded.series;
  const rows = folded.data as unknown as object[];
  const labels = (keys: string[], fmt: (v: number) => string) =>
    rows
      .flatMap((r) => keys.map((k) => (r as Record<string, unknown>)[k]))
      .filter((v): v is number => typeof v === 'number')
      .map(fmt);
  // 쌓은 막대는 줄마다 합계가 축 최댓값이 된다. 합계 글자도 함께 잰다
  const stackTotals = stacked
    ? rows.map((r) =>
        yFormat(
          bars.reduce((sum, s) => {
            const v = (r as Record<string, unknown>)[s.key];
            return sum + (typeof v === 'number' ? v : 0);
          }, 0),
        ),
      )
    : [];
  const yW = axisWidth([
    ...labels(
      [...bars, ...lines].map((s) => s.key),
      yFormat,
    ),
    ...stackTotals,
  ]);
  const lowerFmt = lower?.yFormat ?? num;
  const lowerW = lower
    ? axisWidth(
        labels(
          lower.series.map((s) => s.key),
          lowerFmt,
        ),
      )
    : 0;
  const width = Math.max(yW, lowerW);
  // 막대가 한쪽에만 있어도 두 차트의 x는 같은 칸(band) 눈금을 쓴다. 선만 있는 차트는 Recharts가 점 눈금을 써서
  // 첫 점이 왼쪽 끝에 붙고, 위 막대의 가운데와 어긋난다
  const band = bars.length > 0 || (lower?.series.some((s) => s.type === 'bar') ?? false);
  const xScale = band ? ({ scale: 'band' } as const) : {};
  // 아래 차트 툴팁 값: 축 서식(yFormat)은 눈금용이라 단위 · 반올림이 들어 있다. 툴팁은 값 + 단위 한 번이고
  // 소수는 한 자리까지 둔다(마진율 13.3%)
  const lowerTip = (v: number) => formatAmount(v, Number.isInteger(v) ? {} : { digits: 1 });
  const barRadius: [number, number, number, number] = [4, 4, 0, 0];

  return (
    <div
      className={cx('tl-chart', 'tl-combo-chart', className)}
      role="img"
      aria-label={ariaLabel}
      id={id}
      data-testid={testID}
      data-stacked={stacked || undefined}
    >
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 480, height }}>
        <ComposedChart
          data={rows}
          syncId={syncId}
          accessibilityLayer={false}
          margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
          barCategoryGap="28%"
          barGap={2}
        >
          <CartesianGrid vertical={false} stroke="var(--tl-color-chart-grid)" />
          <XAxis
            dataKey={x}
            {...axisProps}
            {...def({ tickFormatter: xFormat })}
            interval="preserveStartEnd"
            minTickGap={16}
            {...xScale}
            {...(lower ? { hide: true } : {})}
          />
          <YAxis {...axisProps} width={width} tickFormatter={yFormat} tickCount={4} />
          <Tooltip
            {...tooltipProps({
              unit,
              format: num,
              ...(xFormat ? { labelFormat: xFormat } : {}),
              // 쌓은 막대는 맨 아래 줄에 막대 합계(선 값은 더하지 않는다)
              ...(stacked && bars.length > 1
                ? {
                    rows: (payload) => {
                      const items = payload
                        .filter((p) => typeof p.value === 'number')
                        .map((p) => ({
                          name: String(p.name ?? p.dataKey ?? ''),
                          value: `${num(p.value as number)}${unit ?? ''}`,
                          ...(p.color ? { color: p.color } : {}),
                        }));
                      const keys = new Set(bars.map((s) => s.key));
                      const sum = payload
                        .filter((p) => keys.has(String(p.dataKey)) && typeof p.value === 'number')
                        .reduce((s, p) => s + (p.value as number), 0);
                      return [
                        ...items,
                        { name: t('chart.total'), value: `${num(sum)}${unit ?? ''}` },
                      ];
                    },
                  }
                : {}),
            })}
          />
          {bars.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={chartColor(slotAt(i, s.color))}
              {...(stacked ? { stackId: 'bars' } : {})}
              radius={stacked && i < bars.length - 1 ? 0 : barRadius}
              stroke={stacked ? SURFACE : undefined}
              strokeWidth={stacked ? 2 : 0}
              maxBarSize={32}
              isAnimationActive={false}
            />
          ))}
          {lines.map((s, i) => {
            const color = chartColor(
              s.dashed ? (s.color ?? 'compare') : slotAt(bars.length + i, s.color),
            );
            return (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                type="monotone"
                stroke={color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? '4 4' : undefined}
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: SURFACE, strokeWidth: 2 }}
                isAnimationActive={false}
                connectNulls
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
      {lower && (
        <div className="tl-combo-chart__lower">
          <ResponsiveContainer
            width="100%"
            height={lower.height ?? 84}
            initialDimension={{ width: 480, height: lower.height ?? 84 }}
          >
            <ComposedChart
              data={rows}
              syncId={syncId}
              accessibilityLayer={false}
              margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} stroke="var(--tl-color-chart-grid)" />
              <XAxis
                dataKey={x}
                {...axisProps}
                {...def({ tickFormatter: xFormat })}
                interval="preserveStartEnd"
                minTickGap={16}
                {...xScale}
              />
              <YAxis {...axisProps} width={width} tickFormatter={lowerFmt} tickCount={2} />
              <Tooltip
                {...tooltipProps({
                  unit: lower.unit,
                  format: lowerTip,
                  ...(xFormat ? { labelFormat: xFormat } : {}),
                })}
              />
              {lower.series.map((s, i) => {
                const color = chartColor(
                  s.dashed
                    ? (s.color ?? 'compare')
                    : slotAt(bars.length + lines.length + i, s.color),
                );
                return s.type === 'bar' ? (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    fill={color}
                    radius={barRadius}
                    maxBarSize={24}
                    isAnimationActive={false}
                  />
                ) : (
                  <Line
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    type="monotone"
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray={s.dashed ? '4 4' : undefined}
                    dot={false}
                    activeDot={{ r: 3, fill: color, stroke: SURFACE, strokeWidth: 2 }}
                    isAnimationActive={false}
                    connectNulls
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
ComboChart.displayName = ComboChartContract.name;
