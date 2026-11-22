// 원천세 · 지급명세서 · 법인세 신고 샘플(블록 erp/tax/withholding · erp/tax/corporate, TaxFiling).
// 근로소득은 급여 대장(erp.ts)과 같은 숫자다. 10월 귀속 = 11월 급여 대장 11명 + 10월 31일 퇴직자 1명
// (PAYROLL_PREV 12명 · 52,384,000원), 11월 귀속 = 11월 급여 대장(작성 중).
// 법인세는 손익계산서 · 세무조정 · 세액이 서로 맞게 계산한다. 세율 · 공제 금액은 샘플이라 신고 전에 그 해 세법으로 확인한다.
import { EMPLOYEES, PAYROLL, PAYROLL_PREV } from './erp.js';
import { TODAY } from './trade.js';

export { TODAY };

const f10 = (v: number) => Math.floor(v / 10) * 10;
const sumOf = <T>(rows: readonly T[], pick: (r: T) => number) =>
  rows.reduce((a, r) => a + pick(r), 0);

/** 신고서에 넣을 값 한 칸. kind로 보이는 모양과 복사할 글자를 정한다 */
export interface FormValue {
  key: string;
  /** 서식 이름 */
  form: string;
  /** 칸 이름(코드 · 칸 번호 포함) */
  line: string;
  value: number | string;
  /** amount = 원(천 단위) · count = 명 · rate = % · text = 글자 그대로 */
  kind: 'amount' | 'count' | 'rate' | 'text';
  /** 어디서 온 값인가(근거 한 줄) */
  from: string;
  /** 근거 화면(블록 id, ?값 붙여도 된다) */
  link?: string;
}

/** 제출 · 납부를 마친 신고(보관함 한 줄) */
export interface FiledReturn {
  filedAt: string;
  /** 접수증 · 납부확인서 파일 이름 */
  files: readonly string[];
  /** 누가 제출했나(대리 신고면 세무 대리인) */
  by?: string;
}

/* ── 원천세 · 지급명세서 ─────────────────────────────────── */

/** 원천징수 기준. 사업소득은 지급액의 3%(소득세), 지방소득세는 소득세의 10% */
export const WHT_RULES = {
  businessRate: 3,
  localRate: 10,
  /** 원천세 신고 · 납부: 다음 달 10일 */
  dueDay: 10,
} as const;

export type WhtIncomeKey = 'labor' | 'business';

export interface WhtPerson {
  id: string;
  name: string;
  /** 사업소득이면 용역 내용 */
  work?: string;
  paid: number;
  incomeTax: number;
  localTax: number;
}

export interface WhtIncome {
  key: WhtIncomeKey;
  label: string;
  /** 원천징수이행상황신고서 코드 */
  code: 'A01' | 'A25';
  people: number;
  paid: number;
  incomeTax: number;
  localTax: number;
  /** 급여 · 대금이 확정되어 신고에 넣을 수 있다 */
  ready: boolean;
  status: string;
  /** 신고를 마친 달은 보관한 합계만 있다(사람별 없음) */
  persons: readonly WhtPerson[];
  /** 어디서 온 금액인가 */
  source: string;
  link?: string;
}

export interface WhtBlocker {
  key: WhtIncomeKey;
  title: string;
  body: string;
  link: string;
  label: string;
}

export interface WhtMonth {
  /** 귀속 월(YYYY-MM) */
  month: string;
  due: string;
  /** 간이지급명세서(사업소득) 제출 기한: 다음 달 말일 */
  simpleDue: string;
  incomes: readonly [WhtIncome, WhtIncome];
  blockers: readonly WhtBlocker[];
  ready: boolean;
  filed?: FiledReturn;
  simpleFiled?: FiledReturn;
  total: { people: number; paid: number; incomeTax: number; localTax: number };
}

/** 사업소득을 지급한 개인(프리랜서). 용역 내용은 지급 내역 칸에 보인다 */
export const FREELANCERS = [
  { id: 'f01', name: '오세린', work: '통번역(수입 계약서 검토)' },
  { id: 'f02', name: '남궁별', work: '상품 사진 촬영' },
  { id: 'f03', name: '차유나', work: '전시회 부스 디자인' },
] as const;

