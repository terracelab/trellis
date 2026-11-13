# ApprovalLineEditor
## 용도
기안할 때 결재선(결재자 순서 · 역할 검토 · 합의 · 승인)과 참조자를 고칠 때 쓴다(기안 작성 · 휴가 신청, R-T25). 결재선을 보이기만 하면 ApprovalLine, 사람 여럿을 칩으로 넣기만 하면 TagInput person.
## 해부(Anatomy)
root(`tl-approval-line-editor`, 칸 폭 기준 `container-type`) · list(`ol`, `border.divider` 1px, `radius.md`, 오류면 `status.danger.default`) · row(순서 | 사람 | 역할 | 단추, 최소 높이 `density.row-height` + `space.16`, 줄 사이 `border.divider`) · drafter(0번 줄 고정, `bg.sunken`, 역할 글자 "기안" `type.label` 600 `fg.secondary`) · no(순서 `type.label` `fg.tertiary` tabular) · who(PersonLabel: 아바타 · 이름 직함 · 부서) · role(Select sm: 검토 · 합의 · 승인) · tools(IconButton sm: 위로 · 아래로 · 빼기) · warn(아이콘 `status.warning.default` + 글자 `fg.secondary`, 바탕 없음) · add(Field "결재자 추가" + CodeSearch) · cc(Field "참조" + TagInput person) · 알림 줄(`aria-live`).
## Props
contract 표.
## Variants
참조 칸 있음(기본) · 없음(showCc false). 기안자(drafter)가 있으면 0번 줄이 생긴다. max에 닿으면 추가 칸이 잠기고 도움말이 "결재자는 N명까지입니다"로 바뀐다.
## States
default · hover(단추 · Select · 칸은 각 부품 규칙) · focus(각 부품 링) · disabled(Select · 단추 · 찾기 · 참조 칸 전부 잠금) · error(error 글자: 목록 테두리 `status.danger.default` + 추가 칸 Field 오류). active · loading은 해당 없음.
## 동작
결재자 추가는 이름 · 사번 · 부서로 찾고(CodeSearch, 사번은 code), 고른 사람은 마지막 승인 칸 앞에 검토로 들어간다(contracts `insertApprover`, 마지막이 승인이 아니면 끝에). 이미 결재선 · 참조에 있는 사람과 기안자는 후보에서 빠진다. 역할은 줄마다 Select로 바꾼다. 위로 · 아래로 단추 또는 줄 안 단추에서 Alt + ↑ · ↓로 순서를 바꾸고(`moveApprover`), 초점은 옮긴 줄의 같은 단추에 남는다(끝에 닿아 잠기면 반대 단추). 빼기를 누르면 그 줄을 빼고 초점은 이웃 줄로 간다. 바뀐 순서 · 넣기 · 빼기는 알림 줄이 읽는다("정민호 2번째로 옮겼습니다"). 마지막 결재자의 역할이 승인이 아니면 목록 아래에 안내 글자가 보인다(막지는 않는다). 참조자는 TagInput person(참조자 칩, 결재선에 있는 사람은 추천에서 빠진다). value · cc를 주면 컨트롤드, defaultValue · defaultCc는 언컨트롤드다.

| 키 | 동작 |
| --- | --- |
| Tab | 줄 안 역할 · 단추, 추가 칸, 참조 칸 순서 |
| Alt + ↑ · ↓ | 위로 · 아래로 · 빼기 단추에서 그 줄을 한 칸 옮긴다 |
| Enter · Space | 단추 누르기 |

## 접근성
목록은 `ol` + 이름 "결재선", 순서 숫자는 꾸밈(목록 순서가 말한다), 설명에 숨은 안내 "Alt와 위 · 아래 화살표로 순서를 바꿉니다". 역할 Select 이름은 "<이름> 역할", 단추 이름은 "<이름> 위로 · 아래로 · 빼기". 알림 줄은 `aria-live="polite"`. 안내 글자는 `role="status"`. 오류는 Field 오류 칸이 읽는다. 대비: 이름 `fg.primary`, 부서 · 안내 `fg.secondary`.
## 밀도
줄 최소 높이 `density.row-height` + `space.16`(compact 52 · comfortable 56), 역할 칸 `space.64` × 1.5, 단추 칸 × 1.75. 폭이 560보다 좁으면 사람 아래 줄에 역할 · 단추가 온다.
## 플랫폼 차이
네이티브는 줄을 길게 눌러 끌어 옮기고(접근성 동작 "위로 · 아래로"), 결재자 찾기는 아래 시트다. props는 같다.
## 금지 사항
결재선 편집 목록 · 참조 칩을 블록이 CSS로 직접(R-T25) → ApprovalLineEditor · 결재 어휘 바꾸기(상신 · 라인 · 승인자, content.md §6) · 순서를 끌기로만 바꾸기(키보드 · 단추 필수) → 리뷰.
## 스토리
Expense · Empty.
## 참고
R-T25(결재선 편집 · 참조자 칩), SY-15 · PG-43, ApprovalLine(보이기) · TagInput person · CodeSearch · PersonLabel, components.md §10 ApprovalFlow. 블록: `groupware/approval/draft`.
