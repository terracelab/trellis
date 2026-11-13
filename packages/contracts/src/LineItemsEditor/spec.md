# LineItemsEditor
## 용도
줄을 더하고 빼며 칸을 채우는 입력 표(전표 분개 · 세금계산서 품목 · 발주 품목 · 견적 품목). 칸은 Trellis 입력(CodeSearch · AmountInput · QuantityInput · Input · DateField)을 render로 넣고, 줄 추가 · 삭제 · Enter 이동 · 합계 · 줄 오류 · 좁은 화면 카드는 이 컴포넌트가 맡는다. 보기 · 고르기 목록은 DataGrid(칸 하나 고치기는 DataGrid editable). 줄 안 칸에서 고르기는 선택지가 2~5개라도 Select를 쓴다(RadioGroup 규칙의 예외, 줄 높이에 라디오 묶음이 들어가지 않는다).
## 해부(Anatomy)
wrapper(`bg.surface`, `border.divider`, `radius.lg`, 가로 스크롤) · head(`bg.canvas`, `type.label` fg.secondary, 600) · row(칸 안쪽 `space.4` `space.8`, 아래 `border.divider`, 칸은 위에 맞춘다) · number(번호 열 xs, fg.secondary, tabular) · cell(편집 칸은 sm 입력이 칸을 채운다, 읽기 칸은 숫자 오른쪽 · tabular) · remove(줄 끝 IconButton sm trash-2) · error(줄 아래 한 줄, circle-alert + `status.danger.default` 글자 `type.label`) · foot(합계 `bg.canvas` 600 + 줄 추가 단추 Button sm plus) · required(머리 글자 뒤 `status.danger.default` 점 4, 숨은 "(필수)") · cell-error(칸 입력 바로 아래 `status.danger.default` 글자 `type.label`, 한글 낱말 중간에서 줄을 바꾸지 않는다) · totals(표 아래 오른쪽 숫자 묶음: 이름 `type.label` fg.secondary 위 + 값 `type.amount` 아래, 사이 `space.24`) · footnote(합계 아래 fg.secondary `type.label` 한 줄, 한글 금액) · empty(줄이 없을 때 가운데 fg.secondary 글자). 표가 안 들어가는 폭(상자 폭이 열 최소 폭 합보다 좁을 때, 서랍 · 태블릿): rows(머리 줄 없음, 줄 사이 `border.divider`, 번호 + title 칸 + 삭제 머리 줄, 나머지 칸은 칸 이름 위 + 입력 아래 격자 `space.64`×2.5 이상). 좁은 화면(`breakpoint.sm` 미만): card(줄마다 `bg.surface` · `border.divider` · `radius.lg`, 안쪽 `space.12`) · card-head(번호 + title 칸 + 삭제, 삭제는 오른쪽. 번호 · 삭제는 title 입력과 한 줄) · card-fields(두 칸 격자, 칸 이름 `type.label` fg.secondary 위 + 입력 아래, full 칸은 한 줄 다) · cards-foot(합계 + 줄 추가).
## Props
contract 표.
## Variants
numbered · summary · totals · footnote · minLines(0이면 empty) · maxLines · enterToNext · column.required · column.mobile(title · full · half · hidden). 모양은 폭이 정한다: table(열이 다 들어갈 때) · rows(안 들어갈 때) · cards(`breakpoint.sm` 미만).
## States
default · focus(칸) · disabled(추가 · 삭제 막음, 칸 입력도 disabled가 이어진다) · error(칸 단위 cellError · 줄 단위 lineError). hover · active는 칸 입력이 맡는다. loading은 없다: 편집 표는 이미 있는 값을 고치는 자리라 불러오는 동안은 화면이 Skeleton을 그린다.
## 동작
값은 부모가 들고(value · onChange), 칸 render는 `update(patch)`로 그 줄만 바꾼다. 줄 추가는 newLine()을 뒤에 붙이고 새 줄 첫 칸에 포커스. 삭제하면 윗줄의 같은 칸(삭제 단추, 꺼져 있으면 그 줄 첫 칸)으로, 윗줄이 없으면 줄 추가 단추로 포커스가 간다. minLines보다 적게는 지울 수 없고(삭제 단추 꺼짐), maxLines에 닿으면 줄 추가가 꺼진다. Tab은 칸 사이를 간다. Enter는 다음 입력 칸으로 가고, 마지막 줄 마지막 칸이면 줄을 더한다(enterToNext). 한글 조합 중 · Shift+Enter · 목록이 열린 칸(aria-expanded=true, CodeSearch 고르기)은 Enter를 가로채지 않는다. 합계 행은 total: 'sum' 열의 값을 더해 format으로 보인다. 줄 오류는 lineError가 돌려준 글자를 줄 아래에 "<표 이름> <행> · 글자"로 보이고, 그 줄 첫 입력 칸의 aria-describedby로 잇는다. 칸 오류는 cellError(line, index, key)가 돌려준 글자를 칸 아래에 보인다. 칸 render는 FieldContext 안에서 그려져 칸 안 Trellis 입력이 저절로 aria-invalid · aria-describedby · required를 받는다(render ctx의 invalid · size도 넘긴다). 폼 오류(useTrellisForm의 lines.0.qty)는 cellError에서 꺼내 넘긴다. totals는 표 아래 오른쪽 숫자 묶음이고 휴대폰에서는 세로로 한 줄씩, footnote는 그 아래 한 줄이다. 줄이 0개면 empty 글자(기본 "아직 줄이 없습니다. 줄 추가로 시작하세요")를 보이고, 합계 행(summary) · 합계 묶음(totals) · footnote는 세 모양 모두 그리지 않는다. 0원 합계는 빈 상태가 할 말(무엇을 하면 되는지)을 가린다. 줄을 더하면 다시 생긴다. footer는 앱 내용이라 그대로 둔다.

