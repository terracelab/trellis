// 생산 실적 등록(WarehouseScan): 라인별 오늘 작업지시 → 원료 로트 스캔 → 시작 · 정지 → 양품 · 불량 입력 → 실적 저장
import {
  dueDays,
  formatDate,
  formatPercent,
  formatQuantity,
  MACHINE_STATES,
  PROGRESS_STATES,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Banner,
  Button,
  Card,
  DueBadge,
  EmptyState,
  Field,
  PageHeader,
  Progress,
  QuantityInput,
  ScanField,
  SegmentedControl,
  SelectableCard,
  StatusDot,
  Tabs,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  DEFECT_TYPES,
  defectLabel,
  EQUIPMENT,
  lineById,
  LINES,
  OUTPUT_LOG,
  PLANT,
  productByCode,
  RAW_LOTS,
  WORK_ORDERS,
  type DefectType,
  type LineId,
  type WorkOrder,
} from '../../../_data/mes-delivery.js';
import { itemById, TODAY } from '../../../_data/trade.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import { Figure, Lines, Page, Split } from '../../../_ui/index.js';
import './style.css';

type LogEntry = (typeof OUTPUT_LOG)[number];

/** 현장 터치용 짧은 칸 이름: 불량 이름의 첫 낱말(실링 불량 → 실링). 저장 · 이력은 전체 이름 */
const defectShort = (k: DefectType) => defectLabel(k).split(' ')[0] ?? k;
const DEFECT_KEYS = Object.keys(DEFECT_TYPES);
const FIRST_LINE = LINES[0]!.id;
/** 처음 고른 작업지시: 첫 라인에서 진행 중인 것(없으면 그 라인의 첫 작업지시) */
const FIRST_ORDER =
  WORK_ORDERS.find((w) => w.lineId === FIRST_LINE && w.state === 'doing') ??
  WORK_ORDERS.find((w) => w.lineId === FIRST_LINE);
/** 시작한 작업지시는 투입 원료 로트가 이미 스캔되어 있다 */
const STARTED_LOTS = Object.fromEntries(
  WORK_ORDERS.filter((w) => w.state === 'doing' || w.state === 'done').map((w) => [
    w.id,
    [w.rawLot],
  ]),
);

const yieldOf = (w: WorkOrder) =>
  w.good + w.defect > 0 ? formatPercent((w.good / (w.good + w.defect)) * 100) : '–';

