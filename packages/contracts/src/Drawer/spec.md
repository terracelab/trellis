# Drawer
## 용도
목록 · 상세 패턴의 상세 보기, 긴 입력. 목록을 떠나지 않고 한 건을 연다.
## 해부(Anatomy)
backdrop · panel(오른쪽 전체 높이, `bg.elevated`, `shadow.lg`) · head(title `type.h2` · description · actions · nav · 닫기, 아래 구분선) · body(스크롤) · footer(위 구분선, 오른쪽 정렬). nav는 이전 · 다음 IconButton 둘이다(`onPrev` · `onNext`가 있을 때). 아래 시트(side bottom)는 panel 대신 sheet(위 모서리 `radius.xl`, 위 구분선)에 handle(`border.strong` 40 × 4, `radius.full`)이 붙고, title은 `type.h3`, head 아래 구분선이 없다.
## Props
contract 표.
## Variants
side right · bottom, width md · lg · xl(오른쪽 패널), height auto · full(아래 시트). auto는 내용만큼 자라 화면 높이 85%에서 멈추고, full은 화면 높이 92%로 고정한다.
## States
default.
## 동작
오른쪽 패널은 Base UI Dialog를 옆으로 붙인다. 아래 시트(side bottom)는 고르는 시트(`_internal/sheet.tsx`)와 같은 Base UI Drawer로 열어 모양 · 움직임이 같다. 손잡이를 보이고 아래로 쓸어 닫으며, 쓰는 동안 바탕이 같이 옅어진다. footer 버튼은 시트처럼 폭을 나눠 채운다. 열린 Drawer 안에서 또 Drawer를 열면 개발 모드에서 경고한다(components.md §10). 아래 서랍(side bottom)과 휴대폰에서 화면을 다 쓰는 서랍은 footer 높이만큼 토스트를 올린다(Toast 동작 참고).

`onPrev` · `onNext` 중 하나라도 주면 head에 이전 · 다음 단추가 생기고 ← → 키가 같은 일을 한다. 목록의 첫 건이나 마지막 건이라 한쪽을 주지 않으면 그 단추만 꺼지고 자리는 그대로다. 단추 이름은 `prevLabel` · `nextLabel`이고 기본은 "이전 건" · "다음 건"이다. 포커스가 글자를 고치는 칸에 있으면 키를 무시한다. input · textarea · contenteditable이 그렇다. 탭 · 메뉴 · 목록처럼 방향키를 스스로 쓰는 위젯 안에서도 무시한다. 한글 조합 중인 키와 수정 키(Alt · Ctrl · Meta · Shift)를 함께 누른 키도 무시한다. 다음 건의 내용과 제목은 앱이 바꾸고 Drawer는 열린 채로 남는다.

footer는 아래 여백에 `env(safe-area-inset-bottom)`을 더한다. 오른쪽 패널도 화면 바닥까지 닿아서 홈 표시줄이 있는 기기에서는 버튼이 가려지기 때문이다. footer가 없으면 body 아래 여백에 더한다.

| 키 | 동작 |
| --- | --- |
| Escape | 닫기 |
| Tab · Shift+Tab | 창 안에서 순환 |
| ← | 이전 건(`onPrev`가 있을 때, 입력 칸 밖) |
| → | 다음 건(`onNext`가 있을 때, 입력 칸 밖) |
## 접근성
`role="dialog"`, 제목 연결, 포커스 가둠, 닫히면 연 행으로 포커스 복귀. 열리면 첫 초점은 제목(tabindex -1, 링 없음)이다(R-37 10, PR-32): 행을 누르지 않고 주소로 바로 열어도 닫기 단추에 초점 링 · "닫기" 툴팁이 뜬 채 시작하지 않고, 화면 읽기는 제목부터 읽는다. 다음 Tab은 머리 단추 · 본문 순서다. 등록 시트처럼 첫 칸에서 시작해야 하면 그 칸에 `data-autofocus`를 둔다. 포커스는 창 안에 갇힌다: 마지막 칸에서 Tab → 첫 칸, 첫 칸에서 Shift+Tab → 마지막 칸을 keydown에서 바로 옮겨, Tab을 빨리 눌러도(자동 검사 · 키 반복) 창 밖으로 나가지 않는다. 창에는 aria-modal="true"(R-33). 이전 · 다음 단추는 이름이 있는 IconButton이고 `aria-keyshortcuts`로 ← · →를 알린다. 꺼진 단추는 Tab 순서에서 빠진다. 아래 시트의 손잡이는 `aria-hidden`이고 닫기는 닫기 단추 · Escape · 바깥 누름으로도 된다.
## 밀도
안쪽 여백 `space.24`(compact `space.20`). 아래 시트는 head `space.8` · 좌우 `space.20`, footer `space.12` · `space.16`. 아래 시트의 head 단추(이전 · 다음 · 닫기)는 밀도와 관계없이 손가락 크기 `size.touch.min`(44).
## 플랫폼 차이
네이티브는 바텀시트. 이전 · 다음은 head 단추로 같고 키보드 단축키는 웹만.
## 금지 사항
Drawer 안에 Drawer → 리뷰. 상세 대신 새 화면으로 이동 → 리뷰. 이전 · 다음을 한 글자 키(j · k)로 잇기 → 리뷰.
## 스토리
Detail · Paging · Bottom.
## 참고
components.md §10 ListDetail. `_internal/sheet.tsx`(좁은 화면 고르는 시트, D-60).
