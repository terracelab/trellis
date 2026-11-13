// 취소 · 반품 · 교환(ListDetail): 종류 탭 · 사유 · 회수 상태 · 환불 금액 → 승인 · 거부(사유) · 입고 검수 연결
import { formatAmount } from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Banner,
  Button,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Dialog,
  DialogClose,
  Drawer,
  Field,
  FilterBar,
  Input,
  PageHeader,
  SegmentedControl,
  Select,
  StatusDot,
  Tabs,
  Textarea,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  CARRIERS,
  channelById,
  CLAIM_KINDS,
  CLAIM_REASONS,
  CLAIM_STATES,
  CLAIMS,
  claimRefund,
  orderById,
  PICKUP_STATES,
  productById,
  reasonOf,
  RETURN_SHIPPING,
  skuOf,
  type Claim,
  type ClaimKind,
} from '../../../_data/commerce.js';
import { NOW_AT, PROFILE } from '../../../_data/profile.js';
import { TODAY, warehouseById } from '../../../_data/trade.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import { ExportButton, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

const KINDS = Object.keys(CLAIM_KINDS) as ClaimKind[];
/** 엑셀 다운로드 열(지금 탭의 요청, 금액은 서식 없는 숫자) */
const CSV: CsvColumn<Claim>[] = [
  { label: '요청 번호', value: 'id' },
  { label: '종류', value: (r) => CLAIM_KINDS[r.kind] },
  { label: '요청 일시', value: 'requestedAt' },
  { label: '주문번호', value: 'orderId' },
  { label: '채널', value: (r) => channelById(r.channelId).name },
  { label: '주문자', value: 'buyer' },
  { label: '상품', value: (r) => productById(r.productId).name },
  { label: '옵션', value: (r) => skuOf(r).option },
  { label: '수량(개)', value: 'qty' },
  { label: '사유', value: (r) => reasonOf(r.reason).label },
  { label: '회수', value: (r) => PICKUP_STATES[r.pickup].label },
  { label: '환불 금액(원)', value: (r) => claimRefund(r) },
  { label: '처리', value: (r) => CLAIM_STATES[r.state].label },
];
const RECEIVING = 'scm/warehouse/receiving';
/** 회수한 상품이 들어가는 창고(상품의 출고 창고) */
const returnTo = (c: Claim) => warehouseById(productById(c.productId).warehouseId).name;
/** 회수 택배사(원 주문의 택배사, 없으면 첫 택배사) */
const carrierOf = (c: Claim) => orderById(c.orderId)?.carrier ?? CARRIERS[0];
const REJECT = PROFILE.claimRejectReasons;

