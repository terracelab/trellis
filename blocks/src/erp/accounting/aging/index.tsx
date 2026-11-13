// 채권 연령(Dashboard): 거래처 × 연령 구간(미도래 · 1~30일 · 31~60일 · 61~90일 · 90일 초과) 표와 합계,
// 구간 구성 · 오래된 문서. 거래처를 누르면 미결 문서 → 거래처 원장
import {
  formatAmount,
  formatCompactWon,
  formatDate,
  formatPercent,
} from '@terracelab/trellis-contracts';
import {
  Button,
  Card,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  KpiCard,
  PageHeader,
  SegmentedBar,
  Tabs,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  AGING_BUCKETS,
  agingBucketOf,
  agingRows,
  daysPastDue,
  OPEN_ITEMS,
  type AgingBucket,
  type AgingRow,
  type OpenItem,
} from '../../../_data/closing.js';
import { partyById, sum, TODAY } from '../../../_data/index.js';
import { useScreenParams, useScreens } from '../../../_platform/index.js';
import { Col, ExportButton, Grid, Lines, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

type Side = OpenItem['side'];
type Row = AgingRow & { name: string; terms: string };

// slot: sides — 탭(미수금 · 미지급금). 라벨과 KPI 문구가 따라 바뀐다
const SIDES: Record<Side, { label: string; due: string; over90: string }> = {
  receivable: { label: '미수금', due: '회수', over90: '대손 검토 대상' },
  payable: { label: '미지급금', due: '지급', over90: '지급 지연 확인' },
};
// slot: sides end

// slot: buckets — 구간 색(SegmentedBar 슬롯). 오래될수록 경고 · 위험 색
const BUCKET_COLORS: Record<
  AgingBucket,
  'series-1' | 'series-2' | 'series-4' | 'warning' | 'danger'
> = {
  current: 'series-1',
  d30: 'series-2',
  d60: 'series-4',
  d90: 'warning',
  over: 'danger',
};
// slot: buckets end

/** 금액 칸: 0은 '–'(빈 구간이 숫자 사이에서 바로 보이게) */
const dash = (v: number) => (v ? formatAmount(v) : '–');

/** 오래된 문서 목록에 보이는 수 */
const OLDEST = 5;

const CSV: CsvColumn<Row>[] = [
  { label: '거래처', value: 'name' },
  ...AGING_BUCKETS.map((b) => ({ label: `${b.label}(원)`, value: b.key })),
  { label: '기한 지남(원)', value: 'overdue' },
  { label: '합계(원)', value: 'total' },
];

export default function Aging() {
  const screens = useScreens();
  const params = useScreenParams();
  const [side, setSide] = useState<Side>(params.tab === 'payable' ? 'payable' : 'receivable');
  const [openId, setOpenId] = useState<string | null>(params.id ?? null);
  const rows = useMemo<Row[]>(
    () =>
      agingRows(side, TODAY).map((r) => {
        const p = partyById(r.partyId);
        return { ...r, name: p.name, terms: p.terms };
      }),
    [side],
  );
  const items = OPEN_ITEMS.filter((o) => o.side === side);
  const total = sum(rows, (r) => r.total);
  const overdue = sum(rows, (r) => r.overdue);
  const over90 = sum(rows, (r) => r.over);
  const late = items.filter((o) => daysPastDue(o.due, TODAY) > 0);
  /** 기한 지난 금액의 평균 경과일(금액 가중) */
  const avgDays = overdue
    ? Math.round(sum(late, (o) => o.amount * daysPastDue(o.due, TODAY)) / overdue)
    : 0;
  const oldest = [...late]
    .sort((a, b) => daysPastDue(b.due, TODAY) - daysPastDue(a.due, TODAY))
    .slice(0, OLDEST);
  const open = rows.find((r) => r.partyId === openId) ?? null;
  const openItems = open
    ? items
        .filter((o) => o.partyId === open.partyId)
        .map((o) => ({ ...o, days: daysPastDue(o.due, TODAY), bucket: agingBucketOf(o.due) }))
    : [];
  const party = open ? partyById(open.partyId) : null;
  const words = SIDES[side];
  const bucketLabel = (k: AgingBucket) => AGING_BUCKETS.find((b) => b.key === k)!.label;

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '회계' }, { label: '채권 연령' }]}
          title="채권 연령"
          description={`${formatDate(TODAY)} 기준 · 기한이 지난 날 수로 나눕니다 · 단위 원`}
          actions={
            <ExportButton
              module="accounting"
              name={`${words.label} 연령`}
              rows={rows}
              columns={CSV}
            >
              엑셀 다운로드
            </ExportButton>
          }
          tabs={
            <Tabs
              label="미수금 · 미지급금"
              value={side}
              onChange={(v) => {
                setSide(v as Side);
                setOpenId(null);
              }}
              items={(Object.keys(SIDES) as Side[]).map((s) => ({
                value: s,
                label: SIDES[s].label,
              }))}
            />
          }
        />
      }
    >
      <Grid>
        <Col span={3}>
          <KpiCard
            label={`${words.label} 합계`}
            value={total}
            format="amount"
            unit="원"
            caption={`거래처 ${rows.length}곳 · 문서 ${items.length}건`}
            icon="wallet"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="기한 지남"
            value={overdue}
            format="amount"
            unit="원"
            caption={`${words.label}의 ${formatPercent(total ? (overdue / total) * 100 : 0)} · ${late.length}건`}
            icon="clock"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="90일 초과"
            value={over90}
            format="amount"
            unit="원"
            caption={over90 ? words.over90 : '없음'}
            icon="triangle-alert"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="평균 경과일"
            value={avgDays}
            format="number"
            unit="일"
            caption={`기한 지난 ${words.label}의 금액 가중 평균`}
            icon="calendar-days"
          />
        </Col>

        <Col span={12}>
          <Card
            title="거래처별 연령"
            subtitle={`거래처를 누르면 미결 문서와 ${words.due} 기한을 봅니다`}
            padding="none"
          >
            <DataGrid
              caption={`거래처별 ${words.label} 연령`}
              className="tl-block-flat-grid"
              rows={rows}
              rowKey="partyId"
              summary
              activeRowKey={openId}
              onRowPress={(r) => setOpenId(r.partyId)}
              dividers="all"
              columns={[
                {
                  key: 'name',
                  header: '거래처',
                  link: true,
                  hideable: false,
                  mobile: 'title',
                  render: (r) => <DataGridLines primary={r.name} secondary={r.terms} />,
                },
                ...AGING_BUCKETS.map((b) => ({
                  key: b.key,
                  header: b.label,
                  width: 'md' as const,
                  format: 'amount' as const,
                  total: 'sum' as const,
                  headerUnit: false as const,
                  mobile: b.key === 'over' ? ('meta' as const) : ('hidden' as const),
                  render: (r: Row) => dash(r[b.key]),
                })),
                {
                  key: 'overdue',
                  header: '기한 지남',
                  width: 'md',
                  format: 'amount',
                  total: 'sum',
                  headerUnit: false,
                  mobile: 'meta',
                  render: (r) => dash(r.overdue),
                },
                {
                  key: 'total',
                  header: '합계',
                  width: 'md',
                  format: 'amount',
                  total: 'sum',
                  headerUnit: false,
                  emphasis: true,
                  mobile: 'trailing',
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={5}>
          <Card title="구간 구성" subtitle={`${words.label} ${formatCompactWon(total)}원`}>
            <SegmentedBar
              unit="원"
              format={formatCompactWon}
              legend
              data={AGING_BUCKETS.map((b) => ({
                label: b.label,
                value: sum(rows, (r) => r[b.key]),
                color: BUCKET_COLORS[b.key],
              }))}
              ariaLabel={`${words.label} ${formatCompactWon(total)}원 중 미도래 ${formatCompactWon(sum(rows, (r) => r.current))}원, 기한 지남 ${formatCompactWon(overdue)}원`}
            />
          </Card>
        </Col>
        <Col span={7}>
          <Card
            title="오래된 문서"
            subtitle={
              late.length ? `기한 지난 ${late.length}건 중 오래된 순` : '기한 지난 문서가 없습니다'
            }
            padding="none"
          >
            <ul className="tl-block-aging-oldest">
              {oldest.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    className="tl-block-aging-oldest__row tl-focusable"
                    onClick={() => setOpenId(o.partyId)}
                  >
                    <Lines
                      primary={`${partyById(o.partyId).name} · ${o.description}`}
                      secondary={`${o.docNo} · 기한 ${formatDate(o.due)} · ${formatAmount(daysPastDue(o.due, TODAY))}일 지남`}
                    />
                    <Lines
                      align="end"
                      primary={`${formatAmount(o.amount)}원`}
                      secondary={bucketLabel(agingBucketOf(o.due))}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </Col>
      </Grid>

      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.name ?? ''}
        description={party ? `${party.code} · ${party.terms} · ${party.manager}` : ''}
        width="lg"
        footer={
          open &&
          screens.has('erp/accounting/vendor-ledger') && (
            <Button
              variant="primary"
              icon="file-text"
              onPress={() => screens.go('erp/accounting/vendor-ledger', { id: open.partyId })}
            >
              거래처 원장
            </Button>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            <DescriptionList
              columns={3}
              layout="vertical"
              items={[
                { label: `${words.label} 합계`, value: `${formatAmount(open.total)}원` },
                { label: '기한 지남', value: `${formatAmount(open.overdue)}원` },
                {
                  label: '신용 한도',
                  value: party?.creditLimit ? `${formatAmount(party.creditLimit)}원` : '–',
                },
              ]}
            />
            <DataGrid
              caption={`${open.name} 미결 문서`}
              rows={openItems}
              rowKey="id"
              summary
              columns={[
                {
                  key: 'docNo',
                  header: '문서 번호',
                  render: (o) => (
                    <DataGridLines
                      primary={<span className="tl-block-code">{o.docNo}</span>}
                      secondary={`${o.description} · 발행 ${formatDate(o.issued)}`}
                    />
                  ),
                },
                { key: 'due', header: '기한', width: 'sm', format: 'date' },
                {
                  key: 'days',
                  header: '경과',
                  width: 'xs',
                  align: 'right',
                  render: (o) =>
                    o.days > 0 ? `${formatAmount(o.days)}일` : bucketLabel('current'),
                },
                {
                  key: 'amount',
                  header: '잔액',
                  width: 'md',
                  format: 'amount',
                  total: 'sum',
                },
              ]}
            />
          </div>
        )}
      </Drawer>
    </Page>
  );
}
