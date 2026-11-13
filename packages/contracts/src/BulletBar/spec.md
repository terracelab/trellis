# BulletBar
## 용도
목표·한도 대비 진행(발주 소진·예산 집행·목표 달성)을 한 줄로. 여러 행을 목록으로 둘 때.
## 해부(Anatomy)
row(`role="meter"`) · label(`type.label` fg.primary) · track(`chart.track`, radius full) · fill(상태 색: 기본 `series-1`, 달성 `status.success`, 주의 `status.warning`, 초과 `status.danger`) · target tick(`fg.primary` 2px) · value(`tabular`, "값 / 목표", targetLabel이면 "값 / 기준 이름 기준 값") · state chip(아이콘 + 글자, showState) · ratio(오른쪽 끝, 값 ÷ 목표 정수 %, `fg.strong` 600, 고정 폭 44 오른쪽 정렬, showRatio).
## Props
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| label | string | — | ✓ | 행 이름 |
| value | number | — | ✓ | 현재 값 |
| target | number | — | ✓ | 목표·한도 |
| max | number | max(value,target)×1.1 | | 트랙 최댓값 |
| unit | string | — | | 단위 |
| format | (v: number) => string | formatAmount | | 서식 |
| polarity | 'up-good' \| 'up-bad' | 'up-good' | | 극성 |
| warnAt | number | 0.9 | | 주의 경계 |
| caption | string | — | | 보조 글자 |
| size | 'sm' \| 'md' | 'md' | | 행 높이 |
| showState | boolean | true | | 상태 칩 |
| targetLabel | string | — | | 기준 이름(평균). 목표 대신 기준과 견줄 때 |
| showRatio | boolean | true | | 오른쪽 비율(값 ÷ 목표) |
## Variants
size 2 × 상태 4(기본·달성·주의·초과).
## States
default(상태 4는 데이터 상태이지 상호작용 상태가 아니다).
## 동작
상태 계산: ratio = value/target. up-good: ≥ 1 달성, ≥ warnAt 주의, 그 외 기본. up-bad: > 1 초과, ≥ warnAt 주의, 그 외 기본.

오른쪽 끝에 비율(값 ÷ 목표, 정수 %)을 보인다. 여러 행의 비율이 세로로 줄을 맞춘다. 값이 이미 목표 100 대비 %면 비율이 값과 같으므로 `showRatio={false}`로 끈다. 목표가 0이면 비율을 보이지 않는다.

목표가 아니라 평균 같은 기준과 견줄 때는 `targetLabel`에 기준 이름을 준다. 값 글자가 "16.5% / 평균 9.1%"가 되고 접근성 글자의 "목표"도 그 이름으로 바뀐다. 이때는 달성 · 주의가 뜻이 없으니 `showState={false}` · `showRatio={false}`를 같이 준다. showState가 false면 막대도 기본 색(`series-1`)으로 칠한다. 색만으로 상태를 말하지 않기 위해서다.
## 접근성
`role="meter" aria-valuenow/max aria-label`. `aria-valuetext`는 "값, 목표 값, 목표 대비 비율, 상태" 순서이고 보이지 않는 것은 뺀다. 상태는 색 + 아이콘 + 글자.
## 밀도
md 행 `density.row-height`, sm 24.
## 플랫폼 차이
없음.
## 금지 사항
상태 색을 크기 표현에 쓰기 → 리뷰.
## 스토리
List · Budget · Average.
## 참고
—
