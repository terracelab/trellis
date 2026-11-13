# NotificationList
## 용도
알림 여러 건을 목록으로 보일 때 쓴다(상단 바 종 단추로 여는 알림 서랍 · 알림 화면). 한 줄 모양은 NotificationItem이고, 홈 화면 모듈 타일은 NotificationCard다.
## 해부(Anatomy)
root(grid, 간격 `space.16`) · bar(읽지 않음 N건 `type.label` `fg.secondary` + "모두 읽음" Button ghost sm, onMarkAllRead가 있고 읽지 않은 것이 있을 때만) · group(heading `type.caption` 600 `fg.secondary` + list) · list(`<ul>`, 줄 사이 `border.divider` 1px) · empty(가운데 한 줄 `fg.secondary`).
## Props
contract 표.
## Variants
groupBy day(기본: 오늘 · 어제 · 이번 주 · 이전) · none(한 목록). 빈 목록.
## States
default. 불러오는 중은 서랍 · 화면이 Skeleton(list)으로 그린다(목록이 아직 없으므로).
## 동작
items 순서는 상관없다. 날짜 묶음은 현지 날짜로 센다(`relativeDayGroup`): 오늘 · 어제 · 이번 주(월요일 시작, 오늘 · 어제 밖) · 이전. 묶음 안에서는 읽지 않은 것이 먼저, 그다음 최근 순이다. 빈 묶음은 그리지 않는다. 줄을 누르면 onItemPress(id): 부르는 쪽이 읽음 처리 후 화면을 옮긴다. "모두 읽음"을 누르면 onMarkAllRead. 상대 시각 · 묶음 기준은 now(없으면 지금).
## 접근성
묶음마다 제목(h3 기본, headingLevel) + 그 제목으로 이름 붙은 목록(`<ul aria-labelledby>`). 묶지 않으면 목록 이름 = label(기본 "알림"). 빈 상태는 `role="status"`. 읽지 않은 건수는 머리 줄 글자로 읽힌다.
## 밀도
줄은 NotificationItem 밀도를 따른다. 묶음 사이 `space.16`.
## 플랫폼 차이
네이티브는 SectionList(묶음 머리 고정).
## 금지 사항
알림 서랍을 블록 · 앱이 손으로 짜기 · 줄마다 카드 · 묶음 제목을 큰 글자로 · 읽지 않은 것만 색 면으로.
## 스토리
Default(VRT) · Empty · InDrawer(종 단추 + 서랍).
## 참고
서비스 점검 R-37 7번(앱 `.app-note*`), PR-32. content.md §4 상대 시간.
