# Tooltip
## 용도
아이콘만 있는 버튼 · 잘린 글자에 보조 설명 한 줄을 붙인다. 꼭 알아야 하는 내용(오류 · 조건)은 Field 도움말이나 Popover에 둔다.
## 해부(Anatomy)
trigger(감싼 요소 그대로) · popup(`tl-tooltip`, 바탕 `fg.primary`, 글자 `fg.inverse`, `type.caption`, `radius.sm`, `z.dropdown`). 화살표 없음. 트리거와 간격 `space.4`.
## Props
contract 표.
## Variants
side 4(top · bottom · left · right). 공간이 없으면 반대쪽으로 뒤집힌다.
## States
default. 열림 · 닫힘은 시각 상태가 아니라 동작이다. hover · focus · active · disabled · loading · error는 해당 없음(트리거가 가진다).
## 동작
Base UI Tooltip. 마우스를 올리고 `delay`(기본 400ms) 뒤 열리고, 키보드 포커스에도 열린다. 트리거를 누르거나 Escape를 누르면 닫힌다. 터치 기기에서는 열리지 않는다. 여러 툴팁이 붙어 있으면 `TooltipProvider`로 감싸 하나가 열린 뒤 옆 툴팁은 바로 열린다.

| 키 | 동작 |
| --- | --- |
| Tab | 트리거에 포커스가 오면 연다 |
| Escape | 닫는다 |
## 접근성
`role="tooltip"`. 툴팁은 보조 표시라 트리거의 이름을 대신하지 않는다. 트리거는 `aria-label`(IconButton `label`)을 따로 가지고, content는 그 말과 같게 쓴다. 대비는 `fg.inverse` on `fg.primary`로 4.5:1 이상. reduced-motion이면 페이드 없이 바로 보인다.
## 밀도
밀도와 관계없이 `type.caption`, 안쪽 여백 `space.4` · `space.8`.
## 플랫폼 차이
웹 전용(`platforms.native=false`). 네이티브는 길게 누르기 대신 라벨을 화면에 쓴다.
## 금지 사항
버튼 · 링크를 툴팁 안에 넣기(Popover) · 문장 두 개 이상 · 비활성 버튼에 직접 걸기(포커스를 못 받는다. span으로 감싼다) — 리뷰.
## 스토리
Default · Sides · IconToolbar(TooltipProvider).
## 참고
Base UI Tooltip, components.md §9(Tooltip native=false).
