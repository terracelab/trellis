import { DueBadge } from './DueBadge.js';

const TODAY = '2026-11-08';

/** 남은 날 — 지남은 위험 · 3일 안은 주의 · 그 뒤는 중립 */
export function Ranges() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)', flexWrap: 'wrap' }}>
      <DueBadge due="2026-11-05" today={TODAY} />
      <DueBadge due="2026-11-08" today={TODAY} />
      <DueBadge due="2026-11-10" today={TODAY} />
      <DueBadge due="2026-11-25" today={TODAY} />
    </div>
  );
}

/** 처리 완료 — 끝난 항목은 기한 대신 완료 라벨 */
export function Done() {
  return (
    <div style={{ display: 'flex', gap: 'var(--tl-space-8)' }}>
      <DueBadge due="2026-11-05" today={TODAY} done />
      <DueBadge due="2026-11-12" today={TODAY} done doneLabel="입고 완료" size="sm" />
    </div>
  );
}
