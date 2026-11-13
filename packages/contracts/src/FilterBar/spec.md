# FilterBar
## 용도
목록 화면에서 DataGrid 바로 위에 검색 · 필터 · 초기화 · 결과 건수 · 일괄 동작을 한 줄로 둔다. 많은 조건을 펼쳐 입력하는 상세 검색은 Drawer 안의 Form.
## 해부(Anatomy)
root(`tl-filter-bar`, 자기 바탕 · 구분선 없음) · search(맨 앞) · filters(컨트롤 사이 `space.8`. PR-27: label이 있는 Select · MultiSelect · PeriodPicker는 "이름 값 ▾" 칩 하나(`border.default` · `radius.md`, 이름 `fg.secondary`, 값 600). 기본값(빈 값 · `all` · 첫 옵션 = "전체")인 칩은 회색이고, 다른 값을 고른 칩만 `border.selected` + `brand.subtle` 바탕 + 이름 `fg.link`. search는 칩과 같은 `control-height-md`(앱이 sm을 줘도), 폭 `space.64` × 5, 테두리 `border.strong` · 아이콘 `fg.secondary`로 줄의 첫 행동이 묻히지 않게) · chip-clear(PR-30: 기본값이 아닌 칩 끝 × 단추, 칩 높이 전체 · 폭 `space.32` 이상, 아이콘 16 `fg.secondary` → 가리키면 `fg.primary`) · reset(ghost Button md, rotate-ccw. 줄의 검색 · 칩과 같은 `control-height-md`라 sm으로 줄이지 않는다. 칩이 아닌 컨트롤(SegmentedControl 등)도 한 줄에서는 md로 둔다, D-135) · count("검색 결과 128건", `type.caption` `fg.secondary`, 숫자 `fg.primary` 500 tabular) · actions(오른쪽 끝). 좁은 화면(PR-30): search(한 줄 전체) · chips(가로로 미는 한 줄, 맨 앞 filter secondary Button sliders-horizontal "필터 2", 그 뒤 칩. 칩 · 단추 높이 `size.touch.min`) · sheet(제목 "검색 조건", 컨트롤 높이 `space.40`, footer 초기화 · 건수 보기) · choices(시트 안 칩 묶음, 칩 높이 `size.touch.min` · `border.default` · `radius.md`, 고른 칩은 `border.selected` + `brand.subtle` + `fg.link` 600 + check 아이콘).
자기 면을 갖지 않고 놓인 곳의 바탕(화면이면 `bg.canvas`)을 그대로 쓰는 도구 줄이다. DataGrid 바로 위에 두고, 위 덩어리(머리 · 배너)보다 표에 더 가깝게 붙인다(블록 배치는 `space.12`). grid(PR-26): root(`border.divider` · `radius.lg` · `bg.surface`) · field(라벨 열 `space.64` × 1.5, `bg.sunken` · `type.label` fg.secondary + 입력 칸, 칸 · 줄 사이 `border.divider`. 조건이 줄을 다 채우지 못해도(3칸에 조건 둘) 줄 구분선은 오른쪽 끝까지 이어진다) · 검색어(search, 한 줄 전체) · foot(건수 · 접기 ghost · 초기화 secondary · 검색 primary · actions) · summary(PR-30: 접힌 grid의 적용 조건 칩 한 줄, 칩 높이 `control-height-sm`, 조건이 없으면 "걸린 조건 없음" `type.caption` `fg.secondary`).
## Props
contract 표.
## Variants
search · reset · count · actions 각각 있음 · 없음. layout inline(기본) · grid(columns 2 · 3). 칩 해제(onClearFilter 또는 컨트롤 onChange) · grid searching · grid collapsible(PR-30).
## States
default. 상태는 안의 컨트롤이 가진다. grid의 searching은 검색 단추가 loading 모양이 된다(FilterBar 자체 상태는 아니다). 나머지는 해당 없음.
## 동작
한 줄이 기본이고 폭이 좁으면 줄바꿈한다(actions는 오른쪽 끝을 지킨다). onReset이 있으면 초기화 버튼이 보인다. 값은 화면이 들고 FilterBar는 배치만 한다(컨트롤은 `value` + `onChange`로 쓴다).

**칩 해제(PR-30).** 기본값이 아닌 칩(PR-27의 칠한 칩) 끝에 × 단추가 선다. 누르면 `onClearFilter(name)`을 부른다. name은 컨트롤의 `name`, 없으면 `label`이다. onClearFilter가 없으면 컨트롤의 `onChange`에 기본값을 보낸다. Select는 첫 선택지 값("전체"), MultiSelect는 빈 목록이다. 값을 화면이 들지 않는 컨트롤(`value` 없음)은 해제 단추가 없다. PeriodPicker는 기본값이 없어 칠하지도 해제하지도 않는다. 해제 단추는 사라지므로 포커스는 그 칩의 컨트롤로 옮긴다(접힌 요약 칩은 "조건 펼치기" 단추로).