export default function ClaimList() {
  const toast = useToast();
  const canApprove = useCan('claims', 'approve');
  const screens = useScreens();
  const goReceiving = () => screens.go(RECEIVING);
  const [rows, setRows] = useState<Claim[]>(() => CLAIMS.map((c) => ({ ...c })));
  const [tab, setTab] = useState<ClaimKind>('return');
  const [q, setQ] = useState('');
  const [reason, setReason] = useState<string | null>('all');
  const [state, setState] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejectIds, setRejectIds] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState<string | null>(REJECT[0]?.value ?? null);
  const [rejectNote, setRejectNote] = useState('');

  const ofKind = rows.filter((r) => r.kind === tab);
  const shown = useMemo(
    () =>
      ofKind.filter(
        (r) =>
          (reason === 'all' || r.reason === reason) &&
          (state === 'all' || r.state === state) &&
          (!q || `${r.id}${r.orderId}${r.buyer}`.includes(q)),
      ),
    [ofKind, reason, state, q],
  );
  const open = rows.find((r) => r.id === openId) ?? null;
  const picked = rows.filter((r) => selected.includes(r.id));
  const approvable = picked.filter((r) => r.state === 'requested');
  const arrived = rows.filter((r) => r.pickup === 'arrived');
  const waiting = rows.filter((r) => r.state === 'requested');

  const patch = (ids: string[], f: (c: Claim) => Partial<Claim>) =>
    setRows((prev) => prev.map((c) => (ids.includes(c.id) ? { ...c, ...f(c) } : c)));

  const approve = (ids: string[]) => {
    const targets = rows.filter((r) => ids.includes(r.id));
    patch(ids, (c) =>
      c.kind === 'cancel'
        ? { state: 'done', doneAt: NOW_AT }
        : { state: 'processing', pickup: 'requested', pickupNo: '640218894215' },
    );
    setSelected([]);
    const refund = targets.reduce((a, c) => a + claimRefund(c), 0);
    toast.show({
      title: `${CLAIM_KINDS[tab]} ${ids.length}건을 승인했습니다`,
      description:
        tab === 'cancel'
          ? `환불 ${formatAmount(refund)}원을 요청하고 판매 채널에 승인을 보냈습니다`
          : `${carrierOf(targets[0]!)}에 회수를 요청했습니다. 회수되면 ${returnTo(targets[0]!)} 입고 검수로 넘어갑니다`,
      tone: 'success',
    });
  };
  const reject = () => {
    patch(rejectIds, () => ({
      state: 'rejected',
      pickup: 'none',
      doneAt: NOW_AT,
      rejectNote: rejectNote || (REJECT.find((r) => r.value === rejectReason)?.note ?? ''),
    }));
    toast.show({
      title: `${CLAIM_KINDS[tab]} ${rejectIds.length}건을 거부했습니다`,
      description: '구매자에게 거부 사유를 알림톡으로 보냈습니다',
      tone: 'neutral',
    });
    setRejectIds([]);
    setRejectNote('');
    setSelected([]);
  };
  const refundDone = (c: Claim) => {
    patch([c.id], () => ({ state: 'done', pickup: 'inspected', doneAt: NOW_AT }));
    toast.show({
      title: '검수를 마치고 환불했습니다',
      description: `${c.id} · ${formatAmount(claimRefund(c))}원`,
      tone: 'success',
    });
  };

  const columns = [
    {
      key: 'id',
      header: '요청 번호',
      width: 'md' as const,
      sticky: true,
      render: (r: Claim) => (
        <DataGridLines
          primary={<span className="tl-block-code">{r.id}</span>}
          secondary={<>{r.requestedAt.slice(5)} 요청</>}
        />
      ),
    },
    {
      key: 'orderId',
      header: '주문',
      width: 'lg' as const,
      render: (r: Claim) => (
        <DataGridLines
          primary={<span className="tl-block-code">{r.orderId}</span>}
          secondary={
            <>
              {channelById(r.channelId).name} · {r.buyer}
            </>
          }
        />
      ),
    },
    {
      key: 'product',
      header: '상품',
      width: 'lg' as const,
      render: (r: Claim) => (
        <DataGridLines
          primary={productById(r.productId).name}
          secondary={
            <>
              {skuOf(r).option} · {r.qty}개{r.exchangeTo ? ` → ${r.exchangeTo}` : ''}
            </>
          }
        />
      ),
    },
    {
      key: 'reason',
      header: '사유',
      width: 'md' as const,
      render: (r: Claim) => (
        <DataGridLines
          primary={reasonOf(r.reason).label}
          secondary={reasonOf(r.reason).fault === 'buyer' ? '구매자 사유' : '판매자 사유'}
        />
      ),
    },
    ...(tab === 'cancel'
      ? []
      : [
          {
            key: 'pickup',
            header: '회수',
            width: 'lg' as const,
            render: (r: Claim) => (
              <StatusDot tone={PICKUP_STATES[r.pickup].tone}>
                {PICKUP_STATES[r.pickup].label}
              </StatusDot>
            ),
          },
        ]),
    tab === 'exchange'
      ? {
          key: 'exchangeTo',
          header: '교환 배송비',
          width: 'md' as const,
          align: 'right' as const,
          render: (r: Claim) =>
            reasonOf(r.reason).fault === 'buyer'
              ? `${formatAmount(RETURN_SHIPPING)}원 청구`
              : '판매자 부담',
        }
      : {
          key: 'refund',
          header: '환불 금액',
          width: 'md' as const,
          format: 'amount' as const,
          unit: '원',
          total: 'sum' as const,
          value: (r: Claim) => claimRefund(r),
        },
    {
      key: 'state',
      header: '처리',
      width: 'sm' as const,
      render: (r: Claim) => (
        <Badge tone={CLAIM_STATES[r.state].tone}>{CLAIM_STATES[r.state].label}</Badge>
      ),
    },
  ];

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '이커머스' }, { label: '취소 · 반품' }]}
          title="취소 · 반품 · 교환"
          description={`처리할 요청 ${waiting.length}건 · 회수 중 ${rows.filter((r) => r.pickup === 'requested' || r.pickup === 'transit').length}건 · 검수 대기 ${arrived.length}건`}
          actions={
            <ExportButton
              module="claims"
              name={`${CLAIM_KINDS[tab]} 요청`}
              rows={shown}
              columns={CSV}
            >
              엑셀 다운로드
            </ExportButton>
          }
          tabs={
            <Tabs
              label="요청 종류"
              value={tab}
              onChange={(v) => {
                setTab(v as ClaimKind);
                setSelected([]);
              }}
              items={KINDS.map((k) => ({
                value: k,
                label: CLAIM_KINDS[k],
                count: rows.filter((r) => r.kind === k).length,
              }))}
            />
          }
        />
      }
    >
      {arrived.length > 0 && tab !== 'cancel' && (
        <Banner
          tone="warning"
          title={`회수 완료 · 검수 대기 ${arrived.length}건`}
          action={
            screens.has(RECEIVING) && (
              <Button size="sm" icon="warehouse" onPress={goReceiving}>
                입고 검수로 이동
              </Button>
            )
          }
        >
          {arrived[0]!.id} {productById(arrived[0]!.productId).name} {skuOf(arrived[0]!).option}{' '}
          {arrived[0]!.qty}개가 {returnTo(arrived[0]!)}에 도착했습니다. 입고 검수에서 판정하면
          환불을 진행합니다.
        </Banner>
      )}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="요청 번호 · 주문번호 · 주문자"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
            label="요청 검색"
          />
        }
        onReset={() => {
          setQ('');
          setReason('all');
          setState('all');
        }}
        resultCount={shown.length}
      >
        <Select
          size="sm"
          width="auto"
          label="사유"
          value={reason}
          onChange={setReason}
          options={[
            { value: 'all', label: '전체 사유' },
            ...CLAIM_REASONS.map((r) => ({ value: r.value, label: r.label })),
          ]}
        />
        <SegmentedControl
          size="sm"
          label="처리 상태"
          value={state}
          onChange={setState}
          options={[
            { value: 'all', label: '전체' },
            { value: 'requested', label: '접수' },
            { value: 'processing', label: '처리 중' },
            { value: 'done', label: '완료' },
            { value: 'rejected', label: '거부' },
          ]}
        />
      </FilterBar>
      <DataGrid
        caption={`${CLAIM_KINDS[tab]} 요청`}
        height="fill"
        rows={shown}
        rowKey="id"
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        onRowPress={(r) => setOpenId(r.id)}
        activeRowKey={openId}
        summary={tab !== 'exchange'}
        rowTone={(r) =>
          r.state === 'requested' ? 'warning' : r.pickup === 'arrived' ? 'info' : undefined
        }
        empty={`이 조건의 ${CLAIM_KINDS[tab]} 요청이 없습니다`}
        columns={columns}
      />
      {selected.length > 0 && (
        <ActionBar
          summary={`${selected.length}건 선택 · 처리할 요청 ${approvable.length}건${tab === 'exchange' ? '' : ` · 환불 ${formatAmount(approvable.reduce((a, r) => a + claimRefund(r), 0))}원`}`}
        >
          <Button onPress={() => setSelected([])}>선택 해제</Button>
          <Button
            icon="ban"
            disabled={!canApprove || approvable.length === 0}
            onPress={() => setRejectIds(approvable.map((r) => r.id))}
          >
            거부
          </Button>
          <Button
            variant="primary"
            icon="check"
            disabled={!canApprove || approvable.length === 0}
            onPress={() => approve(approvable.map((r) => r.id))}
          >
            {approvable.length}건 승인
          </Button>
        </ActionBar>
      )}
      <Dialog
        open={rejectIds.length > 0}
        onOpenChange={(o) => !o && setRejectIds([])}
        tone="danger"
        title={`${CLAIM_KINDS[tab]} ${rejectIds.length}건을 거부합니다`}
        description="구매자에게 거부 사유를 알림톡으로 보내고 판매 채널에 거부를 보냅니다."
        footer={
          <>
            <DialogClose render={<Button>닫기</Button>} />
            <DialogClose
              render={
                <Button variant="danger" onPress={reject}>
                  거부
                </Button>
              }
            />
          </>
        }
      >
        <div className="tl-block-drawer-stack">
          <Field label="거부 사유" required>
            <Select
              value={rejectReason}
              onChange={setRejectReason}
              options={REJECT.map((r) => ({ value: r.value, label: r.label }))}
            />
          </Field>
          <Field label="구매자에게 보낼 안내" required help="알림톡과 채널 거부 사유에 들어갑니다">
            <Textarea
              rows={3}
              value={rejectNote}
              onChange={setRejectNote}
              placeholder={REJECT.find((r) => r.value === rejectReason)?.note ?? ''}
            />
          </Field>
        </div>
      </Dialog>
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.id ?? ''}
        description={
          open
            ? `${CLAIM_KINDS[open.kind]} · ${open.orderId} · ${channelById(open.channelId).name}`
            : ''
        }
        width="lg"
        actions={
          open && (
            <Badge tone={CLAIM_STATES[open.state].tone}>{CLAIM_STATES[open.state].label}</Badge>
          )
        }
        footer={
          open && (
            <>
              {orderById(open.orderId) && screens.has('commerce/orders/detail') && (
                <Button onPress={() => screens.go('commerce/orders/detail', { id: open.orderId })}>
                  주문 보기
                </Button>
              )}
              {open.state === 'requested' && (
                <>
                  <Button icon="ban" disabled={!canApprove} onPress={() => setRejectIds([open.id])}>
                    거부
                  </Button>
                  <Button
                    variant="primary"
                    icon="check"
                    disabled={!canApprove}
                    onPress={() => approve([open.id])}
                  >
                    승인
                  </Button>
                </>
              )}
              {open.pickup === 'arrived' && (
                <>
                  {screens.has(RECEIVING) && (
                    <Button icon="warehouse" onPress={goReceiving}>
                      입고 검수
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    icon="banknote"
                    disabled={!canApprove}
                    onPress={() => refundDone(open)}
                  >
                    검수 완료 · 환불
                  </Button>
                </>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            {open.pickup === 'arrived' && (
              <Banner tone="warning" title={`${returnTo(open)}에 회수 도착`}>
                입고 검수 {open.receiptNo}에서 판정하면 환불할 수 있습니다.
              </Banner>
            )}
            {open.state === 'rejected' && (
              <Banner tone="neutral" title="거부한 요청입니다">
                {open.rejectNote}
              </Banner>
            )}
            <blockquote className="tl-block-cm-quote">
              <p>{open.comment}</p>
              <footer>
                {open.buyer} · {open.requestedAt}
              </footer>
            </blockquote>
            <DescriptionList
              columns={2}
              items={[
                {
                  label: '상품',
                  value: `${productById(open.productId).name} · ${skuOf(open).option} · ${open.qty}개`,
                  span: 2,
                },
                { label: '사유', value: reasonOf(open.reason).label },
                {
                  label: '귀책',
                  value: reasonOf(open.reason).fault === 'buyer' ? '구매자' : '판매자',
                },
                ...(open.kind === 'cancel'
                  ? []
                  : [
                      { label: '회수', value: PICKUP_STATES[open.pickup].label },
                      {
                        label: '회수 송장',
                        value: open.pickupNo ?? '–',
                        copyable: !!open.pickupNo,
                      },
                    ]),
                open.kind === 'exchange'
                  ? { label: '교환 옵션', value: open.exchangeTo ?? '–' }
                  : { label: '환불 금액', value: `${formatAmount(claimRefund(open))}원` },
                {
                  label: open.kind === 'cancel' ? '환불 수단' : '왕복 배송비',
                  value:
                    open.kind === 'cancel'
                      ? '원결제 수단'
                      : reasonOf(open.reason).fault === 'buyer'
                        ? `${formatAmount(RETURN_SHIPPING)}원 구매자 부담`
                        : '판매자 부담',
                },
              ]}
            />
            <Timeline
              dense
              ariaLabel={`${open.id} 처리 이력`}
              items={[
                {
                  id: 'c1',
                  title: `${CLAIM_KINDS[open.kind]} 요청`,
                  time: open.requestedAt.slice(5),
                  actor: open.buyer,
                  tone: 'neutral',
                  icon: 'undo-2',
                },
                ...(open.state !== 'requested' && open.state !== 'rejected'
                  ? [
                      {
                        id: 'c2',
                        title: '승인',
                        time: `${open.requestedAt.slice(5, 10)} 16:20`,
                        actor: PROFILE.people.sales,
                        tone: 'info' as const,
                        icon: 'check' as const,
                      },
                    ]
                  : []),
                ...(open.pickupNo
                  ? [
                      {
                        id: 'c3',
                        title: '회수 요청',
                        description: `${carrierOf(open)} ${open.pickupNo}`,
                        time: `${open.requestedAt.slice(5, 10)} 16:21`,
                        tone: 'info' as const,
                        icon: 'truck' as const,
                      },
                    ]
                  : []),
                ...(open.pickup === 'arrived' || open.pickup === 'inspected'
                  ? [
                      {
                        id: 'c4',
                        title: `회수 완료 · ${returnTo(open)} 도착`,
                        description: open.receiptNo,
                        time: open.arrivedAt?.slice(5) ?? `${TODAY.slice(5)} 09:50`,
                        tone: 'warning' as const,
                        icon: 'warehouse' as const,
                      },
                    ]
                  : []),
                ...(open.state === 'done'
                  ? [
                      {
                        id: 'c5',
                        title: open.kind === 'exchange' ? '교환 상품 발송' : '환불 완료',
                        description:
                          open.kind === 'exchange'
                            ? open.exchangeTo
                            : `${formatAmount(claimRefund(open))}원`,
                        time: open.doneAt?.slice(5) ?? NOW_AT.slice(5),
                        tone: 'success' as const,
                        icon: 'circle-check' as const,
                      },
                    ]
                  : []),
                ...(open.state === 'rejected'
                  ? [
                      {
                        id: 'c6',
                        title: '거부',
                        description: open.rejectNote,
                        time: open.doneAt?.slice(5) ?? NOW_AT.slice(5),
                        tone: 'danger' as const,
                        icon: 'ban' as const,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        )}
      </Drawer>
    </Page>
  );
}
