# TeamSchedule
## 용도
팀원의 휴가 · 재택 · 출장 · 교육과 교대 근무를 날짜 칸에 펼쳐 볼 때 쓴다(팀 근태 · 휴가 관리 · 근무표). 한 사람의 한 달은 MonthCalendar.
## 해부(Anatomy)
범례(쓰인 종류만, 아이콘 + 글자) · 가로 스크롤 틀(`border.divider`, `radius.lg`) · 표: 이름 칸(고정, Avatar 24(이니셜은 Avatar 규칙의 두 글자) + 이름 + 보조 글자) · 날짜 머리(요일 · 날짜, 오늘 = `fg.strong` 원 + `fg.inverse` 글자(중립색, D-146 제안)) · 칸(주말 · 공휴일 연한 회색, 오늘 열 연한 회색(`fg.primary` 8%, 주말 4%보다 한 단계 짙게)) · 일정(`module.*.subtle` 바탕 + 종류 아이콘 `module.*.default` + 글자, `radius.sm`).
## Props
contract 표.
## Variants
days 7 · 14 · 28~31(칸 폭 96 · 64 · 40) × onEventPress 있음(단추) · 없음.
## States
default · hover(단추 일정 안쪽 1px 테두리) · focus(링) · loading(스켈레톤 행).
## 동작
여러 날 일정은 칸을 합친다(colSpan). 범위 밖으로 이어지는 일정은 그쪽 모서리를 각지게 한다. 한 사람의 일정이 겹치면 줄을 나누고 이름 칸이 그 줄을 함께 덮는다. 오전 반차는 하루 칸의 앞 반, 오후 반차는 뒤 반. 색이 같은 종류는 아이콘과 글자로 가른다(연차 · 보상 휴가 brand, 병가 red, 재택 teal, 출장 · 야간 violet, 외근 green, 교육 · 주간 amber, 휴무 · 기타 회색).
## 접근성
`<table>` + 숨은 caption, 날짜 머리는 "11월 6일 금요일 · 오늘"(칸 안 숨은 글자. 보이는 요일 · 날짜는 aria-hidden. aria-label만 두면 빈 머리 칸으로 잡힌다, R-37 9), 이름 칸은 `th scope="row"`. 단추 일정의 이름은 "이수민 · 연차 · 11월 5일(목)~11월 6일(금) · 사유". 스크롤 틀은 Tab으로 가서 화살표로 민다.
## 밀도
칸 높이 `density.row-height`.
## 플랫폼 차이
네이티브는 가로 스크롤 목록, 이름 칸 고정.
## 금지 사항
일정 왼쪽에 색 띠, 일정마다 알약 배지, 주말을 진한 색으로 칠하기 → 리뷰.
## 스토리
Week · Month · Shifts.
## 참고
D-56(왼쪽 띠 금지), 근로기준법 제60조(반차는 회사 규정).
