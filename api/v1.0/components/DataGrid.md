# DataGrid

> `@terracelab/trellis-react` · CSS `.tl-data-grid` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { DataGrid } from '@terracelab/trellis-react';
```

## 용도

업무 목록의 본체(발주 · 세금계산서 · 재고 · 원장). 열 서식 · 정렬 · 선택 · 합계 · 빈 상태 · 로딩을 한 문법으로. 칸 편집 · 열 필터 · 열 설정 · 묶음 소계 · 트리 행 · 가상 스크롤(1,000행)까지 같은 표가 한다.

## 해부(Anatomy)

wrapper(`bg.surface`, `border.divider`, `radius.lg`, 가로 스크롤) · head(고정, `bg.canvas`, `type.label` fg.secondary) · row(높이 `density.row-height`, 아래 `border.divider`, hover `bg.canvas`, 열린 행 `brand.subtle` 바탕만) · cell(숫자는 오른쪽 · tabular, 단위는 fg.tertiary) · tone(`data-tone`만 단다. 왼쪽 띠 · 행 바탕은 그리지 않고 상태는 상태 열의 점 · 배지가 보인다) · foot(합계, 아래 고정, 600) · 정렬 아이콘(정렬 중인 열만 보이고, 나머지 열은 가리키거나 포커스할 때 나타난다. 터치 화면은 늘 보임) · 셀 안 상태 배지(점이 있는 subtle Badge는 바탕 없이 점 + 글자 500으로 줄인다. 점 없는 태그 · solid는 그대로). 좁은 화면(`breakpoint.sm` 미만): cards(행마다 카드 `bg.surface` · `border.divider` · `radius.lg`, 안쪽 `space.12` `space.16`) · card-top(title 500 + 오른쪽 trailing `type.amount`) · card-status(배지 줄) · card-meta(`type.label` fg.secondary, 항목 사이 `·`, 숫자는 열 이름을 앞에) · chevron(onRowPress가 있을 때) · cards-head(전체 선택) · cards-foot(합계 = trailing 열의 합). 업무 기능: head-cell(이름 + 정렬 + 필터 단추 24, 걸린 필터는 `fg.link` 색 + 이름 "<열> 필터 적용됨") · settings(머리 끝 열, 오른쪽에 고정) · popover(`bg.elevated` · `border.default` · `radius.md` · `shadow.md`, 다크는 그림자 없음) · group(묶음 머리 행 `bg.canvas` 600, 펼침 화살표 + 이름 + 건수 `fg.secondary`, 소계는 total: 'sum' 열 자리) · tree(첫 칸을 단계마다 `space.20` 들이고, 펼침 단추 24 자리를 잎 행도 비워 맞춘다) · edit(값이 보이는 단추, 가리키면 `border.default` 안쪽 테두리 · 편집 중엔 `border.focus` 입력 칸 · 틀리면 `status.danger.default` 테두리와 칸 아래 이유) · card-group(카드 사이 묶음 머리, 소계는 trailing 열). PR-26: head 글자는 fg.primary 600(본문보다 흐리지 않게) · head-unit(amount 열 머리 뒤 "(원)", currency는 통화 코드, fg.secondary 400. 칸에는 원을 붙이지 않는다) · dividers(all이면 칸 사이 세로 `border.divider`, auto = 오른쪽 정렬 열 4개 이상) · emphasis 열(왼쪽 `border.strong` + 600, 바탕 없음) · link 열(`fg.primary` 500, 누를 수 있는 행에서 가리키거나 키보드로 오면 밑줄. 링크 색 `fg.link`는 회사 색이라 위험 빨강 배지 옆에서 이름이 오류처럼 읽혀 쓰지 않는다. 칸 전체가 링크이고 행이 상세를 연다는 것은 행 단서 · 밑줄 · 이름으로도 알 수 있어 색이 없어도 된다(WCAG 1.4.1), D-146 제안) · actions(행 끝 칸, 기본 행동 단추 sm 1개 + 더보기 IconButton, 오른쪽 정렬) · lines(DataGridLines: 이름 + 보조 줄 `type.caption` fg.secondary. 이 칸이 든 행은 `density.row-height-tall`). PR-30: group-head(열 묶음 머리, 덮는 열 위 가운데 600, 묶음 양 끝 `border.divider` 세로선, 두 번째 머리 줄은 `density.row-height` 아래에 고정) · dirty(저장 전 칸 오른쪽 위 점 `space.6` 원 `brand.default` + 숨은 글자 "저장 전". 왼쪽 띠 · 칸 바탕은 쓰지 않는다) · flash(flashKey 행 `bg.row-selected` 1초, 들고 나는 것은 행 transition `duration.fast`) · block(오류 · 빈 상태 · 검색 결과 없음은 EmptyState sm 한 칸, 카드 모양은 카드 상자 안) · cell focus(grid의 단추 없는 칸은 칸 자신에 `border.focus` 안쪽 링).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `columns` | `DataGridColumn[]` |  | 필수 | 열 정의 |
| `rows` | `Row[]` |  | 필수 | 행 |
| `rowKey` | `string` |  | 필수 | 행 식별 열 |
| `caption` | `string` |  | 필수 | 표 이름(접근성) |
| `selectable` | `boolean` | `false` |  | 행 선택 체크박스 |
| `selected` | `string[]` |  |  | 선택된 행(제어) |
| `onSelectedChange` | `(keys: string[]) => void` |  |  | 선택이 바뀔 때 |
| `onRowPress` | `(row) => void` |  |  | 행을 누를 때 |
| `activeRowKey` | `string \| null` |  |  | 열린 행 |
| `sort` | `DataGridSort \| null` |  |  | 정렬(제어) |
| `defaultSort` | `DataGridSort \| null` |  |  | 처음 정렬 |
| `onSortChange` | `(sort) => void` |  |  | 정렬이 바뀔 때(없으면 표가 직접 정렬) |
| `loading` | `boolean` | `false` |  | 스켈레톤 행 |
| `empty` | `ReactNode` |  |  | 빈 상태 |
| `summary` | `boolean` | `false` |  | 합계 행 |
| `height` | `'auto' \| 'fill'` | `"auto"` |  | 높이 |
| `rowTone` | `(row) => StatusTone \| undefined` |  |  | 행 상태 값(data-tone). 띠 · 바탕을 그리지 않는다. 상태는 상태 열이 보인다 |
| `mobile` | `'cards' \| 'scroll'` | `"cards"` |  | 좁은 화면 모양 |
| `onCellChange` | `(row, key, value) => void` |  |  | 칸 편집을 저장할 때 |
| `filters` | `DataGridFilters` |  |  | 열 필터(제어) |
| `defaultFilters` | `DataGridFilters` |  |  | 처음 열 필터 |
| `onFiltersChange` | `(filters) => void` |  |  | 열 필터가 바뀔 때 |
| `columnSettings` | `boolean \| { storageKey?: string }` | `false` |  | 열 설정 단추(숨김 · 순서, storageKey = 이 기기에 저장) |
| `columnState` | `DataGridColumnState` |  |  | 열 순서 · 숨김(제어) |
| `onColumnStateChange` | `(state) => void` |  |  | 열 설정이 바뀔 때 |
| `groupBy` | `string` |  |  | 묶을 열(소계 행) |
| `groupLabel` | `(value, rows) => ReactNode` |  |  | 묶음 머리 글자 |
| `childrenKey` | `string` |  |  | 자식 행이 든 열(트리) |
| `defaultExpanded` | `string[] \| 'all'` |  |  | 처음 펼친 트리 행 |
| `virtualize` | `boolean \| 'auto'` | `"auto"` |  | 보이는 행만 그리기(auto = fill이고 200행 넘을 때) |
| `rowActions` | `(row) => ReactNode` |  |  | 행 끝 행동 칸(기본 행동 1개 + 더보기) |
| `dividers` | `'rows' \| 'all' \| 'auto'` | `"auto"` |  | 칸 구분선(auto = 숫자 열 4개 이상이면 세로선까지) |
| `error` | `{ message?, requestId?, onRetry? } \| null` |  |  | 불러오기 오류(행 대신 오류 블록 · 다시 시도) |
| `filtered` | `boolean` | `false` |  | 바깥 검색 · 필터가 걸림(빈 상태를 검색 결과 없음으로) |
| `groups` | `DataGridColumnGroup[]` |  |  | 열 묶음 머리(column.group) |
| `isDirty` | `(row, key) => boolean` |  |  | 저장 전 칸(모서리 점 + 숨은 글자) |
| `dirtyHint` | `string` | `"저장 전"` |  | 저장 전 칸의 숨은 글자 |
| `scrollToKey` | `string \| null` |  |  | 이 행이 보이게 스크롤 |
| `flashKey` | `string \| null` |  |  | 이 행에 1초 선택 바탕(방금 바뀐 행) |

## Variants

selectable · summary · height auto · fill(남은 높이까지만 자라고 줄이 적으면 내용에서 끝난다) · 열 폭 xs ~ xl · mobile cards(기본) · scroll · 칸 편집(column.editable + onCellChange) · 열 필터(column.filter text · values) · 열 설정(columnSettings, storageKey) · 묶음(groupBy) · 트리(childrenKey) · 가상 스크롤(virtualize). dividers rows · all · auto · rowActions · column.link · column.emphasis · column.headerUnit · DataGridLines(두 줄 칸). PR-30: error(오류 블록) · filtered(검색 결과 없음 모양) · groups + column.group(열 묶음 머리) · isDirty · dirtyHint(저장 전 칸) · scrollToKey · flashKey(행 찾아가기) · column.priority low(폭 1024~1279에서 숨김).

## States

지원 상태: `default` · `hover` · `focus` · `loading`

default · hover · focus(행, 편집 칸이 있는 표는 칸) · loading(스켈레톤 6행). 오류는 상태가 아니라 `error` prop이 행 대신 오류 블록을 세운다.

## 동작

onSortChange가 없으면 표가 직접 정렬한다(숫자는 값, 글자는 한국어 순). 행 안의 버튼 · 링크 · 체크박스를 누르면 onRowPress는 부르지 않는다. 표는 고정 폭 열의 합 + 자동 열마다 160만큼 최소 폭을 가져, 좁은 화면에서 자동 열이 사라지지 않고 가로로 스크롤된다. 금액 열에 finance를 켜면 양수 빨강 · 음수 파랑. 폭이 `breakpoint.sm`보다 좁으면 행마다 카드가 된다(mobile=cards). 열 자리는 `column.mobile`이 정하고, 없으면 첫 글자 열이 title, 첫 금액 열(없으면 첫 숫자 열)이 trailing, 남은 열은 순서대로 세 개까지 meta, 그 뒤는 숨는다. 카드에서는 정렬 머리가 없어 지금 정렬(기본 정렬)을 따른다. 열끼리 비교해야 하는 표(재고 매트릭스 · 시산표)는 mobile=scroll로 표를 그대로 두고 가로로 민다. 빈 값은 정렬 방향과 관계없이 맨 뒤에 선다.

**칸 편집.** `column.editable`이고 `onCellChange`가 있으면 칸이 값이 보이는 단추가 된다. 누르거나 Enter로 입력 칸을 열고, Enter 저장 · Esc 취소 · 칸을 떠나면 저장한다(틀린 값이면 원래대로). 편집기는 `column.editor`, 없으면 서식에서 고른다: amount · currency → 금액(쉼표 · 원을 빼고 숫자), 숫자 서식 → 숫자, date → 날짜(숫자만 쳐도 YYYY-MM-DD, 없는 날은 막는다), `options`가 있으면 고르기(고르자마자 저장), 나머지 글자. 숫자 · 날짜를 비우면 null. `validate(value, row)`가 글자를 돌려주면 저장하지 않고 그 글자를 칸 아래에 보인다. 표는 값을 바꾸지 않는다. 부모가 onCellChange에서 행을 바꿔 다시 넘긴다. Esc는 편집만 취소하고 표를 감싼 Drawer · Dialog는 닫지 않는다. 품목을 더하고 빼는 입력 표는 LineItemsEditor.

**열 필터.** `column.filter` text = 포함하는 글자(값과 보이는 글자 둘 다에서 찾는다, 대소문자 무시), values = 행에 나온 값 고르기(options가 있으면 그 이름 · 순서, 값마다 건수, 9개부터 찾기 칸). 다 고르면 필터가 없는 것과 같고, 다 끄면 아무 행도 안 보인다. 필터는 받은 행 안에서 거른다. 서버에서 찾는 조건은 FilterBar로 받는다. 숨긴 열의 필터는 걸지 않는다. 맞는 행이 없으면 "조건에 맞는 항목이 없습니다"와 필터 모두 지우기 단추. 합계 · 소계는 걸러진 행만 더한다. `filters` · `onFiltersChange`로 부모가 들고 URL에 남길 수 있다.

**열 설정.** `columnSettings`를 켜면 머리 끝에 단추가 생기고, 열마다 보이기 체크와 위로 · 아래로 단추, 처음 상태로가 있다. 순서는 숨긴 열까지 센다. `column.hidden`은 처음에 숨김, `hideable: false`는 끌 수 없다(행 이름 열). 마지막 남은 열도 끌 수 없다. `storageKey`가 있으면 이 기기(localStorage `trellis.dataGrid.<key>`)에 저장하고 마운트 뒤에 읽는다. 저장 뒤 열이 바뀌면 없어진 열은 버리고 새 열은 뒤에 붙인다. 서버에 저장하려면 `columnState` · `onColumnStateChange`. 좁은 화면 카드는 보이는 열로 자리를 정한다.

**묶음 소계.** `groupBy` 열 값으로 묶는다. 묶음 순서는 정렬된 행에서 처음 나온 순서이고, 머리에 이름(`groupLabel` 또는 그 열 서식) · 건수 · total: 'sum' 열의 소계가 선다. 머리 글자는 첫 소계 열 앞까지 칸을 합쳐 쓴다. 머리를 누르면 접힌다. 묶음 안 행은 첫 칸을 펼침 단추만큼 들인다. 소계 0은 그 열의 데이터 행이 0을 그리는 대로 그린다. `render`가 0을 빈칸으로 돌려주는 열(시산표 차변 · 대변)은 소계도 빈칸이고 서식만 있는 열은 "0"이다. 머리 단추의 높이는 `density.control-height-xs`라 touch 밀도(휴대폰)에서 44가 된다. groupBy와 childrenKey는 함께 쓰지 않는다.

**트리 행.** `childrenKey` 열에 든 자식 배열로 단계를 그린다. 정렬은 형제끼리, 필터는 맞는 행의 조상을 남긴다. 합계는 잎 행만 더한다(부모가 자식 합을 들고 있어도 두 번 세지 않는다). 처음 펼침은 `defaultExpanded`(key 목록 · 'all'). 전체 선택은 보이는 단계와 관계없이 걸러진 모든 행.

**가상 스크롤.** `virtualize` auto(기본)는 height fill이고 화면 줄(묶음 머리 포함)이 200개를 넘을 때 켜진다. 보이는 줄 + 위아래 12줄만 그리고, 줄 높이는 그린 뒤 잰다(wrap 열도 된다). 머리 · 합계는 그대로 고정이고, 표에 `aria-rowcount`, 줄마다 `aria-rowindex`를 단다. 좁은 화면 카드는 페이지가 스크롤되므로 가상 스크롤을 쓰지 않는다. 행 행동 칸(rowActions) 안을 누르면 onRowPress가 일어나지 않는다. 포털로 그린 Menu 팝업 안 클릭도 행 열기로 올라가지 않는다. 좁은 화면 카드에서는 행동이 카드 오른쪽 chevron 앞에 온다. 머리 단위는 머리 글자에 이미 괄호가 있으면("금액(원)") 붙이지 않고, headerUnit=false로 끈다. 저절로 붙는 열이 5개 이상이면(급여표처럼 좁은 금액 열이 이어질 때) 머리가 잘리므로 붙이지 않는다. 그때는 표 제목 · 부제 · 건수 줄에 "단위 원"을 한 번 쓴다.
**오류 · 빈 상태(PR-30).** 행 대신 서는 블록은 모두 EmptyState sm이고 카드 모양(좁은 화면)에서도 같다. 순서는 loading(스켈레톤) → `error` → 열 필터 결과 없음 → 빈 목록이다. `error`가 있으면 행 · 합계 대신 kind="error" 블록이 선다. 제목은 `error.message`(없으면 "목록을 불러오지 못했습니다"), 설명은 "잠시 뒤 다시 시도하세요", `requestId`가 있으면 "요청 ID …" 한 줄, `onRetry`가 있으면 "다시 시도" 단추다. 이미 보이는 행을 새로 고치다 실패한 경우는 `error`를 주지 않고 행을 둔 채 Toast로 알린다. 열 필터로 맞는 행이 없으면 kind="noResult"에 "조건에 맞는 항목이 없습니다"와 "필터 모두 지우기" 단추. 빈 목록은 `empty`를 쓴다. 글자면 첫 문장이 제목, 나머지가 설명이다("이번 달 전표가 없습니다. 전표 입력에서 추가하세요"). 노드면 그대로 그린다(EmptyState를 직접 넘길 때). 바깥 조건(FilterBar 검색어 · 기본값이 아닌 필터)이 걸려 있으면 `filtered`를 켠다. 빈 목록이 검색 아이콘의 noResult 모양이 되고, `empty`가 없으면 제목이 "조건에 맞는 항목이 없습니다"다.

**키보드 칸 이동(PR-30).** 편집 칸(`column.editable` + `onCellChange`)이 있는 표는 `role="grid"`가 되고 표 안 Tab 정류장이 하나(지금 칸)다. 처음 들어오면 첫 행의 첫 편집 칸이다. 단추 · 입력이 있는 칸은 그 단추가, 없는 칸은 칸 자신이 포커스를 받는다. 칸 안 단추가 여럿이면(행 행동 칸) 좌우 방향키가 단추를 하나씩 지난다. 머리 칸(정렬 · 필터 · 열 설정)은 Tab으로 간다. 편집 칸이 없는 표는 지금처럼 table이고 행이 Tab · Enter로 열린다. 한 글자 단축키(j · k)는 두지 않는다. 가상 스크롤 표도 같다(그리지 않은 줄로 가면 그 줄을 화면에 들인 뒤 포커스한다).

| 키 | 동작 |
|---|---|
| → · ← | 옆 칸(칸 안 단추가 여럿이면 다음 · 이전 단추). 끝에서는 그대로 |
| ↓ · ↑ | 아래 · 위 행의 같은 열 |
| Home · End | 그 행의 첫 칸 · 끝 칸 |
| Ctrl+Home · Ctrl+End | 첫 행 첫 칸 · 끝 행 끝 칸 |
| PageDown · PageUp | 한 화면(보이는 행 수 − 1) 아래 · 위 |
| Enter · F2 | 편집 칸이면 편집 시작. 편집 칸이 아니면 Enter는 행 열기(onRowPress) |
| Enter(편집 중) | 저장하고 칸으로 돌아온다 |
| Esc(편집 중) | 취소하고 칸으로 돌아온다. 표를 감싼 Drawer · Dialog는 닫지 않는다 |
| Tab · Shift+Tab | 다음 · 이전 편집 칸(편집 중이면 저장하고 옮긴다). 마지막 · 처음 편집 칸에서는 표 밖으로 |
| Space | 선택 체크박스 · 단추 |

**열 묶음 머리(PR-30).** `groups`(key · header · sticky)와 `column.group`으로 이어진 열 위에 머리를 한 줄 더 둔다(공급가액 · 세액 위 "금액"). 같은 묶음 열은 붙여 둔다. 떨어져 있으면 묶음 머리가 나뉘어 선다. 묶음이 없는 열은 두 머리 줄을 합쳐 쓴다(rowSpan 2). `sticky` 묶음은 머리 칸이 왼쪽에 고정된다. 묶음의 열이 sticky일 때 함께 쓴다. 열 설정 · priority로 묶음 열이 모두 숨으면 묶음 머리도 숨는다.

**저장 전 칸(PR-30).** `isDirty(row, key)`가 true인 칸은 오른쪽 위에 작은 점(`brand.default`)이 서고, 화면 낭독기는 칸 끝에 `dirtyHint`(기본 "저장 전")를 읽는다. 편집 칸이면 편집 단추 이름 끝에 붙는다("6, 수량 수정, 저장 전"). 왼쪽 띠 · 칸 바탕 · 굵은 글자로 표시하지 않는다(D-57). 화면은 표 위 ActionBar에 "저장 전 3칸"과 저장 단추를 둔다. 카드 모양은 칸 편집이 없어 표시하지 않는다.

**행 찾아가기(PR-30).** `scrollToKey`가 바뀌면 그 행이 보이게 스크롤한다(가상 스크롤은 그 줄을 들인다). `flashKey`가 바뀌면 그 행이 1초 동안 선택 행 바탕(`bg.row-selected`)을 갖는다. 방금 저장 · 추가한 행을 찾게 할 때 둘을 같이 준다. 같은 행을 다시 보이려면 null로 돌렸다가 다시 준다. 접힌 묶음 · 트리 안 행은 찾아가지 않는다. 움직임 줄이기에서는 바탕이 들고 나는 시간만 0이 되고 1초 표시는 그대로다.

**가로 넘침 · 고정 열(R-37 4, D-136).** 표가 면보다 넓으면 가린 것이 있는 쪽 가장자리에 안쪽 그림자(`shadow.lg` + `shadow.md`, 가장자리에서 `space.32`)가 선다. 왼쪽 끝까지 밀면 왼쪽 그림자가, 오른쪽 끝에 닿으면 오른쪽 그림자가 사라진다. 고정 열이 있으면 그림자는 화면 끝이 아니라 고정 열 경계에 선다. `column.sticky`는 true · `'start'`(왼쪽) · `'end'`(오른쪽)이고, 결과 열(공제 합계 · 실지급, `emphasis`)을 `'end'`로 두면 넓은 표에서도 늘 보인다. 같은 쪽 고정 열이 여럿이면 앞 고정 열 폭만큼 밀어 앉는다(왼쪽은 표 앞에, 오른쪽은 표 끝에 이어 둔다). 키보드 이동 · 읽는 순서는 열 순서 그대로다. 움직임 줄이기에서는 그림자가 나타나는 시간만 0이다. 가로 스크롤바가 표 맨 아래에 있어 첫 화면에서 안 보이는 문제는 `height="fill"`로 푼다: 표가 남은 높이까지만 자라므로 스크롤바가 보이는 면 아래에 선다. 화면 아래를 따라오는 별도 스크롤바는 두지 않는다(같은 스크롤을 둘로 그리면 키보드 · 화면 낭독기에 이중으로 잡힌다). 말줄임으로 잘린 칸은 가리킬 때만 전체 글자를 `title`로 단다(잘리지 않은 칸 · `wrap` 칸 · 앱이 단 title은 그대로). 화면 낭독기는 원래 칸의 전체 글자를 읽는다.

**좁은 폭 열 숨김(PR-30).** `column.priority: 'low'`인 열은 폭 1024~1279(breakpoint.lg 이상 xl 미만)에서 숨는다(태블릿 가로 · 작은 노트북). 열 설정의 보이기와는 따로이고, 그 열에 걸린 열 필터는 숨어도 그대로 걸린다. 1280 이상과 좁은 화면 카드에는 영향이 없다.

## 접근성

`<table>` + `<caption>`(숨김), 스크롤 상자는 `role="region"` + 표 이름 + `tabIndex=0`(키보드로 가로 스크롤), 정렬 열은 `aria-sort`, 선택은 체크박스 이름 "<행 이름> 선택", 행 열기는 Enter. 카드는 `<ul>` 목록이고 카드가 Tab · Enter로 열리며, 전체 선택은 목록 위 체크박스. 편집 칸 단추의 이름은 보이는 값 + ", <열> 수정"(음성 입력이 보이는 값으로 누를 수 있다), 입력 칸 이름은 열 이름, 틀린 값은 `aria-invalid` + `aria-describedby`로 이유(`role="alert"`). 필터 · 열 설정 · 펼침 단추는 이름이 있는 단추이고 상태를 이름(필터 적용됨) · `aria-expanded`로 알린다. 열을 옮긴 뒤 포커스는 같은 열의 단추에 남는다. 묶음 소계 칸은 숨은 "소계"를 앞에 읽는다. PR-30: 편집 칸이 있는 표는 `<table role="grid">` + 칸 `role="gridcell"` + `aria-rowcount` · `aria-colcount` · 행 `aria-rowindex` · 칸 `aria-colindex`이고 roving tabindex(지금 칸만 0)다. 화면 낭독기가 표 안에서 방향키를 표에 넘긴다. 열 묶음 머리는 `scope="colgroup"` + colSpan. 오류 블록은 `role="alert"`라 나타날 때 읽힌다. 저장 전 칸은 점(색) 말고 숨은 글자로도 알린다. 칸 포커스 링은 `border.focus` 2px 안쪽.

## 밀도

행 `density.row-height`(32 · 40 · 48), 칸 좌우 `space.12`, 글자 `density.body-font-size`. 카드는 밀도와 관계없이 안쪽 `space.12` `space.16`.

## 플랫폼 차이

네이티브는 ListTable(FlatList, 고정 열, 인라인 편집 없음). 칸 편집 · 열 필터 · 열 설정 · 묶음 · 트리 · 가상 스크롤은 지금 웹만 한다(props는 contract에 있고 네이티브는 무시한다).

## 금지 사항

숫자 왼쪽 정렬 · 금액에 원 단위 문자열을 직접 붙이기(format 사용) · 행마다 다른 높이 · 휴대폰에서 열 많은 표를 가로 스크롤로 두기(비교용 매트릭스만 scroll) · 서버 페이지 목록에 열 필터(받은 행만 거른다. FilterBar 사용) · 편집 칸마다 따로 저장 단추 · 묶음과 트리 함께 쓰기 · 저장 전 칸을 왼쪽 띠 · 칸 바탕으로 표시(D-57) · 표에 한 글자 단축키 · 오류를 빈 표 + Toast로만 알리기(error 사용) → 리뷰.

## 예시

### 세금계산서 목록

금액 서식 · 정렬 · 선택 · 합계

```tsx
import { INVOICE_STATES, type InvoiceState } from '@terracelab/trellis-contracts';
import { Badge, DataGrid } from '@terracelab/trellis-react';

