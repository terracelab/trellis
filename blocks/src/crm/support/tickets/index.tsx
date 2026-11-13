// 상담(ListDetail): 상태 탭 · SLA 경과 배너 · 상담 목록 · 오른쪽 상세(대화 MessageThread · 내부 메모 · 반품 연결 ·
// 답변 Composer) · 처리 완료
import {
  formatDate,
  formatDueDays,
  PROGRESS_STATES,
  type ProgressState,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Banner,
  Button,
  Card,
  Composer,
  DataGrid,
  DataGridLines,
  DescriptionList,
  DueBadge,
  EmptyState,
  Field,
  FilterBar,
  Input,
  MessageThread,
  type MessageThreadWebItem,
  PageHeader,
  SegmentedControl,
  Select,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  staffLabel,
  TICKET_PRIORITIES,
  TICKET_TYPES,
  TICKETS,
  type Ticket,
  type TicketType,
} from '../../../_data/ecm-crm.js';
import { TODAY } from '../../../_data/index.js';
import { NOW_AT, PROFILE, warehouseName } from '../../../_data/profile.js';
import { useCan, usePlatform, useScreens } from '../../../_platform/index.js';
import { addDays, Lines, Page, Split, yymm } from '../../../_ui/index.js';
import './style.css';

const RECEIVING = 'scm/warehouse/receiving';
const STATES: ProgressState[] = ['todo', 'doing', 'hold', 'done'];
const closed = (t: Ticket) => t.state === 'done' || t.state === 'cancel';
const late = (t: Ticket) => !closed(t) && t.slaDue < TODAY;
/** 상담 담당: 상담 데이터에 나오는 사람 */
const AGENTS = [...new Set(TICKETS.map((t) => t.assignee))];
/** 처음 여는 상담: 끝나지 않은 첫 상담 */
const FIRST = (TICKETS.find((t) => !closed(t)) ?? TICKETS[0])?.id ?? null;
/** 새 반품 입고 번호: RT-2611-0004(이번 달 다음 순번) */
const RT_PREFIX = `RT-${yymm(TODAY)}`;
const nextReturnId = () =>
  `${RT_PREFIX}-${String(
    Math.max(
      0,
      ...TICKETS.map((t) => t.returnId)
        .filter((id): id is string => !!id?.startsWith(RT_PREFIX))
        .map((id) => Number(id.slice(-4))),
    ) + 1,
  ).padStart(4, '0')}`;
/** 관련 문서 번호 → 그 문서를 보는 화면(세금계산서 · 견적) */
const docScreen = (doc: string) =>
  doc.startsWith('TI-') ? 'erp/tax/invoice-list' : 'crm/quotes/editor';
/** 대화 시각은 'MM-DD HH:mm'이라 올해를 붙인다 */
const YEAR = TODAY.slice(0, 4);

/** 상담 대화 → MessageThread. 담당자 답변이 오른쪽, 접수 사진은 첫 고객 메시지에 붙인다 */
function threadOf(t: Ticket): MessageThreadWebItem[] {
  const first = t.messages.findIndex((m) => m.from === 'customer');
  return t.messages.map((m, i) => ({
    id: m.id,
    at: `${YEAR}-${m.time}`,
    author: {
      id: m.name,
      name: m.name,
      ...(m.from === 'customer' ? { meta: t.customer } : {}),
    },
    own: m.from === 'agent',
    text: m.body,
    ...(i === first && t.attachments ? { files: t.attachments } : {}),
  }));
}

