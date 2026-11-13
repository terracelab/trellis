# DeadlineStrip
## 용도
기준일부터 N일(기본 30) 동안의 기한을 가로 날짜 축에 점으로 놓을 때 쓴다(회사 상태 한 장의 30일 기한, 세무 · 인사 · 운영 기한, R-40). 지난 기한은 왼쪽 끝에 "지남 n"으로 남는다. 한 달 일정 전체는 MonthCalendar, 사람 × 날짜 근태 · 휴가는 TeamSchedule, 기한 하나의 남은 날은 DueBadge.
## 해부(Anatomy)
root(`tl-deadline-strip`, 자기 폭 기준 `container-type`) · track(축과 점 목록을 같은 칸 격자로 겹친다, 좌우 `space.12`) · axis(꾸밈, 점 줄 높이 `space.32` 가운데 가로선 `border.default`, 날짜 글자 `type.caption` `fg.secondary` tabular: 첫날 · 달의 1일은 "11/1", 나머지는 날짜 숫자) · today(오늘 칸: 점 줄을 세로로 지나는 `border-width.2` `fg.strong` 선 + 아래 글자 "오늘" `fg.strong` 600. 브랜드색을 쓰지 않는다) · points(ol, 날짜 묶음마다 li 하나, 축과 같은 칸) · point(단추 `space.24` 원, 가리키면 `bg.sunken`): dot(`space.12` 원, 점 색 슬롯 + 바탕색 `border-width.2` 테두리로 축 선 위에 뜬다) · count(같은 날 여러 건: `space.20` 원 `border.strong` 테두리 + 숫자 caption 600) · overdue(지난 기한 칸 `space.64` + `space.8`, 오른쪽 점선 `border.strong`, "circle-alert" 아이콘 `status.danger.default` + "지남 n" caption 600) · panel(묶음을 누르면 띠 아래 `border.divider` `radius.md` 상자: 머리(묶음 이름 + 닫기 IconButton sm) + 기한 줄) · row(점 · 이름 · 범주 `fg.secondary` caption · 남은 날 "D-3" · "2일 경과" · "끝남" tabular, 최소 높이 `density.row-height`) · empty("이 기간에 기한이 없습니다" caption `fg.secondary`). 좁은 화면(breakpoint.sm 미만): list(ol, 날짜마다 머리 "11월 10일(화)" label 600 `fg.secondary` + 기한 줄, 줄 사이 `border.divider`) · today-tag(오늘 머리 옆 `fg.strong` 바탕 + `fg.inverse` 글자 "오늘").
## Props
contract 표.
## Variants
days 7~60(기본 30). start가 없으면 오늘부터. onItemPress가 있으면 점 하나가 바로 그 기한을 열고, 없으면 점은 그날 목록(패널)을 연다. 지난 기한 칸은 첫날 전에 끝나지 않은 기한이 있을 때만 생긴다.
## States
default · hover(점 · 줄 `bg.sunken`) · focus(`.tl-focusable` 링). 끝난 기한은 속 빈 점 + 흐린 글자 + 취소선(줄), 지난 기한 줄은 경고 아이콘 + 남은 날 글자 `fg.primary` 600. active · disabled · loading · error는 해당 없음(불러오는 중은 부르는 쪽이 Skeleton, 표시 전용 부품이라 끌 수 있는 동작이 없다).
## 동작
contracts `groupDeadlines(items, start, days)`가 묶는다: 첫날 전 끝나지 않은 기한은 지남 하나로(날짜순), 범위 안은 날짜마다(끝나지 않은 것 먼저 · 받은 순서), 끝 다음 날짜와 첫날 전에 끝난 기한은 뺀다. 같은 날 여러 건은 숫자 묶음 하나다. 점 하나를 누르면 onItemPress(그 기한)이고, onItemPress가 없거나 묶음 · 지남이면 띠 아래에 그날 목록이 열린다(다시 누르거나 Esc · 닫기로 닫힌다). 넓은 칸(960 초과)은 날마다 날짜 글자를, 좁은 칸은 첫날 · 1일 · 월요일 · 오늘만 둔다. 화면 폭이 breakpoint.sm보다 좁으면 가로 축 대신 날짜순 세로 목록이다(지난 기한이 맨 위, 오늘은 기한이 없어도 한 줄). 344 ~ 1440 어디서도 가로로 넘치지 않는다. 점 색은 범주만 말하고, 뜻은 범주 글자 · 이름이 말한다. 범주 식별색 토큰(R-38)이 들어오면 color가 그 슬롯도 받는다.
## 접근성
구조는 날짜순 목록(`ol`, 이름 = caption)이고 가로 배치는 CSS다. 날짜 축은 `aria-hidden`. 점 하나의 이름은 "11월 10일(화) · 이서연 4대보험 취득신고 · 사람 · D-4"(끝났으면 "끝남"), 묶음은 "11월 10일(화) · 3건", 지남은 "지난 기한 2건"이고 묶음 · 지남 단추는 `aria-expanded` · `aria-controls`로 패널을 가리킨다. 점 목록은 Tab 정류장이 하나이고 ← → Home End로 점을 옮긴다. Enter · Space로 연다. 패널이 열리면(onItemPress가 있을 때) 첫 줄로 초점이 가고, Esc는 패널을 닫고 연 점으로 돌아온다. 패널은 `role="group"` + 묶음 이름. 오늘은 글자 "오늘"로도 보인다(색만으로 말하지 않는다).
## 밀도
점 줄 높이 `space.32`, 누르는 자리 `space.24`(칸이 좁아도 줄지 않고 옆 칸 위로 겹친다). 기한 줄 최소 높이 `density.row-height`, 글자 `density.body-font-size`. 좁은 화면은 touch 밀도를 따른다.
## 플랫폼 차이
웹만. 네이티브는 1.0 뒤(D-101)이고 같은 contract로 세로 목록부터 만든다.
## 금지 사항
차트 라이브러리로 기한 축을 그리기(R-40) → DeadlineStrip · 오늘 표시를 브랜드색만으로(위험색과 겹친다, R-43) · 기한 색을 상태색(success · warning · danger)으로 범주 대신 쓰기 · 왼쪽 색 띠(D-57) → 리뷰.
## 스토리
ThirtyDays · OverdueAndPress · TwoWeeks.
## 참고
R-40(서비스 30일 기한 타임라인), D-138(제안 B: 새 컴포넌트, TeamSchedule 일반화 대신), `groupDeadlines` · `deadlineItemText`(contracts), DueBadge의 남은 날 글자(`formatDueDays`), R-38 범주 식별색(점 색 슬롯).
