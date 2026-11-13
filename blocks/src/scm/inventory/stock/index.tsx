// 재고 현황(InventoryMatrix): 품목 × 창고, 가용 · 안전재고 · 수준
import {
  dueDays,
  formatAmount,
  formatDate,
  formatQuantity,
  STOCK_LEVELS,
  type StockLevel,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Button,
  DataBar,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  FilterBar,
  HeatCell,
  Input,
  KpiCard,
  PageHeader,
  SegmentedControl,
  Select,
  Timeline,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  INVENTORY_VALUE,
  ITEMS,
  LOW_STOCK,
  partyById,
  RECEIPTS,
  STOCK,
  TODAY,
  WAREHOUSES,
  availableOf,
  stockOf,
  type Item,
} from '../../../_data/index.js';
import { SALES_ORDERS } from '../../../_data/erp.js';
import { PROFILE } from '../../../_data/profile.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import { addDays, Col, ExportButton, Grid, Page, type CsvColumn } from '../../../_ui/index.js';

/** 유통기한 주의 기준 안의 로트(남은 날 짧은 순) */
const WARN = PROFILE.lotWarnDays;
const EXPIRING = STOCK.flatMap((s) =>
  s.lots
    .filter((l) => l.qty > 0 && l.expiry && dueDays(l.expiry, TODAY) <= WARN)
    .map((l) => ({ ...l, itemId: s.itemId })),
).sort((a, b) => (a.expiry ?? '').localeCompare(b.expiry ?? ''));
/** 전날(재고 마감 배치가 23:30에 돈다) */
const YESTERDAY = addDays(TODAY, -1);

const levelOf = (i: Item): StockLevel => {
  const q = stockOf(i.id);
  if (q === 0) return 'out';
  if (q < i.safetyStock) return 'low';
  if (EXPIRING.some((l) => l.itemId === i.id)) return 'expiring';
  if (q > i.safetyStock * 6) return 'over';
  return 'ok';
};

/** 품목의 최근 움직임: 출고 예약(수주) · 재고 마감 · 마지막 입고 */
function movesOf(item: Item) {
  const reserved = STOCK.filter((s) => s.itemId === item.id).reduce((a, s) => a + s.reserved, 0);
  const order = SALES_ORDERS.find(
    (o) =>
      (o.stage === 'ordered' || o.stage === 'shipping') &&
      o.lines.some((l) => l.itemId === item.id),
  );
  const receipt = RECEIPTS.filter(
    (g) => g.state === 'received' && g.arrivedAt && g.lines.some((l) => l.itemId === item.id),
  ).sort((a, b) => (b.arrivedAt ?? '').localeCompare(a.arrivedAt ?? ''))[0];
  return [
    ...(reserved
      ? [
          {
            id: 'm1',
            title: `출고 예약 ${formatQuantity(reserved, item.unit)}`,
            time: order?.date ?? TODAY,
            ...(order
              ? {
                  description: `${partyById(order.partyId).name} 주문 · ${formatDate(order.dueDate, 'md')} 출고`,
                }
              : {}),
            tone: 'info' as const,
            icon: 'truck' as const,
          },
        ]
      : []),
    {
      id: 'm2',
      title: '재고 마감',
      time: `${YESTERDAY} 23:30`,
      tone: 'neutral' as const,
      icon: 'clipboard-check' as const,
    },
    ...(receipt
      ? [
          {
            id: 'm3',
            title: '입고',
            time: receipt.arrivedAt ?? receipt.expectedAt,
            description: receipt.id,
            tone: 'success' as const,
            icon: 'package-check' as const,
          },
        ]
      : []),
  ];
}

