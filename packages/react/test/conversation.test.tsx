// PR-08 F: 블록에서 나온 대화 · 겹침 컴포넌트(MessageThread · Composer · ContextMenu · Popover)
import {
  ComposerContract,
  ContextMenuContract,
  MessageThreadContract,
  PopoverContract,
  type ComposerProps,
  type ContextMenuProps,
  type MessageThreadProps,
  type PopoverProps,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  Button,
  Composer,
  ContextMenu,
  Field,
  IconButton,
  Input,
  MessageThread,
  Popover,
  TrellisProvider,
  type MessageThreadWebItem,
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
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const CONTRACTS = [
  MessageThreadContract,
  ComposerContract,
  ContextMenuContract,
  PopoverContract,
] as const;

describe('contract parity', () => {
  it('displayName === contract.name, id · testID가 있다', () => {
    const pairs: [{ displayName?: string }, { name: string }][] = [
      [MessageThread, MessageThreadContract],
      [Composer, ComposerContract],
      [ContextMenu, ContextMenuContract],
      [Popover, PopoverContract],
    ];
    for (const [c, k] of pairs) expect(c.displayName).toBe(k.name);
    for (const c of CONTRACTS) {
      expect(Object.keys(c.props), c.name).toContain('id');
      expect(Object.keys(c.props), c.name).toContain('testID');
      expect(c.platforms.native, c.name).toBe(true);
    }
  });

  it('contract props를 웹 props에 그대로 넘길 수 있다', () => {
    expectTypeOf<Omit<MessageThreadProps, 'messages'>>().toMatchTypeOf<
      Omit<ComponentProps<typeof MessageThread>, 'messages'>
    >();
    expectTypeOf<ComposerProps>().toMatchTypeOf<ComponentProps<typeof Composer>>();
    expectTypeOf<Omit<ContextMenuProps, 'children'>>().toMatchTypeOf<
      Omit<ComponentProps<typeof ContextMenu>, 'children'>
    >();
    expectTypeOf<Omit<PopoverProps, 'trigger' | 'children' | 'footer'>>().toMatchTypeOf<
      Omit<ComponentProps<typeof Popover>, 'trigger' | 'children' | 'footer'>
    >();
  });
});

const KIM = { id: 'u1', name: '김테라 팀장', meta: '경영지원팀' };
const JUNG = { id: 'u5', name: '정우진 주임', meta: '물류팀' };
const THREAD: MessageThreadWebItem[] = [
  { id: 'm1', author: JUNG, at: '2026-11-05 17:05', text: '랙 여유 확인했습니다.' },
  { id: 'm2', kind: 'system', at: '2026-11-06 09:30', text: '김테라 팀장이 들어왔습니다' },
  { id: 'm3', author: JUNG, at: '2026-11-06 09:42', text: '관자 도착했습니다.' },
  {
    id: 'm4',
    author: JUNG,
    at: '2026-11-06 09:44',
    text: '사진 올립니다. https://example.com/claim/42.',
    files: [{ name: '파손-박스-01.jpg', size: 1_929_216 }],
  },
  { id: 'm5', author: KIM, own: true, at: '2026-11-06 10:12', text: '확인했습니다.', unread: 0 },
  {
    id: 'm6',
    author: KIM,
    own: true,
    at: '2026-11-06 10:12',
    text: '클레임 메일 보냅니다.',
    unread: 3,
  },
];

describe('MessageThread', () => {
  it('role=log, 날짜 구분선(오늘) · 알림 줄 · 새 메시지 구분선', () => {
    render(
      <MessageThread
        label="구매 채널 메시지"
        messages={THREAD}
        today="2026-11-06"
        unreadFrom="m3"
        testID="t"
      />,
    );
    const log = screen.getByRole('log', { name: '구매 채널 메시지' });
    expect(log).toHaveAttribute('aria-live', 'polite');
    const dividers = [...log.querySelectorAll('.tl-message-thread__divider')].map(
      (d) => d.textContent,
    );
    expect(dividers).toEqual(['11월 5일(목)', '11월 6일(금) · 오늘', '새 메시지']);
    expect(log.querySelector('.tl-message-thread__system')).toHaveTextContent(
      '김테라 팀장이 들어왔습니다 09:30',
    );
  });

  it('같은 사람이 이어 보내면 이름 · 아바타는 한 번, 내 메시지는 오른쪽 묶음에 읽음 · 안 읽은 수', () => {
    render(<MessageThread label="대화" messages={THREAD} today="2026-11-06" />);
    const runs = screen.getByRole('log').querySelectorAll('.tl-message-thread__run');
    // m1(전날) · m3+m4(같은 사람 2분) · m5+m6(내 쪽)
    expect(runs).toHaveLength(3);
    expect(runs[1]!.querySelectorAll('.tl-message-thread__name')).toHaveLength(1);
    expect(runs[1]).toHaveTextContent('정우진 주임');
    expect(runs[1]).toHaveTextContent('물류팀');
    expect(runs[1]!.querySelectorAll('[data-message-id]')).toHaveLength(2);
    const own = runs[2]!;
    expect(own).toHaveAttribute('data-own');
    expect(own.querySelector('.tl-message-thread__name')).toBeNull();
    const [m5, m6] = own.querySelectorAll('[data-message-id]');
    expect(m5).toHaveTextContent('읽음');
    // 같은 분의 앞 메시지는 시각을 생략한다
    expect(m5!.querySelector('time')).toBeNull();
    expect(m6).toHaveTextContent('안 읽음 3');
    expect(m6!.querySelector('time')).toHaveTextContent('10:12');
  });

  it('주소는 링크(끝 문장 부호 제외), 파일은 Attachment 칩, 줄바꿈은 그대로', () => {
    render(<MessageThread label="대화" messages={THREAD} today="2026-11-06" />);
    const link = screen.getByRole('link', { name: 'https://example.com/claim/42' });
    expect(link).toHaveAttribute('href', 'https://example.com/claim/42');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const m4 = document.querySelector('[data-message-id="m4"]')!;
    expect(within(m4 as HTMLElement).getByRole('list', { name: '첨부 파일' })).toHaveAttribute(
      'data-layout',
      'chips',
    );
  });

  it('이전 메시지 단추 · 불러오는 중 · 실패 다시 보내기', () => {
    const onLoadOlder = vi.fn();
    const onRetry = vi.fn();
    const { rerender } = render(
      <MessageThread
        label="대화"
        today="2026-11-06"
        hasOlder
        onLoadOlder={onLoadOlder}
        onRetry={onRetry}
        messages={[
          {
            id: 'x',
            author: KIM,
            own: true,
            at: '2026-11-06 13:24',
            text: '연락처 주세요',
            status: 'failed',
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '이전 메시지' }));
    expect(onLoadOlder).toHaveBeenCalledTimes(1);
    expect(screen.getByText('보내지 못함')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다시 보내기' }));
    expect(onRetry).toHaveBeenCalledWith('x');
    rerender(
      <MessageThread label="대화" messages={[]} hasOlder loading empty="대화를 시작하세요" />,
    );
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-busy', 'true');
    expect(log).toHaveAttribute('data-state', 'loading');
    expect(screen.getByText('대화를 시작하세요')).toBeInTheDocument();
  });

  it('height=fill이면 키보드로 스크롤할 수 있게 포커스를 받는다', () => {
    render(<MessageThread label="대화" messages={THREAD} height="fill" />);
    expect(screen.getByRole('log')).toHaveAttribute('tabindex', '0');
  });

  it('영어 locale', () => {
    render(
      <TrellisProvider locale="en">
        <MessageThread label="Chat" messages={THREAD} today="2026-11-06" hasOlder />
      </TrellisProvider>,
    );
    expect(screen.getByRole('button', { name: 'Earlier messages' })).toBeInTheDocument();
    expect(screen.getByText('3 unread')).toBeInTheDocument();
  });
});

describe('Composer', () => {
  it('Enter로 보내고(앞뒤 공백 제거) 칸을 비운다. Shift+Enter는 보내지 않는다', () => {
    const onSend = vi.fn();
    render(<Composer label="구매 채널에 메시지" onSend={onSend} />);
    const input = screen.getByRole('textbox', { name: '구매 채널에 메시지' });
    const send = screen.getByRole('button', { name: '보내기' });
    expect(send).toBeDisabled();
    fireEvent.change(input, { target: { value: '  관자 도착  ' } });
    expect(send).toBeEnabled();
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('관자 도착', []);
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('enterkeyhint', 'send');
  });

  it('한글 조합 중 Enter(isComposing · keyCode 229)는 보내지 않는다', () => {
    const onSend = vi.fn();
    render(<Composer label="메시지" onSend={onSend} />);
    const input = screen.getByRole('textbox', { name: '메시지' });
    fireEvent.change(input, { target: { value: '확인했습니' } });
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });
    expect(onSend).toHaveBeenCalledWith('확인했습니', []);
  });

  it('enterToSend=false면 Enter는 줄바꿈, Ctrl+Enter로 보낸다. Field 라벨 · 도움말을 쓴다', () => {
    const onSend = vi.fn();
    render(
      <Field label="답변" help="Ctrl+Enter로 보냅니다">
        <Composer onSend={onSend} enterToSend={false} attachable={false} sendLabel="답변 보내기" />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: '답변' });
    expect(input).toHaveAccessibleDescription('Ctrl+Enter로 보냅니다');
    expect(screen.queryByRole('button', { name: '파일 첨부' })).toBeNull();
    fireEvent.change(input, { target: { value: '회수는 내일 오전입니다' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
    expect(onSend).toHaveBeenCalledWith('회수는 내일 오전입니다', []);
  });

  it('첨부: 고른 파일이 칩으로 보이고 지울 수 있고, 파일만으로도 보낸다', () => {
    const onSend = vi.fn();
    const { container } = render(<Composer label="메시지" onSend={onSend} accept=".jpg,.pdf" />);
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(fileInput).toHaveAttribute('accept', '.jpg,.pdf');
    const a = new File(['a'], '사진.jpg', { type: 'image/jpeg' });
    const b = new File(['bb'], '명세서.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [a, b] } });
    const chips = screen.getByRole('list', { name: '첨부 파일' });
    expect(within(chips).getAllByRole('listitem')).toHaveLength(2);
    fireEvent.click(within(chips).getByRole('button', { name: '사진.jpg 삭제' }));
    expect(within(chips).getAllByRole('listitem')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '보내기' }));
    expect(onSend).toHaveBeenCalledWith('', [b]);
    expect(screen.queryByRole('list', { name: '첨부 파일' })).toBeNull();
  });

  it('비활성 · 보내는 중 · 제한 가까이에서 글자 수', () => {
    const onSend = vi.fn();
    const { rerender } = render(<Composer label="메시지" onSend={onSend} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: '파일 첨부' })).toBeDisabled();
    rerender(<Composer label="메시지" onSend={onSend} loading defaultValue="보냄" maxLength={5} />);
    const root = screen.getByRole('textbox').closest('.tl-composer')!;
    expect(root).toHaveAttribute('data-state', 'loading');
    expect(root).toHaveAttribute('aria-busy', 'true');
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSend).not.toHaveBeenCalled();
    rerender(<Composer label="메시지" onSend={onSend} value="안녕하세요" maxLength={5} />);
    expect(screen.getByText('5 / 5')).toHaveAttribute('data-full');
  });
});

