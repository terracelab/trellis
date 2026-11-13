// 주문 목록(ListDetail): 주문 단계 탭 · 기간 · 채널 · 검색 → 선택 주문 확인 · 송장 등록 · 발송 처리
import {
  formatAmount,
  formatPeriod,
  ORDER_STAGES,
  type OrderStage,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Banner,
  Button,
  DataGrid,
  DataGridLines,
  Dialog,
  DialogClose,
  Field,
  FilterBar,
  Input,
  MultiSelect,
  PageHeader,
  PeriodPicker,
  Select,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  CARRIERS,
  CHANNELS,
  channelById,
  maskPhone,
  ORDERS,
  orderItemLabel,
  orderTotal,
  productById,
  skuOf,
  type Order,
} from '../../../_data/commerce.js';
import { NOW_AT, PROFILE } from '../../../_data/profile.js';
import { TODAY } from '../../../_data/trade.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import { ExportButton, Lines, monthStart, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

type Row = Order & { total: number; qty: number };
/** 엑셀 다운로드 열(표와 같은 내용, 연락처는 화면처럼 가린 채로) */
const CSV: CsvColumn<Row>[] = [
  { label: '주문번호', value: 'id' },
  { label: '주문 일시', value: 'orderedAt' },
  { label: '결제 수단', value: 'payMethod' },
  { label: '채널', value: (r) => channelById(r.channelId).name },
  { label: '채널 주문번호', value: (r) => r.channelOrderNo ?? '' },
  { label: '주문자', value: 'buyer' },
  { label: '받는 분', value: 'receiver' },
  { label: '연락처', value: (r) => maskPhone(r.phone) },
  {
    label: '상품',
    value: (r) =>
      `${productById(r.lines[0]!.productId).name}${r.lines.length > 1 ? ` 외 ${r.lines.length - 1}건` : ''}`,
  },
  { label: '수량(개)', value: 'qty' },
  { label: '결제 금액(원)', value: 'total' },
  { label: '단계', value: (r) => ORDER_STAGES[r.stage].label },
  { label: '택배사', value: (r) => r.carrier ?? '' },
  { label: '송장번호', value: (r) => r.trackingNo ?? '' },
];
const toRow = (o: Order): Row => ({
  ...o,
  total: orderTotal(o),
  qty: o.lines.reduce((a, l) => a + l.qty, 0),
});
const STAGES = Object.keys(ORDER_STAGES) as OrderStage[];
/** 기본 기간: 이번 달 1일부터 오늘까지 */
const DEFAULT_PERIOD = { from: monthStart(TODAY), to: TODAY };
/** 결제일(결제 전이면 주문일) */
const paidDay = (o: Order) => (o.paidAt ?? o.orderedAt).slice(0, 10);

