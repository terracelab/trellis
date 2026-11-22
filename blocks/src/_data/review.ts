// 검토함(블록 erp/accounting/review) 샘플. 사람이 봐야 하는 거래만 모은다:
//   미분류(업무 도우미의 계정 제안 → 승인 · 반려 · 다른 계정) · 증빙 누락(올리면 금액을 맞춰 본다) · 이상 지출.
// 제안은 승인 전에는 거래를 바꾸지 않는다. 실제 서비스에서는 제안 · 증빙 읽기를 백엔드의 에이전트가 만든다.
// 거래는 이번 달(11월, 마감 전) 법인카드 · 계좌 거래다. 계정과목은 erp.ts의 ACCOUNTS를 쓴다.
import { accountByCode, ACCOUNTS } from './erp.js';

export type ReviewSource = 'card' | 'bank' | 'taxInvoice' | 'cashReceipt';

export interface ReviewTxn {
  id: string;
  date: string;
  source: ReviewSource;
  /** 가맹점 · 거래처 */
  party: string;
  memo: string;
  /** 수입 +, 지출 − (부가세 포함, 실제로 오간 돈) */
  amount: number;
  /** 확정된 계정과목 코드. 없으면 미분류 */
  accountCode?: string;
  /** 법인카드 끝 4자리 */
  card?: string;
  evidence: 'matched' | 'missing' | 'notRequired';
}

/** 업무 도우미의 분류 제안. classify = 계정 분류, asset = 비품 자산 등록 */
export interface ReviewProposal {
  txnId: string;
  kind: 'classify' | 'asset';
  accountCode: string;
  /** 0~1 */
  confidence: number;
  basis: string;
  /** 근거. screen은 근거를 여는 화면(블록 id) */
  citations: readonly { label: string; screen?: string }[];
}

export interface ReviewAnomaly {
  txnId: string;
  reason: 'holiday' | 'duplicate' | 'spike';
  note: string;
}

export const SOURCE_LABELS: Record<ReviewSource, string> = {
  card: '법인카드',
  bank: '계좌 거래',
  taxInvoice: '세금계산서',
  cashReceipt: '현금영수증',
};

export const ANOMALY_LABELS: Record<ReviewAnomaly['reason'], string> = {
  holiday: '휴일 사용',
  duplicate: '중복 결제 의심',
  spike: '전월의 3배',
};

/** 일괄 승인에 넣는 제안의 확신 기준(제품 설정) */
export const BULK_CONFIDENCE = 0.9;

/** 비품 계정. 이 계정으로 승인하면 자산 대장에 올라간다 */
export const ASSET_ACCOUNT = '2120';

/** 거래 분류에 고를 수 있는 계정(비용 · 수익 · 비품) */
export const CLASSIFY_ACCOUNTS = ACCOUNTS.filter(
  (a) => a.group === '비용' || a.group === '수익' || a.code === ASSET_ACCOUNT,
);

export const accountName = (code: string | undefined) =>
  code ? (accountByCode(code)?.name ?? code) : '';

const card = (
  id: string,
  date: string,
  last4: string,
  party: string,
  memo: string,
  amount: number,
  extra: Partial<ReviewTxn> = {},
): ReviewTxn => ({
  id,
  date,
  source: 'card',
  party,
  memo,
  amount: -amount,
  card: last4,
  evidence: 'matched',
  ...extra,
});

/** 처음 거래. 미분류 10건 · 증빙 누락 4건 · 이상 지출 3건 */
export const REVIEW_TXNS: readonly ReviewTxn[] = [
  // 미분류
  card('rv-u01', '2026-11-02', '4021', '이동통신 부가 회선', '물류팀 업무폰 데이터 추가', 33_000),
  card('rv-u02', '2026-11-02', '3390', '개인택시', '거래처 방문 택시', 18_700),
  card('rv-u03', '2026-11-03', '4021', '고속철도 승차권', '산지 출장 왕복', 59_800),
  card('rv-u04', '2026-11-03', '3390', '역전 한식당', '물류팀 점심', 52_000),
  card('rv-u05', '2026-11-04', '7713', '문구 오피스몰', '출고 라벨 · 사무용품', 34_100),
  card('rv-u06', '2026-11-04', '7713', '등기 우편 발송', '계약서 원본 발송', 4_800),
  card('rv-u07', '2026-11-04', '3390', '카페 온기', '회의 음료', 23_500),
  card('rv-u08', '2026-11-05', '4021', '한우 다이닝', '저녁 식사', 286_000),
  card('rv-u09', '2026-11-05', '7713', '전자제품 온라인몰', '사무실 55형 모니터', 1_390_000),
  card('rv-u10', '2026-11-05', '3390', '해외 결제', 'USD 48.00', 67_200),
  // 증빙 누락(계정은 확정, 증빙만 없다)
  {
    id: 'rv-e01',
    date: '2026-11-02',
    source: 'bank',
    party: '퀵서비스',
    memo: '세금계산서 원본 퀵 발송',
    amount: -33_000,
    accountCode: '8310',
    evidence: 'missing',
  },
  {
    id: 'rv-e02',
    date: '2026-11-03',
    source: 'bank',
    party: '사무실 청소 용역',
    memo: '11월 정기 청소',
    amount: -220_000,
    accountCode: '8310',
    evidence: 'missing',
  },
  card('rv-e03', '2026-11-04', '7713', '주차 정산', '외근 주차', 18_000, {
    accountCode: '8120',
    evidence: 'missing',
  }),
  card('rv-e04', '2026-11-05', '4021', '선물 가게', '거래처 선물', 120_000, {
    accountCode: '8130',
    evidence: 'missing',
  }),
  // 이상 지출(계정 · 증빙은 있다)
  card('rv-a01', '2026-11-01', '3390', '역전 한식당', '팀 식사', 128_000, { accountCode: '8110' }),
  card('rv-a02', '2026-11-03', '7713', '화상 회의', '화상 회의 11월분', 21_000, {
    accountCode: '8310',
  }),
  card('rv-a03', '2026-11-04', '7713', '퀵서비스', '견본 퀵 발송', 99_000, { accountCode: '8240' }),
];

