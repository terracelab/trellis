// PR-26 완성도 점검: 틀(scope · user · busy) · 사이드바 건수 · 표(행동 칸 · 머리 단위 · 세로선 · 두 줄 칸) · 조회 격자
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  AppShell,
  Button,
  DataGrid,
  DataGridLines,
  FilterBar,
  Input,
  SideNav,
} from '../src/core/index.js';

describe('AppShell scope · user · busy', () => {
  it('scope는 brand 다음, user는 바 맨 끝에 놓인다', () => {
    const { container } = render(
      <AppShell brand="테라스원" scope={<span>본사</span>} user={<span>김테라</span>}>
        본문
      </AppShell>,
    );
    const bar = container.querySelector('.tl-app-shell__bar')!;
    const kids = [...bar.querySelectorAll(':scope > div')].map((d) => d.className);
    expect(kids).toEqual(['tl-app-shell__brand', 'tl-app-shell__scope', 'tl-app-shell__actions']);
    expect(bar.querySelector('.tl-app-shell__actions > .tl-app-shell__user')?.textContent).toBe(
      '김테라',
    );
  });

  it('busy면 값 없는 진행 줄 + 본문 aria-busy, 끄면 사라진다', () => {
    const { rerender } = render(
      <AppShell brand="테라스원" busy>
        본문
      </AppShell>,
    );
    expect(screen.getByRole('progressbar', { name: '불러오는 중' })).not.toHaveAttribute(
      'aria-valuenow',
    );
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    rerender(<AppShell brand="테라스원">본문</AppShell>);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByRole('main')).not.toHaveAttribute('aria-busy');
  });
});

describe('SideNav 건수', () => {
  it('알약 없는 숫자 글자, 지연은 danger', () => {
    render(
      <SideNav
        sections={[
          {
            id: 'm',
            items: [
              { id: 'todo', label: '할 일', icon: 'inbox', count: 16 },
              { id: 'late', label: '연체', icon: 'clock', count: 3, countTone: 'danger' },
            ],
          },
        ]}
      />,
    );
    const counts = document.querySelectorAll('.tl-side-nav__count');
    expect([...counts].map((c) => c.textContent)).toEqual(['16', '3']);
    expect(counts[1]).toHaveAttribute('data-tone', 'danger');
  });
});

const ROWS = [
  {
    id: 'a',
    name: '서울분식',
    sub: '주기 10-27~11-02',
    billed: 4_524_640,
    paid: 0,
    adj: 0,
    due: 4_524_640,
  },
  {
    id: 'b',
    name: '할매국밥',
    sub: '주기 10-20~10-26',
    billed: 1_970_490,
    paid: 1_000_000,
    adj: 0,
    due: 970_490,
  },
];

describe('DataGrid PR-26', () => {
  const columns = [
    {
      key: 'name',
      header: '거래처',
      link: true,
      render: (r: (typeof ROWS)[number]) => <DataGridLines primary={r.name} secondary={r.sub} />,
    },
    { key: 'billed', header: '청구', format: 'amount' as const },
    { key: 'paid', header: '수금', format: 'amount' as const },
    { key: 'adj', header: '조정(원)', format: 'amount' as const },
    { key: 'due', header: '받을 금액', format: 'amount' as const, emphasis: true },
  ];

  it('amount 열 머리에 (원) 한 번, 이미 괄호가 있으면 붙이지 않는다', () => {
    render(<DataGrid caption="받을 금액" rowKey="id" rows={ROWS} columns={columns} />);
    const heads = screen.getAllByRole('columnheader').map((h) => h.textContent);
    expect(heads[1]).toBe('청구(원)단위 원');
    expect(heads[3]).toBe('조정(원)');
    // 칸에는 원을 붙이지 않는다
    expect(screen.getAllByRole('cell')[1]).toHaveTextContent(/^4,524,640$/);
  });

  it('저절로 붙는 단위 열이 4개를 넘으면 머리마다 붙이지 않는다(표 위에 한 번)', () => {
    const many = [
      columns[0]!,
      ...['a', 'b', 'c', 'd', 'e'].map((k) => ({ key: k, header: k, format: 'amount' as const })),
    ];
    render(<DataGrid caption="급여" rowKey="id" rows={[]} columns={many} />);
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      '거래처',
      'a',
      'b',
      'c',
      'd',
      'e',
    ]);
  });

  it('오른쪽 정렬 열 4개 이상이면 세로선(auto), rows로 끈다', () => {
    const { container, rerender } = render(
      <DataGrid caption="받을 금액" rowKey="id" rows={ROWS} columns={columns} />,
    );
    expect(container.querySelector('.tl-data-grid')).toHaveAttribute('data-dividers', 'all');
    rerender(
      <DataGrid caption="받을 금액" rowKey="id" rows={ROWS} columns={columns} dividers="rows" />,
    );
    expect(container.querySelector('.tl-data-grid')).toHaveAttribute('data-dividers', 'rows');
    rerender(
      <DataGrid caption="받을 금액" rowKey="id" rows={ROWS} columns={columns.slice(0, 3)} />,
    );
    expect(container.querySelector('.tl-data-grid')).toHaveAttribute('data-dividers', 'rows');
  });

  it('행 행동 칸을 눌러도 행이 열리지 않는다, 칸 밖은 열린다', () => {
    const onRowPress = vi.fn();
    const onPay = vi.fn();
    render(
      <DataGrid
        caption="받을 금액"
        rowKey="id"
        rows={ROWS}
        columns={columns}
        onRowPress={onRowPress}
        rowActions={(r) => (
          <Button size="sm" onPress={() => onPay(r.id)}>
            입금
          </Button>
        )}
      />,
    );
    expect(screen.getByRole('columnheader', { name: '행동' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '입금' })[1]!);
    expect(onPay).toHaveBeenCalledWith('b');
    expect(onRowPress).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('서울분식'));
    expect(onRowPress).toHaveBeenCalledWith(ROWS[0]);
  });

  it('링크 · 결과 열 표시와 두 줄 칸', () => {
    render(<DataGrid caption="받을 금액" rowKey="id" rows={ROWS} columns={columns} />);
    const first = screen.getAllByRole('row')[1]!;
    const cells = within(first).getAllByRole('cell');
    expect(cells[0]).toHaveAttribute('data-link');
    expect(cells[4]).toHaveAttribute('data-emphasis');
    expect(cells[0]!.querySelectorAll('.tl-data-grid__line')).toHaveLength(2);
    expect(cells[0]!.querySelector('[data-secondary]')).toHaveTextContent('주기 10-27~11-02');
  });
});

describe('FilterBar layout="grid"', () => {
  it('라벨 열 + 검색어 줄, Enter와 검색 단추가 onSearch', () => {
    const onSearch = vi.fn();
    render(
      <FilterBar
        layout="grid"
        onSearch={onSearch}
        onReset={() => {}}
        search={<Input type="search" aria-label="검색어" />}
      >
        <Input aria-label="거래처" label="거래처" />
      </FilterBar>,
    );
    const form = screen.getByRole('search');
    expect(form.tagName).toBe('FORM');
    const labels = [...form.querySelectorAll('.tl-filter-bar__field-label')].map(
      (l) => l.textContent,
    );
    expect(labels).toEqual(['거래처', '검색어']);
    fireEvent.click(screen.getByRole('button', { name: '검색' }));
    expect(onSearch).toHaveBeenCalledTimes(1);
    fireEvent.submit(form);
    expect(onSearch).toHaveBeenCalledTimes(2);
  });
});
