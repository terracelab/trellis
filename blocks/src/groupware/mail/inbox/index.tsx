// 메일(ListDetail): 메일함(FolderTree) · 목록(안 읽음 굵게) · 읽기 창(첨부 · 답장 · 전달). 넓은 화면은 세 칸
import { formatDate } from '@terracelab/trellis-contracts';
import {
  Attachment,
  Avatar,
  Banner,
  Button,
  Card,
  EmptyState,
  Field,
  FolderTree,
  Icon,
  IconButton,
  Input,
  PageHeader,
  PersonLabel,
  Progress,
  SegmentedControl,
  Textarea,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  GW_NOW,
  MAIL_FOLDERS,
  MAILS,
  meOf,
  type Mail,
  type MailFolder,
} from '../../../_data/groupware.js';
import { TODAY } from '../../../_data/index.js';
import { usePlatform } from '../../../_platform/index.js';
import { addDays, Page, Split } from '../../../_ui/index.js';
import './style.css';

/** 처음 여는 메일: 받은 메일함에서 첨부가 있는 첫 한글 메일(없으면 첫 메일) */
const FIRST =
  MAILS.find((m) => m.folder === 'inbox' && m.files?.length && /[가-힣]/.test(m.subject))?.id ??
  MAILS[0]?.id ??
  null;
const when = (at: string) => (at.startsWith(TODAY) ? at.slice(11) : formatDate(at, 'md'));
const preview = (m: Mail) => m.body.join(' ').replace(/\s+/g, ' ');

