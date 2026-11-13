// DataGrid 업무 기능(PR-06): 칸 편집 · 열 필터 · 열 설정 · 묶음 소계 · 트리 · 가상 스크롤
import { formatAmount } from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataGrid } from '../src/core/index.js';
import {
  buildNodes,
  compareBy,
  filterNodes,
  groupNodes,
  leafRows,
  normalizeColumnState,
} from '../src/DataGrid/model.js';

type Line = { code: string; name: string; wh: string; qty: number; price: number; due: string };
const LINES: Line[] = [
  { code: 'A-1', name: '무염버터', wh: 'main', qty: 24, price: 8_900, due: '2026-11-12' },
  { code: 'A-2', name: '강력분', wh: 'center', qty: 6, price: 31_500, due: '2026-11-10' },
  { code: 'A-3', name: '생크림', wh: 'main', qty: 40, price: 6_200, due: '2026-11-11' },
];
const WAREHOUSES = [
  { value: 'main', label: '본사 창고' },
  { value: 'center', label: '물류센터' },
];

const bodyRows = () => {
  const table = screen.getByRole('table');
  return within(table)
    .getAllByRole('row')
    .filter((r) => r.closest('tbody'));
};
const headers = () => screen.getAllByRole('columnheader').map((h) => h.textContent ?? '');

describe('model', () => {
  it('저장된 열 설정을 지금 열에 맞춘다: 없어진 열 버림 · 새 열 뒤에 · 숨길 수 없는 열은 보임', () => {
    const cols = [
      { key: 'a', header: 'A', hideable: false },
      { key: 'b', header: 'B' },
      { key: 'c', header: 'C', hidden: true },
    ];
    expect(normalizeColumnState(cols, null)).toEqual({ order: ['a', 'b', 'c'], hidden: ['c'] });
    expect(
      normalizeColumnState(cols, { order: ['gone', 'b', 'a'], hidden: ['a', 'gone', 'b'] }),
    ).toEqual({ order: ['b', 'a', 'c'], hidden: ['b'] });
  });

  it('트리 필터는 맞는 행의 조상을 남기고, 합계는 잎만 더한다', () => {
    const rows = [
      {
        id: '1',
        name: '자산',
        v: 30,
        kids: [
          { id: '1-1', name: '현금', v: 10 },
          { id: '1-2', name: '예금', v: 20 },
        ],
      },
      { id: '2', name: '부채', v: 5 },
    ];
    const nodes = buildNodes(rows, (r) => r.id, 'kids');
    const kept = filterNodes(nodes, (r) => r.name === '예금');
    expect(kept.map((n) => n.key)).toEqual(['1']);
    expect(kept[0]!.children.map((n) => n.key)).toEqual(['1-2']);
    expect(leafRows(nodes).map((r) => r.id)).toEqual(['1-1', '1-2', '2']);
  });

  it('빈 값은 정렬 방향과 관계없이 맨 뒤, 묶음은 처음 나온 순서', () => {
    const col = { key: 'v', header: 'V' };
    const rows = [{ v: 'b' }, { v: null }, { v: 'a' }];
    expect([...rows].sort(compareBy(col, 'asc')).map((r) => r.v)).toEqual(['a', 'b', null]);
    expect([...rows].sort(compareBy(col, 'desc')).map((r) => r.v)).toEqual(['b', 'a', null]);
    const groups = groupNodes(
      buildNodes(
        [
          { id: '1', d: '영업' },
          { id: '2', d: '물류' },
          { id: '3', d: '영업' },
        ],
        (r) => r.id,
      ),
      { key: 'd', header: 'D' },
      () => false,
    ).filter((x) => x.kind === 'group');
    expect(groups.map((g) => g.key)).toEqual(['group:영업', 'group:물류']);
  });
});

