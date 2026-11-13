import {
  EMPTY_STATE_ICONS,
  EmptyStateContract,
  type EmptyStateProps,
} from '@terracelab/trellis-contracts';
import type { ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';

/**
 * 빈 상태 · 오류 · 권한 없음 블록(PR-30). kind가 기본 아이콘 · 제목 · 설명을 고른다.
 * title을 주면 설명은 준 것만 보인다(앱이 쓴 제목 아래에 기본 설명을 끼워 넣지 않는다).
 * headingLevel을 주면 제목이 그 단계의 제목 요소다(화면 하나를 차지하는 오류 블록은 1, PG-44)
 */
export function EmptyState({
  kind = 'empty',
  icon,
  title,
  description,
  requestId,
  action,
  size = 'md',
  headingLevel,
  id,
  testID,
  className,
}: Omit<EmptyStateProps, 'action'> & { action?: ReactNode; className?: string }) {
  const t = useMessages();
  const shownTitle = title ?? t(`emptyState.${kind}.title`);
  const shownDescription =
    title == null ? (description ?? t(`emptyState.${kind}.description`)) : description;
  const shownIcon = icon ?? EMPTY_STATE_ICONS[kind];
  const Title = headingLevel ? (`h${headingLevel}` as const) : 'p';
  return (
    <div
      className={cx('tl-empty-state', className)}
      id={id}
      data-testid={testID}
      data-size={size}
      data-kind={kind}
      data-heading={headingLevel && headingLevel <= 2 ? 'page' : undefined}
      role={kind === 'error' ? 'alert' : undefined}
    >
      <span className="tl-empty-state__icon" aria-hidden>
        <Icon name={shownIcon} size={size === 'sm' ? 16 : 20} />
      </span>
      <Title className="tl-empty-state__title">{shownTitle}</Title>
      {shownDescription && <p className="tl-empty-state__description">{shownDescription}</p>}
      {requestId && (
        <p className="tl-empty-state__request">{t('emptyState.requestId', { id: requestId })}</p>
      )}
      {action != null && <div className="tl-empty-state__action">{action}</div>}
    </div>
  );
}
EmptyState.displayName = EmptyStateContract.name;
