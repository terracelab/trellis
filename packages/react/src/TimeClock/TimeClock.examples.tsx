import { TimeClock } from './TimeClock.js';

const GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, calc(var(--tl-space-64) * 4.5)), 1fr))',
  gap: 'var(--tl-space-16)',
};

/** 근무 중 — 지금 시각이 크게, 출근이 늦으면 지각 표시, 소정 근무까지 남은 시간 */
export function Working() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <TimeClock
        status="working"
        now="2026-11-06T14:32"
        clockIn="09:04"
        place="office"
        workType="고정 근무"
        onClockOut={() => {}}
        onBreakStart={() => {}}
      />
    </div>
  );
}

/** 상태 — 근무 전에는 출근하기, 휴게 중에는 휴게 끝, 퇴근 뒤에는 단추 없이 연장 시간 */
export function States() {
  return (
    <div style={GRID}>
      <TimeClock status="before" now="2026-11-06T08:47" place="office" onClockIn={() => {}} />
      <TimeClock
        status="break"
        now="2026-11-06T12:20"
        clockIn="08:55"
        place="field"
        onBreakEnd={() => {}}
      />
      <TimeClock
        status="done"
        now="2026-11-06T19:12"
        clockIn="08:52"
        clockOut="19:05"
        place="remote"
        workType="시차 출퇴근"
        schedule={{ start: '08:30', end: '17:30', breakMinutes: 60 }}
      />
    </div>
  );
}
