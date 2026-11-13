// PG-39 · PG-40 순수 함수: CSV 내보내기 · 위젯 배치 · 비교 기간 · 깔때기 전환율 · "기타" 접기
import { describe, expect, it } from 'vitest';
import {
  CSV_BOM,
  csvCell,
  csvFileName,
  dashboardLayoutOf,
  foldSeries,
  funnelSteps,
  moveDashboardWidget,
  OTHER_SERIES_KEY,
  resolvePeriodCompare,
  setDashboardWidgetHidden,
  toCsv,
} from '../src/index.js';

describe('toCsv', () => {
  const rows = [
    {
      no: 'SO-001',
      vendor: '한빛상사',
      supply: 1_234_000,
      date: '2026-11-03',
      memo: '쉼표, 따옴표 "있음"',
    },
    { no: 'SO-002', vendor: '세원물산', supply: -50_000, date: '2026-11-04', memo: '' },
  ];
  const csv = toCsv(rows, [
    { label: '주문번호', value: 'no' },
    { label: '거래처', value: 'vendor' },
    { label: '공급가액(원)', value: 'supply' },
    { label: '주문일', value: 'date' },
    { label: '메모', value: (r) => r.memo },
  ]);

  it('UTF-8 BOM으로 시작하고 CRLF로 줄을 나눈다', () => {
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(csv.slice(1).split('\r\n')).toEqual([
      '주문번호,거래처,공급가액(원),주문일,메모',
      'SO-001,한빛상사,1234000,2026-11-03,"쉼표, 따옴표 ""있음"""',
      'SO-002,세원물산,-50000,2026-11-04,',
      '',
    ]);
  });

  it('금액은 쉼표 · U+2212 없는 숫자', () => {
    expect(csv).not.toContain('1,234,000');
    expect(csv).not.toContain('−');
  });

  it('수식으로 시작하는 글자는 막고 숫자 · 빈 값 표시는 그대로', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`'=HYPERLINK("x")`);
    expect(csvCell('+82')).toBe(`'+82`);
    expect(csvCell('-')).toBe('-');
    expect(csvCell(-3)).toBe('-3');
    expect(csvCell('=1', false)).toBe('=1');
    expect(csvCell(null)).toBe('');
    expect(csvCell(Number.NaN)).toBe('');
    expect(csvCell(true)).toBe('TRUE');
    expect(csvCell(new Date(2026, 10, 7))).toBe('2026-11-07');
  });

  it('옵션: BOM 없이 · LF', () => {
    expect(toCsv([{ a: 1 }], [{ label: 'a', value: 'a' }], { bom: false, eol: '\n' })).toBe(
      'a\n1\n',
    );
  });

  it('파일 이름: 이름_날짜.csv, 못 쓰는 글자는 뺀다', () => {
    expect(csvFileName('매출 분석', '2026-11-06')).toBe('매출 분석_2026-11-06.csv');
    expect(csvFileName('a/b:c')).toBe('abc.csv');
  });
});

describe('대시보드 배치', () => {
  const widgets = [{ id: 'kpi', hideable: false }, { id: 'sales' }, { id: 'stock' }, { id: 'new' }];

  it('저장한 순서를 지키고, 없어진 위젯은 빼고, 새 위젯은 뒤에', () => {
    const saved = [
      { id: 'stock' },
      { id: 'gone', hidden: true },
      { id: 'sales', hidden: true },
      { id: 'kpi' },
    ];
    expect(dashboardLayoutOf(widgets, saved)).toEqual([
      { id: 'stock' },
      { id: 'sales', hidden: true },
      { id: 'kpi' },
      { id: 'new' },
    ]);
  });

  it('숨길 수 없는 위젯은 저장값이 숨김이어도 보인다 · 중복은 한 번', () => {
    expect(dashboardLayoutOf(widgets, [{ id: 'kpi', hidden: true }, { id: 'kpi' }])[0]).toEqual({
      id: 'kpi',
    });
    expect(dashboardLayoutOf(widgets)).toHaveLength(4);
  });

  it('옮기기 · 숨기기는 새 배열을 돌려준다', () => {
    const base = dashboardLayoutOf(widgets);
    const moved = moveDashboardWidget(base, 'kpi', 2);
    expect(moved.map((i) => i.id)).toEqual(['sales', 'stock', 'kpi', 'new']);
    expect(moveDashboardWidget(base, 'new', -5).map((i) => i.id)[0]).toBe('new');
    expect(
      moveDashboardWidget(base, 'kpi', 99)
        .map((i) => i.id)
        .at(-1),
    ).toBe('kpi');
    expect(base.map((i) => i.id)).toEqual(['kpi', 'sales', 'stock', 'new']);
    expect(setDashboardWidgetHidden(base, 'sales', true)[1]).toEqual({ id: 'sales', hidden: true });
    expect(setDashboardWidgetHidden(base, 'sales', false)[1]).toEqual({ id: 'sales' });
  });
});

