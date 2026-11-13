import {
  AgentReplayContract,
  type AgentReplayProps,
  type AgentReplayRect,
} from '@terracelab/trellis-contracts';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { chartColor } from '../_internal/chart/colors.js';
import { cx } from '../_internal/cx.js';
import { useMessages } from '../_internal/locale.js';
import { Button } from '../Button/Button.js';
import { Icon } from '../Icon/Icon.js';

export type AgentReplayWebProps = AgentReplayProps & {
  className?: string;
  /** 그릴 자리. 기본 document.body(포털). null이면 제자리에 그린다(문서 예시 · 액자) */
  container?: HTMLElement | null;
};

const at = (x: number, y: number): CSSProperties =>
  ({
    ['--tl-agent-replay-x' as string]: `${Math.round(x)}px`,
    ['--tl-agent-replay-y' as string]: `${Math.round(y)}px`,
  }) as CSSProperties;

const box = (r: AgentReplayRect): CSSProperties =>
  ({
    ...at(r.x, r.y),
    ['--tl-agent-replay-w' as string]: `${Math.round(r.width)}px`,
    ['--tl-agent-replay-h' as string]: `${Math.round(r.height)}px`,
  }) as CSSProperties;

/**
 * 에이전트가 화면을 옮기며 칸을 채우는 모습을 보여 주는 맨 위 층(R-41). 클릭을 막지 않는다(띠의 단추만 누른다).
 * 커서 · 테두리 · 물결은 앱이 잰 화면 좌표(getBoundingClientRect)로 그린다. 움직임 줄이기에서는 테두리만
 */
export function AgentReplay({
  status,
  label,
  labelColor,
  caption,
  trail,
  index,
  total,
  remaining,
  pointer,
  ring,
  ripples,
  onSkip,
  onStop,
  summary,
  onOpenResult,
  id,
  testID,
  className,
  container,
}: AgentReplayWebProps) {
  const tr = useMessages();
  const running = status === 'running';
  const dot = (
    <span
      className="tl-agent-replay__dot"
      style={labelColor ? { background: chartColor(labelColor) } : undefined}
      aria-hidden
    />
  );
  const step =
    index != null && total != null ? tr('agentReplay.step', { index, total }) : undefined;
  const layer = (
    <div
      className={cx('tl-agent-replay', className)}
      id={id}
      data-testid={testID}
      data-status={status}
      data-contained={container === null || undefined}
    >
      {running && ring && <div className="tl-agent-replay__ring" style={box(ring)} aria-hidden />}
      {running &&
        ripples?.map((r) => (
          <span key={r.id} className="tl-agent-replay__ripple" style={at(r.x, r.y)} aria-hidden />
        ))}
      {running && pointer && (
        <div className="tl-agent-replay__pointer" style={at(pointer.x, pointer.y)} aria-hidden>
          <Icon name="mouse-pointer-2" size={20} className="tl-agent-replay__cursor" />
          <span className="tl-agent-replay__tag">
            {dot}
            {label}
          </span>
        </div>
      )}
      {/* 재생 중에 모달(등록 서랍 · 시트)이 열리면 Base UI가 모달 밖을 aria-hidden으로 가린다. aria-live 속성이 있는
          요소는 남기므로 띠에 aria-live="off"를 적어 둔다(값은 기본값과 같다). 없으면 띠와 단추(건너뛰기 · 멈추기 ·
          결과 보기)가 보조 기술에서 사라진다. 안의 글은 role=status가 따로 읽는다 */}
      <section
        className="tl-agent-replay__bar"
        aria-label={tr('agentReplay.region', { name: label })}
        aria-live="off"
      >
        {/* 띠의 글은 role=status라 단계가 바뀔 때마다 조용히 읽힌다. 단추는 이름 있는 단추라 밖에 둔다 */}
        <div className="tl-agent-replay__text" role="status" aria-live="polite">
          <span className="tl-agent-replay__who">
            {status === 'done' ? <Icon name="check" className="tl-agent-replay__done-icon" /> : dot}
            {label}
          </span>
          <span className="tl-agent-replay__caption">
            {status === 'stopped' && (
              <span className="tl-agent-replay__state">{tr('agentReplay.stopped')} · </span>
            )}
            {status === 'done' ? (summary ?? caption) : caption}
          </span>
          {running && trail && trail.length > 0 && (
            <span className="tl-agent-replay__trail">{trail.join(' › ')}</span>
          )}
          {running && (step || remaining) && (
            <span className="tl-agent-replay__meta">
              {[step, remaining].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
        <div className="tl-agent-replay__actions">
          {running && onSkip && (
            <Button variant="ghost" size="sm" onPress={onSkip}>
              {tr('agentReplay.skip')}
            </Button>
          )}
          {status === 'done' && onOpenResult && (
            <Button variant="primary" size="sm" onPress={onOpenResult}>
              {tr('agentReplay.openResult')}
            </Button>
          )}
          {onStop && (
            <Button variant={running ? 'secondary' : 'ghost'} size="sm" onPress={onStop}>
              {running ? tr('agentReplay.stop') : tr('agentReplay.close')}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
  if (container === null || typeof document === 'undefined') return layer;
  return createPortal(layer, container ?? document.body);
}
AgentReplay.displayName = AgentReplayContract.name;
