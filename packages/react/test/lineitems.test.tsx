// LineItemsEditor(PR-07): 줄 추가 · 삭제 · Enter 이동 · 합계 · 줄 오류 · 좁은 화면 카드
import { fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AmountInput,
  CodeSearch,
  Input,
  LineItemsEditor,
  QuantityInput,
} from '../src/core/index.js';

type Line = { key: number; name: string; qty: number | null; price: number | null };
let seq = 100;

function Harness({
  initial,
  minLines,
  onChange,
}: {
  initial: Line[];
  minLines?: number;
  onChange?: (lines: Line[]) => void;
}) {
  const [lines, setLines] = useState(initial);
  return (
    <LineItemsEditor
      caption="발주 품목"
      value={lines}
      onChange={(next) => {
        setLines(next);
        onChange?.(next);
      }}
      lineKey="key"
      newLine={() => ({ key: seq++, name: '', qty: null, price: null })}
      minLines={minLines}
      numbered
      summary
      lineError={(l) => (l.name && !l.qty ? '수량을 입력하세요' : null)}
      columns={[
        {
          key: 'name',
          header: '품목',
          render: (l, { label, update }) => (
            <Input size="sm" label={label} value={l.name} onChange={(v) => update({ name: v })} />
          ),
        },
        {
          key: 'qty',
          header: '수량',
          format: 'quantity',
          width: 'sm',
          render: (l, { label, update }) => (
            <AmountInput
              size="sm"
              label={label}
              value={l.qty}
              onChange={(v) => update({ qty: v })}
            />
          ),
        },
        {
          key: 'price',
          header: '단가',
          format: 'amount',
          width: 'md',
          render: (l, { label, update }) => (
            <AmountInput
              size="sm"
              label={label}
              value={l.price}
              onChange={(v) => update({ price: v })}
            />
          ),
        },
        {
          key: 'amount',
          header: '금액',
          width: 'md',
          format: 'amount',
          total: 'sum',
          value: (l) => (l.qty ?? 0) * (l.price ?? 0),
        },
      ]}
    />
  );
}

const TWO: Line[] = [
  { key: 1, name: '무염버터', qty: 24, price: 8_900 },
  { key: 2, name: '강력분', qty: 6, price: 31_500 },
];

afterEach(() => vi.unstubAllGlobals());