export default function MailInbox() {
  const toast = useToast();
  const { session } = usePlatform();
  const me = meOf(session.user.id);
  const [mails, setMails] = useState<Mail[]>(() =>
    MAILS.map((m) => (m.id === FIRST ? { ...m, unread: false } : { ...m })),
  );
  const [folder, setFolder] = useState<MailFolder>('inbox');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState<string | null>(FIRST);
  const [reply, setReply] = useState<'reply' | 'all' | 'forward' | null>(null);
  const [text, setText] = useState('');

  const inFolder = mails.filter((m) => m.folder === folder);
  const list = inFolder.filter(
    (m) =>
      (filter === 'all' || (filter === 'unread' ? m.unread : (m.files?.length ?? 0) > 0)) &&
      (!q || `${m.from.name}${m.from.org ?? ''}${m.subject}${preview(m)}`.includes(q)),
  );
  const active = mails.find((m) => m.id === activeId) ?? null;
  const unreadIn = (f: MailFolder) => mails.filter((m) => m.folder === f && m.unread).length;
  const countOf = (f: MailFolder) =>
    f === 'drafts' ? mails.filter((m) => m.folder === f).length : unreadIn(f);

  const openMail = (m: Mail) => {
    setActiveId(m.id);
    setReply(null);
    setText('');
    if (m.unread) setMails((ms) => ms.map((x) => (x.id === m.id ? { ...x, unread: false } : x)));
  };
  const toggleStar = (m: Mail) =>
    setMails((ms) => ms.map((x) => (x.id === m.id ? { ...x, starred: !x.starred } : x)));
  const remove = (m: Mail) => {
    setMails((ms) => ms.filter((x) => x.id !== m.id));
    setActiveId(null);
    toast.show({
      title: '메일을 삭제했습니다',
      action: { label: '되돌리기', onPress: () => setMails((ms) => [m, ...ms]) },
    });
  };
  const send = () => {
    if (!active || !text.trim()) return;
    const subject = `${reply === 'forward' ? 'FW' : 'RE'}: ${active.subject.replace(/^(RE|FW): /, '')}`;
    setMails((ms) => [
      {
        id: `s${Date.now()}`,
        folder: 'sent',
        from: { name: me.name, email: me.email, org: me.team },
        to: [active.from.org ? `${active.from.name}(${active.from.org})` : active.from.name],
        subject,
        body: text.split('\n'),
        at: `${TODAY} ${GW_NOW}`,
      },
      ...ms,
    ]);
    setReply(null);
    setText('');
    toast.show({ title: '메일을 보냈습니다', description: subject, tone: 'success' });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '그룹웨어' }, { label: '메일' }]}
          title="메일"
          description={`${me.email} · 안 읽은 메일 ${unreadIn('inbox')}통`}
          actions={
            <>
              <Button icon="refresh-cw" onPress={() => toast.show({ title: '새 메일이 없습니다' })}>
                새로 고침
              </Button>
              <Button variant="primary" icon="pen-line">
                메일 쓰기
              </Button>
            </>
          }
        />
      }
    >
      <Split
        asideWidth="lg"
        main={
          <div className="tl-block-mail">
            <div className="tl-block-mail__folders">
              <FolderTree
                label="메일함"
                nodes={MAIL_FOLDERS.map((f) => ({
                  id: f.id,
                  label: f.label,
                  icon: f.icon,
                  // 받은편지함 · 스팸은 안 읽은 메일, 임시 보관함은 전체 건수. 0이면 숫자를 감춘다
                  ...(countOf(f.id) > 0 ? { count: countOf(f.id) } : {}),
                }))}
                selected={folder}
                onSelect={(id) => {
                  setFolder(id as MailFolder);
                  setFilter('all');
                }}
              />
              <div className="tl-block-mail__quota">
                <Progress label="메일함 용량(10GB)" value={24} max={100} showValue size="sm" />
              </div>
            </div>
            <section className="tl-block-mail__listbox" aria-label="메일 목록">
              <div className="tl-block-mail__toolbar">
                <Input
                  type="search"
                  icon="search"
                  size="sm"
                  label="메일 검색"
                  placeholder="보낸 사람 · 제목 · 내용"
                  value={q}
                  onChange={setQ}
                  clearable
                />
                <SegmentedControl
                  size="sm"
                  label="메일 거르기"
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: 'all', label: '전체', count: inFolder.length },
                    { value: 'unread', label: '안 읽음', count: unreadIn(folder) },
                    { value: 'files', label: '첨부' },
                  ]}
                />
              </div>
              {list.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon="inbox"
                  title="메일이 없습니다"
                  description="다른 메일함을 고르거나 검색어를 바꿔 보세요"
                />
              ) : (
                <ul className="tl-block-mail__list">
                  {list.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        className="tl-block-mail__item tl-focusable"
                        data-unread={m.unread || undefined}
                        data-active={m.id === activeId || undefined}
                        aria-current={m.id === activeId ? 'true' : undefined}
                        onClick={() => openMail(m)}
                      >
                        <Avatar
                          name={
                            folder === 'sent' || folder === 'drafts' ? (m.to[0] ?? '') : m.from.name
                          }
                          size={32}
                          decorative
                        />
                        <span className="tl-block-mail__meta">
                          <span className="tl-block-mail__from">
                            {m.unread && <span className="tl-sr-only">안 읽음 </span>}
                            {folder === 'sent' || folder === 'drafts'
                              ? m.to.join(', ')
                              : m.from.org &&
                                  m.from.org !== '대표' &&
                                  !m.from.email.includes('terra-trading')
                                ? `${m.from.name} · ${m.from.org}`
                                : m.from.name}
                          </span>
                          <span className="tl-block-mail__time">{when(m.at)}</span>
                        </span>
                        <span className="tl-block-mail__subject">
                          {m.subject}
                          {(m.files?.length ?? 0) > 0 && (
                            <Icon name="paperclip" size={16} label={`첨부 ${m.files!.length}개`} />
                          )}
                          {m.starred && <Icon name="star" size={16} label="중요" />}
                        </span>
                        <span className="tl-block-mail__preview">{preview(m)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        }
        aside={
          active ? (
            <Card padding="none">
              <article className="tl-block-mail-read" aria-label={active.subject}>
                <header className="tl-block-mail-read__head">
                  <h2 className="tl-block-mail-read__subject">{active.subject}</h2>
                  <div className="tl-block-mail-read__from">
                    <PersonLabel
                      name={`${active.from.name}${active.from.org ? ` · ${active.from.org}` : ''}`}
                      meta={active.from.email}
                    />
                    <time
                      className="tl-block-mail-read__time"
                      dateTime={active.at.replace(' ', 'T')}
                    >
                      {formatDate(active.at, 'mdw')} {active.at.slice(11)}
                    </time>
                  </div>
                  <dl className="tl-block-mail-read__to">
                    <dt>받는 사람</dt>
                    <dd>{active.to.join(', ')}</dd>
                    {active.cc && (
                      <>
                        <dt>참조</dt>
                        <dd>{active.cc.join(', ')}</dd>
                      </>
                    )}
                  </dl>
                  <div className="tl-block-mail-read__actions">
                    <Button size="sm" icon="undo-2" onPress={() => setReply('reply')}>
                      답장
                    </Button>
                    <Button size="sm" onPress={() => setReply('all')}>
                      전체 답장
                    </Button>
                    <Button size="sm" icon="arrow-right" onPress={() => setReply('forward')}>
                      전달
                    </Button>
                    <span className="tl-block-mail-read__spacer" />
                    <IconButton
                      icon="star"
                      size="sm"
                      label={active.starred ? '중요 표시 해제' : '중요 표시'}
                      pressed={!!active.starred}
                      onPress={() => toggleStar(active)}
                    />
                    <IconButton icon="printer" size="sm" label="인쇄" />
                    <IconButton
                      icon="trash-2"
                      size="sm"
                      label="삭제"
                      onPress={() => remove(active)}
                    />
                  </div>
                </header>
                {active.suspicious && (
                  <div className="tl-block-mail-read__banner">
                    <Banner tone="danger" title="거래처를 사칭한 메일일 수 있습니다">
                      보낸 주소가 등록된 거래처 주소(pacificseafoods.example)와 다릅니다. 계좌
                      변경은 담당자에게 전화로 확인하세요.
                    </Banner>
                  </div>
                )}
                <div className="tl-block-mail-read__body">
                  {active.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {(active.files?.length ?? 0) > 0 && (
                  <div className="tl-block-mail-read__files">
                    <h3>첨부 {active.files!.length}개</h3>
                    <Attachment files={active.files!} />
                  </div>
                )}
                {reply && (
                  <div className="tl-block-mail-read__reply">
                    <Field label={reply === 'forward' ? '전달할 사람' : '받는 사람'}>
                      <Input
                        value={
                          reply === 'forward'
                            ? ''
                            : reply === 'all'
                              ? [active.from.name, ...(active.cc ?? [])].join(', ')
                              : active.from.name
                        }
                        placeholder="이름 또는 메일 주소"
                        onChange={() => undefined}
                      />
                    </Field>
                    <Field label="내용">
                      <Textarea
                        rows={4}
                        value={text}
                        onChange={setText}
                        placeholder={`확인했습니다. ${formatDate(addDays(TODAY, 7), 'md')}까지 회신드리겠습니다`}
                      />
                    </Field>
                    <div className="tl-block-mail-read__send">
                      <Button size="sm" onPress={() => setReply(null)}>
                        취소
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon="send"
                        disabled={!text.trim()}
                        onPress={send}
                      >
                        보내기
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon="mail"
                title="메일을 고르세요"
                description="왼쪽 목록에서 읽을 메일을 누릅니다"
              />
            </Card>
          )
        }
      />
    </Page>
  );
}
