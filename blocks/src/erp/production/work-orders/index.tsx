// 작업지시(ListDetail): 수입 원료를 소포장 · 재포장하는 작업. 계획 대비 실적 · 자재 투입 · 실적 등록
import {
  formatAmount,
  formatDate,
  formatPercent,
  formatQuantity,
  PROGRESS_STATES,
  type ProgressState,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Banner,
  Button,
  DataBar,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Dialog,
  DialogClose,
  Drawer,
  DueBadge,
  EmptyState,
  Field,
  FilterBar,
  Input,
  KpiCard,
  PageHeader,
  Progress,
  QuantityInput,
  Select,
  Tabs,
  Textarea,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  lineById,
  materialOf,
  productById,
  staff,
  WORK_LINES,
  WORK_ORDERS,
  workDefect,
  workDone,
  type WorkOrder,
} from '../../../_data/erp.js';
import { TODAY, warehouseById } from '../../../_data/index.js';
import { useCan } from '../../../_platform/index.js';
import {
  Col,
  ExportButton,
  Figure,
  Grid,
  monthLabel,
  monthStart,
  Page,
  type CsvColumn,
} from '../../../_ui/index.js';
import './style.css';

/** 실적을 올리는 작업자: 작업지시 실적에 나온 사람 */
const WORKERS = [...new Set(WORK_ORDERS.flatMap((w) => w.results.map((r) => r.worker)))];
const MONTH_FROM = monthStart(TODAY);
const MONTH_LABEL = monthLabel(TODAY);
const qty = (v: number, unit: string) =>
  formatQuantity(v, unit, Number.isInteger(Math.round(v * 100) / 100) ? 0 : 1);
const BUCKETS: Record<string, (w: WorkOrder) => boolean> = {
  open: (w) => w.state === 'todo' || w.state === 'doing' || w.state === 'hold',
  done: (w) => w.state === 'done',
  cancel: (w) => w.state === 'cancel',
  all: () => true,
};

