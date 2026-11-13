// 배차(ListDetail): 오늘 배송 건 · 차량별 적재율 · 행마다 차량 고르기(끌어 놓기 없음) · 배차 확정 · 경로 순서(Drawer)
import { formatAmount, formatDate, formatQuantity } from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Banner,
  Button,
  Card,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  FilterBar,
  Input,
  PageHeader,
  Progress,
  SegmentedControl,
  Select,
  StatusDot,
  Stepper,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  consigneeById,
  DELIVERY_ORDERS,
  DELIVERY_STATES,
  PLANT,
  truckById,
  TRUCKS,
  type DeliveryOrder,
  type DeliveryState,
  type Truck,
} from '../../../_data/mes-delivery.js';
import { NOW, PROFILE, withinCold } from '../../../_data/profile.js';
import { TODAY } from '../../../_data/trade.js';
import { useCan } from '../../../_platform/index.js';
import { ExportButton, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

const fmtTemp = (v: number) => `${formatAmount(v, { digits: 1 })}°C`;
/** 온도 관리 화물 이름(냉동 · 냉장). 회사 설정 */
const COLD = PROFILE.cold?.label ?? '저온';
const editable = (o: DeliveryOrder) => o.state === 'unassigned' || o.state === 'assigned';

export default function Dispatch() {
  const toast = useToast();
  const canDispatch = useCan('delivery', 'update');
  const [orders, setOrders] = useState<DeliveryOrder[]>(() =>
    DELIVERY_ORDERS.map((o) => ({ ...o })),
  );
  /** 확정 전 배차(자동 제안 포함). 값이 null이면 배차 해제 */
  const [draft, setDraft] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(DELIVERY_ORDERS.filter((o) => o.suggested).map((o) => [o.id, o.suggested!])),
  );
  /** 차량별 경로 순서(배송 번호) */
  const [routes, setRoutes] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      TRUCKS.map((t) => [
        t.id,
        DELIVERY_ORDERS.filter((o) => o.truckId === t.id)
          .sort((a, b) => (a.seq ?? 99) - (b.seq ?? 99))
          .map((o) => o.id),
      ]),
    ),
  );
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [temp, setTemp] = useState('all');
  const [openTruck, setOpenTruck] = useState<string | null>(null);

  const truckOf = (o: DeliveryOrder) => (o.id in draft ? (draft[o.id] ?? null) : o.truckId);
  const changes = orders.filter((o) => o.id in draft && draft[o.id] !== o.truckId && draft[o.id]);
  const mismatch = orders.filter((o) => {
    const t = truckOf(o);
    return o.cold && t && !truckById(t).cold;
  });
  const onTruck = (t: Truck) => orders.filter((o) => truckOf(o) === t.id);
  /** 지금 실려 있거나 실을 무게(배송 완료는 뺀다) */
  const loadOf = (t: Truck) =>
    onTruck(t)
      .filter((o) => o.state !== 'delivered')
      .reduce((a, o) => a + o.weightKg, 0);
  const over = TRUCKS.filter((t) => loadOf(t) > t.capacityKg);
  const unassignedLeft = orders.filter((o) => o.state === 'unassigned' && !truckOf(o));
  const count = (s: DeliveryState) => orders.filter((o) => o.state === s).length;
  const hold = orders.filter((o) => o.state === 'hold');
  const truck = openTruck ? truckById(openTruck) : null;
  /** 엑셀 다운로드 열(지금 화면의 배차, 확정 전 변경 포함. 중량 · 거리는 서식 없는 숫자) */
  const csv: CsvColumn<DeliveryOrder>[] = [
    { label: '배송', value: 'id' },
    { label: '송장', value: (o) => o.invoiceId ?? '' },
    { label: '거래처', value: (o) => consigneeById(o.consigneeId).name },
    { label: '품목', value: 'items' },
    { label: '지역', value: (o) => consigneeById(o.consigneeId).region },
    { label: '거리(km)', value: 'distanceKm' },
    { label: '도착 희망', value: 'window' },
    { label: '중량(kg)', value: 'weightKg' },
    { label: '박스', value: 'boxes' },
    { label: '온도', value: (o) => (o.cold ? COLD : '상온') },
    { label: '차량', value: (o) => (truckOf(o) ? truckById(truckOf(o)!).plate : '') },
    { label: '기사', value: (o) => (truckOf(o) ? truckById(truckOf(o)!).driver : '') },
    { label: '상태', value: (o) => DELIVERY_STATES[o.state].label },
  ];

  const shown = useMemo(
    () =>
      orders.filter((o) => {
        const c = consigneeById(o.consigneeId);
        return (
          (tab === 'all' || o.state === tab) &&
          (temp === 'all' || (temp === 'cold') === o.cold) &&
          (!q || `${o.id}${c.name}${c.region}${o.items}`.includes(q))
        );
      }),
    [orders, tab, temp, q],
  );

  /** 차량의 경로: 정해 둔 순서 + 새로 붙은 건은 거리순으로 뒤에 */
  const routeOf = (t: Truck) => {
    const stops = onTruck(t);
    const order = routes[t.id] ?? [];
    return [...stops].sort((a, b) => {
      const ia = order.indexOf(a.id);
      const ib = order.indexOf(b.id);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return a.distanceKm - b.distanceKm;
    });
  };

  const confirm = () => {
    const ids = changes.map((o) => o.id);
    setOrders((os) =>
      os.map((o) =>
        ids.includes(o.id) ? { ...o, truckId: draft[o.id] ?? null, state: 'assigned' } : o,
      ),
    );
    setRoutes((r) => {
      const next = { ...r };
      for (const o of changes) {
        const t = draft[o.id]!;
        next[t] = [...(next[t] ?? []).filter((id) => id !== o.id), o.id];
      }
      return next;
    });
    setDraft({});
    const drivers = new Set(changes.map((o) => truckById(draft[o.id]!).driver));
    toast.show({
      title: `배송 ${ids.length}건을 배차했습니다`,
      description: `기사 ${drivers.size}명의 앱에 경로를 보냈습니다`,
      tone: 'success',
    });
  };

  const sortByDistance = (t: Truck) => {
    const stops = routeOf(t);
    const fixed = stops.filter((o) => o.state === 'delivered' || o.state === 'shipping');
    const rest = stops
      .filter((o) => o.state !== 'delivered' && o.state !== 'shipping')
      .sort((a, b) => a.distanceKm - b.distanceKm);
    setRoutes((r) => ({ ...r, [t.id]: [...fixed, ...rest].map((o) => o.id) }));
    toast.show({
      title: `${t.plate} 경로를 거리순으로 정렬했습니다`,
      description: '출발 전 배송만 바꿉니다',
    });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '유통·물류' }, { label: '배송·배차' }]}
          title="배차"
          description={`${formatDate(TODAY, 'mdw')} · 배송 ${orders.length}건 · 차량 ${TRUCKS.length}대 · 출발 ${PLANT.name}`}
          actions={
            <>
              <ExportButton module="delivery" name="배차" rows={shown} columns={csv}>
                엑셀 다운로드
              </ExportButton>
              <Button icon="plus" disabled={!canDispatch}>
                배송 등록
              </Button>
            </>
          }
          tabs={
            <Tabs
              label="배송 상태"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: '전체', count: orders.length },
                ...(Object.keys(DELIVERY_STATES) as DeliveryState[]).map((s) => ({
                  value: s,
                  label: DELIVERY_STATES[s].label,
                  count: count(s),
                })),
              ]}
            />
          }
        />
      }
    >
      {hold.length > 0 && (
        <Banner tone="warning" title={`출고 보류 ${hold.length}건`}>
          {hold[0]!.id} {consigneeById(hold[0]!.consigneeId).name}: {hold[0]!.note}
        </Banner>
      )}
      <section
        className="tl-block-trucks"
        aria-label="차량"
        data-many={TRUCKS.length > 4 || undefined}
      >
        {TRUCKS.map((t) => {
          const load = loadOf(t);
          const ratio = load / t.capacityKg;
          const stops = onTruck(t).filter((o) => o.state !== 'delivered').length;
          return (
            <Card
              key={t.id}
              title={<span className="tl-block-code">{t.plate}</span>}
              subtitle={`${t.type} · ${t.carrier}`}
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  iconEnd="chevron-right"
                  onPress={() => setOpenTruck(t.id)}
                >
                  경로
                </Button>
              }
            >
              <div className="tl-block-truck">
                <span className="tl-block-truck__driver">
                  {t.driver} · {t.phone}
                </span>
                <Progress
                  label={`적재 ${formatQuantity(stops, '곳')}`}
                  value={load}
                  max={t.capacityKg}
                  unit="kg"
                  tone={ratio > 1 ? 'danger' : ratio > 0.9 ? 'warning' : undefined}
                />
                <span className="tl-block-truck__meta">
                  {t.tempNow != null ? (
                    <StatusDot size="sm" tone={withinCold(t.tempNow) ? 'success' : 'warning'}>
                      적재함 {fmtTemp(t.tempNow)}
                    </StatusDot>
                  ) : (
                    <StatusDot size="sm" tone="neutral">
                      상온 차량
                    </StatusDot>
                  )}
                  <span className="tl-block-muted">{t.round}</span>
                </span>
              </div>
            </Card>
          );
        })}
      </section>
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            label="배송 검색"
            placeholder="배송 번호 · 거래처 · 지역 · 품목"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setTab('all');
          setTemp('all');
        }}
        resultCount={shown.length}
      >
        <SegmentedControl
          size="sm"
          label="온도 구분"
          value={temp}
          onChange={setTemp}
          options={[
            { value: 'all', label: '전체' },
            { value: 'cold', label: COLD },
            { value: 'ambient', label: '상온' },
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="오늘 배송"
        height="fill"
        rows={shown}
        rowKey="id"
        rowTone={(o) =>
          mismatch.includes(o)
            ? 'danger'
            : o.state === 'hold'
              ? 'warning'
              : o.id in draft
                ? 'info'
                : undefined
        }
        empty="이 조건의 배송이 없습니다. 상태나 온도 구분을 바꿔 보세요"
        columns={[
          {
            key: 'id',
            header: '배송',
            width: 'md',
            sticky: true,
            render: (o) =>
              o.invoiceId ? (
                <DataGridLines
                  primary={<span className="tl-block-code">{o.id}</span>}
                  secondary={o.invoiceId}
                />
              ) : (
                <span className="tl-block-code">{o.id}</span>
              ),
          },
          {
            key: 'consignee',
            header: '거래처 · 품목',
            width: 'xl',
            render: (o) => (
              <DataGridLines primary={consigneeById(o.consigneeId).name} secondary={o.items} />
            ),
          },
          {
            key: 'region',
            header: '지역',
            width: 'sm',
            render: (o) => (
              <DataGridLines
                primary={consigneeById(o.consigneeId).region}
                secondary={formatQuantity(o.distanceKm, 'km')}
              />
            ),
          },
          {
            key: 'window',
            header: '도착 희망',
            width: 'sm',
            render: (o) => (
              <DataGridLines
                primary={<span className="tl-block-code">{o.window.replace(/^11-07 /, '')}</span>}
                secondary={
                  o.window.startsWith('11-07') ? '11-07 아침' : o.eta ? `예정 ${o.eta}` : '당일'
                }
              />
            ),
          },
          {
            key: 'weightKg',
            header: '중량',
            width: 'sm',
            align: 'right',
            sortable: true,
            value: (o) => o.weightKg,
            render: (o) => (
              <DataGridLines
                primary={<span className="tl-block-code">{formatQuantity(o.weightKg, 'kg')}</span>}
                secondary={formatQuantity(o.boxes, '박스')}
              />
            ),
          },
          {
            key: 'cold',
            header: '온도',
            width: 'sm',
            render: (o) => (
              <Badge variant="outline" tone={o.cold ? 'info' : 'neutral'} size="sm">
                {o.cold ? COLD : '상온'}
              </Badge>
            ),
          },
          {
            key: 'truck',
            header: '차량',
            width: 'lg',
            render: (o) => {
              const t = truckOf(o);
              if (!editable(o))
                return t ? (
                  <DataGridLines
                    primary={<span className="tl-block-code">{truckById(t).plate}</span>}
                    secondary={truckById(t).driver}
                  />
                ) : (
                  '–'
                );
              return (
                <Select
                  size="sm"
                  label={`${o.id} 차량`}
                  placeholder="차량 선택"
                  value={t}
                  invalid={mismatch.includes(o)}
                  disabled={!canDispatch}
                  onChange={(v) => setDraft((d) => ({ ...d, [o.id]: v }))}
                  options={TRUCKS.map((tr) => ({
                    value: tr.id,
                    label: `${tr.plate} · ${tr.cold ? COLD : '상온'}`,
                  }))}
                />
              );
            },
          },
          {
            key: 'state',
            header: '상태',
            width: 'sm',
            render: (o) =>
              o.id in draft && draft[o.id] !== o.truckId ? (
                <Badge tone="info" variant="outline">
                  확정 전
                </Badge>
              ) : (
                <Badge tone={DELIVERY_STATES[o.state].tone}>{DELIVERY_STATES[o.state].label}</Badge>
              ),
          },
        ]}
      />
      <ActionBar
        sticky
        summary={
          mismatch.length
            ? `${COLD} 화물 ${mismatch.length}건이 상온 차량에 배차되어 있습니다. ${COLD} 차량으로 바꾸세요`
            : over.length
              ? `${over[0]!.plate} 적재 한도를 ${formatQuantity(loadOf(over[0]!) - over[0]!.capacityKg, 'kg')} 넘습니다`
              : `배차 변경 ${changes.length}건 · 미배차 ${unassignedLeft.length}건`
        }
      >
        <Button
          variant="ghost"
          disabled={Object.keys(draft).length === 0}
          onPress={() => setDraft({})}
        >
          되돌리기
        </Button>
        <Button
          variant="primary"
          icon="truck"
          disabled={!canDispatch || changes.length === 0 || mismatch.length > 0 || over.length > 0}
          onPress={confirm}
        >
          {changes.length ? `${changes.length}건 배차 확정` : '배차 확정'}
        </Button>
      </ActionBar>
      <Drawer
        open={truck !== null}
        onOpenChange={(o) => !o && setOpenTruck(null)}
        title={truck ? `${truck.plate} 경로` : ''}
        description={truck ? `${truck.type} · ${truck.driver} · ${truck.round}` : ''}
        width="md"
        footer={
          truck && (
            <>
              <Button icon="arrow-up-down" onPress={() => sortByDistance(truck)}>
                거리순 정렬
              </Button>
              <Button
                variant="primary"
                icon="send"
                disabled={!canDispatch}
                onPress={() => {
                  toast.show({
                    title: '경로를 보냈습니다',
                    description: `${truck.driver} 기사 앱 · 배송 ${routeOf(truck).filter((o) => o.state !== 'delivered').length}곳`,
                    tone: 'success',
                  });
                  setOpenTruck(null);
                }}
              >
                기사 앱으로 보내기
              </Button>
            </>
          )
        }
      >
        {truck && (
          <div className="tl-block-drawer-stack">
            <DescriptionList
              columns={1}
              items={[
                {
                  label: '기사',
                  value: `${truck.driver} · ${truck.phone}`,
                  copyable: true,
                  copyText: truck.phone,
                },
                { label: '운송', value: `${truck.carrier} · ${truck.type}` },
                {
                  label: '적재',
                  value: `${formatQuantity(loadOf(truck), 'kg')} / ${formatQuantity(truck.capacityKg, 'kg')}`,
                },
                {
                  label: '적재함 온도',
                  value: truck.tempNow != null ? fmtTemp(truck.tempNow) : '상온 차량',
                },
              ]}
            />
            {routeOf(truck).some((o) => o.cold) && !truck.cold && (
              <Banner tone="danger">
                {COLD} 화물이 실려 있습니다. {COLD} 차량으로 바꾸세요.
              </Banner>
            )}
            <Stepper
              orientation="vertical"
              size="sm"
              label={`${truck.plate} 경로 순서`}
              steps={[
                {
                  id: 'depart',
                  label: `출발 · ${PLANT.name}`,
                  description: `${truck.departAt} 출발${truck.departAt <= NOW ? '' : ' 예정'}`,
                  state: truck.departAt <= NOW ? 'done' : 'current',
                },
                ...routeOf(truck).map((o, i, all) => {
                  const c = consigneeById(o.consigneeId);
                  const firstOpen = all.findIndex((x) => x.state !== 'delivered');
                  return {
                    id: o.id,
                    label: c.name,
                    description: `${c.region} · ${o.window} · ${formatQuantity(o.boxes, '박스')} ${formatQuantity(o.weightKg, 'kg')}${o.deliveredAt ? ` · ${o.deliveredAt} 배송 완료` : o.eta ? ` · 예정 ${o.eta}` : ''}`,
                    state:
                      o.state === 'delivered'
                        ? ('done' as const)
                        : o.state === 'shipping' && i === firstOpen
                          ? ('current' as const)
                          : ('todo' as const),
                  };
                }),
              ]}
            />
          </div>
        )}
      </Drawer>
    </Page>
  );
}