const INVOICES = [
  {
    no: 'TI-2611-0118',
    date: '2026-11-07',
    buyer: '(주)한빛무역',
    supply: 12_400_000,
    tax: 1_240_000,
    state: 'ready' as InvoiceState,
  },
  {
    no: 'TI-2611-0117',
    date: '2026-11-06',
    buyer: '대양상사',
    supply: 8_750_000,
    tax: 875_000,
    state: 'sent' as InvoiceState,
  },
  {
    no: 'TI-2611-0116',
    date: '2026-11-06',
    buyer: '누리식품',
    supply: 3_120_000,
    tax: 312_000,
    state: 'failed' as InvoiceState,
  },
  {
    no: 'TI-2611-0115',
    date: '2026-11-05',
    buyer: '한결물산',
    supply: 21_900_000,
    tax: 2_190_000,
    state: 'sent' as InvoiceState,
  },
];

function Invoices() {
  return (
    <DataGrid
      caption="매출 세금계산서"
      rows={INVOICES}
      rowKey="no"
      selectable
      summary
      rowTone={(r) => (r.state === 'failed' ? 'danger' : undefined)}
      columns={[
        { key: 'no', header: '문서 번호', width: 'md', sticky: true },
        { key: 'date', header: '작성일', width: 'sm', format: 'date', sortable: true },
        { key: 'buyer', header: '공급받는 자', sortable: true },
        {
          key: 'supply',
          header: '공급가액',
          width: 'md',
          format: 'amount',
          total: 'sum',
          sortable: true,
        },
        { key: 'tax', header: '세액', width: 'md', format: 'amount', total: 'sum' },
        {
          key: 'state',
          header: '상태',
          width: 'md',
          render: (r) => (
            <Badge tone={INVOICE_STATES[r.state].tone}>{INVOICE_STATES[r.state].label}</Badge>
          ),
        },
      ]}
    />
  );
}
```

### 빈 상태 · 로딩

```tsx
import { DataGrid } from '@terracelab/trellis-react';

