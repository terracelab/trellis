// 자금 일보(Dashboard): 전일 시재 + 수입 − 지출 = 당일 시재. 계좌별 시재 · 당일 입출금 · 30일 추이 · 지급 예정
import {
  formatAmount,
  formatCompactWon,
  formatCurrency,
  formatDate,
  formatPeriod,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Button,
  Card,
  ChartCard,
  DataGrid,
  DataGridLines,
  DueBadge,
  PageHeader,
  TrendChart,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  BANK_ACCOUNTS,
  CASH_ROWS,
  CASH_SERIES,
  CASH_TOTAL,
  CASH_TX,
  PLANNED_PAYMENTS,
  USD_RATE,
} from '../../../_data/erp.js';
import { sum, TODAY } from '../../../_data/index.js';
import { PROFILE } from '../../../_data/profile.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import {
  addDays,
  Col,
  ExportButton,
  Figure,
  Grid,
  Lines,
  Page,
  type CsvColumn,
} from '../../../_ui/index.js';
import './style.css';

/** 엑셀 다운로드 열: 계좌별 시재(자금 일보 본문). 원화 환산 금액은 서식 없는 숫자, 외화는 통화 금액 따로 */
const CSV: CsvColumn<(typeof CASH_ROWS)[number]>[] = [
  { label: '은행', value: 'bank' },
  { label: '계좌', value: 'name' },
  { label: '계좌번호', value: 'no' },
  { label: '통화', value: 'currency' },
  { label: '전일 잔액(통화)', value: 'prev' },
  { label: '전일 잔액(원)', value: 'prevKrw' },
  { label: '입금(원)', value: 'inflow' },
  { label: '출금(원)', value: 'outflow' },
  { label: '당일 잔액(원)', value: 'today' },
];

/** 30일 뒤 · 전일(마감한 날) */
const IN_30 = addDays(TODAY, 30);
const YESTERDAY = addDays(TODAY, -1);
const accountName = (id: string) => {
  const a = BANK_ACCOUNTS.find((b) => b.id === id)!;
  return `${a.bank} ${a.name.split(' · ')[0]}`;
};

