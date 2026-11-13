# SelectableList
## 용도
목록 · 상세(master-detail) 화면의 왼쪽 세로 목록에서 하나를 골라 오른쪽 상세에 보여 줄 때 쓴다(메신저 방 목록 · 인사 마스터 사원 목록 · 임금명세서 지급 달 목록, R-T22). 행이 열 여럿인 표는 DataGrid, 폴더 계층은 FolderTree, 화면 이동 메뉴는 SideNav, 큰 선택 카드(요금제 · 방식)는 SelectableCard.
## 해부(Anatomy)
root(`div` role=group, `tl-selectable-list`) · group(묶음 머리 `type.caption` 600 `fg.secondary` + `ul`) · item(`button`, 모서리 `radius.md`, 최소 높이 `density.row-height`) · leading(Avatar 32 · sm 24, 꾸밈, 접속 점 / 아이콘 칸 `bg.sunken` `fg.secondary`) · title(500, 고른 행 600, 안 읽은 행 700, 말줄임) · muted(`bell-off` 16 `fg.tertiary`) · secondary(`type.caption` `fg.secondary`, 말줄임) · presence(StatusDot sm, md 점 + 글자 · sm 점만) · end(meta `type.caption` `fg.secondary` tabular · value 600 tabular · count `type.caption` 600 `fg.link`, 알림 끔은 `fg.secondary`).
## Props
contract 표.
## Variants
variant 2 × size 2.

| variant | 고른 행 | 가리킨 행 |
|---|---|---|
| background(기본) | 바탕 `bg.rowSelected` | 바탕 `fg.primary` 5% 섞음 |
| ring | 1px 테두리 전체 `border.selected`, 바탕 없음 | 바탕 `fg.primary` 5% 섞음 |

| size | 아바타 · 아이콘 칸 | 줄 | 여백 |
|---|---|---|---|
| sm | 24 | 한 줄: 제목 옆 보조 글자, 근무 상태는 점만 | `space.6` `space.8` |
| md(기본) | 32 | 두 줄: 제목 아래 보조 글자 + 근무 상태 점 · 글자 | `space.8` |

왼쪽 굵은 색 띠는 없다(D-57). 안 읽음 수는 회색 알약이 아니라 caption 숫자다(99 넘으면 99+).
## States
default · hover(바탕 `fg.primary` 5% 섞음, `duration.fast`) · active(10% 섞음) · focus(행 안쪽 포커스 링 `border.focus` 2px) · disabled(행마다 `disabled`: 글자 `fg.disabled`, 초점 · 고르기 없음) · loading(`loading`: Skeleton list 5행, `aria-busy`). error는 해당 없음(불러오기 실패는 부르는 쪽이 EmptyState).
## 동작
행을 누르거나 Enter · Space를 치면 `onSelect(id)`를 부른다. selected를 주면 컨트롤드, defaultSelected는 언컨트롤드다. 고른 행은 `aria-current="true"`다.

| 키 | 동작 |
|---|---|
| Tab | 목록으로 들어온다(초점이 있던 행 → 고른 행 → 첫 행). 다시 Tab이면 목록 밖으로 |
| ↓ · ↑ | 다음 · 앞 행으로 초점(비활성 행은 건너뛴다). 고르지는 않는다 |
| Home · End | 첫 · 끝 행으로 초점 |
| Enter · Space | 초점 행을 고른다 |

탭 정류장은 하나다(roving tabindex). 화살표가 고르지 않으므로 상세를 불러오는 화면도 지나가는 행마다 불러오지 않는다. `group`이 바뀌는 자리마다 묶음 머리가 생기고 화살표는 묶음을 넘어 이어진다. 검색 칸 · 좁은 화면의 접힘은 부르는 쪽(블록)이 맡는다.
## 접근성
root는 `role="group"` + `aria-label`(label), 묶음 `ul`은 묶음 머리로 이름(`aria-labelledby`). 행은 `button`이고 이름은 제목 + 접속 상태(숨은 글자) + 보조 글자 + 근무 상태 + 시각 · 값 + 안 읽음 수("읽지 않음 3", `countLabel`). 알림 끔 아이콘은 이름 "알림 끔"이 있다. 아바타는 꾸밈이다. 고른 행은 `aria-current`라 바탕색만으로 전하지 않는다. 대비: 제목 `fg.primary`, 보조 · 시각 `fg.secondary`(4.5:1), 수 `fg.link`. 포커스 링은 행 안쪽이라 스크롤 상자에 잘리지 않는다.
## 밀도
행 최소 높이 `density.row-height`(compact 36 · comfortable 40 · touch 48), 글자 `density.body-font-size`. 두 줄(md) 행은 아바타 32 + 여백 8로 48이다.
## 플랫폼 차이
네이티브는 FlatList + Pressable 행, `accessibilityState={{ selected }}`, 화살표 키 대신 스크린 리더 쓸어 넘기기. props는 같다.
## 금지 사항
li · button + CSS로 고르는 목록을 블록이 직접(R-T22) → SelectableList · 고른 행을 왼쪽 굵은 색 띠로(D-57, check-blocks가 막는다) · 안 읽음 수를 회색 알약으로 · 화살표로 바로 고르게(지나가는 행마다 상세를 불러온다) · 행 안에 단추 넣기 → 리뷰.
## 스토리
Rooms · People · Months · Compact.
## 참고
R-T22(고르는 세로 목록), SY-7 · SY-15, R-T26(사람 상태 어휘 관계, contracts `_shared/presence.ts`), PersonLabel(같은 사람 모양), FolderTree(roving 키보드), DataGrid `bg.rowSelected`. 블록: `groupware/messenger/chat` · `erp/hr-payroll/hr-master` · `erp/hr-payroll/payslip`. 벤치마크는 구조만.