function EmptyAndLoading() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <DataGrid
        caption="이번 달 전표"
        rows={[] as { id: string }[]}
        rowKey="id"
        columns={[{ key: 'id', header: '전표 번호' }]}
        empty="이번 달 전표가 없습니다. 전표 입력에서 추가하세요"
      />
      <DataGrid
        caption="재고"
        rows={[] as { id: string }[]}
        rowKey="id"
        columns={[{ key: 'id', header: '품목' }]}
        loading
      />
    </div>
  );
}
```

### * 칸 편집

방향키로 칸을 옮기고 Enter · F2로 고친다. Enter 저장, Esc 취소, Tab은 다음 편집 칸, 수량은 1 이상. 고친 칸은 저장 전 점이 서고, 저장하면 마지막으로 고친 행이 1초 동안 선택 바탕을 갖는다

```tsx
import { useState } from 'react';
import { Button, DataGrid } from '@terracelab/trellis-react';

const ORDER_LINES = [
  { code: 'A-1001', name: '무염버터 450g', wh: 'main', qty: 24, price: 8_900, due: '2026-11-12' },
  { code: 'A-1002', name: '강력분 20kg', wh: 'center', qty: 6, price: 31_500, due: '2026-11-10' },
  { code: 'A-1003', name: '생크림 1L', wh: 'main', qty: 40, price: 6_200, due: '2026-11-11' },
  { code: 'A-1004', name: '올리브유 3L', wh: 'store', qty: 8, price: 27_800, due: '2026-11-14' },
];

