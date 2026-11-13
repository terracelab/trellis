// 결산 샘플(PG-37): 채권 · 채무 연령, 은행 대사. 숫자는 trade.ts(RECEIVABLES · PAYABLES · LEDGER) · erp.ts(BANK_ACCOUNTS ·
// CASH_TX · CASH_ROWS)와 맞는다. 미결 문서 합 = 거래처 잔액, 대사 계좌의 통장 잔액 = 자금 일보의 당일 잔액.
import { BANK_ACCOUNTS, CASH_ROWS, CASH_TX } from './erp.js';
import { PAYABLES, RECEIVABLES, sum, TODAY } from './trade.js';

export { TODAY };

/* ── 채권 · 채무 연령 ──────────────────────────────────── */

/** 연령 구간: 기한이 지난 날 수. 미도래 = 기한 전(오늘이 기한이면 미도래) */
export const AGING_BUCKETS = [
  { key: 'current', label: '미도래', max: 0 },
  { key: 'd30', label: '1~30일', max: 30 },
  { key: 'd60', label: '31~60일', max: 60 },
  { key: 'd90', label: '61~90일', max: 90 },
  { key: 'over', label: '90일 초과', max: Infinity },
] as const;
export type AgingBucket = (typeof AGING_BUCKETS)[number]['key'];

/** 미결 문서 하나(받을 · 줄 잔액이 남은 세금계산서 · 계산서) */
export interface OpenItem {
  id: string;
  partyId: string;
  side: 'receivable' | 'payable';
  docNo: string;
  description: string;
  issued: string;
  due: string;
  /** 남은 잔액(원) */
  amount: number;
}

/** 거래처별 미결 문서. 거래처마다 합 = RECEIVABLES · PAYABLES 잔액 */
export const OPEN_ITEMS: readonly OpenItem[] = [
  // 대양상사: 원장(LEDGER) 선입선출 뒤 남은 10월분 잔액 + 11월 두 건
  {
    id: 'o01',
    partyId: 'p01',
    side: 'receivable',
    docNo: 'TI-2610-0098',
    description: '10월 납품분 잔액',
    issued: '2026-10-31',
    due: '2026-11-30',
    amount: 32_750_000,
  },
  {
    id: 'o02',
    partyId: 'p01',
    side: 'receivable',
    docNo: 'TI-2611-0111',
    description: '냉동 흰다리새우 240BOX',
    issued: '2026-11-02',
    due: '2026-12-31',
    amount: 10_164_000,
  },
  {
    id: 'o03',
    partyId: 'p01',
    side: 'receivable',
    docNo: 'TI-2611-0115',
    description: '흰다리새우 · 크라프트 박스',
    issued: '2026-11-05',
    due: '2026-12-31',
    amount: 9_482_000,
  },
  {
    id: 'o04',
    partyId: 'p02',
    side: 'receivable',
    docNo: 'TI-2609-0071',
    description: '9월 납품분 잔액',
    issued: '2026-09-20',
    due: '2026-10-05',
    amount: 8_420_000,
  },
  {
    id: 'o05',
    partyId: 'p02',
    side: 'receivable',
    docNo: 'TI-2610-0104',
    description: '10월 납품분',
    issued: '2026-10-31',
    due: '2026-12-15',
    amount: 30_000_000,
  },
  {
    id: 'o06',
    partyId: 'p03',
    side: 'receivable',
    docNo: 'TI-2608-0052',
    description: '8월 납품분 잔액',
    issued: '2026-08-10',
    due: '2026-08-25',
    amount: 5_280_000,
  },
  {
    id: 'o07',
    partyId: 'p03',
    side: 'receivable',
    docNo: 'TI-2610-0101',
    description: '10월 납품분',
    issued: '2026-10-31',
    due: '2026-11-15',
    amount: 16_500_000,
  },
  {
    id: 'o08',
    partyId: 'p04',
    side: 'receivable',
    docNo: 'TI-2607-0033',
    description: '7월 납품분 잔액',
    issued: '2026-07-15',
    due: '2026-07-31',
    amount: 2_150_000,
  },
  {
    id: 'o09',
    partyId: 'p04',
    side: 'receivable',
    docNo: 'TI-2609-0088',
    description: '9월 납품분',
    issued: '2026-09-30',
    due: '2026-10-31',
    amount: 10_250_000,
  },
  {
    id: 'o10',
    partyId: 'p07',
    side: 'payable',
    docNo: 'PO-2611-0042',
    description: '선적분 USD 39,440.00',
    issued: '2026-10-28',
    due: '2026-11-27',
    amount: 54_604_680,
  },
  {
    id: 'o11',
    partyId: 'p05',
    side: 'payable',
    docNo: 'TI-2609-0412',
    description: '포장재 9월분 잔액',
    issued: '2026-09-30',
    due: '2026-10-10',
    amount: 1_820_000,
  },
  {
    id: 'o12',
    partyId: 'p05',
    side: 'payable',
    docNo: 'TI-2610-0455',
    description: '크라프트 박스 · 아이스박스',
    issued: '2026-10-31',
    due: '2026-12-10',
    amount: 6_000_000,
  },
  {
    id: 'o13',
    partyId: 'p06',
    side: 'payable',
    docNo: 'TI-2610-0461',
    description: '10월 운송비',
    issued: '2026-10-31',
    due: '2026-11-30',
    amount: 3_810_000,
  },
];

