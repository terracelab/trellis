// 제조(평택 냉동센터 소분 · 포장 라인) · 배송 샘플 데이터. 품목 · 재고 · 거래처 · 입고 번호는 trade.ts를 그대로 잇는다.
// 날짜는 TODAY(2026-11-06), 보드 시각은 14:20 기준으로 고정(결정적). 사람 · 거래처 이름은 예시다.
import type {
  MachineState,
  ProgressState,
  QualityResult,
  StatusTone,
} from '@terracelab/trellis-contracts';
import { NOW } from './profile.js';
import { availableOf, itemById, stockOf, TODAY } from './trade.js';

/* ── 공장 · 교대 ───────────────────────────────────────── */

const hm = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const SHIFT = { from: '08:00', to: '17:00', lunch: { from: '12:00', minutes: 60 } };
/** 교대 시작부터 t까지 계획 가동 시간(분). 점심이 지났으면 뺀다 */
const plannedUntil = (t: string) =>
  hm(t) - hm(SHIFT.from) - (hm(t) > hm(SHIFT.lunch.from) ? SHIFT.lunch.minutes : 0);

export const PLANT = {
  name: '평택 냉동센터',
  shift: '주간 교대',
  shiftTime: `${SHIFT.from}~${SHIFT.to}`,
  /** 보드 기준 시각(블록 전체의 NOW) */
  now: NOW,
  updatedAt: `${NOW}:30`,
  /** 교대 시작부터 지금까지, 점심 뺀 계획 가동 시간(분) */
  plannedMin: plannedUntil(NOW),
  /** 교대 하루 계획 가동 시간(분) */
  dayMin: plannedUntil(SHIFT.to),
};

/** 생산 · 품질 · 설비 담당(_platform USERS 밖의 현장 인원) */
export const MES_PEOPLE = {
  head: '신동욱 과장',
  line1: '강민호 반장',
  line2: '문가영 반장',
  maint: '서준호 대리',
  qc: '윤하나 주임',
} as const;

/** 라인 id(LINES). 회사마다 다르다 */
export type LineId = string;

export interface Line {
  id: LineId;
  name: string;
  role: string;
  leader: string;
  /** 오늘 비가동 누계(분) */
  downMin: number;
  /** 지금 상황 한 줄 */
  note: string;
  /** 라인 상태(현장 보드). 없으면 라인 설비 상태에서 고른다 */
  state?: MachineState;
}

export const LINES: readonly Line[] = [
  {
    id: 'L1',
    name: '1라인',
    role: '새우 소포장',
    leader: MES_PEOPLE.line1,
    downMin: 12,
    note: '흰다리새우 500g 소포장 생산 중',
    state: 'running',
  },
  {
    id: 'L2',
    name: '2라인',
    role: '관자 · 연어 소포장',
    leader: MES_PEOPLE.line2,
    downMin: 70,
    note: '품목 전환 중 · 연어 필렛 200g 14:40 시작 예정',
    state: 'setup',
  },
];

export const lineById = (id: LineId) => LINES.find((l) => l.id === id)!;
/** 라인 가동률(%) = (계획 가동 − 비가동) / 계획 가동 */
export const lineAvailability = (l: Line) =>
  Math.round(((PLANT.plannedMin - l.downMin) / PLANT.plannedMin) * 1000) / 10;

/* ── 완제품 · 자재 · BOM ───────────────────────────────── */

export interface Product {
  id: string;
  code: string;
  name: string;
  spec: string;
  lineId: LineId;
  bomVersion: string;
  /** 원료 품목(trade ITEMS) */
  rawItemId: string;
  /** 시간당 표준 생산량(EA) */
  stdPerHour: number;
}

export const PRODUCTS: readonly Product[] = [
  {
    id: 'f01',
    code: 'FG-5001',
    name: '냉동 흰다리새우 500g 소포장',
    spec: '21/25 · 500g 진공',
    lineId: 'L1',
    bomVersion: 'v3',
    rawItemId: 'i01',
    stdPerHour: 190,
  },
  {
    id: 'f02',
    code: 'FG-5002',
    name: '냉동 가리비 관자 300g 소포장',
    spec: 'L · 300g 진공',
    lineId: 'L2',
    bomVersion: 'v2',
    rawItemId: 'i03',
    stdPerHour: 120,
  },
  {
    id: 'f03',
    code: 'FG-5003',
    name: '냉동 연어 필렛 200g 진공',
    spec: '스킨온 · 200g',
    lineId: 'L2',
    bomVersion: 'v1',
    rawItemId: 'i04',
    stdPerHour: 150,
  },
  {
    id: 'f04',
    code: 'FG-5004',
    name: '냉동 흰다리새우 1kg 업소용',
    spec: '21/25 · 1kg 진공',
    lineId: 'L1',
    bomVersion: 'v2',
    rawItemId: 'i01',
    stdPerHour: 140,
  },
];

export const productByCode = (code: string) => PRODUCTS.find((p) => p.code === code)!;

/** 자재 구분 이름(원료 · 반제품 · 포장재 …). 회사마다 다르다 */
export type MaterialKind = string;

export interface Material {
  code: string;
  name: string;
  spec: string;
  unit: string;
  kind: MaterialKind;
  /** 현재고 · 가용재고(세트 · 반제품은 재고를 두지 않는다) */
  stock: number | null;
  available: number | null;
  /** 단위 원가(원) */
  cost: number;
  /** 입고 예정(부족 안내에 쓴다) */
  incoming?: { qty: number; date: string; ref: string };
}

/** trade ITEMS를 자재로 쓰는 것: 재고 숫자는 STOCK에서 온다 */
const fromItem = (
  itemId: string,
  kind: MaterialKind,
  incoming?: Material['incoming'],
): Material => {
  const it = itemById(itemId);
  return {
    code: it.code,
    name: it.name,
    spec: it.spec,
    unit: it.unit,
    kind,
    stock: stockOf(itemId),
    available: availableOf(itemId),
    cost: it.cost,
    ...(incoming ? { incoming } : {}),
  };
};

