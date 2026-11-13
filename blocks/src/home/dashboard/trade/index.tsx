// 무역 회사 대시보드(NotificationHome): 할 일이 숫자로 먼저, 그다음 추이 · 목록
import {
  formatAmount,
  formatCompactWon,
  formatDate,
  formatPercent,
  formatQuantity,
  RECEIVING_STATES,
  SHIPMENT_STATES,
  type DashboardLayout,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  BulletBar,
  Button,
  Card,
  ChartCard,
  ComboChart,
  DashboardGrid,
  DataGrid,
  DueBadge,
  IconButton,
  KpiCard,
  NotificationCard,
  PageHeader,
  Sparkline,
  type DashboardWidgetWeb,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  INVENTORY_VALUE,
  itemById,
  LOW_STOCK,
  MONTH_TO_DATE,
  MONTHLY,
  partyById,
  PURCHASE_ORDERS,
  RATES,
  RECEIPTS,
  RECEIVABLES,
  SHIPMENTS,
  stockOf,
  sum,
  TODAY,
  USD_SERIES,
  warehouseById,
} from '../../../_data/index.js';
import { JOBS, useOpenLink, usePlatform, useScreens } from '../../../_platform/index.js';
import { Lines, Page, Stack } from '../../../_ui/index.js';
import './style.css';

// 이번 달은 아직 끝나지 않았다. KPI · 추이는 마감한 달(전월)을 보이고, 이번 달은 누계로 따로 보인다
const THIS_MONTH = TODAY.slice(0, 7);
const CLOSED = MONTHLY.filter((m) => m.month < THIS_MONTH);
const now = CLOSED[CLOSED.length - 1] ?? MONTHLY[MONTHLY.length - 1]!;
const prev = CLOSED[CLOSED.length - 2] ?? now;
const pct = (a: number, b: number) => Math.round(((a - b) / b) * 1000) / 10;
/** 이번 달 누계(데이터) */
const mtd = (kind: 'sales' | 'purchase') => MONTH_TO_DATE[kind];
const MTD_LABEL = `${Number(TODAY.slice(5, 7))}월 ${Number(TODAY.slice(8, 10))}일까지 누계`;
/** 배치 작업의 시각(플랫폼 JOBS): 환율 갱신 · 재고 마감 */
const jobTime = (id: string, fallback: string) =>
  JOBS.find((j) => j.id === id)
    ?.scheduleLabel.split(' ')
    .at(-1) ?? fallback;

// slot: layout — 처음 배치(빈 배열 = 위젯 순서 그대로). 앱은 onLayoutChange 값을 사용자 설정(API)에 저장하고 다음 방문에 layout으로 넘긴다
const DEFAULT_LAYOUT: DashboardLayout = [];
// slot: layout end

