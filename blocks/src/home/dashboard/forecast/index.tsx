// 수요 예측 · 발주 추천(Dashboard): 예측 정확도 · 이번 주 출고 · 품절 위험 · 추천 금액 → 주별 수요(실적 → 예측 + 80% 구간)
// → 추천 근거(예측 요인 · 계산) → 발주 추천 표(고르면 발주 초안) → 승인 카드. 사람이 승인하기 전에는 아무것도 바뀌지 않는다.
// 위젯은 DashboardGrid에 있고 "배치 편집"으로 순서를 바꾸거나 숨긴다.
import {
  formatAmount,
  formatCompactWon,
  formatDate,
  formatPercent,
  formatQuantity,
  type DashboardLayout,
  type PeriodValue,
  type ProposalStatus,
} from '@terracelab/trellis-contracts';
import {
  ActionBar,
  AmountBreakdown,
  Button,
  Card,
  ChartCard,
  DashboardGrid,
  DataBar,
  DataGrid,
  DataGridLines,
  DueBadge,
  KpiCard,
  PageHeader,
  PeriodPicker,
  ProposalCard,
  RunSteps,
  SegmentedControl,
  Select,
  StatusDot,
  TrendChart,
  useToast,
  type DashboardWidgetWeb,
  type RunStepWeb,
} from '@terracelab/trellis-react';
import { useMemo, useState } from 'react';
import {
  accuracyOf,
  BACKTEST_WEEKS,
  BAND_LABEL,
  demandRows,
  FORECAST_PLANS,
  FORECAST_RAN_AT,
  FORECAST_RUN,
  nextPoIds,
  RECOMMENDATIONS,
  recommendationFor,
  THIS_WEEK,
  WEEKS_AHEAD,
  WEEKS_BACK,
  type Recommendation,
} from '../../../_data/forecast.js';
import { ITEM_CATEGORIES, ITEMS, itemById, partyById, sum, TODAY } from '../../../_data/index.js';
import { NOW_AT } from '../../../_data/profile.js';
import { useCan, usePlatform, useScreens } from '../../../_platform/index.js';
import { addDays, ExportButton, Page, type CsvColumn } from '../../../_ui/index.js';
import './style.css';

// slot: rule — 추천 수량 식과 납기 뜻(계산은 _data/forecast.ts recommendQty, 글은 여기)
const RULE =
  '추천 수량 = 리드타임 수요 + 안전재고 − 현재고 − 입고 예정. 0보다 작으면 0이고, 발주 단위의 배수로 올립니다.';
const NEED_BY = '납기는 재고가 안전재고에 닿는 날';
// slot: rule end

/** 실적 기본 기간: 마감한 최근 12주 */
const DEFAULT_PERIOD: PeriodValue = { from: addDays(THIS_WEEK, -12 * 7), to: TODAY };
const LAST_WEEK = addDays(THIS_WEEK, -7);
const ALL = 'all';
const cat = (id: string) => `cat:${id}`;
const md = (date: string) => date.slice(5);
const signed = (v: number) => `${formatAmount(v, { digits: 1, sign: 'always' })}%`;
const supplierName = (r: Recommendation) => partyById(r.plan.supplierId).name;

const ITEM_IDS = FORECAST_PLANS.map((p) => p.itemId);
const RISKS = RECOMMENDATIONS.filter((r) => r.risk);
const ORDERS = RECOMMENDATIONS.filter((r) => r.qty > 0);
const ACCURACY = accuracyOf(ITEM_IDS);
const ACCURACY_PREV = accuracyOf(ITEM_IDS, BACKTEST_WEEKS, BACKTEST_WEEKS);
/** 판매가 기준 금액(원): 한 주의 품목별 값 × 판매 단가 합 */
const moneyOf = (ids: readonly string[], k: number, field: 'actual' | 'forecast') =>
  sum(ids, (id) => (demandRows(id).find((r) => r.k === k)?.[field] ?? 0) * itemById(id).price);
const THIS_WEEK_OUT = moneyOf(ITEM_IDS, 0, 'forecast');
const LAST_WEEK_OUT = moneyOf(ITEM_IDS, -1, 'actual');
/** 품목별 예측 오차(%) = 100 − 정확도 */
const ERRORS = ITEM_IDS.map((id) => ({
  id,
  label: itemById(id).name,
  accuracy: accuracyOf([id]),
  value: Math.round((100 - accuracyOf([id])) * 10) / 10,
})).sort((a, b) => b.value - a.value);

