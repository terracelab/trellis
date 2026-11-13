import { formatCompactWon } from '@terracelab/trellis-contracts';
import { TrendChart } from '../TrendChart/TrendChart.js';
import { ChartCard } from './ChartCard.js';

/** 기본 — 제목 · 부제 · 범례 · 표로 보기 */
export function Basic() {
  const data = [
    { month: '05월', sales: 1450, prev: 1301 },
    { month: '06월', sales: 1396, prev: 1288 },
    { month: '07월', sales: 1468, prev: 1320 },
    { month: '08월', sales: 1392, prev: 1298 },
    { month: '09월', sales: 1524, prev: 1362 },
    { month: '10월', sales: 1588, prev: 1410 },
  ].map((d) => ({ ...d, sales: d.sales * 1_000_000, prev: d.prev * 1_000_000 }));
  return (
    <ChartCard
      title="월별 매출"
      subtitle="원 · 최근 6개월 · 점선은 전년 같은 달"
      legend={[
        { label: '매출', color: 'series-1' },
        { label: '전년', color: 'compare', shape: 'dashed' },
      ]}
      height={220}
      table={{
        columns: ['월', '매출(원)', '전년(원)'],
        rows: data.map((d) => [d.month, d.sales, d.prev]),
      }}
    >
      <TrendChart
        data={data}
        x="month"
        series={[
          { key: 'sales', label: '매출', type: 'area' },
          { key: 'prev', label: '전년', dashed: true },
        ]}
        unit="원"
        height={220}
        yFormat={formatCompactWon}
        ariaLabel="최근 6개월 매출. 10월 15.9억, 전년 대비 12.6% 증가"
      />
    </ChartCard>
  );
}

/** 상태 — 불러오는 중 · 오류 · 빈 상태. 높이를 지켜 레이아웃이 뛰지 않는다 */
export function States() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <ChartCard title="불러오는 중" subtitle="스켈레톤" height={120} loading />
      <ChartCard
        title="오류"
        subtitle="메시지 + 다시 시도"
        height={120}
        error="매출 집계를 불러오지 못했습니다"
        onRetry={() => undefined}
      />
      <ChartCard
        title="빈 상태"
        subtitle="다음 행동 한 줄"
        height={120}
        empty="기간에 판매가 없습니다. 기간을 넓혀 보세요"
      />
    </div>
  );
}
