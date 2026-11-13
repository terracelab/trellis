// 입고 알림 · 처리(WarehouseScan): 도착 → 검수(수량 · 로트 · 유통기한 · 판정) → 입고 확정 또는 반품
import {
  formatDate,
  formatQuantity,
  QUALITY_RESULTS,
  RECEIVING_STATES,
  type QualityResult,
  type ReceivingState,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Attachment,
  Badge,
  Banner,
  Button,
  Card,
  DateField,
  DescriptionList,
  EmptyState,
  Field,
  Input,
  PageHeader,
  QuantityInput,
  ReasonDialog,
  ScanField,
  SegmentedControl,
  SelectableCard,
  StatusDot,
  Stepper,
  Tabs,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  itemById,
  partyById,
  RECEIPTS,
  warehouseById,
  type Receipt,
  type ReceiptLine,
} from '../../../_data/index.js';
import { PROFILE } from '../../../_data/profile.js';
import { useCan } from '../../../_platform/index.js';
import { Lines, Page, Split } from '../../../_ui/index.js';
import './style.css';

const STEP_ORDER: ReceivingState[] = ['scheduled', 'arrived', 'inspecting', 'received'];
/** 처음 여는 입고: 검수 중 → 도착 → 첫 건 */
const FIRST =
  RECEIPTS.find((r) => r.state === 'inspecting') ??
  RECEIPTS.find((r) => r.state === 'arrived') ??
  RECEIPTS[0];

