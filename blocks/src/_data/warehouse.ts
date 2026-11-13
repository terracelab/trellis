// 창고 위치 · 재고 실사 · 피킹 샘플(PG-38). 위치별 수량의 합 = trade.ts STOCK(품목 × 창고)의 장부 수량.
// 위치 코드는 "창고-구역-선반"(W1-A-02). 단위 환산은 QuantityInput units(factor 1 = 품목 기준 단위).
import type { ProgressState, QuantityUnit } from '@terracelab/trellis-contracts';
import { itemById, warehouseById } from './trade.js';

/* ── 위치 ──────────────────────────────────────────────── */

export interface Zone {
  warehouseId: string;
  /** 구역 문자(A · B · F) */
  code: string;
  /** 구역 이름(무엇을 두는 곳) */
  name: string;
}

export const ZONES: readonly Zone[] = [
  { warehouseId: 'w1', code: 'A', name: '포장재' },
  { warehouseId: 'w1', code: 'B', name: '소모품' },
  { warehouseId: 'w2', code: 'F', name: '냉동 수산물' },
];

export interface Location {
  /** 창고-구역-선반 */
  code: string;
  warehouseId: string;
  zone: string;
  shelf: string;
}

const loc = (warehouseId: string, zone: string, shelf: string): Location => ({
  code: `${warehouseId.toUpperCase()}-${zone}-${shelf}`,
  warehouseId,
  zone,
  shelf,
});

/** 창고 → 구역 → 선반 순서(피킹 동선 순서와 같다) */
export const LOCATIONS: readonly Location[] = [
  loc('w1', 'A', '01'),
  loc('w1', 'A', '02'),
  loc('w1', 'A', '03'),
  loc('w1', 'A', '04'),
  loc('w1', 'B', '01'),
  loc('w1', 'B', '02'),
  loc('w1', 'B', '03'),
  loc('w2', 'F', '01'),
  loc('w2', 'F', '02'),
  loc('w2', 'F', '03'),
];

export const locationByCode = (code: string) => LOCATIONS.find((l) => l.code === code)!;
export const zoneOf = (l: Pick<Location, 'warehouseId' | 'zone'>) =>
  ZONES.find((z) => z.warehouseId === l.warehouseId && z.code === l.zone)!;
/** 위치 순서(피킹 동선) */
export const locationOrder = (code: string) => LOCATIONS.findIndex((l) => l.code === code);
/** "이천 1센터 · A구역 포장재" */
export const locationPlace = (l: Location) =>
  `${warehouseById(l.warehouseId).name} · ${l.zone}구역 ${zoneOf(l).name}`;

/** 위치별 장부 수량(품목 기준 단위). 품목 × 창고 합 = STOCK.qty */
export interface BinStock {
  location: string;
  itemId: string;
  lot?: string;
  qty: number;
}

export const BIN_STOCK: readonly BinStock[] = [
  { location: 'W1-A-01', itemId: 'i06', qty: 2_400 },
  { location: 'W1-A-02', itemId: 'i06', qty: 1_800 },
  { location: 'W1-A-02', itemId: 'i08', qty: 540 },
  { location: 'W1-A-03', itemId: 'i08', qty: 600 },
  { location: 'W1-A-04', itemId: 'i10', qty: 72 },
  { location: 'W1-B-01', itemId: 'i07', qty: 780 },
  { location: 'W1-B-02', itemId: 'i09', qty: 7_600 },
  { location: 'W1-B-03', itemId: 'i09', qty: 5_000 },
  { location: 'W1-B-03', itemId: 'i07', qty: 200 },
  { location: 'W2-F-01', itemId: 'i01', lot: 'PS2609C', qty: 132 },
  { location: 'W2-F-02', itemId: 'i01', lot: 'PS2610A', qty: 180 },
  { location: 'W2-F-02', itemId: 'i03', lot: 'HK260921', qty: 128 },
  { location: 'W2-F-03', itemId: 'i04', lot: 'PS2610B', qty: 410 },
];

