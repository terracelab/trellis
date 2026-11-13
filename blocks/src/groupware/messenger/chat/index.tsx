// 메신저(ConversationalWork): 채널 · 대화 목록(안 읽음 수) → 대화(MessageThread: 날짜 · 보낸 사람 묶음 · 업무 카드 ·
// 반응 · 답글 · 그림 미리 보기 · 입력 중) → 아래 고정 입력창(Composer: 첨부 · @멘션 · /공지).
// 대화 머리: 멤버(AvatarGroup → Popover) · 대화 검색(걸러 보기), 그 아래 고정 공지 줄(이동 · 고정 해제).
// 메시지 우클릭 · 길게 누르기 · Shift+F10 메뉴에 복사 · 답글 · 반응 · 고정 · 삭제가 있다(휴대폰은 가리키기가 없다)
import {
  formatCurrency,
  formatDate,
  formatQuantity,
  type ComposerCommand,
  type ComposerMention,
  type ComposerSendMeta,
  type MenuEntry,
  type MessageThreadReaction,
  type SelectableListItem,
} from '@terracelab/trellis-contracts';
import {
  Attachment,
  Avatar,
  AvatarGroup,
  Badge,
  BREAKPOINTS,
  Button,
  Card,
  Composer,
  ContextMenu,
  DescriptionList,
  Dialog,
  Icon,
  IconButton,
  Input,
  MessageThread,
  PageHeader,
  Popover,
  SelectableList,
  TagInput,
  useBreakpoint,
  useToast,
  type MessageThreadWebItem,
} from '@terracelab/trellis-react';
import { useEffect, useRef, useState } from 'react';
import {
  CHANNELS,
  CHAT_REACTIONS,
  CHAT_TYPING,
  EMPLOYEES,
  empById,
  GW_NOW,
  meOf,
  MESSAGES,
  useApprovalDocs,
  type Channel,
  type ChatMessage,
} from '../../../_data/groupware.js';
import {
  itemById,
  partyById,
  poAmount,
  poAmountKrw,
  PURCHASE_ORDERS,
  SHIPMENTS,
  TODAY,
  warehouseById,
} from '../../../_data/index.js';
import { usePlatform, useScreens } from '../../../_platform/index.js';
import { Lines, Page } from '../../../_ui/index.js';
import './style.css';

/** 처음 여는 대화방: 업무 카드(발주서 등)가 올라온 마지막 방 → 안 읽은 방 → 첫 방 */
const FIRST =
  [...MESSAGES].reverse().find((m) => m.card)?.channelId ??
  CHANNELS.find((c) => c.unread > 0)?.id ??
  CHANNELS[0]?.id ??
  '';
const lastOf = (msgs: readonly ChatMessage[], id: string) =>
  [...msgs].reverse().find((m) => m.channelId === id);
const short = (at: string) => (at.startsWith(TODAY) ? at.slice(11) : formatDate(at, 'md'));
const personLabel = (id: string) => `${empById(id).name} ${empById(id).title}`;
/** 글이 없는 메시지(파일만)의 한 줄 */
const lineOf = (m: ChatMessage) => m.text || '파일을 보냈습니다';

// slot: composer — 입력창 명령("/"로 부른다). 고르면 "/이름 "이 들어가고 보낼 때 처리한다
const COMMANDS: readonly ComposerCommand[] = [
  { id: 'notice', name: '공지', description: '보내는 메시지를 대화 위에 고정합니다' },
];
// slot: composer end