export default function WorkOrders() {
  const toast = useToast();
  const canRecord = useCan('production', 'create');
  const canUpdate = useCan('production', 'update');
  const [orders, setOrders] = useState<WorkOrder[]>(() => [...WORK_ORDERS]);
  const [tab, setTab] = useState('open');
  const [q, setQ] = useState('');
  const [line, setLine] = useState<string | null>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    good: number | null;
    defect: number | null;
    worker: string | null;
    note: string;
  } | null>(null);

  const rows = useMemo(
    () =>
      orders.map((w) => {
        const p = productById(w.productId);
        return { ...w, p, done: workDone(w), defect: workDefect(w), line: lineById(w.lineId) };
      }),
    [orders],
  );
  const shown = rows.filter(
    (r) =>
      BUCKETS[tab]!(r) &&
      (line === 'all' || !line || r.lineId === line) &&
      (!q || `${r.id}${r.p.name}${r.p.code}`.includes(q)),
  );
  const open = rows.find((r) => r.id === openId) ?? null;
  /** 엑셀 다운로드 열(표와 같은 내용, 수량은 서식 없는 숫자) */
  const csv: CsvColumn<(typeof rows)[number]>[] = [
    { label: '작업지시', value: 'id' },
    { label: '작업일', value: 'date' },
    { label: '완제품 코드', value: (r) => r.p.code },
    { label: '완제품', value: (r) => r.p.name },
    { label: '규격', value: (r) => r.p.spec },
    { label: '라인', value: (r) => r.line.name },
    { label: '담당', value: (r) => staff(r.owner) },
    { label: '계획', value: 'planned' },
    { label: '실적', value: 'done' },
    { label: '불량', value: 'defect' },
    { label: '단위', value: (r) => r.p.unit },
    { label: '납기', value: 'dueDate' },
    { label: '상태', value: (r) => PROGRESS_STATES[r.state].label },
  ];
  const held = rows.filter((r) => r.state === 'hold');
  const today = rows.filter((r) => r.date === TODAY);
  const todayDone = today.reduce((a, r) => a + r.done, 0);
  const todayPlanned = today.reduce((a, r) => a + r.planned, 0);
  const monthOrders = rows.filter((r) => r.date >= MONTH_FROM && r.results.length);
  const monthDone = monthOrders.reduce((a, r) => a + r.done, 0);
  const monthDefect = monthOrders.reduce((a, r) => a + r.defect, 0);

  const update = (id: string, patch: Partial<WorkOrder>) =>
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const setState = (id: string, state: ProgressState, title: string) => {
    update(id, { state });
    toast.show({ title, tone: state === 'hold' ? 'warning' : 'success' });
  };

  const record = () => {
    if (!open || !form?.good || !form.worker) return;
    const done = open.done + form.good;
    const finished = done >= open.planned;
    update(open.id, {
      state: finished ? 'done' : 'doing',
      results: [
        ...open.results,
        {
          id: `${open.id}-${open.results.length + 1}`,
          at: `${TODAY} 15:40`,
          good: form.good,
          defect: form.defect ?? 0,
          worker: form.worker,
          note: form.note || undefined,
        },
      ],
    });
    setForm(null);
    toast.show({
      title: `실적 ${formatQuantity(form.good, open.p.unit)}을 등록했습니다`,
      description: finished
        ? `${open.id} 작업을 완료했습니다. 완제품 재고에 반영합니다`
        : `남은 수량 ${formatQuantity(open.planned - done, open.p.unit)}`,
      tone: 'success',
    });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '생산' }, { label: '작업지시' }]}
          title="작업지시"
          description={`${formatDate(TODAY, 'mdw')} · 수입 원료 소분 · 재포장 · 라인 ${WORK_LINES.length}개`}
          actions={
            <>
              <ExportButton module="production" name="작업지시" rows={shown} columns={csv}>
                엑셀 다운로드
              </ExportButton>
              <Button icon="printer">작업지시서 인쇄</Button>
            </>
          }
          tabs={
            <Tabs
              label="작업 상태"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'open', label: '진행 중', count: rows.filter(BUCKETS.open!).length },
                { value: 'done', label: '완료', count: rows.filter(BUCKETS.done!).length },
                { value: 'cancel', label: '취소', count: rows.filter(BUCKETS.cancel!).length },
                { value: 'all', label: '전체', count: rows.length },
              ]}
            />
          }
        />
      }
    >
      <Grid gap="tight">
        <Col span={3}>
          <KpiCard
            label="오늘 실적"
            value={todayDone}
            unit="EA"
            caption={`계획 ${formatQuantity(todayPlanned, 'EA')} · 달성 ${formatPercent(todayPlanned ? (todayDone / todayPlanned) * 100 : 0, 0)}`}
            icon="factory"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="진행 중 작업지시"
            value={rows.filter(BUCKETS.open!).length}
            unit="건"
            caption={`대기 ${rows.filter((r) => r.state === 'todo').length} · 진행 ${rows.filter((r) => r.state === 'doing').length} · 보류 ${held.length}`}
            icon="clipboard-list"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={`${MONTH_LABEL} 완제품 입고`}
            value={monthDone}
            unit="EA"
            caption={`작업지시 ${monthOrders.length}건 · 소분 · 재포장`}
            icon="package-check"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={`${MONTH_LABEL} 불량률`}
            value={
              monthDone + monthDefect
                ? Math.round((monthDefect / (monthDone + monthDefect)) * 1000) / 10
                : 0
            }
            format="percent"
            caption={`불량 ${formatQuantity(monthDefect, 'EA')} · 파우치 실링 · 라벨`}
            icon="triangle-alert"
          />
        </Col>
      </Grid>
      {held.length > 0 && (
        <Banner
          tone="warning"
          title={`보류 ${held.length}건`}
          action={
            <Button size="sm" onPress={() => setOpenId(held[0]!.id)}>
              {held[0]!.id} 보기
            </Button>
          }
        >
          {held[0]!.p.name}: {held[0]!.reason}
        </Banner>
      )}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            placeholder="작업지시 번호 · 품목"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setLine('all');
          setTab('open');
        }}
        resultCount={shown.length}
      >
        <Select
          label="작업 라인"
          size="sm"
          width="auto"
          value={line}
          onChange={setLine}
          options={[
            { value: 'all', label: '라인 전체' },
            ...WORK_LINES.map((l) => ({ value: l.id, label: l.name })),
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="작업지시"
        height="fill"
        rows={shown}
        rowKey="id"
        onRowPress={(r) => setOpenId(r.id)}
        activeRowKey={openId}
        rowTone={(r) => (r.state === 'hold' ? 'warning' : undefined)}
        empty="이 조건의 작업지시가 없습니다. 상태나 라인을 바꿔 보세요"
        columns={[
          {
            key: 'id',
            header: '작업지시',
            width: 'md',
            sticky: true,
            render: (r) => (
              <DataGridLines
                primary={<span className="tl-block-code">{r.id}</span>}
                secondary={<>작업일 {r.date.slice(5)}</>}
              />
            ),
          },
          {
            key: 'productId',
            header: '완제품',
            render: (r) => (
              <DataGridLines
                primary={r.p.name}
                secondary={
                  <>
                    {r.p.code} · {r.p.spec}
                  </>
                }
              />
            ),
          },
          {
            key: 'lineId',
            header: '라인 · 담당',
            width: 'lg',
            render: (r) => <DataGridLines primary={r.line.name} secondary={staff(r.owner)} />,
          },
          {
            key: 'done',
            header: '실적 / 계획',
            width: 'lg',
            render: (r) => (
              <span className="tl-block-wo-qty">
                <DataBar
                  value={r.done}
                  max={r.planned}
                  width={72}
                  unit={r.p.unit}
                  format={(v) => formatAmount(v)}
                  color={
                    r.state === 'done' ? 'success' : r.state === 'hold' ? 'warning' : 'series-1'
                  }
                  label={`${r.id} 실적`}
                />
                <span className="tl-block-wo-qty__plan">
                  / {formatQuantity(r.planned, r.p.unit)}
                </span>
              </span>
            ),
          },
          {
            key: 'dueDate',
            header: '납기',
            width: 'md',
            render: (r) => (
              <DataGridLines
                primary={r.dueDate}
                secondary={
                  <>
                    <DueBadge
                      due={r.dueDate}
                      today={TODAY}
                      size="sm"
                      done={r.state === 'done' || r.state === 'cancel'}
                      doneLabel={r.state === 'cancel' ? '취소' : '완료'}
                    />
                  </>
                }
              />
            ),
          },
          {
            key: 'state',
            header: '상태',
            width: 'sm',
            render: (r) => (
              <Badge tone={PROGRESS_STATES[r.state].tone}>{PROGRESS_STATES[r.state].label}</Badge>
            ),
          },
        ]}
      />

      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.id ?? ''}
        description={open ? `${open.p.name} ${open.p.spec} · ${open.line.name}` : ''}
        width="lg"
        actions={
          open && (
            <Badge tone={PROGRESS_STATES[open.state].tone}>
              {PROGRESS_STATES[open.state].label}
            </Badge>
          )
        }
        footer={
          open && (
            <>
              {open.state === 'todo' && (
                <Button
                  variant="primary"
                  icon="play"
                  disabled={!canUpdate}
                  onPress={() => setState(open.id, 'doing', `${open.id} 작업을 시작했습니다`)}
                >
                  작업 시작
                </Button>
              )}
              {open.state === 'doing' && (
                <>
                  <Button
                    icon="circle-pause"
                    disabled={!canUpdate}
                    onPress={() => setState(open.id, 'hold', `${open.id}을 보류했습니다`)}
                  >
                    보류
                  </Button>
                  <Button
                    variant="primary"
                    icon="clipboard-check"
                    disabled={!canRecord}
                    onPress={() =>
                      setForm({
                        good: open.planned - open.done,
                        defect: 0,
                        worker: open.owner,
                        note: '',
                      })
                    }
                  >
                    실적 등록
                  </Button>
                </>
              )}
              {open.state === 'hold' && (
                <Button
                  variant="primary"
                  icon="play"
                  disabled={!canUpdate}
                  onPress={() => setState(open.id, 'todo', `${open.id} 보류를 풀었습니다`)}
                >
                  보류 해제
                </Button>
              )}
              {(open.state === 'done' || open.state === 'cancel') && (
                <Button icon="printer">작업지시서 인쇄</Button>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            {open.reason && (
              <Banner
                tone={open.state === 'hold' ? 'warning' : 'neutral'}
                title={
                  open.state === 'hold'
                    ? '보류 사유'
                    : open.state === 'cancel'
                      ? '취소 사유'
                      : '메모'
                }
              >
                {open.reason}
              </Banner>
            )}
            <DescriptionList
              columns={2}
              items={[
                {
                  label: '완제품',
                  value: `${open.p.code} ${open.p.name} · ${open.p.spec}`,
                  span: 2,
                },
                { label: '라인', value: open.line.name },
                { label: '창고', value: warehouseById(open.line.warehouseId).name },
                { label: '작업일', value: formatDate(open.date, 'mdw') },
                { label: '납기', value: formatDate(open.dueDate, 'mdw') },
                { label: '원료 로트', value: open.sourceLot ?? '–' },
                { label: '담당', value: staff(open.owner) },
              ]}
            />
            <div className="tl-block-wo-progress">
              <Progress
                value={open.done}
                max={open.planned}
                unit={open.p.unit}
                label="생산 실적"
                tone={open.state === 'done' ? 'success' : undefined}
              />
              <div className="tl-block-wo-figures">
                <Figure label="양품" value={formatQuantity(open.done, open.p.unit)} />
                <Figure
                  label="불량"
                  value={formatQuantity(open.defect, open.p.unit)}
                  tone={open.defect ? 'danger' : undefined}
                />
                <Figure
                  label="불량률"
                  value={
                    open.done + open.defect
                      ? formatPercent((open.defect / (open.done + open.defect)) * 100)
                      : '–'
                  }
                />
              </div>
            </div>
            <DataGrid
              caption="자재 투입"
              rows={open.p.bom.map((b) => {
                const m = materialOf(b.code);
                const std = b.per * open.planned;
                const used = b.per * (open.done + open.defect);
                return { ...b, m, std, used, left: Math.max(0, std - used) };
              })}
              rowKey="code"
              columns={[
                {
                  key: 'code',
                  header: '자재',
                  render: (r) => (
                    <DataGridLines
                      primary={r.m.name}
                      secondary={
                        <>
                          {r.m.code} · 1{open.p.unit}당 {qty(r.per, r.m.unit)}
                        </>
                      }
                    />
                  ),
                },
                {
                  key: 'std',
                  header: '소요(계획)',
                  width: 'sm',
                  format: 'number',
                  render: (r) => qty(r.std, r.m.unit),
                },
                {
                  key: 'used',
                  header: '투입',
                  width: 'sm',
                  format: 'number',
                  render: (r) => qty(r.used, r.m.unit),
                },
                {
                  key: 'left',
                  header: '남은 소요',
                  width: 'sm',
                  format: 'number',
                  render: (r) => qty(r.left, r.m.unit),
                },
              ]}
            />
            {open.results.length ? (
              <Timeline
                dense
                ariaLabel="실적 이력"
                items={[...open.results].reverse().map((r) => ({
                  id: r.id,
                  title: `양품 ${formatQuantity(r.good, open.p.unit)} · 불량 ${formatQuantity(r.defect, open.p.unit)}`,
                  time: r.at,
                  actor: staff(r.worker),
                  description: r.note,
                  tone: r.defect ? ('warning' as const) : ('success' as const),
                  icon: 'clipboard-check' as const,
                }))}
              />
            ) : (
              <EmptyState
                size="sm"
                icon="clipboard-list"
                title="등록된 실적이 없습니다"
                description={
                  open.state === 'todo'
                    ? '작업을 시작한 뒤 실적을 등록하세요'
                    : '이 작업지시는 실적 없이 끝났습니다'
                }
              />
            )}
          </div>
        )}
      </Drawer>

      <Dialog
        open={form !== null}
        onOpenChange={(o) => !o && setForm(null)}
        title="실적 등록"
        description={
          open
            ? `${open.id} ${open.p.name} · 남은 수량 ${formatQuantity(open.planned - open.done, open.p.unit)}`
            : ''
        }
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <Button variant="primary" disabled={!form?.good || !form.worker} onPress={record}>
              등록
            </Button>
          </>
        }
      >
        {form && open && (
          <div className="tl-block-wo-form">
            <Field label="양품 수량" required help="계획을 넘기면 초과 생산으로 기록됩니다">
              <QuantityInput
                value={form.good}
                onChange={(v) => setForm({ ...form, good: v })}
                unit={open.p.unit}
                step={10}
                min={0}
              />
            </Field>
            <Field label="불량 수량">
              <QuantityInput
                value={form.defect}
                onChange={(v) => setForm({ ...form, defect: v })}
                unit={open.p.unit}
                min={0}
              />
            </Field>
            <Field label="작업자" required>
              <Select
                value={form.worker}
                onChange={(v) => setForm({ ...form, worker: v })}
                options={WORKERS.map((n) => ({ value: n, label: staff(n) }))}
              />
            </Field>
            <Field label="비고">
              <Textarea
                rows={2}
                value={form.note}
                onChange={(v) => setForm({ ...form, note: v })}
                placeholder="파우치 실링 불량 2EA 폐기"
              />
            </Field>
          </div>
        )}
      </Dialog>
    </Page>
  );
}