const WAREHOUSES = [
  { value: 'main', label: '본사 창고' },
  { value: 'center', label: '물류센터' },
  { value: 'store', label: '매장' },
];

function Editable() {
  const [saved, setSaved] = useState(ORDER_LINES);
  const [lines, setLines] = useState(ORDER_LINES);
  const [lastEdited, setLastEdited] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const isDirty = (row: (typeof lines)[number], key: string) => {
    const before: Record<string, unknown> | undefined = saved.find((r) => r.code === row.code);
    return !!before && before[key] !== (row as Record<string, unknown>)[key];
  };
  const dirtyCount = lines.reduce(
    (n, row) => n + (['wh', 'qty', 'price', 'due'] as const).filter((k) => isDirty(row, k)).length,
    0,
  );
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-12)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--tl-space-12)',
        }}
      >
        <span style={{ color: 'var(--tl-color-fg-secondary)' }}>저장 전 {dirtyCount}칸</span>
        <Button
          variant="primary"
          disabled={dirtyCount === 0}
          onPress={() => {
            setSaved(lines);
            setFlash(lastEdited);
          }}
        >
          저장
        </Button>
      </div>
      <DataGrid
        caption="발주 품목"
        rows={lines}
        rowKey="code"
        summary
        isDirty={isDirty}
        flashKey={flash}
        scrollToKey={flash}
        onCellChange={(row, key, value) => {
          setFlash(null);
          setLastEdited(row.code);
          setLines((all) => all.map((r) => (r.code === row.code ? { ...r, [key]: value } : r)));
        }}
        columns={[
          { key: 'code', header: '품목 코드', width: 'md' },
          { key: 'name', header: '품목' },
          { key: 'wh', header: '창고', width: 'md', editable: true, options: WAREHOUSES },
          {
            key: 'qty',
            header: '수량',
            width: 'sm',
            format: 'quantity',
            editable: true,
            validate: (v) => (typeof v === 'number' && v >= 1 ? null : '1 이상 입력하세요'),
          },
          { key: 'price', header: '단가', width: 'md', format: 'amount', editable: true },
          { key: 'due', header: '입고일', width: 'sm', format: 'date', editable: true },
          {
            key: 'amount',
            header: '금액',
            width: 'md',
            format: 'amount',
            total: 'sum',
            value: (r) => r.qty * r.price,
          },
        ]}
      />
    </div>
  );
}
```

### 열 필터 · 열 설정

거래처 이름은 글자로, 지역 · 등급은 값으로 거른다. 열 설정은 이 기기에 저장된다

```tsx
import { DataGrid } from '@terracelab/trellis-react';

