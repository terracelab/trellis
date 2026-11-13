import {
  BarListContract,
  BulletBarContract,
  CalendarHeatmapContract,
  ChartCardContract,
  ComboChartContract,
  DataBarContract,
  DonutContract,
  HeatCellContract,
  LegendContract,
  RadialMeterContract,
  SegmentedBarContract,
  SparklineContract,
  TrendChartContract,
  WaterfallChartContract,
  type ChartCardProps,
  type TrendChartProps,
} from '@terracelab/trellis-contracts';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  BarList,
  BulletBar,
  CalendarHeatmap,
  ChartCard,
  ComboChart,
  DataBar,
  Donut,
  HeatCell,
  Legend,
  RadialMeter,
  SegmentedBar,
  Sparkline,
  TrendChart,
  WaterfallChart,
  buildHeatCells,
  buildWaterfall,
  bulletState,
  chartColor,
  heatCellLevel,
  smoothPath,
} from '../src/charts/index.js';

const MONTHS = [
  { month: '1월', sales: 120, prev: 100, margin: 12.1 },
  { month: '2월', sales: 140, prev: 110, margin: 13.4 },
  { month: '3월', sales: 160, prev: 150, margin: 11.8 },
];

describe('contract parity', () => {
  it('displayName === contract.name', () => {
    const pairs: [{ displayName?: string }, { name: string }][] = [
      [ChartCard, ChartCardContract],
      [TrendChart, TrendChartContract],
      [ComboChart, ComboChartContract],
      [BarList, BarListContract],
      [WaterfallChart, WaterfallChartContract],
      [Donut, DonutContract],
      [SegmentedBar, SegmentedBarContract],
      [CalendarHeatmap, CalendarHeatmapContract],
      [Sparkline, SparklineContract],
      [Legend, LegendContract],
      [RadialMeter, RadialMeterContract],
      [BulletBar, BulletBarContract],
      [DataBar, DataBarContract],
      [HeatCell, HeatCellContract],
    ];
    for (const [c, k] of pairs) expect(c.displayName).toBe(k.name);
  });

  it('웹 props는 contract props를 포함한다(타입)', () => {
    // contract props만으로 호출할 수 있어야 한다(contract ⊆ 웹 props)
    expectTypeOf<TrendChartProps<Record<string, unknown>>>().toMatchTypeOf<
      Parameters<typeof TrendChart<Record<string, unknown>>>[0]
    >();
    expectTypeOf<
      Omit<ChartCardProps, 'title' | 'subtitle' | 'action' | 'children'> & { title: string }
    >().toMatchTypeOf<ComponentProps<typeof ChartCard>>();
  });

  it('contract.props 키 = 인터페이스 키(값 메타 누락 0)', () => {
    for (const c of [TrendChartContract, BulletBarContract, ChartCardContract]) {
      for (const [k, meta] of Object.entries(c.props))
        expect(meta.description, `${c.name}.${k}`).toBeTruthy();
    }
  });
});

describe('색 슬롯', () => {
  it('슬롯 → CSS 변수(hex 없음)', () => {
    expect(chartColor('series-2')).toBe('var(--tl-color-chart-series-2)');
    expect(chartColor('compare')).toBe('var(--tl-color-chart-compare)');
    expect(chartColor('income')).toBe('var(--tl-color-finance-income)');
    expect(chartColor('warning')).toBe('var(--tl-color-status-warning-default)');
  });
});