describe('칸 편집', () => {
  const columns = [
    { key: 'name', header: '품목' },
    { key: 'wh', header: '창고', editable: true, options: WAREHOUSES },
    {
      key: 'qty',
      header: '수량',
      format: 'quantity' as const,
      editable: true,
      validate: (v: unknown) => (typeof v === 'number' && v >= 1 ? null : '1 이상 입력하세요'),
    },
    { key: 'price', header: '단가', format: 'amount' as const, editable: true },
    { key: 'due', header: '입고일', format: 'date' as const, editable: true },
  ];

  it('Enter 저장 · Esc 취소 · 틀린 값은 이유를 보이고 저장하지 않는다', () => {
    const onCellChange = vi.fn();
    render(
      <DataGrid
        caption="발주 품목"
        columns={columns}
        rows={LINES}
        rowKey="code"
        onCellChange={onCellChange}
      />,
    );
    // 값이 보이는 단추. 이름은 보이는 값 + "수량 수정"
    const trigger = screen.getAllByRole('button', { name: /수량 수정/ })[0]!;
    expect(trigger).toHaveTextContent('24');
    fireEvent.click(trigger);
    const input = screen.getByRole('textbox', { name: '수량' });
    fireEvent.change(input, { target: { value: '30' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCellChange).toHaveBeenCalledWith(LINES[0], 'qty', 30);
    expect(onCellChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('textbox', { name: '수량' })).toBeNull();
    // 저장 뒤 포커스는 칸 단추로 돌아온다
    expect(document.activeElement).toBe(screen.getAllByRole('button', { name: /수량 수정/ })[0]);

    // Esc는 저장하지 않는다
    fireEvent.click(screen.getAllByRole('button', { name: /단가 수정/ })[1]!);
    const price = screen.getByRole('textbox', { name: '단가' });
    expect(price).toHaveValue('31,500');
    fireEvent.change(price, { target: { value: '99' } });
    fireEvent.keyDown(price, { key: 'Escape' });
    expect(onCellChange).toHaveBeenCalledTimes(1);

    // validate가 돌려준 글자를 보이고 편집을 유지한다
    fireEvent.click(screen.getAllByRole('button', { name: /수량 수정/ })[2]!);
    const qty = screen.getByRole('textbox', { name: '수량' });
    fireEvent.change(qty, { target: { value: '0' } });
    fireEvent.keyDown(qty, { key: 'Enter' });
    expect(screen.getByRole('alert')).toHaveTextContent('1 이상 입력하세요');
    expect(qty).toHaveAttribute('aria-invalid', 'true');
    // 숫자가 아니면 숫자 안내
    fireEvent.change(qty, { target: { value: '열' } });
    fireEvent.keyDown(qty, { key: 'Enter' });
    expect(screen.getByRole('alert')).toHaveTextContent('숫자를 입력하세요');
    expect(onCellChange).toHaveBeenCalledTimes(1);
    // 틀린 채로 칸을 떠나면 원래 값으로 돌아간다
    fireEvent.blur(qty);
    expect(screen.queryByRole('textbox', { name: '수량' })).toBeNull();
    expect(onCellChange).toHaveBeenCalledTimes(1);
  });

  it('금액은 쉼표를 빼고 숫자로, 날짜는 숫자만 쳐도 YYYY-MM-DD로, 창고는 고르자마자 저장', () => {
    const onCellChange = vi.fn();
    render(
      <DataGrid
        caption="발주 품목"
        columns={columns}
        rows={LINES}
        rowKey="code"
        onCellChange={onCellChange}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: /단가 수정/ })[0]!);
    const price = screen.getByRole('textbox', { name: '단가' });
    fireEvent.change(price, { target: { value: '12,000원' } });
    fireEvent.blur(price);
    expect(onCellChange).toHaveBeenLastCalledWith(LINES[0], 'price', 12_000);

    fireEvent.click(screen.getAllByRole('button', { name: /입고일 수정/ })[0]!);
    const due = screen.getByRole('textbox', { name: '입고일' });
    fireEvent.change(due, { target: { value: '20261120' } });
    expect(due).toHaveValue('2026-11-20');
    fireEvent.keyDown(due, { key: 'Enter' });
    expect(onCellChange).toHaveBeenLastCalledWith(LINES[0], 'due', '2026-11-20');

    // 창고 칸은 label로 보이고, 고르면 바로 저장
    const wh = screen.getAllByRole('button', { name: /창고 수정/ })[1]!;
    expect(wh).toHaveTextContent('물류센터');
    fireEvent.click(wh);
    fireEvent.change(screen.getByRole('combobox', { name: '창고' }), { target: { value: 'main' } });
    expect(onCellChange).toHaveBeenLastCalledWith(LINES[1], 'wh', 'main');
    expect(onCellChange).toHaveBeenCalledTimes(3);
  });

  it('편집 단추를 눌러도 행 열기(onRowPress)는 부르지 않는다', () => {
    const onRowPress = vi.fn();
    render(
      <DataGrid
        caption="발주 품목"
        columns={columns}
        rows={LINES}
        rowKey="code"
        onCellChange={() => {}}
        onRowPress={onRowPress}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: /수량 수정/ })[0]!);
    const input = screen.getByRole('textbox', { name: '수량' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onRowPress).not.toHaveBeenCalled();
  });
});

