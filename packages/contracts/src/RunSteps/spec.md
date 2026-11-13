# RunSteps
## 용도
에이전트가 답을 만들며 실행한 단계(조회 · 계산 · 도구 실행)를 상태 · 걸린 시간과 함께 차례로 보여 줄 때 쓴다. 답변 위에서는 요약 한 줄로 접어 둔다(`collapsible`). 사람이 처리한 이력은 Timeline, 배치 작업 목록은 DataGrid + StatusDot(JOB_STATES), 결재 단계는 ApprovalLine.
## 해부(Anatomy)
root(`tl-run-steps`, `data-run-state` = 전체 상태) · summary(collapsible: 1px `border.divider` 줄 단추 = 상태 점 + "실행 단계 4개" + 전체 상태 글자 + 합계 시간 + 펼침 아이콘) · list(`ol`) · step(`li`, `data-run-state`) · row(상세가 있으면 펼침 단추, 높이 `density.control-height-sm`, `radius.md`) · dot(StatusDot, AGENT_RUN_STATES 색조, 실행 중만 맥박) · name(500) · description(`type.caption` `fg.secondary`) · state(상태 글자 `type.caption` `fg.secondary`, 실패 · 확인 대기는 `fg.primary` 600) · duration(tabular, 오른쪽 정렬) · chevron(`fg.tertiary`) · detail(펼친 상세, `bg.sunken` · `radius.md` · `type.caption`, 점 아래 칸부터 들여쓰기).
## Props
contract 표.
## Variants
변형 prop이 없다. 단계마다 실행 상태 6개(D-116)가 점 색조와 글자를 정한다.

| state | 글자 | 점 색조 | 그 밖 |
|---|---|---|---|
| queued | 대기 | neutral(`fg.tertiary`) | 이름 `fg.secondary` 400 |
| running | 실행 중 | info | 점 맥박(reduced-motion이면 멈춤) |
| waiting | 확인 대기 | warning | 상태 글자 `fg.primary` 600, 처음부터 펼침 |
| succeeded | 완료 | success | |
| failed | 실패 | danger | 상태 글자 `fg.primary` 600, 처음부터 펼침 |
| canceled | 중단 | neutral | 이름 `fg.secondary` 400 |
## States
default · hover(펼침 단추 줄 · 요약 줄 `bg.sunken`) · focus(포커스 링, 줄 안쪽). 실행 상태는 컴포넌트 상태 7어휘와 다른 축이다(쓰는 중 = loading은 RichText, 실패 표시 = error는 쓰지 않는다). active · disabled · loading · error는 해당 없음.
## 동작
- 순서: 위에서 아래로 실행 순서. 앱이 `steps`를 바꾸면(상태 · 걸린 시간) 그대로 다시 그린다.
- 걸린 시간: `durationMs`를 10초 안은 1.2초, 1분 안은 12초, 그 뒤는 2분 5초로 쓴다(`formatRunDuration`). 실행 중이면 앱이 지금까지 걸린 시간을 넘긴다.
- 펼침: `detail`이 있는 단계만 줄이 펼침 단추다. 처음에는 `defaultExpanded`, 없으면 실패 · 확인 대기 단계가 펼쳐 있다.
- 요약(`collapsible`): 전체 상태는 contracts `runStepsState`(실패 → 중단 → 확인 대기 → 실행 중 → 대기 → 완료, 끝난 단계와 대기 단계가 섞이면 실행 중). 합계 시간은 단계 시간의 합. 처음에는 `defaultOpen`, 없으면 실행 중 · 확인 대기 · 실패가 있을 때만 펼쳐 있다.

| 키 | 동작 |
| --- | --- |
| Tab | 요약 줄 → 펼침 단추 줄 차례로 |
| Enter · Space | 단계 상세 · 요약 펼치기 · 접기 |
## 접근성
목록은 `ol` + 이름(label, 기본 "실행 단계")이다. 상태는 점 색만이 아니라 글자(완료 · 실패 …)로 읽힌다. 펼침 단추는 `aria-expanded` + `aria-controls`(상세 · 목록)다. 점은 꾸밈(aria-hidden), 맥박은 reduced-motion에서 멈춘다. 글자 대비 `fg.secondary` · `fg.primary` 4.5:1 이상, 포커스 링은 항상 보인다.
## 밀도
줄 높이 `density.control-height-sm`(touch 44), 글자 `density.body-font-size`. 상세 들여쓰기 · 안쪽 여백은 밀도와 관계없다.
## 플랫폼 차이
네이티브는 같은 줄을 Pressable로 그리고 상세는 줄 아래에 펼친다. props는 같다.
## 금지 사항
상태를 색만으로 · 줄 왼쪽 상태 띠(D-57) · 단계마다 아이콘 꾸밈 · 실행 상태 이름을 새로 만들기(AGENT_RUN_STATES 6개 고정, D-116) · 퍼센트 진행 막대로 단계 대신하기. 리뷰로 막는다.
## 스토리
AllStates · Collapsed · Details.
## 참고
D-116 AGENT_RUN_STATES, patterns/ConversationalWork, MessageThread(answer `steps`), ProposalCard(확인 대기), StatusDot.
