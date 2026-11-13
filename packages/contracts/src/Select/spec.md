# Select
## 용도
정해진 선택지 중 하나(상태 · 창고 · 과세 구분). 선택지가 많아 검색이 필요하면 CodeSearch.
## 해부(Anatomy)
trigger(Input과 같은 테두리 · 높이) · mark(고른 선택지의 앞 표시) · value · chevron · popup(`bg.elevated`, `shadow.md`, `radius.md`, `z.dropdown`) · item(높이 `density.row-height`, 앞 표시 · 이름 · note · 선택 표시 check) · mark(점 `space.8` 원, 색은 tone 토큰 · 아이콘 16 `fg.secondary`) · note(`type.caption` `fg.secondary`, 고른 줄에서도 보통 굵기, 비활성 줄은 `fg.disabled`) · empty(선택지 0개 안내, `fg.secondary`). 좁은 화면: sheet(제목 = 라벨) · option(높이 `space.48`, 앞 표시 · 이름 · note · 고른 항목 check).
## Props
contract 표.
## Variants
size 5(xs · sm · md · lg · xl), width auto · full. 선택지 앞 표시(leading)는 점(`kind: 'dot'`) · 아이콘(`kind: 'icon'`) 둘. 점의 tone은 토큰 이름만 받는다(`SelectMarkTone`): 차트 계열 슬롯 series-1~5 · compare · income · expense · success · warning · danger(`color.chart.*` · `color.finance.*` · `color.status.*.default`, 범례와 같은 색), 상태 톤 info · neutral(StatusDot과 같은 색), 결재 5상태 draft · pending · approved · rejected · withdrawn(`color.approval.*.default`, 결재 배지 점과 같은 색). hex · CSS 색 문자열은 타입이 막는다.
## States
default · hover · focus · disabled · error.
## 동작
Base UI Select. 글자를 치면 그 글자로 시작하는 항목으로 간다(이름 글자로만 찾고 note는 보지 않는다). 열릴 때 선택된 항목에 맞춰 놓인다. 고른 선택지에 앞 표시가 있으면 닫힌 칸에도 이름 앞에 보이고, note는 목록에만 보인다. note는 disabled와 따로 쓴다(쓸 수 있지만 "사용 중"인 것, 쓸 수 없고 "운영 종료"인 것 모두). 체크는 고른 줄에만 보이고 다른 줄은 자리만 잡아 note가 줄마다 같은 끝에 선다. 폭이 `breakpoint.sm`보다 좁으면 화면 아래 시트로 열고, 항목을 누르면 고르고 닫는다. 시트는 아래로 쓸어 닫을 수 있다. 선택지가 0개면 빈 목록 대신 "선택할 항목이 없습니다"(messages `select.empty`, en "No options")를 팝업 · 시트에 보인다.
## 접근성
넓은 화면: `role="combobox"` 트리거 + listbox. 좁은 화면: `aria-haspopup="dialog"` 버튼 → `role="dialog"` 시트(제목 = 라벨) 안 `role="radiogroup"`. Field 라벨이 이름이 된다. 앞 표시는 꾸밈이라 `aria-hidden`이고 뜻은 이름 글자가 말한다(색만으로 구분하지 않는다). note는 선택지 글자의 일부라 함께 읽는다("CRM 이전 사용 중"). note 글자 대비는 `bg.elevated` 위 4.5:1 이상(`fg.secondary`). 빈 안내는 `role="status"`이고, 그때 listbox · radiogroup은 그리지 않는다.
## 밀도
트리거 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56), 항목 `density.row-height`. 트리거 글자는 xs~md `density.input-font-size`, lg · xl은 그것과 `type.body` 중 큰 값이다(touch 16은 그대로). 시트 행은 밀도와 관계없이 `space.48`(손가락).
## 플랫폼 차이
네이티브는 바텀시트(components.md §9).
## 금지 사항
선택지 2개를 Select로(RadioGroup · SegmentedControl, 단 LineItemsEditor · DataGrid 줄 안의 칸은 Select) · 20개 넘는 목록(CodeSearch) · 점 색을 hex · CSS 변수로 넘기기(타입이 막는다, tone 이름만) · 이름 없이 점만으로 뜻 전하기 · note에 긴 설명(한두 단어) → 리뷰.
## 스토리
Default · Placeholder · Error · Disabled · Marks(앞 표시 · note) · Empty(선택지 없음) · Narrow(시트).
## 참고
Base UI Select. 점 색 규칙은 차트 `ChartColor`(components.md §11) · 상태 어휘 tone(vocab.ts) · 결재 배지와 같다.
