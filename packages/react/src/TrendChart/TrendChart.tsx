import { TrendChartContract, type TrendChartProps } from '@terracelab/trellis-contracts';
import { useId } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS, CURSOR, SURFACE, TRACK, chartColor, slotAt } from '../_internal/chart/colors.js';
import { axisWidth, formatCompactWon, num } from '../_internal/chart/format.js';
import { axisProps, tooltipProps } from '../_internal/chart/Tooltip.js';
import { cx, def } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

const CURVE = { smooth: 'monotone', linear: 'linear', step: 'stepAfter' } as const;
/** 예측으로 나눈 계열의 data 필드: 실적 · 예측 · 신뢰 구간([아래, 위]) */
const ACTUAL = '__actual';
const FORECAST = '__forecast';
const BAND = '__band';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function EndLabel(props: {
  x?: number;
  y?: number;
  value?: number;
  index?: number;
  total: number;
  format: (v: number) => string;
}) {
  const { x = 0, y = 0, value, index, total, format } = props;
  if (index !== total - 1 || typeof value !== 'number') return null;
  return (
    <text className="tl-chart__end-label" x={x + 8} y={y + 4} textAnchor="start">
      {format(value)}
    </text>
  );
}

export function TrendChart<T extends object>({
  data,
  x,
  series,
  unit,
  height = 240,
  xFormat,
  yFormat = formatCompactWon,
  curve = 'smooth',
  showDots = false,
  endLabel,
  yDomain = ['auto', 'auto'],
  band,
  forecast,
  ariaLabel,
  id,
  testID,
  className,
}: TrendChartProps<T> & { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const t = useMessages();
  // 예측: 한 계열을 from번째 행에서 실적(실선) · 예측(점선)으로 나누고, lower~upper를 신뢰 구간으로
  const fKey = forecast ? (forecast.key ?? series[0]?.key) : undefined;
  const fFrom =
    forecast && data.length
      ? Math.max(0, Math.min(Math.floor(forecast.from), data.length - 1))
      : -1;
  const fSeries = fKey !== undefined && fFrom >= 0 ? series.find((s) => s.key === fKey) : undefined;
  const hasBand = Boolean(fSeries && forecast?.lower && forecast?.upper);
  const rows: object[] = fSeries
    ? data.map((row, i) => {
        const r = row as Record<string, unknown>;
        const v = r[fSeries.key];
        const lo = forecast?.lower ? r[forecast.lower] : undefined;
        const hi = forecast?.upper ? r[forecast.upper] : undefined;
        return {
          ...r,
          [ACTUAL]: i <= fFrom && isNum(v) ? v : null,
          [FORECAST]: i >= fFrom && isNum(v) ? v : null,
          [BAND]: hasBand && i >= fFrom && isNum(lo) && isNum(hi) ? [lo, hi] : null,
        };
      })
    : (data as unknown as object[]);
  const values = data.flatMap((row) =>
    [...series.map((s) => s.key), ...(hasBand ? [forecast!.lower!, forecast!.upper!] : [])]
      .map((k) => (row as Record<string, unknown>)[k])
      .filter((v): v is number => typeof v === 'number'),
  );
  const fIndex = fSeries ? series.indexOf(fSeries) : -1;
  const fColor = fSeries
    ? chartColor(fSeries.dashed ? (fSeries.color ?? 'compare') : slotAt(fIndex, fSeries.color))
    : '';
  const fName = forecast?.label ?? t('chart.forecast');
  const bandName = forecast?.bandLabel ?? t('chart.forecastBand');
  const fX = fSeries ? (rows[fFrom] as Record<string, unknown>)[x] : undefined;
  const yLabels = values.length
    ? [yFormat(Math.max(...values)), yFormat(Math.min(...values))]
    : ['0'];
  return (
    <div
      className={cx('tl-chart', 'tl-trend-chart', className)}
      role="img"
      aria-label={ariaLabel}
      id={id}
      data-testid={testID}
      data-curve={curve}
      data-forecast={fSeries ? true : undefined}
    >
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 480, height }}>
        <ComposedChart
          data={rows}
          accessibilityLayer={false}
          margin={{ top: 12, right: endLabel ? 64 : 12, bottom: 0, left: 0 }}
        >
          <defs>
            {series
              .filter((s) => s.type === 'area')
              .map((s, i) => (
                <linearGradient id={`${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1" key={s.key}>
                  <stop
                    offset="0%"
                    stopColor={chartColor(slotAt(series.indexOf(s), s.color))}
                    stopOpacity={0.18}
                  />
                  <stop offset="100%" stopColor={chartColor(slotAt(i, s.color))} stopOpacity={0} />
                </linearGradient>
              ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--tl-color-chart-grid)" />
          <XAxis
            dataKey={x}
            {...axisProps}
            {...def({ tickFormatter: xFormat })}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            {...axisProps}
            width={axisWidth(yLabels)}
            tickFormatter={yFormat}
            domain={yDomain as [number | 'auto', number | 'auto']}
            tickCount={4}
          />
          {band && (
            <ReferenceArea
              y1={band.from}
              y2={band.to}
              fill={TRACK}
              fillOpacity={0.7}
              ifOverflow="extendDomain"
              {...def({
                label: band.label ? { value: band.label, position: 'insideTopLeft' } : undefined,
              })}
            />
          )}
          {fSeries && fX !== undefined && (
            <ReferenceLine
              x={fX as string | number}
              stroke={CURSOR}
              strokeDasharray="3 3"
              label={{ value: fName, position: 'insideTopRight', fill: AXIS }}
            />
          )}
          <Tooltip
            {...tooltipProps({
              unit,
              format: num,
              ...(xFormat ? { labelFormat: xFormat } : {}),
              // 예측: 만나는 점에서는 실적만, 신뢰 구간은 "아래~위" 한 줄
              ...(fSeries
                ? {
                    rows: (payload) => {
                      const actual = payload.find((p) => p.dataKey === ACTUAL);
                      return payload
                        .filter((p) => {
                          if (p.dataKey === BAND) return Array.isArray(p.value);
                          if (p.dataKey === FORECAST && isNum(actual?.value)) return false;
                          return isNum(p.value);
                        })
                        .map((p) => {
                          const v = p.value;
                          const text = Array.isArray(v)
                            ? `${num(v[0] as number)}~${num(v[1] as number)}${unit ?? ''}`
                            : `${num(v as number)}${unit ?? ''}`;
                          return {
                            name: String(p.name ?? p.dataKey ?? ''),
                            value: text,
                            ...(p.color ? { color: p.color } : {}),
                          };
                        });
                    },
                  }
                : {}),
            })}
          />
          {hasBand && (
            <Area
              dataKey={BAND}
              name={bandName}
              type={CURVE[curve]}
              stroke="none"
              fill={fColor}
              fillOpacity={0.14}
              activeDot={false}
              isAnimationActive={false}
              connectNulls
            />
          )}
          {series.map((s, i) => {
            const color = chartColor(s.dashed ? (s.color ?? 'compare') : slotAt(i, s.color));
            const common = {
              dataKey: s === fSeries ? ACTUAL : s.key,
              name: s.label,
              type: CURVE[curve],
              stroke: color,
              strokeWidth: 2,
              strokeDasharray: s.dashed ? '4 4' : undefined,
              dot: showDots ? { r: 3, fill: color, stroke: SURFACE, strokeWidth: 2 } : false,
              activeDot: { r: 4, fill: color, stroke: SURFACE, strokeWidth: 2 },
              isAnimationActive: false,
              connectNulls: true,
            } as const;
            // 예측으로 나눈 계열은 끝점 글자를 예측 선 끝에 붙인다
            const labelKey = s === fSeries ? FORECAST : s.key;
            const label =
              endLabel === s.key ? (
                <LabelList
                  dataKey={labelKey}
                  content={(p) => (
                    <EndLabel {...(p as object)} total={data.length} format={yFormat} />
                  )}
                />
              ) : null;
            const main =
              s.type === 'area' ? (
                <Area key={s.key} {...common} fill={`url(#${uid}-${s.key})`}>
                  {s === fSeries ? null : label}
                </Area>
              ) : (
                <Line key={s.key} {...common}>
                  {s === fSeries ? null : label}
                </Line>
              );
            if (s !== fSeries) return main;
            return [
              main,
              <Line
                key={`${s.key}-forecast`}
                dataKey={FORECAST}
                name={fName}
                type={CURVE[curve]}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: SURFACE, strokeWidth: 2 }}
                isAnimationActive={false}
                connectNulls
              >
                {label}
              </Line>,
            ];
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
TrendChart.displayName = TrendChartContract.name;
