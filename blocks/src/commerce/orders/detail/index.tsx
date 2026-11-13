// 주문 상세(OrderDetail): 주문 단계 · 상품 · 금액 요약(상품 금액 · 배송비 · 할인 · 결제 금액) ·
// 배송 · 결제 · 취소 · 반품 · 교환 탭 · 주문자 정보 → 송장 입력 · 발송 처리 · 주문 취소
import {
  formatAmount,
  formatPercent,
  ORDER_STAGES,
  type OrderStage,
} from '@terracelab/trellis-contracts';
import {
  AddressInput,
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Dialog,
  DialogClose,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Stepper,
  Tabs,
  Textarea,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import type { AddressValue } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import {
  CARRIERS,
  channelById,
  CLAIM_KINDS,
  CLAIM_STATES,
  CLAIMS,
  claimRefund,
  COUPONS,
  joinAddress,
  linePrice,
  maskPhone,
  orderById,
  orderGoods,
  ORDERS,
  orderShipping,
  orderTotal,
  PICKUP_STATES,
  productById,
  reasonOf,
  searchAddressBook,
  skuOf,
  splitAddress,
  type Order,
} from '../../../_data/commerce.js';
import { NOW_AT, PROFILE } from '../../../_data/profile.js';
import { TODAY, warehouseById } from '../../../_data/trade.js';
import { useCan, useScreenParams, useScreens } from '../../../_platform/index.js';
import { Col, Grid, Lines, Page, Stack } from '../../../_ui/index.js';
import './style.css';

const PATH: OrderStage[] = ['paid-pending', 'paid', 'preparing', 'shipping', 'delivered'];
/** 주소에 id가 없으면 보낼 차례인 첫 주문(상품 준비) */
const DEFAULT_ID = (ORDERS.find((o) => o.stage === 'preparing') ?? ORDERS[0]!).id;
const CANCELLABLE: OrderStage[] = ['paid-pending', 'paid', 'preparing'];

const stepTime = (o: Order, s: OrderStage) => {
  if (s === 'paid-pending') return o.orderedAt.slice(5);
  if (s === 'paid') return o.paidAt?.slice(5);
  if (s === 'preparing') return o.paidAt ? `${o.paidAt.slice(5, 10)} 주문 확인` : undefined;
  if (s === 'shipping') return o.shippedAt?.slice(5);
  if (s === 'delivered') return o.deliveredAt?.slice(5);
  return undefined;
};

/** 주소 ?id=<주문 번호>로 주문을 고른다. id가 바뀌면(알림 링크 · 뒤로) 화면을 새로 그린다 */
export default function OrderDetail() {
  const { id } = useScreenParams();
  const order = (id && orderById(id)) || orderById(DEFAULT_ID)!;
  return <OrderDetailView key={order.id} initial={order} />;
}

function OrderDetailView({ initial }: { initial: Order }) {
  const toast = useToast();
  const canUpdate = useCan('orders', 'update');
  const screens = useScreens();
  const [order, setOrder] = useState<Order>(initial);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [carrier, setCarrier] = useState<string | null>(order.carrier ?? CARRIERS[0]);
  const [trackingNo, setTrackingNo] = useState(order.trackingNo ?? '');
  const [shipNow, setShipNow] = useState(true);
  const [cancelReason, setCancelReason] = useState<string | null>('soldout');
  const [addressOpen, setAddressOpen] = useState(false);
  const [receiver, setReceiver] = useState(order.receiver);
  const [shipTo, setShipTo] = useState<AddressValue | null>(() => splitAddress(order.address));
  const [memo, setMemo] = useState(order.memo ?? '');
  const [tab, setTab] = useState(() =>
    CLAIMS.some((c) => c.orderId === order.id && c.state !== 'done') ? 'claims' : 'shipping',
  );

  const channel = channelById(order.channelId);
  const goods = orderGoods(order);
  const shipping = orderShipping(order);
  const total = orderTotal(order);
  const coupon = COUPONS.find((c) => c.id === order.couponId);
  const claims = CLAIMS.filter((c) => c.orderId === order.id);
  // 출고지: 첫 상품의 출고 창고(상품마다 정해 둔 창고)
  const warehouse = warehouseById(productById(order.lines[0]!.productId).warehouseId);
  const stage = ORDER_STAGES[order.stage];
  const offPath = !PATH.includes(order.stage);
  const reached = offPath
    ? order.deliveredAt
      ? PATH.length
      : order.paidAt
        ? 2
        : 1
    : PATH.indexOf(order.stage) + 1;
  const steps = [
    ...PATH.map((s, i) => ({
      id: s,
      label: ORDER_STAGES[s].label,
      description: stepTime(order, s),
      state:
        i < reached - 1 || (i === reached - 1 && (offPath || s === 'delivered'))
          ? ('done' as const)
          : i === reached - 1
            ? ('current' as const)
            : ('todo' as const),
    })),
    ...(offPath
      ? [
          {
            id: order.stage,
            label: stage.label,
            description: claims[0] ? `${claims[0].requestedAt.slice(5)} 요청` : undefined,
            state: order.stage === 'cancelled' ? ('error' as const) : ('current' as const),
          },
        ]
      : []),
  ];

  // 발송 전(결제 · 상품 준비)까지만 배송지를 바꾼다
  const canEditAddress = canUpdate && CANCELLABLE.includes(order.stage);
  const openAddress = () => {
    setReceiver(order.receiver);
    setShipTo(splitAddress(order.address));
    setMemo(order.memo ?? '');
    setAddressOpen(true);
  };
  const saveAddress = () => {
    if (!shipTo) return;
    setOrder((o) => ({
      ...o,
      receiver: receiver.trim(),
      address: joinAddress(shipTo),
      memo: memo.trim() || undefined,
    }));
    toast.show({
      title: '배송지를 수정했습니다',
      description: `${channel.name}에 바뀐 배송지를 보냈습니다`,
      tone: 'success',
    });
  };

  const saveInvoice = () => {
    const ship = shipNow && order.stage !== 'shipping';
    setOrder((o) => ({
      ...o,
      carrier: carrier ?? CARRIERS[0],
      trackingNo: trackingNo.trim(),
      stage: ship ? 'shipping' : o.stage === 'paid' ? 'preparing' : o.stage,
      shippedAt: ship ? NOW_AT : o.shippedAt,
    }));
    toast.show({
      title: ship ? '송장을 등록하고 발송 처리했습니다' : '송장을 등록했습니다',
      description: ship
        ? `${channel.name}에 송장 번호를 보내고 구매자에게 배송 시작 알림톡을 보냈습니다`
        : `${carrier} ${trackingNo.trim()}`,
      tone: 'success',
    });
  };
  const cancel = () => {
    setOrder((o) => ({ ...o, stage: 'cancelled' }));
    toast.show({
      title: '주문을 취소했습니다',
      description: `${order.payMethod} 결제 ${formatAmount(total)}원 환불을 요청했습니다`,
      tone: 'neutral',
    });
  };

  const primary =
    order.stage === 'paid' ? (
      <Button
        variant="primary"
        icon="check"
        disabled={!canUpdate}
        onPress={() => {
          setOrder((o) => ({ ...o, stage: 'preparing' }));
          toast.show({ title: '주문을 확인했습니다', description: '상품 준비로 옮겼습니다' });
        }}
      >
        주문 확인
      </Button>
    ) : order.stage === 'preparing' && order.trackingNo ? (
      <Button
        variant="primary"
        icon="truck"
        disabled={!canUpdate}
        onPress={() => {
          setOrder((o) => ({ ...o, stage: 'shipping', shippedAt: NOW_AT }));
          toast.show({
            title: '발송 처리했습니다',
            description: '구매자에게 배송 시작 알림톡을 보냈습니다',
            tone: 'success',
          });
        }}
      >
        발송 처리
      </Button>
    ) : null;

  const history = [
    {
      id: 'h1',
      title: '주문 접수',
      time: order.orderedAt.slice(5),
      actor: `${channel.name} 주문 수집`,
      tone: 'neutral' as const,
      icon: 'shopping-bag' as const,
    },
    ...(order.paidAt
      ? [
          {
            id: 'h2',
            title: `결제 완료 · ${order.payMethod}`,
            time: order.paidAt.slice(5),
            tone: 'info' as const,
            icon: 'credit-card' as const,
          },
        ]
      : []),
    ...(order.stage !== 'paid-pending' && order.stage !== 'paid' && order.paidAt
      ? [
          {
            id: 'h3',
            title: '주문 확인 · 상품 준비',
            time: `${order.paidAt.slice(5, 10)} 21:30`,
            actor: PROFILE.people.logistics,
            tone: 'info' as const,
            icon: 'clipboard-check' as const,
          },
        ]
      : []),
    ...(order.trackingNo
      ? [
          {
            id: 'h4',
            title: '송장 등록',
            description: `${order.carrier} ${order.trackingNo}`,
            time: order.shippedAt?.slice(5) ?? `${TODAY.slice(5)} 09:20`,
            actor: PROFILE.people.logistics,
            tone: 'info' as const,
            icon: 'receipt' as const,
          },
        ]
      : []),
    ...(order.shippedAt
      ? [
          {
            id: 'h5',
            title: '발송 · 집하',
            description: `${warehouse.name} 출고`,
            time: order.shippedAt.slice(5),
            tone: 'info' as const,
            icon: 'truck' as const,
          },
        ]
      : []),
    ...(order.deliveredAt
      ? [
          {
            id: 'h6',
            title: '배송 완료',
            time: order.deliveredAt.slice(5),
            tone: 'success' as const,
            icon: 'package-check' as const,
          },
        ]
      : []),
    ...claims
      .filter((c) => c.kind !== 'cancel')
      .map((c) => ({
        id: `claim-${c.id}`,
        title: `${CLAIM_KINDS[c.kind]} 요청 · ${reasonOf(c.reason).label}`,
        description: `${c.id} · ${PICKUP_STATES[c.pickup].label}`,
        time: c.requestedAt.slice(5),
        actor: c.buyer,
        tone: 'warning' as const,
        icon: 'undo-2' as const,
      })),
    ...(order.stage === 'cancelled'
      ? [
          {
            id: 'h7',
            title: '주문 취소 · 환불 요청',
            time: claims[0]?.requestedAt.slice(5) ?? NOW_AT.slice(5),
            tone: 'danger' as const,
            icon: 'circle-x' as const,
          },
        ]
      : []),
  ];

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[
            { label: '이커머스' },
            {
              label: '주문',
              ...(screens.has('commerce/orders/list')
                ? { href: screens.href('commerce/orders/list') }
                : {}),
            },
            { label: order.id },
          ]}
          title={order.id}
          meta={<Badge tone={stage.tone}>{stage.label}</Badge>}
          description={`${channel.name} · ${order.orderedAt} 주문 · ${order.buyer}`}
          {...(screens.has('commerce/orders/list')
            ? { onBack: () => screens.go('commerce/orders/list') }
            : {})}
          actions={
            <>
              <Button icon="printer">주문서 인쇄</Button>
              {CANCELLABLE.includes(order.stage) && (
                <Button icon="circle-x" disabled={!canUpdate} onPress={() => setCancelOpen(true)}>
                  주문 취소
                </Button>
              )}
              {(order.stage === 'paid' || order.stage === 'preparing') && (
                <Button
                  variant={primary ? 'secondary' : 'primary'}
                  icon="receipt"
                  disabled={!canUpdate}
                  onPress={() => setInvoiceOpen(true)}
                >
                  {order.trackingNo ? '송장 수정' : '송장 입력'}
                </Button>
              )}
              {primary}
            </>
          }
        />
      }
    >
      {order.memo && (
        <Banner tone="info" title="배송 메모">
          {order.memo}
        </Banner>
      )}
      <Card>
        <Stepper steps={steps} label="주문 단계" />
      </Card>
      <Grid>
        <Col span={8}>
          <Stack gap="lg">
            <Card
              title="상품"
              subtitle={`${order.lines.length}종 · ${order.lines.reduce((a, l) => a + l.qty, 0)}개 · ${warehouse.name} 출고`}
              padding="none"
            >
              <DataGrid
                caption="주문 상품"
                className="tl-block-cm-flat-grid"
                rows={order.lines.map((l) => ({
                  key: l.skuCode,
                  productId: l.productId,
                  name: productById(l.productId).name,
                  sku: l.skuCode,
                  option: skuOf(l).option,
                  qty: l.qty,
                  price: linePrice(l),
                  amount: linePrice(l) * l.qty,
                }))}
                rowKey="key"
                {...(screens.has('commerce/products/list')
                  ? {
                      onRowPress: (l: { productId: string }) =>
                        screens.go('commerce/products/list', { id: l.productId }),
                    }
                  : {})}
                summary
                summaryLabel="상품 금액"
                columns={[
                  {
                    key: 'name',
                    header: '상품',
                    width: 'lg',
                    render: (l) => (
                      <DataGridLines
                        primary={l.name}
                        secondary={<span className="tl-block-code">{l.sku}</span>}
                      />
                    ),
                  },
                  { key: 'option', header: '옵션', width: 'md' },
                  { key: 'qty', header: '수량', width: 'xs', format: 'quantity', unit: '개' },
                  { key: 'price', header: '판매가', width: 'md', format: 'amount', unit: '원' },
                  {
                    key: 'amount',
                    header: '금액',
                    width: 'md',
                    format: 'amount',
                    unit: '원',
                    total: 'sum',
                  },
                ]}
              />
            </Card>
            <Card>
              <Tabs
                label="주문 정보"
                value={tab}
                onChange={setTab}
                items={[
                  {
                    value: 'shipping',
                    label: '배송',
                    content: (
                      <div className="tl-block-cm-tab-body">
                        <DescriptionList
                          columns={2}
                          items={[
                            { label: '받는 분', value: order.receiver },
                            { label: '연락처', value: maskPhone(order.receiverPhone) },
                            { label: '주소', value: order.address, span: 2 },
                            { label: '배송 메모', value: order.memo ?? '–', span: 2 },
                            { label: '택배사', value: order.carrier ?? '미등록' },
                            {
                              label: '송장 번호',
                              value: order.trackingNo ?? '미등록',
                              copyable: !!order.trackingNo,
                            },
                            { label: '출고지', value: `${warehouse.name}(${warehouse.kind})` },
                            {
                              label: '출고 마감',
                              value: `당일 ${PROFILE.shipping.cutoff} · ${PROFILE.shipping.packing}`,
                            },
                          ]}
                        />
                        <div className="tl-block-cm-tab-actions">
                          <Button
                            size="sm"
                            icon="map-pin"
                            disabled={!canEditAddress}
                            onPress={openAddress}
                          >
                            배송지 수정
                          </Button>
                        </div>
                      </div>
                    ),
                  },
                  {
                    value: 'payment',
                    label: '결제',
                    content: (
                      <div className="tl-block-cm-tab-body">
                        <DescriptionList
                          columns={2}
                          items={[
                            { label: '결제 수단', value: order.payMethod },
                            { label: '결제 일시', value: order.paidAt ?? '입금 대기' },
                            {
                              label: '채널 주문번호',
                              value: order.channelOrderNo,
                              copyable: true,
                            },
                            {
                              label: '쿠폰',
                              value: coupon
                                ? `${coupon.id} ${coupon.name} · −${formatAmount(order.couponDiscount)}원`
                                : '–',
                            },
                            {
                              label: '판매 수수료',
                              value: `${formatPercent(channel.feeRate)} · ${formatAmount(Math.round((goods * channel.feeRate) / 100))}원`,
                            },
                            { label: '정산 기준', value: channel.settleRule },
                          ]}
                        />
                      </div>
                    ),
                  },
                  {
                    value: 'claims',
                    label: '취소 · 반품 · 교환',
                    count: claims.length,
                    content: (
                      <div className="tl-block-cm-tab-body">
                        {claims.length === 0 ? (
                          <EmptyState
                            size="sm"
                            icon="undo-2"
                            title="취소 · 반품 · 교환 요청이 없습니다"
                            description="구매자가 요청하면 여기와 취소 · 반품 화면에 함께 나타납니다"
                          />
                        ) : (
                          claims.map((c) => (
                            <section key={c.id} className="tl-block-cm-claim">
                              <header className="tl-block-cm-claim__head">
                                <Lines
                                  primary={
                                    <>
                                      {CLAIM_KINDS[c.kind]} · {reasonOf(c.reason).label}
                                    </>
                                  }
                                  secondary={
                                    <span className="tl-block-code">
                                      {c.id} · {c.requestedAt}
                                    </span>
                                  }
                                />
                                <Badge tone={CLAIM_STATES[c.state].tone}>
                                  {CLAIM_STATES[c.state].label}
                                </Badge>
                              </header>
                              <p className="tl-block-cm-claim__comment">{c.comment}</p>
                              <DescriptionList
                                columns={2}
                                items={[
                                  {
                                    label: '회수',
                                    value: PICKUP_STATES[c.pickup].label,
                                  },
                                  {
                                    label: '환불 금액',
                                    value:
                                      c.kind === 'exchange'
                                        ? `교환 · ${c.exchangeTo}`
                                        : `${formatAmount(claimRefund(c))}원`,
                                  },
                                ]}
                              />
                              {screens.has('commerce/claims/list') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  iconEnd="chevron-right"
                                  onPress={() => screens.go('commerce/claims/list')}
                                >
                                  취소 · 반품에서 처리
                                </Button>
                              )}
                            </section>
                          ))
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </Stack>
        </Col>
        <Col span={4}>
          <Stack gap="lg">
            <Card title="결제 금액" subtitle="상품 금액 + 배송비 − 할인">
              <dl className="tl-block-cm-amounts">
                <div>
                  <dt>상품 금액</dt>
                  <dd>{formatAmount(goods, { unit: '원' })}</dd>
                </div>
                <div>
                  <dt>배송비</dt>
                  <dd>
                    {shipping === 0 ? '무료 · ' : ''}
                    {formatAmount(shipping, { unit: '원' })}
                  </dd>
                </div>
                <div>
                  <dt>할인</dt>
                  <dd>{formatAmount(-order.couponDiscount, { unit: '원' })}</dd>
                </div>
                <div className="tl-block-cm-amounts__total">
                  <dt>결제 금액</dt>
                  <dd>{formatAmount(total, { unit: '원' })}</dd>
                </div>
              </dl>
              {coupon && (
                <p className="tl-block-cm-note">
                  할인은 {coupon.id} {coupon.name} 쿠폰입니다.{' '}
                  {coupon.kind === 'rate'
                    ? `대상 상품 금액의 ${coupon.value}%를 최대 ${formatAmount(coupon.maxDiscount ?? 0)}원까지 뺍니다.`
                    : `최소 주문 금액 ${formatAmount(coupon.minOrder)}원 이상에서 ${formatAmount(coupon.value)}원을 뺍니다.`}
                </p>
              )}
            </Card>
            <Card title="주문자">
              <DescriptionList
                columns={1}
                items={[
                  { label: '이름', value: order.buyer },
                  { label: '연락처', value: maskPhone(order.phone) },
                  { label: '판매 채널', value: channel.name },
                  { label: '주문 일시', value: order.orderedAt },
                ]}
              />
            </Card>
            <Card title="처리 이력">
              <Timeline dense ariaLabel="주문 처리 이력" items={history} />
            </Card>
          </Stack>
        </Col>
      </Grid>
      <Dialog
        open={addressOpen}
        onOpenChange={setAddressOpen}
        title="배송지를 수정합니다"
        description={`주문 ${order.id} · 발송 전까지 바꿀 수 있습니다`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="primary"
                  onPress={saveAddress}
                  disabled={!receiver.trim() || !shipTo?.postcode || !shipTo.road}
                >
                  저장
                </Button>
              }
            />
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <Field label="받는 분" required>
            <Input value={receiver} onChange={setReceiver} maxLength={20} />
          </Field>
          <Field
            label="배송지"
            required
            help="주소 검색으로 도로명을 고르고 상세 주소를 입력합니다"
          >
            <AddressInput value={shipTo} onChange={setShipTo} search={searchAddressBook} />
          </Field>
          <Field label="배송 메모">
            <Input
              value={memo}
              onChange={setMemo}
              maxLength={50}
              placeholder="문 앞에 놓아 주세요"
            />
          </Field>
        </div>
      </Dialog>
      <Dialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        title={order.trackingNo ? '송장 번호를 수정합니다' : '송장 번호를 입력합니다'}
        description={`${order.receiver} · ${order.address}`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button variant="primary" onPress={saveInvoice} disabled={!trackingNo.trim()}>
                  {shipNow ? '저장 · 발송 처리' : '저장'}
                </Button>
              }
            />
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <Field label="택배사" required>
            <Select
              value={carrier}
              onChange={setCarrier}
              options={CARRIERS.map((c) => ({ value: c, label: c }))}
            />
          </Field>
          <Field label="송장 번호" required help="숫자만 입력합니다">
            <Input
              value={trackingNo}
              onChange={(v) => setTrackingNo(v.replace(/\D/g, ''))}
              inputMode="numeric"
              placeholder="640218894107"
              maxLength={14}
            />
          </Field>
          <Checkbox
            checked={shipNow}
            onChange={setShipNow}
            description="판매 채널에 송장을 보내고 구매자에게 배송 시작 알림톡을 보냅니다"
          >
            저장하고 바로 발송 처리
          </Checkbox>
        </div>
      </Dialog>
      <Dialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        tone="danger"
        title={`주문 ${order.id}을 취소합니다`}
        description={`${order.payMethod} 결제 ${formatAmount(total)}원을 환불하고 ${channel.name}에 취소를 보냅니다. 되돌릴 수 없습니다.`}
        footer={
          <>
            <DialogClose render={<Button>닫기</Button>} />
            <DialogClose
              render={
                <Button variant="danger" onPress={cancel}>
                  주문 취소
                </Button>
              }
            />
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <Field label="취소 사유" required>
            <Select
              value={cancelReason}
              onChange={setCancelReason}
              options={[
                { value: 'soldout', label: '품절 · 재고 부족' },
                { value: 'buyer', label: '구매자 요청' },
                { value: 'late', label: '발송 지연' },
                { value: 'address', label: '배송 불가 지역' },
              ]}
            />
          </Field>
          <Field label="구매자에게 보낼 안내" help="알림톡과 채널 취소 사유에 함께 들어갑니다">
            <Textarea
              rows={3}
              defaultValue={`${productById(order.lines[0]!.productId).name} 재고가 모자라 주문을 취소합니다. 결제하신 금액은 3영업일 안에 환불됩니다.`}
            />
          </Field>
        </div>
      </Dialog>
    </Page>
  );
}
