# TimeClock
## 용도
오늘 출근 · 퇴근을 기록하고 지금 근무 상태를 보여 줄 때 쓴다(홈 · 내 근태). 한 주 합계는 WorkHoursMeter, 팀 일정은 TeamSchedule.
## 해부(Anatomy)
Card(제목 · 날짜 부제 · 오른쪽 상태 StatusDot) · 지금 시각(`type.display`, tabular) · 근무지 · 근무 유형 · 소정 근무 한 줄(`fg.tertiary`) · 출근 · 퇴근 · 근무 세 칸(`border.divider` 위아래 선) · 진행 줄(`chart.track` 위 `brand.default`, 휴게 중 `status.warning`, 퇴근 뒤 `fg.tertiary`) · 주 동작 단추.
## Props
contract 표.
## Variants
status 4(before · working · break · done) × 단추(핸들러가 있는 것만).
## States
default · loading(주 동작 단추가 처리 중, `aria-busy`).
## 동작
근무 전 = 출근하기, 근무 중 = 퇴근하기(+ onBreakStart가 있으면 휴게 시작), 휴게 중 = 휴게 끝, 퇴근 = 단추 없음. 출근이 소정 시작보다 늦으면 출근 칸에 지각, 소정 끝보다 일찍 퇴근하면 조퇴를 점 + 글자로 붙인다. 근무 시간은 workedMinutes가 없으면 출근 → 퇴근(없으면 지금)에서 4시간을 넘은 만큼(휴게 분까지) 휴게로 뺀다. 소정 근무를 넘으면 진행 줄은 가득 차고 "연장 n분"을 보인다. now가 없으면 기기 시각을 30초마다 다시 읽는다.
## 접근성
제목은 Card 제목(h2). 지금 시각은 `<time>`, 진행 줄은 `role="progressbar"`(값 글자 = "소정 근무 8시간 중 5시간 30분"). 상태 · 지각은 색만이 아니라 글자로 보인다.
## 밀도
안쪽 여백 `density.card-padding`. 시각 글자 크기는 밀도와 무관하다.
## 플랫폼 차이
네이티브는 Pressable 단추, 시각 갱신은 앱이 now로 넘긴다.
## 금지 사항
출퇴근 위치 · 사진을 카드 안에 크게 보이기, 지각을 빨간 배경으로 칠하기, 단추 문구에 시각 넣기(출근 09:02) → 리뷰.
## 스토리
Working · States.
## 참고
근로기준법 제50조(소정 근로) · 제54조(휴게), D-56(왼쪽 띠 · 틴트 금지).
