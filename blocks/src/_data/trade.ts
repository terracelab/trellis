// 무역 회사 샘플 데이터(테라트레이딩(주), 수입 식자재 · 포장재 유통). 모든 블록이 이 숫자 하나를 쓴다.
// 날짜는 TODAY 기준으로 고정(결정적). 회사 · 거래처 이름은 예시다.
import type {
  ApprovalState,
  AttachmentFile,
  CurrencyCode,
  InvoiceState,
  QualityResult,
  ReceivingState,
  ShipmentState,
  StatusTone,
} from '@terracelab/trellis-contracts';

export const TODAY = '2026-11-06';

/* ── 기준 정보 ──────────────────────────────────────────── */

export interface Party {
  id: string;
  code: string;
  name: string;
  bizNo?: string;
  country: string;
  kind: readonly ('customer' | 'supplier')[];
  currency: CurrencyCode;
  manager: string;
  phone: string;
  email: string;
  terms: string;
  creditLimit?: number;
  /** 국세청 사업자 상태 조회 결과(배치) */
  bizStatus: 'active' | 'suspended' | 'closed' | 'foreign';
  /** 휴업 · 폐업 시작일 */
  bizStatusSince?: string;
}

export const PARTIES: readonly Party[] = [
  {
    id: 'p01',
    code: 'C1001',
    name: '대양상사',
    bizNo: '1208645321',
    country: 'KR',
    kind: ['customer'],
    currency: 'KRW',
    manager: '오세훈 과장',
    phone: '02-3456-1200',
    email: 'order@daeyang.example',
    terms: '월말 정산 30일',
    creditLimit: 300_000_000,
    bizStatus: 'active',
  },
  {
    id: 'p02',
    code: 'C1002',
    name: '한결물산',
    bizNo: '2148612034',
    country: 'KR',
    kind: ['customer'],
    currency: 'KRW',
    manager: '장미래 대리',
    phone: '031-778-4410',
    email: 'buy@hangyeol.example',
    terms: '월말 정산 45일',
    creditLimit: 200_000_000,
    bizStatus: 'active',
  },
  {
    id: 'p03',
    code: 'C1003',
    name: '누리식품',
    bizNo: '3128177765',
    country: 'KR',
    kind: ['customer'],
    currency: 'KRW',
    manager: '한지민 팀장',
    phone: '051-602-3300',
    email: 'scm@nuri.example',
    terms: '15일 정산',
    creditLimit: 150_000_000,
    bizStatus: 'active',
  },
  {
    id: 'p04',
    code: 'C1004',
    name: '서해통상',
    bizNo: '1358129940',
    country: 'KR',
    kind: ['customer', 'supplier'],
    currency: 'KRW',
    manager: '임도윤 차장',
    phone: '032-881-7020',
    email: 'trade@seohae.example',
    terms: '월말 정산 30일',
    creditLimit: 120_000_000,
    bizStatus: 'suspended',
    bizStatusSince: '2026-11-01',
  },
  {
    id: 'p05',
    code: 'S2001',
    name: '미래패키징',
    bizNo: '1418650072',
    country: 'KR',
    kind: ['supplier'],
    currency: 'KRW',
    manager: '조윤서 과장',
    phone: '031-940-5521',
    email: 'sales@mirae-pack.example',
    terms: '익월 10일 지급',
    bizStatus: 'active',
  },
  {
    id: 'p06',
    code: 'S2002',
    name: '동방로지스',
    bizNo: '6218133458',
    country: 'KR',
    kind: ['supplier'],
    currency: 'KRW',
    manager: '백승현 대리',
    phone: '051-463-9900',
    email: 'cs@dongbang.example',
    terms: '월말 정산',
    bizStatus: 'active',
  },
  {
    id: 'p07',
    code: 'S3001',
    name: 'Pacific Seafoods Co.',
    country: 'US',
    kind: ['supplier'],
    currency: 'USD',
    manager: 'Emily Carter',
    phone: '+1-206-555-0142',
    email: 'export@pacificseafoods.example',
    terms: 'T/T 30일',
    bizStatus: 'foreign',
  },
  {
    id: 'p08',
    code: 'S3002',
    name: 'Olivar del Sur S.L.',
    country: 'ES',
    kind: ['supplier'],
    currency: 'EUR',
    manager: 'Javier Morales',
    phone: '+34-955-555-018',
    email: 'ventas@olivardelsur.example',
    terms: 'L/C at sight',
    bizStatus: 'foreign',
  },
  {
    id: 'p09',
    code: 'S3003',
    name: 'Hengtong Packaging Ltd.',
    country: 'CN',
    kind: ['supplier'],
    currency: 'CNY',
    manager: 'Li Wei',
    phone: '+86-21-5555-0188',
    email: 'sales@hengtong.example',
    terms: 'T/T 선금 30%',
    bizStatus: 'foreign',
  },
  {
    id: 'p10',
    code: 'S3004',
    name: 'Hokkai Marine Foods',
    country: 'JP',
    kind: ['supplier'],
    currency: 'JPY',
    manager: '佐藤 健',
    phone: '+81-11-555-0107',
    email: 'trade@hokkai.example',
    terms: 'T/T 45일',
    bizStatus: 'foreign',
  },
];

