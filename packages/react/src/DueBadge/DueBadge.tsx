import {
  DueBadgeContract,
  dueDays,
  formatDate,
  formatDueDays,
  type DueBadgeProps,
  type StatusTone,
} from '@terracelab/trellis-contracts';
import { cx } from '../_internal/cx.js';
import { Badge } from '../Badge/Badge.js';
import { useMessages } from '../_internal/locale.js';

export type DueState = 'overdue' | 'soon' | 'later' | 'done';

/** 기한 상태: 지남 · warnDays 안 · 그 뒤 · 완료 */
export function dueState(
  due: string,
  today: string | Date = new Date(),
  warnDays = 3,
  done = false,
): DueState {
  if (done) return 'done';
  const days = dueDays(due, today);
  if (days < 0) return 'overdue';
  return days <= warnDays ? 'soon' : 'later';
}

const LOOK: Record<DueState, { tone: StatusTone; variant: 'solid' | 'subtle' }> = {
  overdue: { tone: 'danger', variant: 'solid' },
  soon: { tone: 'warning', variant: 'subtle' },
  later: { tone: 'neutral', variant: 'subtle' },
  done: { tone: 'neutral', variant: 'subtle' },
};

export function DueBadge({
  due,
  today,
  warnDays = 3,
  done = false,
  doneLabel: doneLabelProp,
  size = 'md',
  id,
  testID,
  className,
}: DueBadgeProps & { className?: string }) {
  const t = useMessages();
  const doneLabel = doneLabelProp ?? t('dueBadge.done');
  const base = today ?? new Date();
  const state = dueState(due, base, warnDays, done);
  const { tone, variant } = LOOK[state];
  const iso = formatDate(due);
  return (
    <Badge
      className={cx('tl-due-badge', className)}
      id={id}
      testID={testID}
      tone={tone}
      variant={variant}
      size={size}
    >
      <time
        className="tl-due-badge__text"
        dateTime={iso}
        title={t('dueBadge.due', { date: iso })}
        data-due={state}
      >
        {state === 'done' ? doneLabel : formatDueDays(due, base)}
      </time>
    </Badge>
  );
}
DueBadge.displayName = DueBadgeContract.name;
