# FolderTree
## 용도
폴더 · 메일함처럼 겹쳐 담긴 묶음을 트리로 보여 주고 하나를 고를 때 쓴다. 고른 폴더의 내용은 옆 목록(DataGrid · 메일 목록)이 보인다. 화면 이동 메뉴는 SideNav, 표 안의 계층 행(계정 과목 · BOM)은 DataGrid childrenKey, 값 하나 고르기는 Select.
## 해부(Anatomy)
root(`role="tree"`) · item(행 높이 `density.row-height`, `radius.md`, 들여쓰기 단계마다 `space.12`, 글자 `density.body-font-size` `fg.secondary`) · toggle(펼침 칸 `density.control-height-sm` 정사각, chevron-right 16 `fg.tertiary`, 펼치면 90도) · icon(16 `fg.tertiary`, 기본 folder) · label(말줄임) · count(흐린 숫자 `type.caption` `fg.secondary` tabular, 알약 없음).
## Props
contract 표. 폴더 값(FolderTreeNode)은 id · label · icon · count · children · disabled다.
## Variants
없음. 하위가 하나도 없는 한 단계 목록(메일함)은 펼침 칸 없이 아이콘부터 시작한다.
## States
default · hover(행 `bg.sunken`, 글자 `fg.primary`) · focus(행 안쪽 링) · disabled(`fg.disabled`, 고를 수 없음, 포커스는 간다). 고른 폴더는 `brand.subtle` 바탕 + `fg.link` 600(아이콘도 `fg.link`). active · loading · error는 해당 없음.
## 동작
행을 누르면 그 폴더를 고르고(onSelect) 포커스가 행으로 간다. 펼침 칸을 누르면 펼치기 · 접기만 하고 고르지 않는다. 행을 두 번 누르면 펼치기 · 접기. 접힌 폴더의 하위는 그리지 않는다. selected · expanded를 주면 제어, defaultSelected · defaultExpanded만 주면 컴포넌트가 들고 있다. 고르기와 포커스는 따로다. 화살표로 옮겨 다니고 Enter · Space로 고른다.

| 키 | 동작 |
| --- | --- |
| ArrowDown · ArrowUp | 보이는 다음 · 이전 행 |
| ArrowRight | 접힌 폴더는 펼친다. 펼친 폴더는 첫 하위로 |
| ArrowLeft | 펼친 폴더는 접는다. 아니면 상위로 |
| Home · End | 첫 행 · 마지막 행 |
| Enter · Space | 고르기 |
| 글자 입력 | 그 글자로 시작하는 다음 행으로(이어 치면 이어 찾는다) |
## 접근성
`role="tree"` + 평평한 `treeitem`(`aria-level` · `aria-setsize` · `aria-posinset`). 하위가 있으면 `aria-expanded`, 고른 행은 `aria-selected="true"`, 쓸 수 없으면 `aria-disabled`. 트리에는 한 행만 탭 순서에 든다(포커스했던 행 → 고른 행 → 첫 행). 행 이름은 "폴더 이름 N건"(건은 숨은 글자). 트리 이름은 label, 없으면 "폴더". 펼침 상태는 chevron 방향과 `aria-expanded`가 함께 말한다. reduced-motion이면 chevron이 돌지 않는다. 휴대폰(touch)에서 행은 48, 펼침 칸은 40.
## 밀도
행 높이 `density.row-height`(compact 32 · comfortable 40 · touch 48), 펼침 칸 `density.control-height-sm`, 글자 `density.body-font-size`.
## 플랫폼 차이
네이티브는 같은 props로 행 목록을 그리고, 펼침 칸 · 행을 누르는 동작이 같다. 화살표 키 · 글자 찾기는 없다(Phase 3).
## 금지 사항
건수를 알약 배지로(D-56, 리뷰) · 고른 행 왼쪽에 색 띠(D-57, 리뷰) · 행 안에 단추 넣기(펼침 칸 말고는 행 전체가 하나) · 다섯 단계 넘는 깊이(화면 구조를 다시 본다, 리뷰).
## 스토리
Documents · Mailboxes.
## 참고
PF-15 후보 FolderTree(ecm/my-docs/browser · groupware/mail/inbox 블록). WAI-ARIA APG Tree View 패턴의 키보드.
