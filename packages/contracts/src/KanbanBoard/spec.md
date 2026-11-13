# KanbanBoard
## 용도
건마다 단계가 있는 업무(영업기회 · 작업지시 · 요청 처리)를 단계 칸에 카드로 늘어놓고 단계를 옮길 때 쓴다. 칸 머리에 건수와 금액 합계가 보인다. 단계 없이 한 목록을 거르고 고르는 것은 DataGrid, 한 건의 진행 단계는 Stepper.
## 해부(Anatomy)
root(`role="region"`) · column(`bg.canvas`, `border.divider` 1px, `radius.lg`, 칸 사이 `space.12`) · head(StatusDot + 단계 이름 600 · 건수 `type.caption` `fg.secondary` · trailing `type.caption` `fg.secondary` · 합계 `type.h3` 700 tabular + 단위 `fg.secondary` · caption `type.caption` `fg.secondary`, 아래 `border.divider`) · card(`bg.surface`, `border.divider` 1px, `radius.md`, 안쪽 여백 `space.12`) · card 내용(KanbanCard: 제목 `type.label` 600 · description `type.caption` `fg.secondary` · 금액 `type.body` 700 + 오른쪽 trailing `type.caption` `fg.secondary` · 담당 Avatar 24 + 이름 · DueBadge 또는 상태 Badge) · move(카드 오른쪽 위 IconButton sm `ellipsis` → Menu. 제목 줄 오른쪽은 이 단추 자리) · drop(놓일 자리 `border.focus` 2 가로 선).
## Props
contract 표. 카드 값(KanbanCardItem)은 id · column · title · description · trailing · amount · owner · meta · due · done · doneLabel · status · locked이고, 칸(KanbanColumn)은 id · title · tone · trailing · caption · locked이다.
## Variants
layout 2. columns(넓은 화면 · 칸이 가로로 늘어서고 넘치면 보드 안에서 가로로 넘긴다), tabs(좁은 화면 · 단계 탭 + 고른 단계 한 열). onMove가 없으면 읽기 전용(옮기기 메뉴 · 끌기 없음). renderCard를 주면 카드 안 내용만 앱이 그리고 틀 · 옮기기 메뉴 · 끌기는 보드가 그린다.
## States
default · hover(카드 테두리 `border.strong`) · focus(카드 단추 링). 열린 카드(activeCardId)는 둘레 전체 `brand.default` 1px + 안쪽 1px. 끄는 카드는 흐리게, 놓을 칸은 테두리 `border.focus`. active · disabled · loading · error는 해당 없음.
## 동작
칸 안 카드 순서는 cards 배열 순서다. 보드는 카드 위치를 직접 바꾸지 않고 onMove(cardId, toColumn, index)로 알린다. 앱이 cards를 바꾸면 그대로 그린다. 실주처럼 확인이 필요한 단계는 onMove에서 대화상자를 먼저 열면 된다. index는 옮긴 뒤 그 칸 안의 순서(0부터)다.

옮기는 방법은 셋이다.
- 옮기기 메뉴. 카드 오른쪽 위 단추가 "옮길 칸" 메뉴를 연다. 지금 칸은 빠지고 잠긴 칸(locked)은 비활성이다. 고르면 그 칸 끝에 놓고 옮긴 카드로 포커스를 돌려준다. 키보드 · 손가락 · 화면 읽기 모두 이 길을 쓴다.
- 끌기. 마우스로 카드를 끌어 다른 칸이나 같은 칸의 다른 자리에 놓는다(draggable, 넓은 화면). 놓일 자리에 가로 선이 보인다.
- 좁은 화면. 메뉴가 아래 시트로 열린다(Menu D-60).

| 키 | 동작 |
| --- | --- |
| Tab | 카드 · 옮기기 단추 순서로 |
| ArrowUp · ArrowDown | 같은 칸의 위 · 아래 카드 |
| ArrowLeft · ArrowRight | 옆 칸(빈 칸은 건너뜀)의 같은 줄 카드 |
| Enter · Space | 카드 열기(onCardPress) |

좁은 화면(`breakpoint.sm` 미만)은 단계 Tabs(이름 + 건수)와 고른 단계 한 열이다. 가로로 넘기는 칸 목록 대신 탭을 쓴다. 모든 단계의 건수가 한눈에 보인다(원칙 2). 세로로 넘기는 화면 안에 가로 넘김이 겹치지 않는다. 카드가 폭 전체라 제목이 잘리지 않는다. 단계가 흔히 6개라 칸이 5개까지인 SegmentedControl 대신 넘치면 흐려지는 Tabs를 쓴다.
## 접근성
root는 `role="region"` + label. 칸은 `role="group"`이고 이름은 "단계 이름 N건"이다. 카드는 목록 항목 안의 단추(onCardPress가 있을 때)이고 이름은 카드 글자 전부다. 열린 카드는 `aria-current="true"`. 옮기기 단추 이름은 "제목 옮기기", 메뉴 · 시트 제목은 "옮길 칸". 끌기는 마우스 전용 보조 수단이고 같은 일을 메뉴로 할 수 있다. 상태 색(StatusDot · DueBadge)은 늘 글자와 함께 보인다. 좁은 화면 옮기기 단추와 탭은 40 이상이다.
## 밀도
칸 최소 폭 176(1024 미만 224 · 80%), 카드 안쪽 여백 `space.12`, 카드 사이 `space.8`, 옮기기 단추 `density.control-height-sm`. 휴대폰(touch)에서 단추는 40.
## 플랫폼 차이
네이티브는 같은 props로 단계 탭 + 한 열을 그리고, 카드를 길게 누르면 옮기기 시트가 열린다. 끌기는 없다(Phase 3). 웹은 폭이 `breakpoint.sm`보다 좁으면 같은 모양이고 끌기를 끈다.
## 금지 사항
옮기기를 끌기로만 제공하기(메뉴 필수, 리뷰) · 칸 건수를 알약 배지로(D-56, 리뷰) · 카드 왼쪽에 상태 색 띠(D-57, 리뷰) · 칸마다 다른 바탕색(단계 색은 머리 점으로만, 리뷰) · 카드 안에 입력창.
## 스토리
Pipeline · ReadOnly.
## 참고
PF-15 후보 KanbanBoard · KanbanCard(crm/opportunities/pipeline 블록). 좁은 화면 고르기는 D-60, 휴대폰 밀도는 D-61.