const PARTNERS = [
  {
    id: 'P-0101',
    name: '(주)한빛무역',
    region: '서울',
    grade: 'A',
    owner: '김도윤',
    phone: '02-555-0101',
    balance: 12_400_000,
  },
  {
    id: 'P-0102',
    name: '대양상사',
    region: '부산',
    grade: 'B',
    owner: '이서연',
    phone: '051-555-0102',
    balance: 3_870_000,
  },
  {
    id: 'P-0103',
    name: '누리식품',
    region: '서울',
    grade: 'A',
    owner: '박지호',
    phone: '02-555-0103',
    balance: 8_120_000,
  },
  {
    id: 'P-0104',
    name: '한결물산',
    region: '대구',
    grade: 'C',
    owner: '김도윤',
    phone: '053-555-0104',
    balance: 0,
  },
  {
    id: 'P-0105',
    name: '바른유통',
    region: '부산',
    grade: 'B',
    owner: '최민준',
    phone: '051-555-0105',
    balance: 1_540_000,
  },
  {
    id: 'P-0106',
    name: '새벽농산',
    region: '광주',
    grade: 'A',
    owner: '이서연',
    phone: '062-555-0106',
    balance: 21_900_000,
  },
];

function FiltersAndColumns() {
  return (
    <DataGrid
      caption="거래처"
      rows={PARTNERS}
      rowKey="id"
      columnSettings={{ storageKey: 'example.partners' }}
      defaultSort={{ key: 'balance', direction: 'desc' }}
      columns={[
        { key: 'name', header: '거래처', filter: 'text', hideable: false, sortable: true },
        { key: 'region', header: '지역', width: 'sm', filter: 'values' },
        {
          key: 'grade',
          header: '등급',
          width: 'sm',
          filter: 'values',
          options: [
            { value: 'A', label: 'A 우수' },
            { value: 'B', label: 'B 보통' },
            { value: 'C', label: 'C 주의' },
          ],
        },
        { key: 'owner', header: '담당자', width: 'md', filter: 'values' },
        { key: 'phone', header: '전화', width: 'md', hidden: true },
        { key: 'balance', header: '미수금', width: 'md', format: 'amount', sortable: true },
      ]}
    />
  );
}
```

### 묶음 소계

부서별로 묶고 묶음마다 소계, 맨 아래 합계. 묶음 머리를 누르면 접힌다

```tsx
import { DataGrid } from '@terracelab/trellis-react';

