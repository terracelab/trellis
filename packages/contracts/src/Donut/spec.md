# Donut
## 용도
전체에서 각각의 비중(≤ 5조각). 조각이 많거나 글자가 길면 SegmentedBar 또는 BarList horizontal.
## 해부(Anatomy)
root · ring(두께 = 반지름의 28%, 조각 사이 2px `bg.surface` 간격, 색 `Slice.color` 또는 순서대로 `series-n`) · center(label `type.caption` fg.secondary, value `type.amount` fg.primary) · legend(옆, 라벨 · 값 · 비율) · tooltip.
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| data | Slice[] | — | ✓ | 조각 |
| unit | string | — | | 단위 |
| height | number | 200 | | 높이 |
| centerLabel | string | — | | 가운데 라벨 |
| centerValue | string | — | | 가운데 값 |
| legend | boolean | true | | 범례 |
| format | (v: number) => string | formatAmount | | 서식 |
| ariaLabel | string | — | ✓ | 한 문장 설명 |
## Variants
legend 유무, center 유무.
## States
default · hover(조각 살짝 확장 없음 — 툴팁만).
## 동작
조각이 5개를 넘으면 개발 모드 경고(호출자가 "기타"로 접는다). 0 값 조각은 그리지 않고 범례에만.
## 접근성
`charts/README.md`. 범례의 비율은 소수 1자리.
## 밀도
390에서는 범례를 아래로.
## 플랫폼 차이
없음.
## 금지 사항
파이(구멍 없음)·3D·조각 > 5 → 리뷰.
## 스토리
Default · NoLegend · WithCenter · Density.
## 참고
—