const P = (
  txnId: string,
  kind: ReviewProposal['kind'],
  accountCode: string,
  confidence: number,
  basis: string,
  cite: string,
): ReviewProposal => ({
  txnId,
  kind,
  accountCode,
  confidence,
  basis,
  citations: [{ label: cite, screen: 'erp/accounting/journal' }],
});

/** 미분류 10건 가운데 제안 9건(확신 0.9 이상 7건). 해외 결제 1건은 가맹점 정보가 없어 제안하지 않았다 */
export const REVIEW_PROPOSALS: readonly ReviewProposal[] = [
  P(
    'rv-u01',
    'classify',
    '8140',
    0.97,
    '같은 가맹점의 지난 6건이 통신비입니다',
    '같은 가맹점 지난 6건 · 통신비',
  ),
  P(
    'rv-u02',
    'classify',
    '8120',
    0.95,
    '택시 가맹점은 지난 12건 모두 여비교통비입니다',
    '택시 지난 12건 · 여비교통비',
  ),
  P(
    'rv-u03',
    'classify',
    '8120',
    0.93,
    '승차권 구매는 출장 교통비로 분류해 왔습니다',
    '승차권 지난 4건 · 여비교통비',
  ),
  P(
    'rv-u04',
    'classify',
    '8110',
    0.92,
    '평일 점심 · 물류팀 카드 · 1인 13,000원이라 팀 식대입니다',
    '같은 가맹점 지난 5건 · 복리후생비',
  ),
  P(
    'rv-u05',
    'classify',
    '8300',
    0.94,
    '문구 가맹점의 지난 8건이 소모품비입니다',
    '같은 가맹점 지난 8건 · 소모품비',
  ),
  P(
    'rv-u06',
    'classify',
    '8310',
    0.91,
    '등기 우편 발송은 지급수수료로 분류해 왔습니다',
    '등기 우편 지난 3건 · 지급수수료',
  ),
  P(
    'rv-u07',
    'classify',
    '8110',
    0.9,
    '회의 음료는 복리후생비로 분류해 왔습니다',
    '같은 가맹점 지난 9건 · 복리후생비',
  ),
  P(
    'rv-u08',
    'classify',
    '8130',
    0.71,
    '대표 카드 · 저녁 · 1인 7만 원대라 고객 접대일 수 있습니다. 참석자를 확인해 주세요',
    '같은 카드 저녁 결제 지난 2건 · 기업업무추진비',
  ),
  P(
    'rv-u09',
    'asset',
    ASSET_ACCOUNT,
    0.78,
    '1,000,000원이 넘는 전자제품이라 비품으로 자산 대장에 올리는 것을 제안합니다',
    '비품 기준 1,000,000원 이상',
  ),
];

export const REVIEW_ANOMALIES: readonly ReviewAnomaly[] = [
  { txnId: 'rv-a01', reason: 'holiday', note: '일요일에 물류팀 카드로 결제했습니다' },
  {
    txnId: 'rv-a02',
    reason: 'duplicate',
    note: '같은 날 같은 금액(21,000원) 화상 회의 결제가 2건입니다',
  },
  { txnId: 'rv-a03', reason: 'spike', note: '같은 가맹점 전월 결제(33,000원)의 3배입니다' },
];

/**
 * 증빙 파일에서 읽은 금액(샘플). 파일을 올리면 이 값과 거래 금액을 맞춰 본다.
 * 표에 없는 거래는 거래 금액과 같다고 읽는다
 */
const EVIDENCE_READ: Readonly<Record<string, number>> = { 'rv-e01': 30_000 };
export const evidenceReadAmount = (t: ReviewTxn) => EVIDENCE_READ[t.id] ?? Math.abs(t.amount);

/** 공급가액(부가세 10% 포함 금액에서) */
export const supplyOf = (t: ReviewTxn) => Math.round(Math.abs(t.amount) / 1.1);
