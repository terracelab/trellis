// 폼 어댑터(PR-09): useTrellisForm + ErrorSummary
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { AmountInput, Checkbox, ErrorSummary, Field, Input, Select } from '../src/core/index.js';
import { schemaResolver, useTrellisForm } from '../src/form/index.js';

const schema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  currency: z
    .string({ error: '통화를 고르세요' })
    .nullable()
    .refine((v) => !!v, '통화를 고르세요'),
  amount: z
    .number({ error: '금액을 입력하세요' })
    .nullable()
    .refine((v) => v != null && v > 0, '0보다 큰 금액을 입력하세요'),
  agree: z.boolean().refine((v) => v, '내용을 확인했다고 체크하세요'),
});
type Values = z.infer<typeof schema>;

function PoForm({
  onSave,
  withSummary = true,
}: {
  onSave: (v: Values) => void;
  withSummary?: boolean;
}) {
  const form = useTrellisForm<Values>({
    schema,
    defaultValues: { title: '', currency: null, amount: null, agree: false },
  });
  return (
    <form onSubmit={form.submit(onSave)} noValidate>
      {withSummary && <ErrorSummary {...form.summary} />}
      <Field {...form.field('title', '제목')} required>
        <Input {...form.bind('title')} />
      </Field>
      <Field {...form.field('currency', '통화')} required>
        <Select
          {...form.bind('currency')}
          options={[
            { value: 'KRW', label: '원화' },
            { value: 'USD', label: '달러' },
          ]}
        />
      </Field>
      <Field {...form.field('amount', '금액')} required>
        <AmountInput {...form.bind('amount')} />
      </Field>
      <Field {...form.field('agree', '확인')}>
        <Checkbox {...form.bindChecked('agree')}>발주 내용을 확인했습니다</Checkbox>
      </Field>
      <button type="submit">저장</button>
    </form>
  );
}

describe('useTrellisForm', () => {
  it('제출하면 요약(칸 순서)으로 포커스, 칸마다 오류 문장이 이어지고, 고치는 대로 사라진다', async () => {
    const onSave = vi.fn();
    render(<PoForm onSave={onSave} />);
    // 제출 전에는 요약도 칸 오류도 없다
    expect(screen.queryByRole('alert')).toBeNull();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });
    const summary = await screen.findByRole('alert');
    expect(summary).toHaveAccessibleName('확인할 항목 4개');
    expect(document.activeElement).toBe(summary);
    const links = screen.getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual([
      '제목 · 제목을 입력하세요',
      '통화 · 통화를 고르세요',
      '금액 · 0보다 큰 금액을 입력하세요',
      '확인 · 내용을 확인했다고 체크하세요',
    ]);
    // 칸: aria-invalid + 오류 문장이 설명으로 이어진다
    const title = screen.getByRole('textbox', { name: /제목/ });
    expect(title).toHaveAttribute('aria-invalid', 'true');
    expect(title).toHaveAccessibleDescription('제목을 입력하세요');
    // 요약 항목을 누르면 그 칸으로
    fireEvent.click(links[0]!);
    expect(document.activeElement).toBe(title);
    expect(links[0]).toHaveAttribute('href', `#${title.id}`);
    // 한 번 제출한 뒤에는 고치는 대로 다시 검사한다
    await act(async () => {
      fireEvent.change(title, { target: { value: '11월 냉동 연어 발주' } });
    });
    await waitFor(() => expect(screen.getAllByRole('link')).toHaveLength(3));
    expect(title).not.toHaveAttribute('aria-invalid');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('맞게 채우면 스키마가 돌려준 값으로 저장한다(좁은 화면: Select는 시트)', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: false,
        media,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    const onSave = vi.fn();
    render(<PoForm onSave={onSave} />);
    fireEvent.change(screen.getByRole('textbox', { name: /제목/ }), { target: { value: '연어' } });
    const amount = screen.getByRole('textbox', { name: /금액/ });
    fireEvent.change(amount, { target: { value: '1200000' } });
    fireEvent.blur(amount);
    fireEvent.click(screen.getByRole('checkbox', { name: /발주 내용/ }));
    fireEvent.click(screen.getByRole('button', { name: /통화/ }));
    fireEvent.click(await screen.findByRole('radio', { name: '달러' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0]![0]).toEqual({
      title: '연어',
      currency: 'USD',
      amount: 1_200_000,
      agree: true,
    });
    vi.unstubAllGlobals();
  });

  it('요약이 없으면 첫 오류 칸으로 포커스', async () => {
    render(<PoForm onSave={() => {}} withSummary={false} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('textbox', { name: /제목/ })),
    );
  });
});

describe('schemaResolver', () => {
  it('배열 · 중첩 경로를 칸 이름으로, 칸마다 첫 오류만', async () => {
    const lines = z.object({
      lines: z.array(z.object({ qty: z.number().min(1, '1 이상').max(99, '99 이하') })),
    });
    const resolve = schemaResolver(lines);
    const r = await resolve({ lines: [{ qty: 5 }, { qty: 0 }] }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    });
    expect(r.errors).toEqual({
      lines: [undefined, { qty: { type: 'schema', message: '1 이상' } }],
    });
  });
});

describe('ErrorSummary', () => {
  it('오류가 없으면 그리지 않고, 제목을 바꿀 수 있다', () => {
    const { container, rerender } = render(<ErrorSummary errors={[]} />);
    expect(container).toBeEmptyDOMElement();
    const onSelect = vi.fn();
    rerender(
      <ErrorSummary
        title="저장하지 못했습니다"
        onSelect={onSelect}
        errors={[{ id: 'x', label: '거래처', message: '거래처를 고르세요' }]}
      />,
    );
    expect(screen.getByRole('alert')).toHaveAccessibleName('저장하지 못했습니다');
    fireEvent.click(screen.getByRole('link', { name: '거래처 · 거래처를 고르세요' }));
    expect(onSelect).toHaveBeenCalledWith({
      id: 'x',
      label: '거래처',
      message: '거래처를 고르세요',
    });
  });
});
