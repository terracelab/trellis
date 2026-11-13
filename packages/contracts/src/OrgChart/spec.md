# OrgChart
## 용도
회사 조직을 위에서 아래로 내려가는 나무로 보여 주고, 조직을 골라 그 조직의 구성원 · 결재 정책을 옆에서 열 때 쓴다. 조직 칸에 조직장(PersonLabel sm)과 인원을 둔다. 폴더 · 메일함처럼 이름만 고르면 FolderTree.
## 해부(Anatomy)
root(가로 스크롤) · tree(`ul role=tree`) · item(`li role=treeitem`) · node(칸: 이름 700 · 조직장 · 인원 caption `fg.tertiary`, `radius.lg` 테두리) · toggle(칸 아래 가장자리 가운데 동그라미, +/−) · group(`ul role=group`) · 연결선(구조선 `border.strong` 1px).
## Props
contract 표.
## Variants
defaultExpanded 'all'(기본) · 펼칠 id 목록. 고른 조직은 테두리 한 바퀴(`border.selected`).
## States
default · hover(칸 테두리 진하게, `duration.fast`) · focus(칸에 포커스 링).
## 동작
칸을 누르면 고른다(onSelect). 동그라미를 누르면 하위 조직을 접고 편다(고르지 않음). 넓으면 가로로 스크롤한다. 휴대폰(640 미만)은 들여 쓴 목록이 되고 하위 묶음 왼쪽에 나무 구조선이 생긴다.
## 접근성
ARIA tree(탐색 트리 패턴: 항목 = 노드 칸, 하위 group은 형제 ul + aria-owns). 트리 안 Tab 정지는 하나(로빙 tabindex). ↑ ↓ = 보이는 순서로 이동, → = 펼치기 · 첫 하위로, ← = 접기 · 상위로, Home · End, Enter · Space = 고르기. 항목 이름 = 노드 칸의 보이는 글자 전체(조직 이름 · 조직장 · 인원). 보이는 글자가 이름에 다 들어가야 한다(WCAG 2.5.3). 동그라미는 마우스용(aria-hidden).
## 밀도
세로 간격 `space.32`, 형제 사이 `space.16`, 칸 폭 192~256. 밀도와 관계없이 같다.
## 플랫폼 차이
네이티브는 들여 쓴 목록만 그린다.
## 금지 사항
조직마다 다른 바탕색 · 인원을 알약으로 · 칸 왼쪽 색 띠(D-56 · D-57) → 리뷰.
## 스토리
Company · Collapsed.
## 참고
FolderTree(키보드 규칙), PersonLabel.
