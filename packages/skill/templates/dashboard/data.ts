// 대시보드 샘플 데이터. 서비스 데이터로 바꿀 자리는 이 파일 하나다.
// useDashboardData가 돌려주는 모양(data · loading · error · reload)은 두고, 안쪽에서 서비스 API를 부른다.
import { useCallback, useState } from 'react';

export type Period = 'month' | 'ytd';

export type MonthRow = {
  /** 2026-11 */
  month: string;
  /** 축 글자 */
  label: string;
  sales: number;
  /** 전년 같은 달 */
  prevSales: number;
  orders: number;
};

export type Party = {
  id: string;
  name: string;
  manager: string;
  /** 전체 매출에서 차지하는 몫(0~1) */
  share: number;
  /** 전년 같은 기간 대비 증감(0.12 = 12% 증가) */
  growth: number;
  status: 'active' | 'paused';
};

export type DashboardData = {
  /** 기준일(ISO) */
  asOf: string;
  months: MonthRow[];
  parties: Party[];
};

const SALES = [612, 588, 655, 701, 689, 734, 752, 718, 781, 806, 842];
const PREV = [561, 547, 583, 612, 640, 655, 671, 663, 690, 702, 731];
const ORDERS = [318, 301, 334, 352, 347, 369, 381, 362, 390, 404, 421];

const SAMPLE: DashboardData = {
  asOf: '2026-11-06',
  months: SALES.map((v, i) => ({
    month: `2026-${String(i + 1).padStart(2, '0')}`,
    label: `${i + 1}월`,
    sales: v * 1_000_000,
    prevSales: PREV[i]! * 1_000_000,
    orders: ORDERS[i]!,
  })),
  parties: [
    {
      id: 'p01',
      name: '대양상사',
      manager: '김서연',
      share: 0.24,
      growth: 0.124,
      status: 'active',
    },
    {
      id: 'p02',
      name: '한결물산',
      manager: '이도윤',
      share: 0.18,
      growth: 0.098,
      status: 'active',
    },
    {
      id: 'p03',
      name: '누리식품',
      manager: '김서연',
      share: 0.15,
      growth: 0.151,
      status: 'active',
    },
    {
      id: 'p04',
      name: '새봄유통',
      manager: '박지호',
      share: 0.12,
      growth: 0.043,
      status: 'active',
    },
    {
      id: 'p05',
      name: '동림푸드',
      manager: '최하린',
      share: 0.1,
      growth: -0.062,
      status: 'active',
    },
    {
      id: 'p06',
      name: '가온마트',
      manager: '이도윤',
      share: 0.09,
      growth: 0.207,
      status: 'active',
    },
    {
      id: 'p07',
      name: '서해통상',
      manager: '박지호',
      share: 0.07,
      growth: -0.185,
      status: 'paused',
    },
    {
      id: 'p08',
      name: '미래상회',
      manager: '최하린',
      share: 0.05,
      growth: 0.031,
      status: 'active',
    },
  ],
};

/** 받기 전의 값. 달 · 거래처가 없어도 화면 계산은 그대로 돈다 */
export const EMPTY: DashboardData = { asOf: '', months: [], parties: [] };

type State = { data: DashboardData; loading: boolean; error: string | null };

/**
 * 화면이 쓰는 데이터. 샘플은 바로 돌려준다.
 * 서비스에서는 처음 값을 { data: EMPTY, loading: true, error: null }로 두고 API 응답으로 바꾼다.
 * 실패하면 error에 보여 줄 문장을 넣고, reload가 다시 부른다.
 */
export function useDashboardData(): State & { reload: () => void } {
  const [state, setState] = useState<State>({ data: SAMPLE, loading: false, error: null });
  const reload = useCallback(() => setState({ data: SAMPLE, loading: false, error: null }), []);
  return { ...state, reload };
}

const pct = (now: number, prev: number) =>
  prev ? Math.round(((now - prev) / prev) * 1000) / 10 : 0;

/** 고른 기간의 숫자와 거래처 행. 달이 없어도(받기 전) 0으로 돈다 */
export function summarize({ months, parties }: DashboardData, period: Period) {
  const last = months[months.length - 1];
  const sum = (pick: (m: MonthRow) => number) => months.reduce((a, m) => a + pick(m), 0);
  const month = { sales: last?.sales ?? 0, prev: last?.prevSales ?? 0, orders: last?.orders ?? 0 };
  const ytd = {
    sales: sum((m) => m.sales),
    prev: sum((m) => m.prevSales),
    orders: sum((m) => m.orders),
  };
  const now = period === 'month' ? month : ytd;
  const range = months.length ? `${months[0]!.label.replace('월', '')}~${last!.label}` : '';
  const rows = parties.map((p) => {
    const sales = Math.round((now.sales * p.share) / 1000) * 1000;
    return {
      id: p.id,
      name: p.name,
      manager: p.manager,
      status: p.status,
      orders: Math.round(now.orders * p.share),
      sales,
      prevSales: Math.round(sales / (1 + p.growth) / 1000) * 1000,
      share: Math.round(p.share * 1000) / 10,
      delta: Math.round(p.growth * 1000) / 10,
    };
  });
  return {
    month,
    ytd,
    now,
    rows,
    /** 이번 달 이름(11월) · 누계 범위(1~11월) · 고른 기간 이름 */
    monthLabel: last?.label ?? '',
    range,
    label: period === 'month' ? (last?.label ?? '') : `${range} 누계`,
    delta: { month: pct(month.sales, month.prev), ytd: pct(ytd.sales, ytd.prev) },
    /** 주문 한 건의 평균 금액 */
    average: now.orders ? Math.round(now.sales / now.orders / 1000) * 1000 : 0,
  };
}

export type PartyRow = ReturnType<typeof summarize>['rows'][number];
