# DashboardGrid
## 용도
대시보드 화면에 카드(KPI · 차트 · 목록)를 12열 격자로 늘어놓고, 사용자가 순서를 바꾸거나 숨긴 배치를 저장할 때 쓴다. 홈 알림 카드 묶음(패턴 NotificationHome)과 블록의 `_ui` Grid도 이 격자다. 폼 칸 배치는 FormSection, 목록 · 상세 나란히는 블록의 Split을 쓴다.
## 해부(Anatomy)
root(`tl-dashboard-grid`, CSS grid 12열, 칸 사이 `density.gutter` · tight는 `space.12`) · item(`tl-dashboard-grid__item`, `data-span` · `data-rows`, 안의 카드가 높이를 채운다) · 편집 모드만: bar(위젯 위 한 줄, 높이 `density.control-height-sm`) · handle(`grip-vertical` 아이콘 + 위젯 이름 `type.label` 600, `fg.primary`) · prev · next(IconButton sm `arrow-left` · `arrow-right`) · hide(IconButton sm `eye-off`) · item 테두리(`border.default` 1px, `radius.lg`, 안쪽 여백 `space.8`, 바탕 `bg.canvas`) · hidden item(접힌 칸: bar만, 이름 옆 "숨김" `type.caption` `fg.secondary`, 보이기 Button sm `eye`, 바탕 `bg.sunken`) · live(`tl-sr-only`, `role="status"`).
## Props
contract 표. 위젯(DashboardWidget)은 id · title · span(2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 12, 기본 4) · rows(1 · 2) · hideable(기본 true) · content이고, 배치(DashboardLayout)는 `{ id, hidden? }[]`이다. 배열 순서가 화면 순서다.

웹은 고정 배치용 `DashboardGridItem`(span · rows · children)을 함께 내보낸다. widgets 없이 children으로 DashboardGridItem을 늘어놓으면 편집 모드 없는 격자다(블록 `_ui`의 Grid · Col이 이것을 감싼다).
## Variants
gap 2(gutter · tight). 고정 배치(children) · 위젯 배치(widgets) · 위젯 배치 + 편집 모드(editing).
## States
default · hover(편집 모드에서 위젯 테두리 `border.strong`) · focus(손잡이 · 단추 링 `border.focus`). active · disabled · loading · error는 해당 없음(위젯 안 카드가 맡는다).
## 동작
배치는 layout(제어) 또는 defaultLayout(비제어)이다. `dashboardLayoutOf(widgets, layout)`가 저장한 배치를 지금 위젯에 맞춘다. 저장한 순서를 지키고, 없어진 위젯은 빼고, 새 위젯은 뒤에 붙인다. 숨길 수 없는 위젯(hideable: false)은 저장값이 숨김이어도 보인다. 순서를 바꾸거나 숨기면 onLayoutChange(전체 배치)가 불린다. 앱은 그 값을 JSON으로 저장하고 다음에 layout으로 넘긴다. 위치를 바꾸는 순수 함수 `moveDashboardWidget` · `setDashboardWidgetHidden`도 contracts에 있다.

편집 모드(editing)는 앱이 켜고 끈다. 보통 PageHeader의 "배치 편집" 단추가 켜고 "완료"가 끈다. 편집 모드에서는 위젯 위에 한 줄이 생기고 위젯 안 내용은 `inert`라 눌리지 않고 Tab도 들어가지 않는다. 숨긴 위젯은 제자리에 접힌 칸으로 보이고 보이기 단추가 있다. 편집 모드가 아니면 숨긴 위젯은 그리지 않는다.

옮기는 방법은 둘이고 끌기는 없다. 키보드와 손가락 모두 같은 길을 쓴다.
- 손잡이에 포커스를 두고 화살표 키를 누른다.
- 앞으로 · 뒤로 단추를 누른다. 처음 · 끝에서는 그쪽 단추가 비활성이다.

| 키(손잡이) | 동작 |
| --- | --- |
| ArrowLeft · ArrowUp | 한 칸 앞으로 |
| ArrowRight · ArrowDown | 한 칸 뒤로 |
| Home · End | 처음 · 끝으로 |
| Tab | 손잡이 → 앞으로 → 뒤로 → 숨기기 → 다음 위젯 |
| Enter · Space | 단추 실행 |

옮긴 뒤에도 포커스는 옮긴 위젯의 같은 단추(비활성이 되면 손잡이)에 남는다. 숨기면 그 칸의 보이기 단추로, 보이면 숨기기 단추로 간다.

반응형: 폭 `breakpoint.xl`(1280) 미만에서 span 2 · 3은 6, span 4 · 5 · 7 · 8은 12가 된다. `breakpoint.lg`(1024) 미만에서는 모두 12이고 span 2 · 3만 6(둘씩)이다. `breakpoint.sm`(640) 미만 휴대폰은 한 줄에 하나이고 칸 사이가 `space.8`이다. 배치 순서는 폭과 관계없이 같다.
## 접근성
편집 모드의 root는 `role="list"` + label(없으면 "대시보드"), 위젯은 `role="listitem"`이라 "6개 중 3번째"를 읽는다. 손잡이는 `<button>`이고 이름은 "위젯 이름 위치 옮기기", 설명(`aria-describedby`)은 화살표 키 안내다. 앞으로 · 뒤로 · 숨기기 단추 이름에 위젯 이름이 들어간다("매출 추이 숨기기"). 옮기기 · 숨기기 · 보이기 결과는 `role="status"` 영역이 읽는다("매출 추이 위젯을 3번째로 옮겼습니다. 전체 6개"). 편집 모드가 아니면 root에 role이 없고 위젯 안 카드가 자기 제목을 가진다. 포커스 링은 항상 보인다. 움직임 줄이기에서도 순서가 바뀌는 것 외의 움직임은 없다.
## 밀도
칸 사이 `density.gutter`(compact 16 · comfortable 24 · touch 16), 편집 줄 높이 `density.control-height-sm`, 단추 sm. 휴대폰(touch)에서 단추는 40 이상.
## 플랫폼 차이
네이티브는 같은 props로 한 열 목록을 그리고 편집 모드에서 위 · 아래 단추와 숨기기를 둔다. 웹은 폭에 따라 12열 · 6열 · 한 열로 접힌다.
## 금지 사항
끌기로만 옮기기(키보드 · 단추 필수, 리뷰) · 위젯마다 다른 바탕색이나 왼쪽 색 띠(D-57, 리뷰) · 저장한 배치를 위젯 id 대신 순번으로 저장(위젯이 늘면 어긋난다, 리뷰) · 편집 모드에서 위젯 안 단추를 눌리게 두기(구현이 `inert`로 막는다).
## 스토리
Editing(편집 모드) · Static(고정 배치) · Saved(저장한 배치 · 숨긴 위젯).
## 참고
SY-12 · PG-39. 블록 `_ui`의 Grid · Col(12열, D-61 휴대폰 한 열)을 올렸다. 패턴 NotificationHome의 12열.
