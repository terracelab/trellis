// ERP 샘플 데이터(회계 · 자금 · 영업 · 생산 · 인사 · 급여). 회사 · 거래처 · 품목 · 숫자는 trade.ts와 같다.
// 모든 값은 결정적이다. 합계가 맞아야 하는 것(전표 · 시산표 · 급여 · 매출 구성)은 여기서 계산해 블록이 같은 숫자를 쓴다.
import type {
  ChecklistState,
  CurrencyCode,
  ProgressState,
  StatusTone,
} from '@terracelab/trellis-contracts';
import {
  availableOf,
  INVOICES,
  invoiceTax,
  itemById,
  ITEMS,
  MONTHLY,
  PAYABLES,
  partyById,
  RATES,
  sum,
  taxOf,
  TODAY,
} from './trade.js';

export { TODAY };

const r5 = (v: number) => Math.round(v / 1e5) * 1e5;
const r3 = (v: number) => Math.round(v / 1e3) * 1e3;
const f10 = (v: number) => Math.floor(v / 10) * 10;

/** 합이 total과 정확히 같게 나눈다(10만 원 단위, 남는 몫은 가장 큰 항목에) */
export function allocate(total: number, weights: readonly number[]): number[] {
  const w = sum(weights, (x) => x);
  const out = weights.map((x) => r5((total * x) / w));
  const big = weights.indexOf(Math.max(...weights));
  out[big] =
    total -
    sum(
      out.filter((_, i) => i !== big),
      (x) => x,
    );
  return out;
}

/* ── 계정과목 ──────────────────────────────────────────── */

export type AccountGroup = '자산' | '부채' | '자본' | '수익' | '비용';
export const ACCOUNT_GROUPS: readonly AccountGroup[] = ['자산', '부채', '자본', '수익', '비용'];

export interface Account {
  code: string;
  name: string;
  group: AccountGroup;
}

/** 일반기업회계 계정과목 코드(4자리) */
export const ACCOUNTS: readonly Account[] = [
  { code: '1010', name: '현금', group: '자산' },
  { code: '1030', name: '보통예금', group: '자산' },
  { code: '1080', name: '외상매출금', group: '자산' },
  { code: '1200', name: '미수금', group: '자산' },
  { code: '1310', name: '선급금', group: '자산' },
  { code: '1350', name: '부가세대급금', group: '자산' },
  { code: '1460', name: '상품', group: '자산' },
  { code: '2120', name: '비품', group: '자산' },
  { code: '2510', name: '외상매입금', group: '부채' },
  { code: '2530', name: '미지급금', group: '부채' },
  { code: '2540', name: '예수금', group: '부채' },
  { code: '2550', name: '부가세예수금', group: '부채' },
  { code: '2600', name: '단기차입금', group: '부채' },
  { code: '3310', name: '자본금', group: '자본' },
  { code: '3750', name: '이월이익잉여금', group: '자본' },
  { code: '4010', name: '상품매출', group: '수익' },
  { code: '9010', name: '이자수익', group: '수익' },
  { code: '9070', name: '외환차익', group: '수익' },
  { code: '4510', name: '상품매출원가', group: '비용' },
  { code: '8010', name: '급여', group: '비용' },
  { code: '8110', name: '복리후생비', group: '비용' },
  { code: '8120', name: '여비교통비', group: '비용' },
  { code: '8130', name: '기업업무추진비', group: '비용' },
  { code: '8140', name: '통신비', group: '비용' },
  { code: '8170', name: '세금과공과', group: '비용' },
  { code: '8190', name: '지급임차료', group: '비용' },
  { code: '8240', name: '운반비', group: '비용' },
  { code: '8300', name: '소모품비', group: '비용' },
  { code: '8310', name: '지급수수료', group: '비용' },
  { code: '9310', name: '이자비용', group: '비용' },
  { code: '9320', name: '외환차손', group: '비용' },
];
export const accountByCode = (code: string) => ACCOUNTS.find((a) => a.code === code);
/** 차변이 늘어나는 계정(자산 · 비용) */
export const isDebitNormal = (g: AccountGroup) => g === '자산' || g === '비용';

/* ── 인사 ──────────────────────────────────────────────── */

