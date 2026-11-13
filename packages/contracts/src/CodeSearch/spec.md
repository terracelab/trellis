# CodeSearch
## 용도
코드 또는 이름으로 찾아 하나를 고른다(계정과목 · 거래처 · 품목 · HS 코드). 선택지가 20개 이하로 고정이면 Select.
## 해부(Anatomy)
root(Input과 같은 테두리 · 높이 · 반경) · icon(search, `fg.tertiary`) · control · clear(x) · trigger(chevron) · popup(`bg.elevated`, `border.default`, `shadow.md`, `radius.md`, `z.dropdown`) · item(높이 `density.row-height`, code `font.numeric` `fg.tertiary` · label · meta 오른쪽 `fg.tertiary`) · empty(`fg.tertiary`).
## Props
contract 표.
## Variants
size 5(xs · sm · md · lg · xl). description · meta 유무.
## States
default · hover(`border.strong`) · focus(`border.focus` + 링) · disabled(`bg.sunken`) · error(`status.danger.default` 테두리). 항목 강조는 `bg.sunken`, 고른 항목은 600. active · loading은 해당 없음.
## 동작
Base UI Combobox. 글자를 치면 코드와 이름에서 함께 찾고 첫 결과를 강조한다. ArrowDown · ArrowUp으로 옮기고 Enter로 고른다. Escape는 닫고, 다시 Escape는 입력을 되돌린다. 고르면 칸에 "코드 이름"이 보인다. x로 지우면 null. 마우스 없이 끝까지 쓸 수 있다. **새로 등록**: onCreate가 있으면 목록 맨 아래에 "새로 등록" 줄(앞 plus 아이콘, `fg.link` 글자 500, 위 `border.divider`)이 선다. 친 글자가 있으면 createLabel(q)(기본 "\"q\" 새로 등록"), 없으면 "새로 등록". 결과 0건이면 emptyText 아래에 같은 줄이 서고, 친 글자로 고를 항목이 없으니 Enter가 바로 이 줄을 고른다. 고르면 닫고 onCreate(q)를 부르며 값은 바꾸지 않는다(등록이 끝나면 부모가 value를 넣고, 칸 글자가 그 값으로 바뀐다). **자유 입력**: allowCustomValue면 목록에 없는 글자를 Enter(고를 항목이 없을 때) · 칸을 떠날 때 받아 onCustomValue(글자)를 부르고, 칸에는 그 글자가 남는다(value는 null). 이름 · 코드가 정확히 같은 항목이 있으면 그 항목을 고른다. 받아 둔 글자를 지우고 떠나면 onCustomValue('')로 알린다. 받아 둔 글자가 있으면 넓은 화면에도 x가 보이고, 누르면 칸을 비우고 onCustomValue('')를 부른다. onCreate와 함께 쓰면 "새로 등록" 줄이 우선이고, 자유 입력은 그 줄을 고르지 않고 떠날 때다. 좁은 화면 시트에서는 "\"q\" 그대로 쓰기" 줄과 찾기 칸 Enter로 받는다. **코드 숨김**: showCode=false면 칸 · 목록에 이름만 보이고(코드 자리 없음) meta는 그대로, value는 여전히 고유 키다.
## 접근성
`role="combobox"` 입력 + listbox. Field 라벨이 이름이 된다. 결과가 없으면 emptyText를 polite로 알린다. 포커스 링은 root에 보인다. "새로 등록" 줄은 목록의 option이고 이름은 보이는 글자("\"누리\" 새로 등록")라 코드 항목과 이름으로 구분된다. 시트에서는 목록 아래 단추. 목록이 열려도 바깥에 aria-hidden을 붙이지 않는다. ARIA 콤보박스 패턴대로 바깥 칸은 보이고 초점도 받는다(R-35, Base UI가 붙이는 것을 열린 동안 걷는다).
## 밀도
칸 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56), 항목 `density.row-height`, popup 최대 8행. 입력 글자는 xs~md `density.input-font-size`, lg · xl은 그것과 `type.body` 중 큰 값이다(touch 16은 그대로).
## 플랫폼 차이
네이티브는 전체 화면 검색 시트(입력 + 목록). 웹도 폭이 `breakpoint.sm`보다 좁으면 칸 전체가 시트를 여는 단추가 된다(D-60 · PR-10). 단추 이름은 라벨 + 지금 값(코드 이름), 값이 있으면 옆에 지우기 단추(40). 값이나 받은 글자가 있으면 단추에 `data-filled`가 붙어 FormSection이 name 없이도 "입력 N개"에 센다. 시트 위쪽에 찾기 칸(고정, 글자 16), 아래에 코드 · 이름 · 설명 · 보조 정보 행(`space.48`, 고른 행은 600 + 체크). 코드 · 이름 · 설명 어디에 걸려도 찾고, 없으면 emptyText를 `role="status"`로 보인다. 고르면 시트가 닫힌다. 코드 · 설명 · 보조 정보 글자는 `fg.secondary`(다크 elevated 위 4.5:1).
## 금지 사항
코드 없이 이름만 보이기 · 자유 입력 값 저장(목록에 있는 코드만) · 수천 건을 한 번에 넘기기(앱에서 걸러 넘긴다) → 리뷰.
## 스토리
Account · Partner · Empty · Error · Disabled.
## 참고
Base UI Combobox. 07-domain-coverage.md 2.5(키보드만으로 완료).