describe('ChartCard', () => {
  it('제목·부제·범례를 그리고 표로 보기를 토글한다', () => {
    render(
      <ChartCard
        title="판매 추이"
        subtitle="원 · 최근 90일"
        legend={[{ label: '이번 기간', color: 'series-1' }]}
        table={{ columns: ['월', '매출'], rows: [['1월', 120]] }}
      >
        <div data-testid="chart" />
      </ChartCard>,
    );
    expect(screen.getByRole('figure', { name: '판매 추이' })).toBeInTheDocument();
    expect(screen.getByText('원 · 최근 90일')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: '표로 보기' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByTestId('chart')).toBeNull();
    expect(screen.getByRole('button', { name: '차트로 보기' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('상태: loading · error(다시 시도) · empty', () => {
    const { rerender } = render(<ChartCard title="t" loading />);
    expect(screen.getByText('불러오는 중')).toBeInTheDocument();
    let retried = 0;
    rerender(<ChartCard title="t" error="불러오지 못했습니다" onRetry={() => (retried += 1)} />);
    expect(screen.getByRole('status')).toHaveTextContent('불러오지 못했습니다');
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(retried).toBe(1);
    rerender(<ChartCard title="t" empty="기간에 판매가 없습니다" />);
    expect(screen.getByText('기간에 판매가 없습니다')).toBeInTheDocument();
  });
});

describe('Recharts 래퍼', () => {
  it('TrendChart: role=img + aria-label, 계열마다 path', async () => {
    const { container } = render(
      <TrendChart
        data={MONTHS}
        x="month"
        series={[
          { key: 'sales', label: '매출', type: 'area' },
          { key: 'prev', label: '전년', dashed: true },
        ]}
        unit="만원"
        ariaLabel="1~3월 매출 추이"
        endLabel="sales"
      />,
    );
    expect(screen.getByRole('img', { name: '1~3월 매출 추이' })).toBeInTheDocument();
    await waitFor(() => expect(container.querySelectorAll('.recharts-area-curve').length).toBe(1));
    expect(container.querySelectorAll('.recharts-line-curve').length).toBe(1);
    expect(container.querySelector('.recharts-line-curve')?.getAttribute('stroke-dasharray')).toBe(
      '4 4',
    );
    expect(container.querySelector('.recharts-area-curve')?.getAttribute('stroke')).toBe(
      'var(--tl-color-chart-series-1)',
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{6}/i);
  });

  it('ComboChart: 막대 + 점선 + 아래 차트', async () => {
    const { container } = render(
      <ComboChart
        data={MONTHS}
        x="month"
        bars={[{ key: 'sales', label: '매출' }]}
        lines={[{ key: 'prev', label: '전년', dashed: true }]}
        lower={{ series: [{ key: 'margin', label: '마진율' }], unit: '%' }}
        ariaLabel="월별 매출과 마진율"
      />,
    );
    expect(container.querySelectorAll('.recharts-wrapper').length).toBe(2);
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(3),
    );
  });

  it('ComboChart: 아래 차트가 선뿐이어도 점은 위 막대의 가운데에 선다', async () => {
    const { container } = render(
      <ComboChart
        data={MONTHS}
        x="month"
        bars={[{ key: 'sales', label: '매출' }]}
        lower={{ series: [{ key: 'margin', label: '마진율' }], unit: '%' }}
        ariaLabel="월별 매출과 마진율"
      />,
    );
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(3),
    );
    const centres = [...container.querySelectorAll('.recharts-bar-rectangle path')].map(
      (p) => Number(p.getAttribute('x')) + Number(p.getAttribute('width')) / 2,
    );
    // 단조 곡선 경로: M x0,y0 다음 C 마다 마지막 쌍이 다음 점이다
    const d =
      container.querySelector('.tl-combo-chart__lower .recharts-line-curve')?.getAttribute('d') ??
      '';
    const points = [
      Number(/^M([\d.]+),/.exec(d)?.[1]),
      ...[...d.matchAll(/C[^C]*?,([\d.]+),[\d.]+(?=C|$)/g)].map((m) => Number(m[1])),
    ];
    expect(points).toHaveLength(3);
    points.forEach((x, i) => expect(Math.abs(x - centres[i]!)).toBeLessThan(1));
  });

  it('ComboChart: 아래 차트 툴팁은 값 뒤에 단위를 한 번 붙인다(축 서식의 % 와 겹치지 않는다)', async () => {
    const { container } = render(
      <ComboChart
        data={MONTHS}
        x="month"
        bars={[{ key: 'sales', label: '매출' }]}
        lower={{
          series: [{ key: 'margin', label: '마진율' }],
          unit: '%',
          yFormat: (v) => `${Math.round(v)}%`,
        }}
        ariaLabel="월별 매출과 마진율"
      />,
    );
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(3),
    );
    fireEvent.mouseMove(container.querySelectorAll('.recharts-wrapper')[1]!, {
      clientX: 254,
      clientY: 30,
    });
    await waitFor(() => expect(container.querySelector('.tl-chart-tooltip')).not.toBeNull());
    const tip = [...container.querySelectorAll('.tl-chart-tooltip')].map((t) => t.textContent);
    expect(tip.join(' ')).toContain('마진율13.4%');
    expect(tip.join(' ')).not.toContain('%%');
  });

  it('BarList: 가로 레이아웃·값 글자', async () => {
    const { container } = render(
      <BarList
        data={[
          { label: '서울', value: 30 },
          { label: '부산', value: 20 },
        ]}
        layout="horizontal"
        showValues
        ariaLabel="지사별"
      />,
    );
    expect(container.querySelector('.tl-bar-list')?.getAttribute('data-layout')).toBe('horizontal');
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(2),
    );
  });

  it('Donut: 범례에 비율, 0 조각은 그리지 않음', async () => {
    const { container } = render(
      <Donut
        data={[
          { label: 'A', value: 75 },
          { label: 'B', value: 25 },
          { label: 'C', value: 0 },
        ]}
        centerValue="100"
        centerLabel="합계"
        ariaLabel="구성"
      />,
    );
    expect(screen.getByText('75.0%')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelectorAll('.recharts-pie-sector').length).toBe(2));
    expect(screen.getAllByRole('listitem').length).toBe(3);
  });
});

