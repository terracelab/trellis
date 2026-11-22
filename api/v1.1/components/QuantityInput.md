# QuantityInput

> `@terracelab/trellis-react` · CSS `.tl-quantity-input` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { QuantityInput } from '@terracelab/trellis-react';
```

## 용도

수량을 단위와 함께 입력한다(발주 수량 · 입고 수량 · 재고 조정). 금액은 AmountInput.

## 해부(Anatomy)

root(Input과 같은 테두리 · 높이 · 반경) · decrement · increment(IconButton minus · plus) · control(오른쪽 정렬, `font.numeric`) · unit(`fg.tertiary`, units가 있으면 단위 고르기) · base(환산할 때 칸 아래 오른쪽 기준 수량 "= 240EA", `type.caption` `fg.secondary` tabular).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` |  |  | Field 밖 접근성 이름 |
| `value` | `number \| null` |  |  | 수량(제어) |
| `defaultValue` | `number \| null` |  |  | 처음 수량(비제어) |
| `onChange` | `(value: number \| null) => void` |  |  | 수량이 바뀔 때 |
| `unit` | `string` | `"EA"` |  | 단위(units가 있으면 고른 단위) |
| `units` | `(string \| { unit: string; factor?: number })[]` |  |  | 고를 수 있는 단위(factor = 기준 단위 몇 개, 있으면 기준 수량을 보인다) |
| `onUnitChange` | `(unit: string) => void` |  |  | 단위가 바뀔 때 |
| `step` | `number` | `1` |  | 증감 단위 |
| `min` | `number` | `0` |  | 최소 |
| `max` | `number` |  |  | 최대 |
| `digits` | `number` | `0` |  | 소수 자릿수 |
| `showStepper` | `boolean` | `true` |  | − / + 버튼 |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `invalid` | `boolean` | `false` |  | 오류(Field error면 자동) |
| `required` | `boolean` | `false` |  | 필수 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `"md"` |  | 높이 |
| `name` | `string` |  |  | 폼 이름 |

## Variants

size 5(xs · sm · md · lg · xl), showStepper 유무, 단위 고정 · 단위 고르기(units) · 환산(units[].factor), digits 0(EA · BOX) · 1~3(kg · L).

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `error`

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

## 예시

### 발주 수량

− / + 와 화살표 키로 step만큼, 단위는 현장 표기 그대로

```tsx
import { Field, QuantityInput } from '@terracelab/trellis-react';

function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="발주 수량" required help="누리식품 최소 발주 10BOX">
        <QuantityInput defaultValue={24} unit="BOX" min={10} step={2} />
      </Field>
      <Field label="입고 수량">
        <QuantityInput defaultValue={1240} units={['EA', 'BOX', 'PLT']} />
      </Field>
      <Field label="원두 중량">
        <QuantityInput defaultValue={12.5} unit="kg" digits={1} step={0.5} showStepper={false} />
      </Field>
      <Field label="재고 조정" error="가용재고 320EA를 넘을 수 없습니다">
        <QuantityInput defaultValue={400} max={320} />
      </Field>
    </div>
  );
}
```

### 단위 환산

units에 factor를 주면 기준 단위가 아닌 단위를 고를 때 칸 아래에 기준 수량이 보인다

```tsx
import { useState } from 'react';
import { Field, QuantityInput } from '@terracelab/trellis-react';

function Conversion() {
  const [unit, setUnit] = useState('BOX');
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 4)',
      }}
    >
      <Field label="실사 수량" help="보냉팩 젤 타입 1BOX = 40EA">
        <QuantityInput
          defaultValue={18}
          unit={unit}
          onUnitChange={setUnit}
          units={[
            { unit: 'EA', factor: 1 },
            { unit: 'BOX', factor: 40 },
            { unit: 'PLT', factor: 1_600 },
          ]}
        />
      </Field>
      <Field label="피킹 수량" help="냉동 가리비 관자 1BOX = 10KG">
        <QuantityInput
          defaultValue={2.5}
          digits={1}
          step={0.5}
          units={[
            { unit: 'BOX', factor: 10 },
            { unit: 'KG', factor: 1 },
          ]}
        />
      </Field>
    </div>
  );
}
```
