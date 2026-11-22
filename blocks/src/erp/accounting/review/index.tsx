// 회계 · 검토함(ListDetail): 사람이 봐야 하는 거래만 모아 한 건씩 처리한다.
// 미분류(업무 도우미의 계정 제안 → 승인 · 반려 · 다른 계정) · 증빙 누락(올리면 금액을 맞춰 본다) · 이상 지출(문제없음 · 임무 등록).
// 승인 전에는 거래가 바뀌지 않는다. 처리하면 같은 탭의 다음 건으로 넘어간다.
// 키보드: 목록에서 ↑ ↓(또는 k · j)로 옮기면 상세가 따라오고, 고른 행에서 Enter를 누르면 제안을 승인한다.
// 확신이 높은 제안은 아래 동작 줄에서 한 번에 승인한다. 비품 제안을 승인하면 자산 대장에 올린다고 알린다.
import { formatAmount, formatDate } from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  Citation,
  CodeSearch,
  DescriptionList,
  EmptyState,
  Field,
  FileUpload,
  FileViewer,
  PageHeader,
  Progress,
  ProposalCard,
  SelectableList,
  Tabs,
  useBreakpoint,
  useToast,
} from '@terracelab/trellis-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ASSISTANT_NAME } from '../../../_data/assistant.js';
import { PROFILE } from '../../../_data/profile.js';
import {
  accountName,
  ANOMALY_LABELS,
  ASSET_ACCOUNT,
  BULK_CONFIDENCE,
  CLASSIFY_ACCOUNTS,
  evidenceReadAmount,
  REVIEW_ANOMALIES,
  REVIEW_PROPOSALS,
  REVIEW_TXNS,
  SOURCE_LABELS,
  supplyOf,
  type ReviewProposal,
  type ReviewTxn,
} from '../../../_data/review.js';
import { useCan, useOpenLink, useScreenParams, useScreens } from '../../../_platform/index.js';
import { Col, Grid, Page, Row } from '../../../_ui/index.js';

// slot: tabs — 검토 구분(주소 값 ?tab=). 빈 목록 글자와 함께 바꾼다
type Tab = 'unclassified' | 'evidence' | 'anomaly';
const TAB_LABELS: Record<Tab, string> = {
  unclassified: '미분류',
  evidence: '증빙 누락',
  anomaly: '이상 지출',
};
const EMPTY: Record<Tab, string> = {
  unclassified: '분류할 거래가 없습니다',
  evidence: '증빙이 빠진 거래가 없습니다',
  anomaly: '확인할 이상 지출이 없습니다',
};
// slot: tabs end

// slot: links — 다 끝났을 때 가는 화면 · 근거 · 임무를 여는 화면(블록 id)
const AFTER_DONE = { id: 'erp/accounting/trial-balance', label: '시산표로' };
const MISSION_SCREEN = 'groupware/mission/list';
// slot: links end

const isTab = (v: string | undefined): v is Tab => !!v && v in TAB_LABELS;
const byDate = (a: ReviewTxn, b: ReviewTxn) =>
  a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
const percent = (n: number) => `${Math.round(n * 100)}%`;
const amountText = (t: ReviewTxn) =>
  `${t.amount > 0 ? '+' : '−'}${formatAmount(Math.abs(t.amount))}원`;

/** 처음 검토함에 있던 거래(미분류 · 증빙 누락). "n건 가운데 m건 처리"의 바탕 */
const SEED_QUEUE = REVIEW_TXNS.filter((t) => !t.accountCode || t.evidence === 'missing').map(
  (t) => t.id,
);

