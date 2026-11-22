# Field

> `@terracelab/trellis-react` · CSS `.tl-field` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { Field } from '@terracelab/trellis-react';
```

## 용도

입력 부품 하나에 라벨 · 필수 표시 · 도움말 · 오류를 붙인다. 모든 폼 칸은 Field 안에 둔다.

## 해부(Anatomy)

label(`type.label`, 필수는 `status.danger.default` 점) · control(자식) · help(`type.caption` fg.tertiary) · error(`type.caption`, 아이콘 + `fg.primary` 글자, 칸 테두리는 위험 색).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `string` |  | 필수 | 라벨 |
| `required` | `boolean` | `false` |  | 필수(점 표시) |
| `help` | `string` |  |  | 도움말 |
| `error` | `string \| null` |  |  | 오류 문구 |
| `layout` | `'vertical' \| 'horizontal'` | `"vertical"` |  | 라벨 위치 |
| `disabled` | `boolean` | `false` |  | 안의 입력 부품 비활성 |
| `span` | `1 \| 2 \| 3` | `1` |  | FormSection 칸 수 |
| `children` | `ReactNode` |  |  | 입력 부품 하나 |

## Variants

layout vertical · horizontal(라벨 열 120, compact), span 1 · 2 · 3.

## States

지원 상태: `default` · `disabled` · `error`

default · disabled · error.

## 동작

id · 설명 id · 오류 · 필수 · 비활성을 자식 입력 부품에 내려 준다(useFieldControl). 오류가 있으면 도움말 대신 오류를 보인다. 입력 부품이 스스로 찾은 오류(DateField min · max 밖 날짜, MaskedInput `validate` 검증 숫자)도 같은 오류 칸에 보인다. 부품은 내부 통로(`useFieldMessage`)로 문구를 올리고 내리며, error prop이 있으면 그것이 이긴다.

## 접근성

`<label for>`, `aria-describedby`(도움말 · 오류), `aria-invalid`. 필수는 숨긴 "(필수)" 글자를 함께 읽는다. 입력 부품이 올린 오류는 치는 도중에 생기므로 오류 칸이 `role="alert"`로 바로 읽힌다(error prop 오류는 포커스할 때 설명으로 읽는다).

## 밀도

라벨과 칸 사이 4, 가로 배치 라벨 열 120(compact) · 140(comfortable).

## 플랫폼 차이

네이티브는 가로 배치를 쓰지 않는다(항상 vertical).

## 금지 사항

Field 없이 칸만 두기 · 오류를 빨간 글자만으로.

## 예시

### 라벨 · 필수 · 도움말 · 오류

```tsx
import { Input, Field } from '@terracelab/trellis-react';

function Basic() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tl-space-16)',
        maxWidth: 'calc(var(--tl-space-64) * 6)',
      }}
    >
      <Field label="거래처" required help="사업자등록번호나 상호로 찾습니다">
        <Input icon="search" placeholder="한빛무역" />
      </Field>
      <Field label="사업자등록번호" required error="사업자등록번호는 10자리입니다">
        <Input defaultValue="123-45-678" />
      </Field>
      <Field label="담당자 메일" layout="horizontal">
        <Input type="email" placeholder="name@company.co.kr" />
      </Field>
    </div>
  );
}
```
