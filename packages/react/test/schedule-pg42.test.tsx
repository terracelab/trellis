// 일정 부품(PG-42): MonthCalendar 주 · 일 보기 · TimeField · WorkTimeline(R-T23) · CheckboxGroup 색 점(R-T58)
import {
  MonthCalendarContract,
  TimeFieldContract,
  WorkTimelineContract,
  type MonthCalendarEvent,
  type MonthCalendarProps,
  type TimeFieldProps,
  type WorkTimelineDay,
  type WorkTimelineProps,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { CheckboxGroup, Field, MonthCalendar, TimeField, WorkTimeline } from '../src/core/index.js';

const EVENTS: MonthCalendarEvent[] = [
  {
    id: 'e1',
    date: '2026-11-06',
    title: '주간 회의',
    start: '09:00',
    end: '10:00',
    color: 'series-2',
  },
  {
    id: 'e2',
    date: '2026-11-06',
    title: '오후 반차',
    start: '13:00',
    end: '18:00',
    color: 'series-4',
  },
  {
    id: 'e3',
    date: '2026-11-06',
    title: '자금 계획 보고',
    start: '14:00',
    end: '15:00',
    meta: '3층 회의실',
  },
  { id: 'e4', date: '2026-11-04', endDate: '2026-11-05', title: '과장 연차', color: 'series-4' },
  { id: 'e5', date: '2026-11-03', title: '이른 점검', start: '06:30', end: '07:30' },
  { id: 'e6', date: '2026-11-10', title: '원천세 신고 마감' },
];

describe('contract parity', () => {
  it('displayName === contract.name, props에 id · testID', () => {
    for (const [component, contract] of [
      [MonthCalendar, MonthCalendarContract],
      [TimeField, TimeFieldContract],
      [WorkTimeline, WorkTimelineContract],
    ] as const) {
      expect(component.displayName).toBe(contract.name);
      expect(Object.keys(contract.props)).toEqual(expect.arrayContaining(['id', 'testID']));
    }
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    expectTypeOf<Omit<MonthCalendarProps, 'actions'>>().toMatchTypeOf<
      ComponentProps<typeof MonthCalendar>
    >();
    expectTypeOf<TimeFieldProps>().toMatchTypeOf<ComponentProps<typeof TimeField>>();
    expectTypeOf<WorkTimelineProps>().toMatchTypeOf<ComponentProps<typeof WorkTimeline>>();
  });

  it('values가 있는 prop은 값마다 data-<prop>', () => {
    for (const view of MonthCalendarContract.props.view.values!) {
      const { unmount } = render(
        <MonthCalendar
          events={EVENTS}
          today="2026-11-06"
          view={view as MonthCalendarProps['view']}
          testID="c"
        />,
      );
      expect(screen.getByTestId('c')).toHaveAttribute('data-view', view);
      unmount();
    }
    for (const size of TimeFieldContract.props.size.values!) {
      const { container, unmount } = render(
        <TimeField label="시각" size={size as TimeFieldProps['size']} />,
      );
      expect(container.querySelector('.tl-time-field')).toHaveAttribute('data-size', size);
      unmount();
    }
  });
});

describe('MonthCalendar 주 · 일 보기', () => {
  it('views가 하나(기본)면 보기 바꾸기가 없고 월 달력 그대로', () => {
    render(<MonthCalendar events={EVENTS} today="2026-11-06" label="팀 일정" />);
    expect(screen.queryByRole('radiogroup', { name: '보기' })).not.toBeInTheDocument();
    expect(screen.getByRole('grid', { name: '팀 일정 2026년 11월' })).toBeInTheDocument();
  });

  it('보기 바꾸기 → 주: 7일 머리, 기간 제목, 건수, onViewChange', () => {
    const onViewChange = vi.fn();
    render(
      <MonthCalendar
        events={EVENTS}
        today="2026-11-06"
        defaultSelected="2026-11-06"
        views={['month', 'week', 'day']}
        onViewChange={onViewChange}
        label="팀 일정"
        testID="c"
      />,
    );
    fireEvent.click(screen.getByRole('radio', { name: '주' }));
    expect(onViewChange).toHaveBeenCalledWith('week');
    expect(screen.getByTestId('c')).toHaveAttribute('data-view', 'week');
    const grid = screen.getByRole('grid', { name: '팀 일정 2026년 11월 1일~7일' });
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(7);
    // 그 주에 걸친 일정: e1 · e2 · e3 · e4 · e5
    expect(screen.getByText('일정 5건')).toBeInTheDocument();
  });

  it('시간 일정은 시각 칸에, 겹치면 나란히, 범위 밖은 범위가 늘어난다', () => {
    const { container } = render(
      <MonthCalendar events={EVENTS} today="2026-11-06" now="13:40" view="week" />,
    );
    const blocks = container.querySelectorAll<HTMLElement>('.tl-month-calendar__block');
    expect(blocks).toHaveLength(4);
    const byTitle = (t: string) => [...blocks].find((b) => b.textContent?.includes(t))!.style;
    // 06:30 일정 때문에 범위가 06:00부터: 09:00은 3시간 아래
    expect(byTitle('주간 회의').getPropertyValue('--tl-month-calendar-top')).toBe('3');
    expect(byTitle('오후 반차').getPropertyValue('--tl-month-calendar-cols')).toBe('2');
    expect(byTitle('자금 계획 보고').getPropertyValue('--tl-month-calendar-col')).toBe('1');
    // 종일 · 여러 날 일정은 종일 줄
    expect(
      container.querySelectorAll('.tl-month-calendar__allday .tl-month-calendar__chip'),
    ).toHaveLength(2);
    // 지금 선은 오늘 칸에만
    expect(container.querySelectorAll('.tl-month-calendar__now')).toHaveLength(1);
    expect(container.querySelector('[data-today] .tl-month-calendar__now')).not.toBeNull();
  });

  it('누를 수 없으면 블록을 감추고 숨은 일정 목록을 읽는다', () => {
    render(
      <MonthCalendar events={EVENTS} today="2026-11-06" view="day" defaultSelected="2026-11-06" />,
    );
    const list = screen.getByRole('list', { name: '2026년 11월 6일(금) 일정' });
    expect(within(list).getByText(/09:00~10:00 주간 회의/)).toBeInTheDocument();
    expect(within(list).getByText(/3층 회의실/)).toBeInTheDocument();
  });

  it('키보드: 화살표로 날을 옮기면 보이는 주가 따라가고 달이 바뀌면 onMonthChange', () => {
    const onMonthChange = vi.fn();
    function Harness() {
      const [month, setMonth] = useState('2026-11');
      return (
        <MonthCalendar
          events={EVENTS}
          today="2026-11-06"
          defaultSelected="2026-11-28"
          month={month}
          onMonthChange={(m) => {
            onMonthChange(m);
            setMonth(m);
          }}
          view="week"
          label="팀 일정"
        />
      );
    }
    render(<Harness />);
    const sat = screen.getByRole('button', { name: /^28일 토요일/ });
    expect(sat).toHaveAttribute('tabindex', '0');
    act(() => sat.focus());
    fireEvent.keyDown(sat, { key: 'ArrowRight' });
    // 11-29(일)은 다음 주: 11월 29일~12월 5일
    expect(
      screen.getByRole('grid', { name: '팀 일정 2026년 11월 29일~12월 5일' }),
    ).toBeInTheDocument();
    expect(document.activeElement).toHaveAttribute('data-date', '2026-11-29');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(onMonthChange).toHaveBeenLastCalledWith('2026-12');
    expect(document.activeElement).toHaveAttribute('data-date', '2026-12-06');
  });

  it('이전 · 다음 단추는 보기에 따라 주 · 날을 옮긴다', () => {
    render(
      <MonthCalendar
        events={EVENTS}
        today="2026-11-06"
        defaultSelected="2026-11-06"
        views={['day', 'week']}
        defaultView="day"
      />,
    );
    expect(screen.getByText('2026년 11월 6일(금)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다음 날' }));
    expect(screen.getByText('2026년 11월 7일(토)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: '주' }));
    fireEvent.click(screen.getByRole('button', { name: '이전 주' }));
    expect(screen.getByText('2026년 10월 25일~31일')).toBeInTheDocument();
  });

  it('onEventPress: 블록이 버튼(날 · 시각 · 제목 이름), Esc로 그 날에 돌아온다', () => {
    const onEventPress = vi.fn();
    render(
      <MonthCalendar
        events={EVENTS}
        today="2026-11-06"
        defaultSelected="2026-11-06"
        view="week"
        onEventPress={onEventPress}
      />,
    );
    const block = screen.getByRole('button', { name: '11월 6일(금) 09:00~10:00 주간 회의' });
    expect(block).toHaveAttribute('tabindex', '0');
    fireEvent.click(block);
    expect(onEventPress).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
    act(() => block.focus());
    fireEvent.keyDown(block, { key: 'Escape' });
    expect(document.activeElement).toHaveAttribute('data-date', '2026-11-06');
    // 다른 날 블록은 탭 순서 밖
    expect(screen.getByRole('button', { name: /11월 3일\(화\) 06:30~07:30/ })).toHaveAttribute(
      'tabindex',
      '-1',
    );
    // 버튼 모드에는 숨은 목록이 없다(겹쳐 읽지 않게)
    expect(screen.queryByRole('list', { name: /일정$/ })).not.toBeInTheDocument();
  });

  it('보이는 글자가 이름 안에 그대로 있다(WCAG 2.5.3, axe label-content-name-mismatch)', () => {
    // axe와 같은 방법: 화면에 보이는 글자 노드를 사이 공백 없이 잇고(숨은 글자 .tl-sr-only 제외),
    // 괄호 안 · 기호를 지운 낱말이 접근성 이름의 낱말 안에 끊기지 않고 이어져 있어야 한다
    const words = (s: string) =>
      s
        .toLowerCase()
        .replace(/\([^()]*\)/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .split(/\s+/)
        .filter(Boolean);
    const visibleText = (el: Element): string =>
      [...el.childNodes]
        .map((n) =>
          n.nodeType === Node.TEXT_NODE
            ? (n.nodeValue ?? '')
            : n instanceof Element && !n.classList.contains('tl-sr-only')
              ? visibleText(n)
              : '',
        )
        .join('');
    const contained = (label: string[], name: string[]) =>
      name.some((_, i) => label.every((w, j) => name[i + j] === w));
    for (const view of ['week', 'day', 'month'] as const) {
      const { container, unmount } = render(
        <MonthCalendar
          events={EVENTS}
          today="2026-11-06"
          defaultSelected="2026-11-06"
          views={['month', 'week', 'day']}
          view={view}
          onEventPress={() => undefined}
          label="팀 일정"
        />,
      );
      // 이름은 testing-library가 계산한 접근성 이름(name 함수가 받는 값)
      const names = new Map<Element, string>();
      for (const role of ['button', 'radio', 'checkbox', 'link'] as const)
        within(container).queryAllByRole(role, {
          name: (name, el) => {
            names.set(el, name);
            return true;
          },
        });
      const blocks = container.querySelectorAll('button.tl-month-calendar__block');
      if (view !== 'month') expect(blocks.length).toBeGreaterThan(0);
      for (const [el, name] of names) {
        const label = words(visibleText(el));
        if (label.length === 0) continue;
        // axe가 보는 것: 이름을 aria-label · aria-labelledby로 준 요소는 보이는 낱말이 끊기지 않고 들어 있다
        if (el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby'))
          expect(contained(label, words(name)), `${view}: "${visibleText(el)}" ⊄ "${name}"`).toBe(
            true,
          );
        // 일정 블록: 이름이 숨은 날짜 · 시각과 보이는 글자로 이뤄지고, 보이는 낱말이 같은 순서로 다 든다
        if (el.matches('.tl-month-calendar__block')) {
          const rest = words(name);
          expect(
            label.every((w) => rest.splice(0, rest.indexOf(w) + 1).at(-1) === w),
            `${view}: "${visibleText(el)}" ⊄ "${name}"`,
          ).toBe(true);
        }
      }
      // 일 보기 블록: 보이는 meta까지 이름에 든다
      if (view === 'day')
        expect(
          screen.getByRole('button', {
            name: '11월 6일(금) 14:00~15:00 자금 계획 보고 3층 회의실',
          }),
        ).toBeInTheDocument();
      unmount();
    }
  });
});

describe('TimeField', () => {
  it('글자를 칸을 떠날 때 읽는다(930 → 09:30)', () => {
    const onChange = vi.fn();
    render(<TimeField label="시작" onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: '시작' });
    fireEvent.change(input, { target: { value: '930' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith('09:30');
    expect(input).toHaveValue('09:30');
  });

  it('읽을 수 없거나 범위 밖이면 오류, 값은 그대로', () => {
    const onChange = vi.fn();
    render(
      <TimeField label="시작" defaultValue="10:00" min="09:00" max="18:00" onChange={onChange} />,
    );
    const input = screen.getByRole('combobox', { name: '시작' });
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent('시각은 09:30처럼 넣으세요');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(input, { target: { value: '2000' } });
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent('09:00~18:00 사이 시각을 넣으세요');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Field 안이면 오류가 Field 오류 칸으로', () => {
    render(
      <Field label="종료">
        <TimeField />
      </Field>,
    );
    const input = screen.getByRole('combobox', { name: '종료' });
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.blur(input);
    expect(screen.getByText('시각은 09:30처럼 넣으세요')).toBeInTheDocument();
  });

  it('↓로 목록을 열고 지금 값 가까이를 가리킨다. ↓ · Enter로 고른다', () => {
    const onChange = vi.fn();
    render(
      <TimeField label="시작" defaultValue="09:10" min="08:00" max="12:00" onChange={onChange} />,
    );
    const input = screen.getByRole('combobox', { name: '시작' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const list = screen.getByRole('listbox', { name: '시작' });
    expect(within(list).getAllByRole('option')).toHaveLength(9);
    const active = input.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(active)).toHaveTextContent('09:00');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('09:30');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('Escape는 목록만 닫는다(바깥으로 퍼지지 않는다)', () => {
    const outer = vi.fn();
    render(
      <div onKeyDown={outer}>
        <TimeField label="시작" />
      </div>,
    );
    const input = screen.getByRole('combobox', { name: '시작' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(outer).toHaveBeenCalledTimes(1); // ArrowDown만
  });

  it('durationFrom: 목록 행 끝에 걸리는 시간', () => {
    render(<TimeField label="종료" min="14:00" max="16:00" durationFrom="14:00" />);
    fireEvent.keyDown(screen.getByRole('combobox', { name: '종료' }), { key: 'ArrowDown' });
    const list = screen.getByRole('listbox');
    expect(within(list).getByText('1시간 30분')).toBeInTheDocument();
    expect(within(list).getByText('30분')).toBeInTheDocument();
  });

  it('시계 단추는 목록을 열고 초점은 입력 칸에 남는다. 행을 누르면 고른다', () => {
    const onChange = vi.fn();
    render(<TimeField label="시작" min="09:00" max="10:00" onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: '시작' });
    const button = screen.getByRole('button', { name: '시각 목록 열기' });
    expect(button).toHaveAttribute('tabindex', '-1');
    fireEvent.click(button);
    expect(document.activeElement).toBe(input);
    fireEvent.click(screen.getByRole('option', { name: '09:30' }));
    expect(onChange).toHaveBeenCalledWith('09:30');
  });

  it('바깥에서 value가 바뀌면 칸 글자도 바뀐다 · name이면 숨은 입력', () => {
    const { rerender, container } = render(<TimeField label="시작" value="09:00" name="start" />);
    expect(screen.getByRole('combobox')).toHaveValue('09:00');
    rerender(<TimeField label="시작" value="11:30" name="start" />);
    expect(screen.getByRole('combobox')).toHaveValue('11:30');
    expect(container.querySelector('input[type="hidden"][name="start"]')).toHaveValue('11:30');
  });

  it('disabled면 입력 · 시계 단추가 잠긴다', () => {
    const { container } = render(<TimeField label="시작" disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', { name: '시각 목록 열기' })).toBeDisabled();
    expect(container.querySelector('.tl-time-field')).toHaveAttribute('data-state', 'disabled');
  });
});

describe('WorkTimeline', () => {
  const days: WorkTimelineDay[] = [
    {
      date: '2026-11-02',
      clockIn: '08:52',
      clockOut: '18:40',
      status: { tone: 'success', label: '정상' },
    },
    { date: '2026-11-04', off: '연차' },
    { date: '2026-11-06', clockIn: '08:55' },
  ];
  const schedule = { start: '09:00', end: '18:00', breakMinutes: 60 };

  it('표: 이름 · 머리 · 요일 줄, 막대 칸은 숨은 글자로 조각을 읽는다', () => {
    render(
      <WorkTimeline
        label="이번 주 출퇴근"
        days={days}
        schedule={schedule}
        today="2026-11-06"
        now="15:20"
      />,
    );
    const table = screen.getByRole('table', { name: '이번 주 출퇴근' });
    expect(within(table).getAllByRole('row')).toHaveLength(4);
    expect(within(table).getByRole('columnheader', { name: '출퇴근 막대' })).toBeInTheDocument();
    expect(within(table).getByText('정규 08:52~18:00, 연장 18:00~18:40')).toBeInTheDocument();
    expect(within(table).getByText('근무 중 08:55~15:20')).toBeInTheDocument();
    // 근무 분: 08:52~18:40 = 588 − 60 = 528 = 8시간 48분
    expect(within(table).getByText('8시간 48분')).toBeInTheDocument();
    // 출근이 없는 날은 off 글자
    expect(within(table).getByText('연차')).toBeInTheDocument();
  });

  it('오늘 줄 · 근무 중 상태 · 조각 종류', () => {
    const { container } = render(
      <WorkTimeline label="주간" days={days} schedule={schedule} today="2026-11-06" now="15:20" />,
    );
    const rows = container.querySelectorAll('.tl-work-timeline__row');
    expect(rows[3]).toHaveAttribute('data-today');
    expect(
      within(rows[3] as HTMLElement).getByText('근무 중', {
        selector: '.tl-status-dot *, .tl-status-dot',
      }),
    ).toBeInTheDocument();
    expect(
      [...container.querySelectorAll('.tl-work-timeline__segment')].map((s) =>
        s.getAttribute('data-kind'),
      ),
    ).toEqual(['regular', 'overtime', 'live']);
  });

  it('상태가 하나도 없으면 상태 칸이 없다 · legend false면 범례 없음', () => {
    const { container } = render(
      <WorkTimeline
        label="주간"
        schedule={schedule}
        legend={false}
        days={[{ date: '2026-11-02', clockIn: '09:00', clockOut: '18:00' }]}
      />,
    );
    expect(screen.queryByRole('columnheader', { name: '상태' })).not.toBeInTheDocument();
    expect(container.querySelector('.tl-legend')).toBeNull();
  });
});

describe('CheckboxGroup color(R-T58)', () => {
  it('라벨 앞 색 점은 꾸밈이고 이름은 라벨 그대로', () => {
    const { container } = render(
      <CheckboxGroup
        label="캘린더"
        defaultValue={['mine']}
        options={[
          { value: 'mine', label: '내 일정', color: 'series-1' },
          { value: 'team', label: '팀' },
        ]}
      />,
    );
    const dots = container.querySelectorAll<HTMLElement>('.tl-checkbox-group__dot');
    expect(dots).toHaveLength(1);
    expect(dots[0]).toHaveAttribute('aria-hidden', 'true');
    expect(dots[0]!.style.getPropertyValue('--tl-checkbox-group-color')).toBe(
      'var(--tl-color-chart-series-1)',
    );
    expect(screen.getByRole('checkbox', { name: '내 일정' })).toBeChecked();
  });
});
