# CommandPalette
## 용도
화면 이름 · 할 일 · 거래처를 글자로 찾아 바로 연다(⌘K · Ctrl+K). 숙련자의 주 이동 수단이고, 메뉴를 몰라도 이름 일부로 닿는다. 값 하나를 골라 칸에 넣는 것은 CodeSearch, 목록을 거르는 것은 FilterBar.
## 해부(Anatomy)
backdrop(`bg.overlay`) · panel(`bg.elevated`, `radius.lg`, `shadow.lg`, 다크는 그림자 대신 `border.default`, 폭 640 · 화면 위에서 12vh) · search(search 아이콘 `fg.secondary` 16 · input `type.h3` 글자 · 오른쪽 Esc 키 모양 `type.caption` `border.default` · 아래 `border.divider`) · suggestions(입력 아래 글자 칩 = SuggestionChips, 지금 글자와 같은 칩이 눌린 모양, `type.caption`, `border.default`, 반경 full) · extra(children 자리) · list(최대 높이 화면의 60%, 안에서 스크롤) · group(머리 `type.caption` `fg.secondary` 600) · item(높이 `density.row-height` 이상, icon 16 `fg.secondary` · label `fg.primary` · description `type.caption` `fg.secondary`(이름 뒤 같은 줄) · meta 오른쪽 `type.caption` `fg.secondary`) · 지금 결과(`bg.sunken` 바탕 + 오른쪽 "열기 ↵") · footer(위 `border.divider`, 키 안내 "↑↓ 이동 · Tab 다음 묶음 · Enter 열기 · Esc 닫기" `type.caption` `fg.secondary`).
## Props
contract 표.
## Variants
대화상자(기본) · inline(제자리). suggestions · children · meta · description 유무.
## States
default. 결과 줄의 지금(키보드 · 마우스) 표시는 `bg.sunken`, disabled 결과는 `fg.disabled`이고 고를 수 없다. loading은 스켈레톤 줄 4개, 결과 0건이면 empty(기본 "찾는 항목이 없습니다").
## 동작
열리면 입력 칸에 초점이 가고 첫 결과가 지금 결과다. 글자를 치면 filter가 true일 때 이름 · 설명 · keywords에 그 글자가 들어간 결과만 남기고(대소문자 무시, 앞뒤 공백 무시) 빈 묶음은 숨긴다. filter가 false면 groups를 그대로 보인다(앱이 서버에서 찾을 때). ArrowDown · ArrowUp은 결과를 옮기고 끝에서 처음으로 돈다. Home · End는 처음 · 마지막. Tab은 다음 묶음의 첫 결과로(Shift+Tab은 앞 묶음), 묶음이 하나면 그대로. Enter나 누르기는 onSelect(item, group)을 부르고 closeOnSelect면 닫는다. Escape나 바깥을 누르면 닫는다. 마우스를 올리면 지금 결과가 그 줄로 옮겨지고, 지금 결과는 목록 안에서 보이게 스크롤된다. 빠른 질문을 누르면 그 글자가 입력에 들어가고(onQueryChange) 초점은 입력에 남는다. 닫았다 열면 찾는 글자는 비제어일 때 비워진다. 열고 닫을 때 투명도와 위아래 4px 이동, `duration.normal`(들어올 때 `easing.enter`, 나갈 때 `easing.exit`).
## 접근성
입력은 `role="combobox"` · `aria-expanded` · `aria-controls`(목록) · `aria-activedescendant`(지금 결과) · `aria-autocomplete="list"`. 목록은 `role="listbox"`, 묶음은 `role="group"` + 머리로 `aria-labelledby`, 결과는 `role="option"` · `aria-selected`(지금 결과) · `aria-disabled`. 대화상자는 `role="dialog"` · `aria-modal="true"`이고 이름은 title(보이지 않는 제목). 결과 건수가 바뀌면 `role="status"`로 "결과 N건"을 polite로 알린다. 초점은 입력에만 있고 결과 줄은 Tab 대상이 아니다(콤보박스 패턴). 닫히면 연 단추로 초점이 돌아간다.
## 밀도
결과 줄 `density.row-height`(compact 32 · comfortable 40), 휴대폰 `space.48`. 입력 줄 높이 `space.48`. 입력 글자 `type.h3`, 휴대폰은 `density.input-font-size`(16, iOS 확대 방지).
## 플랫폼 차이
웹 전용(native false). 폭이 `breakpoint.sm`보다 좁으면 화면 위에 붙은 전체 폭 판(아래만 둥근 모서리, 최대 높이 화면 전체)으로 열린다. 키보드가 아래에서 올라와도 입력과 첫 결과가 보이게 위에 둔다(D-60의 아래 시트와 다른 점). 키 안내 줄은 휴대폰에서 숨긴다.
## 금지 사항
제목 줄 · 닫기 단추를 보이기(폼 대화상자처럼 보인다) · 지금 결과를 왼쪽 색 띠로 표시(D-57) · 묶음 건수 알약(D-56) · 결과를 고르면 확인 없이 외부로 나가는 동작(발행 · 이체) 실행 → 리뷰.
## 스토리
Inline · Shortcut · Answer · Empty.
## 참고
ARIA APG 콤보박스(listbox popup) 패턴. Base UI Dialog. 숙련자용 팔레트 관례(최근 항목 · 묶음 · 키 안내).
