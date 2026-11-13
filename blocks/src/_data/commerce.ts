// 이커머스 샘플 데이터(테라트레이딩(주) 소매 판매). 수입 식자재(trade.ts ITEMS)를 소포장 상품으로
// 자사몰과 판매 채널 3곳에 판다. 날짜는 TODAY(2026-11-06) 기준으로 고정(결정적). 채널 이름은 일반 명칭이다.
import type {
  AddressResult,
  AddressSearch,
  AddressValue,
  OrderStage,
  StatusTone,
} from '@terracelab/trellis-contracts';

/* ── 판매 채널 ─────────────────────────────────────────── */

export type ChannelId = 'own' | 'mkA' | 'mkB' | 'pay';

export const SYNC_STATES = {
  ok: { label: '정상', tone: 'success' },
  partial: { label: '일부 오류', tone: 'warning' },
  delayed: { label: '지연', tone: 'warning' },
  error: { label: '연동 오류', tone: 'danger' },
  off: { label: '연동 안 함', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type SyncState = keyof typeof SYNC_STATES;

export type SyncKind = 'product' | 'price' | 'stock' | 'order' | 'claim';
export const SYNC_KINDS: Record<SyncKind, { label: string; description: string }> = {
  product: { label: '상품 정보', description: '상품명 · 옵션 · 상세 설명을 채널에 보냅니다' },
  price: { label: '가격', description: '판매가 · 할인가가 바뀌면 바로 보냅니다' },
  stock: { label: '재고', description: 'SKU 재고를 10분마다 보냅니다' },
  order: { label: '주문 수집', description: '새 주문을 5분마다 가져옵니다' },
  claim: { label: '취소 · 반품 · 교환 수집', description: '요청을 10분마다 가져옵니다' },
};

export interface SalesChannel {
  id: ChannelId;
  name: string;
  /** 판매 수수료율(%). 자사몰은 PG 결제 수수료 */
  feeRate: number;
  settleRule: string;
  sellerId: string;
  /** API 키 끝 4자리(나머지는 가린다) */
  apiKeyTail: string;
  apiKeyIssuedAt: string;
  sync: {
    state: SyncState;
    lastSyncAt: string;
    enabled: Record<SyncKind, boolean>;
  };
}

const ALL_ON: Record<SyncKind, boolean> = {
  product: true,
  price: true,
  stock: true,
  order: true,
  claim: true,
};

export const CHANNELS: readonly SalesChannel[] = [
  {
    id: 'own',
    name: '자사몰',
    feeRate: 3.3,
    settleRule: 'PG 결제 후 D+2',
    sellerId: 'terra-mall',
    apiKeyTail: '7c21',
    apiKeyIssuedAt: '2026-03-02',
    sync: {
      state: 'ok',
      lastSyncAt: '2026-11-06 14:00',
      enabled: ALL_ON,
    },
  },
  {
    id: 'mkA',
    name: '오픈마켓 A',
    feeRate: 10.8,
    settleRule: '구매 확정 후 D+8',
    sellerId: 'TERRA_TRD',
    apiKeyTail: '3f9a',
    apiKeyIssuedAt: '2026-05-18',
    sync: {
      state: 'partial',
      lastSyncAt: '2026-11-06 13:50',
      enabled: ALL_ON,
    },
  },
  {
    id: 'mkB',
    name: '오픈마켓 B',
    feeRate: 12.0,
    settleRule: '매주 수요일(전주 구매 확정분)',
    sellerId: 'terratrading01',
    apiKeyTail: 'b80e',
    apiKeyIssuedAt: '2026-06-09',
    sync: {
      state: 'ok',
      lastSyncAt: '2026-11-06 13:55',
      enabled: { ...ALL_ON, product: false },
    },
  },
  {
    id: 'pay',
    name: '간편결제몰',
    feeRate: 5.5,
    settleRule: '구매 확정 후 D+1',
    sellerId: 'terra_pay_store',
    apiKeyTail: '19d4',
    apiKeyIssuedAt: '2025-11-20',
    sync: {
      state: 'delayed',
      lastSyncAt: '2026-11-06 13:10',
      enabled: ALL_ON,
    },
  },
];

export const channelById = (id: ChannelId) => CHANNELS.find((c) => c.id === id)!;

export interface SyncError {
  id: string;
  channelId: ChannelId;
  kind: SyncKind;
  title: string;
  detail: string;
  count: number;
  at: string;
}

export const SYNC_ERRORS: readonly SyncError[] = [
  {
    id: 'se1',
    channelId: 'mkA',
    kind: 'product',
    title: '옵션 코드 불일치 3건',
    detail:
      'P-1001 2kg 선물 박스 · P-1004 1.2kg · P-1006 선물 박스의 채널 옵션 코드가 SKU와 다릅니다',
    count: 3,
    at: '2026-11-06 13:50',
  },
  {
    id: 'se2',
    channelId: 'mkA',
    kind: 'stock',
    title: '재고 전송 실패 1건',
    detail: 'P-1003 냉동 가리비 관자 500g · 채널에서 판매 중지된 상품입니다',
    count: 1,
    at: '2026-11-06 13:50',
  },
  {
    id: 'se3',
    channelId: 'pay',
    kind: 'order',
    title: '주문 수집 지연',
    detail: '채널 API 응답 시간이 30초를 넘었습니다. 13:10 이후 주문을 아직 가져오지 못했습니다',
    count: 1,
    at: '2026-11-06 14:05',
  },
];

/* ── 상품 ──────────────────────────────────────────────── */

export interface Sku {
  code: string;
  /** 옵션 값(중량 · 포장 또는 구성) */
  option: string;
  /** 대표 옵션 대비 추가 금액(원) */
  extra: number;
  stock: number;
  selling: boolean;
}

export type ThumbTone = 'info' | 'success' | 'warning' | 'danger' | 'brand' | 'commerce';

export interface Product {
  id: string;
  name: string;
  /** 썸네일 자리 글자(이미지 대신) */
  thumb: string;
  thumbTone: ThumbTone;
  /** 연결 품목(trade.ts ITEMS) */
  itemId: string;
  /** 상품 분류 이름. 회사마다 다르다(목록 필터는 상품에서 모은다) */
  category: string;
  /** 여러 품목을 묶은 세트. 재고는 구성품 재고로 본다 */
  set?: boolean;
  /** 정가(대표 옵션) */
  listPrice: number;
  /** 할인가(대표 옵션). 정가와 같으면 할인 없음 */
  salePrice: number;
  channels: readonly ChannelId[];
  selling: boolean;
  /** 판매 중지 사유 */
  stopNote?: string;
  /** 배송 온도 이름(냉동 · 상온 …). 출고지는 warehouseId */
  shipping: string;
  warehouseId: string;
  updatedAt: string;
  skus: readonly Sku[];
}

export const PRODUCTS: readonly Product[] = [
  {
    id: 'P-1001',
    name: '냉동 흰다리새우 21/25',
    thumb: '새우',
    thumbTone: 'danger',
    itemId: 'i01',
    category: '수산 냉동',
    listPrice: 26_900,
    salePrice: 22_900,
    channels: ['own', 'mkA', 'mkB', 'pay'],
    selling: true,
    shipping: '냉동',
    warehouseId: 'w2',
    updatedAt: '2026-11-05 17:20',
    skus: [
      { code: 'P-1001-10N', option: '1kg · 일반', extra: 0, stock: 64, selling: true },
      { code: 'P-1001-10G', option: '1kg · 선물 박스', extra: 3_000, stock: 18, selling: true },
      { code: 'P-1001-20N', option: '2kg · 일반', extra: 19_000, stock: 22, selling: true },
      { code: 'P-1001-20G', option: '2kg · 선물 박스', extra: 22_000, stock: 6, selling: true },
    ],
  },
  {
    id: 'P-1002',
    name: '엑스트라버진 올리브오일 1L',
    thumb: '오일',
    thumbTone: 'success',
    itemId: 'i02',
    category: '오일 · 식초',
    listPrice: 32_000,
    salePrice: 27_200,
    channels: ['own', 'mkA', 'mkB', 'pay'],
    selling: true,
    shipping: '상온',
    warehouseId: 'w1',
    updatedAt: '2026-11-04 10:05',
    skus: [
      { code: 'P-1002-1B', option: '1병', extra: 0, stock: 48, selling: true },
      { code: 'P-1002-2B', option: '2병 세트', extra: 26_000, stock: 20, selling: true },
    ],
  },
  {
    id: 'P-1003',
    name: '냉동 가리비 관자 L',
    thumb: '관자',
    thumbTone: 'warning',
    itemId: 'i03',
    category: '수산 냉동',
    listPrice: 34_000,
    salePrice: 29_900,
    channels: ['own', 'mkA', 'pay'],
    selling: true,
    shipping: '냉동',
    warehouseId: 'w2',
    updatedAt: '2026-11-06 09:40',
    skus: [
      { code: 'P-1003-05', option: '500g', extra: 0, stock: 0, selling: true },
      { code: 'P-1003-10', option: '1kg', extra: 27_000, stock: 0, selling: true },
    ],
  },
  {
    id: 'P-1004',
    name: '냉동 연어 필렛 스킨온',
    thumb: '연어',
    thumbTone: 'brand',
    itemId: 'i04',
    category: '수산 냉동',
    listPrice: 24_000,
    salePrice: 19_900,
    channels: ['own', 'mkA', 'mkB'],
    selling: true,
    shipping: '냉동',
    warehouseId: 'w2',
    updatedAt: '2026-11-03 15:12',
    skus: [
      { code: 'P-1004-06', option: '600g', extra: 0, stock: 35, selling: true },
      { code: 'P-1004-12', option: '1.2kg', extra: 17_000, stock: 12, selling: true },
    ],
  },
  {
    id: 'P-1005',
    name: '발사믹 식초 500ml',
    thumb: '식초',
    thumbTone: 'commerce',
    itemId: 'i05',
    category: '오일 · 식초',
    listPrice: 14_000,
    salePrice: 14_000,
    channels: ['own', 'mkB', 'pay'],
    selling: true,
    shipping: '상온',
    warehouseId: 'w1',
    updatedAt: '2026-10-29 11:30',
    skus: [
      { code: 'P-1005-1B', option: '1병', extra: 0, stock: 40, selling: true },
      { code: 'P-1005-3B', option: '3병 세트', extra: 26_000, stock: 9, selling: true },
    ],
  },
  {
    id: 'P-1006',
    name: '해산물 3종 세트',
    thumb: '3종',
    thumbTone: 'info',
    itemId: 'i01',
    category: '선물 세트',
    set: true,
    listPrice: 69_000,
    salePrice: 59_000,
    channels: ['own', 'mkA', 'pay'],
    selling: true,
    shipping: '냉동',
    warehouseId: 'w2',
    updatedAt: '2026-11-02 14:48',
    skus: [
      { code: 'P-1006-N', option: '일반', extra: 0, stock: 14, selling: true },
      { code: 'P-1006-G', option: '선물 박스', extra: 4_000, stock: 8, selling: true },
    ],
  },
  {
    id: 'P-1007',
    name: '올리브오일 · 발사믹 선물 세트',
    thumb: '선물',
    thumbTone: 'success',
    itemId: 'i02',
    category: '선물 세트',
    set: true,
    listPrice: 48_000,
    salePrice: 43_200,
    channels: ['own'],
    selling: false,
    stopNote: '12월 1일 연말 기획전부터 판매',
    shipping: '상온',
    warehouseId: 'w1',
    updatedAt: '2026-11-01 09:00',
    skus: [{ code: 'P-1007-1S', option: '1세트', extra: 0, stock: 30, selling: false }],
  },
  {
    id: 'P-1009',
    name: '엑스트라버진 올리브오일 500ml',
    thumb: '오일',
    thumbTone: 'success',
    itemId: 'i02',
    category: '오일 · 식초',
    listPrice: 18_000,
    salePrice: 15_900,
    channels: ['own', 'mkA', 'mkB', 'pay'],
    selling: true,
    shipping: '상온',
    warehouseId: 'w1',
    updatedAt: '2026-11-02 10:10',
    skus: [
      { code: 'P-1009-1B', option: '1병', extra: 0, stock: 52, selling: true },
      { code: 'P-1009-2B', option: '2병 세트', extra: 14_000, stock: 16, selling: true },
    ],
  },
  {
    id: 'P-1010',
    name: '냉동 연어 큐브 500g',
    thumb: '큐브',
    thumbTone: 'brand',
    itemId: 'i04',
    category: '수산 냉동',
    listPrice: 16_900,
    salePrice: 14_900,
    channels: ['own', 'pay'],
    selling: true,
    shipping: '냉동',
    warehouseId: 'w2',
    updatedAt: '2026-10-30 16:25',
    skus: [
      { code: 'P-1010-1P', option: '1팩', extra: 0, stock: 28, selling: true },
      { code: 'P-1010-2P', option: '2팩', extra: 13_500, stock: 10, selling: true },
    ],
  },
  {
    id: 'P-1011',
    name: '발사믹 식초 250ml',
    thumb: '식초',
    thumbTone: 'commerce',
    itemId: 'i05',
    category: '오일 · 식초',
    listPrice: 8_900,
    salePrice: 7_900,
    channels: ['own', 'mkA', 'mkB'],
    selling: true,
    shipping: '상온',
    warehouseId: 'w1',
    updatedAt: '2026-10-28 09:15',
    skus: [
      { code: 'P-1011-1B', option: '1병', extra: 0, stock: 5, selling: true },
      { code: 'P-1011-2B', option: '2병 세트', extra: 7_000, stock: 0, selling: true },
    ],
  },
  {
    id: 'P-1012',
    name: '해산물 파스타 키트 2인분',
    thumb: '키트',
    thumbTone: 'info',
    itemId: 'i01',
    category: '수산 냉동',
    listPrice: 19_800,
    salePrice: 16_900,
    channels: ['own', 'mkA', 'pay'],
    selling: true,
    shipping: '냉동',
    warehouseId: 'w2',
    updatedAt: '2026-11-04 13:30',
    skus: [{ code: 'P-1012-1K', option: '1세트', extra: 0, stock: 24, selling: true }],
  },
  {
    id: 'P-1013',
    name: '냉동 흰다리새우 21/25 업소용 10kg',
    thumb: '새우',
    thumbTone: 'danger',
    itemId: 'i01',
    category: '수산 냉동',
    listPrice: 189_000,
    salePrice: 172_000,
    channels: ['mkA', 'mkB'],
    selling: false,
    stopNote: '업소용 단가를 다시 정하는 중입니다. 11월 15일 판매를 다시 시작합니다',
    shipping: '냉동',
    warehouseId: 'w2',
    updatedAt: '2026-11-03 18:40',
    skus: [{ code: 'P-1013-10K', option: '2kg × 5', extra: 0, stock: 12, selling: false }],
  },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;
/** 상품 분류(목록 필터 · 등록). 상품에 나온 순서 */
export const PRODUCT_CATEGORIES: readonly string[] = [...new Set(PRODUCTS.map((p) => p.category))];

/** 옵션 한 축(중량 · 포장 · 색상 …). code를 이어 붙여 SKU 코드를 만든다 */
export interface OptionAxis {
  label: string;
  values: readonly { value: string; code: string; extra: number }[];
}

/** 상품 등록 화면이 처음 채워 두는 작성 중 상품(블록 commerce/products/edit) */
export const PRODUCT_DRAFT = {
  id: 'P-1008',
  name: '냉동 손질 흰다리새우 21/25',
  category: '수산 냉동',
  /** 연결 품목(trade ITEMS) */
  itemId: 'i01',
  /** 과세 구분(profile taxTypes의 value) */
  tax: 'free',
  listPrice: 29_900,
  salePrice: 25_900,
  /** 옵션 두 축. code를 이어 붙여 SKU를 만든다 */
  options: [
    {
      label: '중량',
      values: [
        { value: '500g', code: '05', extra: -12_000 },
        { value: '1kg', code: '10', extra: 0 },
        { value: '2kg', code: '20', extra: 22_000 },
      ],
    },
    {
      label: '포장',
      values: [
        { value: '일반', code: 'N', extra: 0 },
        { value: '선물 박스', code: 'G', extra: 3_000 },
      ],
    },
  ] as readonly [OptionAxis, OptionAxis],
  /** SKU 코드 끝(옵션 code 조합) → 재고. 0이면 판매 끔 */
  stock: { '05N': 40, '05G': 0, '10N': 60, '10G': 20, '20N': 30, '20G': 10 } as Readonly<
    Record<string, number>
  >,
  files: [
    { name: '손질새우_대표_1000x1000.jpg', size: 842_000 },
    { name: '손질새우_조리예시.jpg', size: 1_260_000 },
    { name: '상세_원산지_영양정보.png', size: 2_380_000 },
  ],
  description:
    '미국산 흰다리새우를 껍질과 내장을 제거해 급속 냉동했습니다. 21/25는 1파운드에 21~25마리 크기입니다.\n해동은 냉장실에서 6시간 또는 흐르는 찬물에 20분을 권장합니다. 한 번 해동한 상품은 다시 얼리지 마세요.',
  /** 배송 방법(profile shipping.methods의 value) */
  shipMethod: 'frozen',
  warehouseId: 'w2',
  remoteFee: 5_000,
  channels: ['own', 'mkA', 'pay'] as readonly ChannelId[],
};
export const productStock = (p: Pick<Product, 'skus'>) => p.skus.reduce((a, s) => a + s.stock, 0);
/** 할인율(%): 정가 대비. 소수 한 자리 */
export const discountRate = (list: number, sale: number) =>
  list > 0 ? Math.round(((list - sale) / list) * 1000) / 10 : 0;
/** 판매 상태: 판매 중 · 품절 · 판매 중지 */
export const SALE_STATES = {
  selling: { label: '판매 중', tone: 'success' },
  soldout: { label: '품절', tone: 'danger' },
  stopped: { label: '판매 중지', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type SaleState = keyof typeof SALE_STATES;
export const saleStateOf = (p: Pick<Product, 'selling' | 'skus'>): SaleState =>
  !p.selling ? 'stopped' : productStock(p) === 0 ? 'soldout' : 'selling';

/* ── 주문 ──────────────────────────────────────────────── */

export interface OrderLine {
  productId: string;
  skuCode: string;
  qty: number;
}

export interface Order {
  id: string;
  channelId: ChannelId;
  /** 채널 주문번호(자사몰은 같은 번호) */
  channelOrderNo: string;
  orderedAt: string;
  paidAt?: string;
  buyer: string;
  /** 숫자만. 화면에는 maskPhone으로 */
  phone: string;
  receiver: string;
  receiverPhone: string;
  address: string;
  memo?: string;
  payMethod: '카드' | '계좌이체' | '가상계좌' | '간편결제';
  couponId?: string;
  couponDiscount: number;
  stage: OrderStage;
  carrier?: string;
  trackingNo?: string;
  shippedAt?: string;
  deliveredAt?: string;
  lines: readonly OrderLine[];
}

/* ── 주소 검색(샘플) ───────────────────────────────────── */

/**
 * 주문 배송지와 같은 도로명의 주소 목록. 블록 데모는 네트워크 없이 이 목록에서 찾는다.
 * 실제 앱은 AddressSearchProvider로 자기 주소 검색 함수를 넣는다(Trellis는 검색 서버를 부르지 않는다)
 */
export const ADDRESS_BOOK: readonly AddressResult[] = [
  {
    postcode: '03925',
    road: '서울특별시 마포구 월드컵북로 56',
    jibun: '서울특별시 마포구 상암동 1601',
  },
  {
    postcode: '13561',
    road: '경기도 성남시 분당구 정자일로 95',
    jibun: '경기도 성남시 분당구 정자동 178-1',
  },
  {
    postcode: '22004',
    road: '인천광역시 연수구 센트럴로 160',
    jibun: '인천광역시 연수구 송도동 24-5',
  },
  {
    postcode: '05551',
    road: '서울특별시 송파구 올림픽로 300',
    jibun: '서울특별시 송파구 신천동 29',
  },
  { postcode: '34141', road: '대전광역시 유성구 대학로 99', jibun: '대전광역시 유성구 궁동 220' },
  {
    postcode: '06236',
    road: '서울특별시 강남구 테헤란로 152',
    jibun: '서울특별시 강남구 역삼동 737',
    building: '테라빌딩',
  },
  {
    postcode: '48058',
    road: '부산광역시 해운대구 센텀중앙로 79',
    jibun: '부산광역시 해운대구 우동 1505',
  },
  {
    postcode: '61949',
    road: '광주광역시 서구 상무중앙로 110',
    jibun: '광주광역시 서구 치평동 1200',
  },
  {
    postcode: '10403',
    road: '경기도 고양시 일산동구 중앙로 1275',
    jibun: '경기도 고양시 일산동구 장항동 868',
  },
  {
    postcode: '04763',
    road: '서울특별시 성동구 왕십리로 83',
    jibun: '서울특별시 성동구 성수동1가 685-20',
  },
  {
    postcode: '16508',
    road: '경기도 수원시 영통구 광교중앙로 140',
    jibun: '경기도 수원시 영통구 하동 990',
  },
  { postcode: '44719', road: '울산광역시 남구 삼산로 287', jibun: '울산광역시 남구 달동 1330-1' },
  {
    postcode: '04376',
    road: '서울특별시 용산구 한강대로 92',
    jibun: '서울특별시 용산구 한강로2가 15',
  },
  {
    postcode: '42110',
    road: '대구광역시 수성구 동대구로 330',
    jibun: '대구광역시 수성구 범어동 177-2',
  },
  { postcode: '30116', road: '세종특별자치시 한누리대로 2130', jibun: '세종특별자치시 보람동 655' },
  {
    postcode: '16838',
    road: '경기도 용인시 수지구 포은대로 499',
    jibun: '경기도 용인시 수지구 풍덕천동 1167',
  },
  {
    postcode: '28588',
    road: '충청북도 청주시 흥덕구 대농로 17',
    jibun: '충청북도 청주시 흥덕구 복대동 3376',
  },
  { postcode: '12902', road: '경기도 하남시 미사강변대로 200', jibun: '경기도 하남시 망월동 1081' },
  {
    postcode: '03924',
    road: '서울특별시 마포구 월드컵북로 54',
    jibun: '서울특별시 마포구 상암동 1600',
  },
  {
    postcode: '03926',
    road: '서울특별시 마포구 월드컵북로 58',
    jibun: '서울특별시 마포구 상암동 1602',
  },
];

/** 도로명 · 지번 · 건물 이름에 검색어의 낱말이 모두 들어 있는 주소. 결정적이고 네트워크를 쓰지 않는다 */
export const searchAddressBook: AddressSearch = (query) =>
  Promise.resolve(
    ADDRESS_BOOK.filter((a) =>
      query.split(/\s+/).every((w) => `${a.road} ${a.jibun ?? ''} ${a.building ?? ''}`.includes(w)),
    ),
  );

/** 한 줄 주소("도로명, 상세") → AddressInput 값. 우편번호 · 지번은 주소 목록에서 찾는다 */
export function splitAddress(address: string): AddressValue {
  const [road = '', ...rest] = address.split(', ');
  const found = ADDRESS_BOOK.find((a) => a.road === road);
  return {
    postcode: found?.postcode ?? '',
    road,
    ...(found?.jibun ? { jibun: found.jibun } : {}),
    detail: rest.join(', '),
  };
}

/** AddressInput 값 → 한 줄 주소 */
export const joinAddress = (v: AddressValue) => (v.detail ? `${v.road}, ${v.detail}` : v.road);

export const CARRIERS = ['동방로지스 택배', '새벽콜드체인', '한빛냉장택배'] as const;
/** 냉동 · 상온 같은 배송비. 상품 금액 5만 원 이상이면 무료 */
export const SHIPPING_FEE = 3_500;
export const FREE_SHIPPING_OVER = 50_000;

/** 최근 주문(손으로 쓴 것). 11월 1~4일의 나머지 주문은 아래 earlierOrders()가 채운다 */
const RECENT_ORDERS: readonly Order[] = [
  {
    id: 'O-261106-0148',
    channelId: 'own',
    channelOrderNo: 'O-261106-0148',
    orderedAt: '2026-11-06 13:42',
    buyer: '송하늘',
    phone: '01048213307',
    receiver: '송하늘',
    receiverPhone: '01048213307',
    address: '서울특별시 마포구 월드컵북로 56, 302호',
    payMethod: '가상계좌',
    couponDiscount: 0,
    stage: 'paid-pending',
    lines: [{ productId: 'P-1002', skuCode: 'P-1002-1B', qty: 1 }],
  },
  {
    id: 'O-261106-0146',
    channelId: 'mkA',
    channelOrderNo: '2026110687412203',
    orderedAt: '2026-11-06 12:18',
    paidAt: '2026-11-06 12:18',
    buyer: '윤서진',
    phone: '01092846612',
    receiver: '윤서진',
    receiverPhone: '01092846612',
    address: '경기도 성남시 분당구 정자일로 95, 1204동 803호',
    memo: '부재 시 경비실',
    payMethod: '카드',
    couponDiscount: 0,
    stage: 'paid',
    lines: [{ productId: 'P-1001', skuCode: 'P-1001-20N', qty: 1 }],
  },
  {
    id: 'O-261106-0143',
    channelId: 'pay',
    channelOrderNo: 'PM26110600931',
    orderedAt: '2026-11-06 10:51',
    paidAt: '2026-11-06 10:51',
    buyer: '강도현',
    phone: '01077120458',
    receiver: '강도현',
    receiverPhone: '01077120458',
    address: '인천광역시 연수구 센트럴로 160, 2401호',
    payMethod: '간편결제',
    couponDiscount: 0,
    stage: 'paid',
    lines: [
      { productId: 'P-1004', skuCode: 'P-1004-06', qty: 2 },
      { productId: 'P-1005', skuCode: 'P-1005-1B', qty: 1 },
    ],
  },
  {
    id: 'O-261106-0141',
    channelId: 'own',
    channelOrderNo: 'O-261106-0141',
    orderedAt: '2026-11-06 09:27',
    paidAt: '2026-11-06 09:28',
    buyer: '임채원',
    phone: '01033904721',
    receiver: '임채원',
    receiverPhone: '01033904721',
    address: '서울특별시 송파구 올림픽로 300, 4205호',
    payMethod: '카드',
    couponId: 'CP-2611-03',
    couponDiscount: 3_000,
    stage: 'paid',
    lines: [{ productId: 'P-1006', skuCode: 'P-1006-G', qty: 1 }],
  },
  {
    id: 'O-261105-0137',
    channelId: 'mkB',
    channelOrderNo: 'B-1105-778120',
    orderedAt: '2026-11-05 21:04',
    paidAt: '2026-11-05 21:04',
    buyer: '배수아',
    phone: '01025587731',
    receiver: '배수아',
    receiverPhone: '01025587731',
    address: '대전광역시 유성구 대학로 99, 105동 1102호',
    payMethod: '카드',
    couponDiscount: 0,
    stage: 'paid',
    lines: [{ productId: 'P-1002', skuCode: 'P-1002-2B', qty: 1 }],
  },
  {
    id: 'O-261105-0138',
    channelId: 'own',
    channelOrderNo: 'O-261105-0138',
    orderedAt: '2026-11-05 19:36',
    paidAt: '2026-11-05 19:37',
    buyer: '김민지',
    phone: '01023457788',
    receiver: '김민지',
    receiverPhone: '01023457788',
    address: '서울특별시 강남구 테헤란로 152, 12층 테라빌딩',
    memo: '냉동 상품이라 문 앞에 두지 말고 연락 주세요',
    payMethod: '카드',
    couponId: 'CP-2611-02',
    couponDiscount: 5_000,
    stage: 'preparing',
    lines: [
      { productId: 'P-1001', skuCode: 'P-1001-10G', qty: 2 },
      { productId: 'P-1003', skuCode: 'P-1003-05', qty: 1 },
    ],
  },
  {
    id: 'O-261105-0132',
    channelId: 'mkA',
    channelOrderNo: '2026110587219940',
    orderedAt: '2026-11-05 15:12',
    paidAt: '2026-11-05 15:12',
    buyer: '오지훈',
    phone: '01088126630',
    receiver: '오지훈',
    receiverPhone: '01088126630',
    address: '부산광역시 해운대구 센텀중앙로 79, 1803호',
    payMethod: '카드',
    couponDiscount: 0,
    stage: 'preparing',
    lines: [{ productId: 'P-1004', skuCode: 'P-1004-12', qty: 1 }],
  },
  {
    id: 'O-261105-0129',
    channelId: 'pay',
    channelOrderNo: 'PM26110500712',
    orderedAt: '2026-11-05 11:40',
    paidAt: '2026-11-05 11:40',
    buyer: '정유나',
    phone: '01064419025',
    receiver: '정민호',
    receiverPhone: '01051184420',
    address: '광주광역시 서구 상무중앙로 110, 702호',
    payMethod: '간편결제',
    couponDiscount: 0,
    stage: 'preparing',
    carrier: '새벽콜드체인',
    trackingNo: '582014736650',
    lines: [{ productId: 'P-1001', skuCode: 'P-1001-10N', qty: 3 }],
  },
  {
    id: 'O-261105-0126',
    channelId: 'mkA',
    channelOrderNo: '2026110586904417',
    orderedAt: '2026-11-05 08:55',
    paidAt: '2026-11-05 08:55',
    buyer: '한예린',
    phone: '01019935574',
    receiver: '한예린',
    receiverPhone: '01019935574',
    address: '경기도 고양시 일산동구 중앙로 1275, 902호',
    payMethod: '카드',
    couponDiscount: 0,
    stage: 'preparing',
    lines: [
      { productId: 'P-1002', skuCode: 'P-1002-1B', qty: 1 },
      { productId: 'P-1005', skuCode: 'P-1005-1B', qty: 2 },
    ],
  },
  {
    id: 'O-261104-0119',
    channelId: 'own',
    channelOrderNo: 'O-261104-0119',
    orderedAt: '2026-11-04 20:21',
    paidAt: '2026-11-04 20:22',
    buyer: '류태민',
    phone: '01070048813',
    receiver: '류태민',
    receiverPhone: '01070048813',
    address: '서울특별시 성동구 왕십리로 83, 1504호',
    payMethod: '계좌이체',
    couponDiscount: 0,
    stage: 'shipping',
    carrier: '동방로지스 택배',
    trackingNo: '640218893017',
    shippedAt: '2026-11-05 14:10',
    lines: [{ productId: 'P-1006', skuCode: 'P-1006-N', qty: 1 }],
  },
  {
    id: 'O-261104-0115',
    channelId: 'mkB',
    channelOrderNo: 'B-1104-771904',
    orderedAt: '2026-11-04 16:47',
    paidAt: '2026-11-04 16:47',
    buyer: '서지안',
    phone: '01056673302',
    receiver: '서지안',
    receiverPhone: '01056673302',
    address: '경기도 수원시 영통구 광교중앙로 140, 2203호',
    payMethod: '카드',
    couponDiscount: 0,
    stage: 'shipping',
    carrier: '새벽콜드체인',
    trackingNo: '582014736118',
    shippedAt: '2026-11-05 14:10',
    lines: [{ productId: 'P-1004', skuCode: 'P-1004-06', qty: 3 }],
  },
  {
    id: 'O-261104-0111',
    channelId: 'mkA',
    channelOrderNo: '2026110486211075',
    orderedAt: '2026-11-04 10:03',
    paidAt: '2026-11-04 10:03',
    buyer: '문가영',
    phone: '01039951148',
    receiver: '문가영',
    receiverPhone: '01039951148',
    address: '울산광역시 남구 삼산로 287, 1101호',
    payMethod: '카드',
    couponDiscount: 0,
    stage: 'shipping',
    carrier: '동방로지스 택배',
    trackingNo: '640218892544',
    shippedAt: '2026-11-04 15:30',
    lines: [{ productId: 'P-1001', skuCode: 'P-1001-10N', qty: 2 }],
  },
  {
    id: 'O-261103-0102',
    channelId: 'own',
    channelOrderNo: 'O-261103-0102',
    orderedAt: '2026-11-03 14:30',
    paidAt: '2026-11-03 14:31',
    buyer: '조은비',
    phone: '01082270361',
    receiver: '조은비',
    receiverPhone: '01082270361',
    address: '서울특별시 용산구 한강대로 92, 805호',
    payMethod: '카드',
    couponId: 'CP-2611-03',
    couponDiscount: 3_000,
    stage: 'delivered',
    carrier: '동방로지스 택배',
    trackingNo: '640218890021',
    shippedAt: '2026-11-03 15:20',
    deliveredAt: '2026-11-04 11:42',
    lines: [
      { productId: 'P-1002', skuCode: 'P-1002-1B', qty: 1 },
      { productId: 'P-1005', skuCode: 'P-1005-1B', qty: 1 },
    ],
  },
  {
    id: 'O-261103-0097',
    channelId: 'pay',
    channelOrderNo: 'PM26110300488',
    orderedAt: '2026-11-03 09:14',
    paidAt: '2026-11-03 09:14',
    buyer: '권도윤',
    phone: '01047718852',
    receiver: '권도윤',
    receiverPhone: '01047718852',
    address: '대구광역시 수성구 동대구로 330, 1602호',
    payMethod: '간편결제',
    couponDiscount: 0,
    stage: 'delivered',
    carrier: '새벽콜드체인',
    trackingNo: '582014735402',
    shippedAt: '2026-11-03 15:20',
    deliveredAt: '2026-11-04 07:05',
    lines: [{ productId: 'P-1003', skuCode: 'P-1003-10', qty: 1 }],
  },
  {
    id: 'O-261102-0088',
    channelId: 'mkB',
    channelOrderNo: 'B-1102-766015',
    orderedAt: '2026-11-02 18:22',
    paidAt: '2026-11-02 18:22',
    buyer: '남궁현',
    phone: '01011847790',
    receiver: '남궁현',
    receiverPhone: '01011847790',
    address: '세종특별자치시 한누리대로 2130, 503호',
    payMethod: '카드',
    couponDiscount: 0,
    stage: 'delivered',
    carrier: '한빛냉장택배',
    trackingNo: '771120934468',
    shippedAt: '2026-11-03 15:20',
    deliveredAt: '2026-11-04 16:30',
    lines: [{ productId: 'P-1001', skuCode: 'P-1001-20G', qty: 1 }],
  },
  {
    id: 'O-261102-0084',
    channelId: 'own',
    channelOrderNo: 'O-261102-0084',
    orderedAt: '2026-11-02 11:09',
    paidAt: '2026-11-02 11:10',
    buyer: '신다은',
    phone: '01090023318',
    receiver: '신다은',
    receiverPhone: '01090023318',
    address: '경기도 용인시 수지구 포은대로 499, 1207호',
    payMethod: '카드',
    couponDiscount: 0,
    stage: 'cancelled',
    lines: [{ productId: 'P-1004', skuCode: 'P-1004-06', qty: 1 }],
  },
  {
    id: 'O-261101-0071',
    channelId: 'mkA',
    channelOrderNo: '2026110185530182',
    orderedAt: '2026-11-01 20:45',
    paidAt: '2026-11-01 20:45',
    buyer: '황보민',
    phone: '01062210947',
    receiver: '황보민',
    receiverPhone: '01062210947',
    address: '충청북도 청주시 흥덕구 대농로 17, 801호',
    payMethod: '카드',
    couponDiscount: 0,
    stage: 'returning',
    carrier: '동방로지스 택배',
    trackingNo: '640218887730',
    shippedAt: '2026-11-02 15:00',
    deliveredAt: '2026-11-03 10:20',
    lines: [{ productId: 'P-1003', skuCode: 'P-1003-05', qty: 2 }],
  },
  {
    id: 'O-261101-0066',
    channelId: 'own',
    channelOrderNo: 'O-261101-0066',
    orderedAt: '2026-11-01 13:18',
    paidAt: '2026-11-01 13:19',
    buyer: '이서윤',
    phone: '01028846105',
    receiver: '이서윤',
    receiverPhone: '01028846105',
    address: '경기도 하남시 미사강변대로 200, 2108호',
    payMethod: '카드',
    couponDiscount: 0,
    stage: 'exchanging',
    carrier: '동방로지스 택배',
    trackingNo: '640218886120',
    shippedAt: '2026-11-02 15:00',
    deliveredAt: '2026-11-03 13:05',
    lines: [{ productId: 'P-1001', skuCode: 'P-1001-10N', qty: 1 }],
  },
];

const BUYERS = [
  ['김하준', '01031542287'],
  ['이서아', '01027719034'],
  ['박지호', '01055230418'],
  ['최유진', '01094410726'],
  ['정민재', '01063378805'],
  ['강서연', '01020947731'],
  ['조현우', '01048815562'],
  ['윤지아', '01077602149'],
  ['장도윤', '01039926670'],
  ['임수빈', '01016648823'],
  ['한지성', '01082251937'],
  ['오채은', '01070316654'],
] as const;
const ADDRESSES = [
  '서울특별시 관악구 관악로 145, 1203호',
  '경기도 부천시 길주로 210, 806호',
  '인천광역시 남동구 예술로 152, 1502호',
  '서울특별시 동작구 상도로 94, 302호',
  '경기도 안양시 동안구 시민대로 230, 1101호',
  '대전광역시 서구 둔산로 100, 2104호',
  '부산광역시 수영구 광안해변로 219, 1708호',
  '경기도 화성시 동탄대로 446, 905호',
  '서울특별시 은평구 통일로 742, 1404호',
] as const;
const CHANNEL_CYCLE: readonly ChannelId[] = [
  'mkA',
  'own',
  'mkA',
  'pay',
  'mkB',
  'own',
  'mkA',
  'pay',
  'own',
];
const LINE_CYCLE: readonly (readonly [string, string, number])[] = [
  ['P-1001', 'P-1001-10N', 2],
  ['P-1009', 'P-1009-1B', 1],
  ['P-1004', 'P-1004-06', 2],
  ['P-1012', 'P-1012-1K', 2],
  ['P-1002', 'P-1002-1B', 1],
  ['P-1001', 'P-1001-20N', 1],
  ['P-1010', 'P-1010-2P', 1],
  ['P-1005', 'P-1005-1B', 2],
  ['P-1006', 'P-1006-N', 1],
  ['P-1004', 'P-1004-12', 1],
  ['P-1003', 'P-1003-05', 1],
];
const PAY_BY_CHANNEL: Record<ChannelId, Order['payMethod']> = {
  own: '카드',
  mkA: '카드',
  mkB: '카드',
  pay: '간편결제',
};
/** 날짜별 주문번호 범위(같은 날 번호는 시각 순으로 늘어난다) */
const SEQ_RANGE: Record<string, readonly [number, number]> = {
  '01': [52, 75],
  '02': [76, 90],
  '03': [91, 105],
  '04': [106, 122],
};

/** 11월 1~4일 주문 36건. 결정적(같은 입력 → 같은 주문) */
function earlierOrders(): Order[] {
  const used = new Set(RECENT_ORDERS.map((o) => o.id));
  const out: Order[] = [];
  for (let d = 0; d < 4; d += 1) {
    const dd = String(4 - d).padStart(2, '0');
    const [from, to] = SEQ_RANGE[dd]!;
    const free: number[] = [];
    for (let n = from; n <= to; n += 1)
      if (!used.has(`O-2611${dd}-${String(n).padStart(4, '0')}`)) free.push(n);
    for (let k = 0; k < 9; k += 1) {
      const i = d * 9 + k;
      const seq = free[k]!;
      const minutes = 8 * 60 + 40 + k * 97;
      const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
      const channelId = CHANNEL_CYCLE[(i + d) % CHANNEL_CYCLE.length]!;
      const [buyer, phone] = BUYERS[(i * 5) % BUYERS.length]!;
      const first = LINE_CYCLE[i % LINE_CYCLE.length]!;
      const second = i % 4 === 1 ? LINE_CYCLE[(i + 4) % LINE_CYCLE.length]! : null;
      const id = `O-2611${dd}-${String(seq).padStart(4, '0')}`;
      const next = String(5 - d).padStart(2, '0');
      const after = String(Math.min(6, 6 - d)).padStart(2, '0');
      const shipping = d === 0 && k % 3 !== 0;
      const carrier = CARRIERS[i % CARRIERS.length]!;
      out.push({
        id,
        channelId,
        channelOrderNo:
          channelId === 'own'
            ? id
            : channelId === 'mkA'
              ? `2026110${4 - d}8${String(6_100_000 + i * 7_919).slice(0, 7)}`
              : channelId === 'mkB'
                ? `B-11${dd}-${760_000 + i * 613}`
                : `PM261${100 + 4 - d}${String(300 + i * 11).padStart(5, '0')}`,
        orderedAt: `2026-11-${dd} ${time}`,
        paidAt: `2026-11-${dd} ${time}`,
        buyer,
        phone,
        receiver: buyer,
        receiverPhone: phone,
        address: ADDRESSES[i % ADDRESSES.length]!,
        payMethod: i % 7 === 3 ? '계좌이체' : PAY_BY_CHANNEL[channelId],
        couponDiscount: 0,
        stage: d === 3 && k === 4 ? 'cancelled' : shipping ? 'shipping' : 'delivered',
        ...(d === 3 && k === 4
          ? {}
          : {
              carrier,
              trackingNo: String(640_218_870_000 + i * 131),
              shippedAt: `2026-11-${next} 15:${String(10 + k).padStart(2, '0')}`,
              ...(shipping
                ? {}
                : { deliveredAt: `2026-11-${after} ${String(9 + (k % 5)).padStart(2, '0')}:20` }),
            }),
        lines: [
          { productId: first[0], skuCode: first[1], qty: first[2] },
          ...(second && second[0] !== first[0]
            ? [{ productId: second[0], skuCode: second[1], qty: 1 }]
            : []),
        ],
      });
    }
  }
  return out;
}

export const ORDERS: readonly Order[] = [...RECENT_ORDERS, ...earlierOrders()];

export const skuOf = (l: Pick<OrderLine, 'productId' | 'skuCode'>) =>
  productById(l.productId).skus.find((s) => s.code === l.skuCode)!;
/** 한 줄 단가 = 대표 할인가 + 옵션 추가 금액 */
export const linePrice = (l: Pick<OrderLine, 'productId' | 'skuCode'>) =>
  productById(l.productId).salePrice + skuOf(l).extra;
export const lineAmount = (l: OrderLine) => linePrice(l) * l.qty;
export const orderGoods = (o: Pick<Order, 'lines'>) =>
  o.lines.reduce((a, l) => a + lineAmount(l), 0);
export const orderShipping = (o: Pick<Order, 'lines'>) =>
  orderGoods(o) >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
/** 결제 금액 = 상품 금액 + 배송비 − 할인 */
export const orderTotal = (o: Pick<Order, 'lines' | 'couponDiscount'>) =>
  orderGoods(o) + orderShipping(o) - o.couponDiscount;
export const orderById = (id: string) => ORDERS.find((o) => o.id === id);
/** 상품 요약: 첫 상품 · 옵션 외 n건 */
export const orderItemLabel = (o: Pick<Order, 'lines'>) => {
  const first = o.lines[0]!;
  const rest = o.lines.length - 1;
  return `${productById(first.productId).name} · ${skuOf(first).option}${rest > 0 ? ` 외 ${rest}건` : ''}`;
};
/** 전화번호 가림: 010-****-7788 */
export const maskPhone = (digits: string) =>
  digits.length >= 10 ? `${digits.slice(0, 3)}-****-${digits.slice(-4)}` : digits;

/* ── 취소 · 반품 · 교환 ────────────────────────────────── */

export type ClaimKind = 'cancel' | 'return' | 'exchange';
export const CLAIM_KINDS: Record<ClaimKind, string> = {
  cancel: '취소',
  return: '반품',
  exchange: '교환',
};

export const CLAIM_STATES = {
  requested: { label: '접수', tone: 'warning' },
  processing: { label: '처리 중', tone: 'info' },
  done: { label: '완료', tone: 'success' },
  rejected: { label: '거부', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type ClaimState = keyof typeof CLAIM_STATES;

/** 회수 상태(반품 · 교환). 회수 완료되면 창고 입고 검수로 넘어간다 */
export const PICKUP_STATES = {
  none: { label: '회수 없음', tone: 'neutral' },
  waiting: { label: '회수 대기', tone: 'neutral' },
  requested: { label: '회수 요청', tone: 'info' },
  transit: { label: '회수 중', tone: 'info' },
  arrived: { label: '회수 완료 · 검수 대기', tone: 'warning' },
  inspected: { label: '검수 완료', tone: 'success' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type PickupState = keyof typeof PICKUP_STATES;

/** 취소 · 반품 · 교환 사유. fault = 귀책(배송비 부담). 업종 사유는 회사가 더한다 */
export const CLAIM_REASONS: readonly { value: string; label: string; fault: 'buyer' | 'seller' }[] =
  [
    { value: 'change', label: '단순 변심', fault: 'buyer' },
    { value: 'mistake', label: '주문 실수', fault: 'buyer' },
    { value: 'option', label: '옵션 변경', fault: 'buyer' },
    { value: 'damaged', label: '상품 파손', fault: 'seller' },
    { value: 'thawed', label: '해동 의심', fault: 'seller' },
    { value: 'wrong', label: '오배송', fault: 'seller' },
    { value: 'late', label: '배송 지연', fault: 'seller' },
  ];
export type ClaimReason = string;
/** 사유 이름 · 귀책. 모르는 사유는 이름 그대로 판매자 귀책 */
export const reasonOf = (r: ClaimReason) =>
  CLAIM_REASONS.find((x) => x.value === r) ?? { value: r, label: r, fault: 'seller' as const };
/** 반품 · 교환 왕복 배송비(구매자 사유일 때 차감 · 청구) */
export const RETURN_SHIPPING = 7_000;

export interface Claim {
  id: string;
  kind: ClaimKind;
  orderId: string;
  channelId: ChannelId;
  buyer: string;
  productId: string;
  skuCode: string;
  qty: number;
  reason: ClaimReason;
  /** 구매자가 남긴 말 */
  comment: string;
  requestedAt: string;
  state: ClaimState;
  pickup: PickupState;
  /** 회수 송장 */
  pickupNo?: string;
  /** 교환 재발송 옵션 */
  exchangeTo?: string;
  rejectNote?: string;
  /** 창고 입고 검수 번호 */
  receiptNo?: string;
  /** 회수 도착 · 처리 완료 시각 */
  arrivedAt?: string;
  doneAt?: string;
}

export const CLAIMS: readonly Claim[] = [
  {
    id: 'CL-2611-0024',
    kind: 'cancel',
    orderId: 'O-261106-0146',
    channelId: 'mkA',
    buyer: '윤서진',
    productId: 'P-1001',
    skuCode: 'P-1001-20N',
    qty: 1,
    reason: 'mistake',
    comment: '1kg로 다시 주문하겠습니다',
    requestedAt: '2026-11-06 13:05',
    state: 'requested',
    pickup: 'none',
  },
  {
    id: 'CL-2611-0023',
    kind: 'cancel',
    orderId: 'O-261105-0137',
    channelId: 'mkB',
    buyer: '배수아',
    productId: 'P-1002',
    skuCode: 'P-1002-2B',
    qty: 1,
    reason: 'late',
    comment: '주말 전에 받을 수 있는지 확인 부탁드립니다. 어려우면 취소합니다',
    requestedAt: '2026-11-06 10:22',
    state: 'requested',
    pickup: 'none',
  },
  {
    id: 'CL-2611-0019',
    kind: 'cancel',
    orderId: 'O-261102-0084',
    channelId: 'own',
    buyer: '신다은',
    productId: 'P-1004',
    skuCode: 'P-1004-06',
    qty: 1,
    reason: 'change',
    comment: '다른 상품으로 다시 주문했습니다',
    requestedAt: '2026-11-02 11:40',
    state: 'done',
    pickup: 'none',
    doneAt: '2026-11-02 13:05',
  },
  {
    id: 'CL-2611-0022',
    kind: 'return',
    orderId: 'O-261101-0071',
    channelId: 'mkA',
    buyer: '황보민',
    productId: 'P-1003',
    skuCode: 'P-1003-05',
    qty: 2,
    reason: 'thawed',
    comment: '받았을 때 아이스팩이 다 녹아 있었고 관자가 물러져 있었습니다. 사진 첨부합니다',
    requestedAt: '2026-11-03 12:10',
    state: 'processing',
    pickup: 'arrived',
    pickupNo: '640218889904',
    receiptNo: 'RT-2611-0008',
    arrivedAt: '2026-11-06 09:50',
  },
  {
    id: 'CL-2611-0021',
    kind: 'return',
    orderId: 'O-261103-0097',
    channelId: 'pay',
    buyer: '권도윤',
    productId: 'P-1003',
    skuCode: 'P-1003-10',
    qty: 1,
    reason: 'change',
    comment: '생각보다 양이 많아 반품합니다. 미개봉입니다',
    requestedAt: '2026-11-05 09:30',
    state: 'requested',
    pickup: 'waiting',
  },
  {
    id: 'CL-2611-0018',
    kind: 'return',
    orderId: 'O-261029-0042',
    channelId: 'own',
    buyer: '고나연',
    productId: 'P-1002',
    skuCode: 'P-1002-1B',
    qty: 1,
    reason: 'damaged',
    comment: '병 입구 쪽이 깨져서 왔습니다',
    requestedAt: '2026-10-31 16:20',
    state: 'done',
    pickup: 'inspected',
    pickupNo: '640218881176',
    receiptNo: 'RT-2611-0003',
    arrivedAt: '2026-11-03 10:40',
    doneAt: '2026-11-03 16:10',
  },
  {
    id: 'CL-2611-0016',
    kind: 'cancel',
    orderId: 'O-261031-0058',
    channelId: 'pay',
    buyer: '이도경',
    productId: 'P-1001',
    skuCode: 'P-1001-10N',
    qty: 2,
    reason: 'change',
    comment: '같은 상품을 다른 주소로 다시 주문했습니다',
    requestedAt: '2026-10-31 22:15',
    state: 'done',
    pickup: 'none',
    doneAt: '2026-11-01 09:10',
  },
  {
    id: 'CL-2611-0014',
    kind: 'cancel',
    orderId: 'O-261030-0049',
    channelId: 'mkA',
    buyer: '장하람',
    productId: 'P-1006',
    skuCode: 'P-1006-N',
    qty: 1,
    reason: 'late',
    comment: '토요일 행사에 쓰려고 했는데 시간이 안 맞아 취소합니다',
    requestedAt: '2026-10-30 18:40',
    state: 'done',
    pickup: 'none',
    doneAt: '2026-10-31 09:05',
  },
  {
    id: 'CL-2611-0011',
    kind: 'cancel',
    orderId: 'O-261029-0037',
    channelId: 'own',
    buyer: '백지우',
    productId: 'P-1005',
    skuCode: 'P-1005-1B',
    qty: 2,
    reason: 'mistake',
    comment: '수량을 잘못 골랐습니다',
    requestedAt: '2026-10-30 16:02',
    state: 'rejected',
    pickup: 'none',
    rejectNote: '이미 발송한 주문입니다. 받으신 뒤 반품으로 요청해 주세요',
    doneAt: '2026-10-30 16:30',
  },
  {
    id: 'CL-2611-0009',
    kind: 'cancel',
    orderId: 'O-261028-0031',
    channelId: 'mkB',
    buyer: '유하준',
    productId: 'P-1002',
    skuCode: 'P-1002-1B',
    qty: 1,
    reason: 'change',
    comment: '다른 용량으로 주문하려고 합니다',
    requestedAt: '2026-10-28 11:20',
    state: 'done',
    pickup: 'none',
    doneAt: '2026-10-28 13:40',
  },
  {
    id: 'CL-2611-0015',
    kind: 'return',
    orderId: 'O-261030-0047',
    channelId: 'mkA',
    buyer: '김도윤',
    productId: 'P-1004',
    skuCode: 'P-1004-06',
    qty: 1,
    reason: 'damaged',
    comment: '아이스박스가 찌그러져 있었고 포장 비닐이 찢어져 있었습니다',
    requestedAt: '2026-11-02 10:30',
    state: 'processing',
    pickup: 'transit',
    pickupNo: '640218888412',
  },
  {
    id: 'CL-2611-0013',
    kind: 'return',
    orderId: 'O-261029-0040',
    channelId: 'mkB',
    buyer: '노은서',
    productId: 'P-1001',
    skuCode: 'P-1001-20N',
    qty: 1,
    reason: 'change',
    comment: '양이 너무 많아서 반품하고 싶습니다. 하루 냉동실에 두었습니다',
    requestedAt: '2026-11-01 20:10',
    state: 'rejected',
    pickup: 'none',
    rejectNote: '냉동 상품은 받은 뒤 단순 변심으로 반품할 수 없습니다',
    doneAt: '2026-11-02 09:30',
  },
  {
    id: 'CL-2611-0012',
    kind: 'return',
    orderId: 'O-261028-0033',
    channelId: 'own',
    buyer: '표지환',
    productId: 'P-1005',
    skuCode: 'P-1005-1B',
    qty: 2,
    reason: 'wrong',
    comment: '발사믹 식초 대신 다른 상품이 왔습니다',
    requestedAt: '2026-10-29 14:50',
    state: 'done',
    pickup: 'inspected',
    pickupNo: '640218879035',
    receiptNo: 'RT-2610-0021',
    arrivedAt: '2026-10-31 11:20',
    doneAt: '2026-10-31 15:00',
  },
  {
    id: 'CL-2611-0010',
    kind: 'return',
    orderId: 'O-261027-0026',
    channelId: 'pay',
    buyer: '허윤아',
    productId: 'P-1003',
    skuCode: 'P-1003-10',
    qty: 1,
    reason: 'thawed',
    comment: '도착했을 때 관자가 녹아서 서로 붙어 있었습니다',
    requestedAt: '2026-10-28 19:05',
    state: 'done',
    pickup: 'inspected',
    pickupNo: '640218877610',
    receiptNo: 'RT-2610-0019',
    arrivedAt: '2026-10-30 10:15',
    doneAt: '2026-10-30 14:20',
  },
  {
    id: 'CL-2611-0020',
    kind: 'exchange',
    orderId: 'O-261101-0066',
    channelId: 'own',
    buyer: '이서윤',
    productId: 'P-1001',
    skuCode: 'P-1001-10N',
    qty: 1,
    reason: 'wrong',
    comment: '21/25 사이즈를 주문했는데 31/40 사이즈가 왔습니다',
    requestedAt: '2026-11-03 18:02',
    state: 'processing',
    pickup: 'transit',
    pickupNo: '640218889120',
    exchangeTo: '1kg · 일반',
  },
  {
    id: 'CL-2611-0017',
    kind: 'exchange',
    orderId: 'O-261030-0051',
    channelId: 'mkB',
    buyer: '차승우',
    productId: 'P-1004',
    skuCode: 'P-1004-06',
    qty: 1,
    reason: 'option',
    comment: '600g 대신 1.2kg로 바꾸고 싶습니다. 차액은 결제하겠습니다',
    requestedAt: '2026-11-04 08:44',
    state: 'requested',
    pickup: 'waiting',
    exchangeTo: '1.2kg',
  },
  {
    id: 'CL-2611-0008',
    kind: 'exchange',
    orderId: 'O-261027-0022',
    channelId: 'own',
    buyer: '마서현',
    productId: 'P-1001',
    skuCode: 'P-1001-10G',
    qty: 1,
    reason: 'damaged',
    comment: '선물 박스 모서리가 눌려서 왔습니다. 선물용이라 교환 부탁드립니다',
    requestedAt: '2026-10-28 09:40',
    state: 'done',
    pickup: 'inspected',
    pickupNo: '640218876220',
    exchangeTo: '1kg · 선물 박스',
    arrivedAt: '2026-10-29 15:30',
    doneAt: '2026-10-30 15:10',
  },
  {
    id: 'CL-2611-0007',
    kind: 'exchange',
    orderId: 'O-261026-0018',
    channelId: 'mkA',
    buyer: '안주원',
    productId: 'P-1002',
    skuCode: 'P-1002-1B',
    qty: 1,
    reason: 'option',
    comment: '2병 세트로 바꾸고 싶습니다. 차액은 결제하겠습니다',
    requestedAt: '2026-10-27 13:25',
    state: 'done',
    pickup: 'inspected',
    pickupNo: '640218875502',
    exchangeTo: '2병 세트',
    arrivedAt: '2026-10-29 11:00',
    doneAt: '2026-10-29 15:30',
  },
  {
    id: 'CL-2611-0006',
    kind: 'exchange',
    orderId: 'O-261025-0012',
    channelId: 'pay',
    buyer: '염소율',
    productId: 'P-1004',
    skuCode: 'P-1004-12',
    qty: 1,
    reason: 'wrong',
    comment: '1.2kg를 주문했는데 600g이 왔습니다',
    requestedAt: '2026-11-04 17:30',
    state: 'processing',
    pickup: 'requested',
    pickupNo: '640218892981',
    exchangeTo: '1.2kg',
  },
];

/** 환불 금액: 취소는 결제 금액 전액, 반품은 구매자 사유면 왕복 배송비 차감, 교환은 0 */
export const claimRefund = (c: Claim) => {
  if (c.kind === 'exchange' || c.state === 'rejected') return 0;
  const order = orderById(c.orderId);
  if (c.kind === 'cancel' && order) return orderTotal(order);
  const goods = linePrice(c) * c.qty;
  return c.kind === 'return' && reasonOf(c.reason).fault === 'buyer'
    ? goods - RETURN_SHIPPING
    : goods;
};

/* ── 정산 ──────────────────────────────────────────────── */

export const SETTLE_PERIOD = { from: '2026-11-01', to: '2026-11-05' };
/** 지난 주기 정산 완료(구매 확정 기간 · 입금한 채널 수 · 합계) */
export const SETTLE_LAST = { from: '2026-10-25', to: '2026-10-31', channels: 4, amount: 2_284_610 };

export const SETTLE_STATES = {
  scheduled: { label: '정산 예정', tone: 'info' },
  mismatch: { label: '차이 확인', tone: 'warning' },
  done: { label: '정산 완료', tone: 'success' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type SettleState = keyof typeof SETTLE_STATES;

export interface Settlement {
  channelId: ChannelId;
  /** 구매 확정 매출(원) */
  sales: number;
  /** 반품 · 취소 차감 */
  returns: number;
  /** 구매자가 낸 배송비(정산에 더한다) */
  shipping: number;
  settleDate: string;
  state: SettleState;
  /** 채널이 보낸 정산 보고서의 정산 예정액(우리 계산과 다를 때) */
  reported?: number;
  orders: number;
}

export const SETTLEMENTS: readonly Settlement[] = [
  {
    channelId: 'own',
    sales: 742_300,
    returns: 27_200,
    shipping: 31_500,
    settleDate: '2026-11-08',
    state: 'scheduled',
    orders: 14,
  },
  {
    channelId: 'mkA',
    sales: 913_600,
    returns: 59_800,
    shipping: 35_000,
    settleDate: '2026-11-13',
    state: 'scheduled',
    orders: 17,
  },
  {
    channelId: 'mkB',
    sales: 498_700,
    returns: 0,
    shipping: 17_500,
    settleDate: '2026-11-11',
    state: 'mismatch',
    reported: 441_476,
    orders: 9,
  },
  {
    channelId: 'pay',
    sales: 556_900,
    returns: 56_900,
    shipping: 21_000,
    settleDate: '2026-11-07',
    state: 'scheduled',
    orders: 10,
  },
];

/** 수수료 = (매출 − 반품) × 채널 수수료율, 원 단위 반올림 */
export const settleFee = (s: Settlement) =>
  Math.round(((s.sales - s.returns) * channelById(s.channelId).feeRate) / 100);
/** 정산 예정액 = 매출 − 반품 − 수수료 + 배송비 */
export const settleAmount = (s: Settlement) => s.sales - s.returns - settleFee(s) + s.shipping;

/** 정산 차이 내역(오픈마켓 B 보고서 대사) */
export const SETTLE_DIFFS: readonly {
  orderNo: string;
  label: string;
  ours: number;
  reported: number;
  note: string;
}[] = [
  {
    orderNo: 'B-1102-765880',
    label: '냉동 흰다리새우 21/25 · 2kg · 선물 박스',
    ours: 5_388,
    reported: 10_348,
    note: '쿠폰 분담금 4,960원 차감',
  },
  {
    orderNo: 'B-1103-768412',
    label: '냉동 연어 필렛 스킨온 · 1.2kg',
    ours: 4_428,
    reported: 9_388,
    note: '쿠폰 분담금 4,960원 차감',
  },
  {
    orderNo: 'B-1104-770126',
    label: '엑스트라버진 올리브오일 1L · 2병 세트',
    ours: 6_384,
    reported: 11_344,
    note: '쿠폰 분담금 4,960원 차감',
  },
];

/* ── 쿠폰 · 프로모션 ───────────────────────────────────── */

export const COUPON_STATES = {
  active: { label: '진행 중', tone: 'success' },
  scheduled: { label: '예정', tone: 'info' },
  paused: { label: '중지', tone: 'warning' },
  ended: { label: '종료', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type CouponState = keyof typeof COUPON_STATES;

export interface Coupon {
  id: string;
  name: string;
  kind: 'fixed' | 'rate';
  /** 정액은 원, 정률은 % */
  value: number;
  /** 정률 쿠폰의 최대 할인(원) */
  maxDiscount?: number;
  minOrder: number;
  from: string;
  to: string;
  /** 발급 한도 */
  limit: number;
  issued: number;
  used: number;
  state: CouponState;
  /** 대상 상품. 비어 있으면 전체 상품 */
  productIds: readonly string[];
  channels: readonly ChannelId[];
}

export const COUPONS: readonly Coupon[] = [
  {
    id: 'CP-2611-03',
    name: '11월 첫 구매 3,000원',
    kind: 'fixed',
    value: 3_000,
    minOrder: 30_000,
    from: '2026-11-01',
    to: '2026-11-30',
    limit: 500,
    issued: 186,
    used: 9,
    state: 'active',
    productIds: [],
    channels: ['own'],
  },
  {
    id: 'CP-2611-02',
    name: '냉동 수산 10% 할인',
    kind: 'rate',
    value: 10,
    maxDiscount: 5_000,
    minOrder: 40_000,
    from: '2026-11-01',
    to: '2026-11-15',
    limit: 300,
    issued: 142,
    used: 14,
    state: 'active',
    productIds: ['P-1001', 'P-1003', 'P-1004', 'P-1006'],
    channels: ['own', 'pay'],
  },
  {
    id: 'CP-2611-01',
    name: '올리브오일 2병 세트 5,000원',
    kind: 'fixed',
    value: 5_000,
    minOrder: 50_000,
    from: '2026-11-04',
    to: '2026-11-08',
    limit: 50,
    issued: 50,
    used: 6,
    state: 'active',
    productIds: ['P-1002'],
    channels: ['own'],
  },
  {
    id: 'CP-2611-05',
    name: '앱 알림 동의 1,000원',
    kind: 'fixed',
    value: 1_000,
    minOrder: 10_000,
    from: '2026-11-01',
    to: '2026-11-30',
    limit: 1_000,
    issued: 88,
    used: 4,
    state: 'paused',
    productIds: [],
    channels: ['own'],
  },
  {
    id: 'CP-2612-01',
    name: '연말 선물 세트 15% 할인',
    kind: 'rate',
    value: 15,
    maxDiscount: 10_000,
    minOrder: 60_000,
    from: '2026-12-01',
    to: '2026-12-24',
    limit: 300,
    issued: 0,
    used: 0,
    state: 'scheduled',
    productIds: ['P-1006', 'P-1007'],
    channels: ['own', 'pay'],
  },
  {
    id: 'CP-2610-07',
    name: '10월 재구매 2,000원',
    kind: 'fixed',
    value: 2_000,
    minOrder: 20_000,
    from: '2026-10-01',
    to: '2026-10-31',
    limit: 300,
    issued: 300,
    used: 71,
    state: 'ended',
    productIds: [],
    channels: ['own'],
  },
  {
    id: 'CP-2610-05',
    name: '가을 수산 기획전 12% 할인',
    kind: 'rate',
    value: 12,
    maxDiscount: 8_000,
    minOrder: 40_000,
    from: '2026-10-10',
    to: '2026-10-31',
    limit: 200,
    issued: 200,
    used: 58,
    state: 'ended',
    productIds: ['P-1001', 'P-1003', 'P-1004'],
    channels: ['own', 'pay'],
  },
];