/** 차트 범위(전체 · 분류 · 품목) → 품목 id. 품목 하나면 수량, 여럿이면 판매가 기준 금액 */
function scopeItems(scope: string): string[] {
  if (scope === ALL) return ITEM_IDS;
  if (scope.startsWith('cat:'))
    return ITEMS.filter((i) => i.category === scope.slice(4)).map((i) => i.id);
  return [scope];
}

/** 차트 행: 실적 기간 안의 마감한 주 + (지난주까지 고르면) 예측 WEEKS_AHEAD주 */
function chartRows(scope: string, period: PeriodValue) {
  const ids = scopeItems(scope);
  const money = scope.startsWith('cat:') || scope === ALL;
  const value = (k: number, f: 'actual' | 'forecast' | 'lower' | 'upper') =>
    money
      ? sum(ids, (id) => (demandRows(id).find((r) => r.k === k)?.[f] ?? 0) * itemById(id).price)
      : (demandRows(ids[0]!).find((r) => r.k === k)?.[f] ?? 0);
  const weeks = demandRows(ids[0]!);
  const past = weeks.filter((w) => w.k < 0 && w.week >= period.from && w.week <= period.to);
  const reaches = past.length > 0 && past[past.length - 1]!.week === LAST_WEEK;
  const rows = past.map((w, i) => {
    const v = value(w.k, 'actual');
    const join = reaches && i === past.length - 1;
    return {
      week: md(w.week),
      value: v,
      actual: v as number | null,
      forecast: value(w.k, 'forecast'),
      lower: join ? v : null,
      upper: join ? v : null,
    };
  });
  if (reaches)
    for (const w of weeks.filter((x) => x.k >= 0))
      rows.push({
        week: md(w.week),
        value: value(w.k, 'forecast'),
        actual: null,
        forecast: value(w.k, 'forecast'),
        lower: value(w.k, 'lower'),
        upper: value(w.k, 'upper'),
      });
  return { rows, money, from: reaches ? past.length - 1 : null, actualWeeks: past.length };
}

/** 승인 카드 하나(배치 추천 또는 표에서 고른 품목) */
interface Proposal {
  id: string;
  origin: 'batch' | 'manual';
  itemIds: string[];
  status: ProposalStatus;
  reason?: string;
  resolvedBy?: string;
}

// slot: layout — 처음 배치. 앱은 onLayoutChange 값을 사용자 설정(API)에 저장하고 다음 방문에 layout으로 넘긴다
const DEFAULT_LAYOUT: DashboardLayout = [];
// slot: layout end

