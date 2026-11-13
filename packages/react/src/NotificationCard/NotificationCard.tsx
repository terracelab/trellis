import {
  formatCount,
  NotificationCardContract,
  type NotificationCardProps,
} from '@terracelab/trellis-contracts';
import { cx } from '../_internal/cx.js';
import { Badge } from '../Badge/Badge.js';
import { ModuleIcon } from '../ModuleIcon/ModuleIcon.js';
import { useMessages } from '../_internal/locale.js';

export function NotificationCard({
  module,
  title,
  description,
  count,
  time,
  tone = 'neutral',
  unread = false,
  onPress,
  id,
  testID,
  className,
}: NotificationCardProps & { className?: string }) {
  const t = useMessages();
  const hasCount = count != null && count > 0;
  const body = (
    <>
      <ModuleIcon module={module} size={40} className="tl-notification-card__icon" />
      <span className="tl-notification-card__body">
        <span className="tl-notification-card__title">
          {unread && (
            <>
              <span className="tl-notification-card__unread" aria-hidden />
              <span className="tl-sr-only">{t('common.unread')}</span>
            </>
          )}
          <span className="tl-notification-card__title-text">{title}</span>
        </span>
        {description && <span className="tl-notification-card__description">{description}</span>}
        {time && <span className="tl-notification-card__time">{time}</span>}
      </span>
      {hasCount && (
        <span className="tl-notification-card__count">
          <Badge variant="solid" tone={tone} dot={false}>
            <span aria-hidden>{formatCount(count)}</span>
            <span className="tl-sr-only">{t('common.itemsSr', { count: formatCount(count) })}</span>
          </Badge>
        </span>
      )}
    </>
  );
  const common = {
    id,
    'data-testid': testID,
    'data-tone': tone,
    'data-unread': unread || undefined,
  };
  if (onPress) {
    return (
      <button
        {...common}
        type="button"
        className={cx('tl-notification-card', 'tl-focusable', className)}
        data-pressable=""
        onClick={() => onPress()}
      >
        {body}
      </button>
    );
  }
  return (
    <div {...common} className={cx('tl-notification-card', className)}>
      {body}
    </div>
  );
}
NotificationCard.displayName = NotificationCardContract.name;
