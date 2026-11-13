// 블록에서 나온 업무 컴포넌트(PR-08): MonthCalendar · KanbanBoard · FolderTree
import {
  FolderTreeContract,
  KanbanBoardContract,
  MonthCalendarContract,
  type FolderTreeNode,
  type KanbanCardItem,
  type KanbanColumn,
  type MonthCalendarEvent,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FolderTree, KanbanBoard, MonthCalendar, TrellisProvider } from '../src/core/index.js';

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

describe('contract parity', () => {
  it('displayName === contract.name, props에 id · testID', () => {
    const pairs: [{ displayName?: string }, { name: string; props: object }][] = [
      [MonthCalendar, MonthCalendarContract],
      [KanbanBoard, KanbanBoardContract],
      [FolderTree, FolderTreeContract],
    ];
    for (const [component, contract] of pairs) {
      expect(component.displayName).toBe(contract.name);
      expect(Object.keys(contract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
    }
  });
});

// ── MonthCalendar ──
const EVENTS: MonthCalendarEvent[] = [
  { id: 'a', date: '2026-11-06', title: '주간 회의', start: '09:00', end: '10:00' },
  { id: 'b', date: '2026-11-06', title: '계약 검토', start: '10:30', color: 'series-2' },
  { id: 'c', date: '2026-11-06', title: '오후 반차', start: '13:00', color: 'series-4' },
  { id: 'd', date: '2026-11-06', title: '보안 교육', start: '16:00', color: 'series-3' },
  { id: 'e', date: '2026-11-06', title: '신고 마감', color: 'series-5' },
  { id: 'f', date: '2026-11-18', endDate: '2026-11-20', title: '부산 출장', color: 'series-4' },
  { id: 'g', date: '2026-12-01', title: '12월 첫 회의', start: '09:30' },
];

const day = (n: string) => document.querySelector<HTMLElement>(`[data-date="${n}"]`)!;

describe('MonthCalendar', () => {
  it('일요일 시작 격자 · 오늘 · 고른 날 · 칸마다 3건 + "N건 더" · 종일이 먼저', () => {
    render(
      <MonthCalendar
        label="팀 일정"
        events={EVENTS}
        today="2026-11-06"
        defaultSelected="2026-11-06"
      />,
    );
    const grid = screen.getByRole('grid', { name: '팀 일정 2026년 11월' });
    const headers = within(grid).getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual(['일', '월', '화', '수', '목', '금', '토']);
    // 11월 1일은 일요일 → 첫 칸, 5주
    expect(within(grid).getAllByRole('row')).toHaveLength(6);
    expect(within(grid).getAllByRole('gridcell')[0]).toHaveTextContent(/^1/);
    const cell = day('2026-11-06').closest('[role="gridcell"]')!;
    expect(cell).toHaveAttribute('aria-selected', 'true');
    expect(cell).toHaveAttribute('data-today');
    expect(day('2026-11-06')).toHaveAccessibleName('6일 금요일, 오늘, 선택됨, 일정 5건');
    const chips = cell.querySelectorAll('.tl-month-calendar__chip');
    expect(chips).toHaveLength(3);
    expect(chips[0]).toHaveTextContent('신고 마감');
    expect(cell).toHaveTextContent('2건 더');
    // 여러 날 일정은 사이의 날마다
    for (const d of ['2026-11-18', '2026-11-19', '2026-11-20'])
      expect(day(d).closest('[role="gridcell"]')).toHaveTextContent('부산 출장');
    expect(screen.getByText('일정 6건')).toBeInTheDocument();
  });

  it('화살표 · Home · End · PageDown으로 옮겨 다니고 Enter로 고른다. 달을 넘으면 달이 바뀐다', () => {
    const onSelectDay = vi.fn();
    const onMonthChange = vi.fn();
    render(
      <MonthCalendar
        events={EVENTS}
        today="2026-11-06"
        defaultSelected="2026-11-06"
        onSelectDay={onSelectDay}
        onMonthChange={onMonthChange}
      />,
    );
    const start = day('2026-11-06');
    expect(start).toHaveAttribute('tabindex', '0');
    expect(day('2026-11-05')).toHaveAttribute('tabindex', '-1');
    start.focus();
    fireEvent.keyDown(start, { key: 'ArrowRight' });
    expect(day('2026-11-07')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(day('2026-11-14')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(day('2026-11-08')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(day('2026-11-14')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(day('2026-11-06')).toHaveFocus();
    fireEvent.click(document.activeElement!);
    expect(onSelectDay).toHaveBeenLastCalledWith('2026-11-06');
    fireEvent.keyDown(document.activeElement!, { key: 'PageDown' });
    expect(onMonthChange).toHaveBeenLastCalledWith('2026-12');
    expect(screen.getByRole('grid', { name: '2026년 12월' })).toBeInTheDocument();
    expect(day('2026-12-06')).toHaveFocus();
    // 12월 31일에서 오른쪽 → 1월
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    for (let i = 0; i < 4; i += 1) fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toHaveAttribute('data-date', '2027-01-09');
    expect(onMonthChange).toHaveBeenLastCalledWith('2027-01');
  });

  it('이전 · 다음 달 단추와 오늘 단추', () => {
    const onSelectDay = vi.fn();
    render(<MonthCalendar events={EVENTS} today="2026-11-06" onSelectDay={onSelectDay} />);
    fireEvent.click(screen.getByRole('button', { name: '다음 달' }));
    expect(screen.getByRole('grid', { name: '2026년 12월' })).toBeInTheDocument();
    expect(day('2026-12-01').closest('[role="gridcell"]')).toHaveTextContent('12월 첫 회의');
    fireEvent.click(screen.getByRole('button', { name: '이전 달' }));
    fireEvent.click(screen.getByRole('button', { name: '이전 달' }));
    expect(screen.getByRole('grid', { name: '2026년 10월' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '오늘' }));
    expect(screen.getByRole('grid', { name: '2026년 11월' })).toBeInTheDocument();
    expect(onSelectDay).toHaveBeenLastCalledWith('2026-11-06');
  });

  it('onEventPress가 있으면 칩이 버튼, 고른 칸의 칩만 탭 순서에, Esc로 날에 돌아온다', () => {
    const onEventPress = vi.fn();
    render(
      <MonthCalendar
        events={EVENTS}
        today="2026-11-06"
        defaultSelected="2026-11-06"
        onEventPress={onEventPress}
      />,
    );
    const chip = screen.getByRole('button', { name: '09:00~10:00 주간 회의' });
    expect(chip).toHaveAttribute('tabindex', '0');
    for (const other of screen.getAllByRole('button', { name: '종일 부산 출장' }))
      expect(other).toHaveAttribute('tabindex', '-1');
    fireEvent.click(chip);
    expect(onEventPress).toHaveBeenCalledWith(EVENTS[0]);
    chip.focus();
    fireEvent.keyDown(chip, { key: 'Escape' });
    expect(day('2026-11-06')).toHaveFocus();
  });

  it('좁은 화면: 점 + 아래 고른 날 일정 목록', () => {
    narrow();
    render(<MonthCalendar events={EVENTS} today="2026-11-06" defaultSelected="2026-11-06" />);
    const root = document.querySelector('.tl-month-calendar')!;
    expect(root).toHaveAttribute('data-layout', 'compact');
    expect(root.querySelectorAll('.tl-month-calendar__chip')).toHaveLength(0);
    expect(day('2026-11-06').querySelectorAll('.tl-month-calendar__dot')).toHaveLength(3);
    const agenda = screen.getByRole('region', { name: /11월 6일\(금\)/ });
    expect(within(agenda).getAllByRole('listitem')).toHaveLength(5);
    expect(agenda).toHaveTextContent('종일');
    fireEvent.click(day('2026-11-19'));
    expect(screen.getByRole('region', { name: /11월 19일\(목\)/ })).toHaveTextContent('부산 출장');
  });

  it('locale en: 달 이름 · 요일', () => {
    render(
      <TrellisProvider locale="en">
        <MonthCalendar events={EVENTS} today="2026-11-06" defaultSelected="2026-11-06" />
      </TrellisProvider>,
    );
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Sun');
    expect(screen.getByText('2 more')).toBeInTheDocument();
  });
});

// ── KanbanBoard ──
const STAGES: KanbanColumn[] = [
  { id: 'todo', title: '발굴', tone: 'neutral', trailing: '확률 10%' },
  { id: 'doing', title: '협상', tone: 'warning' },
  { id: 'done', title: '수주', tone: 'success', locked: true },
];
const DEALS: KanbanCardItem[] = [
  {
    id: 'k1',
    column: 'todo',
    title: '해밀호텔',
    amount: 24_000_000,
    owner: '송유나',
    due: '2026-11-09',
  },
  { id: 'k2', column: 'todo', title: '청담다이닝', amount: 36_000_000, due: '2026-12-01' },
  {
    id: 'k3',
    column: 'doing',
    title: '대양상사',
    amount: 420_000_000,
    status: { label: '보류', tone: 'warning' },
  },
];

/** 카드 본문 단추(같은 이름으로 시작하는 옮기기 단추는 뺀다) */
const cardNamed = (title: string) => (name: string) =>
  name.startsWith(title) && !name.endsWith('옮기기');

function Board(props: { onMove?: (id: string, to: string, index: number) => void }) {
  const [cards, setCards] = useState(DEALS);
  return (
    <KanbanBoard
      label="영업기회"
      columns={STAGES}
      cards={cards}
      today="2026-11-06"
      onCardPress={() => {}}
      onMove={(id, to, index) => {
        props.onMove?.(id, to, index);
        setCards((list) => {
          const card = { ...list.find((c) => c.id === id)!, column: to };
          const rest = list.filter((c) => c.id !== id);
          const target = rest.filter((c) => c.column === to)[index];
          const at = target ? rest.indexOf(target) : rest.length;
          return [...rest.slice(0, at), card, ...rest.slice(at)];
        });
      }}
    />
  );
}

describe('KanbanBoard', () => {
  it('칸마다 건수 · 금액 합계, 카드는 제목 · 금액 · 담당 · 기한', () => {
    render(<Board />);
    const board = screen.getByRole('region', { name: '영업기회' });
    const todo = within(board).getByRole('group', { name: '발굴 2건' });
    expect(todo).toHaveTextContent('60,000,000원');
    expect(todo).toHaveTextContent('확률 10%');
    expect(within(board).getByRole('group', { name: '수주 0건' })).toHaveTextContent('카드 없음');
    const card = within(todo).getByRole('button', { name: cardNamed('해밀호텔') });
    expect(card).toHaveTextContent('24,000,000원');
    expect(card).toHaveTextContent('송유나');
    expect(card).toHaveTextContent('D-3');
    expect(within(board).getByRole('group', { name: '협상 1건' })).toHaveTextContent('보류');
  });

  it('옮기기 메뉴로 다른 칸에 옮긴다(잠긴 칸은 비활성). 옮긴 카드에 포커스가 돌아온다', async () => {
    const onMove = vi.fn();
    render(<Board onMove={onMove} />);
    fireEvent.click(screen.getByRole('button', { name: '해밀호텔 옮기기' }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: '수주' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(within(menu).queryByRole('menuitem', { name: '발굴' })).toBeNull();
    fireEvent.click(within(menu).getByRole('menuitem', { name: '협상' }));
    expect(onMove).toHaveBeenCalledWith('k1', 'doing', 1);
    const doing = screen.getByRole('group', { name: '협상 2건' });
    expect(within(doing).getByRole('button', { name: cardNamed('해밀호텔') })).toBeInTheDocument();
    await act(() => new Promise((r) => requestAnimationFrame(() => r(null))));
    expect(within(doing).getByRole('button', { name: cardNamed('해밀호텔') })).toHaveFocus();
  });

  it('화살표로 카드 사이를 옮겨 다닌다', () => {
    render(<Board />);
    const first = screen.getByRole('button', { name: cardNamed('해밀호텔') });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: cardNamed('청담다이닝') })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: cardNamed('대양상사') })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(screen.getByRole('button', { name: cardNamed('해밀호텔') })).toHaveFocus();
  });

  it('마우스로 끌어 다른 칸에 놓는다', () => {
    const onMove = vi.fn();
    render(<Board onMove={onMove} />);
    const card = document.querySelector('[data-card-id="k2"]')!;
    expect(card).toHaveAttribute('draggable', 'true');
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', dropEffect: '' };
    fireEvent.dragStart(card, { dataTransfer });
    const doing = screen.getByRole('group', { name: '협상 1건' });
    // jsdom 사각형은 모두 top 0 · 높이 240이라 clientY 200은 첫 카드 아래 → 끝에 놓인다
    fireEvent.dragOver(doing, { dataTransfer, clientY: 200 });
    fireEvent.drop(doing, { dataTransfer, clientY: 200 });
    expect(onMove).toHaveBeenCalledWith('k2', 'doing', 1);
    // 잠긴 칸에는 놓지 않는다
    onMove.mockClear();
    fireEvent.dragStart(document.querySelector('[data-card-id="k1"]')!, { dataTransfer });
    const done = screen.getByRole('group', { name: '수주 0건' });
    fireEvent.dragOver(done, { dataTransfer });
    fireEvent.drop(done, { dataTransfer });
    expect(onMove).not.toHaveBeenCalled();
  });

  it('onMove가 없으면 옮기기 메뉴 · 끌기가 없다', () => {
    render(<KanbanBoard label="읽기" columns={STAGES} cards={DEALS} today="2026-11-06" />);
    expect(screen.queryByRole('button', { name: /옮기기/ })).toBeNull();
    expect(document.querySelector('[data-card-id="k1"]')).toHaveAttribute('draggable', 'false');
  });

  it('좁은 화면: 단계 탭(건수) + 한 열, 옮기기는 시트', async () => {
    narrow();
    render(<Board />);
    const tabs = screen.getByRole('tablist', { name: '영업기회' });
    expect(
      within(tabs)
        .getAllByRole('tab')
        .map((t) => t.textContent),
    ).toEqual(['발굴2', '협상1', '수주0']);
    expect(screen.getByRole('button', { name: cardNamed('해밀호텔') })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: cardNamed('대양상사') })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '해밀호텔 옮기기' }));
    const sheet = await screen.findByRole('dialog', { name: '옮길 칸' });
    fireEvent.click(within(sheet).getByRole('button', { name: '협상' }));
    expect(within(tabs).getAllByRole('tab')[1]).toHaveTextContent('협상2');
    fireEvent.click(within(tabs).getAllByRole('tab')[1]!);
    expect(screen.getByRole('button', { name: cardNamed('해밀호텔') })).toBeInTheDocument();
  });
});