export const MATERIALS: readonly Material[] = [
  fromItem('i01', '원료', { qty: 1_200, date: '2026-11-10', ref: 'GR-2611-0028' }),
  fromItem('i03', '원료'),
  fromItem('i04', '원료', { qty: 800, date: '2026-11-10', ref: 'GR-2611-0028' }),
  fromItem('i07', '포장재', { qty: 2_400, date: '2026-11-06', ref: 'GR-2611-0030' }),
  fromItem('i09', '포장재', { qty: 8_000, date: '2026-11-06', ref: 'GR-2611-0030' }),
  fromItem('i10', '소모품'),
  {
    code: 'PK-3101',
    name: '진공 파우치 PA/PE',
    spec: '200×300',
    unit: 'EA',
    kind: '포장재',
    stock: 1_850,
    available: 1_850,
    cost: 85,
  },
  {
    code: 'PK-3102',
    name: '진공 파우치 PA/PE',
    spec: '250×350',
    unit: 'EA',
    kind: '포장재',
    stock: 3_600,
    available: 3_600,
    cost: 110,
  },
  {
    code: 'PK-3103',
    name: '제품 라벨 감열지',
    spec: '80×60',
    unit: 'EA',
    kind: '포장재',
    stock: 14_000,
    available: 14_000,
    cost: 9,
  },
  {
    code: 'SF-5001',
    name: '흰다리새우 500g 진공팩',
    spec: '소분 · 진공 반제품',
    unit: 'EA',
    kind: '반제품',
    stock: null,
    available: null,
    cost: 0,
  },
  {
    code: 'SF-5002',
    name: '가리비 관자 300g 진공팩',
    spec: '소분 · 진공 반제품',
    unit: 'EA',
    kind: '반제품',
    stock: null,
    available: null,
    cost: 0,
  },
  {
    code: 'SF-5003',
    name: '연어 필렛 200g 진공팩',
    spec: '소분 · 진공 반제품',
    unit: 'EA',
    kind: '반제품',
    stock: null,
    available: null,
    cost: 0,
  },
  {
    code: 'SF-5004',
    name: '흰다리새우 1kg 진공팩',
    spec: '소분 · 진공 반제품',
    unit: 'EA',
    kind: '반제품',
    stock: null,
    available: null,
    cost: 0,
  },
  {
    code: 'PH-5001',
    name: '출하 포장 세트',
    spec: '아이스박스 1개에 20EA',
    unit: 'EA',
    kind: '세트',
    stock: null,
    available: null,
    cost: 0,
  },
  {
    code: 'PH-5002',
    name: '출하 포장 세트',
    spec: '아이스박스 1개에 10EA',
    unit: 'EA',
    kind: '세트',
    stock: null,
    available: null,
    cost: 0,
  },
];

export const materialByCode = (code: string) => MATERIALS.find((m) => m.code === code)!;

/** BOM 한 줄. qty는 바로 위 부모 1단위에 드는 양(손실 포함). 순서대로 그리면 트리가 된다 */
export interface BomNode {
  code: string;
  level: 1 | 2;
  qty: number;
}

export const BOMS: Readonly<Record<string, readonly BomNode[]>> = {
  'FG-5001': [
    { code: 'SF-5001', level: 1, qty: 1 },
    { code: 'FD-1001', level: 2, qty: 0.26 },
    { code: 'PK-3101', level: 2, qty: 1.02 },
    { code: 'PK-3103', level: 1, qty: 1.01 },
    { code: 'SP-3001', level: 2, qty: 0.0003 },
    { code: 'PH-5001', level: 1, qty: 1 },
    { code: 'PK-2002', level: 2, qty: 0.05 },
    { code: 'PK-2004', level: 2, qty: 0.1 },
  ],
  'FG-5002': [
    { code: 'SF-5002', level: 1, qty: 1 },
    { code: 'FD-1003', level: 2, qty: 0.31 },
    { code: 'PK-3101', level: 2, qty: 1.02 },
    { code: 'PK-3103', level: 1, qty: 1.01 },
    { code: 'SP-3001', level: 2, qty: 0.0003 },
    { code: 'PH-5001', level: 1, qty: 1 },
    { code: 'PK-2002', level: 2, qty: 0.05 },
    { code: 'PK-2004', level: 2, qty: 0.1 },
  ],
  'FG-5003': [
    { code: 'SF-5003', level: 1, qty: 1 },
    { code: 'FD-1004', level: 2, qty: 0.21 },
    { code: 'PK-3101', level: 2, qty: 1.02 },
    { code: 'PK-3103', level: 1, qty: 1.01 },
    { code: 'SP-3001', level: 2, qty: 0.0003 },
    { code: 'PH-5001', level: 1, qty: 1 },
    { code: 'PK-2002', level: 2, qty: 0.05 },
    { code: 'PK-2004', level: 2, qty: 0.1 },
  ],
  'FG-5004': [
    { code: 'SF-5004', level: 1, qty: 1 },
    { code: 'FD-1001', level: 2, qty: 0.51 },
    { code: 'PK-3102', level: 2, qty: 1.02 },
    { code: 'PK-3103', level: 1, qty: 1.01 },
    { code: 'SP-3001', level: 2, qty: 0.0003 },
    { code: 'PH-5002', level: 1, qty: 1 },
    { code: 'PK-2002', level: 2, qty: 0.1 },
    { code: 'PK-2004', level: 2, qty: 0.2 },
  ],
};

/* ── 작업지시 · 실적 ───────────────────────────────────── */

/** 불량 유형(키 → 이름). 공정마다 다르다 */
export const DEFECT_TYPES: Readonly<Record<string, string>> = {
  seal: '실링 불량',
  weight: '중량 미달',
  label: '라벨 오부착',
  metal: '금속 검출',
  pouch: '파우치 파손',
};
export type DefectType = string;
/** 불량 이름. 모르는 키는 키 그대로 */
export const defectLabel = (t: DefectType) => DEFECT_TYPES[t] ?? t;

export interface WorkOrder {
  id: string;
  lineId: LineId;
  productCode: string;
  planned: number;
  good: number;
  defect: number;
  /** 불량 유형별 수량. 없는 유형은 0 */
  defects: Readonly<Record<DefectType, number>>;
  state: ProgressState;
  /** 시작 · 종료(HH:MM) 또는 시작 예정 */
  start?: string;
  end?: string;
  planStart: string;
  /** 투입 원료 로트(trade STOCK의 로트) */
  rawLot: string;
  customer: string;
  note?: string;
}

const D = (seal: number, weight: number, label: number, metal: number, pouch: number) => ({
  seal,
  weight,
  label,
  metal,
  pouch,
});

export const WORK_ORDERS: readonly WorkOrder[] = [
  {
    id: 'WO-2611-0061',
    lineId: 'L1',
    productCode: 'FG-5001',
    planned: 1_200,
    good: 864,
    defect: 21,
    defects: D(9, 7, 3, 1, 1),
    state: 'doing',
    start: '08:30',
    planStart: '08:30',
    rawLot: 'PS2610A',
    customer: '온누리급식 · 한결물산 외 2곳',
  },
  {
    id: 'WO-2611-0062',
    lineId: 'L2',
    productCode: 'FG-5002',
    planned: 480,
    good: 472,
    defect: 8,
    defects: D(3, 2, 2, 1, 0),
    state: 'done',
    start: '08:30',
    end: '13:40',
    planStart: '08:30',
    rawLot: 'HK260921',
    customer: '바른식자재 · 청담키친',
    note: '유통기한 11월 30일 로트 먼저 사용',
  },
  {
    id: 'WO-2611-0063',
    lineId: 'L2',
    productCode: 'FG-5003',
    planned: 600,
    good: 0,
    defect: 0,
    defects: D(0, 0, 0, 0, 0),
    state: 'todo',
    planStart: '14:40',
    rawLot: 'PS2610B',
    customer: '바른식자재 · 청담키친',
    note: '품목 전환 중 · 금속검출기 감도 점검 후 시작',
  },
  {
    id: 'WO-2611-0064',
    lineId: 'L1',
    productCode: 'FG-5004',
    planned: 300,
    good: 0,
    defect: 0,
    defects: D(0, 0, 0, 0, 0),
    state: 'todo',
    planStart: '16:00',
    rawLot: 'PS2609C',
    customer: '해든마트 천안점',
  },
  {
    id: 'WO-2611-0065',
    lineId: 'L1',
    productCode: 'FG-5001',
    planned: 800,
    good: 0,
    defect: 0,
    defects: D(0, 0, 0, 0, 0),
    state: 'hold',
    planStart: '11-07 08:30',
    rawLot: 'PS2610A',
    customer: '대양상사',
    note: '원료 부족 · 11월 10일 GR-2611-0028 입고 뒤 재개',
  },
];

