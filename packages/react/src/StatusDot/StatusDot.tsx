import { StatusDotContract, type StatusDotProps } from '@terracelab/trellis-contracts';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { toneVars } from '../_internal/tone.js';

export function StatusDot({
  tone = 'neutral',
  size = 'md',
  pulse = false,
  children,
  id,
  testID,
  className,
}: Omit<StatusDotProps, 'children'> & { children?: ReactNode; className?: string }) {
  return (
    <span
      className={cx('tl-status-dot', className)}
      id={id}
      data-testid={testID}
      data-tone={tone}
      data-size={size}
      data-pulse={pulse || undefined}
      style={{ '--tl-status-dot-color': toneVars(tone).solid } as CSSProperties}
    >
      <span className="tl-status-dot__dot" aria-hidden />
      {children != null && <span className="tl-status-dot__label">{children}</span>}
    </span>
  );
}
StatusDot.displayName = StatusDotContract.name;