export interface Item {
  id: string;
  code: string;
  name: string;
  spec: string;
  /** 현장 표기 단위(EA · BOX · KG …). 회사마다 다르다 */
  unit: string;
  /** 품목 구분(ITEM_CATEGORIES의 id). 회사마다 다르다 */
  category: string;
  hsCode?: string;
  origin: string;
  safetyStock: number;
  /** 판매 단가(원) */
  price: number;
  /** 평균 원가(원) */
  cost: number;
  lotTracked: boolean;
  shelfLifeDays?: number;
  /** 과세 구분. 없으면 과세(10%) */
  taxType?: TaxType;
}

/** 품목 구분. goods = 판매 상품의 원 품목(상품 등록에서 고른다). 포장재 · 소모품은 false */
export const ITEM_CATEGORIES: readonly { id: string; goods: boolean }[] = [
  { id: '수입 식자재', goods: true },
  { id: '포장재', goods: false },
  { id: '소모품', goods: false },
];
export const isGoods = (i: Pick<Item, 'category'>) =>
  ITEM_CATEGORIES.find((c) => c.id === i.category)?.goods ?? true;

/**
 * 부가세 과세 구분(부가가치세법 고정 어휘). 면세는 세금계산서 대신 계산서를 발행하고 세액이 없다
 */
export type TaxType = 'taxed' | 'zero' | 'exempt';
export const TAX_TYPES: Record<TaxType, { label: string; rate: number; doc: string }> = {
  taxed: { label: '과세', rate: 0.1, doc: '세금계산서' },
  zero: { label: '영세율', rate: 0, doc: '세금계산서' },
  exempt: { label: '면세', rate: 0, doc: '계산서' },
};
/** 공급가액의 세액(원 단위 반올림) */
export const taxOf = (supply: number, type: TaxType = 'taxed') =>
  Math.round(supply * TAX_TYPES[type].rate);

export const ITEMS: readonly Item[] = [
  {
    id: 'i01',
    code: 'FD-1001',
    name: '냉동 흰다리새우',
    spec: '21/25 · 2kg',
    unit: 'BOX',
    category: '수입 식자재',
    hsCode: '0306.17',
    origin: '미국',
    safetyStock: 400,
    price: 38_500,
    cost: 29_800,
    lotTracked: true,
    shelfLifeDays: 540,
  },
  {
    id: 'i02',
    code: 'FD-1002',
    name: '엑스트라버진 올리브오일',
    spec: '1L · 12병',
    unit: 'CTN',
    category: '수입 식자재',
    hsCode: '1509.20',
    origin: '스페인',
    safetyStock: 120,
    price: 186_000,
    cost: 142_000,
    lotTracked: true,
    shelfLifeDays: 720,
  },
  {
    id: 'i03',
    code: 'FD-1003',
    name: '냉동 가리비 관자',
    spec: 'L · 1kg',
    unit: 'KG',
    category: '수입 식자재',
    hsCode: '0307.22',
    origin: '일본',
    safetyStock: 300,
    price: 52_000,
    cost: 41_500,
    lotTracked: true,
    shelfLifeDays: 365,
  },
  {
    id: 'i04',
    code: 'FD-1004',
    name: '냉동 연어 필렛',
    spec: '스킨온 · 1.2kg',
    unit: 'KG',
    category: '수입 식자재',
    hsCode: '0304.81',
    origin: '미국',
    safetyStock: 250,
    price: 31_000,
    cost: 24_200,
    lotTracked: true,
    shelfLifeDays: 365,
  },
  {
    id: 'i05',
    code: 'FD-1005',
    name: '발사믹 식초',
    spec: '500ml · 6병',
    unit: 'BOX',
    category: '수입 식자재',
    hsCode: '2209.00',
    origin: '스페인',
    safetyStock: 80,
    price: 58_000,
    cost: 41_000,
    lotTracked: true,
    shelfLifeDays: 1080,
  },
  {
    id: 'i06',
    code: 'PK-2001',
    name: '크라프트 박스 5호',
    spec: '400×300×250',
    unit: 'EA',
    category: '포장재',
    hsCode: '4819.10',
    origin: '중국',
    safetyStock: 5_000,
    price: 820,
    cost: 540,
    lotTracked: false,
  },
  {
    id: 'i07',
    code: 'PK-2002',
    name: '아이스박스 EPS 20L',
    spec: '내부 20L',
    unit: 'EA',
    category: '포장재',
    hsCode: '3923.10',
    origin: '국내',
    safetyStock: 1_200,
    price: 3_900,
    cost: 2_750,
    lotTracked: false,
  },
  {
    id: 'i08',
    code: 'PK-2003',
    name: '식품용 PE 랩',
    spec: '30cm × 500m',
    unit: 'EA',
    category: '포장재',
    hsCode: '3920.10',
    origin: '중국',
    safetyStock: 600,
    price: 12_400,
    cost: 8_900,
    lotTracked: false,
  },
  {
    id: 'i09',
    code: 'PK-2004',
    name: '보냉팩 젤 타입',
    spec: '500g',
    unit: 'EA',
    category: '포장재',
    origin: '국내',
    safetyStock: 3_000,
    price: 450,
    cost: 290,
    lotTracked: false,
  },
  {
    id: 'i10',
    code: 'SP-3001',
    name: '라벨 프린터 리본',
    spec: '110mm × 300m',
    unit: 'EA',
    category: '소모품',
    origin: '국내',
    safetyStock: 40,
    price: 18_000,
    cost: 12_500,
    lotTracked: false,
  },
];

