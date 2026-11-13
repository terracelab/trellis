// 결재함(ApprovalFlow): 결재할 · 기안한 · 참조 · 완료 탭, 기한 지난 문서를 먼저, 행을 누르면 문서 보기.
// 주소 ?tab=drafted|cc|done으로 처음 탭을 고른다(알림 · 다른 화면에서 열 때)
import {
  APPROVAL_LABELS,
  dueDays,
  formatAmount,
  formatDueDays,
  type ApprovalState,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  ApprovalLine,
  Badge,
  Banner,
  Button,
  DataGrid,
  DataGridLines,
  Dialog,
  DialogClose,
  DueBadge,
  FilterBar,
  Input,
  PageHeader,
  PersonLabel,
  Select,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useEffect, useState } from 'react';
import {
  approvalStore,
  approveDoc,
  currentStep,
  empById,
  empLabel,
  FORM_LABELS,
  meOf,
  useApprovalDocs,
  type ApprovalDoc,
  type FormKind,
} from '../../../_data/groupware.js';
import { TODAY } from '../../../_data/index.js';
import { useCan, usePlatform, useScreenParams, useScreens } from '../../../_platform/index.js';
import { Muted, Page } from '../../../_ui/index.js';
import './style.css';

type Tab = 'todo' | 'drafted' | 'cc' | 'done';
const FINISHED: readonly ApprovalState[] = ['approved', 'rejected', 'withdrawn'];

const tabOf = (t: string | undefined): Tab =>
  t === 'drafted' || t === 'cc' || t === 'done' ? t : 'todo';

