// 피킹 목록(WarehouseScan): 위치 순서로 걷는 피킹 줄. 다음 위치 카드에서 스캔으로 확인하고 수량을 포장 단위로 넣는다.
// 부족하면 선반에 있던 수량과 사유를 넣고 남은 수량을 다른 위치(CodeSearch: 창고 · 구역 · 선반)에서 집는다. 휴대폰 먼저
import {
  formatDate,
  formatQuantity,
  PROGRESS_STATES,
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
  EmptyState,
  Field,
  PageHeader,
  Progress,
  QuantityInput,
  ScanField,
  Select,
  SelectableList,
  StatusDot,
  useBreakpoint,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import { itemById, TODAY, warehouseById } from '../../../_data/index.js';
import { personLabel, PROFILE } from '../../../_data/profile.js';
import {
  locationByCode,
  locationOrder,
  locationPlace,
  otherBins,
  PICK_LINE_STATES,
  PICK_LISTS,
  unitsOf,
  type PickLine,
  type PickList,
} from '../../../_data/warehouse.js';
import { useCan } from '../../../_platform/index.js';
import { Col, Grid, josa, Lines, Page } from '../../../_ui/index.js';
import './style.css';

// slot: shortReasons — 부족 사유(출고 보류 · 재고 조정 검토의 근거)
const SHORT_REASONS = [
  { value: 'empty', label: '선반 재고 부족' },
  { value: 'damage', label: '파손' },
  { value: 'misplaced', label: '다른 위치에 있음' },
] as const;
// slot: shortReasons end

/** 줄 수량 글자: 기준 단위 + 포장 단위 환산(12EA · 2BOX) */
function qtyText(line: Pick<PickLine, 'itemId' | 'unit'>, base: number) {
  const item = itemById(line.itemId);
  const pack = unitsOf(line.itemId).find((u) => u.unit === line.unit);
  const text = formatQuantity(base, item.unit);
  if (!pack?.factor || pack.unit === item.unit) return text;
  const packs = base / pack.factor;
  return Number.isInteger(packs) ? `${text} · ${formatQuantity(packs, pack.unit)}` : text;
}

/** 다른 위치 줄은 선반 실물 수량(onHand)을 물려받지 않는다 */
const withoutOnHand = (line: PickLine): PickLine => {
  const next = { ...line };
  delete next.onHand;
  return next;
};

/** 지시 수량을 고른 단위로(나눠떨어지지 않으면 기준 단위) */
function entryOf(line: PickLine) {
  const pack = unitsOf(line.itemId).find((u) => u.unit === line.unit);
  const factor = pack?.factor ?? 1;
  return Number.isInteger(line.qty / factor)
    ? { value: line.qty / factor, unit: line.unit }
    : { value: line.qty, unit: itemById(line.itemId).unit };
}

export default function Picking() {
  const toast = useToast();
  const phone = useBreakpoint() === 'base';
  const canPick = useCan('warehouse', 'update');
  const [lists, setLists] = useState<PickList[]>(() =>
    PICK_LISTS.map((l) => ({ ...l, lines: l.lines.map((x) => ({ ...x })) })),
  );
  const [listId, setListId] = useState(PICK_LISTS[0]!.id);
  const list = lists.find((l) => l.id === listId)!;
  const ordered = [...list.lines].sort(
    (a, b) => locationOrder(a.location) - locationOrder(b.location),
  );
  const current = ordered.find((l) => l.state === 'pending') ?? null;
  const [entry, setEntry] = useState(() => (current ? entryOf(current) : null));
  const [entryFor, setEntryFor] = useState(current?.id ?? null);
  const [short, setShort] = useState<{
    picked: number | null;
    reason: string | null;
    alt: string | null;
  } | null>(null);
  // 지금 줄이 바뀌면 수량 칸을 그 줄의 지시 수량으로 다시 채운다
  if ((current?.id ?? null) !== entryFor) {
    setEntryFor(current?.id ?? null);
    setEntry(current ? entryOf(current) : null);
    setShort(null);
  }
  const done = ordered.filter((l) => l.state !== 'pending').length;
  const shortLines = ordered.filter((l) => l.state === 'short');
  const entryBase =
    current && entry ? toBaseQuantity(entry.value, entry.unit, unitsOf(current.itemId)) : null;
  const exact = current != null && entryBase === current.qty;
  const over = current != null && entryBase != null && entryBase > current.qty;
  const altOptions: CodeOption[] = current
    ? otherBins(current.itemId, current.location).map((b) => {
        const l = locationByCode(b.location);
        return {
          value: b.location,
          label: `${l.zone}구역 ${l.shelf}선반`,
          description: locationPlace(l),
          meta: `장부 ${formatQuantity(b.qty, itemById(b.itemId).unit)}`,
        };
      })
    : [];

  const updateList = (fn: (l: PickList) => PickList) =>
    setLists((all) => all.map((l) => (l.id === listId ? fn(l) : l)));
  const setLineState = (id: string, patch: Partial<PickLine>) =>
    updateList((l) => ({
      ...l,
      lines: l.lines.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));

  const confirmPick = () => {
    if (!current || !exact) return;
    setLineState(current.id, {
      picked: current.qty,
      state: 'picked',
      ...(entry ? { unit: entry.unit } : {}),
    });
    toast.show({
      title: `${current.location} 피킹 완료`,
      description: `${itemById(current.itemId).name} ${qtyText(current, current.qty)}`,
      tone: 'success',
    });
  };
  const confirmShort = () => {
    if (!current || !short || short.picked == null || !short.reason) return;
    const rest = current.qty - short.picked;
    updateList((l) => ({
      ...l,
      lines: [
        ...l.lines.map((x) =>
          x.id === current.id ? { ...x, picked: short.picked, state: 'short' as const } : x,
        ),
        ...(short.alt && rest > 0
          ? [
              {
                ...withoutOnHand(current),
                id: `${current.id}-${short.alt}`,
                location: short.alt,
                qty: rest,
                picked: null,
                state: 'pending' as const,
                unit: itemById(current.itemId).unit,
              },
            ]
          : []),
      ],
    }));
    toast.show({
      title: `${current.location} 부족 ${formatQuantity(rest, itemById(current.itemId).unit)}`,
      description: short.alt
        ? `남은 수량은 ${short.alt}에서 피킹합니다`
        : '남은 수량은 출고 보류로 넘깁니다',
      tone: 'warning',
    });
  };
  const onScan = (raw: string) => {
    if (!current) return;
    const code = raw.trim().toUpperCase();
    const item = itemById(current.itemId);
    if (code === current.location) {
      toast.show({
        title: `${current.location} 위치를 확인했습니다`,
        description: `${josa(item.name, '을/를')} 집으세요`,
      });
      return;
    }
    if (code === item.code) {
      setEntry(entryOf(current));
      toast.show({
        title: `${item.name} 확인`,
        description: `${josa(qtyText(current, current.qty), '을/를')} 넣었습니다. 피킹 완료를 누르세요`,
        tone: 'success',
      });
      return;
    }
    toast.show({
      title: `${josa(raw, '은/는')} 이 줄의 바코드가 아닙니다`,
      description: `지금 줄은 ${current.location} ${item.name}(${item.code})입니다`,
      tone: 'warning',
    });
  };

  const listItems = lists.map((l) => ({
    id: l.id,
    title: l.id,
    secondary: `${warehouseById(l.warehouseId).name} · ${l.title}`,
    meta: l.date === TODAY ? PROGRESS_STATES[l.state].label : formatDate(l.date, 'md'),
    value: `${l.lines.filter((x) => x.state !== 'pending').length}/${l.lines.length}`,
  }));

  const currentCard = current ? (
    <Card
      title="다음 위치"
      subtitle={`${done + 1}번째 줄 · 전체 ${ordered.length}줄 · ${current.ref}`}
    >
      <div className="tl-block-pick-now">
        <div className="tl-block-pick-now__where">
          <span className="tl-block-pick-now__code">{current.location}</span>
          <span className="tl-block-muted">{locationPlace(locationByCode(current.location))}</span>
        </div>
        <Lines
          primary={itemById(current.itemId).name}
          secondary={`${itemById(current.itemId).code} · ${itemById(current.itemId).spec}${current.lot ? ` · 로트 ${current.lot}` : ''}`}
        />
        <p className="tl-block-pick-now__qty">
          지시 <strong>{qtyText(current, current.qty)}</strong>
        </p>
        <div className="tl-block-pick-now__inputs">
          <ScanField
            label="바코드 스캔"
            placeholder="선반 또는 품목 바코드를 스캔하세요"
            keepFocus={false}
            size={phone ? 'xl' : 'lg'}
            disabled={!canPick}
            onScan={onScan}
          />
          <Field
            label="피킹 수량"
            {...(over
              ? { error: '지시 수량보다 많습니다' }
              : !exact && entryBase != null
                ? { help: '지시 수량과 다르면 부족을 누릅니다' }
                : {})}
          >
            <QuantityInput
              size={phone ? 'xl' : 'lg'}
              value={entry?.value ?? null}
              unit={entry?.unit ?? current.unit}
              units={unitsOf(current.itemId)}
              onChange={(v) => setEntry((e) => ({ value: v ?? 0, unit: e?.unit ?? current.unit }))}
              onUnitChange={(u) => setEntry((e) => ({ value: e?.value ?? 0, unit: u }))}
              disabled={!canPick}
            />
          </Field>
        </div>
        {short ? (
          <div className="tl-block-pick-short" role="group" aria-label="부족 처리">
            <Field label="선반에서 집은 수량" required>
              <QuantityInput
                size={phone ? 'xl' : 'md'}
                value={short.picked}
                unit={itemById(current.itemId).unit}
                max={current.qty - 1}
                onChange={(v) => setShort((s) => s && { ...s, picked: v })}
              />
            </Field>
            <Field label="부족 사유" required>
              <Select
                value={short.reason}
                onChange={(v) => setShort((s) => s && { ...s, reason: v })}
                options={SHORT_REASONS.map((r) => ({ value: r.value, label: r.label }))}
              />
            </Field>
            {altOptions.length > 0 && (
              <Field label="남은 수량을 집을 위치" help="같은 품목이 있는 선반입니다">
                <CodeSearch
                  options={altOptions}
                  value={short.alt}
                  onChange={(v) => setShort((s) => s && { ...s, alt: v })}
                  placeholder="위치 코드 또는 구역"
                />
              </Field>
            )}
            <div className="tl-block-pick-actions">
              <Button onPress={() => setShort(null)}>취소</Button>
              <Button
                variant="primary"
                icon="triangle-alert"
                disabled={short.picked == null || !short.reason}
                onPress={confirmShort}
              >
                부족 확정
              </Button>
            </div>
          </div>
        ) : (
          <div className="tl-block-pick-actions">
            <Button
              size={phone ? 'xl' : 'lg'}
              icon="triangle-alert"
              disabled={!canPick}
              onPress={() =>
                setShort({
                  picked:
                    current.onHand ??
                    (entryBase != null && entryBase < current.qty ? entryBase : null),
                  reason: null,
                  alt: null,
                })
              }
            >
              부족
            </Button>
            <Button
              size={phone ? 'xl' : 'lg'}
              variant="primary"
              icon="check"
              disabled={!canPick || !exact}
              onPress={confirmPick}
            >
              피킹 완료
            </Button>
          </div>
        )}
      </div>
    </Card>
  ) : (
    <Card>
      <EmptyState
        icon="package-check"
        title="모든 줄을 피킹했습니다"
        description={
          shortLines.length
            ? `부족 ${shortLines.length}줄은 출고 보류로 넘깁니다. 피킹 끝내기를 누르세요`
            : '피킹 끝내기를 누르면 출고 검수로 넘어갑니다'
        }
      />
    </Card>
  );

  const stateCell = (l: PickLine) => (
    <StatusDot tone={PICK_LINE_STATES[l.state].tone} size="sm">
      {l === current ? '지금' : PICK_LINE_STATES[l.state].label}
    </StatusDot>
  );

  const lineList = (
    <DataGrid
      caption={`${list.id} 피킹 줄`}
      className="tl-block-flat-grid"
      rows={ordered}
      rowKey="id"
      activeRowKey={current?.id ?? null}
      columns={[
        {
          key: 'location',
          header: '위치',
          width: 'sm',
          mobile: 'title',
          render: (l) => <span className="tl-block-code">{l.location}</span>,
        },
        {
          key: 'itemId',
          header: '품목',
          mobile: 'meta',
          render: (l) => (
            <DataGridLines
              primary={itemById(l.itemId).name}
              secondary={`${l.ref}${l.lot ? ` · ${l.lot}` : ''}`}
            />
          ),
        },
        {
          key: 'qty',
          header: '지시',
          width: 'md',
          align: 'right',
          mobile: 'trailing',
          render: (l) => qtyText(l, l.qty),
        },
        {
          key: 'picked',
          header: '피킹',
          width: 'sm',
          align: 'right',
          mobile: 'meta',
          render: (l) =>
            l.picked == null ? '–' : formatQuantity(l.picked, itemById(l.itemId).unit),
        },
        { key: 'state', header: '상태', width: 'sm', mobile: 'status', render: stateCell },
      ]}
    />
  );

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '유통·물류' }, { label: '출고' }, { label: '피킹 목록' }]}
          title="피킹 목록"
          meta={
            <Badge tone={PROGRESS_STATES[list.state].tone}>
              {PROGRESS_STATES[list.state].label}
            </Badge>
          }
          description={`${list.id} · ${warehouseById(list.warehouseId).name} · ${list.title} · 피킹 ${personLabel(list.picker)} · 출고 마감 ${PROFILE.shipping.cutoff}`}
        />
      }
    >
      <Grid>
        {phone ? (
          <Col span={12}>
            <Select
              label="피킹 목록"
              value={listId}
              onChange={(v) => v && setListId(v)}
              options={listItems.map((l) => ({ value: l.id, label: `${l.id} · ${l.value}줄` }))}
            />
          </Col>
        ) : (
          <Col span={3}>
            <Card title="피킹 목록" subtitle="끝낸 줄 / 전체 줄" padding="none">
              <div className="tl-block-pick-lists">
                <SelectableList
                  label="피킹 목록"
                  items={listItems}
                  selected={listId}
                  onSelect={setListId}
                />
              </div>
            </Card>
          </Col>
        )}
        <Col span={phone ? 12 : 9}>
          <div className="tl-block-pick-main">
            <Progress
              label="피킹 진행"
              value={done}
              max={ordered.length}
              unit="줄"
              {...(done === ordered.length ? { tone: 'success' as const } : {})}
            />
            {currentCard}
            <Card title="피킹 줄" subtitle="위치 순서 · 이 순서로 걷습니다" padding="none">
              {lineList}
            </Card>
          </div>
        </Col>
      </Grid>

      {/* 끝내기는 남은 줄이 없을 때만(휴대폰에서 지금 줄 단추를 가리지 않는다) */}
      {list.state !== 'done' && !current && (
        <ActionBar
          sticky
          summary={`${done}/${ordered.length}줄${shortLines.length ? ` · 부족 ${shortLines.length}줄` : ''}`}
        >
          <Button
            variant="primary"
            icon="package-check"
            disabled={!canPick}
            {...(!canPick ? { disabledReason: '피킹할 권한이 없습니다' } : {})}
            onPress={() => {
              updateList((l) => ({ ...l, state: 'done' }));
              toast.show({
                title: `${list.id} 피킹을 끝냈습니다`,
                description: shortLines.length
                  ? `출고 검수로 넘겼습니다 · 부족 ${shortLines.length}줄은 출고 보류`
                  : '출고 검수로 넘겼습니다',
                tone: 'success',
              });
            }}
          >
            피킹 끝내기
          </Button>
        </ActionBar>
      )}
    </Page>
  );
}
