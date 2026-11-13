# Building forms

`@terracelab/trellis-react/form` connects react-hook-form to Trellis inputs. It turns a Field's name, id and error, an input's value, and the error summary after submit into one line each. Install react-hook-form only when you use this entry.

```bash
pnpm add react-hook-form zod   # zod is optional
```

## Basic shape

```tsx
import { AmountInput, Button, DateField, Field, FormSection, Input, Select } from '@terracelab/trellis-react';
import { ErrorSummary, useTrellisForm } from '@terracelab/trellis-react/form';
import { z } from 'zod';

const schema = z.object({
  party: z.string().nullable().refine((v) => !!v, 'Choose a supplier'),
  due: z.string().nullable().refine((v) => !!v, 'Enter a due date'),
  amount: z.number().nullable().refine((v) => v != null && v > 0, 'Enter an amount above 0'),
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
      <FormSection title="Terms">
        <Field {...form.field('party', 'Supplier')} required>
          <Select {...form.bind('party')} options={parties} />
        </Field>
        <Field {...form.field('due', 'Due date')} required>
          <DateField {...form.bindDate('due')} min="2026-11-06" />
        </Field>
        <Field {...form.field('amount', 'Amount')} required>
          <AmountInput {...form.bind('amount')} />
        </Field>
        <Field {...form.field('memo', 'Memo')}>
          <Input {...form.bind('memo')} />
        </Field>
      </FormSection>
      <Button type="submit" variant="primary">Save</Button>
    </form>
  );
}
```

| Part | What it does |
| --- | --- |
| `form.field(name, label)` | Passes `label` · `id` · `error` to Field. The id becomes the input's id, so summary links go to that field. The order fields are drawn in is the summary order |
| `form.bind(name)` | Passes `value` · `onChange(value)`. Input · Select · DateField · AmountInput · QuantityInput · CodeSearch · MultiSelect · CheckboxGroup · SelectableCard · AddressInput all take this shape. CheckboxGroup and SelectableCard with `mode="multiple"` take an array, and AddressInput takes an address object (null when empty) |
| `form.bindChecked(name)` | Checkbox · Switch connect through `checked` |
| `form.bindDate(name)` | bind for DateField. It also passes `onOutOfRangeChange`, so while a typed date is outside min and max the form does not save, even though the value has not changed, and the message shows as that field's error |
| `form.submit(onValid)` | When something is wrong, nothing is saved and focus moves to the ErrorSummary. Without a summary, focus goes to the first field with an error |
| `form.summary` | `<ErrorSummary {...form.summary} />`. It holds errors only after a submit |

`useTrellisForm` returns react-hook-form's `useForm` result with the six parts above added. Use `watch` · `reset` · `formState` and the rest as usual.

## When fields are checked

- Before the first submit, errors do not appear while someone is typing. People filling a form for the first time should not get a wall of red text.
- After one submit, fields are checked again as they change. The error on a fixed field and its summary item disappear right away.
- When every error is fixed, the summary disappears too.

## Schemas

zod is not a dependency. Any schema with `safeParseAsync` works as `schema` (zod 3 · 4). Only the first error per field is kept, and array or nested fields like `lines.0.qty` carry through. A `resolver` you pass to react-hook-form wins over `schema`. You can also check with `rules` and no schema.

Error sentences follow the [content rules](./content.md). Say briefly what to do ("Choose a supplier", "Enter 1 or more"). Do not write sentences that only state the cause, like "Invalid value", and do not use exclamation marks or apologies.

## Line items

Use LineItemsEditor for entry tables where lines are added and removed. Pass the line array with `form.bind('lines')`. Errors in line cells appear in the summary under names like `lines.0.qty`.

## Server errors

When a save request returns errors per field, put them in with `form.setError('party', { message: 'This supplier is no longer active' })`. They show in the field and the summary the same way. Failures that are not about a field (permission, network) go in a Banner or Toast.
