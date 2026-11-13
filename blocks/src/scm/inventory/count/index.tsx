// 재고 실사(WarehouseScan): 구역별 실사표(장부 · 실사 · 차이 · 사유)와 조정 내역. 위치는 CodeSearch(창고 · 구역 · 선반)로
// 고르고, ScanField로 선반 · 품목 바코드를 읽는다. 실사 수량은 포장 단위로 세고(QuantityInput factor) 차이는 기준 단위
import {
  formatAmount,
  formatDate,
  formatQuantity,
  toBaseQuantity,
  type CodeOption,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Button,
  Card,
  CodeSearch,
  DataGrid,
  DataGridLines,
  Field,
  KpiCard,
  PageHeader,
  QuantityInput,
  ScanField,
  Select,
  SelectableList,
  useBreakpoint,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import { itemById, sum, warehouseById } from '../../../_data/index.js';
import {
  BIN_STOCK,
  COUNT,
  COUNT_REASONS,
  LOCATIONS,
  locationByCode,
  locationPlace,
  unitsOf,
  ZONES,
  zoneOf,
  type CountLine,
  type CountReason,
} from '../../../_data/warehouse.js';
import { useCan } from '../../../_platform/index.js';
import { Col, ExportButton, Grid, Lines, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

type Row = CountLine & { base: number | null; diff: number | null; value: number };

/** 구역 key(창고 + 구역 문자) */
const zoneKey = (warehouseId: string, zone: string) => `${warehouseId}-${zone}`;
/** 실사 수량(기준 단위). 안 셌으면 null */
const baseOf = (l: CountLine) => toBaseQuantity(l.counted, l.unit, unitsOf(l.itemId));
const enrich = (l: CountLine): Row => {
  const base = baseOf(l);
  const diff = base == null ? null : base - l.book;
  return { ...l, base, diff, value: (diff ?? 0) * itemById(l.itemId).cost };
};
const signedQty = (v: number, unit: string) => `${formatAmount(v, { sign: 'always' })}${unit}`;

// slot: locations — 위치 고르기 선택지(창고 · 구역 · 선반). 코드 = 창고-구역-선반, 보조 = 창고 · 구역 이름
const LOCATION_OPTIONS: readonly CodeOption[] = LOCATIONS.map((l) => ({
  value: l.code,
  label: `${l.zone}구역 ${l.shelf}선반`,
  description: locationPlace(l),
  meta: `품목 ${BIN_STOCK.filter((b) => b.location === l.code).length}`,
}));
// slot: locations end

const CSV: CsvColumn<Row>[] = [
  { label: '위치', value: 'location' },
  { label: '품목 코드', value: (r) => itemById(r.itemId).code },
  { label: '품목', value: (r) => itemById(r.itemId).name },
  { label: '로트', value: (r) => r.lot ?? '' },
  { label: '단위', value: (r) => itemById(r.itemId).unit },
  { label: '장부', value: 'book' },
  { label: '실사', value: (r) => r.base ?? '' },
  { label: '차이', value: (r) => r.diff ?? '' },
  { label: '조정 금액(원)', value: 'value' },
  {
    label: '사유',
    value: (r) => COUNT_REASONS.find((x) => x.value === r.reason)?.label ?? '',
  },
];

export default function InventoryCount() {
  const toast = useToast();
  const phone = useBreakpoint() === 'base';
  const canAdjust = useCan('inventory', 'update');
  const [lines, setLines] = useState<CountLine[]>(() => COUNT.lines.map((l) => ({ ...l })));
  const [zone, setZone] = useState(zoneKey('w1', 'B'));
  const [shelf, setShelf] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);
  const rows = useMemo(() => lines.map(enrich), [lines]);
  const zoneRows = rows.filter((r) => {
    const l = locationByCode(r.location);
    return zoneKey(l.warehouseId, l.zone) === zone;
  });
  const counted = rows.filter((r) => r.counted != null);
  const diffs = rows.filter((r) => r.diff != null && r.diff !== 0);
  const missingReason = diffs.filter((r) => !r.reason);
  const up = sum(
    diffs.filter((r) => r.value > 0),
    (r) => r.value,
  );
  const down = sum(
    diffs.filter((r) => r.value < 0),
    (r) => r.value,
  );
  const zoneInfo = ZONES.find((z) => zoneKey(z.warehouseId, z.code) === zone)!;
  const zoneTitle = `${zoneInfo.code}구역 ${zoneInfo.name}`;
  const setLine = (id: string, patch: Partial<CountLine>) =>
    setLines((list) => list.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const setReason = (id: string, reason: CountReason | null) =>
    setLines((list) =>
      list.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l };
        if (reason) next.reason = reason;
        else delete next.reason;
        return next;
      }),
    );
  const pickShelf = (code: string | null) => {
    setShelf(code);
    if (!code) return;
    const l = locationByCode(code);
    setZone(zoneKey(l.warehouseId, l.zone));
    const first = lines.find((x) => x.location === code);
    if (first) setFlash(first.id);
  };
  const onScan = (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (LOCATIONS.some((l) => l.code === code)) {
      pickShelf(code);
      return;
    }
    const hit = lines.find((l) => itemById(l.itemId).code === code);
    if (hit) {
      pickShelf(hit.location);
      setFlash(hit.id);
      toast.show({
        title: `${hit.location} ${itemById(hit.itemId).name}`,
        description: '실사 수량을 입력하세요',
      });
      return;
    }
    toast.show({
      title: `${raw} 바코드를 찾지 못했습니다`,
      description: '선반 코드(W1-A-02) 또는 품목 코드를 스캔하세요',
      tone: 'warning',
    });
  };
  const zoneItems = ZONES.map((z) => {
    const key = zoneKey(z.warehouseId, z.code);
    const list = rows.filter((r) => {
      const l = locationByCode(r.location);
      return zoneKey(l.warehouseId, l.zone) === key;
    });
    const shelves = new Set(list.map((r) => r.location)).size;
    return {
      id: key,
      group: `${warehouseById(z.warehouseId).name} · ${warehouseById(z.warehouseId).kind}`,
      title: `${z.code}구역 ${z.name}`,
      secondary: `선반 ${shelves}곳 · 차이 ${list.filter((r) => r.diff).length}건`,
      value: `${list.filter((r) => r.counted != null).length}/${list.length}`,
    };
  });

  const qtyInput = (r: Row, size: 'sm' | 'md') => (
    <QuantityInput
      label={`${r.location} ${itemById(r.itemId).name} 실사 수량`}
      size={size}
      value={r.counted}
      onChange={(v) => setLine(r.id, { counted: v })}
      unit={r.unit}
      units={unitsOf(r.itemId)}
      onUnitChange={(u) => setLine(r.id, { unit: u })}
      digits={0}
      showStepper={phone}
      disabled={posted || !canAdjust}
    />
  );
  const reasonSelect = (r: Row, size: 'sm' | 'md') =>
    r.diff ? (
      <Select
        label={`${itemById(r.itemId).name} 차이 사유`}
        size={size}
        placeholder="사유"
        value={r.reason ?? null}
        onChange={(v) => setReason(r.id, v as CountReason | null)}
        options={COUNT_REASONS.map((x) => ({ value: x.value, label: x.label }))}
        invalid={!r.reason}
        disabled={posted || !canAdjust}
      />
    ) : null;
  const diffText = (r: Row) =>
    r.diff == null ? (
      <span className="tl-block-muted">안 셈</span>
    ) : r.diff === 0 ? (
      '0'
    ) : (
      signedQty(r.diff, itemById(r.itemId).unit)
    );

  const kpis = (
    <>
      <Col span={3}>
        <KpiCard
          label="센 줄"
          value={counted.length}
          format="number"
          unit="줄"
          caption={`전체 ${rows.length}줄 · 위치 ${LOCATIONS.length}곳`}
          icon="clipboard-check"
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label="차이"
          value={diffs.length}
          format="number"
          unit="건"
          caption={missingReason.length ? `사유 미입력 ${missingReason.length}건` : '사유 입력 끝'}
          icon="scale"
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label="감소 금액"
          value={down}
          format="amount"
          unit="원"
          caption="장부보다 적게 센 수량 × 평균 원가"
          icon="trending-down"
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label="증가 금액"
          value={up}
          format="amount"
          unit="원"
          caption="장부보다 많이 센 수량 × 평균 원가"
          icon="trending-up"
        />
      </Col>
    </>
  );

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '유통·물류' }, { label: '재고' }, { label: '재고 실사' }]}
          title="재고 실사"
          meta={
            posted ? <Badge tone="success">조정 반영</Badge> : <Badge tone="info">실사 중</Badge>
          }
          description={`${COUNT.title} ${COUNT.id} · ${COUNT.warehouseIds.map((w) => warehouseById(w).name).join(' · ')} · 장부는 ${formatDate(COUNT.bookAt.slice(0, 10), 'md')} ${COUNT.bookAt.slice(11)} 재고 마감 기준`}
          actions={
            <ExportButton
              module="inventory"
              name={`재고 실사 ${COUNT.id}`}
              rows={rows}
              columns={CSV}
            >
              엑셀 다운로드
            </ExportButton>
          }
        />
      }
    >
      <Grid>
        {!phone && kpis}
        {!phone && (
          <Col span={3}>
            <Card title="구역" subtitle="센 줄 / 전체 줄" padding="none">
              <div className="tl-block-count-zones">
                <SelectableList
                  label="실사 구역"
                  size="md"
                  items={zoneItems}
                  selected={zone}
                  onSelect={(id) => {
                    setZone(id);
                    setShelf(null);
                  }}
                />
              </div>
            </Card>
          </Col>
        )}
        <Col span={phone ? 12 : 9}>
          <Card
            title={`${zoneTitle} 실사표`}
            subtitle={`${warehouseById(zoneInfo.warehouseId).name} · ${zoneRows.filter((r) => r.counted != null).length}/${zoneRows.length}줄 셈 · 수량은 포장 단위로 세도 됩니다`}
          >
            <div className="tl-block-count-tools">
              <Field label="위치">
                <CodeSearch
                  options={LOCATION_OPTIONS}
                  value={shelf}
                  onChange={pickShelf}
                  placeholder="W1-B-02"
                />
              </Field>
              <ScanField
                label="바코드 스캔"
                placeholder="선반 또는 품목 바코드를 스캔하세요"
                keepFocus={false}
                size={phone ? 'lg' : 'md'}
                disabled={posted}
                onScan={onScan}
              />
              {phone && (
                <Field label="구역">
                  <Select
                    value={zone}
                    onChange={(v) => v && setZone(v)}
                    options={zoneItems.map((z) => ({
                      value: z.id,
                      label: `${z.title} · ${z.value}`,
                    }))}
                  />
                </Field>
              )}
            </div>
            {phone ? (
              <ul className="tl-block-count-lines">
                {zoneRows.map((r) => {
                  const item = itemById(r.itemId);
                  return (
                    <li
                      key={r.id}
                      className="tl-block-count-line"
                      data-flash={flash === r.id || undefined}
                    >
                      <div className="tl-block-count-line__head">
                        <Lines
                          primary={item.name}
                          secondary={`${r.location} · ${item.code}${r.lot ? ` · ${r.lot}` : ''}`}
                        />
                        <Lines
                          align="end"
                          primary={diffText(r)}
                          secondary={`장부 ${formatQuantity(r.book, item.unit)}`}
                        />
                      </div>
                      {qtyInput(r, 'md')}
                      {reasonSelect(r, 'md')}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <DataGrid
                caption={`${zoneTitle} 실사표`}
                className="tl-block-count-grid"
                rows={zoneRows}
                rowKey="id"
                flashKey={flash}
                scrollToKey={flash}
                dividers="rows"
                columns={[
                  {
                    key: 'location',
                    header: '위치',
                    width: 'sm',
                    render: (r) => (
                      <span
                        className="tl-block-code"
                        data-current={r.location === shelf || undefined}
                      >
                        {r.location}
                      </span>
                    ),
                  },
                  {
                    key: 'itemId',
                    header: '품목',
                    render: (r) => {
                      const item = itemById(r.itemId);
                      return (
                        <DataGridLines
                          primary={item.name}
                          secondary={`${item.code} · ${item.spec}${r.lot ? ` · ${r.lot}` : ''}`}
                        />
                      );
                    },
                  },
                  {
                    key: 'book',
                    header: '장부',
                    width: 'sm',
                    align: 'right',
                    render: (r) => formatQuantity(r.book, itemById(r.itemId).unit),
                  },
                  {
                    key: 'counted',
                    header: '실사',
                    width: 'lg',
                    render: (r) => qtyInput(r, 'sm'),
                  },
                  {
                    key: 'diff',
                    header: '차이',
                    width: 'sm',
                    align: 'right',
                    finance: true,
                    value: (r) => r.diff ?? 0,
                    render: diffText,
                  },
                  {
                    key: 'reason',
                    header: '사유',
                    width: 'md',
                    render: (r) =>
                      reasonSelect(r, 'sm') ?? <span className="tl-block-muted">–</span>,
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        {/* 휴대폰은 실사표가 먼저, 숫자 요약은 그 아래 */}
        {phone && kpis}
        <Col span={12}>
          <Card
            title="조정 내역"
            subtitle={`차이 ${diffs.length}건 · 조정 금액 = 차이 × 평균 원가 · 단위 원`}
            padding="none"
          >
            <DataGrid
              caption="조정 내역"
              className="tl-block-flat-grid"
              rows={diffs}
              rowKey="id"
              summary
              empty="아직 차이가 없습니다. 실사 수량을 넣으면 여기에 모입니다"
              columns={[
                {
                  key: 'location',
                  header: '위치',
                  width: 'sm',
                  mobile: 'meta',
                  render: (r) => <span className="tl-block-code">{r.location}</span>,
                },
                {
                  key: 'itemId',
                  header: '품목',
                  mobile: 'title',
                  render: (r) => (
                    <DataGridLines
                      primary={itemById(r.itemId).name}
                      secondary={zoneOf(locationByCode(r.location)).name}
                    />
                  ),
                },
                {
                  key: 'book',
                  header: '장부',
                  width: 'sm',
                  align: 'right',
                  mobile: 'hidden',
                  render: (r) => formatQuantity(r.book, itemById(r.itemId).unit),
                },
                {
                  key: 'base',
                  header: '실사',
                  width: 'sm',
                  align: 'right',
                  mobile: 'hidden',
                  render: (r) => formatQuantity(r.base ?? 0, itemById(r.itemId).unit),
                },
                {
                  key: 'diff',
                  header: '차이',
                  width: 'sm',
                  align: 'right',
                  finance: true,
                  mobile: 'meta',
                  value: (r) => r.diff ?? 0,
                  render: diffText,
                },
                {
                  key: 'reason',
                  header: '사유',
                  width: 'md',
                  mobile: 'meta',
                  render: (r) =>
                    COUNT_REASONS.find((x) => x.value === r.reason)?.label ?? (
                      <span className="tl-block-muted">미입력</span>
                    ),
                },
                {
                  key: 'value',
                  header: '조정 금액',
                  width: 'md',
                  format: 'amount',
                  headerUnit: false,
                  finance: true,
                  total: 'sum',
                  mobile: 'trailing',
                },
              ]}
            />
          </Card>
        </Col>
      </Grid>

      {!posted && (
        <ActionBar
          sticky
          summary={
            missingReason.length
              ? `차이 ${diffs.length}건 중 사유 미입력 ${missingReason.length}건`
              : `차이 ${diffs.length}건 · 조정 금액 ${formatAmount(up + down, { sign: 'always' })}원`
          }
        >
          <Button
            variant="primary"
            icon="clipboard-check"
            disabled={!canAdjust || diffs.length === 0 || missingReason.length > 0}
            {...(missingReason.length
              ? { disabledReason: '차이마다 사유를 고르면 반영할 수 있습니다' }
              : !canAdjust
                ? { disabledReason: '재고를 조정할 권한이 없습니다' }
                : {})}
            onPress={() => {
              setPosted(true);
              toast.show({
                title: `재고 조정 ${diffs.length}건을 반영했습니다`,
                description: `조정 금액 ${formatAmount(up + down, { sign: 'always' })}원 · 재고 조정 전표를 만들었습니다`,
                tone: 'success',
              });
            }}
          >
            조정 반영
          </Button>
        </ActionBar>
      )}
    </Page>
  );
}
