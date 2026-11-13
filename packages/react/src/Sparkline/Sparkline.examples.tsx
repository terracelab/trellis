import { Sparkline } from './Sparkline.js';

/** 숫자 카드 안 — 축·값 없이 모양만 */
export function InStat() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--tl-space-16)',
        color: 'var(--tl-color-fg-primary)',
      }}
    >
      <strong style={{ fontSize: 'var(--tl-type-amount-lg-font-size)' }}>14.4%</strong>
      <Sparkline
        data={[12.4, 13.1, 11.2, 10.9, 12.8, 13.0, 13.6, 14.4]}
        width={140}
        height={28}
        ariaLabel="영업이익률 최근 8개월 12.4%에서 14.4%로"
      />
    </div>
  );
}
