# ComboChart
## 용도
양(막대)과 흐름·비교(선)를 한 축에. 쌓은 막대(stacked)는 구성 추이(채널별 · 분류별 매출)를 3계열 이상으로 보여 준다. 단위가 다른 보조 지표(마진율)는 `lower`의 작은 차트로 — 이중 축의 대체. 막대만 필요하면 BarList, 선만이면 TrendChart.
## 해부(Anatomy)
root · grid · axes · bars(나란히 1~2개 · stacked 3개 이상, `series-n`, 6개부터 다섯 뒤는 "기타" `compare`, 끝 radius `radius.sm`, 사이 2px 간격, stacked면 세그먼트 사이 `bg.surface` 2px) · lines(비교 점선 `compare`, 목표 실선) · tooltip · lower(같은 x축, 높이 84, 계열 1~2).
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| data | T[] | — | ✓ | 행 배열 |
| x | keyof T | — | ✓ | x축 필드 |
| bars | SeriesDef[] | — | ✓ | 막대 계열. 나란히 1~2, stacked 3 이상. 6개부터 "기타"로 접는다 |
| lines | SeriesDef[] | [] | | 선 계열 |
| stacked | boolean | false | | 막대 쌓기(툴팁 합계 줄) |
| unit | string | — | | 단위 |
| height | number | 240 | | 높이(lower 제외) |
| xFormat | (v) => string | — | | x 라벨 서식 |
| yFormat | (v: number) => string | formatCompactWon | | y 라벨 서식 |
| lower | ComboChartLower | — | | 아래 보조 차트 |
| ariaLabel | string | — | ✓ | 한 문장 설명 |
## Variants
stacked × lower 유무.
## States
default · hover(툴팁은 위·아래 차트를 함께). 나머지 해당 없음.
## 동작
위·아래 차트는 x를 공유하고 hover가 동기화된다. 나란히 막대가 3개 이상이면 개발 모드 경고(stacked는 경고 없음). stacked면 첫 계열이 바닥이고 맨 위 조각만 끝이 둥글다. 조각 사이는 `bg.surface` 2px 간격이고 툴팁 마지막 줄에 합계가 붙는다.

두 차트는 x에 같은 칸 눈금을 쓴다. 아래 차트가 선뿐이어도 점은 위 막대의 가운데에 선다. `yFormat`(위 · 아래)은 축 눈금에만 쓰고, 툴팁 값은 숫자(소수는 한 자리까지) 뒤에 `unit`을 한 번 붙인다. 눈금 서식에 단위를 넣어도 툴팁에 단위가 두 번 찍히지 않는다.

계열이 6개 이상이면 `foldSeries`(contracts)로 앞 5개를 남기고 나머지를 행마다 더해 "기타" 한 계열(`compare` 회색)로 접는다. 색 슬롯을 새로 만들지 않는다. 어떤 계열을 앞에 둘지(큰 순서)는 호출자가 정하고 색은 항목에 고정한다. 범례에도 "기타"를 두고 표 대체에는 접힌 계열까지 모두 보인다. 회색 "기타"는 다섯째(amber) 옆에 놓여 색각 시뮬레이션 ΔE 15.4 이상을 지킨다(넷째 teal 옆이면 3.0으로 구별되지 않는다).
## 접근성
`charts/README.md`. lower의 단위는 부제에 적는다.
## 밀도
390에서는 lower를 숨기고 표로 대체.
## 플랫폼 차이
네이티브: lower 미지원(개발 경고), 표로.
## 금지 사항
이중 y축 → 리뷰. 나란히 막대 ≥ 3 → 경고. 계열 색을 더 만들기(6번째 색) → 리뷰, "기타"로 접는다.
## 스토리
Default · Stacked(3계열 구성) · Other(7계열 → 기타) · WithLower · Compare · Density.
## 참고
dataviz 안티패턴 "dual axis".
