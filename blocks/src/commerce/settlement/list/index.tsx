// 정산(Dashboard): 채널별 매출 · 반품 · 수수료 · 배송비 → 정산 예정액, 매출에서 정산액까지의 폭포 차트,
// 정산일 DueBadge, 합계가 맞는 표, 채널 정산 보고서와 차이가 나면 Banner → 대사 Drawer
import {
  formatAmount,
  formatCompactWon,
  formatDate,
  formatDueDays,
  formatPercent,
  formatPeriod,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Banner,
  Button,
  Card,
  ChartCard,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  DueBadge,
  KpiCard,
  PageHeader,
  useToast,
  WaterfallChart,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  channelById,
  SETTLE_DIFFS,
  SETTLE_LAST,
  SETTLE_PERIOD,
  SETTLE_STATES,
  SETTLEMENTS,
  settleAmount,
  settleFee,
  type ChannelId,
  type Settlement,
} from '../../../_data/commerce.js';
import { TODAY } from '../../../_data/trade.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import { Col, Grid, Lines, Page } from '../../../_ui/index.js';
import './style.css';

/** 지난 주기 정산 완료 합계(데이터) */
const LAST_SETTLED = SETTLE_LAST;

type Row = Settlement & {
  name: string;
  feeRate: number;
  fee: number;
  /** 채널 보고서를 받아들여 수수료에 더한 쿠폰 분담금 */
  shareFee: number;
  amount: number;
};

