// 수요 예측 · 발주 추천 샘플(트랙 G). 품목 · 재고 · 발주는 trade.ts와 같다(현재고 = stockOf, 입고 예정 = 진행 중 발주의 남은 수량).
// 모든 값은 결정적이다. 주별 실적은 수준 × 추세 × 계절 × 흔들림, 예측은 같은 식에서 흔들림을 뺀 값이다.
// 추천 수량은 recommendQty 한 곳에서 계산하고, 화면은 같은 식을 글로 적어 보인다.
import {
  ITEMS,
  itemById,
  PURCHASE_ORDERS,
  stockOf,
  sum,
  TODAY,
  type Item,
  type PurchaseOrder,
} from './trade.js';

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const dayOf = (date: string) => Date.parse(`${date}T00:00:00Z`);
const addDays = (date: string, n: number) => iso(dayOf(date) + n * DAY);
/** 그 주 월요일 */
const mondayOf = (date: string) => addDays(date, -((new Date(dayOf(date)).getUTCDay() + 6) % 7));
/** 1월 1일부터 며칠째(1부터) */
const dayOfYear = (date: string) =>
  Math.round((dayOf(date) - Date.UTC(Number(date.slice(0, 4)), 0, 1)) / DAY) + 1;

/** 이번 주 월요일. 예측 첫 주이고, 실적은 그 전 주까지(마감한 주) */
export const THIS_WEEK = mondayOf(TODAY);
/** 실적 주 수(52주 = 전년 같은 주까지) */
export const WEEKS_BACK = 52;
/** 예측 주 수 */
export const WEEKS_AHEAD = 8;
/** 예측을 돌린 시각(배치) */
export const FORECAST_RAN_AT = `${TODAY} 06:00`;
/** 정확도를 재는 최근 주 수 */
export const BACKTEST_WEEKS = 8;
/** 신뢰 구간 이름(80% 구간: 실적 10건 중 8건이 이 안에 든다) */
export const BAND_LABEL = '80% 구간';

/** 품목별 예측 · 발주 조건. 수준(level)은 이번 주의 계절 전 주당 수요 */
export interface ForecastPlan {
  itemId: string;
  /** 발주할 공급사(PARTIES id) */
  supplierId: string;
  /** 발주에서 입고까지 주 수 */
  leadWeeks: number;
  /** 발주 단위(이 수의 배수로 올린다) */
  orderUnit: number;
  level: number;
  /** 주당 추세(0.003 = 주마다 0.3%) */
  trend: number;
  /** 계절 폭(연말에 가장 높고 6월 말에 가장 낮다) */
  season: number;
  /** 실적 흔들림 폭(비율) */
  noise: number;
}

export const FORECAST_PLANS: readonly ForecastPlan[] = [
  {
    itemId: 'i01',
    supplierId: 'p07',
    leadWeeks: 5,
    orderUnit: 20,
    level: 290,
    trend: 0.003,
    season: 0.18,
    noise: 0.14,
  },
  {
    itemId: 'i02',
    supplierId: 'p08',
    leadWeeks: 6,
    orderUnit: 10,
    level: 40,
    trend: 0.002,
    season: 0.1,
    noise: 0.12,
  },
  {
    itemId: 'i03',
    supplierId: 'p10',
    leadWeeks: 3,
    orderUnit: 50,
    level: 225,
    trend: 0.004,
    season: 0.15,
    noise: 0.15,
  },
  {
    itemId: 'i04',
    supplierId: 'p07',
    leadWeeks: 5,
    orderUnit: 50,
    level: 150,
    trend: 0.002,
    season: 0.12,
    noise: 0.13,
  },
  {
    itemId: 'i05',
    supplierId: 'p08',
    leadWeeks: 6,
    orderUnit: 10,
    level: 20,
    trend: 0.001,
    season: 0.1,
    noise: 0.16,
  },
  {
    itemId: 'i06',
    supplierId: 'p09',
    leadWeeks: 4,
    orderUnit: 1_000,
    level: 3_400,
    trend: 0.002,
    season: 0.08,
    noise: 0.1,
  },
  {
    itemId: 'i07',
    supplierId: 'p05',
    leadWeeks: 2,
    orderUnit: 100,
    level: 1_100,
    trend: 0.001,
    season: 0.06,
    noise: 0.12,
  },
  {
    itemId: 'i08',
    supplierId: 'p09',
    leadWeeks: 4,
    orderUnit: 100,
    level: 230,
    trend: 0.001,
    season: 0.05,
    noise: 0.1,
  },
  {
    itemId: 'i09',
    supplierId: 'p05',
    leadWeeks: 1,
    orderUnit: 1_000,
    level: 2_400,
    trend: 0.001,
    season: 0.06,
    noise: 0.12,
  },
  {
    itemId: 'i10',
    supplierId: 'p05',
    leadWeeks: 1,
    orderUnit: 10,
    level: 14,
    trend: 0,
    season: 0,
    noise: 0.2,
  },
];

export const planOf = (itemId: string) => FORECAST_PLANS.find((p) => p.itemId === itemId)!;

