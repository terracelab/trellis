// PR-30 데이터 화면: EmptyState kind · DataGrid 키보드 칸 이동 · 오류 · 열 묶음 · 저장 전 칸 · 행 찾아가기 ·
// priority low, FilterBar 칩 해제 · 좁은 화면 칩 줄 · 시트 안 칩 묶음 · grid searching · collapsible
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DataGrid,
  EmptyState,
  FilterBar,
  MultiSelect,
  Select,
  TrellisProvider,
} from '../src/core/index.js';

type Line = { code: string; name: string; wh: string; qty: number; price: number };
const LINES: Line[] = [
  { code: 'A-1', name: '무염버터', wh: 'main', qty: 24, price: 8_900 },
  { code: 'A-2', name: '강력분', wh: 'center', qty: 6, price: 31_500 },
  { code: 'A-3', name: '생크림', wh: 'main', qty: 40, price: 6_200 },
];
const COLUMNS = [
  { key: 'name', header: '품목' },
  { key: 'qty', header: '수량', format: 'quantity' as const, editable: true },
  { key: 'price', header: '단가', format: 'amount' as const, editable: true },
];

/** matchMedia 흉내: 쿼리 글자 → 맞는지 */
function media(match: (query: string) => boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: match(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const active = () => document.activeElement as HTMLElement;
const key = (k: string, init: Partial<KeyboardEventInit> = {}) =>
  fireEvent.keyDown(active(), { key: k, ...init });

describe('EmptyState kind', () => {
  it('종류마다 기본 아이콘 · 제목 · 설명. title을 주면 설명은 준 것만', () => {
    const { container } = render(
      <>
        <EmptyState kind="noResult" testID="a" />
        <EmptyState kind="forbidden" title="급여 정보를 볼 권한이 없습니다" testID="b" />
      </>,
    );
    expect(screen.getByTestId('a')).toHaveTextContent('조건에 맞는 항목이 없습니다');
    expect(screen.getByTestId('a')).toHaveTextContent('검색어나 필터를 바꿔 보세요');
    expect(screen.getByTestId('a')).toHaveAttribute('data-kind', 'noResult');
    expect(screen.getByTestId('b').querySelector('.tl-empty-state__description')).toBeNull();
    // 아이콘은 늘 있고 장식이다
    expect(container.querySelectorAll('.tl-empty-state__icon[aria-hidden]')).toHaveLength(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('error는 role="alert" + 요청 ID 한 줄, 영어 사전', () => {
    render(
      <TrellisProvider locale="en">
        <EmptyState
          kind="error"
          requestId="req-8f2a"
          action={<button type="button">Retry</button>}
        />
      </TrellisProvider>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Could not load the content');
    expect(alert).toHaveTextContent('Try again in a moment');
    expect(alert).toHaveTextContent('Request ID req-8f2a');
  });
});

describe('DataGrid 키보드 칸 이동', () => {
  it('편집 칸이 있으면 role="grid", 칸에 aria-colindex · 행에 aria-rowindex, Tab 정류장은 하나', () => {
    render(
      <DataGrid
        caption="발주 품목"
        columns={COLUMNS}
        rows={LINES}
        rowKey="code"
        onRowPress={() => {}}
        onCellChange={() => {}}
      />,
    );
    const grid = screen.getByRole('grid', { name: '발주 품목' });
    expect(grid).toHaveAttribute('aria-rowcount', '4');
    const rows = within(grid)
      .getAllByRole('row')
      .filter((r) => r.closest('tbody'));
    expect(rows[0]).toHaveAttribute('aria-rowindex', '2');
    // 누를 수 있는 행이어도 grid에서는 행이 아니라 칸이 정류장이다
    expect(rows[0]).not.toHaveAttribute('tabindex');
    expect(within(rows[0]!).getAllByRole('gridcell')[1]).toHaveAttribute('aria-colindex', '2');
    const stops = grid.querySelectorAll('tbody [tabindex="0"]');
    expect(stops).toHaveLength(1);
    // 처음 정류장은 첫 행의 첫 편집 칸
    expect(stops[0]).toHaveAccessibleName(/수량 수정/);
  });

  it('편집 칸이 없으면 table 그대로', () => {
    render(
      <DataGrid
        caption="재고"
        columns={[{ key: 'name', header: '품목' }]}
        rows={LINES}
        rowKey="code"
      />,
    );
    expect(screen.getByRole('table', { name: '재고' })).toBeInTheDocument();
    expect(screen.queryByRole('grid')).toBeNull();
  });

  it('방향키 · Home · End · Ctrl+Home · Ctrl+End · PageDown으로 칸을 옮긴다', () => {
    render(
      <DataGrid
        caption="발주 품목"
        columns={COLUMNS}
        rows={LINES}
        rowKey="code"
        onCellChange={() => {}}
      />,
    );
    const grid = screen.getByRole('grid');
    const start = grid.querySelector<HTMLElement>('tbody [tabindex="0"]')!;
    act(() => start.focus());
    key('ArrowRight');
    expect(active()).toHaveAccessibleName(/단가 수정/);
    expect(active()).toHaveAttribute('tabindex', '0');
    expect(start).toHaveAttribute('tabindex', '-1');
    key('ArrowRight');
    // 끝에서는 그대로
    expect(active()).toHaveAccessibleName(/단가 수정/);
    key('Home');
    // 단추가 없는 칸은 칸 자신이 포커스를 받는다
    expect(active().tagName).toBe('TD');
    expect(active()).toHaveTextContent('무염버터');
    key('ArrowDown');
    expect(active()).toHaveTextContent('강력분');
    key('End');
    expect(active()).toHaveAccessibleName('31,500, 단가 수정');
    key('ArrowUp');
    expect(active()).toHaveAccessibleName('8,900, 단가 수정');
    key('End', { ctrlKey: true });
    expect(active()).toHaveAccessibleName('6,200, 단가 수정');
    key('Home', { ctrlKey: true });
    expect(active()).toHaveTextContent('무염버터');
    key('PageDown');
    expect(active()).toHaveTextContent('생크림');
    // 한 글자 키는 아무 일도 하지 않는다
    const before = active();
    expect(key('j')).toBe(true);
    expect(active()).toBe(before);
  });

  it('Enter · F2로 편집을 열고 Enter 저장 · Esc 취소. 포커스는 칸으로 돌아온다', () => {
    const onCellChange = vi.fn();
    render(
      <DataGrid
        caption="발주 품목"
        columns={COLUMNS}
        rows={LINES}
        rowKey="code"
        onCellChange={onCellChange}
      />,
    );
    const start = screen.getByRole('grid').querySelector<HTMLElement>('tbody [tabindex="0"]')!;
    act(() => start.focus());
    // 표가 Enter를 먹는다(단추 기본 동작과 두 번 열리지 않게)
    expect(key('Enter')).toBe(false);
    const qty = screen.getByRole('textbox', { name: '수량' });
    fireEvent.change(qty, { target: { value: '30' } });
    fireEvent.keyDown(qty, { key: 'Enter' });
    expect(onCellChange).toHaveBeenCalledWith(LINES[0], 'qty', 30);
    expect(active()).toHaveAccessibleName(/수량 수정/);
    key('ArrowRight');
    key('F2');
    const price = screen.getByRole('textbox', { name: '단가' });
    fireEvent.change(price, { target: { value: '1' } });
    fireEvent.keyDown(price, { key: 'Escape' });
    expect(onCellChange).toHaveBeenCalledTimes(1);
    expect(active()).toHaveAccessibleName(/단가 수정/);
    // 편집 칸이 아닌 칸에서 F2는 아무 일도 하지 않는다
    key('Home');
    key('F2');
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('Tab은 다음 편집 칸, Shift+Tab은 이전 편집 칸. 마지막 칸에서는 표 밖으로 나간다', () => {
    render(
      <DataGrid
        caption="발주 품목"
        columns={COLUMNS}
        rows={LINES}
        rowKey="code"
        onCellChange={() => {}}
      />,
    );
    const start = screen.getByRole('grid').querySelector<HTMLElement>('tbody [tabindex="0"]')!;
    act(() => start.focus());
    expect(key('Tab')).toBe(false);
    expect(active()).toHaveAccessibleName('8,900, 단가 수정');
    key('Tab');
    // 다음 행의 첫 편집 칸(이름 칸은 건너뛴다)
    expect(active()).toHaveAccessibleName('6, 수량 수정');
    key('Tab', { shiftKey: true });
    expect(active()).toHaveAccessibleName('8,900, 단가 수정');
    key('End', { ctrlKey: true });
    // 마지막 편집 칸: 표가 막지 않는다(기본 동작으로 표 밖)
    expect(key('Tab')).toBe(true);
  });

  it('편집 중 Tab은 저장하고 다음 편집 칸으로', () => {
    const onCellChange = vi.fn();
    render(
      <DataGrid
        caption="발주 품목"
        columns={COLUMNS}
        rows={LINES}
        rowKey="code"
        onCellChange={onCellChange}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: /수량 수정/ })[0]!);
    const qty = screen.getByRole('textbox', { name: '수량' });
    act(() => qty.focus());
    fireEvent.change(qty, { target: { value: '12' } });
    expect(fireEvent.keyDown(qty, { key: 'Tab' })).toBe(false);
    // 포커스가 옮겨 가며 입력 칸이 blur → 저장
    fireEvent.blur(qty);
    expect(onCellChange).toHaveBeenCalledWith(LINES[0], 'qty', 12);
    expect(active()).toHaveAccessibleName(/단가 수정/);
  });

  it('편집 칸이 아닌 칸에서 Enter는 행 열기', () => {
    const onRowPress = vi.fn();
    render(
      <DataGrid
        caption="발주 품목"
        columns={COLUMNS}
        rows={LINES}
        rowKey="code"
        onRowPress={onRowPress}
        onCellChange={() => {}}
      />,
    );
    const start = screen.getByRole('grid').querySelector<HTMLElement>('tbody [tabindex="0"]')!;
    act(() => start.focus());
    key('Home');
    key('ArrowDown');
    key('Enter');
    expect(onRowPress).toHaveBeenCalledWith(LINES[1]);
  });

  it('선택 칸 · 행 행동 칸 단추도 칸 이동에 든다. 단추가 둘이면 좌우 방향키로 하나씩', () => {
    const onPress = vi.fn();
    render(
      <DataGrid
        caption="발주 품목"
        columns={COLUMNS}
        rows={LINES}
        rowKey="code"
        selectable
        onCellChange={() => {}}
        rowActions={(r) => (
          <>
            <button type="button" onClick={() => onPress(r.code)}>
              입고
            </button>
            <button type="button">더보기</button>
          </>
        )}
      />,
    );
    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-colcount', '5');
    // 행 행동 단추는 정류장이 아니다(-1)
    for (const b of within(grid).getAllByRole('button', { name: '더보기' }))
      expect(b).toHaveAttribute('tabindex', '-1');
    const start = grid.querySelector<HTMLElement>('tbody [tabindex="0"]')!;
    act(() => start.focus());
    key('Home');
    expect(active()).toHaveAccessibleName('무염버터 선택');
    key('End');
    expect(active()).toHaveAccessibleName('더보기');
    key('ArrowLeft');
    expect(active()).toHaveAccessibleName('입고');
    key('ArrowLeft');
    expect(active()).toHaveAccessibleName(/단가 수정/);
  });
});

describe('DataGrid 오류 · 빈 상태', () => {
  it('error: 행 대신 오류 블록(메시지 · 요청 ID · 다시 시도), 합계도 숨긴다', () => {
    const onRetry = vi.fn();
    const { container } = render(
      <DataGrid
        caption="발주 품목"
        columns={COLUMNS}
        rows={LINES}
        rowKey="code"
        summary
        error={{ requestId: 'req-31', onRetry }}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('목록을 불러오지 못했습니다');
    expect(alert).toHaveTextContent('요청 ID req-31');
    fireEvent.click(within(alert).getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('무염버터')).toBeNull();
    expect(container.querySelector('tfoot')).toBeNull();
  });

  it('empty 글자는 첫 문장이 제목, 나머지가 설명. filtered면 검색 결과 없음 모양', () => {
    const { container, rerender } = render(
      <DataGrid
        caption="전표"
        columns={[{ key: 'id', header: '전표 번호' }]}
        rows={[] as { id: string }[]}
        rowKey="id"
        empty="이번 달 전표가 없습니다. 전표 입력에서 추가하세요"
      />,
    );
    const block = () => container.querySelector('.tl-empty-state')!;
    expect(block()).toHaveAttribute('data-kind', 'empty');
    expect(block().querySelector('.tl-empty-state__title')).toHaveTextContent(
      /^이번 달 전표가 없습니다$/,
    );
    expect(block().querySelector('.tl-empty-state__description')).toHaveTextContent(
      '전표 입력에서 추가하세요',
    );
    rerender(
      <DataGrid
        caption="전표"
        columns={[{ key: 'id', header: '전표 번호' }]}
        rows={[] as { id: string }[]}
        rowKey="id"
        filtered
      />,
    );
    expect(block()).toHaveAttribute('data-kind', 'noResult');
    expect(block()).toHaveTextContent('조건에 맞는 항목이 없습니다');
  });

  it('좁은 화면 카드도 같은 오류 블록', () => {
    media(() => false);
    render(
      <DataGrid
        caption="발주 품목"
        columns={COLUMNS}
        rows={LINES}
        rowKey="code"
        error={{ message: '발주 품목을 불러오지 못했습니다', onRetry: () => {} }}
      />,
    );
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('발주 품목을 불러오지 못했습니다');
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });
});

describe('DataGrid 열 묶음 · 저장 전 칸 · 행 찾아가기 · priority', () => {
  it('groups: 머리 두 줄, 묶음은 colSpan, 묶음 없는 열은 rowSpan 2', () => {
    const { container } = render(
      <DataGrid
        caption="매입"
        rowKey="code"
        rows={LINES}
        groups={[{ key: 'money', header: '금액' }]}
        columns={[
          { key: 'name', header: '품목' },
          { key: 'qty', header: '수량', format: 'quantity', group: 'money' },
          { key: 'price', header: '단가', format: 'amount', group: 'money' },
        ]}
      />,
    );
    const heads = container.querySelectorAll('thead tr');
    expect(heads).toHaveLength(2);
    const group = within(heads[0] as HTMLElement)
      .getByText('금액')
      .closest('th')!;
    expect(group).toHaveAttribute('colspan', '2');
    expect(group).toHaveAttribute('scope', 'colgroup');
    expect(
      within(heads[0] as HTMLElement)
        .getByText('품목')
        .closest('th'),
    ).toHaveAttribute('rowspan', '2');
    expect(heads[1]!.querySelectorAll('th')).toHaveLength(2);
  });

  it('isDirty: 칸에 표시(data-dirty) + 숨은 글자, 편집 단추 이름에도', () => {
    const { container } = render(
      <DataGrid
        caption="발주 품목"
        columns={COLUMNS}
        rows={LINES}
        rowKey="code"
        onCellChange={() => {}}
        isDirty={(row, k) => row.code === 'A-2' && k === 'qty'}
      />,
    );
    expect(container.querySelectorAll('td[data-dirty]')).toHaveLength(1);
    expect(screen.getByRole('button', { name: '6, 수량 수정, 저장 전' })).toBeInTheDocument();
  });

  it('flashKey는 1초 동안 선택 바탕, scrollToKey는 그 행을 화면에 들인다', () => {
    vi.useFakeTimers();
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const { container, rerender } = render(
      <DataGrid caption="재고" columns={COLUMNS.slice(0, 1)} rows={LINES} rowKey="code" />,
    );
    rerender(
      <DataGrid
        caption="재고"
        columns={COLUMNS.slice(0, 1)}
        rows={LINES}
        rowKey="code"
        flashKey="A-3"
        scrollToKey="A-3"
      />,
    );
    const row = container.querySelector('tr[data-key="A-3"]')!;
    expect(row).toHaveAttribute('data-flash');
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.contexts[0]).toBe(row);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(row).not.toHaveAttribute('data-flash');
  });

  it('priority low 열은 폭 1024~1279에서 숨는다', () => {
    media((q) => /1024px|640px/.test(q));
    render(
      <DataGrid
        caption="재고"
        rows={LINES}
        rowKey="code"
        columns={[
          { key: 'name', header: '품목' },
          { key: 'wh', header: '창고', priority: 'low' },
          { key: 'qty', header: '수량', format: 'quantity' },
        ]}
      />,
    );
    const names = screen.getAllByRole('columnheader').map((h) => h.textContent);
    expect(names).toEqual(['품목', '수량']);
  });
});

const STATUS = [
  { value: 'all', label: '전체 상태' },
  { value: 'scheduled', label: '입고 예정' },
  { value: 'received', label: '입고 완료' },
];
const CHANNELS = [
  { value: 'own', label: '자사몰' },
  { value: 'open', label: '오픈마켓' },
];

describe('FilterBar 칩 해제', () => {
  it('기본값이 아닌 칩만 × 단추. 누르면 컨트롤 onChange에 기본값', () => {
    const onStatus = vi.fn();
    const onChannel = vi.fn();
    render(
      <FilterBar>
        <Select label="입고 상태" options={STATUS} value="scheduled" onChange={onStatus} />
        <MultiSelect label="채널" options={CHANNELS} value={['own']} onChange={onChannel} />
        <Select label="창고" options={STATUS} value="all" onChange={() => {}} />
      </FilterBar>,
    );
    fireEvent.click(screen.getByRole('button', { name: '입고 상태 조건 지우기' }));
    expect(onStatus).toHaveBeenCalledWith('all');
    // 해제 단추가 사라져도 포커스를 잃지 않게 칩의 컨트롤로 옮긴다
    expect(active()).toHaveClass('tl-select');
    fireEvent.click(screen.getByRole('button', { name: '채널 조건 지우기' }));
    expect(onChannel).toHaveBeenCalledWith([]);
    expect(screen.queryByRole('button', { name: '창고 조건 지우기' })).toBeNull();
  });

  it('onClearFilter가 있으면 그것을 name(없으면 label)으로 부른다', () => {
    const onClearFilter = vi.fn();
    render(
      <FilterBar onClearFilter={onClearFilter}>
        <Select label="입고 상태" name="status" options={STATUS} value="received" />
      </FilterBar>,
    );
    fireEvent.click(screen.getByRole('button', { name: '입고 상태 조건 지우기' }));
    expect(onClearFilter).toHaveBeenCalledWith('status');
  });
});

describe('FilterBar 좁은 화면', () => {
  function Narrow() {
    const [status, setStatus] = useState('all');
    const [channels, setChannels] = useState<string[]>([]);
    return (
      <FilterBar activeCount={0} search={<input aria-label="입고 검색" />}>
        <Select
          label="입고 상태"
          options={STATUS}
          value={status}
          onChange={(v) => setStatus(v ?? 'all')}
        />
        <MultiSelect label="채널" options={CHANNELS} value={channels} onChange={setChannels} />
      </FilterBar>
    );
  }

  it('칩 줄: "필터" 단추가 맨 앞, 칩은 그 조건의 시트를 바로 연다', async () => {
    media(() => false);
    render(<Narrow />);
    const chips = document.querySelector<HTMLElement>('.tl-filter-bar__chips')!;
    const buttons = within(chips).getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName('필터');
    await act(async () => {
      fireEvent.click(within(chips).getByRole('button', { name: '입고 상태 전체 상태' }));
    });
    const sheet = await screen.findByRole('dialog', { name: '입고 상태' });
    expect(within(sheet).getByRole('radio', { name: '입고 예정' })).toBeInTheDocument();
  });

  it('검색 조건 시트: 선택지가 6개 이하면 칩 묶음(radio · checkbox)으로 바로 고른다', async () => {
    media(() => false);
    render(<Narrow />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '필터' }));
    });
    const sheet = await screen.findByRole('dialog', { name: '검색 조건' });
    const status = within(sheet).getByRole('radiogroup', { name: '입고 상태' });
    fireEvent.click(within(status).getByRole('radio', { name: '입고 완료' }));
    expect(within(status).getByRole('radio', { name: '입고 완료' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    const channel = within(sheet).getByRole('group', { name: '채널' });
    fireEvent.click(within(channel).getByRole('checkbox', { name: '자사몰' }));
    fireEvent.click(within(channel).getByRole('checkbox', { name: '오픈마켓' }));
    expect(within(channel).getAllByRole('checkbox', { checked: true })).toHaveLength(2);
    // 시트 위에 시트를 열지 않는다
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    // 바뀐 값은 시트 뒤 칩 줄에도 바로 보이고 해제 단추가 생긴다(시트가 열린 동안 바깥은 숨겨져 있다)
    expect(
      screen.getByRole('button', { name: '입고 상태 조건 지우기', hidden: true }),
    ).toBeInTheDocument();
  });
});

describe('FilterBar grid: searching · collapsible', () => {
  it('searching이면 검색 단추가 로딩이고 Enter 검색도 막는다', () => {
    const onSearch = vi.fn();
    const { container } = render(
      <FilterBar layout="grid" onSearch={onSearch} searching search={<input aria-label="검색어" />}>
        <Select label="입고 상태" options={STATUS} value="all" onChange={() => {}} />
      </FilterBar>,
    );
    const form = container.querySelector('form')!;
    expect(form).toHaveAttribute('aria-busy', 'true');
    fireEvent.submit(form);
    expect(onSearch).not.toHaveBeenCalled();
    expect(container.querySelector('button[type="submit"]')).toHaveAttribute('aria-busy', 'true');
  });

  it('collapsible: 접으면 격자를 숨기고 적용한 조건을 칩으로 요약한다', () => {
    const onStatus = vi.fn();
    const { container } = render(
      <FilterBar
        layout="grid"
        collapsible
        onSearch={() => {}}
        search={<input aria-label="검색어" value="버터" readOnly />}
      >
        <Select label="입고 상태" options={STATUS} value="received" onChange={onStatus} />
        <Select label="창고" options={STATUS} value="all" onChange={() => {}} />
      </FilterBar>,
    );
    const toggle = screen.getByRole('button', { name: '조건 접기' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(container.querySelector('.tl-filter-bar__grid')).toHaveAttribute('hidden');
    const summary = screen.getByRole('group', { name: '적용한 조건' });
    expect(summary).toHaveTextContent('입고 상태입고 완료');
    expect(summary).toHaveTextContent('검색어버터');
    expect(summary).not.toHaveTextContent('창고');
    fireEvent.click(within(summary).getByRole('button', { name: '입고 상태 조건 지우기' }));
    expect(onStatus).toHaveBeenCalledWith('all');
    expect(screen.getByRole('button', { name: '조건 펼치기' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
