// 회계 · 재고 보강(PG-37 · PG-38): Checklist · MaskedInput bankAccount · QuantityInput 환산
import {
  ChecklistContract,
  type ChecklistItem,
  type ChecklistProps,
} from '@terracelab/trellis-contracts';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Checklist, Field, MaskedInput, QuantityInput } from '../src/core/index.js';

const TODAY = '2026-11-06';
const ITEMS: ChecklistItem[] = [
  { id: 'bank', title: '은행 잔액 대사', state: 'done', owner: '정민호', due: '2026-11-06' },
  {
    id: 'sales',
    title: '매출 · 매입 전표',
    description: '16건 입력',
    state: 'doing',
    due: '2026-11-30',
  },
  { id: 'payroll', title: '급여 전표', state: 'blocked', due: '2026-11-25' },
  { id: 'fx', title: '외화 환산', state: 'pending', due: '2026-11-04' },
  { id: 'dep', title: '감가상각', state: 'pending', due: '2026-11-06', disabled: true },
];

function Controlled(props: Partial<ChecklistProps>) {
  const [items, setItems] = useState(ITEMS);
  return (
    <Checklist
      label="11월 결산 준비"
      today={TODAY}
      items={items}
      onChange={(id, done) =>
        setItems((l) =>
          l.map((i) => (i.id === id ? { ...i, state: done ? 'done' : 'pending' } : i)),
        )
      }
      {...props}
    />
  );
}

