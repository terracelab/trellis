# Toast
## 용도
방금 한 동작의 결과를 잠깐 알린다(저장했습니다 · 반려했습니다). 사용자가 반드시 읽고 결정해야 하면 Dialog, 화면에 계속 남아야 하면 Banner.
## 해부(Anatomy)
viewport(우하단 고정, `z.toast`) · root(`tl-toast`, `bg.elevated`, `border.default`, `shadow.lg`, `radius.md`, 왼쪽 강조 띠 없음 D-57) · icon(톤 색, neutral은 없음) · title(`type.label` 600 `fg.primary`) · count(제목 뒤 "×N", `fg.secondary` 400 tabular) · description(`type.caption` `fg.secondary`) · action(링크 색 글자 버튼) · close(x 아이콘).
## Props
contract 표.
## Variants
tone 5(neutral · info · success · warning · danger). 글자는 모두 중립이고 톤은 앞 아이콘 색으로 보인다(neutral은 아이콘 없음).
## States
default. 나타남 · 사라짐 · 쌓임은 동작이다. 나머지 상태는 해당 없음.
## 동작
앱 루트를 `ToastProvider`로 감싸고 `useToast().show(options)`로 띄운다. `show`는 id를 돌려주고 `close(id)`로 닫는다. 같은 id로 다시 부르면 새로 쌓지 않고 내용을 바꾼다. 마우스를 올리거나 포커스가 들어가면 닫힘 시간이 멈춘다.

닫힘 시간은 `duration`을 주면 그 값이다. 주지 않으면 tone이 danger일 때 0(직접 닫을 때까지), action이 있으면 10초, 나머지는 4초다. 오류는 읽고 고칠 시간이 필요하고 되돌리기는 누를 시간이 필요해서다. 그 위에 앱 설정 표시 시간(WCAG 2.2.1)이 얹힌다. 기본은 위 규칙 그대로, 길게는 0이 아닌 시간을 두 배로, 직접 닫기는 모든 토스트를 직접 닫을 때까지 둔다. 설정은 `ToastProvider`가 TrellisProvider에서 읽고 바꾼 뒤 뜨는 토스트부터 적용한다.

같은 제목 · 같은 tone의 토스트가 떠 있는 동안 같은 토스트가 다시 오면 새로 쌓지 않는다. 떠 있는 토스트의 제목 뒤에 "×N"을 붙여 세고 닫힘 시간을 다시 잰다. 설명 · action은 마지막 호출의 것으로 바뀌고 `show`는 떠 있는 토스트의 id를 돌려준다. 쌓임 한도 밖에 숨은 같은 토스트는 닫고 맨 앞에 새로 띄우며 센 수를 잇는다. id를 준 호출은 내용 바꾸기라 세지 않는다. 최대 3개가 쌓이고 마우스를 올리면 펼쳐진다. 아래 · 오른쪽으로 밀어 닫는다. action을 누르면 onPress 뒤 토스트도 닫힌다. `<Toast>` 컴포넌트는 같은 모양의 정적 표현(문서 · 시각 회귀 · 화면 안 고정 안내)이다. 화면 아래를 차지한 것(열린 아래 서랍 · 휴대폰에서 화면을 다 쓰는 서랍의 footer, 시트 footer, 휴대폰 아래 탭바, sticky ActionBar)이 있으면 그 윗변부터 화면 바닥까지의 높이를 `--tl-toast-offset-bottom`으로 모아(가장 큰 값) 토스트를 그 위로 올린다. 손가락이 있는 다음 동작 단추를 몇 초씩 가리지 않게 하기 위해서다. 화면 아래 절반에 걸친 요소만 세고(스크롤해서 위로 올라간 동작 줄은 빼고), 스크롤 · 크기 바뀜마다 다시 잰다. 넓은 화면의 오른쪽 서랍 footer도 센다(토스트가 같은 오른쪽 아래에 떠서 서랍을 연 채 누르는 단추를 가렸다). 층 순서(`z.toast` 500, D-63)는 그대로이고 위치만 바뀐다.

| 키 | 동작 |
| --- | --- |
| F6 | 알림 영역으로 이동 |
| Tab | action · 닫기 버튼 |
| Enter | 버튼 실행 |
| Escape | 포커스가 안에 있으면 닫는다 |
## 접근성
알림 영역은 landmark이고 일반 토스트는 정중하게(polite), danger는 `priority: 'high'`로 바로 읽힌다. 읽히는 것은 title · description 글자뿐이다. 보이는 "×N"은 화면 낭독기에 숨기고, 수가 늘 때마다 숨은 상태 영역이 "같은 알림 N번째. 제목"을 정중하게(polite) 한 번 읽는다. 닫기 버튼 이름은 "닫기". 4.5:1 대비는 중립 글자로 지킨다. reduced-motion이면 미끄러짐 없이 나타나고 사라진다.
## 밀도
밀도와 관계없이 폭 352(`space.64` × 5.5), 안쪽 여백 `space.12`.
## 플랫폼 차이
네이티브는 자체 오버레이(하단 중앙, 같은 options). 밀어서 닫기는 아래 방향만.
## 금지 사항
문장 두 개 이상 · 버튼 두 개 이상 · 오류 원인을 토스트로만 알림(폼 오류는 Field) · 느낌표 · 사과 문구 — 리뷰(content.md §5).
## 스토리
ShowToast · Tones · AboveBottomActions. 쌓임 · ×N · 표시 시간은 `packages/react/test/toast-duration.test.tsx`가 확인한다.
## 참고
Base UI Toast, content.md §5 토스트 문구.
