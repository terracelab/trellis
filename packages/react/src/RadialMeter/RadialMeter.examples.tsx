import { RadialMeter } from './RadialMeter.js';

/** 크기와 톤 — 링은 카드에 하나만 크게 */
export function Tones() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--tl-space-24)' }}>
      <RadialMeter value={87.2} label="월 매출 목표" caption="목표 18.2억" digits={1} />
      <RadialMeter value={100} label="발주 소진" tone="success" size="sm" />
      <RadialMeter value={92} label="예산 집행" tone="warning" size="sm" />
      <RadialMeter value={104} label="카드 한도" tone="danger" size="sm" />
    </div>
  );
}