export interface Warehouse {
  id: string;
  name: string;
  /** 창고 구분 이름(상온 · 냉동 · 보세 …). 화면에 그대로 보인다 */
  kind: string;
  /** 보세창고: 통관 전 화물. 출고지로 고르지 않는다 */
  bonded?: boolean;
}

export const WAREHOUSES: readonly Warehouse[] = [
  { id: 'w1', name: '이천 1센터', kind: '상온' },
  { id: 'w2', name: '평택 냉동센터', kind: '냉동' },
  { id: 'w3', name: '부산 신항 보세창고', kind: '보세', bonded: true },
];

/** 매매기준율(원). change = 전일 대비 */
export const RATES: readonly { code: CurrencyCode; rate: number; change: number }[] = [
  { code: 'USD', rate: 1384.5, change: 4.2 },
  { code: 'EUR', rate: 1478.2, change: -2.6 },
  { code: 'JPY', rate: 9.12, change: 0.03 },
  { code: 'CNY', rate: 192.3, change: 0.4 },
];

/** USD 30일 환율 */
export const USD_SERIES = Array.from({ length: 30 }, (_, i) => ({
  day: `D-${29 - i}`,
  rate: Math.round((1362 + Math.sin(i / 3.2) * 9 + i * 0.62) * 10) / 10,
}));

export const rateOf = (c: CurrencyCode) =>
  c === 'KRW' ? 1 : (RATES.find((r) => r.code === c)?.rate ?? 1);
export const partyById = (id: string) => PARTIES.find((p) => p.id === id)!;
export const itemById = (id: string) => ITEMS.find((i) => i.id === id)!;
export const warehouseById = (id: string) => WAREHOUSES.find((w) => w.id === id)!;

/* ── 발주 ──────────────────────────────────────────────── */

