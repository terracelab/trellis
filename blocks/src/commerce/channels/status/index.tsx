// 판매 채널(Settings): 채널 카드(연동 상태 · 마지막 동기화 · 상품 · 주문 · 재고) → 고른 채널의
// 동기화 종류별 스위치 · API 키(가림 · 재발급) · 오류 목록(다시 시도) · 동기화 기록
import { dueDays, formatDate, formatDueDays, formatPercent } from '@terracelab/trellis-contracts';
import {
  Badge,
  Banner,
  Button,
  Card,
  DescriptionList,
  Dialog,
  DialogClose,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  SelectableCard,
  StatusDot,
  Switch,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  CHANNELS,
  ORDERS,
  PRODUCTS,
  SYNC_ERRORS,
  SYNC_KINDS,
  SYNC_STATES,
  type ChannelId,
  type SalesChannel,
  type SyncKind,
} from '../../../_data/commerce.js';
import { NOW_AT, warehouseName } from '../../../_data/profile.js';
import { TODAY } from '../../../_data/trade.js';
import { useCan } from '../../../_platform/index.js';
import { addDays, Page, Split } from '../../../_ui/index.js';
import './style.css';

const KINDS = Object.keys(SYNC_KINDS) as SyncKind[];
const NOW = NOW_AT;
/** 최근 7일(오늘 포함)의 첫날 */
const WEEK_FROM = addDays(TODAY, -6);
/** 재고를 보내는 창고: 상품의 출고 창고들 */
const STOCK_FROM = [...new Set(PRODUCTS.map((p) => p.warehouseId))].map(warehouseName).join(' · ');
const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
/** API 키 유효 기간 1년 */
const keyExpiry = (issued: string) => `${Number(issued.slice(0, 4)) + 1}${issued.slice(4)}`;

const counters = (id: ChannelId) => {
  const products = PRODUCTS.filter((p) => p.channels.includes(id));
  return {
    products: products.filter((p) => p.selling).length,
    orders: ORDERS.filter((o) => o.channelId === id && o.orderedAt.slice(0, 10) >= WEEK_FROM)
      .length,
    stock: products.reduce((a, p) => a + p.skus.length, 0),
  };
};
const ago = (at: string) => {
  const mins = minutesOf(NOW.slice(11)) - minutesOf(at.slice(11));
  return mins <= 0 ? '방금' : mins < 60 ? `${mins}분 전` : `${Math.floor(mins / 60)}시간 전`;
};