describe('열 필터', () => {
  const columns = [
    { key: 'name', header: '품목', filter: 'text' as const },
    { key: 'wh', header: '창고', filter: 'values' as const, options: WAREHOUSES },
    { key: 'qty', header: '수량', format: 'quantity' as const, total: 'sum' as const },
  ];

  it('글자 필터 · 값 필터가 행을 거르고, 합계도 걸러진 행만 더한다', () => {
    const onFiltersChange = vi.fn();
    render(
      <DataGrid
        caption="재고"
        columns={columns}
        rows={LINES}
        rowKey="code"
        summary
        onFiltersChange={onFiltersChange}
      />,
    );
    expect(bodyRows()).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: '품목 필터' }));
    fireEvent.change(screen.getByRole('searchbox', { name: '포함하는 글자' }), {
      target: { value: '버터' },
    });
    expect(onFiltersChange).toHaveBeenLastCalledWith({ name: '버터' });
    expect(bodyRows()).toHaveLength(1);
    // 걸린 필터는 단추 이름이 바뀐다(색만으로 알리지 않는다)
    expect(screen.getByRole('button', { name: '품목 필터 적용됨' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '필터 지우기' }));
    expect(bodyRows()).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: '창고 필터' }));
    // 고를 거리는 options label + 건수
    const center = screen.getByRole('checkbox', { name: /물류센터/ });
    expect(screen.getByRole('checkbox', { name: /본사 창고/ })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: /본사 창고/ }));
    expect(onFiltersChange).toHaveBeenLastCalledWith({ wh: ['center'] });
    expect(center).toBeChecked();
    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByRole('table').querySelector('tfoot')).toHaveTextContent('6');
  });

  it('맞는 행이 없으면 "조건에 맞는 항목이 없습니다"와 필터 모두 지우기', () => {
    render(
      <DataGrid
        caption="재고"
        columns={columns}
        rows={LINES}
        rowKey="code"
        defaultFilters={{ name: '없는 품목' }}
      />,
    );
    expect(screen.getByText('조건에 맞는 항목이 없습니다')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '필터 모두 지우기' }));
    expect(bodyRows()).toHaveLength(3);
  });

  it('제어 필터(filters)는 부모 값대로 거른다', () => {
    const { rerender } = render(
      <DataGrid
        caption="재고"
        columns={columns}
        rows={LINES}
        rowKey="code"
        filters={{ wh: ['main'] }}
      />,
    );
    expect(bodyRows()).toHaveLength(2);
    rerender(<DataGrid caption="재고" columns={columns} rows={LINES} rowKey="code" filters={{}} />);
    expect(bodyRows()).toHaveLength(3);
  });
});

