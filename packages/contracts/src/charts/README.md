# 차트 계열 공통 규칙

15종(ChartCard · TrendChart · ComboChart · BarList · WaterfallChart · Donut · SegmentedBar · CalendarHeatmap · Sparkline · Legend · RadialMeter · BulletBar · DataBar · HeatCell · FunnelChart)의 spec.md가 공통으로 따르는 규칙이다. 각 spec은 여기 없는 것만 적는다. 선택 규칙(어떤 질문에 어떤 형식)은 `docs/spec/components.md` §11.

## 색 — 토큰 슬롯만

- props의 색은 `ChartColor`(`series-1`~`series-5` · `compare` · `income` · `expense` · `success` · `warning` · `danger`)만 받는다. hex·CSS 문자열은 타입이 막는다.
- 구현은 슬롯을 `--tl-color-chart-series-n` · `--tl-color-chart-compare` · `--tl-color-finance-*` · `--tl-color-status-*-default`로 바꾼다. 다크 · 고대비(`data-contrast="high"`) · 색각 친화(`data-chart="cvd"`, 식자재 ERP Okabe–Ito 계열, D-97) 팔레트는 토큰이 처리하고 컴포넌트는 분기하지 않는다.
- 계열 색은 **항목에 고정**한다(채널 → 슬롯 맵을 호출자가 상수로). 필터로 항목이 빠져도 색이 바뀌지 않는다. 순위대로 다시 칠하지 않는다.
- `series-1` = 단일 계열·이번 기간, `compare` = 직전 기간(점선·회색). 상태 색은 **상태일 때만**, 아이콘·글자와 함께.
- **계열이 5개를 넘으면 "기타"로 접는다**(PG-40). `foldSeries(data, series, { label })`가 앞 다섯을 남기고 나머지를 행마다 더해 `compare` 회색 한 계열로 만든다. ComboChart는 스스로 접는다. 색 슬롯을 새로 만들지 않는다. 회색 "기타"는 다섯째(amber) 옆에 둔다. 넷째(teal) 옆이면 색각 시뮬레이션 ΔE 3.0으로 구별되지 않는다. 표 대체에는 접힌 계열까지 모두 보인다.
- 순차(크기)는 `--tl-color-chart-heat-1~5` 한 색 진하기. 1~3 위 글자 `fg.primary`, 4~5 위 `fg.inverse`.
- 팔레트 검증 결과: `docs/plan/notes/chart-palette-2026-11.md`(dataviz 검증기, 라이트·다크 인접쌍 PASS, 5번 amber는 3.0:1이라 값 글자·표 대체 필수).

## 형식

- **축은 하나.** 단위가 다른 두 값은 `ComboChart.lower`나 차트 두 개. 이중 축·3D·레이더·조각 7개 파이 없음.
- 마크는 가늘게: 선 2, 막대 끝 radius `radius.sm`, 막대·조각 사이 2px(`border.width.2`) 바탕색 간격, 격자는 `chart.grid` 가로선만, 축 글자 `chart.axis` + `type.caption`.
- 예측은 같은 계열 색의 점선, 신뢰 구간은 같은 색 옅은 면(opacity 0.14)이다(`TrendChart.forecast`). 예측 시작에 세로 점선 하나와 "예측" 라벨을 둔다. 점선의 뜻은 범례나 부제에 적는다(직전 기간 `compare` 점선과 색으로 구별된다).
- 단계(깔때기)는 한 측정값이라 한 색이고 막대는 모두 왼쪽에서 시작한다(`FunnelChart`). 가운데 맞춘 깔때기 모양은 쓰지 않는다.
- 값 글자는 끝점·최고값만(`endLabel`), 나머지는 툴팁·표. 글자 색은 글자 토큰(`fg.*`) — 계열 색을 입히지 않는다.
- 숫자는 `formatAmount`(천 단위, 음수 U+2212, tabular-nums). 큰 금액 축은 `formatCompactWon`(만·억). 비율은 소수 1자리.
- 덜 끝난 기간(이번 달)은 빼거나 부제에 "집계 중"을 쓴다.

## 접근성

- 차트 루트는 `role="img"` + `ariaLabel`(필수 prop): "무엇을, 어느 기간, 어디서 어디로".
- 숫자 확인은 `ChartCard.table`("표로 보기")가 맡는다. 계열이 2개 이상이면 `Legend`를 항상 둔다(단일 계열은 제목이 이름).
- 툴팁은 hover·터치에서 같은 내용. reduced-motion이면 애니메이션 없음(`--tl-duration-*`가 0).
- 대비: 축·범례 글자 ≥ 4.5:1(`chart.axis`는 surface 위 4.5 이상), 마크 ≥ 3:1(amber 예외는 위).

## 밀도 · 반응형

- 높이는 호출자가 `height`로 고정한다(밀도 토큰 영향 없음). 글자는 `type.caption`, 패딩은 `density.card-padding`.
- 폭은 부모를 100% 채운다(ResponsiveContainer). 390에서는 축 라벨 수를 줄이고 범례를 아래로 내린다.

## 플랫폼

- 웹: Recharts 3 래퍼(`packages/react/src/<Name>/`). Recharts를 직접 import하는 곳은 이 폴더들뿐이다.
- 네이티브: 같은 props, `react-native-svg`로 그린다(Phase 3). 툴팁은 탭으로 고정 표시.

## 금지

- hex·rgb 문자열 색 → 타입 + `trellis/no-raw-color`
- 이중 y축, 조각 > 5 도넛, 순위 재채색, 모든 점 값 글자, 차트만 있고 표 없음 → 리뷰
- 화면 코드에 집계·산식(데이터 계층으로) → 리뷰
