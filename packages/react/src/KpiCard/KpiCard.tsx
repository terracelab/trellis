import {
  formatAmount,
  formatCompactWon,
  formatCurrency,
  formatDelta,
  formatPercent,
  KpiCardContract,
  RRN_MASK_CHAR,
  type CurrencyCode,
  type KpiCardProps,
  type KpiDelta,
  formatMessage,
  type Locale,
} from '@terracelab/trellis-contracts';
import { useId } from 'react';
import { cx } from '../_internal/cx.js';
import { Button } from '../Button/Button.js';
import { Delta } from '../Delta/Delta.js';
import { Icon } from '../Icon/Icon.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { useLocale, useMessages } from '../_internal/locale.js';

type Format = NonNullable<KpiCardProps['format']>;

/** 가린 지표의 자리 글자. 자리 수로 값을 짐작하지 못하게 늘 같은 길이 */
const MASK = RRN_MASK_CHAR.repeat(6);

/** 값 → 숫자 글자와 단위(단위는 작게 따로 그린다, D-35) */
export function kpiValue(
  value: number | string,
  format: Format = 'number',
  unit?: string,
  currency: CurrencyCode = 'KRW',
  locale: Locale = 'ko',
): { text: string; unit?: string } {
  const won = formatMessage(locale, 'common.unitWon');
  if (typeof value === 'string') return { text: value, ...(unit ? { unit } : {}) };
  switch (format) {
    case 'amount':
      return { text: formatAmount(value), unit: unit ?? won };
    case 'compactWon':
      return { text: formatCompactWon(value), unit: unit ?? won };
    case 'percent':
      return { text: formatPercent(value).slice(0, -1), unit: '%' };
    case 'currency':
      return currency === 'KRW'
        ? { text: formatAmount(value), unit: won }
        : { text: formatCurrency(value, currency) };
    default:
      return { text: formatAmount(value), ...(unit ? { unit } : {}) };
  }
}

/** 증감 글자: 부호 항상(content.md §4). Delta와 같은 formatDelta */
export function kpiDeltaText(delta: KpiDelta, unit?: string, locale: Locale = 'ko'): string {
  const format = delta.format ?? 'percent';
  return formatDelta(delta.value, format, {
    unit: format === 'amount' ? formatMessage(locale, 'common.unitWon') : unit,
  });
}

export function KpiCard({
  label,
  value,
  unit,
  format = 'number',
  currency = 'KRW',
  delta,
  caption,
  icon,
  size = 'md',
  loading = false,
  error = false,
  onRetry,
  masked = false,
  onPress,
  id,
  testID,
  className,
}: KpiCardProps & { className?: string }) {
  const t = useMessages();
  const locale = useLocale();
  const labelId = useId();
  const shown = kpiValue(value, format, unit, currency, locale);
  const failed = Boolean(error) && !loading;
  const hidden = Boolean(masked) && !loading && !failed;

  const valueBlock = loading ? (
    <span className="tl-kpi-card__placeholder">
      <Skeleton
        shape="rect"
        width="60%"
        height={
          size === 'lg'
            ? 'var(--tl-type-display-line-height)'
            : size === 'sm'
              ? 'var(--tl-type-amount-line-height)'
              : 'var(--tl-type-amount-lg-line-height)'
        }
      />
      {delta && <Skeleton width="40%" />}
      <span className="tl-sr-only">{t('common.loading')}</span>
    </span>
  ) : failed ? (
    <span className="tl-kpi-card__error">
      <span className="tl-kpi-card__error-text">
        <Icon name="circle-alert" className="tl-kpi-card__error-icon" />
        {typeof error === 'string' ? error : t('kpiCard.error')}
      </span>
      {onRetry && (
        <Button
          size="sm"
          variant="ghost"
          icon="refresh-cw"
          aria-label={t('kpiCard.retry', { label })}
          onPress={onRetry}
        >
          {t('common.retry')}
        </Button>
      )}
    </span>
  ) : hidden ? (
    <>
      <span className="tl-kpi-card__value">
        <span className="tl-kpi-card__number" data-masked="" aria-hidden>
          {MASK}
        </span>
        <span className="tl-sr-only">{t('kpiCard.maskedValue')}</span>
      </span>
      <span className="tl-kpi-card__reason">
        <Icon name="lock" className="tl-kpi-card__reason-icon" />
        {typeof masked === 'string' ? masked : t('kpiCard.masked')}
      </span>
    </>
  ) : (
    <>
      <span className="tl-kpi-card__value">
        <span className="tl-kpi-card__number">{shown.text}</span>
        {shown.unit && <span className="tl-kpi-card__unit">{shown.unit}</span>}
      </span>
      {delta && (
        <Delta
          className="tl-kpi-card__delta"
          size="sm"
          value={delta.value}
          label={delta.label}
          format={delta.format ?? 'percent'}
          polarity={delta.polarity ?? 'finance'}
          {...(shown.unit && delta.format === 'number' ? { unit: shown.unit } : {})}
        />
      )}
    </>
  );

  const body = (
    <>
      <span className="tl-kpi-card__head">
        {icon && <Icon name={icon} className="tl-kpi-card__icon" />}
        <span className="tl-kpi-card__label" id={labelId}>
          {label}
        </span>
      </span>
      {valueBlock}
      {caption && <span className="tl-kpi-card__caption">{caption}</span>}
      {onPress && !failed && <Icon name="chevron-right" className="tl-kpi-card__chevron" />}
    </>
  );

  const common = {
    id,
    'data-testid': testID,
    'data-size': size,
    'data-state': loading ? 'loading' : failed ? 'error' : undefined,
    'data-masked': hidden || undefined,
    'aria-busy': loading || undefined,
  };

  // 오류일 때는 카드가 버튼이 아니다: 다시 시도 단추를 단추 안에 넣지 않는다
  if (onPress && !failed) {
    return (
      <button
        {...common}
        type="button"
        className={cx('tl-kpi-card', 'tl-focusable', className)}
        data-pressable=""
        onClick={() => {
          if (!loading) onPress();
        }}
      >
        {body}
      </button>
    );
  }
  return (
    <div
      {...common}
      className={cx('tl-kpi-card', className)}
      role="group"
      aria-labelledby={labelId}
    >
      {body}
    </div>
  );
}
KpiCard.displayName = KpiCardContract.name;
