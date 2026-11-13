# MultiSelect
## 용도
정해진 선택지 중 여러 개를 고른다. 주로 목록 필터(판매 채널 · 상태 · 창고)에 쓴다. 하나만 고르면 Select, 선택지가 많아 검색이 필요하면 CodeSearch.
## 해부(Anatomy)
trigger(Select와 같은 테두리 · 높이 · chevron) · summary(없음 → placeholder, 하나 → 그 이름, 여럿 → "포근몰 외 2") · popup(Select와 같은 `bg.elevated` · `shadow.md` · `radius.md` · `z.dropdown`) · item(높이 `density.row-height`, 체크 상자 · 앞 표시 · 이름 · note) · box(`border.strong` 테두리, 고르면 `brand.default` 바탕 + check) · mark · note(Select와 같다: 점은 tone 토큰, note는 `type.caption` `fg.secondary`) · empty(선택지 0개 안내, Select와 같다). 닫힌 칸에는 요약 글자에 이름이 보이는 첫 선택지의 앞 표시가 이름 앞에 선다. 좁은 화면: sheet(제목 = 라벨) · option(높이 `space.48`, 체크 상자 · 앞 표시 · 이름 · note) · footer(선택 해제 · 완료).
## Props
contract 표.
## Variants
size 5(xs · sm · md · lg · xl), width auto · full. 선택지 앞 표시(leading 점 · 아이콘)와 note는 Select와 같은 SelectOption이고 같은 규칙이다(점 색은 `SelectMarkTone` 토큰 이름만).
## States
default · hover(`border.strong`) · focus(`border.focus` + 링) · disabled(`bg.sunken`) · error(`status.danger.default` 테두리). active · loading은 해당 없음.
## 동작
Base UI Select(multiple). 항목을 누를 때마다 넣고 빼며, 팝업은 열린 채로 있다. Escape · 바깥 누름으로 닫힌다. 바뀔 때마다 onChange(고른 값 전부, 선택지 순서)를 부른다. 필터는 바로 반영한다(적용 버튼 없음). 아무것도 고르지 않은 상태가 "전체"다. 필터에서 note는 건수("12건")처럼 고르기 전에 보면 좋은 한두 단어에 쓴다. 폭이 `breakpoint.sm`보다 좁으면 화면 아래 시트로 열리고, 행을 누르면 넣고 빼며, 선택 해제 · 완료가 아래에 있다. 선택지가 0개면 Select와 같은 "선택할 항목이 없습니다"(messages `select.empty`)를 보인다.
## 접근성
넓은 화면: `role="combobox"` 트리거 + `aria-multiselectable` listbox. Field 라벨이 이름이 된다. 좁은 화면: 트리거는 `aria-haspopup="dialog"` 버튼, 시트는 `role="dialog"` + 제목, 행은 `role="checkbox"` + `aria-checked`. 포커스 링은 항상 보인다. 앞 표시는 `aria-hidden`, note는 선택지 글자와 함께 읽는다. 빈 안내는 `role="status"`.
## 밀도
트리거 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56, Select와 같은 CSS), 항목 `density.row-height`. 시트 행은 밀도와 관계없이 `space.48`(손가락).
## 플랫폼 차이
네이티브는 바텀시트에 같은 체크 목록과 선택 해제 · 완료. props는 같다.
## 금지 사항
선택지 2~3개를 MultiSelect로(Checkbox 묶음이나 SegmentedControl) · 20개 넘는 목록(CodeSearch) · "전체" 항목을 선택지에 넣기(아무것도 안 고른 것이 전체) · 트리거 글자를 직접 만들기(`multiSelectSummary`) → 리뷰.
## 스토리
Default · Filter(width auto) · Marks(결재 상태 점 · 건수 note) · Error · Disabled · Narrow(시트).
## 참고
Select · FilterBar. content.md §6(전체 · 외 n).
