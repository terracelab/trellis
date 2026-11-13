# Timeline
## 용도
한 건에 일어난 일의 순서(입고 처리 이력 · 결재 이력 · 배치 실행 로그)를 세로 줄로 보여 줄 때 쓴다. 결재선 단계 진행은 Stepper, 여러 건의 목록은 표.
## 해부(Anatomy)
list(`<ol>`) · item · rail(marker + line) · marker(점 8 톤의 `status.*.default`, icon이 있으면 원 24 `status.*.subtle` 바탕에 아이콘 16 톤 색) · line(`border.divider` 2) · title(`type.label` 600 `fg.primary`) · meta(time · actor, `type.caption` `fg.tertiary`, tabular) · description(`type.caption` `fg.secondary`).
## Props
contract 표.
## Variants
marker 2(점 · 아이콘) × tone 5 × dense 유무.
## States
default.
## 동작
items 순서대로 위에서 아래로 그린다. 최신을 위에 둘지는 화면이 정한다. 마지막 항목은 아래 선을 그리지 않는다. time은 화면이 서식을 맞춘 글자다(2026-11-07 14:20). 실패 · 반려 같은 항목은 tone으로 색을 주고 제목 글자로도 말한다.
## 접근성
`<ol>`(순서 있는 목록), `aria-label`로 목록 이름(결재 이력)을 준다. marker는 장식이고 상태는 제목 글자가 말한다.
## 밀도
항목 아래 여백 `space.16`, dense는 `space.8`.
## 플랫폼 차이
없음.
## 금지 사항
결재선 진행(가로 Stepper)에 쓰기 · 색만으로 실패 표시 · 시각 서식을 항목마다 다르게 → 리뷰.
## 스토리
Receiving · Approval · BatchLog · Dense.
## 참고
D-48 어휘(입고 · 배치 작업), content.md §4 시각 · 날짜.