/** 오늘 계획(보류 제외) · 실적 */
export const TODAY_PLAN = WORK_ORDERS.filter((w) => w.state !== 'hold').reduce(
  (a, w) => a + w.planned,
  0,
);
export const TODAY_GOOD = WORK_ORDERS.reduce((a, w) => a + w.good, 0);
export const TODAY_DEFECT = WORK_ORDERS.reduce((a, w) => a + w.defect, 0);
export const TODAY_DEFECTS = Object.keys(DEFECT_TYPES).map((k) => ({
  type: k,
  label: defectLabel(k),
  value: WORK_ORDERS.reduce((a, w) => a + (w.defects[k] ?? 0), 0),
}));

/** 시간대별 양품(EA). 키는 라인 id. 점심 12시는 비가동이라 뺀다 */
export const HOURLY: readonly { hour: string; [lineId: string]: string | number }[] = [
  { hour: '08시', L1: 82, L2: 48 },
  { hour: '09시', L1: 178, L2: 112 },
  { hour: '10시', L1: 184, L2: 118 },
  { hour: '11시', L1: 176, L2: 109 },
  { hour: '13시', L1: 168, L2: 85 },
  { hour: '14시', L1: 76, L2: 0 },
];

/** 현장 보드 목표(회사가 정한 값)와 전일 비교 */
export const FLOOR_KPI = {
  /** 목표 가동률 · 수율(%) */
  availabilityTarget: 90,
  yieldTarget: 97.5,
  /** 전일 수율(%) */
  prevYield: 97.6,
  /** 오늘 양품의 전일 같은 시각 대비(%) */
  goodDelta: 4.6,
  /** 오늘 공정 불량률의 전일 대비(%p) */
  defectRateDelta: 0.3,
  /** 오늘 불량의 전일 같은 시각 대비(EA, 음수면 적음) */
  defectDiff: -3,
};

/** 원료 로트(스캔 검증용). trade STOCK의 로트와 같은 번호 */
export const RAW_LOTS: readonly { lot: string; itemId: string; expiry: string; qty: number }[] = [
  { lot: 'PS2610A', itemId: 'i01', expiry: '2028-03-02', qty: 180 },
  { lot: 'PS2609C', itemId: 'i01', expiry: '2027-12-20', qty: 132 },
  { lot: 'HK260921', itemId: 'i03', expiry: '2026-11-30', qty: 128 },
  { lot: 'PS2610B', itemId: 'i04', expiry: '2027-10-12', qty: 410 },
];

/** 오늘 실적 등록 이력(작업지시별, 최신 위) */
export const OUTPUT_LOG: readonly {
  id: string;
  woId: string;
  time: string;
  good: number;
  defect: number;
  type?: DefectType;
  actor: string;
}[] = [
  {
    id: 'o6',
    woId: 'WO-2611-0061',
    time: '14:00',
    good: 168,
    defect: 4,
    type: 'seal',
    actor: MES_PEOPLE.line1,
  },
  {
    id: 'o5',
    woId: 'WO-2611-0061',
    time: '12:00',
    good: 176,
    defect: 5,
    type: 'weight',
    actor: MES_PEOPLE.line1,
  },
  {
    id: 'o4',
    woId: 'WO-2611-0061',
    time: '11:00',
    good: 184,
    defect: 3,
    type: 'seal',
    actor: MES_PEOPLE.line1,
  },
  {
    id: 'o3',
    woId: 'WO-2611-0061',
    time: '10:00',
    good: 260,
    defect: 6,
    type: 'weight',
    actor: MES_PEOPLE.line1,
  },
  {
    id: 'o2',
    woId: 'WO-2611-0062',
    time: '13:40',
    good: 194,
    defect: 3,
    type: 'label',
    actor: MES_PEOPLE.line2,
  },
  {
    id: 'o1',
    woId: 'WO-2611-0062',
    time: '11:00',
    good: 278,
    defect: 5,
    type: 'seal',
    actor: MES_PEOPLE.line2,
  },
];

/* ── 설비 ──────────────────────────────────────────────── */

export interface InspectionRecord {
  id: string;
  title: string;
  time: string;
  actor: string;
  description?: string;
  tone: StatusTone;
}

export interface Equipment {
  id: string;
  name: string;
  lineId: LineId | 'ST';
  /** 공정 이름(소분 · 진공 포장 …). 회사마다 다르다 */
  process: string;
  state: MachineState;
  /** 지금 상태가 시작된 시각 */
  since: string;
  reason?: string;
  /** 오늘 가동(분). 보관 설비는 24시간 기준 */
  runMin: number;
  model: string;
  installed: string;
  owner: string;
  cycleLabel: string;
  cycleDays: number;
  lastInspection: string;
  nextInspection: string;
  sensor: {
    label: string;
    unit: string;
    range: readonly [number, number];
    times: readonly string[];
    values: readonly number[];
  };
  history: readonly InspectionRecord[];
}

const SHIFT_TIMES = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
];
const DAY_TIMES = Array.from(
  { length: 24 },
  (_, i) => `${String((15 + i) % 24).padStart(2, '0')}시`,
);
const wave = (n: number, base: number, amp: number, step: number, phase = 0) =>
  Array.from(
    { length: n },
    (_, i) => Math.round((base + Math.sin(i / step + phase) * amp) * 10) / 10,
  );

const room = (base: number, phase: number) => ({
  label: '작업실 온도',
  unit: '°C',
  range: [0, 10] as const,
  times: SHIFT_TIMES,
  values: wave(SHIFT_TIMES.length, base, 0.9, 1.7, phase),
});
const seal = (base: number, phase: number) => ({
  label: '실링 온도',
  unit: '°C',
  range: [165, 175] as const,
  times: SHIFT_TIMES,
  values: wave(SHIFT_TIMES.length, base, 1.8, 1.3, phase),
});

const daily = (
  id: string,
  time: string,
  actor: string,
  description?: string,
): InspectionRecord => ({
  id,
  title: '일상 점검',
  time,
  actor,
  tone: 'success',
  ...(description ? { description } : {}),
});

