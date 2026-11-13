// PG-39 · PG-40: DashboardGrid(배치 편집 · 키보드 옮기기 · 저장) · PeriodPicker 비교 기간 · 표 내보내기 ·
// FunnelChart · ComboChart 3계열 이상 쌓기와 "기타" 접기 · TrendChart 예측
import {
  DashboardGridContract,
  FunnelChartContract,
  type DashboardLayout,
} from '@terracelab/trellis-contracts';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComboChart, FunnelChart, TrendChart } from '../src/charts/index.js';
import {
  DashboardGrid,
  DashboardGridItem,
  downloadCsv,
  Field,
  PeriodPicker,
  type DashboardWidgetWeb,
} from '../src/core/index.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const WIDGETS: DashboardWidgetWeb[] = [
  {
    id: 'sales',
    title: '당월 매출',
    span: 3,
    hideable: false,
    content: <button>매출 상세</button>,
  },
  { id: 'orders', title: '수주 건수', span: 3, content: <p>128건</p> },
  { id: 'stock', title: '재고', span: 6, content: <p>7품목</p> },
];

function Harness({
  initial = [],
  onChange,
}: {
  initial?: DashboardLayout;
  onChange?: (layout: DashboardLayout) => void;
}) {
  const [layout, setLayout] = useState<DashboardLayout>(initial);
  return (
    <DashboardGrid
      label="본사 대시보드"
      widgets={WIDGETS}
      layout={layout}
      onLayoutChange={(next) => {
        setLayout(next);
        onChange?.(next);
      }}
      editing
    />
  );
}

const order = () =>
  [...document.querySelectorAll('[data-widget-id]')].map((el) => el.getAttribute('data-widget-id'));

describe('DashboardGrid', () => {
  it('displayName · 고정 배치는 칸 수를 data-span으로', () => {
    expect(DashboardGrid.displayName).toBe(DashboardGridContract.name);
    const { container } = render(
      <DashboardGrid gap="tight">
        <DashboardGridItem span={4}>a</DashboardGridItem>
        <DashboardGridItem span={8} rows={2}>
          b
        </DashboardGridItem>
      </DashboardGrid>,
    );
    const root = container.querySelector('.tl-dashboard-grid')!;
    expect(root).toHaveAttribute('data-gap', 'tight');
    expect(root).not.toHaveAttribute('role');
    const items = root.querySelectorAll('.tl-dashboard-grid__item');
    expect([...items].map((i) => i.getAttribute('data-span'))).toEqual(['4', '8']);
    expect(items[1]).toHaveAttribute('data-rows', '2');
  });

  it('보기 모드: 배치 순서대로, 숨긴 위젯은 그리지 않는다 · 편집 줄 없음', () => {
    render(
      <DashboardGrid
        widgets={WIDGETS}
        defaultLayout={[{ id: 'stock' }, { id: 'orders', hidden: true }]}
      />,
    );
    expect(order()).toEqual(['stock', 'sales']);
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.queryByRole('button', { name: /위치 옮기기/ })).toBeNull();
    expect(screen.getByRole('button', { name: '매출 상세' })).toBeInTheDocument();
  });

  it('편집 모드: 목록 · 항목, 내용은 inert, 첫 위젯의 앞으로 단추는 비활성', () => {
    render(<Harness />);
    const list = screen.getByRole('list', { name: '본사 대시보드' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(
      document.querySelector('[data-widget-id="sales"] .tl-dashboard-grid__content'),
    ).toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: '당월 매출 앞으로 옮기기' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '재고 뒤로 옮기기' })).toBeDisabled();
    // 숨길 수 없는 위젯은 숨기기 단추가 없다
    expect(screen.queryByRole('button', { name: '당월 매출 숨기기' })).toBeNull();
    expect(
      screen.getByRole('button', { name: '당월 매출 위치 옮기기' }),
    ).toHaveAccessibleDescription(/화살표 키로 순서를 바꿉니다/);
  });

  it('손잡이에서 화살표 · Home · End로 옮기고, 포커스가 따라가고, 알림 영역이 읽는다', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const handle = screen.getByRole('button', { name: '당월 매출 위치 옮기기' });
    handle.focus();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(order()).toEqual(['orders', 'sales', 'stock']);
    expect(onChange).toHaveBeenLastCalledWith([{ id: 'orders' }, { id: 'sales' }, { id: 'stock' }]);
    expect(screen.getByRole('status')).toHaveTextContent(
      '당월 매출 위젯을 2번째로 옮겼습니다. 전체 3개',
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: '당월 매출 위치 옮기기' }),
      ),
    );
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(order()).toEqual(['orders', 'stock', 'sales']);
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(order()).toEqual(['sales', 'orders', 'stock']);
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('앞뒤 단추: 끝에 닿아 단추가 비활성이 되면 포커스는 손잡이로', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: '수주 건수 앞으로 옮기기' }));
    expect(order()).toEqual(['orders', 'sales', 'stock']);
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: '수주 건수 위치 옮기기' }),
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: '수주 건수 뒤로 옮기기' }));
    expect(order()).toEqual(['sales', 'orders', 'stock']);
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: '수주 건수 뒤로 옮기기' }),
      ),
    );
  });

  it('숨기기 → 접힌 칸 + 보이기, 보이기 → 다시 내용', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '재고 숨기기' }));
    expect(onChange).toHaveBeenLastCalledWith([
      { id: 'sales' },
      { id: 'orders' },
      { id: 'stock', hidden: true },
    ]);
    const item = document.querySelector('[data-widget-id="stock"]')!;
    expect(item).toHaveAttribute('data-hidden');
    expect(item.querySelector('.tl-dashboard-grid__content')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('재고 위젯을 숨겼습니다');
    // 접힌 칸 손잡이 이름에 보이는 "숨김"이 들어 있다
    expect(screen.getByRole('button', { name: '재고 숨김 위치 옮기기' })).toBeInTheDocument();
    const show = screen.getByRole('button', { name: '재고 보이기' });
    await waitFor(() => expect(document.activeElement).toBe(show));
    fireEvent.click(show);
    expect(screen.getByText('7품목')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('재고 위젯을 다시 표시했습니다');
  });
});

