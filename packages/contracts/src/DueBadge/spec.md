# DueBadge
## 용도
기한까지 남은 날(D-3 · D-day · 2일 경과)을 배지로 보여 줄 때 쓴다. 신고 마감 · 입고 예정 · 결재 처리 기한 · 유통기한 칸에 쓴다.
## 해부(Anatomy)
Badge 하나(`tl-badge tl-due-badge`) · text(`<time datetime>`, 숫자 tabular). 색은 Badge 톤을 그대로 쓴다.
## Props
contract 표.
## Variants
지남 = danger solid · 0 ~ warnDays일 남음 = warning subtle · 그보다 많이 남음 = neutral subtle · done = neutral subtle "완료". size 2. 점은 급한 단계(warning)에만 있다. neutral 단계(그 뒤 · 완료)는 Badge 규칙대로 점 없이 글자만이다(PR-38). 지남은 solid라 점이 없다.
## States
default.
## 동작
글자는 `formatDueDays(due, today)`, 일수는 `dueDays`. 날짜만 비교한다(시각 무시). today를 넘기지 않으면 렌더한 날이 기준이므로 스토리 · 테스트 · VRT는 today를 고정한다. 처리를 끝낸 항목은 done으로 기한을 지운다.
## 접근성
`<time datetime="2026-11-12">`과 `title`("기한 2026-11-12")로 실제 날짜를 함께 준다. 지남은 색만이 아니라 "경과" 글자로 구분된다.
## 밀도
Badge와 같다(md 20 · sm 16).
## 플랫폼 차이
없음.
## 금지 사항
기한 배지를 직접 Badge로 조립하기(일수 계산이 화면마다 달라진다) · 처리 끝난 항목에 경과 표시 → 리뷰.
## 스토리
Ranges · Done · FixedToday.
## 참고
content.md §4(날짜 · 상대 시간), D-48.
