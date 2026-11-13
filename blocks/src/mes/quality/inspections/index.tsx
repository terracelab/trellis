// 품질 검사(ListDetail): 수입 검사(입고 GR 연결) · 공정 검사(작업지시 WO 연결) 판정 목록 · 불량 유형 · 불합격 로트 처리(반품 · 폐기 · 재작업)
import {
  formatDate,
  formatPercent,
  formatQuantity,
  QUALITY_RESULTS,
  type QualityResult,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  BarList,
  Button,
  Card,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Dialog,
  DialogClose,
  Drawer,
  Field,
  FilterBar,
  Input,
  KpiCard,
  PageHeader,
  QuantityInput,
  RadioGroup,
  SegmentedControl,
  Tabs,
  Textarea,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  DISPOSITIONS,
  FLOOR_KPI,
  INSPECTIONS,
  PLANT,
  TODAY_DEFECT,
  TODAY_GOOD,
  WEEK_DEFECTS,
  type Disposition,
  type Inspection,
} from '../../../_data/mes-delivery.js';
import { TODAY } from '../../../_data/trade.js';
import { useCan } from '../../../_platform/index.js';
import {
  Col,
  ExportButton,
  Grid,
  Lines,
  Page,
  Split,
  weekStart,
  type CsvColumn,
} from '../../../_ui/index.js';
import './style.css';

type Row = Inspection & { dispositionQty?: number; reason?: string };

const KIND_LABEL = { incoming: '수입 검사', process: '공정 검사' } as const;
const pending = (r: Row) => (r.result === 'fail' || r.result === 'hold') && !r.disposition;
/** 엑셀 다운로드 열(표와 같은 내용, 수량은 서식 없는 숫자) */
const CSV: CsvColumn<Row>[] = [
  { label: '검사 번호', value: 'id' },
  { label: '구분', value: (r) => KIND_LABEL[r.kind] },
  { label: '검사 일시', value: 'at' },
  { label: '품목 코드', value: 'itemCode' },
  { label: '대상', value: 'itemName' },
  { label: '로트', value: 'lot' },
  { label: '연결 문서', value: 'ref' },
  { label: '출처', value: 'source' },
  { label: '표본', value: 'sample' },
  { label: '불량', value: 'defectQty' },
  { label: '단위', value: 'unit' },
  { label: '불량 유형', value: (r) => r.defectType ?? '' },
  { label: '판정', value: (r) => QUALITY_RESULTS[r.result].label },
  { label: '처리', value: (r) => (r.disposition ? DISPOSITIONS[r.disposition].label : '') },
];

