// 세금계산서 목록(ListDetail): 상태 탭 · 필터 · 선택 일괄 발행 · 상세 Drawer
import {
  formatAmount,
  formatBizNo,
  formatDate,
  formatPeriod,
  INVOICE_STATES,
  type InvoiceState,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  Badge,
  Banner,
  Button,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Dialog,
  DialogClose,
  Drawer,
  FilterBar,
  Input,
  PageHeader,
  PeriodPicker,
  SegmentedControl,
  Tabs,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  INVOICES,
  invoiceSupply,
  invoiceTax,
  invoiceTaxType,
  partyById,
  TAX_TYPES,
  taxOf,
  TODAY,
  type Invoice,
} from '../../../_data/index.js';
import { PROFILE } from '../../../_data/profile.js';
import { COMPANY, useCan, useScreens } from '../../../_platform/index.js';
import { ExportButton, monthEnd, monthStart, Page, type CsvColumn } from '../../../_ui/index.js';

/** 기본 기간: 이번 달 1일~말일 */
const MONTH_FROM = monthStart(TODAY);
const MONTH_TO = monthEnd(TODAY);

type Row = Invoice & { supply: number; tax: number; total: number; partyName: string };
/** 엑셀 다운로드 열: 공급가액 · 세액 · 합계 순서, 사업자등록번호는 3-2-5 글자(앞자리 0이 지워지지 않게) */
const csvOf = (kind: string): CsvColumn<Row>[] => [
  { label: '문서 번호', value: 'id' },
  { label: '구분', value: (r) => TAX_TYPES[invoiceTaxType(r)].label },
  { label: '작성일', value: 'date' },
  { label: kind === 'sales' ? '공급받는 자' : '공급자', value: 'partyName' },
  { label: '사업자등록번호', value: (r) => formatBizNo(partyById(r.partyId).bizNo ?? '') },
  {
    label: '품목',
    value: (r) => `${r.lines[0]!.name}${r.lines.length > 1 ? ` 외 ${r.lines.length - 1}건` : ''}`,
  },
  { label: '공급가액(원)', value: 'supply' },
  { label: '세액(원)', value: 'tax' },
  { label: '합계(원)', value: 'total' },
  { label: '상태', value: (r) => INVOICE_STATES[r.state].label },
];

const toRow = (i: Invoice): Row => {
  const supply = invoiceSupply(i);
  const tax = invoiceTax(i);
  return { ...i, supply, tax, total: supply + tax, partyName: partyById(i.partyId).name };
};

