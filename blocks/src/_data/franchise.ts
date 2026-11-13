// 가맹점 샘플(트랙 G). 샘플 회사(PROFILE)가 운영하는 가상의 외식 가맹 브랜드 하나와 매장 19곳.
// 매장 이름은 지역 이름 + "점"이다. 실제 브랜드 이름은 쓰지 않는다. 모든 값은 결정적이다.
// 일 매출 = 계획 일 매출 × 지금 성과(주마다 조금씩 바뀐다) × 요일 × 계절 × 개점 직후 가산 × 흔들림.
// 초도 물량 품목 · 공급가는 trade.ts 품목(판매 단가 = 가맹 공급가)을 그대로 쓴다.
import type { ChecklistState, StatusTone } from '@terracelab/trellis-contracts';
import { personLabel } from './profile.js';
import { itemById, TODAY, type Item } from './trade.js';

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const dayOf = (date: string) => Date.parse(`${date}T00:00:00Z`);
const addDays = (date: string, n: number) => iso(dayOf(date) + n * DAY);
const between = (a: string, b: string) => Math.round((dayOf(b) - dayOf(a)) / DAY);
const mondayOf = (date: string) => addDays(date, -((new Date(dayOf(date)).getUTCDay() + 6) % 7));
const dayOfYear = (date: string) =>
  Math.round((dayOf(date) - Date.UTC(Number(date.slice(0, 4)), 0, 1)) / DAY) + 1;

/** 가맹 브랜드(샘플 회사가 본부) */
export const FRANCHISE = {
  brand: '테라키친',
  /** 메뉴 성격(화면 설명 한 줄) */
  concept: '해산물 파스타 · 그릴',
  /** 본부 부서 */
  hq: '가맹사업팀',
};

/** 매출 마감일: 전날까지(당일 매출은 밤 정산 뒤 들어온다) */
export const SALES_THROUGH = addDays(TODAY, -1);

export const REGIONS = ['서울', '경기', '인천', '부산', '대구', '대전 · 충청'] as const;
export type Region = (typeof REGIONS)[number];

/** 상권 유형: 회전율(하루 좌석 회전 수) · 포장 비율(손님 중 포장 · 배달) */
export const AREA_TYPES = {
  office: { label: '오피스', turnover: 2.6, takeout: 0.2 },
  residential: { label: '주거', turnover: 2.2, takeout: 0.4 },
  station: { label: '역세권', turnover: 3.2, takeout: 0.25 },
  campus: { label: '대학가', turnover: 3.0, takeout: 0.3 },
  mall: { label: '쇼핑몰', turnover: 3.4, takeout: 0.15 },
} as const;
export type AreaType = keyof typeof AREA_TYPES;

