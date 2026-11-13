import {
  type MessageKey,
  BulletBarContract,
  type BulletBarProps,
} from '@terracelab/trellis-contracts';
import { chartColor } from '../_internal/chart/colors.js';
import { Glyph, type GlyphName } from '../_internal/chart/Glyph.js';
import { formatPercent, num } from '../_internal/chart/format.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';

export type BulletState = 'default' | 'reached' | 'warning' | 'over';

/** 상태 계산(spec 동작 절). up-good: ≥1 달성 · ≥warnAt 주의. up-bad: >1 초과 · ≥warnAt 주의 */
export function bulletState(
  value: number,
  target: number,
  polarity: 'up-good' | 'up-bad',
  warnAt = 0.9,
): BulletState {
  if (target <= 0) return 'default';
  const ratio = value / target;
  if (polarity === 'up-good')
    return ratio >= 1 ? 'reached' : ratio >= warnAt ? 'warning' : 'default';
  return ratio > 1 ? 'over' : ratio >= warnAt ? 'warning' : 'default';
}

const STATE: Record<BulletState, { label?: MessageKey; glyph?: GlyphName; color: string }> = {
  default: { color: chartColor('series-1') },
  reached: { label: 'bullet.reached', glyph: 'check', color: chartColor('success') },
  warning: { label: 'bullet.warning', glyph: 'triangle-alert', color: chartColor('warning') },
  over: { label: 'bullet.over', glyph: 'circle-alert', color: chartColor('danger') },
};

export function BulletBar({
  label,
  value,
  target,
  max,
  unit,
  format = num,
  polarity = 'up-good',
  warnAt = 0.9,
  caption,
  size = 'md',
  showState = true,
  targetLabel,
  showRatio = true,
  id,
  testID,
  className,
}: BulletBarProps & { className?: string }) {
  const t = useMessages();
  const state = bulletState(value, target, polarity, warnAt);
  const limit = (max ?? Math.max(value, target) * 1.1) || 1;
  const fillPct = Math.min(100, (value / limit) * 100);
  const targetPct = Math.min(100, (target / limit) * 100);
  const s = STATE[state];
  // 상태를 보이지 않으면(showState false · 기준과 견주기) 막대 색도 기본으로: 색만으로 상태를 말하지 않는다
  const fill = showState ? s.color : STATE.default.color;
  const stateLabel = showState && s.label ? t(s.label) : '';
  // 목표가 아닌 기준(평균)과 견줄 때는 기준 이름을 값 앞에, 단위를 값 뒤에 붙인다("/ 평균 9.1%")
  const targetText = targetLabel
    ? `${targetLabel} ${format(target)}${unit ?? ''}`
    : t('chart.target', { value: `${format(target)}${unit ?? ''}` });
  // 비율은 정수 퍼센트(오른쪽 고정 폭 칸). 목표가 0이면 비율이 없다
  const ratio = showRatio && target > 0 ? formatPercent((value / target) * 100, 0) : null;
  const ratioText = ratio
    ? t('bullet.ratio', { target: targetLabel ?? t('bullet.targetName'), value: ratio })
    : '';
  const valueText = [`${format(value)}${unit ?? ''}`, targetText, ratioText, stateLabel]
    .filter(Boolean)
    .join(', ');
  return (
    <div
      className={cx('tl-bullet-bar', className)}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-label={label}
      aria-valuetext={valueText}
      id={id}
      data-testid={testID}
      data-size={size}
      data-state={state}
      data-polarity={polarity}
    >
      <div className="tl-bullet-bar__head">
        <span className="tl-bullet-bar__label">{label}</span>
        {caption && <span className="tl-bullet-bar__caption">{caption}</span>}
        <span className="tl-bullet-bar__value">
          {format(value)}
          {unit && <span className="tl-bullet-bar__unit">{unit}</span>}
          <span className="tl-bullet-bar__target">
            {' / '}
            {targetLabel ? `${targetLabel} ${format(target)}${unit ?? ''}` : format(target)}
          </span>
        </span>
        {stateLabel && (
          <span className="tl-bullet-bar__state">
            {s.glyph && <Glyph name={s.glyph} style={{ color: s.color }} />}
            {stateLabel}
          </span>
        )}
        {ratio && <span className="tl-bullet-bar__ratio">{ratio}</span>}
      </div>
      <div className="tl-bullet-bar__track">
        <span className="tl-bullet-bar__fill" style={{ width: `${fillPct}%`, background: fill }} />
        <span className="tl-bullet-bar__tick" style={{ left: `${targetPct}%` }} />
      </div>
    </div>
  );
}
BulletBar.displayName = BulletBarContract.name;
