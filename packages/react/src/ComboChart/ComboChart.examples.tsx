import { formatCompactWon, formatPercent } from '@terracelab/trellis-contracts';
import { ChartCard } from '../ChartCard/ChartCard.js';
import { ComboChart } from './ComboChart.js';

const MONTHS = [
  ['11월', 1284, 1152, 12.4],
  ['12월', 1412, 1236, 13.1],
  ['01월', 1098, 1010, 11.2],
  ['02월', 1056, 988, 10.9],
  ['03월', 1322, 1190, 12.8],
  ['04월', 1378, 1244, 13.0],
  ['05월', 1450, 1301, 13.6],
  ['06월', 1396, 1288, 12.9],
  ['07월', 1468, 1320, 13.3],
  ['08월', 1392, 1298, 12.5],
  ['09월', 1524, 1362, 14.1],
  ['10월', 1588, 1410, 14.4],
] as const;

/** 막대 + 전년 점선 */
export function Basic() {
  const data = MONTHS.map(([month, sales, prev]) => ({
    month,
    sales: sales * 1_000_000,
    prev: prev * 1_000_000,
  }));
  return (
    <ComboChart
      data={data}
      x="month"
      bars={[{ key: 'sales', label: '매출' }]}
      lines={[{ key: 'prev', label: '전년', dashed: true }]}
      unit="원"
      height={220}
      yFormat={formatCompactWon}
      ariaLabel="최근 12개월 월별 매출과 전년 같은 달"
    />
  );
}

/** 아래 차트 — 단위가 다른 마진율은 이중 축 대신 lower로 */
export function Lower() {
  const data = MONTHS.map(([month, sales, , margin]) => ({
    month,
    sales: sales * 1_000_000,
    margin,
  }));
  return (
    <ComboChart
      data={data}
      x="month"
      bars={[{ key: 'sales', label: '매출' }]}
      unit="원"
      height={200}
      yFormat={formatCompactWon}
      lower={{
        series: [{ key: 'margin', label: '마진율', color: 'series-3' }],
        unit: '%',
        height: 84,
        yFormat: (v) => formatPercent(v),
      }}
      ariaLabel="월별 매출과 아래 마진율. 10월 매출 15.9억, 마진율 14.4%"
    />
  );
}

// 채널별 매출(백만 원). 색은 채널에 고정한다
const CHANNELS = [
  ['07월', 612, 388, 214],
  ['08월', 584, 402, 236],
  ['09월', 640, 421, 262],
  ['10월', 668, 455, 289],
  ['11월', 702, 470, 318],
] as const;

/** 채널별 쌓기 — 판매 채널 3개의 월별 매출을 쌓는다. 툴팁 마지막 줄이 합계 */
export function Stacked() {
  const data = CHANNELS.map(([month, direct, agency, online]) => ({
    month,
    direct: direct * 1_000_000,
    agency: agency * 1_000_000,
    online: online * 1_000_000,
  }));
  return (
    <ChartCard
      title="채널별 매출"
      subtitle="원 · 최근 5개월"
      legend={[
        { label: '직거래', color: 'series-1' },
        { label: '대리점', color: 'series-2' },
        { label: '온라인', color: 'series-3' },
      ]}
      table={{
        columns: ['월', '직거래(원)', '대리점(원)', '온라인(원)'],
        rows: data.map((d) => [d.month, d.direct, d.agency, d.online]),
      }}
    >
      <ComboChart
        data={data}
        x="month"
        bars={[
          { key: 'direct', label: '직거래', color: 'series-1' },
          { key: 'agency', label: '대리점', color: 'series-2' },
          { key: 'online', label: '온라인', color: 'series-3' },
        ]}
        stacked
        unit="원"
        height={220}
        yFormat={formatCompactWon}
        ariaLabel="최근 5개월 채널별 매출. 11월 합계 14.9억, 온라인이 2.1억에서 3.2억으로"
      />
    </ChartCard>
  );
}

// 분류 7개의 월 매출(백만 원). 앞 다섯은 매출이 큰 순서
const CATEGORY_KEYS = ['grain', 'meat', 'veg', 'sauce', 'frozen', 'dairy', 'etc'] as const;
const CATEGORY_LABELS = ['곡류', '육류', '채소', '소스', '냉동', '유제품', '잡화'] as const;
const CATEGORY_ROWS = [
  ['09월', 210, 182, 140, 96, 74, 31, 18],
  ['10월', 224, 190, 151, 102, 80, 28, 22],
  ['11월', 236, 201, 148, 110, 86, 34, 25],
] as const;

/** 기타로 접기 — 분류가 7개면 앞 5개는 자기 색, 나머지는 회색 "기타" 한 조각. 표로 보기에는 7개 모두 */
export function Other() {
  const data = CATEGORY_ROWS.map(([month, ...values]) => ({
    month,
    ...Object.fromEntries(CATEGORY_KEYS.map((k, i) => [k, values[i]! * 1_000_000])),
  }));
  return (
    <ChartCard
      title="분류별 매출"
      subtitle="원 · 6번째부터는 기타"
      legend={[
        ...CATEGORY_LABELS.slice(0, 5).map((label, i) => ({
          label,
          color: (['series-1', 'series-2', 'series-3', 'series-4', 'series-5'] as const)[i]!,
        })),
        { label: '기타', color: 'compare' },
      ]}
      table={{
        columns: ['월', ...CATEGORY_LABELS.map((l) => `${l}(원)`)],
        rows: CATEGORY_ROWS.map(([month, ...values]) => [
          month,
          ...values.map((v) => v * 1_000_000),
        ]),
      }}
    >
      <ComboChart
        data={data}
        x="month"
        bars={CATEGORY_KEYS.map((key, i) => ({ key, label: CATEGORY_LABELS[i]! }))}
        stacked
        unit="원"
        height={220}
        yFormat={formatCompactWon}
        ariaLabel="최근 3개월 분류별 매출. 곡류가 가장 크고 유제품 · 잡화는 기타로 묶었다"
      />
    </ChartCard>
  );
}
