// 시험 서비스(trellis-trial)가 찾은 컴포넌트 문제(R-T12 · R-T14 · R-T33 · R-T35 · R-T39 · R-T46 · R-T51)와
// search 칸 지우기 단추 두 개를 막는다
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AppShell,
  ApprovalLine,
  Avatar,
  IconButton,
  Input,
  Menu,
  OrgChart,
  Payslip,
  PersonLabel,
  TeamSchedule,
  WorkHoursMeter,
  useBreakpoint,
} from '../src/core/index.js';
import { splitWorkDays } from '../src/WorkHoursMeter/WorkHoursMeter.js';

/** 창 폭 width인 것처럼 matchMedia를 바꾼다. (min-width: Npx)만 해석한다 */
function viewport(width: number) {
  const listeners = new Set<() => void>();
  vi.stubGlobal(
    'matchMedia',
    vi.fn((media: string) => {
      const min = /min-width:\s*(\d+)px/.exec(media);
      return {
        matches: min ? width >= Number(min[1]) : false,
        media,
        onchange: null,
        addEventListener: (_: string, cb: () => void) => listeners.add(cb),
        removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      };
    }),
  );
  return {
    resize(next: number) {
      width = next;
      for (const cb of listeners) cb();
    },
  };
}
afterEach(() => vi.unstubAllGlobals());

const css = (rel: string) => readFileSync(join(process.cwd(), 'src', rel), 'utf8');

describe('useBreakpoint (R-T12 · R-T13)', () => {
  it('토큰 breakpoint로 폭 단계를 돌려주고 폭이 바뀌면 다시 그린다', () => {
    const vp = viewport(344);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('base');
    act(() => vp.resize(800));
    expect(result.current).toBe('md');
    act(() => vp.resize(1440));
    expect(result.current).toBe('xl');
    act(() => vp.resize(1600));
    expect(result.current).toBe('2xl');
  });

  it('matchMedia가 없으면 넓은 화면(xl)', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('xl');
  });
});