/** 매장 상태(점 · 글자). 주의 = 목표 대비 WATCH_RATIO 미만이 최근 2주 연속 */
export const STORE_STATES = {
  open: { label: '정상', tone: 'success' },
  watch: { label: '주의', tone: 'warning' },
  preparing: { label: '개점 준비', tone: 'info' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type StoreState = keyof typeof STORE_STATES;
export const WATCH_RATIO = 0.85;

export interface Store {
  id: string;
  name: string;
  region: Region;
  areaType: AreaType;
  /** 개점일(개점 준비 매장은 개점 예정일) */
  openedAt: string;
  seats: number;
  /** 면적(㎡) */
  area: number;
  /** 계획 일 매출(원) = 목표의 하루 몫 */
  plan: number;
  /** 지금 성과(계획 대비, 1 = 계획대로) */
  perf: number;
  /** 한 주 앞으로 갈수록 성과가 이만큼 높았다(주의 매장은 내려오는 중) */
  slope: number;
  /** 본부 담당(사용자 id) */
  supervisorId: string;
}

export const STORES: readonly Store[] = [
  {
    id: 's01',
    name: '강남역점',
    region: '서울',
    areaType: 'station',
    openedAt: '2023-03-10',
    seats: 64,
    area: 132,
    plan: 4_300_000,
    perf: 1.06,
    slope: 0,
    supervisorId: 'u06',
  },
  {
    id: 's02',
    name: '여의도점',
    region: '서울',
    areaType: 'office',
    openedAt: '2023-06-02',
    seats: 56,
    area: 118,
    plan: 3_600_000,
    perf: 0.98,
    slope: 0.003,
    supervisorId: 'u06',
  },
  {
    id: 's03',
    name: '잠실점',
    region: '서울',
    areaType: 'mall',
    openedAt: '2023-09-15',
    seats: 72,
    area: 145,
    plan: 4_600_000,
    perf: 1.04,
    slope: -0.004,
    supervisorId: 'u06',
  },
  {
    id: 's04',
    name: '홍대점',
    region: '서울',
    areaType: 'campus',
    openedAt: '2024-02-20',
    seats: 48,
    area: 96,
    plan: 3_100_000,
    perf: 0.95,
    slope: 0.002,
    supervisorId: 'u06',
  },
  {
    id: 's05',
    name: '성수점',
    region: '서울',
    areaType: 'station',
    openedAt: '2026-10-08',
    seats: 52,
    area: 104,
    plan: 3_400_000,
    perf: 1.02,
    slope: 0,
    supervisorId: 'u06',
  },
  {
    id: 's06',
    name: '판교점',
    region: '경기',
    areaType: 'office',
    openedAt: '2023-11-11',
    seats: 60,
    area: 124,
    plan: 3_800_000,
    perf: 1.08,
    slope: -0.003,
    supervisorId: 'u06',
  },
  {
    id: 's07',
    name: '분당 서현점',
    region: '경기',
    areaType: 'residential',
    openedAt: '2024-04-05',
    seats: 50,
    area: 102,
    plan: 2_900_000,
    perf: 0.97,
    slope: 0,
    supervisorId: 'u06',
  },
  {
    id: 's08',
    name: '수원 영통점',
    region: '경기',
    areaType: 'residential',
    openedAt: '2024-08-22',
    seats: 46,
    area: 94,
    plan: 2_700_000,
    perf: 0.93,
    slope: 0.002,
    supervisorId: 'u06',
  },
  {
    id: 's09',
    name: '일산점',
    region: '경기',
    areaType: 'mall',
    openedAt: '2025-03-14',
    seats: 58,
    area: 116,
    plan: 3_300_000,
    perf: 1.01,
    slope: 0,
    supervisorId: 'u06',
  },
  {
    id: 's10',
    name: '인천 부평점',
    region: '인천',
    areaType: 'station',
    openedAt: '2024-06-01',
    seats: 54,
    area: 108,
    plan: 3_000_000,
    perf: 0.96,
    slope: 0.001,
    supervisorId: 'u06',
  },
  {
    id: 's11',
    name: '인천 송도점',
    region: '인천',
    areaType: 'residential',
    openedAt: '2026-11-20',
    seats: 52,
    area: 92,
    plan: 2_800_000,
    perf: 1,
    slope: 0,
    supervisorId: 'u06',
  },
  {
    id: 's12',
    name: '부산 서면점',
    region: '부산',
    areaType: 'station',
    openedAt: '2024-01-19',
    seats: 62,
    area: 128,
    plan: 3_700_000,
    perf: 1.03,
    slope: 0,
    supervisorId: 'u06',
  },
  {
    id: 's13',
    name: '부산 해운대점',
    region: '부산',
    areaType: 'mall',
    openedAt: '2025-05-30',
    seats: 66,
    area: 134,
    plan: 3_900_000,
    perf: 1.1,
    slope: -0.006,
    supervisorId: 'u06',
  },
  {
    id: 's14',
    name: '부산 센텀점',
    region: '부산',
    areaType: 'office',
    openedAt: '2026-10-22',
    seats: 48,
    area: 98,
    plan: 2_900_000,
    perf: 0.98,
    slope: 0,
    supervisorId: 'u06',
  },
  {
    id: 's15',
    name: '대구 동성로점',
    region: '대구',
    areaType: 'campus',
    openedAt: '2024-10-11',
    seats: 50,
    area: 100,
    plan: 2_800_000,
    perf: 0.99,
    slope: 0,
    supervisorId: 'u06',
  },
  {
    id: 's16',
    name: '대구 수성점',
    region: '대구',
    areaType: 'residential',
    openedAt: '2025-07-04',
    seats: 44,
    area: 88,
    plan: 2_600_000,
    perf: 0.76,
    slope: 0.024,
    supervisorId: 'u06',
  },
  {
    id: 's17',
    name: '대전 둔산점',
    region: '대전 · 충청',
    areaType: 'office',
    openedAt: '2024-12-06',
    seats: 52,
    area: 106,
    plan: 2_900_000,
    perf: 1.02,
    slope: 0,
    supervisorId: 'u06',
  },
  {
    id: 's18',
    name: '청주 성안길점',
    region: '대전 · 충청',
    areaType: 'campus',
    openedAt: '2025-09-26',
    seats: 42,
    area: 84,
    plan: 2_400_000,
    perf: 0.77,
    slope: 0.022,
    supervisorId: 'u06',
  },
  {
    id: 's19',
    name: '천안 불당점',
    region: '대전 · 충청',
    areaType: 'residential',
    openedAt: '2026-12-04',
    seats: 48,
    area: 64,
    plan: 2_600_000,
    perf: 1,
    slope: 0,
    supervisorId: 'u06',
  },
];

export const storeById = (id: string) => STORES.find((s) => s.id === id)!;

/** 요일 계수(월 → 일). 오피스는 주말이 낮고, 나머지는 금 · 토가 높다 */
const WEEKDAY: Record<'office' | 'other', readonly number[]> = {
  office: [1.12, 1.12, 1.12, 1.15, 1.22, 0.7, 0.57],
  other: [0.84, 0.86, 0.9, 0.95, 1.15, 1.3, 1.0],
};

const jitter = (i: number, n: number) => {
  const x = Math.sin(i * 91.7 + n * 12.9898) * 43_758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/** 하루 매출(원). 개점 전 · 마감일 뒤는 0 */
export function dailySales(store: Store, date: string): number {
  if (date < store.openedAt || date > SALES_THROUGH) return 0;
  const i = STORES.indexOf(store) + 1;
  const n = between('2024-01-01', date);
  const dow = (new Date(dayOf(date)).getUTCDay() + 6) % 7;
  const week = WEEKDAY[store.areaType === 'office' ? 'office' : 'other'][dow]!;
  const season = 1 + 0.04 * Math.cos((2 * Math.PI * (dayOfYear(date) - 355)) / 365);
  const weeksBack = between(date, TODAY) / 7;
  const perf = Math.min(1.4, Math.max(0.5, store.perf + store.slope * weeksBack));
  const ramp = 1 + 0.3 * Math.exp(-between(store.openedAt, date) / 10);
  return (
    Math.round((store.plan * perf * week * season * ramp * (1 + 0.07 * jitter(i, n))) / 1e3) * 1e3
  );
}

/** 기간 매출(원). from ~ to 포함 */
export function salesOf(store: Store, from: string, to: string): number {
  let total = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) total += dailySales(store, d);
  return total;
}

/** 기간 목표(원) = 계획 일 매출 × 영업한 날 수(개점 전 · 마감일 뒤는 빼고) */
export function targetOf(store: Store, from: string, to: string): number {
  return store.plan * openDays(store, from, to);
}

/** 그 기간에 영업한 날 수(개점 전 · 마감일 뒤는 뺀다) */
function openDays(store: Store, from: string, to: string) {
  const start = from < store.openedAt ? store.openedAt : from;
  const end = to > SALES_THROUGH ? SALES_THROUGH : to;
  return start > end ? 0 : between(start, end) + 1;
}

/** 마감한 주(월요일) n개. 마지막이 지난주 */
export const recentWeeks = (n: number) => {
  const last = addDays(mondayOf(TODAY), -7);
  return Array.from({ length: n }, (_, i) => addDays(last, (i - n + 1) * 7));
};
export const weekEnd = (monday: string) => addDays(monday, 6);

/** 지금 상태: 개점 전이면 개점 준비, 최근 마감한 2주 모두 목표 대비 WATCH_RATIO 미만이면 주의 */
export function stateOf(store: Store): StoreState {
  if (store.openedAt > SALES_THROUGH) return 'preparing';
  const low = recentWeeks(2).every((w) => {
    const target = targetOf(store, w, weekEnd(w));
    return target > 0 && salesOf(store, w, weekEnd(w)) / target < WATCH_RATIO;
  });
  return low ? 'watch' : 'open';
}

export const supervisorOf = (store: Store) => personLabel(store.supervisorId);

/**
 * 지역 · 주 매장당 평균 주간 매출(원) = 지역 매출 ÷ 매장 영업일 × 7. 주 중간에 연 매장은 연 날만 센다.
 * 영업한 매장이 없으면 null
 */
export function regionWeekAvg(region: Region, monday: string): number | null {
  const end = weekEnd(monday);
  const stores = STORES.filter((s) => s.region === region);
  const days = stores.reduce((a, s) => a + openDays(s, monday, end), 0);
  if (!days) return null;
  const total = stores.reduce((a, s) => a + salesOf(s, monday, end), 0);
  return Math.round((total / days) * 7);
}

/* ── 초도 물량 ───────────────────────────────────────── */

/** 첫 공급 품목: 손님 100명당 사용량 · 공급 단위 · 냉동 여부 · 포장 비율을 곱하는지 */
export interface StarterItem {
  itemId: string;
  /** 손님 100명당 사용량(품목 단위) */
  per100: number;
  /** 공급 단위(이 수의 배수로 올린다) */
  pack: number;
  frozen: boolean;
  /** 포장재: 사용량에 상권 포장 비율을 곱한다(손님 100명 중 포장 손님 수만큼) */
  takeout?: boolean;
}

export const STARTER_ITEMS: readonly StarterItem[] = [
  { itemId: 'i01', per100: 1.6, pack: 1, frozen: true },
  { itemId: 'i03', per100: 1.2, pack: 5, frozen: true },
  { itemId: 'i04', per100: 2.0, pack: 5, frozen: true },
  { itemId: 'i02', per100: 0.125, pack: 1, frozen: false },
  { itemId: 'i05', per100: 0.1, pack: 1, frozen: false },
  { itemId: 'i06', per100: 100, pack: 100, frozen: false, takeout: true },
  { itemId: 'i08', per100: 0.05, pack: 1, frozen: false },
];

/** 상온 품목 공급 일수 */
export const AMBIENT_DAYS = 14;
/** 냉동 품목 공급 일수: 면적이 작을수록 냉동고가 작아 줄인다(㎡ 기준 → 일) */
export const FROZEN_DAYS: readonly { below: number; days: number }[] = [
  { below: 66, days: 5 },
  { below: 99, days: 7 },
  { below: Number.POSITIVE_INFINITY, days: 10 },
];
export const frozenDaysOf = (area: number) => FROZEN_DAYS.find((f) => area < f.below)!.days;

/** 예상 일 방문(명) 기본값 = 좌석 수 × 상권 회전율 */
export const visitsOf = (seats: number, areaType: AreaType) =>
  Math.round(seats * AREA_TYPES[areaType].turnover);

export interface StarterLine {
  item: Item;
  per100: number;
  /** 하루 사용량(품목 단위, 소수 한 자리) */
  daily: number;
  days: number;
  qty: number;
  price: number;
  amount: number;
  takeout: boolean;
}

/**
 * 초도 물량: 하루 사용량 = 예상 일 방문 × 100명당 사용량 ÷ 100(포장재는 × 포장 비율),
 * 수량 = 하루 사용량 × 공급 일수를 공급 단위로 올림, 금액 = 수량 × 공급가
 */
export function starterLines(input: {
  areaType: AreaType;
  area: number;
  visits: number;
}): StarterLine[] {
  const t = AREA_TYPES[input.areaType];
  return STARTER_ITEMS.map((s) => {
    const item = itemById(s.itemId);
    const daily = (input.visits * s.per100 * (s.takeout ? t.takeout : 1)) / 100;
    const days = s.frozen ? frozenDaysOf(input.area) : AMBIENT_DAYS;
    const qty = Math.ceil((daily * days) / s.pack - 1e-9) * s.pack;
    return {
      item,
      per100: s.per100,
      daily: Math.round(daily * 10) / 10,
      days,
      qty,
      price: item.price,
      amount: qty * item.price,
      takeout: Boolean(s.takeout),
    };
  });
}

/* ── 개점 준비 ───────────────────────────────────────── */

/** 개점 준비 항목. due는 개점일 기준 며칠 전(음수), done은 끝낸 날 기준 며칠 전 */
interface OpeningTask {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  dueBefore: number;
  /** 이 매장에서의 상태(개점일까지 남은 날로 정한다) */
  stateAt: (daysLeft: number) => ChecklistState;
  doneBefore?: number;
  meta?: string;
}

const OPENING_TASKS: readonly OpeningTask[] = [
  {
    id: 'contract',
    title: '가맹 계약 체결',
    ownerId: 'u06',
    dueBefore: 75,
    doneBefore: 79,
    stateAt: () => 'done',
  },
  {
    id: 'interior',
    title: '매장 공사 · 인테리어',
    ownerId: 'u02',
    dueBefore: 21,
    doneBefore: 21,
    stateAt: (d) => (d <= 21 ? 'done' : 'doing'),
  },
  {
    id: 'hygiene',
    title: '위생 교육 이수',
    description: '점주 · 직원 6명',
    ownerId: 'u06',
    dueBefore: 8,
    stateAt: (d) => (d <= 14 ? 'doing' : 'pending'),
    meta: '4/6명',
  },
  {
    id: 'permit',
    title: '영업 신고',
    description: '위생 교육 수료증 필요',
    ownerId: 'u03',
    dueBefore: 7,
    stateAt: (d) => (d <= 14 ? 'blocked' : 'pending'),
  },
  {
    id: 'starter',
    title: '초도 물량 확정',
    description: '좌석 · 면적 · 상권으로 산출',
    ownerId: 'u04',
    dueBefore: 7,
    stateAt: () => 'pending',
  },
  {
    id: 'pos',
    title: 'POS · 카드 단말기 설치',
    ownerId: 'u02',
    dueBefore: 4,
    stateAt: () => 'pending',
  },
  {
    id: 'delivery',
    title: '초도 물량 입고',
    description: '초도 물량 확정 뒤 배송',
    ownerId: 'u05',
    dueBefore: 2,
    stateAt: () => 'blocked',
  },
  { id: 'rehearsal', title: '오픈 리허설', ownerId: 'u06', dueBefore: 1, stateAt: () => 'pending' },
];

/** 개점 준비 매장의 할 일(기한 = 개점일 − dueBefore). 끝낸 일은 끝낸 날을 meta로 */
export function openingTasksOf(store: Store) {
  const daysLeft = between(TODAY, store.openedAt);
  return OPENING_TASKS.map((t) => {
    const state = t.stateAt(daysLeft);
    const doneAt = t.doneBefore !== undefined ? addDays(store.openedAt, -t.doneBefore) : null;
    return {
      id: t.id,
      title: t.title,
      ...(t.description ? { description: t.description } : {}),
      state,
      due: addDays(store.openedAt, -t.dueBefore),
      owner: personLabel(t.ownerId),
      ...(state === 'done' && doneAt
        ? { meta: `완료 ${doneAt.slice(5)}` }
        : t.meta && state === 'doing'
          ? { meta: t.meta }
          : {}),
    };
  });
}
