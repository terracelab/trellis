# WaterfallChart

> `@terracelab/trellis-react/charts` · CSS `.tl-waterfall-chart` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { WaterfallChart } from '@terracelab/trellis-react/charts';
```

## 용도

시작값에서 더하고 빼서 끝값에 이르는 과정(예산 → 집행 → 잔액, 기본가 → 할인 → 견적가). 단순 비교는 BarList.

## 해부(Anatomy)

root · axis · bars(start/total `series-1`, delta는 polarity: updown이면 증가 `income`(빨강) · 감소 `expense`(파랑), neutral이면 모두 `series-1` 옅게) · connectors(`border.strong` 점선) · captions(`fg.tertiary`) · reference line(`chart.axis` 점선 + 라벨) · tooltip.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `steps` | `WaterfallStep[]` |  | 필수 | start → delta… → total. 라벨은 2~4자 |
| `unit` | `string` |  |  | 단위(원·건·%). 부제·툴팁·표 머리글에 쓰고 값 글자에는 붙이지 않는다 |
| `height` | `number` | `220` |  | 차트 높이(SVG 사용자 단위). 카드가 높이를 고정해 로딩 때 레이아웃이 뛰지 않게 한다 |
| `format` | `(value: number) => string` |  |  | 값 서식. 기본은 formatAmount(천 단위) |
| `polarity` | `'updown' \| 'neutral'` | `"updown"` |  | 증감 색 규칙 |
| `reference` | `{ value; label }` |  |  | 기준선 |
| `ariaLabel` | `string` |  | 필수 | 차트를 한 문장으로(무엇을, 어느 기간, 어디서 어디로). role="img"의 이름 |

## Variants

polarity 2 × reference 유무.

## States

지원 상태: `default` · `hover`

default · hover(툴팁: 단계 · 값 · 누계).

## 동작

누계는 컴포넌트가 계산한다(start → delta 누적 → total은 누계로 그림). total 값이 누계와 다르면 개발 모드 경고.

## 접근성

[차트 고르기](../guides/charts.md). 색만으로 증감을 알리지 않도록 툴팁·표에 부호(+/−).

## 밀도

단계 라벨 2~4자, 6단계를 넘으면 가로 스크롤 대신 묶기 권장.

## 플랫폼 차이

없음.

## 금지 사항

서양식 반전(증가 초록·감소 빨강) → 리뷰(금융 색 고정).

## 예시

### 예산 집행

감소 파랑(지출) · 증가 빨강(수입), 기준선

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { WaterfallChart } from '@terracelab/trellis-react/charts';

function Budget() {
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
```

### 가격 구성

증감 색 없이(neutral)

```tsx
import { WaterfallChart } from '@terracelab/trellis-react/charts';

function Price() {
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
```
