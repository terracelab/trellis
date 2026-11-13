# TagInput
## 용도
값 여러 개를 칩으로 넣고 빼는 칸을 보여 줄 때 쓴다. text 모드는 키워드 · 분류(추천에 없는 글자도 넣는다), person 모드는 참조자 · 참석자 · 담당자처럼 사람을 칩(아바타 + 이름)으로 넣는다(R-T25). 정해진 선택지에서 여러 개 고르기만 하면 MultiSelect, 하나만 찾아 고르면 CodeSearch, 칩 하나 보여 주기는 Tag.
## 해부(Anatomy)
root(`tl-tag-input`) · box(Input과 같은 칸: `bg.surface`, `border.strong` 1px, `radius.md`, 최소 높이 `density.control-height-*`) · tags(`ul`, Tag 칩. person은 원 아바타 24) · control(`input` role=combobox, 글자 `density.input-font-size`) · popup(칸 바로 아래, `bg.elevated` · `border.default` · `shadow.md` · `z.dropdown`) · option(행 높이 `density.row-height`, 가리킨 행 `bg.sunken`. person은 PersonLabel sm) · 추가 줄('"글자" 추가', `fg.link` + plus 아이콘) · 빈 글자 · 알림 줄(`aria-live`) · 숨은 입력(`name`이 있으면 값마다).
## Props
contract 표.
## Variants
mode 2 × size 5. 칸 높이는 Input과 같고(xs 26 · sm 30 · md 36 · lg 42 · xl 48) 칩이 넘치면 줄이 늘어난다. 칩 크기는 xs · sm 칸 = Tag sm, md 이상 = Tag md.

| mode | 칩 | 추천 행 | 추천에 없는 글자 |
|---|---|---|---|
| text(기본) | Tag 글자 | 이름 + 보조 글자 | 넣는다(allowCustom 기본 true) |
| person | Tag person(원 아바타 24 + 이름) | PersonLabel sm(아바타 · 이름 · 직책) | 넣지 않는다(기본 false) |
## States
default · hover(칸 테두리 `border.hover`) · focus(칸 테두리 · 1px 링 `border.focus`) · disabled(면 `bg.sunken`, 테두리 없음, 칩 × 단추 없음) · error(테두리 `status.danger.default`, `aria-invalid`). active · loading은 해당 없음.
## 동작
글자를 치면 추천이 이름 · 값 · 보조 글자로 걸러져 칸 아래에 열린다(contracts `filterTagSuggestions`, 넣은 값은 빠진다). 칸을 누르거나 ↓로도 연다.

| 키 | 동작 |
|---|---|
| ↓ · ↑ | 추천 행 가리키기(목록이 닫혀 있으면 ↓가 연다) |
| Enter | 가리킨 행을 넣는다. 가리킨 행이 없으면 친 글자를 넣는다(추천 이름과 같으면 그 추천, 아니면 allowCustom일 때 글자 그대로) |
| 쉼표 | text 모드에서 친 글자를 넣는다 |
| Backspace | 빈 칸에서 마지막 칩을 뺀다 |
| Escape | 목록을 닫는다. 닫혀 있으면 친 글자를 지운다 |
| Tab | 칩 × 단추 · 다음 칸으로 |

person 모드는 첫 추천을 바로 가리켜 Enter가 첫 사람을 넣는다. text 모드는 화살표로 고를 때만 가리켜 Enter가 친 글자를 넣는다. 한글 조합 중 Enter · 쉼표는 조합을 끝내는 키라 칩을 만들지 않는다. 쉼표 · 줄바꿈 · 탭이 든 글자를 붙여 넣으면 나눠서 한 번에 넣는다(`splitTagText`, text 모드). text 모드는 칸을 떠날 때 남은 글자를 칩으로 넣는다. 추천을 누르는 동안 입력 칸은 초점을 잃지 않는다. `max`에 닿으면 입력 칸이 읽기 전용이 되고 자리 글자가 "최대 N개를 넣었습니다"로 바뀐다. value를 주면 컨트롤드, defaultValue는 언컨트롤드다. person 모드의 값은 사람 id이고 칩 이름 · 사진은 suggestions에서 찾는다.
## 접근성
입력 칸은 `role="combobox"` + `aria-expanded` · `aria-controls` · `aria-activedescendant`(가리킨 행), 목록은 `role="listbox"`, 행은 `role="option"` + `aria-selected`. 이름은 Field 라벨(`<label for>`) 또는 `label`. 넣은 칩 목록은 `ul` "넣은 항목", × 단추 이름은 "<이름> 삭제". 넣기 · 빼기 · 한도는 `aria-live` 알림 줄이 읽는다("한서연 추가했습니다"). 오류는 Field 오류 글자 + `aria-invalid`. 대비: 글자 `fg.primary`, 자리 글자 `fg.tertiary`, 보조 글자 `fg.secondary`(다크 elevated 위 4.5:1).
## 밀도
칸 최소 높이 `density.control-height-*`(touch는 44 · 48 · 56), 입력 글자 `density.input-font-size`(touch 16, iOS 확대 방지), 추천 행 `density.row-height`.
## 플랫폼 차이
웹은 칸 바로 아래 목록(대화 상자 위에도 뜬다, `z.dropdown`). 네이티브는 칸 아래 목록 대신 아래 시트에서 찾는다. props는 같다.
## 금지 사항
상태 고르기에 TagInput → MultiSelect · 사람 칩을 CSS로 직접(R-T25) → TagInput person · 추천에 없는 사람을 글자로 넣기 · 칩 색으로 상태 표시 · 칸 안에 칩 대신 "외 3명" 글자 → 리뷰.
## 스토리
Keywords · People · Limits.
## 참고
R-T25(휴가 신청 참조자 칩), SY-13(TagInput 사람 칩), Tag, PersonLabel, MultiSelect, CodeSearch. 콤보박스 패턴은 WAI-ARIA APG Combobox(목록 자동 완성). 벤치마크는 구조만.
