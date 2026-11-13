import { BannerContract, type BannerProps } from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { toneVars } from '../_internal/tone.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { useMessages } from '../_internal/locale.js';

type Tone = NonNullable<BannerProps['tone']>;

const ICON: Record<Tone, IconName> = {
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
  neutral: 'info',
};

export function Banner({
  tone = 'info',
  title,
  children,
  action,
  onClose,
  id,
  testID,
  className,
}: Omit<BannerProps, 'children' | 'action'> & {
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const t = useMessages();
  const vars = toneVars(tone);
  return (
    <div
      className={cx('tl-banner', className)}
      id={id}
      data-testid={testID}
      data-tone={tone}
      role={tone === 'danger' ? 'alert' : 'status'}
      style={
        {
          '--tl-banner-accent': vars.solid,
        } as CSSProperties
      }
    >
      <Icon name={ICON[tone]} className="tl-banner__icon" />
      <div className="tl-banner__content">
        {title && <p className="tl-banner__title">{title}</p>}
        {children != null && <div className="tl-banner__message">{children}</div>}
      </div>
      {/* 동작은 넓으면 오른쪽, 좁으면(컨테이너 560 미만) 글 아래 줄. 닫기는 늘 오른쪽 위(PR-38) */}
      {action != null && <div className="tl-banner__action">{action}</div>}
      {onClose && (
        <div className="tl-banner__close">
          <IconButton icon="x" label={t('common.close')} size="sm" onPress={onClose} />
        </div>
      )}
    </div>
  );
}
Banner.displayName = BannerContract.name;
