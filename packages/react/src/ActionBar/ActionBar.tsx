import { ActionBarContract, type ActionBarProps } from '@terracelab/trellis-contracts';
import { Children, isValidElement, type ReactNode } from 'react';
import { useBottomInset } from '../_internal/bottom-inset.js';
import { cx, isDev, warnDev } from '../_internal/cx.js';

export type ActionBarWebProps = Omit<ActionBarProps, 'children' | 'summary'> & {
  children?: ReactNode;
  summary?: ReactNode;
  className?: string;
};

/** 저장 우하단 · 취소 그 왼쪽(components.md §10). primary가 맨 끝이 아니면 경고한다 */
function checkOrder(children: ReactNode) {
  const buttons = Children.toArray(children).filter(isValidElement);
  const primary = buttons.findIndex(
    (el) => (el.props as { variant?: unknown }).variant === 'primary',
  );
  if (primary >= 0 && primary !== buttons.length - 1)
    warnDev('ActionBar: 주 동작(primary)은 맨 오른쪽에 둡니다. 취소는 그 왼쪽입니다.');
}

export function ActionBar({
  children,
  summary,
  sticky = false,
  align,
  id,
  testID,
  className,
}: ActionBarWebProps) {
  if (isDev) checkOrder(children);
  const resolved = align ?? (summary != null ? 'between' : 'end');
  // 화면 아래에 붙은 동작 줄(저장 · 발행) 위로 토스트를 올린다(PR-19)
  const insetRef = useBottomInset<HTMLDivElement>(sticky);
  return (
    <div
      className={cx('tl-action-bar', className)}
      id={id}
      data-testid={testID}
      role="group"
      ref={insetRef}
      data-align={resolved}
      data-sticky={sticky || undefined}
    >
      {summary != null && <div className="tl-action-bar__summary">{summary}</div>}
      <div className="tl-action-bar__actions">{children}</div>
    </div>
  );
}
ActionBar.displayName = ActionBarContract.name;