// slot: businessCard — 대화 안 업무 카드(발주서). 다른 문서 카드는 같은 모양으로 더한다
function PoCard({ id }: { id: string }) {
  const docs = useApprovalDocs();
  const screens = useScreens();
  const po = PURCHASE_ORDERS.find((p) => p.id === id);
  if (!po) return null;
  const doc = docs.find((d) => d.related === id && d.form === 'purchase');
  const line = po.lines[0]!;
  const item = itemById(line.itemId);
  return (
    <div className="tl-block-chat-card">
      <Card
        title={`발주서 ${po.id}`}
        subtitle={`${partyById(po.partyId).name} · ${[po.incoterms, SHIPMENTS.find((s) => s.id === po.shipmentId)?.pod].filter(Boolean).join(' ')} · ${po.buyer}`}
        action={doc ? <Badge approval={doc.state} /> : null}
        footer={
          <div className="tl-block-chat-card__actions">
            {screens.has('erp/purchasing/po-list') && (
              <Button
                size="sm"
                icon="external-link"
                onPress={() => screens.go('erp/purchasing/po-list')}
              >
                발주서 열기
              </Button>
            )}
            {doc && screens.has('groupware/approval/document') && (
              <Button
                size="sm"
                variant="ghost"
                icon="stamp"
                onPress={() => screens.go('groupware/approval/document', { id: doc.id })}
              >
                결재 문서 {doc.id}
              </Button>
            )}
          </div>
        }
      >
        <DescriptionList
          columns={2}
          layout="vertical"
          items={[
            {
              label: '품목',
              value: `${item.name} ${formatQuantity(line.qty, item.unit)}`,
              span: 2,
            },
            { label: '금액', value: formatCurrency(poAmount(po), po.currency) },
            { label: '원화 환산', value: formatCurrency(poAmountKrw(po), 'KRW') },
            { label: '납기', value: po.dueDate },
            { label: '입고', value: warehouseById(po.warehouseId).name },
          ]}
        />
      </Card>
    </div>
  );
}
// slot: businessCard end

