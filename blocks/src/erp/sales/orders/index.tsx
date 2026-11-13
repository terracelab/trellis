// 견적 · 수주(ListDetail): 단계 탭 · 필터 · 견적 일괄 수주 확정 · 상세 Drawer(단계 · 품목 · 재고) · 세금계산서 발행 연결
import {
  formatAmount,
  formatBizNo,
  formatDate,
  formatQuantity,
  INVOICE_STATES,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  AmountInput,
  Badge,
  Banner,
  Button,
  CodeSearch,
  DataGrid,
  DataGridLines,
  DateField,
  DescriptionList,
  Dialog,
  DialogClose,
  Drawer,
  DueBadge,
  Field,
  FilterBar,
  Input,
  PageHeader,
  QuantityInput,
  Select,
  Stepper,
  Tabs,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  SALES_ORDERS,
  SALES_STAGES,
  salesSupply,
  salesTax,
  shortageOf,
  staff,
  type SalesOrder,
  type SalesStage,
} from '../../../_data/erp.js';
import {
  INVOICES,
  ITEMS,
  itemById,
  PARTIES,
  partyById,
  mainWarehouseOf,
  PURCHASE_ORDERS,
  TODAY,
  warehouseById,
} from '../../../_data/index.js';
import { NOW_AT } from '../../../_data/profile.js';
import { useCan, usePlatform, useScreens } from '../../../_platform/index.js';
import {
  addDays,
  ExportButton,
  Figure,
  monthLabel,
  Page,
  yymm,
  type CsvColumn,
} from '../../../_ui/index.js';
import './style.css';

type Order = SalesOrder & { orderNo?: string };
type Row = Order & {
  docNo: string;
  partyName: string;
  supply: number;
  tax: number;
  total: number;
  items: string;
};

const STAGES: SalesStage[] = ['quote', 'ordered', 'shipping', 'closed'];
/** 영업 담당(수주 데이터에 나오는 사람) */
const OWNERS = [...new Set(SALES_ORDERS.map((o) => o.owner))];
/** 새 견적 · 수주 번호 앞자리(QT-2611 · SO-2611)와 다음 순번 · 견적 유효기간 14일 */
const YYMM = yymm(TODAY);
const QT_PREFIX = `QT-${YYMM}`;
const SO_PREFIX = `SO-${YYMM}`;
const nextSeq = (prefix: string) =>
  Math.max(
    0,
    ...SALES_ORDERS.filter((o) => o.id.startsWith(prefix)).map((o) => Number(o.id.slice(-4))),
  ) + 1;
const VALID_UNTIL = addDays(TODAY, 14);
/** 부족한 품목이 들어올 발주(아직 다 받지 않은 것) */
const incomingPo = (itemId: string) =>
  PURCHASE_ORDERS.find(
    (p) =>
      (p.state === 'ordered' || p.state === 'partial') &&
      p.lines.some((l) => l.itemId === itemId && l.received < l.qty),
  );
const customers = PARTIES.filter((p) => p.kind.includes('customer'));
const invoiceOf = (o: Order) => INVOICES.find((i) => i.id === o.invoiceId);
const toRow = (o: Order): Row => {
  const supply = salesSupply(o);
  const tax = salesTax(o);
  const first = itemById(o.lines[0]!.itemId);
  return {
    ...o,
    docNo: o.orderNo ?? o.id,
    partyName: partyById(o.partyId).name,
    supply,
    tax,
    total: supply + tax,
    items: `${first.name}${o.lines.length > 1 ? ` 외 ${o.lines.length - 1}건` : ''}`,
  };
};

/** 엑셀 다운로드 열(표와 같은 내용, 공급가액 · 세액 · 합계 순서, 금액은 서식 없는 숫자) */
const CSV: CsvColumn<Row>[] = [
  { label: '문서 번호', value: 'docNo' },
  { label: '일자', value: 'date' },
  { label: '거래처', value: 'partyName' },
  { label: '영업 담당', value: (r) => staff(r.owner) },
  { label: '품목', value: 'items' },
  { label: '공급가액(원)', value: 'supply' },
  { label: '세액(원)', value: 'tax' },
  { label: '합계(원)', value: 'total' },
  { label: '납기', value: 'dueDate' },
  { label: '출고일', value: (r) => r.shippedAt?.slice(0, 10) ?? '' },
  { label: '단계', value: (r) => SALES_STAGES[r.stage].label },
  {
    label: '세금계산서',
    value: (r) => {
      const inv = invoiceOf(r);
      return inv ? INVOICE_STATES[inv.state].label : '';
    },
  },
];

