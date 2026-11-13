# AmountInput
## 용도
금액을 입력한다(공급가액 · 단가 · 지급액). 입력하는 동안 천 단위 쉼표를 넣는다. 수량은 QuantityInput.
## 해부(Anatomy)
root(Input과 같은 테두리 · 높이 · 반경) · prefix(외화 코드, `fg.tertiary`) · control(오른쪽 정렬, `font.numeric`) · suffix(원, `fg.tertiary`) · korean(`type.caption`, `fg.tertiary`, 칸 아래 한글 금액).
## Props
contract 표.
## Variants
currency KRW(뒤 원, 소수 없음) · USD · EUR · CNY(앞 코드, 소수 2자리) · JPY(앞 코드, 소수 없음). showKorean(KRW만). size 5(xs · sm · md · lg · xl).
## States
default · hover(`border.strong`) · focus(`border.focus` + 링) · disabled(`bg.sunken`) · error(`status.danger.default` 테두리, min · max를 벗어나도 오류). active · loading은 해당 없음.
## 동작
숫자 · 소수점 · 음수 기호(allowNegative일 때)만 받고 나머지는 버린다. 쉼표를 넣어도 커서는 입력하던 자리에 남는다. 한글 입력기 조합 중에는 고치지 않고 조합이 끝나면 정리한다. 붙여 넣은 "1,234,000원"은 1234000이 된다. 칸을 떠나면 소수 자릿수를 채운다(USD 12.5 → 12.50). min · max를 벗어난 값은 바꾸지 않고 오류로 표시한다. 비우면 null.
## 접근성
`<input inputmode="numeric|decimal">`. Field 안에서는 라벨 · 설명 · 오류가 자동 연결되고, 한글 금액도 `aria-describedby`로 읽는다. 음수는 U+2212(−)로 보인다. 대비는 Input과 같다.
## 밀도
높이 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). 입력 글자는 xs~md `density.input-font-size`, lg · xl은 그것과 `type.body` 중 큰 값이다(touch 16은 그대로).
## 플랫폼 차이
네이티브는 TextInput keyboardType numeric · decimal-pad, 같은 서식 함수를 쓴다.
## 금지 사항
금액을 왼쪽 정렬 · 쉼표를 문자열로 직접 찍기(`formatAmount`) · 외화에 원 붙이기 · 음수를 괄호로 → 리뷰.
## 스토리
Default · Currency · Korean · Negative · Error · Disabled.
## 참고
content.md §4 금액 · 음수, components.md §8 숫자 · 금액.