describe('PeriodPicker 비교 기간', () => {
  it('compare가 없으면 비교 줄이 없다(지금과 같다)', async () => {
    render(
      <Field label="조회 기간">
        <PeriodPicker today="2026-11-07" defaultValue={{ from: '2026-11-01', to: '2026-11-30' }} />
      </Field>,
    );
    fireEvent.click(screen.getByRole('button', { name: '조회 기간' }));
    const dialog = await screen.findByRole('dialog', { name: '기간 선택' });
    expect(within(dialog).queryByRole('group', { name: '비교' })).toBeNull();
  });

  it('트리거에 비교 기간, 전년 동기로 바꿔 적용하면 onCompareChange', async () => {
    const onCompareChange = vi.fn();
    render(
      <PeriodPicker
        label="매출 기간"
        today="2026-11-07"
        defaultValue={{ from: '2026-11-01', to: '2026-11-30' }}
        defaultCompare={{ mode: 'previous', from: '2026-10-01', to: '2026-10-31' }}
        onCompareChange={onCompareChange}
      />,
    );
    const trigger = screen.getByRole('button', {
      name: '매출 기간 2026-11-01~11-30 비교 2026-10-01~10-31',
    });
    expect(trigger).toHaveTextContent('비교 2026-10-01~10-31');
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: '기간 선택' });
    const group = within(dialog).getByRole('group', { name: '비교' });
    expect(within(group).getByRole('button', { name: '직전 기간' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(within(group).getByRole('button', { name: '전년 동기' }));
    expect(group).toHaveTextContent('2025-11-01~11-30');
    fireEvent.click(within(dialog).getByRole('button', { name: '적용' }));
    expect(onCompareChange).toHaveBeenCalledWith({
      mode: 'lastYear',
      from: '2025-11-01',
      to: '2025-11-30',
    });
  });

  it('프리셋으로 기간을 바꾸면 직전 기간도 다시 계산한다', async () => {
    const onChange = vi.fn();
    const onCompareChange = vi.fn();
    render(
      <PeriodPicker
        label="기간"
        today="2026-11-07"
        defaultValue={{ from: '2026-11-01', to: '2026-11-30' }}
        defaultCompare={{ mode: 'previous', from: '2026-10-01', to: '2026-10-31' }}
        onChange={onChange}
        onCompareChange={onCompareChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /^기간 / }));
    const dialog = await screen.findByRole('dialog', { name: '기간 선택' });
    fireEvent.click(within(dialog).getByRole('button', { name: /^당분기/ }));
    expect(onChange).toHaveBeenCalledWith({ from: '2026-10-01', to: '2026-12-31' });
    expect(onCompareChange).toHaveBeenCalledWith({
      mode: 'previous',
      from: '2026-07-01',
      to: '2026-09-30',
    });
  });

  it('직접 선택: 비교 종료일이 앞이면 오류와 적용 막기, 안 함은 null', async () => {
    const onCompareChange = vi.fn();
    render(
      <PeriodPicker
        label="기간"
        today="2026-11-07"
        defaultValue={{ from: '2026-11-01', to: '2026-11-30' }}
        defaultCompare={null}
        onCompareChange={onCompareChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /^기간 / }));
    const dialog = await screen.findByRole('dialog', { name: '기간 선택' });
    const group = within(dialog).getByRole('group', { name: '비교' });
    expect(within(group).getByRole('button', { name: '안 함' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(within(group).getByRole('button', { name: '직접 선택' }));
    fireEvent.change(within(group).getByLabelText('비교 시작일'), {
      target: { value: '20261020' },
    });
    fireEvent.change(within(group).getByLabelText('비교 종료일'), {
      target: { value: '20261005' },
    });
    expect(within(group).getByRole('alert')).toHaveTextContent('종료일은 시작일 이후여야 합니다');
    expect(within(dialog).getByRole('button', { name: '적용' })).toBeDisabled();
    fireEvent.change(within(group).getByLabelText('비교 종료일'), {
      target: { value: '20261031' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: '적용' }));
    expect(onCompareChange).toHaveBeenLastCalledWith({
      mode: 'custom',
      from: '2026-10-20',
      to: '2026-10-31',
    });
  });
});

describe('downloadCsv', () => {
  it('BOM이 붙은 CSV Blob을 이름_날짜.csv로 내려받는다', async () => {
    let blob: Blob | undefined;
    const create = vi.fn((b: Blob) => {
      blob = b;
      return 'blob:x';
    });
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    let name = '';
    click.mockImplementation(function (this: HTMLAnchorElement) {
      name = this.download;
    });
    downloadCsv({
      name: '매출 분석',
      date: '2026-11-06',
      rows: [{ month: '11월', sales: 1_284_000 }],
      columns: [
        { label: '월', value: 'month' },
        { label: '매출(원)', value: 'sales' },
      ],
    });
    expect(name).toBe('매출 분석_2026-11-06.csv');
    expect(blob?.type).toBe('text/csv;charset=utf-8');
    const bytes = new Uint8Array(await blob!.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes.slice(3))).toBe('월,매출(원)\r\n11월,1284000\r\n');
    expect(document.querySelector('a[download]')).toBeNull();
  });
});

describe('FunnelChart', () => {
  const DATA = [
    { label: '문의', value: 480 },
    { label: '견적', value: 212 },
    { label: '협상', value: 96 },
    { label: '계약', value: 30 },
  ];

  it('role=img · 단계 줄 · 앞 단계 대비 · 요약 줄, hex 없음', () => {
    expect(FunnelChart.displayName).toBe(FunnelChartContract.name);
    const { container } = render(<FunnelChart data={DATA} unit="건" ariaLabel="영업 단계" />);
    expect(screen.getByRole('img', { name: '영업 단계' })).toBeInTheDocument();
    const rows = container.querySelectorAll('.tl-funnel-chart__row');
    expect(rows).toHaveLength(4);
    expect(rows[1]).toHaveTextContent('견적212');
    expect(rows[1]).toHaveTextContent('44.2%');
    expect(rows[0]!.querySelectorAll('.tl-funnel-chart__rate')[0]).toHaveTextContent('');
    expect(container.querySelector('.tl-funnel-chart__summary')).toHaveTextContent(
      '문의에서 계약까지 전환율 6.3%',
    );
    const bar = rows[0]!.querySelector<HTMLElement>('.tl-funnel-chart__bar')!;
    expect(bar.style.width).toBe('100%');
    expect(bar.style.background).toBe('var(--tl-color-chart-series-1)');
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{6}/i);
  });

  it('conversion both · 값 0은 막대 없음 · 요약 끄기 · 빈 데이터', () => {
    const { container, rerender } = render(
      <FunnelChart
        data={[...DATA, { label: '해지', value: 0 }]}
        conversion="both"
        summary={false}
        ariaLabel="단계"
      />,
    );
    expect(container.querySelector('.tl-funnel-chart')).toHaveAttribute('data-conversion', 'both');
    expect(container.querySelector('.tl-funnel-chart__head')).toHaveTextContent(
      '전 단계 대비누적 전환율',
    );
    const last = container.querySelectorAll('.tl-funnel-chart__row')[4]!;
    expect(last.querySelector('.tl-funnel-chart__bar')).toBeNull();
    expect(container.querySelector('.tl-funnel-chart__summary')).toBeNull();
    rerender(<FunnelChart data={[]} ariaLabel="단계" />);
    expect(screen.getByText('데이터 없음')).toBeInTheDocument();
  });
});