export default function AccountingReview() {
  const toast = useToast();
  const screens = useScreens();
  const openLink = useOpenLink();
  const params = useScreenParams();
  const canEdit = useCan('accounting', 'update');
  const [txns, setTxns] = useState<readonly ReviewTxn[]>(REVIEW_TXNS);
  const [proposals, setProposals] = useState<readonly ReviewProposal[]>(REVIEW_PROPOSALS);
  const [openAnomalies, setOpenAnomalies] = useState<readonly string[]>(
    REVIEW_ANOMALIES.map((a) => a.txnId),
  );
  const [tab, setTab] = useState<Tab>(isTab(params['tab']) ? params['tab'] : 'unclassified');
  useEffect(() => {
    if (isTab(params['tab'])) setTab(params['tab']);
  }, [params]);

  const queues: Record<Tab, ReviewTxn[]> = {
    unclassified: txns.filter((t) => !t.accountCode).sort(byDate),
    evidence: txns.filter((t) => t.accountCode && t.evidence === 'missing').sort(byDate),
    anomaly: txns.filter((t) => openAnomalies.includes(t.id)).sort(byDate),
  };
  const list = queues[tab];
  const [selected, setSelected] = useState<string | null>(null);
  const current = list.find((t) => t.id === selected) ?? list[0] ?? null;
  const proposal = current ? proposals.find((p) => p.txnId === current.id) : undefined;
  const [remember, setRemember] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [upload, setUpload] = useState<{
    name: string;
    size: number;
    src: string;
    type: string;
  } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  // 휴대폰: 목록과 상세를 번갈아 보인다(상세에서 처리하면 다음 건 상세로)
  const phone = useBreakpoint() === 'base';
  const [phoneDetail, setPhoneDetail] = useState(false);
  const showDetail = !phone || (phoneDetail && !!current);
  const showList = !phone || !showDetail;
  useEffect(() => {
    setCode(null);
    setRemember(false);
    setUpload(null);
  }, [current?.id]);

  const queueNow = [...queues.unclassified, ...queues.evidence].map((t) => t.id);
  const total = new Set([...SEED_QUEUE, ...queueNow]).size;
  const processed = total - queueNow.length;
  const bulk = proposals.filter(
    (p) => p.confidence >= BULK_CONFIDENCE && queues.unclassified.some((t) => t.id === p.txnId),
  );
  const editable = !!current && canEdit;

  const focusCurrent = () =>
    requestAnimationFrame(() =>
      (phone && phoneDetail
        ? backRef.current
        : listRef.current?.querySelector<HTMLElement>('[aria-current="true"]')
      )?.focus(),
    );
  const pick = (id: string) => {
    setSelected(id);
    if (phone) {
      setPhoneDetail(true);
      requestAnimationFrame(() => backRef.current?.focus());
    }
  };
  const backToList = () => {
    setPhoneDetail(false);
    requestAnimationFrame(() =>
      listRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.focus(),
    );
  };
  /** 처리한 다음 같은 탭의 다음 건을 고르고 목록의 그 행에 초점을 둔다 */
  const advance = (doneId: string) => {
    const i = list.findIndex((t) => t.id === doneId);
    const rest = list.filter((t) => t.id !== doneId);
    setSelected(rest[Math.min(i, rest.length - 1)]?.id ?? null);
    focusCurrent();
  };
  const move = (d: 1 | -1) => {
    if (!current) return;
    const next = list[list.findIndex((t) => t.id === current.id) + d];
    if (!next) return;
    setSelected(next.id);
    focusCurrent();
  };

  const confirm = (t: ReviewTxn, accountCode: string, by: 'proposal' | 'manual') => {
    setTxns((all) => all.map((x) => (x.id === t.id ? { ...x, accountCode } : x)));
    setProposals((all) => all.filter((x) => x.txnId !== t.id));
    toast.show({
      title:
        accountCode === ASSET_ACCOUNT
          ? '분류하고 자산 대장에 올렸습니다'
          : by === 'proposal'
            ? '제안을 승인했습니다'
            : '분류했습니다',
      description: `${t.party} → ${accountName(accountCode)}${remember ? ' · 같은 거래처 규칙 등록' : ''}`,
      tone: 'success',
    });
    advance(t.id);
  };

  // 목록 안 키보드: ↑ ↓ · k j는 옮기면서 고른다(상세가 따라온다). 고른 행에서 Enter = 제안 승인
  const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const d =
      e.key === 'ArrowDown' || e.key === 'j' ? 1 : e.key === 'ArrowUp' || e.key === 'k' ? -1 : 0;
    if (d) {
      e.preventDefault();
      e.stopPropagation();
      move(d);
      return;
    }
    const onCurrent = (e.target as HTMLElement).closest('[aria-current="true"]');
    if (
      e.key === 'Enter' &&
      onCurrent &&
      tab === 'unclassified' &&
      current &&
      proposal &&
      editable
    ) {
      e.preventDefault();
      e.stopPropagation();
      confirm(current, proposal.accountCode, 'proposal');
    }
  };

  const facts = (t: ReviewTxn) => (
    <DescriptionList
      columns={2}
      items={[
        { label: '일자', value: formatDate(t.date) },
        { label: '거래처', value: t.party },
        { label: '적요', value: t.memo },
        { label: '금액', value: amountText(t) },
        {
          label: '자료 종류',
          value: `${SOURCE_LABELS[t.source]}${t.card ? ` · 카드 끝 ${t.card}` : ''}`,
        },
        { label: '계정과목', value: t.accountCode ? accountName(t.accountCode) : '미분류' },
      ]}
    />
  );

  const classifyPanel = (t: ReviewTxn) => (
    <>
      {proposal ? (
        <ProposalCard
          // 비제어 카드라 승인 · 반려 상태를 안에 든다. 거래가 바뀌면 새 카드로 그린다
          key={t.id}
          headingLevel={3}
          title={proposal.kind === 'asset' ? '비품 자산 등록' : '계정 분류'}
          summary={`${ASSISTANT_NAME} · 확신 ${percent(proposal.confidence)} · ${proposal.basis}`}
          changes={[
            {
              field: '계정과목',
              before: '미분류',
              after: `${proposal.accountCode} ${accountName(proposal.accountCode)}`,
            },
            ...(proposal.kind === 'asset'
              ? [
                  {
                    field: '자산 대장',
                    before: null,
                    after: `비품 · ${t.memo} · 공급가액 ${formatAmount(supplyOf(t))}원`,
                  },
                ]
              : []),
          ]}
          approveLabel={proposal.kind === 'asset' ? '승인 · 자산 등록' : '승인'}
          disabled={!editable}
          onApprove={() => confirm(t, proposal.accountCode, 'proposal')}
          onReject={() => {
            setProposals((all) => all.filter((x) => x.txnId !== t.id));
            toast.show({
              title: '제안을 반려했습니다',
              description: '거래는 미분류로 남습니다. 아래에서 계정을 고르세요',
              tone: 'neutral',
            });
          }}
        >
          <Citation
            label="근거"
            sources={proposal.citations.map((c, i) => ({ index: i + 1, title: c.label }))}
            onOpen={(s) => {
              const screen = proposal.citations[(s.index ?? 1) - 1]?.screen;
              if (screen) openLink(screen)?.();
            }}
          />
        </ProposalCard>
      ) : (
        <Banner tone="info" title={`${ASSISTANT_NAME}의 제안이 없습니다`}>
          가맹점 정보가 부족해 계정을 제안하지 못했습니다. 아래에서 계정을 고르세요.
        </Banner>
      )}
      <Card title={proposal ? '다른 계정으로 분류' : '계정 고르기'} emphasis="quiet">
        <div className="tl-block-drawer-stack">
          <Field label="계정과목">
            <CodeSearch
              options={CLASSIFY_ACCOUNTS.map((a) => ({
                value: a.code,
                label: a.name,
                meta: a.group,
              }))}
              value={code}
              onChange={setCode}
              disabled={!editable}
              placeholder="계정 코드 또는 이름"
            />
          </Field>
          <Checkbox checked={remember} onChange={setRemember} disabled={!editable}>
            같은 거래처({t.party})는 앞으로 이 계정으로
          </Checkbox>
          <div>
            <Button
              icon="check"
              disabled={!editable || !code}
              disabledReason={!editable ? '분류할 권한이 없습니다' : '계정을 고르세요'}
              onPress={() => code && confirm(t, code, 'manual')}
            >
              {code ? `${accountName(code)}(으)로 확정` : '이 계정으로 확정'}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );

  const evidencePanel = (t: ReviewTxn) => {
    const read = evidenceReadAmount(t);
    const same = read === Math.abs(t.amount);
    if (!upload)
      return (
        <Field label="증빙 파일" help="사진 · PDF. 올리면 금액과 일자를 거래와 맞춰 봅니다">
          <FileUpload
            accept="image/*,.pdf"
            disabled={!editable}
            files={[]}
            onFilesChange={(fs) => {
              const f = fs[0];
              if (f)
                setUpload({
                  name: f.name,
                  size: f.size,
                  src: URL.createObjectURL(f),
                  type: f.type,
                });
            }}
          />
        </Field>
      );
    return (
      <>
        <FileViewer
          name={upload.name}
          size={upload.size}
          src={upload.src}
          mimeType={upload.type}
          height="sm"
          downloadable={false}
        />
        {same ? (
          <Banner tone="success" title="금액이 같습니다">
            거래 {formatAmount(Math.abs(t.amount))}원 · 증빙 {formatAmount(read)}원 · 일자{' '}
            {formatDate(t.date)}가 같습니다.
          </Banner>
        ) : (
          <Banner tone="warning" title="금액이 다릅니다">
            거래 {formatAmount(Math.abs(t.amount))}원 · 증빙 {formatAmount(read)}원. 이대로 붙일지
            확인하세요.
          </Banner>
        )}
        <Row justify="start">
          <Button icon="upload" onPress={() => setUpload(null)}>
            다시 올리기
          </Button>
          <Button
            variant="primary"
            icon="paperclip"
            disabled={!editable}
            onPress={() => {
              setTxns((all) => all.map((x) => (x.id === t.id ? { ...x, evidence: 'matched' } : x)));
              toast.show({
                title: '증빙을 붙였습니다',
                description: `${t.party} ${formatAmount(Math.abs(t.amount))}원`,
                tone: 'success',
              });
              advance(t.id);
            }}
          >
            {same ? '증빙 붙이기' : '그대로 붙이기'}
          </Button>
        </Row>
      </>
    );
  };

  const anomalyPanel = (t: ReviewTxn) => {
    const a = REVIEW_ANOMALIES.find((x) => x.txnId === t.id);
    const close = () => setOpenAnomalies((all) => all.filter((id) => id !== t.id));
    return (
      <>
        {a && (
          <Banner tone="warning" title={ANOMALY_LABELS[a.reason]}>
            {a.note}
          </Banner>
        )}
        <Row justify="start">
          <Button
            icon="check"
            disabled={!editable}
            onPress={() => {
              close();
              toast.show({ title: '문제없음으로 처리했습니다', tone: 'success' });
              advance(t.id);
            }}
          >
            문제없음
          </Button>
          <Button
            variant="primary"
            icon="list-checks"
            disabled={!editable}
            onPress={() => {
              close();
              toast.show({
                title: '확인 임무를 등록했습니다',
                description: `${PROFILE.people.admin} · 2일 안 확인`,
                tone: 'success',
                ...(screens.has(MISSION_SCREEN)
                  ? { action: { label: '임무 보기', onPress: () => screens.go(MISSION_SCREEN) } }
                  : {}),
              });
              advance(t.id);
            }}
          >
            임무 등록
          </Button>
        </Row>
      </>
    );
  };

  const nothingLeft =
    !queues.unclassified.length && !queues.evidence.length && !queues.anomaly.length;

  return (
    <Page
      header={
        <PageHeader
          title="검토함"
          description="사람이 확인해야 하는 거래만 모았습니다. 목록에서 ↑ ↓로 옮기고 Enter로 제안을 승인합니다"
          tabs={
            <Tabs
              label="검토 구분"
              value={tab}
              onChange={(v) => {
                setTab(v as Tab);
                setSelected(null);
                setPhoneDetail(false);
              }}
              items={(Object.keys(TAB_LABELS) as Tab[]).map((k) => ({
                value: k,
                label: TAB_LABELS[k],
                count: queues[k].length,
              }))}
            />
          }
        />
      }
    >
      <Progress
        label="검토 진행"
        value={processed}
        max={total}
        unit="건"
        size="sm"
        tone="success"
      />
      {nothingLeft ? (
        <EmptyState
          title="검토할 거래가 없습니다"
          description="시산표에서 남은 결산 항목을 확인하세요"
          action={
            screens.has(AFTER_DONE.id) && (
              <Button
                variant="primary"
                iconEnd="arrow-right"
                onPress={() => screens.go(AFTER_DONE.id)}
              >
                {AFTER_DONE.label}
              </Button>
            )
          }
        />
      ) : (
        <Grid>
          {showList && (
            <Col span={4}>
              {/* 행 버튼의 키를 먼저 받아 옮기기 · 승인으로 바꾼다(SelectableList는 화살표로 초점만 옮긴다) */}
              <div ref={listRef} onKeyDownCapture={onListKey}>
                <SelectableList
                  label={`${TAB_LABELS[tab]} 거래`}
                  variant="ring"
                  selected={phone && !selected ? null : (current?.id ?? null)}
                  onSelect={pick}
                  emptyText={EMPTY[tab]}
                  items={list.map((t) => {
                    const p = proposals.find((x) => x.txnId === t.id);
                    return {
                      id: t.id,
                      title: t.party,
                      secondary:
                        tab === 'unclassified'
                          ? p
                            ? `제안 ${accountName(p.accountCode)} · ${percent(p.confidence)}`
                            : '제안 없음'
                          : t.memo,
                      meta: formatDate(t.date, 'md'),
                      value: `${formatAmount(Math.abs(t.amount))}원`,
                    };
                  })}
                />
              </div>
            </Col>
          )}
          {showDetail && (
            <Col span={8}>
              {phone && (
                <Row justify="start">
                  <Button
                    ref={backRef}
                    variant="ghost"
                    size="sm"
                    icon="arrow-left"
                    onPress={backToList}
                  >
                    {TAB_LABELS[tab]} 목록
                  </Button>
                </Row>
              )}
              {current ? (
                <Card
                  title={`${current.party} ${formatAmount(Math.abs(current.amount))}원`}
                  subtitle={`${formatDate(current.date)} · ${SOURCE_LABELS[current.source]}`}
                  action={
                    <Badge tone={tab === 'anomaly' ? 'warning' : 'info'}>{TAB_LABELS[tab]}</Badge>
                  }
                >
                  <div className="tl-block-drawer-stack">
                    {facts(current)}
                    {tab === 'unclassified' && classifyPanel(current)}
                    {tab === 'evidence' && evidencePanel(current)}
                    {tab === 'anomaly' && anomalyPanel(current)}
                  </div>
                </Card>
              ) : (
                <EmptyState title={EMPTY[tab]} description="다른 탭에 남은 거래를 확인하세요" />
              )}
            </Col>
          )}
        </Grid>
      )}
      {tab === 'unclassified' && bulk.length > 0 && showList && (
        <ActionBar
          sticky
          summary={`확신 ${percent(BULK_CONFIDENCE)} 이상 제안만 한 번에 승인합니다`}
        >
          <Button
            variant="primary"
            icon="circle-check"
            disabled={!canEdit}
            disabledReason="분류할 권한이 없습니다"
            onPress={() => {
              const ids = new Set(bulk.map((p) => p.txnId));
              setTxns((all) =>
                all.map((x) => {
                  const p = bulk.find((b) => b.txnId === x.id);
                  return p ? { ...x, accountCode: p.accountCode } : x;
                }),
              );
              setProposals((all) => all.filter((x) => !ids.has(x.txnId)));
              setSelected(null);
              toast.show({
                title: `제안 ${bulk.length}건을 승인했습니다`,
                description: '남은 건은 한 건씩 확인하세요',
                tone: 'success',
              });
            }}
          >
            확신 높은 제안 {bulk.length}건 승인
          </Button>
        </ActionBar>
      )}
    </Page>
  );
}