export const EQUIPMENT: readonly Equipment[] = [
  {
    id: 'EQ-1101',
    name: '소분기 1호',
    lineId: 'L1',
    process: '소분',
    state: 'running',
    since: '13:00',
    runMin: 308,
    model: '자동 계량 소분기 PW-120',
    installed: '2024-03-18',
    owner: MES_PEOPLE.maint,
    cycleLabel: '2주',
    cycleDays: 14,
    lastInspection: '2026-10-30',
    nextInspection: '2026-11-13',
    sensor: room(6.4, 0.2),
    history: [
      daily('h3', '2026-11-06 07:50', MES_PEOPLE.line1, '계량 영점 · 칼날 상태 확인'),
      {
        id: 'h2',
        title: '정기 점검',
        time: '2026-10-30 17:20',
        actor: MES_PEOPLE.maint,
        description: '로드셀 교정 · 컨베이어 벨트 장력 조정',
        tone: 'success',
      },
      {
        id: 'h1',
        title: '고장 수리',
        time: '2026-10-21 10:15',
        actor: MES_PEOPLE.maint,
        description: '계량 편차 ±8g · 로드셀 케이블 교체',
        tone: 'danger',
      },
    ],
  },
  {
    id: 'EQ-1201',
    name: '진공포장기 1호',
    lineId: 'L1',
    process: '진공 포장',
    state: 'running',
    since: '13:00',
    runMin: 312,
    model: '로터리 진공포장기 VR-8',
    installed: '2024-03-18',
    owner: MES_PEOPLE.maint,
    cycleLabel: '2주',
    cycleDays: 14,
    lastInspection: '2026-10-23',
    nextInspection: '2026-11-06',
    sensor: seal(170.4, 0.6),
    history: [
      daily('h3', '2026-11-06 07:55', MES_PEOPLE.line1, '진공도 −0.098MPa · 실링 테스트 합격'),
      {
        id: 'h2',
        title: '정기 점검',
        time: '2026-10-23 17:40',
        actor: MES_PEOPLE.maint,
        description: '실링바 테프론 교체 · 진공 펌프 오일 보충',
        tone: 'success',
      },
    ],
  },
  {
    id: 'EQ-1301',
    name: '금속검출기 1호',
    lineId: 'L1',
    process: '금속 검출',
    state: 'running',
    since: '13:00',
    runMin: 316,
    model: '터널형 금속검출기 MD-300',
    installed: '2024-03-18',
    owner: MES_PEOPLE.qc,
    cycleLabel: '매일',
    cycleDays: 1,
    lastInspection: '2026-11-06',
    nextInspection: '2026-11-07',
    sensor: room(5.8, 1.4),
    history: [
      daily('h3', '2026-11-06 13:00', MES_PEOPLE.qc, '감도 테스트 Fe 1.5mm · SUS 2.0mm 검출 정상'),
      daily('h2', '2026-11-06 08:00', MES_PEOPLE.qc, '감도 테스트 Fe 1.5mm · SUS 2.0mm 검출 정상'),
      daily('h1', '2026-11-05 13:00', MES_PEOPLE.qc, '감도 테스트 정상'),
    ],
  },
  {
    id: 'EQ-1401',
    name: '라벨러 1호',
    lineId: 'L1',
    process: '라벨',
    state: 'running',
    since: '13:00',
    runMin: 310,
    model: '상면 라벨러 LB-60',
    installed: '2024-05-02',
    owner: MES_PEOPLE.maint,
    cycleLabel: '월 1회',
    cycleDays: 30,
    lastInspection: '2026-10-09',
    nextInspection: '2026-11-08',
    sensor: room(6.1, 2.2),
    history: [
      daily('h2', '2026-11-06 07:58', MES_PEOPLE.line1, '리본 잔량 40% · 인쇄 상태 확인'),
      {
        id: 'h1',
        title: '정기 점검',
        time: '2026-10-09 17:30',
        actor: MES_PEOPLE.maint,
        description: '인쇄 헤드 청소 · 센서 위치 조정',
        tone: 'success',
      },
    ],
  },
  {
    id: 'EQ-2101',
    name: '소분기 2호',
    lineId: 'L2',
    process: '소분',
    state: 'setup',
    since: '13:40',
    reason: '품목 전환 · 관자 → 연어 필렛',
    runMin: 250,
    model: '자동 계량 소분기 PW-120',
    installed: '2025-02-10',
    owner: MES_PEOPLE.maint,
    cycleLabel: '2주',
    cycleDays: 14,
    lastInspection: '2026-10-30',
    nextInspection: '2026-11-13',
    sensor: room(6.9, 0.9),
    history: [
      {
        id: 'h3',
        title: '품목 전환 시작',
        time: '2026-11-06 13:40',
        actor: MES_PEOPLE.line2,
        description: '칼날 · 트레이 세척 후 200g 설정',
        tone: 'neutral',
      },
      daily('h2', '2026-11-06 07:52', MES_PEOPLE.line2),
      {
        id: 'h1',
        title: '정기 점검',
        time: '2026-10-30 17:50',
        actor: MES_PEOPLE.maint,
        tone: 'success',
      },
    ],
  },
  {
    id: 'EQ-2201',
    name: '진공포장기 2호',
    lineId: 'L2',
    process: '진공 포장',
    state: 'idle',
    since: '13:40',
    reason: '품목 전환 대기',
    runMin: 250,
    model: '로터리 진공포장기 VR-8',
    installed: '2025-02-10',
    owner: MES_PEOPLE.maint,
    cycleLabel: '2주',
    cycleDays: 14,
    lastInspection: '2026-10-20',
    nextInspection: '2026-11-03',
    sensor: seal(171.2, 2.1),
    history: [
      daily('h2', '2026-11-06 07:56', MES_PEOPLE.line2, '진공도 −0.097MPa'),
      {
        id: 'h1',
        title: '정기 점검',
        time: '2026-10-20 17:10',
        actor: MES_PEOPLE.maint,
        description: '실링바 테프론 교체',
        tone: 'success',
      },
    ],
  },
  {
    id: 'EQ-2301',
    name: '금속검출기 2호',
    lineId: 'L2',
    process: '금속 검출',
    state: 'maintenance',
    since: '13:45',
    reason: '품목 전환 감도 점검 · Fe 1.5 · SUS 2.0mm',
    runMin: 245,
    model: '터널형 금속검출기 MD-300',
    installed: '2025-02-10',
    owner: MES_PEOPLE.qc,
    cycleLabel: '매일',
    cycleDays: 1,
    lastInspection: '2026-11-06',
    nextInspection: '2026-11-07',
    sensor: room(6.2, 3.0),
    history: [
      {
        id: 'h3',
        title: '감도 점검 시작',
        time: '2026-11-06 13:45',
        actor: MES_PEOPLE.qc,
        description: '연어 필렛 제품 효과 보정',
        tone: 'info',
      },
      daily('h2', '2026-11-06 08:00', MES_PEOPLE.qc, '감도 테스트 정상'),
      daily('h1', '2026-11-05 13:00', MES_PEOPLE.qc, '감도 테스트 정상'),
    ],
  },
  {
    id: 'EQ-2401',
    name: '라벨러 2호',
    lineId: 'L2',
    process: '라벨',
    state: 'down',
    since: '14:05',
    reason: '라벨 리본 걸림 · 서준호 대리 조치 중',
    runMin: 238,
    model: '상면 라벨러 LB-60',
    installed: '2025-02-10',
    owner: MES_PEOPLE.maint,
    cycleLabel: '월 1회',
    cycleDays: 30,
    lastInspection: '2026-10-09',
    nextInspection: '2026-11-08',
    sensor: room(6.6, 1.1),
    history: [
      {
        id: 'h4',
        title: '조치 시작',
        time: '2026-11-06 14:12',
        actor: MES_PEOPLE.maint,
        description: '리본 롤러 분해 · 리본 SP-3001 교체 준비',
        tone: 'warning',
      },
      {
        id: 'h3',
        title: '비가동 신고',
        time: '2026-11-06 14:05',
        actor: MES_PEOPLE.line2,
        description: '라벨 리본 걸림 · 인쇄 번짐',
        tone: 'danger',
      },
      daily('h2', '2026-11-06 07:59', MES_PEOPLE.line2, '리본 잔량 15%'),
      {
        id: 'h1',
        title: '정기 점검',
        time: '2026-10-09 17:45',
        actor: MES_PEOPLE.maint,
        tone: 'success',
      },
    ],
  },
  {
    id: 'EQ-9101',
    name: '냉동창고 A동',
    lineId: 'ST',
    process: '보관',
    state: 'running',
    since: '00:00',
    runMin: 1_440,
    model: '저온 창고 컴프레서 2기',
    installed: '2023-09-01',
    owner: MES_PEOPLE.maint,
    cycleLabel: '월 1회',
    cycleDays: 30,
    lastInspection: '2026-10-16',
    nextInspection: '2026-11-15',
    sensor: {
      label: '창고 온도',
      unit: '°C',
      range: [-25, -18],
      times: DAY_TIMES,
      values: wave(24, -21.3, 0.5, 2.4, 0.4),
    },
    history: [
      daily('h2', '2026-11-06 07:30', MES_PEOPLE.maint, '−21.4°C · 성에 제거 주기 정상'),
      {
        id: 'h1',
        title: '정기 점검',
        time: '2026-10-16 15:00',
        actor: MES_PEOPLE.maint,
        description: '냉매 압력 · 증발기 팬 점검',
        tone: 'success',
      },
    ],
  },
  {
    id: 'EQ-9102',
    name: '냉동창고 B동',
    lineId: 'ST',
    process: '보관',
    state: 'running',
    since: '00:00',
    reason: '상차 문 개방 13:00~13:40 · 온도 회복 중',
    runMin: 1_440,
    model: '저온 창고 컴프레서 2기',
    installed: '2023-09-01',
    owner: MES_PEOPLE.maint,
    cycleLabel: '월 1회',
    cycleDays: 30,
    lastInspection: '2026-10-11',
    nextInspection: '2026-11-10',
    sensor: {
      label: '창고 온도',
      unit: '°C',
      range: [-25, -18],
      times: DAY_TIMES,
      values: [
        -20.8, -20.9, -21.0, -21.1, -21.0, -21.2, -21.1, -21.0, -20.9, -21.0, -20.8, -20.7, -20.6,
        -20.4, -20.1, -20.3, -20.5, -20.4, -20.2, -20.0, -19.6, -18.9, -18.4, -18.6,
      ],
    },
    history: [
      {
        id: 'h3',
        title: '온도 경고',
        time: '2026-11-06 13:40',
        actor: '시스템',
        description: '−18.4°C · 허용 상한 −18°C 근접',
        tone: 'warning',
      },
      daily('h2', '2026-11-06 07:35', MES_PEOPLE.maint, '−21.0°C'),
      {
        id: 'h1',
        title: '정기 점검',
        time: '2026-10-11 15:20',
        actor: MES_PEOPLE.maint,
        description: '도어 가스켓 교체',
        tone: 'success',
      },
    ],
  },
];

