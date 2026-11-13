// 좁은 화면 모양(D-61): DataGrid 카드 · AppShell 탭바 · Tabs 넘침 표시
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AppShell,
  Button,
  CodeSearch,
  DataGrid,
  IconButton,
  Menu,
  Tabs,
} from '../src/core/index.js';

function narrow() {
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
}
afterEach(() => vi.unstubAllGlobals());

const COLUMNS = [
  { key: 'no', header: '문서 번호' },
  { key: 'date', header: '작성일', format: 'date' as const },
  { key: 'party', header: '거래처' },
  { key: 'qty', header: '수량', format: 'quantity' as const, unit: 'EA' },
  {
    key: 'amount',
    header: '금액',
    format: 'amount' as const,
    total: 'sum' as const,
    finance: true,
  },
  { key: 'memo', header: '비고' },
];
const ROWS = [
  {
    no: 'TI-0001',
    date: '2026-11-06',
    party: '대양상사',
    qty: 12,
    amount: 1_200_000,
    memo: '선결제',
  },
  { no: 'TI-0002', date: '2026-11-05', party: '한결물산', qty: 3, amount: -350_000, memo: '' },
];

describe('DataGrid 카드(좁은 화면)', () => {
  it('넓은 화면은 표, 좁은 화면은 카드 목록', () => {
    const { unmount } = render(
      <DataGrid caption="세금계산서" columns={COLUMNS} rows={ROWS} rowKey="no" />,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    unmount();
    narrow();
    render(<DataGrid caption="세금계산서" columns={COLUMNS} rows={ROWS} rowKey="no" summary />);
    expect(screen.queryByRole('table')).toBeNull();
    const region = screen.getByRole('region', { name: '세금계산서' });
    const items = within(region).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    // 제목 = 첫 글자 열, 오른쪽 = 첫 금액 열, 나머지 셋은 보조(비고는 넷째라 빠진다)
    expect(items[0]).toHaveTextContent('TI-0001');
    expect(items[0]!.querySelector('.tl-data-grid__card-trailing')).toHaveTextContent('1,200,000');
    expect(items[0]!.querySelector('.tl-data-grid__card-trailing')).toHaveAttribute(
      'data-finance',
      'income',
    );
    expect(items[0]!.querySelector('.tl-data-grid__card-meta')).toHaveTextContent('2026-11-06');
    expect(items[0]!.querySelector('.tl-data-grid__card-meta')).toHaveTextContent('수량');
    expect(items[0]!.querySelector('.tl-data-grid__card-meta')).not.toHaveTextContent('선결제');
    // 합계는 오른쪽 열의 합
    expect(region).toHaveTextContent('합계');
    expect(region.querySelector('.tl-data-grid__cards-foot')).toHaveTextContent('850,000');
  });

  it('column.mobile이 자리를 정하고, 행을 누르면 onRowPress, 선택은 체크박스', () => {
    narrow();
    const onRowPress = vi.fn();
    const onSelectedChange = vi.fn();
    render(
      <DataGrid
        caption="세금계산서"
        columns={[
          { ...COLUMNS[0]!, mobile: 'meta' },
          { ...COLUMNS[2]!, mobile: 'title' },
          { ...COLUMNS[4]!, mobile: 'hidden' },
          { ...COLUMNS[3]!, mobile: 'trailing' },
        ]}
        rows={ROWS}
        rowKey="no"
        selectable
        onRowPress={onRowPress}
        onSelectedChange={onSelectedChange}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items[0]!.querySelector('.tl-data-grid__card-title')).toHaveTextContent('대양상사');
    expect(items[0]!.querySelector('.tl-data-grid__card-trailing')).toHaveTextContent('12');
    expect(items[0]).not.toHaveTextContent('1,200,000');
    fireEvent.click(within(items[0]!).getByRole('checkbox', { name: 'TI-0001 선택' }));
    expect(onSelectedChange).toHaveBeenCalledWith(['TI-0001']);
    expect(onRowPress).not.toHaveBeenCalled();
    fireEvent.click(items[1]!.querySelector('.tl-data-grid__card-title')!);
    expect(onRowPress).toHaveBeenCalledWith(ROWS[1]);
    fireEvent.click(screen.getByRole('checkbox', { name: '전체 선택' }));
    expect(onSelectedChange).toHaveBeenLastCalledWith(['TI-0001', 'TI-0002']);
  });

  it("mobile='scroll'이면 좁은 화면에서도 표", () => {
    narrow();
    render(<DataGrid caption="재고" columns={COLUMNS} rows={ROWS} rowKey="no" mobile="scroll" />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

describe('AppShell 탭바', () => {
  it('탭 4개 + 전체, 지금 탭은 aria-current, 전체는 사이드바를 연다', async () => {
    const onTabPress = vi.fn();
    render(
      <AppShell
        brand="테라스원"
        sidebar={<nav aria-label="메뉴">메뉴</nav>}
        tabs={[
          { id: 'home', label: '홈', icon: 'house' },
          { id: 'todo', label: '할 일', icon: 'inbox', count: 16, countTone: 'danger' },
          { id: 'cash', label: '자금', icon: 'landmark' },
          { id: 'cal', label: '일정', icon: 'calendar' },
          { id: 'extra', label: '넘침', icon: 'list' },
        ]}
        activeTabId="todo"
        onTabPress={onTabPress}
      >
        본문
      </AppShell>,
    );
    const nav = screen.getByRole('navigation', { name: '주요 메뉴' });
    const buttons = within(nav).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['홈', '16할 일', '자금', '일정', '전체']);
    expect(within(nav).getByRole('button', { name: /할 일/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    fireEvent.click(within(nav).getByRole('button', { name: '자금' }));
    expect(onTabPress).toHaveBeenCalledWith('cash');
    const all = within(nav).getByRole('button', { name: '전체' });
    expect(all).toHaveAttribute('aria-expanded', 'false');
    await act(async () => {
      fireEvent.click(all);
    });
    expect(all).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Tabs 넘침', () => {
  it('넘치지 않으면 data-overflow가 없다', () => {
    render(
      <Tabs
        label="상태"
        items={[
          { value: 'a', label: '전체' },
          { value: 'b', label: '대기' },
        ]}
      />,
    );
    expect(screen.getByRole('tablist').closest('.tl-tabs')).not.toHaveAttribute('data-overflow');
  });
});

describe('Menu · CodeSearch 좁은 화면 시트(PR-10)', () => {
  it('Menu는 같은 트리거로 아래 시트를 열고, 고르면 닫은 뒤 실행한다', async () => {
    narrow();
    const onCopy = vi.fn();
    render(
      <Menu
        trigger={<IconButton icon="ellipsis" label="행 동작" />}
        items={[
          { id: 'edit', label: '수정', icon: 'pencil' },
          { id: 'copy', label: '복사', icon: 'copy', onSelect: onCopy },
          { type: 'separator' },
          { type: 'label', label: '위험' },
          { id: 'delete', label: '삭제', icon: 'trash-2', danger: true, disabled: true },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: '행 동작' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: '행 동작' });
    expect(within(dialog).getByRole('group', { name: '위험' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '삭제' })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button', { name: '복사' }));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('Button 글자가 시트 제목이 된다', async () => {
    narrow();
    render(
      <Menu
        trigger={<Button size="sm">더 보기</Button>}
        items={[{ id: 'a', label: '엑셀로 내보내기' }]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '더 보기' }));
    expect(await screen.findByRole('dialog', { name: '더 보기' })).toBeInTheDocument();
  });

  it('CodeSearch는 칸이 단추가 되고, 시트에서 코드 · 이름으로 찾아 고른다', async () => {
    narrow();
    const onChange = vi.fn();
    render(
      <CodeSearch
        label="거래처"
        onChange={onChange}
        options={[
          { value: 'C-0012', label: '대양상사', meta: '부산' },
          { value: 'C-0031', label: '한결물산', description: '대구 북구' },
          { value: 'C-0040', label: '누리식품' },
        ]}
      />,
    );
    const field = screen.getByRole('button', { name: '거래처 코드 또는 이름' });
    fireEvent.click(field);
    const dialog = await screen.findByRole('dialog', { name: '거래처' });
    const search = within(dialog).getByRole('searchbox', { name: '거래처' });
    fireEvent.change(search, { target: { value: '0031' } });
    expect(within(dialog).getAllByRole('radio')).toHaveLength(1);
    fireEvent.change(search, { target: { value: '대구' } });
    expect(within(dialog).getByRole('radio', { name: /한결물산/ })).toBeInTheDocument();
    fireEvent.change(search, { target: { value: '없는 거래처' } });
    expect(within(dialog).getByRole('status')).toHaveTextContent('검색 결과가 없습니다');
    fireEvent.change(search, { target: { value: '' } });
    fireEvent.click(within(dialog).getByRole('radio', { name: /누리식품/ }));
    expect(onChange).toHaveBeenLastCalledWith('C-0040');
    // 고른 값이 칸에 보이고, 지우기 단추가 생긴다
    expect(screen.getByRole('button', { name: '거래처 C-0040 누리식품' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '지우기' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    await act(async () => {});
  });
});

describe('CodeSearch 새로 등록 · 자유 입력 · 코드 숨김(PR-16)', () => {
  const PARTIES = [
    { value: 'p1', label: '대양상사' },
    { value: 'p2', label: '한결물산' },
  ];

  it('새로 등록: 친 글자로 onCreate, 값은 그대로', async () => {
    narrow();
    const onCreate = vi.fn();
    const onChange = vi.fn();
    render(
      <CodeSearch
        label="거래처"
        options={PARTIES}
        showCode={false}
        onCreate={onCreate}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /거래처/ }));
    const dialog = await screen.findByRole('dialog', { name: '거래처' });
    // 친 글자가 없으면 "새로 등록"
    expect(within(dialog).getByRole('button', { name: '새로 등록' })).toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: '누리식품' } });
    // 결과 0건이면 빈 글자 아래에 같은 줄
    expect(within(dialog).getByRole('status')).toHaveTextContent('검색 결과가 없습니다');
    fireEvent.click(within(dialog).getByRole('button', { name: '"누리식품" 새로 등록' }));
    expect(onCreate).toHaveBeenCalledWith('누리식품');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('코드 숨김: 칸과 목록에 이름만, value는 고유 키', async () => {
    narrow();
    const onChange = vi.fn();
    render(<CodeSearch label="거래처" options={PARTIES} showCode={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /거래처/ }));
    const dialog = await screen.findByRole('dialog', { name: '거래처' });
    expect(within(dialog).queryByText('p1')).toBeNull();
    fireEvent.click(within(dialog).getByRole('radio', { name: '한결물산' }));
    expect(onChange).toHaveBeenLastCalledWith('p2');
    expect(screen.getByRole('button', { name: '거래처 한결물산' })).toBeInTheDocument();
  });

  it('자유 입력: 목록에 없는 글자는 Enter · "그대로 쓰기"로 받고, 이름이 같으면 그 항목을 고른다', async () => {
    narrow();
    const onCustomValue = vi.fn();
    const onChange = vi.fn();
    render(
      <CodeSearch
        label="거래처"
        options={PARTIES}
        showCode={false}
        allowCustomValue
        onCustomValue={onCustomValue}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /거래처/ }));
    let dialog = await screen.findByRole('dialog', { name: '거래처' });
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: '동네 철물점' } });
    fireEvent.keyDown(within(dialog).getByRole('searchbox'), { key: 'Enter' });
    expect(onCustomValue).toHaveBeenLastCalledWith('동네 철물점');
    // 칸에는 그 글자가 남는다(value는 null)
    expect(screen.getByRole('button', { name: '거래처 동네 철물점' })).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /거래처 동네 철물점/ }));
    dialog = await screen.findByRole('dialog', { name: '거래처' });
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: '시장 식당' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '"시장 식당" 그대로 쓰기' }));
    expect(onCustomValue).toHaveBeenLastCalledWith('시장 식당');

    fireEvent.click(screen.getByRole('button', { name: /거래처 시장 식당/ }));
    dialog = await screen.findByRole('dialog', { name: '거래처' });
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: '대양상사' } });
    fireEvent.keyDown(within(dialog).getByRole('searchbox'), { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith('p1');
    await act(async () => {});
  });
});
