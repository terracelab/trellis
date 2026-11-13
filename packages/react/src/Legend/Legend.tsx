import { LegendContract, type LegendProps } from '@terracelab/trellis-contracts';
import { chartColor } from '../_internal/chart/colors.js';
import { cx } from '../_internal/cx.js';

export function Legend({ items, id, testID, className }: LegendProps & { className?: string }) {
  return (
    <ul className={cx('tl-legend', className)} role="list" id={id} data-testid={testID}>
      {items.map((it, i) => (
        <li className="tl-legend__item" key={`${it.label}-${i}`} data-shape={it.shape ?? 'square'}>
          <span
            className="tl-legend__swatch"
            style={{ ['--tl-legend-color' as string]: chartColor(it.color) }}
            aria-hidden="true"
          />
          <span className="tl-legend__label">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
Legend.displayName = LegendContract.name;