describe('열 설정', () => {
  const columns = [
    { key: 'name', header: '품목', hideable: false },
    { key: 'wh', header: '창고', options: WAREHOUSES },
    { key: 'qty', header: '수량', format: 'quantity' as const },
    { key: 'due', header: '입고일', format: 'date' as const, hidden: true },
  ];
  beforeEach(() => window.localStorage.clear());

  it('숨김 · 순서를 바꾸고 이 기기에 저장한다. 다시 그리면 저장한 대로, 처음 상태로 되돌린다', async () => {
    const onColumnStateChange = vi.fn();
    const { unmount } = render(
      <DataGrid
        caption="재고"
        columns={columns}
        rows={LINES}
        rowKey="code"
        columnSettings={{ storageKey: 'test.stock' }}
        onColumnStateChange={onColumnStateChange}
      />,
    );
    // 처음엔 hidden 열이 숨고, 끝에 열 설정 단추 머리 칸
    expect(headers()).toEqual(['품목', '창고', '수량', '']);
    fireEvent.click(screen.getByRole('button', { name: '열 설정' }));
    // 숨길 수 없는 열은 끌 수 없다
    expect(screen.getByRole('checkbox', { name: '품목' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: '입고일' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '창고' }));
    expect(headers()).toEqual(['품목', '수량', '입고일', '']);
    // 순서는 숨긴 열까지 센다: 수량은 한 번 올리면 (숨긴) 창고 위, 두 번 올리면 맨 위
    fireEvent.click(screen.getByRole('button', { name: '수량 위로' }));
    expect(headers()).toEqual(['품목', '수량', '입고일', '']);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '수량 위로' }));
    fireEvent.click(screen.getByRole('button', { name: '수량 위로' }));
    expect(headers()).toEqual(['수량', '품목', '입고일', '']);
    // 옮긴 뒤 같은 열의 단추에 포커스(맨 위라 위로가 꺼지면 아래로)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '수량 아래로' }));
    expect(onColumnStateChange).toHaveBeenLastCalledWith({
      order: ['qty', 'name', 'wh', 'due'],
      hidden: ['wh'],
    });
    expect(JSON.parse(window.localStorage.getItem('trellis.dataGrid.test.stock')!)).toEqual({
      order: ['qty', 'name', 'wh', 'due'],
      hidden: ['wh'],
    });
    unmount();

    render(
      <DataGrid
        caption="재고"
        columns={columns}
        rows={LINES}
        rowKey="code"
        columnSettings={{ storageKey: 'test.stock' }}
      />,
    );
    await act(async () => {});
    expect(headers()).toEqual(['수량', '품목', '입고일', '']);
    fireEvent.click(screen.getByRole('button', { name: '열 설정' }));
    fireEvent.click(screen.getByRole('button', { name: '처음 상태로' }));
    expect(headers()).toEqual(['품목', '창고', '수량', '']);
    expect(window.localStorage.getItem('trellis.dataGrid.test.stock')).toBeNull();
  });
});