export default function DailyCash() {
  const toast = useToast();
  const canConfirm = useCan('treasury', 'approve');
  const screens = useScreens();
  const go = screens.go;
  const [confirmed, setConfirmed] = useState(false);
  /** 계좌 행을 누르면 당일 입출금을 그 계좌로 거른다 */
  const [account, setAccount] = useState<string | null>(null);
  const net = CASH_TOTAL.inflow - CASH_TOTAL.outflow;
  const ins = CASH_TX.filter((t) => t.direction === 'in');
  const outs = CASH_TX.filter((t) => t.direction === 'out');
  const tx = CASH_TX.filter((t) => !account || t.accountId === account).map((t) => ({
    ...t,
    inflow: t.direction === 'in' ? t.amount : 0,
    outflow: t.direction === 'out' ? t.amount : 0,
  }));
  const within30 = PLANNED_PAYMENTS.filter((p) => p.due <= IN_30);
  const first = CASH_SERIES[0]!;
  const last = CASH_SERIES[CASH_SERIES.length - 1]!;
  const low = CASH_SERIES.reduce((m, d) => (d.balance < m.balance ? d : m), first);

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '자금' }, { label: '자금 일보' }]}
          title="자금 일보"
          meta={
            confirmed ? <Badge tone="success">확정</Badge> : <Badge tone="neutral">작성 중</Badge>
          }
          description={`${formatDate(TODAY, 'mdw')} · 은행 잔액 15:30 조회 · 외화는 매매기준율 ${formatAmount(USD_RATE, { digits: 2 })}원으로 환산`}
          actions={
            <>
              <Button icon="printer">인쇄</Button>
              <ExportButton
                module="treasury"
                name={`자금 일보 ${TODAY}`}
                rows={CASH_ROWS}
                columns={CSV}
              >
                엑셀 다운로드
              </ExportButton>
              <Button
                variant="primary"
                icon="circle-check"
                disabled={!canConfirm || confirmed}
                onPress={() => {
                  setConfirmed(true);
                  toast.show({
                    title: `${formatDate(TODAY, 'md')} 자금 일보를 확정했습니다`,
                    description: `${PROFILE.people.ceo}에게 메일로 보냈습니다`,
                    tone: 'success',
                  });
                }}
              >
                {confirmed ? '확정됨' : '일보 확정'}
              </Button>
            </>
          }
        />
      }
    >
      <Grid>
        <Col span={12}>
          <Card>
            <div className="tl-block-cash-eq" role="group" aria-label="당일 시재 계산">
              <div className="tl-block-cash-eq__term">
                <Figure label="전일 시재" value={formatAmount(CASH_TOTAL.prev)} unit="원" />
                <span className="tl-block-muted">
                  계좌 {BANK_ACCOUNTS.length}개 · {formatDate(YESTERDAY, 'md')} 마감
                </span>
              </div>
              <span className="tl-block-cash-eq__op">+</span>
              <div className="tl-block-cash-eq__term">
                <Figure
                  label="수입"
                  value={formatAmount(CASH_TOTAL.inflow)}
                  unit="원"
                  tone="income"
                />
                <span className="tl-block-muted">입금 {ins.length}건 · 매출 대금 회수</span>
              </div>
              <span className="tl-block-cash-eq__op">−</span>
              <div className="tl-block-cash-eq__term">
                <Figure
                  label="지출"
                  value={formatAmount(CASH_TOTAL.outflow)}
                  unit="원"
                  tone="expense"
                />
                <span className="tl-block-muted">출금 {outs.length}건 · 세금 · 임차료 · 카드</span>
              </div>
              <span className="tl-block-cash-eq__op">=</span>
              <div className="tl-block-cash-eq__term" data-result>
                <Figure label="당일 시재" value={formatAmount(CASH_TOTAL.today)} unit="원" />
                <span className="tl-block-muted">
                  전일 대비{' '}
                  <span className="tl-block-cash-delta" data-dir={net >= 0 ? 'up' : 'down'}>
                    {formatAmount(net, { sign: 'always', unit: '원' })}
                  </span>
                </span>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title="계좌별 시재"
            subtitle="원 · 계좌를 누르면 그 계좌의 입출금만 봅니다"
            padding="none"
          >
            <DataGrid
              caption="계좌별 시재"
              className="tl-block-cash-flat"
              rows={CASH_ROWS}
              rowKey="id"
              summary
              activeRowKey={account}
              onRowPress={(r) => setAccount((a) => (a === r.id ? null : r.id))}
              columns={[
                {
                  key: 'bank',
                  header: '계좌',
                  render: (r) => (
                    <DataGridLines
                      primary={
                        <>
                          {r.bank} {r.name}
                        </>
                      }
                      secondary={
                        <span className="tl-block-code">
                          {r.no}
                          {r.currency !== 'KRW' && ` · ${formatCurrency(r.prev, r.currency)}`}
                        </span>
                      }
                    />
                  ),
                },
                {
                  key: 'prevKrw',
                  header: '전일 잔액',
                  width: 'md',
                  format: 'amount',
                  total: 'sum',
                },
                {
                  key: 'inflow',
                  header: '입금',
                  width: 'sm',
                  format: 'amount',
                  total: 'sum',
                  render: (r) => <Money v={r.inflow} dir="in" />,
                },
                {
                  key: 'outflow',
                  header: '출금',
                  width: 'sm',
                  format: 'amount',
                  total: 'sum',
                  render: (r) => <Money v={r.outflow} dir="out" />,
                },
                { key: 'today', header: '당일 잔액', width: 'md', format: 'amount', total: 'sum' },
              ]}
            />
          </Card>
        </Col>
        <Col span={4}>
          <ChartCard
            title="30일 시재"
            subtitle={`원 · 계좌 3개 합계 · ${formatPeriod(first.date, last.date)}`}
            height={196}
            table={{
              columns: ['일자', '시재(원)'],
              rows: CASH_SERIES.map((d) => [d.date, d.balance]),
            }}
          >
            <TrendChart
              data={CASH_SERIES}
              x="label"
              series={[{ key: 'balance', label: '시재', type: 'area', color: 'series-1' }]}
              unit="원"
              height={196}
              yFormat={formatCompactWon}
              curve="linear"
              endLabel="balance"
              ariaLabel={`최근 30일 시재. ${formatCompactWon(first.balance)}원에서 ${formatCompactWon(last.balance)}원. 최저는 ${low.label} ${formatCompactWon(low.balance)}원`}
            />
          </ChartCard>
        </Col>

        <Col span={8}>
          <Card
            title="당일 입출금"
            subtitle={
              account
                ? `${accountName(account)} · ${tx.length}건`
                : `입금 ${ins.length}건 · 출금 ${outs.length}건 · 전표와 연결`
            }
            padding="none"
            action={
              account ? (
                <Button size="sm" variant="ghost" icon="x" onPress={() => setAccount(null)}>
                  전체 계좌
                </Button>
              ) : (
                screens.has('erp/accounting/journal') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    iconEnd="chevron-right"
                    onPress={() => go('erp/accounting/journal')}
                  >
                    전표
                  </Button>
                )
              )
            }
          >
            <DataGrid
              caption="당일 입출금"
              className="tl-block-cash-flat"
              rows={tx}
              rowKey="id"
              summary
              columns={[
                {
                  key: 'time',
                  header: '시각',
                  width: 'sm',
                  sortable: true,
                  render: (t) => <span className="tl-block-code">{t.time}</span>,
                },
                {
                  key: 'direction',
                  header: '구분',
                  width: 'xs',
                  render: (t) => (
                    <span className="tl-block-cash-kind" data-dir={t.direction}>
                      {t.direction === 'in' ? '입금' : '출금'}
                    </span>
                  ),
                },
                {
                  key: 'party',
                  header: '거래처 · 적요',
                  render: (t) => (
                    <DataGridLines
                      primary={t.party}
                      secondary={
                        <>
                          {t.memo} · {t.voucherId}
                        </>
                      }
                    />
                  ),
                },
                {
                  key: 'accountId',
                  header: '계좌',
                  width: 'md',
                  render: (t) => accountName(t.accountId),
                },
                {
                  key: 'inflow',
                  header: '수입',
                  width: 'sm',
                  format: 'amount',
                  total: 'sum',
                  sortable: true,
                  render: (t) => <Money v={t.inflow} dir="in" />,
                },
                {
                  key: 'outflow',
                  header: '지출',
                  width: 'sm',
                  format: 'amount',
                  total: 'sum',
                  sortable: true,
                  render: (t) => <Money v={t.outflow} dir="out" />,
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card
            title="지급 예정"
            subtitle={`30일 이내 ${within30.length}건 · ${formatAmount(sum(within30, (p) => p.amount))}원`}
            padding="none"
          >
            <ul className="tl-block-cash-plan">
              {PLANNED_PAYMENTS.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="tl-block-cash-plan__row tl-focusable"
                    disabled={!p.link || !screens.has(p.link)}
                    onClick={() => p.link && go(p.link)}
                  >
                    <Lines primary={p.title} secondary={p.party} />
                    <span className="tl-block-cash-plan__amount">
                      <span>{formatAmount(p.amount)}원</span>
                      {p.currencyNote && (
                        <span className="tl-block-cash-plan__fx">{p.currencyNote}</span>
                      )}
                    </span>
                    <DueBadge due={p.due} today={TODAY} warnDays={7} size="sm" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </Col>
      </Grid>
    </Page>
  );
}

/** 수입은 빨강 · 지출은 파랑. 0은 비운다 */
function Money({ v, dir }: { v: number; dir: 'in' | 'out' }) {
  if (!v) return null;
  return (
    <span className="tl-block-cash-money" data-dir={dir}>
      {formatAmount(v)}
    </span>
  );
}
