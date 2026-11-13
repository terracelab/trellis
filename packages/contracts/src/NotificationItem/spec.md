# NotificationItem
## 용도
알림 목록의 한 줄(상단 알림 서랍 · 알림 화면)을 그릴 때 쓴다. 홈 화면의 모듈 타일(숫자 하나)은 NotificationCard, 목록 전체(날짜 묶음 · 모두 읽음)는 NotificationList다.
## 해부(Anatomy)
root(flex, `radius.md`, 안쪽 `space.12`) · mark(점 자리 `space.8`, 늘 있다. 읽지 않으면 `brand.default` 점 6) · icon(ModuleIcon 32, 선택) · head(title · badge · time) · title(`density.body` 500 `fg.primary`, 읽지 않으면 600 `fg.strong`) · badge(Badge sm, tone이 danger · warning일 때만) · time(`type.caption` `fg.tertiary` tabular, 줄 오른쪽 끝, `<time datetime>`) · body(`type.label` `fg.secondary`, 두 줄까지 말줄임).
## Props
contract 표.
## Variants
읽음 · 읽지 않음 × 모듈 아이콘 유무 × tone(neutral · warning · danger). href = 링크, onPress = 단추, 둘 다 없으면 글자.
## States
default · hover(`bg.sunken`) · focus(링 `border.focus` 2px, 안쪽). active · disabled · loading · error는 해당 없음(알림 한 줄은 끌 수 없고, 불러오기 · 오류는 NotificationList · 서랍이 맡는다).
## 동작
시각은 ISO로 받아 상대 시각으로 보인다(`formatRelativeTime`, content.md §4: 방금 · N분 전 · N시간 전 · N일 전, 7일 넘으면 날짜). 가리키면 전체 시각(2026-11-09 14:04)이 툴팁(title)으로 보인다. 시각 글자를 ISO로 그대로 찍지 않는다. 누르면 onPress(읽음 처리 + 이동은 부르는 쪽이 한다). href가 있으면 라우터(TrellisProvider navigate)로 연다.
## 접근성
읽지 않음은 점(꾸밈) + 제목 앞 숨은 글자 "읽지 않음"으로 읽는다(색 · 점만으로 말하지 않는다). 링크 · 단추 이름 = 읽지 않음 + 제목 + 배지 + 시각 + 본문. 배지 색과 함께 글자("확인 필요")가 있다. 휴대폰은 줄 높이가 `size.touch.min` 이상이다.
## 밀도
제목 글자는 `density.body-font-size`. 안쪽 여백은 밀도와 관계없이 `space.12`.
## 플랫폼 차이
네이티브는 누르는 줄(Pressable). 툴팁 대신 길게 누르면 전체 시각.
## 금지 사항
알림 줄에 모듈 타일 크기(40) · 숫자 배지(→ NotificationCard) · 시각 ISO 글자 · 줄마다 색 면 · 왼쪽 색 띠 · 읽지 않음을 색 글자만으로.
## 스토리
Default(VRT) · WithModule · Matrix 없음(tone은 데이터 값).
## 참고
서비스 점검 R-37 7번(알림 서랍을 앱이 손으로 짬, 시각이 ISO로 찍힘), PR-32. content.md §4 상대 시간.