describe('묶음 소계', () => {
  const rows = [
    { id: '1', dept: '영업팀', item: '식대', amount: 184_000 },
    { id: '2', dept: '물류팀', item: '점검', amount: 420_000 },
    { id: '3', dept: '영업팀', item: '교통비', amount: 236_500 },
  ];
  const columns = [
    { key: 'item', header: '내용' },
    { key: 'dept', header: '부서' },
    { key: 'amount', header: '금액', format: 'amount' as const, total: 'sum' as const },
  ];

  it('묶음 머리에 건수 · 소계, 머리를 누르면 접힌다. 합계는 전체', () => {
    render(
      <DataGrid caption="경비" columns={columns} rows={rows} rowKey="id" groupBy="dept" summary />,
    );
    const sales = screen.getByRole('button', { name: /영업팀/ });
    expect(sales).toHaveAttribute('aria-expanded', 'true');
    expect(sales).toHaveTextContent('2건');
    const head = sales.closest('tr')!;
    expect(head).toHaveTextContent('소계 420,500');
    expect(bodyRows()).toHaveLength(5);
    fireEvent.click(sales);
    expect(sales).toHaveAttribute('aria-expanded', 'false');
    expect(bodyRows()).toHaveLength(3);
    expect(screen.getByRole('table').querySelector('tfoot')).toHaveTextContent('840,500');
  });

  it('소계 0은 데이터 행이 0을 그리는 대로: 0을 비우는 열은 빈칸, 서식만 있는 열은 0', () => {
    const ledger = [
      { id: 'a', group: '자산', name: '현금', debit: 1_000, credit: 0, count: 0 },
      { id: 'b', group: '자산', name: '예금', debit: 2_000, credit: 0, count: 0 },
      { id: 'c', group: '부채', name: '외상매입금', debit: 0, credit: 500, count: 1 },
    ];
    render(
      <DataGrid
        caption="시산표"
        rows={ledger}
        rowKey="id"
        groupBy="group"
        columns={[
          { key: 'group', header: '구분' },
          { key: 'name', header: '계정과목' },
          {
            key: 'debit',
            header: '차변',
            format: 'amount',
            total: 'sum',
            render: (r) => (r.debit ? formatAmount(r.debit) : null),
          },
          {
            key: 'credit',
            header: '대변',
            format: 'amount',
            total: 'sum',
            render: (r) => (r.credit ? formatAmount(r.credit) : null),
          },
          { key: 'count', header: '건수', format: 'number', total: 'sum' },
        ]}
      />,
    );
    const head = screen.getByRole('button', { name: /자산/ }).closest('tr')!;
    const cells = [...head.querySelectorAll('td')].map((td) => td.textContent);
    // [구분 · 계정과목(합친 칸)] · 차변 3,000 · 대변 빈칸(데이터 행도 빈칸) · 건수 0(데이터 행도 0)
    expect(cells.slice(1)).toEqual(['소계 3,000', '', '소계 0']);
    const row = bodyRows().find((r) => r.textContent?.includes('현금'))!;
    expect([...row.querySelectorAll('td')].map((td) => td.textContent).slice(2)).toEqual([
      '1,000',
      '',
      '0',
    ]);
  });

  it('묶음 접기 단추의 높이는 밀도의 가장 작은 컨트롤 높이(touch 44)', () => {
    // jsdom 환경이라 파일 주소 대신 패키지 폴더(테스트 실행 위치)에서 읽는다
    const css = readFileSync(join(process.cwd(), 'src/DataGrid/DataGrid.css'), 'utf8');
    const rule = /\.tl-data-grid__group-toggle \{[^}]*\}/.exec(css)?.[0] ?? '';
    expect(rule).toContain('min-height: var(--tl-density-control-height-xs)');
    const tokens = readFileSync(join(process.cwd(), '../tokens/dist/css/tokens.css'), 'utf8');
    const touch = /\[data-density="touch"\] \{[^}]*\}/.exec(tokens)?.[0] ?? '';
    expect(touch).toContain('--tl-density-control-height-xs: 44px');
  });
});

