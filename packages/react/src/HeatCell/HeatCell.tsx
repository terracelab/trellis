import { HeatCellContract, type HeatCellProps } from '@terracelab/trellis-contracts';
import { num } from '../_internal/chart/format.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

/** 단계 = ceil(value / max × 5). 0·null은 0 */
export function heatCellLevel(value: number | null | undefined, max: number): number {
  if (value === null || value === undefined || value <= 0 || max <= 0) return 0;
  return Math.min(5, Math.max(1, Math.ceil((value / max) * 5)));
}

export function HeatCell({
  value,
  max,
  format = num,
  unit,
  align = 'right',
  empty = '–',
  id,
  testID,
  className,
}: HeatCellProps & { className?: string }) {
  const t = useMessages();
  const level = heatCellLevel(value, max);
  const text = value === null || value === undefined ? empty : `${format(value)}${unit ?? ''}`;
  return (
    <span
      className={cx('tl-heat-cell', className)}
      data-level={level}
      data-align={align}
      title={
        value === null || value === undefined
          ? undefined
          : `${text} (${t('chart.max', { value: `${format(max)}${unit ?? ''}` })})`
      }
      id={id}
      data-testid={testID}
    >
      {text}
    </span>
  );
}
HeatCell.displayName = HeatCellContract.name;