export default function Receiving() {
  const toast = useToast();
  const canProcess = useCan('warehouse', 'approve');
  const [receipts, setReceipts] = useState<Receipt[]>(() =>
    RECEIPTS.map((r) => ({ ...r, lines: r.lines.map((l) => ({ ...l })) })),
  );
  const [tab, setTab] = useState('todo');
  const [activeId, setActiveId] = useState<string | null>(FIRST?.id ?? null);
  const [reject, setReject] = useState(false);
  const buckets: Record<string, (r: Receipt) => boolean> = {
    todo: (r) => r.state === 'arrived' || r.state === 'inspecting',
    scheduled: (r) => r.state === 'scheduled',
    done: (r) => r.state === 'received' || r.state === 'rejected',
  };
  const list = receipts.filter(buckets[tab]!);
  const active = receipts.find((r) => r.id === activeId) ?? null;
  const editable =
    !!active && (active.state === 'arrived' || active.state === 'inspecting') && canProcess;
  const update = (id: string, patch: Partial<Receipt>) =>
    setReceipts((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const setLine = (idx: number, patch: Partial<ReceiptLine>) =>
    active &&
    update(active.id, {
      state: 'inspecting',
      lines: active.lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    });
  const short = active?.lines.filter((l) => l.received != null && l.received !== l.ordered) ?? [];
  const missingLot =
    active?.lines.filter((l) => itemById(l.itemId).lotTracked && (!l.lot || !l.expiry)) ?? [];
  const ready =
    !!active &&
    active.lines.every((l) => l.received != null && l.result) &&
    missingLot.length === 0;

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '유통·물류' }, { label: '입고' }]}
          title="입고 알림 · 처리"
          description={`처리할 입고 ${receipts.filter(buckets.todo!).length}건 · 예정 ${receipts.filter(buckets.scheduled!).length}건`}
          actions={<Button icon="scan-barcode">스캔 모드</Button>}
          tabs={
            <Tabs
              label="입고 상태"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'todo', label: '처리할 것', count: receipts.filter(buckets.todo!).length },
                {
                  value: 'scheduled',
                  label: '예정',
                  count: receipts.filter(buckets.scheduled!).length,
                },
                {
                  value: 'done',
                  label: '완료 · 반품',
                  count: receipts.filter(buckets.done!).length,
                },
              ]}
            />
          }
        />
      }
    >
      <Split
        asideWidth="lg"
        main={
          <div className="tl-block-receipts">
            {list.length === 0 && (
              <EmptyState
                icon="package-check"
                title="처리할 입고가 없습니다"
                description="도착 알림이 오면 여기에 나타납니다"
              />
            )}
            {list.length > 0 && (
              <SelectableCard
                label="입고 건"
                columns={1}
                value={activeId}
                onChange={setActiveId}
                options={list.map((r) => ({
                  value: r.id,
                  title: partyById(r.partyId).name,
                  meta: (
                    <Badge tone={RECEIVING_STATES[r.state].tone}>
                      {RECEIVING_STATES[r.state].label}
                    </Badge>
                  ),
                  description: `${r.id} · ${warehouseById(r.warehouseId).name} · ${
                    r.arrivedAt
                      ? `도착 ${r.arrivedAt.slice(11)}`
                      : `예정 ${r.expectedAt.slice(5, 10).replace('-', '.')} ${r.expectedAt.slice(11)}`
                  }`,
                  content: (
                    <div className="tl-block-receipt">
                      <span className="tl-block-receipt__items">
                        {r.lines
                          .map(
                            (l) =>
                              `${itemById(l.itemId).name} ${formatQuantity(l.ordered, itemById(l.itemId).unit)}`,
                          )
                          .join(' · ')}
                      </span>
                      {r.lines.some((l) => l.result === 'hold' || l.result === 'fail') && (
                        <StatusDot tone="danger">검수 이슈</StatusDot>
                      )}
                    </div>
                  ),
                }))}
              />
            )}
          </div>
        }
        aside={
          active ? (
            <Card
              title={active.id}
              subtitle={`${partyById(active.partyId).name} · ${active.poId} · ${warehouseById(active.warehouseId).name}`}
              action={
                <Badge tone={RECEIVING_STATES[active.state].tone}>
                  {RECEIVING_STATES[active.state].label}
                </Badge>
              }
            >
              <div className="tl-block-drawer-stack">
                <Stepper
                  size="sm"
                  steps={STEP_ORDER.map((s) => ({
                    id: s,
                    label: RECEIVING_STATES[s].label,
                    state:
                      active.state === 'rejected'
                        ? s === 'received'
                          ? 'error'
                          : 'done'
                        : STEP_ORDER.indexOf(s) < STEP_ORDER.indexOf(active.state)
                          ? 'done'
                          : s === active.state
                            ? active.state === 'received'
                              ? 'done'
                              : 'current'
                            : 'todo',
                  }))}
                />
                {short.length > 0 && (
                  <Banner tone="warning" title={`수량 차이 ${short.length}건`}>
                    {short
                      .map(
                        (l) =>
                          `${itemById(l.itemId).name}: 발주 ${formatQuantity(l.ordered, itemById(l.itemId).unit)} · 받음 ${formatQuantity(l.received ?? 0, itemById(l.itemId).unit)}`,
                      )
                      .join(' / ')}
                    {short.some((l) => l.note) ? ` · ${short.find((l) => l.note)!.note}` : ''}
                  </Banner>
                )}
                {editable && (
                  <ScanField
                    label="바코드 스캔"
                    placeholder="박스 바코드를 스캔하거나 품목 코드를 입력하세요"
                    onScan={(code) =>
                      toast.show({
                        title: `${code} 스캔`,
                        description: '받은 수량에 1박스를 더했습니다',
                      })
                    }
                  />
                )}
                <div className="tl-block-inspect">
                  {active.lines.map((l, idx) => {
                    const item = itemById(l.itemId);
                    return (
                      <section
                        key={l.itemId}
                        className="tl-block-inspect__line"
                        aria-label={item.name}
                      >
                        <header className="tl-block-inspect__head">
                          <Lines
                            primary={item.name}
                            secondary={
                              <>
                                {item.code} · {item.spec} · 발주{' '}
                                {formatQuantity(l.ordered, item.unit)}
                              </>
                            }
                          />
                          {l.result && (
                            <Badge tone={QUALITY_RESULTS[l.result].tone}>
                              {QUALITY_RESULTS[l.result].label}
                            </Badge>
                          )}
                        </header>
                        <div className="tl-block-inspect__fields">
                          <Field label="받은 수량" required>
                            <QuantityInput
                              value={l.received ?? null}
                              onChange={(v) => setLine(idx, { received: v ?? undefined })}
                              unit={item.unit}
                              max={l.ordered * 1.1}
                              disabled={!editable}
                            />
                          </Field>
                          {item.lotTracked && (
                            <>
                              <Field label="로트" required>
                                <Input
                                  value={l.lot ?? ''}
                                  onChange={(v) => setLine(idx, { lot: v })}
                                  placeholder="HK261101"
                                  disabled={!editable}
                                />
                              </Field>
                              <Field label="유통기한" required>
                                <DateField
                                  value={l.expiry ?? null}
                                  onChange={(v) => setLine(idx, { expiry: v ?? undefined })}
                                  disabled={!editable}
                                />
                              </Field>
                            </>
                          )}
                          <Field label="판정" required>
                            <SegmentedControl
                              size="sm"
                              value={l.result ?? ''}
                              onChange={(v) => setLine(idx, { result: v as QualityResult })}
                              options={(Object.keys(QUALITY_RESULTS) as QualityResult[]).map(
                                (k) => ({ value: k, label: QUALITY_RESULTS[k].label }),
                              )}
                            />
                          </Field>
                        </div>
                      </section>
                    );
                  })}
                </div>
                <DescriptionList
                  columns={2}
                  items={[
                    {
                      label: '도착',
                      value: active.arrivedAt
                        ? `${formatDate(active.arrivedAt.slice(0, 10))} ${active.arrivedAt.slice(11)}`
                        : '–',
                    },
                    { label: '검수자', value: active.inspector ?? '–' },
                  ]}
                />
                {active.files && active.files.length > 0 && (
                  <Attachment layout="chips" files={active.files} />
                )}
                <Timeline
                  dense
                  items={[
                    {
                      id: 'e1',
                      title: '입고 예정 등록',
                      time: `${active.expectedAt.slice(5)} · 발주 연동`,
                      tone: 'neutral',
                      icon: 'calendar',
                    },
                    ...(active.arrivedAt
                      ? [
                          {
                            id: 'e2',
                            title: '도착 알림',
                            time: active.arrivedAt.slice(5),
                            description: `${warehouseById(active.warehouseId).name} 하역장`,
                            tone: 'info' as const,
                            icon: 'truck' as const,
                          },
                        ]
                      : []),
                    ...(active.state === 'inspecting'
                      ? [
                          {
                            id: 'e3',
                            title: '검수 시작',
                            time: `${active.arrivedAt?.slice(5, 10)} 10:05`,
                            actor: active.inspector,
                            tone: 'warning' as const,
                            icon: 'clipboard-check' as const,
                          },
                        ]
                      : []),
                    ...(active.state === 'received'
                      ? [
                          {
                            id: 'e4',
                            title: '입고 확정',
                            time: `${active.arrivedAt?.slice(5, 10)} 15:40`,
                            actor: active.inspector,
                            tone: 'success' as const,
                            icon: 'package-check' as const,
                          },
                        ]
                      : []),
                    ...(active.state === 'rejected'
                      ? [
                          {
                            id: 'e5',
                            title: '반품 처리',
                            time: `${active.arrivedAt?.slice(5, 10)} 11:20`,
                            description: active.lines[0]?.note,
                            tone: 'danger' as const,
                            icon: 'undo-2' as const,
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon="warehouse"
                title="입고 건을 고르세요"
                description="왼쪽 목록에서 처리할 입고를 누릅니다"
              />
            </Card>
          )
        }
      />
      {editable && active && (
        <ActionBar
          sticky
          summary={
            missingLot.length
              ? `로트 · 유통기한 미입력 ${missingLot.length}건`
              : ready
                ? '검수 입력 완료'
                : '받은 수량과 판정을 입력하세요'
          }
        >
          <Button variant="danger" icon="undo-2" onPress={() => setReject(true)}>
            반품
          </Button>
          <Button
            variant="primary"
            icon="package-check"
            disabled={!ready}
            onPress={() => {
              update(active.id, {
                state: 'received',
                inspector: active.inspector ?? PROFILE.people.logistics,
              });
              toast.show({
                title: `${active.id} 입고를 확정했습니다`,
                description: '재고에 반영하고 매입 세금계산서 대기에 올렸습니다',
                tone: 'success',
              });
            }}
          >
            입고 확정
          </Button>
        </ActionBar>
      )}
      {/* 반품 사유는 ReasonDialog(사유가 없으면 반품이 꺼지고, 바깥을 눌러도 닫히지 않는다) */}
      <ReasonDialog
        open={reject}
        onOpenChange={setReject}
        tone="danger"
        title={`${active?.id ?? ''}을 반품합니다`}
        description="반품하면 재고에 반영하지 않고 거래처에 반품 알림을 보냅니다."
        label="반품 사유"
        placeholder="해동 흔적 · 전량 반품"
        confirmLabel="반품"
        maxLength={200}
        note="사유는 거래처 반품 알림에 함께 갑니다"
        onConfirm={(reason) => {
          if (active) update(active.id, { state: 'rejected' });
          toast.show({ title: '반품 처리했습니다', description: reason, tone: 'warning' });
        }}
      />
    </Page>
  );
}