function steps(o: Order) {
  const inv = invoiceOf(o);
  const at = STAGES.indexOf(o.stage);
  const state = (i: number) =>
    at > i ? ('done' as const) : at === i ? ('current' as const) : ('todo' as const);
  return [
    { id: 'quote', label: '견적', state: state(0), description: formatDate(o.date) },
    {
      id: 'ordered',
      label: '수주',
      state: state(1),
      description: at === 1 ? '출고 지시 전' : undefined,
    },
    {
      id: 'shipping',
      label: '출고',
      state: o.shippedAt ? ('done' as const) : state(2),
      description: o.shippedAt
        ? `${o.shippedAt.slice(5).replace(' ', ' · ')}`
        : at === 2
          ? warehouseById(o.warehouseId).name
          : undefined,
    },
    {
      id: 'invoice',
      label: '세금계산서',
      state: !o.shippedAt
        ? ('todo' as const)
        : !inv || inv.state === 'draft' || inv.state === 'ready'
          ? ('current' as const)
          : inv.state === 'failed'
            ? ('error' as const)
            : ('done' as const),
      description: inv ? `${inv.id} · ${INVOICE_STATES[inv.state].label}` : undefined,
    },
  ];
}

export default function SalesOrders() {
  const toast = useToast();
  const { session } = usePlatform();
  const screens = useScreens();
  const canConfirm = useCan('sales', 'approve');
  const canCreate = useCan('sales', 'create');
  const [orders, setOrders] = useState<Order[]>(() => [...SALES_ORDERS]);
  const [seq, setSeq] = useState(() => ({ qt: nextSeq(QT_PREFIX), so: nextSeq(SO_PREFIX) }));
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [owner, setOwner] = useState<string | null>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string[] | null>(null);
  const [draft, setDraft] = useState<{
    party: string | null;
    item: string | null;
    qty: number | null;
    price: number | null;
    due: string | null;
  } | null>(null);

  const rows = useMemo(() => orders.map(toRow), [orders]);
  const shown = rows.filter(
    (r) =>
      (tab === 'all' || r.stage === tab) &&
      (owner === 'all' || !owner || r.owner === owner) &&
      (!q || `${r.docNo}${r.id}${r.partyName}${r.items}`.includes(q)),
  );
  const count = (s: SalesStage) => rows.filter((r) => r.stage === s).length;
  const open = rows.find((r) => r.id === openId) ?? null;
  const short = rows.filter((r) => shortageOf(r).length > 0);
  const pickedQuotes = rows.filter((r) => selected.includes(r.id) && r.stage === 'quote');

  const update = (id: string, patch: Partial<Order>) =>
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  const confirmQuotes = (ids: string[]) => {
    let n = seq.so;
    setOrders((os) =>
      os.map((o) =>
        ids.includes(o.id) && o.stage === 'quote'
          ? { ...o, stage: 'ordered', orderNo: `${SO_PREFIX}-${String(n++).padStart(4, '0')}` }
          : o,
      ),
    );
    setSeq((s) => ({ ...s, so: s.so + ids.length }));
    setSelected([]);
    toast.show({
      title: `견적 ${ids.length}건을 수주로 확정했습니다`,
      description: '가용재고를 예약하고 물류팀에 출고 예정을 알렸습니다',
      tone: 'success',
    });
  };

  const createQuote = () => {
    if (!draft?.party || !draft.item || !draft.qty) return;
    const party = customers.find((p) => p.code === draft.party)!;
    const item = ITEMS.find((i) => i.code === draft.item)!;
    const id = `${QT_PREFIX}-${String(seq.qt).padStart(4, '0')}`;
    setOrders((os) => [
      {
        id,
        partyId: party.id,
        date: TODAY,
        dueDate: draft.due ?? TODAY,
        validUntil: VALID_UNTIL,
        owner: OWNERS.includes(session.user.name) ? session.user.name : (OWNERS[0] ?? ''),
        warehouseId: mainWarehouseOf(item.id),
        stage: 'quote',
        lines: [{ itemId: item.id, qty: draft.qty!, price: draft.price ?? item.price }],
      },
      ...os,
    ]);
    setSeq((s) => ({ ...s, qt: s.qt + 1 }));
    setTab('quote');
    setDraft(null);
    toast.show({
      title: `견적 ${id}을 작성했습니다`,
      description: `${party.name} · ${item.name} ${formatQuantity(draft.qty, item.unit)}`,
      tone: 'success',
    });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '영업' }, { label: '견적 · 수주' }]}
          title="견적 · 수주"
          description={`${monthLabel(TODAY)} · 견적 ${count('quote')}건 · 수주 잔고 ${formatAmount(
            rows
              .filter((r) => r.stage === 'ordered' || r.stage === 'shipping')
              .reduce((a, r) => a + r.total, 0),
          )}원`}
          actions={
            <>
              <ExportButton module="sales" name="견적 · 수주" rows={shown} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              <Button
                variant="primary"
                icon="file-plus"
                disabled={!canCreate}
                onPress={() =>
                  setDraft({
                    party: null,
                    item: null,
                    qty: null,
                    price: null,
                    due: addDays(TODAY, 10),
                  })
                }
              >
                견적 작성
              </Button>
            </>
          }
          tabs={
            <Tabs
              label="영업 단계"
              value={tab}
              onChange={(v) => {
                setTab(v);
                setSelected([]);
              }}
              items={[
                { value: 'all', label: '전체', count: rows.length },
                ...STAGES.map((s) => ({ value: s, label: SALES_STAGES[s].label, count: count(s) })),
              ]}
            />
          }
        />
      }
    >
      {short.length > 0 && (
        <Banner
          tone="warning"
          title={`가용재고 부족 ${short.length}건`}
          action={
            <Button size="sm" onPress={() => setOpenId(short[0]!.id)}>
              {short[0]!.docNo} 보기
            </Button>
          }
        >
          {short[0]!.partyName} {short[0]!.items}:{' '}
          {shortageOf(short[0]!)
            .map(
              (l) =>
                `주문 ${formatQuantity(l.qty, itemById(l.itemId).unit)} · 가용 ${formatQuantity(l.available, itemById(l.itemId).unit)}`,
            )
            .join(' / ')}
          .{' '}
          {(() => {
            const po = incomingPo(shortageOf(short[0]!)[0]!.itemId);
            return po
              ? `${po.id} 입고(${formatDate(po.dueDate, 'md')}) 뒤 출고할 수 있습니다.`
              : '발주가 필요합니다.';
          })()}
        </Banner>
      )}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="문서 번호 · 거래처 · 품목"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setOwner('all');
          setTab('all');
        }}
        resultCount={shown.length}
      >
        <Select
          label="영업 담당"
          size="sm"
          width="auto"
          value={owner}
          onChange={setOwner}
          options={[
            { value: 'all', label: '담당 전체' },
            ...OWNERS.map((n) => ({ value: n, label: staff(n) })),
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="견적 · 수주"
        height="fill"
        rows={shown}
        rowKey="id"
        selectable={tab === 'quote'}
        selected={selected}
        onSelectedChange={setSelected}
        onRowPress={(r) => setOpenId(r.id)}
        activeRowKey={openId}
        summary
        rowTone={(r) =>
          invoiceOf(r)?.state === 'failed' ? 'danger' : shortageOf(r).length ? 'warning' : undefined
        }
        empty="이 조건의 견적 · 수주가 없습니다. 단계나 담당을 바꿔 보세요"
        columns={[
          {
            key: 'docNo',
            header: '문서 번호',
            width: 'md',
            sticky: true,
            render: (r) => (
              <DataGridLines
                primary={<span className="tl-block-code">{r.docNo}</span>}
                secondary={r.date}
              />
            ),
          },
          {
            key: 'partyName',
            header: '거래처',
            width: 'lg',
            sortable: true,
            render: (r) => (
              <DataGridLines primary={r.partyName} secondary={<>영업 {staff(r.owner)}</>} />
            ),
          },
          { key: 'items', header: '품목' },
          {
            key: 'total',
            header: '합계',
            width: 'md',
            format: 'amount',
            total: 'sum',
            sortable: true,
          },
          {
            key: 'dueDate',
            header: '납기',
            width: 'md',
            sortable: true,
            render: (r) => (
              <DataGridLines
                primary={r.dueDate}
                secondary={
                  r.shippedAt ? (
                    <span>출고 {r.shippedAt.slice(5, 10)}</span>
                  ) : (
                    <span>
                      <DueBadge due={r.dueDate} today={TODAY} size="sm" />
                    </span>
                  )
                }
              />
            ),
          },
          {
            key: 'stage',
            header: '단계',
            width: 'sm',
            render: (r) => (
              <Badge tone={SALES_STAGES[r.stage].tone}>{SALES_STAGES[r.stage].label}</Badge>
            ),
          },
          {
            key: 'invoiceId',
            header: '세금계산서',
            width: 'sm',
            render: (r) => {
              const inv = invoiceOf(r);
              return inv ? (
                <Badge tone={INVOICE_STATES[inv.state].tone}>
                  {INVOICE_STATES[inv.state].label}
                </Badge>
              ) : (
                <span className="tl-block-muted">–</span>
              );
            },
          },
        ]}
      />
      {pickedQuotes.length > 0 && (
        <ActionBar
          summary={`견적 ${pickedQuotes.length}건 선택 · 합계 ${formatAmount(pickedQuotes.reduce((a, r) => a + r.total, 0))}원`}
        >
          <Button onPress={() => setSelected([])}>선택 해제</Button>
          <Button
            variant="primary"
            icon="circle-check"
            disabled={!canConfirm}
            onPress={() => setConfirm(pickedQuotes.map((r) => r.id))}
          >
            {pickedQuotes.length}건 수주 확정
          </Button>
        </ActionBar>
      )}

      <Dialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`견적 ${confirm?.length ?? 0}건을 수주로 확정합니다`}
        description="확정하면 수주 번호를 매기고 가용재고를 예약합니다. 거래처에 수주 확인서를 메일로 보냅니다."
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button variant="primary" onPress={() => confirm && confirmQuotes(confirm)}>
                  수주 확정
                </Button>
              }
            />
          </>
        }
      />

      <Dialog
        open={draft !== null}
        onOpenChange={(o) => !o && setDraft(null)}
        title="견적 작성"
        description="거래처와 품목을 고르면 판매 단가가 채워집니다. 품목은 상세에서 더 추가합니다."
        size="md"
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <Button
              variant="primary"
              disabled={!draft?.party || !draft.item || !draft.qty}
              onPress={createQuote}
            >
              작성
            </Button>
          </>
        }
      >
        {draft && (
          <div className="tl-block-so-form">
            <Field label="거래처" required>
              <CodeSearch
                value={draft.party}
                onChange={(v) => setDraft({ ...draft, party: v })}
                options={customers.map((p) => ({
                  value: p.code,
                  label: p.name,
                  meta: formatBizNo(p.bizNo ?? ''),
                }))}
              />
            </Field>
            <Field label="품목" required>
              <CodeSearch
                value={draft.item}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    item: v,
                    price: ITEMS.find((i) => i.code === v)?.price ?? null,
                  })
                }
                options={ITEMS.map((i) => ({ value: i.code, label: i.name, meta: i.spec }))}
              />
            </Field>
            <Field label="수량" required>
              <QuantityInput
                value={draft.qty}
                onChange={(v) => setDraft({ ...draft, qty: v })}
                unit={ITEMS.find((i) => i.code === draft.item)?.unit ?? 'EA'}
                min={1}
              />
            </Field>
            <Field label="단가">
              <AmountInput value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} />
            </Field>
            <Field label="희망 납기">
              <DateField
                today={TODAY}
                value={draft.due}
                onChange={(v) => setDraft({ ...draft, due: v })}
                min={TODAY}
              />
            </Field>
          </div>
        )}
      </Dialog>

      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.docNo ?? ''}
        description={
          open ? `${open.partyName} · ${formatDate(open.date)} · ${staff(open.owner)}` : ''
        }
        width="lg"
        actions={
          open && (
            <Badge tone={SALES_STAGES[open.stage].tone}>{SALES_STAGES[open.stage].label}</Badge>
          )
        }
        footer={open && drawerActions(open)}
      >
        {open && <Detail row={open} />}
      </Drawer>
    </Page>
  );

  function drawerActions(row: Row) {
    const inv = invoiceOf(row);
    if (row.stage === 'quote')
      return (
        <>
          <Button icon="printer">견적서 인쇄</Button>
          <Button
            variant="primary"
            icon="circle-check"
            disabled={!canConfirm}
            onPress={() => setConfirm([row.id])}
          >
            수주 확정
          </Button>
        </>
      );
    if (row.stage === 'ordered') {
      const lacking = shortageOf(row).length > 0;
      return (
        <>
          {lacking && screens.has('erp/purchasing/po-form') && (
            <Button icon="shopping-cart" onPress={() => screens.go('erp/purchasing/po-form')}>
              발주 요청
            </Button>
          )}
          <Button
            variant="primary"
            icon="truck"
            disabled={!canConfirm || lacking}
            onPress={() => {
              update(row.id, { stage: 'shipping' });
              toast.show({
                title: `${row.docNo} 출고를 지시했습니다`,
                description: `${warehouseById(row.warehouseId).name} 출고 대기에 올렸습니다`,
                tone: 'success',
              });
            }}
          >
            출고 지시
          </Button>
        </>
      );
    }
    if (row.stage === 'shipping')
      return (
        <>
          <Button icon="printer">거래명세서 인쇄</Button>
          <Button
            variant="primary"
            icon="package-check"
            disabled={!canConfirm}
            onPress={() => {
              update(row.id, { stage: 'closed', shippedAt: NOW_AT });
              toast.show({
                title: `${row.docNo} 출고를 마쳤습니다`,
                description: '매출을 확정했습니다. 세금계산서를 발행하세요',
                tone: 'success',
              });
            }}
          >
            출고 완료
          </Button>
        </>
      );
    return (
      <>
        {screens.has('erp/tax/invoice-list') && (
          <Button icon="file-text" onPress={() => screens.go('erp/tax/invoice-list')}>
            세금계산서 목록
          </Button>
        )}
        {(!inv || inv.state === 'draft' || inv.state === 'ready') &&
          screens.has('erp/tax/invoice-issue') && (
            <Button
              variant="primary"
              icon="receipt"
              onPress={() => screens.go('erp/tax/invoice-issue')}
            >
              세금계산서 발행
            </Button>
          )}
      </>
    );
  }
}

