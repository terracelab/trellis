import { WorkHoursMeter } from './WorkHoursMeter.js';

// 근태 기록: 하루 8시간을 넘은 몫은 overtimeMinutes(합계 45시간)
const WEEK = [
  { date: '2026-11-02', regularMinutes: 480, overtimeMinutes: 60 },
  { date: '2026-11-03', regularMinutes: 480, overtimeMinutes: 90 },
  { date: '2026-11-04', regularMinutes: 480 },
  { date: '2026-11-05', regularMinutes: 480, overtimeMinutes: 120 },
  { date: '2026-11-06', regularMinutes: 480, overtimeMinutes: 30 },
  { date: '2026-11-07', regularMinutes: 0, holiday: true },
  { date: '2026-11-08', regularMinutes: 0, holiday: true },
] as const;

const WEEK_WITH_LEAVE = [
  { date: '2026-11-02', regularMinutes: 480, overtimeMinutes: 60 },
  { date: '2026-11-03', regularMinutes: 480 },
  { date: '2026-11-04', regularMinutes: 0, leave: 'annual' },
  { date: '2026-11-05', regularMinutes: 480, overtimeMinutes: 120 },
  { date: '2026-11-06', regularMinutes: 330 },
  { date: '2026-11-07', regularMinutes: 0, holiday: true },
  { date: '2026-11-08', regularMinutes: 0, holiday: true },
] as const;

/** 이번 주(주 기준) — 주 누계 40시간까지 정규, 넘은 날부터 연장 색. 요약 · 범례 · 요일 막대가 같은 기준이다 */
export function Week() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <WorkHoursMeter
        days={WEEK}
        today="2026-11-06"
        period={{ from: '2026-11-02', to: '2026-11-08' }}
      />
    </div>
  );
}

/** 하루 기준 — 날마다 8시간을 넘은 기록이 연장이다. 주 합계가 40시간 아래여도 연장이 생긴다 */
export function DailyBasis() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 7)' }}>
      <WorkHoursMeter
        overtimeBasis="day"
        days={WEEK_WITH_LEAVE}
        today="2026-11-06"
        period={{ from: '2026-11-02', to: '2026-11-08' }}
      />
    </div>
  );
}

/** 한도 — 48시간부터 경고 아이콘, 52시간을 넘으면 넘은 시간을 말한다 */
export function Limits() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 4.5)), 1fr))',
        gap: 'var(--tl-space-16)',
      }}
    >
      <WorkHoursMeter title="김지훈 · 이번 주" totalMinutes={38 * 60} />
      <WorkHoursMeter title="이수민 · 이번 주" totalMinutes={49 * 60 + 20} />
      <WorkHoursMeter title="박서연 · 이번 주" totalMinutes={53 * 60 + 30} />
    </div>
  );
}
