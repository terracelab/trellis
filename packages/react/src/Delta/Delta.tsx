import {
  deltaDirection,
  DeltaContract,
  formatDelta,
  type DeltaDirection,
  type DeltaPolarity,
  type DeltaProps,
} from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import type { CSSProperties } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';

export type DeltaWebProps = DeltaProps & { className?: string };

const ARROW: Record<DeltaDirection, IconName> = {
  up: 'trending-up',
  down: 'trending-down',
  flat: 'minus',
};

/**
 * 방향 색. finance = 증가 빨강 · 감소 파랑(글자와 아이콘), up-good · up-bad = 아이콘만 상태 색.
 * 값은 semantic 토큰 변수뿐이고 인라인 CSS 변수로 넘긴다(KpiCard 테스트가 style을 본다)
 */
export function deltaColors(
  direction: DeltaDirection,
  polarity: DeltaPolarity,
): { icon: string; text?: string } {
  if (polarity === 'finance') {
    const c =
      direction === 'up'
        ? 'var(--tl-color-finance-income)'
        : direction === 'down'
          ? 'var(--tl-color-finance-expense)'
          : 'var(--tl-color-finance-neutral)';
    return { icon: c, text: c };
  }
  if (direction === 'flat') return { icon: 'var(--tl-color-fg-tertiary)' };
  return {
    icon: deltaIsGood(direction, polarity)
      ? 'var(--tl-color-status-success-default)'
      : 'var(--tl-color-status-danger-default)',
  };
}

/** up-good · up-bad에서 이 방향이 좋은가 */
function deltaIsGood(direction: DeltaDirection, polarity: DeltaPolarity): boolean {
  return (direction === 'up') === (polarity === 'up-good');
}

export function Delta({
  value,
  format = 'percent',
  polarity = 'finance',
  label,
  unit,
  digits,
  size = 'md',
  id,
  testID,
  className,
}: DeltaWebProps) {
  const t = useMessages();
  const direction = deltaDirection(value, format, digits);
  const colors = deltaColors(direction, polarity);
  const text = formatDelta(value, format, {
    unit: format === 'amount' ? (unit ?? t('common.unitWon')) : unit,
    ...(digits !== undefined ? { digits } : {}),
  });
  // 좋고 나쁨을 색으로 말하는 극성만 숨은 글자로 덧붙인다(finance는 방향만 말한다)
  const judged = polarity !== 'finance' && direction !== 'flat';
  return (
    <span
      className={cx('tl-delta', className)}
      id={id}
      data-testid={testID}
      data-direction={direction}
      data-polarity={polarity}
      data-format={format}
      data-size={size}
      style={
        {
          '--tl-delta-icon': colors.icon,
          ...(colors.text ? { '--tl-delta-text': colors.text } : {}),
        } as CSSProperties
      }
    >
      {label && <span className="tl-delta__label">{label}</span>}
      <span className="tl-delta__value">
        <Icon name={ARROW[direction]} className="tl-delta__icon" />
        {text}
        {judged && (
          <span className="tl-sr-only">
            {' '}
            {t(deltaIsGood(direction, polarity) ? 'delta.better' : 'delta.worse')}
          </span>
        )}
      </span>
    </span>
  );
}
Delta.displayName = DeltaContract.name;