const dayMs = 86_400_000;
const utc = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
};
/** 기한이 지난 날 수(지나지 않았으면 0 이하) */
export const daysPastDue = (due: string, today: string = TODAY) =>
  Math.round((utc(today) - utc(due)) / dayMs);

export function agingBucketOf(due: string, today: string = TODAY): AgingBucket {
  const days = daysPastDue(due, today);
  return AGING_BUCKETS.find((b) => days <= b.max)!.key;
}

export type AgingRow = { partyId: string; total: number; overdue: number } & Record<
  AgingBucket,
  number
>;

/** 거래처 × 구간 표(잔액 큰 순) */
export function agingRows(side: OpenItem['side'], today: string = TODAY): AgingRow[] {
  const balances = side === 'receivable' ? RECEIVABLES : PAYABLES;
  return balances
    .map((b) => {
      const row = { partyId: b.partyId, current: 0, d30: 0, d60: 0, d90: 0, over: 0 };
      for (const o of OPEN_ITEMS.filter((x) => x.side === side && x.partyId === b.partyId))
        row[agingBucketOf(o.due, today)] += o.amount;
      const total = row.current + row.d30 + row.d60 + row.d90 + row.over;
      return { ...row, total, overdue: total - row.current };
    })
    .sort((a, b) => b.total - a.total);
}

/* ── 은행 대사 ──────────────────────────────────────────── */

/** 통장 거래(은행 거래내역 불러오기) */
export interface StatementLine {
  id: string;
  date: string;
  /** 입금 + · 출금 − (원) */
  amount: number;
  /** 입금자 · 받는 분(통장 표기 그대로) */
  counterparty: string;
  memo: string;
}

/** 장부 전표(보통예금 계정의 이 계좌 분) */
export interface BookEntry {
  id: string;
  date: string;
  voucherId: string;
  amount: number;
  counterparty: string;
  memo: string;
  /** 은행에 아직 반영되지 않는 이유(예약 이체) */
  pendingNote?: string;
}

/** 대사하는 계좌: 주거래 보통예금 */
export const RECON_ACCOUNT = BANK_ACCOUNTS.find((a) => a.id === 'b1')!;
/** 대사 기간: 이번 달 1일 ~ 오늘 */
export const RECON_PERIOD = { from: `${TODAY.slice(0, 8)}01`, to: TODAY };