/** 결정적 흔들림 −1~1 */
const jitter = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43_758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};
/** 계절 지수: 1 + 폭 × cos(연말 기준 각도) */
const seasonOf = (p: ForecastPlan, week: string) =>
  1 + p.season * Math.cos((2 * Math.PI * (dayOfYear(week) - 355)) / 365);
/** 주 k(0 = 이번 주, 음수 = 지난 주)의 예측 값(흔들림 없음) */
const modelOf = (p: ForecastPlan, k: number) =>
  p.level * (1 + p.trend) ** k * seasonOf(p, addDays(THIS_WEEK, k * 7));

/** 주별 한 줄. 실적 주는 actual, 예측 주는 forecast · lower · upper가 있다 */
export interface DemandWeek {
  /** 주 시작 월요일(ISO) */
  week: string;
  /** 0 = 이번 주, 음수 = 지난 주 */
  k: number;
  actual: number | null;
  /** 그 주를 미리 예측한 값(실적 주는 정확도 계산용) */
  forecast: number;
  lower: number | null;
  upper: number | null;
}

/** 품목의 주별 수요(실적 WEEKS_BACK주 + 예측 WEEKS_AHEAD주) */
export function demandOf(itemId: string): DemandWeek[] {
  const p = planOf(itemId);
  const i = FORECAST_PLANS.indexOf(p) + 1;
  const out: DemandWeek[] = [];
  for (let k = -WEEKS_BACK; k < WEEKS_AHEAD; k++) {
    const model = modelOf(p, k);
    const week = addDays(THIS_WEEK, k * 7);
    if (k < 0) {
      out.push({
        week,
        k,
        actual: Math.max(0, Math.round(model * (1 + p.noise * jitter(i, k)))),
        forecast: Math.round(model),
        lower: null,
        upper: null,
      });
    } else {
      // 80% 구간: 흔들림 폭에 앞을 볼수록 넓어지는 몫을 더한다
      const spread = model * (p.noise * 0.75 + 0.02 * k);
      out.push({
        week,
        k,
        actual: null,
        forecast: Math.round(model),
        lower: Math.max(0, Math.round(model - spread)),
        upper: Math.round(model + spread),
      });
    }
  }
  return out;
}

const DEMAND = new Map(FORECAST_PLANS.map((p) => [p.itemId, demandOf(p.itemId)]));
export const demandRows = (itemId: string) => DEMAND.get(itemId)!;

/** 예측 정확도(%) = 100 − 판매가 가중 절대 오차율. from주 전부터 weeks주(실적 주만) */
export function accuracyOf(itemIds: readonly string[], weeks = BACKTEST_WEEKS, skip = 0) {
  let err = 0;
  let base = 0;
  for (const id of itemIds) {
    const price = itemById(id).price;
    const rows = demandRows(id).filter((r) => r.k < -skip && r.k >= -skip - weeks);
    for (const r of rows) {
      err += Math.abs((r.actual ?? 0) - r.forecast) * price;
      base += (r.actual ?? 0) * price;
    }
  }
  return base ? Math.round((100 - (err / base) * 100) * 10) / 10 : 0;
}

/** 입고 예정: 진행 중 발주(결재 중 · 발주 · 부분 입고)의 남은 수량. 작성 중 · 완료 · 취소는 뺀다 */
const OPEN_STATES: readonly PurchaseOrder['state'][] = ['approval', 'ordered', 'partial'];
export function incomingOf(itemId: string) {
  return PURCHASE_ORDERS.filter((po) => OPEN_STATES.includes(po.state)).flatMap((po) =>
    po.lines
      .filter((l) => l.itemId === itemId && l.qty > l.received)
      .map((l) => ({
        poId: po.id,
        qty: l.qty - l.received,
        // 기한이 지난 발주는 오늘 들어오는 것으로 본다
        due: po.dueDate < TODAY ? TODAY : po.dueDate,
        state: po.state,
      })),
  );
}

/**
 * 추천 수량 = 리드타임 수요 + 안전재고 − 현재고 − 입고 예정. 0보다 작으면 0, 발주 단위로 올린다.
 * 화면은 이 식을 글로 적어 둔다(추천 근거)
 */
export const recommendQty = (
  leadDemand: number,
  safety: number,
  stock: number,
  incoming: number,
  orderUnit: number,
) => {
  const need = leadDemand + safety - stock - incoming;
  return need <= 0 ? 0 : Math.ceil(need / orderUnit) * orderUnit;
};

