# Sparkline
## 용도
숫자 타일 안의 작은 추이선. 축·값·범례 없음 — 모양만. 값을 읽어야 하면 TrendChart.
## 해부(Anatomy)
svg(`role="img"`) · area(옅은 영역, 선 색 opacity 0.12) · line(1.5px `color`) · end dot(r 2.5).
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| data | number[] | — | ✓ | 값 |
| width | number | 112 | | 너비 |
| height | number | 32 | | 높이 |
| area | boolean | true | | 영역 |
| color | ChartColor | 'series-1' | | 선 색 |
| ariaLabel | string | — | ✓ | 한 문장 설명 |
## Variants
area 유무.
## States
default. 나머지 해당 없음(툴팁 없음).
## 동작
값이 2개 미만이면 평평한 선. 자체 SVG(Recharts 없음).
## 접근성
`ariaLabel`에 시작→끝 값을 넣는다.
## 밀도
타일 footer에서 width 140 · height 24 권장.
## 플랫폼 차이
없음.
## 금지 사항
스탯 타일 장식용 남발(값 없는 추이) → 리뷰.
## 스토리
Default · NoArea · InStatCard.
## 참고
—