/** 오늘 통장 거래는 자금 일보(CASH_TX)와 같다 */
const todayLines: StatementLine[] = CASH_TX.filter((t) => t.accountId === RECON_ACCOUNT.id).map(
  (t) => ({
    id: `s-${t.id}`,
    date: TODAY,
    amount: t.direction === 'in' ? t.amount : -t.amount,
    counterparty: t.party,
    memo: t.memo,
  }),
);

export const STATEMENT: readonly StatementLine[] = [
  {
    id: 's1',
    date: '2026-11-02',
    amount: -2_640_000,
    counterparty: '동방로지스',
    memo: '10월 운송비',
  },
  {
    id: 's2',
    date: '2026-11-03',
    amount: -2_205_000,
    counterparty: '서해통상',
    memo: '매입 대금',
  },
  {
    id: 's3',
    date: '2026-11-04',
    amount: -3_960_000,
    counterparty: '미래패키징',
    memo: '포장재 대금',
  },
  {
    id: 's4',
    date: '2026-11-05',
    amount: -1_500,
    counterparty: '수수료',
    memo: '타행 이체 수수료 1건',
  },
  {
    id: 's5',
    date: '2026-11-05',
    amount: 2_150_000,
    counterparty: '서해통상',
    memo: '7월분 입금',
  },
  ...todayLines,
];

/** 오늘 장부는 자금 일보 전표 번호(CASH_TX.voucherId)와 같다 */
const todayEntries: BookEntry[] = CASH_TX.filter((t) => t.accountId === RECON_ACCOUNT.id).map(
  (t) => ({
    id: `b-${t.id}`,
    date: TODAY,
    voucherId: t.voucherId,
    amount: t.direction === 'in' ? t.amount : -t.amount,
    counterparty: t.party,
    memo: t.memo,
  }),
);

export const BOOK: readonly BookEntry[] = [
  {
    id: 'b1',
    date: '2026-11-02',
    voucherId: 'PV-2611-0047',
    amount: -2_640_000,
    counterparty: '동방로지스',
    memo: '운송비 10월분',
  },
  {
    id: 'b2',
    date: '2026-11-03',
    voucherId: 'PV-2611-0048',
    amount: -2_250_000,
    counterparty: '서해통상',
    memo: '매입 대금',
  },
  {
    id: 'b3',
    date: '2026-11-04',
    voucherId: 'PV-2611-0049',
    amount: -3_960_000,
    counterparty: '미래패키징',
    memo: '포장재 대금',
  },
  ...todayEntries,
  {
    id: 'b4',
    date: TODAY,
    voucherId: 'PV-2611-0055',
    amount: -1_284_000,
    counterparty: '화재보험',
    memo: '보험료 11월분',
    pendingNote: '11월 7일 예약 이체',
  },
];

/** 통장 잔액(오늘) = 자금 일보 당일 잔액 */
export const STATEMENT_BALANCE = CASH_ROWS.find((r) => r.id === RECON_ACCOUNT.id)!.today;
/** 기간 첫날 앞 잔액. 10월 마감 대사에서 통장 = 장부였다 */
export const RECON_OPENING = STATEMENT_BALANCE - sum(STATEMENT, (s) => s.amount);

/**
 * 처음 맞춘 짝(은행 거래내역 불러오기 뒤 자동 맞추기: 금액 · 방향이 같고 날짜가 3일 안).
 * 금액이 다른 짝(s2 · b2), 장부에 없는 거래(s4 수수료 · s5 입금), 은행에 아직 없는 거래(b4)는 남는다
 */
export function autoMatch(
  lines: readonly StatementLine[],
  entries: readonly BookEntry[],
): { statementId: string; bookId: string }[] {
  const used = new Set<string>();
  const pairs: { statementId: string; bookId: string }[] = [];
  for (const s of lines) {
    const hit = entries.find(
      (b) =>
        !used.has(b.id) &&
        b.amount === s.amount &&
        Math.abs(utc(b.date) - utc(s.date)) <= 3 * dayMs,
    );
    if (hit) {
      used.add(hit.id);
      pairs.push({ statementId: s.id, bookId: hit.id });
    }
  }
  return pairs;
}