describe('LineItemsEditor', () => {
  it('칸 오류는 칸 아래 글자 + 칸 입력 aria-invalid · 설명, 필수 열은 머리에 표시, 합계 묶음 · 한글 금액', () => {
    render(
      <LineItemsEditor
        caption="품목"
        value={TWO}
        onChange={() => {}}
        lineKey="key"
        newLine={() => ({ key: seq++, name: '', qty: null, price: null })}
        cellError={(l, _i, key) => (key === 'price' && l.key === 2 ? '단가를 입력하세요' : null)}
        totals={[
          { label: '공급가액', value: '402,600' },
          { label: '세액', value: '40,260' },
        ]}
        footnote="금 사십사만이천팔백육십 원"
        columns={[
          {
            key: 'name',
            header: '품목',
            required: true,
            render: (l, { label, update }) => (
              <Input size="sm" label={label} value={l.name} onChange={(v) => update({ name: v })} />
            ),
          },
          {
            key: 'price',
            header: '단가',
            format: 'amount',
            render: (l, { label, update }) => (
              <AmountInput
                size="sm"
                label={label}
                value={l.price}
                onChange={(v) => update({ price: v })}
              />
            ),
          },
        ]}
      />,
    );
    const price = screen.getByRole('textbox', { name: '품목 2 단가' });
    expect(price).toHaveAttribute('aria-invalid', 'true');
    expect(price).toHaveAccessibleDescription('단가를 입력하세요');
    expect(screen.getByRole('textbox', { name: '품목 1 단가' })).not.toHaveAttribute(
      'aria-invalid',
    );
    expect(screen.getByRole('columnheader', { name: '품목(필수)' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '품목 1 품목' })).toBeRequired();
    expect(screen.getByText('공급가액').closest('div')).toHaveTextContent('402,600');
    expect(screen.getByText('금 사십사만이천팔백육십 원')).toBeInTheDocument();
  });

  it('줄 오류는 그 줄 첫 입력 칸의 설명으로 이어진다', () => {
    render(<Harness initial={[{ key: 9, name: '버터', qty: null, price: 100 }]} />);
    expect(screen.getByRole('textbox', { name: '발주 품목 1 품목' })).toHaveAccessibleDescription(
      '발주 품목 1 · 수량을 입력하세요',
    );
  });

  it('표가 안 들어가는 폭(640 이상)은 머리 없는 줄 모양, 칸 이름이 입력 위에', () => {
    const own = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 400,
    });
    try {
      render(<Harness initial={TWO} />);
      expect(screen.queryByRole('table')).toBeNull();
      const region = screen.getByRole('region', { name: '발주 품목' });
      expect(region).toHaveAttribute('data-mode', 'rows');
      expect(within(region).getAllByRole('listitem')[0]).toHaveTextContent('단가');
    } finally {
      if (own) Object.defineProperty(HTMLElement.prototype, 'clientWidth', own);
      else delete (HTMLElement.prototype as unknown as Record<string, unknown>)['clientWidth'];
    }
  });

  it('칸 이름은 "<표 이름> <행> <열>", 합계 행은 total 열을 더한다', () => {
    render(<Harness initial={TWO} />);
    expect(screen.getByRole('textbox', { name: '발주 품목 1 품목' })).toHaveValue('무염버터');
    expect(screen.getByRole('textbox', { name: '발주 품목 2 단가' })).toBeInTheDocument();
    const foot = screen.getByRole('table').querySelector('tfoot')!;
    // 24 × 8,900 + 6 × 31,500 = 402,600
    expect(foot).toHaveTextContent('합계');
    expect(foot).toHaveTextContent('402,600');
  });

  it('줄 추가는 뒤에 새 줄을 붙이고 새 줄 첫 칸으로 포커스', () => {
    const onChange = vi.fn();
    render(<Harness initial={TWO} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '줄 추가' }));
    expect(onChange.mock.calls.at(-1)![0]).toHaveLength(3);
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: '발주 품목 3 품목' }));
  });

  it('Enter는 다음 칸, 마지막 칸이면 줄 추가. 한글 조합 중 · Shift+Enter는 그대로', () => {
    render(<Harness initial={TWO} />);
    const first = screen.getByRole('textbox', { name: '발주 품목 1 품목' });
    first.focus();
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: '발주 품목 1 수량' }));
    fireEvent.keyDown(document.activeElement!, { key: 'Enter', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: '발주 품목 1 수량' }));
    fireEvent.keyDown(document.activeElement!, { key: 'Enter', isComposing: true });
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: '발주 품목 1 수량' }));
    const last = screen.getByRole('textbox', { name: '발주 품목 2 단가' });
    last.focus();
    fireEvent.keyDown(last, { key: 'Enter' });
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: '발주 품목 3 품목' }));
  });

  it('지우면 윗줄의 같은 칸(삭제 단추, 꺼져 있으면 첫 칸), 윗줄이 없으면 줄 추가 단추로 포커스', () => {
    const four: Line[] = [
      ...TWO,
      { key: 3, name: '생크림', qty: 40, price: 6_200 },
      { key: 4, name: '설탕', qty: 10, price: 1_500 },
    ];
    render(<Harness initial={four} minLines={2} />);
    fireEvent.click(screen.getByRole('button', { name: '발주 품목 3 삭제' }));
    expect(screen.getByRole('textbox', { name: '발주 품목 3 품목' })).toHaveValue('설탕');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '발주 품목 2 삭제' }));
    // 남은 줄이 minLines(2)면 삭제 단추가 꺼지고, 포커스는 윗줄 첫 칸
    fireEvent.click(screen.getByRole('button', { name: '발주 품목 3 삭제' }));
    expect(screen.getByRole('button', { name: '발주 품목 1 삭제' })).toBeDisabled();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: '발주 품목 2 품목' }));
  });

  it('첫 줄을 지우면 줄 추가 단추로, minLines 0이면 빈 상태 글자', () => {
    function Empty() {
      const [lines, setLines] = useState<Line[]>([TWO[0]!]);
      return (
        <LineItemsEditor
          caption="비목"
          value={lines}
          onChange={setLines}
          lineKey="key"
          minLines={0}
          newLine={() => ({ key: seq++, name: '', qty: null, price: null })}
          columns={[
            {
              key: 'name',
              header: '비목',
              render: (l, { label, update }) => (
                <Input
                  size="sm"
                  label={label}
                  value={l.name}
                  onChange={(v) => update({ name: v })}
                />
              ),
            },
          ]}
        />
      );
    }
    render(<Empty />);
    fireEvent.click(screen.getByRole('button', { name: '비목 1 삭제' }));
    expect(screen.getByText('아직 줄이 없습니다. 줄 추가로 시작하세요')).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '줄 추가' }));
  });

  it('lineError는 줄 아래 "<행>행 · 글자"로 읽힌다', () => {
    render(<Harness initial={TWO} />);
    fireEvent.change(screen.getByRole('textbox', { name: '발주 품목 2 수량' }), {
      target: { value: '' },
    });
    fireEvent.blur(screen.getByRole('textbox', { name: '발주 품목 2 수량' }));
    expect(screen.getByRole('status')).toHaveTextContent('발주 품목 2 · 수량을 입력하세요');
  });

  it('좁은 화면은 줄마다 카드, 칸 이름이 보이고 입력 이름이 그 글자를 담는다', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: false,
        media,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    render(<Harness initial={TWO} />);
    expect(screen.queryByRole('table')).toBeNull();
    const region = screen.getByRole('region', { name: '발주 품목' });
    const cards = within(region).getAllByRole('listitem');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('수량');
    expect(
      within(cards[0]!).getByRole('textbox', { name: '발주 품목 1 수량' }),
    ).toBeInTheDocument();
    // 읽기 칸(금액)은 숨은 열 이름과 함께 읽힌다
    expect(cards[0]).toHaveTextContent('금액 213,600');
    expect(region).toHaveTextContent('합계 · 금액402,600');
  });
});