export interface Recommendation {
  item: Item;
  plan: ForecastPlan;
  stock: number;
  safety: number;
  incoming: number;
  incomingPos: ReturnType<typeof incomingOf>;
  /** 리드타임 동안 예측 수요(이번 주부터 leadWeeks주 합) */
  leadDemand: number;
  /** 식의 값(올리기 전, 음수면 발주가 필요 없다) */
  need: number;
  qty: number;
  /** 발주 금액(평균 원가 기준, 원) */
  amount: number;
  /** 납기: 입고 예정이 다 들어온 뒤 재고가 안전재고 아래로 내려가는 날. 이미 아래면 내려간 날(지난 날). 없으면 null */
  needBy: string | null;
  /** 품절 예상일(예측 기간 안). 없으면 null */
  stockoutAt: string | null;
  /** 오늘 발주하면 들어오는 날 */
  arriveIfOrdered: string;
  /** 품절 위험: 오늘 발주해도 그 전에 재고가 바닥난다 */
  risk: boolean;
  /** 예측 요인: 최근 8주 평균 실적 · 추세(주당 %) · 계절 지수(리드타임 평균 ÷ 최근 8주) · 80% 구간 폭(%) */
  factors: { recent: number; trendPct: number; seasonIndex: number; bandPct: number };
}

function recommendationOf(p: ForecastPlan): Recommendation {
  const item = itemById(p.itemId);
  const rows = demandRows(p.itemId);
  const ahead = rows.filter((r) => r.k >= 0);
  const leadDemand = sum(ahead.slice(0, p.leadWeeks), (r) => r.forecast);
  const stock = stockOf(p.itemId);
  const incomingPos = incomingOf(p.itemId);
  const incoming = sum(incomingPos, (x) => x.qty);
  const need = leadDemand + item.safetyStock - stock - incoming;
  const qty = recommendQty(leadDemand, item.safetyStock, stock, incoming, p.orderUnit);

  // 하루씩 재고를 굴린다: 입고 예정은 그날 더하고, 그 주 예측의 1/7씩 뺀다
  const lastArrival = incomingPos.reduce((a, x) => (x.due > a ? x.due : a), TODAY);
  let level = stock;
  let needBy: string | null = null;
  let stockoutAt: string | null = null;
  for (let d = 0; d < WEEKS_AHEAD * 7; d++) {
    const date = addDays(TODAY, d);
    level += sum(
      incomingPos.filter((x) => x.due === date),
      (x) => x.qty,
    );
    const week = ahead.find((r) => r.week === mondayOf(date));
    level -= (week?.forecast ?? 0) / 7;
    if (!needBy && date >= lastArrival && level < item.safetyStock) needBy = date;
    if (!stockoutAt && level <= 0) stockoutAt = date;
  }
  const recent = rows.filter((r) => r.k < 0 && r.k >= -BACKTEST_WEEKS);
  const recentAvg = Math.round(sum(recent, (r) => r.actual ?? 0) / recent.length);
  // 이미 안전재고 아래이고 들어올 것이 없으면 내려간 날을 최근 실적으로 거꾸로 센다
  if (stock < item.safetyStock && incoming === 0)
    needBy = addDays(TODAY, -Math.ceil((item.safetyStock - stock) / (recentAvg / 7)));
  const arriveIfOrdered = addDays(TODAY, p.leadWeeks * 7);
  const leadAvg = leadDemand / p.leadWeeks;
  const first = ahead[0]!;
  return {
    item,
    plan: p,
    stock,
    safety: item.safetyStock,
    incoming,
    incomingPos,
    leadDemand,
    need,
    qty,
    amount: qty * item.cost,
    needBy: qty > 0 ? needBy : null,
    stockoutAt,
    arriveIfOrdered,
    risk: stockoutAt !== null && stockoutAt < arriveIfOrdered,
    factors: {
      recent: recentAvg,
      trendPct: Math.round(p.trend * 1000) / 10,
      seasonIndex: Math.round((leadAvg / recentAvg) * 100) / 100,
      bandPct: Math.round((((first.upper ?? 0) - first.forecast) / first.forecast) * 1000) / 10,
    },
  };
}

/** 품목 10종의 추천(품목 순서) */
export const RECOMMENDATIONS: readonly Recommendation[] = FORECAST_PLANS.map(recommendationOf);
export const recommendationFor = (itemId: string) =>
  RECOMMENDATIONS.find((r) => r.item.id === itemId)!;

/** 다음 발주 번호(PO-2611-0045부터). 초안을 만들 때 공급사마다 하나 */
export function nextPoIds(count: number) {
  const prefix = `PO-${TODAY.slice(2, 4)}${TODAY.slice(5, 7)}-`;
  const last = Math.max(
    0,
    ...PURCHASE_ORDERS.filter((p) => p.id.startsWith(prefix)).map((p) =>
      Number(p.id.slice(prefix.length)),
    ),
  );
  return Array.from(
    { length: count },
    (_, i) => `${prefix}${String(last + 1 + i).padStart(4, '0')}`,
  );
}

/** 예측 배치의 단계(이름 · 걸린 시간). 추천 승인 카드 아래에 보인다 */
export const FORECAST_RUN = [
  {
    id: 'load',
    name: '실적 불러오기',
    ms: 1_240,
    detail: `출고 실적 ${WEEKS_BACK}주 · 품목 ${ITEMS.length}종`,
  },
  { id: 'fit', name: '수요 예측', ms: 3_410, detail: `${WEEKS_AHEAD}주 앞 · ${BAND_LABEL}` },
  { id: 'calc', name: '추천 수량 계산', ms: 320, detail: '재고 · 입고 예정 · 리드타임 반영' },
] as const;
