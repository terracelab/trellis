import { Button } from '../Button/Button.js';
import { LeaveBalance } from './LeaveBalance.js';

const TYPES = [
  { kind: 'annual', granted: 15, used: 2.5 },
  { kind: 'compensatory', granted: 2, used: 0.5 },
  { kind: 'family', used: 3 },
  { kind: 'other', label: '리프레시 휴가', granted: 5, used: 0 },
] as const;

/** 회계연도 기준 — 남은 연차가 크게, 결재가 끝난 예정 휴가는 미리 뺀다. 사용 촉진은 틴트 없이 한 줄 */
export function Annual() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <LeaveBalance
        granted={15}
        used={2.5}
        planned={1}
        basis="fiscal"
        period={{ from: '2026-01-01', to: '2026-12-31' }}
        expiresOn="2026-12-31"
        types={TYPES}
        promotion={{ stage: 2, dueOn: '2026-11-13' }}
        action={
          <Button size="sm" icon="calendar-plus">
            휴가 신청
          </Button>
        }
      />
    </div>
  );
}

/** 입사 1년 미만 — 매월 1일씩 생기고, 생긴 것보다 많이 쓰면 앞당겨 쓴 연차로 표시 */
export function FirstYear() {
  return (
    <div style={{ maxWidth: 'calc(var(--tl-space-64) * 6)' }}>
      <LeaveBalance
        title="연차 현황 · 입사 4개월"
        granted={4}
        used={5}
        basis="hire"
        period={{ from: '2026-07-01', to: '2027-06-30' }}
      />
    </div>
  );
}