**좁은 화면(PR-30).** 폭이 `breakpoint.sm`보다 좁으면 검색 한 줄, 칩 줄, 건수 · 동작 줄이 된다. 칩 줄은 한 줄이고 넘치면 가로로 민다. 맨 앞은 "필터" 단추(activeCount를 주면 "필터 2")이고 그 뒤에 label이 있는 Select · MultiSelect · PeriodPicker가 넓은 화면과 같은 칩으로 선다. 칩을 누르면 그 조건의 시트(컨트롤 자신의 시트)가 바로 열린다. 칩과 단추는 손가락 크기(`size.touch.min`)다. label이 없는 컨트롤은 칩 줄에 서지 않고 "검색 조건" 시트에만 놓인다. "필터" 단추는 모든 조건을 한 줄에 하나씩 놓은 "검색 조건" 시트를 연다. 시트 아래는 초기화 · "837건 보기"(닫기). 시트에서 label을 가진 컨트롤은 위에 그 이름을 글자로 보인다(화면 낭독기에는 컨트롤 이름으로 이미 읽혀 숨긴다).

**시트 안 칩 묶음(PR-30).** "검색 조건" 시트 안의 Select · MultiSelect는 선택지가 6개 이하(`FILTER_INLINE_MAX`)이고 값을 화면이 들면(`value` + `onChange`) 시트를 하나 더 열지 않고 칩 묶음으로 바로 펼친다. Select는 하나만 고르는 radio 칩(누르면 바로 바뀐다), MultiSelect는 여럿 고르는 checkbox 칩이다. 칩은 손가락 크기이고 줄이 차면 다음 줄로 넘어간다. 선택지가 7개 이상이거나 값을 화면이 들지 않으면 컨트롤을 그대로 두고, 누르면 그 위에 시트를 하나 더 연다(PeriodPicker도 같다). layout="grid"는 조건을 여럿 고른 뒤 검색하는 조회 화면용이다(국내 ERP 조회 화면 문법, PR-26). label을 가진 컨트롤은 라벨 열에 그 이름을 보이고, search는 "검색어" 줄로 한 줄 전체를 쓴다. onSearch가 있으면 검색 단추가 보이고 입력 칸 Enter도 검색이다(form submit). 1024 미만은 한 줄에 한 칸, `breakpoint.sm` 미만은 inline과 같은 칩 줄 + 시트. `searching`(PR-30)이 켜져 있으면 검색 단추가 loading 모양이 되어 누를 수 없고, 입력 칸 Enter도 onSearch를 부르지 않는다. 폼은 `aria-busy`. `collapsible`(PR-30)이면 foot에 "조건 접기" 단추가 선다. 접으면 격자를 숨기고(입력한 글자는 남는다) 그 자리에 적용한 조건을 칩 한 줄로 요약한다. 요약 칩은 기본값이 아닌 label 컨트롤("입고 상태 입고 완료")과 검색어(search가 `value`를 가진 입력일 때)이고, 컨트롤 칩에는 해제 단추가 있다. 걸린 조건이 없으면 "걸린 조건 없음". 처음에는 펼쳐 둔다. 검색 뒤 표를 넓게 보고 싶을 때 접는다.
## 접근성
`role="search"` + `aria-label`(`label`, 없으면 "검색 조건"). 한 화면에 FilterBar가 둘 이상이면 묶음마다 `label`을 다르게 준다(같은 이름의 search 영역이 둘이면 구별되지 않는다, axe landmark-unique). 결과 건수는 `aria-live="polite"`라 필터를 바꾸면 읽힌다. 컨트롤마다 접근성 이름이 있어야 한다(라벨 없는 Select는 placeholder가 아니라 aria 이름으로). PR-30: 칩 해제 단추 이름은 "<이름> 조건 지우기". 시트 안 칩 묶음은 `role="radiogroup"`(Select) · `role="group"`(MultiSelect)이고 위 이름 글자가 `aria-labelledby`로 묶음 이름이 된다. 칩은 `role="radio"` · `role="checkbox"` + `aria-checked`이고 고른 칩은 색 말고 check 아이콘으로도 보인다. 접기 단추는 `aria-expanded` + `aria-controls`(격자), 접힌 요약은 `role="group"` + "적용한 조건". 좁은 화면 칩 줄은 단추로만 이루어져 Tab으로 지나며 보이는 자리로 밀린다.

| 키 | 동작 |
|---|---|
| Tab | 검색 · 칩 · 해제 단추 · 초기화 · 동작을 차례로 |
| Enter(grid 입력 칸) | 검색(searching 중에는 무시) |
| Space · Enter | 칩 해제 · 접기 · 시트 안 칩 고르기 |
## 밀도
위아래 `space.8`, 좌우 `density.card-padding`. 컨트롤 높이는 `density.control-height-md`. 좁은 화면 칩 · "필터" 단추 · 시트 안 칩은 밀도와 관계없이 `size.touch.min`(44).
## 플랫폼 차이
네이티브는 웹 좁은 화면과 같다(검색 한 줄 + 필터 버튼 → 바텀시트). props는 같다.
## 금지 사항
inline에서 두 줄 넘김(grid나 상세 검색으로) · inline에서 필터마다 바깥 라벨 · inline에서 검색 버튼 따로 두기(바로 반영. grid는 조건을 다 고른 뒤 검색 단추) · 좁은 화면에서 칩 줄을 여러 줄로 감기(가로로 민다) · 시트 안 선택지가 적은데 시트를 하나 더 열기 → 리뷰(components.md §10 ListDetail).
## 스토리
Default · WithActions · Narrow(칩 줄 + 시트). LookupGrid(grid · collapsible) · AppliedFilters(칩 해제).
## 참고
components.md §10 ListDetail. PR-26(grid). PR-30(좁은 화면 칩 줄 · 칩 해제 · 시트 안 칩 묶음 · searching · collapsible, notes/component-parity-2026-11.md §5 18~21).
