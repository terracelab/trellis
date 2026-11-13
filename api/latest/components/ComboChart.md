# ComboChart

> `@terracelab/trellis-react/charts` · CSS `.tl-combo-chart` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { ComboChart } from '@terracelab/trellis-react/charts';
```

## 용도

양(막대)과 흐름·비교(선)를 한 축에. 쌓은 막대(stacked)는 구성 추이(채널별 · 분류별 매출)를 3계열 이상으로 보여 준다. 단위가 다른 보조 지표(마진율)는 `lower`의 작은 차트로 — 이중 축의 대체. 막대만 필요하면 BarList, 선만이면 TrendChart.

## 해부(Anatomy)

root · grid · axes · bars(나란히 1~2개 · stacked 3개 이상, `series-n`, 6개부터 다섯 뒤는 "기타" `compare`, 끝 radius `radius.sm`, 사이 2px 간격, stacked면 세그먼트 사이 `bg.surface` 2px) · lines(비교 점선 `compare`, 목표 실선) · tooltip · lower(같은 x축, 높이 84, 계열 1~2).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `data` | `T[]` |  | 필수 | 행 배열 |
| `x` | `keyof T` |  | 필수 | x축 필드 |
| `bars` | `SeriesDef[]` |  | 필수 | 막대 계열. 나란히 1~2개, stacked는 3개 이상도. 6개부터 다섯 뒤는 "기타"로 접는다 |
| `lines` | `SeriesDef[]` | `[]` |  | 선 계열(비교 점선·목표) |
| `stacked` | `boolean` | `false` |  | 막대를 쌓는다(구성 추이). 툴팁에 합계 줄 |
| `unit` | `string` |  |  | 단위(원·건·%). 부제·툴팁·표 머리글에 쓰고 값 글자에는 붙이지 않는다 |
| `height` | `number` | `240` |  | 차트 높이(SVG 사용자 단위). 카드가 높이를 고정해 로딩 때 레이아웃이 뛰지 않게 한다 |
| `xFormat` | `(v) => string` |  |  | x 라벨 서식 |
| `yFormat` | `(v: number) => string` |  |  | y 라벨 서식 |
| `lower` | `ComboChartLower` |  |  | 아래 보조 차트(다른 단위). 이중 축의 대체 |
| `ariaLabel` | `string` |  | 필수 | 차트를 한 문장으로(무엇을, 어느 기간, 어디서 어디로). role="img"의 이름 |

## Variants

stacked × lower 유무.

## States

지원 상태: `default` · `hover`

default · hover(툴팁은 위·아래 차트를 함께). 나머지 해당 없음.

## 동작

위·아래 차트는 x를 공유하고 hover가 동기화된다. 나란히 막대가 3개 이상이면 개발 모드 경고(stacked는 경고 없음). stacked면 첫 계열이 바닥이고 맨 위 조각만 끝이 둥글다. 조각 사이는 `bg.surface` 2px 간격이고 툴팁 마지막 줄에 합계가 붙는다.

두 차트는 x에 같은 칸 눈금을 쓴다. 아래 차트가 선뿐이어도 점은 위 막대의 가운데에 선다. `yFormat`(위 · 아래)은 축 눈금에만 쓰고, 툴팁 값은 숫자(소수는 한 자리까지) 뒤에 `unit`을 한 번 붙인다. 눈금 서식에 단위를 넣어도 툴팁에 단위가 두 번 찍히지 않는다.

계열이 6개 이상이면 `foldSeries`(contracts)로 앞 5개를 남기고 나머지를 행마다 더해 "기타" 한 계열(`compare` 회색)로 접는다. 색 슬롯을 새로 만들지 않는다. 어떤 계열을 앞에 둘지(큰 순서)는 호출자가 정하고 색은 항목에 고정한다. 범례에도 "기타"를 두고 표 대체에는 접힌 계열까지 모두 보인다. 회색 "기타"는 다섯째(amber) 옆에 놓여 색각 시뮬레이션 ΔE 15.4 이상을 지킨다(넷째 teal 옆이면 3.0으로 구별되지 않는다).

## 접근성

[차트 고르기](../guides/charts.md). lower의 단위는 부제에 적는다.

## 밀도

390에서는 lower를 숨기고 표로 대체.

## 플랫폼 차이

네이티브: lower 미지원(개발 경고), 표로.

## 금지 사항

이중 y축 → 리뷰. 나란히 막대 ≥ 3 → 경고. 계열 색을 더 만들기(6번째 색) → 리뷰, "기타"로 접는다.

## 예시

### 막대 + 전년 점선

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { ComboChart } from '@terracelab/trellis-react/charts';

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

function Basic() {
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
```

### 아래 차트

단위가 다른 마진율은 이중 축 대신 lower로

```tsx
import { formatCompactWon, formatPercent } from '@terracelab/trellis-contracts';
import { ComboChart } from '@terracelab/trellis-react/charts';

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

function Lower() {
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
```

### 채널별 쌓기

판매 채널 3개의 월별 매출을 쌓는다. 툴팁 마지막 줄이 합계

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { ChartCard, ComboChart } from '@terracelab/trellis-react/charts';

const CHANNELS = [
  ['07월', 612, 388, 214],
  ['08월', 584, 402, 236],
  ['09월', 640, 421, 262],
  ['10월', 668, 455, 289],
  ['11월', 702, 470, 318],
] as const;

function Stacked() {
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
```

### 기타로 접기

분류가 7개면 앞 5개는 자기 색, 나머지는 회색 "기타" 한 조각. 표로 보기에는 7개 모두

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { ChartCard, ComboChart } from '@terracelab/trellis-react/charts';

const CATEGORY_KEYS = ['grain', 'meat', 'veg', 'sauce', 'frozen', 'dairy', 'etc'] as const;

const CATEGORY_LABELS = ['곡류', '육류', '채소', '소스', '냉동', '유제품', '잡화'] as const;

const CATEGORY_ROWS = [
  ['09월', 210, 182, 140, 96, 74, 31, 18],
  ['10월', 224, 190, 151, 102, 80, 28, 22],
  ['11월', 236, 201, 148, 110, 86, 34, 25],
] as const;

function Other() {
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
```