export default function InvoiceList() {
  const toast = useToast();
  const canIssue = useCan('tax', 'approve');
  const screens = useScreens();
  const [rows, setRows] = useState<Row[]>(() => INVOICES.map(toRow));
  const [kind, setKind] = useState('sales');
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [period, setPeriod] = useState({ from: MONTH_FROM, to: MONTH_TO });
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState<Row | null>(null);
  const [confirm, setConfirm] = useState(false);

  const ofKind = rows.filter(
    (r) => r.kind === kind && r.date >= period.from && r.date <= period.to,
  );
  const shown = useMemo(
    () =>
      ofKind.filter(
        (r) => (tab === 'all' || r.state === tab) && (!q || `${r.id}${r.partyName}`.includes(q)),
      ),
    [ofKind, tab, q],
  );
  const count = (s: InvoiceState) => ofKind.filter((r) => r.state === s).length;
  const failed = ofKind.filter((r) => r.state === 'failed');
  const picked = rows.filter((r) => selected.includes(r.id));
  const issuable = picked.filter((r) => r.state === 'ready' || r.state === 'draft');

  const issue = (ids: string[]) => {
    setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, state: 'issued' } : r)));
    setSelected([]);
    toast.show({
      title: `세금계산서 ${ids.length}건을 발행했습니다`,
      description: '18:00 일괄 전송 때 국세청으로 보냅니다',
      tone: 'success',
    });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '세무' }, { label: '세금계산서' }]}
          title={kind === 'sales' ? '매출 세금계산서' : '매입 세금계산서'}
          description={`${formatPeriod(period.from, period.to)} · ${ofKind.length}건`}
          actions={
            <>
              <ExportButton
                module="tax"
                name={`${kind === 'sales' ? '매출' : '매입'} 세금계산서 ${formatPeriod(period.from, period.to)}`}
                rows={shown}
                columns={csvOf(kind)}
              >
                엑셀 다운로드
              </ExportButton>
              {screens.has('erp/tax/invoice-issue') && (
                <Button
                  variant="primary"
                  icon="plus"
                  disabled={!canIssue}
                  onPress={() => screens.go('erp/tax/invoice-issue')}
                >
                  발행
                </Button>
              )}
            </>
          }
          tabs={
            <Tabs
              label="세금계산서 상태"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: '전체', count: ofKind.length },
                { value: 'ready', label: '발행 대기', count: count('ready') },
                { value: 'issued', label: '발행', count: count('issued') },
                { value: 'sent', label: '국세청 전송', count: count('sent') },
                { value: 'failed', label: '전송 실패', count: count('failed') },
                { value: 'draft', label: '작성 중', count: count('draft') },
                { value: 'cancelled', label: '발행 취소', count: count('cancelled') },
              ]}
            />
          }
        />
      }
    >
      {failed.length > 0 && (
        <Banner
          tone="danger"
          title={`국세청 전송 실패 ${failed.length}건`}
          action={
            <Button size="sm" onPress={() => setTab('failed')}>
              실패 건 보기
            </Button>
          }
        >
          {failed[0]!.id} {failed[0]!.partyName}: {failed[0]!.error}
        </Banner>
      )}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="문서 번호 · 거래처"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setTab('all');
          setPeriod({ from: MONTH_FROM, to: MONTH_TO });
        }}
        resultCount={shown.length}
      >
        <PeriodPicker
          label="작성일"
          value={period}
          onChange={setPeriod}
          today={TODAY}
          size="sm"
          presets={['today', 'thisWeek', 'thisMonth', 'lastMonth', 'vatPeriod2']}
        />
        <SegmentedControl
          size="sm"
          value={kind}
          onChange={(v) => {
            setKind(v);
            setSelected([]);
          }}
          options={[
            { value: 'sales', label: '매출' },
            { value: 'purchase', label: '매입' },
          ]}
        />
      </FilterBar>
      <DataGrid
        caption={kind === 'sales' ? '매출 세금계산서' : '매입 세금계산서'}
        height="fill"
        rows={shown}
        rowKey="id"
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        onRowPress={setOpen}
        activeRowKey={open?.id ?? null}
        summary
        defaultSort={{ key: 'date', direction: 'desc' }}
        rowTone={(r) => (r.state === 'failed' ? 'danger' : undefined)}
        empty="이 조건의 세금계산서가 없습니다. 기간이나 상태를 바꿔 보세요"
        columns={[
          {
            key: 'id',
            header: '문서 번호',
            width: 'md',
            sticky: true,
            render: (r) =>
              invoiceTaxType(r) === 'taxed' ? (
                <span className="tl-block-code">{r.id}</span>
              ) : (
                <DataGridLines
                  primary={<span className="tl-block-code">{r.id}</span>}
                  secondary={
                    <>
                      {TAX_TYPES[invoiceTaxType(r)].doc} · {TAX_TYPES[invoiceTaxType(r)].label}
                    </>
                  }
                />
              ),
          },
          { key: 'date', header: '작성일', width: 'sm', format: 'date', sortable: true },
          {
            key: 'partyName',
            header: kind === 'sales' ? '공급받는 자' : '공급자',
            width: 'lg',
            sortable: true,
            render: (r) => (
              <DataGridLines
                primary={r.partyName}
                secondary={formatBizNo(partyById(r.partyId).bizNo ?? '')}
              />
            ),
          },
          {
            key: 'item',
            header: '품목',
            render: (r) =>
              `${r.lines[0]!.name}${r.lines.length > 1 ? ` 외 ${r.lines.length - 1}건` : ''}`,
          },
          {
            key: 'supply',
            header: '공급가액',
            width: 'md',
            format: 'amount',
            total: 'sum',
            sortable: true,
          },
          { key: 'tax', header: '세액', width: 'md', format: 'amount', total: 'sum' },
          {
            key: 'total',
            header: '합계',
            width: 'md',
            format: 'amount',
            total: 'sum',
            sortable: true,
          },
          {
            key: 'state',
            header: '상태',
            width: 'md',
            render: (r) => (
              <Badge tone={INVOICE_STATES[r.state].tone}>{INVOICE_STATES[r.state].label}</Badge>
            ),
          },
        ]}
      />
      {selected.length > 0 && (
        <ActionBar
          summary={`${selected.length}건 선택 · 합계 ${formatAmount(picked.reduce((a, r) => a + r.total, 0))}원`}
        >
          <Button onPress={() => setSelected([])}>선택 해제</Button>
          <Button
            variant="primary"
            icon="send"
            disabled={!canIssue || issuable.length === 0}
            onPress={() => setConfirm(true)}
          >
            {issuable.length}건 발행
          </Button>
        </ActionBar>
      )}
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`세금계산서 ${issuable.length}건을 발행합니다`}
        description="발행하면 오늘 18:00 일괄 전송 때 국세청으로 보냅니다. 전송 전까지는 발행 취소할 수 있습니다."
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button variant="primary" onPress={() => issue(issuable.map((r) => r.id))}>
                  {issuable.length}건 발행
                </Button>
              }
            />
          </>
        }
      />
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open?.id ?? ''}
        description={open ? `${open.partyName} · ${formatDate(open.date)}` : ''}
        width="lg"
        actions={
          open && (
            <Badge tone={INVOICE_STATES[open.state].tone}>{INVOICE_STATES[open.state].label}</Badge>
          )
        }
        footer={
          open && (
            <>
              <Button icon="printer">인쇄</Button>
              {open.state === 'sent' && <Button>수정 발행</Button>}
              {(open.state === 'ready' || open.state === 'draft') && (
                <Button
                  variant="primary"
                  disabled={!canIssue}
                  onPress={() => {
                    issue([open.id]);
                    setOpen(null);
                  }}
                >
                  발행
                </Button>
              )}
              {open.state === 'failed' && (
                <Button variant="primary" disabled={!canIssue} onPress={() => setOpen(null)}>
                  다시 전송
                </Button>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            {open.error && <Banner tone="danger">{open.error}</Banner>}
            <DescriptionList
              columns={2}
              items={[
                {
                  label: '공급자',
                  value: `${COMPANY.name} · ${formatBizNo(COMPANY.bizNo)}`,
                  span: 2,
                },
                {
                  label: '공급받는 자',
                  value: `${open.partyName} · ${formatBizNo(partyById(open.partyId).bizNo ?? '')}`,
                  span: 2,
                },
                {
                  label: '과세 구분',
                  value: `${TAX_TYPES[invoiceTaxType(open)].label} · ${TAX_TYPES[invoiceTaxType(open)].doc}`,
                  span: 2,
                },
                { label: '공급가액', value: `${formatAmount(open.supply)}원` },
                { label: '세액', value: `${formatAmount(open.tax)}원` },
                { label: '합계', value: `${formatAmount(open.total)}원` },
                { label: '승인 번호', value: open.ntsNo ?? '–', copyable: !!open.ntsNo },
              ]}
            />
            <DataGrid
              caption="품목"
              rows={open.lines.map((l, i) => ({
                ...l,
                no: i + 1,
                supply: l.qty * l.unitPrice,
                tax: taxOf(l.qty * l.unitPrice, invoiceTaxType(open)),
              }))}
              rowKey="no"
              summary
              columns={[
                {
                  key: 'name',
                  header: '품목',
                  render: (l) => `${l.name}${l.spec ? ` · ${l.spec}` : ''}`,
                },
                { key: 'qty', header: '수량', width: 'xs', format: 'number' },
                { key: 'unitPrice', header: '단가', width: 'sm', format: 'amount' },
                { key: 'supply', header: '공급가액', width: 'md', format: 'amount', total: 'sum' },
                { key: 'tax', header: '세액', width: 'sm', format: 'amount', total: 'sum' },
              ]}
            />
            <Timeline
              items={[
                {
                  id: 't1',
                  title: '작성',
                  time: `${open.date} 10:12`,
                  actor: PROFILE.people.finance,
                  tone: 'neutral',
                  icon: 'file-pen',
                },
                ...(open.state !== 'draft' && open.state !== 'ready' && open.state !== 'cancelled'
                  ? [
                      {
                        id: 't2',
                        title: '발행',
                        time: `${open.date} 16:40`,
                        actor: PROFILE.people.finance,
                        tone: 'info' as const,
                        icon: 'send' as const,
                      },
                    ]
                  : []),
                ...(open.sentAt
                  ? [
                      {
                        id: 't3',
                        title: '국세청 전송 · 승인',
                        time: open.sentAt,
                        description: open.ntsNo,
                        tone: 'success' as const,
                        icon: 'circle-check' as const,
                      },
                    ]
                  : []),
                ...(open.state === 'failed'
                  ? [
                      {
                        id: 't4',
                        title: '국세청 전송 실패',
                        time: `${TODAY} 09:15`,
                        description: open.error,
                        tone: 'danger' as const,
                        icon: 'circle-alert' as const,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        )}
      </Drawer>
    </Page>
  );
}
