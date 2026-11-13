// 결재 문서 보기(ApprovalFlow): 결재선 → 본문 → 지출 내역 → 첨부 → 의견 이력. 결재자는 승인 · 반려, 기안자는 회수
// 반려 · 회수 사유는 ReasonDialog(사유가 모자라면 확인이 꺼지고, 바깥을 눌러도 닫히지 않는다. components.md §10)
// 주소 ?id=<문서 번호>로 문서를 고른다. 같은 화면에서 id만 바뀌어도(알림 링크 · 뒤로) 그 문서로 바뀐다
import {
  APPROVAL_LABELS,
  formatAmount,
  formatDate,
  formatKoreanAmount,
  type TimelineItem,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  ApprovalLine,
  Attachment,
  Badge,
  Banner,
  Button,
  Card,
  DataGrid,
  DataGridLines,
  DescriptionList,
  DueBadge,
  EmptyState,
  Field,
  Menu,
  PageHeader,
  PersonLabel,
  ReasonDialog,
  Textarea,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useState, useSyncExternalStore } from 'react';
import {
  approvalStore,
  approveDoc,
  currentStep,
  empById,
  empLabel,
  FORM_LABELS,
  meOf,
  rejectDoc,
  useApprovalDocs,
  withdrawDoc,
  type ApprovalDoc,
  type ExpenseLine,
} from '../../../_data/groupware.js';
import { TODAY } from '../../../_data/index.js';
import { useCan, usePlatform, useScreenParams, useScreens } from '../../../_platform/index.js';
import { Col, Figure, Grid, Page } from '../../../_ui/index.js';
import './style.css';

/** 사유 최소 글자 수(앞뒤 공백 뺀 글자). 반려는 기안자가 무엇을 고칠지 알 만큼 */
const REJECT_MIN = 5;
const WITHDRAW_MIN = 2;
/** 주소에 id가 없으면 결재 진행 중인 첫 문서 */
const DEFAULT_ID =
  (approvalStore.get().find((d) => d.state === 'pending') ?? approvalStore.get()[0])?.id ?? '';
/** 좁은 화면(모바일, breakpoint.sm 미만)에서는 지출 내역을 적요 · 합계 두 칸으로 줄인다 */
const narrowQuery = () => {
  const sm = getComputedStyle(document.documentElement).getPropertyValue('--tl-breakpoint-sm');
  return `(max-width: ${sm.trim() || '40em'})`;
};
const subscribeNarrow = (cb: () => void) => {
  const m = window.matchMedia(narrowQuery());
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
const useNarrow = () =>
  useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(narrowQuery()).matches,
    () => false,
  );

/** 문서 이름(양식 제목) */
const FORM_TITLE: Record<ApprovalDoc['form'], string> = {
  expense: '지출결의서',
  purchase: '발주 품의서',
  leave: '휴가 신청서',
  trip: '출장 신청서',
};

// slot: history — 결재 이력에 남기는 일(단계마다 제목 · 색 · 아이콘)
function history(d: ApprovalDoc): TimelineItem[] {
  const items: TimelineItem[] = [];
  d.line.forEach((s, i) => {
    const who = empLabel(s.empId);
    if (s.state === 'pending') {
      const prev = d.line[i - 1];
      items.push({
        id: `s${i}`,
        title: `${s.role} 대기`,
        time: prev?.time ? `${prev.time} 도착` : '도착',
        actor: who,
        tone: 'info',
        icon: 'clock',
      });
      return;
    }
    if (!s.time) return;
    const map = {
      draft: { title: i === 0 ? '기안 · 결재 요청' : s.role, tone: 'neutral', icon: 'file-pen' },
      approved: {
        title: `${s.role} ${APPROVAL_LABELS.approved}`,
        tone: 'success',
        icon: 'circle-check',
      },
      rejected: {
        title: `${s.role} ${APPROVAL_LABELS.rejected}`,
        tone: 'danger',
        icon: 'circle-x',
      },
      withdrawn: { title: APPROVAL_LABELS.withdrawn, tone: 'neutral', icon: 'undo-2' },
      waiting: { title: s.role, tone: 'neutral', icon: 'clock' },
      pending: { title: s.role, tone: 'info', icon: 'clock' },
    } as const;
    const m = map[s.state];
    items.push({
      id: `s${i}`,
      title: m.title,
      time: s.time,
      actor: who,
      tone: m.tone,
      icon: m.icon,
      ...(s.comment ? { description: s.comment } : {}),
    });
  });
  return items;
}
// slot: history end