export const EMPLOYMENT_STATES = {
  active: { label: '재직', tone: 'success' },
  leave: { label: '휴직', tone: 'warning' },
  retired: { label: '퇴직', tone: 'neutral' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type EmploymentState = keyof typeof EMPLOYMENT_STATES;

export interface Appointment {
  date: string;
  kind: '입사' | '승진' | '전보' | '직책' | '휴직' | '복직' | '퇴직';
  detail: string;
}

export interface Pay {
  base: number;
  /** 직책수당 */
  position: number;
  /** 연장근로수당(11월 근태 마감 기준) */
  overtime: number;
  /** 식대(비과세 월 20만 원) */
  meal: number;
  /** 자가운전보조금(비과세 월 20만 원) */
  car: number;
  /** 공제대상가족 수(본인 포함) */
  family: number;
  /** 근로소득 간이세액표 조회 값 */
  incomeTax: number;
}

export interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  hiredAt: string;
  status: EmploymentState;
  employment: '정규직' | '계약직';
  email: string;
  phone: string;
  /** 휴직 · 퇴직 사유와 기간 */
  note?: string;
  /** 올해 쓴 연차(일) */
  leaveUsed: number;
  history: readonly Appointment[];
  pay?: Pay;
  bank?: string;
}

export const DEPARTMENTS = ['경영', '경영지원팀', '구매팀', '영업팀', '물류팀', '생산팀'] as const;

export const EMPLOYEES: readonly Employee[] = [
  {
    id: '2015001',
    name: '윤지호',
    title: '대표',
    department: '경영',
    hiredAt: '2015-03-02',
    status: 'active',
    employment: '정규직',
    email: 'ceo@terra-trading.example',
    phone: '010-2201-4417',
    leaveUsed: 4,
    history: [{ date: '2015-03-02', kind: '입사', detail: '창업 · 대표이사' }],
    pay: {
      base: 8_500_000,
      position: 0,
      overtime: 0,
      meal: 200_000,
      car: 200_000,
      family: 3,
      incomeTax: 967_310,
    },
    bank: '기업은행 024-****-1101',
  },
  {
    id: '2016004',
    name: '오태식',
    title: '과장',
    department: '물류팀',
    hiredAt: '2016-08-01',
    status: 'leave',
    employment: '정규직',
    email: 'taesik.oh@terra-trading.example',
    phone: '010-4418-2093',
    note: '병가 휴직 2026-10-22~2027-01-21',
    leaveUsed: 13,
    history: [
      { date: '2016-08-01', kind: '입사', detail: '물류팀 사원' },
      { date: '2019-01-01', kind: '승진', detail: '사원 → 대리' },
      { date: '2023-01-01', kind: '승진', detail: '대리 → 과장' },
      { date: '2026-10-22', kind: '휴직', detail: '병가 휴직 3개월(무급)' },
    ],
  },
  {
    id: '2017002',
    name: '김테라',
    title: '팀장',
    department: '경영지원팀',
    hiredAt: '2017-01-09',
    status: 'active',
    employment: '정규직',
    email: 'terra.kim@terra-trading.example',
    phone: '010-3392-7781',
    leaveUsed: 11,
    history: [
      { date: '2017-01-09', kind: '입사', detail: '경영지원팀 대리' },
      { date: '2020-01-01', kind: '승진', detail: '대리 → 과장' },
      { date: '2024-01-01', kind: '승진', detail: '과장 → 차장' },
      { date: '2024-01-01', kind: '직책', detail: '경영지원팀장 보임' },
    ],
    pay: {
      base: 4_850_000,
      position: 300_000,
      overtime: 0,
      meal: 200_000,
      car: 200_000,
      family: 4,
      incomeTax: 282_240,
    },
    bank: '국민은행 4217-****-2210',
  },
  {
    id: '2018003',
    name: '이하은',
    title: '과장',
    department: '구매팀',
    hiredAt: '2018-04-02',
    status: 'active',
    employment: '정규직',
    email: 'haeun.lee@terra-trading.example',
    phone: '010-5521-0846',
    leaveUsed: 9,
    history: [
      { date: '2018-04-02', kind: '입사', detail: '구매팀 사원' },
      { date: '2021-01-01', kind: '승진', detail: '사원 → 대리' },
      { date: '2025-01-01', kind: '승진', detail: '대리 → 과장' },
    ],
    pay: {
      base: 4_150_000,
      position: 0,
      overtime: 214_000,
      meal: 200_000,
      car: 200_000,
      family: 2,
      incomeTax: 222_830,
    },
    bank: '신한은행 110-***-418822',
  },
  {
    id: '2019005',
    name: '강도현',
    title: '팀장',
    department: '영업팀',
    hiredAt: '2019-10-01',
    status: 'active',
    employment: '정규직',
    email: 'dohyun.kang@terra-trading.example',
    phone: '010-7710-3354',
    leaveUsed: 12,
    history: [
      { date: '2019-10-01', kind: '입사', detail: '영업팀 대리(경력)' },
      { date: '2022-01-01', kind: '승진', detail: '대리 → 과장' },
      { date: '2025-07-01', kind: '직책', detail: '영업팀장 보임' },
    ],
    pay: {
      base: 4_600_000,
      position: 300_000,
      overtime: 0,
      meal: 200_000,
      car: 200_000,
      family: 3,
      incomeTax: 268_080,
    },
    bank: '기업은행 024-****-7720',
  },
  {
    id: '2020002',
    name: '김도윤',
    title: '반장',
    department: '생산팀',
    hiredAt: '2020-06-01',
    status: 'active',
    employment: '정규직',
    email: 'doyun.kim@terra-trading.example',
    phone: '010-6634-1902',
    leaveUsed: 8,
    history: [
      { date: '2020-06-01', kind: '입사', detail: '물류팀 사원' },
      { date: '2023-03-01', kind: '전보', detail: '물류팀 → 생산팀(소분 라인 신설)' },
      { date: '2024-01-01', kind: '직책', detail: '평택 소분 1라인 반장' },
    ],
    pay: {
      base: 3_100_000,
      position: 150_000,
      overtime: 486_000,
      meal: 200_000,
      car: 0,
      family: 3,
      incomeTax: 110_340,
    },
    bank: '농협 302-****-5531',
  },
  {
    id: '2020007',
    name: '한예린',
    title: '대리',
    department: '경영지원팀',
    hiredAt: '2020-02-03',
    status: 'retired',
    employment: '정규직',
    email: 'yerin.han@terra-trading.example',
    phone: '010-9012-3381',
    note: '자진 퇴사 2026-10-31',
    leaveUsed: 15,
    history: [
      { date: '2020-02-03', kind: '입사', detail: '경영지원팀 사원' },
      { date: '2023-01-01', kind: '승진', detail: '사원 → 대리' },
      { date: '2026-10-31', kind: '퇴직', detail: '자진 퇴사 · 퇴직금 정산 11월 14일' },
    ],
  },
  {
    id: '2021004',
    name: '박서연',
    title: '대리',
    department: '경영지원팀',
    hiredAt: '2021-07-05',
    status: 'active',
    employment: '정규직',
    email: 'seoyeon.park@terra-trading.example',
    phone: '010-2875-6610',
    leaveUsed: 10,
    history: [
      { date: '2021-07-05', kind: '입사', detail: '경영지원팀 사원' },
      { date: '2024-01-01', kind: '승진', detail: '사원 → 대리' },
    ],
    pay: {
      base: 3_250_000,
      position: 0,
      overtime: 186_000,
      meal: 200_000,
      car: 0,
      family: 1,
      incomeTax: 115_700,
    },
    bank: '국민은행 4217-****-8803',
  },
  {
    id: '2022001',
    name: '정우진',
    title: '주임',
    department: '물류팀',
    hiredAt: '2022-02-14',
    status: 'active',
    employment: '정규직',
    email: 'woojin.jung@terra-trading.example',
    phone: '010-4471-2258',
    leaveUsed: 7,
    history: [
      { date: '2022-02-14', kind: '입사', detail: '물류팀 사원' },
      { date: '2025-01-01', kind: '승진', detail: '사원 → 주임' },
    ],
    pay: {
      base: 2_950_000,
      position: 0,
      overtime: 342_000,
      meal: 200_000,
      car: 0,
      family: 1,
      incomeTax: 97_000,
    },
    bank: '하나은행 391-****-1174',
  },
  {
    id: '2022006',
    name: '서지민',
    title: '대리',
    department: '영업팀',
    hiredAt: '2022-05-02',
    status: 'active',
    employment: '정규직',
    email: 'jimin.seo@terra-trading.example',
    phone: '010-3308-9921',
    leaveUsed: 7,
    history: [
      { date: '2022-05-02', kind: '입사', detail: '영업팀 사원(경력)' },
      { date: '2025-01-01', kind: '승진', detail: '사원 → 대리' },
    ],
    pay: {
      base: 3_300_000,
      position: 0,
      overtime: 0,
      meal: 200_000,
      car: 200_000,
      family: 2,
      incomeTax: 79_290,
    },
    bank: '기업은행 024-****-3318',
  },
  {
    id: '2023003',
    name: '장하늘',
    title: '주임',
    department: '영업팀',
    hiredAt: '2023-03-06',
    status: 'leave',
    employment: '정규직',
    email: 'haneul.jang@terra-trading.example',
    phone: '010-8126-4470',
    note: '육아휴직 2026-06-01~2027-05-31',
    leaveUsed: 5,
    history: [
      { date: '2023-03-06', kind: '입사', detail: '영업팀 사원' },
      { date: '2025-07-01', kind: '승진', detail: '사원 → 주임' },
      { date: '2026-06-01', kind: '휴직', detail: '육아휴직 12개월' },
    ],
  },
  {
    id: '2024002',
    name: '최민준',
    title: '사원',
    department: '영업팀',
    hiredAt: '2024-09-02',
    status: 'active',
    employment: '정규직',
    email: 'minjun.choi@terra-trading.example',
    phone: '010-5590-1287',
    leaveUsed: 9,
    history: [{ date: '2024-09-02', kind: '입사', detail: '영업팀 사원(신입 공채)' }],
    pay: {
      base: 2_700_000,
      position: 0,
      overtime: 0,
      meal: 200_000,
      car: 200_000,
      family: 1,
      incomeTax: 36_980,
    },
    bank: '카카오뱅크 3333-**-****552',
  },
  {
    id: '2025001',
    name: '문가영',
    title: '사원',
    department: '구매팀',
    hiredAt: '2025-03-04',
    status: 'active',
    employment: '정규직',
    email: 'gayoung.moon@terra-trading.example',
    phone: '010-7245-6638',
    leaveUsed: 6,
    history: [{ date: '2025-03-04', kind: '입사', detail: '구매팀 사원 · 수입 통관 실무' }],
    pay: {
      base: 2_750_000,
      position: 0,
      overtime: 128_000,
      meal: 200_000,
      car: 0,
      family: 1,
      incomeTax: 46_740,
    },
    bank: '국민은행 4217-****-0921',
  },
  {
    id: '2026002',
    name: '이수빈',
    title: '사원',
    department: '생산팀',
    hiredAt: '2026-04-01',
    status: 'active',
    employment: '계약직',
    email: 'subin.lee@terra-trading.example',
    phone: '010-6602-7719',
    note: '계약 기간 2026-04-01~2027-03-31',
    leaveUsed: 3,
    history: [{ date: '2026-04-01', kind: '입사', detail: '생산팀 사원(계약직 1년)' }],
    pay: {
      base: 2_500_000,
      position: 0,
      overtime: 312_000,
      meal: 200_000,
      car: 0,
      family: 1,
      incomeTax: 43_120,
    },
    bank: '우리은행 1002-***-447120',
  },
];
export const employeeByName = (name: string) => EMPLOYEES.find((e) => e.name === name);
/** "강도현 팀장" 같은 담당자 표기 */
export const staff = (name: string) => {
  const e = employeeByName(name);
  return e ? `${e.name} ${e.title}` : name;
};

/** 근속(년 · 개월) */
export function tenure(hiredAt: string, at: string = TODAY): { years: number; months: number } {
  const [hy, hm, hd] = hiredAt.split('-').map(Number) as [number, number, number];
  const [ty, tm, td] = at.split('-').map(Number) as [number, number, number];
  let months = (ty - hy) * 12 + (tm - hm) - (td < hd ? 1 : 0);
  if (months < 0) months = 0;
  return { years: Math.floor(months / 12), months: months % 12 };
}

/** 근로기준법 연차: 1년 미만은 매월 1일(최대 11일), 1년 이상 15일 + 2년마다 1일(최대 25일) */
export function annualLeave(hiredAt: string, at: string = TODAY): number {
  const { years, months } = tenure(hiredAt, at);
  if (years < 1) return Math.min(months, 11);
  return Math.min(15 + Math.floor((years - 1) / 2), 25);
}

/* ── 급여 ──────────────────────────────────────────────── */

/** 2026년 근로자 부담률. 국민연금 4.75%(기준소득월액 상한 637만 원), 건강 3.595%, 장기요양 = 건강보험료 × 0.9448/7.19, 고용 0.9% */
export const INSURANCE_RATES = {
  pension: 0.0475,
  pensionCap: 6_370_000,
  pensionFloor: 400_000,
  health: 0.03595,
  care: 0.9448 / 7.19,
  employment: 0.009,
} as const;

export interface Payslip {
  employee: Employee;
  base: number;
  /** 수당 합계(직책 · 연장 · 식대 · 자가운전) */
  allowance: number;
  gross: number;
  taxable: number;
  pension: number;
  health: number;
  care: number;
  employment: number;
  incomeTax: number;
  localTax: number;
  deduction: number;
  net: number;
}

export function payslipOf(e: Employee): Payslip {
  const p = e.pay!;
  const taxable = p.base + p.position + p.overtime;
  const allowance = p.position + p.overtime + p.meal + p.car;
  const gross = p.base + allowance;
  const R = INSURANCE_RATES;
  const pensionBase =
    Math.floor(Math.min(Math.max(taxable, R.pensionFloor), R.pensionCap) / 1000) * 1000;
  const pension = f10(pensionBase * R.pension);
  const health = f10(taxable * R.health);
  const care = f10(health * R.care);
  // 대표이사는 고용보험 적용 제외
  const employment = e.title === '대표' ? 0 : f10(taxable * R.employment);
  const localTax = f10(p.incomeTax * 0.1);
  const deduction = pension + health + care + employment + p.incomeTax + localTax;
  return {
    employee: e,
    base: p.base,
    allowance,
    gross,
    taxable,
    pension,
    health,
    care,
    employment,
    incomeTax: p.incomeTax,
    localTax,
    deduction,
    net: gross - deduction,
  };
}

export const PAYROLL_STATES = {
  draft: { label: '작성 중', tone: 'neutral' },
  confirmed: { label: '확정', tone: 'info' },
  paid: { label: '지급 완료', tone: 'success' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type PayrollState = keyof typeof PAYROLL_STATES;

/** 11월 급여 대장(휴직 · 퇴직 제외) */
export const PAYROLL = EMPLOYEES.filter((e) => e.status === 'active' && e.pay).map(payslipOf);
export const PAYROLL_TOTAL = {
  headcount: PAYROLL.length,
  gross: sum(PAYROLL, (r) => r.gross),
  deduction: sum(PAYROLL, (r) => r.deduction),
  net: sum(PAYROLL, (r) => r.net),
  withheld: sum(PAYROLL, (r) => r.incomeTax + r.localTax),
  insurance: sum(PAYROLL, (r) => r.pension + r.health + r.care + r.employment),
};
/** 10월 급여(퇴직 1명 포함 12명). 전월 대비용 확정 값 */
export const PAYROLL_PREV = { headcount: 12, gross: 52_384_000, net: 45_252_760 };
export const PAY_DAY = '2026-11-25';

/* ── 전표 ──────────────────────────────────────────────── */

export interface VoucherLine {
  account: string;
  partyId?: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface Voucher {
  id: string;
  date: string;
  kind: '대체' | '입금' | '출금';
  evidence: '세금계산서' | '계산서' | '카드' | '현금영수증' | '없음';
  memo: string;
  writer: string;
  docNo?: string;
  lines: readonly VoucherLine[];
}

const D = (account: string, debit: number, partyId?: string, memo?: string): VoucherLine => ({
  account,
  partyId,
  debit,
  credit: 0,
  memo,
});
const C = (account: string, credit: number, partyId?: string, memo?: string): VoucherLine => ({
  account,
  partyId,
  debit: 0,
  credit,
  memo,
});

/** 매출 세금계산서 한 장의 분개(외상매출금 / 상품매출 · 부가세예수금) */
function salesLines(invoiceId: string): VoucherLine[] {
  const inv = INVOICES.find((i) => i.id === invoiceId)!;
  const supply = sum(inv.lines, (l) => l.qty * l.unitPrice);
  const tax = invoiceTax(inv);
  const name = partyById(inv.partyId).name;
  return [
    D('1080', supply + tax, inv.partyId, `${name} 외상 매출`),
    C('4010', supply, undefined, `${inv.lines[0]!.name}${inv.lines.length > 1 ? ' 외' : ''}`),
    ...(tax ? [C('2550', tax, undefined, '매출 부가세')] : []),
  ];
}

export const VOUCHERS: readonly Voucher[] = [
  {
    id: 'JV-2611-0084',
    date: '2026-11-02',
    kind: '대체',
    evidence: '세금계산서',
    memo: '대양상사 냉동 흰다리새우 240BOX',
    writer: '박서연 대리',
    docNo: 'TI-2611-0111',
    lines: salesLines('TI-2611-0111'),
  },
  {
    id: 'JV-2611-0085',
    date: '2026-11-03',
    kind: '대체',
    evidence: '세금계산서',
    memo: '누리식품 올리브오일 · 가리비 관자',
    writer: '박서연 대리',
    docNo: 'TI-2611-0112',
    lines: salesLines('TI-2611-0112'),
  },
  {
    id: 'JV-2611-0086',
    date: '2026-11-03',
    kind: '대체',
    evidence: '세금계산서',
    memo: '동방로지스 통관 대행 · 냉동 컨테이너 운송',
    writer: '박서연 대리',
    docNo: 'PI-2611-0051',
    lines: [
      D('8310', 1_850_000, undefined, '수입 통관 대행 수수료'),
      D('8240', 1_960_000, undefined, '냉동 컨테이너 운송 2대'),
      D('1350', 381_000, undefined, '매입 부가세'),
      C('2530', 4_191_000, 'p06', '동방로지스 미지급'),
    ],
  },
  {
    id: 'JV-2611-0087',
    date: '2026-11-04',
    kind: '대체',
    evidence: '세금계산서',
    memo: '서해통상 PE 랩 · 보냉팩',
    writer: '박서연 대리',
    docNo: 'TI-2611-0114',
    lines: salesLines('TI-2611-0114'),
  },
  {
    id: 'JV-2611-0088',
    date: '2026-11-04',
    kind: '대체',
    evidence: '세금계산서',
    memo: '한결물산 냉동 연어 필렛 140KG',
    writer: '박서연 대리',
    docNo: 'TI-2611-0113',
    lines: salesLines('TI-2611-0113'),
  },
  {
    id: 'JV-2611-0089',
    date: '2026-11-04',
    kind: '대체',
    evidence: '세금계산서',
    memo: '미래패키징 라벨 프린터 리본 60EA',
    writer: '박서연 대리',
    docNo: 'PI-2611-0052',
    lines: [
      D('8300', 750_000, undefined, '라벨 프린터 리본 60EA'),
      D('1350', 75_000, undefined, '매입 부가세'),
      C('2530', 825_000, 'p05', '미래패키징 미지급'),
    ],
  },
  {
    id: 'JV-2611-0090',
    date: '2026-11-05',
    kind: '대체',
    evidence: '세금계산서',
    memo: '대양상사 흰다리새우 · 크라프트 박스',
    writer: '박서연 대리',
    docNo: 'TI-2611-0115',
    lines: salesLines('TI-2611-0115'),
  },
  {
    id: 'JV-2611-0091',
    date: '2026-11-05',
    kind: '대체',
    evidence: '세금계산서',
    memo: '누리식품 가리비 관자 · 아이스박스',
    writer: '박서연 대리',
    docNo: 'TI-2611-0116',
    lines: salesLines('TI-2611-0116'),
  },
  {
    id: 'RV-2611-0034',
    date: '2026-11-05',
    kind: '입금',
    evidence: '없음',
    memo: '대양상사 10월분 일부 입금 · 국민은행',
    writer: '김테라 팀장',
    lines: [
      D('1030', 30_000_000, undefined, '국민은행 입금'),
      C('1080', 30_000_000, 'p01', '외상매출금 회수'),
    ],
  },
  {
    id: 'RV-2611-0035',
    date: '2026-11-06',
    kind: '입금',
    evidence: '없음',
    memo: '한결물산 10월분 대금 · 국민은행',
    writer: '김테라 팀장',
    lines: [
      D('1030', 18_000_000, undefined, '국민은행 입금'),
      C('1080', 18_000_000, 'p02', '외상매출금 회수'),
    ],
  },
  {
    id: 'RV-2611-0036',
    date: '2026-11-06',
    kind: '입금',
    evidence: '없음',
    memo: '누리식품 10월 납품분 · 기업은행',
    writer: '김테라 팀장',
    lines: [
      D('1030', 12_400_000, undefined, '기업은행 입금'),
      C('1080', 12_400_000, 'p03', '외상매출금 회수'),
    ],
  },
  {
    id: 'PV-2611-0051',
    date: '2026-11-06',
    kind: '출금',
    evidence: '없음',
    memo: '미래패키징 리본 대금 · 국민은행',
    writer: '박서연 대리',
    lines: [
      D('2530', 825_000, 'p05', '미지급금 지급'),
      C('1030', 825_000, undefined, '국민은행 출금'),
    ],
  },
  {
    id: 'PV-2611-0052',
    date: '2026-11-06',
    kind: '출금',
    evidence: '세금계산서',
    memo: '본사 임차료 11월분 · 국민은행',
    writer: '박서연 대리',
    lines: [
      D('8190', 9_500_000, undefined, '본사 사무실 임차료'),
      D('1350', 950_000, undefined, '매입 부가세'),
      C('1030', 10_450_000, undefined, '국민은행 출금'),
    ],
  },
  {
    id: 'PV-2611-0053',
    date: '2026-11-06',
    kind: '출금',
    evidence: '세금계산서',
    memo: '수입 부가세 납부 · 통관 26-11-0004512',
    writer: '박서연 대리',
    lines: [
      D('1350', 4_812_000, undefined, '수입 부가세(한-EU FTA 관세 0%)'),
      C('1030', 4_812_000, undefined, '기업은행 출금'),
    ],
  },
  {
    id: 'PV-2611-0054',
    date: '2026-11-06',
    kind: '출금',
    evidence: '없음',
    memo: '법인카드 10월 이용분 결제 · 기업은행',
    writer: '박서연 대리',
    lines: [
      D('2530', 6_842_300, undefined, '법인카드 미지급금'),
      C('1030', 6_842_300, undefined, '기업은행 출금'),
    ],
  },
  {
    id: 'JV-2611-0092',
    date: '2026-11-06',
    kind: '대체',
    evidence: '카드',
    memo: '물류팀 야근 식대 · 법인카드',
    writer: '박서연 대리',
    lines: [
      D('8110', 186_000, undefined, '야근 식대 6명'),
      C('2530', 186_000, undefined, '법인카드'),
    ],
  },
];
export const NEXT_VOUCHER_NO = 'JV-2611-0093';
export const voucherTotal = (v: Voucher) => sum(v.lines, (l) => l.debit);

/* ── 합계잔액시산표(2026-01-01부터 누계) ───────────────── */

interface Posting {
  month: number;
  account: string;
  debit: number;
  credit: number;
}

/** 월별 매출 · 매입(MONTHLY)과 고정 비용으로 한 해 분개를 만든다. 분개마다 대차가 같아 시산표가 맞는다 */
function buildPostings(): Posting[] {
  const out: Posting[] = [];
  const post = (month: number, debits: [string, number][], credits: [string, number][]) => {
    for (const [account, v] of debits) out.push({ month, account, debit: v, credit: 0 });
    for (const [account, v] of credits) out.push({ month, account, debit: 0, credit: v });
  };
  const total = (xs: [string, number][]) => sum(xs, (x) => x[1]);
  // 기초 잔액(전기 이월)
  const openDr: [string, number][] = [
    ['1030', 684_200_000],
    ['1080', 1_512_400_000],
    ['1310', 84_000_000],
    ['1460', 1_186_300_000],
    ['2120', 62_400_000],
  ];
  const openCr: [string, number][] = [
    ['2510', 1_048_600_000],
    ['2530', 58_400_000],
    ['2600', 800_000_000],
    ['3310', 500_000_000],
  ];
  post(0, openDr, [...openCr, ['3750', total(openDr) - total(openCr)]]);

  const months = MONTHLY.filter((m) => m.month.startsWith('2026-'));
  let accruedPrev = 58_400_000;
  let withheldPrev = 0;
  let qOut = 0;
  let qIn = 0;
  let settle: { out: number; in: number } | null = null;
  const pay = PAYROLL_TOTAL;
  months.forEach((m, i) => {
    const k = i + 1;
    const s = m.sales;
    const p = m.purchase;
    const outVat = s / 10;
    const inVat = p / 10;
    post(
      k,
      [['1080', s + outVat]],
      [
        ['4010', s],
        ['2550', outVat],
      ],
    );
    post(
      k,
      [
        ['1460', p],
        ['1350', inVat],
      ],
      [['2510', p + inVat]],
    );
    const cogs = r5(p * 0.985);
    post(k, [['4510', cogs]], [['1460', cogs]]);
    const collected = r5((s + outVat) * 0.985);
    post(k, [['1030', collected]], [['1080', collected]]);
    const paid = r5((p + inVat) * 0.99);
    post(k, [['2510', paid]], [['1030', paid]]);
    // 급여(지급 · 원천징수) → 다음 달 예수금 납부
    post(
      k,
      [['8010', pay.gross]],
      [
        ['1030', pay.net],
        ['2540', pay.deduction],
      ],
    );
    if (withheldPrev) post(k, [['2540', withheldPrev]], [['1030', withheldPrev]]);
    withheldPrev = pay.deduction;
    const cash: [string, number][] = [
      ['8190', 61_500_000],
      ['8110', 6_850_000],
      ['8170', 2_460_000],
      ['8140', 840_000],
      ['9310', 3_066_000],
    ];
    post(k, cash, [['1030', total(cash)]]);
    post(k, [['1030', 412_000]], [['9010', 412_000]]);
    // 운송 · 통관 · 법인카드는 미지급금 → 다음 달 지급
    const accrued: [string, number][] = [
      ['8240', r3(s * 0.041)],
      ['8310', 18_600_000],
      ['8300', 2_350_000],
      ['8120', 1_280_000],
      ['8130', 3_100_000],
    ];
    post(k, accrued, [['2530', total(accrued)]]);
    post(k, [['2530', accruedPrev]], [['1030', accruedPrev]]);
    accruedPrev = total(accrued);
    const fx = r3(Math.sin(k * 1.7) * 4_800_000);
    if (fx > 0) post(k, [['9320', fx]], [['1030', fx]]);
    if (fx < 0) post(k, [['1030', -fx]], [['9070', -fx]]);
    if (k === 3) {
      post(
        k,
        [
          ['2120', 18_400_000],
          ['1350', 1_840_000],
        ],
        [['1030', 20_240_000]],
      );
      qIn += 1_840_000;
    }
    if (k === 6) post(k, [['2600', 300_000_000]], [['1030', 300_000_000]]);
    // 부가세: 분기 다음 달 25일 납부(4 · 7 · 10월)
    if (settle) {
      post(
        k,
        [['2550', settle.out]],
        [
          ['1350', settle.in],
          ['1030', settle.out - settle.in],
        ],
      );
      settle = null;
    }
    qOut += outVat;
    qIn += inVat;
    if (k % 3 === 0) {
      settle = { out: qOut, in: qIn };
      qOut = 0;
      qIn = 0;
    }
  });
  return out;
}

const POSTINGS = buildPostings();

export interface TrialRow {
  code: string;
  name: string;
  group: AccountGroup;
  debitSum: number;
  creditSum: number;
  debitBal: number;
  creditBal: number;
}

/** 1월 1일부터 through월 말까지(기초 잔액 포함) 계정별 합계 · 잔액 */
export function trialBalance(through: number): TrialRow[] {
  return ACCOUNTS.map((a) => {
    const ps = POSTINGS.filter((p) => p.account === a.code && p.month <= through);
    const debitSum = sum(ps, (p) => p.debit);
    const creditSum = sum(ps, (p) => p.credit);
    return {
      code: a.code,
      name: a.name,
      group: a.group,
      debitSum,
      creditSum,
      debitBal: Math.max(0, debitSum - creditSum),
      creditBal: Math.max(0, creditSum - debitSum),
    };
  }).filter((r) => r.debitSum || r.creditSum);
}

/** 계정 하나의 월별 증감(0 = 전기 이월) */
export function accountMonths(code: string, through: number) {
  const a = accountByCode(code)!;
  let balance = 0;
  return Array.from({ length: through + 1 }, (_, month) => {
    const ps = POSTINGS.filter((p) => p.account === code && p.month === month);
    const debit = sum(ps, (p) => p.debit);
    const credit = sum(ps, (p) => p.credit);
    balance += isDebitNormal(a.group) ? debit - credit : credit - debit;
    return { month, label: month === 0 ? '전기 이월' : `${month}월`, debit, credit, balance };
  });
}

/** 마감한 마지막 달(10월 결산 완료) */
export const CLOSED_MONTH = 10;

/** 결산 준비 항목(Checklist). ownerId = 담당 사용자(_platform USERS), link = 그 일을 하는 화면(블록 id) */
export interface CloseTask {
  id: string;
  title: string;
  note: string;
  state: ChecklistState;
  due: string;
  ownerId: string;
  link?: string;
}

/** 이번 달 결산 준비(합계잔액시산표 오른쪽 Checklist, PG-37). 은행 대사 · 채권 연령 · 재고 실사 화면과 숫자가 맞는다 */
export const CLOSING = {
  /** 결산하는 달 */
  month: 11,
  /** 마감 목표일 */
  due: '2026-12-04',
  tasks: [
    {
      id: 'opening',
      title: '전월 이월 확인',
      note: '10월 마감 잔액 · 시산표 대차 일치',
      state: 'done',
      due: '2026-11-03',
      ownerId: 'u03',
    },
    {
      id: 'bank',
      title: '은행 잔액 대사',
      note: '국민 · 외화 계좌 끝 · 주거래 계좌 남은 거래 5건',
      state: 'doing',
      due: '2026-12-01',
      ownerId: 'u03',
      link: 'erp/treasury/reconcile',
    },
    {
      id: 'vouchers',
      title: '매출 · 매입 전표',
      note: '11월 6일까지 16건 입력',
      state: 'doing',
      due: '2026-12-01',
      ownerId: 'u03',
      link: 'erp/accounting/journal',
    },
    {
      id: 'aging',
      title: '채권 연령 · 대손 검토',
      note: '90일 넘은 미수금 1건 · 거래처 회수 계획',
      state: 'pending',
      due: '2026-12-02',
      ownerId: 'u02',
      link: 'erp/accounting/aging',
    },
    {
      id: 'payroll',
      title: '급여 전표',
      note: '11월 25일 급여 확정 뒤에 입력합니다',
      state: 'blocked',
      due: '2026-11-26',
      ownerId: 'u03',
    },
    {
      id: 'fx',
      title: '외화 환산',
      note: 'USD 계좌 · Pacific Seafoods 외상매입금',
      state: 'pending',
      due: '2026-11-30',
      ownerId: 'u03',
    },
    {
      id: 'count',
      title: '재고 실사 · 매출원가',
      note: '순환 실사 진행 중 · 11월 30일 창고 3곳 마감 실사',
      state: 'pending',
      due: '2026-11-30',
      ownerId: 'u05',
      link: 'scm/inventory/count',
    },
    {
      id: 'depreciation',
      title: '감가상각',
      note: '비품 80,800,000원 · 정액법 5년',
      state: 'pending',
      due: '2026-12-02',
      ownerId: 'u03',
    },
  ] as readonly CloseTask[],
};

/* ── 자금 ──────────────────────────────────────────────── */

export interface BankAccount {
  id: string;
  bank: string;
  name: string;
  no: string;
  currency: CurrencyCode;
  /** 전일 잔액(외화는 외화 금액) */
  prev: number;
}

export const BANK_ACCOUNTS: readonly BankAccount[] = [
  {
    id: 'b1',
    bank: '기업은행',
    name: '보통예금 · 주거래',
    no: '024-118420-01-011',
    currency: 'KRW',
    prev: 1_486_320_450,
  },
  {
    id: 'b2',
    bank: '국민은행',
    name: '보통예금 · 운영',
    no: '421701-01-284519',
    currency: 'KRW',
    prev: 512_804_200,
  },
  {
    id: 'b3',
    bank: '기업은행',
    name: '외화 보통예금',
    no: '024-118420-56-001',
    currency: 'USD',
    prev: 182_450,
  },
];

export interface CashTx {
  id: string;
  time: string;
  accountId: string;
  direction: 'in' | 'out';
  party: string;
  memo: string;
  amount: number;
  voucherId: string;
}

/** 오늘 입출금(전표와 같은 금액) */
export const CASH_TX: readonly CashTx[] = [
  {
    id: 'c1',
    time: '09:42',
    accountId: 'b2',
    direction: 'in',
    party: '한결물산',
    memo: '10월분 대금',
    amount: 18_000_000,
    voucherId: 'RV-2611-0035',
  },
  {
    id: 'c2',
    time: '10:18',
    accountId: 'b1',
    direction: 'out',
    party: '부산세관',
    memo: '수입 부가세 · 통관 26-11-0004512',
    amount: 4_812_000,
    voucherId: 'PV-2611-0053',
  },
  {
    id: 'c3',
    time: '11:05',
    accountId: 'b1',
    direction: 'in',
    party: '누리식품',
    memo: '10월 납품분',
    amount: 12_400_000,
    voucherId: 'RV-2611-0036',
  },
  {
    id: 'c4',
    time: '13:30',
    accountId: 'b2',
    direction: 'out',
    party: '미래패키징',
    memo: '라벨 프린터 리본 대금',
    amount: 825_000,
    voucherId: 'PV-2611-0051',
  },
  {
    id: 'c5',
    time: '14:00',
    accountId: 'b2',
    direction: 'out',
    party: '세종타워 관리단',
    memo: '본사 임차료 11월분',
    amount: 10_450_000,
    voucherId: 'PV-2611-0052',
  },
  {
    id: 'c6',
    time: '15:20',
    accountId: 'b1',
    direction: 'out',
    party: '기업은행 카드',
    memo: '법인카드 10월 이용분',
    amount: 6_842_300,
    voucherId: 'PV-2611-0054',
  },
];

export const USD_RATE = RATES.find((r) => r.code === 'USD')!.rate;
/** 원화 환산(외화는 당일 매매기준율) */
export const toKrw = (a: BankAccount, amount: number) =>
  a.currency === 'KRW' ? amount : Math.round(amount * USD_RATE);

export const CASH_ROWS = BANK_ACCOUNTS.map((a) => {
  const txs = CASH_TX.filter((t) => t.accountId === a.id);
  const inflow = sum(
    txs.filter((t) => t.direction === 'in'),
    (t) => t.amount,
  );
  const outflow = sum(
    txs.filter((t) => t.direction === 'out'),
    (t) => t.amount,
  );
  const prev = toKrw(a, a.prev);
  return { ...a, prevKrw: prev, inflow, outflow, today: prev + inflow - outflow };
});
export const CASH_TOTAL = {
  prev: sum(CASH_ROWS, (r) => r.prevKrw),
  inflow: sum(CASH_ROWS, (r) => r.inflow),
  outflow: sum(CASH_ROWS, (r) => r.outflow),
  today: sum(CASH_ROWS, (r) => r.today),
};

const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
};

/** 30일 시재(원화 합계). 오늘 시재에서 거꾸로 일별 순증감을 빼 만든다 */
export const CASH_SERIES = (() => {
  const days = Array.from({ length: 30 }, (_, i) => addDays(TODAY, i - 29));
  const events: Record<string, number> = {
    '2026-10-12': -41_280_000, // 원천세 · 4대보험(9월분)
    '2026-10-15': 62_800_000, // 대양상사 9월분 입금(RV-2610-0211)
    '2026-10-20': -84_640_000, // Pacific Seafoods T/T
    '2026-10-26': -286_400_000, // 부가세 2기 예정 납부 · 9월 급여 이체
    '2026-10-30': 318_500_000, // 월말 매출 대금 회수
    '2026-11-02': -96_200_000, // 운송 · 통관 미지급금 지급
    '2026-11-05': 30_000_000, // 대양상사 일부 입금(RV-2611-0034)
  };
  const flow = days.map((d, i) => {
    const wd = new Date(`${d}T00:00:00Z`).getUTCDay();
    if (d === TODAY) return CASH_TOTAL.inflow - CASH_TOTAL.outflow;
    if (wd === 0 || wd === 6) return 0;
    return r5(Math.sin(i * 1.3) * 18_000_000 + 6_000_000) + (events[d] ?? 0);
  });
  let balance = CASH_TOTAL.today;
  const out = new Array<{ date: string; label: string; balance: number }>(30);
  for (let i = 29; i >= 0; i -= 1) {
    out[i] = { date: days[i]!, label: days[i]!.slice(5), balance };
    balance -= flow[i]!;
  }
  return out;
})();

export interface PlannedPayment {
  id: string;
  title: string;
  party: string;
  amount: number;
  due: string;
  link?: string;
  currencyNote?: string;
}

/** 지급 예정(채무 · 급여 · 원천세 · 4대보험) */
export const PLANNED_PAYMENTS: readonly PlannedPayment[] = [
  ...PAYABLES.map((p) => ({
    id: `pay-${p.partyId}`,
    title: '매입 대금',
    party: partyById(p.partyId).name,
    amount: p.balance,
    due: p.dueDate,
    link: 'erp/accounting/vendor-ledger',
    currencyNote: p.partyId === 'p07' ? 'USD 39,440.00' : undefined,
  })),
  {
    id: 'pay-salary',
    title: '11월 급여',
    party: `임직원 ${PAYROLL_TOTAL.headcount}명`,
    amount: PAYROLL_TOTAL.net,
    due: PAY_DAY,
    link: 'erp/hr-payroll/payroll',
  },
  {
    id: 'pay-withholding',
    title: '원천세 · 지방소득세',
    party: '관할 세무서 · 중구청',
    amount: PAYROLL_TOTAL.withheld,
    due: '2026-12-10',
  },
  {
    id: 'pay-insurance',
    title: '4대보험(11월분)',
    party: '국민건강보험공단 외',
    amount: PAYROLL_TOTAL.insurance * 2,
    due: '2026-12-10',
  },
].sort((a, b) => a.due.localeCompare(b.due));

/* ── 부가세 신고 ───────────────────────────────────────── */

/** 신고서 한 칸(칸 번호는 부가가치세 신고서 그대로) */
export interface VatRow {
  no: string;
  name: string;
  supply: number;
  tax: number;
}

/** 부가세 신고(블록 erp/tax/vat-return). 지금까지 자료로 미리 계산한 확정 신고 */
export const VAT_RETURN = {
  year: 2026,
  /** 1기 · 2기 */
  term: 2,
  kind: '확정',
  period: { from: '2026-07-01', to: '2026-12-31' },
  due: '2027-01-25',
  /** 자료가 들어온 마지막 달 */
  throughMonth: 11,
  sales: [
    { no: '1', name: '과세 · 세금계산서 발급분', supply: 4_812_400_000, tax: 481_240_000 },
    { no: '3', name: '과세 · 신용카드 · 현금영수증', supply: 0, tax: 0 },
    { no: '5', name: '영세율 · 세금계산서 발급분', supply: 128_000_000, tax: 0 },
    { no: '7', name: '예정신고 누락분', supply: 0, tax: 0 },
  ] as readonly VatRow[],
  purchase: [
    { no: '10', name: '세금계산서 수취분 · 일반 매입', supply: 3_390_600_000, tax: 339_060_000 },
    { no: '11', name: '세금계산서 수취분 · 고정자산 매입', supply: 42_000_000, tax: 4_200_000 },
    { no: '14', name: '그 밖의 공제매입세액(수입 세금계산서 포함)', supply: 0, tax: 2_840_000 },
    { no: '16', name: '공제받지 못할 매입세액', supply: -6_800_000, tax: -680_000 },
  ] as readonly VatRow[],
  /** 신고 전 확인 항목의 근거 한 줄 */
  checks: {
    card: '카드 매입 1,284건 · 사업 관련 여부',
    import: '세관 발행 4건 · 2,840,000원',
    deduct: '접대비 · 비영업용 승용차 680,000원',
  },
};

/* ── 영업(견적 · 수주) ─────────────────────────────────── */

/** 견적 → 수주 → 출고 대기 → 매출 확정(출고하면 매출을 인식하고 세금계산서는 뒤따른다) */
export const SALES_STAGES = {
  quote: { label: '견적', tone: 'neutral' },
  ordered: { label: '수주', tone: 'info' },
  shipping: { label: '출고 대기', tone: 'warning' },
  closed: { label: '매출 확정', tone: 'success' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>;
export type SalesStage = keyof typeof SALES_STAGES;

export interface SalesLine {
  itemId: string;
  qty: number;
  price: number;
  /** 재고에 이미 잡아 둔 수량(STOCK.reserved에 들어 있다). 없으면 출고 대기는 전량, 수주는 0 */
  reserved?: number;
}

export interface SalesOrder {
  id: string;
  partyId: string;
  date: string;
  /** 납기(견적은 희망 납기) */
  dueDate: string;
  owner: string;
  warehouseId: string;
  stage: SalesStage;
  lines: readonly SalesLine[];
  /** 견적 유효기간 */
  validUntil?: string;
  shippedAt?: string;
  invoiceId?: string;
  note?: string;
}

const SL = (itemId: string, qty: number, price?: number): SalesLine => ({
  itemId,
  qty,
  price: price ?? itemById(itemId).price,
});
/** 세금계산서 품목에서 수주 품목을 되살린다(trade.ts와 같은 숫자) */
const fromInvoice = (invoiceId: string): SalesLine[] =>
  INVOICES.find((i) => i.id === invoiceId)!.lines.map((l) => ({
    itemId: ITEMS.find((it) => it.name === l.name)!.id,
    qty: l.qty,
    price: l.unitPrice,
  }));

export const SALES_ORDERS: readonly SalesOrder[] = [
  {
    id: 'QT-2611-0022',
    partyId: 'p02',
    date: '2026-11-06',
    dueDate: '2026-11-18',
    validUntil: '2026-11-20',
    owner: '서지민',
    warehouseId: 'w3',
    stage: 'quote',
    lines: [SL('i02', 40, 182_000), SL('i01', 100, 38_000)],
    note: '올리브오일 40CTN 이상 단가 2% 할인',
  },
  {
    id: 'QT-2611-0021',
    partyId: 'p01',
    date: '2026-11-05',
    dueDate: '2026-11-20',
    validUntil: '2026-11-19',
    owner: '강도현',
    warehouseId: 'w2',
    stage: 'quote',
    lines: [SL('i03', 200), SL('i05', 60)],
  },
  {
    id: 'QT-2611-0020',
    partyId: 'p03',
    date: '2026-11-04',
    dueDate: '2026-11-16',
    validUntil: '2026-11-18',
    owner: '최민준',
    warehouseId: 'w2',
    stage: 'quote',
    lines: [SL('i04', 300, 30_500), SL('i09', 2_000)],
  },
  {
    id: 'QT-2611-0019',
    partyId: 'p04',
    date: '2026-11-02',
    dueDate: '2026-11-13',
    validUntil: '2026-11-16',
    owner: '서지민',
    warehouseId: 'w1',
    stage: 'quote',
    lines: [SL('i06', 5_000), SL('i07', 600)],
  },
  {
    id: 'SO-2611-0036',
    partyId: 'p02',
    date: '2026-11-06',
    dueDate: '2026-11-13',
    owner: '서지민',
    warehouseId: 'w3',
    stage: 'ordered',
    lines: [SL('i05', 30), SL('i02', 20)],
  },
  {
    id: 'SO-2611-0035',
    partyId: 'p03',
    date: '2026-11-06',
    dueDate: '2026-11-10',
    owner: '최민준',
    warehouseId: 'w1',
    stage: 'shipping',
    lines: [SL('i06', 1_000), SL('i07', 400)],
  },
  {
    id: 'SO-2611-0034',
    partyId: 'p01',
    date: '2026-11-05',
    dueDate: '2026-11-12',
    owner: '강도현',
    warehouseId: 'w2',
    stage: 'ordered',
    lines: [SL('i01', 300)],
    note: '11월 둘째 주 행사 물량',
  },
  {
    id: 'SO-2611-0033',
    partyId: 'p02',
    date: '2026-11-05',
    dueDate: '2026-11-09',
    owner: '서지민',
    warehouseId: 'w2',
    stage: 'shipping',
    lines: [SL('i04', 200)],
  },
  {
    id: 'SO-2611-0032',
    partyId: 'p02',
    date: '2026-11-04',
    dueDate: '2026-11-06',
    owner: '서지민',
    warehouseId: 'w3',
    stage: 'closed',
    shippedAt: '2026-11-06 08:40',
    invoiceId: 'TI-2611-0117',
    lines: fromInvoice('TI-2611-0117'),
  },
  {
    id: 'SO-2611-0031',
    partyId: 'p01',
    date: '2026-11-04',
    dueDate: '2026-11-06',
    owner: '강도현',
    warehouseId: 'w2',
    stage: 'closed',
    shippedAt: '2026-11-06 07:50',
    invoiceId: 'TI-2611-0118',
    lines: fromInvoice('TI-2611-0118'),
  },
  {
    id: 'SO-2611-0030',
    partyId: 'p03',
    date: '2026-11-03',
    dueDate: '2026-11-05',
    owner: '최민준',
    warehouseId: 'w2',
    stage: 'closed',
    shippedAt: '2026-11-05 08:10',
    invoiceId: 'TI-2611-0116',
    lines: fromInvoice('TI-2611-0116'),
  },
  {
    id: 'SO-2611-0029',
    partyId: 'p01',
    date: '2026-11-03',
    dueDate: '2026-11-05',
    owner: '강도현',
    warehouseId: 'w2',
    stage: 'closed',
    shippedAt: '2026-11-05 07:40',
    invoiceId: 'TI-2611-0115',
    lines: fromInvoice('TI-2611-0115'),
  },
  {
    id: 'SO-2611-0028',
    partyId: 'p04',
    date: '2026-11-02',
    dueDate: '2026-11-04',
    owner: '서지민',
    warehouseId: 'w1',
    stage: 'closed',
    shippedAt: '2026-11-04 09:20',
    invoiceId: 'TI-2611-0114',
    lines: fromInvoice('TI-2611-0114'),
  },
  {
    id: 'SO-2611-0027',
    partyId: 'p02',
    date: '2026-11-02',
    dueDate: '2026-11-04',
    owner: '서지민',
    warehouseId: 'w2',
    stage: 'closed',
    shippedAt: '2026-11-04 08:00',
    invoiceId: 'TI-2611-0113',
    lines: fromInvoice('TI-2611-0113'),
  },
  {
    id: 'SO-2611-0026',
    partyId: 'p03',
    date: '2026-11-01',
    dueDate: '2026-11-03',
    owner: '최민준',
    warehouseId: 'w3',
    stage: 'closed',
    shippedAt: '2026-11-03 08:30',
    invoiceId: 'TI-2611-0112',
    lines: fromInvoice('TI-2611-0112'),
  },
  {
    id: 'SO-2611-0025',
    partyId: 'p03',
    date: '2026-11-01',
    dueDate: '2026-11-02',
    owner: '최민준',
    warehouseId: 'w1',
    stage: 'closed',
    shippedAt: '2026-11-02 10:10',
    invoiceId: 'TI-2611-0109',
    lines: fromInvoice('TI-2611-0109'),
  },
  {
    id: 'SO-2611-0024',
    partyId: 'p01',
    date: '2026-11-01',
    dueDate: '2026-11-02',
    owner: '강도현',
    warehouseId: 'w2',
    stage: 'closed',
    shippedAt: '2026-11-02 07:30',
    invoiceId: 'TI-2611-0111',
    lines: fromInvoice('TI-2611-0111'),
  },
];
export const salesSupply = (o: SalesOrder) => sum(o.lines, (l) => l.qty * l.price);
/** 세액: 품목 과세 구분대로(면세 품목은 0). 10% 고정이 아니다 */
export const salesTax = (o: Pick<SalesOrder, 'lines'>) =>
  sum(o.lines, (l) => taxOf(l.qty * l.price, itemById(l.itemId).taxType));
/**
 * 품목별 가용재고 부족분(수주 · 출고 대기만 본다).
 * 가용재고는 예약분을 뺀 값이라, 이 수주가 이미 잡아 둔 수량은 다시 더해서 본다
 */
export const shortageOf = (o: SalesOrder) =>
  o.stage === 'ordered' || o.stage === 'shipping'
    ? o.lines
        .map((l) => ({
          ...l,
          available: availableOf(l.itemId) + (l.reserved ?? (o.stage === 'shipping' ? l.qty : 0)),
        }))
        .filter((l) => l.available < l.qty)
    : [];

/* ── 매출 분석 ─────────────────────────────────────────── */

/** 2026년 1~11월 · 전년 동월(2025) */
export const SALES_MONTHS = MONTHLY.filter((m) => m.month.startsWith('2026-')).map((m, i) => {
  const prevSales = r5(m.sales * (0.87 + Math.cos(i / 1.6) * 0.035));
  const prevMargin = Math.round((m.margin - 1.1 - Math.sin(i / 2) * 0.6) * 10) / 10;
  return {
    month: m.month,
    label: m.label,
    sales: m.sales,
    gp: m.sales - m.purchase,
    margin: m.margin,
    prevSales,
    prevGp: r5((prevSales * prevMargin) / 100),
    prevMargin,
  };
});

export const CUSTOMER_MIX = [
  { label: '대양상사', partyId: 'p01', share: 0.31, growth: 0.124 },
  { label: '한결물산', partyId: 'p02', share: 0.22, growth: 0.098 },
  { label: '누리식품', partyId: 'p03', share: 0.18, growth: 0.151 },
  { label: '서해통상', partyId: 'p04', share: 0.07, growth: -0.185 },
  { label: '기타 거래처 14곳', partyId: null, share: 0.22, growth: 0.06 },
] as const;

export const ITEM_MIX = [
  { itemId: 'i01', share: 0.27, growth: 0.142, category: '냉동 수산물' },
  { itemId: 'i02', share: 0.16, growth: 0.068, category: '오일' },
  { itemId: 'i03', share: 0.13, growth: -0.034, category: '냉동 수산물' },
  { itemId: 'i04', share: 0.15, growth: 0.186, category: '냉동 수산물' },
  { itemId: 'i05', share: 0.06, growth: 0.091, category: '소스 · 식초' },
  { itemId: 'i06', share: 0.07, growth: 0.04, category: '포장재' },
  { itemId: 'i07', share: 0.07, growth: 0.115, category: '포장재' },
  { itemId: 'i08', share: 0.04, growth: -0.062, category: '포장재' },
  { itemId: 'i09', share: 0.04, growth: 0.027, category: '포장재' },
  { itemId: 'i10', share: 0.01, growth: -0.015, category: '소모품' },
] as const;
export const CATEGORIES = ['냉동 수산물', '오일', '소스 · 식초', '포장재', '소모품'] as const;

/** 올해 · 전년 금액을 비중대로 나눈다(전년 비중 = 비중 ÷ (1 + 성장률)). 합계가 KPI와 같다 */
export function mixOf<T extends { share: number; growth: number }>(
  mix: readonly T[],
  total: number,
  prevTotal: number,
) {
  const now = allocate(
    total,
    mix.map((m) => m.share),
  );
  const prev = allocate(
    prevTotal,
    mix.map((m) => m.share / (1 + m.growth)),
  );
  return mix.map((m, i) => ({
    ...m,
    amount: now[i]!,
    prev: prev[i]!,
    delta: Math.round((now[i]! / prev[i]! - 1) * 1000) / 10,
  }));
}

/* ── 생산(재포장 · 소분) ───────────────────────────────── */

export interface Material {
  code: string;
  name: string;
  unit: string;
}

/** trade.ts 품목 + 소분용 포장 자재 */
export const PACK_MATERIALS: readonly Material[] = [
  { code: 'PK-2101', name: '진공 파우치 500g', unit: 'EA' },
  { code: 'PK-2102', name: '진공 파우치 300g', unit: 'EA' },
  { code: 'PK-2103', name: '선물 상자 3구', unit: 'EA' },
  { code: 'SP-3101', name: '한글 표시 라벨', unit: 'EA' },
];

export const materialOf = (code: string): Material => {
  const pack = PACK_MATERIALS.find((m) => m.code === code);
  if (pack) return pack;
  const it = ITEMS.find((i) => i.code === code)!;
  return { code: it.code, name: it.name, unit: it.unit };
};

export interface RepackProduct {
  id: string;
  code: string;
  name: string;
  spec: string;
  unit: 'EA' | 'SET';
  /** 완제품 1단위에 드는 자재 */
  bom: readonly { code: string; per: number }[];
}

export const REPACK_PRODUCTS: readonly RepackProduct[] = [
  {
    id: 'r1',
    code: 'RP-5001',
    name: '냉동 흰다리새우 소포장',
    spec: '500g · 진공',
    unit: 'EA',
    bom: [
      { code: 'FD-1001', per: 0.25 },
      { code: 'PK-2101', per: 1 },
      { code: 'SP-3101', per: 1 },
      { code: 'PK-2002', per: 0.05 },
      { code: 'PK-2004', per: 0.1 },
    ],
  },
  {
    id: 'r2',
    code: 'RP-5002',
    name: '올리브오일 낱병',
    spec: '1L · 한글 라벨',
    unit: 'EA',
    bom: [
      { code: 'FD-1002', per: 1 / 12 },
      { code: 'SP-3101', per: 1 },
    ],
  },
  {
    id: 'r3',
    code: 'RP-5003',
    name: '냉동 가리비 관자 소포장',
    spec: '300g · 진공',
    unit: 'EA',
    bom: [
      { code: 'FD-1003', per: 0.3 },
      { code: 'PK-2102', per: 1 },
      { code: 'SP-3101', per: 1 },
    ],
  },
  {
    id: 'r4',
    code: 'RP-5004',
    name: '냉동 연어 필렛 소포장',
    spec: '400g · 진공',
    unit: 'EA',
    bom: [
      { code: 'FD-1004', per: 0.4 },
      { code: 'PK-2101', per: 1 },
      { code: 'SP-3101', per: 1 },
    ],
  },
  {
    id: 'r5',
    code: 'RP-5005',
    name: '발사믹 · 올리브오일 선물세트',
    spec: '3구',
    unit: 'SET',
    bom: [
      { code: 'FD-1005', per: 1 / 3 },
      { code: 'FD-1002', per: 1 / 12 },
      { code: 'PK-2103', per: 1 },
      { code: 'SP-3101', per: 1 },
    ],
  },
];
export const productById = (id: string) => REPACK_PRODUCTS.find((p) => p.id === id)!;

export const WORK_LINES = [
  { id: 'L1', name: '평택 소분 1라인', warehouseId: 'w2' },
  { id: 'L2', name: '이천 재포장 2라인', warehouseId: 'w1' },
  { id: 'L3', name: '부산 보세 라벨 작업장', warehouseId: 'w3' },
] as const;
export const lineById = (id: string) => WORK_LINES.find((l) => l.id === id)!;

export interface WorkResult {
  id: string;
  at: string;
  good: number;
  defect: number;
  worker: string;
  note?: string;
}

export interface WorkOrder {
  id: string;
  productId: string;
  lineId: string;
  date: string;
  dueDate: string;
  planned: number;
  state: ProgressState;
  sourceLot?: string;
  owner: string;
  reason?: string;
  results: readonly WorkResult[];
}

export const WORK_ORDERS: readonly WorkOrder[] = [
  {
    id: 'WO-2611-0017',
    productId: 'r1',
    lineId: 'L1',
    date: '2026-11-10',
    dueDate: '2026-11-11',
    planned: 400,
    state: 'todo',
    owner: '김도윤',
    reason: 'PO-2611-0042 입고(11월 10일) 뒤 시작',
    results: [],
  },
  {
    id: 'WO-2611-0016',
    productId: 'r5',
    lineId: 'L2',
    date: '2026-11-09',
    dueDate: '2026-11-12',
    planned: 120,
    state: 'todo',
    owner: '이수빈',
    sourceLot: 'OS2610B · OS2610A',
    results: [],
  },
  {
    id: 'WO-2611-0015',
    productId: 'r3',
    lineId: 'L1',
    date: '2026-11-07',
    dueDate: '2026-11-09',
    planned: 300,
    state: 'hold',
    owner: '김도윤',
    sourceLot: 'HK261101',
    reason: '원료 부족. GR-2611-0031 검수 보류(588KG 중 12KG 파손 의심)',
    results: [],
  },
  {
    id: 'WO-2611-0014',
    productId: 'r1',
    lineId: 'L1',
    date: '2026-11-06',
    dueDate: '2026-11-06',
    planned: 320,
    state: 'doing',
    owner: '김도윤',
    sourceLot: 'PS2610A',
    results: [
      { id: 'w14-1', at: '2026-11-06 10:30', good: 112, defect: 1, worker: '김도윤' },
      {
        id: 'w14-2',
        at: '2026-11-06 12:00',
        good: 96,
        defect: 2,
        worker: '이수빈',
        note: '파우치 실링 불량 2EA 폐기',
      },
    ],
  },
  {
    id: 'WO-2611-0013',
    productId: 'r2',
    lineId: 'L3',
    date: '2026-11-05',
    dueDate: '2026-11-06',
    planned: 288,
    state: 'done',
    owner: '정우진',
    sourceLot: 'OS2610A',
    results: [
      { id: 'w13-1', at: '2026-11-05 11:40', good: 144, defect: 0, worker: '정우진' },
      { id: 'w13-2', at: '2026-11-05 16:10', good: 144, defect: 0, worker: '정우진' },
    ],
  },
  {
    id: 'WO-2611-0012',
    productId: 'r4',
    lineId: 'L1',
    date: '2026-11-04',
    dueDate: '2026-11-05',
    planned: 400,
    state: 'done',
    owner: '김도윤',
    sourceLot: 'PS2610B',
    results: [
      { id: 'w12-1', at: '2026-11-04 12:00', good: 210, defect: 2, worker: '김도윤' },
      { id: 'w12-2', at: '2026-11-04 16:30', good: 190, defect: 1, worker: '이수빈' },
    ],
  },
  {
    id: 'WO-2611-0011',
    productId: 'r3',
    lineId: 'L1',
    date: '2026-10-21',
    dueDate: '2026-10-23',
    planned: 200,
    state: 'cancel',
    owner: '김도윤',
    sourceLot: 'HK261009',
    reason: '원료 로트 HK261009 해동 흔적으로 반품(GR-2611-0025)',
    results: [],
  },
];
export const workDone = (w: WorkOrder) => sum(w.results, (r) => r.good);
export const workDefect = (w: WorkOrder) => sum(w.results, (r) => r.defect);