describe('LineItemsEditor R-34', () => {
  type Staff = { key: number; person: string | null; rate: number | null };
  function StaffEditor() {
    const [lines, setLines] = useState<Staff[]>([{ key: 1, person: 'E-1', rate: 40 }]);
    return (
      <LineItemsEditor
        caption="참여 인력"
        value={lines}
        onChange={setLines}
        lineKey="key"
        addIcon="user-plus"
        addLabel="인력 추가"
        newLine={() => ({ key: seq++, person: null, rate: null })}
        columns={[
          {
            key: 'person',
            header: '직원',
            render: (l, { label, update }) => (
              <CodeSearch
                size="sm"
                label={label}
                options={[{ value: 'E-1', label: '김도윤' }]}
                value={l.person}
                onChange={(v) => update({ person: v })}
              />
            ),
          },
          {
            key: 'rate',
            header: '참여율',
            format: 'percent',
            render: (l, { label, update }) => (
              <QuantityInput
                size="sm"
                label={label}
                unit="%"
                value={l.rate}
                onChange={(v) => update({ rate: v })}
              />
            ),
          },
          {
            key: 'sum',
            header: '합계 참여율',
            format: 'percent',
            value: (l) => (l.rate ?? 0) + 70,
            tone: (l) => ((l.rate ?? 0) + 70 > 100 ? 'danger' : undefined),
          },
        ]}
      />
    );
  }

  it('Enter는 숨은 입력 · 보조 단추를 건너뛰고, 마지막 칸이 QuantityInput이어도 줄을 더한다', () => {
    render(<StaffEditor />);
    const person = screen.getByRole('combobox', { name: '참여 인력 1 직원' });
    person.focus();
    fireEvent.keyDown(person, { key: 'Enter' });
    const rate = screen.getByRole('textbox', { name: '참여 인력 1 참여율' });
    expect(document.activeElement).toBe(rate);
    fireEvent.keyDown(rate, { key: 'Enter' });
    expect(document.activeElement).toBe(screen.getByRole('combobox', { name: '참여 인력 2 직원' }));
  });

  it('읽기 칸 tone은 앞 아이콘 + 숨은 상태 글자, 줄 추가 아이콘을 바꾼다', () => {
    const { container } = render(<StaffEditor />);
    const cell = container.querySelector('.tl-line-items__tone');
    expect(cell).toHaveAttribute('data-tone', 'danger');
    expect(cell).toHaveTextContent('110.0% (확인 필요)');
    expect(
      screen
        .getByRole('button', { name: '인력 추가' })
        .querySelector('[data-icon="user-plus"], svg'),
    ).not.toBeNull();
  });
});

