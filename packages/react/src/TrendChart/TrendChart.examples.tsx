import { formatAmount, formatCompactWon } from '@terracelab/trellis-contracts';
import { ChartCard } from '../ChartCard/ChartCard.js';
import { TrendChart } from './TrendChart.js';

const CASH = [
  781, 787, 779, 790, 796, 792, 802, 808, 804, 813, 818, 815, 823, 827, 824, 831, 836, 832, 840,
  845, 842, 848, 845, 852, 847, 850, 846, 844, 842, 874,
];

/** 영역 — 단일 계열 + 끝값 */
export function Area() {
  const data = CASH.map((v, i) => ({ day: `D-${CASH.length - 1 - i}`, cash: v * 1_000_000 }));
  return (
    <TrendChart
      data={data}
      x="day"
      series={[{ key: 'cash', label: '시재', type: 'area' }]}
      unit="원"
      height={220}
      yFormat={formatCompactWon}
      endLabel="cash"
      ariaLabel="최근 30일 시재. 7.8억에서 8.7억으로"
    />
  );
}

/** 비교 — 이번 기간 실선 + 직전 기간 점선(compare) */
export function Compare() {
  const data = ['1주', '2주', '3주', '4주', '5주', '6주', '7주', '8주'].map((week, i) => ({
    week,
    now: 120 + i * 9 + (i % 3) * 6,
    prev: 110 + i * 6 + (i % 2) * 5,
  }));
  return (
    <TrendChart
      data={data}
      x="week"
      series={[
        { key: 'now', label: '이번 분기' },
        { key: 'prev', label: '지난 분기', dashed: true },
      ]}
      unit="건"
      height={200}
      yFormat={(v) => v.toLocaleString('ko-KR')}
      ariaLabel="주별 주문 건수. 이번 분기가 지난 분기보다 많다"
    />
  );
}

/** 목표 구간 — 음영 band + 꺾은선(linear) */
export function Band() {
  const data = CASH.slice(-14).map((v, i) => ({ day: `11/${i + 1}`, cash: v * 1_000_000 }));
  return (
    <TrendChart
      data={data}
      x="day"
      series={[{ key: 'cash', label: '시재' }]}
      unit="원"
      height={200}
      curve="linear"
      yFormat={formatCompactWon}
      band={{ from: 800_000_000, to: 850_000_000, label: '목표 범위' }}
      ariaLabel="최근 14일 시재와 운영 목표 범위"
    />
  );
}

// 주별 판매량 실적 12주 + 예측 6주. 예측 주의 lower · upper가 신뢰 구간
const DEMAND = [
  412, 436, 428, 455, 470, 462, 488, 495, 481, 507, 516, 524, 531, 538, 546, 552, 561, 568,
].map((qty, i) => {
  const ahead = i - 11;
  const spread = ahead > 0 ? 14 + ahead * 9 : 0;
  return {
    week: `${i + 1}주`,
    qty,
    lower: ahead >= 0 ? qty - spread : null,
    upper: ahead >= 0 ? qty + spread : null,
  };
});

/** 수요 예측 — 실적은 실선, 예측 시작 뒤는 점선과 신뢰 구간 음영 */
export function Forecast() {
  return (
    <ChartCard
      title="주별 판매량"
      subtitle="EA · 12주 실적과 6주 예측 · 음영은 80% 구간"
      legend={[
        { label: '실적', color: 'series-1', shape: 'line' },
        { label: '예측', color: 'series-1', shape: 'dashed' },
      ]}
      table={{
        columns: ['주', '판매량(EA)', '아래(EA)', '위(EA)'],
        rows: DEMAND.map((d) => [d.week, d.qty, d.lower ?? '', d.upper ?? '']),
      }}
    >
      <TrendChart
        data={DEMAND}
        x="week"
        series={[{ key: 'qty', label: '실적' }]}
        unit="EA"
        height={220}
        curve="linear"
        yFormat={(v) => formatAmount(v)}
        forecast={{ from: 11, lower: 'lower', upper: 'upper', bandLabel: '80% 구간' }}
        endLabel="qty"
        ariaLabel="주별 판매량. 12주 524EA에서 18주 예측 568EA, 80% 구간 500~636EA"
      />
    </ChartCard>
  );
}