export default function OrderList() {
  const toast = useToast();
  const canShip = useCan('orders', 'update');
  const screens = useScreens();
  const [rows, setRows] = useState<Row[]>(() => ORDERS.map(toRow));
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [channels, setChannels] = useState<string[]>([]);
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [selected, setSelected] = useState<string[]>([]);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);
  const [carrier, setCarrier] = useState<string | null>(CARRIERS[0]);
  const [numbers, setNumbers] = useState<Record<string, string>>({});

  const inPeriod = rows.filter(
    (r) =>
      r.orderedAt.slice(0, 10) >= period.from &&
      r.orderedAt.slice(0, 10) <= period.to &&
      (channels.length === 0 || channels.includes(r.channelId)),
  );
  const shown = useMemo(
    () =>
      inPeriod.filter(
        (r) =>
          (tab === 'all' || r.stage === tab) &&
          (!q || `${r.id}${r.channelOrderNo}${r.buyer}${r.receiver}`.includes(q)),
      ),
    [inPeriod, tab, q],
  );
  const count = (s: OrderStage) => inPeriod.filter((r) => r.stage === s).length;
  const picked = rows.filter((r) => selected.includes(r.id));
  const confirmable = picked.filter((r) => r.stage === 'paid');
  const invoiceable = picked.filter((r) => r.stage === 'paid' || r.stage === 'preparing');
  const shippable = picked.filter((r) => r.stage === 'preparing' && r.trackingNo);
  // 어제까지 결제했는데 아직 보내지 않은 주문(판매 채널 발송 기한이 오늘)
  const late = rows.filter(
    (r) => (r.stage === 'paid' || r.stage === 'preparing') && paidDay(r) < TODAY,
  );

  const update = (ids: string[], patch: (r: Row) => Partial<Row>) =>
    setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, ...patch(r) } : r)));

  const confirmOrders = () => {
    update(
      confirmable.map((r) => r.id),
      () => ({ stage: 'preparing' }),
    );
    toast.show({
      title: `주문 ${confirmable.length}건을 확인했습니다`,
      description: '상품 준비로 옮기고 판매 채널에 주문 확인을 보냈습니다',
      tone: 'success',
    });
    setSelected([]);
  };
  const saveInvoices = () => {
    const ids = invoiceable.filter((r) => numbers[r.id]?.trim()).map((r) => r.id);
    if (ids.length === 0) {
      toast.show({ title: '송장 번호를 입력하세요', tone: 'warning' });
      return;
    }
    update(ids, (r) => ({
      stage: r.stage === 'paid' ? 'preparing' : r.stage,
      carrier: carrier ?? CARRIERS[0],
      trackingNo: numbers[r.id]!.trim(),
    }));
    setNumbers({});
    toast.show({
      title: `송장 ${ids.length}건을 등록했습니다`,
      description: `${carrier} · 발송 처리하면 구매자에게 배송 시작 알림을 보냅니다`,
      tone: 'success',
    });
  };
  const ship = () => {
    update(
      shippable.map((r) => r.id),
      () => ({ stage: 'shipping', shippedAt: NOW_AT }),
    );
    toast.show({
      title: `주문 ${shippable.length}건을 발송 처리했습니다`,
      description: '판매 채널에 송장 번호를 보내고 구매자에게 배송 시작 알림톡을 보냈습니다',
      tone: 'success',
    });
    setSelected([]);
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '이커머스' }, { label: '주문' }]}
          title="주문"
          description={`${formatPeriod(period.from, period.to)} · ${inPeriod.length}건 · 발송 전 ${inPeriod.filter((r) => r.stage === 'paid' || r.stage === 'preparing').length}건`}
          actions={
            <>
              <ExportButton module="orders" name="주문" rows={shown} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              <Button icon="upload" disabled={!canShip}>
                송장 일괄 업로드
              </Button>
            </>
          }
          tabs={
            <Tabs
              label="주문 단계"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: '전체', count: inPeriod.length },
                ...STAGES.map((s) => ({
                  value: s,
                  label: ORDER_STAGES[s].label,
                  count: count(s),
                })),
              ]}
            />
          }
        />
      }
    >
      {late.length > 0 && (
        <Banner
          tone="warning"
          title={`어제까지 결제한 주문 중 발송 전 ${late.length}건`}
          action={
            <Button size="sm" onPress={() => setTab('preparing')}>
              상품 준비 보기
            </Button>
          }
        >
          오늘 {PROFILE.shipping.cutoff} {PROFILE.shipping.cutoffLabel} 전에 송장을 등록하세요. 판매
          채널의 발송 기한은 결제 다음 날 23:59입니다.
        </Banner>
      )}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="주문번호 · 주문자 · 받는 분"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
            label="주문 검색"
          />
        }
        onReset={() => {
          setQ('');
          setTab('all');
          setChannels([]);
          setPeriod(DEFAULT_PERIOD);
        }}
        resultCount={shown.length}
        activeCount={
          (channels.length > 0 ? 1 : 0) +
          (period.from !== DEFAULT_PERIOD.from || period.to !== DEFAULT_PERIOD.to ? 1 : 0)
        }
      >
        <PeriodPicker
          label="주문일"
          value={period}
          onChange={setPeriod}
          today={TODAY}
          size="sm"
          presets={['today', 'thisWeek', 'thisMonth', 'lastMonth']}
        />
        <MultiSelect
          size="sm"
          width="auto"
          label="판매 채널"
          placeholder="전체 채널"
          value={channels}
          onChange={setChannels}
          options={CHANNELS.map((c) => ({ value: c.id, label: c.name }))}
        />
      </FilterBar>
      <DataGrid
        caption="주문"
        height="fill"
        rows={shown}
        rowKey="id"
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        {...(screens.has('commerce/orders/detail')
          ? { onRowPress: (r: Row) => screens.go('commerce/orders/detail', { id: r.id }) }
          : {})}
        summary
        defaultSort={{ key: 'orderedAt', direction: 'desc' }}
        rowTone={(r) => (late.some((l) => l.id === r.id) ? 'warning' : undefined)}
        empty="이 조건의 주문이 없습니다. 기간이나 채널을 바꿔 보세요"
        columns={[
          {
            key: 'orderedAt',
            header: '주문번호',
            width: 'lg',
            sticky: true,
            sortable: true,
            render: (r) => (
              <DataGridLines
                primary={<span className="tl-block-code">{r.id}</span>}
                secondary={
                  <>
                    {r.orderedAt.slice(5)} · {r.payMethod}
                  </>
                }
              />
            ),
          },
          {
            key: 'channelId',
            header: '채널',
            width: 'lg',
            render: (r) => (
              <DataGridLines
                primary={channelById(r.channelId).name}
                secondary={
                  <span className="tl-block-code">
                    {r.channelId === 'own'
                      ? `${channelById(r.channelId).name} 주문`
                      : r.channelOrderNo}
                  </span>
                }
              />
            ),
          },
          {
            key: 'buyer',
            header: '주문자',
            width: 'sm',
            sortable: true,
            render: (r) => (
              <DataGridLines
                primary={r.buyer}
                secondary={r.receiver === r.buyer ? maskPhone(r.phone) : `받는 분 ${r.receiver}`}
              />
            ),
          },
          {
            key: 'item',
            header: '상품',
            width: 'xl',
            render: (r) => (
              <DataGridLines
                primary={
                  <>
                    {productById(r.lines[0]!.productId).name}
                    {r.lines.length > 1 ? ` 외 ${r.lines.length - 1}건` : ''}
                  </>
                }
                secondary={
                  <>
                    {skuOf(r.lines[0]!).option} · 수량 {r.qty}개
                  </>
                }
              />
            ),
          },
          {
            key: 'total',
            header: '결제 금액',
            width: 'sm',
            format: 'amount',
            unit: '원',
            total: 'sum',
            sortable: true,
          },
          {
            key: 'stage',
            header: '단계',
            width: 'sm',
            render: (r) => (
              <Badge tone={ORDER_STAGES[r.stage].tone}>{ORDER_STAGES[r.stage].label}</Badge>
            ),
          },
          {
            key: 'trackingNo',
            header: '송장',
            width: 'md',
            render: (r) =>
              r.trackingNo ? (
                <DataGridLines
                  primary={<span className="tl-block-code">{r.trackingNo}</span>}
                  secondary={r.carrier}
                />
              ) : r.stage === 'paid' || r.stage === 'preparing' ? (
                <span className="tl-block-cm-pending">미등록</span>
              ) : (
                '–'
              ),
          },
        ]}
      />
      {selected.length > 0 && (
        <ActionBar
          summary={`${selected.length}건 선택 · 결제 금액 ${formatAmount(picked.reduce((a, r) => a + r.total, 0))}원`}
        >
          <Button onPress={() => setSelected([])}>선택 해제</Button>
          <Button
            icon="check"
            disabled={!canShip || confirmable.length === 0}
            onPress={confirmOrders}
          >
            주문 확인 {confirmable.length}건
          </Button>
          <Button
            icon="receipt"
            disabled={!canShip || invoiceable.length === 0}
            onPress={() => setInvoiceOpen(true)}
          >
            송장 등록 {invoiceable.length}건
          </Button>
          <Button
            variant="primary"
            icon="truck"
            disabled={!canShip || shippable.length === 0}
            onPress={() => setShipOpen(true)}
          >
            발송 처리 {shippable.length}건
          </Button>
        </ActionBar>
      )}
      <Dialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        size="lg"
        title={`송장 ${invoiceable.length}건을 등록합니다`}
        description="택배사를 고르고 주문마다 송장 번호를 입력합니다. 결제 완료 주문은 상품 준비로 옮깁니다."
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button variant="primary" onPress={saveInvoices}>
                  송장 등록
                </Button>
              }
            />
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <div className="tl-block-cm-invoice-tools">
            <Field label="택배사" required>
              <Select
                value={carrier}
                onChange={setCarrier}
                options={CARRIERS.map((c) => ({ value: c, label: c }))}
              />
            </Field>
            <Button
              icon="refresh-cw"
              onPress={() =>
                setNumbers((n) =>
                  Object.fromEntries(
                    invoiceable.map((r, i) => [
                      r.id,
                      n[r.id] || r.trackingNo || String(640_218_894_100 + i * 7),
                    ]),
                  ),
                )
              }
            >
              송장 번호 발번
            </Button>
          </div>
          <div className="tl-block-cm-invoice-rows" role="list" aria-label="송장 번호 입력">
            {invoiceable.map((r) => (
              <div key={r.id} className="tl-block-cm-invoice-row" role="listitem">
                <Lines
                  primary={<span className="tl-block-code">{r.id}</span>}
                  secondary={
                    <>
                      {r.receiver} · {orderItemLabel(r)}
                    </>
                  }
                />
                <Input
                  size="sm"
                  inputMode="numeric"
                  label={`${r.id} 송장 번호`}
                  placeholder="640218893017"
                  value={numbers[r.id] ?? r.trackingNo ?? ''}
                  onChange={(v) => setNumbers((n) => ({ ...n, [r.id]: v }))}
                />
              </div>
            ))}
          </div>
        </div>
      </Dialog>
      <Dialog
        open={shipOpen}
        onOpenChange={setShipOpen}
        title={`주문 ${shippable.length}건을 발송 처리합니다`}
        description="판매 채널에 송장 번호를 보내고 구매자에게 배송 시작 알림톡을 보냅니다. 발송 처리 뒤에는 주문 취소 대신 반품으로 받습니다."
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button variant="primary" onPress={ship}>
                  발송 처리
                </Button>
              }
            />
          </>
        }
      />
    </Page>
  );
}
