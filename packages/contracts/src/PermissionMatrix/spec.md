# PermissionMatrix
## 용도
역할 하나의 권한을 대상(모듈 · 화면) × 동작(조회 · 등록 · 수정 · 삭제 · 승인 · 다운로드) 표와 데이터 범위(전사 · 본부 · 부서 · 본인)로 정하거나 보여 줄 때 쓴다(platform/admin/roles). 역할은 부르는 쪽이 탭 · 목록으로 고른다. 켜고 끄는 설정 몇 개는 Switch · CheckboxGroup, 사람마다 값을 고치는 표는 DataGrid.
## 해부(Anatomy)
root(`tl-permission-matrix`) · scope(데이터 범위: 라벨 `type.label` 600 `fg.secondary` + RadioGroup 가로, 읽기 전용은 글자) · scroll(`border.divider` 1px, `radius.md`, 넘치면 가로 스크롤) · grid(role=grid) · head(열 머리 `bg.sunken`, `type.label` 600 `fg.secondary`) · row(최소 높이 `density.row-height` + `space.8`, 줄 사이 `border.divider`, 가리키면 `bg.sunken`) · resource(첫 열, 가로로 넘길 때 붙어 있다: ModuleIcon 32 또는 아이콘 칸 `bg.sunken` · 이름 500 · 보조 `type.caption` `fg.secondary`, 켠 칸이 없으면 "권한 없음") · box(체크 상자: 누르는 자리 `space.32`, 보이는 상자 16 `fg.tertiary` 테두리, 켜면 `brand.default` + `brand.on-brand` 체크) · mark(읽기 전용: 체크 `fg.link` · 대시 `fg.tertiary`).
## Props
contract 표.
## Variants
편집(기본) · 읽기 전용(readOnly) · 잠금(disabled, 칸은 초점을 받고 바뀌지 않는다). 줄마다 disabled(켜지지 않은 모듈 · 시스템 줄)를 둘 수 있다. scopes가 있으면 표 위에 범위 고르기가 생긴다.
## States
default · hover(줄 `bg.sunken`, 상자 테두리 `border.focus`) · focus(상자 둘레 링 `border.focus` 2px, 읽기 전용은 칸 안쪽 링) · disabled(상자 `bg.sunken` · `border.default`, 체크 `fg.disabled`, `aria-disabled`. 잠긴 줄의 이름 · 설명은 `fg.tertiary`(4.5:1 이상, 잠긴 까닭을 읽어야 하므로 비활성 글자색을 쓰지 않는다)). active · loading · error는 해당 없음.
## 동작
칸을 누르거나 Space · Enter를 치면 켜고 끈다. 켜면 그 동작의 requires(수정 → 조회)를 같이 켜고, 끄면 그 동작을 requires로 둔 동작도 같이 끈다(contracts `applyPermission`, 이어서 따른다). onChange는 따른 뒤의 값 전부와 누른 칸(resource · action · granted)을 받는다. 값의 동작 순서는 열 순서다. value를 주면 컨트롤드, defaultValue는 언컨트롤드다. scope도 같다.

| 키 | 동작 |
| --- | --- |
| Tab | 격자로 들어온다(마지막에 있던 칸). 다시 Tab이면 밖으로 |
| ← · → · ↑ · ↓ | 칸 옮기기(끝에서 멈춘다) |
| Home · End | 그 줄 첫 · 끝 칸 |
| Ctrl+Home · Ctrl+End | 첫 칸 · 끝 칸 |
| Space · Enter | 칸 켜고 끄기(읽기 전용 · 잠금은 바뀌지 않는다) |

## 접근성
`role="grid"` + `aria-label`(label), 읽기 전용은 `aria-readonly`. 머리는 `columnheader`, 첫 열은 `rowheader`. 칸 안 상자는 `role="checkbox"` + `aria-checked`, 이름은 "대상 동작"(구매 조회). 잠긴 칸은 `aria-disabled`라 초점은 받고 바뀌지 않는다. 읽기 전용 칸은 `gridcell`이 초점을 받고 숨은 글자 "허용 · 없음"을 읽는다. 범위 고르기는 RadioGroup(이름 "데이터 범위"). 탭 정류장은 하나다(roving tabindex). 대비: 이름 `fg.primary`, 보조 `fg.secondary`, 상자 테두리 `fg.tertiary`(3:1 이상, 비글자).
## 밀도
줄 최소 높이 `density.row-height` + `space.8`(compact 44 · comfortable 48), 열 폭 `space.64` ~ × 1.5, 첫 열 최소 `space.64` × 3. 누르는 자리 32는 밀도와 관계없다.
## 플랫폼 차이
네이티브는 대상마다 접히는 묶음 안에 동작 Switch 목록으로 그린다(좁은 화면에 6열이 들어가지 않는다). props와 requires 규칙은 같다.
## 금지 사항
role=table + Checkbox로 권한 표를 블록이 직접 → PermissionMatrix · 켠 칸 수를 회색 알약으로 · 권한 없음을 빨강으로(상태가 아니다) · requires를 화면마다 따로 짜기(`applyPermission`) → 리뷰.
## 스토리
Role · ReadOnly · Screens.
## 참고
SY-15 · PG-43, docs/spec/platform.md §3(역할 = 모듈별 동작 + 데이터 범위), blocks `_platform` ACTIONS · SCOPE_LABELS, WAI-ARIA APG Grid(데이터 격자). 블록: `platform/admin/roles`.
