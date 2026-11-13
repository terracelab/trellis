import { BadgeContract, type BadgeProps } from '@terracelab/trellis-contracts';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { approvalVars, toneVars } from '../_internal/tone.js';
import { useMessages } from '../_internal/locale.js';

export function Badge({
  tone = 'neutral',
  approval,
  variant = 'subtle',
  dot,
  size = 'md',
  children,
  id,
  testID,
  className,
}: Omit<BadgeProps, 'children'> & { children?: ReactNode; className?: string }) {
  const t = useMessages();
  const vars = approval ? approvalVars(approval) : toneVars(tone);
  // 점은 상태를 말할 때만(PR-38): solid · neutral(회색 점은 정보가 없다)은 기본 점 없음. 결재 상태는 늘 점
  const showDot = dot ?? (variant !== 'solid' && (approval != null || tone !== 'neutral'));
  return (
    <span
      className={cx('tl-badge', className)}
      id={id}
      data-testid={testID}
      data-variant={variant}
      data-size={size}
      data-dot={showDot || undefined}
      data-tone={approval ? undefined : tone}
      data-approval={approval}
      style={{ '--tl-badge-solid': vars.solid, '--tl-badge-subtle': vars.subtle } as CSSProperties}
    >
      {showDot && <span className="tl-badge__dot" aria-hidden />}
      {children ?? (approval ? t(`approval.${approval}`) : null)}
    </span>
  );
}
Badge.displayName = BadgeContract.name;