describe('트리 행', () => {
  const rows = [
    {
      code: '1000',
      name: '자산',
      balance: 30,
      children: [
        { code: '1100', name: '현금', balance: 10 },
        { code: '1200', name: '예금', balance: 20 },
      ],
    },
    { code: '2000', name: '부채', balance: 5 },
  ];
  const columns = [
    { key: 'name', header: '계정' },
    { key: 'balance', header: '잔액', format: 'amount' as const, total: 'sum' as const },
  ];

  it('펼침 단추로 자식 행을 보이고, 합계는 잎 행만 더한다', () => {
    render(
      <DataGrid
        caption="계정"
        columns={columns}
        rows={rows}
        rowKey="code"
        childrenKey="children"
        summary
      />,
    );
    expect(bodyRows()).toHaveLength(2);
    const toggle = screen.getByRole('button', { name: '자산 펼치기' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: '자산 접기' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(bodyRows().map((r) => r.textContent)).toEqual(['자산30', '현금10', '예금20', '부채5']);
    // 10 + 20 + 5. 부모 30을 다시 더하지 않는다
    expect(screen.getByRole('table').querySelector('tfoot')).toHaveTextContent('35');
  });

  it("defaultExpanded='all'은 모두 펼친 채로 시작한다", () => {
    render(
      <DataGrid
        caption="계정"
        columns={columns}
        rows={rows}
        rowKey="code"
        childrenKey="children"
        defaultExpanded="all"
      />,
    );
    expect(bodyRows()).toHaveLength(4);
  });
});

describe('가상 스크롤', () => {
  // jsdom은 레이아웃이 없어 높이가 0이다. 스크롤 상자(clientHeight) 480, 머리(offsetHeight) 32로 둔다
  // HTMLElement.prototype에 덮어쓰고, 끝나면 원래 설명자(없었으면 삭제)로 되돌린다
  const props = ['clientHeight', 'offsetHeight'] as const;
  const own = props.map((p) => Object.getOwnPropertyDescriptor(HTMLElement.prototype, p));
  beforeEach(() => {
    for (const p of props)
      Object.defineProperty(HTMLElement.prototype, p, {
        configurable: true,
        get(this: HTMLElement) {
          return this.classList.contains('tl-data-grid') ? 480 : 32;
        },
      });
  });
  afterEach(() => {
    props.forEach((p, i) => {
      const d = own[i];
      if (d) Object.defineProperty(HTMLElement.prototype, p, d);
      else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[p];
    });
  });

  const rows = Array.from({ length: 1000 }, (_, i) => ({
    id: `R-${i}`,
    name: `품목 ${i}`,
    qty: i,
  }));
  const columns = [
    { key: 'name', header: '품목', sortable: true },
    { key: 'qty', header: '수량', format: 'quantity' as const },
  ];

  it('1000행이라도 보이는 줄만 그리고, 전체 줄 수는 aria-rowcount로 알린다', () => {
    render(<DataGrid caption="재고" columns={columns} rows={rows} rowKey="id" height="fill" />);
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-rowcount', '1001');
    const drawn = table.querySelectorAll('tbody tr.tl-data-grid__row');
    expect(drawn.length).toBeGreaterThan(0);
    expect(drawn.length).toBeLessThan(100);
    expect(drawn[0]).toHaveAttribute('aria-rowindex', '2');
  });

  it('200행 이하이거나 height가 auto면 모두 그린다', () => {
    render(
      <DataGrid
        caption="재고"
        columns={columns}
        rows={rows.slice(0, 150)}
        rowKey="id"
        height="fill"
      />,
    );
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(150);
  });
});

afterEach(() => vi.restoreAllMocks());

describe('좁은 화면 카드', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: false,
        media,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('묶음은 카드 사이 머리(건수 · 소계)로, 걸린 필터는 목록 위 한 줄로 보인다', () => {
    const rows = [
      { id: '1', dept: '영업팀', item: '식대', amount: 184_000 },
      { id: '2', dept: '물류팀', item: '점검', amount: 420_000 },
      { id: '3', dept: '영업팀', item: '교통비', amount: 236_500 },
    ];
    render(
      <DataGrid
        caption="경비"
        rows={rows}
        rowKey="id"
        groupBy="dept"
        defaultFilters={{ item: '비' }}
        columns={[
          { key: 'item', header: '내용', filter: 'text' },
          { key: 'dept', header: '부서' },
          { key: 'amount', header: '금액', format: 'amount', total: 'sum' },
        ]}
      />,
    );
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByText('필터 1개 적용')).toBeInTheDocument();
    const head = screen.getByRole('button', { name: /영업팀/ });
    expect(head).toHaveTextContent('1건');
    expect(head.closest('li')).toHaveTextContent('소계 236,500');
    fireEvent.click(screen.getByRole('button', { name: '필터 모두 지우기' }));
    expect(screen.getByRole('button', { name: /영업팀/ })).toHaveTextContent('2건');
  });
});
