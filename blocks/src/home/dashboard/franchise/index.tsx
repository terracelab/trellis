// 가맹점 현황(Dashboard): 전체 매장 매출 · 전주 대비 · 신규 개점 · 주의 매장(비교 기간) → 매장별 매출 순위(누르면 매장)
// → 지역 × 주차 매출(표 + 진하기) → 매장 목록(목표 대비 · 상태) → 매장 Drawer(개요 · 초도 물량 산출 · 개점 준비).
// 위젯은 DashboardGrid에 있고 "배치 편집"으로 순서를 바꾸거나 숨긴다. 지도 대신 지역 표를 쓴다.
import {
  formatAmount,
  formatCompactWon,
  formatDate,
  formatPercent,
  formatQuantity,
  resolvePeriodCompare,
  resolvePeriodPreset,
  type ChecklistState,
  type DashboardLayout,
  type PeriodCompare,
  type PeriodValue,
} from '@terracelab/trellis-contracts';
import {
  BarList,
  BulletBar,
  Button,
  Card,
  ChartCard,
  Checklist,
  DashboardGrid,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  Field,
  FormSection,
  HeatCell,
  KpiCard,
  PageHeader,
  PeriodPicker,
  QuantityInput,
  SegmentedControl,
  Select,
  StatusDot,
  Tabs,
  TrendChart,
  useToast,
  type DashboardWidgetWeb,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  AMBIENT_DAYS,
  AREA_TYPES,
  FRANCHISE,
  FROZEN_DAYS,
  frozenDaysOf,
  openingTasksOf,
  recentWeeks,
  REGIONS,
  regionWeekAvg,
  SALES_THROUGH,
  salesOf,
  starterLines,
  stateOf,
  STORE_STATES,
  STORES,
  supervisorOf,
  targetOf,
  visitsOf,
  WATCH_RATIO,
  weekEnd,
  type AreaType,
  type Region,
  type Store,
} from '../../../_data/franchise.js';
import { sum, TODAY } from '../../../_data/index.js';
import { PROFILE } from '../../../_data/profile.js';
import { useCan, useScreenParams } from '../../../_platform/index.js';
import { ExportButton, Muted, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

/** 지역 × 주차 표의 주 수 · 순위 막대 수 · 매장 추이 주 수 */
const HEAT_WEEKS = 8;
const RANK_SIZE = 10;
const TREND_WEEKS = 12;
const DEFAULT_PERIOD = resolvePeriodPreset('lastMonth', TODAY);
const DEFAULT_COMPARE: PeriodCompare = {
  mode: 'previous',
  ...resolvePeriodCompare(DEFAULT_PERIOD, 'previous'),
};
const md = (date: string) => date.slice(5);
const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 1000) / 10 : 0);
const signed = (v: number) => `${formatAmount(v, { digits: 1, sign: 'always' })}%`;
const clampTo = (to: string) => (to > SALES_THROUGH ? SALES_THROUGH : to);
/** 기간 이름: 한 달 전체면 "10월", 아니면 "10월 6일~11월 5일" */
function periodLabel(p: PeriodValue): string {
  const to = clampTo(p.to);
  const end = new Date(Date.parse(`${p.to}T00:00:00Z`) + 86_400_000).getUTCDate() === 1;
  if (p.from.slice(8) === '01' && end && p.from.slice(0, 7) === p.to.slice(0, 7))
    return `${Number(p.from.slice(5, 7))}월`;
  const sameMonth = p.from.slice(0, 7) === to.slice(0, 7);
  return `${formatDate(p.from, 'md')}~${sameMonth ? `${Number(to.slice(8))}일` : formatDate(to, 'md')}`;
}
function compareLabel(c: PeriodCompare | null): string {
  if (!c) return '';
  if (c.mode === 'lastYear') return '전년 동기 대비';
  return `${periodLabel(c)} 대비`;
}

