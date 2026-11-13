import {
  ProposalCardContract,
  type ProposalCardProps,
  type ProposalStatus,
} from '@terracelab/trellis-contracts';
import { useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Badge } from '../Badge/Badge.js';
import { Button } from '../Button/Button.js';
import { HeadingLevel } from '../Card/Card.js';
import { ChangeDiff } from '../ChangeDiff/ChangeDiff.js';
import { Icon } from '../Icon/Icon.js';
import { ReasonDialog } from '../ReasonDialog/ReasonDialog.js';

export type ProposalCardWebProps = Omit<ProposalCardProps, 'children'> & {
  children?: ReactNode;
  className?: string;
};

const isPromise = (v: unknown): v is Promise<unknown> =>
  typeof v === 'object' && v !== null && typeof (v as Promise<unknown>).then === 'function';

const TONE = { waiting: 'warning', approved: 'success', rejected: 'danger' } as const;

export function ProposalCard({
  title,
  summary,
  changes,
  status,
  defaultStatus = 'waiting',
  onApprove,
  onReject,
  reason,
  resolvedBy,
  reasonMinLength = 1,
  approveLabel,
  rejectLabel,
  loading = false,
  disabled = false,
  error,
  headingLevel,
  children,
  id,
  testID,
  className,
}: ProposalCardWebProps) {
  const t = useMessages();
  const titleId = useId();
  const inherited = useContext(HeadingLevel);
  const level = Math.min(6, Math.max(2, headingLevel ?? inherited));
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const [inner, setInner] = useState<ProposalStatus>(defaultStatus);
  const current = status ?? inner;
  const [rejecting, setRejecting] = useState(false);
  const [given, setGiven] = useState<string>();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const busy = loading || pending;
  const resultRef = useRef<HTMLDivElement>(null);
  // 이 카드에서 처리한 직후에만 결과 줄로 포커스를 옮긴다(서버가 바꾼 상태에는 옮기지 않는다)
  const handled = useRef(false);

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const settle = (next: ProposalStatus) => {
    handled.current = true;
    if (status === undefined) setInner(next);
  };

  // 단추가 사라지므로 포커스를 결과 줄로 옮긴다. 사유 창이 닫히며 포커스를 돌려놓은 뒤에 옮긴다
  useEffect(() => {
    if (!handled.current || current === 'waiting') return;
    handled.current = false;
    const timer = setTimeout(() => resultRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [current]);

  const approve = async () => {
    if (busy || disabled) return;
    setFailed(false);
    try {
      const result = onApprove?.();
      if (isPromise(result)) {
        setPending(true);
        await result;
      }
    } catch {
      if (!alive.current) return;
      setPending(false);
      setFailed(true);
      return;
    }
    if (!alive.current) return;
    setPending(false);
    settle('approved');
  };

  // 사유 창의 확인. Promise면 사유 창이 진행 중을 보이고, 실패하면 열린 채 오류 문구(ReasonDialog 규칙)
  const reject = (text: string) => {
    const done = () => {
      if (!alive.current) return;
      setGiven(text);
      setFailed(false);
      settle('rejected');
    };
    const result = onReject?.(text);
    if (isPromise(result)) return result.then(done);
    done();
    return undefined;
  };

  const message = error ?? (failed ? t('proposalCard.failed') : undefined);
  const shownReason = reason ?? given;
  const statusLabel =
    current === 'waiting'
      ? t('agentRun.waiting')
      : current === 'approved'
        ? t('proposalCard.approved')
        : t('proposalCard.rejected');

  return (
    <article
      className={cx('tl-proposal-card', className)}
      id={id}
      data-testid={testID}
      data-status={current}
      data-state={
        current !== 'waiting'
          ? undefined
          : busy
            ? 'loading'
            : message
              ? 'error'
              : disabled
                ? 'disabled'
                : undefined
      }
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
    >
      <div className="tl-proposal-card__head">
        <Heading className="tl-proposal-card__title" id={titleId}>
          {title}
        </Heading>
        <Badge tone={TONE[current]} className="tl-proposal-card__status">
          {statusLabel}
        </Badge>
      </div>
      {summary && <p className="tl-proposal-card__summary">{summary}</p>}
      <ChangeDiff rows={changes} className="tl-proposal-card__changes" />
      {children != null && (
        <div className="tl-proposal-card__extra">
          <HeadingLevel.Provider value={Math.min(6, level + 1)}>{children}</HeadingLevel.Provider>
        </div>
      )}
      <div className="tl-proposal-card__footer">
        {current === 'waiting' ? (
          <>
            {message && (
              <p className="tl-proposal-card__error" role="alert">
                <Icon name="circle-alert" className="tl-proposal-card__error-icon" />
                {message}
              </p>
            )}
            <div className="tl-proposal-card__actions">
              <Button icon="x" disabled={disabled || busy} onPress={() => setRejecting(true)}>
                {rejectLabel ?? t('proposalCard.reject')}
              </Button>
              <Button
                variant="primary"
                icon="check"
                disabled={disabled}
                loading={busy}
                onPress={() => void approve()}
              >
                {approveLabel ?? t('proposalCard.approve')}
              </Button>
            </div>
          </>
        ) : (
          <div className="tl-proposal-card__result" ref={resultRef} tabIndex={-1}>
            <p className="tl-proposal-card__note">
              <Icon
                name={current === 'approved' ? 'circle-check' : 'circle-x'}
                className="tl-proposal-card__note-icon"
              />
              <span className="tl-proposal-card__note-text">
                {current === 'approved'
                  ? t('proposalCard.approvedNote')
                  : t('proposalCard.rejectedNote')}
              </span>
              {resolvedBy && <span className="tl-proposal-card__by">{resolvedBy}</span>}
            </p>
            {current === 'rejected' && shownReason && (
              <p className="tl-proposal-card__reason">
                <span className="tl-proposal-card__reason-label">{t('proposalCard.reason')}</span>
                <span>{shownReason}</span>
              </p>
            )}
          </div>
        )}
      </div>
      <ReasonDialog
        open={rejecting}
        onOpenChange={setRejecting}
        tone="danger"
        title={t('proposalCard.rejectTitle')}
        description={title}
        label={t('proposalCard.reason')}
        confirmLabel={rejectLabel ?? t('proposalCard.reject')}
        minLength={reasonMinLength}
        onConfirm={reject}
      />
    </article>
  );
}
ProposalCard.displayName = ProposalCardContract.name;
