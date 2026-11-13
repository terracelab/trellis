# FunnelChart

> `@terracelab/trellis-react/charts` · CSS `.tl-funnel-chart` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { FunnelChart } from '@terracelab/trellis-react/charts';
```

## 용도

순서가 있는 단계(문의 → 견적 → 협상 → 계약, 방문 → 장바구니 → 주문)에서 단계마다 남은 수와 전환율을 보여 줄 때 쓴다. 단계가 없는 범주 비교는 BarList, 시간에 따른 변화는 TrendChart, 한 건의 진행 단계는 Stepper를 쓴다.

## 해부(Anatomy)

root(`role="img"`) · row(단계마다 한 줄, 높이 `density.row-height`) · label(단계 이름 `type.label`, `fg.primary`) · track(`chart.track`, `radius.sm`) · bar(한 색 `series-1` 또는 color 슬롯, 왼쪽 정렬, 끝 `radius.sm`, 줄 사이 `space.4`) · value(값 `type.label` 600 tabular, `fg.primary`) · rate(오른쪽 비율 칸 `type.caption` tabular, `fg.secondary`, 첫 단계는 빈 칸) · head(비율 칸 머리 "전 단계 대비" · "누적 전환율", `type.caption` `fg.secondary`) · summary(아래 한 줄 "문의에서 계약까지 전환율 6.3%", `type.caption` `fg.secondary`, 위 `border.divider`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `data` | `FunnelStage[]` |  | 필수 | 단계(위 → 아래 순서). { label, value } |
| `unit` | `string` |  |  | 단위(원·건·%). 부제·툴팁·표 머리글에 쓰고 값 글자에는 붙이지 않는다 |
| `format` | `(value: number) => string` |  |  | 값 서식. 기본은 formatAmount(천 단위) |
| `color` | `ChartColor` | `"series-1"` |  | 막대 색 슬롯. 단계마다 바꾸지 않는다 |
| `conversion` | `'previous' \| 'overall' \| 'both'` | `"previous"` |  | 비율 칸: 앞 단계 대비 · 첫 단계 대비 · 둘 다 |
| `summary` | `boolean` | `true` |  | 아래 전체 전환율 한 줄 |
| `ariaLabel` | `string` |  | 필수 | 차트를 한 문장으로(무엇을, 어느 기간, 어디서 어디로). role="img"의 이름 |

## Variants

conversion 3(previous · overall · both) × summary 유무. 색은 한 슬롯(기본 `series-1`).

## States

지원 상태: `default` · `hover`

default · hover(줄 바탕 `bg.sunken`, 막대 title에 값 · 비율). focus · active · disabled · loading · error는 해당 없음(ChartCard가 맡는다).

## 동작

막대 길이는 첫 단계가 아니라 가장 큰 값 대비다(중간 단계가 다시 늘어도 넘치지 않는다). 막대는 모두 왼쪽에서 시작한다. 가운데 맞춘 깔때기 모양은 길이를 비교하기 어려워 쓰지 않는다. 값이 0인 단계도 줄은 남고 막대만 없다. 앞 단계가 0이면 비율은 "–"다. 비율은 소수 한 자리(`formatPercent`)다. 단계 수에 제한은 없고 색이 하나라 "기타"로 접지 않는다. 단계가 7개를 넘으면 표가 낫다.

## 접근성

[차트 고르기](../guides/charts.md). root는 `role="img"` + ariaLabel("이번 분기 영업 단계. 문의 480건에서 계약 30건, 전환율 6.3%")이고 숫자 확인은 ChartCard "표로 보기"가 맡는다. 단계 이름 · 값 · 비율 글자는 글자 토큰(`fg.*`)이고 막대 색을 입히지 않는다. 막대는 `chart.track` 위에서도 3:1 이상이다.

## 밀도

줄 높이 `density.row-height`(compact 36 · comfortable 40 · touch 48). 폭 `breakpoint.sm` 미만에서는 단계 이름이 막대 위 줄로 올라가고 비율 칸은 하나만 보인다(both면 앞 단계 대비).

## 플랫폼 차이

네이티브는 같은 props로 `react-native-svg` 막대를 그린다(Phase 3). 툴팁 대신 줄을 누르면 값 · 비율이 고정 표시된다.

## 금지 사항

단계마다 다른 색(한 측정값이다, 리뷰) · 가운데 맞춘 깔때기 모양(리뷰) · 표 대체 없음(리뷰) · 전환율을 화면 코드에서 직접 계산(`funnelSteps`를 쓴다, 리뷰).

## 예시

### 영업 단계

단계마다 도달한 건수와 앞 단계 대비 전환율. 표로 보기에 같은 숫자가 있다

```tsx
import { funnelSteps } from '@terracelab/trellis-contracts';
import { ChartCard, FunnelChart } from '@terracelab/trellis-react/charts';

const PIPELINE = [
  { label: '문의', value: 480 },
  { label: '견적', value: 212 },
  { label: '협상', value: 96 },
  { label: '계약', value: 30 },
];

function Pipeline() {
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
```

### 두 비율

앞 단계 대비와 첫 단계 대비 누적 전환율을 나란히

```tsx
import { FunnelChart } from '@terracelab/trellis-react/charts';

function Both() {
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
```

### 금액

원 단위 금액 깔때기, 요약 줄 없이

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { FunnelChart } from '@terracelab/trellis-react/charts';

function Amount() {
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
```
