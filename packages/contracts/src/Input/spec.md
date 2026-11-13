# Input
## 용도
한 줄 글자 입력. 금액은 AmountInput, 수량은 QuantityInput, 번호 형식은 MaskedInput, 코드 검색은 CodeSearch.
## 해부(Anatomy)
root(`bg.surface`, `border.default`, `radius.md`, 높이 `density.control-height-*`) · icon · prefix · control(mono면 `font.family.mono`, 굵기 · 자간은 `type.mono`) · suffix(`fg.tertiary`) · clear.
## Props
contract 표.
## Variants
size 5(xs · sm · md · lg · xl), icon · prefix · suffix · clearable · mono.
## States
default · hover(`border.strong`) · focus(`border.focus` + 링) · disabled(`bg.sunken`) · error(`status.danger.default` 테두리).
## 동작
clearable이면 값이 있을 때 지우기 버튼, Escape로도 지운다. `type="search"`에 clearable을 함께 주면 브라우저가 그리는 지우기 단추(Chromium · Safari)를 숨겨 지우기 단추가 하나만 보인다. Enter는 onEnter. mono면 글꼴만 고정폭으로 바뀌고 글자 크기는 입력 칸 규칙을 따른다(touch 16). 품목 코드 · 계좌번호 · 시각처럼 자리를 맞춰 보는 값에 쓴다.
## 접근성
Field 안에서는 라벨 · 설명 · 오류가 자동 연결(`aria-describedby` · `aria-invalid`).
## 밀도
높이 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). 입력 글자는 xs~md `density.input-font-size`, lg · xl은 그것과 `type.body` 중 큰 값이다(touch 16은 그대로).
## 플랫폼 차이
네이티브는 TextInput, clear는 clearButtonMode.
## 금지 사항
placeholder를 라벨 대신 · 숫자를 왼쪽 정렬 · 이름 · 메모 같은 글에 mono → 리뷰.
## 스토리
Default · Icon · Suffix · Error · Disabled · Mono.
## 참고
—