describe('순수 SVG·div', () => {
  it('WaterfallChart: 누계·받침', () => {
    const rows = buildWaterfall([
      { label: '예산', value: 100, kind: 'start' },
      { label: '집행', value: -30, kind: 'delta' },
      { label: '추가', value: 10, kind: 'delta' },
      { label: '잔액', value: 80, kind: 'total' },
    ]);
    expect(rows.map((r) => r.cumulative)).toEqual([100, 70, 80, 80]);
    expect(rows[1]).toMatchObject({ base: 70, size: 30, direction: 'down' });
    expect(rows[2]).toMatchObject({ base: 70, size: 10, direction: 'up' });
    expect(rows[3]).toMatchObject({ base: 0, size: 80 });
    const { container } = render(
      <WaterfallChart
        steps={[
          { label: '예산', value: 100, kind: 'start' },
          { label: '잔액', value: 100, kind: 'total' },
        ]}
        ariaLabel="w"
      />,
    );
    expect(container.querySelector('.tl-waterfall-chart')).toBeInTheDocument();
  });

  it('SegmentedBar: 조각 안에는 글자가 없고 범례가 값·비율을 맡는다', () => {
    const { container, rerender } = render(
      <SegmentedBar
        data={[
          { label: 'A', value: 90 },
          { label: 'B', value: 10 },
          { label: 'C', value: 5 },
        ]}
        legend={false}
        ariaLabel="s"
      />,
    );
    expect(container.querySelectorAll('.tl-segmented-bar__segment').length).toBe(3);
    expect(container.querySelector('.tl-segmented-bar__segment')?.textContent).toBe('');
    expect(container.querySelector('.tl-segmented-bar__segment')?.getAttribute('title')).toContain(
      '85.7%',
    );
    rerender(
      <SegmentedBar
        data={[
          { label: 'A', value: 90 },
          { label: 'B', value: 15 },
        ]}
        ariaLabel="s"
      />,
    );
    expect(screen.getByText('85.7%')).toBeInTheDocument();
  });

  it('CalendarHeatmap: 주 단위로 채우고 단계를 매긴다', () => {
    const { cells, weeks, max } = buildHeatCells([
      { date: '2026-11-03', value: 5 },
      { date: '2026-11-07', value: 10 },
    ]);
    expect(weeks).toBe(1);
    expect(cells.length).toBe(7);
    expect(max).toBe(10);
    expect(cells.find((c) => c.date === '2026-11-03')?.level).toBe(3);
    expect(cells.find((c) => c.date === '2026-11-07')?.level).toBe(5);
    expect(cells.find((c) => c.date === '2026-11-04')?.value).toBeNull();
    const { container } = render(
      <CalendarHeatmap data={[{ date: '2026-11-03', value: 5 }]} ariaLabel="h" />,
    );
    expect(container.querySelector('.tl-calendar-heatmap')?.getAttribute('data-layout')).toBe(
      'month',
    );
  });

  it('Sparkline: 경로와 끝점', () => {
    expect(
      smoothPath([
        [0, 0],
        [10, 10],
      ]),
    ).toMatch(/^M0,0 C/);
    const { container } = render(<Sparkline data={[1, 3, 2, 5]} ariaLabel="추이" />);
    expect(container.querySelector('circle')).toBeInTheDocument();
    expect(container.querySelectorAll('path').length).toBe(2);
  });

  it('RadialMeter: meter 의미', () => {
    render(<RadialMeter value={72.5} label="달성률" digits={1} />);
    const meter = screen.getByRole('meter', { name: '달성률' });
    expect(meter).toHaveAttribute('aria-valuenow', '72.5');
    expect(meter).toHaveAttribute('aria-valuetext', '72.5%');
  });

  it('BulletBar: 상태 계산', () => {
    expect(bulletState(100, 100, 'up-good')).toBe('reached');
    expect(bulletState(92, 100, 'up-good')).toBe('warning');
    expect(bulletState(50, 100, 'up-good')).toBe('default');
    expect(bulletState(101, 100, 'up-bad')).toBe('over');
    expect(bulletState(95, 100, 'up-bad')).toBe('warning');
    render(<BulletBar label="발주 소진" value={95} target={100} unit="%" />);
    expect(screen.getByRole('meter', { name: '발주 소진' })).toHaveAttribute(
      'data-state',
      'warning',
    );
    expect(screen.getByText('주의')).toBeInTheDocument();
  });

  it('DataBar: 경고', () => {
    render(<DataBar value={3} max={100} warnBelow={10} label="재고" />);
    const bar = screen.getByRole('img', { name: /재고 3, 최대 100, 부족/ });
    expect(bar).toHaveAttribute('data-state', 'error');
  });

  it('HeatCell: 단계', () => {
    expect(heatCellLevel(null, 10)).toBe(0);
    expect(heatCellLevel(1, 10)).toBe(1);
    expect(heatCellLevel(10, 10)).toBe(5);
    render(<HeatCell value={7} max={10} unit="건" />);
    expect(screen.getByText('7건')).toHaveAttribute('data-level', '4');
  });

  it('Legend: 모양', () => {
    render(
      <Legend
        items={[
          { label: '이번', color: 'series-1' },
          { label: '전년', color: 'compare', shape: 'dashed' },
        ]}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('data-shape', 'dashed');
  });
});
