import {
  ChecklistContract,
  checklistProgress,
  dueDays,
  formatAmount,
  formatDate,
  type ChecklistItem,
  type ChecklistProps,
  type ChecklistState,
} from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import { Fragment, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages, type Translate } from '../_internal/locale.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';
import { Progress } from '../Progress/Progress.js';
import { Skeleton } from '../Skeleton/Skeleton.js';

export type ChecklistWebProps = ChecklistProps & { className?: string };

/** 상태는 모양으로도 나뉜다: 체크 원 · 점 원 · 빈 원(CSS 고리) · 멈춤 원. 색만으로 전하지 않는다 */
const MARK_ICON: Record<ChecklistState, IconName | null> = {
  done: 'circle-check',
  doing: 'circle-dot',
  pending: null,
  blocked: 'circle-pause',
};

/** 요약 줄에 세는 남은 상태(완료는 막대가 보인다) */
const REST_ORDER: readonly Exclude<ChecklistState, 'done'>[] = ['doing', 'blocked', 'pending'];

const isoToday = () => formatDate(new Date());

function Mark({ state }: { state: ChecklistState }) {
  const icon = MARK_ICON[state];
  return icon ? (
    <Icon name={icon} className="tl-checklist__icon" />
  ) : (
    <span className="tl-checklist__ring" aria-hidden="true" />
  );
}

/** 기한 글자: 11월 25일 · D-19, 끝나지 않았는데 지났으면 11월 4일 · 2일 경과 */
function dueText(item: ChecklistItem, today: string, t: Translate) {
  if (!item.due) return null;
  const days = dueDays(item.due, today);
  const overdue = item.state !== 'done' && days < 0;
  const rel =
    item.state === 'done'
      ? null
      : days === 0
        ? t('checklist.dueToday')
        : days > 0
          ? t('checklist.dueDays', { count: formatAmount(days) })
          : t('checklist.overdue', { count: formatAmount(-days) });
  return {
    overdue,
    text: rel ? `${formatDate(item.due, 'md')} · ${rel}` : formatDate(item.due, 'md'),
  };
}

export function Checklist({
  items,
  label,
  onChange,
  showProgress = true,
  today,
  loading = false,
  emptyText,
  id,
  testID,
  className,
}: ChecklistWebProps) {
  const t = useMessages();
  const day = today ?? isoToday();
  const progress = checklistProgress(items, day);
  const rest = REST_ORDER.filter((s) => progress[s] > 0)
    .map((s) => t('checklist.remaining', { state: t(`checklist.${s}`), count: progress[s] }))
    .join(' · ');

  return (
    <div
      className={cx('tl-checklist', className)}
      id={id}
      data-testid={testID}
      data-state={loading ? 'loading' : undefined}
      role="group"
      aria-label={label}
      aria-busy={loading || undefined}
    >
      {showProgress && !loading && items.length > 0 && (
        <div className="tl-checklist__summary">
          <Progress
            label={t('checklist.progress')}
            value={progress.done}
            max={progress.total}
            unit={t('common.itemsSuffix')}
            size="sm"
            {...(progress.done === progress.total ? { tone: 'success' as const } : {})}
          />
          {rest && <p className="tl-checklist__rest">{rest}</p>}
        </div>
      )}
      {loading ? (
        <div className="tl-checklist__loading">
          <Skeleton shape="list" lines={4} />
          <span className="tl-sr-only">{t('common.loading')}</span>
        </div>
      ) : items.length === 0 ? (
        <p className="tl-checklist__empty">{emptyText ?? t('checklist.empty')}</p>
      ) : (
        <ul className="tl-checklist__list">
          {items.map((item) => {
            const done = item.state === 'done';
            const locked = item.state === 'blocked' || item.disabled;
            const due = dueText(item, day, t);
            const meta: ReactNode[] = [
              <span key="state" className="tl-checklist__state">
                {t(`checklist.${item.state}`)}
              </span>,
              item.owner ? <span key="owner">{item.owner}</span> : null,
              due ? (
                <span
                  key="due"
                  className="tl-checklist__due"
                  data-overdue={due.overdue || undefined}
                >
                  {due.overdue && (
                    <Icon name="triangle-alert" size={16} className="tl-checklist__due-icon" />
                  )}
                  {due.text}
                </span>
              ) : null,
              item.meta ? <span key="meta">{item.meta}</span> : null,
            ].filter(Boolean);
            return (
              <li
                key={item.id}
                className="tl-checklist__item"
                data-item-state={item.state}
                data-disabled={item.disabled || undefined}
              >
                {onChange ? (
                  <button
                    type="button"
                    role="checkbox"
                    className="tl-checklist__mark tl-focusable"
                    aria-checked={done}
                    aria-label={t('checklist.check', { title: item.title })}
                    disabled={locked}
                    onClick={() => onChange(item.id, !done)}
                  >
                    <Mark state={item.state} />
                  </button>
                ) : (
                  <span className="tl-checklist__mark">
                    <Mark state={item.state} />
                  </span>
                )}
                <span className="tl-checklist__text">
                  <span className="tl-checklist__title">{item.title}</span>
                  {item.description && (
                    <span className="tl-checklist__description">{item.description}</span>
                  )}
                  <span className="tl-checklist__meta">
                    {meta.map((m, i) => (
                      <Fragment key={i}>
                        {i > 0 && (
                          <span className="tl-checklist__sep" aria-hidden="true">
                            ·
                          </span>
                        )}
                        {m}
                      </Fragment>
                    ))}
                  </span>
                </span>
                {item.action && (
                  <Button
                    className="tl-checklist__action"
                    size="sm"
                    variant={done ? 'ghost' : 'secondary'}
                    {...(item.action.icon ? { icon: item.action.icon } : {})}
                    onPress={item.action.onPress}
                  >
                    {item.action.label}
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
Checklist.displayName = ChecklistContract.name;
