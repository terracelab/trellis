# Checklist
## 용도
차례로 끝내는 일(월 결산 마감 · 신입 온보딩 · 도입 준비)을 항목 목록과 진행 요약으로 보여 줄 때 쓴다. 항목마다 상태 · 기한 · 담당 · 보조 글자 · 행동 단추 하나가 붙는다. 저장 전 검증 결과는 IssueList, 실행 단계(에이전트 · 배치)는 RunSteps, 결재 단계는 ApprovalLine, 한 화면 안의 순서 있는 입력 단계는 Stepper.
## 해부(Anatomy)
root(`div` role=group, `tl-checklist`) · summary(Progress sm "완료 n / 전체건" + 남은 상태 수 `type.caption` `fg.secondary`) · list(`ul`, 위 1px `border.divider`) · item(`li`, 최소 높이 `density.row-height`, 위아래 `space.8`, 아래 1px `border.divider`) · mark(앞 표시 칸 `density.control-height-xs` 정사각, onChange가 있으면 체크 단추, 아이콘 16) · title(500, 끝난 항목 `fg.secondary`) · description(`type.caption` `fg.secondary`) · meta(상태 글자 `fg.primary` 500 · 담당 · 기한 · 보조 글자, `type.caption` `fg.secondary`, 사이 가운뎃점 `fg.tertiary`) · action(Button sm, 끝난 항목은 ghost).
## Props
contract 표.
## Variants
variant 없음. 상태 4개(`CHECKLIST_STATES`)는 앞 표시의 모양 · 색과 글자로 나뉜다.

| 상태 | 표시 | 색 | 글자 |
|---|---|---|---|
| done | circle-check | `status.success.default` | 완료 |
| doing | circle-dot | `status.info.default` | 진행 |
| pending | 빈 고리(아이콘 원과 같은 지름 · 굵기) | `border.strong` | 대기 |
| blocked | circle-pause | `status.warning.default` | 보류 |

onChange 유무로 체크 단추(누를 수 있다) · 보기 전용이 나뉜다. 줄 바탕을 칠하지 않고 왼쪽 색 띠 · 회색 수 알약이 없다(D-56 · D-57).
## States
default · hover(체크 단추 바탕 `bg.sunken`, `duration.fast`) · focus(체크 단추 포커스 링 `border.focus` 2px) · disabled(항목 `disabled` · 보류 항목: 체크 단추를 누를 수 없고 disabled 항목 제목은 `fg.secondary`, 행동 단추는 그대로) · loading(`loading`: Skeleton list 4줄, `aria-busy`). active · error는 해당 없음(불러오기 실패는 부르는 쪽이 EmptyState).
## 동작
onChange가 있으면 앞 표시가 체크 단추다. 누르거나 Space를 치면 `onChange(id, !done)`를 부른다. 완료 ↔ 대기를 바꾸는 것은 부르는 쪽이다(진행 상태로 되돌릴지도 부르는 쪽이 정한다). 보류 항목은 앞선 일이 끝나야 하므로 누를 수 없다. onChange가 없으면 상태는 보기만 한다(다른 화면에서 일을 끝내면 상태가 바뀌는 목록).

기한: 끝나지 않은 항목은 "11월 25일 · D-19", 오늘이면 "D-day", 지났으면 "11월 4일 · 2일 경과"(본문 색 600 + 앞 경고 아이콘 `status.danger.default`). 끝난 항목은 날짜만. 기준일은 `today`(없으면 오늘)다.

진행 요약: 완료 수 / 전체 수를 Progress(sm)로 보이고, 다 끝나면 막대가 success 톤이 된다. 아래 줄에 남은 상태 수를 "진행 1 · 보류 1 · 대기 2"처럼 센다. 받은 순서를 그대로 쓴다(일의 차례가 순서다). 정렬하지 않는다.

| 키 | 동작 |
|---|---|
| Tab | 체크 단추 · 행동 단추를 차례로 |
| Space | 체크 단추: 완료 ↔ 대기 |
| Enter | 행동 단추를 누른다 |
## 접근성
root는 `role="group"` + `aria-label`(label). 체크 단추는 `role="checkbox"` + `aria-checked`, 이름은 "{제목} 완료 표시"다. 상태는 아이콘 모양과 보이는 글자(완료 · 진행 · 대기 · 보류)로도 전하므로 색에 기대지 않는다. 앞 표시 아이콘은 꾸밈이다. 지난 기한의 글자는 본문 색이라 4.5:1 이상이고 색은 경고 아이콘만 쓴다. 요약 막대는 Progress의 `progressbar`(값 글자 "2 / 6건"). 손가락 입력에서는 앞 표시 칸이 44가 된다.
## 밀도
줄 최소 높이 `density.row-height`(compact 36 · comfortable 40 · touch 48), 앞 표시 칸 `density.control-height-xs`(26 · 26 · 44), 본문 `density.body-font-size`.
## 플랫폼 차이
네이티브는 Pressable 체크 표시(`accessibilityRole="checkbox"` · `accessibilityState={{ checked, disabled }}`) + 같은 아이콘, 행동 단추는 Button. props는 같다.
## 금지 사항
줄 바탕을 상태색으로 칠하기 · 왼쪽 굵은 색 띠(D-57) · 상태를 회색 알약 배지로 줄마다 · 남은 수를 회색 알약으로 · 상태를 색만으로(모양 · 글자 없이) · 끝난 항목에 취소선 · 항목을 상태순으로 다시 정렬(일의 차례가 사라진다) · 한 항목에 행동 단추 둘 이상 → 리뷰. 블록이 `ul` + Badge로 점검 목록을 직접 짜기 → Checklist(SY-9).
## 스토리
Closing · Onboarding · Loading.
## 참고
SY-9 · PG-37(시산표 블록의 결산 준비 목록을 이것으로 바꾼다). 진행 막대는 Progress, 기한 날 수는 `dueDays`(contracts `_shared/format.ts`), 상태 어휘 `CHECKLIST_STATES` · 요약 `checklistProgress`(contract). IssueList(같은 줄 모양의 검증 목록). 블록: `erp/accounting/trial-balance`. 벤치마크는 구조만.