const EXPENSES = [
  { id: 'EX-1101', dept: '영업팀', item: '거래처 미팅 식대', date: '2026-11-02', amount: 184_000 },
  { id: 'EX-1102', dept: '물류팀', item: '지게차 정기 점검', date: '2026-11-03', amount: 420_000 },
  { id: 'EX-1103', dept: '영업팀', item: '출장 교통비(부산)', date: '2026-11-04', amount: 236_500 },
  { id: 'EX-1104', dept: '경영지원팀', item: '복합기 토너', date: '2026-11-04', amount: 98_000 },
  { id: 'EX-1105', dept: '물류팀', item: '포장재 보충', date: '2026-11-05', amount: 312_000 },
  { id: 'EX-1106', dept: '영업팀', item: '샘플 배송비', date: '2026-11-06', amount: 45_000 },
];

function Grouped() {
  return (
    <DataGrid
      caption="11월 경비"
      rows={EXPENSES}
      rowKey="id"
      groupBy="dept"
      summary
      columns={[
        { key: 'item', header: '내용' },
        { key: 'dept', header: '부서', width: 'md' },
        { key: 'date', header: '사용일', width: 'sm', format: 'date' },
        { key: 'amount', header: '금액', width: 'md', format: 'amount', total: 'sum' },
      ]}
    />
  );
}
```

### 트리 행

계정 과목처럼 단계가 있는 행. 단추로 펼치고 접는다. 합계는 맨 아래 단계만 더한다

```tsx
import { DataGrid } from '@terracelab/trellis-react';