// 서비스 요청 R-35: 칸 오류가 붙은 줄의 정렬 · 줄이 없을 때 합계 묶음
describe('LineItemsEditor R-35', () => {
  function Quote({ initial = [] as Line[] }) {
    const [lines, setLines] = useState<Line[]>(initial);
    return (
      <LineItemsEditor
        caption="견적 품목"
        value={lines}
        onChange={setLines}
        lineKey="key"
        minLines={0}
        newLine={() => ({ key: seq++, name: '', qty: 1, price: 1_000 })}
        summary
        empty="견적 품목이 없습니다"
        totals={[{ label: '공급가액', value: '1,000원' }]}
        footnote="금 일천 원"
        footer={<span>견적 메모</span>}
        columns={[
          {
            key: 'name',
            header: '품목',
            mobile: 'title',
            render: (l, { label, update }) => (
              <Input size="sm" label={label} value={l.name} onChange={(v) => update({ name: v })} />
            ),
          },
          {
            key: 'amount',
            header: '금액',
            format: 'amount',
            total: 'sum',
            value: (l) => (l.qty ?? 0) * (l.price ?? 0),
          },
        ]}
      />
    );
  }

  it('표: 줄이 0개면 합계 행 · 합계 묶음 · 한글 금액을 그리지 않고, 줄을 더하면 생긴다. footer는 그대로', () => {
    const { container } = render(<Quote />);
    expect(screen.getByText('견적 품목이 없습니다')).toBeInTheDocument();
    expect(container.querySelector('tfoot')).toBeNull();
    expect(screen.queryByText('공급가액')).toBeNull();
    expect(screen.queryByText('금 일천 원')).toBeNull();
    expect(screen.getByText('견적 메모')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '줄 추가' }));
    expect(container.querySelector('tfoot')).toHaveTextContent('1,000');
    expect(screen.getByText('공급가액')).toBeInTheDocument();
    expect(screen.getByText('금 일천 원')).toBeInTheDocument();
  });

  it('카드(좁은 화면)도 줄이 0개면 합계 · 합계 묶음을 그리지 않는다', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: false,
        media,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    const { container } = render(<Quote />);
    const region = screen.getByRole('region', { name: '견적 품목' });
    expect(region).toHaveAttribute('data-mode', 'cards');
    expect(container.querySelector('.tl-line-items__card-totals')).toBeNull();
    expect(container.querySelector('.tl-line-items__totals-wrap')).toBeNull();
    expect(screen.queryByText('금 일천 원')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '줄 추가' }));
    expect(container.querySelector('.tl-line-items__card-totals')).toHaveTextContent(
      '합계 · 금액1,000',
    );
    expect(screen.getByText('공급가액')).toBeInTheDocument();
  });

  it('칸 오류 글자는 그 칸의 입력 바로 뒤에 있고, 같은 줄의 다른 칸 · 번호 · 삭제는 그대로 한 행', () => {
    render(
      <LineItemsEditor
        caption="입고 품목"
        value={[{ key: 1, name: '', qty: 0, price: 100 }] as Line[]}
        onChange={() => {}}
        lineKey="key"
        numbered
        newLine={() => ({ key: seq++, name: '', qty: null, price: null })}
        cellError={(l, _i, key) => (key === 'qty' && !l.qty ? '1 이상 입력하세요' : null)}
        columns={[
          {
            key: 'name',
            header: '품목',
            render: (l, { label, update }) => (
              <Input size="sm" label={label} value={l.name} onChange={(v) => update({ name: v })} />
            ),
          },
          {
            key: 'qty',
            header: '수량',
            format: 'quantity',
            render: (l, { label, update }) => (
              <AmountInput
                size="sm"
                label={label}
                value={l.qty}
                onChange={(v) => update({ qty: v })}
              />
            ),
          },
          { key: 'amount', header: '금액', format: 'amount', value: (l) => l.price },
        ]}
      />,
    );
    const qty = screen.getByRole('textbox', { name: '입고 품목 1 수량' });
    const cell = qty.closest('td')!;
    const error = within(cell).getByText('1 이상 입력하세요');
    expect(cell.lastElementChild).toBe(error);
    expect(qty).toHaveAccessibleDescription('1 이상 입력하세요');
    const row = cell.closest('tr')!;
    // 번호 · 품목 · 수량 · 금액 · 삭제가 한 행
    expect(row.children).toHaveLength(5);
    expect(within(row).getByRole('button', { name: '입고 품목 1 삭제' })).toBeInTheDocument();
  });

  it('CSS: 줄 칸 · 카드 머리는 위에 맞추고, 입력이 없는 칸은 입력 높이를 한 줄로 쓴다', () => {
    // 실제 위치는 브라우저에서 잰다(VRT · 측정). 여기서는 규칙이 빠지지 않았는지만 본다
    const css = readFileSync(
      join(process.cwd(), 'src/LineItemsEditor/LineItemsEditor.css'),
      'utf8',
    );
    const rule = (selector: string) =>
      new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(
        css,
      )?.[1] ?? '';
    expect(rule('.tl-line-items tbody .tl-line-items__cell')).toContain('vertical-align: top');
    expect(
      rule(".tl-line-items tbody .tl-line-items__cell:not([data-line-cell], [data-kind='empty'])"),
    ).toContain('line-height: var(--tl-density-control-height-sm)');
    expect(rule('.tl-line-items__card-head')).toContain('align-items: flex-start');
    expect(rule('.tl-line-items__value')).toContain(
      'min-height: var(--tl-density-control-height-sm)',
    );
  });
});
