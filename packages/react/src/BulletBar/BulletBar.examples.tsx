import { BulletBar } from './BulletBar.js';

const LIST = {
  display: 'grid',
  gap: 'var(--tl-space-12)',
  maxWidth: 'calc(var(--tl-space-64) * 7)',
} as const;

/** 목록 — 기본 · 달성 · 주의 · 초과(up-bad). 값이 이미 목표 100 대비 %라 오른쪽 비율은 끈다 */
export function List() {
  return (
    <div style={LIST}>
      <BulletBar
        label="대호상사 소모품"
        value={61}
        target={100}
        unit="%"
        caption="11/21 마감"
        showRatio={false}
      />
      <BulletBar
        label="한결물산 포장재"
        value={100}
        target={100}
        unit="%"
        caption="11/07 완료"
        showRatio={false}
      />
      <BulletBar
        label="누리식품 식자재"
        value={92}
        target={100}
        unit="%"
        caption="11/14 마감"
        showRatio={false}
      />
      <BulletBar
        label="법인카드 한도"
        value={104}
        target={100}
        unit="%"
        caption="경영지원팀"
        polarity="up-bad"
        showRatio={false}
      />
    </div>
  );
}

/** 예산 집행 — 금액 대 금액이면 오른쪽에 비율(값 ÷ 목표)이 붙는다 */
export function Budget() {
  return (
    <div style={LIST}>
      <BulletBar label="포장재" value={3_050_000} target={5_000_000} unit="원" />
      <BulletBar label="식자재" value={11_040_000} target={12_000_000} unit="원" />
      <BulletBar
        label="법인카드"
        value={5_200_000}
        target={5_000_000}
        unit="원"
        polarity="up-bad"
      />
    </div>
  );
}

/** 평균과 견주기 — 목표가 아니라 기준이면 targetLabel을 주고 상태 칩 · 비율은 끈다 */
export function Average() {
  return (
    <div style={LIST}>
      <BulletBar
        label="강남점 반품률"
        value={16.5}
        target={9.1}
        unit="%"
        format={(v) => v.toFixed(1)}
        targetLabel="평균"
        showState={false}
        showRatio={false}
      />
      <BulletBar
        label="판교점 반품률"
        value={7.2}
        target={9.1}
        unit="%"
        format={(v) => v.toFixed(1)}
        targetLabel="평균"
        showState={false}
        showRatio={false}
      />
    </div>
  );
}