const HEAT = recentWeeks(HEAT_WEEKS);
const ALL_REGIONS = '전체';
/** 전체 매장당 평균 주간 매출(원) = 지역 평균을 영업 매장 수로 가중 */
function allWeekAvg(w: string): number | null {
  const open = STORES.filter((s) => s.openedAt <= weekEnd(w) && s.openedAt <= SALES_THROUGH);
  if (!open.length) return null;
  const parts = REGIONS.map((r) => ({
    v: regionWeekAvg(r, w),
    n: open.filter((s) => s.region === r).length,
  })).filter((p) => p.v !== null && p.n > 0);
  const n = sum(parts, (p) => p.n);
  return n ? sum(parts, (p) => (p.v ?? 0) * p.n) / n : null;
}
/** 지역 행(매장당 평균 주간 매출, 만원) + 맨 아래 전체 행 */
const HEAT_ROWS = [...REGIONS, ALL_REGIONS].map((r) => {
  const avg: Record<string, number | null> = Object.fromEntries(
    HEAT.map((w) => {
      const v = r === ALL_REGIONS ? allWeekAvg(w) : regionWeekAvg(r as Region, w);
      return [w, v === null ? null : Math.round(v / 1e4)];
    }),
  );
  return {
    id: r,
    region: r,
    stores: STORES.filter(
      (s) => (r === ALL_REGIONS || s.region === r) && s.openedAt <= SALES_THROUGH,
    ).length,
    avg,
  };
});
const heatValues = HEAT_ROWS.flatMap((row) => HEAT.map((w) => row.avg[w] ?? 0)).filter(Boolean);
/**
 * 진하기 척도: 표 안 최저~최고. 매장당 매출은 0에서 멀리 떨어져 있어 0부터 재면 칸 색이 거의 같다.
 * HeatCell에 척도 시작(min)이 없어 값에서 바닥을 빼서 넘기고 글자는 format으로 되돌린다(보강 요청)
 */
const HEAT_FLOOR =
  Math.min(...heatValues) - Math.round((Math.max(...heatValues) - Math.min(...heatValues)) * 0.12);
const HEAT_TOP = Math.max(...heatValues) - HEAT_FLOOR;
const [PREV_WEEK, LAST_WEEK] = recentWeeks(2) as [string, string];
const weekTotal = (w: string) => sum(STORES, (s) => salesOf(s, w, weekEnd(w)));
const LAST_WEEK_TOTAL = weekTotal(LAST_WEEK);
const PREV_WEEK_TOTAL = weekTotal(PREV_WEEK);
const PREPARING = STORES.filter((s) => s.openedAt > SALES_THROUGH).sort((a, b) =>
  a.openedAt.localeCompare(b.openedAt),
);

/** 매장 Drawer의 초도 물량 입력(매장마다 따로 기억한다) */
interface StarterInput {
  areaType: AreaType;
  seats: number | null;
  area: number | null;
  /** 비우면 좌석 × 회전율 */
  visits: number | null;
}
const starterDefault = (s: Store): StarterInput => ({
  areaType: s.areaType,
  seats: s.seats,
  area: s.area,
  visits: null,
});

// slot: layout — 처음 배치. 앱은 onLayoutChange 값을 사용자 설정(API)에 저장하고 다음 방문에 layout으로 넘긴다
const DEFAULT_LAYOUT: DashboardLayout = [];
// slot: layout end

