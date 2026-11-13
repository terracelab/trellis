# ChartCard
## 용도
차트 한 개를 담는 카드: 제목 · 부제(단위·기간·점선의 뜻) · 범례 · 우상단 액션 · 고정 높이의 차트 영역 · "표로 보기". 차트가 없는 숫자 블록에는 쓰지 않는다(StatCard). 여러 조각이 섞이는 복합 블록은 Card.
## 해부(Anatomy)
root(`bg.surface` · `border.default` · `radius.lg`) · head(title `type.h3` fg.primary, subtitle `type.caption` fg.secondary) · action · legend(Legend) · body(height 고정, 차트 또는 skeleton/error/empty/table) · toggle(표로 보기, ghost Button sm, `aria-pressed`).
## Props
공통 규칙 `charts/README.md`. 표는 contract.ts와 1:1.
| 이름 | 타입 | 기본값 | 필수 | 설명 |
|---|---|---|---|---|
| title | ReactNode | — | ✓ | 블록 제목 |
| subtitle | ReactNode | — | | 단위·기간·점선의 뜻 |
| legend | LegendItem[] | — | | 범례(계열 ≥ 2면 항상) |
| action | ReactNode | — | | 우상단 액션 |
| height | number | 240 | | 차트 영역 높이 |
| loading | boolean | false | | 스켈레톤 |
| refreshing | boolean | false | | 흐리게 + 자리 유지 |
| error | string \| null | — | | 오류 메시지 |
| empty | string \| null | — | | 빈 상태 메시지 |
| onRetry | () => void | — | | 다시 시도 |
| table | ChartTable | — | | 표 대체 |
| children | ReactNode | — | | 차트 1개 |
## Variants
variant 없음. 높이만 호출자가 정한다.
## States
default · loading(skeleton `bg.sunken`, 높이 유지) · error(`status.danger.default` 아이콘 + 메시지 + 다시 시도). hover·active·focus는 toggle 버튼에만(Button 규칙). disabled 해당 없음.
## 동작
`table`이 있으면 toggle이 생기고 누르면 차트 자리에 `<table>`이 들어온다(같은 높이, 세로 스크롤). `refreshing`이면 차트 opacity `opacity.disabled`(0.5)로 두고 상호작용은 유지. `error`가 있으면 loading보다 우선.
## 접근성
root `<figure aria-labelledby=title>`(figure 기본 역할. role="group"은 figure에 허용되지 않는다). 표는 `<caption>`에 title, 숫자 열 `<th scope="col">`. toggle `aria-pressed`. 오류 메시지는 `role="status"`.
## 밀도
head 패딩 `density.card-padding`, toggle 높이 `density.control-height-sm`.
## 플랫폼 차이
네이티브는 toggle 대신 길게 누르면 표 시트. 나머지 동일.
## 금지 사항
차트만 넘기고 `table`을 비움(리뷰 — 숫자 확인 경로가 없어진다). 높이 미지정으로 로딩 때 레이아웃 점프 → 기본 240 강제.
## 스토리
Default · States(loading·error·empty·refreshing) · WithTable · WithLegendAndAction · Density.
## 참고
원문 §5 대시보드 블록. 구조만 참고(타사 자산 금지).