/** 품목별 포장 단위(factor = 기준 단위 몇 개). 없는 품목은 기준 단위 하나 */
export const PACK_UNITS: Readonly<Record<string, readonly QuantityUnit[]>> = {
  i01: [
    { unit: 'BOX', factor: 1 },
    { unit: 'PLT', factor: 60 },
  ],
  i03: [
    { unit: 'KG', factor: 1 },
    { unit: 'BOX', factor: 10 },
  ],
  i04: [
    { unit: 'KG', factor: 1 },
    { unit: 'BOX', factor: 12 },
  ],
  i06: [
    { unit: 'EA', factor: 1 },
    { unit: 'BDL', factor: 50 },
  ],
  i07: [
    { unit: 'EA', factor: 1 },
    { unit: 'BDL', factor: 10 },
  ],
  i08: [
    { unit: 'EA', factor: 1 },
    { unit: 'BOX', factor: 6 },
  ],
  i09: [
    { unit: 'EA', factor: 1 },
    { unit: 'BOX', factor: 40 },
  ],
  i10: [
    { unit: 'EA', factor: 1 },
    { unit: 'BOX', factor: 10 },
  ],
};
export const unitsOf = (itemId: string): readonly QuantityUnit[] =>
  PACK_UNITS[itemId] ?? [{ unit: itemById(itemId).unit, factor: 1 }];

/* ── 재고 실사 ─────────────────────────────────────────── */

/** 실사 차이 사유(재고 조정 전표의 적요) */
export const COUNT_REASONS = [
  { value: 'damage', label: '파손 · 폐기' },
  { value: 'receipt', label: '입고 수량 차이' },
  { value: 'issue', label: '출고 누락' },
  { value: 'misplaced', label: '위치 오류' },
  { value: 'other', label: '기타' },
] as const;
export type CountReason = (typeof COUNT_REASONS)[number]['value'];

/** 실사표 한 줄: 위치 × 품목(× 로트). counted는 unit 단위, 아직 안 셌으면 null */
export interface CountLine {
  id: string;
  location: string;
  itemId: string;
  lot?: string;
  /** 장부 수량(기준 단위) */
  book: number;
  counted: number | null;
  /** 센 단위(PACK_UNITS의 하나) */
  unit: string;
  reason?: CountReason;
}

/** 11월 순환 실사(이천 1센터 · 평택 냉동센터). 반쯤 센 상태 */
export const COUNT = {
  id: 'CC-2611-02',
  title: '11월 순환 실사',
  /** 장부 수량 기준 시각(재고 마감 배치) */
  bookAt: '2026-11-05 23:30',
  warehouseIds: ['w1', 'w2'],
  lines: [
    { location: 'W1-A-01', itemId: 'i06', counted: 49, unit: 'BDL', reason: 'receipt' },
    { location: 'W1-A-02', itemId: 'i06', counted: 1_800, unit: 'EA' },
    { location: 'W1-A-02', itemId: 'i08', counted: 540, unit: 'EA' },
    { location: 'W1-A-03', itemId: 'i08', counted: 99, unit: 'BOX', reason: 'damage' },
    { location: 'W1-A-04', itemId: 'i10', counted: 72, unit: 'EA' },
    { location: 'W1-B-01', itemId: 'i07', counted: null, unit: 'EA' },
    { location: 'W1-B-02', itemId: 'i09', counted: 189, unit: 'BOX', reason: 'damage' },
    { location: 'W1-B-03', itemId: 'i09', counted: null, unit: 'BOX' },
    { location: 'W1-B-03', itemId: 'i07', counted: null, unit: 'EA' },
    { location: 'W2-F-01', itemId: 'i01', counted: 131, unit: 'BOX', reason: 'damage' },
    { location: 'W2-F-02', itemId: 'i01', counted: null, unit: 'BOX' },
    { location: 'W2-F-02', itemId: 'i03', counted: null, unit: 'KG' },
    { location: 'W2-F-03', itemId: 'i04', counted: null, unit: 'KG' },
  ].map((l, i): CountLine => {
    const bin = BIN_STOCK.find((b) => b.location === l.location && b.itemId === l.itemId)!;
    return {
      id: `cl${String(i + 1).padStart(2, '0')}`,
      ...l,
      ...(bin.lot ? { lot: bin.lot } : {}),
      book: bin.qty,
      reason: l.reason as CountReason | undefined,
    } as CountLine;
  }),
};