export default function ForecastDashboard() {
  const toast = useToast();
  const { session } = usePlatform();
  const screens = useScreens();
  const canOrder = useCan('purchasing', 'create');
  const [editing, setEditing] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const [period, setPeriod] = useState<PeriodValue>(DEFAULT_PERIOD);
  const [scope, setScope] = useState<string>(ALL);
  const [focusId, setFocusId] = useState<string>(RISKS[0]?.item.id ?? ORDERS[0]!.item.id);
  const [view, setView] = useState<'order' | 'risk' | 'all'>('order');
  const [selected, setSelected] = useState<string[]>([]);
  const [drafted, setDrafted] = useState<string[]>([]);
  const [proposal, setProposal] = useState<Proposal>({
    id: 'batch',
    origin: 'batch',
    itemIds: RISKS.map((r) => r.item.id),
    status: 'waiting',
  });

  const chart = useMemo(() => chartRows(scope, period), [scope, period]);
  const scopeUnit = chart.money ? '원' : itemById(scope).unit;
  const focus = recommendationFor(focusId);
  const rows = RECOMMENDATIONS.filter((r) =>
    view === 'risk' ? r.risk : view === 'order' ? r.qty > 0 : true,
  ).map((r) => ({ ...r, id: r.item.id, lead: r.plan.leadWeeks }));
  const picked = ORDERS.filter((r) => selected.includes(r.item.id));
  const proposalRecs = proposal.itemIds.map(recommendationFor);
  const suppliers = [...new Set(proposalRecs.map((r) => r.plan.supplierId))];
  const poIds = nextPoIds(suppliers.length);
  const focusOn = (id: string) => {
    setFocusId(id);
    setScope(id);
  };

  // slot: proposal — 승인 · 반려(앱은 여기서 발주 초안 API를 부른다. 서버가 purchasing create 권한을 다시 본다)
  const approve = () =>
    new Promise((done) => setTimeout(done, 600)).then(() => {
      setProposal((p) => ({
        ...p,
        status: 'approved',
        resolvedBy: `${session.user.name} ${session.user.title} · ${NOW_AT}`,
      }));
      setDrafted((d) => [...new Set([...d, ...proposal.itemIds])]);
      toast.show({
        title: `발주 초안 ${poIds.length}건을 등록했습니다`,
        description: poIds.join(' · '),
        tone: 'success',
      });
    });
  const reject = (reason: string) => {
    setProposal((p) => ({
      ...p,
      status: 'rejected',
      reason,
      resolvedBy: `${session.user.name} ${session.user.title} · ${NOW_AT}`,
    }));
    toast.show({ title: '추천을 반려했습니다', tone: 'neutral' });
  };
  // slot: proposal end

  const draftSelected = () => {
    const ids = picked.map((r) => r.item.id);
    setProposal({
      id: `manual-${ids.join('-')}`,
      origin: 'manual',
      itemIds: ids,
      status: 'waiting',
    });
    setSelected([]);
    toast.show({ title: `${ids.length}품목 발주 초안을 승인 대기에 올렸습니다` });
  };

  /** 엑셀 다운로드 열(지금 보이는 추천 행, 수량 · 금액은 서식 없는 숫자) */
  const csv: CsvColumn<(typeof rows)[number]>[] = [
    { label: '품목 코드', value: (r) => r.item.code },
    { label: '품목', value: (r) => r.item.name },
    { label: '공급사', value: (r) => supplierName(r) },
    { label: '단위', value: (r) => r.item.unit },
    { label: '현재고', value: 'stock' },
    { label: '안전재고', value: 'safety' },
    { label: '입고 예정', value: 'incoming' },
    { label: '예측 수요(리드타임)', value: 'leadDemand' },
    { label: '리드타임(주)', value: (r) => r.plan.leadWeeks },
    { label: '추천 수량', value: 'qty' },
    { label: '납기', value: (r) => r.needBy ?? '' },
    { label: '금액(원)', value: 'amount' },
    { label: '품절 위험', value: (r) => (r.risk ? '예' : '') },
  ];

  const scopeOptions = [
    { value: ALL, label: '전체 품목', note: '금액' },
    ...ITEM_CATEGORIES.map((c) => ({ value: cat(c.id), label: `${c.id} 전체`, note: '금액' })),
    ...ITEMS.map((i) => ({ value: i.id, label: i.name, note: i.unit })),
  ];
  const lastRow = chart.rows[chart.rows.length - 1];
  const chartName =
    scope === ALL
      ? '전체 품목'
      : scope.startsWith('cat:')
        ? `${scope.slice(4)} 전체`
        : itemById(scope).name;
  const fmt = (v: number) => (chart.money ? formatCompactWon(v) : formatAmount(v));

  const widgets: DashboardWidgetWeb[] = [
    // slot: kpis — 위 숫자 넷(정확도 · 이번 주 출고 · 품절 위험 · 추천 금액)
    {
      id: 'accuracy',
      title: '예측 정확도',
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label="예측 정확도"
          value={ACCURACY}
          format="percent"
          icon="gauge"
          delta={{
            value: Math.round((ACCURACY - ACCURACY_PREV) * 10) / 10,
            label: `직전 ${BACKTEST_WEEKS}주 대비`,
            format: 'point',
            polarity: 'up-good',
          }}
          caption={`최근 ${BACKTEST_WEEKS}주 실적 대비 · 판매가 가중`}
        />
      ),
    },
    {
      id: 'week',
      title: '이번 주 예상 출고',
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label="이번 주 예상 출고"
          value={THIS_WEEK_OUT}
          format="amount"
          unit="원"
          icon="truck"
          delta={{
            value: Math.round(((THIS_WEEK_OUT - LAST_WEEK_OUT) / LAST_WEEK_OUT) * 1000) / 10,
            label: '지난주 실적 대비',
          }}
          caption={`${formatDate(THIS_WEEK, 'md')}~${Number(addDays(THIS_WEEK, 6).slice(8))}일 · 판매가 기준`}
        />
      ),
    },
    {
      id: 'risk',
      title: '품절 위험 품목',
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label="품절 위험 품목"
          value={RISKS.length}
          unit="품목"
          icon="triangle-alert"
          caption={RISKS.map((r) => r.item.name).join(' · ') || '없음'}
          onPress={() => setView('risk')}
        />
      ),
    },
    {
      id: 'amount',
      title: '추천 발주 금액',
      span: 3,
      hideable: false,
      content: (
        <KpiCard
          label="추천 발주 금액"
          value={sum(ORDERS, (r) => r.amount)}
          format="amount"
          unit="원"
          icon="shopping-cart"
          caption={`${ORDERS.length}품목 · 공급사 ${new Set(ORDERS.map((r) => r.plan.supplierId)).size}곳 · 평균 원가 기준`}
          onPress={() => setView('order')}
        />
      ),
    },
    // slot: kpis end
    {
      id: 'demand',
      title: '주별 수요',
      span: 8,
      content: (
        <ChartCard
          className="tl-block-fc-card"
          title="주별 수요"
          subtitle={`${chartName} · ${chart.money ? '원 · 판매가 기준' : scopeUnit} · 실적 ${chart.actualWeeks}주${chart.from !== null ? ` · 예측 ${WEEKS_AHEAD}주 · 음영은 ${BAND_LABEL}` : ''}`}
          legend={[
            { label: '실적', color: 'series-1', shape: 'line' },
            ...(chart.from !== null
              ? [{ label: '예측', color: 'series-1' as const, shape: 'dashed' as const }]
              : []),
          ]}
          action={
            <div className="tl-block-fc-filters">
              <PeriodPicker
                size="sm"
                label="실적 기간"
                today={TODAY}
                max={TODAY}
                presets={['lastMonth', 'thisQuarter', 'thisYear']}
                value={period}
                onChange={setPeriod}
              />
              <Select
                size="sm"
                width="auto"
                label="품목"
                value={scope}
                onChange={(v) => {
                  const next = v ?? ALL;
                  setScope(next);
                  if (!next.startsWith('cat:') && next !== ALL) setFocusId(next);
                }}
                options={scopeOptions}
              />
            </div>
          }
          height={400}
          empty={
            chart.rows.length === 0 ? '고른 기간에 마감한 주가 없습니다. 기간을 넓히세요' : null
          }
          table={{
            columns: [
              '주',
              `실적(${scopeUnit})`,
              `예측(${scopeUnit})`,
              `구간 아래(${scopeUnit})`,
              `구간 위(${scopeUnit})`,
            ],
            rows: chart.rows.map((r) => [
              r.week,
              r.actual ?? '',
              r.forecast,
              r.actual === null ? (r.lower ?? '') : '',
              r.actual === null ? (r.upper ?? '') : '',
            ]),
          }}
        >
          <TrendChart
            data={chart.rows}
            x="week"
            series={[{ key: 'value', label: '실적', type: 'area' }]}
            unit={scopeUnit}
            height={400}
            curve="linear"
            yFormat={fmt}
            {...(chart.from !== null
              ? {
                  forecast: {
                    from: chart.from,
                    lower: 'lower',
                    upper: 'upper',
                    bandLabel: BAND_LABEL,
                  },
                  endLabel: 'value',
                }
              : {})}
            ariaLabel={`${chartName} 주별 수요. 실적 ${chart.actualWeeks}주${lastRow && chart.from !== null ? `, ${WEEKS_AHEAD}주 뒤 예측 ${fmt(lastRow.value)}${scopeUnit}` : ''}`}
          />
        </ChartCard>
      ),
    },
    {
      id: 'basis',
      title: '추천 근거',
      span: 4,
      content: (
        <Card title="추천 근거" subtitle={`${focus.item.name} · ${focus.item.spec}`}>
          <div className="tl-block-fc-basis">
            <p className="tl-block-fc-verdict">
              {focus.risk ? (
                <StatusDot tone="danger">품절 위험</StatusDot>
              ) : focus.qty > 0 ? (
                <StatusDot tone="info">발주 필요</StatusDot>
              ) : (
                <StatusDot tone="success">발주 불필요</StatusDot>
              )}
              <span>
                {focus.qty > 0
                  ? `${focus.stockoutAt && focus.risk ? `${formatDate(focus.stockoutAt, 'md')} 품절 예상` : `납기 ${focus.needBy ? formatDate(focus.needBy, 'md') : '–'}`} · 지금 발주하면 ${formatDate(focus.arriveIfOrdered, 'md')} 입고`
                  : `${WEEKS_AHEAD}주 안에 안전재고 아래로 내려가지 않습니다`}
              </span>
            </p>
            <section aria-labelledby="fc-factors">
              <h3 id="fc-factors" className="tl-block-fc-heading">
                예측 요인
              </h3>
              <dl className="tl-block-fc-facts">
                <div>
                  <dt>최근 {BACKTEST_WEEKS}주 평균</dt>
                  <dd>
                    {formatQuantity(focus.factors.recent, focus.item.unit)}
                    <span className="tl-block-fc-per">/주</span>
                  </dd>
                </div>
                <div>
                  <dt>추세</dt>
                  <dd>주당 {signed(focus.factors.trendPct)}</dd>
                </div>
                <div>
                  <dt>계절 지수</dt>
                  <dd>×{formatAmount(focus.factors.seasonIndex, { digits: 2 })}</dd>
                </div>
                <div>
                  <dt>예측 범위({BAND_LABEL})</dt>
                  <dd>±{formatPercent(focus.factors.bandPct)}</dd>
                </div>
              </dl>
            </section>
            <AmountBreakdown
              title="추천 계산"
              unit={focus.item.unit}
              rows={[
                {
                  key: 'lead',
                  label: `리드타임 수요 ${focus.plan.leadWeeks}주`,
                  value: focus.leadDemand,
                  hint: `이번 주부터 ${focus.plan.leadWeeks}주 예측 합계`,
                },
                { key: 'safety', label: '안전재고', value: focus.safety, op: '+' },
                { key: 'stock', label: '현재고', value: focus.stock, op: '−' },
                {
                  key: 'incoming',
                  label: '입고 예정',
                  value: focus.incoming,
                  op: '−',
                  ...(focus.incomingPos.length
                    ? {
                        hint: focus.incomingPos.map((x) => `${x.poId} ${md(x.due)}`).join(' · '),
                      }
                    : {}),
                },
                {
                  key: 'qty',
                  label: '추천 수량',
                  value: focus.qty,
                  op: '=',
                  hint:
                    focus.need > 0
                      ? `필요 ${formatQuantity(focus.need, focus.item.unit)} · ${formatQuantity(focus.plan.orderUnit, focus.item.unit)} 단위로 올림`
                      : `계산 값 ${formatAmount(focus.need)}. 0보다 작아 발주하지 않습니다`,
                },
              ]}
            />
            <p className="tl-block-fc-note">
              {RULE} 계절 지수는 리드타임 동안 주당 예측을 최근 {BACKTEST_WEEKS}주 평균으로 나눈
              값입니다.
            </p>
          </div>
        </Card>
      ),
    },
    {
      id: 'table',
      title: '발주 추천',
      span: 12,
      content: (
        <Card
          className="tl-block-fc-card"
          title="발주 추천"
          subtitle={`${rows.length}품목 · 예측 수요는 리드타임 동안 합계 · ${NEED_BY}`}
          padding="none"
          action={
            <div className="tl-block-fc-filters">
              <SegmentedControl
                size="sm"
                label="보기"
                value={view}
                onChange={(v) => setView(v as typeof view)}
                options={[
                  { value: 'order', label: '추천 품목' },
                  { value: 'risk', label: '품절 위험' },
                  { value: 'all', label: '전체 품목' },
                ]}
              />
              <ExportButton
                module="purchasing"
                name="발주 추천"
                rows={rows}
                columns={csv}
                size="sm"
              >
                엑셀 다운로드
              </ExportButton>
            </div>
          }
          footer={
            selected.length > 0 ? (
              <ActionBar
                summary={`${picked.length}품목 · 공급사 ${new Set(picked.map((r) => r.plan.supplierId)).size}곳 · ${formatAmount(sum(picked, (r) => r.amount))}원`}
              >
                <Button onPress={() => setSelected([])}>선택 해제</Button>
                <Button
                  variant="primary"
                  icon="file-plus"
                  disabled={!canOrder || picked.length === 0}
                  {...(!canOrder ? { disabledReason: '발주 등록 권한이 없습니다' } : {})}
                  onPress={draftSelected}
                >
                  발주 초안 만들기
                </Button>
              </ActionBar>
            ) : undefined
          }
        >
          <DataGrid
            caption="발주 추천"
            className="tl-block-flat-grid"
            rows={rows}
            rowKey="id"
            selectable
            selected={selected}
            onSelectedChange={(keys) =>
              setSelected(keys.filter((k) => recommendationFor(k).qty > 0))
            }
            onRowPress={(r) => focusOn(String(r['id']))}
            activeRowKey={focusId}
            summary
            empty="추천할 품목이 없습니다. 전체 품목에서 재고를 보세요"
            // slot: columns — 표 열(품목 · 재고 · 예측 · 추천 · 납기 · 금액)
            columns={[
              {
                key: 'id',
                header: '품목',
                link: true,
                hideable: false,
                mobile: 'title',
                render: (r: (typeof rows)[number]) => (
                  <DataGridLines
                    primary={
                      <span className="tl-block-fc-item">
                        {r.item.name}
                        {r.risk && (
                          <StatusDot tone="danger" size="sm">
                            품절 위험
                          </StatusDot>
                        )}
                      </span>
                    }
                    secondary={
                      drafted.includes(r.item.id)
                        ? `${supplierName(r)} · 초안 등록`
                        : `${r.item.code} · ${supplierName(r)}`
                    }
                  />
                ),
              },
              {
                key: 'stock',
                header: '현재고',
                width: 'sm',
                format: 'quantity',
                mobile: 'meta',
                render: (r: (typeof rows)[number]) => formatQuantity(r.stock, r.item.unit),
              },
              {
                key: 'safety',
                header: '안전재고 대비',
                width: 'md',
                mobile: 'hidden',
                render: (r: (typeof rows)[number]) => (
                  <DataBar
                    value={r.stock}
                    max={Math.max(r.stock, r.safety * 1.5)}
                    marker={r.safety}
                    warnBelow={r.safety}
                    width={56}
                    format={(v) => formatPercent((v / r.safety) * 100, 0)}
                    label={`${r.item.name} 안전재고 대비`}
                  />
                ),
              },
              {
                key: 'leadDemand',
                header: '예측 수요',
                width: 'sm',
                format: 'quantity',
                mobile: 'hidden',
                render: (r: (typeof rows)[number]) => formatQuantity(r.leadDemand, r.item.unit),
              },
              {
                key: 'qty',
                header: '추천 수량',
                width: 'sm',
                format: 'quantity',
                emphasis: true,
                mobile: 'meta',
                render: (r: (typeof rows)[number]) =>
                  r.qty > 0 ? formatQuantity(r.qty, r.item.unit) : '–',
              },
              {
                key: 'lead',
                header: '리드타임',
                width: 'sm',
                format: 'number',
                mobile: 'meta',
                render: (r: (typeof rows)[number]) => `${r.plan.leadWeeks}주`,
              },
              {
                key: 'needBy',
                header: '납기',
                width: 'md',
                mobile: 'status',
                render: (r: (typeof rows)[number]) =>
                  r.needBy ? (
                    <DataGridLines
                      primary={<DueBadge due={r.needBy} today={TODAY} warnDays={7} size="sm" />}
                      secondary={`입고 가능 ${md(r.arriveIfOrdered)}`}
                    />
                  ) : (
                    '–'
                  ),
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
            // slot: columns end
          />
        </Card>
      ),
    },
    {
      id: 'proposal',
      title: '발주 초안 승인',
      span: 6,
      content: (
        <ProposalCard
          key={proposal.id}
          title={
            proposal.origin === 'batch'
              ? `품절 위험 ${proposal.itemIds.length}품목 발주 초안`
              : `선택한 ${proposal.itemIds.length}품목 발주 초안`
          }
          summary={
            proposal.status === 'approved'
              ? `공급사 ${suppliers.length}곳에 발주서 초안 ${poIds.length}건(${poIds.join(' · ')})을 작성 중으로 등록했습니다. 합계 ${formatAmount(sum(proposalRecs, (r) => r.amount))}원이고 결재 요청은 발주 목록에서 합니다.`
              : `공급사 ${suppliers.length}곳에 발주서 초안 ${poIds.length}건(${poIds.join(' · ')})을 작성 중으로 등록합니다. 합계 ${formatAmount(sum(proposalRecs, (r) => r.amount))}원이고 결재 요청은 등록 뒤 따로 합니다.`
          }
          changes={proposalRecs.map((r) => ({
            target: r.item.name,
            field: '발주 수량',
            before: null,
            after: `${formatQuantity(r.qty, r.item.unit)} · 납기 ${r.needBy ? md(r.needBy) : '–'}`,
          }))}
          status={proposal.status}
          {...(proposal.reason ? { reason: proposal.reason } : {})}
          {...(proposal.resolvedBy ? { resolvedBy: proposal.resolvedBy } : {})}
          approveLabel="초안 등록"
          disabled={!canOrder}
          reasonMinLength={2}
          onApprove={approve}
          onReject={reject}
        >
          <RunSteps
            label="추천을 만든 과정"
            collapsible
            defaultOpen={false}
            steps={[
              ...(proposal.origin === 'batch'
                ? FORECAST_RUN.map((s): RunStepWeb => ({
                    id: s.id,
                    name: s.name,
                    state: 'succeeded',
                    durationMs: s.ms,
                    description: s.detail,
                  }))
                : [
                    {
                      id: 'pick',
                      name: '추천 품목 선택',
                      state: 'succeeded' as const,
                      description: `${proposal.itemIds.length}품목 · ${session.user.name} ${session.user.title}`,
                    },
                  ]),
              {
                id: 'approve',
                name: '사람 승인',
                state:
                  proposal.status === 'waiting'
                    ? 'waiting'
                    : proposal.status === 'approved'
                      ? 'succeeded'
                      : 'canceled',
                description:
                  proposal.status === 'waiting'
                    ? '승인 전에는 발주가 바뀌지 않습니다'
                    : (proposal.resolvedBy ?? ''),
              },
            ]}
          />
          {proposal.status === 'approved' && screens.has('erp/purchasing/po-list') && (
            <Button
              size="sm"
              variant="ghost"
              iconEnd="chevron-right"
              onPress={() => screens.go('erp/purchasing/po-list')}
            >
              발주 목록에서 결재 요청
            </Button>
          )}
        </ProposalCard>
      ),
    },
    {
      id: 'error',
      title: '품목별 예측 오차',
      span: 6,
      content: (
        <Card
          title="품목별 예측 오차"
          subtitle={`최근 ${BACKTEST_WEEKS}주 · 실적과 예측의 차이 ÷ 실적 · 큰 순서 · 누르면 그 품목`}
          padding="none"
        >
          <DataGrid
            caption="품목별 예측 오차"
            className="tl-block-flat-grid"
            rows={ERRORS}
            rowKey="id"
            onRowPress={(r) => focusOn(String(r['id']))}
            activeRowKey={focusId}
            columns={[
              { key: 'label', header: '품목', link: true, mobile: 'title' },
              {
                key: 'value',
                header: '오차',
                width: 'lg',
                mobile: 'meta',
                render: (e: (typeof ERRORS)[number]) => (
                  <DataBar
                    value={e.value}
                    max={ERRORS[0]!.value}
                    width={96}
                    format={(v) => formatPercent(v)}
                    label={`${e.label} 예측 오차`}
                  />
                ),
              },
              {
                key: 'accuracy',
                header: '정확도',
                width: 'sm',
                format: 'percent',
                mobile: 'trailing',
                render: (e: (typeof ERRORS)[number]) => formatPercent(e.accuracy),
              },
            ]}
          />
        </Card>
      ),
    },
  ];

  return (
    <Page
      header={
        <PageHeader
          title="수요 예측 · 발주 추천"
          description={`품목 ${ITEMS.length}종 · ${formatDate(TODAY, 'mdw')} ${FORECAST_RAN_AT.slice(11)} 예측 · 출고 실적 ${WEEKS_BACK}주 기준`}
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
                <Button icon="layout-grid" onPress={() => setEditing(true)}>
                  배치 편집
                </Button>
                {screens.has('erp/purchasing/po-list') && (
                  <Button
                    variant="primary"
                    icon="shopping-cart"
                    onPress={() => screens.go('erp/purchasing/po-list')}
                  >
                    발주 목록
                  </Button>
                )}
              </>
            )
          }
        />
      }
    >
      <DashboardGrid
        label="수요 예측 · 발주 추천"
        widgets={widgets}
        layout={layout}
        onLayoutChange={setLayout}
        editing={editing}
      />
    </Page>
  );
}
