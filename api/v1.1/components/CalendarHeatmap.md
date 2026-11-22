# CalendarHeatmap

> `@terracelab/trellis-react/charts` · CSS `.tl-calendar-heatmap` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { CalendarHeatmap } from '@terracelab/trellis-react/charts';
```

## 용도

날짜별 크기(판매·출근·접속). 한 색 진하기 5단계. 요일 패턴만 보려면 BarList.

## 해부(Anatomy)

root · weekday labels(`chart.axis`) · cells(`chart.heat-1~5`, 0·없음은 `chart.track`, radius `radius.sm`, 간격 2px) · month/year labels · tooltip(날짜 · 값).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `data` | `HeatDatum[]` |  | 필수 | 날짜별 값. 0·없음은 빈 칸 |
| `unit` | `string` |  |  | 단위(원·건·%). 부제·툴팁·표 머리글에 쓰고 값 글자에는 붙이지 않는다 |
| `format` | `(value: number) => string` |  |  | 값 서식. 기본은 formatAmount(천 단위) |
| `layout` | `'auto' \| 'month' \| 'year'` | `"auto"` |  | 모양 |
| `ariaLabel` | `string` |  | 필수 | 차트를 한 문장으로(무엇을, 어느 기간, 어디서 어디로). role="img"의 이름 |

## Variants

layout: month(7열 × 최대 6행) · year(주 열 × 7행).

## States

지원 상태: `default` · `hover`

default · hover(칸 툴팁).

## 동작

단계는 최댓값을 5등분(선형). 오늘은 `border.focus` 1px 테두리.

## 접근성

[차트 고르기](../guides/charts.md). 칸은 `title`로 날짜·값.

## 밀도

칸 크기는 폭에서 계산(month 최소 24, year 최소 10).

## 플랫폼 차이

없음.

## 금지 사항

상태 색으로 크기 표현(많이 팔린 날을 빨강) → 리뷰.

## 예시

### 월

날짜별 크기를 한 색 진하기 5단계로

```tsx
import { CalendarHeatmap } from '@terracelab/trellis-react/charts';

function Month() {
  const data = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const weekday = (new Date(Date.UTC(2026, 9, day)).getUTCDay() + 6) % 7;
    const value = weekday >= 5 ? 4 + (day % 4) : 22 + ((day * 7) % 14);
    return { date: `2026-10-${String(day).padStart(2, '0')}`, value };
  });
  return <CalendarHeatmap data={data} unit="건" ariaLabel="2026년 10월 일별 판매. 평일이 많다" />;
}
```
