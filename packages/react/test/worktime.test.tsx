// 근무 · 휴가 · 급여(PR-27): 출퇴근 · 주 52시간 · 연차 · 팀 일정 · 임금명세서
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  LeaveBalance,
  Payslip,
  TeamSchedule,
  TimeClock,
  TrellisProvider,
  WorkHoursMeter,
} from '../src/core/index.js';
import { workedToday } from '../src/TimeClock/TimeClock.js';
import { scheduleLanes } from '../src/TeamSchedule/TeamSchedule.js';
import { workHoursTone } from '../src/WorkHoursMeter/WorkHoursMeter.js';

describe('TimeClock', () => {
  it('근무 중: 지금 시각 · 지각 · 남은 시간 · 퇴근하기와 휴게 시작', () => {
    const out = vi.fn();
    render(
      <TimeClock
        status="working"
        now="2026-11-06T14:32"
        clockIn="09:04"
        place="office"
        onClockOut={out}
        onBreakStart={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: '오늘 근무' })).toBeInTheDocument();
    expect(screen.getByText('14:32')).toHaveAttribute('dateTime', '2026-11-06T14:32');
    expect(screen.getByText('근무 중')).toBeInTheDocument();
    expect(screen.getByText('지각')).toBeInTheDocument();
    // 09:04 → 14:32 = 328분, 4시간 넘어 휴게 60분 빼고 268분
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '268');
    expect(bar).toHaveAttribute('aria-valuetext', '소정 근무 8시간 중 4시간 28분');
    expect(screen.getByText('퇴근까지 3시간 32분')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '퇴근하기' }));
    expect(out).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: '휴게 시작' })).toBeInTheDocument();
  });

  it('상태마다 주 동작: 근무 전 출근하기, 휴게 중 휴게 끝, 퇴근 뒤 단추 없음 + 연장', () => {
    const { rerender } = render(
      <TimeClock status="before" now="2026-11-06T08:40" onClockIn={() => {}} />,
    );
    expect(screen.getByRole('button', { name: '출근하기' })).toBeInTheDocument();
    rerender(
      <TimeClock status="break" now="2026-11-06T12:10" clockIn="08:55" onBreakEnd={() => {}} />,
    );
    expect(screen.getByRole('button', { name: '휴게 끝' })).toBeInTheDocument();
    rerender(<TimeClock status="done" now="2026-11-06T19:10" clockIn="08:50" clockOut="19:00" />);
    expect(screen.queryByRole('button')).toBeNull();
    // 08:50 → 19:00 = 610분 − 휴게 60 = 550 → 연장 70분
    expect(screen.getByText('연장 1시간 10분')).toBeInTheDocument();
  });

  it('근무 시간 계산: 4시간 이하는 휴게를 빼지 않고, 넘으면 넘은 만큼(휴게까지)', () => {
    expect(workedToday('09:00', 12 * 60, 60)).toBe(180);
    expect(workedToday('09:00', 13 * 60 + 20, 60)).toBe(240);
    expect(workedToday('09:00', 18 * 60, 60)).toBe(480);
    expect(workedToday(undefined, 600, 60)).toBe(0);
  });
});

describe('WorkHoursMeter', () => {
  const DAYS = [
    { date: '2026-11-02', regularMinutes: 480, overtimeMinutes: 60 },
    { date: '2026-11-03', regularMinutes: 0, leave: 'annual' as const },
    { date: '2026-11-04', regularMinutes: 480 },
  ];

  it('합계 · meter 값 · 52시간까지 남은 시간 · 요일 막대', () => {
    render(<WorkHoursMeter days={DAYS} today="2026-11-04" />);
    const meter = screen.getByRole('meter', { name: '이번 주 근무 시간' });
    expect(meter).toHaveAttribute('aria-valuenow', '1020');
    expect(meter).toHaveAttribute('aria-valuemax', '3120');
    expect(screen.getByText('17시간')).toBeInTheDocument();
    expect(screen.getByText('52시간까지 35시간 남음')).toBeInTheDocument();
    const days = screen.getByRole('list', { name: '요일별 근무' });
    expect(within(days).getAllByRole('listitem')).toHaveLength(3);
    expect(within(days).getAllByText(/연차/).length).toBeGreaterThan(0);
  });

  it('톤: 48시간부터 경고, 52시간 이상 위험 + 넘은 시간', () => {
    expect(workHoursTone(40 * 60, 48 * 60, 52 * 60)).toBe('ok');
    expect(workHoursTone(49 * 60, 48 * 60, 52 * 60)).toBe('warning');
    expect(workHoursTone(52 * 60, 48 * 60, 52 * 60)).toBe('danger');
    render(<WorkHoursMeter totalMinutes={53 * 60 + 30} />);
    expect(screen.getByText('52시간을 1시간 30분 넘었습니다')).toBeInTheDocument();
    expect(screen.getByText('한도 초과')).toBeInTheDocument();
  });
});