export const PO_STATES = {
  draft: { label: '작성 중', tone: 'neutral' },
  approval: { label: '결재 중', tone: 'info' },
  ordered: { label: '발주', tone: 'info' },
  partial: { label: '부분 입고', tone: 'warning' },
  received: { label: '입고 완료', tone: 'success' },
  cancelled: { label: '취소', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type PoState = keyof typeof PO_STATES;

export interface PoLine {
  itemId: string;
  qty: number;
  unitPrice: number;
  received: number;
}

export interface PurchaseOrder {
  id: string;
  partyId: string;
  date: string;
  dueDate: string;
  currency: CurrencyCode;
  incoterms?: 'FOB' | 'CIF' | 'EXW' | 'DAP';
  state: PoState;
  approval: ApprovalState;
  warehouseId: string;
  buyer: string;
  lines: readonly PoLine[];
  shipmentId?: string;
}

export const PURCHASE_ORDERS: readonly PurchaseOrder[] = [
  {
    id: 'PO-2611-0042',
    partyId: 'p07',
    date: '2026-10-28',
    dueDate: '2026-11-12',
    currency: 'USD',
    incoterms: 'CIF',
    state: 'ordered',
    approval: 'approved',
    warehouseId: 'w2',
    buyer: '이하은 과장',
    shipmentId: 'SH-2611-007',
    lines: [
      { itemId: 'i01', qty: 1_200, unitPrice: 21.4, received: 0 },
      { itemId: 'i04', qty: 800, unitPrice: 17.2, received: 0 },
    ],
  },
  {
    id: 'PO-2611-0041',
    partyId: 'p08',
    date: '2026-10-21',
    dueDate: '2026-11-08',
    currency: 'EUR',
    incoterms: 'FOB',
    state: 'partial',
    approval: 'approved',
    warehouseId: 'w3',
    buyer: '이하은 과장',
    shipmentId: 'SH-2611-006',
    lines: [
      { itemId: 'i02', qty: 300, unitPrice: 92.5, received: 180 },
      { itemId: 'i05', qty: 160, unitPrice: 26.8, received: 160 },
    ],
  },
  {
    id: 'PO-2611-0040',
    partyId: 'p10',
    date: '2026-10-20',
    dueDate: '2026-11-06',
    currency: 'JPY',
    incoterms: 'CIF',
    state: 'ordered',
    approval: 'approved',
    warehouseId: 'w2',
    buyer: '이하은 과장',
    shipmentId: 'SH-2611-005',
    lines: [{ itemId: 'i03', qty: 600, unitPrice: 4_420, received: 0 }],
  },
  {
    id: 'PO-2611-0039',
    partyId: 'p09',
    date: '2026-10-17',
    dueDate: '2026-11-14',
    currency: 'CNY',
    incoterms: 'FOB',
    state: 'ordered',
    approval: 'approved',
    warehouseId: 'w1',
    buyer: '정우진 주임',
    shipmentId: 'SH-2611-004',
    lines: [
      { itemId: 'i06', qty: 20_000, unitPrice: 2.6, received: 0 },
      { itemId: 'i08', qty: 1_500, unitPrice: 44.0, received: 0 },
    ],
  },
  {
    id: 'PO-2611-0038',
    partyId: 'p05',
    date: '2026-11-03',
    dueDate: '2026-11-07',
    currency: 'KRW',
    state: 'ordered',
    approval: 'approved',
    warehouseId: 'w1',
    buyer: '정우진 주임',
    lines: [
      { itemId: 'i07', qty: 2_400, unitPrice: 2_750, received: 0 },
      { itemId: 'i09', qty: 8_000, unitPrice: 290, received: 0 },
    ],
  },
  {
    id: 'PO-2611-0037',
    partyId: 'p05',
    date: '2026-10-30',
    dueDate: '2026-11-04',
    currency: 'KRW',
    state: 'received',
    approval: 'approved',
    warehouseId: 'w1',
    buyer: '정우진 주임',
    lines: [{ itemId: 'i10', qty: 60, unitPrice: 12_500, received: 60 }],
  },
  {
    id: 'PO-2611-0043',
    partyId: 'p07',
    date: '2026-11-05',
    dueDate: '2026-12-02',
    currency: 'USD',
    incoterms: 'CIF',
    state: 'approval',
    approval: 'pending',
    warehouseId: 'w2',
    buyer: '이하은 과장',
    lines: [{ itemId: 'i04', qty: 1_000, unitPrice: 17.0, received: 0 }],
  },
  {
    id: 'PO-2611-0044',
    partyId: 'p04',
    date: '2026-11-06',
    dueDate: '2026-11-20',
    currency: 'KRW',
    state: 'draft',
    approval: 'draft',
    warehouseId: 'w1',
    buyer: '정우진 주임',
    lines: [{ itemId: 'i09', qty: 5_000, unitPrice: 300, received: 0 }],
  },
  {
    id: 'PO-2610-0035',
    partyId: 'p10',
    date: '2026-10-08',
    dueDate: '2026-10-24',
    currency: 'JPY',
    incoterms: 'CIF',
    state: 'received',
    approval: 'approved',
    warehouseId: 'w2',
    buyer: '이하은 과장',
    lines: [{ itemId: 'i03', qty: 400, unitPrice: 4_380, received: 400 }],
  },
  {
    id: 'PO-2610-0031',
    partyId: 'p09',
    date: '2026-10-02',
    dueDate: '2026-10-25',
    currency: 'CNY',
    incoterms: 'FOB',
    state: 'cancelled',
    approval: 'withdrawn',
    warehouseId: 'w1',
    buyer: '정우진 주임',
    lines: [{ itemId: 'i06', qty: 10_000, unitPrice: 2.7, received: 0 }],
  },
];

/** 발주서 작성 화면이 처음 채워 두는 작성 중 발주(블록 erp/purchasing/po-form) */
export const PO_DRAFT = {
  partyId: 'p07',
  currency: 'USD' as CurrencyCode,
  incoterms: 'CIF',
  dueDate: '2026-12-04',
  warehouseId: 'w2',
  lines: [{ itemId: 'i04', qty: 1_000, unitPrice: 17.0 }],
  /** 공급사 견적 송장(PI) */
  files: [{ name: 'PSFC-PI-2611-018.pdf', size: 248_000 }],
};

export const poAmount = (po: PurchaseOrder) =>
  po.lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);
export const poAmountKrw = (po: PurchaseOrder) => Math.round(poAmount(po) * rateOf(po.currency));

/* ── 선적 · 통관 ───────────────────────────────────────── */

export interface Shipment {
  id: string;
  poId: string;
  blNo: string;
  vessel: string;
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  state: ShipmentState;
  forwarder: string;
  containers: string;
  customsNo?: string;
}

export const SHIPMENTS: readonly Shipment[] = [
  {
    id: 'SH-2611-007',
    poId: 'PO-2611-0042',
    blNo: 'PSFC2610BUS0815',
    vessel: 'HMM GARNET 0412E',
    pol: 'Seattle',
    pod: '부산 신항',
    etd: '2026-10-24',
    eta: '2026-11-09',
    state: 'departed',
    forwarder: '동방로지스',
    containers: '40ft 냉동 × 2',
  },
  {
    id: 'SH-2611-006',
    poId: 'PO-2611-0041',
    blNo: 'MAEU2610VLC0332',
    vessel: 'MAERSK EDMONTON 044W',
    pol: 'Valencia',
    pod: '부산 신항',
    etd: '2026-10-02',
    eta: '2026-11-03',
    state: 'customs',
    forwarder: '동방로지스',
    containers: '20ft × 1',
    customsNo: '26-11-0004512',
  },
  {
    id: 'SH-2611-005',
    poId: 'PO-2611-0040',
    blNo: 'NYKS2610TMK0210',
    vessel: 'SUNNY CLOVER 2611S',
    pol: 'Tomakomai',
    pod: '부산 신항',
    etd: '2026-11-01',
    eta: '2026-11-05',
    state: 'arrived',
    forwarder: '동방로지스',
    containers: '20ft 냉동 × 1',
  },
  {
    id: 'SH-2611-004',
    poId: 'PO-2611-0039',
    blNo: 'COSU2610SHA9921',
    vessel: 'COSCO HARMONY 087E',
    pol: 'Shanghai',
    pod: '평택',
    etd: '2026-11-04',
    eta: '2026-11-10',
    state: 'departed',
    forwarder: '동방로지스',
    containers: '40ft × 1',
  },
  {
    id: 'SH-2610-003',
    poId: 'PO-2610-0035',
    blNo: 'NYKS2610TMK0144',
    vessel: 'SUNNY CLOVER 2609S',
    pol: 'Tomakomai',
    pod: '부산 신항',
    etd: '2026-10-14',
    eta: '2026-10-18',
    state: 'cleared',
    forwarder: '동방로지스',
    containers: '20ft 냉동 × 1',
    customsNo: '26-10-0038810',
  },
];

/* ── 입고 알림 · 처리 ──────────────────────────────────── */

export interface ReceiptLine {
  itemId: string;
  ordered: number;
  received?: number;
  lot?: string;
  expiry?: string;
  result?: QualityResult;
  note?: string;
}

export interface Receipt {
  id: string;
  poId: string;
  partyId: string;
  warehouseId: string;
  expectedAt: string;
  arrivedAt?: string;
  state: ReceivingState;
  inspector?: string;
  lines: readonly ReceiptLine[];
  /** 검수 사진 · 거래명세서 */
  files?: readonly AttachmentFile[];
}

export const RECEIPTS: readonly Receipt[] = [
  {
    id: 'GR-2611-0031',
    poId: 'PO-2611-0040',
    partyId: 'p10',
    warehouseId: 'w2',
    expectedAt: '2026-11-06 10:00',
    arrivedAt: '2026-11-06 09:42',
    state: 'inspecting',
    inspector: '정우진 주임',
    lines: [
      {
        itemId: 'i03',
        ordered: 600,
        received: 588,
        lot: 'HK261101',
        expiry: '2027-11-01',
        result: 'hold',
        note: '12kg 파손 의심 · 사진 첨부',
      },
    ],
    files: [
      { name: '파손-박스-01.jpg', size: 1_840_000, type: 'image' },
      { name: '거래명세서-HK1101.pdf', size: 182_000, type: 'pdf' },
    ],
  },
  {
    id: 'GR-2611-0030',
    poId: 'PO-2611-0038',
    partyId: 'p05',
    warehouseId: 'w1',
    expectedAt: '2026-11-06 14:00',
    arrivedAt: '2026-11-06 13:20',
    state: 'arrived',
    lines: [
      { itemId: 'i07', ordered: 2_400 },
      { itemId: 'i09', ordered: 8_000 },
    ],
  },
  {
    id: 'GR-2611-0029',
    poId: 'PO-2611-0041',
    partyId: 'p08',
    warehouseId: 'w3',
    expectedAt: '2026-11-07 09:00',
    state: 'scheduled',
    lines: [{ itemId: 'i02', ordered: 120 }],
  },
  {
    id: 'GR-2611-0028',
    poId: 'PO-2611-0042',
    partyId: 'p07',
    warehouseId: 'w2',
    expectedAt: '2026-11-10 10:00',
    state: 'scheduled',
    lines: [
      { itemId: 'i01', ordered: 1_200 },
      { itemId: 'i04', ordered: 800 },
    ],
  },
  {
    id: 'GR-2611-0027',
    poId: 'PO-2611-0041',
    partyId: 'p08',
    warehouseId: 'w3',
    expectedAt: '2026-11-04 09:00',
    arrivedAt: '2026-11-04 08:50',
    state: 'received',
    inspector: '정우진 주임',
    lines: [
      {
        itemId: 'i02',
        ordered: 180,
        received: 180,
        lot: 'OS2610A',
        expiry: '2028-09-30',
        result: 'pass',
      },
      {
        itemId: 'i05',
        ordered: 160,
        received: 160,
        lot: 'OS2610B',
        expiry: '2029-08-31',
        result: 'pass',
      },
    ],
  },
  {
    id: 'GR-2611-0026',
    poId: 'PO-2611-0037',
    partyId: 'p05',
    warehouseId: 'w1',
    expectedAt: '2026-11-04 15:00',
    arrivedAt: '2026-11-04 14:10',
    state: 'received',
    inspector: '정우진 주임',
    lines: [{ itemId: 'i10', ordered: 60, received: 60, result: 'pass' }],
  },
  {
    id: 'GR-2611-0025',
    poId: 'PO-2610-0035',
    partyId: 'p10',
    warehouseId: 'w2',
    expectedAt: '2026-10-20 10:00',
    arrivedAt: '2026-10-20 10:30',
    state: 'rejected',
    inspector: '정우진 주임',
    lines: [
      {
        itemId: 'i03',
        ordered: 20,
        received: 20,
        lot: 'HK261009',
        expiry: '2027-10-01',
        result: 'fail',
        note: '해동 흔적 · 전량 반품',
      },
    ],
  },
];

/* ── 세금계산서 ────────────────────────────────────────── */

export interface InvoiceLine {
  name: string;
  spec?: string;
  qty: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  kind: 'sales' | 'purchase';
  partyId: string;
  date: string;
  state: InvoiceState;
  lines: readonly InvoiceLine[];
  ntsNo?: string;
  sentAt?: string;
  error?: string;
  /** 영세율(수출). taxType 'zero'와 같다 */
  zeroRated?: boolean;
  /** 과세 구분. 면세(exempt)면 계산서. 없으면 zeroRated에 따라 영세율 또는 과세 */
  taxType?: TaxType;
}

const L = (itemId: string, qty: number, price?: number): InvoiceLine => {
  const it = itemById(itemId);
  return { name: it.name, spec: it.spec, qty, unitPrice: price ?? it.price };
};

export const INVOICES: readonly Invoice[] = [
  {
    id: 'TI-2611-0118',
    kind: 'sales',
    partyId: 'p01',
    date: '2026-11-06',
    state: 'ready',
    lines: [L('i01', 220), L('i04', 180)],
  },
  {
    id: 'TI-2611-0117',
    kind: 'sales',
    partyId: 'p02',
    date: '2026-11-06',
    state: 'ready',
    lines: [L('i02', 24), L('i05', 40)],
  },
  {
    id: 'TI-2611-0116',
    kind: 'sales',
    partyId: 'p03',
    date: '2026-11-05',
    state: 'failed',
    lines: [L('i03', 90), L('i07', 300)],
    error: '공급받는 자 사업자등록번호 확인 필요(휴업)',
  },
  {
    id: 'TI-2611-0115',
    kind: 'sales',
    partyId: 'p01',
    date: '2026-11-05',
    state: 'sent',
    lines: [L('i01', 160), L('i06', 3_000)],
    ntsNo: '20261105-41000012-8431k02',
    sentAt: '2026-11-05 18:04',
  },
  {
    id: 'TI-2611-0114',
    kind: 'sales',
    partyId: 'p04',
    date: '2026-11-04',
    state: 'sent',
    lines: [L('i08', 120), L('i09', 6_000)],
    ntsNo: '20261104-41000012-8430a11',
    sentAt: '2026-11-04 18:03',
  },
  {
    id: 'TI-2611-0113',
    kind: 'sales',
    partyId: 'p02',
    date: '2026-11-04',
    state: 'issued',
    lines: [L('i04', 140)],
  },
  {
    id: 'TI-2611-0112',
    kind: 'sales',
    partyId: 'p03',
    date: '2026-11-03',
    state: 'sent',
    lines: [L('i02', 30), L('i03', 60)],
    ntsNo: '20261103-41000012-8429c47',
    sentAt: '2026-11-03 18:05',
  },
  {
    id: 'TI-2611-0111',
    kind: 'sales',
    partyId: 'p01',
    date: '2026-11-02',
    state: 'sent',
    lines: [L('i01', 240)],
    ntsNo: '20261102-41000012-8428f90',
    sentAt: '2026-11-02 18:02',
  },
  {
    id: 'TI-2611-0110',
    kind: 'sales',
    partyId: 'p02',
    date: '2026-11-02',
    state: 'cancelled',
    lines: [L('i05', 12)],
  },
  {
    id: 'TI-2611-0109',
    kind: 'sales',
    partyId: 'p03',
    date: '2026-11-02',
    state: 'draft',
    lines: [L('i07', 500), L('i09', 4_000)],
  },
  {
    id: 'PI-2611-0052',
    kind: 'purchase',
    partyId: 'p05',
    date: '2026-11-04',
    state: 'sent',
    lines: [{ name: '라벨 프린터 리본', spec: '110mm × 300m', qty: 60, unitPrice: 12_500 }],
    ntsNo: '20261104-10000441-2210b03',
    sentAt: '2026-11-04 11:20',
  },
  {
    id: 'PI-2611-0051',
    kind: 'purchase',
    partyId: 'p06',
    date: '2026-11-03',
    state: 'sent',
    lines: [
      { name: '수입 통관 대행 수수료', qty: 1, unitPrice: 1_850_000 },
      { name: '냉동 컨테이너 운송', qty: 2, unitPrice: 980_000 },
    ],
    ntsNo: '20261103-10000441-2208k77',
    sentAt: '2026-11-03 16:41',
  },
];

export const invoiceSupply = (inv: Invoice) =>
  inv.lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);
