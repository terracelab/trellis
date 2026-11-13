# Textarea

> `@terracelab/trellis-react` · CSS `.tl-textarea` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Textarea } from '@terracelab/trellis-react';
```

## 용도

여러 줄 글자 입력(적요 · 반려 사유 · 비고). 한 줄이면 Input.

## 해부(Anatomy)

root(Input과 같은 `bg.surface` · `border.default` · `radius.md`) · control(`density.body-font-size` · `density.body-line-height`) · count(`type.caption`, `fg.tertiary`, 오른쪽 아래).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `value` | `string` |  |  | 값(제어) |
| `defaultValue` | `string` |  |  | 처음 값(비제어) |
| `onChange` | `(value: string) => void` |  |  | 값이 바뀔 때 |
| `placeholder` | `string` |  |  | 예시 값 |
| `rows` | `number` | `3` |  | 보이는 줄 수 |
| `maxLength` | `number` |  |  | 최대 글자 수(글자 수 표시) |
| `disabled` | `boolean` | `false` |  | 비활성 |
| `readOnly` | `boolean` | `false` |  | 읽기 전용 |
| `invalid` | `boolean` | `false` |  | 오류(Field error면 자동) |
| `required` | `boolean` | `false` |  | 필수 |
| `name` | `string` |  |  | 폼 이름 |
| `resize` | `'vertical' \| 'none'` | `"vertical"` |  | 높이 조절 |

## Variants

resize vertical · none. maxLength가 있으면 글자 수 표시.

## States

지원 상태: `default` · `hover` · `focus` · `disabled` · `error`

default · hover(`border.strong`) · focus(`border.focus` + 링) · disabled(`bg.sunken`, `fg.disabled`) · error(`status.danger.default` 테두리). 읽기 전용은 disabled와 같은 바탕에 글자는 `fg.primary`. 글자 수가 한도에 닿으면 count가 `fg.secondary`. active · loading은 해당 없음.

## 동작

Enter는 줄바꿈이다(폼 제출 아님). maxLength를 넘겨 입력할 수 없다. 높이는 rows로 시작하고 resize vertical이면 사용자가 늘린다. value를 주면 제어, defaultValue면 비제어.

## 접근성

`<textarea>`. Field 안에서는 라벨 · 설명 · 오류가 자동 연결되고, 글자 수도 `aria-describedby`에 이어 읽는다. 대비는 `fg.primary` / `bg.surface` 4.5:1 이상. 포커스 링은 root에 항상 보인다.

## 밀도

글자 `density.body-font-size`, 줄 높이 `density.body-line-height`, 안쪽 여백 `space.4`(세로) · `space.8`(가로).

## 플랫폼 차이

네이티브는 multiline TextInput, resize 없음(내용에 따라 늘어남).

## 금지 사항

한 줄 값(거래처명 · 금액)을 Textarea로 · placeholder를 라벨 대신 · 글자 수 한도를 오류 문구 없이 자르기 → 리뷰.

## 예시

### 적요 · 반려 사유

글자 수 한도가 있으면 오른쪽 아래에 보인다

```tsx
import { Field, Textarea } from '@terracelab/trellis-react';

function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <Field label="적요" help="전표 목록에 함께 보입니다">
        <Textarea
          defaultValue="(주)한빛무역 10월분 원자재 매입 대금"
          maxLength={200}
          placeholder="대양상사 11월 운송료"
        />
      </Field>
      <Field label="반려 사유" required error="반려 사유를 입력하세요">
        <Textarea rows={4} maxLength={500} />
      </Field>
      <Field label="비고">
        <Textarea readOnly resize="none" defaultValue="누리식품 납품 건은 12월 결산에 반영" />
      </Field>
    </div>
  );
}
```
