# DataBar
## 용도
표 칸 안에서 같은 열의 값 크기 비교(재고·수량). 차트를 따로 그리지 않아도 읽히게.
## 해부(Anatomy)
cell(`role="img"`) · track(`chart.track`) · fill(`color`, warnBelow 아래면 `status.danger`) · marker(기준선 `fg.primary` 1px) · value(`tabular` fg.primary, 오른쪽) · warn icon(`status.danger`).
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| value | number | — | ✓ | 값 |
| max | number | — | ✓ | 열 최댓값 |
| width | number | 64 | | 막대 너비 |
| marker | number | — | | 기준선 |
| warnBelow | number | — | | 경고 경계 |
| format | (v: number) => string | formatAmount | | 서식 |
| unit | string | — | | 단위 |
| color | ChartColor | 'series-1' | | 막대 색 |
| label | string | — | | 접근성 이름 |
## Variants
marker 유무 × 경고 유무.
## States
default · error(warnBelow 아래: danger 색 + 아이콘).
## 동작
없음.
## 접근성
`aria-label="{label} {value}{unit}, 최대 {max}"`.
## 밀도
막대 높이 8(compact)·10(comfortable) — `density.row-height`의 1/4.
## 플랫폼 차이
없음.
## 금지 사항
다른 열의 max와 섞기 → 리뷰.
## 스토리
Default · WithMarker · Warn · InTable.
## 참고
—
