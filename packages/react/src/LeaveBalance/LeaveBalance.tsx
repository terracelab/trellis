import {
  formatPeriod,
  LeaveBalanceContract,
  type LeaveBalanceProps,
  type LeaveTypeBalance,
} from '@terracelab/trellis-contracts';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { Card } from '../Card/Card.js';
import { Icon } from '../Icon/Icon.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { daysNumber, useWorktimeText } from '../TimeClock/time.js';

const MINUS = '−';
const pct = (v: number) => `${Math.max(0, Math.min(100, v * 100))}%`;
/** 남은 일수: 음수(앞당겨 쓴 연차)는 U+2212 */
const signed = (v: number) => (v < 0 ? `${MINUS}${daysNumber(-v)}` : daysNumber(v));

export function LeaveBalance({
  granted,
  used,
  planned = 0,
  basis,
  period,
  expiresOn,
  types,
  promotion,
  action,
  title,
  loading = false,
  id,
  testID,
  className,
}: Omit<LeaveBalanceProps, 'action'> & { action?: ReactNode; className?: string }) {
  const f = useWorktimeText();
  const { t } = f;
  const remaining = granted - used - planned;
  const scale = Math.max(granted, used + planned) || 1;
  const subtitle = [
    period ? formatPeriod(period.from, period.to) : null,
    basis ? t(`leaveBalance.basis.${basis}`) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const meterText = t('leaveBalance.meter', {
    granted: f.days(granted),
    used: f.days(used),
    planned: f.days(planned),
    remaining: `${signed(remaining)}${t('worktime.dayUnit')}`,
  });

  return (
    <Card
      id={id}
      testID={testID}
      className={cx('tl-leave-balance', className)}
      title={title ?? t('leaveBalance.title')}
      subtitle={subtitle || undefined}
      action={action}
    >
      {loading ? (
        <div className="tl-leave-balance__body" aria-busy>
          <Skeleton width="30%" />
          <Skeleton shape="rect" width="40%" height="var(--tl-type-display-line-height)" />
          <Skeleton shape="rect" height="var(--tl-space-8)" />
          <Skeleton lines={3} />
          <span className="tl-sr-only">{t('common.loading')}</span>
        </div>
      ) : (
        <div className="tl-leave-balance__body" data-advance={remaining < 0 || undefined}>
          <div className="tl-leave-balance__summary">
            <span className="tl-leave-balance__label">{t('leaveBalance.remaining')}</span>
            <span className="tl-leave-balance__value">
              <span className="tl-leave-balance__number">{signed(remaining)}</span>
              <span className="tl-leave-balance__unit">{t('worktime.dayUnit')}</span>
            </span>
            {remaining < 0 && (
              <span className="tl-leave-balance__advance">
                <Icon name="circle-alert" />
                {t('leaveBalance.advance')}
              </span>
            )}
          </div>
          <div className="tl-leave-balance__bar" role="img" aria-label={meterText}>
            <span
              className="tl-leave-balance__seg"
              data-kind="used"
              style={{ '--tl-leave-balance-size': pct(used / scale) } as CSSProperties}
            />
            {planned > 0 && (
              <span
                className="tl-leave-balance__seg"
                data-kind="planned"
                style={{ '--tl-leave-balance-size': pct(planned / scale) } as CSSProperties}
              />
            )}
          </div>
          <dl className="tl-leave-balance__figures">
            <div data-kind="granted">
              <dt>{t('leaveBalance.granted')}</dt>
              <dd>{f.days(granted)}</dd>
            </div>
            <div data-kind="used">
              <dt>{t('leaveBalance.used')}</dt>
              <dd>{f.days(used)}</dd>
            </div>
            {planned > 0 && (
              <div data-kind="planned">
                <dt>{t('leaveBalance.planned')}</dt>
                <dd>{f.days(planned)}</dd>
              </div>
            )}
          </dl>
          {expiresOn && (
            <p className="tl-leave-balance__line">
              <Icon name="calendar" className="tl-leave-balance__line-icon" />
              {t('leaveBalance.expires', { date: f.date(expiresOn) })}
            </p>
          )}
          {types && types.length > 0 && <Types types={types} />}
          {promotion && (
            <p className="tl-leave-balance__line" data-kind="promotion">
              <Icon name="megaphone" className="tl-leave-balance__line-icon" />
              {t(promotion.stage === 1 ? 'leaveBalance.promotion1' : 'leaveBalance.promotion2', {
                date: f.date(promotion.dueOn),
              })}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
LeaveBalance.displayName = LeaveBalanceContract.name;

function Types({ types }: { types: readonly LeaveTypeBalance[] }) {
  const f = useWorktimeText();
  const { t } = f;
  return (
    <ul className="tl-leave-balance__types" aria-label={t('leaveBalance.byType')}>
      {types.map((row, i) => {
        const name = row.label ?? t(`worktime.kind.${row.kind}`);
        const left = row.granted != null ? row.granted - row.used : null;
        return (
          <li key={`${row.kind}-${i}`} className="tl-leave-balance__type">
            <span className="tl-leave-balance__type-name">{name}</span>
            <span className="tl-leave-balance__type-usage">
              {row.granted != null
                ? t('leaveBalance.typeRow', {
                    granted: f.days(row.granted),
                    used: f.days(row.used),
                  })
                : t('leaveBalance.typeUsed', { used: f.days(row.used) })}
            </span>
            <span className="tl-leave-balance__type-left">
              {left != null ? `${signed(left)}${t('worktime.dayUnit')}` : ''}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
