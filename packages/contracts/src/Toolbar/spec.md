# Toolbar
## 용도
한 줄에 모은 도구 단추(서식 · 넣기 · 목록 동작)를 묶음과 구분선으로 보여 줄 때 쓴다(ecm/doc-editor 서식 도구 줄). 화면 머리의 주 동작은 PageHeader actions, 여러 건을 고른 뒤 할 일은 ActionBar, 더 보기 메뉴는 Menu, 보기 하나를 고르는 것은 SegmentedControl.
## 해부(Anatomy)
root(`tl-toolbar`, role=toolbar, 줄바꿈 flex, 간격 `space.4`) · group(role=group, 이름 = label) · separator(묶음 사이 세로 선 `border.divider` 1px × `space.20`) · button(높이 · 최소 폭 `density.control-height-sm` · md, `radius.md`, 글자 `fg.secondary`, IconButton ghost와 같은 토큰. 아이콘 16 또는 서식 글자 `type.body` · showLabel이면 아이콘 + 이름) · pressed(켠 단추 `brand.subtle` + `fg.link`) · content(Select 같은 부품 자리) · end(끝 글자 `type.caption` `fg.secondary` tabular, 오른쪽 끝).
## Props
contract 표.
## Variants
size sm(30, 기본) · md(36) × orientation horizontal(기본) · vertical. 단추 종류는 누르는 단추(pressed 없음) · 켜고 끄는 단추(pressed true · false) · 아이콘 + 이름(showLabel) · 서식 글자(text + textStyle bold · italic · underline · strike).
## States
default · hover(바탕 `bg.sunken`, 글자 `fg.primary`) · active(`bg.sunken`, 글자 `fg.strong`) · focus(링 `border.focus` 2px, `tl-focusable`) · disabled(글자 `fg.disabled`, 바탕 없음, `aria-disabled`. 화살표 이동에는 남는다). 켠 단추는 바탕 한 단계(`brand.subtle`)이고 굵은 띠가 없다. loading · error는 해당 없음.
## 동작
단추를 누르면 `onPress(id)`. 켜고 끄는 단추도 같은 onPress이고 pressed는 부르는 쪽이 뒤집는다(문서 상태가 진실이다). 잠긴 단추는 눌러도 onPress를 부르지 않는다.

| 키 | 동작 |
| --- | --- |
| Tab | 도구 줄로 들어온다(마지막에 있던 단추). 다시 Tab이면 밖으로 |
| → · ← (세로는 ↓ · ↑) | 다음 · 앞 단추(끝에서 처음으로 돈다). content 안의 첫 초점 요소(Select)도 들어간다 |
| Home · End | 첫 · 끝 단추 |
| Enter · Space | 단추 누르기 |

탭 정류장은 하나다(roving tabindex). content 안 부품의 tabindex도 도구 줄이 맞춘다. 글자 입력 칸 안에서는 화살표가 글자 커서를 옮긴다. 넓이가 모자라면 단추가 다음 줄로 넘어간다.
## 접근성
`role="toolbar"` + `aria-label`(label) + `aria-orientation`. 묶음은 `role="group"` + 이름, 구분선은 `role="separator"`. 아이콘 · 서식 글자만 있는 단추는 `aria-label`(label)과 툴팁(단축키가 있으면 "굵게 (Ctrl+B)"), 단축키는 `aria-keyshortcuts`. 켜고 끄는 단추는 `aria-pressed`. 잠긴 단추는 `aria-disabled`라 화면 읽기가 찾을 수 있다. 끝 글자는 초점을 받지 않는다. 대비: 글자 `fg.secondary`(4.5:1), 켠 단추 `fg.link` on `brand.subtle`.
## 밀도
단추 `density.control-height-sm`(compact 30 · comfortable 30 · touch 44), md는 `density.control-height-md`. 간격은 밀도와 관계없이 `space.4`.
## 플랫폼 차이
네이티브는 가로 스크롤 줄(키보드 위 서식 줄)로 그린다. 화살표 이동 대신 스크린 리더 쓸어 넘기기. props는 같다.
## 금지 사항
role=toolbar를 블록이 직접(roving 없는 단추 줄) → Toolbar · 켠 단추를 굵은 아래 · 왼쪽 띠로 · 주 동작(저장 · 결재 요청)을 도구 줄에 → PageHeader actions · ActionBar → 리뷰.
## 스토리
Editor · Labels.
## 참고
SY-15 · PG-43(ecm/doc-editor 서식 줄), WAI-ARIA APG Toolbar, IconButton(같은 토큰) · Tooltip. 벤치마크는 구조만.
