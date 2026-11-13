// 표 · 달력 보강(R-37 4 · 8 · 9, R-40, R-43 5): DataGrid 넘침 · 오른쪽 고정 · 잘린 칸 title,
// MonthCalendar 점 여러 개 · 아이콘 · 상태 · sm · onDayPress, TeamSchedule 날짜 머리, DeadlineStrip
import {
  DeadlineStripContract,
  groupDeadlines,
  type DeadlineStripItem,
  type DeadlineStripProps,
  type MonthCalendarEvent,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { type ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  DataGrid,
  DeadlineStrip,
  MonthCalendar,
  TeamSchedule,
  type DataGridWebColumn,
} from '../src/core/index.js';

/** jsdom은 배치를 하지 않으므로 넓이를 직접 준다 */
function setBox(
  el: Element,
  box: Partial<Record<'scrollWidth' | 'clientWidth' | 'scrollLeft' | 'clientHeight', number>>,
) {
  for (const [k, v] of Object.entries(box))
    Object.defineProperty(el, k, { configurable: true, writable: true, value: v });
}

type Row = { id: string; name: string; gross: number; net: number };
const ROWS: Row[] = [
  { id: 'a', name: '김하늘', gross: 3_500_000, net: 3_100_000 },
  { id: 'b', name: '박서준 · 아주 긴 이름이 칸 폭을 넘는 사람', gross: 4_200_000, net: 3_700_000 },
];
const COLUMNS: DataGridWebColumn<Row>[] = [
  { key: 'name', header: '이름', sticky: true },
  { key: 'gross', header: '지급 합계', format: 'amount' },
  { key: 'net', header: '실지급', format: 'amount', emphasis: true, sticky: 'end' },
];

describe('DataGrid 가로 넘침 · 고정 열(R-37 4)', () => {
  it('sticky true는 start, end는 오른쪽 고정. 열 순서(읽는 순서)는 그대로', () => {
    render(<DataGrid caption="급여" columns={COLUMNS} rows={ROWS} rowKey="id" />);
    const heads = screen.getAllByRole('columnheader');
    expect(heads.map((h) => h.textContent?.slice(0, 3))).toEqual(['이름', '지급 ', '실지급']);
    expect(heads[0]).toHaveAttribute('data-sticky', 'start');
    expect(heads[1]).not.toHaveAttribute('data-sticky');
    expect(heads[2]).toHaveAttribute('data-sticky', 'end');
    // 칸은 앞 고정 열 폭만큼 민 자리 변수를 받는다
    expect(heads[2]!.style.getPropertyValue('--tl-data-grid-offset')).toBe(
      'var(--tl-data-grid-sticky-2, 0)',
    );
    const cell = screen.getByText('3,100,000').closest('td')!;
    expect(cell).toHaveAttribute('data-sticky', 'end');
  });

  it('스크롤 위치에 따라 data-overflow-start · end', () => {
    render(<DataGrid caption="급여" columns={COLUMNS} rows={ROWS} rowKey="id" />);
    const wrap = screen.getByRole('region', { name: '급여' });
    expect(wrap.querySelector('.tl-data-grid__edges')).toHaveAttribute('aria-hidden', 'true');
    setBox(wrap, { scrollWidth: 1768, clientWidth: 1139, scrollLeft: 0 });
    fireEvent.scroll(wrap);
    expect(wrap).toHaveAttribute('data-overflow-end');
    expect(wrap).not.toHaveAttribute('data-overflow-start');
    setBox(wrap, { scrollLeft: 300 });
    fireEvent.scroll(wrap);
    expect(wrap).toHaveAttribute('data-overflow-start');
    expect(wrap).toHaveAttribute('data-overflow-end');
    setBox(wrap, { scrollLeft: 629 });
    fireEvent.scroll(wrap);
    expect(wrap).toHaveAttribute('data-overflow-start');
    expect(wrap).not.toHaveAttribute('data-overflow-end');
    // 넘치지 않으면 둘 다 없다
    setBox(wrap, { scrollWidth: 800, clientWidth: 800, scrollLeft: 0 });
    fireEvent.scroll(wrap);
    expect(wrap).not.toHaveAttribute('data-overflow-start');
    expect(wrap).not.toHaveAttribute('data-overflow-end');
  });

  it('잘린 칸만 가리키면 보이는 전체 글자를 title로, 잘리지 않으면 걷는다', () => {
    render(<DataGrid caption="급여" columns={COLUMNS} rows={ROWS} rowKey="id" />);
    const long = screen.getByText(/아주 긴 이름/).closest('td')!;
    setBox(long, { scrollWidth: 300, clientWidth: 120 });
    fireEvent.pointerOver(long);
    expect(long).toHaveAttribute('title', '박서준 · 아주 긴 이름이 칸 폭을 넘는 사람');
    setBox(long, { scrollWidth: 120, clientWidth: 120 });
    fireEvent.pointerOver(long);
    expect(long).not.toHaveAttribute('title');
    const short = screen.getByText('김하늘').closest('td')!;
    setBox(short, { scrollWidth: 80, clientWidth: 120 });
    fireEvent.pointerOver(short);
    expect(short).not.toHaveAttribute('title');
  });
});

const EVENTS: MonthCalendarEvent[] = [
  {
    id: 'pay',
    date: '2026-11-03',
    title: '10월분 급여 지급',
    colors: ['series-1', 'series-2', 'series-3', 'series-4', 'series-5', 'compare'],
    icon: 'wallet',
    state: 'done',
  },
  { id: 'ins', date: '2026-11-05', title: '4대보험 취득신고', state: 'late', icon: 'file-text' },
  { id: 'tax', date: '2026-11-10', title: '원천세 신고', color: 'series-5' },
  { id: 'meet', date: '2026-11-10', title: '주간 회의', start: '09:00', color: 'series-2' },
];

describe('MonthCalendar 일정 보강(R-37 8) · sm(R-43 5)', () => {
  it('점 여러 개는 4개까지 + "+n", 유형 아이콘, 상태는 data-state + 숨은 글자', () => {
    render(
      <MonthCalendar label="세무" events={EVENTS} today="2026-11-06" onEventPress={() => {}} />,
    );
    const pay = screen.getByRole('button', { name: /10월분 급여 지급/ });
    expect(pay).toHaveAttribute('data-state', 'done');
    expect(pay).toHaveAccessibleName(expect.stringContaining('끝남'));
    expect(pay.querySelectorAll('.tl-month-calendar__dot')).toHaveLength(4);
    expect(pay.querySelector('.tl-month-calendar__marks-more')).toHaveTextContent('+2');
    expect(pay.querySelector('svg.tl-month-calendar__icon')).not.toBeNull();
    const late = screen.getByRole('button', { name: /4대보험 취득신고/ });
    expect(late).toHaveAttribute('data-state', 'late');
    expect(late).toHaveAccessibleName(expect.stringContaining('지연'));
  });

  it('잘린 칩 제목만 가리키면 title', () => {
    render(
      <MonthCalendar label="세무" events={EVENTS} today="2026-11-06" onEventPress={() => {}} />,
    );
    const chip = screen.getByRole('button', { name: /원천세 신고/ });
    const title = chip.querySelector<HTMLElement>('.tl-month-calendar__chip-title')!;
    setBox(title, { scrollWidth: 200, clientWidth: 60 });
    fireEvent.pointerEnter(chip);
    expect(chip).toHaveAttribute('title', '원천세 신고');
  });

  it('size="sm"은 칩 대신 점 + 건수, 날을 누르면 onDayPress(날, 그날 일정)', () => {
    const onDayPress = vi.fn();
    const { container } = render(
      <MonthCalendar
        label="세무"
        size="sm"
        events={EVENTS}
        today="2026-11-06"
        onDayPress={onDayPress}
      />,
    );
    expect(container.querySelector('.tl-month-calendar')).toHaveAttribute('data-size', 'sm');
    expect(container.querySelector('.tl-month-calendar__chip')).toBeNull();
    const day = container.querySelector<HTMLElement>('[data-date="2026-11-10"]')!;
    expect(day.querySelectorAll('.tl-month-calendar__dot')).toHaveLength(2);
    expect(day.querySelector('.tl-month-calendar__dot-count')).toHaveTextContent('2');
    fireEvent.click(day);
    expect(onDayPress).toHaveBeenCalledWith('2026-11-10', [
      expect.objectContaining({ id: 'tax' }),
      expect.objectContaining({ id: 'meet' }),
    ]);
  });
});

describe('TeamSchedule 날짜 머리(R-37 9)', () => {
  it('머리 칸 이름은 칸 안 숨은 글자(aria-label 없음), 보이는 요일 · 날짜는 숨김', () => {
    render(
      <TeamSchedule
        caption="팀 휴가"
        start="2026-11-02"
        days={3}
        today="2026-11-03"
        people={[{ id: 'p1', name: '김하늘' }]}
        events={[]}
      />,
    );
    const head = screen.getAllByRole('columnheader')[2]!;
    expect(head).not.toHaveAttribute('aria-label');
    expect(head.querySelector('.tl-sr-only')).toHaveTextContent(/11월 3일 화요일 · 오늘/);
    expect(head).toHaveAccessibleName(/11월 3일 화요일 · 오늘/);
    for (const s of head.querySelectorAll('span:not(.tl-sr-only)'))
      expect(s).toHaveAttribute('aria-hidden');
  });
});

const ITEMS: DeadlineStripItem[] = [
  { id: 'o1', date: '2026-11-01', title: '10월 근태 마감', category: '사람', color: 'series-3' },
  { id: 'o2', date: '2026-11-03', title: '임대차 회신', category: '운영', done: true },
  { id: 'a', date: '2026-11-10', title: '원천세 신고', category: '숫자', color: 'series-1' },
  { id: 'b', date: '2026-11-10', title: '이서연 4대보험 취득신고', category: '사람' },
  { id: 'c', date: '2026-11-10', title: '급여 명세서 발송', category: '사람', done: true },
  { id: 'd', date: '2026-11-16', title: '중간 보고', category: '운영' },
  { id: 'far', date: '2026-12-20', title: '범위 밖', category: '운영' },
];

describe('DeadlineStrip(R-40)', () => {
  it('contract parity', () => {
    expect(DeadlineStrip.displayName).toBe(DeadlineStripContract.name);
    expect(Object.keys(DeadlineStripContract.props)).toEqual(
      expect.arrayContaining(['id', 'testID']),
    );
    expectTypeOf<DeadlineStripProps>().toMatchTypeOf<ComponentProps<typeof DeadlineStrip>>();
  });

  it('groupDeadlines: 지남(끝나지 않은 것만) · 날짜 묶음(끝나지 않은 것 먼저) · 범위 밖 제외', () => {
    const groups = groupDeadlines(ITEMS, '2026-11-06', 30);
    expect(groups.map((g) => g.key)).toEqual(['overdue', '2026-11-10', '2026-11-16']);
    expect(groups[0]!.items.map((i) => i.id)).toEqual(['o1']);
    expect(groups[1]!.index).toBe(4);
    expect(groups[1]!.items.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('날짜순 ol, 점 이름 · 묶음 이름 · 지남, 로빙 ← → Home End', () => {
    render(
      <DeadlineStrip caption="30일 기한" items={ITEMS} start="2026-11-06" today="2026-11-06" />,
    );
    const list = screen.getByRole('list', { name: '30일 기한' });
    expect(list.tagName).toBe('OL');
    const buttons = within(list).getAllByRole('button');
    expect(buttons.map((b) => b.getAttribute('aria-label') ?? b.textContent)).toHaveLength(3);
    expect(buttons[0]).toHaveAccessibleName('지난 기한 1건');
    expect(buttons[1]).toHaveAccessibleName('11월 10일(화) · 3건');
    expect(buttons[2]).toHaveAccessibleName('11월 16일(월) · 중간 보고 · 운영 · D-10');
    expect(buttons.map((b) => b.tabIndex)).toEqual([0, -1, -1]);
    act(() => buttons[0]!.focus());
    fireEvent.keyDown(buttons[0]!, { key: 'ArrowRight' });
    expect(buttons[1]).toHaveFocus();
    fireEvent.keyDown(buttons[1]!, { key: 'End' });
    expect(buttons[2]).toHaveFocus();
    fireEvent.keyDown(buttons[2]!, { key: 'Home' });
    expect(buttons[0]).toHaveFocus();
    // 날짜 축은 꾸밈. "오늘"은 글자로도
    expect(document.querySelector('.tl-deadline-strip__axis')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(document.querySelector('[data-today] .tl-deadline-strip__label')).toHaveTextContent(
      '오늘',
    );
  });

  it('하나뿐인 점은 Enter로 onItemPress, 묶음은 패널을 열고 Esc로 닫고 돌아온다', () => {
    const onItemPress = vi.fn();
    render(
      <DeadlineStrip
        caption="30일 기한"
        items={ITEMS}
        start="2026-11-06"
        today="2026-11-06"
        onItemPress={onItemPress}
      />,
    );
    const single = screen.getByRole('button', { name: /중간 보고/ });
    expect(single).not.toHaveAttribute('aria-expanded');
    fireEvent.click(single);
    expect(onItemPress).toHaveBeenCalledWith(expect.objectContaining({ id: 'd' }));

    const group = screen.getByRole('button', { name: '11월 10일(화) · 3건' });
    expect(group).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(group);
    expect(group).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('group', { name: '11월 10일(화) · 3건' });
    expect(group).toHaveAttribute('aria-controls', panel.id);
    const rows = within(panel)
      .getAllByRole('button')
      .filter((b) => b.matches('.tl-deadline-strip__row'));
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveFocus();
    expect(rows[2]).toHaveAccessibleName(/급여 명세서 발송 · 사람 · 끝남/);
    fireEvent.click(rows[1]!);
    expect(onItemPress).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'b' }));
    fireEvent.keyDown(rows[1]!, { key: 'Escape' });
    expect(screen.queryByRole('group')).toBeNull();
    expect(group).toHaveFocus();
  });

  it('기간 안에 기한이 없으면 빈 글자', () => {
    render(<DeadlineStrip caption="기한" items={[]} today="2026-11-06" days={7} />);
    expect(screen.getByText('이 기간에 기한이 없습니다')).toBeInTheDocument();
  });
});