describe('LeaveBalance', () => {
  it('남은 연차 = 발생 − 사용 − 예정, 종류별 줄 · 소멸일 · 사용 촉진', () => {
    render(
      <LeaveBalance
        granted={15}
        used={2.5}
        planned={1}
        basis="fiscal"
        period={{ from: '2026-01-01', to: '2026-12-31' }}
        expiresOn="2026-12-31"
        types={[
          { kind: 'annual', granted: 15, used: 2.5 },
          { kind: 'family', used: 3 },
        ]}
        promotion={{ stage: 1, dueOn: '2026-07-10' }}
      />,
    );
    expect(screen.getByText('11.5')).toBeInTheDocument();
    expect(screen.getByText('2026-01-01~12-31 · 회계연도 기준')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: '발생 15일 · 사용 2.5일 · 예정 1일 · 남음 11.5일' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12월 31일(목)에 소멸')).toBeInTheDocument();
    const types = screen.getByRole('list', { name: '종류별' });
    expect(within(types).getByText('15일 중 2.5일 사용')).toBeInTheDocument();
    expect(within(types).getByText('3일 사용')).toBeInTheDocument();
    expect(screen.getByText(/연차 사용 촉진 1차/)).toBeInTheDocument();
  });

  it('생긴 것보다 많이 쓰면 음수(U+2212)와 앞당겨 쓴 연차', () => {
    render(<LeaveBalance granted={4} used={5} />);
    expect(screen.getByText('−1')).toBeInTheDocument();
    expect(screen.getByText('앞당겨 쓴 연차')).toBeInTheDocument();
  });
});

describe('TeamSchedule', () => {
  const PEOPLE = [
    { id: 'a', name: '김지훈', meta: '팀장' },
    { id: 'b', name: '이수민', meta: '과장' },
  ];
  const EVENTS = [
    {
      id: '1',
      personId: 'a',
      kind: 'trip' as const,
      start: '2026-11-03',
      end: '2026-11-05',
      note: '부산',
    },
    { id: '2', personId: 'b', kind: 'halfAm' as const, start: '2026-11-04' },
    { id: '3', personId: 'b', kind: 'remote' as const, start: '2026-11-04', end: '2026-11-05' },
    { id: '4', personId: 'a', kind: 'annual' as const, start: '2026-10-30', end: '2026-11-02' },
  ];

  it('표: 날짜 머리 · 이름 행 머리 · 여러 날은 칸을 합치고 범위 밖은 자른다', () => {
    const { container } = render(
      <TeamSchedule
        caption="영업1팀 이번 주"
        people={PEOPLE}
        events={EVENTS}
        start="2026-11-02"
        days={7}
        today="2026-11-06"
      />,
    );
    const table = screen.getByRole('table', { name: '영업1팀 이번 주' });
    expect(within(table).getAllByRole('columnheader')).toHaveLength(8);
    expect(
      within(table).getByRole('columnheader', { name: '11월 6일 금요일 · 오늘' }),
    ).toBeInTheDocument();
    expect(within(table).getByRole('rowheader', { name: /김지훈/ })).toBeInTheDocument();
    const trip = container
      .querySelector('.tl-team-schedule__event[data-tone="ecm"]')!
      .closest('td')!;
    expect(trip).toHaveAttribute('colspan', '3');
    const annual = container.querySelector(
      '.tl-team-schedule__event[data-tone="erp"][data-clip-start]',
    );
    expect(annual).not.toBeNull();
    // 겹친 일정은 줄을 나누고 이름 칸이 두 줄을 덮는다
    expect(within(table).getByRole('rowheader', { name: /이수민/ })).toHaveAttribute(
      'rowspan',
      '2',
    );
    // 범례는 쓰인 종류만
    const legend = screen.getByRole('list', { name: '일정 종류' });
    expect(
      within(legend)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['연차', '오전 반차', '재택', '출장']);
  });

  it('onEventPress가 있으면 일정이 이름 있는 단추', () => {
    const press = vi.fn();
    render(
      <TeamSchedule
        caption="팀"
        people={PEOPLE}
        events={EVENTS.slice(0, 1)}
        start="2026-11-02"
        onEventPress={press}
      />,
    );
    const btn = screen.getByRole('button', {
      name: '김지훈 · 출장 · 11월 3일(화)~11월 5일(목) · 부산',
    });
    fireEvent.click(btn);
    expect(press).toHaveBeenCalledWith(EVENTS[0]);
  });

  it('줄 나누기: 겹치지 않으면 한 줄, 겹치면 다음 줄', () => {
    const lanes = scheduleLanes(EVENTS, '2026-11-02', 7);
    expect(lanes.get('a')).toHaveLength(1);
    expect(lanes.get('b')).toHaveLength(2);
  });

  it('영어 locale: 종류 · 머리 글자도 사전에서', () => {
    render(
      <TrellisProvider locale="en">
        <TeamSchedule caption="Team" people={PEOPLE} events={EVENTS} start="2026-11-02" />
      </TrellisProvider>,
    );
    expect(screen.getByRole('columnheader', { name: 'Member' })).toBeInTheDocument();
    expect(screen.getAllByText('Business trip').length).toBeGreaterThan(0);
  });
});

describe('Payslip', () => {
  it('법정 기재 사항: 근로자 · 지급일 · 연장 시간 · 항목 · 계산 방법 · 합계 · 실지급액', () => {
    render(
      <Payslip
        period="2026-10"
        payDate="2026-10-23"
        employee={{
          name: '박서연',
          employeeNo: 'E-031',
          department: '경영지원팀',
          position: '대리',
        }}
        work={{ days: 20, hours: 166, overtimeHours: 6 }}
        earnings={[
          { code: 'basePay', amount: 3200000 },
          { code: 'overtimePay', amount: 137799, basis: '6시간 × 15,311원 × 1.5' },
          { code: 'mealAllowance', amount: 200000, taxFree: true },
        ]}
        deductions={[
          { code: 'nationalPension', amount: 158500 },
          { code: 'incomeTax', amount: 105540 },
        ]}
      />,
    );
    expect(screen.getByRole('article', { name: '2026년 10월 임금명세서' })).toBeInTheDocument();
    expect(screen.getByText('E-031')).toBeInTheDocument();
    expect(screen.getByText('6시간')).toBeInTheDocument();
    // 야간 · 휴일은 0이어도 적는다
    expect(screen.getAllByText('0시간')).toHaveLength(2);
    const earnings = screen.getByRole('table', { name: '지급 항목' });
    expect(within(earnings).getByRole('rowheader', { name: /연장근로수당/ })).toHaveTextContent(
      '6시간 × 15,311원 × 1.5',
    );
    expect(within(earnings).getByText('비과세')).toBeInTheDocument();
    expect(within(earnings).getByText('3,537,799')).toBeInTheDocument();
    const deductions = screen.getByRole('table', { name: '공제 항목' });
    expect(within(deductions).getByText('264,040')).toBeInTheDocument();
    expect(screen.getByText('3,273,759')).toBeInTheDocument();
    expect(screen.getAllByText('금액 단위 원')).toHaveLength(1);
  });

  it('사번이 없으면 생년월일', () => {
    render(
      <Payslip
        period="2026-10"
        payDate="2026-11-05"
        employee={{ name: '정하늘', birthDate: '2003-04-17' }}
        earnings={[{ label: '주휴수당', amount: 198144 }]}
        deductions={[]}
      />,
    );
    expect(screen.getByText('생년월일')).toBeInTheDocument();
    expect(screen.getByText('2003-04-17')).toBeInTheDocument();
  });
});