export default function Tickets() {
  const toast = useToast();
  const canHandle = useCan('support', 'update');
  const { session } = usePlatform();
  const screens = useScreens();
  const [tickets, setTickets] = useState<Ticket[]>(() => TICKETS.map((t) => ({ ...t })));
  const [tab, setTab] = useState('open');
  const [type, setType] = useState('all');
  const [agent, setAgent] = useState<string | null>('all');
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState<string | null>(FIRST);
  const [mode, setMode] = useState('reply');
  const [draft, setDraft] = useState('');
  const active = tickets.find((t) => t.id === activeId) ?? null;

  const inTab = (t: Ticket) =>
    tab === 'all' ? true : tab === 'open' ? !closed(t) : t.state === tab;
  const shown = tickets.filter(
    (t) =>
      inTab(t) &&
      (type === 'all' || t.type === type) &&
      (agent === 'all' || !agent || t.assignee === agent) &&
      (!q || `${t.id}${t.customer}${t.title}`.includes(q)),
  );
  const overdue = tickets.filter(late);
  const update = (id: string, patch: Partial<Ticket>) =>
    setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const send = (text: string) => {
    if (!active || !text) return;
    if (mode === 'reply') {
      update(active.id, {
        state: active.state === 'todo' ? 'doing' : active.state,
        messages: [
          ...active.messages,
          {
            id: `m${Date.now()}`,
            from: 'agent',
            name: staffLabel(active.assignee),
            time: NOW_AT.slice(5),
            body: text,
          },
        ],
      });
      toast.show({
        title: '답변을 보냈습니다',
        description: `${active.customer} ${active.contact}`,
      });
    } else {
      update(active.id, {
        memos: [
          ...active.memos,
          {
            id: `n${Date.now()}`,
            by: `${session.user.name} ${session.user.title}`,
            time: NOW_AT.slice(5),
            body: text,
          },
        ],
      });
      toast.show({ title: '내부 메모를 남겼습니다', tone: 'neutral' });
    }
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: 'CRM' }, { label: '상담' }]}
          title="상담"
          description={`처리할 상담 ${tickets.filter((t) => !closed(t)).length}건 · SLA 경과 ${overdue.length}건 · 오늘 접수 ${tickets.filter((t) => t.createdAt.startsWith(TODAY)).length}건`}
          actions={
            <Button icon="plus" disabled={!canHandle}>
              상담 등록
            </Button>
          }
          tabs={
            <Tabs
              label="상담 상태"
              value={tab}
              onChange={setTab}
              items={[
                {
                  value: 'open',
                  label: '처리할 것',
                  count: tickets.filter((t) => !closed(t)).length,
                },
                ...STATES.map((s) => ({
                  value: s,
                  label: PROGRESS_STATES[s].label,
                  count: tickets.filter((t) => t.state === s).length,
                })),
                { value: 'all', label: '전체', count: tickets.length },
              ]}
            />
          }
        />
      }
    >
      {overdue.length > 0 && (
        <Banner
          tone="danger"
          title={`SLA 경과 ${overdue.length}건`}
          action={
            <Button size="sm" onPress={() => setActiveId(overdue[0]!.id)}>
              상담 보기
            </Button>
          }
        >
          {overdue[0]!.id} {overdue[0]!.customer}: {overdue[0]!.title} ·{' '}
          {formatDueDays(overdue[0]!.slaDue, TODAY)}
        </Banner>
      )}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="접수 번호 · 고객 · 제목"
            label="상담 검색"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setType('all');
          setAgent('all');
          setTab('open');
        }}
        resultCount={shown.length}
      >
        <SegmentedControl
          size="sm"
          label="유형"
          value={type}
          onChange={setType}
          options={[
            { value: 'all', label: '전체' },
            ...(Object.keys(TICKET_TYPES) as TicketType[]).map((k) => ({
              value: k,
              label: TICKET_TYPES[k],
            })),
          ]}
        />
        <Select
          size="sm"
          width="auto"
          label="담당자"
          value={agent}
          onChange={setAgent}
          options={[
            { value: 'all', label: '담당 전체' },
            ...AGENTS.map((a) => ({ value: a, label: staffLabel(a) })),
          ]}
        />
      </FilterBar>
      <Split
        main={
          <>
            <DataGrid
              caption="상담"
              className="tl-block-cs-grid"
              height="fill"
              rows={shown}
              rowKey="id"
              onRowPress={(t) => setActiveId(t.id)}
              activeRowKey={activeId}
              defaultSort={{ key: 'slaDue', direction: 'asc' }}
              rowTone={(t) =>
                late(t) ? 'danger' : t.priority === 'high' && !closed(t) ? 'warning' : undefined
              }
              empty="이 조건의 상담이 없습니다. 상태나 유형을 바꿔 보세요"
              columns={[
                {
                  key: 'title',
                  header: '상담',
                  sticky: true,
                  render: (t) => (
                    <DataGridLines
                      primary={t.title}
                      secondary={
                        <>
                          {t.id} · {t.customer} · {TICKET_TYPES[t.type]}
                        </>
                      }
                    />
                  ),
                },
                {
                  key: 'priority',
                  header: '우선',
                  width: 'xs',
                  render: (t) => (
                    <Badge
                      size="sm"
                      dot={false}
                      tone={TICKET_PRIORITIES[t.priority].tone}
                      variant={t.priority === 'high' ? 'subtle' : 'outline'}
                    >
                      {TICKET_PRIORITIES[t.priority].label}
                    </Badge>
                  ),
                },
                {
                  key: 'slaDue',
                  header: 'SLA',
                  width: 'sm',
                  sortable: true,
                  render: (t) => (
                    <DueBadge
                      size="sm"
                      due={t.slaDue}
                      today={TODAY}
                      warnDays={1}
                      done={closed(t)}
                      doneLabel="처리 완료"
                    />
                  ),
                },
                {
                  key: 'assignee',
                  header: '담당자',
                  width: 'sm',
                  sortable: true,
                  render: (t) => staffLabel(t.assignee),
                },
                {
                  key: 'state',
                  header: '상태',
                  width: 'sm',
                  render: (t) => (
                    <Badge tone={PROGRESS_STATES[t.state].tone}>
                      {PROGRESS_STATES[t.state].label}
                    </Badge>
                  ),
                },
              ]}
            />
          </>
        }
        aside={
          active ? (
            <Card
              title={active.title}
              subtitle={`${active.id} · ${active.channel} 접수 ${active.createdAt.slice(5)}`}
              action={
                <Badge tone={PROGRESS_STATES[active.state].tone}>
                  {PROGRESS_STATES[active.state].label}
                </Badge>
              }
            >
              <div className="tl-block-drawer-stack">
                <DescriptionList
                  columns={2}
                  layout="vertical"
                  items={[
                    { label: '고객', value: `${active.customer} · ${active.contact}` },
                    { label: '연락처', value: active.phone, copyable: true },
                    {
                      label: '유형 · 우선순위',
                      value: `${TICKET_TYPES[active.type]} · ${TICKET_PRIORITIES[active.priority].label}`,
                    },
                    {
                      label: 'SLA',
                      value: (
                        <DueBadge
                          due={active.slaDue}
                          today={TODAY}
                          warnDays={1}
                          done={closed(active)}
                          doneLabel="처리 완료"
                        />
                      ),
                    },
                    { label: '담당자', value: staffLabel(active.assignee) },
                    {
                      label: '관련 문서',
                      value: active.doc ? (
                        screens.has(docScreen(active.doc)) ? (
                          <a
                            className="tl-block-cs-link tl-focusable"
                            href={screens.href(docScreen(active.doc))}
                          >
                            {active.doc}
                          </a>
                        ) : (
                          active.doc
                        )
                      ) : (
                        '–'
                      ),
                    },
                  ]}
                />

                {(active.type === 'claim' || active.type === 'return') && (
                  <div
                    className="tl-block-cs-return"
                    data-linked={active.returnId ? true : undefined}
                  >
                    <Lines
                      primary={
                        active.returnId ? `반품 입고 ${active.returnId} 연결` : '반품 연결 전'
                      }
                      secondary={
                        active.returnId
                          ? '물류팀 입고 처리에서 검수 · 반품 확정합니다'
                          : '연결하면 물류팀 입고 예정에 반품 건이 올라갑니다'
                      }
                    />
                    {active.returnId ? (
                      screens.has(RECEIVING) && (
                        <a className="tl-block-cs-link tl-focusable" href={screens.href(RECEIVING)}>
                          입고 처리 보기
                        </a>
                      )
                    ) : (
                      <Button
                        size="sm"
                        icon="undo-2"
                        disabled={!canHandle || closed(active)}
                        onPress={() => {
                          const returnId = nextReturnId();
                          update(active.id, { returnId });
                          toast.show({
                            title: '반품 입고 예정을 등록했습니다',
                            description: `${returnId} · ${active.customer} · ${warehouseName(PROFILE.returnsWarehouseId)}`,
                            tone: 'success',
                          });
                        }}
                      >
                        반품 연결
                      </Button>
                    )}
                  </div>
                )}

                <section className="tl-block-cs-section" aria-label="대화">
                  <h3 className="tl-block-cs-section__title">대화 {active.messages.length}건</h3>
                  <MessageThread
                    key={active.id}
                    label={`${active.id} ${active.customer} 대화`}
                    messages={threadOf(active)}
                    today={TODAY}
                  />
                </section>

                {active.memos.length > 0 && (
                  <section className="tl-block-cs-section" aria-label="내부 메모">
                    <h3 className="tl-block-cs-section__title">
                      내부 메모 {active.memos.length}건 · 고객에게 보이지 않습니다
                    </h3>
                    {active.memos.map((n) => (
                      <div key={n.id} className="tl-block-cs-memo">
                        <span className="tl-block-cs-memo__meta">
                          <strong>{n.by}</strong> · {n.time}
                        </span>
                        <p className="tl-block-cs-memo__body">{n.body}</p>
                      </div>
                    ))}
                  </section>
                )}

                {!closed(active) && (
                  <section className="tl-block-cs-compose" aria-label="답변 작성">
                    <SegmentedControl
                      size="sm"
                      label="작성 종류"
                      value={mode}
                      onChange={setMode}
                      options={[
                        { value: 'reply', label: '고객 답변', icon: 'send' },
                        { value: 'memo', label: '내부 메모', icon: 'lock' },
                      ]}
                    />
                    <Field
                      label={mode === 'reply' ? '답변' : '내부 메모'}
                      help={
                        mode === 'reply'
                          ? `${active.contact}에게 메일과 알림톡으로 보냅니다. Ctrl+Enter로 보냅니다`
                          : '같은 상담을 맡은 사람만 봅니다. Ctrl+Enter로 남깁니다'
                      }
                    >
                      <Composer
                        value={draft}
                        onChange={setDraft}
                        onSend={send}
                        enterToSend={false}
                        attachable={false}
                        maxRows={8}
                        maxLength={1000}
                        placeholder={
                          mode === 'reply'
                            ? `반품 회수는 ${formatDate(addDays(TODAY, 1), 'md')} 오전에 진행합니다`
                            : '운송 구간 온도 기록 회신 대기'
                        }
                        sendLabel={mode === 'reply' ? '답변 보내기' : '메모 남기기'}
                        disabled={!canHandle}
                      />
                    </Field>
                  </section>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon="headset"
                title="상담을 고르세요"
                description="왼쪽 목록에서 상담을 누르면 대화와 메모가 보입니다"
              />
            </Card>
          )
        }
      />
      {active && !closed(active) && (
        <ActionBar
          sticky
          summary={`${active.id} · ${active.customer} · SLA ${formatDueDays(active.slaDue, TODAY)}`}
        >
          <Button
            disabled={!canHandle}
            onPress={() => {
              const hold = active.state !== 'hold';
              update(active.id, { state: hold ? 'hold' : 'doing' });
              toast.show({
                title: hold ? '보류로 바꿨습니다' : '다시 진행합니다',
                description: active.id,
                tone: 'neutral',
              });
            }}
          >
            {active.state === 'hold' ? '보류 해제' : '보류'}
          </Button>
          <Button
            variant="primary"
            icon="circle-check"
            disabled={!canHandle}
            onPress={() => {
              update(active.id, { state: 'done' });
              toast.show({
                title: '처리 완료했습니다',
                description: `${active.id} · ${active.customer}에게 완료 안내를 보냈습니다`,
                tone: 'success',
              });
            }}
          >
            처리 완료
          </Button>
        </ActionBar>
      )}
    </Page>
  );
}
