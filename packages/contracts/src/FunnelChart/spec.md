# FunnelChart
## 용도
순서가 있는 단계(문의 → 견적 → 협상 → 계약, 방문 → 장바구니 → 주문)에서 단계마다 남은 수와 전환율을 보여 줄 때 쓴다. 단계가 없는 범주 비교는 BarList, 시간에 따른 변화는 TrendChart, 한 건의 진행 단계는 Stepper를 쓴다.
## 해부(Anatomy)
root(`role="img"`) · row(단계마다 한 줄, 높이 `density.row-height`) · label(단계 이름 `type.label`, `fg.primary`) · track(`chart.track`, `radius.sm`) · bar(한 색 `series-1` 또는 color 슬롯, 왼쪽 정렬, 끝 `radius.sm`, 줄 사이 `space.4`) · value(값 `type.label` 600 tabular, `fg.primary`) · rate(오른쪽 비율 칸 `type.caption` tabular, `fg.secondary`, 첫 단계는 빈 칸) · head(비율 칸 머리 "전 단계 대비" · "누적 전환율", `type.caption` `fg.secondary`) · summary(아래 한 줄 "문의에서 계약까지 전환율 6.3%", `type.caption` `fg.secondary`, 위 `border.divider`).
## Props
contract 표. 단계(FunnelStage)는 `{ label, value }`이고 배열 순서가 단계 순서다. 계산은 `funnelSteps(data)`(contracts)가 한다. rate = 앞 단계 대비(%), overall = 첫 단계 대비(%), drop = 앞 단계에서 빠진 수. 표 대체를 만들 때도 같은 함수를 쓴다.
## Variants
conversion 3(previous · overall · both) × summary 유무. 색은 한 슬롯(기본 `series-1`).
## States
default · hover(줄 바탕 `bg.sunken`, 막대 title에 값 · 비율). focus · active · disabled · loading · error는 해당 없음(ChartCard가 맡는다).
## 동작
막대 길이는 첫 단계가 아니라 가장 큰 값 대비다(중간 단계가 다시 늘어도 넘치지 않는다). 막대는 모두 왼쪽에서 시작한다. 가운데 맞춘 깔때기 모양은 길이를 비교하기 어려워 쓰지 않는다. 값이 0인 단계도 줄은 남고 막대만 없다. 앞 단계가 0이면 비율은 "–"다. 비율은 소수 한 자리(`formatPercent`)다. 단계 수에 제한은 없고 색이 하나라 "기타"로 접지 않는다. 단계가 7개를 넘으면 표가 낫다.
## 접근성
`charts/README.md`. root는 `role="img"` + ariaLabel("이번 분기 영업 단계. 문의 480건에서 계약 30건, 전환율 6.3%")이고 숫자 확인은 ChartCard "표로 보기"가 맡는다. 단계 이름 · 값 · 비율 글자는 글자 토큰(`fg.*`)이고 막대 색을 입히지 않는다. 막대는 `chart.track` 위에서도 3:1 이상이다.
## 밀도
줄 높이 `density.row-height`(compact 36 · comfortable 40 · touch 48). 폭 `breakpoint.sm` 미만에서는 단계 이름이 막대 위 줄로 올라가고 비율 칸은 하나만 보인다(both면 앞 단계 대비).
## 플랫폼 차이
네이티브는 같은 props로 `react-native-svg` 막대를 그린다(Phase 3). 툴팁 대신 줄을 누르면 값 · 비율이 고정 표시된다.
## 금지 사항
단계마다 다른 색(한 측정값이다, 리뷰) · 가운데 맞춘 깔때기 모양(리뷰) · 표 대체 없음(리뷰) · 전환율을 화면 코드에서 직접 계산(`funnelSteps`를 쓴다, 리뷰).
## 스토리
Pipeline(영업 단계) · Both(앞 단계 · 누적 둘 다) · Amount(금액 단위 · 요약 없음).
## 참고
SY-12 · PG-40. dataviz 스킬: 한 측정값은 한 색, 막대는 같은 기준선에서 시작한다.
