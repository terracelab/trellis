import {
  formatDate,
  formatRelativeTime,
  NotificationItemContract,
  type NotificationItemProps,
} from '@terracelab/trellis-contracts';
import { cx } from '../_internal/cx.js';
import { useLocale, useMessages } from '../_internal/locale.js';
import { useLinkClick } from '../_internal/navigate.js';
import { Badge } from '../Badge/Badge.js';
import { ModuleIcon } from '../ModuleIcon/ModuleIcon.js';

export type NotificationItemWebProps = NotificationItemProps & { className?: string };

const pad = (n: number) => String(n).padStart(2, '0');

/** 가리키면 보이는 전체 시각: 2026-11-09 14:04 */
function fullTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 알림 목록 한 줄(PR-32): 읽지 않음 점 · 모듈 아이콘(선택) · 제목 · 배지(danger · warning) · 상대 시각 · 본문 두 줄.
 * 홈 타일(숫자 하나)은 NotificationCard, 서랍 · 목록 화면의 줄은 이것
 */
export function NotificationItem({
  title,
  body,
  time,
  now,
  unread = false,
  module,
  tone = 'neutral',
  toneLabel,
  href,
  onPress,
  id,
  testID,
  className,
}: NotificationItemWebProps) {
  const t = useMessages();
  const locale = useLocale();
  const onLinkClick = useLinkClick(href, { onPress });
  const flagged = tone === 'danger' || tone === 'warning';
  const content = (
    <>
      {/* 점 자리는 늘 둔다: 읽은 줄과 안 읽은 줄의 제목이 같은 세로선에 선다 */}
      <span className="tl-notification-item__mark" aria-hidden>
        {unread && <span className="tl-notification-item__unread" />}
      </span>
      {module && <ModuleIcon module={module} size={32} className="tl-notification-item__icon" />}
      <span className="tl-notification-item__main">
        <span className="tl-notification-item__head">
          <span className="tl-notification-item__title">
            {unread && <span className="tl-sr-only">{t('common.unread')}</span>}
            {unread && ' '}
            {title}
          </span>
          {/* 이름 계산이 칸 글자를 붙여 읽지 않게 사이에 공백 글자(flex 안이라 화면 간격은 gap) */}{' '}
          {flagged && (
            <Badge tone={tone} size="sm" className="tl-notification-item__badge">
              {toneLabel ?? t('notification.attention')}
            </Badge>
          )}
          {flagged && ' '}
          <time className="tl-notification-item__time" dateTime={time} title={fullTime(time)}>
            {formatRelativeTime(time, now ?? new Date(), locale)}
          </time>
        </span>
        {body && ' '}
        {body && <span className="tl-notification-item__body">{body}</span>}
      </span>
    </>
  );
  const common = {
    id,
    'data-testid': testID,
    'data-unread': unread || undefined,
    'data-tone': flagged ? tone : undefined,
  };
  if (href)
    return (
      <a
        {...common}
        className={cx('tl-notification-item tl-focusable', className)}
        data-interactive=""
        href={href}
        onClick={onLinkClick}
      >
        {content}
      </a>
    );
  if (onPress)
    return (
      <button
        {...common}
        type="button"
        className={cx('tl-notification-item tl-focusable', className)}
        data-interactive=""
        onClick={onPress}
      >
        {content}
      </button>
    );
  return (
    <div {...common} className={cx('tl-notification-item', className)}>
      {content}
    </div>
  );
}
NotificationItem.displayName = NotificationItemContract.name;