/** 설비 가동률(%): 라인 설비는 계획 가동 시간, 보관 설비는 24시간 기준 */
export const equipmentAvailability = (e: Equipment) =>
  Math.round(
    (e.runMin / (LINES.some((l) => l.id === e.lineId) ? PLANT.plannedMin : 1_440)) * 1000,
  ) / 10;
export const sensorNow = (e: Equipment) => e.sensor.values[e.sensor.values.length - 1]!;

/* ── 품질 검사 ─────────────────────────────────────────── */

export const DISPOSITIONS = {
  return: { label: '반품', description: '공급사에 돌려보내고 재고에 넣지 않습니다' },
  scrap: { label: '폐기', description: '폐기 대장에 기록하고 재고에서 뺍니다' },
  rework: { label: '재작업', description: '해당 로트를 라인에 다시 넣어 재포장합니다' },
} as const;
export type Disposition = keyof typeof DISPOSITIONS;

export interface InspectionCheck {
  name: string;
  standard: string;
  measured: string;
  result: QualityResult;
}

export interface Inspection {
  id: string;
  kind: 'incoming' | 'process';
  at: string;
  /** 연결 문서(입고 GR · 작업지시 WO) */
  ref: string;
  itemName: string;
  itemCode: string;
  lot: string;
  /** 거래처(수입 검사) 또는 라인(공정 검사) */
  source: string;
  lotQty: number;
  sample: number;
  defectQty: number;
  unit: string;
  result: QualityResult;
  disposition?: Disposition;
  defectType?: string;
  inspector: string;
  note?: string;
  checks: readonly InspectionCheck[];
}

const C = (name: string, standard: string, measured: string, result: QualityResult = 'pass') => ({
  name,
  standard,
  measured,
  result,
});

