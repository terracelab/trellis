// 고객(ListDetail): 상태 탭 · KPI · 거래 주의 배너 · 고객 목록(등급 · 담당 · 누적 매출 · 미수금) · 360 Drawer
import {
  formatAmount,
  formatBizNo,
  formatCompactWon,
  formatDate,
  formatDueDays,
  formatPercent,
} from '@terracelab/trellis-contracts';
import {
  Avatar,
  Badge,
  Banner,
  Button,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  EmptyState,
  FilterBar,
  Input,
  KpiCard,
  PageHeader,
  Select,
  Sparkline,
  Tabs,
  Timeline,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  ACTIVITY_META,
  CUSTOMER_STATES,
  CUSTOMERS,
  GRADES,
  MONTH_LABELS,
  OPPORTUNITIES,
  SALES_REPS,
  staffLabel,
  ytdOf,
  type Customer,
  type Grade,
} from '../../../_data/ecm-crm.js';
import { TODAY } from '../../../_data/index.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import {
  Col,
  ExportButton,
  Figure,
  Grid,
  Lines,
  Page,
  type CsvColumn,
} from '../../../_ui/index.js';
import './style.css';

const LEDGER = 'erp/accounting/vendor-ledger';
/** 월 이름(데이터 MONTH_LABELS): 마지막이 이번 달, 그 앞이 마감한 달 */
const CUR = MONTH_LABELS[MONTH_LABELS.length - 1] ?? '';
const LAST = MONTH_LABELS[MONTH_LABELS.length - 2] ?? '';
const FIRST_MONTH = MONTH_LABELS[0] ?? '';
const YEAR = TODAY.slice(0, 4);

type Row = Customer & { ytd: number; nov: number };
const rows: Row[] = CUSTOMERS.map((c) => ({ ...c, ytd: ytdOf(c), nov: c.monthly[11] ?? 0 }));
const sumOf = (rs: readonly Row[], f: (r: Row) => number) => rs.reduce((a, r) => a + f(r), 0);
/** 엑셀 다운로드 열(표와 같은 순서, 금액은 서식 없는 숫자) */
const CSV: CsvColumn<Row>[] = [
  { label: '고객 코드', value: 'code' },
  { label: '고객', value: 'name' },
  { label: '업종', value: 'industry' },
  { label: '지역', value: 'region' },
  { label: '등급', value: (r) => GRADES[r.grade].label },
  { label: '담당 영업', value: (r) => staffLabel(r.owner) },
  { label: '최근 거래일', value: (r) => r.lastDealAt ?? '' },
  { label: '누적 매출(원)', value: 'ytd' },
  { label: '미수금(원)', value: 'receivable' },
  { label: '미수 기한', value: (r) => r.receivableDue ?? '' },
  { label: '상태', value: (r) => CUSTOMER_STATES[r.state].label },
];

