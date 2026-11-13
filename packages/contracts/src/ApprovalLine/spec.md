# ApprovalLine
## 용도
전자결재 문서의 결재선(기안 · 검토 · 합의 · 승인 · 참조)과 사람마다 결재 상태를 보여 준다. 결재함 표 칸 · 목록 행에는 compact(결재 5색 점 + "2/3 합의", R-T24). 결재선을 고치는 것은 ApprovalLineEditor, 결재가 아닌 처리 단계는 Stepper.
## 해부(Anatomy)
root(`tl-approval-line`, `<ol>`) · step(칸, `bg.surface`, `border.default`, `radius.md`) · role(머리 띠, `bg.canvas`, `type.caption` `fg.secondary`) · name(`type.label` 600) · title(직함 `type.caption` `fg.tertiary`) · badge(Badge approval, 대기는 neutral) · time(`type.caption` `fg.tertiary`, tabular) · comment(`type.caption` `fg.secondary`, 한 줄) · line(칸 사이 `border.default`). compact: dots(점 8, 사이 `space.4`. 결재 5색 `approval.*.default`로 채운 원, 대기는 `border.strong` 빈 원) · summary("2/3 합의", tabular, `density.body-font-size`).
## Props
contract 표.
## Variants
variant default(사람마다 칸, 기본) · compact(점 + 단계 한 줄). default는 orientation horizontal(문서 본문 위, 기본) · vertical(좁은 패널 · 모바일). 진행(pending) 칸은 테두리가 `approval.pending.default`로 강조된다. compact는 orientation을 쓰지 않는다.
## States
default(데이터 상태). 결재 상태는 Badge의 결재 5색과 대기(neutral)로 그린다. hover · active · focus · disabled · loading · error는 해당 없음.
## 동작
표시 전용. role을 생략하면 첫 칸 기안 · 마지막 칸 승인 · 사이 검토. compact의 단계 글자는 지금 단계(진행 칸 → 반려 · 회수 칸 → 마지막으로 처리한 칸, contracts `approvalLineSummary`)의 "번호/전체 역할"이고, 마우스를 올리면 칸마다 "역할 이름 상태"가 `title`로 보인다. comment는 한 줄로 자르고 전체 글은 `title` 속성으로 보인다. 반려 사유를 길게 보여 줄 때는 화면이 Dialog로 연다.

좁은 폭(R-T14): 루트는 `min-width: 0` · `max-width: 100%`라 flex · grid 부모 안에서 줄어든다. 의견 칸은 `contain: inline-size`로 글자 폭을 빼고 재므로 긴 의견이 결재선과 부모(결재 문서 머리 · 카드)의 최소 폭을 넓히지 않는다. 344 폭에서도 본문이 가로로 넘치지 않는다. 의견 폭은 칸이 정한다(가로 칸 폭 · 세로 줄 전체).
## 접근성
`<ol aria-label="결재선">`, 진행 칸에 `aria-current="step"`. 칸마다 역할 · 이름 · 직함 · 상태 글자가 순서대로 읽힌다. 상태는 색 + 점 + 글자. compact는 점을 감추고 "3/4 검토" 뒤에 숨은 글자(지금 상태 + 칸마다 역할 · 이름 · 상태)를 읽는다.
## 밀도
칸 폭 최소 `space.64` × 2, 안쪽 여백 `space.8`. 밀도와 관계없다. compact는 글자 `density.body-font-size`, 줄을 넘기지 않는다.
## 플랫폼 차이
네이티브는 세로가 기본이고 가로는 넘치면 가로 스크롤. props는 같다.
## 금지 사항
결재 상태를 Badge approval · 결재 5색 밖의 색으로 그리기 · 결재 어휘 바꾸기(상신 · 완료 · 거부) · 결재선을 Stepper로 · 결재 단계 점을 블록이 CSS로 직접(R-T24 → compact) — 리뷰(components.md §10 ApprovalFlow).
## 스토리
Purchase · RejectedVertical · Narrow · Compact.
## 참고
components.md §10 ApprovalFlow, content.md §6 결재 어휘, R-T24 · PG-43(compact, groupware/approval/inbox).