export default function Messenger() {
  const toast = useToast();
  const { session } = usePlatform();
  const me = meOf(session.user.id);
  const [channels, setChannels] = useState<Channel[]>(() =>
    CHANNELS.map((c) => (c.id === FIRST ? { ...c, unread: 0 } : { ...c })),
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => [...MESSAGES]);
  const [activeId, setActiveId] = useState(FIRST);
  const [newFrom, setNewFrom] = useState<string | null>(() => {
    const unread = CHANNELS.find((c) => c.id === FIRST)?.unread ?? 0;
    const list = MESSAGES.filter((m) => m.channelId === FIRST);
    return list[list.length - unread]?.id ?? null;
  });
  const [q, setQ] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);
  // 대화 검색(걸러 보기) · 답글 대상 · 새 대화 창
  const [findOpen, setFindOpen] = useState(false);
  const [find, setFind] = useState('');
  const [replyId, setReplyId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const threadRef = useRef<HTMLElement>(null);
  const findRef = useRef<HTMLInputElement>(null);
  const composerId = 'tl-block-chat-composer';
  // 1024 미만: 목록이 대화 위로 올라가 한 줄 행(sm)으로 줄인다
  const bp = useBreakpoint();
  const narrow = BREAKPOINTS.indexOf(bp) < BREAKPOINTS.indexOf('lg');
  // 휴대폰(touch 밀도)은 머리글자가 커서 겹친 아바타를 크게, 둘만
  const phone = bp === 'base';

  const active = channels.find((c) => c.id === activeId)!;
  const thread = messages.filter((m) => m.channelId === activeId);
  const findKey = find.trim().toLowerCase();
  const shown = findKey
    ? thread.filter(
        (m) =>
          m.text.toLowerCase().includes(findKey) ||
          (m.files ?? []).some((f) => f.name.toLowerCase().includes(findKey)),
      )
    : thread;
  const shownChannels = channels.filter((c) => !q || c.name.includes(q));
  const sharedFiles = thread.flatMap((m) => m.files ?? []);
  const members = active.members.map(empById);
  const online = members.filter((e) => e.presence === 'online').length;
  const pinned = active.pinned ? thread.find((m) => m.id === active.pinned) : undefined;
  const replyTarget = replyId ? thread.find((m) => m.id === replyId) : undefined;
  const mentionable: ComposerMention[] = members
    .filter((e) => e.id !== me.id)
    .map((e) => ({ id: e.id, name: e.name, meta: `${e.team} · ${e.title}` }));
  // 내 메시지 읽음: 뒤에 다른 사람 메시지가 있으면 읽음, 없으면 지금 접속하지 않은 멤버 수(1:1은 상대 한 명)
  const away =
    active.kind === 'dm'
      ? 1
      : members.filter((e) => e.id !== me.id && e.presence !== 'online').length;

  // 방을 바꾸면 검색 · 답글 대상을 비운다
  useEffect(() => {
    setFind('');
    setFindOpen(false);
    setReplyId(null);
  }, [activeId]);
  useEffect(() => {
    if (findOpen) findRef.current?.focus();
  }, [findOpen]);

  const reactionsOf = (m: ChatMessage): MessageThreadReaction[] =>
    CHAT_REACTIONS.map((o) => {
      const r = m.reactions?.find((x) => x.key === o.key);
      return { ...o, count: r?.by.length ?? 0, mine: r?.by.includes(me.id) ?? false };
    });

  const items: MessageThreadWebItem[] = shown.map((m) => {
    const who = empById(m.authorId);
    const own = m.authorId === me.id;
    const i = thread.indexOf(m);
    const answered = thread.slice(i + 1).some((x) => x.authorId !== me.id);
    const orig = m.replyTo ? messages.find((x) => x.id === m.replyTo) : undefined;
    return {
      id: m.id,
      at: m.at,
      author: { id: who.id, name: `${who.name} ${who.title}`, meta: who.team },
      own,
      ...(m.text ? { text: m.text } : {}),
      ...(m.files ? { files: m.files } : {}),
      ...(m.card?.kind === 'po' ? { extra: <PoCard id={m.card.id} /> } : {}),
      ...(own ? { unread: answered ? 0 : away } : {}),
      reactions: reactionsOf(m),
      ...(orig
        ? { replyTo: { id: orig.id, author: personLabel(orig.authorId), text: lineOf(orig) } }
        : {}),
      ...(m.mentions?.length ? { mentions: m.mentions.map((id) => empById(id).name) } : {}),
    };
  });

  const react = (id: string, key: string) =>
    setMessages((ms) =>
      ms.map((m) => {
        if (m.id !== id) return m;
        const list = m.reactions ?? [];
        const r = list.find((x) => x.key === key);
        const by = r?.by.includes(me.id)
          ? r.by.filter((x) => x !== me.id)
          : [...(r?.by ?? []), me.id];
        const next = r
          ? list.map((x) => (x.key === key ? { key, by } : x))
          : [...list, { key, by }];
        return { ...m, reactions: next.filter((x) => x.by.length > 0) };
      }),
    );
  const pin = (id: string | undefined) =>
    setChannels((cs) =>
      cs.map((c) => {
        if (c.id !== activeId) return c;
        const next = { ...c };
        if (id) next.pinned = id;
        else delete next.pinned;
        return next;
      }),
    );
  const startReply = (id: string) => {
    setReplyId(id);
    document.getElementById(composerId)?.focus();
  };
  /** 고정 공지 · 검색 결과에서 원문으로: 걸러 보기를 풀고 그 메시지로 스크롤 · 포커스 */
  const goTo = (id: string) => {
    setFind('');
    setFindOpen(false);
    requestAnimationFrame(() => {
      const el = [
        ...(threadRef.current?.querySelectorAll<HTMLElement>('[data-message-id]') ?? []),
      ].find((x) => x.dataset['messageId'] === id);
      if (!el) return;
      el.scrollIntoView({ block: 'center' });
      el.tabIndex = -1;
      el.focus({ preventScroll: true });
    });
  };

  // 메시지 우클릭 · 길게 누르기 · Shift+F10 메뉴. 연 요소의 data-message-id로 어느 메시지인지 정한다
  const target = thread.find((m) => m.id === menuId);
  const messageMenu: MenuEntry[] = target
    ? [
        {
          id: 'copy',
          label: '복사',
          icon: 'copy',
          disabled: !target.text,
          onSelect: () => {
            void navigator.clipboard?.writeText(target.text).catch(() => undefined);
            toast.show({ title: '복사했습니다' });
          },
        },
        { id: 'reply', label: '답글', icon: 'reply', onSelect: () => startReply(target.id) },
        active.pinned === target.id
          ? {
              id: 'unpin',
              label: '고정 해제',
              icon: 'pin-off',
              onSelect: () => {
                pin(undefined);
                toast.show({ title: '고정을 해제했습니다', tone: 'neutral' });
              },
            }
          : {
              id: 'pin',
              label: '공지로 고정',
              icon: 'pin',
              onSelect: () => {
                pin(target.id);
                toast.show({
                  title: '공지로 고정했습니다',
                  description: `${active.name} · ${empById(target.authorId).name}`,
                });
              },
            },
        { type: 'label', label: '반응' },
        ...CHAT_REACTIONS.map((o): MenuEntry => ({
          id: `react:${o.key}`,
          label: o.label,
          icon: o.icon,
          onSelect: () => react(target.id, o.key),
        })),
        ...(target.authorId === me.id
          ? ([
              { type: 'separator' },
              {
                id: 'delete',
                label: '삭제',
                icon: 'trash-2',
                danger: true,
                onSelect: () => {
                  setMessages((ms) => ms.filter((x) => x.id !== target.id));
                  if (active.pinned === target.id) pin(undefined);
                  toast.show({ title: '메시지를 삭제했습니다', tone: 'neutral' });
                },
              },
            ] satisfies MenuEntry[])
          : []),
      ]
    : [];

  const openChannel = (c: Channel) => {
    const list = messages.filter((m) => m.channelId === c.id);
    setNewFrom(c.unread ? (list[list.length - c.unread]?.id ?? null) : null);
    setActiveId(c.id);
    setChannels((cs) => cs.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)));
  };
  const send = (raw: string, files: File[], meta?: ComposerSendMeta) => {
    const notice = meta?.command === 'notice';
    const text = notice ? raw.replace(/^\/\S+\s*/, '') : raw;
    if (notice && !text && files.length === 0) return;
    const id = `me${Date.now()}`;
    setMessages((ms) => [
      ...ms,
      {
        id,
        channelId: activeId,
        authorId: me.id,
        at: `${TODAY} ${GW_NOW}`,
        text,
        ...(files.length ? { files: files.map((f) => ({ name: f.name, size: f.size })) } : {}),
        ...(replyTarget ? { replyTo: replyTarget.id } : {}),
        ...(meta?.mentions.length ? { mentions: meta.mentions } : {}),
      },
    ]);
    setNewFrom(null);
    setReplyId(null);
    if (notice) {
      pin(id);
      toast.show({ title: '공지로 고정했습니다', description: active.name });
    }
  };
  const startChat = () => {
    const ids = picked.filter((id) => id !== me.id);
    if (ids.length === 0) return;
    const existing =
      ids.length === 1 ? channels.find((c) => c.kind === 'dm' && c.empId === ids[0]) : undefined;
    const room: Channel = existing ?? {
      id: `${ids.length === 1 ? 'dm' : 'ch'}-new-${Date.now()}`,
      kind: ids.length === 1 ? 'dm' : 'channel',
      name:
        ids.length === 1
          ? personLabel(ids[0]!)
          : `${ids
              .slice(0, 3)
              .map((id) => empById(id).name)
              .join(' · ')}${ids.length > 3 ? ` 외 ${ids.length - 3}명` : ''}`,
      ...(ids.length === 1 ? { empId: ids[0]! } : {}),
      members: [...ids, me.id],
      unread: 0,
    };
    if (!existing) setChannels((cs) => [...cs, room]);
    setNewOpen(false);
    setPicked([]);
    setNewFrom(null);
    setActiveId(room.id);
    if (!existing) toast.show({ title: '대화를 시작했습니다', description: room.name });
  };

  // 대화 머리의 방 표시(1:1은 아바타, 채널은 아이콘 칸). 목록 행은 SelectableList가 그린다
  const icon = (c: Channel) =>
    c.kind === 'dm' ? (
      <Avatar
        name={c.name.split(' ')[0]!}
        size={32}
        status={empById(c.empId!).presence}
        decorative
      />
    ) : (
      <span className="tl-block-chat-list__hash" aria-hidden="true">
        <Icon name={c.id === 'ch-notice' ? 'megaphone' : 'users'} size={16} />
      </span>
    );

  // slot: channels — 방 목록 행(SelectableList): 채널 · 대화 묶음, 마지막 메시지, 시각, 안 읽음 수
  const roomItem = (c: Channel): SelectableListItem => {
    const last = lastOf(messages, c.id);
    return {
      id: c.id,
      group: c.kind === 'channel' ? '채널' : '대화',
      title: c.name,
      ...(c.kind === 'dm'
        ? { avatar: { name: c.name.split(' ')[0]!, status: empById(c.empId!).presence } }
        : { icon: c.id === 'ch-notice' ? 'megaphone' : 'users' }),
      secondary: last
        ? `${c.kind === 'channel' ? `${empById(last.authorId).name}: ` : ''}${lineOf(last)}`
        : '대화를 시작하세요',
      ...(last ? { meta: short(last.at) } : {}),
      count: c.unread,
      ...(c.muted ? { muted: true } : {}),
    };
  };
  const rooms = [
    ...shownChannels.filter((c) => c.kind === 'channel'),
    ...shownChannels.filter((c) => c.kind === 'dm'),
  ].map(roomItem);
  // slot: channels end

  const people = (list: typeof members) => (
    <ul className="tl-block-chat-info__people">
      {list.map((e) => (
        <li key={e.id}>
          <Avatar name={e.name} size={24} status={e.presence} decorative />
          <span>
            {e.name} {e.title}
          </span>
          <span className="tl-block-chat-info__team">{e.team}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '그룹웨어' }, { label: '메신저' }]}
          title="메신저"
          description={`${me.name} ${me.title} · 안 읽은 메시지 ${channels.reduce((a, c) => a + c.unread, 0)}개`}
          actions={
            <Button icon="plus" onPress={() => setNewOpen(true)}>
              새 대화
            </Button>
          }
        />
      }
    >
      <div className="tl-block-chat">
        <nav className="tl-block-chat-list" aria-label="채널 · 대화">
          <div className="tl-block-chat-list__search">
            <Input
              type="search"
              icon="search"
              size="sm"
              label="채널 · 사람 검색"
              placeholder="채널 · 사람"
              value={q}
              onChange={setQ}
              clearable
            />
          </div>
          <div className="tl-block-chat-list__scroll">
            <SelectableList
              label="대화방"
              items={rooms}
              selected={activeId}
              onSelect={(id) => {
                const c = channels.find((x) => x.id === id);
                if (c) openChannel(c);
              }}
              size={narrow ? 'sm' : 'md'}
              emptyText="찾는 채널 · 사람이 없습니다. 이름을 다시 확인하세요"
            />
          </div>
        </nav>

        <section
          className="tl-block-chat-thread"
          aria-label={`${active.name} 대화`}
          ref={threadRef}
        >
          <header className="tl-block-chat-thread__head">
            {icon(active)}
            <Lines
              primary={<span className="tl-block-chat-thread__title">{active.name}</span>}
              secondary={
                active.kind === 'dm'
                  ? `${empById(active.empId!).team} · ${empById(active.empId!).duty}`
                  : `멤버 ${members.length}명 · 지금 접속 ${online}명`
              }
            />
            <span className="tl-block-chat-thread__tools">
              {active.kind === 'channel' && (
                <Popover
                  title={`멤버 ${members.length}명 · 접속 ${online}명`}
                  initialFocus="panel"
                  width="sm"
                  align="end"
                  trigger={
                    <button type="button" className="tl-block-chat-thread__members tl-focusable">
                      {/* 단추 이름 = 겹친 아바타의 이름(멤버 12명). 보이는 머리글자와 어긋나지 않게 aria-label을 두지 않는다 */}
                      <AvatarGroup
                        people={members.map((e) => ({ name: e.name }))}
                        max={phone ? 2 : 4}
                        size={phone ? 32 : 24}
                        label={`멤버 ${members.length}명`}
                      />
                    </button>
                  }
                >
                  {people(members)}
                </Popover>
              )}
              <IconButton
                icon="search"
                label="대화 검색"
                pressed={findOpen}
                onPress={() => {
                  if (findOpen) setFind('');
                  setFindOpen(!findOpen);
                }}
              />
            </span>
          </header>
          {pinned && (
            // 고정 공지: 머리 아래 한 줄(색 바탕 없이 선으로 나눈다). 누르면 원문으로, 오른쪽은 고정 해제
            <div className="tl-block-chat-pin" role="region" aria-label="고정 공지">
              <Icon name="pin" size={16} className="tl-block-chat-pin__icon" />
              <button
                type="button"
                className="tl-block-chat-pin__body tl-focusable"
                onClick={() => goTo(pinned.id)}
              >
                <span className="tl-block-chat-pin__who">{empById(pinned.authorId).name}</span>
                <span className="tl-block-chat-pin__text">{lineOf(pinned)}</span>
              </button>
              <IconButton
                size="sm"
                icon="pin-off"
                label="고정 해제"
                onPress={() => {
                  pin(undefined);
                  toast.show({ title: '고정을 해제했습니다', tone: 'neutral' });
                }}
              />
            </div>
          )}
          {findOpen && (
            <div
              className="tl-block-chat-find"
              onKeyDown={(e) => {
                if (e.key !== 'Escape' || e.defaultPrevented) return;
                e.preventDefault();
                setFind('');
                setFindOpen(false);
              }}
            >
              <Input
                ref={findRef}
                type="search"
                icon="search"
                size="sm"
                label={`${active.name}에서 검색`}
                placeholder="메시지 · 파일 이름"
                value={find}
                onChange={setFind}
                clearable
              />
              <span className="tl-block-chat-find__count" role="status">
                {findKey ? `${formatQuantity(shown.length)}건` : ''}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onPress={() => {
                  setFind('');
                  setFindOpen(false);
                }}
              >
                닫기
              </Button>
            </div>
          )}
          <ContextMenu
            title="메시지"
            items={messageMenu}
            onOpenChange={(open, el) => {
              if (open)
                setMenuId(
                  el?.closest<HTMLElement>('[data-message-id]')?.dataset['messageId'] ?? null,
                );
            }}
          >
            {/* slot: message */}
            <MessageThread
              key={activeId}
              label={`${active.name} 메시지`}
              messages={items}
              height="fill"
              today={TODAY}
              groupMinutes={10}
              empty={
                findKey
                  ? `"${find.trim()}" 검색 결과가 없습니다. 다른 낱말로 검색하세요`
                  : '대화를 시작하세요'
              }
              reactionOptions={CHAT_REACTIONS}
              onReact={react}
              onReply={startReply}
              typing={findKey ? [] : (CHAT_TYPING[activeId] ?? []).map(personLabel)}
              {...(newFrom && !findKey ? { unreadFrom: newFrom } : {})}
            />
            {/* slot: message end */}
          </ContextMenu>
          {replyTarget && (
            <div className="tl-block-chat-reply">
              <Icon name="reply" size={16} className="tl-block-chat-reply__icon" />
              <Lines
                primary={`${personLabel(replyTarget.authorId)}에게 답글`}
                secondary={lineOf(replyTarget)}
              />
              <IconButton size="sm" icon="x" label="답글 취소" onPress={() => setReplyId(null)} />
            </div>
          )}
          <Composer
            key={activeId}
            id={composerId}
            className="tl-block-chat-input"
            sticky
            label={`${active.name}에 메시지`}
            placeholder={`${active.name}에 메시지 · @멘션 · /공지`}
            maxLength={1000}
            mentions={mentionable}
            commands={COMMANDS}
            onSend={send}
          />
        </section>

        <aside className="tl-block-chat-info" aria-label={`${active.name} 정보`}>
          <section>
            <h3>멤버 {members.length}명</h3>
            {people(members.slice(0, 8))}
            {members.length > 8 && (
              <p className="tl-block-chat-info__more">외 {members.length - 8}명</p>
            )}
          </section>
          <section>
            <h3>공유한 파일 {sharedFiles.length}개</h3>
            {sharedFiles.length ? (
              <Attachment files={sharedFiles} />
            ) : (
              <p className="tl-block-chat-info__more">아직 공유한 파일이 없습니다</p>
            )}
          </section>
        </aside>
      </div>

      <Dialog
        open={newOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          if (!open) setPicked([]);
        }}
        title="새 대화"
        description="한 명을 고르면 1:1 대화, 두 명 이상이면 그룹 대화가 됩니다"
        footer={
          <>
            <Button variant="ghost" onPress={() => setNewOpen(false)}>
              취소
            </Button>
            <Button variant="primary" disabled={picked.length === 0} onPress={startChat}>
              대화 시작
            </Button>
          </>
        }
      >
        <TagInput
          mode="person"
          label="대화할 사람"
          placeholder="이름 · 팀으로 찾기"
          value={picked}
          onChange={setPicked}
          suggestions={EMPLOYEES.filter((e) => e.id !== me.id).map((e) => ({
            value: e.id,
            label: `${e.name} ${e.title}`,
            meta: e.team,
          }))}
        />
      </Dialog>
    </Page>
  );
}
