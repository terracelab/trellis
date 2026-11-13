import { SparklineContract, type SparklineProps } from '@terracelab/trellis-contracts';
import { useId } from 'react';
import { chartColor } from '../_internal/chart/colors.js';
import { cx } from '../_internal/cx.js';

/** Catmull-Rom → 베지어 */
export function smoothPath(points: readonly (readonly [number, number])[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0]![0]},${points[0]![1]}`;
  let d = `M${points[0]![0]},${points[0]![1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(i - 1, 0)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(i + 2, points.length - 1)]!;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((n) => n.toFixed(1)).join(',')} ${c2.map((n) => n.toFixed(1)).join(',')} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function Sparkline({
  data,
  width = 112,
  height = 32,
  area = true,
  color = 'series-1',
  ariaLabel,
  id,
  testID,
  className,
}: SparklineProps & { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const pad = 3;
  const n = Math.max(data.length, 2);
  const values = data.length >= 2 ? data : [data[0] ?? 0, data[0] ?? 0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map(
    (v, i) =>
      [
        Math.round((pad + ((width - pad * 2) * i) / (n - 1)) * 10) / 10,
        Math.round((pad + (height - pad * 2) * (1 - (v - min) / span)) * 10) / 10,
      ] as const,
  );
  const line = smoothPath(pts);
  const last = pts[pts.length - 1]!;
  const stroke = chartColor(color);
  return (
    <svg
      className={cx('tl-sparkline', className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      id={id}
      data-testid={testID}
    >
      {area && (
        <>
          <defs>
            <linearGradient id={`${uid}-a`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path
            d={`${line} L${last[0]},${height - pad} L${pts[0]![0]},${height - pad} Z`}
            fill={`url(#${uid}-a)`}
          />
        </>
      )}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={stroke} />
    </svg>
  );
}
Sparkline.displayName = SparklineContract.name;
