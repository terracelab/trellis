// 발주 목록(ListDetail): 외화 발주 · 입고 진행 · 결재선 · 선적 연결
import {
  formatAmount,
  formatCurrency,
  formatDate,
  formatQuantity,
} from '@terracelab/trellis-contracts';
import {
  ApprovalLine,
  Badge,
  Button,
  DataBar,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  FilterBar,
  Input,
  Menu,
  PageHeader,
  Select,
  Stepper,
  Tabs,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  itemById,
  partyById,
  PO_STATES,
  poAmount,
  poAmountKrw,
  PURCHASE_ORDERS,
  rateOf,
  SHIPMENTS,
  warehouseById,
  type PurchaseOrder,
} from '../../../_data/index.js';
import { approvalLine } from '../../../_data/profile.js';
import { useCan, useScreens } from '../../../_platform/index.js';
import { ExportButton, Page, type CsvColumn } from '../../../_ui/index.js';

/** 결재선(기안자 다음): 회사 설정. 마지막 사람이 승인한다 */
const LINE = approvalLine();
/** 지난 결재 시각(예시): 검토 11:05 · 승인 14:30 */
const LINE_TIMES = ['11:05', '14:30'];

/** 엑셀 다운로드 열: 발주 금액은 통화 금액 숫자 + 통화 코드, 원화 환산은 원 숫자 */
const CSV: CsvColumn<PurchaseOrder & { partyName: string; krw: number; progress: number }>[] = [
  { label: '발주 번호', value: 'id' },
  { label: '발주일', value: 'date' },
  { label: '거래처', value: 'partyName' },
  {
    label: '품목',
    value: (p) =>
      `${itemById(p.lines[0]!.itemId).name}${p.lines.length > 1 ? ` 외 ${p.lines.length - 1}` : ''}`,
  },
  { label: '통화', value: 'currency' },
  { label: '발주 금액', value: (p) => poAmount(p) },
  { label: '원화 환산(원)', value: 'krw' },
  { label: '납기', value: 'dueDate' },
  { label: '입고(%)', value: 'progress' },
  { label: '상태', value: (p) => PO_STATES[p.state].label },
];

const progress = (po: PurchaseOrder) => {
  const o = po.lines.reduce((a, l) => a + l.qty, 0);
  return Math.round((po.lines.reduce((a, l) => a + l.received, 0) / o) * 100);
};

