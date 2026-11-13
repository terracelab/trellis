# CalendarHeatmap
## 용도
날짜별 크기(판매·출근·접속). 한 색 진하기 5단계. 요일 패턴만 보려면 BarList.
## 해부(Anatomy)
root · weekday labels(`chart.axis`) · cells(`chart.heat-1~5`, 0·없음은 `chart.track`, radius `radius.sm`, 간격 2px) · month/year labels · tooltip(날짜 · 값).
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| data | HeatDatum[] | — | ✓ | 날짜별 값 |
| unit | string | — | | 단위 |
| format | (v: number) => string | formatAmount | | 서식 |
| layout | 'auto' \| 'month' \| 'year' | 'auto' | | 모양 |
| ariaLabel | string | — | ✓ | 한 문장 설명 |
## Variants
layout: month(7열 × 최대 6행) · year(주 열 × 7행).
## States
default · hover(칸 툴팁).
## 동작
단계는 최댓값을 5등분(선형). 오늘은 `border.focus` 1px 테두리.
## 접근성
`charts/README.md`. 칸은 `title`로 날짜·값.
## 밀도
칸 크기는 폭에서 계산(month 최소 24, year 최소 10).
## 플랫폼 차이
없음.
## 금지 사항
상태 색으로 크기 표현(많이 팔린 날을 빨강) → 리뷰.
## 스토리
Month · Year · Empty · Density.
## 참고
—