export const invoiceTaxType = (inv: Invoice): TaxType =>
  inv.taxType ?? (inv.zeroRated ? 'zero' : 'taxed');
export const invoiceTax = (inv: Invoice) => taxOf(invoiceSupply(inv), invoiceTaxType(inv));

/* ── 거래처 원장(채권 · 채무) ──────────────────────────── */

export interface LedgerEntry {
  id: string;
  partyId: string;
  date: string;
  kind: '매출' | '매입' | '입금' | '출금' | '외화 환산';
  docNo: string;
  description: string;
  /** 차변: 채권 증가 · 채무 감소 */
  debit: number;
  /** 대변: 채권 감소 · 채무 증가 */
  credit: number;
}

export const LEDGER: readonly LedgerEntry[] = [
  {
    id: 'l01',
    partyId: 'p01',
    date: '2026-10-01',
    kind: '매출',
    docNo: '이월',
    description: '전기 이월 잔액',
    debit: 84_300_000,
    credit: 0,
  },
  {
    id: 'l02',
    partyId: 'p01',
    date: '2026-10-15',
    kind: '입금',
    docNo: 'RV-2610-0211',
    description: '9월분 대금 입금 · 기업은행',
    debit: 0,
    credit: 62_800_000,
  },
  {
    id: 'l03',
    partyId: 'p01',
    date: '2026-10-31',
    kind: '매출',
    docNo: 'TI-2610-0098',
    description: '10월 납품분',
    debit: 41_250_000,
    credit: 0,
  },
  {
    id: 'l04',
    partyId: 'p01',
    date: '2026-11-02',
    kind: '매출',
    docNo: 'TI-2611-0111',
    description: '냉동 흰다리새우 240BOX',
    debit: 10_164_000,
    credit: 0,
  },
  {
    id: 'l05',
    partyId: 'p01',
    date: '2026-11-05',
    kind: '매출',
    docNo: 'TI-2611-0115',
    description: '흰다리새우 · 크라프트 박스',
    debit: 9_482_000,
    credit: 0,
  },
  {
    id: 'l06',
    partyId: 'p01',
    date: '2026-11-05',
    kind: '입금',
    docNo: 'RV-2611-0034',
    description: '10월분 일부 입금 · 국민은행',
    debit: 0,
    credit: 30_000_000,
  },
  {
    id: 'l07',
    partyId: 'p07',
    date: '2026-10-01',
    kind: '매입',
    docNo: '이월',
    description: '전기 이월(USD 61,200.00)',
    debit: 0,
    credit: 83_200_000,
  },
  {
    id: 'l08',
    partyId: 'p07',
    date: '2026-10-20',
    kind: '출금',
    docNo: 'PV-2610-0102',
    description: 'T/T 송금 USD 61,200.00',
    debit: 84_640_000,
    credit: 0,
  },
  {
    id: 'l09',
    partyId: 'p07',
    date: '2026-10-20',
    kind: '외화 환산',
    docNo: 'FX-2610-0009',
    description: '외환차손',
    debit: 0,
    credit: 1_440_000,
  },
  {
    id: 'l10',
    partyId: 'p07',
    date: '2026-10-28',
    kind: '매입',
    docNo: 'PO-2611-0042',
    description: '선적분 USD 39,440.00 · 1,384.5',
    debit: 0,
    credit: 54_604_680,
  },
];