export default function ChannelStatus() {
  const toast = useToast();
  const canEdit = useCan('channels', 'update');
  const [channels, setChannels] = useState<SalesChannel[]>(() =>
    CHANNELS.map((c) => ({ ...c, sync: { ...c.sync, enabled: { ...c.sync.enabled } } })),
  );
  const [errors, setErrors] = useState(() => [...SYNC_ERRORS]);
  const [activeId, setActiveId] = useState<ChannelId>('mkA');
  const [retrying, setRetrying] = useState<string[]>([]);
  const [reissue, setReissue] = useState(false);
  const [stockRule, setStockRule] = useState<string | null>('available');
  const active = channels.find((c) => c.id === activeId)!;
  const activeErrors = errors.filter((e) => e.channelId === activeId);
  const errorTotal = errors.reduce((a, e) => a + e.count, 0);
  const expiry = keyExpiry(active.apiKeyIssuedAt);
  const expiresIn = dueDays(expiry, TODAY);

  const patchChannel = (id: ChannelId, f: (c: SalesChannel) => SalesChannel) =>
    setChannels((cs) => cs.map((c) => (c.id === id ? f(c) : c)));
  const retry = (ids: string[]) => {
    const targets = errors.filter((x) => ids.includes(x.id));
    setRetrying(ids);
    window.setTimeout(() => {
      setErrors((prev) => prev.filter((x) => !ids.includes(x.id)));
      setRetrying([]);
      for (const ch of new Set(targets.map((t) => t.channelId)))
        if (!errors.some((x) => x.channelId === ch && !ids.includes(x.id)))
          patchChannel(ch, (c) => ({ ...c, sync: { ...c.sync, state: 'ok', lastSyncAt: NOW } }));
      toast.show({
        title:
          targets.length === 1
            ? `${targets[0]!.title}을 다시 보냈습니다`
            : `동기화 오류 ${targets.length}종을 다시 보냈습니다`,
        description: `${targets.reduce((a, t) => a + t.count, 0)}건 모두 반영했습니다`,
        tone: 'success',
      });
    }, 600);
  };

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '이커머스' }, { label: '판매 채널' }]}
          title="판매 채널"
          description={`채널 ${channels.length}곳 · 정상 ${channels.filter((c) => c.sync.state === 'ok').length}곳 · 동기화 오류 ${errorTotal}건`}
          actions={
            <>
              <Button icon="plus" disabled={!canEdit}>
                채널 추가
              </Button>
              <Button
                variant="primary"
                icon="refresh-cw"
                disabled={!canEdit}
                onPress={() => {
                  setChannels((cs) =>
                    cs.map((c) => ({ ...c, sync: { ...c.sync, lastSyncAt: NOW } })),
                  );
                  toast.show({
                    title: '판매 채널 4곳을 동기화했습니다',
                    description: '상품 · 가격 · 재고를 보내고 새 주문을 가져왔습니다',
                    tone: 'success',
                  });
                }}
              >
                지금 동기화
              </Button>
            </>
          }
        />
      }
    >
      <SelectableCard
        label="판매 채널"
        columns={4}
        value={activeId}
        onChange={(v) => setActiveId(v as ChannelId)}
        options={channels.map((c) => {
          const n = counters(c.id);
          const errs = errors.filter((e) => e.channelId === c.id);
          return {
            value: c.id,
            title: c.name,
            meta: (
              <StatusDot tone={SYNC_STATES[c.sync.state].tone}>
                {SYNC_STATES[c.sync.state].label}
              </StatusDot>
            ),
            description: `마지막 동기화 ${c.sync.lastSyncAt.slice(11)} · ${ago(c.sync.lastSyncAt)}`,
            content: (
              <div className="tl-block-cm-channel">
                <div className="tl-block-cm-channel__stats">
                  <span>
                    <span>상품</span>
                    <strong>{n.products}</strong>
                  </span>
                  <span>
                    <span>주문 · 7일</span>
                    <strong>{n.orders}</strong>
                  </span>
                  <span>
                    <span>재고 SKU</span>
                    <strong>{n.stock}</strong>
                  </span>
                </div>
                <div className="tl-block-cm-channel__foot">
                  {errs.length > 0 ? (
                    <Badge size="sm" tone="danger">
                      오류 {errs.reduce((a, e) => a + e.count, 0)}건
                    </Badge>
                  ) : (
                    <Badge size="sm" tone="success">
                      오류 없음
                    </Badge>
                  )}
                  <span>수수료 {formatPercent(c.feeRate)}</span>
                </div>
              </div>
            ),
          };
        })}
      />

      <Split
        asideWidth="lg"
        main={
          <>
            <Card
              title={`${active.name} 동기화`}
              subtitle="켜 둔 항목만 채널과 주고받습니다. 끄면 바로 적용됩니다"
            >
              <ul className="tl-block-cm-sync-list">
                {KINDS.map((k) => (
                  <li key={k}>
                    <Switch
                      checked={active.sync.enabled[k]}
                      disabled={!canEdit}
                      description={SYNC_KINDS[k].description}
                      onChange={(on) => {
                        patchChannel(active.id, (c) => ({
                          ...c,
                          sync: { ...c.sync, enabled: { ...c.sync.enabled, [k]: on } },
                        }));
                        toast.show({
                          title: `${active.name} ${SYNC_KINDS[k].label} 동기화를 ${on ? '켰습니다' : '껐습니다'}`,
                          tone: on ? 'success' : 'neutral',
                        });
                      }}
                    >
                      {SYNC_KINDS[k].label}
                    </Switch>
                    <span className="tl-block-cm-sync-list__state">
                      {active.sync.enabled[k] ? (
                        activeErrors.some((e) => e.kind === k) ? (
                          <StatusDot tone="danger">오류</StatusDot>
                        ) : (
                          <StatusDot tone="success">
                            {active.sync.lastSyncAt.slice(11)} 완료
                          </StatusDot>
                        )
                      ) : (
                        <StatusDot tone="neutral">꺼짐</StatusDot>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="tl-block-cm-sync-rule">
                <Field label="재고 전송 기준" help="채널에 보내는 재고 수량을 정합니다">
                  <Select
                    value={stockRule}
                    onChange={setStockRule}
                    disabled={!canEdit}
                    options={[
                      { value: 'available', label: '가용 재고 그대로' },
                      { value: 'buffer', label: '가용 재고에서 2개 남기고' },
                      { value: 'half', label: '가용 재고의 50%' },
                    ]}
                  />
                </Field>
              </div>
            </Card>
            <Card
              title="API 연동"
              subtitle={`${active.name} 판매자 센터에서 받은 키 · 끝 4자리만 보입니다`}
            >
              <div className="tl-block-drawer-stack">
                {expiresIn <= 30 && (
                  <Banner
                    tone="warning"
                    title={`API 키가 ${formatDate(expiry, 'md')}에 만료됩니다`}
                  >
                    만료되면 주문을 가져오지 못합니다. {formatDueDays(expiry, TODAY)}입니다.
                    재발급한 뒤 채널 판매자 센터에 새 키를 등록하세요.
                  </Banner>
                )}
                <DescriptionList
                  columns={2}
                  items={[
                    { label: '판매자 ID', value: active.sellerId, copyable: true },
                    { label: '정산 기준', value: active.settleRule },
                    { label: '키 발급일', value: active.apiKeyIssuedAt },
                    { label: '키 만료일', value: `${expiry} · ${formatDueDays(expiry, TODAY)}` },
                  ]}
                />
                <div className="tl-block-cm-key">
                  <Field label="API 키">
                    <Input
                      value={`••••••••-••••-••••-••••-••••••••${active.apiKeyTail}`}
                      readOnly
                    />
                  </Field>
                  <Button icon="key-round" disabled={!canEdit} onPress={() => setReissue(true)}>
                    재발급
                  </Button>
                </div>
              </div>
            </Card>
          </>
        }
        aside={
          <>
            <Card
              title="동기화 오류"
              subtitle={
                activeErrors.length
                  ? `${activeErrors.length}종 · 다시 시도하면 바로 보냅니다`
                  : '최근 24시간'
              }
              action={
                activeErrors.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="rotate-ccw"
                    disabled={!canEdit || retrying.length > 0}
                    onPress={() => retry(activeErrors.map((e) => e.id))}
                  >
                    모두 다시 시도
                  </Button>
                )
              }
            >
              {activeErrors.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon="circle-check"
                  title="동기화 오류가 없습니다"
                  description="오류가 생기면 여기와 알림에 함께 나타납니다"
                />
              ) : (
                <ul className="tl-block-cm-errors">
                  {activeErrors.map((e) => (
                    <li key={e.id}>
                      <span className="tl-block-cm-errors__head">
                        <StatusDot tone="danger">{e.title}</StatusDot>
                        <Badge size="sm" tone="neutral">
                          {SYNC_KINDS[e.kind].label}
                        </Badge>
                      </span>
                      <p>{e.detail}</p>
                      <span className="tl-block-cm-errors__foot">
                        <span className="tl-block-muted">{e.at.slice(5)} 발생</span>
                        <Button
                          size="sm"
                          icon="rotate-ccw"
                          loading={retrying.includes(e.id)}
                          disabled={!canEdit}
                          onPress={() => retry([e.id])}
                        >
                          다시 시도
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="동기화 기록" subtitle="오늘">
              <Timeline
                dense
                ariaLabel={`${active.name} 동기화 기록`}
                items={[
                  {
                    id: 's1',
                    title: activeErrors.length ? '동기화 · 일부 실패' : '동기화 완료',
                    description: activeErrors.length
                      ? activeErrors.map((e) => e.title).join(' · ')
                      : `상품 ${counters(active.id).products}개 · 재고 SKU ${counters(active.id).stock}개`,
                    time: active.sync.lastSyncAt.slice(11),
                    tone: activeErrors.length ? 'danger' : 'success',
                    icon: activeErrors.length ? 'circle-alert' : 'circle-check',
                  },
                  {
                    id: 's2',
                    title: '주문 수집',
                    description: `새 주문 ${ORDERS.filter((o) => o.channelId === active.id && o.orderedAt.startsWith(TODAY)).length}건`,
                    time: '13:00',
                    tone: 'info',
                    icon: 'shopping-bag',
                  },
                  {
                    id: 's3',
                    title: '재고 전송',
                    description: `${STOCK_FROM} 가용 재고 기준`,
                    time: '12:00',
                    tone: 'neutral',
                    icon: 'boxes',
                  },
                  {
                    id: 's4',
                    title: '가격 전송',
                    description: '할인가 변경 2건',
                    time: '09:30',
                    tone: 'neutral',
                    icon: 'tag',
                  },
                ]}
              />
            </Card>
          </>
        }
      />
      <Dialog
        open={reissue}
        onOpenChange={setReissue}
        tone="danger"
        title={`${active.name} API 키를 재발급합니다`}
        description="지금 키는 바로 쓸 수 없게 됩니다. 재발급한 뒤 채널 판매자 센터에 새 키를 등록해야 주문 수집이 이어집니다."
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant="danger"
                  onPress={() => {
                    patchChannel(active.id, (c) => ({
                      ...c,
                      apiKeyTail: 'e41c',
                      apiKeyIssuedAt: TODAY,
                    }));
                    toast.show({
                      title: 'API 키를 재발급했습니다',
                      description: `${active.name} · 끝자리 e41c · 감사 로그에 남겼습니다`,
                      tone: 'success',
                    });
                  }}
                >
                  재발급
                </Button>
              }
            />
          </>
        }
      />
    </Page>
  );
}
