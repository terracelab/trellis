# BarList
## 용도
범주(요일·지사·분류)별 크기 비교. 명목 범주는 같은 색 하나. 부분-전체는 SegmentedBar·Donut, 시간축은 TrendChart.
## 해부(Anatomy)
root · axis(범주 라벨 `chart.axis`) · bars(`color`, 끝 radius `radius.sm`, 사이 2px) · value labels(`fg.secondary` tabular, showValues) · extreme labels(extremes, 최고 `fg.strong` 600 · 최저 `fg.secondary`) · focus ring(onBarPress, 막대 바깥 `border.focus` 2) · tooltip.
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| data | Slice[] | — | ✓ | 범주별 값 |
| unit | string | — | | 단위 |
| layout | 'vertical' \| 'horizontal' | 'vertical' | | 방향 |
| height | number | 240 | | 높이(horizontal은 n × 30 + 16 권장) |
| showValues | boolean | false | | 끝 값 글자 |
| format | (v: number) => string | formatAmount | | 서식 |
| max | number | — | | 축 최댓값 |
| color | ChartColor | 'series-1' | | 막대 색 |
| extremes | boolean | false | | 최고 · 최저 막대에만 값 글자 |
| onBarPress | (item: Slice) => void | — | | 막대를 누를 때. 막대가 단추가 된다 |
| ariaLabel | string | — | ✓ | 한 문장 설명 |
## Variants
layout 2. 항목별 `Slice.color`는 범주가 항목 고정 색을 가질 때만(채널).
## States
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
`charts/README.md`. `onBarPress`가 있으면 루트는 `role="img"` 대신 `role="group"`(이름은 `ariaLabel`)이고 막대마다 `role="button"` · `tabIndex=0` · 이름 "범주 값단위"(예: "금 171건")를 가진다. img 안의 단추는 화면 낭독기에 보이지 않기 때문이다. 포커스 링은 막대 바깥 2 띄워 `border.focus` 2로 그려 막대 색과 겹치지 않는다.
## 밀도
막대 두께는 항목 수에 따라 자동, 최대 32.
## 플랫폼 차이
없음.
## 금지 사항
값 크기대로 색 다시 칠하기 → 리뷰. 무지개 막대 → 리뷰.
## 스토리
Vertical · Horizontal · Extremes · Pressable.
## 참고
—