export default function ApprovalDocument() {
  const toast = useToast();
  const { session } = usePlatform();
  const screens = useScreens();
  const me = meOf(session.user.id);
  const canApprove = useCan('approval', 'approve');
  const canCreate = useCan('approval', 'create');
  const docs = useApprovalDocs();
  const id = useScreenParams().id ?? DEFAULT_ID;
  const [opinion, setOpinion] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const narrow = useNarrow();

  const doc = docs.find((d) => d.id === id);
  if (!doc)
    return (
      <Page header={<PageHeader title="결재 문서" breadcrumbs={[{ label: '전자결재' }]} />}>
        <Card>
          <EmptyState
            icon="file-text"
            title="문서를 찾을 수 없습니다"
            description="결재함에서 문서를 다시 고르세요"
            action={
              screens.has('groupware/approval/inbox') && (
                <Button onPress={() => screens.go('groupware/approval/inbox')}>결재함</Button>
              )
            }
          />
        </Card>
      </Page>
    );

  const drafter = empById(doc.drafterId);
  const cur = currentStep(doc);
  const myTurn = doc.state === 'pending' && cur?.empId === me.id;
  const iAmDrafter = doc.drafterId === me.id;
  const canWithdraw = iAmDrafter && doc.state === 'pending' && canCreate;
  const total = doc.expense?.reduce((a, l) => a + l.supply + l.tax, 0) ?? doc.amount ?? 0;
  const supply = doc.expense?.reduce((a, l) => a + l.supply, 0) ?? 0;
  const tax = doc.expense?.reduce((a, l) => a + l.tax, 0) ?? 0;
  const next = cur ? doc.line[doc.line.indexOf(cur) + 1] : undefined;

  const approve = () => {
    approvalStore.update(doc.id, (d) => approveDoc(d, me.id, opinion.trim() || undefined));
    setOpinion('');
    toast.show({
      title: '승인했습니다',
      description: next
        ? `${empLabel(next.empId)}에게 ${next.role} 차례를 넘겼습니다`
        : '결재가 끝나 기안자에게 알렸습니다',
      tone: 'success',
    });
  };
  // ReasonDialog가 사유(앞뒤 공백 뺀 글자)를 넘기고, 끝나면 스스로 닫는다
  const reject = (reason: string) => {
    approvalStore.update(doc.id, (d) => rejectDoc(d, me.id, reason));
    toast.show({
      title: '반려했습니다',
      description: `${drafter.name} ${drafter.title}에게 반려 사유를 보냈습니다`,
      tone: 'warning',
    });
  };
  const withdraw = (reason: string) => {
    approvalStore.update(doc.id, (d) => withdrawDoc(d, reason));
    toast.show({ title: '회수했습니다', description: '문서를 고쳐 다시 결재 요청할 수 있습니다' });
  };

  const summary = myTurn
    ? `${cur!.role} 차례입니다 · 기한 ${formatDate(doc.dueDate, 'mdw')}`
    : doc.state === 'pending' && cur
      ? `${empLabel(cur.empId)} ${cur.role} 대기 중`
      : `${APPROVAL_LABELS[doc.state]} 문서입니다`;

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[
            { label: '전자결재' },
            {
              label: '결재함',
              ...(screens.has('groupware/approval/inbox')
                ? { href: screens.href('groupware/approval/inbox') }
                : {}),
            },
            { label: doc.id },
          ]}
          title={doc.title}
          meta={
            <>
              <Badge approval={doc.state} />
              {doc.state === 'pending' && <DueBadge due={doc.dueDate} today={TODAY} warnDays={1} />}
            </>
          }
          description={`${FORM_LABELS[doc.form]} · ${doc.id} · 기안 ${drafter.name} ${drafter.title}(${drafter.team}) · ${doc.draftedAt}`}
          {...(screens.has('groupware/approval/inbox')
            ? { onBack: () => screens.go('groupware/approval/inbox') }
            : {})}
          actions={
            <>
              <Button icon="printer">인쇄</Button>
              <Menu
                align="end"
                trigger={<Button iconEnd="chevron-down">더 보기</Button>}
                items={[
                  { id: 'pdf', label: 'PDF 다운로드', icon: 'download' },
                  ...(screens.has('groupware/approval/draft')
                    ? [
                        {
                          id: 'copy',
                          label: '복사해서 새로 작성',
                          icon: 'copy' as const,
                          onSelect: () => screens.go('groupware/approval/draft'),
                        },
                      ]
                    : []),
                  { id: 'link', label: '문서 링크 복사', icon: 'link' },
                ]}
              />
            </>
          }
        />
      }
    >
      {doc.state === 'rejected' && (
        <Banner tone="danger" title="반려된 문서입니다">
          {doc.line.find((s) => s.state === 'rejected')?.comment ?? '반려 사유가 없습니다'}
        </Banner>
      )}
      <Grid>
        <Col span={8}>
          <Card padding="none">
            <article className="tl-block-doc" aria-label={FORM_TITLE[doc.form]}>
              <header className="tl-block-doc__head">
                <div className="tl-block-doc__title">
                  <h2>{FORM_TITLE[doc.form]}</h2>
                  <span className="tl-block-code">{doc.id}</span>
                </div>
                <div className="tl-block-doc__line" role="region" aria-label="결재선" tabIndex={0}>
                  <ApprovalLine
                    approvers={doc.line.map((s) => ({
                      id: s.empId,
                      name: empById(s.empId).name,
                      title: empById(s.empId).title,
                      role: s.role,
                      state: s.state,
                      ...(s.time ? { time: s.time } : {}),
                      ...(s.comment ? { comment: s.comment } : {}),
                    }))}
                  />
                </div>
              </header>
              {/* slot: formBody — 양식마다 보일 칸(문서 정보 · 내용). 칸 값은 doc.fields */}
              <section className="tl-block-doc__section" aria-label="문서 정보">
                <DescriptionList
                  columns={2}
                  items={[
                    {
                      label: '기안자',
                      value: `${drafter.name} ${drafter.title} · ${drafter.team}`,
                    },
                    { label: '기안일', value: doc.draftedAt },
                    ...doc.fields.map((f) => ({ label: f.label, value: f.value })),
                    ...(doc.related
                      ? [
                          {
                            label: '관련 문서',
                            value: doc.related,
                            span: 2 as const,
                            copyable: true,
                          },
                        ]
                      : []),
                  ]}
                />
              </section>
              <section className="tl-block-doc__section">
                <h3 className="tl-block-doc__h">내용</h3>
                <p className="tl-block-doc__body">{doc.body}</p>
              </section>
              {/* slot: formBody end */}
              {doc.expense && (
                <section className="tl-block-doc__section">
                  <h3 className="tl-block-doc__h">지출 내역</h3>
                  <DataGrid
                    caption="지출 내역"
                    rows={doc.expense.map((l, i) => ({ ...l, no: i + 1, total: l.supply + l.tax }))}
                    rowKey="no"
                    summary
                    // slot: expenseColumns — 지출 내역 열. 좁은 화면(narrow)은 적요 · 합계 두 칸
                    columns={[
                      {
                        key: 'account',
                        header: '계정과목 · 적요',
                        wrap: true,
                        render: (l) => <DataGridLines primary={l.account} secondary={l.memo} />,
                      },
                      ...(narrow
                        ? []
                        : ([
                            {
                              key: 'vendor',
                              header: '거래처 · 증빙',
                              width: 'md',
                              render: (l: ExpenseLine) => (
                                <DataGridLines primary={l.vendor} secondary={l.evidence} />
                              ),
                            },
                            {
                              key: 'supply',
                              header: '공급가액',
                              width: 'md',
                              format: 'amount',
                              total: 'sum',
                            },
                            {
                              key: 'tax',
                              header: '세액',
                              width: 'sm',
                              format: 'amount',
                              total: 'sum',
                            },
                          ] as const)),
                      { key: 'total', header: '합계', width: 'md', format: 'amount', total: 'sum' },
                    ]}
                    // slot: expenseColumns end
                  />
                  <div className="tl-block-doc__totals">
                    <Figure label="공급가액" value={formatAmount(supply)} unit="원" />
                    <Figure label="세액" value={formatAmount(tax)} unit="원" />
                    <Figure label="지출 합계" value={formatAmount(total)} unit="원" />
                    <p className="tl-block-doc__korean">{formatKoreanAmount(total)}</p>
                  </div>
                </section>
              )}
              {!doc.expense && doc.amount != null && (
                <section className="tl-block-doc__section">
                  <div className="tl-block-doc__totals">
                    <Figure label="금액" value={formatAmount(doc.amount)} unit="원" />
                    {doc.amountLabel && <Figure label="외화" value={doc.amountLabel} />}
                    <p className="tl-block-doc__korean">{formatKoreanAmount(doc.amount)}</p>
                  </div>
                </section>
              )}
              <section className="tl-block-doc__section">
                <h3 className="tl-block-doc__h">첨부 {doc.files.length}건</h3>
                {doc.files.length ? (
                  <Attachment files={doc.files} />
                ) : (
                  <p className="tl-block-doc__none">첨부 파일이 없습니다</p>
                )}
              </section>
            </article>
          </Card>
        </Col>
        <Col span={4}>
          <div className="tl-block-doc__aside">
            {myTurn && (
              <Card
                title="결재 의견"
                subtitle="승인할 때 함께 남습니다. 반려 사유는 반려 창에 씁니다"
              >
                <Field label="의견">
                  <Textarea
                    rows={3}
                    maxLength={200}
                    value={opinion}
                    onChange={setOpinion}
                    placeholder="예산 안입니다"
                  />
                </Field>
              </Card>
            )}
            <Card
              title="결재 이력"
              subtitle={`${doc.line.filter((s) => s.time).length}건 · 최신이 아래`}
            >
              <Timeline items={history(doc)} ariaLabel="결재 이력" />
            </Card>
            <Card
              title="참조"
              subtitle={doc.cc.length ? `${doc.cc.length}명 · 결재가 끝나면 알림` : '참조자 없음'}
            >
              {doc.cc.length ? (
                <ul className="tl-block-doc__cc">
                  {doc.cc.map((c) => (
                    <li key={c}>
                      <PersonLabel size="sm" name={empLabel(c)} meta={empById(c).team} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tl-block-doc__none">이 문서는 참조자가 없습니다</p>
              )}
            </Card>
          </div>
        </Col>
      </Grid>
      {/* slot: actions — 할 수 있는 일(목록 · 회수 · 반려 · 승인)과 사유 창. 사유 최소 글자 수 · 안내 문구는 회사 결재 규정에 맞춘다 */}
      <ActionBar sticky summary={summary}>
        {screens.has('groupware/approval/inbox') && (
          <Button onPress={() => screens.go('groupware/approval/inbox')}>목록</Button>
        )}
        {canWithdraw && (
          <Button icon="undo-2" onPress={() => setWithdrawOpen(true)}>
            회수
          </Button>
        )}
        {myTurn && (
          <>
            <Button
              variant="danger"
              icon="circle-x"
              disabled={!canApprove}
              onPress={() => setRejectOpen(true)}
            >
              반려
            </Button>
            <Button variant="primary" icon="stamp" disabled={!canApprove} onPress={approve}>
              승인
            </Button>
          </>
        )}
      </ActionBar>
      <ReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        tone="danger"
        title="결재를 반려합니다"
        description={`${drafter.name} ${drafter.title}에게 사유와 함께 돌아갑니다. 기안자가 고쳐 다시 결재 요청합니다.`}
        label="반려 사유"
        placeholder="보관료 세금계산서가 빠졌습니다. 붙여서 다시 올려 주세요"
        confirmLabel="반려"
        minLength={REJECT_MIN}
        maxLength={300}
        note="사유는 기안자와 결재선 모두에게 보입니다"
        onConfirm={reject}
      />
      <ReasonDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        title="문서를 회수합니다"
        description="회수하면 결재가 멈추고 결재자 화면에서 사라집니다. 고쳐서 다시 결재 요청할 수 있습니다."
        label="회수 사유"
        placeholder="금액을 고쳐 다시 올립니다"
        confirmLabel="회수"
        minLength={WITHDRAW_MIN}
        maxLength={200}
        note="사유는 결재 이력에 남습니다"
        onConfirm={withdraw}
      />
      {/* slot: actions end */}
    </Page>
  );
}
