// 거래처 원장: 미수금 · 미지급금 잔액 목록 → 거래처 하나의 원장(차변 · 대변 · 잔액)
import {
  dueDays,
  formatAmount,
  formatBizNo,
  formatCompactWon,
  formatDate,
  formatPeriod,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Banner,
  Button,
  Card,
  DataGrid,
  DataGridLines,
  DescriptionList,
  DueBadge,
  KpiCard,
  PageHeader,
  PeriodPicker,
  Progress,
  SegmentedBar,
  Tabs,
} from '@terracelab/trellis-react';
import { useEffect, useState } from 'react';
import { LEDGER, PAYABLES, partyById, RECEIVABLES, sum, TODAY } from '../../../_data/index.js';
import { useScreenParams } from '../../../_platform/index.js';
import {
  Col,
  ExportButton,
  Grid,
  monthEnd,
  monthStart,
  Page,
  type CsvColumn,
} from '../../../_ui/index.js';

/** 기본 기간: 전월 1일 ~ 이번 달 말일 */
const DEFAULT_PERIOD = { from: monthStart(TODAY, -1), to: monthEnd(TODAY) };

/**
 * 잔액 연령: 남은 잔액을 최근 증가분부터 거꾸로 채워(선입선출) 날짜별로 나눈다.
 * 30일 이내 · 31~60일 · 61일 이상
 */
function agingOf(entries: readonly { date: string; amount: number }[], balance: number) {
  const buckets = [0, 0, 0];
  let left = Math.max(0, balance);
  for (const e of [...entries].sort((a, b) => b.date.localeCompare(a.date))) {
    if (left <= 0) break;
    const take = Math.min(left, e.amount);
    const age = -dueDays(e.date, TODAY);
    buckets[age <= 30 ? 0 : age <= 60 ? 1 : 2]! += take;
    left -= take;
  }
  buckets[2]! += left;
  return buckets;
}

const KIND_TONE = {
  매출: 'info',
  매입: 'warning',
  입금: 'success',
  출금: 'success',
  '외화 환산': 'neutral',
} as const;
const BIZ = {
  active: { label: '정상', tone: 'success' },
  suspended: { label: '휴업', tone: 'warning' },
  closed: { label: '폐업', tone: 'danger' },
  foreign: { label: '해외', tone: 'neutral' },
} as const;

/** 거래처가 어느 잔액 목록에 있나(주소 ?id=로 열 때 탭을 고른다). 없으면 null */
const sideOf = (id: string | undefined): 'receivable' | 'payable' | null =>
  !id
    ? null
    : RECEIVABLES.some((b) => b.partyId === id)
      ? 'receivable'
      : PAYABLES.some((b) => b.partyId === id)
        ? 'payable'
        : null;

