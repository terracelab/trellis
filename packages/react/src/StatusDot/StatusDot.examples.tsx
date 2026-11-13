import { JOB_STATES, MACHINE_STATES } from '@terracelab/trellis-contracts';
import { StatusDot } from './StatusDot.js';

/** 배치 작업 — 어휘의 tone을 넘기고 실행 중에만 맥박 */
export function JobStates() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-16)', flexWrap: 'wrap' }}>
      {Object.entries(JOB_STATES).map(([key, s]) => (
        <StatusDot key={key} tone={s.tone} pulse={key === 'running'}>
          {s.label}
        </StatusDot>
      ))}
    </div>
  );
}

/** 설비 현황 — 표 칸에는 sm */
export function Machines() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-4)' }}>
      <StatusDot size="sm" tone={MACHINE_STATES.running.tone} pulse>
        포장 2라인 {MACHINE_STATES.running.label}
      </StatusDot>
      <StatusDot size="sm" tone={MACHINE_STATES.down.tone}>
        냉동 창고 컴프레서 {MACHINE_STATES.down.label}
      </StatusDot>
      <StatusDot size="sm" tone={MACHINE_STATES.maintenance.tone}>
        지게차 3호 {MACHINE_STATES.maintenance.label}
      </StatusDot>
    </div>
  );
}
