// 차트 · 데이터 시각화: @terracelab/trellis-react/charts 차트를 ERP 대시보드 한 장 + 모바일 한 장으로.
// 숫자는 data.ts에서만 온다. 색은 chart.series 슬롯 이름만 쓴다(hex 없음).
import {
  BarList,
  BulletBar,
  CalendarHeatmap,
  ChartCard,
  ComboChart,
  DataBar,
  Donut,
  HeatCell,
  RadialMeter,
  SegmentedBar,
  Sparkline,
  TrendChart,
  WaterfallChart,
  type ChartTable,
} from '@terracelab/trellis-react/charts';
import { formatCompactWon, formatPercent } from '@terracelab/trellis-contracts';
import { createRoot } from 'react-dom/client';
import {
  BRANCH_SALES,
  BUDGET_STEPS,
  CASH,
  DAILY_SALES,
  KPIS,
  ORDER_FILL,
  RECEIVABLES,
  SALES_12M,
  SALES_CHANNELS,
  SALES_MONTHLY,
  SALES_PREV_12M,
  TODAY,
  won,
} from '../data';
import { FACTS } from '../generated/facts';
import { icons, type IconNode } from '../generated/icons';
import { card, cardHead, esc, section } from '../lib';
import { mountShowcase } from './showcase-screens';

/* ── React 쪽 작은 도우미 ─────────────────────────────────── */
function Icon({ name, className = 'tl-preview-icon' }: { name: string; className?: string }) {
  const node: IconNode = icons[name]!;
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {node.map(([tag, attrs], i) => {
        const Tag = tag as 'path';
        return <Tag key={i} {...(attrs as Record<string, string>)} />;
      })}
    </svg>
  );
}

const Money = ({ n }: { n: number }) => (
  <span className="tl-preview-money">
    {won(n)}
    <span className="tl-preview-unit">원</span>
  </span>
);

const monthLabel = (m: string | number) => `${String(m).slice(3)}월`;
const man = (v: number) => formatCompactWon(v);
const pctFmt = (v: number) => formatPercent(v);

/* ── 표 대체 데이터 ───────────────────────────────────────── */
const monthlyTable: ChartTable = {
  columns: ['월', '매출(원)', '전년(원)', '마진율'],
  rows: SALES_MONTHLY.map((m) => [monthLabel(m.month), m.sales, m.prev, pctFmt(m.margin)]),
};
const cashTable: ChartTable = {
  columns: ['일', '시재(원)'],
  rows: CASH.series.map((v, i) => [`D-${CASH.series.length - 1 - i}`, v]),
};
const budgetTable: ChartTable = {
  columns: ['단계', '금액(원)'],
  rows: BUDGET_STEPS.map((s) => [s.label, s.value]),
};
const branchTable: ChartTable = {
  columns: ['지사', '매출(원)'],
  rows: BRANCH_SALES.map((b) => [b.label, b.value]),
};
const dailyTable: ChartTable = {
  columns: ['날짜', '판매 건수'],
  rows: DAILY_SALES.map((d) => [d.date, d.value]),
};

/* ── KPI 타일 ─────────────────────────────────────────────── */
function Kpi({ k, compact = false }: { k: (typeof KPIS)[number]; compact?: boolean }) {
  const good = k.polarity === 'up-good' ? k.delta >= 0 : k.delta <= 0;
  const value =
    k.unit === '원' ? (
      compact ? (
        <span className="tl-preview-money">
          {man(k.value)}
          <span className="tl-preview-unit">원</span>
        </span>
      ) : (
        <Money n={k.value} />
      )
    ) : (
      <span className="tl-preview-money">
        {k.value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}
        <span className="tl-preview-unit">{k.unit}</span>
      </span>
    );
  return (
    <article className="tl-preview-card tl-preview-kpi">
      <span className="tl-preview-stat-label">{k.label}</span>
      <strong className="tl-preview-stat-value">{value}</strong>
      <span className="tl-preview-kpi-foot">
        <span
          className={`tl-preview-kpi-delta ${good ? 'tl-preview-kpi-good' : 'tl-preview-kpi-bad'}`}
        >
          <Icon name={k.delta >= 0 ? 'arrow-up-right' : 'arrow-down-right'} />
          {k.unit === '%' || k.unit === '일'
            ? `${Math.abs(k.delta)}${k.unit === '%' ? '%p' : k.unit}`
            : `${Math.abs(k.delta)}%`}
        </span>
        <span className="tl-preview-meta">vs {k.deltaLabel}</span>
        <Sparkline
          data={k.spark}
          width={96}
          height={28}
          color={good ? 'series-1' : 'compare'}
          ariaLabel={`${k.label} 최근 8구간 추이`}
        />
      </span>
    </article>
  );
}

