import {
  formatAmount,
  formatPercent,
  ProgressContract,
  type ProgressProps,
  formatMessage,
  type Locale,
} from '@terracelab/trellis-contracts';
import type { CSSProperties } from 'react';
import { Progress as P } from '../_headless/index.js';
import { cx } from '../_internal/cx.js';
import { toneVars } from '../_internal/tone.js';
import { useLocale } from '../_internal/locale.js';

/** 값 글자: 단위가 있으면 "124 / 200건", 없으면 "62%" */
export function progressText(
  value: number | null,
  max = 100,
  unit?: string,
  locale: Locale = 'ko',
): string {
  if (value == null) return formatMessage(locale, 'progress.indeterminate');
  const v = Math.min(Math.max(value, 0), max);
  if (unit) return `${formatAmount(v)} / ${formatAmount(max)}${unit}`;
  return formatPercent(max > 0 ? (v / max) * 100 : 0, 0);
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = true,
  unit,
  tone,
  size = 'md',
  id,
  testID,
  className,
}: ProgressProps & { className?: string }) {
  const locale = useLocale();
  const clamped = value == null ? null : Math.min(Math.max(value, 0), max);
  const text = progressText(clamped, max, unit, locale);
  // 기본 채움은 회사 색 그대로의 강조(D-97, 주 진행 막대)
  const fill = tone ? toneVars(tone).solid : 'var(--tl-color-brand-accent)';
  return (
    <P.Root
      className={cx('tl-progress', className)}
      id={id}
      data-testid={testID}
      data-size={size}
      data-tone={tone}
      value={clamped}
      max={max}
      aria-valuetext={text}
      style={{ '--tl-progress-fill': fill } as CSSProperties}
    >
      <P.Label className="tl-progress__label">{label}</P.Label>
      {showValue && <P.Value className="tl-progress__value">{() => text}</P.Value>}
      <P.Track className="tl-progress__track">
        <P.Indicator className="tl-progress__indicator" />
      </P.Track>
    </P.Root>
  );
}
Progress.displayName = ProgressContract.name;
