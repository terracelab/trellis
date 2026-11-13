// R-37 · R-41 · R-42: 아이콘 크기 토큰 · 개수 배지, AppShell 옆 칸 폭 · 사이드바 접기 · 저절로 접힘 · brandCollapsed,
// SideNav 묶음 열림 제어 · 지금 화면 드러내기 · 접힌 묶음 표시, AgentReplay(재생 층)
import {
  AgentReplayContract,
  AppShellContract,
  SideNavContract,
  type AgentReplayProps,
  type AppShellProps,
  type SideNavProps,
  type SideNavSection,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  AgentReplay,
  AppShell,
  AppShellAside,
  Icon,
  IconButton,
  SideNav,
} from '../src/core/index.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

/** ResizeObserver가 틀 폭을 width로 알린다(jsdom에는 없다) */
function observeWidth(width: number) {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private cb: ResizeObserverCallback) {}
      observe() {
        this.cb(
          [{ contentRect: { width } } as ResizeObserverEntry],
          this as unknown as ResizeObserver,
        );
      }
      unobserve() {}
      disconnect() {}
    },
  );
}

const sections: SideNavSection[] = [
  { id: 'home', items: [{ id: 'dashboard', label: '대시보드', icon: 'layout-dashboard' }] },
  {
    id: 'ops',
    label: 'Operations',
    collapsible: true,
    items: [
      { id: 'tax', label: '세무 캘린더' },
      { id: 'contracts', label: '계약' },
    ],
  },
  {
    id: 'people',
    label: 'Employees',
    collapsible: true,
    items: [
      { id: 'members', label: '구성원' },
      { id: 'payroll', label: '급여' },
    ],
  },
];

describe('contract', () => {
  it('새 props가 contract에 있고 웹 props가 받는다', () => {
    expect(Object.keys(AppShellContract.props)).toEqual(
      expect.arrayContaining([
        'brandCollapsed',
        'defaultSidebarCollapsed',
        'onSidebarCollapsedChange',
        'autoCollapseSidebar',
        'asideWidth',
        'defaultAsideWidth',
        'onAsideWidthChange',
      ]),
    );
    expect(Object.keys(SideNavContract.props)).toEqual(
      expect.arrayContaining(['onSectionOpenChange', 'revealActive']),
    );
    type ShellKeys =
      | 'sidebarCollapsed'
      | 'defaultSidebarCollapsed'
      | 'onSidebarCollapsedChange'
      | 'autoCollapseSidebar'
      | 'asideWidth'
      | 'defaultAsideWidth'
      | 'onAsideWidthChange';
    expectTypeOf<Pick<AppShellProps, ShellKeys>>().toMatchTypeOf<
      Pick<ComponentProps<typeof AppShell>, ShellKeys>
    >();
    type NavKeys = 'onSectionOpenChange' | 'revealActive' | 'collapsed' | 'sections';
    expectTypeOf<Pick<SideNavProps, NavKeys>>().toMatchTypeOf<
      Pick<ComponentProps<typeof SideNav>, NavKeys>
    >();
  });

  it('AgentReplay: displayName · id · testID · 웹 props가 contract를 포함, status마다 data-status', () => {
    expect(AgentReplay.displayName).toBe(AgentReplayContract.name);
    expect(Object.keys(AgentReplayContract.props)).toEqual(
      expect.arrayContaining(['id', 'testID']),
    );
    expectTypeOf<AgentReplayProps>().toMatchTypeOf<ComponentProps<typeof AgentReplay>>();
    for (const status of AgentReplayContract.props.status.values ?? []) {
      const { container, unmount } = render(
        <AgentReplay container={null} status={status as never} label="도우미" caption="하는 중" />,
      );
      expect(container.querySelector('.tl-agent-replay')).toHaveAttribute('data-status', status);
      unmount();
    }
  });
});