const businessWht = (paid: number) => {
  const incomeTax = f10((paid * WHT_RULES.businessRate) / 100);
  return { incomeTax, localTax: f10((incomeTax * WHT_RULES.localRate) / 100) };
};
const freelancer = (id: string, paid: number): WhtPerson => {
  const f = FREELANCERS.find((x) => x.id === id)!;
  return { id: f.id, name: f.name, work: f.work, paid, ...businessWht(paid) };
};

const nextMonth = (ym: string) => {
  const [y, m] = ym.split('-').map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
};
const lastDay = (ym: string) => {
  const [y, m] = ym.split('-').map(Number) as [number, number];
  return `${ym}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
};
export const whtDue = (ym: string) =>
  `${nextMonth(ym)}-${String(WHT_RULES.dueDay).padStart(2, '0')}`;
export const simpleDue = (ym: string) => lastDay(nextMonth(ym));
export const monthNo = (ym: string) => Number(ym.slice(5, 7));

/** 10월 31일 퇴직자의 10월 급여(퇴직자 카드에는 급여 칸이 없어 여기 둔다) */
const RETIREE = EMPLOYEES.find((e) => e.status === 'retired')!;
const RETIREE_OCT = {
  gross: PAYROLL_PREV.gross - sumOf(PAYROLL, (p) => p.gross),
  incomeTax: 101_860,
};

const slipPersons: WhtPerson[] = PAYROLL.map((p) => ({
  id: p.employee.id,
  name: p.employee.name,
  paid: p.gross,
  incomeTax: p.incomeTax,
  localTax: p.localTax,
}));
const OCT_LABOR: WhtPerson[] = [
  ...slipPersons,
  {
    id: RETIREE.id,
    name: RETIREE.name,
    paid: RETIREE_OCT.gross,
    incomeTax: RETIREE_OCT.incomeTax,
    localTax: f10(RETIREE_OCT.incomeTax * 0.1),
  },
];

/** 신고를 마친 달(1~9월)의 보관 합계 */
const ARCHIVE: Readonly<
  Record<string, { labor: [number, number, number]; business: [number, number] }>
> = {
  '2026-01': { labor: [12, 50_840_000, 2_262_400], business: [1, 1_200_000] },
  '2026-02': { labor: [12, 50_840_000, 2_262_400], business: [2, 1_850_000] },
  '2026-03': { labor: [13, 54_326_000, 2_418_910], business: [1, 900_000] },
  '2026-04': { labor: [13, 54_612_000, 2_431_700], business: [2, 2_400_000] },
  '2026-05': { labor: [13, 54_410_000, 2_422_380], business: [2, 1_650_000] },
  '2026-06': { labor: [12, 51_930_000, 2_309_160], business: [1, 1_500_000] },
  '2026-07': { labor: [12, 52_118_000, 2_317_520], business: [3, 2_950_000] },
  '2026-08': { labor: [12, 52_240_000, 2_322_960], business: [2, 1_800_000] },
  '2026-09': { labor: [12, 52_026_000, 2_341_180], business: [2, 2_100_000] },
};

const income = (
  key: WhtIncomeKey,
  persons: readonly WhtPerson[],
  status: string,
  ready: boolean,
): WhtIncome => ({
  key,
  label: key === 'labor' ? '근로소득' : '사업소득',
  code: key === 'labor' ? 'A01' : 'A25',
  people: persons.length,
  paid: sumOf(persons, (p) => p.paid),
  incomeTax: sumOf(persons, (p) => p.incomeTax),
  localTax: sumOf(persons, (p) => p.localTax),
  ready,
  status,
  persons,
  source: key === 'labor' ? '급여 대장' : '외주 용역 대금(지출결의)',
  link: key === 'labor' ? 'erp/hr-payroll/payroll' : 'groupware/approval/inbox',
});

const archived = (
  key: WhtIncomeKey,
  people: number,
  paid: number,
  incomeTax: number,
): WhtIncome => ({
  key,
  label: key === 'labor' ? '근로소득' : '사업소득',
  code: key === 'labor' ? 'A01' : 'A25',
  people,
  paid,
  incomeTax,
  localTax: f10(incomeTax * 0.1),
  ready: true,
  status: '신고 완료',
  persons: [],
  source: '신고 보관함',
});

function monthOf(month: string): WhtMonth {
  const a = ARCHIVE[month];
  let incomes: [WhtIncome, WhtIncome];
  if (a) {
    incomes = [
      archived('labor', ...a.labor),
      archived('business', a.business[0], a.business[1], businessWht(a.business[1]).incomeTax),
    ];
  } else if (month === '2026-10') {
    incomes = [
      income('labor', OCT_LABOR, '지급 완료', true),
      income(
        'business',
        [freelancer('f01', 1_500_000), freelancer('f02', 900_000)],
        '지급 완료',
        true,
      ),
    ];
  } else {
    incomes = [
      income('labor', slipPersons, '작성 중', false),
      income(
        'business',
        [freelancer('f01', 1_800_000), freelancer('f02', 600_000), freelancer('f03', 2_400_000)],
        '결재 중',
        false,
      ),
    ];
  }
  const filed: FiledReturn | undefined = a
    ? {
        filedAt: `${nextMonth(month)}-${month === '2026-09' ? '08' : '10'}`,
        files: [`원천세 접수증 ${month}.pdf`, `지방소득세 납부확인서 ${month}.pdf`],
      }
    : undefined;
  const simpleFiled: FiledReturn | undefined = a
    ? { filedAt: lastDay(nextMonth(month)), files: [`간이지급명세서 접수증 ${month}.pdf`] }
    : undefined;
  const [labor, business] = incomes;
  const blockers: WhtBlocker[] = [];
  if (!filed) {
    if (!labor.ready)
      blockers.push({
        key: 'labor',
        title: `${monthNo(month)}월 급여가 확정 전입니다`,
        body: '급여 대장을 확정하면 근로소득 금액이 들어옵니다',
        link: labor.link ?? '',
        label: '급여 대장',
      });
    if (!business.ready)
      blockers.push({
        key: 'business',
        title: `${monthNo(month)}월 외주 용역 대금이 결재 중입니다`,
        body: '지출결의가 승인되면 사업소득 금액이 들어옵니다',
        link: business.link ?? '',
        label: '결재함',
      });
  }
  return {
    month,
    due: whtDue(month),
    simpleDue: simpleDue(month),
    incomes,
    blockers,
    ready: !!filed || blockers.length === 0,
    ...(filed ? { filed } : {}),
    ...(simpleFiled ? { simpleFiled } : {}),
    total: {
      people: labor.people + business.people,
      paid: labor.paid + business.paid,
      incomeTax: labor.incomeTax + business.incomeTax,
      localTax: labor.localTax + business.localTax,
    },
  };
}

/** 고를 수 있는 귀속 월(올해 1월 ~ 이번 달) */
export const WHT_MONTHS: readonly string[] = Array.from(
  { length: Number(TODAY.slice(5, 7)) },
  (_, i) => `${TODAY.slice(0, 4)}-${String(i + 1).padStart(2, '0')}`,
);
export const WHT: Readonly<Record<string, WhtMonth>> = Object.fromEntries(
  WHT_MONTHS.map((m) => [m, monthOf(m)]),
);

/** 원천징수이행상황신고서에 넣을 값 */
export function whtFormValues(m: WhtMonth): FormValue[] {
  const [labor, business] = m.incomes;
  const form = '원천징수이행상황신고서';
  const v = (
    key: string,
    line: string,
    value: number,
    kind: FormValue['kind'],
    from: string,
    link?: string,
  ): FormValue => ({
    key,
    form,
    line,
    value,
    kind,
    from,
    ...(link ? { link } : {}),
  });
  return [
    v(
      'a01-people',
      'A01 근로소득 간이세액 · 인원',
      labor.people,
      'count',
      `${labor.source} · ${labor.status}`,
      labor.link,
    ),
    v(
      'a01-paid',
      'A01 근로소득 간이세액 · 총지급액',
      labor.paid,
      'amount',
      labor.source,
      labor.link,
    ),
    v(
      'a01-tax',
      'A01 근로소득 간이세액 · 소득세',
      labor.incomeTax,
      'amount',
      `${labor.source} · 근로소득 간이세액표`,
      labor.link,
    ),
    v(
      'a25-people',
      'A25 사업소득 매월징수 · 인원',
      business.people,
      'count',
      `${business.source} · ${business.status}`,
      business.link,
    ),
    v(
      'a25-paid',
      'A25 사업소득 매월징수 · 총지급액',
      business.paid,
      'amount',
      business.source,
      business.link,
    ),
    v(
      'a25-tax',
      'A25 사업소득 매월징수 · 소득세',
      business.incomeTax,
      'amount',
      `지급액의 ${WHT_RULES.businessRate}%`,
      business.link,
    ),
    v('a99-tax', 'A99 총합계 · 납부할 소득세', m.total.incomeTax, 'amount', 'A01 + A25'),
    v(
      'local',
      '지방소득세(특별징수 · 위택스)',
      m.total.localTax,
      'amount',
      `소득세의 ${WHT_RULES.localRate}%`,
    ),
  ];
}

/** 간이지급명세서(거주자의 사업소득)에 넣을 값: 사람별 지급액 · 소득세 */
export function simpleFormValues(m: WhtMonth): FormValue[] {
  const business = m.incomes[1];
  const form = '간이지급명세서(거주자의 사업소득)';
  return business.persons.flatMap((p): FormValue[] => [
    {
      key: `${p.id}-paid`,
      form,
      line: `${p.name} · 지급액`,
      value: p.paid,
      kind: 'amount',
      from: p.work ?? business.source,
      ...(business.link ? { link: business.link } : {}),
    },
    {
      key: `${p.id}-tax`,
      form,
      line: `${p.name} · 소득세`,
      value: p.incomeTax,
      kind: 'amount',
      from: `지급액의 ${WHT_RULES.businessRate}%`,
    },
  ]);
}

/** 연간 지급명세서(근로소득): 연말정산 뒤 다음 해 3월 10일까지 */
export const annualDue = (year: string) => `${Number(year) + 1}-03-10`;
/** 지난해 지급명세서(보관함) */
export const ANNUAL_FILED: Readonly<Record<string, FiledReturn>> = {
  [String(Number(TODAY.slice(0, 4)) - 1)]: {
    filedAt: `${TODAY.slice(0, 4)}-03-06`,
    files: ['근로소득 지급명세서 접수증.pdf', '연말정산 결과 요약.pdf'],
  },
};

/* ── 법인세 ───────────────────────────────────────────────── */

/** 외부 세무조정 대상: 직전 사업연도 수입금액 70억 원 이상(세무조정계산서를 세무 대리인이 작성) */
export const EXTERNAL_ADJUST_REVENUE = 7_000_000_000;
/** 세무조정을 맡긴 세무 대리인 */
export const TAX_AGENT = { name: '세무법인 한결', contact: '정다온 세무사' };

export interface StatementRow {
  key: string;
  name: string;
  value: number;
}

export interface Adjustment {
  id: string;
  /** 세법 용어 */
  kind: '익금산입' | '손금불산입' | '손금산입' | '익금불산입';
  title: string;
  amount: number;
  /** 소득 처분 */
  disposal: '기타사외유출' | '유보' | '△유보' | '상여';
  basis: string;
}

export interface CorpYear {
  year: string;
  period: { from: string; to: string };
  /** 신고 · 납부 기한(사업연도 끝 + 3개월 말일) */
  due: string;
  /** 법인지방소득세 기한(+ 4개월 말일) */
  localDue: string;
  /** 마감한 달 수(12면 결산 끝) */
  closedMonths: number;
  /** 결산을 확정했다 */
  closed: boolean;
  /** 직전 사업연도 수입금액(외부 조정 판정) */
  prevRevenue: number;
  /** 손익계산서 요약(위에서 아래로) */
  incomeStatement: readonly StatementRow[];
  /** 재무상태표 요약 */
  balanceSheet: { assets: number; liabilities: number; equity: number };
  /** 법인세 비용(장부, 세무조정에서 손금불산입) */
  taxExpense: number;
  adjustments: readonly Adjustment[];
  /** 세무 대리인이 세무조정계산서를 보낸 날(외부 조정) */
  adjustedAt?: string;
  carryLoss: number;
  /** 과세표준 구간 세율(구간 끝 · 세율 %). 마지막 구간 끝은 Infinity */
  brackets: readonly { upTo: number; rate: number }[];
  /** 공제 · 감면 세액 */
  credits: readonly { name: string; amount: number; basis: string }[];
  /** 이미 낸 세액 */
  prepaid: readonly { name: string; amount: number }[];
  /**
   * 결산 전 예상. 소득 = 장부 법인세 차감 전 이익 + lines(남은 달) + 세무조정(예상)을 round 단위로 반올림.
   * 손익계산서 · 재무상태표는 마감한 달까지의 누계다
   */
  estimate?: {
    lines: readonly { key: string; label: string; amount: number; basis: string }[];
    round: number;
  };
  filed?: FiledReturn;
  localFiled?: FiledReturn;
}

const IS_2025: StatementRow[] = [
  { key: 'revenue', name: '매출액', value: 13_184_600_000 },
  { key: 'cogs', name: '매출원가', value: 10_262_300_000 },
  { key: 'sga', name: '판매비와관리비', value: 2_118_400_000 },
  { key: 'other-in', name: '영업외수익', value: 31_200_000 },
  { key: 'other-out', name: '영업외비용', value: 96_400_000 },
];
/** 2025 법인세 비용(장부) = 법인세 결정세액 109,920,900 + 법인지방소득세 12,442,090 */
const TAX_EXPENSE_2025 = 122_362_990;

export const CORP_YEARS: readonly CorpYear[] = [
  {
    year: '2025',
    period: { from: '2025-01-01', to: '2025-12-31' },
    due: '2026-03-31',
    localDue: '2026-04-30',
    closedMonths: 12,
    closed: true,
    prevRevenue: 11_862_400_000,
    incomeStatement: IS_2025,
    balanceSheet: { assets: 4_186_420_000, liabilities: 2_014_830_000, equity: 2_171_590_000 },
    taxExpense: TAX_EXPENSE_2025,
    adjustedAt: '2026-03-20',
    adjustments: [
      {
        id: 'tax-expense',
        kind: '손금불산입',
        title: '법인세 비용',
        amount: TAX_EXPENSE_2025,
        disposal: '기타사외유출',
        basis: '장부의 법인세 비용 전액',
      },
      {
        id: 'entertain',
        kind: '손금불산입',
        title: '기업업무추진비 한도 초과',
        amount: 18_640_000,
        disposal: '기타사외유출',
        basis: '지출 91,009,200원 · 한도 72,369,200원(중소기업 기본 3,600만 원 + 수입금액 기준)',
      },
      {
        id: 'depreciation',
        kind: '손금불산입',
        title: '감가상각비 한도 초과',
        amount: 4_210_000,
        disposal: '유보',
        basis: '물류 장비 정률법 상각 한도',
      },
      {
        id: 'penalty',
        kind: '손금불산입',
        title: '가산세 · 과태료',
        amount: 860_000,
        disposal: '기타사외유출',
        basis: '부가세 가산세 · 주정차 과태료',
      },
      {
        id: 'bad-debt',
        kind: '손금산입',
        title: '전기 대손충당금 한도 초과 추인',
        amount: 2_300_000,
        disposal: '△유보',
        basis: '2024 사업연도 유보 잔액',
      },
    ],
    carryLoss: 0,
    brackets: [
      { upTo: 200_000_000, rate: 9 },
      { upTo: 20_000_000_000, rate: 19 },
      { upTo: Infinity, rate: 21 },
    ],
    credits: [
      {
        name: '통합고용세액공제',
        amount: 14_500_000,
        basis: '청년 상시근로자 1명 증가 · 수도권 중소기업',
      },
    ],
    prepaid: [
      { name: '중간예납세액', amount: 51_800_000 },
      { name: '원천납부세액(이자소득)', amount: 4_368_000 },
    ],
    filed: {
      filedAt: '2026-03-27',
      files: ['법인세 접수증 2025.pdf', '법인세 납부확인서 2025.pdf', '세무조정계산서 2025.pdf'],
      by: TAX_AGENT.name,
    },
    localFiled: {
      filedAt: '2026-04-24',
      files: ['법인지방소득세 접수증 2025.pdf'],
      by: TAX_AGENT.name,
    },
  },
  {
    year: '2026',
    period: { from: '2026-01-01', to: '2026-12-31' },
    due: '2027-03-31',
    localDue: '2027-04-30',
    closedMonths: 10,
    closed: false,
    prevRevenue: IS_2025[0]!.value,
    // 1~10월 누계(10월 결산 보고서와 같은 숫자)
    incomeStatement: [
      { key: 'revenue', name: '매출액(1~10월)', value: 11_903_400_000 },
      { key: 'cogs', name: '매출원가', value: 9_288_120_000 },
      { key: 'sga', name: '판매비와관리비', value: 1_814_240_000 },
      { key: 'other-in', name: '영업외수익', value: 27_804_100 },
      { key: 'other-out', name: '영업외비용', value: 86_209_000 },
    ],
    balanceSheet: { assets: 4_412_850_300, liabilities: 2_705_880_000, equity: 1_706_970_300 },
    taxExpense: 0,
    adjustments: [
      {
        id: 'entertain',
        kind: '손금불산입',
        title: '기업업무추진비 한도 초과(예상)',
        amount: 19_400_000,
        disposal: '기타사외유출',
        basis: '전년과 같은 비율',
      },
      {
        id: 'depreciation',
        kind: '손금불산입',
        title: '감가상각비 한도 초과(예상)',
        amount: 3_600_000,
        disposal: '유보',
        basis: '전년과 같은 상각 방법',
      },
    ],
    carryLoss: 0,
    brackets: [
      { upTo: 200_000_000, rate: 9 },
      { upTo: 20_000_000_000, rate: 19 },
      { upTo: Infinity, rate: 21 },
    ],
    credits: [],
    prepaid: [{ name: '중간예납세액', amount: 54_960_450 }],
    estimate: {
      round: 1_000_000,
      lines: [
        {
          key: 'rest',
          label: '11~12월 예상 이익',
          amount: 170_000_000,
          basis: '최근 3개월 평균 × 2',
        },
      ],
    },
  },
];

export const corpYearOf = (year: string) =>
  CORP_YEARS.find((y) => y.year === year) ?? CORP_YEARS[0]!;

/** 산출세액(구간마다 세율, 10원 미만 버림) */
export function corpTaxOf(base: number, brackets: CorpYear['brackets']) {
  let tax = 0;
  let from = 0;
  for (const b of brackets) {
    if (base <= from) break;
    tax += ((Math.min(base, b.upTo) - from) * b.rate) / 100;
    from = b.upTo;
  }
  return f10(tax);
}

export interface CorpCalc {
  revenue: number;
  pretax: number;
  netIncome: number;
  add: number;
  deduct: number;
  income: number;
  base: number;
  tax: number;
  credit: number;
  prepaid: number;
  payable: number;
  /** 법인지방소득세(과세표준 × 법인세율의 10분의 1) */
  local: { tax: number; prepaid: number; payable: number };
  /** 외부 세무조정 대상 */
  external: boolean;
  estimate: boolean;
}

export function corpCalcOf(y: CorpYear): CorpCalc {
  const is = Object.fromEntries(y.incomeStatement.map((r) => [r.key, r.value]));
  const revenue = is['revenue'] ?? 0;
  const pretax =
    revenue - (is['cogs'] ?? 0) - (is['sga'] ?? 0) + (is['other-in'] ?? 0) - (is['other-out'] ?? 0);
  // 예상이면 남은 달까지 더한 연간 이익(법인세 비용 전)
  const netIncome =
    pretax - y.taxExpense + (y.estimate ? sumOf(y.estimate.lines, (l) => l.amount) : 0);
  const add = sumOf(
    y.adjustments.filter((a) => a.kind === '익금산입' || a.kind === '손금불산입'),
    (a) => a.amount,
  );
  const deduct = sumOf(
    y.adjustments.filter((a) => a.kind === '손금산입' || a.kind === '익금불산입'),
    (a) => a.amount,
  );
  const income = y.estimate
    ? Math.round((netIncome + add - deduct) / y.estimate.round) * y.estimate.round
    : netIncome + add - deduct;
  const base = Math.max(0, income - y.carryLoss);
  const tax = corpTaxOf(base, y.brackets);
  const credit = sumOf(y.credits, (c) => c.amount);
  const prepaid = sumOf(y.prepaid, (p) => p.amount);
  const localTax = corpTaxOf(
    base,
    y.brackets.map((b) => ({ upTo: b.upTo, rate: b.rate / 10 })),
  );
  const interest = y.prepaid.find((p) => p.name.startsWith('원천납부'))?.amount ?? 0;
  const localPrepaid = f10(interest * 0.1);
  return {
    revenue,
    pretax,
    netIncome,
    add,
    deduct,
    income,
    base,
    tax,
    credit,
    prepaid,
    payable: Math.max(0, tax - credit - prepaid),
    local: { tax: localTax, prepaid: localPrepaid, payable: Math.max(0, localTax - localPrepaid) },
    external: y.prevRevenue >= EXTERNAL_ADJUST_REVENUE,
    estimate: !!y.estimate,
  };
}

/** 법인세 서식 이름(값 표의 탭 순서) */
export const CORP_FORMS = [
  '과세표준 및 세액신고서',
  '세액조정계산서',
  '소득금액조정합계표',
  '공제감면세액',
  '표준재무제표',
] as const;
export type CorpForm = (typeof CORP_FORMS)[number];

/** 서식별 신고서 값 */
export function corpFormValues(y: CorpYear, c: CorpCalc): Record<CorpForm, FormValue[]> {
  const [f1, f2, f3, f4, f5] = CORP_FORMS;
  const v = (
    form: CorpForm,
    key: string,
    line: string,
    value: number | string,
    from: string,
    kind: FormValue['kind'] = 'amount',
    link?: string,
  ): FormValue => ({
    key: `${form}:${key}`,
    form,
    line,
    value,
    kind,
    from,
    ...(link ? { link } : {}),
  });
  const statements = 'erp/accounting/trial-balance';
  const rate = y.brackets.map((b) => `${b.rate}%`).join(' · ');
  return {
    [f1]: [
      v(f1, 'revenue', '수입금액', c.revenue, '손익계산서 · 매출액', 'amount', statements),
      v(
        f1,
        'income',
        '각 사업연도 소득금액',
        c.income,
        c.estimate ? '소득 예상의 가정' : '소득금액조정합계표',
      ),
      v(f1, 'loss', '이월결손금', y.carryLoss, '전년도 신고(이월결손금 없음)'),
      v(f1, 'base', '과세표준', c.base, '소득금액 − 이월결손금'),
      v(f1, 'tax', '산출세액', c.tax, `과세표준 구간 세율(${rate})`),
      v(f1, 'credit', '공제감면세액', c.credit, '공제감면세액 서식'),
      v(f1, 'prepaid', '기납부세액', c.prepaid, y.prepaid.map((p) => p.name).join(' · ') || '없음'),
      v(f1, 'payable', '차감 납부할 세액', c.payable, '산출세액 − 공제감면세액 − 기납부세액'),
    ],
    [f2]: [
      v(
        f2,
        'net',
        '결산서상 당기순손익',
        c.netIncome,
        '손익계산서 · 당기순이익',
        'amount',
        statements,
      ),
      v(f2, 'add', '소득조정금액 · 익금산입', c.add, '소득금액조정합계표'),
      v(f2, 'deduct', '소득조정금액 · 손금산입', c.deduct, '소득금액조정합계표'),
      v(
        f2,
        'income',
        '각 사업연도 소득금액',
        c.income,
        `당기순손익 + 익금산입 − 손금산입${c.estimate ? '(백만 원 단위 반올림)' : ''}`,
      ),
      v(f2, 'base', '과세표준', c.base, '소득금액 − 이월결손금'),
      v(f2, 'rate', '세율', rate, '과세표준 구간', 'text'),
      v(f2, 'tax', '산출세액', c.tax, '과세표준 × 구간 세율'),
      v(f2, 'credit', '공제감면세액', c.credit, '공제감면세액 서식'),
      v(f2, 'payable', '차감 납부할 세액', c.payable, '산출세액 − 공제감면세액 − 기납부세액'),
    ],
    [f3]: y.adjustments.map((a) =>
      v(f3, a.id, `${a.kind} · ${a.title}(${a.disposal})`, a.amount, a.basis),
    ),
    [f4]: y.credits.length
      ? y.credits.flatMap((cr) => [
          v(f4, `${cr.name}-target`, `${cr.name} · 대상 세액`, c.tax, '산출세액'),
          v(f4, `${cr.name}-amount`, `${cr.name} · 공제세액`, cr.amount, cr.basis),
        ])
      : [v(f4, 'none', '공제 · 감면', '결산 뒤 확인', '고용 · 투자 실적이 확정되면 계산', 'text')],
    [f5]: [
      v(f5, 'assets', '자산 총계', y.balanceSheet.assets, '재무상태표', 'amount', statements),
      v(
        f5,
        'liabilities',
        '부채 총계',
        y.balanceSheet.liabilities,
        '재무상태표',
        'amount',
        statements,
      ),
      v(f5, 'equity', '자본 총계', y.balanceSheet.equity, '재무상태표', 'amount', statements),
      v(f5, 'revenue', '매출액', c.revenue, '손익계산서', 'amount', statements),
      v(f5, 'net', '당기순이익', c.netIncome, '손익계산서', 'amount', statements),
    ],
  };
}
