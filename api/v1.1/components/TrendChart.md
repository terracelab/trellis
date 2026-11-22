# TrendChart

> `@terracelab/trellis-react/charts` · CSS `.tl-trend-chart` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { TrendChart } from '@terracelab/trellis-react/charts';
```

## 용도

시간에 따른 변화(선·영역). 단일 계열은 영역, 비교(직전 기간)는 점선. forecast를 주면 실적 뒤에 예측 점선과 신뢰 구간 음영이 이어진다(수요 예측 · 발주 추천). 양(막대)과 흐름을 같이 보여야 하면 ComboChart, 범주 비교는 BarList.

## 해부(Anatomy)

root(`role="img"`) · grid(가로선 `chart.grid`) · x axis / y axis(`chart.axis`, `type.caption`) · band(`chart.track` 음영 + 라벨) · series(line 2px `series-n`, area는 같은 색 opacity 0.12→0 그라데이션, compare는 점선 `compare`) · dots(끝점 r 4, `bg.surface` 테두리 2) · end label(`fg.primary` tabular) · forecast(예측 선: 같은 계열 색 2px 점선 4 4, 신뢰 구간: 같은 색 opacity 0.14 면, 시작 세로선 `border.strong` 점선 + 라벨 "예측" `chart.axis`) · tooltip(`bg.elevated` · `shadow.md` · `radius.md`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `data` | `T[]` |  | 필수 | 행 배열 |
| `x` | `keyof T` |  | 필수 | x축 필드 |
| `series` | `SeriesDef[]` |  | 필수 | 계열(선·영역). 비교는 dashed + compare |
| `unit` | `string` |  |  | 단위(원·건·%). 부제·툴팁·표 머리글에 쓰고 값 글자에는 붙이지 않는다 |
| `height` | `number` | `240` |  | 차트 높이(SVG 사용자 단위). 카드가 높이를 고정해 로딩 때 레이아웃이 뛰지 않게 한다 |
| `xFormat` | `(v) => string` |  |  | x 라벨 서식(MM-DD · n월) |
| `yFormat` | `(v: number) => string` |  |  | y 라벨 서식(만·억) |
| `curve` | `'smooth' \| 'linear' \| 'step'` | `"smooth"` |  | 선 보간. 전망처럼 꺾이는 선은 linear |
| `showDots` | `boolean` | `false` |  | 모든 점에 마커 |
| `endLabel` | `string` |  |  | 끝점 값 글자를 붙일 계열 |
| `yDomain` | `[number \| 'auto', number \| 'auto']` |  |  | y 범위 |
| `band` | `{ from; to; label? }` |  |  | 기준 구간 음영 |
| `forecast` | `{ from: number; key?; lower?; upper?; label?; bandLabel? }` |  |  | 예측: from번째 행부터 같은 계열을 점선으로, lower~upper를 신뢰 구간 음영으로 |
| `ariaLabel` | `string` |  | 필수 | 차트를 한 문장으로(무엇을, 어느 기간, 어디서 어디로). role="img"의 이름 |

## Variants

curve 3 × (단일 area / 다중 line / 비교 점선 / 예측). 색은 `series-n`·`compare`.

## States

지원 상태: `default` · `hover`

default · hover(툴팁 + 세로 커서선 `border.strong`). focus·active·disabled·loading·error 해당 없음(ChartCard가 맡는다).

## 동작

hover·터치 이동에 가장 가까운 x의 모든 계열 값을 툴팁에. 계열이 4개를 넘으면 개발 모드 경고(소표 분할 권장).

예측(forecast): 계열 하나(key, 없으면 series[0])를 from번째 행에서 둘로 나눈다. from번째 행까지는 실적 실선(area면 면도), from번째 행부터는 예측 점선이다. from번째 행은 두 선이 만나는 점이라 툴팁에는 실적만 보인다. lower · upper 필드가 둘 다 있으면 그 사이를 같은 색 옅은 면으로 깐다(신뢰 구간). 툴팁에는 "예측 범위 120~150"처럼 한 줄로 보인다. from 위치에 세로 점선과 "예측" 라벨을 둔다. 범례(ChartCard legend)에는 실적(line · square) · 예측(dashed) 두 항목을 같은 색으로 둔다. 예측 행의 실적 값은 비워 둬도 되고 있어도 그리지 않는다. 신뢰 구간은 y 범위 계산에 들어간다.

## 접근성

[차트 고르기](../guides/charts.md). 끝점 글자는 `fg.primary`, 축 글자 `chart.axis`(≥ 4.5:1).

## 밀도

높이는 호출자 고정. 390에서는 x 눈금 간격을 넓힌다(`interval="preserveStartEnd"`).

## 플랫폼 차이

네이티브는 터치 고정 툴팁, 애니메이션 없음.

## 금지 사항

단위가 다른 계열 섞기(이중 축) · 모든 점 값 글자 · 계열 색에 hex → 타입 + 리뷰.

## 예시

### 영역

단일 계열 + 끝값

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { TrendChart } from '@terracelab/trellis-react/charts';

const CASH = [
  781, 787, 779, 790, 796, 792, 802, 808, 804, 813, 818, 815, 823, 827, 824, 831, 836, 832, 840,
  845, 842, 848, 845, 852, 847, 850, 846, 844, 842, 874,
];

function Area() {
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
```

### 비교

이번 기간 실선 + 직전 기간 점선(compare)

```tsx
import { TrendChart } from '@terracelab/trellis-react/charts';

function Compare() {
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
```

### 목표 구간

음영 band + 꺾은선(linear)

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { TrendChart } from '@terracelab/trellis-react/charts';

const CASH = [
  781, 787, 779, 790, 796, 792, 802, 808, 804, 813, 818, 815, 823, 827, 824, 831, 836, 832, 840,
  845, 842, 848, 845, 852, 847, 850, 846, 844, 842, 874,
];

function Band() {
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
```

### 수요 예측

실적은 실선, 예측 시작 뒤는 점선과 신뢰 구간 음영

```tsx
import { formatAmount } from '@terracelab/trellis-contracts';
import { ChartCard, TrendChart } from '@terracelab/trellis-react/charts';

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

function Forecast() {
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
```