describe('Icon · IconButton 크기 토큰(R-37)', () => {
  it('Icon은 크기를 data-size로도 알린다(CSS가 size.icon.* 토큰으로 정한다), 속성은 그대로', () => {
    const { container } = render(
      <>
        <Icon name="receipt" />
        <Icon name="receipt" size={20} />
        <Icon name="receipt" size={24} />
      </>,
    );
    const svgs = container.querySelectorAll('svg.tl-icon');
    expect([...svgs].map((s) => s.getAttribute('data-size'))).toEqual(['16', '20', '24']);
    expect([...svgs].map((s) => s.getAttribute('width'))).toEqual(['16', '20', '24']);
  });

  it('IconButton 개수 배지는 그대로 그려진다(크기는 CSS가 글자 크기에서 정한다)', () => {
    const { container } = render(<IconButton icon="bell" label="알림" count={7} />);
    expect(container.querySelector('.tl-icon-button__count')).toHaveTextContent('7');
    expect(screen.getByRole('button', { name: '알림 7' })).toBeInTheDocument();
  });
});

describe('AppShell 사이드바 접기(R-41)', () => {
  it('기본은 접기 단추가 없다(지금 모양 그대로)', () => {
    render(
      <AppShell fill="contained" brand="테라스원" sidebar={<SideNav sections={sections} />}>
        본문
      </AppShell>,
    );
    expect(screen.queryByRole('button', { name: '메뉴 접기' })).toBeNull();
  });

  it('onSidebarCollapsedChange를 주면 단추가 생기고, 접히면 SideNav · brand가 따라간다', () => {
    function Demo() {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <AppShell
          fill="contained"
          brand="테라스원"
          brandCollapsed="TO"
          sidebarCollapsed={collapsed}
          onSidebarCollapsedChange={setCollapsed}
          sidebar={<SideNav activeId="dashboard" sections={sections} />}
        >
          본문
        </AppShell>
      );
    }
    const { container } = render(<Demo />);
    const nav = () => container.querySelector('.tl-side-nav')!;
    expect(nav()).not.toHaveAttribute('data-collapsed');
    fireEvent.click(screen.getByRole('button', { name: '메뉴 접기' }));
    expect(nav()).toHaveAttribute('data-collapsed');
    expect(container.querySelector('.tl-app-shell')).toHaveAttribute('data-collapsed');
    expect(container.querySelector('.tl-app-shell__nav-brand')).toHaveTextContent('TO');
    fireEvent.click(screen.getByRole('button', { name: '메뉴 펴기' }));
    expect(nav()).not.toHaveAttribute('data-collapsed');
    expect(container.querySelector('.tl-app-shell__nav-brand')).toHaveTextContent('테라스원');
  });

  it('SideNav에 collapsed를 따로 주면 그것이 이긴다', () => {
    const { container } = render(
      <AppShell
        fill="contained"
        brand="테라스원"
        sidebarCollapsed
        sidebar={<SideNav collapsed={false} sections={sections} />}
      >
        본문
      </AppShell>,
    );
    expect(container.querySelector('.tl-side-nav')).not.toHaveAttribute('data-collapsed');
  });

  it('옆 칸 열로 본문이 1024보다 좁아지면 저절로 접히고, 펴면 옆 칸을 닫을 때까지 펼친 채', () => {
    observeWidth(1500); // 240 + 400 + 1024 = 1664보다 좁다
    const onCollapsed = vi.fn();
    function Demo({ auto = true }: { auto?: boolean }) {
      const [open, setOpen] = useState(true);
      return (
        <AppShell
          fill="contained"
          brand="테라스원"
          autoCollapseSidebar={auto}
          onSidebarCollapsedChange={onCollapsed}
          sidebar={<SideNav sections={sections} />}
          asideTitle="업무 도우미"
          asideOpen={open}
          onAsideOpenChange={setOpen}
          aside={<p>대화</p>}
        >
          <button type="button" onClick={() => setOpen(!open)}>
            도우미
          </button>
        </AppShell>
      );
    }
    const { container, unmount } = render(<Demo />);
    const nav = () => container.querySelector('.tl-side-nav')!;
    expect(nav()).toHaveAttribute('data-collapsed');
    // 사람이 다시 펴면 그대로 둔다. 저절로 접힘은 앱 값을 바꾸지 않는다
    fireEvent.click(screen.getByRole('button', { name: '메뉴 펴기' }));
    expect(nav()).not.toHaveAttribute('data-collapsed');
    expect(onCollapsed).not.toHaveBeenCalled();
    // 옆 칸을 닫으면 사이드바는 펼친 채, 다시 열면 다시 저절로 접힌다
    fireEvent.click(screen.getByRole('button', { name: '업무 도우미 닫기' }));
    expect(nav()).not.toHaveAttribute('data-collapsed');
    fireEvent.click(screen.getByRole('button', { name: '도우미' }));
    expect(nav()).toHaveAttribute('data-collapsed');
    unmount();
    // 끄면 접히지 않는다
    const off = render(<Demo auto={false} />);
    expect(off.container.querySelector('.tl-side-nav')).not.toHaveAttribute('data-collapsed');
  });

  it('틀이 넓으면 저절로 접히지 않는다', () => {
    observeWidth(1800);
    const { container } = render(
      <AppShell
        fill="contained"
        brand="테라스원"
        sidebar={<SideNav sections={sections} />}
        asideTitle="업무 도우미"
        defaultAsideOpen
        aside={<p>대화</p>}
      >
        본문
      </AppShell>,
    );
    expect(container.querySelector('.tl-side-nav')).not.toHaveAttribute('data-collapsed');
  });

  it('본문 안 AppShellAside가 열려도 저절로 접힌다', () => {
    observeWidth(1500);
    const { container } = render(
      <AppShell fill="contained" brand="테라스원" sidebar={<SideNav sections={sections} />}>
        <AppShellAside title="업무 도우미" defaultOpen>
          대화
        </AppShellAside>
      </AppShell>,
    );
    expect(container.querySelector('.tl-side-nav')).toHaveAttribute('data-collapsed');
  });
});

