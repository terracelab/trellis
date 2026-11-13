import { BarListContract, type BarListProps, type Slice } from '@terracelab/trellis-contracts';
import type { KeyboardEvent } from 'react';
import {
  Bar,
  BarChart,
  type BarShapeProps,
  CartesianGrid,
  Cell,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { chartColor } from '../_internal/chart/colors.js';
import { axisWidth, num } from '../_internal/chart/format.js';
import { axisProps, tooltipProps } from '../_internal/chart/Tooltip.js';
import { cx, isDev } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

/** extremes: 최고 · 최저 막대에만 값 글자. 최고는 진하게, 최저는 보조 글자색 */
function ExtremeLabel(props: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: unknown;
  horizontal: boolean;
  high: number;
  low: number;
  format: (v: number) => string;
}) {
  const { value, horizontal, high, low, format } = props;
  if (typeof value !== 'number' || (value !== high && value !== low)) return null;
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const w = Number(props.width ?? 0);
  const h = Number(props.height ?? 0);
  return (
    <text
      className="tl-bar-list__extreme"
      data-extreme={value === high ? 'high' : 'low'}
      x={horizontal ? x + w + 6 : x + w / 2}
      y={horizontal ? y + h / 2 : y - 6}
      textAnchor={horizontal ? 'start' : 'middle'}
      dominantBaseline={horizontal ? 'central' : 'auto'}
    >
      {format(value)}
    </text>
  );
}

export function BarList({
  data,
  unit,
  layout = 'vertical',
  height = 240,
  showValues = false,
  format = num,
  max,
  color = 'series-1',
  extremes = false,
  onBarPress,
  ariaLabel,
  id,
  testID,
  className,
}: BarListProps & { className?: string }) {
  const t = useMessages();
  if (isDev && layout === 'vertical' && data.length > 6)
    console.warn('[trellis] BarList 항목이 6개를 넘으면 layout="horizontal"이 읽기 쉽습니다.');
  const horizontal = layout === 'horizontal';
  const domain: [number, number | 'auto'] = [0, max ?? 'auto'];
  const rows = data.map((d) => ({ ...d }));
  const fill = chartColor(color);
  const labelW = axisWidth(data.map((d) => d.label));
  const valueW = axisWidth(data.map((d) => format(d.value)));
  const values = data.map((d) => d.value);
  const high = Math.max(...values);
  const low = Math.min(...values);
  // extremes가 showValues보다 앞선다(값 글자 자리는 같다)
  const labelled = extremes || showValues;

  // 막대를 누르면: 막대마다 role="button"인 <g>(Tab으로 닿고 Enter · Space로 누른다). 루트는 img → group
  const press = (item: Slice) => onBarPress?.(item);
  const onKey = (item: Slice) => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    press(item);
  };
  const shape = onBarPress
    ? (p: BarShapeProps) => {
        const item = data[p.index];
        if (!item) return null;
        return (
          <g
            role="button"
            tabIndex={0}
            className="tl-bar-list__bar"
            aria-label={`${item.label} ${format(item.value)}${unit ?? ''}`}
            onClick={() => press(item)}
            onKeyDown={onKey(item)}
          >
            <Rectangle
              x={p.x}
              y={p.y}
              width={p.width}
              height={p.height}
              radius={p.radius}
              fill={p.fill}
            />
            {/* 포커스 링: 막대 바깥 2 띄워 2 두께(focus.css의 outline과 같은 자리). 막대 색과 겹치지 않는다 */}
            <rect
              className="tl-bar-list__ring"
              x={p.x - 3}
              y={p.y - 3}
              width={Math.max(0, p.width + 6)}
              height={Math.max(0, p.height + 6)}
              rx={4}
            />
          </g>
        );
      }
    : undefined;

  return (
    <div
      className={cx('tl-chart', 'tl-bar-list', className)}
      role={onBarPress ? 'group' : 'img'}
      aria-label={ariaLabel}
      id={id}
      data-testid={testID}
      data-layout={layout}
    >
      <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 480, height }}>
        <BarChart
          data={rows}
          layout={horizontal ? 'vertical' : 'horizontal'}
          accessibilityLayer={false}
          margin={{
            top: labelled && !horizontal ? 20 : 8,
            right: labelled && horizontal ? valueW : 8,
            bottom: 0,
            left: 0,
          }}
          barCategoryGap={horizontal ? '30%' : '28%'}
        >
          <CartesianGrid
            vertical={horizontal}
            horizontal={!horizontal}
            stroke="var(--tl-color-chart-grid)"
          />
          {horizontal ? (
            <>
              <XAxis type="number" hide domain={domain} />
              <YAxis type="category" dataKey="label" {...axisProps} width={labelW} interval={0} />
            </>
          ) : (
            <>
              <XAxis type="category" dataKey="label" {...axisProps} interval={0} />
              <YAxis
                type="number"
                {...axisProps}
                width={valueW}
                tickFormatter={format}
                tickCount={4}
                domain={domain}
              />
            </>
          )}
          <Tooltip
            {...tooltipProps({ unit, format })}
            cursor={{ fill: 'var(--tl-color-bg-sunken)' }}
          />
          <Bar
            dataKey="value"
            name={unit ? t('common.valueWithUnit', { unit }) : t('common.value')}
            fill={fill}
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            maxBarSize={32}
            isAnimationActive={false}
            {...(shape ? { shape } : {})}
          >
            {rows.map((d, i) => (
              <Cell key={i} fill={d.color ? chartColor(d.color) : fill} />
            ))}
            {extremes ? (
              <LabelList
                dataKey="value"
                content={(p) => (
                  <ExtremeLabel
                    {...(p as object)}
                    horizontal={horizontal}
                    high={high}
                    low={low}
                    format={format}
                  />
                )}
              />
            ) : (
              showValues && (
                <LabelList
                  dataKey="value"
                  position={horizontal ? 'right' : 'top'}
                  formatter={(v: unknown) => (typeof v === 'number' ? format(v) : '')}
                  fill="var(--tl-color-fg-secondary)"
                />
              )
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
BarList.displayName = BarListContract.name;
