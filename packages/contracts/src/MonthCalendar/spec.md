# MonthCalendar
## 용도
한 달의 일정(회의 · 휴가 · 마감 · 출장)을 날짜 칸에 놓아 보여 줄 때 쓴다. views를 주면 주 · 일 시간표로 바꿔 시간 일정을 시각 칸에 놓는다(PG-42). 날을 고르면 그날 일정을 옆 칸이나 아래 목록에 보인다. 날짜 하나를 입력하는 것은 DateField, 기간은 PeriodPicker, 날짜별 양(출고량 · 매출)의 진하기는 CalendarHeatmap, 여러 사람의 휴가 · 근무 막대는 TeamSchedule.
## 해부(Anatomy)
root(`bg.surface`, `border.divider` 1px, `radius.lg`) · head(이전 · 다음 IconButton, 기간 이름 `type.h2`, 오늘 Button sm, 건수 `type.label` `fg.secondary`, 보기 바꾸기 SegmentedControl sm, 앱 자리 actions) · weekdays(요일 머리 `type.caption` 600 `fg.secondary`, `bg.canvas`) · day(칸 `bg.surface`, 다른 달 `bg.canvas`, 칸 사이 `border.divider`) · date(칸 전체를 덮는 날 단추, 숫자 `type.label` 600) · chip(`bg.sunken`, `radius.xs`, `type.caption`, 앞 표시 + 시각 `fg.secondary` + 제목) · marks(R-37 8: 점 8 하나 또는 colors 여럿 4개까지 + "+n" `fg.secondary` 600, 그 뒤 유형 아이콘 16 `fg.secondary`. 지연이면 아이콘 자리에 circle-alert `status.danger.default`) · more(`type.caption` 600 `fg.secondary`) · agenda(좁은 화면 일정 목록, 행 사이 `border.divider`).
주 · 일 보기: heads(날 머리 `bg.sunken`, 요일 `type.caption` 600 + 숫자, 고른 날 `brand.subtle`) · allday(종일 줄, 칩) · hours(시각 눈금 `type.caption` `fg.secondary` tabular, 정시 선 바로 아래) · columns(날마다 칸, 정시마다 `border.divider` 선, 한 시간 `space.48`) · block(시간 일정: `bg.sunken` · `border.default` 1px · `radius.sm`, 점 + 시각 `fg.secondary` + 제목 600, 일 보기는 meta까지) · now(지금 선 `fg.strong` 2px + 앞 점 8, 위험 빨강이 아닌 중립색) · week-list(좁은 화면 주 보기: 날마다 머리 + 일정 목록).
일정 색은 `color.chart.series.1~5` · `color.status.*.default`를 점으로만 쓴다. 칩 · 블록 바탕은 중립이다.
## Props
contract 표.
## Variants
view 3: month(기본) · week(7일 시간표) · day(하루 시간표). views에 둘 이상을 주면 머리에 보기 바꾸기가 생기고, 기본 views = ['month']라 지금까지와 같은 월 달력이다. layout 2: grid(넓은 화면) · compact(좁은 화면). layout은 화면 폭이 정하고 prop이 아니다. size 2(R-43 5): md(기본, 칸에 칩) · sm(칸 최소 높이 `space.48`, 날 숫자 아래 점 3개 + 2건 이상이면 건수 `type.caption` `fg.secondary` tabular. 옆 목록과 나란히 두는 보조 달력, 주 · 일 보기는 md와 같다). 좁은 화면의 월 보기는 숫자 + 점 3개 + 아래 일정 목록, 주 보기는 날마다 일정 목록, 일 보기는 한 칸 시간표다. onEventPress가 있으면 칩 · 블록이 버튼이다.
## States
default · hover(칸 `bg.sunken`, 날 머리 `bg.canvas`, 칩 단추는 `bg.canvas` + 1px `border.default`, 블록 단추는 `bg.canvas` + `border.strong`) · focus(날 단추 링을 칸 안쪽에, 칩 · 블록 단추는 둘레). 오늘은 숫자를 채운 원(`fg.strong` · `fg.inverse`, 회사 색이 아닌 중립색. 위험 빨강 배지와 한 화면에서 같은 색으로 읽히지 않게, D-146 제안), 고른 날은 칸 · 날 머리 바탕 한 단계(`brand.subtle`). 좁은 화면에서 고른 날은 숫자 원에 `brand.subtle`을 깔고, 오늘을 고르면 채운 원 그대로다. 주말 숫자는 `fg.secondary`, 다른 달 숫자는 `fg.tertiary`. 일정 상태(R-37 8): done = 속 빈 점 + 제목 `fg.secondary` 취소선, late = 경고 아이콘 `status.danger.default`. 둘 다 이름 끝 숨은 글자("끝남" · "지연")로도 읽는다. active · disabled · loading · error는 해당 없음.
## 동작
주는 일요일에 시작하고 그달이 걸친 주(5 · 6주)만 그린다. 여러 날 일정(endDate)은 사이의 날마다 보인다. 칸 안 순서는 종일 일정이 먼저, 그다음 시작 시각 순이다. maxEvents(기본 3)를 넘으면 "N건 더"를 보이고, 칸을 누르면 그날을 고른다. 다른 달 날을 고르거나 키보드로 넘어가면 그 달로 바뀐다. 오늘 단추는 오늘이 있는 기간으로 가서 오늘을 고른다. 머리 건수는 보이는 기간에 걸친 일정 수다. 날을 고르면 onSelectDay와 함께 onDayPress(날, 그날 일정 — 여러 날 일정 포함, 종일 먼저 · 시각 순)가 불린다. size="sm"이면 옆 목록을 이것으로 채운다. 칩 제목이 칸 폭에서 잘리면 가리킬 때만 전체 제목을 `title`로 단다(잘리지 않은 칩 · 앱이 단 title은 그대로). 글자 칩을 눌러도 그 날을 고른다. colors는 같은 날 · 같은 일정이 여러 범주(법인 세 곳의 급여일)에 걸칠 때 칩 하나에 점을 늘어놓는 것이다. 법인 색(R-01 entity 토큰)이 들어오면 그 슬롯도 받는다.

