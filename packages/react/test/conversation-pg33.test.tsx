// PG-33 · PG-36: AppShell 옆 칸(aside · AppShellAside) · Composer 멘션 · 명령 · MessageThread 반응 · 답글 · 입력 중 · 그림
import {
  AppShellContract,
  ComposerContract,
  MessageThreadContract,
  type AppShellProps,
  type ComposerMention,
  type ComposerProps,
} from '@terracelab/trellis-contracts';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  AppShell,
  AppShellAside,
  Button,
  Composer,
  MessageThread,
  TrellisProvider,
  useAppShellAsideId,
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

describe('contract', () => {
  it('새 props가 contract에 있고 웹 props가 받는다', () => {
    expect(Object.keys(AppShellContract.props)).toEqual(
      expect.arrayContaining(['aside', 'asideTitle', 'asideOpen', 'defaultAsideOpen']),
    );
    expect(Object.keys(ComposerContract.props)).toEqual(
      expect.arrayContaining(['mentions', 'commands', 'onCommand']),
    );
    expect(Object.keys(MessageThreadContract.props)).toEqual(
      expect.arrayContaining(['onReact', 'reactionOptions', 'onReply', 'typing']),
    );
    expectTypeOf<ComposerProps>().toMatchTypeOf<ComponentProps<typeof Composer>>();
    type AsideKeys = 'asideTitle' | 'asideOpen' | 'defaultAsideOpen' | 'onAsideOpenChange';
    expectTypeOf<Pick<AppShellProps, AsideKeys>>().toMatchTypeOf<
      Pick<ComponentProps<typeof AppShell>, AsideKeys>
    >();
  });
});

/** 블록처럼 본문 안에서 옆 칸을 채우는 화면 */
function WorkScreen({ initial = false }: { initial?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <AppShell brand="테라스원">
      <Toggle open={open} onToggle={() => setOpen(!open)} />
      <input aria-label="거래처 검색" />
      <AppShellAside title="업무 도우미" open={open} onOpenChange={setOpen}>
        <p>대화</p>
        <button type="button">질문</button>
      </AppShellAside>
    </AppShell>
  );
}
function Toggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const controls = useAppShellAsideId();
  return (
    <Button aria-expanded={open} aria-controls={controls} onPress={onToggle}>
      업무 도우미
    </Button>
  );
}