export default function TradeDashboard() {
  const { session, notifications } = usePlatform();
  // 배치 편집(순서 · 숨김). 편집 모드가 아니면 위젯 순서대로 고정 배치와 같은 모양이다
  const [editing, setEditing] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const screens = useScreens();
  const openLink = useOpenLink();
  const go = screens.go;
  /** 화면이 있을 때만 누를 수 있다 */
  const pressTo = (id: string) => (screens.has(id) ? { onPress: () => go(id) } : {});
  const todo = notifications.filter((n) => !n.read).slice(0, 4);
  const incoming = RECEIPTS.filter((r) => r.state !== 'received' && r.state !== 'rejected');
  const openPos = PURCHASE_ORDERS.filter((p) => p.state === 'ordered' || p.state === 'partial');
  const receivable = sum(RECEIVABLES, (r) => r.balance);
  const overdue = sum(
    RECEIVABLES.filter((r) => r.dueDate < TODAY),
    (r) => r.balance,
  );
  const widgets: DashboardWidgetWeb[] = [
    // slot: kpis — 위 숫자 넷(무엇을 세는지 · 누르면 여는 화면)
    {
      id: 'sales',
      title: `${now.label} 매출`,
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label={`${now.label} 매출`}
          value={now.sales}
          format="amount"
          unit="원"
          delta={{
            value: pct(now.sales, prev.sales),
            label: '전월 대비',
            format: 'percent',
            polarity: 'finance',
          }}
          caption={`${MTD_LABEL} ${formatCompactWon(mtd('sales'))}원`}
          {...pressTo('erp/tax/invoice-list')}
        />
      ),
    },
    {
      id: 'purchase',
      title: `${now.label} 매입`,
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label={`${now.label} 매입`}
          value={now.purchase}
          format="amount"
          unit="원"
          delta={{
            value: pct(now.purchase, prev.purchase),
            label: '전월 대비',
            format: 'percent',
            polarity: 'finance',
          }}
          caption={`${MTD_LABEL} ${formatCompactWon(mtd('purchase'))}원`}
          {...pressTo('erp/purchasing/po-list')}
        />
      ),
    },
    {
      id: 'receivable',
      title: '미수금',
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label="미수금"
          value={receivable}
          format="amount"
          unit="원"
          caption={`기한 경과 ${formatAmount(overdue)}원`}
          {...pressTo('erp/accounting/vendor-ledger')}
        />
      ),
    },
    {
      id: 'inventory',
      title: '재고 평가액',
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label="재고 평가액"
          value={INVENTORY_VALUE}
          format="amount"
          unit="원"
          caption={`안전재고 미만 ${LOW_STOCK.length}품목`}
          {...pressTo('scm/inventory/stock')}
        />
      ),
    },
    // slot: kpis end
    // slot: todo — 오늘 처리할 일(읽지 않은 알림 4건)
    {
      id: 'todo',
      title: '오늘 처리할 일',
      span: 4,
      content: (
        <Card
          title="오늘 처리할 일"
          subtitle={`읽지 않은 알림 ${notifications.filter((n) => !n.read).length}건`}
          padding="none"
        >
          <div className="tl-block-todo">
            {todo.map((n) => (
              <NotificationCard
                key={n.id}
                module={n.module}
                title={n.title}
                description={n.body}
                count={n.count}
                time={n.createdAt.slice(11)}
                tone={n.tone}
                unread={!n.read}
                // 알림 link = 블록 id(?k=v). 앱에 없는 화면이면 누를 수 없는 카드
                onPress={openLink(n.link)}
              />
            ))}
          </div>
        </Card>
      ),
    },
    // slot: todo end
    // slot: widgets — 아래 카드들(추이 · 입고 · 발주 · 자금 · 마감)
    {
      id: 'trend',
      title: '매출 · 매입 추이',
      span: 8,
      content: (
        <ChartCard
          title="매출 · 매입 추이"
          subtitle={`원 · 마감한 ${CLOSED.length}개월 · 아래는 매출 총이익률(%)`}
          legend={[
            { label: '매출', color: 'series-1' },
            { label: '매입', color: 'compare' },
          ]}
          height={300}
          table={{
            columns: ['월', '매출(원)', '매입(원)', '이익률(%)'],
            rows: CLOSED.map((m) => [m.label, m.sales, m.purchase, m.margin]),
          }}
        >
          <ComboChart
            data={CLOSED}
            x="label"
            bars={[
              { key: 'sales', label: '매출', color: 'series-1' },
              { key: 'purchase', label: '매입', color: 'compare' },
            ]}
            unit="원"
            yFormat={formatCompactWon}
            height={210}
            lower={{
              series: [{ key: 'margin', label: '이익률', type: 'line', color: 'compare' }],
              unit: '%',
              height: 72,
              yFormat: (v) => formatPercent(v, 0),
            }}
            ariaLabel={`마감한 ${CLOSED.length}개월 매출 · 매입. ${now.label} 매출 ${formatCompactWon(now.sales)}원, 매입 ${formatCompactWon(now.purchase)}원`}
          />
        </ChartCard>
      ),
    },
    {
      id: 'receiving',
      title: '입고 예정 · 도착',
      span: 5,
      content: (
        <Card
          title="입고 예정 · 도착"
          subtitle={`${incoming.length}건 · 창고 ${new Set(incoming.map((r) => r.warehouseId)).size}곳`}
          padding="none"
          action={
            screens.has('scm/warehouse/receiving') && (
              <Button
                size="sm"
                variant="ghost"
                iconEnd="chevron-right"
                onPress={() => go('scm/warehouse/receiving')}
              >
                입고 처리
              </Button>
            )
          }
        >
          <DataGrid
            caption="입고 예정 · 도착"
            rows={incoming}
            rowKey="id"
            {...(screens.has('scm/warehouse/receiving')
              ? { onRowPress: () => go('scm/warehouse/receiving') }
              : {})}
            rowTone={(r) => (r.state === 'inspecting' ? 'warning' : undefined)}
            className="tl-block-flat-grid"
            columns={[
              { key: 'party', header: '거래처', render: (r) => partyById(r.partyId).name },
              {
                key: 'wh',
                header: '창고',
                width: 'md',
                render: (r) => warehouseById(r.warehouseId).name,
              },
              {
                key: 'expectedAt',
                header: '예정',
                width: 'sm',
                render: (r) => r.expectedAt.slice(5, 10).replace('-', '.'),
              },
              {
                key: 'state',
                header: '상태',
                width: 'sm',
                render: (r) => (
                  <Badge tone={RECEIVING_STATES[r.state].tone}>
                    {RECEIVING_STATES[r.state].label}
                  </Badge>
                ),
              },
            ]}
          />
        </Card>
      ),
    },
    {
      id: 'shipments',
      title: '선적 · 통관',
      span: 4,
      content: (
        <Card
          title="선적 · 통관"
          subtitle="수입 화물 · 도착 예정일 기준"
          action={
            screens.has('scm/trade/shipments') && (
              <Button
                size="sm"
                variant="ghost"
                iconEnd="chevron-right"
                onPress={() => go('scm/trade/shipments')}
              >
                전체
              </Button>
            )
          }
        >
          <ul className="tl-block-list">
            {SHIPMENTS.filter((s) => s.state !== 'cleared').map((s) => (
              <li key={s.id} className="tl-block-list__row">
                <Lines
                  primary={partyById(PURCHASE_ORDERS.find((p) => p.id === s.poId)!.partyId).name}
                  secondary={
                    <>
                      {s.pol} → {s.pod} · {s.vessel}
                    </>
                  }
                />
                <Stack gap="sm">
                  <Badge tone={SHIPMENT_STATES[s.state].tone}>
                    {SHIPMENT_STATES[s.state].label}
                  </Badge>
                </Stack>
                <DueBadge
                  due={s.eta}
                  today={TODAY}
                  doneLabel="도착"
                  done={s.state === 'arrived' || s.state === 'customs'}
                />
              </li>
            ))}
          </ul>
        </Card>
      ),
    },
    {
      id: 'fx',
      title: '환율',
      span: 3,
      content: (
        <Card title="환율" subtitle={`매매기준율 · ${jobTime('job-fx', '09:00')} 갱신`}>
          <Stack>
            <Sparkline
              data={USD_SERIES.map((d) => d.rate)}
              area
              height={40}
              ariaLabel={`USD 30일 환율. ${USD_SERIES[0]!.rate}원에서 ${USD_SERIES[USD_SERIES.length - 1]!.rate}원`}
            />
            <ul className="tl-block-list">
              {RATES.map((r) => (
                <li key={r.code} className="tl-block-list__row tl-block-rate">
                  <span className="tl-block-rate__code">{r.code}</span>
                  <span className="tl-block-rate__value">
                    {formatAmount(r.rate, { digits: 2 })}
                  </span>
                  <span className="tl-block-rate__change" data-dir={r.change > 0 ? 'up' : 'down'}>
                    {formatAmount(r.change, { digits: 2, sign: 'always' })}
                  </span>
                </li>
              ))}
            </ul>
          </Stack>
        </Card>
      ),
    },
    {
      id: 'lowstock',
      title: '안전재고 미만',
      span: 6,
      content: (
        <Card
          title="안전재고 미만"
          subtitle={`${LOW_STOCK.length}품목 · 재고 마감 ${jobTime('job-stock-close', '23:30')} 기준`}
          action={
            screens.has('scm/inventory/stock') && (
              <Button
                size="sm"
                variant="ghost"
                iconEnd="chevron-right"
                onPress={() => go('scm/inventory/stock')}
              >
                재고
              </Button>
            )
          }
        >
          <Stack>
            {LOW_STOCK.map((i) => (
              <BulletBar
                key={i.id}
                label={`${i.name} · ${i.spec}`}
                value={stockOf(i.id)}
                target={i.safetyStock}
                unit={i.unit}
                caption={`안전재고 ${formatQuantity(i.safetyStock, i.unit)}`}
                size="sm"
                warnAt={0.8}
              />
            ))}
          </Stack>
        </Card>
      ),
    },
    {
      id: 'po',
      title: '발주 진행',
      span: 6,
      content: (
        <Card
          title="발주 진행"
          subtitle={`진행 중 ${openPos.length}건 · 입고 수량 기준`}
          action={
            screens.has('erp/purchasing/po-list') && (
              <Button
                size="sm"
                variant="ghost"
                iconEnd="chevron-right"
                onPress={() => go('erp/purchasing/po-list')}
              >
                발주
              </Button>
            )
          }
        >
          <Stack>
            {openPos.map((p) => {
              const ordered = sum(p.lines, (l) => l.qty);
              const received = sum(p.lines, (l) => l.received);
              return (
                <BulletBar
                  key={p.id}
                  label={`${p.id} · ${partyById(p.partyId).name}`}
                  value={Math.round((received / ordered) * 100)}
                  target={100}
                  unit="%"
                  caption={`납기 ${p.dueDate.slice(5).replace('-', '.')} · ${itemById(p.lines[0]!.itemId).name}${p.lines.length > 1 ? ` 외 ${p.lines.length - 1}` : ''}`}
                  size="sm"
                  showState={false}
                />
              );
            })}
          </Stack>
        </Card>
      ),
    },
    // slot: widgets end
  ];
  return (
    <Page
      header={
        <PageHeader
          title={formatDate(TODAY, 'mdw')}
          description={`${session.company.name} · ${session.user.department} ${session.user.name} ${session.user.title}`}
          actions={
            editing ? (
              <>
                <Button icon="rotate-ccw" onPress={() => setLayout(DEFAULT_LAYOUT)}>
                  기본 배치
                </Button>
                <Button variant="primary" icon="check" onPress={() => setEditing(false)}>
                  완료
                </Button>
              </>
            ) : (
              <>
                {/* 바에 단추가 셋이라 휴대폰에서 줄이 늘지 않게 아이콘 단추(이름은 툴팁 · 스크린리더) */}
                <IconButton icon="layout-grid" label="배치 편집" onPress={() => setEditing(true)} />
                {screens.has('erp/purchasing/po-form') && (
                  <Button icon="file-plus" onPress={() => go('erp/purchasing/po-form')}>
                    발주서 작성
                  </Button>
                )}
                {screens.has('erp/tax/invoice-issue') && (
                  <Button
                    variant="primary"
                    icon="receipt"
                    onPress={() => go('erp/tax/invoice-issue')}
                  >
                    세금계산서 발행
                  </Button>
                )}
              </>
            )
          }
        />
      }
    >
      <DashboardGrid
        label={formatDate(TODAY, 'mdw')}
        widgets={widgets}
        layout={layout}
        onLayoutChange={setLayout}
        editing={editing}
      />
    </Page>
  );
}
