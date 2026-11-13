# IconButton
## 용도
아이콘만 있는 버튼: 글로벌 바(알림 · 설정), 표의 행 동작, 닫기.
## 해부(Anatomy)
정사각 root(`density.control-height-*`) · icon(xs · sm · md 16, lg 20, xl 24) · count(우상단, `formatCount`. 높이 · 최소 폭 = `type.caption` 글자 + `space.4`(기본 16). 글자 크기 모드에서 숫자가 커지면 배지도 커진다, R-37).
## Props
contract 표.
## Variants
variant 3 × size 5(xs · sm · md · lg · xl), count 유무.
## States
default · hover · active · focus · disabled.
## 동작
label은 `aria-label`이 되고, 가리킬 때와 키보드 포커스에 Trellis Tooltip으로 보인다. 브라우저 `title`은 쓰지 않는다(키보드로는 뜨지 않고 모양이 제각각이다). 바깥에서 Tooltip으로 감싸면 그 Tooltip 하나만 뜬다(다른 글자 · 위치가 필요할 때). count가 있으면 이름 뒤에 숫자를 붙인다("알림 6"). 보이는 숫자와 같은 낱말이어야 음성 명령으로도 누를 수 있다.
## 접근성
아이콘은 장식, 이름은 label. 툴팁 글자는 이름과 같다. pressed가 있으면 `aria-pressed`. native disabled면 툴팁이 뜨지 않는다.
## 밀도
정사각 한 변 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). xs는 반경 `radius.sm`.
## 플랫폼 차이
네이티브는 hitSlop으로 터치 영역 44 이상.
## 금지 사항
label 없이 쓰기(타입 오류) · 주 동작을 아이콘만으로.
## 스토리
Variants · Count.
## 참고
—