describe('AppShell 옆 칸 폭(R-41)', () => {
  function Demo({ onWidth }: { onWidth: (w: number) => void }) {
    const [width, setWidth] = useState<number | undefined>(undefined);
    return (
      <AppShell
        fill="contained"
        brand="테라스원"
        asideTitle="업무 도우미"
        defaultAsideOpen
        asideWidth={width}
        onAsideWidthChange={(w) => {
          setWidth(w);
          onWidth(w);
        }}
        aside={<p>대화</p>}
      >
        본문
      </AppShell>
    );
  }

  it('손잡이는 separator(이름 · 값 · aria-controls)이고 ← → Home End Enter로 폭을 바꾼다', () => {
    const onWidth = vi.fn();
    const { container } = render(<Demo onWidth={onWidth} />);
    const handle = screen.getByRole('separator', { name: '업무 도우미 폭' });
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    expect(handle).toHaveAttribute(
      'aria-controls',
      container.querySelector('aside.tl-app-shell__aside')!.id,
    );
    expect(handle).toHaveAttribute('aria-valuenow', '400');
    expect(handle).toHaveAttribute('aria-valuemin', '320');
    expect(handle).toHaveAttribute('aria-valuemax', '720');
    expect(handle).toHaveAttribute('tabindex', '0');
    // jsdom 시험 설정은 모든 요소 폭을 480으로 잰다(test/setup.ts). 화살표는 지금 잰 폭에서 space.16씩
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(onWidth).toHaveBeenLastCalledWith(496);
    expect(handle).toHaveAttribute('aria-valuenow', '496');
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onWidth).toHaveBeenLastCalledWith(464);
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(onWidth).toHaveBeenLastCalledWith(320);
    fireEvent.keyDown(handle, { key: 'End' });
    expect(onWidth).toHaveBeenLastCalledWith(720);
    fireEvent.keyDown(handle, { key: 'Enter' });
    expect(onWidth).toHaveBeenLastCalledWith(400);
    // 폭은 틀의 CSS 변수로 들어간다
    expect(
      (container.querySelector('.tl-app-shell') as HTMLElement).style.getPropertyValue(
        '--tl-app-shell-aside-width',
      ),
    ).toBe('400px');
  });

  it('두 번 누르면 기본 폭', () => {
    const onWidth = vi.fn();
    render(<Demo onWidth={onWidth} />);
    const handle = screen.getByRole('separator');
    fireEvent.keyDown(handle, { key: 'End' });
    fireEvent.doubleClick(handle);
    expect(onWidth).toHaveBeenLastCalledWith(400);
  });

  it('끄는 동안은 화면만 바꾸고 손을 떼면 한 번 알린다', () => {
    const onWidth = vi.fn();
    const { container } = render(<Demo onWidth={onWidth} />);
    const handle = screen.getByRole('separator');
    handle.setPointerCapture = () => {};
    const shell = container.querySelector('.tl-app-shell') as HTMLElement;
    fireEvent.pointerDown(handle, { button: 0, clientX: 500, pointerId: 1 });
    act(() => {
      handle.dispatchEvent(new MouseEvent('pointermove', { clientX: 400 }));
    });
    expect(shell).toHaveAttribute('data-resizing');
    // 잰 폭 480에서 왼쪽으로 100 끌면 580
    expect(shell.style.getPropertyValue('--tl-app-shell-aside-width')).toBe('580px');
    expect(onWidth).not.toHaveBeenCalled();
    act(() => {
      handle.dispatchEvent(new MouseEvent('pointerup', { clientX: 400 }));
    });
    expect(onWidth).toHaveBeenCalledTimes(1);
    expect(onWidth).toHaveBeenLastCalledWith(580);
    expect(shell).not.toHaveAttribute('data-resizing');
    // 범위 밖으로 끌면 끝에서 멈춘다(최소 320 · 최대 720)
    fireEvent.pointerDown(handle, { button: 0, clientX: 500, pointerId: 1 });
    act(() => {
      handle.dispatchEvent(new MouseEvent('pointermove', { clientX: 1400 }));
      handle.dispatchEvent(new MouseEvent('pointerup', { clientX: 1400 }));
    });
    expect(onWidth).toHaveBeenLastCalledWith(320);
    fireEvent.pointerDown(handle, { button: 0, clientX: 500, pointerId: 1 });
    act(() => {
      handle.dispatchEvent(new MouseEvent('pointermove', { clientX: -900 }));
      handle.dispatchEvent(new MouseEvent('pointerup', { clientX: -900 }));
    });
    expect(onWidth).toHaveBeenLastCalledWith(720);
  });

  it('본문 안 AppShellAside도 같은 손잡이를 쓰고, 틀 밖이면 손잡이가 없다', () => {
    const { unmount } = render(
      <AppShell fill="contained" brand="테라스원">
        <AppShellAside title="업무 도우미" defaultOpen>
          대화
        </AppShellAside>
      </AppShell>,
    );
    expect(screen.getByRole('separator', { name: '업무 도우미 폭' })).toBeInTheDocument();
    unmount();
    render(
      <AppShellAside title="업무 도우미" defaultOpen>
        대화
      </AppShellAside>,
    );
    expect(screen.queryByRole('separator')).toBeNull();
  });
});