describe('ComboChart 쌓기', () => {
  const months = ['9월', '10월', '11월'];

  it('3계열 쌓기: 범주마다 막대 3조각, 나란히 경고 없음', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data = months.map((month, i) => ({ month, a: 10 + i, b: 20 + i, c: 5 + i }));
    const { container } = render(
      <ComboChart
        data={data}
        x="month"
        stacked
        bars={[
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
          { key: 'c', label: 'C' },
        ]}
        ariaLabel="채널별"
      />,
    );
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(9),
    );
    expect(container.querySelector('.tl-combo-chart')).toHaveAttribute('data-stacked', 'true');
    expect(warn).not.toHaveBeenCalled();
  });

  it('7계열이면 앞 5개 + 기타(compare) 하나로 접는다', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const data = months.map((month) => ({ month, ...Object.fromEntries(keys.map((k) => [k, 3])) }));
    const { container } = render(
      <ComboChart
        data={data}
        x="month"
        stacked
        bars={keys.map((k) => ({ key: k, label: k }))}
        ariaLabel="분류별"
      />,
    );
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(18),
    );
    const fills = [...container.querySelectorAll('.recharts-bar-rectangle path')].map((p) =>
      p.getAttribute('fill'),
    );
    expect(new Set(fills)).toEqual(
      new Set([
        'var(--tl-color-chart-series-1)',
        'var(--tl-color-chart-series-2)',
        'var(--tl-color-chart-series-3)',
        'var(--tl-color-chart-series-4)',
        'var(--tl-color-chart-series-5)',
        'var(--tl-color-chart-compare)',
      ]),
    );
  });

  it('나란한 막대 3개는 개발 경고', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <ComboChart
        data={[{ m: '1월', a: 1, b: 2, c: 3 }]}
        x="m"
        bars={[
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
          { key: 'c', label: 'C' },
        ]}
        ariaLabel="나란히"
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('나란한 막대'));
  });
});

