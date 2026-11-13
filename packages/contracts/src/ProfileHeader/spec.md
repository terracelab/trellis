# ProfileHeader
## 용도
구성원 상세 화면 · 서랍 맨 위에서 한 사람을 소개할 때 쓴다. 큰 아바타 · 굵은 이름 · 재직 상태 · 소속 줄 · 사번 · 입사일 · 근속 · 고용 형태 요약과 오른쪽 행동(정보 수정 · 발령 · 증명서 발급)을 한 줄에 둔다. 목록 칸은 PersonLabel.
## 해부(Anatomy)
avatar(64, 휴대폰 48) · name(제목 `type.h1` 700) · alt(한자 · 영문 `fg.tertiary`) · status(Badge sm) · presence(StatusDot sm) · meta(소속 · 직책 · 직위 · 직급 `fg.secondary`) · facts(`<dl>` 라벨 회색 · 값 500, 항목 사이 세로 구분선. 좁아서 줄이 바뀌면 줄 첫 항목은 구분선 없이 왼쪽 끝에서 시작한다) · actions.
## Props
contract 표.
## Variants
status 재직 · 휴직 · 퇴사 예정 · 퇴사(Badge 톤 `EMPLOYMENT_STATUS_TONES`). facts로 항목을 더 붙인다(복직 예정일 · 계약 종료일).
## States
default.
## 동작
근속은 hireDate부터 today(기본 오늘)까지 만 년 · 개월(`serviceLength`): 3년 11개월 · 3년 · 5개월. 직급이 직위와 같으면 한 번만 보인다. 휴대폰(640 미만)은 행동이 아래 줄로 내려간다.
## 접근성
이름은 제목(headingLevel, 기본 h2. 화면 맨 위면 1). 아바타는 꾸밈. 요약은 `<dl>` 라벨 · 값 짝.
## 밀도
아바타와 본문 사이 `space.20`, 요약 줄 위 `space.12`. 밀도와 관계없이 같은 크기.
## 플랫폼 차이
네이티브는 행동을 아래 줄에 둔다.
## 금지 사항
상태마다 색 배너 · 이름 왼쪽 색 띠 · 요약 숫자를 알약으로 감싸기(D-56 · D-57) → 리뷰.
## 스토리
Member · OnLeave.
## 참고
PersonLabel, HrRecord, Badge.