describe('SideNav 묶음 열림(R-42)', () => {
  const head = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}`) });

  it('지금 화면이 든 묶음은 defaultOpen이 false여도 열린 채 시작한다(revealActive)', () => {
    render(
      <SideNav activeId="payroll" sections={sections.map((s) => ({ ...s, defaultOpen: false }))} />,
    );
    expect(head('Employees')).toHaveAttribute('aria-expanded', 'true');
    expect(head('Operations')).toHaveAttribute('aria-expanded', 'false');
  });

  it('닫힌 묶음은 aria-controls가 없고, 열리면 그린 목록을 가리킨다 · data-section-id', () => {
    const { container } = render(<SideNav sections={sections} />);
    const ops = head('Operations');
    expect(ops).toHaveAttribute('data-section-id', 'ops');
    expect(container.querySelector('.tl-side-nav__section[data-section-id="ops"]')).not.toBeNull();
    expect(ops).not.toHaveAttribute('aria-controls');
    fireEvent.click(ops);
    const list = document.getElementById(ops.getAttribute('aria-controls')!);
    expect(list).not.toBeNull();
    expect(within(list!).getByText('계약')).toBeInTheDocument();
  });

  it('비제어도 머리를 누르면 onSectionOpenChange를 부른다', () => {
    const onChange = vi.fn();
    render(<SideNav sections={sections} onSectionOpenChange={onChange} />);
    fireEvent.click(head('Operations'));
    expect(onChange).toHaveBeenLastCalledWith('ops', true);
  });

  it('제어: 머리를 누르면 알리기만 하고 open 값을 그린다', () => {
    const onChange = vi.fn();
    render(
      <SideNav
        sections={sections.map((s) => (s.collapsible ? { ...s, open: false } : s))}
        onSectionOpenChange={onChange}
      />,
    );
    fireEvent.click(head('Operations'));
    expect(onChange).toHaveBeenLastCalledWith('ops', true);
    expect(head('Operations')).toHaveAttribute('aria-expanded', 'false');
  });

  it('지금 화면이 접힌 묶음 안으로 바뀌면 연다(비제어 · 다시 그리지 않음)', () => {
    const { rerender, container } = render(<SideNav activeId="dashboard" sections={sections} />);
    const scroll = container.querySelector('.tl-side-nav__scroll')!;
    expect(head('Employees')).toHaveAttribute('aria-expanded', 'false');
    rerender(<SideNav activeId="payroll" sections={sections} />);
    expect(head('Employees')).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('.tl-side-nav__scroll')).toBe(scroll);
    // 사람이 닫으면 activeId가 바뀔 때까지 닫힌 채
    fireEvent.click(head('Employees'));
    rerender(<SideNav activeId="payroll" sections={sections} />);
    expect(head('Employees')).toHaveAttribute('aria-expanded', 'false');
  });

  it('제어 묶음이 지금 화면을 품고 닫혀 있으면 onSectionOpenChange(id, true)', () => {
    const onChange = vi.fn();
    const closed = sections.map((s) => (s.collapsible ? { ...s, open: false } : s));
    const { rerender } = render(
      <SideNav activeId="payroll" sections={closed} onSectionOpenChange={onChange} />,
    );
    expect(onChange).toHaveBeenCalledWith('people', true);
    onChange.mockClear();
    rerender(<SideNav activeId="tax" sections={closed} onSectionOpenChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith('ops', true);
    expect(onChange).not.toHaveBeenCalledWith('people', expect.anything());
  });

  it('revealActive false: 접힌 묶음 머리에 지금 화면 표시(속성 + 숨은 글)', () => {
    render(
      <SideNav
        activeId="payroll"
        revealActive={false}
        sections={sections.map((s) => (s.collapsible ? { ...s, open: false } : s))}
      />,
    );
    const people = screen.getByRole('button', { name: /^Employees.*지금 화면 있음$/ });
    expect(people).toHaveAttribute('data-has-active');
    expect(people).toHaveAttribute('aria-expanded', 'false');
    expect(head('Operations')).not.toHaveAttribute('data-has-active');
  });

  it('하위 메뉴도 지금 화면이 들어오면 연다', () => {
    const nested: SideNavSection[] = [
      {
        id: 'erp',
        items: [
          {
            id: 'tax',
            label: '세무',
            children: [
              { id: 'invoices', label: '세금계산서' },
              { id: 'vat', label: '부가세 신고' },
            ],
          },
          { id: 'ledger', label: '거래처 원장' },
        ],
      },
    ];
    const { rerender } = render(<SideNav activeId="ledger" sections={nested} />);
    expect(screen.getByRole('button', { name: '세무' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: '세무' })).not.toHaveAttribute('aria-controls');
    rerender(<SideNav activeId="vat" sections={nested} />);
    expect(screen.getByRole('button', { name: '세무' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: '부가세 신고' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

describe('AgentReplay(R-41)', () => {
  const base = {
    label: '업무 도우미',
    caption: '공급가액 칸에 1,200,000을 넣는 중',
  } as const;

  it('running: 커서 · 테두리 · 물결은 숨은 그림, 띠는 이름 있는 영역 + status 글 + 단추', () => {
    const onSkip = vi.fn();
    const onStop = vi.fn();
    render(
      <AgentReplay
        {...base}
        status="running"
        trail={['회계', '세금계산서']}
        index={3}
        total={7}
        remaining="약 20초 남음"
        pointer={{ x: 10, y: 20 }}
        ring={{ x: 1, y: 2, width: 300, height: 36 }}
        ripples={[{ id: 'a', x: 10, y: 20 }]}
        onSkip={onSkip}
        onStop={onStop}
      />,
    );
    // 기본은 document.body로 포털
    const layer = document.body.querySelector(':scope > .tl-agent-replay') as HTMLElement;
    expect(layer).not.toBeNull();
    const region = screen.getByRole('region', { name: '업무 도우미 작업 재생' });
    const status = within(region).getByRole('status');
    expect(status).toHaveTextContent('공급가액 칸에 1,200,000을 넣는 중');
    expect(status).toHaveTextContent('회계 › 세금계산서');
    expect(status).toHaveTextContent('3/7단계 · 약 20초 남음');
    for (const part of ['ring', 'pointer', 'ripple'])
      expect(layer.querySelector(`.tl-agent-replay__${part}`)).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    expect(
      (layer.querySelector('.tl-agent-replay__pointer') as HTMLElement).style.getPropertyValue(
        '--tl-agent-replay-x',
      ),
    ).toBe('10px');
    fireEvent.click(within(region).getByRole('button', { name: '건너뛰기' }));
    fireEvent.click(within(region).getByRole('button', { name: '멈추기' }));
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledTimes(1);
    // 포커스를 옮기지 않는다
    expect(document.activeElement).not.toBe(
      within(region).getByRole('button', { name: '건너뛰기' }),
    );
  });

  it('done: 요약 · 결과 보기 · 닫기, 그림은 없다', () => {
    const onOpen = vi.fn();
    const onStop = vi.fn();
    const { container } = render(
      <AgentReplay
        {...base}
        container={null}
        status="done"
        summary="세금계산서 1건을 발행했습니다"
        pointer={{ x: 1, y: 1 }}
        ring={{ x: 1, y: 1, width: 1, height: 1 }}
        onOpenResult={onOpen}
        onStop={onStop}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('세금계산서 1건을 발행했습니다');
    expect(container.querySelector('.tl-agent-replay__pointer')).toBeNull();
    expect(container.querySelector('.tl-agent-replay__ring')).toBeNull();
    expect(screen.queryByRole('button', { name: '건너뛰기' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onOpen).toHaveBeenCalled();
    expect(onStop).toHaveBeenCalled();
  });

  it('stopped: "멈춤"을 글로 알리고 닫기', () => {
    render(<AgentReplay {...base} container={null} status="stopped" onStop={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('멈춤 · 공급가액');
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('labelColor는 차트 슬롯 변수로', () => {
    const { container } = render(
      <AgentReplay {...base} container={null} status="running" labelColor="series-2" />,
    );
    expect((container.querySelector('.tl-agent-replay__dot') as HTMLElement).style.background).toBe(
      'var(--tl-color-chart-series-2)',
    );
  });
});