/* ── 재고 ──────────────────────────────────────────────── */

export interface StockLot {
  lot: string;
  qty: number;
  expiry?: string;
  receivedAt: string;
}

export interface Stock {
  itemId: string;
  warehouseId: string;
  qty: number;
  reserved: number;
  lots: readonly StockLot[];
}

export const STOCK: readonly Stock[] = [
  {
    itemId: 'i01',
    warehouseId: 'w2',
    qty: 312,
    reserved: 220,
    lots: [
      { lot: 'PS2609C', qty: 132, expiry: '2027-12-20', receivedAt: '2026-09-28' },
      { lot: 'PS2610A', qty: 180, expiry: '2028-03-02', receivedAt: '2026-10-11' },
    ],
  },
  {
    itemId: 'i02',
    warehouseId: 'w3',
    qty: 156,
    reserved: 24,
    lots: [{ lot: 'OS2610A', qty: 156, expiry: '2028-09-30', receivedAt: '2026-11-04' }],
  },
  {
    itemId: 'i03',
    warehouseId: 'w2',
    qty: 128,
    reserved: 90,
    lots: [
      { lot: 'HK261009', qty: 0, expiry: '2027-10-01', receivedAt: '2026-10-20' },
      { lot: 'HK260921', qty: 128, expiry: '2026-11-30', receivedAt: '2026-09-21' },
    ],
  },
  {
    itemId: 'i04',
    warehouseId: 'w2',
    qty: 410,
    reserved: 180,
    lots: [{ lot: 'PS2610B', qty: 410, expiry: '2027-10-12', receivedAt: '2026-10-11' }],
  },
  {
    itemId: 'i05',
    warehouseId: 'w3',
    qty: 148,
    reserved: 40,
    lots: [{ lot: 'OS2610B', qty: 148, expiry: '2029-08-31', receivedAt: '2026-11-04' }],
  },
  { itemId: 'i06', warehouseId: 'w1', qty: 4_200, reserved: 3_000, lots: [] },
  { itemId: 'i07', warehouseId: 'w1', qty: 980, reserved: 300, lots: [] },
  { itemId: 'i08', warehouseId: 'w1', qty: 1_140, reserved: 120, lots: [] },
  { itemId: 'i09', warehouseId: 'w1', qty: 12_600, reserved: 6_000, lots: [] },
  { itemId: 'i10', warehouseId: 'w1', qty: 72, reserved: 0, lots: [] },
];

