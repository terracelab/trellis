import {
  PersonLabelContract,
  PRESENCE_TONES,
  type PersonLabelProps,
} from '@terracelab/trellis-contracts';
import type { ReactNode } from 'react';
import { Avatar } from '../Avatar/Avatar.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { useLinkClick } from '../_internal/navigate.js';
import { StatusDot } from '../StatusDot/StatusDot.js';

export type PersonLabelWebProps = Omit<PersonLabelProps, 'action'> & {
  action?: ReactNode;
  className?: string;
};

export function PersonLabel({
  name = '',
  meta,
  src,
  presence,
  status,
  size = 'md',
  href,
  onPress,
  vacant = false,
  vacantLabel,
  action,
  id,
  testID,
  className,
}: PersonLabelWebProps) {
  const t = useMessages();
  if (vacant) {
    // 공석(PR-34): 점선 아바타 + "담당자 없음" 글자. 크기 · 줄 수는 사람 있는 줄과 같다.
    // 줄 자체는 누르지 않는다(지정은 action 단추로)
    return (
      <span
        id={id}
        data-testid={testID}
        data-size={size}
        data-vacant=""
        className={cx('tl-person-label', className)}
      >
        <Avatar vacant size={size === 'sm' ? 24 : 32} decorative />
        <span className="tl-person-label__text">
          <span className="tl-person-label__name">{vacantLabel ?? t('avatar.vacant')}</span>
          {meta && (
            <span className="tl-person-label__meta">
              <span className="tl-person-label__role">{meta}</span>
            </span>
          )}
        </span>
        {action != null && <span className="tl-person-label__action">{action}</span>}
      </span>
    );
  }
  // 라우터가 있는 앱(TrellisProvider navigate)은 href를 새로 고침 없이 연다(R-T34)
  const onLinkClick = useLinkClick(href, { onPress });
  const presenceText = presence ? t(`hr.presence.${presence}`) : undefined;
  const body = (
    <>
      {/* 이름 글자가 옆에 있으니 아바타는 꾸밈. 접속 상태 점은 아래 숨은 글자로 읽는다 */}
      <Avatar
        name={name}
        src={src}
        size={size === 'sm' ? 24 : 32}
        {...(status ? { status } : {})}
        decorative
      />
      <span className="tl-person-label__text">
        <span className="tl-person-label__name">{name}</span>
        {status && <span className="tl-sr-only">{t(`avatar.${status}`)}</span>}
        {(meta || presence) && (
          <span className="tl-person-label__meta">
            {meta && <span className="tl-person-label__role">{meta}</span>}
            {presence &&
              (size === 'sm' ? (
                // 표 칸(sm)은 점만 보여 이름이 폭을 지킨다(R-T35). 글자는 화면 읽기 · 툴팁으로
                <span className="tl-person-label__presence" title={presenceText}>
                  <StatusDot tone={PRESENCE_TONES[presence]} size="sm" />
                  <span className="tl-sr-only">{presenceText}</span>
                </span>
              ) : (
                <StatusDot
                  className="tl-person-label__presence"
                  tone={PRESENCE_TONES[presence]}
                  size="sm"
                >
                  {presenceText}
                </StatusDot>
              ))}
          </span>
        )}
      </span>
    </>
  );
  const common = {
    id,
    'data-testid': testID,
    'data-size': size,
  };
  if (href)
    return (
      <a
        {...common}
        className={cx('tl-person-label tl-focusable', className)}
        data-interactive=""
        href={href}
        onClick={onLinkClick}
      >
        {body}
      </a>
    );
  if (onPress)
    return (
      <button
        {...common}
        type="button"
        className={cx('tl-person-label tl-focusable', className)}
        data-interactive=""
        onClick={onPress}
      >
        {body}
      </button>
    );
  return (
    <span {...common} className={cx('tl-person-label', className)}>
      {body}
    </span>
  );
}
PersonLabel.displayName = PersonLabelContract.name;