주 · 일 보기: 보이는 날은 탭 정류장 날(옮겨 다닌 날 → 고른 날 → 오늘 → 그달 1일)이고, 주 보기는 그 날이 든 주(일요일 시작)다. 이전 · 다음은 한 주 · 하루씩 옮기고 그 날이 든 달로 onMonthChange를 부른다. 시간표 범위는 timeRange(기본 08:00~20:00)이고 범위 밖 일정이 있으면 그 일정까지 정시 단위로 늘어난다. 끝 시각이 없는 일정은 30분 칸이다. 겹치는 일정은 칸을 나눠 나란히 놓는다(contracts `layoutCalendarDay`). 종일 · 여러 날 일정은 종일 줄에 칩으로, maxEvents를 넘으면 "N건 더". now가 범위 안이면 오늘 칸에 지금 선이 그려진다(now가 없으면 today를 주지 않았을 때만 기기 시각).

| 키 | 동작 |
| --- | --- |
| ArrowLeft · ArrowRight | 하루 앞 · 뒤(주 · 일 보기도 같다. 넘어가면 보이는 주 · 날이 따라간다) |
| ArrowUp · ArrowDown | 한 주 앞 · 뒤 |
| Home · End | 그 주 일요일 · 토요일 |
| PageUp · PageDown | 한 달 앞 · 뒤(Shift를 누르면 한 해) |
| Enter · Space | 그날 고르기(onSelectDay) |
| Tab | 격자 · 날 머리에는 한 칸만 들어간다. onEventPress가 있으면 그 날의 일정 칩 · 블록으로 이어진다 |
| Escape | 칩 · 블록에서 그 날로 돌아온다 |

