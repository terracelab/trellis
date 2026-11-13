import { formatCompactWon } from '@terracelab/trellis-contracts';
import { WaterfallChart } from './WaterfallChart.js';

/** 예산 집행 — 감소 파랑(지출) · 증가 빨강(수입), 기준선 */
export function Budget() {
  return (
    <WaterfallChart
      steps={[
        { label: '예산', value: 420_000_000, kind: 'start' },
        { label: '인건비', value: -186_000_000, kind: 'delta', caption: '44%' },
        { label: '재료비', value: -124_500_000, kind: 'delta', caption: '30%' },
        { label: '경비', value: -38_200_000, kind: 'delta', caption: '9%' },
        { label: '추가', value: 25_000_000, kind: 'delta', caption: '편성' },
        { label: '잔액', value: 96_300_000, kind: 'total' },
      ]}
      unit="원"
      height={240}
      format={formatCompactWon}
      reference={{ value: 100_000_000, label: '최소 잔액' }}
      ariaLabel="11월 예산 4.2억에서 집행 후 잔액 9,630만"
    />
  );
}

/** 가격 구성 — 증감 색 없이(neutral) */
export function Price() {
  return (
    <WaterfallChart
      steps={[
        { label: '기본가', value: 12_000, kind: 'start' },
        { label: '수량 할인', value: -1_200, kind: 'delta' },
        { label: '배송비', value: 800, kind: 'delta' },
        { label: '견적가', value: 11_600, kind: 'total' },
      ]}
      unit="원"
      height={200}
      polarity="neutral"
      ariaLabel="기본가 12,000원에서 견적가 11,600원까지의 구성"
    />
  );
}
