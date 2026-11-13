import {
  AGENT_RUN_STATES,
  formatAmount,
  runStepsState,
  RunStepsContract,
  type RunStep,
  type RunStepsProps,
} from '@terracelab/trellis-contracts';
import { useId, useState, type ReactNode } from 'react';
import { cx } from '../_internal/cx.js';
import { useMessages, type Translate } from '../_internal/locale.js';
import { Icon } from '../Icon/Icon.js';
import { StatusDot } from '../StatusDot/StatusDot.js';

export type RunStepWeb = Omit<RunStep, 'detail'> & {
  /** 펼친 상세(도구 입력 · 결과 요약 · 오류) */
  detail?: ReactNode;
};

export type RunStepsWebProps = Omit<RunStepsProps, 'steps'> & {
  steps: readonly RunStepWeb[];
  className?: string;
};

/** 걸린 시간: 10초 안은 소수 한 자리(1.2초), 1분 안은 정수(12초), 그 뒤는 분 · 초(2분 5초) */
export function formatRunDuration(ms: number, t: Translate): string {
  if (!Number.isFinite(ms) || ms < 0) return '–';
  const s = ms / 1000;
  if (s < 59.5)
    return t('runSteps.seconds', { value: formatAmount(s, { digits: s < 10 ? 1 : 0 }) });
  const minutes = Math.floor(Math.round(s) / 60);
  return t('runSteps.minutes', {
    minutes: formatAmount(minutes),
    seconds: Math.round(s) - minutes * 60,
  });
}

/** 처음 펼칠 단계: 사람이 봐야 하는 실패 · 확인 대기 중 상세가 있는 것 */
const needsEye = (s: RunStepWeb) =>
  (s.state === 'failed' || s.state === 'waiting') && s.detail != null;

/** 목록 안 어느 줄이라도 걸린 시간 · 펼침이 있으면 모든 줄이 그 칸을 비워 둔다(상태 글자 열이 맞는다) */
interface Columns {
  timed: boolean;
  expandable: boolean;
}

function Step({
  step,
  open,
  onToggle,
  detailId,
  columns,
  t,
}: {
  step: RunStepWeb;
  open: boolean;
  onToggle: () => void;
  detailId: string;
  columns: Columns;
  t: Translate;
}) {
  const hasDetail = step.detail != null;
  const body = (
    <>
      <StatusDot
        className="tl-run-steps__dot"
        tone={AGENT_RUN_STATES[step.state].tone}
        pulse={step.state === 'running'}
      />
      <span className="tl-run-steps__text">
        <span className="tl-run-steps__name">{step.name}</span>
        {step.description && <span className="tl-run-steps__description">{step.description}</span>}
      </span>
      <span className="tl-run-steps__state">{t(`agentRun.${step.state}`)}</span>
      {columns.timed && (
        <span className="tl-run-steps__duration">
          {step.durationMs != null ? formatRunDuration(step.durationMs, t) : ''}
        </span>
      )}
      {hasDetail ? (
        <Icon name={open ? 'chevron-up' : 'chevron-down'} className="tl-run-steps__chevron" />
      ) : (
        columns.expandable && <span className="tl-run-steps__chevron" aria-hidden />
      )}
    </>
  );
  return (
    <li className="tl-run-steps__step" data-run-state={step.state}>
      {hasDetail ? (
        <button
          type="button"
          className="tl-run-steps__row tl-focusable"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={onToggle}
        >
          {body}
        </button>
      ) : (
        <div className="tl-run-steps__row">{body}</div>
      )}
      {hasDetail && (
        <div className="tl-run-steps__detail" id={detailId} hidden={!open}>
          {step.detail}
        </div>
      )}
    </li>
  );
}

export function RunSteps({
  steps,
  label,
  defaultExpanded,
  collapsible = false,
  defaultOpen,
  id,
  testID,
  className,
}: RunStepsWebProps) {
  const t = useMessages();
  const base = useId();
  const overall = runStepsState(steps);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(defaultExpanded ?? steps.filter(needsEye).map((s) => s.id)),
  );
  const [open, setOpen] = useState(
    () => defaultOpen ?? (overall === 'running' || overall === 'waiting' || overall === 'failed'),
  );
  const name = label ?? t('runSteps.label');
  const listId = `${base}-list`;
  const timed = steps.some((s) => s.durationMs != null);
  // 요약 줄(펼침 아이콘)과도 열이 맞게 collapsible이면 펼침 칸을 비워 둔다
  const columns: Columns = {
    timed,
    expandable: collapsible || steps.some((s) => s.detail != null),
  };
  const total = steps.reduce((sum, s) => sum + (s.durationMs ?? 0), 0);
  const toggle = (stepId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });

  return (
    <div
      className={cx('tl-run-steps', className)}
      id={id}
      data-testid={testID}
      data-run-state={overall}
      data-collapsible={collapsible || undefined}
    >
      {collapsible && (
        <button
          type="button"
          className="tl-run-steps__summary tl-focusable"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
        >
          <StatusDot
            className="tl-run-steps__dot"
            tone={AGENT_RUN_STATES[overall].tone}
            pulse={overall === 'running'}
          />
          <span className="tl-run-steps__text">
            <span className="tl-run-steps__name">
              {name} {t('runSteps.count', { count: steps.length })}
            </span>
          </span>
          <span className="tl-run-steps__state">{t(`agentRun.${overall}`)}</span>
          {timed && <span className="tl-run-steps__duration">{formatRunDuration(total, t)}</span>}
          <Icon name={open ? 'chevron-up' : 'chevron-down'} className="tl-run-steps__chevron" />
        </button>
      )}
      <ol
        className="tl-run-steps__list"
        id={listId}
        aria-label={name}
        hidden={collapsible && !open}
      >
        {steps.map((step) => (
          <Step
            key={step.id}
            step={step}
            open={expanded.has(step.id)}
            onToggle={() => toggle(step.id)}
            detailId={`${base}-${step.id}`}
            columns={columns}
            t={t}
          />
        ))}
      </ol>
    </div>
  );
}
RunSteps.displayName = RunStepsContract.name;