month · selected · view를 주면 제어, defaultMonth · defaultSelected · defaultView만 주면 컴포넌트가 들고 있다. 좁은 화면(`breakpoint.sm` 미만)의 월 보기는 칸에 숫자와 점 3개만 보이고, agenda가 true면 달력 아래에 고른 날의 일정 목록(시각 · 제목 · meta)이 붙는다. 화면이 일정 칸을 따로 그리면 agenda를 끈다. 좁은 화면의 주 보기는 7일을 날마다 일정 목록으로 보인다(칸 폭이 44 아래라 시간표 대신).
## 접근성
월 보기: `role="grid"` + `row` · `columnheader`(긴 요일 이름) · `gridcell`(`aria-selected`). 격자 이름은 "label + 기간 이름"(팀 일정 2026년 11월). 날 단추의 이름은 보이는 숫자 뒤에 숨은 글자를 붙여 "6일 금요일, 오늘, 선택됨, 일정 5건"으로 읽힌다(WCAG 2.5.3). 칩이 글자일 때는 화면 읽기에서 감추고 건수만 읽힌다. 칩 단추의 이름은 "09:00~10:00 주간 회의". 기간 이름은 `aria-live="polite"`라 바꾸면 읽힌다.
주 · 일 보기: 날 머리가 한 줄짜리 `role="grid"`(같은 날 단추 이름 · 키보드)다. 시간표 블록이 글자일 때는 블록을 감추고 숨은 일정 목록(날마다 "11월 6일(금), 일정 5건" + 시각 · 제목 · meta)을 읽는다. 블록이 버튼이면 이름이 "11월 6일(금) 09:00~10:00 주간 회의 장소"이고 숨은 목록은 없다(겹쳐 읽지 않게). 이름은 aria-label이 아니라 숨은 날짜 · 시각 글자와 보이는 제목(일 보기는 meta까지)으로 만든다. 보이는 글자가 이름 안에 그대로 있어야 하고(WCAG 2.5.3), 좁은 칸에서 보이는 시각을 감춰도 이름의 시각은 남는다. 지금 선 · 시각 눈금은 꾸밈이다. 일정 색은 점뿐이고 뜻은 글자가 말한다. 포커스 링은 항상 보인다. 좁은 화면 칸 · 날 머리는 손가락 높이(`density.row-height` 48)다.
## 밀도
칸 최소 높이는 넓은 화면 112(1024 미만 96), 칸 안쪽 여백 `space.4`, 칩 글자 `type.caption`. 시간표 한 시간 `space.48`, 눈금 칸 폭 `space.48` + `space.8`, 날 머리 높이 `density.row-height`. 1024 미만 주 보기는 블록 시각을 감추고 제목을 남긴다. 화면이 넓어도 날짜 칸 폭이 112 미만이면(옆 칸 · 카드 안) 같다. 좁은 화면 칸 높이 `density.row-height`, 숫자 원 32, 목록 행 `density.row-height`. 머리 좌우 여백 `density.card-padding`.
## 플랫폼 차이
네이티브는 같은 props로 compact 모양(숫자 + 점)과 아래 일정 목록, 일 보기 시간표를 그린다. 화살표 키 대신 칸을 누르고 좌우로 쓸어 기간을 바꾼다(Phase 3). 웹은 폭이 `breakpoint.sm`보다 좁으면 같은 모양으로 바뀐다(D-61).
## 금지 사항
일정 칩 · 블록 바탕을 캘린더 색으로 칠하기(점으로만, 리뷰) · 칩 · 블록 왼쪽에 색 띠(D-57, 리뷰) · 건수를 알약 배지로(D-56, 리뷰) · 칸 높이를 일정 수에 맞춰 늘리기(maxEvents로 자른다) · 일요일을 빨강으로(주말은 `fg.secondary`, 리뷰) · 블록이 시간표를 직접(→ view="week" · "day").
## 스토리
TeamSchedule · WeekView · DayView · PressEvents · SmallWithList.
## 참고
PF-15 후보 MonthCalendar(groupware/calendar/month 블록), SY-14 · PG-42(주 · 일 보기). 키보드는 `_internal/calendar.tsx`(DateField 달력)와 같다.