export const INSPECTIONS: readonly Inspection[] = [
  {
    id: 'QI-2611-0126',
    kind: 'process',
    at: `${TODAY} 14:00`,
    ref: 'WO-2611-0061',
    itemName: '냉동 흰다리새우 500g 소포장',
    itemCode: 'FG-5001',
    lot: 'P261106-1C',
    source: '1라인',
    lotQty: 176,
    sample: 20,
    defectQty: 3,
    unit: 'EA',
    result: 'hold',
    defectType: '실링 불량',
    inspector: MES_PEOPLE.qc,
    note: '실링 불량 3EA 연속 · 진공포장기 1호 실링 온도 확인 요청',
    checks: [
      C('중량', '500g 이상', '평균 503.1g'),
      C('실링 강도', '박리 없음', '3EA 박리', 'hold'),
      C('금속 검출', 'Fe 1.5 · SUS 2.0 검출', '정상'),
      C('라벨 표기', '유통기한 · 로트 일치', '일치'),
      C('중심 온도', '−18°C 이하', '−20.4°C'),
    ],
  },
  {
    id: 'QI-2611-0125',
    kind: 'process',
    at: `${TODAY} 13:00`,
    ref: 'WO-2611-0062',
    itemName: '냉동 가리비 관자 300g 소포장',
    itemCode: 'FG-5002',
    lot: 'P261106-2B',
    source: '2라인',
    lotQty: 96,
    sample: 20,
    defectQty: 6,
    unit: 'EA',
    result: 'fail',
    defectType: '중량 미달',
    inspector: MES_PEOPLE.qc,
    note: '표본 20EA 중 6EA가 300g 미만 · 최저 291g',
    checks: [
      C('중량', '300g 이상', '6EA 미달 · 최저 291g', 'fail'),
      C('실링 강도', '박리 없음', '이상 없음'),
      C('금속 검출', 'Fe 1.5 · SUS 2.0 검출', '정상'),
      C('라벨 표기', '유통기한 · 로트 일치', '일치'),
      C('중심 온도', '−18°C 이하', '−19.8°C'),
    ],
  },
  {
    id: 'QI-2611-0124',
    kind: 'process',
    at: `${TODAY} 11:30`,
    ref: 'WO-2611-0061',
    itemName: '냉동 흰다리새우 500g 소포장',
    itemCode: 'FG-5001',
    lot: 'P261106-1B',
    source: '1라인',
    lotQty: 184,
    sample: 20,
    defectQty: 1,
    unit: 'EA',
    result: 'pass',
    inspector: MES_PEOPLE.qc,
    note: '실링 불량 1EA · 기준 이내',
    checks: [
      C('중량', '500g 이상', '평균 502.6g'),
      C('실링 강도', '박리 없음', '1EA 박리 · 기준 이내'),
      C('금속 검출', 'Fe 1.5 · SUS 2.0 검출', '정상'),
      C('라벨 표기', '유통기한 · 로트 일치', '일치'),
      C('중심 온도', '−18°C 이하', '−20.9°C'),
    ],
  },
  {
    id: 'QI-2611-0123',
    kind: 'incoming',
    at: `${TODAY} 10:05`,
    ref: 'GR-2611-0031',
    itemName: '냉동 가리비 관자',
    itemCode: 'FD-1003',
    lot: 'HK261101',
    source: 'Hokkai Marine Foods',
    lotQty: 588,
    sample: 588,
    defectQty: 12,
    unit: 'KG',
    result: 'hold',
    defectType: '포장 파손',
    inspector: MES_PEOPLE.qc,
    note: '전수 외관 검사 · 12kg 파손 의심 · 사진 첨부 · 공급사 확인 요청',
    checks: [
      C('중심 온도', '−18°C 이하', '−19.4°C'),
      C('외관 · 해동 흔적', '해동 · 재동결 흔적 없음', '이상 없음'),
      C('포장 상태', '박스 파손 없음', '6박스 12kg 파손', 'hold'),
      C('표기 중량', '표기 대비 −1% 이내', '−0.4%'),
      C('서류', '위생증명서 · 원산지 증명', '확인'),
    ],
  },
  {
    id: 'QI-2611-0122',
    kind: 'process',
    at: `${TODAY} 10:00`,
    ref: 'WO-2611-0062',
    itemName: '냉동 가리비 관자 300g 소포장',
    itemCode: 'FG-5002',
    lot: 'P261106-2A',
    source: '2라인',
    lotQty: 278,
    sample: 20,
    defectQty: 0,
    unit: 'EA',
    result: 'pass',
    inspector: MES_PEOPLE.qc,
    checks: [
      C('중량', '300g 이상', '평균 303.8g'),
      C('실링 강도', '박리 없음', '이상 없음'),
      C('금속 검출', 'Fe 1.5 · SUS 2.0 검출', '정상'),
      C('라벨 표기', '유통기한 · 로트 일치', '일치'),
      C('중심 온도', '−18°C 이하', '−20.2°C'),
    ],
  },
  {
    id: 'QI-2611-0121',
    kind: 'process',
    at: `${TODAY} 09:30`,
    ref: 'WO-2611-0061',
    itemName: '냉동 흰다리새우 500g 소포장',
    itemCode: 'FG-5001',
    lot: 'P261106-1A',
    source: '1라인',
    lotQty: 260,
    sample: 20,
    defectQty: 0,
    unit: 'EA',
    result: 'pass',
    inspector: MES_PEOPLE.qc,
    checks: [
      C('중량', '500g 이상', '평균 503.4g'),
      C('실링 강도', '박리 없음', '이상 없음'),
      C('금속 검출', 'Fe 1.5 · SUS 2.0 검출', '정상'),
      C('라벨 표기', '유통기한 · 로트 일치', '일치'),
      C('중심 온도', '−18°C 이하', '−21.0°C'),
    ],
  },
  {
    id: 'QI-2611-0117',
    kind: 'process',
    at: '2026-11-05 15:00',
    ref: 'WO-2611-0058',
    itemName: '냉동 흰다리새우 500g 소포장',
    itemCode: 'FG-5001',
    lot: 'P261105-1D',
    source: '1라인',
    lotQty: 190,
    sample: 20,
    defectQty: 0,
    unit: 'EA',
    result: 'pass',
    inspector: MES_PEOPLE.qc,
    checks: [
      C('중량', '500g 이상', '평균 502.9g'),
      C('실링 강도', '박리 없음', '이상 없음'),
      C('금속 검출', 'Fe 1.5 · SUS 2.0 검출', '정상'),
      C('중심 온도', '−18°C 이하', '−20.6°C'),
    ],
  },
  {
    id: 'QI-2611-0120',
    kind: 'incoming',
    at: '2026-11-04 14:30',
    ref: 'GR-2611-0026',
    itemName: '라벨 프린터 리본',
    itemCode: 'SP-3001',
    lot: '–',
    source: '미래패키징',
    lotQty: 60,
    sample: 5,
    defectQty: 0,
    unit: 'EA',
    result: 'pass',
    inspector: MES_PEOPLE.qc,
    checks: [C('규격', '110mm × 300m', '일치'), C('인쇄 테스트', '번짐 · 끊김 없음', '이상 없음')],
  },
  {
    id: 'QI-2611-0119',
    kind: 'incoming',
    at: '2026-11-04 09:35',
    ref: 'GR-2611-0027',
    itemName: '발사믹 식초',
    itemCode: 'FD-1005',
    lot: 'OS2610B',
    source: 'Olivar del Sur S.L.',
    lotQty: 160,
    sample: 6,
    defectQty: 0,
    unit: 'BOX',
    result: 'pass',
    inspector: MES_PEOPLE.qc,
    checks: [
      C('외관 · 파손', '병 파손 · 누액 없음', '이상 없음'),
      C('표시 사항', '한글 표시 · 유통기한', '확인'),
      C('서류', '수입식품 신고필증', '확인'),
    ],
  },
  {
    id: 'QI-2611-0118',
    kind: 'incoming',
    at: '2026-11-04 09:20',
    ref: 'GR-2611-0027',
    itemName: '엑스트라버진 올리브오일',
    itemCode: 'FD-1002',
    lot: 'OS2610A',
    source: 'Olivar del Sur S.L.',
    lotQty: 180,
    sample: 6,
    defectQty: 0,
    unit: 'CTN',
    result: 'pass',
    inspector: MES_PEOPLE.qc,
    checks: [
      C('외관 · 파손', '병 파손 · 누액 없음', '이상 없음'),
      C('표시 사항', '한글 표시 · 유통기한', '확인'),
      C('서류', '수입식품 신고필증', '확인'),
    ],
  },
  {
    id: 'QI-2610-0096',
    kind: 'incoming',
    at: '2026-10-20 10:50',
    ref: 'GR-2611-0025',
    itemName: '냉동 가리비 관자',
    itemCode: 'FD-1003',
    lot: 'HK261009',
    source: 'Hokkai Marine Foods',
    lotQty: 20,
    sample: 20,
    defectQty: 20,
    unit: 'KG',
    result: 'fail',
    disposition: 'return',
    defectType: '해동 흔적',
    inspector: MES_PEOPLE.qc,
    note: '해동 흔적 · 전량 반품',
    checks: [
      C('중심 온도', '−18°C 이하', '−11.2°C', 'fail'),
      C('외관 · 해동 흔적', '해동 · 재동결 흔적 없음', '드립 · 성에 뭉침', 'fail'),
      C('서류', '위생증명서 · 원산지 증명', '확인'),
    ],
  },
];