const ACCOUNTS = [
  {
    code: '1000',
    name: '자산',
    balance: 58_600_000,
    children: [
      {
        code: '1100',
        name: '유동자산',
        balance: 41_200_000,
        children: [
          { code: '1110', name: '현금', balance: 3_200_000 },
          { code: '1120', name: '보통예금', balance: 26_500_000 },
          { code: '1130', name: '외상매출금', balance: 11_500_000 },
        ],
      },
      {
        code: '1200',
        name: '비유동자산',
        balance: 17_400_000,
        children: [
          { code: '1210', name: '차량운반구', balance: 12_000_000 },
          { code: '1220', name: '비품', balance: 5_400_000 },
        ],
      },
    ],
  },
  {
    code: '2000',
    name: '부채',
    balance: 19_300_000,
    children: [
      { code: '2110', name: '외상매입금', balance: 14_800_000 },
      { code: '2120', name: '미지급금', balance: 4_500_000 },
    ],
  },
];

function Tree() {
  return (
    <DataGrid
      caption="계정별 잔액"
      rows={ACCOUNTS}
      rowKey="code"
      childrenKey="children"
      defaultExpanded={['1000', '1100']}
      columns={[
        { key: 'name', header: '계정 과목' },
        { key: 'code', header: '코드', width: 'sm' },
        { key: 'balance', header: '잔액', width: 'md', format: 'amount' },
      ]}
    />
  );
}
```

### 1,000행

height="fill"이고 행이 200개를 넘으면 보이는 줄만 그린다. 머리 · 정렬 · 필터는 그대로

```tsx
import { DataGrid } from '@terracelab/trellis-react';

const STOCK = Array.from({ length: 1000 }, (_, i) => ({
  sku: `SKU-${String(i + 1).padStart(4, '0')}`,
  name: `${['무염버터', '강력분', '올리브유', '생크림', '설탕', '바닐라빈'][i % 6]} ${(i % 9) + 1}호`,
  wh: ['본사 창고', '물류센터', '매장'][i % 3],
  qty: (i * 37) % 500,
  price: 1_000 + ((i * 7919) % 90) * 100,
}));

function ThousandRows() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <DataGrid
        caption="재고 현황"
        rows={STOCK}
        rowKey="sku"
        height="fill"
        columns={[
          { key: 'sku', header: '품목 코드', width: 'md', sortable: true },
          { key: 'name', header: '품목', filter: 'text' },
          { key: 'wh', header: '창고', width: 'md', filter: 'values' },
          { key: 'qty', header: '재고', width: 'sm', format: 'quantity', sortable: true },
          { key: 'price', header: '단가', width: 'md', format: 'amount', sortable: true },
        ]}
      />
    </div>
  );
}
```

### 받을 금액

숫자 열이 이어지는 표: 세로선(auto) · 머리 단위(원) · 결과 열 강조 · 두 줄 칸 · 링크 열 · 행 끝 행동

```tsx
import { Button, IconButton, Menu, DataGrid, DataGridLines } from '@terracelab/trellis-react';

const RECEIVABLES = [
  {
    id: 'r1',
    buyer: '서울분식 12호점',
    cycle: '10-27~11-02',
    billed: 4_524_640,
    paid: 0,
    adjust: 0,
  },
  {
    id: 'r2',
    buyer: '광안떡볶이 센텀점',
    cycle: '10-27~11-02',
    billed: 2_515_460,
    paid: 0,
    adjust: -15_060,
  },
  {
    id: 'r3',
    buyer: '할매돼지국밥',
    cycle: '10-20~10-26',
    billed: 1_970_490,
    paid: 1_000_000,
    adjust: 0,
  },
  {
    id: 'r4',
    buyer: '토박이라멘 장유점',
    cycle: '10-20~10-26',
    billed: 1_871_590,
    paid: 1_871_590,
    adjust: 0,
  },
].map((r) => ({ ...r, due: r.billed - r.paid + r.adjust }));

