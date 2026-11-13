// 설비 현황(ListDetail): 상태 탭 · 라인 필터 · 설비 표 · 상세 Drawer(센서 추이 · 점검 이력 · 점검 등록)
import {
  dueDays,
  formatAmount,
  formatDate,
  formatPercent,
  MACHINE_STATES,
  parseDate,
  type MachineState,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Banner,
  Button,
  ChartCard,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  DueBadge,
  Field,
  FilterBar,
  FormSection,
  Input,
  KpiCard,
  PageHeader,
  RadioGroup,
  SegmentedControl,
  Select,
  StatusDot,
  Tabs,
  Textarea,
  Timeline,
  TrendChart,
  useToast,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  durationLabel,
  EQUIPMENT,
  equipmentAvailability,
  lineById,
  LINES,
  MES_PEOPLE,
  PLANT,
  sensorNow,
  type Equipment,
  type InspectionRecord,
} from '../../../_data/mes-delivery.js';
import { PROFILE } from '../../../_data/profile.js';
import { TODAY } from '../../../_data/trade.js';
import { useCan } from '../../../_platform/index.js';
import { Col, ExportButton, Grid, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

const KINDS = {
  daily: '일상 점검',
  weekly: '주간 점검',
  periodic: '정기 점검',
  repair: '고장 수리',
} as const;
type Kind = keyof typeof KINDS;

const RESULTS = [
  { value: 'ok', label: '정상', description: '바로 가동할 수 있습니다' },
  { value: 'action', label: '조치 필요', description: '가동은 하되 다음 점검에서 다시 봅니다' },
  { value: 'stop', label: '사용 중지', description: '비가동으로 바꾸고 설비 담당에게 알립니다' },
];

/** 라인에 속한 설비인지(아니면 보관 창고 같은 공용 설비) */
const onLine = (e: Equipment) => LINES.some((l) => l.id === e.lineId);
const STORAGE = 'storage';
const lineLabel = (e: Equipment) => (onLine(e) ? lineById(e.lineId).name : '보관');
/** 엑셀 다운로드 열(표와 같은 순서, 가동 시간은 분 · 가동률은 % 숫자) */
const CSV: CsvColumn<Equipment>[] = [
  { label: '설비 번호', value: 'id' },
  { label: '설비', value: 'name' },
  { label: '라인', value: (e) => lineLabel(e) },
  { label: '상태', value: (e) => MACHINE_STATES[e.state].label },
  { label: '상태 시작', value: 'since' },
  { label: '사유', value: (e) => e.reason ?? '' },
  { label: '오늘 가동(분)', value: 'runMin' },
  { label: '가동률(%)', value: (e) => equipmentAvailability(e) },
  { label: '측정 항목', value: (e) => e.sensor.label },
  { label: '현재 값', value: (e) => sensorNow(e) },
  { label: '측정 단위', value: (e) => e.sensor.unit },
  { label: '다음 점검', value: 'nextInspection' },
  { label: '점검 주기', value: 'cycleLabel' },
  { label: '담당', value: 'owner' },
];
const fmt1 = (v: number) => formatAmount(v, { digits: 1 });
/** 정수는 정수로, 소수는 한 자리(축 눈금은 정수, 끝값은 소수) */
const fmtAuto = (v: number) => formatAmount(v, { digits: Number.isInteger(v) ? 0 : 1 });
const where = (e: Equipment) =>
  onLine(e) ? `${lineLabel(e)} ${e.process}` : `${PROFILE.cold?.label ?? ''} ${e.process}`.trim();
const addDays = (iso: string, n: number) => {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  return formatDate(d);
};
/** 센서 값이 허용 범위 끝 1단위 안이면 주의 */
const nearLimit = (e: Equipment) => {
  const v = sensorNow(e);
  const [lo, hi] = e.sensor.range;
  return v > hi - 1 || v < lo + 1;
};

export default function EquipmentStatus() {
  const toast = useToast();
  const canInspect = useCan('equipment', 'update');
  const [rows, setRows] = useState<Equipment[]>(() => EQUIPMENT.map((e) => ({ ...e })));
  const [tab, setTab] = useState('all');
  const [line, setLine] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [kind, setKind] = useState<Kind>('daily');
  const [result, setResult] = useState('ok');
  const [inspector, setInspector] = useState<string | null>(MES_PEOPLE.maint);
  const [memo, setMemo] = useState('');
  const open = rows.find((e) => e.id === openId) ?? null;

  const shown = useMemo(
    () =>
      rows.filter(
        (e) =>
          (tab === 'all' || e.state === tab) &&
          (line === 'all' || (line === STORAGE ? !onLine(e) : e.lineId === line)) &&
          (!q || `${e.id}${e.name}${e.model}`.includes(q)),
      ),
    [rows, tab, line, q],
  );
  const count = (s: MachineState) => rows.filter((e) => e.state === s).length;
  const lineRows = rows.filter(onLine);
  const avgAvail =
    Math.round(
      (lineRows.reduce((a, e) => a + equipmentAvailability(e), 0) / lineRows.length) * 10,
    ) / 10;
  const due = rows.filter((e) => dueDays(e.nextInspection, TODAY) <= 3);
  const overdue = rows.filter((e) => dueDays(e.nextInspection, TODAY) < 0);
  const warm = rows.filter((e) => !onLine(e) && nearLimit(e));
  const down = rows.filter((e) => e.state === 'down');

  const openDrawer = (e: Equipment) => {
    setOpenId(e.id);
    setKind(e.state === 'down' ? 'repair' : 'daily');
    setResult('ok');
    setMemo('');
  };

  const register = () => {
    if (!open) return;
    const record: InspectionRecord = {
      id: `n${open.history.length + 1}`,
      title: KINDS[kind],
      time: `${TODAY} ${PLANT.now}`,
      actor: inspector ?? MES_PEOPLE.maint,
      description: memo || RESULTS.find((r) => r.value === result)!.label,
      tone: result === 'ok' ? 'success' : result === 'action' ? 'warning' : 'danger',
    };
    const next = addDays(TODAY, open.cycleDays);
    const back = result === 'ok' && (open.state === 'down' || open.state === 'maintenance');
    setRows((rs) =>
      rs.map((e) =>
        e.id === open.id
          ? {
              ...e,
              history: [record, ...e.history],
              lastInspection: TODAY,
              nextInspection: next,
              ...(back ? { state: 'running' as const, since: PLANT.now, reason: undefined } : {}),
              ...(result === 'stop'
                ? {
                    state: 'down' as const,
                    since: PLANT.now,
                    reason: memo || '점검 결과 사용 중지',
                  }
                : {}),
            }
          : e,
      ),
    );
    setMemo('');
    toast.show({
      title: `${open.name} ${KINDS[kind]}을 등록했습니다`,
      description: back ? `가동으로 바꿨습니다 · 다음 점검 ${next}` : `다음 점검 ${next}`,
      tone: 'success',
    });
  };

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '제조' }, { label: '설비' }]}
          title="설비 현황"
          description={`${PLANT.name} · 설비 ${rows.length}대 · ${PLANT.now} 기준`}
          actions={
            <>
              <ExportButton module="equipment" name="설비 현황" rows={shown} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              <Button variant="primary" icon="plus" disabled={!canInspect}>
                설비 등록
              </Button>
            </>
          }
          tabs={
            <Tabs
              label="설비 상태"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: '전체', count: rows.length },
                ...(Object.keys(MACHINE_STATES) as MachineState[]).map((s) => ({
                  value: s,
                  label: MACHINE_STATES[s].label,
                  count: count(s),
                })),
              ]}
            />
          }
        />
      }
    >
      {down.length > 0 && (
        <Banner
          tone="danger"
          title={`비가동 ${down.length}대`}
          action={
            <Button size="sm" onPress={() => openDrawer(down[0]!)}>
              상세 보기
            </Button>
          }
        >
          {down[0]!.name}: {down[0]!.since}부터 {down[0]!.reason}
        </Banner>
      )}
      <Grid>
        <Col span={3}>
          <KpiCard
            label="가동 설비"
            value={count('running')}
            unit={`/ ${rows.length}대`}
            caption={`비가동 ${count('down')} · 점검 ${count('maintenance')} · 준비 ${count('setup')}`}
            icon="activity"
            onPress={() => setTab('running')}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="라인 설비 평균 가동률"
            value={avgAvail}
            format="percent"
            caption={`계획 가동 ${durationLabel(PLANT.plannedMin)} 기준`}
            icon="gauge"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="3일 안 점검 기한"
            value={due.length}
            unit="대"
            caption={
              overdue.length
                ? `기한 경과 ${overdue.length}대 · ${overdue[0]!.name}`
                : '기한 경과 없음'
            }
            icon="wrench"
            onPress={overdue[0] ? () => openDrawer(overdue[0]!) : undefined}
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label={`${PROFILE.cold?.storage ?? '보관 설비'} 온도 주의`}
            value={warm.length}
            unit="곳"
            caption={
              warm[0]
                ? `${warm[0].name} ${fmt1(sensorNow(warm[0]))}°C · 상한 ${fmtAuto(warm[0].sensor.range[1])}°C`
                : '모두 허용 범위'
            }
            icon="warehouse"
            onPress={warm[0] ? () => openDrawer(warm[0]!) : undefined}
          />
        </Col>
      </Grid>
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            label="설비 검색"
            placeholder="설비 이름 · 번호 · 모델"
            value={q}
            onChange={setQ}
            clearable
            size="sm"
          />
        }
        onReset={() => {
          setQ('');
          setTab('all');
          setLine('all');
        }}
        resultCount={shown.length}
      >
        <SegmentedControl
          size="sm"
          label="라인"
          value={line}
          onChange={setLine}
          options={[
            { value: 'all', label: '전체' },
            ...LINES.map((l) => ({ value: l.id, label: l.name })),
            ...(rows.some((e) => !onLine(e)) ? [{ value: STORAGE, label: '보관' }] : []),
          ]}
        />
      </FilterBar>
      <DataGrid
        caption="설비 현황"
        height="fill"
        rows={shown}
        rowKey="id"
        onRowPress={openDrawer}
        activeRowKey={openId}
        rowTone={(e) =>
          e.state === 'down' ? 'danger' : nearLimit(e) && e.lineId === 'ST' ? 'warning' : undefined
        }
        empty="이 조건의 설비가 없습니다. 상태나 라인을 바꿔 보세요"
        columns={[
          {
            key: 'name',
            header: '설비',
            width: 'lg',
            sticky: true,
            render: (e) => (
              <DataGridLines
                primary={e.name}
                secondary={
                  <>
                    {e.id} · {where(e)}
                  </>
                }
              />
            ),
          },
          {
            key: 'state',
            header: '상태',
            width: 'xl',
            render: (e) => (
              <DataGridLines
                primary={
                  <StatusDot size="sm" tone={MACHINE_STATES[e.state].tone}>
                    {MACHINE_STATES[e.state].label} · {e.since}부터
                  </StatusDot>
                }
                secondary={e.reason ?? (e.lineId === 'ST' ? '24시간 운전' : '정상 가동')}
              />
            ),
          },
          {
            key: 'runMin',
            header: '오늘 가동',
            width: 'sm',
            align: 'right',
            sortable: true,
            render: (e) => durationLabel(e.runMin),
          },
          {
            key: 'availability',
            header: '가동률',
            width: 'sm',
            format: 'percent',
            sortable: true,
            value: (e) => equipmentAvailability(e),
            render: (e) => formatPercent(equipmentAvailability(e)),
          },
          {
            key: 'sensor',
            header: '현재 값',
            width: 'md',
            align: 'right',
            render: (e) => (
              <DataGridLines
                primary={
                  <span className="tl-block-code">
                    {fmt1(sensorNow(e))}
                    {e.sensor.unit}
                  </span>
                }
                secondary={e.sensor.label}
              />
            ),
          },
          {
            key: 'nextInspection',
            header: '다음 점검',
            width: 'md',
            sortable: true,
            render: (e) => (
              <span className="tl-block-row" data-justify="start">
                <DueBadge due={e.nextInspection} today={TODAY} size="sm" />
                <span className="tl-block-muted">{e.cycleLabel}</span>
              </span>
            ),
          },
          { key: 'owner', header: '담당', width: 'sm' },
        ]}
      />
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.name ?? ''}
        description={open ? `${open.id} · ${where(open)} · ${open.model}` : ''}
        width="lg"
        actions={
          open && (
            <Badge tone={MACHINE_STATES[open.state].tone}>{MACHINE_STATES[open.state].label}</Badge>
          )
        }
        footer={
          open && (
            <>
              <Button onPress={() => setOpenId(null)}>닫기</Button>
              <Button
                variant="primary"
                icon="clipboard-check"
                disabled={!canInspect}
                onPress={register}
              >
                점검 등록
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            {open.reason && (
              <Banner
                tone={
                  open.state === 'down'
                    ? 'danger'
                    : open.lineId === 'ST' || open.state === 'idle'
                      ? 'warning'
                      : 'info'
                }
              >
                {open.lineId === 'ST' ? open.reason : `${open.since}부터 · ${open.reason}`}
              </Banner>
            )}
            <DescriptionList
              columns={2}
              items={[
                {
                  label: '오늘 가동',
                  value: `${durationLabel(open.runMin)} · ${formatPercent(equipmentAvailability(open))}`,
                },
                { label: '담당', value: open.owner },
                { label: '점검 주기', value: open.cycleLabel },
                { label: '설치일', value: formatDate(open.installed) },
                { label: '마지막 점검', value: formatDate(open.lastInspection) },
                {
                  label: '다음 점검',
                  value: (
                    <span className="tl-block-row" data-justify="start">
                      {formatDate(open.nextInspection)}
                      <DueBadge due={open.nextInspection} today={TODAY} size="sm" />
                    </span>
                  ),
                },
              ]}
            />
            <ChartCard
              title={open.sensor.label}
              subtitle={`${open.sensor.unit} · ${open.lineId === 'ST' ? '최근 24시간' : `오늘 ${PLANT.shift}`} · 음영은 허용 범위 ${fmtAuto(open.sensor.range[0])}~${fmtAuto(open.sensor.range[1])}${open.sensor.unit}`}
              height={200}
              table={{
                columns: ['시각', `${open.sensor.label}(${open.sensor.unit})`],
                rows: open.sensor.times.map((t, i) => [t, open.sensor.values[i] ?? 0]),
              }}
            >
              <div className="tl-block-eq-chart">
                <TrendChart
                  data={open.sensor.times.map((t, i) => ({ t, v: open.sensor.values[i] ?? 0 }))}
                  x="t"
                  series={[
                    {
                      key: 'v',
                      label: open.sensor.label,
                      color: nearLimit(open) ? 'warning' : 'series-1',
                    },
                  ]}
                  unit={open.sensor.unit}
                  height={200}
                  curve="linear"
                  endLabel="v"
                  yFormat={fmtAuto}
                  yDomain={[
                    Math.floor((Math.min(open.sensor.range[0], ...open.sensor.values) - 1) / 5) * 5,
                    Math.ceil((Math.max(open.sensor.range[1], ...open.sensor.values) + 1) / 5) * 5,
                  ]}
                  band={{
                    from: open.sensor.range[0],
                    to: open.sensor.range[1],
                    label: '허용 범위',
                  }}
                  ariaLabel={`${open.name} ${open.sensor.label}. 지금 ${fmt1(sensorNow(open))}${open.sensor.unit}, 허용 범위 ${fmt1(open.sensor.range[0])}~${fmt1(open.sensor.range[1])}${open.sensor.unit}`}
                />
              </div>
            </ChartCard>
            <FormSection
              title="점검 등록"
              description={`${TODAY} ${PLANT.now} 기준으로 기록합니다`}
            >
              <Field label="점검 구분" required span={2}>
                <SegmentedControl
                  fullWidth
                  value={kind}
                  onChange={(v) => setKind(v as Kind)}
                  options={(Object.keys(KINDS) as Kind[]).map((k) => ({
                    value: k,
                    label: KINDS[k],
                  }))}
                />
              </Field>
              <Field label="결과" required span={2}>
                <RadioGroup
                  orientation="horizontal"
                  value={result}
                  onChange={setResult}
                  options={RESULTS.map(({ value, label }) => ({ value, label }))}
                />
              </Field>
              <Field label="점검자" required>
                <Select
                  value={inspector}
                  onChange={setInspector}
                  options={Object.values(MES_PEOPLE).map((p) => ({ value: p, label: p }))}
                />
              </Field>
              <Field label="다음 점검" help={`주기 ${open.cycleLabel}`}>
                <Input value={addDays(TODAY, open.cycleDays)} readOnly />
              </Field>
              <Field label="메모" span={2}>
                <Textarea
                  rows={2}
                  value={memo}
                  onChange={setMemo}
                  placeholder={
                    open.state === 'down'
                      ? '리본 롤러 교체 · 인쇄 테스트 정상'
                      : '진공도 −0.098MPa · 실링 테스트 합격'
                  }
                />
              </Field>
            </FormSection>
            <Timeline ariaLabel="점검 이력" dense items={open.history.map((h) => ({ ...h }))} />
          </div>
        )}
      </Drawer>
    </Page>
  );
}
