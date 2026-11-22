# 폼 만들기

`@terracelab/trellis-react/form`은 react-hook-form을 Trellis 입력에 잇는 엔트리입니다. Field의 이름 · id · 오류, 입력의 값, 제출 뒤 오류 요약을 한 줄씩으로 줄입니다. react-hook-form은 이 엔트리를 쓸 때만 설치합니다.

```bash
pnpm add react-hook-form zod   # zod는 선택입니다
```

## 기본 모양

```tsx
import { AmountInput, Button, DateField, Field, FormSection, Input, Select } from '@terracelab/trellis-react';
import { ErrorSummary, useTrellisForm } from '@terracelab/trellis-react/form';
import { z } from 'zod';

const schema = z.object({
  party: z.string().nullable().refine((v) => !!v, '거래처를 고르세요'),
  due: z.string().nullable().refine((v) => !!v, '납기를 입력하세요'),
  amount: z.number().nullable().refine((v) => v != null && v > 0, '0보다 큰 금액을 입력하세요'),
  memo: z.string(),
});

export function PurchaseOrderForm({ onSave }: { onSave: (v: z.infer<typeof schema>) => void }) {
  const form = useTrellisForm({
    schema,
    defaultValues: { party: null, due: null, amount: null, memo: '' },
  });
  return (
    <form onSubmit={form.submit(onSave)} noValidate>
      <ErrorSummary {...form.summary} />
      <FormSection title="거래 조건">
        <Field {...form.field('party', '거래처')} required>
          <Select {...form.bind('party')} options={parties} />
        </Field>
        <Field {...form.field('due', '납기')} required>
          <DateField {...form.bindDate('due')} min="2026-11-06" />
        </Field>
        <Field {...form.field('amount', '금액')} required>
          <AmountInput {...form.bind('amount')} />
        </Field>
        <Field {...form.field('memo', '비고')}>
          <Input {...form.bind('memo')} />
        </Field>
      </FormSection>
      <Button type="submit" variant="primary">저장</Button>
    </form>
  );
}
```

| 부분 | 하는 일 |
| --- | --- |
| `form.field(name, label)` | Field에 `label` · `id` · `error`를 넘깁니다. id는 입력 요소 id가 되어 요약 링크가 그 칸으로 갑니다. 화면에 그린 순서가 요약 순서입니다 |
| `form.bind(name)` | `value` · `onChange(value)`를 넘깁니다. Input · Select · DateField · AmountInput · QuantityInput · CodeSearch · MultiSelect · CheckboxGroup · SelectableCard · AddressInput이 모두 이 모양입니다. CheckboxGroup과 `mode="multiple"` SelectableCard의 값은 배열, AddressInput의 값은 주소 객체(비면 null)입니다 |
| `form.bindChecked(name)` | Checkbox · Switch는 `checked`로 잇습니다 |
| `form.bindDate(name)` | DateField용 bind입니다. `onOutOfRangeChange`를 더 넘겨, min · max 밖 날짜를 친 동안에는 값이 그대로여도 저장하지 않고 그 칸 오류로 안내를 보입니다 |
| `form.submit(onValid)` | 틀리면 저장하지 않고 ErrorSummary로 포커스를 옮깁니다. 요약이 없으면 첫 오류 칸으로 갑니다 |
| `form.summary` | `<ErrorSummary {...form.summary} />`. 제출한 뒤에만 오류가 들어 있습니다 |

`useTrellisForm`이 돌려주는 값은 react-hook-form의 `useForm` 결과에 위 여섯 가지를 더한 것입니다. `watch` · `reset` · `formState` 같은 원래 기능을 그대로 씁니다.

## 검증 시점

- 제출 전에는 고치는 중에 오류를 띄우지 않습니다. 처음 입력하는 사람에게 빨간 글자를 쏟아내지 않기 위해서입니다.
- 한 번 제출한 뒤에는 고치는 대로 다시 검사합니다. 고친 칸의 오류와 요약 항목이 바로 사라집니다.
- 모든 오류를 고치면 요약도 사라집니다.

## 스키마

zod는 의존성이 아닙니다. `safeParseAsync`가 있는 스키마면 무엇이든 `schema`로 받습니다(zod 3 · 4). 칸마다 첫 오류만 남기고, `lines.0.qty` 같은 배열 · 중첩 칸도 그대로 이어집니다. react-hook-form의 `resolver`를 직접 주면 그쪽이 이깁니다. 스키마 없이 `rules`로 검사해도 됩니다.

오류 문장은 [문구 규칙](./content.md)을 따릅니다. 무엇을 하면 되는지 짧게 씁니다("거래처를 고르세요", "1 이상 입력하세요"). "잘못된 값입니다"처럼 원인만 말하는 문장, 느낌표, 사과는 쓰지 않습니다.

## 품목 줄

품목을 더하고 빼는 입력 표는 LineItemsEditor를 씁니다. 줄 배열을 `form.bind('lines')`로 넘기고, 줄 칸 오류는 `lines.0.qty` 이름으로 요약에 섭니다.

## 서버 오류

저장 요청이 칸 단위 오류를 돌려주면 `form.setError('party', { message: '거래가 끊긴 거래처입니다' })`로 넣습니다. 칸과 요약에 같은 방식으로 섭니다. 칸과 관계없는 실패(권한 · 네트워크)는 Banner나 Toast로 알립니다.