export default function SettlementList() {
  const toast = useToast();
  const canPost = useCan('settlement', 'approve');
  const screens = useScreens();
  const [resolved, setResolved] = useState<ChannelId[]>([]);
  const [diffOpen, setDiffOpen] = useState(false);

  const rows: Row[] = SETTLEMENTS.map((s) => {
    const fixed = resolved.includes(s.channelId) && s.reported != null;
    const shareFee = fixed ? settleAmount(s) - s.reported! : 0;
    return {
      ...s,
      state: fixed ? 'scheduled' : s.state,
      name: channelById(s.channelId).name,
      feeRate: channelById(s.channelId).feeRate,
      fee: settleFee(s) + shareFee,
      shareFee,
      amount: settleAmount(s) - shareFee,
    };
  });
  const sum = (f: (r: Row) => number) => rows.reduce((a, r) => a + f(r), 0);
  const sales = sum((r) => r.sales);
  const returns = sum((r) => r.returns);
  const fees = sum((r) => r.fee);
  const shipping = sum((r) => r.shipping);
  const total = sum((r) => r.amount);
  const orders = sum((r) => r.orders);
  const mismatch = rows.find((r) => r.state === 'mismatch');
  const next = [...rows].sort((a, b) => a.settleDate.localeCompare(b.settleDate))[0]!;
  const diffTotal = SETTLE_DIFFS.reduce((a, d) => a + d.reported - d.ours, 0);
  const pct = (v: number) => formatPercent((v / sales) * 100);

  const steps = [
    { label: '매출', value: sales, kind: 'start' as const, caption: `${formatAmount(orders)}건` },
    { label: '반품', value: -returns, kind: 'delta' as const, caption: pct(-returns) },
    { label: '수수료', value: -fees, kind: 'delta' as const, caption: pct(-fees) },
    { label: '배송비', value: shipping, kind: 'delta' as const, caption: `+${pct(shipping)}` },
    { label: '정산액', value: total, kind: 'total' as const, caption: pct(total) },
  ];

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '이커머스' }, { label: '정산' }]}
          title="정산"
          description={`구매 확정 ${formatPeriod(SETTLE_PERIOD.from, SETTLE_PERIOD.to)} · 판매 채널 ${rows.length}곳 · ${formatAmount(orders)}건`}
          actions={
            <>
              <Button icon="refresh-cw">채널 보고서 다시 받기</Button>
              <Button
                variant="primary"
                icon="send"
                disabled={!canPost}
                onPress={() =>
                  toast.show({
                    title: `정산 예정액 ${rows.length}건을 회계에 반영했습니다`,
                    description: `미수금 ${formatAmount(total)}원 · 매출 전표 ${rows.length}건을 작성했습니다`,
                    tone: 'success',
                  })
                }
              >
                회계 반영
              </Button>
            </>
          }
        />
      }
    >
      {mismatch && (
        <Banner
          tone="warning"
          title={`${mismatch.name} 정산 보고서와 ${formatAmount(Math.abs(diffTotal))}원 차이`}
          action={
            <Button size="sm" onPress={() => setDiffOpen(true)}>
              차이 보기
            </Button>
          }
        >
          채널 보고서의 정산 예정액은 {formatAmount(mismatch.reported ?? 0)}원이고 우리 계산은{' '}
          {formatAmount(mismatch.amount)}원입니다. 주문 {SETTLE_DIFFS.length}건의 수수료가 다릅니다.
        </Banner>
      )}
      <Grid>
        <Col span={3}>
          <KpiCard
            label="정산 예정액"
            value={total}
            format="amount"
            unit="원"
            caption={`매출 ${formatAmount(sales)}원의 ${pct(total)}`}
            icon="banknote"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="판매 수수료"
            value={fees}
            format="amount"
            unit="원"
            caption={`매출 대비 ${pct(fees)} · 채널 ${rows.length}곳`}
            icon="percent"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="다음 정산"
            value={formatDate(next.settleDate, 'mdw')}
            caption={`${next.name} ${formatAmount(next.amount)}원 · ${formatDueDays(next.settleDate, TODAY)}`}
            icon="calendar"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="반품 · 취소 차감"
            value={returns}
            format="amount"
            unit="원"
            caption={`매출 대비 ${pct(returns)}`}
            icon="undo-2"
            {...(screens.has('commerce/claims/list')
              ? { onPress: () => screens.go('commerce/claims/list') }
              : {})}
          />
        </Col>

        <Col span={7}>
          <ChartCard
            title="매출에서 정산액까지"
            subtitle={`원 · 채널 ${rows.length}곳 합계 · 막대 아래는 매출 대비 증감`}
            legend={[
              { label: '매출 · 정산액', color: 'series-1' },
              { label: '더하는 금액', color: 'income' },
              { label: '빼는 금액', color: 'expense' },
            ]}
            height={260}
            table={{
              columns: ['단계', '금액(원)'],
              rows: steps.map((s) => [s.label, s.value]),
            }}
          >
            <WaterfallChart
              steps={steps}
              unit="원"
              height={260}
              format={formatCompactWon}
              ariaLabel={`구매 확정 ${formatPeriod(SETTLE_PERIOD.from, SETTLE_PERIOD.to)} 매출 ${formatCompactWon(sales)}원에서 반품 · 수수료를 빼고 배송비를 더해 정산액 ${formatCompactWon(total)}원`}
            />
          </ChartCard>
        </Col>
        <Col span={5}>
          <Card
            title="채널별 정산일"
            subtitle={`정산 예정액 · 기준일 ${formatDate(TODAY, 'md')}`}
            footer={
              <div className="tl-block-cm-settle-done">
                <Lines
                  primary="지난 정산 완료"
                  secondary={
                    <>
                      구매 확정 {formatPeriod(LAST_SETTLED.from, LAST_SETTLED.to)} ·{' '}
                      {LAST_SETTLED.channels}곳 입금
                    </>
                  }
                />
                <strong>{formatAmount(LAST_SETTLED.amount, { unit: '원' })}</strong>
              </div>
            }
          >
            <ul className="tl-block-cm-settle-list">
              {[...rows]
                .sort((a, b) => a.settleDate.localeCompare(b.settleDate))
                .map((r) => (
                  <li key={r.channelId}>
                    <Lines
                      primary={r.name}
                      secondary={
                        <>
                          {formatDate(r.settleDate, 'mdw')} · {channelById(r.channelId).settleRule}
                        </>
                      }
                    />
                    <span className="tl-block-cm-settle-list__amount">
                      {formatAmount(r.amount, { unit: '원' })}
                    </span>
                    <span className="tl-block-cm-settle-list__badges">
                      {r.state === 'mismatch' && (
                        <Badge size="sm" tone="warning">
                          차이
                        </Badge>
                      )}
                      <DueBadge due={r.settleDate} today={TODAY} size="sm" />
                    </span>
                  </li>
                ))}
            </ul>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title="채널별 정산 내역"
            subtitle="정산 예정액 = 매출 − 반품 − 수수료 + 배송비"
            padding="none"
          >
            <DataGrid
              caption="채널별 정산 내역"
              className="tl-block-cm-flat-grid"
              rows={rows}
              rowKey="channelId"
              summary
              rowTone={(r) => (r.state === 'mismatch' ? 'warning' : undefined)}
              onRowPress={(r) => r.state === 'mismatch' && setDiffOpen(true)}
              columns={[
                {
                  key: 'name',
                  header: '판매 채널',
                  width: 'md',
                  render: (r) => (
                    <DataGridLines
                      primary={r.name}
                      secondary={
                        r.shareFee ? '쿠폰 분담금 포함' : `수수료 ${formatPercent(r.feeRate)}`
                      }
                    />
                  ),
                },
                {
                  key: 'orders',
                  header: '주문',
                  width: 'sm',
                  format: 'quantity',
                  unit: '건',
                  total: 'sum',
                },
                {
                  key: 'sales',
                  header: '매출',
                  width: 'md',
                  format: 'amount',
                  unit: '원',
                  total: 'sum',
                },
                {
                  key: 'returns',
                  header: '반품',
                  width: 'md',
                  format: 'amount',
                  unit: '원',
                  total: 'sum',
                  value: (r) => -r.returns,
                },
                {
                  key: 'fee',
                  header: '수수료',
                  width: 'md',
                  format: 'amount',
                  unit: '원',
                  total: 'sum',
                  value: (r) => -r.fee,
                },
                {
                  key: 'shipping',
                  header: '배송비',
                  width: 'md',
                  format: 'amount',
                  unit: '원',
                  total: 'sum',
                },
                {
                  key: 'amount',
                  header: '정산 예정액',
                  width: 'md',
                  format: 'amount',
                  unit: '원',
                  total: 'sum',
                },
                {
                  key: 'settleDate',
                  header: '정산일',
                  width: 'lg',
                  render: (r) => (
                    <span className="tl-block-cm-date-due">
                      <span className="tl-block-code">{formatDate(r.settleDate)}</span>
                      <DueBadge due={r.settleDate} today={TODAY} size="sm" />
                    </span>
                  ),
                },
                {
                  key: 'state',
                  header: '상태',
                  width: 'sm',
                  render: (r) => (
                    <Badge tone={SETTLE_STATES[r.state].tone}>{SETTLE_STATES[r.state].label}</Badge>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Grid>
      <Drawer
        open={diffOpen}
        onOpenChange={setDiffOpen}
        title={`${mismatch?.name ?? '오픈마켓 B'} 정산 차이`}
        description={`보고서 받음 11-06 09:00 · 구매 확정 ${formatPeriod(SETTLE_PERIOD.from, SETTLE_PERIOD.to)}`}
        width="lg"
        actions={mismatch && <Badge tone="warning">차이 확인</Badge>}
        footer={
          mismatch && (
            <>
              <Button icon="mail">채널에 문의</Button>
              <Button
                variant="primary"
                icon="check"
                disabled={!canPost}
                onPress={() => {
                  setResolved((r) => [...r, mismatch.channelId]);
                  setDiffOpen(false);
                  toast.show({
                    title: '정산 차이를 확인했습니다',
                    description: `쿠폰 분담금 ${formatAmount(Math.abs(diffTotal))}원을 반영해 정산 예정액을 ${formatAmount(mismatch.reported ?? 0)}원으로 맞췄습니다`,
                    tone: 'success',
                  });
                }}
              >
                차이 확인
              </Button>
            </>
          )
        }
      >
        {mismatch && (
          <div className="tl-block-drawer-stack">
            <DescriptionList
              columns={3}
              layout="vertical"
              items={[
                { label: '우리 계산', value: `${formatAmount(mismatch.amount)}원` },
                { label: '채널 보고', value: `${formatAmount(mismatch.reported ?? 0)}원` },
                {
                  label: '차이',
                  value: `${formatAmount((mismatch.reported ?? 0) - mismatch.amount)}원`,
                },
              ]}
            />
            <DataGrid
              caption="수수료가 다른 주문"
              rows={SETTLE_DIFFS.map((d) => ({ ...d, diff: d.ours - d.reported }))}
              rowKey="orderNo"
              summary
              columns={[
                {
                  key: 'orderNo',
                  header: '채널 주문번호',
                  width: 'lg',
                  render: (d) => (
                    <DataGridLines
                      primary={<span className="tl-block-code">{d.orderNo}</span>}
                      secondary={d.label}
                    />
                  ),
                },
                {
                  key: 'ours',
                  header: '우리 계산',
                  width: 'sm',
                  format: 'amount',
                  unit: '원',
                  total: 'sum',
                },
                {
                  key: 'reported',
                  header: '채널 보고',
                  width: 'sm',
                  format: 'amount',
                  unit: '원',
                  total: 'sum',
                },
                {
                  key: 'diff',
                  header: '정산 차이',
                  width: 'sm',
                  format: 'amount',
                  unit: '원',
                  total: 'sum',
                  finance: true,
                },
              ]}
            />
            <p className="tl-block-muted">
              주문마다 쿠폰 분담금 {formatAmount(SETTLE_DIFFS[0]!.reported - SETTLE_DIFFS[0]!.ours)}
              원이 수수료에 더해졌습니다. 쿠폰 분담금을 채널과 나눠 내기로 한 약정과 맞으면 차이
              확인을 누릅니다.
            </p>
          </div>
        )}
      </Drawer>
    </Page>
  );
}