export default function Inspections() {
  const toast = useToast();
  const canJudge = useCan('quality', 'approve');
  const [rows, setRows] = useState<Row[]>(() => INSPECTIONS.map((i) => ({ ...i })));
  const [tab, setTab] = useState('all');
  const [result, setResult] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [choice, setChoice] = useState<Disposition>('rework');
  const [qty, setQty] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const open = rows.find((r) => r.id === openId) ?? null;
  const target = rows.find((r) => r.id === dialogId) ?? null;

  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          (tab === 'all' || (tab === 'pending' ? pending(r) : r.kind === tab)) &&
          (result === 'all' || r.result === result) &&
          (!q || `${r.id}${r.ref}${r.itemName}${r.lot}${r.source}`.includes(q)),
      ),
    [rows, tab, result, q],
  );
  const today = rows.filter((r) => r.at.startsWith(TODAY));
  const todayCount = (s: QualityResult) => today.filter((r) => r.result === s).length;
  const waiting = rows.filter(pending);
  const held = rows.filter((r) => r.result === 'hold' && !r.disposition);

  const startDisposition = (r: Row) => {
    setDialogId(r.id);
    setOpenId(null);
    setChoice(r.kind === 'incoming' ? 'return' : 'rework');
    setQty(r.kind === 'incoming' ? r.defectQty : r.lotQty);
    setReason(r.note ?? '');
  };

  const confirm = () => {
    if (!target) return;
    const n = qty ?? 0;
    setRows((rs) =>
      rs.map((r) =>
        r.id === target.id
          ? { ...r, result: 'fail', disposition: choice, dispositionQty: n, reason }
          : r,
      ),
    );
    toast.show({
      title: `${DISPOSITIONS[choice].label} 처리했습니다`,
      description: `${target.lot} · ${formatQuantity(n, target.unit)} · ${
        choice === 'return'
          ? `${target.source}에 반품 알림을 보냈습니다`
          : choice === 'rework'
            ? '재작업 작업지시를 만들었습니다'
            : '폐기 대장에 기록했습니다'
      }`,
      tone: choice === 'scrap' ? 'warning' : 'success',
    });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '제조' }, { label: '품질' }]}
          title="품질 검사"
          description={`${PLANT.name} · 수입 검사는 입고, 공정 검사는 작업지시에 연결됩니다`}
          actions={
            <>
              <ExportButton module="quality" name="품질 검사" rows={shown} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              <Button variant="primary" icon="plus" disabled={!canJudge}>
                검사 등록
              </Button>
            </>
          }
          tabs={
            <Tabs
              label="검사 구분"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: '전체', count: rows.length },
                {
                  value: 'incoming',
                  label: '수입 검사',
                  count: rows.filter((r) => r.kind === 'incoming').length,
                },
                {
                  value: 'process',
                  label: '공정 검사',
                  count: rows.filter((r) => r.kind === 'process').length,
                },
                { value: 'pending', label: '처리 대기', count: waiting.length },
              ]}
            />
          }
        />
      }
    >
      <Grid>
        <Col span={3}>
          <KpiCard
            label="오늘 검사"
            value={today.length}
            unit="건"
            caption={`합격 ${todayCount('pass')} · 보류 ${todayCount('hold')} · 불합격 ${todayCount('fail')}`}
            icon="clipboard-check"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="오늘 공정 불량률"
            value={Math.round((TODAY_DEFECT / (TODAY_GOOD + TODAY_DEFECT)) * 1000) / 10}
            format="percent"
            delta={{
              value: FLOOR_KPI.defectRateDelta,
              label: '전일 대비',
              format: 'point',
              polarity: 'up-bad',
            }}
            caption={`불량 ${formatQuantity(TODAY_DEFECT, 'EA')} · 생산 ${formatQuantity(TODAY_GOOD + TODAY_DEFECT, 'EA')}`}
            icon="percent"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="보류"
            value={held.length}
            unit="건"
            caption={held[0] ? `${held[0].id} · ${held[0].defectType ?? ''}` : '보류 없음'}
            icon="circle-pause"
            onPress={held[0] ? () => setOpenId(held[0]!.id) : undefined}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="처리 대기 로트"
            value={waiting.length}
            unit="건"
            caption="반품 · 폐기 · 재작업을 정해야 합니다"
            icon="triangle-alert"
            onPress={() => setTab('pending')}
          />
        </Col>
      </Grid>
      <Split
        asideWidth="md"
        main={
          <>
            <FilterBar
              search={
                <Input
                  type="search"
                  icon="search"
                  label="검사 검색"
                  placeholder="검사 번호 · 입고 · 작업지시 · 로트"
                  value={q}
                  onChange={setQ}
                  clearable
                  size="sm"
                />
              }
              onReset={() => {
                setQ('');
                setTab('all');
                setResult('all');
              }}
              resultCount={shown.length}
            >
              <SegmentedControl
                size="sm"
                label="판정"
                value={result}
                onChange={setResult}
                options={[
                  { value: 'all', label: '전체' },
                  ...(Object.keys(QUALITY_RESULTS) as QualityResult[]).map((k) => ({
                    value: k,
                    label: QUALITY_RESULTS[k].label,
                  })),
                ]}
              />
            </FilterBar>
            <DataGrid
              caption="품질 검사"
              height="fill"
              rows={shown}
              rowKey="id"
              onRowPress={(r) => setOpenId(r.id)}
              activeRowKey={openId}
              defaultSort={{ key: 'at', direction: 'desc' }}
              rowTone={(r) => (pending(r) ? QUALITY_RESULTS[r.result].tone : undefined)}
              empty="이 조건의 검사가 없습니다. 구분이나 판정을 바꿔 보세요"
              columns={[
                {
                  key: 'at',
                  header: '검사',
                  width: 'md',
                  sticky: true,
                  sortable: true,
                  render: (r) => (
                    <DataGridLines
                      primary={<span className="tl-block-code">{r.id}</span>}
                      secondary={
                        <>
                          {KIND_LABEL[r.kind].slice(0, 2)} · {r.at.slice(5)}
                        </>
                      }
                    />
                  ),
                },
                {
                  key: 'itemName',
                  header: '대상',
                  width: 'lg',
                  render: (r) => (
                    <DataGridLines
                      primary={r.itemName}
                      secondary={
                        <>
                          {r.itemCode} · 로트 {r.lot}
                        </>
                      }
                    />
                  ),
                },
                {
                  key: 'ref',
                  header: '연결 문서',
                  width: 'md',
                  render: (r) => (
                    <DataGridLines
                      primary={<span className="tl-block-code">{r.ref}</span>}
                      secondary={r.source}
                    />
                  ),
                },
                {
                  key: 'defectQty',
                  header: '불량 / 표본',
                  width: 'md',
                  align: 'right',
                  sortable: true,
                  render: (r) => (
                    <DataGridLines
                      primary={
                        <span className="tl-block-code">
                          {formatQuantity(r.defectQty)} / {formatQuantity(r.sample, r.unit)}
                        </span>
                      }
                      secondary={r.defectType ?? '불량 없음'}
                    />
                  ),
                },
                {
                  key: 'result',
                  header: '판정 · 처리',
                  width: 'md',
                  render: (r) => (
                    <span className="tl-block-row" data-justify="start">
                      <Badge tone={QUALITY_RESULTS[r.result].tone}>
                        {QUALITY_RESULTS[r.result].label}
                      </Badge>
                      {r.disposition ? (
                        <span>{DISPOSITIONS[r.disposition].label}</span>
                      ) : pending(r) ? (
                        <span className="tl-block-muted">처리 대기</span>
                      ) : null}
                    </span>
                  ),
                },
              ]}
            />
          </>
        }
        aside={
          <>
            <Card
              title="불량 유형"
              subtitle={`이번 주 ${formatDate(weekStart(TODAY), 'md')}~${Number(TODAY.slice(8, 10))}일 · EA · 수입 파손은 박스`}
            >
              <BarList
                data={WEEK_DEFECTS}
                layout="horizontal"
                unit="EA"
                height={WEEK_DEFECTS.length * 32 + 16}
                showValues
                ariaLabel={`이번 주 불량 유형. ${WEEK_DEFECTS.map((d) => `${d.label} ${d.value}`).join(', ')}`}
              />
            </Card>
            <Card
              title="처리 대기 로트"
              subtitle={`${waiting.length}건 · 판정 뒤 처리를 정합니다`}
              padding="none"
            >
              {waiting.length === 0 ? (
                <p className="tl-block-qc-empty">처리할 로트가 없습니다</p>
              ) : (
                <ul className="tl-block-qc-lots">
                  {waiting.map((r) => (
                    <li key={r.id} className="tl-block-qc-lot">
                      <Lines
                        primary={
                          <>
                            {r.itemName} · {r.lot}
                          </>
                        }
                        secondary={
                          <>
                            {r.ref} · 불량 {formatQuantity(r.defectQty, r.unit)} · {r.defectType}
                          </>
                        }
                      />
                      <Badge tone={QUALITY_RESULTS[r.result].tone}>
                        {QUALITY_RESULTS[r.result].label}
                      </Badge>
                      <Button size="sm" disabled={!canJudge} onPress={() => startDisposition(r)}>
                        처리
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        }
      />
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.id ?? ''}
        description={open ? `${KIND_LABEL[open.kind]} · ${open.itemName} · ${open.lot}` : ''}
        width="lg"
        actions={
          open && (
            <Badge tone={QUALITY_RESULTS[open.result].tone}>
              {QUALITY_RESULTS[open.result].label}
            </Badge>
          )
        }
        footer={
          open && (
            <>
              <Button icon="printer">성적서 인쇄</Button>
              {pending(open) && (
                <Button
                  variant="primary"
                  disabled={!canJudge}
                  onPress={() => startDisposition(open)}
                >
                  불합격 처리
                </Button>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            <DescriptionList
              columns={2}
              items={[
                { label: '연결 문서', value: open.ref, copyable: true },
                { label: open.kind === 'incoming' ? '공급사' : '라인', value: open.source },
                { label: '품목', value: `${open.itemName} · ${open.itemCode}`, span: 2 },
                { label: '로트', value: open.lot },
                { label: '로트 수량', value: formatQuantity(open.lotQty, open.unit) },
                { label: '표본', value: formatQuantity(open.sample, open.unit) },
                {
                  label: '불량',
                  value: `${formatQuantity(open.defectQty, open.unit)} · ${formatPercent((open.defectQty / open.sample) * 100)}`,
                },
                { label: '검사자', value: open.inspector },
                { label: '검사 일시', value: `${formatDate(open.at)} ${open.at.slice(11)}` },
                ...(open.note ? [{ label: '메모', value: open.note, span: 2 as const }] : []),
              ]}
            />
            <DataGrid
              caption="검사 항목"
              rows={open.checks.map((c, i) => ({ ...c, no: String(i + 1) }))}
              rowKey="no"
              rowTone={(c) => (c.result === 'pass' ? undefined : QUALITY_RESULTS[c.result].tone)}
              columns={[
                { key: 'name', header: '항목', width: 'md' },
                { key: 'standard', header: '기준' },
                { key: 'measured', header: '측정 · 확인', width: 'lg' },
                {
                  key: 'result',
                  header: '판정',
                  width: 'sm',
                  render: (c) => (
                    <Badge tone={QUALITY_RESULTS[c.result].tone}>
                      {QUALITY_RESULTS[c.result].label}
                    </Badge>
                  ),
                },
              ]}
            />
            <Timeline
              ariaLabel="검사 이력"
              dense
              items={[
                ...(open.disposition
                  ? [
                      {
                        id: 'd',
                        title: `${DISPOSITIONS[open.disposition].label} 처리`,
                        time:
                          open.dispositionQty != null
                            ? `${TODAY} ${PLANT.now}`
                            : open.at.slice(0, 10),
                        actor: open.inspector,
                        description: open.reason ?? open.note,
                        tone: 'danger' as const,
                        icon: 'undo-2' as const,
                      },
                    ]
                  : []),
                {
                  id: 'j',
                  title: `판정 · ${QUALITY_RESULTS[open.result].label}`,
                  time: open.at,
                  actor: open.inspector,
                  ...(open.defectType ? { description: open.defectType } : {}),
                  tone: QUALITY_RESULTS[open.result].tone,
                  icon: 'clipboard-check' as const,
                },
                {
                  id: 'r',
                  title: open.kind === 'incoming' ? '입고 검수 연결' : '작업지시 표본 채취',
                  time: open.at,
                  description: open.ref,
                  tone: 'neutral' as const,
                },
              ]}
            />
          </div>
        )}
      </Drawer>
      <Dialog
        open={target !== null}
        onOpenChange={(o) => !o && setDialogId(null)}
        tone={choice === 'scrap' ? 'danger' : 'default'}
        title={target ? `${target.lot} 로트를 처리합니다` : ''}
        description={
          target
            ? `${target.itemName} · ${QUALITY_RESULTS[target.result].label} · 불량 ${formatQuantity(target.defectQty, target.unit)} / 표본 ${formatQuantity(target.sample, target.unit)}. 처리하면 판정이 불합격으로 확정됩니다.`
            : ''
        }
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button
                  variant={choice === 'scrap' ? 'danger' : 'primary'}
                  disabled={!qty}
                  onPress={confirm}
                >
                  {DISPOSITIONS[choice].label}
                </Button>
              }
            />
          </>
        }
      >
        {target && (
          <div className="tl-block-drawer-stack">
            <Field label="처리" required>
              <RadioGroup
                value={choice}
                onChange={(v) => setChoice(v as Disposition)}
                options={(Object.keys(DISPOSITIONS) as Disposition[]).map((k) => ({
                  value: k,
                  label: DISPOSITIONS[k].label,
                  description:
                    k === 'return' && target.kind === 'process'
                      ? '공정 로트는 반품할 수 없습니다'
                      : DISPOSITIONS[k].description,
                  disabled: k === 'return' && target.kind === 'process',
                }))}
              />
            </Field>
            <Field
              label="처리 수량"
              required
              help={`로트 ${formatQuantity(target.lotQty, target.unit)} 중`}
            >
              <QuantityInput value={qty} onChange={setQty} unit={target.unit} max={target.lotQty} />
            </Field>
            <Field label="사유">
              <Textarea
                rows={2}
                value={reason}
                onChange={setReason}
                placeholder="표본 20EA 중 6EA 중량 미달"
              />
            </Field>
          </div>
        )}
      </Dialog>
    </Page>
  );
}
