# ChangeDiff
## 용도
저장하기 전이나 변경 이력에서 필드마다 "이전 → 이후"를 보여 줄 때 쓴다(단가 1,200 → 1,350 · 결재선 · 납기 변경). 줄은 contracts `diffFields(before, after, fields)`로 만든다. 시간 순서 기록은 Timeline, 저장 전 오류 목록은 IssueList.
## 해부(Anatomy)
table 모양: table(caption 숨김 · 머리 `type.caption` `fg.tertiary` · 줄 사이 `border.divider`) · target · field(`fg.secondary`) · change(before · 화살표 · after). list 모양: list(줄마다 한 줄, 글자 `font.family.mono` · `type.mono`) · 머리말(대상 · 항목 `fg.secondary`). 공통: before(취소선 `fg.tertiary`) · arrow(arrow-right 16 `fg.tertiary` + 숨은 글자 "에서") · after(`fg.primary` 600) · 빈 값("–" + 숨은 글자 "없음") · more(ghost 단추 "외 N건").
## Props
contract 표.
## Variants
layout table(확인 창 · 상세 화면) · list(변경 이력 · 좁은 칸). 어느 줄에도 target이 없으면 대상 열을 그리지 않는다.
## States
default · focus("외 N건" 단추의 포커스 링). hover · active · disabled · loading · error는 해당 없음(불러오는 중은 부모가 Skeleton을 그린다).
## 동작
값은 이미 서식이 끝난 글자로 받는다(diffFields가 숫자 천 단위 · 날짜 ISO로 만든다). 비었거나 null인 값은 "–"로 보인다. maxRows보다 많으면 앞의 maxRows줄만 보이고 "외 N건" 단추를 누르면 모두 펼친다(다시 누르면 "접기"). 줄이 없으면 empty 문구 한 줄(기본 "바뀐 내용이 없습니다").
## 접근성
table은 `caption`(기본 "변경 내용", 숨김)과 `th scope="col"`, list는 `ul`이고 이름은 caption이다. 이전 값은 `del`, 이후 값은 `ins`라 읽기 프로그램이 삭제 · 추가로 알린다. 화살표는 꾸밈이고 숨은 글자 "에서"가 대신 읽힌다("1,200 에서 1,350"). 펼침 단추는 `aria-expanded`. 이전 값 `fg.tertiary`는 취소선과 함께 보조 정보로만 쓰고 이후 값은 `fg.primary`다.
## 밀도
table 줄 높이 `density.row-height`(최소), 글자 `density.body-font-size`. list 줄은 `type.mono` 글줄 + `space.4`. 휴대폰에서는 table도 줄마다 두 줄(항목 위 · 변경 아래)로 내린다.
## 플랫폼 차이
네이티브는 list 모양만 그리고 table은 같은 줄을 두 줄 카드로 쌓는다. 취소선은 textDecorationLine.
## 금지 사항
이전 값을 빨강 · 이후 값을 초록으로 칠하기 · 바뀐 줄에 왼쪽 띠(D-57) · 바뀌지 않은 필드까지 나열 · 값 서식을 컴포넌트 밖에서 문자열 템플릿으로 → 리뷰.
## 스토리
Confirm · History · States.
## 참고
`_shared/diff.ts`(diffFields), Timeline, IssueList, content.md §4(숫자 · 날짜).