describe('TrendChart 예측', () => {
  it('실적 실선 + 예측 점선 + 신뢰 구간 면 + 시작 세로선', async () => {
    const data = Array.from({ length: 8 }, (_, i) => ({
      week: `${i + 1}주`,
      qty: 100 + i * 5,
      lo: i >= 5 ? 90 + i * 5 : null,
      hi: i >= 5 ? 110 + i * 5 : null,
    }));
    const { container } = render(
      <TrendChart
        data={data}
        x="week"
        series={[{ key: 'qty', label: '판매량' }]}
        forecast={{ from: 5, lower: 'lo', upper: 'hi' }}
        ariaLabel="주별 판매량과 예측"
      />,
    );
    expect(container.querySelector('.tl-trend-chart')).toHaveAttribute('data-forecast', 'true');
    await waitFor(() => expect(container.querySelectorAll('.recharts-line-curve').length).toBe(2));
    const [actual, forecast] = [...container.querySelectorAll('.recharts-line-curve')];
    expect(actual!.getAttribute('stroke-dasharray')).toBeNull();
    expect(forecast!.getAttribute('stroke-dasharray')).toBe('4 4');
    expect(forecast!.getAttribute('stroke')).toBe('var(--tl-color-chart-series-1)');
    expect(container.querySelectorAll('.recharts-area-area').length).toBe(1);
    expect(container.querySelector('.recharts-reference-line')).not.toBeNull();
    expect(container.innerHTML).not.toMatch(/#[0-9a-f]{6}/i);
  });

  it('forecast가 없으면 지금과 같다', async () => {
    const { container } = render(
      <TrendChart
        data={[
          { m: '1월', v: 1 },
          { m: '2월', v: 2 },
        ]}
        x="m"
        series={[{ key: 'v', label: '값' }]}
        ariaLabel="값"
      />,
    );
    expect(container.querySelector('.tl-trend-chart')).not.toHaveAttribute('data-forecast');
    await waitFor(() => expect(container.querySelectorAll('.recharts-line-curve').length).toBe(1));
    expect(container.querySelector('.recharts-reference-line')).toBeNull();
  });
});
