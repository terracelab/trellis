import {
  ApprovalLineContract,
  approvalLineSummary,
  defaultApprovalRole,
  type ApprovalLineProps,
  type ApprovalLineState,
} from '@terracelab/trellis-contracts';
import { cx } from '../_internal/cx.js';
import { Badge } from '../Badge/Badge.js';
import { useMessages } from '../_internal/locale.js';

export function ApprovalLine({
  approvers,
  orientation = 'horizontal',
  variant = 'default',
  id,
  testID,
  className,
}: ApprovalLineProps & { className?: string }) {
  const t = useMessages();
  const stateText = (s: ApprovalLineState) =>
    s === 'waiting' ? t('approvalLine.waiting') : t(`approval.${s}`);

  if (variant === 'compact') {
    // 표 칸 · 목록 행: 결재 5색 점(대기는 빈 원) + "2/3 합의". 점은 꾸밈이고 글자 · 숨은 글자가 뜻을 말한다(R-T24)
    const sum = approvalLineSummary(approvers);
    const steps = approvers.map((a, i) =>
      t('approvalLine.stepText', {
        role: a.role ?? defaultApprovalRole(i, approvers.length),
        name: a.name,
        state: stateText(a.state),
      }),
    );
    return (
      <span
        className={cx('tl-approval-line', className)}
        id={id}
        data-testid={testID}
        data-variant="compact"
        data-status={sum?.state}
        title={steps.join(' · ')}
      >
        <span className="tl-approval-line__dots" aria-hidden="true">
          {approvers.map((a) => (
            <span key={a.id} className="tl-approval-line__dot" data-status={a.state} />
          ))}
        </span>
        {sum && (
          <span className="tl-approval-line__summary">
            {t('approvalLine.summary', { index: sum.index, total: sum.total, role: sum.role })}
            <span className="tl-sr-only">
              {' '}
              {stateText(sum.state)}. {t('approvalLine.label')} {steps.join(', ')}
            </span>
          </span>
        )}
      </span>
    );
  }

  return (
    <ol
      className={cx('tl-approval-line', className)}
      // 좁은 화면에서 가로로 스크롤되면 키보드로도 움직일 수 있게
      tabIndex={0}
      id={id}
      data-testid={testID}
      data-variant="default"
      data-orientation={orientation}
      aria-label={t('approvalLine.label')}
    >
      {approvers.map((a, i) => (
        <li
          key={a.id}
          className="tl-approval-line__step"
          data-status={a.state}
          aria-current={a.state === 'pending' ? 'step' : undefined}
        >
          <span className="tl-approval-line__role">
            {a.role ?? defaultApprovalRole(i, approvers.length)}
          </span>
          <div className="tl-approval-line__body">
            <span className="tl-approval-line__person">
              <span className="tl-approval-line__name">{a.name}</span>{' '}
              <span className="tl-approval-line__title">{a.title}</span>
            </span>
            <span className="tl-approval-line__badge">
              {a.state === 'waiting' ? (
                <Badge size="sm">{t('approvalLine.waiting')}</Badge>
              ) : (
                <Badge size="sm" approval={a.state} />
              )}
            </span>
            {a.time != null && <span className="tl-approval-line__time">{a.time}</span>}
            {a.comment != null && (
              <span className="tl-approval-line__comment" title={a.comment}>
                {a.comment}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
ApprovalLine.displayName = ApprovalLineContract.name;
