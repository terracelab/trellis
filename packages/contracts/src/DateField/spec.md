# DateField
## 용도
날짜 하나를 입력한다(전표일 · 납기일 · 입고일). 시작과 끝이 있으면 PeriodPicker.
## 해부(Anatomy)
root(Input과 같은 테두리 · 높이 · 반경) · control(글자 칸, 'YYYY-MM-DD', `font.numeric`) · picker(calendar 아이콘 버튼, `fg.tertiary`) · popup(`bg.elevated`, `shadow.md`, `radius.md`, `z.dropdown`) · calendar(월 이름 · 이전 · 다음 · 요일 · 날 칸 `density.control-height-lg` 정사각, 고른 날 `brand.default` 채움, 오늘 `border.strong` 1px 링, 다른 달 · 고를 수 없는 날 흐리게) · note(Field 밖에서 범위 밖 안내, Field 오류 칸과 같은 모양). 좁은 화면: sheet(제목 = 라벨) 안 calendar, 날 칸 `space.40`.
## Props
contract 표.
## Variants
size 5(xs · sm · md · lg · xl).
## States
default · hover(`border.strong`) · focus(`border.focus` + 링) · disabled(`bg.sunken`) · error(`status.danger.default` 테두리, Field error · invalid · 범위 밖 입력). active · loading은 해당 없음.
## 동작
숫자를 치면 하이픈이 들어가 'YYYY-MM-DD'가 된다(20261105 → 2026-11-05). 다 친 날이 있는 날이고 min · max 안이면 onChange를 부르고, 지우면 null. 덜 친 채로 칸을 떠나면 마지막 값으로 돌아간다.

범위 밖 입력: min · max 밖의 날을 다 치면 값은 그대로 두고(onChange를 부르지 않는다) 칸을 오류 상태로 바꾸고 안내를 보인다. 기본 문구는 "{min} 이후 날짜를 넣으세요" · "{max}까지 넣을 수 있습니다"(날짜는 `formatDate`, locale 사전), `outOfRangeText(bound, date)`가 있으면 그 글자다(bound = 넘은 쪽, date = 그 경계 날짜). 안내는 Field 오류 칸에 올라가고(Field 밖이면 칸 바로 아래에 같은 모양으로), Field error가 있으면 그것이 보인다. 친 글자는 조용히 되돌리지 않는다. 칸을 떠나도 글자와 안내가 남는다. 안내는 범위 안 날짜를 쳐서 값이 바뀌거나, 칸을 비우거나, 달력에서 날을 고르거나, 밖에서 value가 바뀔 때 걷힌다. 고치는 도중(덜 친 글자)에는 남고, 덜 친 채로 떠나면 마지막 값으로 돌아가며 걷힌다. 달력은 범위 밖 날을 계속 막는다.

앱에 알리기: 범위 밖 글자는 값이 아니라서 value만 보는 앱은 이전 값을 저장한다(서비스 요청 R-35). 그래서 세 가지로 따로 알린다. ① `onOutOfRangeChange`는 범위 밖 상태가 생기거나 바뀔 때(다른 날짜 · 다른 쪽) `{ bound, date, typed, text }`를, 걷힐 때 null을 받는다. bound = 넘은 쪽, date = 그 경계 날짜, typed = 친 날짜, text = 보이는 안내다. 칸이 사라질 때 상태가 남아 있으면 null을 한 번 더 받는다. ② 글자 칸에 같은 안내로 `setCustomValidity`를 건다. `form.checkValidity()` · `reportValidity()`가 실패하고 `noValidate`가 없는 폼은 브라우저가 제출을 막는다. 걷히면 빈 글자로 되돌린다. ③ `useTrellisForm`이면 `form.bind` 대신 `form.bindDate(name)`을 넘긴다. 범위 밖 상태가 남아 있는 동안 `form.submit`이 저장하지 않고, 그 칸 오류(type 'range')와 요약에 안내가 선다. 같은 칸의 스키마 오류보다 이 안내가 이긴다. 제출 전에는 칸 안내만 보이고(Field 오류 칸, `role="alert"`), 한 번 제출한 뒤에는 다른 칸처럼 바로 폼 오류에 들어간다.

PeriodPicker는 max만 있고 같은 "{max}까지 넣을 수 있습니다" 안내를 쓴다(min은 없다). calendar 버튼이나 Alt+↓로 달력을 열고, 날을 누르면 그 날짜로 닫힌다. 달력 월 · 요일 이름은 TrellisProvider locale을 따르고(기본 한국어, 일요일 시작), 화살표로 날, PageUp · PageDown으로 달을 옮긴다. 표시는 기기 언어와 관계없이 늘 ISO다. 폭이 `breakpoint.sm`보다 좁으면 달력을 화면 아래 시트로 연다. today를 주면 그날을 오늘로 표시한다(데모 · 테스트). value를 주면 제어, defaultValue면 비제어.
## 접근성
글자 칸은 `inputmode="numeric"`(휴대폰 숫자 자판)이고 placeholder가 형식을 알려 준다. Field 안에서는 라벨 · 설명 · 오류가 자동 연결된다. 범위 밖 안내는 `aria-describedby`로 칸에 잇고, 치는 도중에 생기므로 `role="alert"`로 바로 읽힌다. calendar 버튼은 Tab으로 갈 수 있고 이름은 "달력 열기". 달력은 `role="grid"`, 날 버튼 이름은 보이는 숫자 + 숨은 글자("12일 목요일, 오늘, 선택됨")이고 연 · 월은 격자 이름("2026년 11월")이 알려 준다(보이는 숫자로 음성 입력이 된다, WCAG 2.5.3), 열리면 고른 날(없으면 오늘)에 포커스, 닫히면 버튼으로 돌아간다.
## 밀도
높이 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). 입력 글자는 xs~md `density.input-font-size`, lg · xl은 그것과 `type.body` 중 큰 값이다(touch 16은 그대로).
## 플랫폼 차이
네이티브는 같은 칸 모양의 Pressable + 플랫폼 날짜 선택기.
## 금지 사항
날짜를 Input에 글자로 받기 · 'YYYY.MM.DD' 같은 다른 표기 저장(ISO만) · 브라우저 날짜 입력(`type="date"`)으로 바꾸기(기기마다 표기가 다르다) → 리뷰.
## 스토리
Default · MinMax · OutOfRange(범위 밖 안내) · RangeSignal(앱에 알리기) · NativeForm(기본 제출 막기) · Error · Disabled · Narrow(시트).
## 참고
content.md §4 날짜(표 · 입력은 ISO). D-74(범위 밖 입력은 값 그대로 + 안내) · 서비스 요청 R-35(앱에 알리기).
