# Legend
## 용도
계열 ≥ 2인 차트의 범례. 단일 계열에는 쓰지 않는다(제목이 이름).
## 해부(Anatomy)
list(`role="list"`, 가로 wrap, 간격 `space.12`) · item(swatch 10×10 `radius.xs` 또는 선 16×2 · 점선, 라벨 `type.caption` fg.secondary).
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| items | LegendItem[] | — | ✓ | 항목 |
## Variants
shape: square · line · dashed.
## States
default.
## 동작
없음(정적). 클릭으로 계열 토글은 하지 않는다(상태가 숨겨진다).
## 접근성
`<ul role="list">`, 색 외에 모양(점선)으로도 구분.
## 밀도
없음.
## 플랫폼 차이
없음.
## 금지 사항
범례는 실선인데 차트는 점선 → 리뷰.
## 스토리
Default · Shapes.
## 참고
—
