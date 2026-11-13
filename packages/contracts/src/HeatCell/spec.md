# HeatCell
## 용도
행 × 열 표에서 어디가 진한지(에이징 · 요일 × 지사). 조건부 색 칸.
## 해부(Anatomy)
cell(배경 `chart.heat-1~5`, 0·null은 `chart.track`/빈 글자) · value(단계 1~3 fg.primary, 4~5 fg.inverse, tabular).
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| value | number \| null | — | ✓ | 값 |
| max | number | — | ✓ | 표 전체 최댓값 |
| format | (v: number) => string | formatAmount | | 서식 |
| unit | string | — | | 단위 |
| align | 'left' \| 'right' \| 'center' | 'right' | | 정렬 |
| empty | string | '–' | | 빈 칸 글자 |
## Variants
단계 0~5.
## States
default.
## 동작
단계 = ceil(value / max × 5), 0은 빈 칸.
## 접근성
`title`에 값·단위. 글자 대비는 단계 규칙으로 ≥ 4.5:1.
## 밀도
패딩 `space.4`/`space.8`.
## 플랫폼 차이
없음.
## 금지 사항
서로 다른 표의 max 섞기 → 리뷰. 상태 색으로 크기 → 리뷰.
## 스토리
Steps · InTable · Empty.
## 참고
—