export default function Customers() {
  const canCreate = useCan('customers', 'create');
  const screens = useScreens();
  const go = screens.go;
  const pressTo = (id: string) => (screens.has(id) ? { onPress: () => go(id) } : {});
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [owner, setOwner] = useState<string | null>('all');
  const [grade, setGrade] = useState<string | null>('all');
  const [open, setOpen] = useState<Row | null>(null);

  const shown = rows.filter(
    (r) =>
      (tab === 'all' || r.state === tab) &&
      (owner === 'all' || !owner || r.owner === owner) &&
      (grade === 'all' || !grade || r.grade === grade) &&
      (!q || `${r.name}${r.code}${r.industry}`.includes(q)),
  );
  const trading = rows.filter((r) => r.state !== 'prospect');
  const caution = rows.filter((r) => r.state === 'caution');
  const overdue = rows.filter(
    (r) => r.receivable > 0 && r.receivableDue && r.receivableDue < TODAY,
  );
  const octTotal = sumOf(trading, (r) => r.monthly[10] ?? 0);
  const novTotal = sumOf(trading, (r) => r.nov);
  const openOpps = OPPORTUNITIES.filter((o) => o.stage !== 'won' && o.stage !== 'lost');
  const count = (s: string) => rows.filter((r) => r.state === s).length;
  // 추이는 마감한 달만. 이번 달은 오늘까지라 따로 적는다
  const closedMonths = open ? open.monthly.slice(0, 11) : [];

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: 'CRM' }, { label: '고객' }]}
          title="고객"
          description={`거래 고객 ${trading.length}곳 · 잠재 고객 ${count('prospect')}곳 · 담당 영업 ${SALES_REPS.length}명`}
          actions={
            <>
              <ExportButton module="customers" name="고객" rows={shown} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              <Button variant="primary" icon="user-plus" disabled={!canCreate}>
                고객 등록
              </Button>
            </>
          }
          tabs={
            <Tabs
              label="고객 상태"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: '전체', count: rows.length },
                { value: 'active', label: '거래 중', count: count('active') },
                { value: 'caution', label: '거래 주의', count: count('caution') },
                { value: 'prospect', label: '잠재', count: count('prospect') },
              ]}
            />
          }
        />
      }
    >
      <Grid>
        <Col span={3}>
          <KpiCard
            label={`${YEAR} 누적 매출`}
            value={sumOf(trading, (r) => r.ytd)}
            format="amount"
            unit="원"
            caption={`1월~${formatDate(TODAY, 'md')} · 거래 고객 ${trading.length}곳`}
            icon="trending-up"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={`${CUR} 매출`}
            value={novTotal}
            format="amount"
            unit="원"
            caption={`${LAST} ${formatCompactWon(octTotal)}원 · 발행 세금계산서 기준`}
            icon="receipt"
            {...pressTo('erp/tax/invoice-list')}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="미수금"
            value={sumOf(rows, (r) => r.receivable)}
            format="amount"
            unit="원"
            caption={`기한 경과 ${formatAmount(sumOf(overdue, (r) => r.receivable))}원 · ${overdue.length}곳`}
            icon="wallet"
            {...pressTo(LEDGER)}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="진행 영업기회"
            value={openOpps.length}
            unit="건"
            caption={`합계 ${formatCompactWon(openOpps.reduce((a, o) => a + o.amount, 0))}원`}
            icon="filter"
            {...pressTo('crm/opportunities/pipeline')}
          />
        </Col>
      </Grid>
      {caution.map((c) => (
        <Banner
          key={c.id}
          tone="warning"
          title={`${c.name} 거래 주의 · 미수금 ${formatAmount(c.receivable)}원 ${c.receivableDue ? formatDueDays(c.receivableDue, TODAY) : ''}`}
          action={
            <Button size="sm" onPress={() => setOpen(c)}>
              고객 보기
            </Button>
          }
        >
          {c.note}
        </Banner>
      ))}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="고객명 · 코드 · 업종"
            label="고객 검색"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setOwner('all');
          setGrade('all');
          setTab('all');
        }}
        resultCount={shown.length}
      >
        <Select
          size="sm"
          width="auto"
          label="담당 영업"
          value={owner}
          onChange={setOwner}
          options={[
            { value: 'all', label: '담당 전체' },
            ...SALES_REPS.map((n) => ({ value: n, label: staffLabel(n) })),
          ]}
        />
        <Select
          size="sm"
          width="auto"
          label="등급"
          value={grade}
          onChange={setGrade}
          options={[
            { value: 'all', label: '등급 전체' },
            ...(Object.keys(GRADES) as Grade[]).map((g) => ({ value: g, label: GRADES[g].label })),
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="고객"
        className="tl-block-crm-grid"
        rows={shown}
        rowKey="id"
        onRowPress={setOpen}
        activeRowKey={open?.id ?? null}
        summary
        summaryLabel={`${shown.length}곳 합계`}
        defaultSort={{ key: 'ytd', direction: 'desc' }}
        rowTone={(r) => (r.state === 'caution' ? 'warning' : undefined)}
        empty="이 조건의 고객이 없습니다. 담당이나 등급을 바꿔 보세요"
        columns={[
          {
            key: 'name',
            header: '고객',
            sticky: true,
            sortable: true,
            render: (r) => (
              <DataGridLines
                primary={<span className="tl-block-crm-name">{r.name}</span>}
                secondary={
                  <>
                    {r.code} · {r.industry} · {r.region}
                  </>
                }
              />
            ),
          },
          {
            key: 'grade',
            header: '등급',
            width: 'xs',
            render: (r) => (
              <Badge tone={GRADES[r.grade].tone} variant="outline" dot={false}>
                {GRADES[r.grade].label}
              </Badge>
            ),
          },
          {
            key: 'owner',
            header: '담당 영업',
            width: 'md',
            sortable: true,
            render: (r) => (
              <span className="tl-block-crm-owner">
                <Avatar name={r.owner} size={24} decorative />
                {staffLabel(r.owner)}
              </span>
            ),
          },
          {
            key: 'lastDealAt',
            header: '최근 거래일',
            width: 'sm',
            sortable: true,
            render: (r) => (r.lastDealAt ? formatDate(r.lastDealAt) : '–'),
          },
          {
            key: 'ytd',
            header: '누적 매출',
            width: 'md',
            format: 'amount',
            total: 'sum',
            sortable: true,
          },
          {
            key: 'receivable',
            header: '미수금',
            width: 'md',
            align: 'right',
            format: 'amount',
            total: 'sum',
            sortable: true,
            render: (r) =>
              r.receivable > 0 ? (
                <DataGridLines
                  primary={
                    screens.has(LEDGER) ? (
                      <a href={screens.href(LEDGER)} className="tl-block-crm-link tl-focusable">
                        {formatAmount(r.receivable)}
                        <span className="tl-sr-only">원 · {r.name} 거래처 원장 보기</span>
                      </a>
                    ) : (
                      <span>{formatAmount(r.receivable)}</span>
                    )
                  }
                  secondary={
                    r.receivableDue && r.receivableDue < TODAY
                      ? formatDueDays(r.receivableDue, TODAY)
                      : `기한 ${r.receivableDue?.slice(5) ?? '–'}`
                  }
                />
              ) : (
                <span className="tl-block-crm-zero">–</span>
              ),
          },
          {
            key: 'state',
            header: '상태',
            width: 'sm',
            render: (r) => (
              <Badge tone={CUSTOMER_STATES[r.state].tone}>{CUSTOMER_STATES[r.state].label}</Badge>
            ),
          },
        ]}
      />

      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open?.name ?? ''}
        description={open ? `${open.code} · ${open.industry} · ${open.region}` : ''}
        width="lg"
        actions={
          open && (
            <>
              <Badge tone={GRADES[open.grade].tone} variant="outline" dot={false}>
                {GRADES[open.grade].label}
              </Badge>
              <Badge tone={CUSTOMER_STATES[open.state].tone}>
                {CUSTOMER_STATES[open.state].label}
              </Badge>
            </>
          )
        }
        footer={
          open && (
            <>
              {screens.has('crm/support/tickets') && (
                <Button icon="headset" onPress={() => go('crm/support/tickets')}>
                  상담 보기
                </Button>
              )}
              {open.receivable > 0 && screens.has(LEDGER) && (
                <Button icon="wallet" onPress={() => go(LEDGER)}>
                  거래처 원장
                </Button>
              )}
              {screens.has('crm/quotes/editor') && (
                <Button variant="primary" icon="receipt" onPress={() => go('crm/quotes/editor')}>
                  견적서 작성
                </Button>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            {open.note && <Banner tone="warning">{open.note}</Banner>}
            <div className="tl-block-crm-figures">
              <Figure label={`${YEAR} 누적 매출`} value={formatAmount(open.ytd)} unit="원" />
              <Figure
                label="미수금"
                value={formatAmount(open.receivable)}
                unit="원"
                {...(open.receivableDue && open.receivableDue < TODAY
                  ? { tone: 'danger' as const }
                  : {})}
              />
              <Figure
                label="여신 사용"
                value={
                  open.creditLimit ? formatPercent((open.receivable / open.creditLimit) * 100) : '–'
                }
              />
            </div>
            <section className="tl-block-crm-section" aria-label="월 매출">
              <h3 className="tl-block-crm-section__title">
                월 매출 · {MONTH_LABELS[0]}~{MONTH_LABELS[10]} 마감 기준
              </h3>
              {open.ytd > 0 ? (
                <div className="tl-block-crm-spark">
                  <Sparkline
                    className="tl-block-crm-sparkline"
                    data={closedMonths}
                    area
                    width={560}
                    height={56}
                    ariaLabel={`${open.name} 월 매출. ${FIRST_MONTH} ${formatCompactWon(closedMonths[0] ?? 0)}원에서 ${LAST} ${formatCompactWon(closedMonths[closedMonths.length - 1] ?? 0)}원`}
                  />
                  <span className="tl-block-crm-spark__legend">
                    <span>
                      {FIRST_MONTH} {formatCompactWon(closedMonths[0] ?? 0)}원 · 최대{' '}
                      {formatCompactWon(Math.max(...closedMonths))}원 · {LAST}{' '}
                      {formatCompactWon(closedMonths[closedMonths.length - 1] ?? 0)}원
                    </span>
                    <span>
                      {CUR} 1~{Number(TODAY.slice(8, 10))}일 {formatCompactWon(open.nov)}원
                    </span>
                  </span>
                </div>
              ) : (
                <EmptyState
                  size="sm"
                  icon="chart-line"
                  title="거래 이력이 없습니다"
                  description="첫 수주를 받으면 월 매출이 여기에 쌓입니다"
                />
              )}
            </section>
            <DescriptionList
              columns={2}
              items={[
                {
                  label: '사업자등록번호',
                  value: formatBizNo(open.bizNo),
                  copyable: true,
                  copyText: open.bizNo,
                },
                { label: '담당 영업', value: staffLabel(open.owner) },
                { label: '결제 조건', value: open.terms },
                {
                  label: '여신 한도',
                  value: open.creditLimit ? `${formatAmount(open.creditLimit)}원` : '–',
                },
                {
                  label: '최근 거래일',
                  value: open.lastDealAt ? formatDate(open.lastDealAt) : '–',
                },
                {
                  label: '미수 기한',
                  value: open.receivableDue
                    ? `${open.receivableDue} · ${formatDueDays(open.receivableDue, TODAY)}`
                    : '–',
                },
              ]}
            />
            <section className="tl-block-crm-section" aria-label="연락처">
              <h3 className="tl-block-crm-section__title">연락처 {open.contacts.length}명</h3>
              <ul className="tl-block-crm-contacts">
                {open.contacts.map((p) => (
                  <li key={p.email} className="tl-block-crm-contacts__row">
                    <Avatar name={p.name} size={32} decorative />
                    <Lines
                      primary={
                        <>
                          {p.name} {p.title}
                          {p.primary && (
                            <Badge size="sm" tone="info" dot={false}>
                              주 담당
                            </Badge>
                          )}
                        </>
                      }
                      secondary={p.role}
                    />
                    <span className="tl-block-crm-contacts__reach">
                      <Lines
                        primary={<span className="tl-block-code">{p.phone}</span>}
                        secondary={p.email}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="tl-block-crm-section" aria-label="최근 활동">
              <h3 className="tl-block-crm-section__title">최근 활동</h3>
              <Timeline
                ariaLabel="최근 활동"
                items={open.activities.map((a) => ({
                  id: a.id,
                  title: `${a.kind} · ${a.title}`,
                  time: a.at,
                  actor: a.by,
                  ...(a.description ? { description: a.description } : {}),
                  tone: ACTIVITY_META[a.kind].tone,
                  icon: ACTIVITY_META[a.kind].icon,
                }))}
              />
            </section>
          </div>
        )}
      </Drawer>
    </Page>
  );
}