/* ── 피킹 ──────────────────────────────────────────────── */

export const PICK_LINE_STATES = {
  pending: { label: '대기', tone: 'neutral' },
  picked: { label: '완료', tone: 'success' },
  short: { label: '부족', tone: 'warning' },
} as const;
export type PickLineState = keyof typeof PICK_LINE_STATES;

/** 피킹 줄: 위치 순서로 걷는다. qty · picked는 기준 단위 */
export interface PickLine {
  id: string;
  location: string;
  itemId: string;
  lot?: string;
  qty: number;
  picked: number | null;
  /** 이 줄을 부르는 문서(수주 · 작업지시) */
  ref: string;
  state: PickLineState;
  /** 피킹할 때 고른 단위 */
  unit: string;
  /** 위치에 실제로 있는 수량(장부와 다르면 부족이 난다). 데모가 부족 처리를 보여 주려고 둔다 */
  onHand?: number;
}

export interface PickList {
  id: string;
  warehouseId: string;
  /** 출고 · 자재 출고 묶음 이름 */
  title: string;
  /** 피킹 시작 예정(오늘 · 내일) */
  date: string;
  state: ProgressState;
  picker: string;
  lines: readonly PickLine[];
}

const L = (
  id: string,
  location: string,
  itemId: string,
  qty: number,
  ref: string,
  extra: Partial<PickLine> = {},
): PickLine => {
  const bin = BIN_STOCK.find((b) => b.location === location && b.itemId === itemId);
  return {
    id,
    location,
    itemId,
    qty,
    ref,
    picked: null,
    state: 'pending',
    unit: itemById(itemId).unit,
    ...(bin?.lot ? { lot: bin.lot } : {}),
    ...extra,
  };
};

/** 오늘 피킹. 첫 목록이 진행 중(두 줄 끝), 아이스박스 줄은 선반에 360EA뿐이라 부족이 난다 */
export const PICK_LISTS: readonly PickList[] = [
  {
    id: 'PK-2611-0031',
    warehouseId: 'w1',
    title: '오후 출고 · 자재 출고',
    date: '2026-11-06',
    state: 'doing',
    picker: 'u05',
    lines: [
      L('pl1', 'W1-A-01', 'i06', 600, 'SO-2611-0035', {
        picked: 600,
        state: 'picked',
        unit: 'BDL',
      }),
      L('pl2', 'W1-A-02', 'i06', 400, 'SO-2611-0035', { picked: 400, state: 'picked' }),
      L('pl3', 'W1-A-03', 'i08', 12, 'WO-2611-0016', { unit: 'BOX' }),
      L('pl4', 'W1-A-04', 'i10', 2, 'WO-2611-0016'),
      L('pl5', 'W1-B-01', 'i07', 400, 'SO-2611-0035', { onHand: 360 }),
      L('pl6', 'W1-B-02', 'i09', 800, 'WO-2611-0017', { unit: 'BOX' }),
    ],
  },
  {
    id: 'PK-2611-0030',
    warehouseId: 'w2',
    title: '냉동 출고',
    date: '2026-11-06',
    state: 'done',
    picker: 'u08',
    lines: [L('pk1', 'W2-F-03', 'i04', 200, 'SO-2611-0033', { picked: 200, state: 'picked' })],
  },
  {
    id: 'PK-2611-0032',
    warehouseId: 'w2',
    title: '냉동 출고 · 선입선출',
    date: '2026-11-09',
    state: 'todo',
    picker: 'u08',
    lines: [
      L('pm1', 'W2-F-01', 'i01', 131, 'SO-2611-0034'),
      L('pm2', 'W2-F-02', 'i01', 169, 'SO-2611-0034'),
    ],
  },
];

/** 이 품목이 있는 다른 위치(부족할 때 고르는 곳). 장부 수량 큰 순 */
export const otherBins = (itemId: string, except: string) =>
  BIN_STOCK.filter((b) => b.itemId === itemId && b.location !== except).sort(
    (a, b) => b.qty - a.qty,
  );