describe('Checklist contract', () => {
  it('displayName === contract.name, props에 id · testID', () => {
    expect(Checklist.displayName).toBe(ChecklistContract.name);
    expect(Object.keys(ChecklistContract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    expectTypeOf<ChecklistProps>().toMatchTypeOf<ComponentProps<typeof Checklist>>();
  });

  it('loading이면 data-state="loading" · aria-busy', () => {
    render(<Checklist label="결산" items={[]} loading testID="c" />);
    expect(screen.getByTestId('c')).toHaveAttribute('data-state', 'loading');
    expect(screen.getByTestId('c')).toHaveAttribute('aria-busy', 'true');
  });
});

describe('Checklist', () => {
  it('이름 있는 묶음, 진행 요약(완료 1 / 5건)과 남은 상태 수', () => {
    render(<Checklist label="11월 결산 준비" today={TODAY} items={ITEMS} />);
    const group = screen.getByRole('group', { name: '11월 결산 준비' });
    expect(within(group).getByRole('progressbar')).toHaveAttribute('aria-valuetext', '1 / 5건');
    expect(group).toHaveTextContent('진행 1 · 보류 1 · 대기 2');
  });

  it('상태 글자 · 기한(D-n · 경과 · D-day) · 담당', () => {
    render(<Checklist label="결산" today={TODAY} items={ITEMS} />);
    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('완료');
    expect(rows[0]).toHaveTextContent('정민호');
    // 끝난 항목은 날짜만
    expect(rows[0]).toHaveTextContent('11월 6일');
    expect(rows[0]).not.toHaveTextContent('D-day');
    expect(rows[1]).toHaveTextContent('11월 30일 · D-24');
    expect(rows[2]).toHaveTextContent('보류');
    expect(rows[3]).toHaveTextContent('11월 4일 · 2일 경과');
    expect(rows[3]!.querySelector('[data-overdue]')).not.toBeNull();
    expect(rows[4]).toHaveTextContent('D-day');
  });

  it('onChange가 없으면 체크 단추가 없다(보기 전용)', () => {
    render(<Checklist label="결산" today={TODAY} items={ITEMS} />);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('체크 단추: 누르면 완료 ↔ 대기, 보류 · disabled 항목은 누를 수 없다', () => {
    render(<Controlled />);
    const fx = screen.getByRole('checkbox', { name: '외화 환산 완료 표시' });
    expect(fx).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(fx);
    expect(screen.getByRole('checkbox', { name: '외화 환산 완료 표시' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '2 / 5건');
    fireEvent.click(screen.getByRole('checkbox', { name: '은행 잔액 대사 완료 표시' }));
    expect(screen.getByRole('checkbox', { name: '은행 잔액 대사 완료 표시' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('checkbox', { name: '급여 전표 완료 표시' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: '감가상각 완료 표시' })).toBeDisabled();
  });

  it('키보드: 체크 단추는 Tab 정류장(button)이라 Space로 누른다', () => {
    const onChange = vi.fn();
    render(<Checklist label="결산" today={TODAY} items={ITEMS} onChange={onChange} />);
    const sales = screen.getByRole('checkbox', { name: '매출 · 매입 전표 완료 표시' });
    expect(sales.tagName).toBe('BUTTON');
    sales.focus();
    expect(sales).toHaveFocus();
    fireEvent.click(sales);
    expect(onChange).toHaveBeenCalledWith('sales', true);
  });

  it('행동 단추 하나: 누르면 onPress, 끝난 항목은 ghost', () => {
    const onPress = vi.fn();
    render(
      <Checklist
        label="결산"
        today={TODAY}
        items={[
          { ...ITEMS[3]!, action: { label: '환산하기', onPress } },
          { ...ITEMS[0]!, action: { label: '보기', onPress } },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '환산하기' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '보기' })).toHaveAttribute('data-variant', 'ghost');
  });

  it('다 끝나면 막대가 success, 빈 목록은 글자', () => {
    const { rerender } = render(
      <Checklist label="결산" items={[{ id: 'a', title: '대사', state: 'done' }]} />,
    );
    expect(screen.getByRole('progressbar').closest('[data-tone]')).toHaveAttribute(
      'data-tone',
      'success',
    );
    rerender(<Checklist label="결산" items={[]} emptyText="12월 결산 항목이 없습니다" />);
    expect(screen.getByText('12월 결산 항목이 없습니다')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});

describe('MaskedInput bankAccount', () => {
  it('은행 형식으로 나누고 다 채우면 data-complete, 값은 숫자만', () => {
    const onChange = vi.fn();
    render(
      <Field label="계좌번호">
        <MaskedInput mask="bankAccount" bank="003" onChange={onChange} />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '계좌번호' });
    expect(input).toHaveAttribute('placeholder', '024-118420-01-011');
    fireEvent.change(input, { target: { value: '02411842001011' } });
    expect(input).toHaveValue('024-118420-01-011');
    expect(onChange).toHaveBeenLastCalledWith('02411842001011', '024-118420-01-011');
    expect(input.closest('.tl-masked-input')).toHaveAttribute('data-complete');
    expect(input.closest('.tl-masked-input')).toHaveAttribute('data-mask', 'bankAccount');
  });

  it('은행이 바뀌면 같은 숫자를 새 형식으로, 은행이 없으면 숫자만', () => {
    const { rerender } = render(
      <MaskedInput label="계좌번호" mask="bankAccount" bank="088" value="110123456789" />,
    );
    const input = screen.getByRole('textbox', { name: '계좌번호' });
    expect(input).toHaveValue('110-123-456789');
    rerender(<MaskedInput label="계좌번호" mask="bankAccount" bank="092" value="110123456789" />);
    expect(input).toHaveValue('1101-2345-6789');
    rerender(<MaskedInput label="계좌번호" mask="bankAccount" value="110123456789" />);
    expect(input).toHaveValue('110123456789');
    expect(input).toHaveAttribute('placeholder', '110123456789');
  });
});

describe('QuantityInput 환산', () => {
  const UNITS = [
    { unit: 'EA', factor: 1 },
    { unit: 'BOX', factor: 40 },
  ];

  it('기준 단위가 아닌 단위면 칸 아래 기준 수량(aria-describedby)', () => {
    render(
      <Field label="실사 수량">
        <QuantityInput defaultValue={18} units={UNITS} unit="BOX" />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '실사 수량' });
    const base = document.querySelector('.tl-quantity-input__base')!;
    expect(base).toHaveTextContent('기준 수량 = 720EA');
    expect(input.getAttribute('aria-describedby')).toContain(base.id);
    fireEvent.click(screen.getByRole('button', { name: '수량 늘리기' }));
    expect(base).toHaveTextContent('760EA');
    expect(screen.getByText('19BOX, 기준 수량 760EA')).toBeInTheDocument();
  });

  it('기준 단위를 고르거나 factor가 없으면 기준 수량이 없다(지금과 같다)', () => {
    const { rerender } = render(<QuantityInput label="수량" defaultValue={18} units={UNITS} />);
    expect(document.querySelector('.tl-quantity-input__base')).toBeNull();
    fireEvent.change(screen.getByRole('combobox', { name: '단위' }), { target: { value: 'BOX' } });
    expect(document.querySelector('.tl-quantity-input__base')).toHaveTextContent('720EA');
    rerender(<QuantityInput label="수량" defaultValue={18} units={['EA', 'BOX']} unit="BOX" />);
    expect(document.querySelector('.tl-quantity-input__base')).toBeNull();
  });
});