/* ── 대시보드 ─────────────────────────────────────────────── */
function Dashboard() {
  const topBranches = BRANCH_SALES.slice(0, 3);
  const rest = BRANCH_SALES.slice(3).reduce((s, b) => s + b.value, 0);
  const yoy = ((SALES_12M - SALES_PREV_12M) / SALES_PREV_12M) * 100;
  const maxBalance = Math.max(...RECEIVABLES.map((r) => r.balance));
  const maxAging = Math.max(...RECEIVABLES.flatMap((r) => r.aging));
  return (
    <div className="tl-preview-dash">
      {KPIS.map((k) => (
        <Kpi k={k} key={k.label} />
      ))}

      <ChartCard
        className="tl-preview-dash-main"
        title="월별 매출"
        subtitle={`원 · 완료된 12개월 · 점선은 전년 같은 달 · 아래는 마진율(%)`}
        legend={[
          { label: '매출', color: 'series-1' },
          { label: '전년', color: 'compare', shape: 'dashed' },
          { label: '마진율', color: 'series-3', shape: 'line' },
        ]}
        action={
          <span className="tl-preview-badge" data-kind="status" data-tone="info">
            <span className="tl-preview-dot" />
            전년 대비 {formatPercent(yoy)}
          </span>
        }
        height={332}
        table={monthlyTable}
      >
        <ComboChart
          data={SALES_MONTHLY}
          x="month"
          bars={[{ key: 'sales', label: '매출' }]}
          lines={[{ key: 'prev', label: '전년', dashed: true }]}
          unit="원"
          height={240}
          xFormat={monthLabel}
          yFormat={man}
          lower={{
            series: [{ key: 'margin', label: '마진율' }],
            unit: '%',
            height: 84,
            yFormat: pctFmt,
          }}
          ariaLabel={`최근 12개월 월별 매출. 10월 ${man(SALES_MONTHLY.at(-1)!.sales)}원, 전년 대비 ${formatPercent(yoy)}`}
        />
      </ChartCard>

      <article className="tl-preview-card tl-preview-dash-side">
        <header className="tl-preview-card-head">
          <h3 className="tl-preview-card-title">채널 · 지사 구성</h3>
          <span className="tl-preview-meta">10월 · 원</span>
        </header>
        <Donut
          data={SALES_CHANNELS}
          unit="원"
          height={168}
          format={man}
          centerValue={man(SALES_CHANNELS.reduce((s, c) => s + c.value, 0))}
          centerLabel="합계"
          ariaLabel="10월 채널 구성. 직판 47%, 대리점 31%, 온라인 15%, 수출 8%"
        />
        <div className="tl-preview-dash-sub">
          <span className="tl-preview-stat-label">지사 TOP 3 · 나머지 4곳</span>
          <SegmentedBar
            data={[
              ...topBranches.map((b, i) => ({
                ...b,
                color: (['series-1', 'series-2', 'series-4'] as const)[i]!,
              })),
              { label: '나머지', value: rest, color: 'compare' },
            ]}
            unit="원"
            size="thin"
            format={man}
            ariaLabel="지사 매출 비중. 서울 본사 39%, 경기 남부 20%, 부산·경남 16%, 나머지 26%"
          />
        </div>
      </article>

      <ChartCard
        className="tl-preview-dash-half"
        title="시재 추이"
        subtitle="원 · 최근 30일 · 음영은 운영 목표 범위"
        action={
          <span className="tl-preview-card-figure">
            <Money n={CASH.today} />
          </span>
        }
        height={220}
        table={cashTable}
      >
        <TrendChart
          data={CASH.series.map((v, i) => ({ d: `D-${CASH.series.length - 1 - i}`, cash: v }))}
          x="d"
          series={[{ key: 'cash', label: '시재', type: 'area' }]}
          unit="원"
          height={220}
          yFormat={man}
          endLabel="cash"
          band={{ from: 800_000_000, to: 850_000_000, label: '목표 범위' }}
          ariaLabel={`최근 30일 시재 추이. ${won(CASH.series[0]!)}원에서 ${won(CASH.today)}원으로`}
        />
      </ChartCard>

      <ChartCard
        className="tl-preview-dash-half"
        title="11월 예산 집행"
        subtitle="원 · 파랑은 집행(감소) · 빨강은 추가 편성(증가) — 금융 색 고정(지출 파랑 · 수입 빨강)"
        height={220}
        table={budgetTable}
      >
        <WaterfallChart
          steps={BUDGET_STEPS}
          unit="원"
          height={220}
          format={man}
          reference={{ value: 100_000_000, label: '최소 잔액' }}
          ariaLabel="11월 예산 4.2억에서 인건비·재료비·경비를 집행하고 2,500만을 추가 편성해 잔액 9,630만"
        />
      </ChartCard>

      <ChartCard
        className="tl-preview-dash-third"
        title="지사별 매출"
        subtitle="원 · 10월 · 한 색(명목 범주)"
        height={300}
        table={branchTable}
      >
        <BarList
          data={BRANCH_SALES}
          unit="원"
          layout="horizontal"
          height={300}
          format={man}
          showValues
          ariaLabel="10월 지사별 매출. 서울 본사 6.1억이 가장 많고 강원 2,800만이 가장 적다"
        />
      </ChartCard>

      <ChartCard
        className="tl-preview-dash-third"
        title="일별 판매"
        subtitle="건 · 2026년 10월 · 한 색 진하기 5단계"
        height={300}
        table={dailyTable}
      >
        <CalendarHeatmap
          data={DAILY_SALES}
          unit="건"
          ariaLabel="10월 일별 판매 건수. 평일이 많고 주말이 적다"
        />
      </ChartCard>

      <article className="tl-preview-card tl-preview-dash-third">
        <header className="tl-preview-card-head">
          <h3 className="tl-preview-card-title">목표 · 발주 소진</h3>
          <span className="tl-preview-meta">{TODAY.short} 기준</span>
        </header>
        <div className="tl-preview-dash-meter">
          <RadialMeter
            value={87.2}
            label="월 매출 목표 달성률"
            caption="목표 18.2억"
            digits={1}
            size="md"
          />
          <ul className="tl-preview-dash-bullets" role="list">
            {ORDER_FILL.map((o) => (
              <li key={o.label}>
                <BulletBar
                  label={o.label}
                  value={o.value}
                  target={o.target}
                  unit="%"
                  caption={o.caption}
                  size="sm"
                  polarity={o.label.includes('한도') ? 'up-bad' : 'up-good'}
                />
              </li>
            ))}
          </ul>
        </div>
      </article>

      <article className="tl-preview-card tl-preview-dash-full">
        <header className="tl-preview-card-head">
          <h3 className="tl-preview-card-title">거래처 미수 현황</h3>
          <span className="tl-preview-meta">
            원 · 표 안 시각화: 막대(잔액) · 진하기(에이징) · 목표 막대(회수율)
          </span>
        </header>
        <div
          className="tl-preview-scroll"
          tabIndex={0}
          role="region"
          aria-label="거래처 미수 현황 표"
        >
          <table className="tl-preview-table tl-preview-grid tl-preview-recv">
            <thead>
              <tr>
                <th scope="col">거래처</th>
                <th scope="col" className="tl-preview-num">
                  미수 잔액
                </th>
                <th scope="col" className="tl-preview-num">
                  ~30일
                </th>
                <th scope="col" className="tl-preview-num">
                  31~60
                </th>
                <th scope="col" className="tl-preview-num">
                  61~90
                </th>
                <th scope="col" className="tl-preview-num">
                  90일+
                </th>
                <th scope="col">회수율</th>
                <th scope="col">상태</th>
              </tr>
            </thead>
            <tbody>
              {RECEIVABLES.map((r) => (
                <tr key={r.name}>
                  <th scope="row">{r.name}</th>
                  <td className="tl-preview-num">
                    <DataBar
                      value={r.balance}
                      max={maxBalance}
                      width={72}
                      format={man}
                      label="미수 잔액"
                    />
                  </td>
                  {r.aging.map((a, i) => (
                    <td className="tl-preview-heat" key={i}>
                      <HeatCell value={a || null} max={maxAging} format={man} />
                    </td>
                  ))}
                  <td className="tl-preview-recv-rate">
                    <BulletBar
                      label={`${r.name} 회수율`}
                      value={r.rate}
                      target={90}
                      max={110}
                      unit="%"
                      size="sm"
                      showState={false}
                    />
                  </td>
                  <td>
                    {r.state === 'normal' ? (
                      <span className="tl-preview-badge" data-kind="status" data-tone="success">
                        <span className="tl-preview-dot" />
                        정상
                      </span>
                    ) : r.state === 'warn' ? (
                      <span className="tl-preview-badge" data-kind="status" data-tone="warning">
                        <span className="tl-preview-dot" />
                        주의
                      </span>
                    ) : (
                      <span className="tl-preview-badge" data-kind="status" data-tone="danger">
                        <span className="tl-preview-dot" />
                        연체
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <ChartCard
        className="tl-preview-dash-third"
        title="로딩"
        subtitle="높이를 지켜 레이아웃이 뛰지 않는다"
        height={120}
        loading
      />
      <ChartCard
        className="tl-preview-dash-third"
        title="오류"
        subtitle="메시지 + 다시 시도"
        height={120}
        error="매출 집계를 불러오지 못했습니다"
        onRetry={() => undefined}
      />
      <ChartCard
        className="tl-preview-dash-third"
        title="빈 상태"
        subtitle="다음 행동 한 줄"
        height={120}
        empty="기간에 판매가 없습니다. 기간을 넓혀 보세요"
      />
    </div>
  );
}

/* ── 모바일(390) ──────────────────────────────────────────── */
function PhoneCharts() {
  const total = SALES_CHANNELS.reduce((s, c) => s + c.value, 0);
  return (
    <div className="tl-preview-phone" role="group" aria-label="모바일 매출 현황">
      <div className="tl-preview-phone-screen">
        <div className="tl-preview-phone-top">
          <div>
            <strong className="tl-preview-phone-title">매출 현황</strong>
            <span className="tl-preview-meta">10월 · 어제까지</span>
          </div>
          <div className="tl-preview-segment" role="group" aria-label="기간">
            <button type="button" aria-pressed="false">
              주
            </button>
            <button type="button" aria-pressed="true">
              월
            </button>
          </div>
        </div>
        <div className="tl-preview-phone-body tl-preview-phone-charts">
          <div className="tl-preview-phone-kpis">
            {KPIS.slice(0, 2).map((k) => (
              <Kpi k={k} key={k.label} compact />
            ))}
          </div>
          <ChartCard
            title="월별 매출"
            subtitle="원 · 점선은 전년"
            height={150}
            table={monthlyTable}
          >
            <TrendChart
              data={SALES_MONTHLY.slice(-6)}
              x="month"
              series={[
                { key: 'sales', label: '매출', type: 'area' },
                { key: 'prev', label: '전년', dashed: true },
              ]}
              unit="원"
              height={150}
              xFormat={monthLabel}
              yFormat={man}
              ariaLabel="최근 6개월 매출과 전년"
            />
          </ChartCard>
          <section className="tl-preview-card">
            <header className="tl-preview-card-head">
              <h3 className="tl-preview-card-title">채널 구성</h3>
              <span className="tl-preview-meta">{man(total)}원</span>
            </header>
            <SegmentedBar data={SALES_CHANNELS} unit="원" format={man} ariaLabel="채널 구성" />
          </section>
          <ChartCard title="지사별" subtitle="원 · 상위 4곳" height={132} table={branchTable}>
            <BarList
              data={BRANCH_SALES.slice(0, 4)}
              unit="원"
              layout="horizontal"
              height={132}
              format={man}
              ariaLabel="지사별 매출 상위 4곳"
            />
          </ChartCard>
        </div>
        <nav className="tl-preview-tabbar" aria-label="하단 탭">
          <span className="tl-preview-tabbar-item">
            <Icon name="house" />홈
          </span>
          <span className="tl-preview-tabbar-item" aria-current="page">
            <Icon name="chart-bar" />
            현황
          </span>
          <span className="tl-preview-tabbar-item">
            <Icon name="pen-line" />
            결재
          </span>
          <span className="tl-preview-tabbar-item">
            <Icon name="layout-grid" />
            전체
          </span>
        </nav>
      </div>
    </div>
  );
}

/* ── 업무 홈 창에 들어가는 매출 행(월별 매출 콤보 · 지사별 매출) ── */
function HomeSalesRow() {
  return (
    <>
      <ChartCard
        title="월별 매출"
        subtitle="원 · 완료된 12개월 · 점선은 전년"
        legend={[
          { label: '매출', color: 'series-1' },
          { label: '전년', color: 'compare', shape: 'dashed' },
        ]}
        height={180}
        table={monthlyTable}
      >
        <ComboChart
          data={SALES_MONTHLY}
          x="month"
          bars={[{ key: 'sales', label: '매출' }]}
          lines={[{ key: 'prev', label: '전년', dashed: true }]}
          unit="원"
          height={180}
          xFormat={monthLabel}
          yFormat={man}
          ariaLabel="최근 12개월 월별 매출과 전년 같은 달"
        />
      </ChartCard>
      <ChartCard title="지사별 매출" subtitle="원 · 10월" height={180} table={branchTable}>
        <BarList
          data={BRANCH_SALES.slice(0, 5)}
          unit="원"
          layout="horizontal"
          height={180}
          format={man}
          showValues
          ariaLabel="10월 지사별 매출 상위 5곳"
        />
      </ChartCard>
    </>
  );
}

/* ── 섹션(HTML) + 마운트 ──────────────────────────────────── */
const PICKER: [string, string, string][] = [
  ['지금 얼마나?', '숫자 + 작은 추이', 'StatCard + Sparkline'],
  ['시간에 따라 어떻게?', '선·영역', 'TrendChart'],
  ['양과 흐름을 같이?', '막대 + 선(아래 다른 단위)', 'ComboChart'],
  ['범주별로 얼마나?', '막대(가로·세로)', 'BarList'],
  ['전체에서 각각?', '한 줄 막대 · 도넛(≤5)', 'SegmentedBar · Donut'],
  ['날짜마다 얼마나?', '한 색 진하기', 'CalendarHeatmap'],
  ['더하고 빼서?', '워터폴', 'WaterfallChart'],
  ['목표·한도 대비?', '링 하나 · 목표 막대 목록', 'RadialMeter · BulletBar'],
  ['표 안에서 비교?', '칸 안 막대 · 조건부 색', 'DataBar · HeatCell'],
];

export function chartsSection(): string {
  const picker = card(
    'tl-preview-table-card',
    `${cardHead('차트 고르기', '질문 → 형식 → 컴포넌트 · 축은 하나 · 계열 색은 항목에 고정')}
<div class="tl-preview-scroll" tabindex="0" role="region" aria-label="차트 고르기 표"><table class="tl-preview-table"><thead><tr><th scope="col">사용자의 질문</th><th scope="col">형식</th><th scope="col">컴포넌트</th></tr></thead><tbody>${PICKER.map(
      ([q, f, c]) =>
        `<tr><td>${esc(q)}</td><td>${esc(f)}</td><td class="tl-preview-token">${esc(c)}</td></tr>`,
    ).join('')}</tbody></table></div>`,
  );
  return section(
    'charts',
    '차트 · 데이터 시각화',
    `@terracelab/trellis-react/charts ${FACTS.charts}종(Recharts 3 래퍼 + 순수 SVG 게이지). 색은 chart.series 1~5 + compare만, 축은 하나, 모든 차트에 표 대체(표로 보기)`,
    `<div data-mount="charts-dashboard"></div>
<div class="tl-preview-home-row tl-preview-charts-row">
  ${card('tl-preview-phone-panel', `${cardHead('모바일 매출 현황', '390 · 같은 컴포넌트')}<div data-mount="charts-phone"></div>`)}
  ${picker}
</div>`,
  );
}

export function mountCharts(root: ParentNode): void {
  // 쇼케이스 판의 화면 조각도 여기서 붙인다(apps/one은 mountCharts 하나만 부른다)
  mountShowcase(root);
  const dash = root.querySelector('[data-mount="charts-dashboard"]');
  if (dash) createRoot(dash).render(<Dashboard />);
  const phone = root.querySelector('[data-mount="charts-phone"]');
  if (phone) createRoot(phone).render(<PhoneCharts />);
  // 업무 홈 창은 콜라주에도 복제되어 있다 — 전부 마운트
  for (const el of root.querySelectorAll('[data-mount="home-sales"]'))
    createRoot(el).render(<HomeSalesRow />);
}