function Receivables() {
  return (
    <DataGrid
      caption="거래처별 받을 금액"
      rowKey="id"
      rows={RECEIVABLES}
      onRowPress={() => {}}
      summary
      columns={[
        {
          key: 'buyer',
          header: '거래처',
          width: 'auto',
          link: true,
          render: (r) => <DataGridLines primary={r.buyer} secondary={`주기 ${r.cycle}`} />,
        },
        { key: 'billed', header: '청구', format: 'amount', width: 'md', total: 'sum' },
        { key: 'paid', header: '수금', format: 'amount', width: 'md', total: 'sum' },
        { key: 'adjust', header: '환불 조정', format: 'amount', width: 'md', total: 'sum' },
        {
          key: 'due',
          header: '받을 금액',
          format: 'amount',
          width: 'md',
          total: 'sum',
          emphasis: true,
        },
      ]}
      rowActions={(r) => (
        <>
          <Button size="sm" variant="secondary" disabled={r.due === 0}>
            입금
          </Button>
          <Menu
            trigger={<IconButton size="sm" icon="ellipsis" label={`${r.buyer} 동작`} />}
            items={[
              { id: 'remind', label: '정산 요청 알림톡' },
              { id: 'statement', label: '거래 명세서' },
            ]}
          />
        </>
      )}
    />
  );
}
```

### 불러오기 오류 · 검색 결과 없음

요청 ID와 다시 시도가 있는 오류 블록, 바깥 필터가 걸렸을 때의 빈 상태

```tsx
import { DataGrid } from '@terracelab/trellis-react';

function ErrorAndNoResult() {
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-16)' }}>
      <DataGrid
        caption="거래처"
        rows={[] as { id: string; name: string }[]}
        rowKey="id"
        columns={[
          { key: 'id', header: '거래처 코드', width: 'md' },
          { key: 'name', header: '거래처' },
        ]}
        error={{
          message: '거래처 목록을 불러오지 못했습니다',
          requestId: 'req-8f2a41c9',
          onRetry: () => {},
        }}
      />
      <DataGrid
        caption="세금계산서"
        rows={[] as { no: string; buyer: string }[]}
        rowKey="no"
        columns={[
          { key: 'no', header: '승인 번호', width: 'md' },
          { key: 'buyer', header: '공급받는자' },
        ]}
        filtered
        empty="이 조건의 세금계산서가 없습니다. 기간이나 상태를 바꿔 보세요"
      />
    </div>
  );
}
```

### 열 묶음 머리

공급가액 · 세액 · 합계 위에 "금액". 메모 열은 폭 1024~1279에서 숨는다

```tsx
import { DataGrid } from '@terracelab/trellis-react';

const PURCHASES = [
  {
    no: 'PI-2611-0042',
    vendor: '누리식품',
    supply: 4_200_000,
    tax: 420_000,
    memo: '11월 정기 매입',
  },
  { no: 'PI-2611-0041', vendor: '대양상사', supply: 1_880_000, tax: 188_000, memo: '' },
  {
    no: 'PI-2611-0040',
    vendor: '한결물산',
    supply: 9_350_000,
    tax: 935_000,
    memo: '분할 입고 2차',
  },
];

function ColumnGroups() {
  return (
    <DataGrid
      caption="매입 세금계산서"
      rows={PURCHASES}
      rowKey="no"
      summary
      groups={[{ key: 'amount', header: '금액' }]}
      columns={[
        { key: 'no', header: '승인 번호', width: 'md' },
        { key: 'vendor', header: '공급자' },
        {
          key: 'supply',
          header: '공급가액',
          width: 'md',
          format: 'amount',
          total: 'sum',
          group: 'amount',
        },
        {
          key: 'tax',
          header: '세액',
          width: 'md',
          format: 'amount',
          total: 'sum',
          group: 'amount',
        },
        {
          key: 'total',
          header: '합계',
          width: 'md',
          format: 'amount',
          total: 'sum',
          group: 'amount',
          emphasis: true,
          value: (r) => r.supply + r.tax,
        },
        { key: 'memo', header: '메모', priority: 'low' },
      ]}
    />
  );
}
```

### 넓은 표 · 양쪽 고정

14열 급여 표. 이름은 왼쪽, 실지급은 오른쪽(sticky "end")에 붙어 있고 가린 쪽 가장자리에 그림자가 선다. 잘린 칸은 가리키면 전체 글자

```tsx
import { DataGrid } from '@terracelab/trellis-react';

const PAYROLL = (
  [
    ['김하늘', '경영지원팀', 3_800_000, 200_000, 150_000],
    ['박서준', '영업팀 · 수도권 대리점 담당', 4_200_000, 300_000, 0],
    ['이서연', '물류센터', 3_100_000, 100_000, 220_000],
    ['정민호', '개발팀', 4_600_000, 200_000, 0],
  ] as const
).map(([name, team, base, meal, extra], i) => {
  const gross = base + meal + extra;
  const pension = Math.round(base * 0.045);
  const health = Math.round(base * 0.03545);
  const care = Math.round(health * 0.1295);
  const job = Math.round(base * 0.009);
  const income = Math.round(gross * 0.03);
  const local = Math.round(income * 0.1);
  const deduct = pension + health + care + job + income + local;
  return {
    id: `p${i}`,
    name,
    team,
    base,
    meal,
    extra,
    gross,
    pension,
    health,
    care,
    job,
    income,
    local,
    deduct,
    net: gross - deduct,
  };
});

const money = (key: string, header: string) =>
  ({ key, header, width: 'md', format: 'amount', total: 'sum' }) as const;

function WidePayroll() {
  return (
    <DataGrid
      caption="11월 급여"
      rows={PAYROLL}
      rowKey="id"
      summary
      columns={[
        { key: 'name', header: '이름', width: 'sm', sticky: true },
        { key: 'team', header: '부서', width: 'sm' },
        money('base', '기본급'),
        money('meal', '식대'),
        money('extra', '연장 수당'),
        money('gross', '지급 합계'),
        money('pension', '국민연금'),
        money('health', '건강보험'),
        money('care', '장기요양'),
        money('job', '고용보험'),
        money('income', '소득세'),
        money('local', '지방소득세'),
        money('deduct', '공제 합계'),
        { ...money('net', '실지급'), emphasis: true, sticky: 'end' },
      ]}
    />
  );
}
```