export default function FranchiseDashboard() {
  const toast = useToast();
  const canSave = useCan('sales', 'update');
  const [editing, setEditing] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const [period, setPeriod] = useState<PeriodValue>(DEFAULT_PERIOD);
  const [compare, setCompare] = useState<PeriodCompare | null>(DEFAULT_COMPARE);
  const [rank, setRank] = useState<'top' | 'bottom'>('top');
  const [region, setRegion] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  // ?id=s11 로 오면 그 매장을 연다(알림 · 다른 화면 링크)
  const params = useScreenParams();
  const linked = STORES.some((s) => s.id === params['id']) ? params['id']! : null;
  const [openId, setOpenId] = useState<string | null>(linked);
  // 같은 화면에서 주소의 id만 바뀌어도 그 매장을 연다
  const [seen, setSeen] = useState(linked);
  if (linked !== seen) {
    setSeen(linked);
    if (linked) setOpenId(linked);
  }
  const [tab, setTab] = useState('starter');
  const [inputs, setInputs] = useState<Record<string, StarterInput>>({});
  const [tasks, setTasks] = useState<Record<string, ChecklistState>>({});

  const to = clampTo(period.to);
  const rows = useMemo(
    () =>
      STORES.map((s) => {
        const sales = salesOf(s, period.from, to);
        const prev = compare ? salesOf(s, compare.from, clampTo(compare.to)) : null;
        const target = targetOf(s, period.from, to);
        return {
          id: s.id,
          store: s,
          name: s.name,
          region: s.region,
          openedAt: s.openedAt,
          state: stateOf(s),
          sales,
          prev,
          delta: prev ? pct(sales, prev) : null,
          target,
          ratio: target ? Math.round((sales / target) * 1000) / 10 : null,
        };
      }),
    [period.from, to, compare],
  );
  const total = sum(rows, (r) => r.sales);
  const prevTotal = compare ? sum(rows, (r) => r.prev ?? 0) : null;
  const opened = rows.filter((r) => r.openedAt >= period.from && r.openedAt <= to);
  const watch = rows.filter((r) => r.state === 'watch');
  const selling = rows.filter((r) => r.state !== 'preparing' && r.sales > 0);
  const ranked = [...selling].sort((a, b) =>
    rank === 'top' ? b.sales - a.sales : a.sales - b.sales,
  );
  const shown = rows
    .filter(
      (r) =>
        (region === 'all' || r.region === region) &&
        (stateFilter === 'all' || r.state === stateFilter),
    )
    .sort((a, b) => b.sales - a.sales);
  const label = periodLabel(period);
  const vs = compareLabel(compare);
  const open = openId ? rows.find((r) => r.id === openId)! : null;

  /** 엑셀 다운로드 열(지금 보이는 매장, 금액은 서식 없는 숫자) */
  const csv: CsvColumn<(typeof shown)[number]>[] = [
    { label: '매장', value: 'name' },
    { label: '지역', value: 'region' },
    { label: '상권', value: (r) => AREA_TYPES[r.store.areaType].label },
    { label: '개점일', value: 'openedAt' },
    { label: `매출(원) ${label}`, value: 'sales' },
    { label: '목표(원)', value: 'target' },
    { label: '목표 대비(%)', value: (r) => r.ratio ?? '' },
    ...(compare
      ? [{ label: `${vs}(%)`, value: (r: (typeof shown)[number]) => r.delta ?? '' }]
      : []),
    { label: '상태', value: (r) => STORE_STATES[r.state].label },
  ];

  const widgets: DashboardWidgetWeb[] = [
    // slot: kpis — 위 숫자 넷(전체 매출 · 전주 대비 · 신규 개점 · 주의 매장)
    {
      id: 'sales',
      title: '전체 매장 매출',
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label="전체 매장 매출"
          value={total}
          format="amount"
          unit="원"
          icon="store"
          {...(prevTotal
            ? {
                delta: {
                  value: pct(total, prevTotal),
                  label: vs,
                  format: 'percent' as const,
                  polarity: 'finance' as const,
                },
              }
            : {})}
          caption={`${label} · 영업 매장 ${selling.length}곳`}
        />
      ),
    },
    {
      id: 'week',
      title: '전주 대비',
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label="전주 대비"
          value={signed(pct(LAST_WEEK_TOTAL, PREV_WEEK_TOTAL))}
          icon="trending-up"
          caption={`지난주(${md(LAST_WEEK)}~${md(weekEnd(LAST_WEEK))}) ${formatCompactWon(LAST_WEEK_TOTAL)}원 · 그 전주 ${formatCompactWon(PREV_WEEK_TOTAL)}원`}
        />
      ),
    },
    {
      id: 'opened',
      title: '신규 개점',
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label="신규 개점"
          value={opened.length}
          unit="곳"
          icon="party-popper"
          caption={
            PREPARING[0]
              ? `${label} · 개점 준비 ${PREPARING.length}곳 · 다음 ${formatDate(PREPARING[0].openedAt, 'md')}`
              : label
          }
          {...(PREPARING[0] ? { onPress: () => setOpenId(PREPARING[0]!.id) } : {})}
        />
      ),
    },
    {
      id: 'watch',
      title: '주의 매장',
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label="주의 매장"
          value={watch.length}
          unit="곳"
          icon="triangle-alert"
          caption={`목표 대비 ${formatPercent(WATCH_RATIO * 100, 0)} 미만 2주 연속${watch[0] ? ` · ${watch[0].name}${watch.length > 1 ? ` 외 ${watch.length - 1}곳` : ''}` : ''}`}
          onPress={() => {
            setStateFilter('watch');
            setRegion('all');
          }}
        />
      ),
    },
    // slot: kpis end
    {
      id: 'rank',
      title: '매장별 매출 순위',
      span: 4,
      content: (
        <ChartCard
          className="tl-block-fr-card"
          title="매장별 매출 순위"
          subtitle={`원 · ${label} · ${rank === 'top' ? '상위' : '하위'} ${Math.min(RANK_SIZE, ranked.length)}곳 · 누르면 매장`}
          action={
            <SegmentedControl
              size="sm"
              label="순위"
              value={rank}
              onChange={(v) => setRank(v as typeof rank)}
              options={[
                { value: 'top', label: '상위' },
                { value: 'bottom', label: '하위' },
              ]}
            />
          }
          height={300}
          table={{
            columns: ['순위', '매장', '매출(원)', '목표 대비(%)'],
            rows: ranked.map((r, i) => [i + 1, r.name, r.sales, r.ratio ?? '']),
          }}
        >
          <BarList
            data={ranked.slice(0, RANK_SIZE).map((r) => ({ label: r.name, value: r.sales }))}
            layout="horizontal"
            showValues
            format={formatCompactWon}
            unit="원"
            height={300}
            onBarPress={(s) => {
              const r = rows.find((x) => x.name === s.label);
              if (r) setOpenId(r.id);
            }}
            ariaLabel={`${label} 매장별 매출 ${rank === 'top' ? '상위' : '하위'}. ${ranked[0]?.name ?? ''} ${formatCompactWon(ranked[0]?.sales ?? 0)}원`}
          />
        </ChartCard>
      ),
    },
    {
      id: 'heat',
      title: '지역 × 주차 매출',
      span: 8,
      content: (
        <Card
          className="tl-block-fr-card"
          title="지역 × 주차 매출"
          subtitle={`매장당 평균 주간 매출 · 만원 · 마감한 최근 ${HEAT_WEEKS}주(주 시작일) · 행을 누르면 매장 목록이 그 지역으로`}
          padding="none"
        >
          <DataGrid
            caption="지역 × 주차 매출"
            className="tl-block-flat-grid"
            rows={HEAT_ROWS}
            rowKey="id"
            mobile="scroll"
            activeRowKey={region === 'all' ? null : region}
            onRowPress={(r) => {
              const next = String(r['region']);
              setRegion(next === ALL_REGIONS ? 'all' : next);
              setStateFilter('all');
            }}
            columns={[
              {
                key: 'region',
                header: '지역',
                width: 'md',
                sticky: true,
                link: true,
                render: (r: (typeof HEAT_ROWS)[number]) => (
                  <span className="tl-block-fr-region">
                    {r.region}
                    <Muted>{r.stores}곳</Muted>
                  </span>
                ),
              },
              ...HEAT.map((w) => ({
                key: w,
                header: md(w),
                width: 'xs' as const,
                align: 'right' as const,
                render: (r: (typeof HEAT_ROWS)[number]) => {
                  const v = r.avg[w] ?? null;
                  return (
                    <HeatCell
                      value={v === null ? null : v - HEAT_FLOOR}
                      max={HEAT_TOP}
                      format={(x) => formatAmount(x + HEAT_FLOOR)}
                      empty="–"
                    />
                  );
                },
              })),
            ]}
          />
        </Card>
      ),
    },
    {
      id: 'list',
      title: '매장 목록',
      span: 12,
      content: (
        <Card
          className="tl-block-fr-card"
          title="매장 목록"
          subtitle={`${shown.length}곳 · 매출과 목표 대비는 ${label} 기준 · 누르면 매장 상세`}
          padding="none"
          action={
            <div className="tl-block-fr-filters">
              <Select
                size="sm"
                width="auto"
                label="지역"
                value={region}
                onChange={(v) => setRegion(v ?? 'all')}
                options={[
                  { value: 'all', label: '전체 지역' },
                  ...REGIONS.map((r) => ({ value: r, label: r })),
                ]}
              />
              <Select
                size="sm"
                width="auto"
                label="상태"
                value={stateFilter}
                onChange={(v) => setStateFilter(v ?? 'all')}
                options={[
                  { value: 'all', label: '전체 상태' },
                  ...Object.entries(STORE_STATES).map(([value, s]) => ({
                    value,
                    label: s.label,
                    leading: { kind: 'dot' as const, tone: s.tone },
                  })),
                ]}
              />
              <ExportButton
                module="sales"
                name={`가맹점 목록 ${label}`}
                rows={shown}
                columns={csv}
                size="sm"
              >
                엑셀 다운로드
              </ExportButton>
            </div>
          }
        >
          <DataGrid
            caption="매장 목록"
            className="tl-block-flat-grid"
            rows={shown}
            rowKey="id"
            onRowPress={(r) => {
              setOpenId(String(r['id']));
              setTab('starter');
            }}
            activeRowKey={openId}
            summary
            filtered={region !== 'all' || stateFilter !== 'all'}
            empty="조건에 맞는 매장이 없습니다. 지역 · 상태를 전체로 바꾸세요"
            // slot: columns — 매장 목록 열(매장 · 지역 · 개점일 · 매출 · 목표 대비 · 증감 · 상태)
            columns={[
              {
                key: 'name',
                header: '매장',
                link: true,
                hideable: false,
                mobile: 'title',
                render: (r: (typeof shown)[number]) => (
                  <DataGridLines
                    primary={r.name}
                    secondary={`${AREA_TYPES[r.store.areaType].label} · ${r.store.seats}석 · ${r.store.area}㎡`}
                  />
                ),
              },
              { key: 'region', header: '지역', width: 'sm', mobile: 'meta' },
              {
                key: 'openedAt',
                header: '개점일',
                width: 'md',
                mobile: 'hidden',
                render: (r: (typeof shown)[number]) =>
                  r.state === 'preparing' ? `${r.openedAt} 예정` : r.openedAt,
              },
              {
                key: 'sales',
                header: '매출',
                width: 'md',
                format: 'amount',
                total: 'sum',
                sortable: true,
                mobile: 'trailing',
                render: (r: (typeof shown)[number]) =>
                  r.state === 'preparing' ? '–' : formatAmount(r.sales),
              },
              {
                key: 'ratio',
                header: '목표 대비',
                width: 'lg',
                mobile: 'hidden',
                render: (r: (typeof shown)[number]) =>
                  r.target > 0 ? (
                    <BulletBar
                      className="tl-block-fr-bullet"
                      size="sm"
                      label={`${r.name} 목표 대비`}
                      value={r.sales}
                      target={r.target}
                      format={formatCompactWon}
                      warnAt={WATCH_RATIO}
                      showState={false}
                    />
                  ) : (
                    '–'
                  ),
              },
              ...(compare
                ? [
                    {
                      key: 'delta',
                      header: vs,
                      width: 'md' as const,
                      format: 'percent' as const,
                      finance: true,
                      sortable: true,
                      mobile: 'meta' as const,
                      render: (r: (typeof shown)[number]) =>
                        r.delta === null ? '–' : signed(r.delta),
                    },
                  ]
                : []),
              {
                key: 'state',
                header: '상태',
                width: 'sm',
                mobile: 'status',
                render: (r: (typeof shown)[number]) => (
                  <StatusDot tone={STORE_STATES[r.state].tone}>
                    {STORE_STATES[r.state].label}
                  </StatusDot>
                ),
              },
            ]}
            // slot: columns end
          />
        </Card>
      ),
    },
  ];

  return (
    <Page
      header={
        <PageHeader
          title="가맹점 현황"
          description={`${FRANCHISE.brand} ${STORES.length}곳 · ${PROFILE.name} ${FRANCHISE.hq} · 매출은 ${formatDate(SALES_THROUGH, 'md')}까지 마감`}
          actions={
            editing ? (
              <>
                <Button icon="rotate-ccw" onPress={() => setLayout(DEFAULT_LAYOUT)}>
                  기본 배치
                </Button>
                <Button variant="primary" icon="check" onPress={() => setEditing(false)}>
                  완료
                </Button>
              </>
            ) : (
              <>
                <PeriodPicker
                  label="기간"
                  today={TODAY}
                  max={SALES_THROUGH}
                  presets={['thisWeek', 'thisMonth', 'lastMonth', 'thisQuarter', 'thisYear']}
                  value={period}
                  onChange={setPeriod}
                  compare={compare}
                  onCompareChange={setCompare}
                />
                <Button icon="layout-grid" onPress={() => setEditing(true)}>
                  배치 편집
                </Button>
              </>
            )
          }
        />
      }
    >
      <DashboardGrid
        label="가맹점 현황"
        widgets={widgets}
        layout={layout}
        onLayoutChange={setLayout}
        editing={editing}
      />
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open ? open.name : ''}
        description={
          open
            ? `${open.region} · ${AREA_TYPES[open.store.areaType].label} · ${open.state === 'preparing' ? `개점 예정 ${formatDate(open.openedAt, 'md')}` : `개점 ${open.openedAt}`} · 본부 담당 ${supervisorOf(open.store)}`
            : ''
        }
        width="lg"
        actions={
          open && (
            <StatusDot tone={STORE_STATES[open.state].tone}>
              {STORE_STATES[open.state].label}
            </StatusDot>
          )
        }
        footer={
          open?.state === 'preparing' && tab === 'starter' ? (
            <Button
              variant="primary"
              icon="save"
              disabled={!canSave}
              {...(!canSave ? { disabledReason: '저장 권한이 없습니다' } : {})}
              onPress={() =>
                toast.show({
                  title: '초도 물량을 저장했습니다',
                  description: `${open.name} · 개점 준비의 "초도 물량 확정"에서 확정합니다`,
                  tone: 'success',
                })
              }
            >
              초도 물량 저장
            </Button>
          ) : undefined
        }
      >
        {open &&
          (open.state === 'preparing' ? (
            <Tabs
              label={`${open.name} 개점 준비`}
              value={tab}
              onChange={setTab}
              items={[
                {
                  value: 'starter',
                  label: '초도 물량',
                  content: (
                    <StarterPanel
                      store={open.store}
                      input={inputs[open.id] ?? starterDefault(open.store)}
                      onChange={(next) => setInputs((m) => ({ ...m, [open.id]: next }))}
                    />
                  ),
                },
                {
                  value: 'opening',
                  label: '개점 준비',
                  content: (
                    <div className="tl-block-drawer-stack">
                      <Checklist
                        label={`${open.name} 개점 준비`}
                        today={TODAY}
                        items={openingTasksOf(open.store).map((t) => ({
                          ...t,
                          state: tasks[`${open.id}:${t.id}`] ?? t.state,
                          ...(t.id === 'starter'
                            ? {
                                action: {
                                  label: '산출 보기',
                                  icon: 'calculator' as const,
                                  onPress: () => setTab('starter'),
                                },
                              }
                            : {}),
                        }))}
                        onChange={(id, done) =>
                          setTasks((m) => ({
                            ...m,
                            [`${open.id}:${id}`]: done ? 'done' : 'pending',
                          }))
                        }
                      />
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <StoreOverview row={open} label={label} />
          ))}
      </Drawer>
    </Page>
  );
}

/** 영업 중인 매장: 기간 숫자 + 최근 주별 매출과 목표 */
function StoreOverview({
  row,
  label,
}: {
  row: {
    store: Store;
    sales: number;
    target: number;
    ratio: number | null;
    delta: number | null;
  };
  label: string;
}) {
  const s = row.store;
  const weeks = recentWeeks(TREND_WEEKS)
    .filter((w) => weekEnd(w) >= s.openedAt)
    .map((w) => ({
      week: md(w),
      sales: salesOf(s, w, weekEnd(w)),
      target: targetOf(s, w, weekEnd(w)),
    }));
  const last = weeks[weeks.length - 1];
  /** 상태 판정에 쓴 최근 마감 2주 목표 대비(%) */
  const recent = recentWeeks(2).map((w) => {
    const t = targetOf(s, w, weekEnd(w));
    return t ? formatPercent((salesOf(s, w, weekEnd(w)) / t) * 100, 0) : '–';
  });
  return (
    <div className="tl-block-drawer-stack">
      <DescriptionList
        columns={3}
        layout="vertical"
        items={[
          { label: `${label} 매출`, value: `${formatAmount(row.sales)}원` },
          { label: '목표', value: `${formatAmount(row.target)}원` },
          { label: '목표 대비', value: row.ratio === null ? '–' : formatPercent(row.ratio) },
          { label: '최근 2주 목표 대비', value: recent.join(' · ') },
          { label: '좌석 · 면적', value: `${s.seats}석 · ${s.area}㎡` },
          { label: '계획 일 매출', value: `${formatAmount(s.plan)}원` },
        ]}
      />
      <ChartCard
        title="주별 매출"
        subtitle={`원 · 최근 ${weeks.length}주 · 점선은 목표`}
        legend={[
          { label: '매출', color: 'series-1', shape: 'line' },
          { label: '목표', color: 'compare', shape: 'dashed' },
        ]}
        height={200}
        table={{
          columns: ['주', '매출(원)', '목표(원)'],
          rows: weeks.map((w) => [w.week, w.sales, w.target]),
        }}
      >
        <TrendChart
          data={weeks}
          x="week"
          series={[
            { key: 'sales', label: '매출', type: 'area' },
            { key: 'target', label: '목표', dashed: true, color: 'compare' },
          ]}
          unit="원"
          height={200}
          yFormat={formatCompactWon}
          ariaLabel={`${s.name} 주별 매출. 지난주 ${formatCompactWon(last?.sales ?? 0)}원, 목표 ${formatCompactWon(last?.target ?? 0)}원`}
        />
      </ChartCard>
    </div>
  );
}

/** 개점 준비 매장: 상권 · 좌석 · 면적 · 예상 방문으로 첫 공급 물량을 계산하고 근거를 적는다 */
function StarterPanel({
  store,
  input,
  onChange,
}: {
  store: Store;
  input: StarterInput;
  onChange: (next: StarterInput) => void;
}) {
  const t = AREA_TYPES[input.areaType];
  const seats = input.seats ?? 0;
  const area = input.area ?? 0;
  const suggested = visitsOf(seats, input.areaType);
  const visits = input.visits ?? suggested;
  const lines = starterLines({ areaType: input.areaType, area, visits });
  const frozenDays = frozenDaysOf(area);
  const band = FROZEN_DAYS.findIndex((f) => area < f.below);
  const bandText =
    band === 0
      ? `${FROZEN_DAYS[0]!.below}㎡ 미만`
      : band === FROZEN_DAYS.length - 1
        ? `${FROZEN_DAYS[band - 1]!.below}㎡ 이상`
        : `${FROZEN_DAYS[band - 1]!.below}~${FROZEN_DAYS[band]!.below}㎡`;
  return (
    <div className="tl-block-drawer-stack">
      <FormSection title="입력" columns={2}>
        <Field label="상권 유형">
          <Select
            value={input.areaType}
            onChange={(v) => v && onChange({ ...input, areaType: v as AreaType })}
            options={Object.entries(AREA_TYPES).map(([value, a]) => ({
              value,
              label: a.label,
              note: `회전 ${a.turnover}회 · 포장 ${formatPercent(a.takeout * 100, 0)}`,
            }))}
          />
        </Field>
        <Field
          label="예상 일 방문"
          help={`비우면 좌석 ${seats}석 × 회전 ${t.turnover}회 = ${suggested}명`}
        >
          <QuantityInput
            value={input.visits}
            onChange={(v) => onChange({ ...input, visits: v })}
            unit="명"
            min={0}
            step={10}
          />
        </Field>
        <Field label="좌석 수">
          <QuantityInput
            value={input.seats}
            onChange={(v) => onChange({ ...input, seats: v })}
            unit="석"
            min={0}
            step={2}
          />
        </Field>
        <Field label="면적" help="작은 매장은 냉동고가 작아 냉동 품목 공급 일수를 줄입니다">
          <QuantityInput
            value={input.area}
            onChange={(v) => onChange({ ...input, area: v })}
            unit="㎡"
            min={0}
            step={1}
          />
        </Field>
      </FormSection>
      <DataGrid
        caption={`${store.name} 초도 물량`}
        rows={lines.map((l) => ({ ...l, id: l.item.id }))}
        rowKey="id"
        summary
        columns={[
          {
            key: 'id',
            header: '품목',
            mobile: 'title',
            render: (l: (typeof lines)[number]) => (
              <DataGridLines
                primary={l.item.name}
                secondary={`공급가 ${formatAmount(l.price)}원/${l.item.unit}`}
              />
            ),
          },
          {
            key: 'daily',
            header: '하루 사용량',
            width: 'sm',
            format: 'quantity',
            mobile: 'meta',
            render: (l: (typeof lines)[number]) =>
              formatQuantity(l.daily, l.item.unit, l.daily < 10 ? 1 : 0),
          },
          {
            key: 'days',
            header: '일수',
            width: 'xs',
            format: 'number',
            mobile: 'meta',
            render: (l: (typeof lines)[number]) => `${l.days}일`,
          },
          {
            key: 'qty',
            header: '수량',
            width: 'sm',
            format: 'quantity',
            emphasis: true,
            mobile: 'meta',
            render: (l: (typeof lines)[number]) => formatQuantity(l.qty, l.item.unit),
          },
          {
            key: 'amount',
            header: '금액',
            width: 'md',
            format: 'amount',
            total: 'sum',
            mobile: 'trailing',
          },
        ]}
      />
      <section aria-labelledby="fr-basis" className="tl-block-fr-basis">
        <h3 id="fr-basis" className="tl-block-fr-heading">
          산출 근거
        </h3>
        {/* slot: starter — 초도 물량 식(사용량 · 공급 일수 · 공급 단위는 _data/franchise.ts STARTER_ITEMS) */}
        <ol className="tl-block-fr-steps">
          <li>
            예상 일 방문 {formatAmount(visits)}명.{' '}
            {input.visits === null
              ? `좌석 ${seats}석에 ${t.label} 상권 회전 ${t.turnover}회를 곱했습니다.`
              : '직접 넣은 값입니다.'}
          </li>
          <li>
            하루 사용량 = 예상 일 방문 × 손님 100명당 사용량 ÷ 100. 포장재는 {t.label} 상권 포장
            비율 {formatPercent(t.takeout * 100, 0)}를 더 곱합니다.
          </li>
          <li>
            공급 일수는 냉동 품목 {frozenDays}일(면적 {formatAmount(area)}㎡, {bandText} 구간), 상온
            품목 {AMBIENT_DAYS}일입니다.
          </li>
          <li>수량 = 하루 사용량 × 공급 일수를 공급 단위로 올림. 금액 = 수량 × 가맹 공급가.</li>
        </ol>
        {/* slot: starter end */}
        <p className="tl-block-fr-total">
          합계 {formatAmount(sum(lines, (l) => l.amount))}원 · 품목 {lines.length}종
        </p>
      </section>
    </div>
  );
}
