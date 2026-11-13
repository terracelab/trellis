# SegmentedBar
## 용도
부분-전체의 기본형(한 줄 막대). 순위 트랙(나머지는 `chart.track`)은 thin.
## 해부(Anatomy)
root · track(`chart.track`, radius `radius.full`) · segments(`Slice.color` 또는 `series-n`, 사이 2px 바탕 간격, `title`로 라벨·값·비율) · legend(아래, 라벨 · 값 · 비율). 조각 안에는 글자를 넣지 않는다 — 계열 색 위 12px 글자는 4.5:1을 보장할 수 없다(green.500 위 4.2). 값·비율은 범례와 툴팁(title)이 맡는다.
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| data | Slice[] | — | ✓ | 부분 |
| unit | string | — | | 단위 |
| size | 'tall' \| 'thin' | 'tall' | | 두께(tall 32 · thin 8) |
| legend | boolean | true | | 범례 |
| format | (v: number) => string | formatAmount | | 서식 |
| ariaLabel | string | — | ✓ | 한 문장 설명 |
## Variants
size 2.
## States
default · hover(조각 툴팁).
## 동작
합이 0이면 트랙만 그리고 "데이터 없음" 글자.
## 접근성
`charts/README.md`. 각 조각은 `title`로 라벨·값.
## 밀도
tall 높이 `size.control-md`(32), thin 8.
## 플랫폼 차이
없음.
## 금지 사항
조각 ≥ 7 → 리뷰.
## 스토리
Default · Thin · NoLegend · Density.
## 참고
—
