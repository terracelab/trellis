// 자재 명세(ListDetail): 완제품 목록 · BOM 트리(원료 · 포장재 · 소모품) · 계획 수량으로 자재 소요 계산 · 부족 자재 발주 요청
import {
  formatAmount,
  formatDate,
  formatQuantity,
  STOCK_LEVELS,
  type StockLevel,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Button,
  Card,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  Field,
  PageHeader,
  QuantityInput,
  SegmentedControl,
  SelectableCard,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  BOMS,
  lineById,
  LINES,
  materialByCode,
  PLANT,
  PRODUCTS,
  WORK_ORDERS,
  type BomNode,
  type Material,
  type Product,
} from '../../../_data/mes-delivery.js';
import { PROFILE } from '../../../_data/profile.js';
import { itemById } from '../../../_data/trade.js';
import { useCan } from '../../../_platform/index.js';
import { ExportButton, Figure, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

interface TreeRow {
  key: string;
  level: 0 | 1 | 2;
  material: Material | null;
  product?: Product;
  qty: number;
  /** 완제품 1EA에 드는 양(부모 곱) */
  perUnit: number;
  need: number;
  leaf: boolean;
  stockLevel: StockLevel | null;
  short: number;
}

/** 남은 계획(진행 · 대기 · 보류 작업지시) */
const remainingPlan = (code: string) =>
  WORK_ORDERS.filter((w) => w.productCode === code && w.state !== 'done').reduce(
    (a, w) => a + w.planned - w.good,
    0,
  );
const defaultPlan = (code: string) => remainingPlan(code) || 500;
const unitDigits = (unit: string) => (unit === 'KG' ? 1 : 0);
const ceilTo = (v: number, digits: number) => Math.ceil(v * 10 ** digits - 1e-9) / 10 ** digits;
const qtyText = (v: number) =>
  formatAmount(v, { digits: v < 0.01 ? 4 : v < 1 ? 2 : v % 1 ? 2 : 0 });

/** 엑셀 다운로드 열(표와 같은 순서, 수량은 서식 없는 숫자). 재고 열 이름은 기준을 따른다 */
const bomCsv = (basis: 'available' | 'stock'): CsvColumn<TreeRow>[] => [
  { label: '단계', value: 'level' },
  { label: '코드', value: (r) => (r.product ? r.product.code : r.material!.code) },
  { label: '자재', value: (r) => (r.product ? r.product.name : r.material!.name) },
  { label: '규격', value: (r) => r.material?.spec ?? '' },
  { label: '구분', value: (r) => (r.product ? '완제품' : r.material!.kind) },
  { label: '단위', value: (r) => (r.product ? 'EA' : r.material!.unit) },
  { label: '소요량', value: 'qty' },
  { label: '계획 소요', value: (r) => (r.leaf || r.level === 0 ? r.need : null) },
  {
    label: basis === 'available' ? '가용재고' : '현재고',
    value: (r) => (basis === 'available' ? r.material?.available : r.material?.stock),
  },
  { label: '부족', value: (r) => (r.short > 0 ? r.short : null) },
  { label: '재고 상태', value: (r) => (r.stockLevel ? STOCK_LEVELS[r.stockLevel].label : '') },
];

function buildTree(p: Product, planned: number, basis: 'available' | 'stock'): TreeRow[] {
  const nodes = BOMS[p.code] ?? [];
  const rows: TreeRow[] = [
    {
      key: p.code,
      level: 0,
      material: null,
      product: p,
      qty: 1,
      perUnit: 1,
      need: planned,
      leaf: false,
      stockLevel: null,
      short: 0,
    },
  ];
  let parentQty = 1;
  nodes.forEach((n: BomNode, i) => {
    const m = materialByCode(n.code);
    if (n.level === 1) parentQty = n.qty;
    const perUnit = n.level === 1 ? n.qty : parentQty * n.qty;
    const leaf = nodes[i + 1]?.level !== 2 || n.level === 2;
    const need = ceilTo(planned * perUnit, unitDigits(m.unit));
    const have = basis === 'available' ? m.available : m.stock;
    const short = leaf && have != null ? Math.max(0, ceilTo(need - have, unitDigits(m.unit))) : 0;
    const stockLevel: StockLevel | null =
      !leaf || have == null ? null : have <= 0 ? 'out' : short > 0 ? 'low' : 'ok';
    rows.push({
      key: `${n.code}-${i}`,
      level: n.level,
      material: m,
      qty: n.qty,
      perUnit,
      need,
      leaf,
      stockLevel,
      short,
    });
  });
  return rows;
}

const shortages = (rows: TreeRow[]) => rows.filter((r) => r.short > 0);
const unitCost = (rows: TreeRow[]) =>
  rows.reduce((a, r) => a + (r.leaf && r.material ? r.material.cost * r.perUnit : 0), 0);

export default function Bom() {
  const toast = useToast();
  const canRequest = useCan('materials', 'create');
  const [code, setCode] = useState(PRODUCTS[0]!.code);
  const [plans, setPlans] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(PRODUCTS.map((p) => [p.code, defaultPlan(p.code)])),
  );
  const [basis, setBasis] = useState<'available' | 'stock'>('available');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const product = PRODUCTS.find((p) => p.code === code)!;
  const planned = plans[code] ?? 0;
  const rows = buildTree(product, planned, basis);
  const short = shortages(rows);
  const cost = unitCost(rows);
  const raw = itemById(product.rawItemId);
  const opened = rows.find((r) => r.key === openKey && r.material) ?? null;
  /** 같은 자재를 쓰는 완제품(사용처) */
  const usedIn = (materialCode: string) =>
    PRODUCTS.flatMap((p) => {
      const tree = buildTree(p, plans[p.code] ?? 0, basis);
      const hit = tree.find((r) => r.material?.code === materialCode);
      return hit ? [{ product: p, perUnit: hit.perUnit, need: hit.need }] : [];
    });

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '제조' }, { label: '자재' }]}
          title="자재 명세(BOM)"
          description={`완제품 ${PRODUCTS.length}종 · ${PLANT.name} 라인 ${LINES.length}개 · 소요량은 손실 포함`}
          actions={
            <>
              <ExportButton
                module="materials"
                name={`자재 명세 ${product.code}`}
                rows={rows}
                columns={bomCsv(basis)}
              >
                엑셀 다운로드
              </ExportButton>
              <Button icon="pencil" disabled={!canRequest}>
                BOM 수정
              </Button>
            </>
          }
        />
      }
    >
      <div className="tl-block-bom">
        <div className="tl-block-bom__products">
          <SelectableCard
            label="완제품"
            value={code}
            onChange={setCode}
            options={PRODUCTS.map((p) => {
              const s = shortages(buildTree(p, plans[p.code] ?? 0, basis));
              return {
                value: p.code,
                title: p.name,
                meta: (
                  <Badge tone={s.length ? STOCK_LEVELS.low.tone : STOCK_LEVELS.ok.tone}>
                    {s.length ? `${STOCK_LEVELS.low.label} ${s.length}종` : '자재 충분'}
                  </Badge>
                ),
                description: `${p.code} · BOM ${p.bomVersion} · ${lineById(p.lineId).name} · 계획 ${formatQuantity(plans[p.code] ?? 0, 'EA')}`,
                content: (
                  <span className="tl-block-bom-product__meta">
                    원료 {itemById(p.rawItemId).name} · {itemById(p.rawItemId).code}
                  </span>
                ),
              };
            })}
          />
        </div>

        <div className="tl-block-bom__detail">
          <Card
            title={product.name}
            subtitle={`${product.code} · ${product.spec} · BOM ${product.bomVersion} · ${lineById(product.lineId).name} · 시간당 ${formatQuantity(product.stdPerHour, 'EA')}`}
            action={
              <Badge tone={short.length ? STOCK_LEVELS.low.tone : STOCK_LEVELS.ok.tone}>
                {short.length ? `${STOCK_LEVELS.low.label} ${short.length}종` : '자재 충분'}
              </Badge>
            }
            padding="none"
          >
            <div className="tl-block-bom__calc">
              <Field
                label="계획 수량"
                help={`남은 작업지시 ${formatQuantity(remainingPlan(code), 'EA')}`}
              >
                <QuantityInput
                  value={plans[code] ?? null}
                  onChange={(v) => setPlans((m) => ({ ...m, [code]: v }))}
                  unit="EA"
                  step={100}
                  max={20_000}
                />
              </Field>
              <Field label="재고 기준">
                <SegmentedControl
                  value={basis}
                  onChange={(v) => setBasis(v as 'available' | 'stock')}
                  options={[
                    { value: 'available', label: '가용재고' },
                    { value: 'stock', label: '현재고' },
                  ]}
                />
              </Field>
              <div className="tl-block-bom__figures">
                <Figure label="표준 자재비" value={formatAmount(Math.round(cost))} unit="원/EA" />
                <Figure
                  label="계획 자재비"
                  value={formatAmount(Math.round(cost * planned))}
                  unit="원"
                />
                <Figure
                  label="원료 소요"
                  value={formatQuantity(rows.find((r) => r.material?.code === raw.code)?.need ?? 0)}
                  unit={raw.unit}
                />
              </div>
            </div>
            <DataGrid
              caption={`${product.name} 자재 명세`}
              rows={rows}
              rowKey="key"
              className="tl-block-flat-grid"
              onRowPress={(r) => r.material && setOpenKey(r.key)}
              activeRowKey={openKey}
              rowTone={(r) =>
                r.stockLevel === 'out' ? 'danger' : r.short > 0 ? 'warning' : undefined
              }
              columns={[
                {
                  key: 'name',
                  header: '자재',
                  width: 'xl',
                  render: (r) => (
                    <span className="tl-block-bom-node" data-level={r.level}>
                      <DataGridLines
                        primary={r.product ? r.product.name : r.material!.name}
                        secondary={
                          r.product
                            ? `${r.product.code} · 완제품 1EA 기준`
                            : `${r.material!.code} · ${r.material!.spec}`
                        }
                      />
                    </span>
                  ),
                },
                {
                  key: 'kind',
                  header: '구분',
                  width: 'xs',
                  render: (r) => (r.product ? '완제품' : r.material!.kind),
                },
                {
                  key: 'qty',
                  header: '소요량',
                  width: 'sm',
                  align: 'right',
                  render: (r) => (
                    <span className="tl-block-code">
                      {qtyText(r.qty)}
                      <span className="tl-block-bom-unit">
                        {r.product ? 'EA' : r.material!.unit}
                      </span>
                    </span>
                  ),
                },
                {
                  key: 'need',
                  header: '계획 소요',
                  width: 'sm',
                  align: 'right',
                  render: (r) =>
                    r.leaf || r.level === 0 ? (
                      <span className="tl-block-code">
                        {formatAmount(r.need, { digits: unitDigits(r.material?.unit ?? 'EA') })}
                        <span className="tl-block-bom-unit">{r.material?.unit ?? 'EA'}</span>
                      </span>
                    ) : (
                      <span className="tl-block-muted">하위 자재로 계산</span>
                    ),
                },
                {
                  key: 'have',
                  header: basis === 'available' ? '가용재고' : '현재고',
                  width: 'sm',
                  align: 'right',
                  render: (r) => {
                    const have = basis === 'available' ? r.material?.available : r.material?.stock;
                    return have != null && r.material ? (
                      <span className="tl-block-code">
                        {formatAmount(have)}
                        <span className="tl-block-bom-unit">{r.material.unit}</span>
                      </span>
                    ) : (
                      '–'
                    );
                  },
                },
                {
                  key: 'stockLevel',
                  header: '부족',
                  width: 'lg',
                  render: (r) =>
                    r.stockLevel ? (
                      <DataGridLines
                        primary={
                          <span className="tl-block-row" data-justify="start">
                            <Badge tone={STOCK_LEVELS[r.stockLevel].tone}>
                              {STOCK_LEVELS[r.stockLevel].label}
                            </Badge>
                            {r.short > 0 && (
                              <span className="tl-block-code">
                                {formatQuantity(r.short, r.material!.unit)}
                              </span>
                            )}
                          </span>
                        }
                        secondary={
                          r.short > 0 && (
                            <span>
                              {r.material?.incoming
                                ? `입고 예정 ${formatDate(r.material.incoming.date, 'md')} ${formatQuantity(r.material.incoming.qty, r.material.unit)}`
                                : '입고 예정 없음'}
                            </span>
                          )
                        }
                      />
                    ) : (
                      ''
                    ),
                },
              ]}
            />
          </Card>
          <ActionBar
            sticky
            summary={
              short.length
                ? `부족 ${short.length}종 · ${short
                    .map((r) => `${r.material!.name} ${formatQuantity(r.short, r.material!.unit)}`)
                    .join(' · ')}`
                : `계획 ${formatQuantity(planned, 'EA')} 기준 자재가 모두 있습니다`
            }
          >
            <Button
              variant="primary"
              icon="shopping-cart"
              disabled={!canRequest || short.length === 0}
              onPress={() =>
                toast.show({
                  title: `부족 자재 ${short.length}종을 발주 요청했습니다`,
                  description: `${PROFILE.people.purchase}에게 보냈습니다 · ${short
                    .map((r) => `${r.material!.code} ${formatQuantity(r.short, r.material!.unit)}`)
                    .join(' · ')}`,
                  tone: 'success',
                })
              }
            >
              발주 요청
            </Button>
          </ActionBar>
        </div>
      </div>
      <Drawer
        open={opened !== null}
        onOpenChange={(o) => !o && setOpenKey(null)}
        title={opened?.material?.name ?? ''}
        description={
          opened?.material
            ? `${opened.material.code} · ${opened.material.spec} · ${opened.material.kind}`
            : ''
        }
        width="md"
        actions={
          opened?.stockLevel && (
            <Badge tone={STOCK_LEVELS[opened.stockLevel].tone}>
              {STOCK_LEVELS[opened.stockLevel].label}
            </Badge>
          )
        }
      >
        {opened?.material && (
          <div className="tl-block-drawer-stack">
            <DescriptionList
              columns={1}
              items={[
                {
                  label: '현재고',
                  value:
                    opened.material.stock != null
                      ? formatQuantity(opened.material.stock, opened.material.unit)
                      : '재고를 두지 않습니다',
                },
                {
                  label: '가용재고',
                  value:
                    opened.material.available != null
                      ? formatQuantity(opened.material.available, opened.material.unit)
                      : '–',
                },
                {
                  label: '단위 원가',
                  value: opened.material.cost ? `${formatAmount(opened.material.cost)}원` : '–',
                },
                {
                  label: '입고 예정',
                  value: opened.material.incoming
                    ? `${formatDate(opened.material.incoming.date)} · ${formatQuantity(opened.material.incoming.qty, opened.material.unit)} · ${opened.material.incoming.ref}`
                    : '없음',
                },
                {
                  label: '이 제품 소요',
                  value: `1EA당 ${qtyText(opened.perUnit)}${opened.material.unit} · 계획 ${formatQuantity(planned, 'EA')}에 ${formatAmount(opened.need, { digits: unitDigits(opened.material.unit) })}${opened.material.unit}`,
                },
              ]}
            />
            <DataGrid
              caption="사용처"
              rows={usedIn(opened.material.code).map((u) => ({ ...u, code: u.product.code }))}
              rowKey="code"
              summary
              columns={[
                {
                  key: 'code',
                  header: '사용처',
                  render: (u) => (
                    <DataGridLines
                      primary={u.product.name}
                      secondary={
                        <>
                          {u.product.code} · 계획 {formatQuantity(plans[u.product.code] ?? 0, 'EA')}
                        </>
                      }
                    />
                  ),
                },
                {
                  key: 'perUnit',
                  header: '1EA당',
                  width: 'sm',
                  align: 'right',
                  render: (u) => qtyText(u.perUnit),
                },
                {
                  key: 'need',
                  header: '계획 소요',
                  width: 'sm',
                  format: 'number',
                  unit: opened.material!.unit,
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
