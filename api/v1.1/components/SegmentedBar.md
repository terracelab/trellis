# SegmentedBar

> `@terracelab/trellis-react/charts` · CSS `.tl-segmented-bar` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { SegmentedBar } from '@terracelab/trellis-react/charts';
```

## 용도

부분-전체의 기본형(한 줄 막대). 순위 트랙(나머지는 `chart.track`)은 thin.

## 해부(Anatomy)

root · track(`chart.track`, radius `radius.full`) · segments(`Slice.color` 또는 `series-n`, 사이 2px 바탕 간격, `title`로 라벨·값·비율) · legend(아래, 라벨 · 값 · 비율). 조각 안에는 글자를 넣지 않는다 — 계열 색 위 12px 글자는 4.5:1을 보장할 수 없다(green.500 위 4.2). 값·비율은 범례와 툴팁(title)이 맡는다.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `data` | `Slice[]` |  | 필수 | 부분(합 = 전체). 색은 항목 고정 맵에서 |
| `unit` | `string` |  |  | 단위(원·건·%). 부제·툴팁·표 머리글에 쓰고 값 글자에는 붙이지 않는다 |
| `size` | `'tall' \| 'thin'` | `"tall"` |  | 두께 |
| `legend` | `boolean` | `true` |  | 아래 범례(값·비율) |
| `format` | `(value: number) => string` |  |  | 값 서식. 기본은 formatAmount(천 단위) |
| `ariaLabel` | `string` |  | 필수 | 차트를 한 문장으로(무엇을, 어느 기간, 어디서 어디로). role="img"의 이름 |

## Variants

size 2.

## States

지원 상태: `default` · `hover`

default · hover(조각 툴팁).

## 동작

합이 0이면 트랙만 그리고 "데이터 없음" 글자.

## 접근성

[차트 고르기](../guides/charts.md). 각 조각은 `title`로 라벨·값.

## 밀도

tall 높이 `size.control-md`(32), thin 8.

## 플랫폼 차이

없음.

## 금지 사항

조각 ≥ 7 → 리뷰.

## 예시

### 기본

부분-전체 한 줄 + 범례

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { SegmentedBar } from '@terracelab/trellis-react/charts';

function Basic() {
  return (
    <SegmentedBar
      data={[
        { label: '직판', value: 742_000_000, color: 'series-1' },
        { label: '대리점', value: 486_000_000, color: 'series-2' },
        { label: '온라인', value: 238_000_000, color: 'series-3' },
        { label: '수출', value: 122_000_000, color: 'series-4' },
      ]}
      unit="원"
      format={formatCompactWon}
      ariaLabel="10월 채널 구성"
    />
  );
}
```

### 얇게

순위 트랙(나머지는 compare)

```tsx
import { SegmentedBar } from '@terracelab/trellis-react/charts';

function Thin() {
  return (
    <SegmentedBar
      data={[
        { label: '서울 본사', value: 612, color: 'series-1' },
        { label: '경기 남부', value: 318, color: 'series-2' },
        { label: '부산·경남', value: 246, color: 'series-4' },
        { label: '나머지 4곳', value: 412, color: 'compare' },
      ]}
      unit="백만원"
      size="thin"
      ariaLabel="지사 매출 비중"
    />
  );
}
```
