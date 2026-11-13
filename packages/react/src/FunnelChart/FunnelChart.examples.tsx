import { formatCompactWon, funnelSteps } from '@terracelab/trellis-contracts';
import { ChartCard } from '../ChartCard/ChartCard.js';
import { FunnelChart } from './FunnelChart.js';

const PIPELINE = [
  { label: '문의', value: 480 },
  { label: '견적', value: 212 },
  { label: '협상', value: 96 },
  { label: '계약', value: 30 },
];

/** 영업 단계 — 단계마다 도달한 건수와 앞 단계 대비 전환율. 표로 보기에 같은 숫자가 있다 */
export function Pipeline() {
  const steps = funnelSteps(PIPELINE);
  return (
    <ChartCard
      title="영업 단계"
      subtitle="건 · 4분기 누계"
      table={{
        columns: ['단계', '건수(건)', '전 단계 대비(%)', '누적 전환율(%)'],
        rows: steps.map((s) => [s.label, s.value, s.rate ?? '–', s.overall ?? '–']),
      }}
    >
      <FunnelChart
        data={PIPELINE}
        unit="건"
        ariaLabel="4분기 영업 단계. 문의 480건에서 계약 30건, 전환율 6.3%"
      />
    </ChartCard>
  );
}

/** 두 비율 — 앞 단계 대비와 첫 단계 대비 누적 전환율을 나란히 */
export function Both() {
  return (
    <FunnelChart
      data={[
        { label: '방문', value: 12_840 },
        { label: '상품 조회', value: 6_210 },
        { label: '장바구니', value: 1_486 },
        { label: '주문', value: 512 },
        { label: '결제 완료', value: 468 },
      ]}
      unit="명"
      conversion="both"
      ariaLabel="11월 주문 단계. 방문 12,840명에서 결제 완료 468명, 전환율 3.6%"
    />
  );
}

/** 금액 — 원 단위 금액 깔때기, 요약 줄 없이 */
export function Amount() {
  return (
    <FunnelChart
      data={[
        { label: '견적', value: 1_284_000_000 },
        { label: '수주', value: 812_000_000 },
        { label: '출고', value: 768_000_000 },
        { label: '수금', value: 524_000_000 },
      ]}
      unit="원"
      format={formatCompactWon}
      summary={false}
      ariaLabel="이번 달 견적 금액 12.8억에서 수금 5.2억"
    />
  );
}