export default function WorkOrders() {
  const toast = useToast();
  const canRecord = useCan('shop-floor', 'update');
  const screens = useScreens();
  const [orders, setOrders] = useState<WorkOrder[]>(() =>
    WORK_ORDERS.map((w) => ({ ...w, defects: { ...w.defects } })),
  );
  const [line, setLine] = useState<LineId>(FIRST_LINE);
  const [activeId, setActiveId] = useState<string | null>(FIRST_ORDER?.id ?? null);
  const [good, setGood] = useState<number | null>(48);
  const [defect, setDefect] = useState<number | null>(2);
  const [type, setType] = useState<DefectType>(DEFECT_KEYS[0] ?? '');
  const [lots, setLots] = useState<Record<string, string[]>>(STARTED_LOTS);
  const [log, setLog] = useState<LogEntry[]>(() => [...OUTPUT_LOG]);

  const list = orders.filter((w) => w.lineId === line);
  const active = orders.find((w) => w.id === activeId) ?? null;
  const product = active ? productByCode(active.productCode) : null;
  const scanned = active ? (lots[active.id] ?? []) : [];
  const running = active?.state === 'doing';
  const entered = (good ?? 0) + (defect ?? 0);
  const canSave = !!active && running && canRecord && scanned.length > 0 && entered > 0;
  const lineOrders = (id: LineId) => orders.filter((w) => w.lineId === id);
  const L = lineById(line);
  const lineGood = list.reduce((a, w) => a + w.good, 0);
  const lineDefect = list.reduce((a, w) => a + w.defect, 0);

  /** 작업지시를 바꾸면 입력 칸을 비운다 */
  const pick = (id: string | null) => {
    if (id === activeId) return;
    setActiveId(id);
    setGood(null);
    setDefect(null);
  };

  const patch = (id: string, p: Partial<WorkOrder>) =>
    setOrders((os) => os.map((w) => (w.id === id ? { ...w, ...p } : w)));

  const scan = (code: string) => {
    if (!active || !product) return;
    const lot = RAW_LOTS.find((l) => l.lot === code.trim().toUpperCase());
    if (!lot) {
      toast.show({
        title: `${code}는 등록되지 않은 로트입니다`,
        description: '입고 처리된 로트인지 확인하세요',
        tone: 'danger',
      });
      return;
    }
    if (lot.itemId !== product.rawItemId) {
      toast.show({
        title: '다른 원료의 로트입니다',
        description: `${lot.lot}는 ${itemById(lot.itemId).name}입니다. ${itemById(product.rawItemId).name} 로트를 스캔하세요`,
        tone: 'danger',
      });
      return;
    }
    setLots((m) => ({ ...m, [active.id]: [...new Set([...(m[active.id] ?? []), lot.lot])] }));
    toast.show({ title: `${lot.lot} 투입을 기록했습니다`, tone: 'success' });
  };

  const save = () => {
    if (!active) return;
    const g = good ?? 0;
    const d = defect ?? 0;
    patch(active.id, {
      good: active.good + g,
      defect: active.defect + d,
      defects: { ...active.defects, [type]: (active.defects[type] ?? 0) + d },
    });
    setLog((l) => [
      {
        id: `n${l.length + 1}`,
        woId: active.id,
        time: PLANT.now,
        good: g,
        defect: d,
        ...(d > 0 ? { type } : {}),
        actor: L.leader,
      },
      ...l,
    ]);
    setGood(null);
    setDefect(null);
    toast.show({
      title: '실적을 저장했습니다',
      description: `${active.id} · 양품 +${formatQuantity(g, 'EA')} · 불량 +${formatQuantity(d, 'EA')}`,
      tone: 'success',
    });
  };

  return (
    <div className="tl-block-wo" data-density="comfortable">
      <Page
        header={
          <PageHeader
            breadcrumbs={[{ label: '제조' }, { label: '현장 실적' }]}
            title="생산 실적 등록"
            description={`${PLANT.name} · ${formatDate(TODAY, 'mdw')} ${PLANT.shift} · ${L.name} ${L.leader}`}
            actions={
              screens.has('mes/shop-floor/board') && (
                <Button
                  size="lg"
                  icon="layout-dashboard"
                  onPress={() => screens.go('mes/shop-floor/board')}
                >
                  현장 보드
                </Button>
              )
            }
            tabs={
              <Tabs
                label="라인"
                size="lg"
                value={line}
                onChange={(v) => {
                  setLine(v as LineId);
                  const os = lineOrders(v as LineId);
                  const first =
                    os.find((w) => w.state === 'doing') ??
                    os.find((w) => w.state === 'todo') ??
                    os[0];
                  pick(first?.id ?? null);
                }}
                items={LINES.map((l) => ({
                  value: l.id,
                  label: `${l.name} · ${l.role}`,
                  count: lineOrders(l.id).length,
                }))}
              />
            }
          />
        }
      >
        <Split
          asideWidth="lg"
          main={
            <div className="tl-block-wo__list">
              <SelectableCard
                label={`${L.name} 작업지시`}
                columns={1}
                value={activeId}
                onChange={pick}
                options={list.map((w) => ({
                  value: w.id,
                  title: productByCode(w.productCode).name,
                  meta: (
                    <Badge tone={PROGRESS_STATES[w.state].tone}>
                      {PROGRESS_STATES[w.state].label}
                    </Badge>
                  ),
                  description: `${w.id} · ${
                    w.state === 'done'
                      ? `${w.start}~${w.end} 완료`
                      : w.start
                        ? `${w.start} 시작`
                        : `시작 예정 ${w.planStart}`
                  } · 원료 로트 ${w.rawLot} · ${w.customer}`,
                  content: (
                    <Progress
                      size="sm"
                      label="양품"
                      value={w.good}
                      max={w.planned}
                      unit="EA"
                      tone={
                        w.state === 'done' ? 'success' : w.state === 'hold' ? 'warning' : undefined
                      }
                    />
                  ),
                }))}
              />
              <Card
                title={`${L.name} 설비`}
                subtitle={`양품 ${formatQuantity(lineGood, 'EA')} · 불량 ${formatQuantity(lineDefect, 'EA')} · ${PLANT.now} 기준`}
              >
                <ul className="tl-block-wo__machines">
                  {EQUIPMENT.filter((e) => e.lineId === line).map((e) => (
                    <li key={e.id}>
                      <StatusDot tone={MACHINE_STATES[e.state].tone}>
                        {e.name} · {MACHINE_STATES[e.state].label}
                      </StatusDot>
                      <span className="tl-block-muted">{e.reason ?? `${e.since}부터 가동`}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          }
          aside={
            active && product ? (
              <Card
                title={product.name}
                subtitle={`${active.id} · ${product.code} · ${active.customer}`}
                action={
                  <Badge tone={PROGRESS_STATES[active.state].tone}>
                    {PROGRESS_STATES[active.state].label}
                  </Badge>
                }
              >
                <div className="tl-block-drawer-stack">
                  {active.note && (
                    <Banner tone={active.state === 'hold' ? 'warning' : 'info'}>
                      {active.note}
                    </Banner>
                  )}
                  <Progress
                    label="양품 / 계획"
                    value={active.good}
                    max={active.planned}
                    unit="EA"
                    tone={active.state === 'done' ? 'success' : undefined}
                  />
                  <div className="tl-block-wo__figures">
                    <Figure label="양품" value={formatQuantity(active.good, 'EA')} />
                    <Figure label="불량" value={formatQuantity(active.defect, 'EA')} />
                    <Figure label="수율" value={yieldOf(active)} />
                    <Figure label="시작" value={active.start ?? '–'} />
                  </div>
                  <div className="tl-block-wo__controls">
                    {active.state === 'doing' ? (
                      <>
                        <Button
                          size="lg"
                          icon="pause"
                          fullWidth
                          disabled={!canRecord}
                          onPress={() => {
                            patch(active.id, { state: 'hold' });
                            toast.show({
                              title: `${active.id}를 일시 정지했습니다`,
                              tone: 'warning',
                            });
                          }}
                        >
                          일시 정지
                        </Button>
                        <Button
                          size="lg"
                          icon="circle-check"
                          fullWidth
                          disabled={!canRecord}
                          onPress={() => {
                            patch(active.id, { state: 'done', end: PLANT.now });
                            toast.show({
                              title: `${active.id} 작업을 종료했습니다`,
                              description: `양품 ${formatQuantity(active.good, 'EA')} · 불량 ${formatQuantity(active.defect, 'EA')}`,
                              tone: 'success',
                            });
                          }}
                        >
                          작업 종료
                        </Button>
                      </>
                    ) : active.state === 'done' ? (
                      <span className="tl-block-muted">
                        {active.start}~{active.end} 작업 완료 · 수율 {yieldOf(active)}
                      </span>
                    ) : (
                      <Button
                        size="lg"
                        icon="play"
                        fullWidth
                        disabled={!canRecord || scanned.length === 0}
                        onPress={() => {
                          patch(active.id, { state: 'doing', start: active.start ?? PLANT.now });
                          toast.show({
                            title: `${active.id} 작업을 시작했습니다`,
                            description: `${L.name} · ${product.name}`,
                            tone: 'success',
                          });
                        }}
                      >
                        {active.state === 'hold' ? '작업 재개' : '작업 시작'}
                      </Button>
                    )}
                  </div>

                  {active.state !== 'done' && (
                    <section className="tl-block-wo__section" aria-label="실적 입력">
                      <div className="tl-block-wo__inputs">
                        <Field label="양품" required>
                          <QuantityInput
                            size="lg"
                            value={good}
                            onChange={setGood}
                            unit="EA"
                            step={1}
                            max={active.planned * 1.2}
                            disabled={!running || !canRecord}
                          />
                        </Field>
                        <Field label="불량">
                          <QuantityInput
                            size="lg"
                            value={defect}
                            onChange={setDefect}
                            unit="EA"
                            step={1}
                            disabled={!running || !canRecord}
                          />
                        </Field>
                      </div>
                      <Field label="불량 유형" help="불량이 여러 유형이면 유형마다 나눠 저장합니다">
                        <SegmentedControl
                          fullWidth
                          value={type}
                          onChange={setType}
                          disabled={!running || !canRecord || !defect}
                          options={DEFECT_KEYS.map((k) => ({
                            value: k,
                            label: defectShort(k),
                          }))}
                        />
                      </Field>
                    </section>
                  )}

                  <section className="tl-block-wo__section" aria-label="원료 로트">
                    <ScanField
                      label="원료 로트 스캔"
                      placeholder={`로트 바코드를 스캔하세요 · ${active.rawLot}`}
                      keepFocus={false}
                      disabled={!canRecord || active.state === 'done'}
                      onScan={scan}
                    />
                    {scanned.length > 0 ? (
                      <ul className="tl-block-wo__lots">
                        {scanned.map((code) => {
                          const lot = RAW_LOTS.find((l) => l.lot === code)!;
                          const item = itemById(lot.itemId);
                          return (
                            <li key={code}>
                              <Lines
                                primary={<span className="tl-block-code">{code}</span>}
                                secondary={
                                  <>
                                    {item.name} · {item.spec} · 로트 재고{' '}
                                    {formatQuantity(lot.qty, item.unit)}
                                  </>
                                }
                              />
                              {dueDays(lot.expiry, TODAY) <= 60 ? (
                                <DueBadge due={lot.expiry} today={TODAY} warnDays={30} size="sm" />
                              ) : (
                                <span className="tl-block-muted">유통기한 {lot.expiry}</span>
                              )}
                              <Badge tone="success" size="sm">
                                원료 일치
                              </Badge>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <EmptyState
                        size="sm"
                        icon="scan-barcode"
                        title="투입한 원료 로트가 없습니다"
                        description={`${itemById(product.rawItemId).name} 로트를 스캔하면 작업을 시작할 수 있습니다`}
                      />
                    )}
                  </section>

                  <Timeline
                    dense
                    ariaLabel="오늘 실적 이력"
                    items={log
                      .filter((e) => e.woId === active.id)
                      .map((e) => ({
                        id: e.id,
                        title: `양품 +${formatQuantity(e.good, 'EA')} · 불량 +${formatQuantity(e.defect, 'EA')}`,
                        time: `${e.time} 등록`,
                        actor: e.actor,
                        ...(e.type ? { description: defectLabel(e.type) } : {}),
                        tone: 'success' as const,
                      }))}
                  />
                </div>
              </Card>
            ) : (
              <Card>
                <EmptyState
                  icon="clipboard-list"
                  title="작업지시를 고르세요"
                  description="왼쪽 목록에서 실적을 넣을 작업지시를 누릅니다"
                />
              </Card>
            )
          }
        />
        {active && active.state !== 'done' && (
          <ActionBar
            sticky
            summary={
              !running
                ? scanned.length
                  ? '작업을 시작하면 실적을 넣을 수 있습니다'
                  : '원료 로트를 먼저 스캔하세요'
                : `이번 입력 양품 ${formatQuantity(good ?? 0, 'EA')} · 불량 ${formatQuantity(defect ?? 0, 'EA')}${defect ? ` · ${defectLabel(type)}` : ''}`
            }
          >
            <Button
              size="lg"
              variant="ghost"
              disabled={!running}
              onPress={() => {
                setGood(null);
                setDefect(null);
              }}
            >
              초기화
            </Button>
            <Button size="lg" variant="primary" icon="save" disabled={!canSave} onPress={save}>
              실적 저장
            </Button>
          </ActionBar>
        )}
      </Page>
    </div>
  );
}
