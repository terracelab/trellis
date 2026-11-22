# 차트 고르기

`@terracelab/trellis-react/charts`의 15종입니다. 질문에서 형식을, 형식에서 컴포넌트를 고릅니다.

| 사용자의 질문 | 형식 | 컴포넌트 |
| --- | --- | --- |
| 지금 얼마나? | 숫자 + 작은 추이 | 숫자 카드 + [Sparkline](../components/Sparkline.md) |
| 시간에 따라 어떻게? | 선 · 영역 | [TrendChart](../components/TrendChart.md) |
| 앞으로 얼마나? | 실적 실선 + 예측 점선 + 신뢰 구간 음영 | [TrendChart](../components/TrendChart.md) `forecast` |
| 양과 흐름을 같이? | 막대 + 선(다른 단위는 아래 차트) | [ComboChart](../components/ComboChart.md) |
| 구성이 어떻게 바뀌나? | 쌓은 막대(3계열 이상) | [ComboChart](../components/ComboChart.md) `stacked` |
| 범주별로 얼마나? | 막대(가로 · 세로, 한 색) | [BarList](../components/BarList.md) |
| 전체에서 각각? | 한 줄 막대 · 도넛(5조각 이하) | [SegmentedBar](../components/SegmentedBar.md) · [Donut](../components/Donut.md) |
| 날짜마다 얼마나? | 한 색 진하기 5단계 | [CalendarHeatmap](../components/CalendarHeatmap.md) |
| 더하고 빼서? | 워터폴(증가 빨강 · 감소 파랑) | [WaterfallChart](../components/WaterfallChart.md) |
| 단계마다 얼마나 남나? | 왼쪽 정렬 가로 막대(한 색) + 전환율 | [FunnelChart](../components/FunnelChart.md) |
| 목표 · 한도 대비? | 링 하나 · 목표 막대 목록 | [RadialMeter](../components/RadialMeter.md) · [BulletBar](../components/BulletBar.md) |
| 표 안에서 비교? | 칸 안 막대 · 조건부 색 | [DataBar](../components/DataBar.md) · [HeatCell](../components/HeatCell.md) |
| 차트를 담을 카드 | 제목 · 부제 · 범례 · 표로 보기 | [ChartCard](../components/ChartCard.md) · [Legend](../components/Legend.md) |

## 규칙

- **색은 슬롯 이름만**: `series-1`~`series-5` · `compare` · `income` · `expense` · `success` · `warning` · `danger`. 타입이 hex를 막습니다. 다크 · 색각 대응은 토큰이 처리합니다.
- **색은 항목에 고정**: 채널 → 슬롯 맵을 상수로 두고, 필터로 항목이 빠져도 색을 바꾸지 않습니다. 순위대로 다시 칠하지 않습니다.
- `series-1` = 단일 계열 · 이번 기간, `compare` = 직전 기간(점선). 상태 색은 상태일 때만, 아이콘 · 글자와 함께.
- **축은 하나**: 단위가 다른 값은 `ComboChart`의 `lower` 또는 차트 두 개. 이중 축 · 3D · 레이더 · 7조각 파이 없음.
- **표 대체**: `ChartCard`에 `table`을 넘겨 "표로 보기"를 켭니다. 스크린리더와 숫자 확인용이라 거의 항상 넘깁니다.
- 차트마다 `ariaLabel`(필수): "무엇을, 어느 기간, 어디서 어디로".
- 값 글자는 끝점 · 최고값만. 나머지는 툴팁과 표. 덜 끝난 기간(이번 달)은 빼거나 부제에 "집계 중".
- 높이는 `height`로 고정해 로딩 때 레이아웃이 뛰지 않게 합니다. 폭은 부모를 채웁니다.

## 숫자 서식

축은 `formatCompactWon`(만 · 억), 값은 `formatAmount`(천 단위 · U+2212), 비율은 `formatPercent`(소수 1자리, 차이는 `%p`).

## 팔레트

| 슬롯 | 라이트 | 다크 | 뜻 |
| --- | --- | --- | --- |
| `series-1` | brand.500 | brand.400 | 단일 · 이번 기간 |
| `series-2` | green.500 | green.500 | 둘째 계열 |
| `series-3` | violet.500 | violet.400 | 셋째 계열 |
| `series-4` | teal.500 | teal.500 | 넷째 계열 |
| `series-5` | amber.600 | amber.500 | 다섯째. 라이트 대비 3.0:1이라 값 글자 · 표 대체 필수 |
| `compare` | neutral.400 | neutral.400 | 직전 기간(점선) |

색각 이상 시뮬레이션(protan · deutan)에서 인접 계열 색차 ΔE ≥ 15를 확인했습니다. 계열이 5개를 넘으면 "기타"로 접거나 작은 차트 여러 개로 나눕니다. ComboChart는 6개부터 다섯 뒤를 회색 "기타"(`compare`) 하나로 접습니다(`foldSeries`). 색을 새로 만들지 않습니다.