// ── FolderTree ──
const FOLDERS: FolderTreeNode[] = [
  {
    id: 'root',
    label: '내 문서',
    count: 14,
    children: [
      {
        id: 'close',
        label: '2026 결산',
        count: 7,
        children: [
          { id: 'oct', label: '10월 마감', count: 4 },
          { id: 'nov', label: '11월 마감', count: 3 },
        ],
      },
      { id: 'minutes', label: '회의록', count: 2 },
    ],
  },
  { id: 'shared', label: '공유받은 문서', icon: 'users' },
  { id: 'trash', label: '휴지통', icon: 'trash-2', disabled: true },
];

const item = (name: string | RegExp) => screen.getByRole('treeitem', { name });

describe('FolderTree', () => {
  it('role tree · treeitem(aria-level · setsize · posinset · expanded · selected), 건수는 흐린 숫자', () => {
    render(<FolderTree nodes={FOLDERS} defaultExpanded={['root']} defaultSelected="minutes" />);
    expect(screen.getByRole('tree', { name: '폴더' })).toBeInTheDocument();
    const items = screen.getAllByRole('treeitem');
    expect(items.map((i) => i.querySelector('.tl-folder-tree__label')?.textContent)).toEqual([
      '내 문서',
      '2026 결산',
      '회의록',
      '공유받은 문서',
      '휴지통',
    ]);
    const root = item(/^내 문서/);
    expect(root).toHaveAttribute('aria-level', '1');
    expect(root).toHaveAttribute('aria-expanded', 'true');
    expect(root).toHaveAccessibleName('내 문서 14건');
    const close = item(/^2026 결산/);
    expect(close).toHaveAttribute('aria-level', '2');
    expect(close).toHaveAttribute('aria-setsize', '2');
    expect(close).toHaveAttribute('aria-posinset', '1');
    expect(close).toHaveAttribute('aria-expanded', 'false');
    expect(item(/^회의록/)).toHaveAttribute('aria-selected', 'true');
    expect(item(/^회의록/)).toHaveAttribute('tabindex', '0');
    expect(item(/^회의록/)).not.toHaveAttribute('aria-expanded');
    expect(item('휴지통')).toHaveAttribute('aria-disabled', 'true');
  });

  it('위 · 아래 · 오른쪽(펼치기 → 첫 자식) · 왼쪽(접기 → 부모) · Home · End · Enter · 글자 찾기', () => {
    const onSelect = vi.fn();
    const onExpandedChange = vi.fn();
    render(
      <FolderTree
        nodes={FOLDERS}
        defaultExpanded={['root']}
        onSelect={onSelect}
        onExpandedChange={onExpandedChange}
      />,
    );
    const root = item(/^내 문서/);
    expect(root).toHaveAttribute('tabindex', '0');
    root.focus();
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    expect(item(/^2026 결산/)).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(onExpandedChange).toHaveBeenLastCalledWith(['root', 'close']);
    expect(item(/^2026 결산/)).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(item(/^10월 마감/)).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(item(/^2026 결산/)).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(item(/^2026 결산/)).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(root).toHaveFocus();
    fireEvent.keyDown(root, { key: 'End' });
    expect(item('휴지통')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(root).toHaveFocus();
    fireEvent.keyDown(root, { key: '회' });
    expect(item(/^회의록/)).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: ' ' });
    expect(onSelect).toHaveBeenLastCalledWith('minutes');
    expect(item(/^회의록/)).toHaveAttribute('aria-selected', 'true');
  });

  it('하위가 없는 한 단계 목록은 펼침 칸 없이 그린다', () => {
    render(
      <FolderTree
        label="메일함"
        nodes={[
          { id: 'inbox', label: '받은편지함', icon: 'inbox', count: 3 },
          { id: 'sent', label: '보낸편지함', icon: 'send' },
        ]}
        defaultSelected="inbox"
      />,
    );
    const tree = screen.getByRole('tree', { name: '메일함' });
    expect(tree).toHaveAttribute('data-flat');
    expect(tree.querySelector('.tl-folder-tree__toggle')).toBeNull();
    expect(item('받은편지함 3건')).toHaveAttribute('aria-selected', 'true');
  });

  it('행을 누르면 고르고, 펼침 단추는 펼치기만 한다(제어 expanded)', () => {
    const onSelect = vi.fn();
    function Controlled() {
      const [expanded, setExpanded] = useState<string[]>([]);
      return (
        <FolderTree
          label="문서 폴더"
          nodes={FOLDERS}
          expanded={expanded}
          onExpandedChange={setExpanded}
          onSelect={onSelect}
        />
      );
    }
    render(<Controlled />);
    expect(screen.getAllByRole('treeitem')).toHaveLength(3);
    fireEvent.click(item(/^내 문서/).querySelector('.tl-folder-tree__toggle')!);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getAllByRole('treeitem')).toHaveLength(5);
    fireEvent.click(item(/^회의록/));
    expect(onSelect).toHaveBeenCalledWith('minutes');
    fireEvent.click(item('휴지통'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
