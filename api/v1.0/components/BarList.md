# BarList

> `@terracelab/trellis-react/charts` · CSS `.tl-bar-list` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { BarList } from '@terracelab/trellis-react/charts';
```

## 용도

범주(요일·지사·분류)별 크기 비교. 명목 범주는 같은 색 하나. 부분-전체는 SegmentedBar·Donut, 시간축은 TrendChart.

## 해부(Anatomy)

root · axis(범주 라벨 `chart.axis`) · bars(`color`, 끝 radius `radius.sm`, 사이 2px) · value labels(`fg.secondary` tabular, showValues) · extreme labels(extremes, 최고 `fg.strong` 600 · 최저 `fg.secondary`) · focus ring(onBarPress, 막대 바깥 `border.focus` 2) · tooltip.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `data` | `Slice[]` |  | 필수 | 범주별 값 |
| `unit` | `string` |  |  | 단위(원·건·%). 부제·툴팁·표 머리글에 쓰고 값 글자에는 붙이지 않는다 |
| `layout` | `'vertical' \| 'horizontal'` | `"vertical"` |  | 막대 방향 |
| `height` | `number` | `240` |  | 차트 높이(SVG 사용자 단위). 카드가 높이를 고정해 로딩 때 레이아웃이 뛰지 않게 한다 |
| `showValues` | `boolean` | `false` |  | 막대 끝에 값 글자 |
| `format` | `(value: number) => string` |  |  | 값 서식. 기본은 formatAmount(천 단위) |
| `max` | `number` |  |  | 축 최댓값 고정 |
| `color` | `ChartColor` | `"series-1"` |  | 막대 색(한 가지) |
| `extremes` | `boolean` | `false` |  | 최고 · 최저 막대에만 값 글자 |
| `onBarPress` | `(item: Slice) => void` |  |  | 막대를 누를 때. 주면 막대가 단추(Tab · Enter · Space) |
| `ariaLabel` | `string` |  | 필수 | 차트를 한 문장으로(무엇을, 어느 기간, 어디서 어디로). role="img"의 이름 |

## Variants

layout 2. 항목별 `Slice.color`는 범주가 항목 고정 색을 가질 때만(채널).

## States

지원 상태: `default` · `hover`

default · hover(막대 강조 + 툴팁) · focus(onBarPress일 때 막대 바깥 포커스 링). 나머지 해당 없음.

## 동작

이름이 길거나 항목이 6개를 넘으면 horizontal을 권장(개발 모드 경고).

`extremes`면 최고 · 최저 막대에만 값 글자를 붙이고 이름 축은 모두 보인다. 막대가 많을 때 끝만 읽게 하려는 것이다. 같은 값이 여럿이면 모두 붙는다. `showValues`와 같이 주면 extremes가 앞선다.

`onBarPress`를 주면 막대가 그 범주 목록으로 가는 단추가 된다. 누르면 그 항목(`Slice`)을 넘긴다. 막대마다 Tab으로 닿고 Enter · Space로 누른다. 커서는 손가락 모양이다.

| 키 | 동작 |
| --- | --- |
| Tab | 다음 막대(onBarPress일 때) |
| Enter · Space | 그 막대 누르기 |

## 접근성

[차트 고르기](../guides/charts.md). `onBarPress`가 있으면 루트는 `role="img"` 대신 `role="group"`(이름은 `ariaLabel`)이고 막대마다 `role="button"` · `tabIndex=0` · 이름 "범주 값단위"(예: "금 171건")를 가진다. img 안의 단추는 화면 낭독기에 보이지 않기 때문이다. 포커스 링은 막대 바깥 2 띄워 `border.focus` 2로 그려 막대 색과 겹치지 않는다.

## 밀도

막대 두께는 항목 수에 따라 자동, 최대 32.

## 플랫폼 차이

없음.

## 금지 사항

값 크기대로 색 다시 칠하기 → 리뷰. 무지개 막대 → 리뷰.

## 예시

### 세로

요일처럼 짧은 범주

```tsx
import { BarList } from '@terracelab/trellis-react/charts';

function Vertical() {
  return (
    <BarList
      data={[
        { label: '월', value: 132 },
        { label: '화', value: 148 },
        { label: '수', value: 141 },
        { label: '목', value: 156 },
        { label: '금', value: 171 },
      ]}
      unit="건"
      height={200}
      ariaLabel="요일별 주문 건수. 금요일이 171건으로 가장 많다"
    />
  );
}
```

### 가로 + 값 글자

이름이 길거나 6개를 넘을 때

```tsx
import { formatCompactWon } from '@terracelab/trellis-contracts';
import { BarList } from '@terracelab/trellis-react/charts';

function Horizontal() {
  const data = [
    { label: '서울 본사', value: 612_000_000 },
    { label: '경기 남부', value: 318_000_000 },
    { label: '부산·경남', value: 246_000_000 },
    { label: '대구·경북', value: 164_000_000 },
    { label: '광주·전라', value: 128_000_000 },
    { label: '대전·충청', value: 92_000_000 },
    { label: '강원', value: 28_000_000 },
  ];
  return (
    <BarList
      data={data}
      unit="원"
      layout="horizontal"
      height={data.length * 30 + 16}
      format={formatCompactWon}
      showValues
      ariaLabel="지사별 10월 매출. 서울 본사 6.1억이 가장 많다"
    />
  );
}
```

### 최고 · 최저만

막대가 많으면 끝 두 막대에만 값 글자를 붙인다

```tsx
import { BarList } from '@terracelab/trellis-react/charts';

function Extremes() {
  return (
    <BarList
      data={[
        { label: '1주', value: 412 },
        { label: '2주', value: 388 },
        { label: '3주', value: 455 },
        { label: '4주', value: 301 },
        { label: '5주', value: 367 },
        { label: '6주', value: 429 },
      ]}
      unit="건"
      height={200}
      extremes
      ariaLabel="주별 출고 건수. 3주 455건이 가장 많고 4주 301건이 가장 적다"
    />
  );
}
```

### 막대가 단추

onBarPress를 주면 막대를 눌러 그 범주 목록으로 간다. Tab · Enter로도 누른다

```tsx
import { BarList } from '@terracelab/trellis-react/charts';

function Pressable() {
  return (
    <BarList
      data={[
        { label: '검수 대기', value: 18 },
        { label: '입고 지연', value: 7 },
        { label: '반품 요청', value: 4 },
      ]}
      unit="건"
      layout="horizontal"
      height={3 * 30 + 16}
      showValues
      onBarPress={() => {}}
      ariaLabel="상태별 입고 건수. 막대를 누르면 그 상태의 목록을 연다"
    />
  );
}
```
