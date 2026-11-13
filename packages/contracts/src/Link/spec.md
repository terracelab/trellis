# Link
## 용도
다른 화면 · 문서 · 바깥 사이트로 가는 글자 링크를 보여 줄 때 쓴다(수주 번호 · 결재 설정 · 출처 문서). 앱 안 주소는 TrellisProvider `navigate`로 새로 고침 없이 연다(R-T34). 화면 안 동작(저장 · 열기 · 삭제)은 Button, 행 전체를 누르는 표는 DataGrid `onRowPress` + 열 `link`, 사람은 PersonLabel `href`.
## 해부(Anatomy)
root(`a`, `tl-link`, `data-tl-link`) · 글자(둘레 글자 크기를 따른다, `font.weight.500`) · 바깥 아이콘(`external-link` 16, 꾸밈) · 숨은 글자("새 창에서 열림", 바깥 링크만). 색은 `fg.link`(default) · `fg.secondary`(subtle) · `fg.primary`(plain) · `fg.disabled`(disabled). 밑줄은 글자색 `border.width.1`, 띄움 `border.width.3`.
## Props
contract 표.
## Variants
variant 3 × underline 2.

| variant | 쉴 때 | hover | 쓰는 곳 |
|---|---|---|---|
| default | `fg.link` | 밑줄 | 번호 · 화면 이름 · 문서 이름 |
| subtle | `fg.secondary` | `fg.primary` + 밑줄 | 출처 · 덜 중요한 링크 |
| plain | `fg.primary` 500 | 밑줄(키보드 초점도) | 표 칸 · 목록 안 이름 링크 |

plain(D-146 제안): 링크 색 `fg.link`는 회사 색이라 기본 주황(brand.600)이 위험 빨강(red.600)과 ΔE 4.7로 붙는다. 표 · 목록에서 위험 배지 옆 이름이 오류처럼 읽혀 표 · 목록 안 링크는 본문 색으로 둔다. 칸 · 줄 전체가 링크이고 둘레에 링크 아닌 글이 섞이지 않으므로 색이 없어도 구분된다(WCAG 1.4.1). 그래서 plain은 칸 · 줄의 글 전체가 링크일 때만 쓴다. 링크 뒤에 같은 줄 글이 이어지면("한서연 님이 신청") default를 쓴다. 배지 · 날짜처럼 모양이 다른 것은 옆에 와도 된다. 가리키거나 키보드로 오면 밑줄이 생긴다. DataGrid 칸 · DescriptionList 안의 default 링크는 variant를 주지 않아도 plain 모양이다. 문장 안 링크는 default + always 그대로다.

underline hover(기본) = 가리킬 때 밑줄(표 칸 · 목록처럼 링크인 줄 아는 자리), always = 늘 밑줄(문장 안 링크는 색만으로 구분하지 않는다, WCAG 1.4.1). TrellisProvider `linkUnderline`(`data-links="underline"`)이면 모두 늘 밑줄이다.
## States
default · hover(밑줄, subtle은 글자 `fg.primary`, `duration.fast`) · active(밑줄 `border.width.2`) · focus(포커스 링 `border.focus` 2px, 모서리 `radius.xs`) · disabled(주소를 떼고 `fg.disabled`, `aria-disabled`). loading · error는 해당 없음.
## 동작
누르면 `onPress`를 먼저 부른 뒤 이동한다. 앱 안 주소(스킴이 없고 `#id`가 아닌 주소, contracts `isAppHref`)이고 TrellisProvider `navigate`가 있으면 a 태그 기본 이동을 막고 `navigate(href)`를 부른다. Ctrl · Cmd · Shift · Alt · 가운데 단추 누름은 새 탭 · 새 창이므로 브라우저에 맡긴다. `navigate`가 없으면 a 태그 그대로다(Provider 없이도, Django 화면에서도 같다).

바깥 주소(`external`, 없으면 http(s) · `//`로 시작하는 주소, contracts `isExternalHref`)는 `target="_blank"` · `rel="noopener noreferrer"`로 새 탭에 열고 끝에 바깥 아이콘을 붙인다. `mailto:` · `tel:`은 바깥 표시 없이 브라우저에 맡긴다.

| 키 | 동작 |
|---|---|
| Tab | 링크로 초점 |
| Enter | 이동(누름과 같다) |

표 안: DataGrid는 행 누름을 a · button 누름에서 일으키지 않으므로 `onRowPress`가 있는 표의 칸에 Link를 그대로 넣는다. 열 `link`(행을 누르면 상세가 열린다는 본문 색 500 글자)와는 다르다. 칸 안 Link는 자기 주소로 간다.
## 접근성
링크 이름은 글자다. 바깥 링크는 숨은 글자 "새 창에서 열림"이 이름 끝에 붙는다(아이콘은 꾸밈). 갈 수 없는 링크는 `role="link"` + `aria-disabled="true"`이고 주소가 없어 초점을 받지 않는다(이름은 읽힌다). 대비: `fg.link` · `fg.secondary`는 면 위 4.5:1 이상(회사 색 엔진이 `fg.link`를 맞춘다). 포커스 링은 `.tl-focusable`. 움직임은 색 · 밑줄 전환뿐이고 움직임 줄이기에서 0이 된다.
## 밀도
치수가 밀도와 관계없다. 글자 크기는 둘레를 따른다.
## 플랫폼 차이
네이티브는 Pressable + Text, 앱 안 주소는 navigate(라우터 주입), 바깥 주소는 `Linking.openURL`. props는 같다.
## 금지 사항
화면 안 동작(저장 · 삭제)에 Link → Button · 링크를 단추 모양으로 꾸미기 · 문장 안 링크에 underline hover(색만으로 구분) · 같은 문장에 "여기" 같은 이름 없는 링크 · 바깥 링크를 같은 탭에 · a 태그를 직접 그려 라우터를 우회 → 리뷰.
## 스토리
Basic · External · Variants · InTable · Router.
## 참고
R-T34(PersonLabel href가 라우터에서 전체를 다시 불러온다), TrellisProvider `navigate`, PersonLabel, DataGrid(열 `link` · render), `_internal/a11y-modes.css`(`data-links`). 벤치마크는 구조만.
