// DateField min · max 밖 글자 입력: 값은 그대로, 오류 + 안내 문구(PR-21) · 앱에 알리기(R-35)
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { outOfRange, readDate } from '../src/_internal/date-text.js';
import { DateField, Field, Input, TrellisProvider } from '../src/core/index.js';
import { ErrorSummary, useTrellisForm } from '../src/form/index.js';

describe('날짜 글자 읽기', () => {
  it('있는 날만 ISO, 범위는 따로 본다', () => {
    expect(readDate('2026-12-31')).toBe('2026-12-31');
    expect(readDate('2026-02-30')).toBeUndefined();
    expect(readDate('2026-12-3')).toBeUndefined();
    expect(outOfRange('2026-10-31', '2026-11-01')).toBe('min');
    expect(outOfRange('2026-12-01', undefined, '2026-11-30')).toBe('max');
    expect(outOfRange('2026-11-01', '2026-11-01', '2026-11-30')).toBeNull();
  });
});

describe('DateField 범위 밖 입력', () => {
  it('max 뒤 날을 치면 값은 그대로 · 오류 · 안내, 칸을 떠나도 남는다', () => {
    const onChange = vi.fn();
    render(
      <Field label="작성일">
        <DateField defaultValue="2026-11-06" max="2026-11-30" onChange={onChange} />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '작성일' });
    fireEvent.change(input, { target: { value: '20261231' } });
    expect(input).toHaveValue('2026-12-31');
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('2026-11-30까지 넣을 수 있습니다');
    expect(screen.getByRole('alert')).toHaveTextContent('2026-11-30까지 넣을 수 있습니다');
    expect(input.closest('.tl-field')).toHaveAttribute('data-state', 'error');
    expect(input.closest('.tl-date-field')).toHaveAttribute('data-state', 'error');
    // 조용히 되돌리지 않는다
    fireEvent.blur(input);
    expect(input).toHaveValue('2026-12-31');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    // 범위 안 날짜를 치면 값이 되고 안내가 걷힌다
    fireEvent.change(input, { target: { value: '20261115' } });
    expect(onChange).toHaveBeenCalledWith('2026-11-15');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('min 앞 날: 고치는 동안(덜 친 글자) 안내가 남고, 덜 친 채로 떠나면 마지막 값으로 돌아가며 걷힌다', () => {
    const onChange = vi.fn();
    render(
      <Field label="납기일" help="12월 안에서 고릅니다">
        <DateField defaultValue="2026-12-10" min="2026-12-01" onChange={onChange} />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '납기일' });
    expect(input).toHaveAccessibleDescription('12월 안에서 고릅니다');
    fireEvent.change(input, { target: { value: '20261130' } });
    expect(input).toHaveAccessibleDescription('2026-12-01 이후 날짜를 넣으세요');
    fireEvent.change(input, { target: { value: '2026-11-3' } });
    expect(input).toHaveAccessibleDescription('2026-12-01 이후 날짜를 넣으세요');
    fireEvent.blur(input);
    expect(input).toHaveValue('2026-12-10');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription('12월 안에서 고릅니다');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('칸을 비우면 안내가 걷히고 null', () => {
    const onChange = vi.fn();
    render(
      <DateField label="입고일" defaultValue="2026-11-06" max="2026-11-30" onChange={onChange} />,
    );
    const input = screen.getByRole('textbox', { name: '입고일' });
    fireEvent.change(input, { target: { value: '20270101' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('outOfRangeText가 문구를 바꾼다(넘은 쪽 · 경계 날짜)', () => {
    const text = vi.fn((bound: 'min' | 'max', date: string) =>
      bound === 'min' ? `발주일(${date}) 이후로 넣으세요` : `${date} 뒤는 안 됩니다`,
    );
    render(
      <Field label="입고일">
        <DateField min="2026-11-03" max="2026-11-30" outOfRangeText={text} />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '입고일' });
    fireEvent.change(input, { target: { value: '20261101' } });
    expect(text).toHaveBeenLastCalledWith('min', '2026-11-03');
    expect(input).toHaveAccessibleDescription('발주일(2026-11-03) 이후로 넣으세요');
  });

  it('Field error가 있으면 그것이 보인다', () => {
    render(
      <Field label="입고일" error="입고일은 발주일 이후여야 합니다">
        <DateField max="2026-11-30" />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '입고일' });
    fireEvent.change(input, { target: { value: '20261231' } });
    expect(input).toHaveAccessibleDescription('입고일은 발주일 이후여야 합니다');
    expect(screen.queryByText(/까지 넣을 수 있습니다/)).toBeNull();
  });

  it('Field 밖이면 칸 아래에 안내를 그리고 설명으로 잇는다', () => {
    render(<DateField label="기준일" max="2026-11-30" />);
    const input = screen.getByRole('textbox', { name: '기준일' });
    fireEvent.change(input, { target: { value: '20261201' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('2026-11-30까지 넣을 수 있습니다');
    expect(screen.getByRole('alert')).toHaveClass('tl-field__note');
  });

  it('제어 컴포넌트: 부모 값은 그대로', () => {
    const onChange = vi.fn();
    render(<DateField label="전표일" value="2026-11-06" max="2026-11-30" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: '전표일' });
    fireEvent.change(input, { target: { value: '20261201' } });
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('2026-12-01');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('달력은 범위 밖 날을 막고, 달력에서 고르면 안내가 걷힌다(같은 값이어도)', async () => {
    const onChange = vi.fn();
    render(
      <Field label="입고일">
        <DateField
          defaultValue="2026-11-10"
          today="2026-11-06"
          max="2026-11-20"
          onChange={onChange}
        />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '입고일' });
    fireEvent.change(input, { target: { value: '20261125' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    fireEvent.click(screen.getByRole('button', { name: '달력 열기' }));
    const grid = await screen.findByRole('grid');
    expect(within(grid).getAllByRole('button', { name: /^21일 토요일/ })[0]!).toBeDisabled();
    await act(async () => {
      fireEvent.click(within(grid).getAllByRole('button', { name: /^10일 화요일/ })[0]!);
    });
    await waitFor(() => expect(input).toHaveValue('2026-11-10'));
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('en: 기본 문구', () => {
    render(
      <TrellisProvider locale="en">
        <Field label="Date">
          <DateField min="2026-11-01" />
        </Field>
      </TrellisProvider>,
    );
    const input = screen.getByRole('textbox', { name: 'Date' });
    fireEvent.change(input, { target: { value: '20261031' } });
    expect(input).toHaveAccessibleDescription('Enter a date on or after 2026-11-01');
  });
});

// 서비스 요청 R-35: 범위 밖 입력은 값이 그대로라 앱이 이전 값을 저장했다(min 2026-11-09에 2026-10-10을 치면 2029-11-01이 저장).
// 값은 그대로 두고(D-74) 앱에 따로 알린다: onOutOfRangeChange · setCustomValidity · form.bindDate
describe('DateField 범위 밖 입력을 앱에 알리기(R-35)', () => {
  it('서비스 재현: 값은 그대로지만 onOutOfRangeChange가 생길 때 내용, 걷힐 때 null을 받는다', () => {
    const onChange = vi.fn();
    const onOutOfRangeChange = vi.fn();
    function Expiry() {
      const [value, setValue] = useState<string | null>('2029-11-01');
      return (
        <Field label="자격증 만료일">
          <DateField
            value={value}
            onChange={(v) => {
              setValue(v);
              onChange(v);
            }}
            min="2026-11-09"
            onOutOfRangeChange={onOutOfRangeChange}
          />
        </Field>
      );
    }
    render(<Expiry />);
    expect(onOutOfRangeChange).not.toHaveBeenCalled();
    const input = screen.getByRole('textbox', { name: '자격증 만료일' });
    fireEvent.change(input, { target: { value: '20261010' } });
    expect(onChange).not.toHaveBeenCalled();
    expect(onOutOfRangeChange).toHaveBeenCalledTimes(1);
    expect(onOutOfRangeChange).toHaveBeenLastCalledWith({
      bound: 'min',
      date: '2026-11-09',
      typed: '2026-10-10',
      text: '2026-11-09 이후 날짜를 넣으세요',
    });
    // 칸을 떠나도, 고치는 도중(덜 친 글자)에도 상태는 그대로라 다시 부르지 않는다
    fireEvent.blur(input);
    fireEvent.change(input, { target: { value: '2026-10-1' } });
    expect(onOutOfRangeChange).toHaveBeenCalledTimes(1);
    // 다른 범위 밖 날짜를 치면 새 내용으로 한 번 더
    fireEvent.change(input, { target: { value: '20261011' } });
    expect(onOutOfRangeChange).toHaveBeenCalledTimes(2);
    expect(onOutOfRangeChange.mock.calls[1]![0]).toMatchObject({ typed: '2026-10-11' });
    // 범위 안 날짜: 값이 바뀌고 null
    fireEvent.change(input, { target: { value: '20261120' } });
    expect(onChange).toHaveBeenCalledWith('2026-11-20');
    expect(onOutOfRangeChange).toHaveBeenLastCalledWith(null);
    expect(onOutOfRangeChange).toHaveBeenCalledTimes(3);
  });

  it('outOfRangeText 문구가 text로, max 쪽이면 bound max', () => {
    const onOutOfRangeChange = vi.fn();
    render(
      <DateField
        label="입고일"
        max="2026-11-30"
        outOfRangeText={(_b, date) => `${date} 뒤는 안 됩니다`}
        onOutOfRangeChange={onOutOfRangeChange}
      />,
    );
    fireEvent.change(screen.getByRole('textbox', { name: '입고일' }), {
      target: { value: '20261201' },
    });
    expect(onOutOfRangeChange).toHaveBeenLastCalledWith({
      bound: 'max',
      date: '2026-11-30',
      typed: '2026-12-01',
      text: '2026-11-30 뒤는 안 됩니다',
    });
  });

  it('칸을 비우거나 달력에서 고르거나 밖에서 value가 바뀌면 null, 칸이 사라질 때 남아 있으면 null', async () => {
    const onOutOfRangeChange = vi.fn();
    const { rerender, unmount } = render(
      <DateField
        label="납기일"
        value="2026-11-10"
        today="2026-11-06"
        max="2026-11-20"
        onOutOfRangeChange={onOutOfRangeChange}
      />,
    );
    const input = screen.getByRole('textbox', { name: '납기일' });
    fireEvent.change(input, { target: { value: '20261125' } });
    fireEvent.change(input, { target: { value: '' } });
    expect(onOutOfRangeChange).toHaveBeenLastCalledWith(null);
    fireEvent.change(input, { target: { value: '20261125' } });
    rerender(
      <DateField
        label="납기일"
        value="2026-11-12"
        today="2026-11-06"
        max="2026-11-20"
        onOutOfRangeChange={onOutOfRangeChange}
      />,
    );
    expect(onOutOfRangeChange).toHaveBeenLastCalledWith(null);
    fireEvent.change(input, { target: { value: '20261125' } });
    fireEvent.click(screen.getByRole('button', { name: '달력 열기' }));
    const grid = await screen.findByRole('grid');
    await act(async () => {
      fireEvent.click(within(grid).getAllByRole('button', { name: /^10일 화요일/ })[0]!);
    });
    expect(onOutOfRangeChange).toHaveBeenLastCalledWith(null);
    expect(onOutOfRangeChange).toHaveBeenCalledTimes(6);
    fireEvent.change(input, { target: { value: '20261125' } });
    unmount();
    expect(onOutOfRangeChange).toHaveBeenLastCalledWith(null);
    expect(onOutOfRangeChange).toHaveBeenCalledTimes(8);
  });

  it('글자 칸에 setCustomValidity: form.checkValidity()가 실패하고 기본 제출이 막힌다', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit} aria-label="자격증">
        <DateField label="만료일" name="expires" defaultValue="2029-11-01" min="2026-11-09" />
        <button type="submit">저장</button>
      </form>,
    );
    const form = screen.getByRole('form', { name: '자격증' }) as HTMLFormElement;
    const input = screen.getByRole('textbox', { name: '만료일' }) as HTMLInputElement;
    expect(form.checkValidity()).toBe(true);
    fireEvent.change(input, { target: { value: '20261010' } });
    expect(input.validity.customError).toBe(true);
    expect(input.validationMessage).toBe('2026-11-09 이후 날짜를 넣으세요');
    expect(form.checkValidity()).toBe(false);
    act(() => form.requestSubmit());
    expect(onSubmit).not.toHaveBeenCalled();
    // 범위 안으로 고치면 검사가 풀리고 제출된다
    fireEvent.change(input, { target: { value: '20261120' } });
    expect(input.validity.valid).toBe(true);
    expect(form.checkValidity()).toBe(true);
    act(() => form.requestSubmit());
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(new FormData(form).get('expires')).toBe('2026-11-20');
  });

  it('ref를 넘겨도 그대로 이어진다', () => {
    const ref = createRef<HTMLInputElement>();
    render(<DateField label="기준일" ref={ref} max="2026-11-30" />);
    expect(ref.current).toBe(screen.getByRole('textbox', { name: '기준일' }));
  });
});

describe('form.bindDate(R-35)', () => {
  const schema = z.object({
    title: z.string().min(1, '자격증 이름을 입력하세요'),
    expires: z
      .string()
      .nullable()
      .refine((v) => !!v, '만료일을 입력하세요'),
  });
  type Values = z.infer<typeof schema>;

  function CertForm({
    onSave,
    withSchema = true,
  }: {
    onSave: (v: Values) => void;
    withSchema?: boolean;
  }) {
    const form = useTrellisForm<Values>({
      schema: withSchema ? schema : undefined,
      defaultValues: { title: '정보처리기사', expires: '2029-11-01' },
    });
    return (
      <form onSubmit={form.submit(onSave)} noValidate>
        <ErrorSummary {...form.summary} />
        <Field {...form.field('title', '자격증 이름')} required>
          <Input {...form.bind('title')} />
        </Field>
        <Field {...form.field('expires', '만료일')} required>
          <DateField {...form.bindDate('expires')} min="2026-11-09" />
        </Field>
        <button type="submit">저장</button>
      </form>
    );
  }

  it('범위 밖 날짜를 친 채로 제출하면 저장하지 않고 요약 · 칸 오류에 안내, 고치면 새 값으로 저장', async () => {
    const onSave = vi.fn();
    render(<CertForm onSave={onSave} />);
    const input = screen.getByRole('textbox', { name: /만료일/ });
    fireEvent.change(input, { target: { value: '20261010' } });
    // 제출 전에는 칸 안내만(치는 도중이라 바로 읽힌다)
    expect(screen.getByRole('alert')).toHaveTextContent('2026-11-09 이후 날짜를 넣으세요');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });
    expect(onSave).not.toHaveBeenCalled();
    const links = await screen.findAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual(['만료일 · 2026-11-09 이후 날짜를 넣으세요']);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('2026-11-09 이후 날짜를 넣으세요');
    // 범위 안으로 고치면 오류가 걷히고 새 값으로 저장한다
    await act(async () => {
      fireEvent.change(input, { target: { value: '20261120' } });
    });
    await waitFor(() => expect(screen.queryAllByRole('link')).toHaveLength(0));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0]![0]).toEqual({ title: '정보처리기사', expires: '2026-11-20' });
  });

  it('스키마 오류와 함께 나오고, 같은 칸이면 범위 안내가 이긴다', async () => {
    const onSave = vi.fn();
    function Empty() {
      const form = useTrellisForm<Values>({ schema, defaultValues: { title: '', expires: null } });
      return (
        <form onSubmit={form.submit(onSave)} noValidate>
          <ErrorSummary {...form.summary} />
          <Field {...form.field('title', '자격증 이름')} required>
            <Input {...form.bind('title')} />
          </Field>
          <Field {...form.field('expires', '만료일')} required>
            <DateField {...form.bindDate('expires')} min="2026-11-09" />
          </Field>
          <button type="submit">저장</button>
        </form>
      );
    }
    render(<Empty />);
    fireEvent.change(screen.getByRole('textbox', { name: /만료일/ }), {
      target: { value: '20261010' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });
    const links = await screen.findAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual([
      '자격증 이름 · 자격증 이름을 입력하세요',
      '만료일 · 2026-11-09 이후 날짜를 넣으세요',
    ]);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('스키마 없는 폼도 범위 밖이면 저장하지 않는다', async () => {
    const onSave = vi.fn();
    render(<CertForm onSave={onSave} withSchema={false} />);
    fireEvent.change(screen.getByRole('textbox', { name: /만료일/ }), {
      target: { value: '20261010' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });
    expect(onSave).not.toHaveBeenCalled();
    const links = await screen.findAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual(['만료일 · 2026-11-09 이후 날짜를 넣으세요']);
  });
});