export default function PoList() {
  const canCreate = useCan('purchasing', 'create');
  const screens = useScreens();
  const [tab, setTab] = useState('open');
  const [q, setQ] = useState('');
  const [currency, setCurrency] = useState<string | null>('all');
  const [open, setOpen] = useState<PurchaseOrder | null>(null);
  const rows = useMemo(
    () =>
      PURCHASE_ORDERS.filter(
        (p) =>
          (tab === 'all' ||
            (tab === 'open'
              ? ['approval', 'ordered', 'partial'].includes(p.state)
              : p.state === tab)) &&
          (currency === 'all' ||
            !currency ||
            (currency === 'foreign' ? p.currency !== 'KRW' : p.currency === 'KRW')) &&
          (!q || `${p.id}${partyById(p.partyId).name}`.includes(q)),
      ).map((p) => ({
        ...p,
        partyName: partyById(p.partyId).name,
        krw: poAmountKrw(p),
        progress: progress(p),
      })),
    [tab, q, currency],
  );
  const n = (f: (p: PurchaseOrder) => boolean) => PURCHASE_ORDERS.filter(f).length;
  const ship = open?.shipmentId ? SHIPMENTS.find((s) => s.id === open.shipmentId) : undefined;
  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '구매' }, { label: '발주' }]}
          title="발주"
          description="국내 · 해외 발주. 외화는 오늘 매매기준율로 원화 환산합니다"
          actions={
            <>
              <ExportButton module="purchasing" name="발주" rows={rows} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              {screens.has('erp/purchasing/po-form') && (
                <Button
                  variant="primary"
                  icon="file-plus"
                  disabled={!canCreate}
                  onPress={() => screens.go('erp/purchasing/po-form')}
                >
                  발주서 작성
                </Button>
              )}
            </>
          }
          tabs={
            <Tabs
              label="발주 상태"
              value={tab}
              onChange={setTab}
              items={[
                {
                  value: 'open',
                  label: '진행 중',
                  count: n((p) => ['approval', 'ordered', 'partial'].includes(p.state)),
                },
                { value: 'draft', label: '작성 중', count: n((p) => p.state === 'draft') },
                { value: 'approval', label: '결재 중', count: n((p) => p.state === 'approval') },
                { value: 'received', label: '입고 완료', count: n((p) => p.state === 'received') },
                { value: 'all', label: '전체', count: PURCHASE_ORDERS.length },
              ]}
            />
          }
        />
      }
    >
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="발주 번호 · 거래처"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        resultCount={rows.length}
        onReset={() => {
          setQ('');
          setCurrency('all');
        }}
      >
        <Select
          size="sm"
          width="auto"
          label="통화"
          value={currency}
          onChange={setCurrency}
          options={[
            { value: 'all', label: '통화 전체' },
            { value: 'KRW', label: '국내(원화)' },
            { value: 'foreign', label: '해외(외화)' },
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="발주"
        height="fill"
        rows={rows}
        rowKey="id"
        onRowPress={setOpen}
        activeRowKey={open?.id ?? null}
        summary
        defaultSort={{ key: 'date', direction: 'desc' }}
        columns={[
          {
            key: 'id',
            header: '발주 번호',
            width: 'md',
            sticky: true,
            render: (p) => <span className="tl-block-code">{p.id}</span>,
          },
          { key: 'date', header: '발주일', width: 'sm', format: 'date', sortable: true },
          { key: 'partyName', header: '거래처', sortable: true },
          {
            key: 'item',
            header: '품목',
            render: (p) =>
              `${itemById(p.lines[0]!.itemId).name}${p.lines.length > 1 ? ` 외 ${p.lines.length - 1}` : ''}`,
          },
          {
            key: 'amount',
            header: '발주 금액',
            width: 'md',
            align: 'right',
            render: (p) => formatCurrency(poAmount(p), p.currency),
          },
          {
            key: 'krw',
            header: '원화 환산',
            width: 'md',
            format: 'amount',
            total: 'sum',
            sortable: true,
          },
          { key: 'dueDate', header: '납기', width: 'sm', format: 'date', sortable: true },
          {
            key: 'progress',
            header: '입고',
            width: 'md',
            render: (p) => (
              <DataBar
                width={40}
                value={p.progress}
                max={100}
                unit="%"
                label={`${p.id} 입고 ${p.progress}%`}
              />
            ),
          },
          {
            key: 'state',
            header: '상태',
            width: 'sm',
            render: (p) => <Badge tone={PO_STATES[p.state].tone}>{PO_STATES[p.state].label}</Badge>,
          },
        ]}
      />
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open?.id ?? ''}
        description={
          open
            ? `${partyById(open.partyId).name} · ${formatDate(open.date)} 발주 · ${open.buyer}`
            : ''
        }
        width="xl"
        actions={
          open && (
            <Menu
              trigger={
                <Button size="sm" iconEnd="chevron-down">
                  더 보기
                </Button>
              }
              items={[
                { id: 'print', label: '발주서 인쇄', icon: 'printer' },
                { id: 'mail', label: '거래처에 메일 보내기', icon: 'mail' },
                { id: 'copy', label: '복사해서 새로 작성', icon: 'copy' },
                { type: 'separator' },
                {
                  id: 'cancel',
                  label: '발주 취소',
                  icon: 'ban',
                  danger: true,
                  disabled: open.state === 'received',
                },
              ]}
            />
          )
        }
        footer={
          open &&
          open.state !== 'received' &&
          screens.has('scm/warehouse/receiving') && (
            <Button variant="primary" onPress={() => screens.go('scm/warehouse/receiving')}>
              입고 처리
            </Button>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            <Stepper
              steps={[
                { id: 'draft', label: '작성', state: 'done' },
                {
                  id: 'approval',
                  label: '결재',
                  state:
                    open.approval === 'approved'
                      ? 'done'
                      : open.approval === 'pending'
                        ? 'current'
                        : 'todo',
                },
                {
                  id: 'ordered',
                  label: '발주',
                  state: ['ordered', 'partial', 'received'].includes(open.state) ? 'done' : 'todo',
                },
                {
                  id: 'shipping',
                  label: '선적 · 통관',
                  state: ship
                    ? ship.state === 'cleared'
                      ? 'done'
                      : 'current'
                    : open.currency === 'KRW'
                      ? 'done'
                      : 'todo',
                },
                {
                  id: 'received',
                  label: '입고',
                  state:
                    open.state === 'received'
                      ? 'done'
                      : open.state === 'partial'
                        ? 'current'
                        : 'todo',
                },
              ]}
            />
            <DescriptionList
              columns={3}
              items={[
                { label: '거래처', value: partyById(open.partyId).name },
                { label: '결제 조건', value: partyById(open.partyId).terms },
                { label: '인코텀즈', value: open.incoterms ?? '–' },
                { label: '발주 금액', value: formatCurrency(poAmount(open), open.currency) },
                {
                  label: '적용 환율',
                  value:
                    open.currency === 'KRW'
                      ? '–'
                      : `${formatAmount(rateOf(open.currency), { digits: 2 })}원`,
                },
                { label: '원화 환산', value: `${formatAmount(poAmountKrw(open))}원` },
                { label: '입고 창고', value: warehouseById(open.warehouseId).name },
                { label: '납기', value: formatDate(open.dueDate) },
                { label: 'B/L', value: ship?.blNo ?? '–', copyable: !!ship },
              ]}
            />
            <DataGrid
              caption="발주 품목"
              rows={open.lines.map((l) => ({
                ...l,
                name: itemById(l.itemId).name,
                spec: itemById(l.itemId).spec,
                unit: itemById(l.itemId).unit,
                amount: l.qty * l.unitPrice,
              }))}
              rowKey="itemId"
              columns={[
                {
                  key: 'name',
                  header: '품목',
                  render: (l) => <DataGridLines primary={l.name} secondary={l.spec} />,
                },
                {
                  key: 'qty',
                  header: '발주',
                  width: 'sm',
                  align: 'right',
                  render: (l) => formatQuantity(l.qty, l.unit),
                },
                {
                  key: 'received',
                  header: '입고',
                  width: 'sm',
                  align: 'right',
                  render: (l) => formatQuantity(l.received, l.unit),
                },
                {
                  key: 'unitPrice',
                  header: '단가',
                  width: 'md',
                  align: 'right',
                  render: (l) => formatCurrency(l.unitPrice, open.currency),
                },
                {
                  key: 'amount',
                  header: '금액',
                  width: 'md',
                  align: 'right',
                  render: (l) => formatCurrency(l.amount, open.currency),
                },
              ]}
            />
            <ApprovalLine
              approvers={[
                {
                  id: 'a1',
                  name: open.buyer.split(' ')[0]!,
                  title: open.buyer.split(' ')[1] ?? '',
                  role: '기안',
                  state: 'approved',
                  time: `${open.date.slice(5)} 09:20`,
                },
                // 첫 결재자는 문서 상태를 따르고, 그 뒤는 승인되었을 때만 승인
                ...LINE.map((a, i) => ({
                  id: `a${i + 2}`,
                  name: a.name,
                  title: a.title,
                  role: a.role,
                  state:
                    i === 0
                      ? open.approval === 'draft'
                        ? ('waiting' as const)
                        : open.approval === 'pending'
                          ? ('pending' as const)
                          : open.approval
                      : open.approval === 'approved'
                        ? ('approved' as const)
                        : ('waiting' as const),
                  time:
                    open.approval === 'approved'
                      ? `${open.date.slice(5)} ${LINE_TIMES[i] ?? LINE_TIMES[LINE_TIMES.length - 1]}`
                      : undefined,
                })),
              ]}
            />
          </div>
        )}
      </Drawer>
    </Page>
  );
}
