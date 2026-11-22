# AmountInput

> `@terracelab/trellis-react` · CSS `.tl-amount-input` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { AmountInput } from '@terracelab/trellis-react';
```

## 용도

금액을 입력한다(공급가액 · 단가 · 지급액). 입력하는 동안 천 단위 쉼표를 넣는다. 수량은 QuantityInput.

## 해부(Anatomy)

root(Input과 같은 테두리 · 높이 · 반경) · prefix(외화 코드, `fg.tertiary`) · control(오른쪽 정렬, `font.numeric`) · suffix(원, `fg.tertiary`) · korean(`type.caption`, `fg.tertiary`, 칸 아래 한글 금액).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` |  |  | Field 밖 접근성 이름 |
| `value` | `number \| null` |  |  | 금액(제어) |
| `defaultValue` | `number \| null` |  |  | 처음 금액(비제어) |
| `onChange` | `(value: number \| null) => void` |  |  | 금액이 바뀔 때 |
| `currency` | `'KRW' \| 'USD' \| 'EUR' \| 'JPY' \| 'CNY'` | `"KRW"` |  | 통화 |
| `allowNegative` | `boolean` | `false` |  | 음수 허용 |
| `showKorean` | `boolean` | `false` |  | 한글 금액 표시(KRW) |
| `min` | `number` |  |  | 최소(벗어나면 오류 표시) |
| `max` | `number` |  |  | 최대(벗어나면 오류 표시) |
| `placeholder` | `string` |  |  | 예시 값 |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `invalid` | `boolean` | `false` |  | 오류(Field error면 자동) |
| `required` | `boolean` | `false` |  | 필수 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `"md"` |  | 높이 |
| `name` | `string` |  |  | 폼 이름(숫자 그대로 제출) |

## Variants

currency KRW(뒤 원, 소수 없음) · USD · EUR · CNY(앞 코드, 소수 2자리) · JPY(앞 코드, 소수 없음). showKorean(KRW만). size 5(xs · sm · md · lg · xl).

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `error`

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

## 예시

### 공급가액

입력하는 동안 천 단위 쉼표, 아래에 한글 금액

```tsx
import { Field, AmountInput } from '@terracelab/trellis-react';

function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Field label="공급가액" required help="(주)한빛무역 11월 매입분">
        <AmountInput defaultValue={12480000} showKorean placeholder="1,000,000" />
      </Field>
      <Field label="차감 금액" help="반품 · 할인은 음수로 입력합니다">
        <AmountInput defaultValue={-320000} allowNegative />
      </Field>
    </div>
  );
}
```

### 외화 · 범위

통화 코드는 앞에, 소수 2자리(JPY는 0자리)

```tsx
import { Field, AmountInput } from '@terracelab/trellis-react';

function Currency() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 5)',
      }}
    >
      <Field label="수입 단가">
        <AmountInput currency="USD" defaultValue={1250.5} />
      </Field>
      <Field label="엔화 운임">
        <AmountInput currency="JPY" defaultValue={84000} size="sm" />
      </Field>
      <Field label="법인카드 한도 내 금액" error="한도 5,000,000원을 넘었습니다">
        <AmountInput defaultValue={5400000} max={5000000} />
      </Field>
      <Field label="대양상사 선급금" disabled>
        <AmountInput defaultValue={3000000} />
      </Field>
    </div>
  );
}
```
