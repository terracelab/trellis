// 공지(ListDetail): 필독 고정 → 분류 · 제목 · 작성자 · 조회 · 날짜 목록 → 본문 · 첨부 · 필독 읽음 확인
import { formatAmount, formatDate, formatDueDays } from '@terracelab/trellis-contracts';
import {
  Attachment,
  Avatar,
  Badge,
  Button,
  Card,
  DataGrid,
  EmptyState,
  FilterBar,
  Icon,
  Input,
  PageHeader,
  PersonLabel,
  Progress,
  SegmentedControl,
  StatusDot,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  EMPLOYEES,
  empById,
  empLabel,
  meOf,
  NOTICE_CATEGORIES,
  NOTICES,
  NOTICES_SEEN,
  type Notice,
} from '../../../_data/groupware.js';
import { TODAY } from '../../../_data/index.js';
import { useCan, usePlatform } from '../../../_platform/index.js';
import { Muted, Page, Split } from '../../../_ui/index.js';
import './style.css';

/** 처음 여는 공지: 목록 맨 위 */
const FIRST = NOTICES[0]?.id ?? '';
/** 내가 이미 읽은 공지(데이터) */
const SEEN = NOTICES_SEEN;

export default function Notices() {
  const toast = useToast();
  const { session } = usePlatform();
  const me = meOf(session.user.id);
  const canWrite = useCan('board', 'create');
  const [notices, setNotices] = useState<Notice[]>(() =>
    NOTICES.map((n) => (n.id === FIRST ? { ...n, views: n.views + 1 } : { ...n })),
  );
  const [seen, setSeen] = useState<string[]>([...SEEN, FIRST]);
  const [cat, setCat] = useState('all');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState<string | null>(FIRST);

  const rows = notices
    .filter(
      (n) =>
        (cat === 'all' || n.category === cat) &&
        (filter === 'all' || (filter === 'unread' ? !seen.includes(n.id) : !!n.pinned)) &&
        (!q || `${n.title}${empById(n.authorId).name}`.includes(q)),
    )
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.date.localeCompare(a.date));
  const active = notices.find((n) => n.id === activeId) ?? null;
  const unreadCount = notices.filter((n) => !seen.includes(n.id)).length;
  const pinned = notices.filter((n) => n.pinned);

  const open = (n: Notice) => {
    setActiveId(n.id);
    if (!seen.includes(n.id)) {
      setSeen((s) => [...s, n.id]);
      setNotices((ns) => ns.map((x) => (x.id === n.id ? { ...x, views: x.views + 1 } : x)));
    }
  };
  const confirmRead = (n: Notice) => {
    setNotices((ns) =>
      ns.map((x) => (x.id === n.id ? { ...x, readBy: [...(x.readBy ?? []), me.id] } : x)),
    );
    toast.show({ title: '읽음 확인했습니다', description: n.title, tone: 'success' });
  };

  const readBy = active?.readBy ?? [];
  const unreadPeople = active?.pinned ? EMPLOYEES.filter((e) => !readBy.includes(e.id)) : [];
  const iConfirmed = readBy.includes(me.id);

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '게시판' }, { label: '공지' }]}
          title="공지"
          description={`전 직원 ${EMPLOYEES.length}명 · 필독 ${pinned.length}건 · 안 읽은 공지 ${unreadCount}건`}
          actions={
            <Button icon="pen-line" disabled={!canWrite}>
              공지 작성
            </Button>
          }
          tabs={
            <Tabs
              label="분류"
              value={cat}
              onChange={setCat}
              items={[
                { value: 'all', label: '전체', count: notices.length },
                ...NOTICE_CATEGORIES.map((c) => ({
                  value: c,
                  label: c,
                  count: notices.filter((n) => n.category === c).length,
                })),
              ]}
            />
          }
        />
      }
    >
      <Split
        asideWidth="md"
        main={
          <>
            <FilterBar
              search={
                <Input
                  type="search"
                  icon="search"
                  size="sm"
                  label="공지 검색"
                  placeholder="제목 · 작성자"
                  value={q}
                  onChange={setQ}
                  clearable
                />
              }
              resultCount={rows.length}
              onReset={() => {
                setQ('');
                setFilter('all');
                setCat('all');
              }}
            >
              <SegmentedControl
                size="sm"
                label="보기"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: '전체' },
                  { value: 'unread', label: '안 읽음', count: unreadCount },
                  { value: 'pinned', label: '필독', count: pinned.length },
                ]}
              />
            </FilterBar>
            <DataGrid
              caption="공지 목록"
              className="tl-block-notice-grid"
              height="fill"
              rows={rows}
              rowKey="id"
              onRowPress={open}
              activeRowKey={activeId}
              empty="이 조건의 공지가 없습니다. 분류나 검색어를 바꿔 보세요"
              columns={[
                {
                  key: 'category',
                  header: '분류',
                  width: 'sm',
                  render: (n) => (
                    <Badge variant="outline" size="sm" dot={false}>
                      {n.category}
                    </Badge>
                  ),
                },
                {
                  key: 'title',
                  header: '제목',
                  render: (n) => (
                    <span
                      className="tl-block-notice-title"
                      data-unread={!seen.includes(n.id) || undefined}
                    >
                      {n.pinned && (
                        <Badge tone="warning" size="sm">
                          필독
                        </Badge>
                      )}
                      <span className="tl-block-notice-title__text">{n.title}</span>
                      {(n.files?.length ?? 0) > 0 && (
                        <Icon name="paperclip" size={16} label={`첨부 ${n.files!.length}개`} />
                      )}
                      {!seen.includes(n.id) && <span className="tl-sr-only">안 읽음</span>}
                    </span>
                  ),
                },
                {
                  key: 'author',
                  header: '작성자',
                  width: 'sm',
                  render: (n) => empLabel(n.authorId),
                },
                { key: 'views', header: '조회', width: 'xs', format: 'number' },
                { key: 'date', header: '날짜', width: 'sm', format: 'date' },
              ]}
            />
          </>
        }
        aside={
          active ? (
            <Card padding="none">
              <article className="tl-block-notice" aria-label={active.title}>
                <header className="tl-block-notice__head">
                  <div className="tl-block-notice__badges">
                    <Badge variant="outline" dot={false}>
                      {active.category}
                    </Badge>
                    {active.pinned && <Badge tone="warning">필독</Badge>}
                    {active.dueDate && (
                      <Muted>
                        기한 {formatDate(active.dueDate, 'mdw')} ·{' '}
                        {formatDueDays(active.dueDate, TODAY)}
                      </Muted>
                    )}
                  </div>
                  <h2 className="tl-block-notice__title">{active.title}</h2>
                  <div className="tl-block-notice__meta">
                    <PersonLabel
                      name={empLabel(active.authorId)}
                      meta={empById(active.authorId).team}
                    />
                    <span className="tl-block-notice__stat">
                      {formatDate(active.date, 'mdw')} · 조회 {formatAmount(active.views)}
                    </span>
                  </div>
                </header>
                <div className="tl-block-notice__body">
                  {active.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {(active.files?.length ?? 0) > 0 && (
                  <div className="tl-block-notice__files">
                    <h3>첨부 {active.files!.length}개</h3>
                    <Attachment files={active.files!} />
                  </div>
                )}
                {active.pinned && (
                  <section className="tl-block-notice__read" aria-label="읽음 확인">
                    <Progress
                      label="읽음 확인"
                      value={readBy.length}
                      max={EMPLOYEES.length}
                      unit="명"
                      showValue
                      tone={unreadPeople.length === 0 ? 'success' : undefined}
                    />
                    {unreadPeople.length > 0 && (
                      <div className="tl-block-notice__unread">
                        <span className="tl-block-notice__label">
                          미확인 {unreadPeople.length}명
                        </span>
                        <ul>
                          {unreadPeople.map((e) => (
                            <li key={e.id}>
                              <Avatar name={e.name} size={24} decorative />
                              {e.name} {e.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="tl-block-notice__actions">
                      {iConfirmed ? (
                        <StatusDot tone="success">읽음 확인했습니다</StatusDot>
                      ) : (
                        <Button variant="primary" icon="check" onPress={() => confirmRead(active)}>
                          읽음 확인
                        </Button>
                      )}
                      {active.authorId === me.id && unreadPeople.length > 0 && (
                        <Button
                          icon="bell"
                          onPress={() =>
                            toast.show({
                              title: `미확인 ${unreadPeople.length}명에게 다시 알렸습니다`,
                              tone: 'success',
                            })
                          }
                        >
                          미확인자 알림
                        </Button>
                      )}
                    </div>
                  </section>
                )}
              </article>
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon="pin"
                title="공지를 고르세요"
                description="왼쪽 목록에서 읽을 공지를 누릅니다"
              />
            </Card>
          )
        }
      />
    </Page>
  );
}
