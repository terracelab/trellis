import {
  IssueListContract,
  type IssueItem,
  type IssueLevel,
  type IssueListProps,
} from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import { useId, useMemo } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { Skeleton } from '../Skeleton/Skeleton.js';

export type IssueListWebProps = IssueListProps & { className?: string };

/** 단계는 아이콘 모양으로도 나뉜다(원 안 × · 세모 안 !) */
const LEVEL_ICON: Record<IssueLevel, IconName> = {
  error: 'circle-x',
  warning: 'triangle-alert',
};

/** 오류가 먼저, 같은 단계 안에서는 받은 순서 */
export function sortIssues(items: readonly IssueItem[]): IssueItem[] {
  return [...items.filter((i) => i.level === 'error'), ...items.filter((i) => i.level !== 'error')];
}

export function IssueList({
  items,
  title,
  onSelect,
  onDetail,
  loading = false,
  empty,
  maxHeight,
  id,
  testID,
  className,
}: IssueListWebProps) {
  const t = useMessages();
  const titleId = useId();
  const sorted = useMemo(() => sortIssues(items), [items]);
  const errors = sorted.filter((i) => i.level === 'error').length;
  const warnings = sorted.length - errors;
  const name = title ?? t('issueList.label');
  // 단추가 없는 목록이 스크롤되면 목록 자체가 키보드로 스크롤되는 영역이 된다
  const scrollable = Boolean(maxHeight) && !onSelect && !onDetail && sorted.length > 0;

  return (
    <div
      className={cx('tl-issue-list', className)}
      id={id}
      data-testid={testID}
      data-state={loading ? 'loading' : undefined}
      role="group"
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
    >
      <div className="tl-issue-list__head">
        <span className="tl-issue-list__title" id={titleId}>
          {name}
        </span>
        {/* 건수가 바뀌면 읽는다. 항목이 없으면 empty 문구가 대신하므로 비운다(영역은 늘 둔다) */}
        <span className="tl-issue-list__summary" aria-live="polite">
          {loading || sorted.length === 0 ? '' : t('issueList.summary', { errors, warnings })}
        </span>
      </div>
      {loading ? (
        <div className="tl-issue-list__loading">
          <Skeleton shape="list" lines={3} />
          <span className="tl-sr-only">{t('common.loading')}</span>
        </div>
      ) : sorted.length === 0 ? (
        <p className="tl-issue-list__empty">{empty ?? t('issueList.empty')}</p>
      ) : (
        <ul
          className="tl-issue-list__list"
          style={maxHeight ? { maxHeight } : undefined}
          {...(scrollable ? { tabIndex: 0, 'aria-labelledby': titleId } : {})}
          data-scroll={maxHeight ? '' : undefined}
        >
          {sorted.map((item) => {
            const levelText = t(item.level === 'error' ? 'issueList.error' : 'issueList.warning');
            // 조각 사이의 빈칸은 읽기 이름을 띄우려는 것이다(flex 안이라 화면에는 그려지지 않는다)
            const content = (
              <>
                <Icon name={LEVEL_ICON[item.level]} className="tl-issue-list__icon" />
                <span className="tl-sr-only">{levelText}</span>{' '}
                <span className="tl-issue-list__text">
                  <span className="tl-issue-list__line">
                    {item.tag && <span className="tl-issue-list__tag">{item.tag}</span>}{' '}
                    <span className="tl-issue-list__item-title">{item.title}</span>
                  </span>{' '}
                  {item.message && <span className="tl-issue-list__message">{item.message}</span>}
                </span>
              </>
            );
            return (
              <li key={item.id} className="tl-issue-list__item" data-level={item.level}>
                {onSelect ? (
                  <button
                    type="button"
                    className="tl-issue-list__main tl-focusable"
                    data-pressable=""
                    onClick={() => onSelect(item.id)}
                  >
                    {content}
                  </button>
                ) : (
                  <span className="tl-issue-list__main">{content}</span>
                )}
                {onDetail && (
                  <Button
                    className="tl-issue-list__detail"
                    size="sm"
                    variant="ghost"
                    aria-label={t('issueList.detailOf', { title: item.title })}
                    onPress={() => onDetail(item.id)}
                  >
                    {t('issueList.detail')}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
IssueList.displayName = IssueListContract.name;
