# QuantityInput
## 용도
수량을 단위와 함께 입력한다(발주 수량 · 입고 수량 · 재고 조정). 금액은 AmountInput.
## 해부(Anatomy)
root(Input과 같은 테두리 · 높이 · 반경) · decrement · increment(IconButton minus · plus) · control(오른쪽 정렬, `font.numeric`) · unit(`fg.tertiary`, units가 있으면 단위 고르기) · base(환산할 때 칸 아래 오른쪽 기준 수량 "= 240EA", `type.caption` `fg.secondary` tabular).
## Props
contract 표.
## Variants
size 5(xs · sm · md · lg · xl), showStepper 유무, 단위 고정 · 단위 고르기(units) · 환산(units[].factor), digits 0(EA · BOX) · 1~3(kg · L).
## States
default · hover(`border.strong`) · focus(`border.focus` + 링) · disabled(`bg.sunken`, 버튼 `fg.disabled`) · error(`status.danger.default` 테두리). min · max에 닿으면 그쪽 버튼이 비활성. active · loading은 해당 없음.
## 동작
Base UI NumberField. 숫자를 입력하거나 − / +, ArrowUp · ArrowDown으로 step만큼 바꾼다. Shift와 함께 누르면 10배. 버튼을 누르고 있으면 계속 바뀐다. 칸을 떠나면 min · max 안으로 맞추고 천 단위 쉼표와 digits 자릿수로 보인다. 비우면 null.

환산(PG-38): units에 `{ unit, factor }`를 주면 factor가 1인 단위가 기준 단위다(BOX = 24 EA면 `[{ unit: 'EA', factor: 1 }, { unit: 'BOX', factor: 24 }]`). 기준 단위가 아닌 단위를 고르면 칸 아래 오른쪽에 기준 수량을 보인다(10BOX → "= 240EA"). 단위를 바꿔도 친 숫자는 그대로이고 기준 수량만 다시 계산한다(센 단위를 고르는 것이지 수량을 옮기는 것이 아니다). value · onChange는 고른 단위의 수량이다. 단위가 섞인 수량을 더하고 빼는 쪽(실사 차이 · 피킹 부족)은 `toBaseQuantity(value, unit, units)`를 쓴다. factor가 없거나 factor 1인 단위가 없으면 지금과 같다(고르기만 한다). 단위 글자만 주는 `units={['EA', 'BOX']}`도 그대로 된다.

손가락 입력: touch 밀도 · 휴대폰 폭(`breakpoint.sm` 미만) · 굵은 포인터(`pointer: coarse`)에서는 칸 높이가 `size.touch.min`(44) 이상이 되고, − / + 가 칸 높이 정사각으로 칸 양 끝을 채운다. 단추 안쪽 면에 `border.default` 구분선을 둔다.
## 접근성
`<input>` + Field 라벨 · 설명 · 오류 자동 연결. − / + 버튼은 Tab 순서에서 빠지고(화살표 키로 같은 동작) 이름은 "수량 줄이기 · 수량 늘리기". 단위 고르기는 `aria-label="단위"`의 `<select>`. 포커스 링은 root에 보인다. − / + 로 바뀐 값은 `aria-live="polite"` 숨은 글자로 읽는다("10BOX", `formatQuantity`). 직접 친 값은 화면 낭독기가 이미 읽으므로 다시 알리지 않는다. 기준 수량 줄은 `aria-describedby`로 칸에 이어지고("기준 수량 240EA"), − / + 알림에도 붙는다("10BOX, 기준 수량 240EA").
## 밀도
높이 `density.control-height-*`(compact · comfortable 26 · 30 · 36 · 42 · 48, touch 44 · 44 · 48 · 56 · 56). − / + 는 칸 높이에서 `space.8`을 뺀 정사각(xs는 `space.6`), 손가락 입력에서는 칸 높이 정사각. 입력 글자는 Input과 같다.
## 플랫폼 차이
네이티브는 TextInput keyboardType numeric + Pressable − / +, 단위는 바텀시트.
## 금지 사항
수량에 원 단위 · 단위 없이 숫자만 · 환산 수량을 화면에서 직접 곱하기(`toBaseQuantity`) · 기준 단위가 둘(factor 1이 둘) · 소수가 없는 단위(EA)에 digits · 음수 재고를 min 없이 → 리뷰.
## 스토리
Default · Units · Decimal · Error · Disabled · Conversion.
## 참고
Base UI Number Field. content.md §4 수량(`formatQuantity`). 환산 SY-11 · PG-38(블록 `scm/inventory/count` · `scm/warehouse/picking`).
