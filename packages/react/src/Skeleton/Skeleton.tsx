import { SkeletonContract, type SkeletonProps } from '@terracelab/trellis-contracts';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../_internal/cx.js';

/** 반짝이는 낱개 블록. 묶음 모양이 안에서 쓴다 */
function Bone({ w, h, round }: { w?: string; h?: string; round?: 'circle' | 'square' }) {
  return (
    <span
      className="tl-skeleton__bone"
      data-round={round}
      style={{ ...(w ? { width: w } : {}), ...(h ? { height: h } : {}) }}
    />
  );
}

// 열마다 다른 폭(실제 표처럼 이름 열이 넓고 숫자 열이 좁다)
const COL_WIDTHS = ['70%', '55%', '40%', '62%', '35%', '50%', '45%', '58%'];

function Group({ shape, lines, columns }: { shape: string; lines: number; columns: number }) {
  if (shape === 'list')
    return (
      <>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="tl-skeleton__row">
            <Bone round="square" w="var(--tl-size-avatar-32)" h="var(--tl-size-avatar-32)" />
            <span className="tl-skeleton__stack">
              <Bone w={i % 2 ? '48%' : '62%'} />
              <Bone w={i % 2 ? '30%' : '38%'} h="var(--tl-space-8)" />
            </span>
          </span>
        ))}
      </>
    );
  if (shape === 'table') {
    const cols = Array.from({ length: columns }, (_, c) => COL_WIDTHS[c % COL_WIDTHS.length]!);
    const grid: CSSProperties = { gridTemplateColumns: `2fr repeat(${columns - 1}, 1fr)` };
    return (
      <>
        <span className="tl-skeleton__table-head" style={grid}>
          {cols.map((_, c) => (
            <Bone key={c} w={c === 0 ? '30%' : '50%'} h="var(--tl-space-8)" />
          ))}
        </span>
        {Array.from({ length: lines }, (_, r) => (
          <span key={r} className="tl-skeleton__table-row" style={grid}>
            {cols.map((w, c) => (
              <Bone key={c} w={r % 2 && c ? `calc(${w} - 10%)` : w} />
            ))}
          </span>
        ))}
      </>
    );
  }
  if (shape === 'kpi')
    return (
      <span className="tl-skeleton__stack" data-gap="loose">
        <Bone w="40%" />
        <Bone w="60%" h="var(--tl-space-24)" />
        <Bone w="48%" h="var(--tl-space-8)" />
      </span>
    );
  // card: 제목 + 글줄
  return (
    <span className="tl-skeleton__stack" data-gap="loose">
      <Bone w="32%" h="var(--tl-space-16)" />
      <span className="tl-skeleton__stack">
        {Array.from({ length: lines }, (_, i) => (
          <Bone key={i} w={i === lines - 1 && lines > 1 ? '60%' : '100%'} />
        ))}
      </span>
    </span>
  );
}

export function Skeleton({
  shape = 'text',
  width,
  height,
  lines,
  columns = 5,
  immediate = false,
  id,
  testID,
  className,
}: SkeletonProps & { className?: string }) {
  const grouped = shape === 'list' || shape === 'table' || shape === 'kpi' || shape === 'card';
  const count = Math.max(
    1,
    Math.floor(lines ?? (shape === 'list' || shape === 'table' ? 5 : shape === 'card' ? 3 : 1)),
  );
  // text: 높이는 줄마다, circle: 한 변만 주면 정원
  const blockHeight =
    shape === 'circle' ? (height ?? width) : shape === 'rect' ? height : undefined;
  const blockWidth = shape === 'circle' ? (width ?? height) : width;
  const style: CSSProperties = {
    ...(blockWidth ? { width: blockWidth } : {}),
    ...(blockHeight ? { height: blockHeight } : {}),
  };
  let body: ReactNode = null;
  if (shape === 'text')
    body = Array.from({ length: count }, (_, i) => (
      <span
        key={i}
        className="tl-skeleton__line"
        data-last={count > 1 && i === count - 1 ? '' : undefined}
        style={height ? { height } : undefined}
      />
    ));
  else if (grouped)
    body = <Group shape={shape} lines={count} columns={Math.max(2, Math.floor(columns))} />;
  return (
    <span
      className={cx('tl-skeleton', className)}
      id={id}
      data-testid={testID}
      data-shape={shape}
      data-immediate={immediate || undefined}
      aria-hidden
      style={style}
    >
      {body}
    </span>
  );
}
Skeleton.displayName = SkeletonContract.name;