function Detail({ row }: { row: Row }) {
  const party = partyById(row.partyId);
  const inv = invoiceOf(row);
  const lacking = shortageOf(row);
  const inbound = PURCHASE_ORDERS.find(
    (p) => p.state === 'ordered' && p.lines.some((l) => lacking.some((x) => x.itemId === l.itemId)),
  );
  return (
    <div className="tl-block-drawer-stack">
      {party.bizStatus === 'suspended' && (
        <Banner tone="warning" title="휴업 중인 사업자입니다">
          국세청 사업자 상태 조회에서 휴업으로 나왔습니다. 수주 확정 전에 거래처에 확인하세요.
        </Banner>
      )}
      {lacking.length > 0 && (
        <Banner tone="warning" title="가용재고 부족">
          {lacking
            .map(
              (l) =>
                `${itemById(l.itemId).name} 주문 ${formatQuantity(l.qty, itemById(l.itemId).unit)} · 가용 ${formatQuantity(l.available, itemById(l.itemId).unit)}`,
            )
            .join(' / ')}
          {inbound ? `. ${inbound.id} 입고 예정 ${formatDate(inbound.dueDate, 'md')}` : ''}
        </Banner>
      )}
      {inv?.state === 'failed' && (
        <Banner tone="danger" title="국세청 전송 실패">
          {inv.error}
        </Banner>
      )}
      <Stepper size="sm" steps={steps(row)} />
      <DescriptionList
        columns={2}
        items={[
          {
            label: '거래처',
            value: `${party.name} · ${formatBizNo(party.bizNo ?? '')}`,
            span: 2,
          },
          { label: '거래처 담당', value: `${party.manager} · ${party.phone}` },
          { label: '결제 조건', value: party.terms },
          { label: '납기', value: formatDate(row.dueDate, 'mdw') },
          { label: '출고 창고', value: warehouseById(row.warehouseId).name },
          ...(row.validUntil && row.stage === 'quote'
            ? [{ label: '견적 유효기간', value: `${formatDate(row.validUntil)}까지` }]
            : []),
          ...(row.orderNo ? [{ label: '견적 번호', value: row.id }] : []),
          ...(inv ? [{ label: '세금계산서', value: inv.id, copyable: true }] : []),
          ...(row.note ? [{ label: '메모', value: row.note, span: 2 as const }] : []),
        ]}
      />
      <DataGrid
        caption="품목"
        rows={row.lines.map((l) => {
          const it = itemById(l.itemId);
          return {
            ...l,
            it,
            amount: l.qty * l.price,
            short: lacking.some((x) => x.itemId === l.itemId),
          };
        })}
        rowKey="itemId"
        summary
        rowTone={(l) => (l.short ? 'warning' : undefined)}
        columns={[
          {
            key: 'itemId',
            header: '품목',
            render: (l) => (
              <DataGridLines
                primary={l.it.name}
                secondary={
                  <>
                    {l.it.code} · {l.it.spec}
                  </>
                }
              />
            ),
          },
          {
            key: 'qty',
            header: '수량',
            width: 'sm',
            format: 'number',
            render: (l) => formatQuantity(l.qty, l.it.unit),
          },
          { key: 'price', header: '단가', width: 'sm', format: 'amount' },
          { key: 'amount', header: '공급가액', width: 'md', format: 'amount', total: 'sum' },
        ]}
      />
      <div className="tl-block-so-totals">
        <Figure label="공급가액" value={formatAmount(row.supply)} unit="원" />
        <Figure label="세액" value={formatAmount(row.tax)} unit="원" />
        <Figure label="합계" value={formatAmount(row.total)} unit="원" />
      </div>
    </div>
  );
}