/** 이번 주(11월 2일~6일) 공정 · 수입 검사 불량 유형(EA · 수입 파손은 박스) */
export const WEEK_DEFECTS = [
  { label: '실링 불량', value: 46 },
  { label: '중량 미달', value: 31 },
  { label: '라벨 오부착', value: 18 },
  { label: '포장 파손', value: 9 },
  { label: '금속 검출', value: 5 },
];

/* ── 배송 · 배차 ───────────────────────────────────────── */

export const DELIVERY_STATES = {
  unassigned: { label: '배차 대기', tone: 'neutral' },
  assigned: { label: '배차 완료', tone: 'info' },
  shipping: { label: '배송 중', tone: 'info' },
  delivered: { label: '배송 완료', tone: 'success' },
  hold: { label: '출고 보류', tone: 'warning' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type DeliveryState = keyof typeof DELIVERY_STATES;

export interface Consignee {
  id: string;
  name: string;
  /** trade PARTIES와 같은 거래처면 그 id */
  partyId?: string;
  region: string;
  address: string;
  contact: string;
  phone: string;
  dock: string;
}

export const CONSIGNEES: readonly Consignee[] = [
  {
    id: 'c01',
    partyId: 'p01',
    name: '대양상사',
    region: '서울',
    address: '서울특별시 중구 을지로 170, 지하 1층',
    contact: '오세훈 과장',
    phone: '02-3456-1200',
    dock: '지하 1층 냉동창고 · 화물 엘리베이터',
  },
  {
    id: 'c02',
    partyId: 'p02',
    name: '한결물산',
    region: '경기 남부',
    address: '경기도 용인시 기흥구 중부대로 242, 물류동',
    contact: '장미래 대리',
    phone: '031-778-4410',
    dock: '물류동 2번 도크 · 후진 진입',
  },
  {
    id: 'c03',
    partyId: 'p03',
    name: '누리식품',
    region: '부산',
    address: '부산광역시 사하구 감천항로 8, 냉동창고 3동',
    contact: '한지민 팀장',
    phone: '051-602-3300',
    dock: '3동 하역장',
  },
  {
    id: 'c04',
    partyId: 'p04',
    name: '서해통상',
    region: '인천',
    address: '인천광역시 중구 연안부두로 47',
    contact: '임도윤 차장',
    phone: '032-881-7020',
    dock: '정문 하역장',
  },
  {
    id: 'c05',
    name: '온누리급식 평택센터',
    region: '경기 남부',
    address: '경기도 평택시 포승읍 평택항로 156',
    contact: '유재민 실장',
    phone: '031-683-2201',
    dock: '후문 검수실',
  },
  {
    id: 'c06',
    name: '바른식자재 수원',
    region: '경기 남부',
    address: '경기도 수원시 권선구 산업로 88',
    contact: '홍석진 대리',
    phone: '031-296-5530',
    dock: '1층 냉동고 앞',
  },
  {
    id: 'c07',
    name: '청담키친 판교점',
    region: '경기 동부',
    address: '경기도 성남시 분당구 판교역로 146, 지하 1층',
    contact: '김나래 실장',
    phone: '031-8016-2270',
    dock: '지하 2층 하역장 · 주방 직납',
  },
  {
    id: 'c08',
    name: '해든마트 천안점',
    region: '충청',
    address: '충청남도 천안시 서북구 불당대로 300',
    contact: '이경호 점장',
    phone: '041-569-7710',
    dock: '후면 하역장',
  },
  {
    id: 'c09',
    name: '새벽수산 안산',
    region: '경기 서부',
    address: '경기도 안산시 단원구 산단로 325',
    contact: '최은비 대리',
    phone: '031-494-8820',
    dock: '냉동창고 2번 문',
  },
];

export const consigneeById = (id: string) => CONSIGNEES.find((c) => c.id === id)!;

export interface Truck {
  id: string;
  plate: string;
  type: string;
  capacityKg: number;
  /** 냉동 화물을 실을 수 있는지 */
  cold: boolean;
  carrier: string;
  driver: string;
  phone: string;
  /** 적재함 온도(°C). 상온 차량은 없음 */
  tempNow?: number;
  round: string;
  departAt: string;
}

export const TRUCKS: readonly Truck[] = [
  {
    id: 't1',
    plate: '82가 4127',
    type: '1톤 냉동탑',
    capacityKg: 1_000,
    cold: true,
    carrier: '자차',
    driver: '박영길 기사',
    phone: '010-4127-3301',
    tempNow: -19.2,
    round: '1회차 운행 중',
    departAt: '08:40',
  },
  {
    id: 't2',
    plate: '85나 2290',
    type: '2.5톤 냉동탑',
    capacityKg: 2_500,
    cold: true,
    carrier: '자차',
    driver: '이상훈 기사',
    phone: '010-2290-5512',
    tempNow: -20.4,
    round: '2회차 15:00 출발',
    departAt: '15:00',
  },
  {
    id: 't3',
    plate: '87다 6610',
    type: '1톤 탑차',
    capacityKg: 1_000,
    cold: false,
    carrier: '자차',
    driver: '오민석 기사',
    phone: '010-6610-2214',
    round: '2회차 15:30 출발',
    departAt: '15:30',
  },
  {
    id: 't4',
    plate: '경기 87바 5521',
    type: '5톤 냉동 윙바디',
    capacityKg: 5_000,
    cold: true,
    carrier: '동방로지스',
    driver: '한기탁 기사',
    phone: '010-5521-7780',
    tempNow: -18.8,
    round: '부산 간선 17:00 출발',
    departAt: '17:00',
  },
];

export const truckById = (id: string) => TRUCKS.find((t) => t.id === id)!;

export interface DeliveryOrder {
  id: string;
  consigneeId: string;
  /** 매출 세금계산서(trade INVOICES) */
  invoiceId?: string;
  items: string;
  boxes: number;
  weightKg: number;
  cold: boolean;
  /** 도착 희망 시간 */
  window: string;
  truckId: string | null;
  state: DeliveryState;
  /** 경로 순서(배차된 차량 안) */
  seq?: number;
  eta?: string;
  deliveredAt?: string;
  /** 평택 냉동센터에서 거리(km) */
  distanceKm: number;
  /** 배차 제안(확정 전) */
  suggested?: string;
  note?: string;
}

export const DELIVERY_ORDERS: readonly DeliveryOrder[] = [
  {
    id: 'DO-2611-0151',
    consigneeId: 'c01',
    invoiceId: 'TI-2611-0118',
    items: '흰다리새우 220BOX · 연어 필렛 180KG',
    boxes: 235,
    weightKg: 690,
    cold: true,
    window: '17:00~19:00',
    truckId: 't2',
    state: 'assigned',
    seq: 2,
    eta: '17:20',
    distanceKm: 68,
  },
  {
    id: 'DO-2611-0152',
    consigneeId: 'c02',
    invoiceId: 'TI-2611-0117',
    items: '올리브오일 24CTN · 발사믹 식초 40BOX',
    boxes: 64,
    weightKg: 492,
    cold: false,
    window: '16:00~18:00',
    truckId: 't3',
    state: 'assigned',
    seq: 1,
    eta: '16:20',
    distanceKm: 42,
  },
  {
    id: 'DO-2611-0153',
    consigneeId: 'c03',
    invoiceId: 'TI-2611-0116',
    items: '가리비 관자 90KG · 아이스박스 300EA',
    boxes: 24,
    weightKg: 234,
    cold: true,
    window: '11-07 07:00~09:00',
    truckId: 't4',
    state: 'assigned',
    seq: 2,
    eta: '11-07 07:30',
    distanceKm: 352,
  },
  {
    id: 'DO-2611-0154',
    consigneeId: 'c04',
    items: '식품용 PE 랩 120EA · 보냉팩 1,000EA',
    boxes: 30,
    weightKg: 692,
    cold: false,
    window: '16:00~18:00',
    truckId: null,
    state: 'hold',
    distanceKm: 92,
    note: '거래처 휴업 11월 1일부터 · 영업팀 확인 전 출고 보류',
  },
  {
    id: 'DO-2611-0155',
    consigneeId: 'c05',
    items: '흰다리새우 500g 소포장 240EA',
    boxes: 12,
    weightKg: 136,
    cold: true,
    window: '09:00~10:00',
    truckId: 't1',
    state: 'delivered',
    seq: 1,
    eta: '09:30',
    deliveredAt: '09:42',
    distanceKm: 8,
  },
  {
    id: 'DO-2611-0156',
    consigneeId: 'c06',
    items: '관자 300g 160EA · 연어 200g 120EA',
    boxes: 14,
    weightKg: 84,
    cold: true,
    window: '10:30~11:30',
    truckId: 't1',
    state: 'delivered',
    seq: 2,
    eta: '10:50',
    deliveredAt: '11:05',
    distanceKm: 46,
  },
  {
    id: 'DO-2611-0157',
    consigneeId: 'c02',
    items: '흰다리새우 500g 소포장 200EA',
    boxes: 10,
    weightKg: 112,
    cold: true,
    window: '14:30~15:30',
    truckId: 't1',
    state: 'shipping',
    seq: 3,
    eta: '14:50',
    distanceKm: 42,
  },
  {
    id: 'DO-2611-0158',
    consigneeId: 'c07',
    items: '가리비 관자 300g 60EA · 연어 필렛 40KG',
    boxes: 7,
    weightKg: 68,
    cold: true,
    window: '15:30~16:30',
    truckId: 't1',
    state: 'shipping',
    seq: 4,
    eta: '15:40',
    distanceKm: 51,
  },
  {
    id: 'DO-2611-0159',
    consigneeId: 'c08',
    items: '새우 1kg 업소용 80EA · 보냉팩 400EA',
    boxes: 12,
    weightKg: 284,
    cold: true,
    window: '11-07 08:00~10:00',
    truckId: null,
    state: 'unassigned',
    distanceKm: 58,
    suggested: 't4',
  },
  {
    id: 'DO-2611-0160',
    consigneeId: 'c09',
    items: '흰다리새우 2kg 60BOX',
    boxes: 60,
    weightKg: 132,
    cold: true,
    window: '17:30~18:30',
    truckId: null,
    state: 'unassigned',
    distanceKm: 55,
    suggested: 't2',
  },
  {
    id: 'DO-2611-0161',
    consigneeId: 'c06',
    items: '크라프트 박스 1,000EA · 아이스박스 200EA',
    boxes: 30,
    weightKg: 410,
    cold: false,
    window: '16:30~17:30',
    truckId: null,
    state: 'unassigned',
    distanceKm: 46,
    suggested: 't3',
  },
  {
    id: 'DO-2611-0162',
    consigneeId: 'c01',
    items: '엑스트라버진 올리브오일 12CTN',
    boxes: 12,
    weightKg: 162,
    cold: false,
    window: '17:00~19:00',
    truckId: null,
    state: 'unassigned',
    distanceKm: 68,
  },
];

/** 기사 앱: 82가 4127 박영길 기사의 1회차 */
export const DRIVER_TRUCK_ID = 't1';

/** 적재함 온도 기록(오늘) */
export const TEMP_LOG: readonly { time: string; value: number }[] = [
  { time: '08:35', value: -20.8 },
  { time: '09:40', value: -19.6 },
  { time: '10:20', value: -20.1 },
  { time: '11:05', value: -19.4 },
  { time: '12:40', value: -20.0 },
  { time: '13:50', value: -19.2 },
];

/** 박스 송장 바코드: 배송 번호 + 박스 순번 */
export const boxCodes = (o: DeliveryOrder) =>
  Array.from({ length: o.boxes }, (_, i) => `${o.id}-${String(i + 1).padStart(2, '0')}`);

/* ── 시각 도우미 ───────────────────────────────────────── */

/** 'HH:MM'에 분을 더한다(같은 날 안) */
export const addMinutes = (hhmm: string, minutes: number) => {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

/** 분을 '5시간 8분'으로 */
export const durationLabel = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? (m ? `${h}시간 ${m}분` : `${h}시간`) : `${m}분`;
};
