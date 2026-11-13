# Banner
## 용도
화면이나 카드 위쪽에 계속 남아 있어야 하는 안내 · 경고를 보여 줄 때 쓴다(마감 임박 · 전송 실패 · 점검 예정). 잠깐 알리고 사라지는 결과는 Toast, 칸 하나의 오류는 Field.
## 해부(Anatomy)
root(`radius.md`, `bg.surface` 바탕, `border.default` 1px 테두리. 톤 바탕 · 왼쪽 띠는 쓰지 않는다) · icon(톤 색 16) · title(`type.label` 600 `fg.primary`) · message(`density.body-font-size` `fg.secondary`) · action(Button sm) · close(IconButton sm "닫기").
## Props
contract 표.
## Variants
tone 5(info · success · warning · danger · neutral). 아이콘은 톤이 정한다(info · circle-check · triangle-alert · circle-alert · info).
## States
default.
## 동작
onClose가 있을 때만 닫기 버튼을 보인다. 동작 단추는 배너 폭이 560 이상이면 글 오른쪽, 그보다 좁으면(휴대폰 · 좁은 카드, 컨테이너 쿼리) 글 아래 줄로 내려 글 첫머리에 맞춘다. 닫기는 늘 첫 줄 오른쪽이다(PR-38). 배너는 부모 폭을 채운다. 닫은 뒤 다시 보일지는 화면이 정한다(컨트롤드). 동작 버튼은 하나만 둔다. 문장은 무엇이 일어났고 무엇을 하면 되는지 합니다체로 쓴다.
## 접근성
`role="status"`, danger는 `role="alert"`(바로 읽힌다). 글자는 중립 색이고 상태는 아이콘 색 · 제목 글자로 보인다(상태 색 글자는 4.5:1을 못 넘는다). 닫기 버튼은 이름 "닫기"를 갖고 Tab으로 닿는다.
## 밀도
안쪽 여백 `space.8` × `density.card-padding`. 글자는 `density.body-font-size`.
## 플랫폼 차이
없음.
## 금지 사항
한 화면에 배너 둘 이상 · 성공 결과를 배너로 오래 남기기(Toast) · 사과 문구 · 느낌표 → 리뷰.
## 스토리
Tones · WithAction · Narrow(좁은 자리).
## 참고
content.md §5 오류 · 확인 문구.