/* ── 월별 · 경영 지표 ──────────────────────────────────── */

export const MONTHLY = Array.from({ length: 12 }, (_, i) => {
  const m = ((i + 11) % 12) + 1;
  const y = i === 0 ? 2025 : 2026;
  const sales = Math.round(((1_180 + Math.sin(i / 1.9) * 140 + i * 38) * 1e6) / 1e5) * 1e5;
  const purchase = Math.round((sales * (0.71 + Math.cos(i / 2.3) * 0.04)) / 1e5) * 1e5;
  return {
    month: `${y}-${String(m).padStart(2, '0')}`,
    label: `${m}월`,
    sales,
    purchase,
    margin: Math.round(((sales - purchase) / sales) * 1000) / 10,
  };
});

/**
 * 이번 달 누계(TODAY까지). MONTHLY의 마지막 달은 아직 마감하지 않은 달이라
 * 대시보드는 마감한 달(전월)을 보이고, 이번 달은 이 누계로 따로 보인다
 */
export const MONTH_TO_DATE = (() => {
  const m = MONTHLY[MONTHLY.length - 1]!;
  const days = new Date(Number(m.month.slice(0, 4)), Number(m.month.slice(5, 7)), 0).getDate();
  const f = Number(TODAY.slice(8, 10)) / days;
  const r5 = (v: number) => Math.round(v / 1e5) * 1e5;
  return { month: m.month, through: TODAY, sales: r5(m.sales * f), purchase: r5(m.purchase * f) };
})();

