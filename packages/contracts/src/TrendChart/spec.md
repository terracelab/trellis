# TrendChart
## 용도
시간에 따른 변화(선·영역). 단일 계열은 영역, 비교(직전 기간)는 점선. forecast를 주면 실적 뒤에 예측 점선과 신뢰 구간 음영이 이어진다(수요 예측 · 발주 추천). 양(막대)과 흐름을 같이 보여야 하면 ComboChart, 범주 비교는 BarList.
## 해부(Anatomy)
root(`role="img"`) · grid(가로선 `chart.grid`) · x axis / y axis(`chart.axis`, `type.caption`) · band(`chart.track` 음영 + 라벨) · series(line 2px `series-n`, area는 같은 색 opacity 0.12→0 그라데이션, compare는 점선 `compare`) · dots(끝점 r 4, `bg.surface` 테두리 2) · end label(`fg.primary` tabular) · forecast(예측 선: 같은 계열 색 2px 점선 4 4, 신뢰 구간: 같은 색 opacity 0.14 면, 시작 세로선 `border.strong` 점선 + 라벨 "예측" `chart.axis`) · tooltip(`bg.elevated` · `shadow.md` · `radius.md`).
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| data | T[] | — | ✓ | 행 배열 |
| x | keyof T | — | ✓ | x축 필드 |
| series | SeriesDef[] | — | ✓ | 계열(같은 단위만) |
| unit | string | — | | 단위 |
| height | number | 240 | | 높이 |
| xFormat | (v) => string | — | | x 라벨 서식 |
| yFormat | (v: number) => string | formatCompactWon | | y 라벨 서식 |
| curve | 'smooth' \| 'linear' \| 'step' | 'smooth' | | 보간 |
| showDots | boolean | false | | 모든 점 마커 |
| endLabel | string | — | | 끝점 값 글자 계열 |
| yDomain | [number \| 'auto', number \| 'auto'] | ['auto','auto'] | | y 범위 |
| band | { from; to; label? } | — | | 기준 구간 |
| forecast | { from; key?; lower?; upper?; label?; bandLabel? } | — | | 예측 구간(from번째 행부터 점선 + 신뢰 구간) |
| ariaLabel | string | — | ✓ | 한 문장 설명 |
## Variants
curve 3 × (단일 area / 다중 line / 비교 점선 / 예측). 색은 `series-n`·`compare`.
## States
default · hover(툴팁 + 세로 커서선 `border.strong`). focus·active·disabled·loading·error 해당 없음(ChartCard가 맡는다).
## 동작
hover·터치 이동에 가장 가까운 x의 모든 계열 값을 툴팁에. 계열이 4개를 넘으면 개발 모드 경고(소표 분할 권장).

예측(forecast): 계열 하나(key, 없으면 series[0])를 from번째 행에서 둘로 나눈다. from번째 행까지는 실적 실선(area면 면도), from번째 행부터는 예측 점선이다. from번째 행은 두 선이 만나는 점이라 툴팁에는 실적만 보인다. lower · upper 필드가 둘 다 있으면 그 사이를 같은 색 옅은 면으로 깐다(신뢰 구간). 툴팁에는 "예측 범위 120~150"처럼 한 줄로 보인다. from 위치에 세로 점선과 "예측" 라벨을 둔다. 범례(ChartCard legend)에는 실적(line · square) · 예측(dashed) 두 항목을 같은 색으로 둔다. 예측 행의 실적 값은 비워 둬도 되고 있어도 그리지 않는다. 신뢰 구간은 y 범위 계산에 들어간다.
## 접근성
`charts/README.md`. 끝점 글자는 `fg.primary`, 축 글자 `chart.axis`(≥ 4.5:1).
## 밀도
높이는 호출자 고정. 390에서는 x 눈금 간격을 넓힌다(`interval="preserveStartEnd"`).
## 플랫폼 차이
네이티브는 터치 고정 툴팁, 애니메이션 없음.
## 금지 사항
단위가 다른 계열 섞기(이중 축) · 모든 점 값 글자 · 계열 색에 hex → 타입 + 리뷰.
## 스토리
Default(area) · Compare(점선) · MultiSeries · Linear+EndLabel · Band · Forecast(실적 → 예측 + 신뢰 구간) · Density.
## 참고
dataviz 스킬 line/area 규칙. 미리보기 홈의 시재 추이가 Default.