describe('AppShell 옆 칸', () => {
  it('aside가 없으면 옆 칸 랜드마크가 없고 자리는 비어 있다(지금 모양 그대로)', () => {
    const { container } = render(<AppShell brand="테라스원">본문</AppShell>);
    expect(screen.queryByRole('complementary')).toBeNull();
    const slot = container.querySelector('.tl-app-shell__aside-slot')!;
    expect(slot.childElementCount).toBe(0);
  });

  it('aside prop: 제목이 랜드마크 이름, 닫기 단추와 머리 동작, 비제어 기본은 닫힘', () => {
    const onChange = vi.fn();
    render(
      <AppShell
        brand="테라스원"
        aside={<p>대화</p>}
        asideTitle="업무 도우미"
        asideActions={<button type="button">새 대화</button>}
        defaultAsideOpen
        onAsideOpenChange={onChange}
      >
        본문
      </AppShell>,
    );
    const region = screen.getByRole('complementary', { name: '업무 도우미' });
    expect(region).toHaveAttribute('id', 'tl-app-aside');
    expect(within(region).getByRole('button', { name: '새 대화' })).toBeInTheDocument();
    fireEvent.click(within(region).getByRole('button', { name: '업무 도우미 닫기' }));
    expect(onChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('제목이 없으면 "옆 칸", 영어 locale은 Side panel', () => {
    const { unmount } = render(
      <AppShell brand="테라스원" aside={<p>상세</p>} defaultAsideOpen>
        본문
      </AppShell>,
    );
    expect(screen.getByRole('complementary', { name: '옆 칸' })).toBeInTheDocument();
    unmount();
    render(
      <TrellisProvider locale="en">
        <AppShell brand="One" aside={<p>Detail</p>} defaultAsideOpen>
          Body
        </AppShell>
      </TrellisProvider>,
    );
    expect(screen.getByRole('complementary', { name: 'Side panel' })).toBeInTheDocument();
  });

  it('AppShellAside는 본문 밖 틀의 옆 칸 자리에 그려지고 본문은 계속 쓴다(모달 아님)', async () => {
    const { container } = render(<WorkScreen />);
    const toggle = screen.getByRole('button', { name: '업무 도우미' });
    expect(toggle).toHaveAttribute('aria-controls', 'tl-app-aside');
    expect(screen.queryByRole('complementary')).toBeNull();
    toggle.focus();
    fireEvent.click(toggle);
    const region = await screen.findByRole('complementary', { name: '업무 도우미' });
    // 틀의 자리 안, main 밖
    expect(region.closest('.tl-app-shell__aside-slot')).not.toBeNull();
    expect(region.closest('main')).toBeNull();
    expect(region).not.toHaveAttribute('aria-modal');
    expect(container.querySelector('[inert]')).toBeNull();
    // 열면 제목으로 포커스, 본문 입력은 그대로 쓴다
    expect(screen.getByRole('heading', { level: 2, name: '업무 도우미' })).toHaveFocus();
    const search = screen.getByRole('textbox', { name: '거래처 검색' });
    search.focus();
    expect(search).toHaveFocus();
  });

  it('옆 칸 안 Escape로 닫으면 연 단추로 포커스가 돌아온다. 닫아도 안의 내용은 남는다', async () => {
    render(<WorkScreen />);
    const toggle = screen.getByRole('button', { name: '업무 도우미' });
    toggle.focus();
    fireEvent.click(toggle);
    const region = await screen.findByRole('complementary');
    const ask = within(region).getByRole('button', { name: '질문' });
    ask.focus();
    fireEvent.keyDown(ask, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
    // 숨긴 채 남는다(입력 · 스크롤을 지킨다)
    const hidden = document.getElementById('tl-app-aside')!;
    expect(hidden).toHaveAttribute('hidden');
    expect(hidden).toHaveTextContent('대화');
  });

  it('안의 팝업이 처리한 Escape(defaultPrevented)는 옆 칸을 닫지 않는다', async () => {
    render(<WorkScreen initial />);
    const region = await screen.findByRole('complementary');
    const ask = within(region).getByRole('button', { name: '질문' });
    ask.addEventListener('keydown', (e) => e.preventDefault());
    fireEvent.keyDown(ask, { key: 'Escape' });
    expect(screen.getByRole('complementary')).toBeVisible();
  });

  it('처음부터 열려 있으면 포커스를 빼앗지 않는다', async () => {
    render(<WorkScreen initial />);
    await screen.findByRole('complementary');
    expect(document.body).toHaveFocus();
  });

  it('틀 밖에서 쓰면 제자리에 그린다', () => {
    render(
      <AppShellAside title="업무 도우미" defaultOpen>
        <p>대화</p>
      </AppShellAside>,
    );
    expect(screen.getByRole('complementary', { name: '업무 도우미' })).toHaveTextContent('대화');
  });

  it('좁은 화면(1024 미만)에서는 아래 시트로 열린다', async () => {
    narrow();
    render(<WorkScreen initial />);
    const sheet = await screen.findByRole('dialog', { name: '업무 도우미' });
    expect(sheet).toHaveClass('tl-app-shell__aside-sheet');
    expect(within(sheet).getByText('대화')).toBeInTheDocument();
    expect(screen.queryByRole('complementary')).toBeNull();
  });
});

const PEOPLE: ComposerMention[] = [
  { id: 'u01', name: '윤지호', meta: '대표' },
  { id: 'u03', name: '박서연', meta: '경영지원팀 · 대리' },
  { id: 'u04', name: '이하은', meta: '구매팀 · 과장' },
];
const COMMANDS = [
  { id: 'notice', name: '공지', description: '채널 공지로 올립니다' },
  { id: 'po', name: '발주서', description: '발주서 카드를 붙입니다' },
];

function type(el: HTMLTextAreaElement, value: string) {
  fireEvent.change(el, {
    target: { value, selectionStart: value.length, selectionEnd: value.length },
  });
}

describe('Composer 멘션 · 명령', () => {
  it('"@"를 치면 사람 목록, 이름 · 보조 글자로 거르고 화살표 · Enter로 넣는다. 보낼 때 id를 돌려준다', () => {
    const onSend = vi.fn();
    render(<Composer label="메시지" mentions={PEOPLE} onSend={onSend} attachable={false} />);
    const input = screen.getByRole('textbox', { name: '메시지' }) as HTMLTextAreaElement;
    input.focus();
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    type(input, '확인 부탁 @');
    const list = screen.getByRole('listbox', { name: '멘션할 사람' });
    expect(within(list).getAllByRole('option')).toHaveLength(3);
    expect(input).toHaveAttribute('aria-controls', list.id);
    expect(screen.getByRole('status')).toHaveTextContent('사람 3명');
    type(input, '확인 부탁 @구매');
    expect(within(list).getAllByRole('option')).toHaveLength(1);
    type(input, '확인 부탁 @');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', options[1]!.id);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('확인 부탁 @박서연 ');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onSend).not.toHaveBeenCalled();
    type(input, '확인 부탁 @박서연 오늘까지');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('확인 부탁 @박서연 오늘까지', [], { mentions: ['u03'] });
  });

  it('이름이 맞는 사람을 보조 글자만 맞는 사람보다 먼저 보인다', () => {
    render(
      <Composer
        label="메시지"
        mentions={[
          { id: 'e08', name: '강도현', meta: '구매팀 · 팀장' },
          { id: 'e13', name: '장석진', meta: '물류팀 · 팀장' },
        ]}
        onSend={() => {}}
      />,
    );
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    input.focus();
    type(input, '@장');
    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options[0]).toHaveTextContent('장석진');
    expect(options[1]).toHaveTextContent('강도현');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('@장석진 ');
  });

  it('한글 조합 중 Enter는 고르지 않는다(글자 확정)', () => {
    render(<Composer label="메시지" mentions={PEOPLE} onSend={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    input.focus();
    fireEvent.compositionStart(input);
    type(input, '@박');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(input.value).toBe('@박');
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    expect(input.value).toBe('@박');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('@박서연 ');
  });

  it('메일 주소의 @는 부르지 않고, Escape는 목록만 닫는다(바깥으로 번지지 않는다)', () => {
    const outer = vi.fn();
    render(
      <div onKeyDown={outer}>
        <Composer label="메시지" mentions={PEOPLE} onSend={() => {}} />
      </div>,
    );
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    input.focus();
    type(input, 'kim@');
    expect(screen.queryByRole('listbox')).toBeNull();
    type(input, '@');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(outer).not.toHaveBeenCalled();
    // 글자를 더 치면 다시 연다
    type(input, '@이');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('넣었다가 지운 이름은 mentions에서 빠지고, 누르기로도 넣는다', () => {
    const onSend = vi.fn();
    render(<Composer label="메시지" mentions={PEOPLE} onSend={onSend} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    input.focus();
    type(input, '@');
    fireEvent.click(screen.getByRole('option', { name: /윤지호/ }));
    expect(input.value).toBe('@윤지호 ');
    type(input, '오늘 회의');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('오늘 회의', [], { mentions: [] });
  });

  it('글 맨 앞 "/"에서 명령 목록, Tab으로 고르면 "/이름 "을 넣고 onCommand, 보낼 때 command', () => {
    const onSend = vi.fn();
    const onCommand = vi.fn();
    render(<Composer label="메시지" commands={COMMANDS} onCommand={onCommand} onSend={onSend} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    input.focus();
    type(input, '안내 /');
    expect(screen.queryByRole('listbox')).toBeNull();
    type(input, '/발');
    const list = screen.getByRole('listbox', { name: '명령' });
    expect(within(list).getByRole('option')).toHaveTextContent('/발주서');
    expect(within(list).getByRole('option')).toHaveTextContent('발주서 카드를 붙입니다');
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(input.value).toBe('/발주서 ');
    expect(onCommand).toHaveBeenCalledWith('po');
    type(input, '/발주서 PO-2611-0043');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('/발주서 PO-2611-0043', [], {
      mentions: [],
      command: 'po',
    });
  });

  it('mentions · commands가 없으면 지금과 같다(목록 · 라이브 영역 없음)', () => {
    const onSend = vi.fn();
    render(<Composer label="메시지" onSend={onSend} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(input).not.toHaveAttribute('aria-autocomplete');
    expect(input.parentElement).toHaveClass('tl-composer__row');
    type(input, '@');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('@', []);
    expect(onSend.mock.calls[0]).toHaveLength(2);
  });
});

const ME = { id: 'me', name: '김테라 팀장' };
const MOON = { id: 'u04', name: '이하은 과장', meta: '구매팀' };
const REACTIONS = [
  { key: 'check', label: '확인', icon: 'check' as const },
  { key: 'thumbs-up', label: '좋아요', icon: 'thumbs-up' as const },
];
const PHOTO = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

const THREAD: MessageThreadWebItem[] = [
  {
    id: 'm1',
    author: MOON,
    at: '2026-11-06 10:05',
    text: '파손 박스 사진입니다. @김테라 확인 부탁드립니다.',
    mentions: ['김테라'],
    files: [
      { name: '파손-박스-01.jpg', size: 1_929_216, thumb: PHOTO, href: PHOTO },
      { name: '거래명세서.pdf', size: 182_272 },
    ],
    reactions: [
      { key: 'check', label: '확인', icon: 'check', count: 2, mine: true },
      { key: 'thumbs-up', label: '좋아요', icon: 'thumbs-up', count: 0 },
    ],
  },
  {
    id: 'm2',
    author: ME,
    own: true,
    at: '2026-11-06 10:12',
    text: '클레임 메일 보내겠습니다.',
    replyTo: { id: 'm1', author: '이하은 과장', text: '파손 박스 사진입니다.' },
  },
  {
    id: 'm3',
    author: ME,
    own: true,
    at: '2026-11-06 10:20',
    text: '지난주 건은 처리했습니다.',
    replyTo: { id: 'old', author: '윤지호 대표', text: '지난주 클레임 건' },
  },
];

describe('MessageThread 반응 · 답글 · 멘션 · 그림 · 입력 중', () => {
  it('반응은 아이콘 + 수, 0은 그리지 않는다. onReact가 있으면 누름 단추(aria-pressed)', () => {
    const onReact = vi.fn();
    render(<MessageThread label="구매-물류" messages={THREAD} onReact={onReact} />);
    const group = screen.getByRole('group', { name: '반응' });
    const check = within(group).getByRole('button', { name: '확인 2명' });
    expect(check).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).queryByRole('button', { name: /좋아요/ })).toBeNull();
    fireEvent.click(check);
    expect(onReact).toHaveBeenCalledWith('m1', 'check');
  });

  it('onReact가 없으면 반응은 글자로만 읽힌다(단추 아님)', () => {
    render(<MessageThread label="구매-물류" messages={THREAD} />);
    const group = screen.getByRole('group', { name: '반응' });
    expect(within(group).queryByRole('button')).toBeNull();
    expect(group).toHaveTextContent('확인 2명');
  });

  it('반응 추가 메뉴와 답글 단추(메시지 동작)', async () => {
    const onReact = vi.fn();
    const onReply = vi.fn();
    render(
      <MessageThread
        label="구매-물류"
        messages={THREAD}
        onReact={onReact}
        reactionOptions={REACTIONS}
        onReply={onReply}
      />,
    );
    const tools = screen.getAllByRole('group', { name: '메시지 동작' });
    expect(tools).toHaveLength(3);
    fireEvent.click(within(tools[0]!).getByRole('button', { name: '답글' }));
    expect(onReply).toHaveBeenCalledWith('m1');
    fireEvent.click(within(tools[1]!).getByRole('button', { name: '반응 추가' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: '좋아요' }));
    expect(onReact).toHaveBeenCalledWith('m2', 'thumbs-up');
  });

  it('답글 인용: 원문이 있으면 눌러서 원문으로 가고(포커스 · 테두리), 없으면 글자만', () => {
    vi.useFakeTimers();
    const { container } = render(<MessageThread label="구매-물류" messages={THREAD} />);
    const quote = screen.getByRole('button', { name: /이하은 과장의 메시지에 답글/ });
    expect(quote).toHaveTextContent('파손 박스 사진입니다.');
    fireEvent.click(quote);
    const original = container.querySelector<HTMLElement>('[data-message-id="m1"]')!;
    expect(original).toHaveFocus();
    expect(original).toHaveAttribute('data-flash');
    act(() => vi.advanceTimersByTime(2000));
    expect(original).not.toHaveAttribute('data-flash');
    // 대화에 없는 원문은 단추가 아니다
    expect(screen.queryByRole('button', { name: /윤지호 대표의 메시지에 답글/ })).toBeNull();
    expect(screen.getByText('지난주 클레임 건')).toBeInTheDocument();
  });

  it('멘션은 표시, 그림은 미리 보기 단추(크게 보기 → 대화상자 · 원본 다운로드), 나머지 파일은 칩', async () => {
    const { container } = render(<MessageThread label="구매-물류" messages={THREAD} />);
    expect(container.querySelector('.tl-message-thread__mention')).toHaveTextContent('@김테라');
    expect(container.querySelector('.tl-attachment')).toHaveTextContent('거래명세서.pdf');
    expect(container.querySelector('.tl-attachment')).not.toHaveTextContent('파손-박스-01.jpg');
    fireEvent.click(screen.getByRole('button', { name: '파손-박스-01.jpg 크게 보기' }));
    const dialog = await screen.findByRole('dialog', { name: '파손-박스-01.jpg' });
    expect(within(dialog).getByRole('img', { name: '파손-박스-01.jpg' })).toHaveAttribute(
      'src',
      PHOTO,
    );
    expect(within(dialog).getByRole('link', { name: '원본 다운로드' })).toHaveAttribute(
      'download',
      '파손-박스-01.jpg',
    );
  });

  it('입력 중: 둘까지는 이름, 셋부터는 외 N명. 라이브로 읽지 않는다', () => {
    const { rerender, container } = render(
      <MessageThread label="구매-물류" messages={THREAD} typing={['이하은 과장']} />,
    );
    const line = container.querySelector('.tl-message-thread__typing')!;
    expect(line).toHaveTextContent('이하은 과장 입력 중');
    expect(line).toHaveAttribute('aria-live', 'off');
    rerender(
      <MessageThread
        label="구매-물류"
        messages={THREAD}
        typing={['이하은 과장', '박서연 대리', '윤지호 대표']}
      />,
    );
    expect(container.querySelector('.tl-message-thread__typing')).toHaveTextContent(
      '이하은 과장 외 2명 입력 중',
    );
    rerender(<MessageThread label="구매-물류" messages={THREAD} typing={[]} />);
    expect(container.querySelector('.tl-message-thread__typing')).toBeNull();
  });

  it('새 props가 없으면 메시지 동작 · 반응 줄 · 입력 중이 없다', () => {
    const plain = THREAD.map((m) => ({
      ...m,
      reactions: undefined,
      replyTo: undefined,
      mentions: undefined,
    })) as MessageThreadWebItem[];
    const { container } = render(<MessageThread label="구매-물류" messages={plain} />);
    expect(container.querySelector('.tl-message-thread__tools')).toBeNull();
    expect(container.querySelector('.tl-message-thread__reactions')).toBeNull();
    expect(container.querySelector('.tl-message-thread__quote')).toBeNull();
    expect(container.querySelector('.tl-message-thread__mention')).toBeNull();
  });
});

describe('영어 locale', () => {
  it('옆 칸 닫기 · 멘션 목록 · 입력 중 글자가 바뀐다', async () => {
    render(
      <TrellisProvider locale="en">
        <AppShell brand="One" aside={<p>Chat</p>} asideTitle="Assistant" defaultAsideOpen>
          <Composer label="Message" mentions={PEOPLE} onSend={() => {}} />
          <MessageThread label="Purchasing" messages={THREAD} typing={['Kim', 'Park']} />
        </AppShell>
      </TrellisProvider>,
    );
    expect(screen.getByRole('button', { name: 'Close Assistant' })).toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement;
    input.focus();
    type(input, '@');
    expect(screen.getByRole('listbox', { name: 'People to mention' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Typing: Kim · Park')).toBeInTheDocument());
  });
});