/* ── 집계(블록이 같은 숫자를 쓰게 여기서 계산) ─────────── */

/** 품목을 내보낼 창고: 보세가 아닌 창고 중 재고가 가장 많은 곳(없으면 첫 일반 창고) */
export const mainWarehouseOf = (itemId: string) => {
  const open = WAREHOUSES.filter((w) => !w.bonded);
  const best = STOCK.filter((s) => s.itemId === itemId && open.some((w) => w.id === s.warehouseId))
    .slice()
    .sort((a, b) => b.qty - a.qty)[0];
  return best?.warehouseId ?? open[0]?.id ?? WAREHOUSES[0]!.id;
};

export const stockOf = (itemId: string) =>
  STOCK.filter((s) => s.itemId === itemId).reduce((a, s) => a + s.qty, 0);
export const availableOf = (itemId: string) =>
  STOCK.filter((s) => s.itemId === itemId).reduce((a, s) => a + s.qty - s.reserved, 0);
export const LOW_STOCK = ITEMS.filter((i) => stockOf(i.id) < i.safetyStock);
export const INVENTORY_VALUE = STOCK.reduce((a, s) => a + s.qty * itemById(s.itemId).cost, 0);

/** 거래처별 미수금 · 미지급금. 원장에 없는 거래처는 요약 값 */
export const RECEIVABLES: readonly { partyId: string; balance: number; dueDate: string }[] = [
  { partyId: 'p01', balance: 52_396_000, dueDate: '2026-11-30' },
  { partyId: 'p02', balance: 38_420_000, dueDate: '2026-12-15' },
  { partyId: 'p03', balance: 21_780_000, dueDate: '2026-11-15' },
  { partyId: 'p04', balance: 12_400_000, dueDate: '2026-10-31' },
];
export const PAYABLES: readonly { partyId: string; balance: number; dueDate: string }[] = [
  { partyId: 'p07', balance: 54_604_680, dueDate: '2026-11-27' },
  { partyId: 'p05', balance: 7_820_000, dueDate: '2026-12-10' },
  { partyId: 'p06', balance: 3_810_000, dueDate: '2026-11-30' },
];
export const sum = <T>(rows: readonly T[], f: (r: T) => number) =>
  rows.reduce((a, r) => a + f(r), 0);