export default function VendorLedger() {
  // 주소 ?id=<거래처 id>면 그 거래처의 원장을 연다(채권 연령 · 알림 · 다른 화면에서 열 때)
  const { id: paramId } = useScreenParams();
  const linked = sideOf(paramId);
  const [side, setSide] = useState<string>(linked ?? 'receivable');
  const [partyId, setPartyId] = useState(
    linked && paramId ? paramId : (RECEIVABLES[0]?.partyId ?? ''),
  );
  // 주소의 거래처가 바뀌면(뒤로 · 다른 링크) 따라간다. 잔액 목록에 없는 거래처는 무시한다
  useEffect(() => {
    const s = sideOf(paramId);
    if (!s || !paramId) return;
    setSide(s);
    setPartyId(paramId);
  }, [paramId]);
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const balances = (side === 'receivable' ? RECEIVABLES : PAYABLES).map((b) => ({
    ...b,
    name: partyById(b.partyId).name,
    party: partyById(b.partyId),
  }));
  const party = partyById(partyId);
  const isSupplier = !party.kind.includes('customer');
  const entries = LEDGER.filter(
    (e) => e.partyId === partyId && e.date >= period.from && e.date <= period.to,
  );
  let running = 0;
  const rows = entries.map((e) => {
    running += isSupplier ? e.credit - e.debit : e.debit - e.credit;
    return { ...e, balance: running };
  });
  const opening = rows[0]?.docNo === '이월' ? rows[0].balance : 0;
  const increase = sum(
    rows.filter((r) => r.docNo !== '이월'),
    (r) => (isSupplier ? r.credit : r.debit),
  );
  const decrease = sum(rows, (r) => (isSupplier ? r.debit : r.credit));
  const closing = running;
  const limit = party.creditLimit;
  const aging = agingOf(
    rows.map((r) => ({ date: r.date, amount: isSupplier ? r.credit : r.debit })),
    closing,
  );
  /** 엑셀 다운로드 열: 고른 거래처의 기간 원장(차변 · 대변 · 잔액은 서식 없는 숫자) */
  const csv: CsvColumn<(typeof rows)[number]>[] = [
    { label: '일자', value: 'date' },
    { label: '구분', value: 'kind' },
    { label: '문서 번호', value: 'docNo' },
    { label: '적요', value: 'description' },
    { label: '차변(원)', value: 'debit' },
    { label: '대변(원)', value: 'credit' },
    { label: '잔액(원)', value: 'balance' },
  ];
  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '회계' }, { label: '거래처 원장' }]}
          title="거래처 원장"
          description="거래처별 미수금 · 미지급금과 원장입니다. 외화 거래는 결제일 환율로 환산합니다"
          actions={
            <>
              <ExportButton
                module="accounting"
                name={`거래처 원장 ${party.code} ${formatPeriod(period.from, period.to)}`}
                rows={rows}
                columns={csv}
              >
                엑셀 다운로드
              </ExportButton>
              <Button variant="primary" icon="banknote">
                {side === 'receivable' ? '입금 등록' : '지급 등록'}
              </Button>
            </>
          }
          tabs={
            <Tabs
              label="미수금 · 미지급금"
              value={side}
              onChange={(v) => {
                setSide(v);
                setPartyId(
                  (v === 'receivable' ? RECEIVABLES[0]?.partyId : PAYABLES[0]?.partyId) ?? '',
                );
              }}
              items={[
                { value: 'receivable', label: '미수금', count: RECEIVABLES.length },
                { value: 'payable', label: '미지급금', count: PAYABLES.length },
              ]}
            />
          }
        />
      }
    >
      <Grid>
        <Col span={5}>
          <Card
            title={side === 'receivable' ? '거래처별 미수금' : '거래처별 미지급금'}
            subtitle={`합계 ${formatAmount(sum(balances, (b) => b.balance))}원`}
            padding="none"
          >
            <DataGrid
              caption="거래처별 잔액"
              className="tl-block-flat-grid"
              rows={balances}
              rowKey="partyId"
              activeRowKey={partyId}
              onRowPress={(b) => setPartyId(b.partyId)}
              rowTone={(b) => (b.dueDate < TODAY ? 'danger' : undefined)}
              summary
              columns={[
                {
                  key: 'name',
                  header: '거래처',
                  render: (b) => <DataGridLines primary={b.name} secondary={b.party.terms} />,
                },
                { key: 'balance', header: '잔액', width: 'md', format: 'amount', total: 'sum' },
                {
                  key: 'dueDate',
                  header: '기한',
                  width: 'sm',
                  render: (b) => <DueBadge due={b.dueDate} today={TODAY} warnDays={7} size="sm" />,
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={7}>
          <Card
            title={party.name}
            subtitle={`${party.code} · ${party.bizNo ? formatBizNo(party.bizNo) : party.country} · ${party.manager}`}
            action={<Badge tone={BIZ[party.bizStatus].tone}>{BIZ[party.bizStatus].label}</Badge>}
          >
            <div className="tl-block-drawer-stack">
              {party.bizStatus === 'suspended' && (
                <Banner tone="warning" title="휴업 사업자">
                  {party.bizStatusSince ? `${party.bizStatusSince}부터 휴업입니다. ` : ''}새
                  세금계산서 발행 전에 거래처에 확인하세요.
                </Banner>
              )}
              <DescriptionList
                columns={2}
                items={[
                  { label: '결제 조건', value: party.terms },
                  { label: '통화', value: party.currency },
                  { label: '메일', value: party.email, copyable: true, span: 2 },
                ]}
              />
              {limit != null && (
                <Progress
                  label="신용 한도 사용"
                  value={Math.round((closing / limit) * 100)}
                  tone={closing / limit > 0.8 ? 'warning' : undefined}
                />
              )}
              <SegmentedBar
                size="thin"
                unit="원"
                format={formatCompactWon}
                legend
                ariaLabel="잔액 연령 구성"
                data={[
                  { label: '30일 이내', value: aging[0]!, color: 'series-1' },
                  { label: '31~60일', value: aging[1]!, color: 'series-4' },
                  { label: '61일 이상', value: aging[2]!, color: 'danger' },
                ]}
              />
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <KpiCard
            label="기초 잔액"
            value={opening}
            format="amount"
            unit="원"
            caption={formatDate(period.from)}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={isSupplier ? '매입' : '매출'}
            value={increase}
            format="amount"
            unit="원"
            caption={formatPeriod(period.from, period.to)}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={isSupplier ? '지급' : '입금'}
            value={decrease}
            format="amount"
            unit="원"
            caption={formatPeriod(period.from, period.to)}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="기말 잔액"
            value={closing}
            format="amount"
            unit="원"
            caption={formatDate(period.to)}
          />
        </Col>
        <Col span={12}>
          <Card
            title="원장"
            subtitle={`${formatPeriod(period.from, period.to)} · ${rows.length}건`}
            action={<PeriodPicker value={period} onChange={setPeriod} today={TODAY} size="sm" />}
            padding="none"
          >
            <DataGrid
              caption={`${party.name} 원장`}
              className="tl-block-flat-grid"
              rows={rows}
              rowKey="id"
              summary
              empty="이 기간의 거래가 없습니다. 기간을 넓혀 보세요"
              columns={[
                { key: 'date', header: '일자', width: 'sm', format: 'date' },
                {
                  key: 'kind',
                  header: '구분',
                  width: 'sm',
                  render: (r) => <Badge tone={KIND_TONE[r.kind]}>{r.kind}</Badge>,
                },
                {
                  key: 'docNo',
                  header: '문서 번호',
                  width: 'md',
                  render: (r) => <span className="tl-block-code">{r.docNo}</span>,
                },
                { key: 'description', header: '적요' },
                { key: 'debit', header: '차변', width: 'md', format: 'amount', total: 'sum' },
                { key: 'credit', header: '대변', width: 'md', format: 'amount', total: 'sum' },
                { key: 'balance', header: '잔액', width: 'md', format: 'amount' },
              ]}
            />
          </Card>
        </Col>
      </Grid>
    </Page>
  );
}