const ROWS = [
  { id: 'f1', name: '10월 결산 보고서.xlsx' },
  { id: 'f2', name: '공급 계약서.pdf' },
];

function FileList({
  onOpenChange,
  onDelete,
  disabled,
}: {
  onOpenChange?: (open: boolean, target: HTMLElement | null) => void;
  onDelete?: (id: string | undefined) => void;
  disabled?: boolean;
}) {
  let current: string | undefined;
  return (
    <ContextMenu
      testID="area"
      title="파일 동작"
      disabled={disabled ?? false}
      onOpenChange={(open, target) => {
        current = target?.closest('li')?.dataset['id'];
        onOpenChange?.(open, target);
      }}
      items={[
        { id: 'open', label: '열기', icon: 'eye' },
        { type: 'separator' },
        {
          id: 'delete',
          label: '삭제',
          icon: 'trash-2',
          danger: true,
          onSelect: () => onDelete?.(current),
        },
      ]}
    >
      <ul aria-label="문서">
        {ROWS.map((r) => (
          <li key={r.id} data-id={r.id} tabIndex={0}>
            {r.name}
          </li>
        ))}
      </ul>
    </ContextMenu>
  );
}

describe('ContextMenu', () => {
  it('우클릭하면 누른 자리의 메뉴가 열리고 연 요소를 알려 준다. 항목을 고르면 실행하고 닫는다', async () => {
    const onOpenChange = vi.fn();
    const onDelete = vi.fn();
    render(<FileList onOpenChange={onOpenChange} onDelete={onDelete} />);
    const row = screen.getByText('공급 계약서.pdf');
    fireEvent.contextMenu(row, { clientX: 40, clientY: 60 });
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveClass('tl-menu');
    expect(onOpenChange).toHaveBeenLastCalledWith(true, row);
    const del = within(menu).getByRole('menuitem', { name: '삭제' });
    expect(del).toHaveAttribute('data-danger');
    fireEvent.click(del);
    expect(onDelete).toHaveBeenCalledWith('f2');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('포커스한 행에서 Shift+F10 · 메뉴 키로 열고, Escape로 닫으면 행으로 돌아간다', async () => {
    const onOpenChange = vi.fn();
    render(<FileList onOpenChange={onOpenChange} />);
    const row = screen.getByText('10월 결산 보고서.xlsx');
    act(() => row.focus());
    fireEvent.keyDown(row, { key: 'F10', shiftKey: true });
    const menu = await screen.findByRole('menu');
    expect(onOpenChange).toHaveBeenLastCalledWith(true, row);
    fireEvent.keyDown(menu, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(row).toHaveFocus());
    fireEvent.keyDown(row, { key: 'ContextMenu' });
    expect(await screen.findByRole('menu')).toBeInTheDocument();
  });

  it('disabled면 열리지 않고 브라우저 메뉴를 막지 않는다', () => {
    render(<FileList disabled />);
    const row = screen.getByText('공급 계약서.pdf');
    const event = fireEvent.contextMenu(row);
    expect(event).toBe(true);
    fireEvent.keyDown(row, { key: 'F10', shiftKey: true });
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('입력 칸 안에서는 브라우저 메뉴를 막지 않는다', () => {
    render(
      <ContextMenu items={[{ id: 'a', label: '열기' }]}>
        <div>
          <input aria-label="메모" />
          <p>행</p>
        </div>
      </ContextMenu>,
    );
    const input = screen.getByRole('textbox', { name: '메모' });
    expect(fireEvent.contextMenu(input)).toBe(true);
    fireEvent.keyDown(input, { key: 'F10', shiftKey: true });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(fireEvent.contextMenu(screen.getByText('행'))).toBe(false);
  });

  it('고를 항목이 없으면(빈 자리) 열지 않는다', () => {
    render(
      <ContextMenu items={[]}>
        <p>빈 자리</p>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('빈 자리'));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('좁은 화면: 길게 누르면 아래 시트가 열리고, 손을 뗀 뒤 오는 click은 행에 가지 않는다', async () => {
    narrow();
    vi.useFakeTimers();
    const rowClicks: EventTarget[] = [];
    const onDelete = vi.fn();
    render(
      // 시트는 포털이지만 React 트리로 click이 올라온다. 행에서 온 click만 센다
      <div onClick={(e) => rowClicks.push(e.target)}>
        <FileList onDelete={onDelete} />
      </div>,
    );
    const row = screen.getByText('공급 계약서.pdf');
    const onRowClick = () => rowClicks.filter((t) => t === row).length;
    fireEvent.pointerDown(row, { pointerType: 'touch', clientX: 10, clientY: 10 });
    act(() => vi.advanceTimersByTime(520));
    fireEvent.pointerUp(row, { pointerType: 'touch' });
    fireEvent.click(row);
    expect(onRowClick()).toBe(0);
    vi.useRealTimers();
    const sheet = await screen.findByRole('dialog', { name: '파일 동작' });
    fireEvent.click(within(sheet).getByRole('button', { name: '삭제' }));
    expect(onDelete).toHaveBeenCalledWith('f2');
    // 다음 탭은 그대로 간다
    fireEvent.pointerDown(row, { pointerType: 'touch' });
    fireEvent.click(row);
    expect(onRowClick()).toBe(1);
  });

  it('좁은 화면: 짧게 누르거나 끌면 열리지 않는다', () => {
    narrow();
    vi.useFakeTimers();
    render(<FileList />);
    const row = screen.getByText('공급 계약서.pdf');
    fireEvent.pointerDown(row, { pointerType: 'touch', clientX: 10, clientY: 10 });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerUp(row, { pointerType: 'touch' });
    fireEvent.pointerDown(row, { pointerType: 'touch', clientX: 10, clientY: 10 });
    fireEvent.pointerMove(row, { pointerType: 'touch', clientX: 10, clientY: 60 });
    act(() => vi.advanceTimersByTime(600));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('좁은 화면: Shift+F10도 시트를 연다', async () => {
    narrow();
    render(<FileList />);
    const row = screen.getByText('10월 결산 보고서.xlsx');
    fireEvent.keyDown(row, { key: 'F10', shiftKey: true });
    expect(await screen.findByRole('dialog', { name: '파일 동작' })).toBeInTheDocument();
  });
});

describe('Popover', () => {
  it('트리거로 열고 제목이 이름, 첫 입력 칸에 포커스. Escape로 닫으면 트리거로 돌아간다', async () => {
    const onOpenChange = vi.fn();
    render(
      <Popover
        title="금액 범위"
        testID="pop"
        onOpenChange={onOpenChange}
        trigger={<Button>금액</Button>}
        footer={<Button size="sm">적용</Button>}
      >
        <Input label="최소 금액" />
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: '금액' });
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: '금액 범위' });
    expect(dialog).toHaveClass('tl-popover');
    expect(dialog).toHaveAttribute('data-testid', 'pop');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await waitFor(() => expect(screen.getByRole('textbox', { name: '최소 금액' })).toHaveFocus());
    expect(within(dialog).getByRole('button', { name: '적용' })).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('initialFocus=panel이면 패널, 닫기 단추로 닫는다', async () => {
    render(
      <Popover
        title="멤버 3명"
        initialFocus="panel"
        trigger={<IconButton icon="users" label="멤버" />}
      >
        <a href="#u1">김테라</a>
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: '멤버' }));
    const dialog = await screen.findByRole('dialog', { name: '멤버 3명' });
    await waitFor(() => expect(dialog).toHaveFocus());
    fireEvent.click(within(dialog).getByRole('button', { name: '닫기' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('제어 open · 바깥을 누르면 닫힘 요청 · closable=false', async () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <button type="button">바깥</button>
        <Popover
          title="창고"
          open
          closable={false}
          onOpenChange={onOpenChange}
          trigger={<Button>창고</Button>}
        >
          내용
        </Popover>
      </>,
    );
    const dialog = await screen.findByRole('dialog', { name: '창고' });
    expect(within(dialog).queryByRole('button', { name: '닫기' })).toBeNull();
    fireEvent.pointerDown(screen.getByRole('button', { name: '바깥' }));
    fireEvent.mouseDown(screen.getByRole('button', { name: '바깥' }));
    fireEvent.click(screen.getByRole('button', { name: '바깥' }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('disabled면 열리지 않는다', () => {
    render(
      <Popover title="창고" disabled trigger={<Button>창고</Button>}>
        내용
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: '창고' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('좁은 화면: 같은 트리거가 아래 시트를 열고 footer는 시트 아래', async () => {
    narrow();
    render(
      <Popover title="창고" trigger={<Button>창고</Button>} footer={<Button>적용</Button>}>
        평택 냉동센터
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: '창고' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    fireEvent.click(trigger);
    const sheet = await screen.findByRole('dialog', { name: '창고' });
    expect(sheet).toHaveClass('tl-popover-sheet');
    expect(sheet.querySelector('.tl-sheet__footer')).toHaveTextContent('적용');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