export default function StockView() {
  const canAdjust = useCan('inventory', 'update');
  const screens = useScreens();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [level, setLevel] = useState<string | null>('all');
  const [open, setOpen] = useState<Item | null>(null);
  const rows = useMemo(
    () =>
      ITEMS.map((i) => ({
        ...i,
        total: stockOf(i.id),
        available: availableOf(i.id),
        value: stockOf(i.id) * i.cost,
        level: levelOf(i),
        ...Object.fromEntries(
          WAREHOUSES.map((w) => [
            w.id,
            STOCK.find((s) => s.itemId === i.id && s.warehouseId === w.id)?.qty ?? null,
          ]),
        ),
      })).filter(
        (r) =>
          (cat === 'all' || r.category === cat) &&
          (level === 'all' || !level || r.level === level) &&
          (!q || `${r.code}${r.name}`.includes(q)),
      ),
    [q, cat, level],
  );
  const maxQty = Math.max(...rows.map((r) => r.total), 1);
  /** 엑셀 다운로드 열(표와 같은 순서, 창고별 수량 · 평가액은 서식 없는 숫자) */
  const csv: CsvColumn<(typeof rows)[number]>[] = [
    { label: '코드', value: 'code' },
    { label: '품목', value: 'name' },
    { label: '규격', value: 'spec' },
    { label: '원산지', value: 'origin' },
    { label: '단위', value: 'unit' },
    ...WAREHOUSES.map((w): CsvColumn<(typeof rows)[number]> => ({
      label: w.name,
      value: (r) => (r as unknown as Record<string, number | null>)[w.id],
    })),
    { label: '합계', value: 'total' },
    { label: '가용', value: 'available' },
    { label: '안전재고', value: 'safetyStock' },
    { label: '평가액(원)', value: 'value' },
    { label: '상태', value: (r) => STOCK_LEVELS[r.level].label },
  ];
  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '유통·물류' }, { label: '재고' }]}
          title="재고 현황"
          description={`재고 마감 ${TODAY} 23:30 기준 · 창고 ${WAREHOUSES.length}곳`}
          actions={
            <>
              <ExportButton module="inventory" name="재고 현황" rows={rows} columns={csv}>
                엑셀 다운로드
              </ExportButton>
              <Button variant="primary" icon="sliders-horizontal" disabled={!canAdjust}>
                재고 조정
              </Button>
            </>
          }
        />
      }
    >
      <Grid>
        <Col span={3}>
          <KpiCard
            label="품목"
            value={ITEMS.length}
            unit="개"
            caption="로트 관리 5품목"
            icon="package"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="재고 평가액"
            value={INVENTORY_VALUE}
            format="amount"
            unit="원"
            caption="평균 원가 기준"
            icon="coins"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="안전재고 미만"
            value={LOW_STOCK.length}
            unit="품목"
            caption="발주 검토 필요"
            icon="triangle-alert"
            onPress={() => setLevel('low')}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={`유통기한 ${WARN}일 이내`}
            value={EXPIRING.length}
            unit="로트"
            caption={
              EXPIRING[0] ? `${EXPIRING[0].lot} · ${formatDate(EXPIRING[0].expiry!, 'md')}` : '없음'
            }
            icon="timer"
            {...(screens.has('scm/inventory/lots')
              ? { onPress: () => screens.go('scm/inventory/lots') }
              : {})}
          />
        </Col>
      </Grid>
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="품목 코드 · 품목명"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        resultCount={rows.length}
        onReset={() => {
          setQ('');
          setCat('all');
          setLevel('all');
        }}
      >
        <SegmentedControl
          size="sm"
          value={cat}
          onChange={setCat}
          options={[
            { value: 'all', label: '전체' },
            { value: '수입 식자재', label: '수입 식자재' },
            { value: '포장재', label: '포장재' },
            { value: '소모품', label: '소모품' },
          ]}
        />
        <Select
          size="sm"
          width="auto"
          label="재고 수준"
          value={level}
          onChange={setLevel}
          options={[
            { value: 'all', label: '수준 전체' },
            ...(Object.keys(STOCK_LEVELS) as StockLevel[]).map((k) => ({
              value: k,
              label: STOCK_LEVELS[k].label,
            })),
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="재고 현황"
        height="fill"
        rows={rows}
        rowKey="id"
        onRowPress={setOpen}
        activeRowKey={open?.id ?? null}
        summary
        rowTone={(r) => (r.level === 'low' || r.level === 'out' ? 'warning' : undefined)}
        columns={[
          {
            key: 'code',
            header: '코드',
            width: 'sm',
            sticky: true,
            render: (r) => <span className="tl-block-code">{r.code}</span>,
          },
          {
            key: 'name',
            header: '품목',
            sortable: true,
            render: (r) => (
              <DataGridLines
                primary={r.name}
                secondary={
                  <>
                    {r.spec} · {r.origin}
                  </>
                }
              />
            ),
          },
          ...WAREHOUSES.map((w) => ({
            key: w.id,
            header: w.name.replace(' 보세창고', ' 보세'),
            width: 'sm' as const,
            align: 'right' as const,
            render: (r: (typeof rows)[number]) => (
              <HeatCell
                value={(r as unknown as Record<string, number | null>)[w.id]}
                max={maxQty}
                unit={r.unit}
                empty="–"
              />
            ),
          })),
          { key: 'total', header: '합계', width: 'sm', format: 'quantity', sortable: true },
          {
            key: 'safety',
            header: '안전재고 대비',
            width: 'lg',
            render: (r) => (
              <DataBar
                value={r.total}
                max={Math.max(r.total, r.safetyStock * 1.5)}
                marker={r.safetyStock}
                warnBelow={r.safetyStock}
                label={`${r.name} 안전재고 대비`}
              />
            ),
          },
          {
            key: 'value',
            header: '평가액',
            width: 'md',
            format: 'amount',
            total: 'sum',
            sortable: true,
          },
          {
            key: 'level',
            header: '상태',
            width: 'sm',
            render: (r) => (
              <Badge tone={STOCK_LEVELS[r.level].tone}>{STOCK_LEVELS[r.level].label}</Badge>
            ),
          },
        ]}
      />
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open ? `${open.name} · ${open.spec}` : ''}
        description={open ? `${open.code} · ${open.category} · HS ${open.hsCode ?? '–'}` : ''}
        width="lg"
        footer={
          open &&
          screens.has('erp/purchasing/po-form') && (
            <Button
              variant="primary"
              icon="file-plus"
              onPress={() => screens.go('erp/purchasing/po-form')}
            >
              발주서 작성
            </Button>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            <DescriptionList
              columns={3}
              items={[
                { label: '현재고', value: formatQuantity(stockOf(open.id), open.unit) },
                { label: '가용', value: formatQuantity(availableOf(open.id), open.unit) },
                { label: '안전재고', value: formatQuantity(open.safetyStock, open.unit) },
                { label: '판매 단가', value: `${formatAmount(open.price)}원` },
                { label: '평균 원가', value: `${formatAmount(open.cost)}원` },
                { label: '원산지', value: open.origin },
              ]}
            />
            <DataGrid
              caption="창고 · 로트"
              rows={STOCK.filter((s) => s.itemId === open.id).flatMap((s) =>
                s.lots.length
                  ? s.lots.map((l) => ({
                      key: `${s.warehouseId}-${l.lot}`,
                      wh: WAREHOUSES.find((w) => w.id === s.warehouseId)!.name,
                      lot: l.lot,
                      qty: l.qty,
                      expiry: l.expiry ?? '',
                    }))
                  : [
                      {
                        key: s.warehouseId,
                        wh: WAREHOUSES.find((w) => w.id === s.warehouseId)!.name,
                        lot: '–',
                        qty: s.qty,
                        expiry: '',
                      },
                    ],
              )}
              rowKey="key"
              columns={[
                { key: 'wh', header: '창고' },
                { key: 'lot', header: '로트', width: 'md' },
                { key: 'qty', header: '수량', width: 'sm', format: 'quantity', unit: open.unit },
                { key: 'expiry', header: '유통기한', width: 'md', format: 'date' },
              ]}
            />
            <Timeline dense items={movesOf(open)} />
          </div>
        )}
      </Drawer>
    </Page>
  );
}