describe('AppShell 휴대폰 폭 user 칸 (R-T12)', () => {
  const MENU = [
    { type: 'label' as const, label: '역할 바꾸기' },
    { id: 'lead', label: '팀장', icon: 'check' as const, onSelect: vi.fn() },
    { id: 'logout', label: '로그아웃', icon: 'log-out' as const },
  ];

  it('344에서는 아바타 단추 하나(이름 = 사용자 이름)가 userMenu를 아래 시트로 연다', async () => {
    viewport(344);
    render(
      <AppShell
        brand="테라스원 인사"
        actions={
          <>
            <IconButton icon="sliders-horizontal" label="보기 설정" />
            <IconButton icon="bell" label="알림" />
          </>
        }
        user={<span>김재희 · 팀장</span>}
        userName="김재희"
        userMenu={MENU}
      >
        본문
      </AppShell>,
    );
    // 넓은 화면 내용(이름 · 역할 글자)은 바에 없다
    expect(screen.queryByText('김재희 · 팀장')).toBeNull();
    const button = screen.getByRole('button', { name: '김재희' });
    expect(button).toHaveClass('tl-app-shell__user-button');
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    // 아바타는 꾸밈이라 이름을 두 번 읽지 않는다
    expect(button.querySelector('.tl-avatar')).toHaveAttribute('aria-hidden', 'true');
    // 동작 단추는 그대로 바에 남는다
    expect(screen.getByRole('button', { name: '보기 설정' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument();
    fireEvent.click(button);
    const sheet = await screen.findByRole('dialog', { name: '김재희' });
    expect(within(sheet).getByRole('group', { name: '역할 바꾸기' })).toBeInTheDocument();
    fireEvent.click(within(sheet).getByRole('button', { name: '팀장' }));
    expect(MENU[1]!.onSelect).toHaveBeenCalledOnce();
  });

  it('userMenu가 없으면 아바타 단추가 user 칸 내용을 시트로 연다', async () => {
    viewport(344);
    render(
      <AppShell brand="테라스원" user={<span>김재희 · 팀장</span>} userName="김재희">
        본문
      </AppShell>,
    );
    const button = screen.getByRole('button', { name: '김재희' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    const sheet = await screen.findByRole('dialog', { name: '김재희' });
    expect(within(sheet).getByText('김재희 · 팀장')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('넓은 화면은 user 그대로, user가 없으면 아바타 + 이름 단추가 userMenu를 연다', () => {
    viewport(1440);
    const { unmount } = render(
      <AppShell brand="테라스원" user={<span>김재희 · 팀장</span>} userName="김재희">
        본문
      </AppShell>,
    );
    expect(screen.getByText('김재희 · 팀장')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '김재희' })).toBeNull();
    unmount();
    render(
      <AppShell brand="테라스원" userName="김재희" userMenu={MENU}>
        본문
      </AppShell>,
    );
    const trigger = screen.getByRole('button', { name: '김재희' });
    expect(trigger).toHaveClass('tl-app-shell__user-trigger');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('userName 없이 user만 주면 휴대폰 폭에서도 그대로 그린다(예전 동작)', () => {
    viewport(344);
    render(
      <AppShell brand="테라스원" user={<span>김재희</span>}>
        본문
      </AppShell>,
    );
    expect(screen.getByText('김재희')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '김재희' })).toBeNull();
  });

  it('휴대폰 폭 CSS: brand가 먼저 줄고 동작 칸은 줄지 않는다', () => {
    const narrow = css('AppShell/AppShell.css').split('@media (max-width: 639px)')[1]!;
    expect(narrow).toMatch(/\.tl-app-shell__brand \{\s*flex: 0 1 auto;\s*overflow: hidden;/);
    expect(narrow).toMatch(/\.tl-app-shell__actions \{\s*flex: none;/);
  });
});

describe('ApprovalLine 좁은 폭 (R-T14)', () => {
  it('루트 min-width 0, 의견은 contain: inline-size로 부모 최소 폭을 넓히지 않는다', () => {
    const src = css('ApprovalLine/ApprovalLine.css');
    expect(src).toMatch(/\.tl-approval-line \{[^}]*min-width: 0;[^}]*max-width: 100%;/);
    expect(src).toMatch(/\.tl-approval-line__comment \{[^}]*contain: inline-size;/);
    render(
      <ApprovalLine
        orientation="vertical"
        approvers={[
          { id: 'a', name: '최하늘', title: '사원', state: 'draft' },
          {
            id: 'b',
            name: '한도윤',
            title: '팀장',
            state: 'rejected',
            comment:
              '수입 통관 비용이 견적에서 빠졌습니다. 관세 · 부가세 포함으로 다시 올려 주세요',
          },
        ]}
      />,
    );
    // 잘린 의견 전체는 title로 남는다
    expect(screen.getByText(/수입 통관 비용/)).toHaveAttribute(
      'title',
      '수입 통관 비용이 견적에서 빠졌습니다. 관세 · 부가세 포함으로 다시 올려 주세요',
    );
  });
});

describe('WorkHoursMeter 연장 기준 (R-T33)', () => {
  // 하루 8시간을 넘은 기록 3시간, 주 합계 32시간 30분(40시간 아래)
  const DAYS = [
    { date: '2026-11-02', regularMinutes: 480, overtimeMinutes: 60 },
    { date: '2026-11-03', regularMinutes: 480 },
    { date: '2026-11-04', regularMinutes: 0, leave: 'annual' as const },
    { date: '2026-11-05', regularMinutes: 480, overtimeMinutes: 120 },
    { date: '2026-11-06', regularMinutes: 330 },
  ];
  const overtimeBars = () =>
    document.querySelectorAll('.tl-work-hours__bar-seg[data-kind="overtime"]').length;

  it('주 기준(기본): 40시간 아래면 요약 · 범례 · 요일 막대 모두 연장 0', () => {
    render(<WorkHoursMeter days={DAYS} />);
    expect(document.querySelector('.tl-work-hours__body')).toHaveAttribute(
      'data-overtime-basis',
      'week',
    );
    expect(screen.getByText('연장 0분')).toBeInTheDocument();
    expect(overtimeBars()).toBe(0);
    expect(screen.getByText('연장은 주 40시간을 넘은 시간입니다')).toBeInTheDocument();
  });

  it('하루 기준: 기록한 연장의 합이 요약 · 범례 · 요일 막대에 같이 보인다', () => {
    render(<WorkHoursMeter days={DAYS} overtimeBasis="day" />);
    expect(screen.getByText('연장 3시간')).toBeInTheDocument();
    expect(screen.getByText('정규 29시간 30분')).toBeInTheDocument();
    expect(overtimeBars()).toBe(2);
    expect(document.querySelector('.tl-work-hours__seg[data-kind="overtime"]')).not.toBeNull();
    expect(screen.getByText('연장은 날마다 소정 근로를 넘은 시간의 합입니다')).toBeInTheDocument();
  });

  it('주 기준 요일 막대: 날짜 순 누계가 40시간을 넘은 날부터 연장', () => {
    const week = [
      { date: '2026-11-03', regularMinutes: 480, overtimeMinutes: 90 },
      { date: '2026-11-02', regularMinutes: 480, overtimeMinutes: 60 },
      { date: '2026-11-04', regularMinutes: 480 },
      { date: '2026-11-05', regularMinutes: 480, overtimeMinutes: 120 },
      { date: '2026-11-06', regularMinutes: 480, overtimeMinutes: 30 },
    ];
    const split = splitWorkDays(week, 'week', 2400);
    expect(split.get('2026-11-05')).toEqual({ regular: 600, overtime: 0 });
    expect(split.get('2026-11-06')).toEqual({ regular: 210, overtime: 300 });
    const total = [...split.values()].reduce((s, d) => s + d.overtime, 0);
    expect(total).toBe(300);
    render(<WorkHoursMeter days={week} />);
    expect(screen.getByText('연장 5시간')).toBeInTheDocument();
    expect(overtimeBars()).toBe(1);
  });

  it('요일이 없으면 하루 기준을 셀 수 없어 주 기준', () => {
    render(<WorkHoursMeter totalMinutes={42 * 60} overtimeBasis="day" />);
    expect(screen.getByText('연장 2시간')).toBeInTheDocument();
    expect(screen.queryByText(/연장은/)).toBeNull();
  });
});

describe('Menu 항목 아이콘 · 좁은 화면 시트 (R-T39)', () => {
  const ITEMS = [
    { id: 'density', label: '넓게 보기', icon: 'list' as const },
    { id: 'theme', label: '다크 테마', icon: 'moon' as const },
    { id: 'plain', label: '아이콘 없음' },
  ];

  it('넓은 화면 팝업: 아이콘을 라벨 앞에 그리고 아이콘 없는 항목은 칸을 비운다', async () => {
    viewport(1440);
    render(
      <Menu trigger={<IconButton icon="sliders-horizontal" label="보기 설정" />} items={ITEMS} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '보기 설정' }));
    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');
    expect(items[0]!.querySelector('svg.tl-menu__icon')).not.toBeNull();
    expect(items[2]!.querySelector('span.tl-menu__icon[aria-hidden]')).not.toBeNull();
  });

  it('좁은 화면 시트: dialog 안 button 항목에도 같은 아이콘', async () => {
    viewport(344);
    render(
      <Menu trigger={<IconButton icon="sliders-horizontal" label="보기 설정" />} items={ITEMS} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '보기 설정' }));
    const sheet = await screen.findByRole('dialog', { name: '보기 설정' });
    expect(within(sheet).queryAllByRole('menuitem')).toHaveLength(0);
    const theme = within(sheet).getByRole('button', { name: '다크 테마' });
    expect(theme.querySelector('svg.tl-menu-sheet__icon')).not.toBeNull();
    expect(
      within(sheet)
        .getByRole('button', { name: '아이콘 없음' })
        .querySelector('span.tl-menu-sheet__icon'),
    ).not.toBeNull();
  });

  it('좁은 화면 시트를 Escape로 닫으면 포커스가 트리거로 돌아온다', async () => {
    viewport(344);
    render(
      <Menu trigger={<IconButton icon="sliders-horizontal" label="보기 설정" />} items={ITEMS} />,
    );
    const trigger = screen.getByRole('button', { name: '보기 설정' });
    trigger.focus();
    fireEvent.click(trigger);
    const sheet = await screen.findByRole('dialog', { name: '보기 설정' });
    fireEvent.keyDown(sheet, { key: 'Escape' });
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(trigger).toHaveFocus();
  });
});

describe('Avatar 이니셜 한 규칙 (R-T46)', () => {
  it('크기와 관계없이 한글 이름은 성을 뺀 두 글자', () => {
    for (const size of [24, 32, 40, 48] as const) {
      const { unmount } = render(<Avatar name="김재희" size={size} testID="a" />);
      expect(screen.getByTestId('a')).toHaveTextContent('재희');
      unmount();
    }
  });

  it('PersonLabel sm · md, OrgChart, TeamSchedule이 같은 이니셜', () => {
    const initials = () =>
      [...document.querySelectorAll('.tl-avatar__initials')].map((n) => n.textContent);
    const { unmount: u1 } = render(
      <>
        <PersonLabel name="김재희" size="sm" />
        <PersonLabel name="김재희" size="md" />
      </>,
    );
    expect(initials()).toEqual(['재희', '재희']);
    u1();
    const { unmount: u2 } = render(
      <OrgChart
        label="조직도"
        nodes={[{ id: 'hq', name: '본사', head: { name: '김재희', title: '대표' }, headcount: 1 }]}
      />,
    );
    expect(initials()).toEqual(['재희']);
    u2();
    render(
      <TeamSchedule
        caption="팀 일정"
        start="2026-11-02"
        days={5}
        people={[{ id: 'p1', name: '김재희' }]}
        events={[]}
      />,
    );
    expect(initials()).toEqual(['재희']);
  });
});

describe('PersonLabel sm 근무 상태는 점만 (R-T35)', () => {
  it('sm은 점 + 숨은 글자(툴팁), md는 점 + 보이는 글자', () => {
    const { unmount } = render(
      <PersonLabel name="이하늘" meta="플랫폼팀" size="sm" presence="remote" onPress={() => {}} />,
    );
    const button = screen.getByRole('button', { name: /이하늘/ });
    // 링크 · 단추 이름 = 이름 + 보조 글자 + 근무 상태(sm에서도 숨은 글자로 읽는다)
    expect(button).toHaveAccessibleName(/이하늘.*플랫폼팀.*재택/);
    const presence = button.querySelector('.tl-person-label__presence')!;
    expect(presence).toHaveAttribute('title', '재택');
    expect(presence.querySelector('.tl-status-dot__label')).toBeNull();
    expect(within(presence as HTMLElement).getByText('재택')).toHaveClass('tl-sr-only');
    unmount();
    render(<PersonLabel name="이하늘" size="md" presence="remote" />);
    expect(screen.getByText('재택')).toHaveClass('tl-status-dot__label');
  });
});

describe('Payslip 직위 · 직급 (R-T51)', () => {
  const base = {
    period: '2026-10',
    payDate: '2026-10-23',
    earnings: [{ code: 'basePay' as const, amount: 3200000 }],
    deductions: [],
  };

  it('position은 직위, grade는 직급', () => {
    render(
      <Payslip
        {...base}
        employee={{ name: '박서연', employeeNo: 'E-031', position: '대리', grade: 'G2' }}
      />,
    );
    expect(screen.getByText('직위').nextElementSibling).toHaveTextContent('대리');
    expect(screen.getByText('직급').nextElementSibling).toHaveTextContent('G2');
  });

  it('직급이 직위와 같으면 한 번만', () => {
    render(
      <Payslip
        {...base}
        employee={{ name: '박서연', employeeNo: 'E-031', position: '대리', grade: '대리' }}
      />,
    );
    expect(screen.getByText('직위')).toBeInTheDocument();
    expect(screen.queryByText('직급')).toBeNull();
  });
});

describe('Input search + clearable', () => {
  it('Trellis 지우기 단추가 있으면 브라우저 지우기 단추를 숨긴다', () => {
    render(<Input type="search" label="검색" defaultValue="김" clearable />);
    const root = screen.getByRole('searchbox', { name: '검색' }).closest('.tl-input');
    expect(root).toHaveAttribute('data-clearable');
    expect(screen.getAllByRole('button', { name: '지우기' })).toHaveLength(1);
    expect(css('Input/Input.css')).toMatch(
      /\.tl-input\[data-clearable\] \.tl-input__control::-webkit-search-cancel-button[^{]*\{\s*display: none;/,
    );
    fireEvent.click(screen.getByRole('button', { name: '지우기' }));
    expect(screen.getByRole('searchbox', { name: '검색' })).toHaveValue('');
  });
});