describe('resolvePeriodCompare', () => {
  it('직전: 달 단위 기간은 앞 달들, 나머지는 같은 일수만큼 앞', () => {
    expect(resolvePeriodCompare({ from: '2026-11-01', to: '2026-11-30' }, 'previous')).toEqual({
      from: '2026-10-01',
      to: '2026-10-31',
    });
    expect(resolvePeriodCompare({ from: '2026-01-01', to: '2026-03-31' }, 'previous')).toEqual({
      from: '2025-10-01',
      to: '2025-12-31',
    });
    expect(resolvePeriodCompare({ from: '2026-03-01', to: '2026-03-31' }, 'previous')).toEqual({
      from: '2026-02-01',
      to: '2026-02-28',
    });
    expect(resolvePeriodCompare({ from: '2026-11-02', to: '2026-11-08' }, 'previous')).toEqual({
      from: '2026-10-26',
      to: '2026-11-01',
    });
  });

  it('전년 동기: 같은 날짜, 달 끝은 달 끝, 2월 29일은 28일', () => {
    expect(resolvePeriodCompare({ from: '2026-11-01', to: '2026-11-06' }, 'lastYear')).toEqual({
      from: '2025-11-01',
      to: '2025-11-06',
    });
    expect(resolvePeriodCompare({ from: '2025-02-01', to: '2025-02-28' }, 'lastYear')).toEqual({
      from: '2024-02-01',
      to: '2024-02-29',
    });
    expect(resolvePeriodCompare({ from: '2028-02-29', to: '2028-03-10' }, 'lastYear')).toEqual({
      from: '2027-02-28',
      to: '2027-03-10',
    });
  });
});

describe('funnelSteps', () => {
  it('앞 단계 대비 · 첫 단계 대비 · 이탈', () => {
    const steps = funnelSteps([
      { label: '문의', value: 480 },
      { label: '견적', value: 212 },
      { label: '협상', value: 96 },
      { label: '계약', value: 30 },
    ]);
    expect(steps.map((s) => s.rate)).toEqual([null, 44.2, 45.3, 31.3]);
    expect(steps.map((s) => s.overall)).toEqual([100, 44.2, 20, 6.3]);
    expect(steps.map((s) => s.drop)).toEqual([0, 268, 116, 66]);
  });

  it('0으로 나누지 않는다', () => {
    const steps = funnelSteps([
      { label: 'a', value: 0 },
      { label: 'b', value: 0 },
    ]);
    expect(steps[1]).toMatchObject({ rate: null, overall: null });
    expect(funnelSteps([])).toEqual([]);
  });
});

describe('foldSeries', () => {
  const series = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((k) => ({
    key: k,
    label: k.toUpperCase(),
  }));
  const data = [{ m: '1월', a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 }];

  it('다섯 이하면 그대로', () => {
    const r = foldSeries(data, series.slice(0, 5), { label: '기타' });
    expect(r.series).toHaveLength(5);
    expect(r.folded).toEqual([]);
    expect(r.data).toBe(data);
  });

  it('여섯 이상이면 앞 다섯 + 기타(compare), 기타 값은 나머지 합', () => {
    const r = foldSeries(data, series, { label: '기타' });
    expect(r.series.map((s) => s.key)).toEqual(['a', 'b', 'c', 'd', 'e', OTHER_SERIES_KEY]);
    expect(r.series.at(-1)).toMatchObject({ label: '기타', color: 'compare' });
    expect(r.folded.map((s) => s.key)).toEqual(['f', 'g']);
    expect(r.data[0]![OTHER_SERIES_KEY]).toBe(13);
  });
});
