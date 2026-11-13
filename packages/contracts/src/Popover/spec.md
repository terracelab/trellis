# Popover
## 용도
단추 옆에 작은 패널을 열어 짧은 내용(멤버 목록 · 빠른 필터 · 설정 몇 개)을 보이거나 바로 바꾼다. 동작 목록은 Menu, 값 하나 고르기는 Select, 확인 · 긴 입력은 Dialog, 마우스를 올린 설명은 Tooltip.
## 해부(Anatomy)
trigger(Button · IconButton) · popup(`tl-popover`, `bg.elevated`, `border.default`, `shadow.md`(다크는 그림자 없이 선), `radius.md`, `z.dropdown`, 폭 sm 240 · md 320 · lg 400) · head(title `density.body-font-size` 600, close IconButton sm) · body(넘치면 스크롤) · footer(오른쪽 정렬 단추, 위 `border.divider`).
## Props
contract 표.
## Variants
side top · bottom · left · right × align start · center · end, width sm · md · lg, closable 있음 · 없음, footer 있음 · 없음.
## States
default · disabled(트리거가 비활성이고 열리지 않는다). 패널 안의 hover · focus는 안의 요소가 가진다. active · loading · error는 해당 없음.
## 동작
Base UI Popover. 트리거를 누르면 열리고 다시 누르면 닫힌다. Escape · 바깥 누름 · 닫기 단추로 닫히고, 닫히면 포커스가 트리거로 돌아간다. 자리가 없으면 반대쪽으로 뒤집힌다. 모달이 아니라 뒤의 화면을 계속 쓸 수 있다.
- 처음 포커스: `first`면 내용의 첫 조작 요소(입력 · 단추 · 링크, 없으면 패널), `panel`이면 패널 자체(읽기만 하는 목록). 터치로 열면 가상 키보드가 뜨지 않게 패널에 둔다.
- 제어: `open` + `onOpenChange`로 앱이 연다 · 닫는다(적용 뒤 닫기). 없으면 `defaultOpen`에서 시작해 스스로 관리한다.
- 좁은 화면(`breakpoint.sm` 미만, D-60): 같은 트리거가 아래 시트를 연다. 제목 · 닫기는 시트 머리, footer는 시트 아래(안전 영역 여백), 아래로 쓸어 닫는다.

| 키 | 동작 |
| --- | --- |
| Enter · Space | 트리거에서 열기 · 닫기 |
| Tab | 패널 안 요소 사이 이동 |
| Escape | 닫고 트리거로 |
## 접근성
popup은 `role="dialog"`이고 title이 이름(`aria-labelledby`)이다. 트리거에 `aria-haspopup="dialog"` · `aria-expanded`. 닫기 단추 이름은 "닫기". 포커스 링은 항상 보인다. reduced-motion이면 페이드 없이 열린다.
## 밀도
패널 글자 `density.body-font-size`, 머리 높이 `density.control-height-lg`, 안쪽 여백 `space.12`.
## 플랫폼 차이
네이티브는 바텀시트(같은 title · footer). side · align은 웹 전용 표현이고 네이티브에서는 무시한다. props는 같다.
## 금지 사항
팝오버 안 팝오버 · 긴 폼(Dialog · Drawer로) · 저장하지 않으면 사라지는 입력을 footer 없이 · 마우스를 올려 열기(Tooltip으로). 리뷰로 막는다.
## 스토리
Members · Apply.
## 참고
Base UI Popover. PeriodPicker · DataGrid 필터가 같은 headless 부품을 쓴다. 블록 groupware/messenger/chat(멤버)(PR-08).