export default function ApprovalInbox() {
  const toast = useToast();
  const { session } = usePlatform();
  const me = meOf(session.user.id);
  const canApprove = useCan('approval', 'approve');
  const canCreate = useCan('approval', 'create');
  const screens = useScreens();
  const docs = useApprovalDocs();
  const { tab: paramTab } = useScreenParams();
  const [tab, setTab] = useState<Tab>(() => tabOf(paramTab));
  // 주소의 탭이 바뀌면(알림 링크 · 뒤로) 따라간다
  useEffect(() => {
    if (paramTab) setTab(tabOf(paramTab));
  }, [paramTab]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<string | null>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);

  // slot: tabs — 탭마다 드는 문서(규칙). 탭 이름 · 순서는 아래 PageHeader tabs의 items
  const isMine = (d: ApprovalDoc) => d.line.some((s) => s.empId === me.id && s.state === 'pending');
  const buckets: Record<Tab, (d: ApprovalDoc) => boolean> = {
    todo: (d) => d.state === 'pending' && isMine(d),
    drafted: (d) => d.drafterId === me.id,
    cc: (d) => d.cc.includes(me.id),
    done: (d) =>
      FINISHED.includes(d.state) &&
      (d.drafterId === me.id || d.cc.includes(me.id) || d.line.some((s) => s.empId === me.id)),
  };
  // slot: tabs end
  const count = (t: Tab) => docs.filter(buckets[t]).length;
  const overdue = docs.filter((d) => buckets.todo(d) && dueDays(d.dueDate, TODAY) < 0);
  // 결재할 문서는 기한이 급한 순, 나머지는 최근 기안 순
  const shown = docs
    .filter(
      (d) =>
        buckets[tab](d) &&
        (form === 'all' || !form || d.form === form) &&
        (!q || `${d.id}${d.title}${empById(d.drafterId).name}`.includes(q)),
    )
    .sort((a, b) =>
      tab === 'todo' ? a.dueDate.localeCompare(b.dueDate) : b.draftedAt.localeCompare(a.draftedAt),
    );
  const picked = shown.filter((d) => selected.includes(d.id));

  const open = (d: ApprovalDoc) => screens.go('groupware/approval/document', { id: d.id });
  const approveAll = () => {
    for (const d of picked) approvalStore.update(d.id, (x) => approveDoc(x, me.id));
    toast.show({
      title: `${picked.length}건을 승인했습니다`,
      description: '다음 결재자에게 알림을 보냈습니다',
      tone: 'success',
    });
    setSelected([]);
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '전자결재' }, { label: '결재함' }]}
          title="결재함"
          description={`${me.name} ${me.title} · ${me.team} · 결재할 문서 ${count('todo')}건`}
          actions={
            screens.has('groupware/approval/draft') && (
              <Button
                variant="primary"
                icon="file-pen"
                disabled={!canCreate}
                onPress={() => screens.go('groupware/approval/draft')}
              >
                기안 작성
              </Button>
            )
          }
          tabs={
            <Tabs
              label="결재함"
              value={tab}
              onChange={(v) => {
                setTab(v as Tab);
                setSelected([]);
              }}
              items={[
                { value: 'todo', label: '결재할 문서', count: count('todo') },
                { value: 'drafted', label: '기안한 문서', count: count('drafted') },
                { value: 'cc', label: '참조 문서', count: count('cc') },
                { value: 'done', label: '완료', count: count('done') },
              ]}
            />
          }
        />
      }
    >
      {tab === 'todo' && overdue.length > 0 && (
        <Banner tone="danger" title={`기한 지난 결재 ${overdue.length}건`}>
          {overdue.map((d) => `${d.id} ${d.title} ${formatDueDays(d.dueDate, TODAY)}`).join(' · ')}
        </Banner>
      )}
      {/* slot: filters — 검색 칸 · 문서 종류 */}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="문서 번호 · 제목 · 기안자"
            label="결재 문서 검색"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setForm('all');
        }}
        resultCount={shown.length}
      >
        <Select
          size="sm"
          width="auto"
          label="문서 종류"
          value={form}
          onChange={setForm}
          options={[
            { value: 'all', label: '종류 전체' },
            ...(Object.keys(FORM_LABELS) as FormKind[]).map((k) => ({
              value: k,
              label: FORM_LABELS[k],
            })),
          ]}
        />
      </FilterBar>
      {/* slot: filters end */}
      <DataGrid
        key={tab}
        caption="결재 문서"
        className="tl-block-inbox-grid"
        height="fill"
        rows={shown}
        rowKey="id"
        selectable={tab === 'todo' && canApprove}
        selected={selected}
        onSelectedChange={setSelected}
        onRowPress={open}
        rowTone={(d) =>
          d.state === 'pending' && isMine(d) && dueDays(d.dueDate, TODAY) < 0 ? 'danger' : undefined
        }
        empty={
          tab === 'todo'
            ? '결재할 문서가 없습니다. 새 문서가 오면 알림으로 알려 드립니다'
            : '이 조건의 문서가 없습니다. 종류나 검색어를 바꿔 보세요'
        }
        // slot: columns — 열 이름 · 폭 · 순서. 제목(auto) 칸이 남는 폭을 쓴다
        columns={[
          {
            key: 'id',
            header: '문서 번호',
            width: 'md',
            sticky: true,
            render: (d) => <span className="tl-block-code">{d.id}</span>,
          },
          {
            key: 'title',
            header: '제목',
            render: (d) => (
              <DataGridLines
                primary={d.title}
                secondary={[
                  FORM_LABELS[d.form],
                  d.related,
                  d.files.length ? `첨부 ${d.files.length}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              />
            ),
          },
          {
            key: 'drafter',
            header: '기안자 · 기안일',
            width: 'lg',
            value: (d) => empById(d.drafterId).name,
            sortable: true,
            render: (d) => (
              <PersonLabel
                name={empLabel(d.drafterId)}
                meta={`${empById(d.drafterId).team} · ${d.draftedAt.slice(5)}`}
              />
            ),
          },
          {
            key: 'step',
            header: '결재 단계',
            width: 'md',
            render: (d) => {
              const cur = currentStep(d);
              const last = cur ?? [...d.line].reverse().find((s) => s.time) ?? d.line[0]!;
              return (
                <DataGridLines
                  primary={
                    <ApprovalLine
                      variant="compact"
                      approvers={d.line.map((s, i) => ({
                        id: `${s.empId}-${i}`,
                        name: empById(s.empId).name,
                        title: empById(s.empId).title,
                        role: s.role,
                        state: s.state,
                      }))}
                    />
                  }
                  secondary={
                    <>
                      {empLabel(last.empId)}
                      {cur ? '' : ` · ${APPROVAL_LABELS[d.state]}`}
                    </>
                  }
                />
              );
            },
          },
          {
            key: 'amount',
            header: '금액',
            width: 'md',
            format: 'amount',
            sortable: true,
            render: (d) =>
              d.amount == null ? (
                <Muted>–</Muted>
              ) : d.amountLabel ? (
                <DataGridLines
                  primary={formatAmount(d.amount, { unit: '원' })}
                  secondary={d.amountLabel}
                />
              ) : (
                formatAmount(d.amount, { unit: '원' })
              ),
          },
          {
            key: 'state',
            header: '상태',
            width: 'sm',
            render: (d) => <Badge approval={d.state} />,
          },
          {
            key: 'dueDate',
            header: '기한',
            width: 'sm',
            sortable: true,
            render: (d) =>
              d.state === 'pending' ? (
                <DueBadge due={d.dueDate} today={TODAY} warnDays={1} />
              ) : (
                <Muted>–</Muted>
              ),
          },
        ]}
        // slot: columns end
      />
      {/* slot: bulkActions — 여러 건 고른 뒤 할 일(한 번에 승인) */}
      {selected.length > 0 && (
        <ActionBar
          summary={`${selected.length}건 선택 · ${picked
            .map((d) => FORM_LABELS[d.form])
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(' · ')}`}
        >
          <Button onPress={() => setSelected([])}>선택 해제</Button>
          <Button variant="primary" icon="stamp" onPress={() => setConfirm(true)}>
            {selected.length}건 승인
          </Button>
        </ActionBar>
      )}
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`문서 ${picked.length}건을 승인합니다`}
        description="승인하면 다음 결재자에게 넘어갑니다. 의견을 남기려면 문서를 하나씩 열어 승인하세요."
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button variant="primary" onPress={approveAll}>
                  {picked.length}건 승인
                </Button>
              }
            />
          </>
        }
      />
      {/* slot: bulkActions end */}
    </Page>
  );
}