정렬(R-35): 칸 오류가 생겨 한 칸이 길어져도 같은 줄의 입력은 한 줄에 선다. 표는 줄 칸을 위에 맞추고(`vertical-align: top`), 입력은 글자 기준선이 아니라 칸 위에 붙는다. 입력이 없는 칸(번호 · 읽기 칸 · 삭제)은 입력 높이(`density.control-height-sm`)를 한 줄로 써서 글자와 단추가 옆 입력 글자와 같은 줄에 선다. 줄 · 카드 모양에서는 읽기 칸 값이 입력 높이 안에서 가운데에 서고, 머리 줄의 번호 · 삭제는 title 칸 이름 줄만큼 내려 title 입력과 한 줄이다. 오류 글자는 그 입력 바로 아래에 붙는다. 상자 폭이 열 최소 폭 합보다 좁으면(오른쪽 서랍 · 태블릿) 머리 줄 없는 줄 모양, 화면 폭이 `breakpoint.sm`보다 좁으면 줄마다 카드가 되고, 두 모양 모두 칸 이름이 입력 위에 선다. 폭은 화면이 아니라 이 상자에서 잰다(ResizeObserver). Enter로 옮겨 가는 칸은 보이는 입력 · 고르기 단추 · 콤보박스뿐이다. 부품 안의 숨은 입력(QuantityInput 숫자 칸 · Select 값 칸)과 보조 단추(CodeSearch 목록 열기)는 tabindex="-1"이라 건너뛰어, 마지막 칸이 QuantityInput이어도 Enter로 줄이 늘어난다(R-34). 읽기 칸은 column.tone(line)으로 상태를 보인다: 앞 아이콘만 상태 색(danger circle-alert · warning triangle-alert · success circle-check), 글자는 본문 색, 숨은 상태 글자("(확인 필요)" 등)를 붙인다. 줄 추가 단추 아이콘은 addIcon(기본 plus, 인력은 user-plus).
## 접근성
`<table>` + `<caption>`(숨김), 스크롤 상자는 `role="region"` + 표 이름. 칸 render에 넘기는 label은 "<표 이름> <행> <열 이름>"(품목 2 단가)이고 입력의 접근성 이름으로 쓴다. 삭제 단추 이름은 "<표 이름> <행> 삭제". 필수 열은 머리에 숨은 "(필수)"가 붙고 칸 입력은 required. 줄 오류는 그 줄 칸들의 설명이 아니라 바로 아래 행 글자이고, 오류가 생기면 `role="status"`로 읽힌다. 카드의 칸 이름은 보이는 글자이고 입력 이름("1행 수량")이 그 글자를 담는다(WCAG 2.5.3). 오류는 색만이 아니라 글자로 보인다.
## 밀도
행 칸 안쪽 `space.4` `space.8`, 입력 sm(`density.control-height-sm`). 카드 안쪽 `space.12`, 칸 사이 `space.8` `space.12`.
## 플랫폼 차이
네이티브는 다음 Phase다(이번 범위는 웹). 같은 contract로 줄마다 카드(같은 columns · render), Enter 대신 다음 칸 자판 단추(returnKeyType next)를 쓸 예정이다.
## 금지 사항
칸마다 저장 단추 · 줄 순서를 뜻 없이 바꾸기 · 합계를 칸 render 안에서 따로 계산해 표와 다르게 보이기 · 휴대폰에서 입력 표를 가로 스크롤로 두기.
## 스토리
PurchaseLines · JournalLines · TaxInvoiceLines(합계 · 한글 금액) · BudgetLines(줄 오류 · 칸 안 Select) · StaffLines(CodeSearch 칸 · 칸 오류) · EmptyLines(minLines 0) · CellErrors(칸 오류가 붙은 줄의 정렬) · EmptyTotals(줄이 없으면 합계 묶음도 없음).
## 참고
components.md §10 폼 · LedgerEntry 패턴, docs/guides/forms.md(품목 줄). 서비스 요청 R-24 · R-34 · R-35(칸 오류 정렬 · 빈 합계).
