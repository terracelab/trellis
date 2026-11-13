# Donut

> `@terracelab/trellis-react/charts` · CSS `.tl-donut` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Donut } from '@terracelab/trellis-react/charts';
```

## 용도

전체에서 각각의 비중(≤ 5조각). 조각이 많거나 글자가 길면 SegmentedBar 또는 BarList horizontal.

## 해부(Anatomy)

root · ring(두께 = 반지름의 28%, 조각 사이 2px `bg.surface` 간격, 색 `Slice.color` 또는 순서대로 `series-n`) · center(label `type.caption` fg.secondary, value `type.amount` fg.primary) · legend(옆, 라벨 · 값 · 비율) · tooltip.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `data` | `Slice[]` |  | 필수 | 조각(≤ 5 + 기타) |
| `unit` | `string` |  |  | 단위(원·건·%). 부제·툴팁·표 머리글에 쓰고 값 글자에는 붙이지 않는다 |
| `height` | `number` | `200` |  | 차트 높이(SVG 사용자 단위). 카드가 높이를 고정해 로딩 때 레이아웃이 뛰지 않게 한다 |
| `centerLabel` | `string` |  |  | 가운데 작은 라벨 |
| `centerValue` | `string` |  |  | 가운데 큰 값 |
| `legend` | `boolean` | `true` |  | 옆 범례(값·비율 포함) |
| `format` | `(value: number) => string` |  |  | 값 서식. 기본은 formatAmount(천 단위) |
| `ariaLabel` | `string` |  | 필수 | 차트를 한 문장으로(무엇을, 어느 기간, 어디서 어디로). role="img"의 이름 |

## Variants

legend 유무, center 유무.

## States

지원 상태: `default` · `hover`

default · hover(조각 살짝 확장 없음 — 툴팁만).

## 동작

조각이 5개를 넘으면 개발 모드 경고(호출자가 "기타"로 접는다). 0 값 조각은 그리지 않고 범례에만.

## 접근성

[차트 고르기](../guides/charts.md). 범례의 비율은 소수 1자리.

## 밀도

390에서는 범례를 아래로.

## 플랫폼 차이

없음.

## 금지 사항

파이(구멍 없음)·3D·조각 > 5 → 리뷰.

## 예시

### 기본

가운데 합계 + 옆 범례(값 · 비율)

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { Donut } from '@terracelab/trellis-react/charts';

function Basic() {
  const data = [
    { label: '직판', value: 742_000_000, color: 'series-1' as const },
    { label: '대리점', value: 486_000_000, color: 'series-2' as const },
    { label: '온라인', value: 238_000_000, color: 'series-3' as const },
    { label: '수출', value: 122_000_000, color: 'series-4' as const },
  ];
  return (
    <Donut
      data={data}
      unit="원"
      height={168}
      format={formatCompactWon}
      centerValue="16억"
      centerLabel="합계"
      ariaLabel="10월 채널 구성. 직판 47%, 대리점 31%, 온라인 15%, 수출 8%"
    />
  );
}
```
