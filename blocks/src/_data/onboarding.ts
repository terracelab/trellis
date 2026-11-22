// 처음 설정(블록 platform/onboarding/setup) 샘플. 회사 → 사람 → 자료 → 에이전트 → 확인.
// 서류에서 읽은 값 · 직원 엑셀 줄 · 켤 에이전트 후보와, 마지막 단계의 법정 기한 계산을 둔다.
// 기한은 아래 DEADLINE_RULES와 처음 설정 값(결산월 · 직원 수 · 세액감면)으로 계산한다. 날짜 글자를 코드에 쓰지 않는다.
// 실제 서비스에서는 서류 읽기를 백엔드가 하고, 기한 규칙은 회사의 규칙 표에서 읽는다.
import type { IconName } from '@terracelab/trellis-icons';
import { addDays, monthEnd } from '../_ui/dates.js';
import { COMPANY, ROLES } from '../_platform/mock.js';
import { EMPLOYEES } from './erp.js';
import { TODAY } from './trade.js';

export interface OnboardingSetup {
  name: string;
  bizNo: string;
  ceo: string;
  address: string;
  industry: string;
  foundedAt: string;
  /** 결산월(1~12) */
  closingMonth: number;
  /** 급여일(매월 n일) */
  payday: number;
  /** 창업중소기업 세액감면 적용 */
  taxRelief: boolean;
  /** 직원 엑셀에서 읽었거나 한 명씩 더한 사람 */
  people: readonly OnboardingPerson[];
  /** 올린 자료(종류 → 파일 이름) */
  uploads: Readonly<Partial<Record<UploadKind, string>>>;
  /** 켤 에이전트 id */
  agents: readonly string[];
}

export interface OnboardingPerson {
  id: string;
  name: string;
  department: string;
  joinedAt: string;
  /** 역할 id(_platform ROLES) */
  role: string;
  /** 줄 검사 오류. 없으면 통과 */
  error?: string;
}

export type UploadKind = 'taxInvoice' | 'card' | 'bank';

export const EMPTY_SETUP: OnboardingSetup = {
  name: '',
  bizNo: '',
  ceo: '',
  address: '',
  industry: '',
  foundedAt: '',
  closingMonth: 12,
  payday: 25,
  taxRelief: false,
  people: [],
  uploads: {},
  agents: [],
};

/** 사업자등록증 · 등기부에서 읽은 값(샘플). ProposalCard로 보이고 승인해야 칸에 들어간다 */
export const READ_FROM_DOCS: Pick<
  OnboardingSetup,
  'name' | 'bizNo' | 'ceo' | 'address' | 'industry' | 'foundedAt'
> = {
  name: COMPANY.name,
  bizNo: COMPANY.bizNo,
  ceo: COMPANY.ceo,
  address: COMPANY.address,
  industry: '수산물 · 냉동식품 수입 도매업',
  foundedAt: '2015-03-02',
};

/** 올린 서류 파일(샘플 이름) */
export const SAMPLE_DOC_FILES = ['사업자등록증.pdf', '법인 등기사항전부증명서.pdf'] as const;

/** 직원 엑셀 파일 이름(샘플) */
export const PEOPLE_FILE = { name: '직원 명부.xlsx', size: 18_432 };

const DEPT_ROLE: Readonly<Record<string, string>> = {
  경영지원팀: 'finance',
  구매팀: 'purchase',
  물류팀: 'logistics',
};

const person = (id: string, error?: string): OnboardingPerson => {
  const e = EMPLOYEES.find((x) => x.id === id);
  return {
    id: `p-${id}`,
    name: e?.name ?? '',
    department: e?.department ?? '',
    joinedAt: error ? '' : (e?.hiredAt ?? ''),
    role: DEPT_ROLE[e?.department ?? ''] ?? 'auditor',
    ...(error ? { error } : {}),
  };
};

/** 직원 엑셀에서 읽은 줄(5줄 중 1줄 오류) */
export const SAMPLE_PEOPLE: readonly OnboardingPerson[] = [
  person('2017002'),
  person('2021004'),
  person('2018003'),
  person('2022001'),
  person('2025001', '입사일이 비어 있습니다. 엑셀의 입사일 칸을 채워 다시 올리세요'),
];

/** 한 명씩 더할 때 고르는 역할(관리자는 처음 설정한 사람 하나라 뺀다) */
export const PERSON_ROLES = ROLES.filter((r) => r.id !== 'admin').map((r) => ({
  value: r.id,
  label: r.name,
}));
export const roleName = (id: string) => ROLES.find((r) => r.id === id)?.name ?? id;

/** 지난 달 자료 세 가지 */
export const UPLOAD_KINDS: readonly { key: UploadKind; label: string; hint: string }[] = [
  {
    key: 'taxInvoice',
    label: '세금계산서',
    hint: '국세청에서 내려받은 매출 · 매입 세금계산서(엑셀)',
  },
  { key: 'card', label: '카드 사용내역', hint: '카드사에서 내려받은 법인카드 승인 내역(엑셀)' },
  { key: 'bank', label: '계좌 거래 내역', hint: '인터넷뱅킹에서 내려받은 거래 내역(엑셀)' },
];

export interface AgentChoice {
  id: string;
  name: string;
  /** 무엇을 알려 주는지 한 줄 */
  briefs: string;
  icon: IconName;
}

/** 켤 수 있는 에이전트. 켠 에이전트의 항목만 홈 브리핑에 올라온다 */
export const AGENT_CHOICES: readonly AgentChoice[] = [
  {
    id: 'tax',
    name: '세무 담당',
    briefs: '신고 기한 · 세금계산서 전송 실패 · 부가세 예상',
    icon: 'landmark',
  },
  {
    id: 'accounting',
    name: '회계 담당',
    briefs: '미분류 거래 · 증빙 누락 · 월마감 점검',
    icon: 'calculator',
  },
  {
    id: 'hr',
    name: '인사 담당',
    briefs: '근로계약 만료 · 연차 사용 촉진 · 4대보험 신고',
    icon: 'users',
  },
  {
    id: 'purchasing',
    name: '구매 담당',
    briefs: '발주 납기 · 단가 변동 · 결재 대기 발주',
    icon: 'shopping-cart',
  },
  {
    id: 'inventory',
    name: '재고 담당',
    briefs: '안전재고 미달 · 유통기한 임박 로트',
    icon: 'boxes',
  },
  {
    id: 'receivables',
    name: '채권 담당',
    briefs: '입금 예정일이 지난 미수금 · 거래처 한도',
    icon: 'wallet',
  },
];

/** 1~3단계 답으로 미리 고를 에이전트: 세무 · 회계는 늘, 직원이 있으면 인사 */
export const suggestAgents = (employees: number) => [
  'tax',
  'accounting',
  ...(employees > 0 ? ['hr'] : []),
];

/** 기한 규칙(규칙 표의 기한 줄). value의 단위는 unit */
export interface DeadlineRule {
  key: string;
  name: string;
  value: number | readonly number[];
  unit: '일' | '월' | '개월';
  law: string;
}

export const DEADLINE_RULES: readonly DeadlineRule[] = [
  {
    key: 'withholding',
    name: '원천세 신고 · 납부(다음 달)',
    value: 10,
    unit: '일',
    law: '소득세법',
  },
  {
    key: 'insurance',
    name: '4대보험 취득 신고(다음 달)',
    value: 15,
    unit: '일',
    law: '국민건강보험법',
  },
  {
    key: 'vat-months',
    name: '부가세 신고 · 납부 달',
    value: [1, 4, 7, 10],
    unit: '월',
    law: '부가가치세법',
  },
  { key: 'vat-day', name: '부가세 신고 · 납부 날', value: 25, unit: '일', law: '부가가치세법' },
  {
    key: 'corporate',
    name: '법인세 신고(결산월 말일부터)',
    value: 3,
    unit: '개월',
    law: '법인세법',
  },
];

export const ruleOf = (key: string) => DEADLINE_RULES.find((r) => r.key === key);
const ruleNumber = (key: string) => {
  const v = ruleOf(key)?.value;
  return typeof v === 'number' ? v : 0;
};

/** today 이후(당일 포함) 처음 오는 그 달의 day일 */
function nextMonthly(today: string, day: number): string {
  for (let n = 0; n < 3; n += 1) {
    const date = `${monthEnd(today, n).slice(0, 8)}${String(day).padStart(2, '0')}`;
    if (date >= today) return date;
  }
  return monthEnd(today, 3);
}

/** 결산월 말일 + n개월의 말일(법인세 신고 기한). today 이후 처음 오는 것 */
function nextCorporate(today: string, closingMonth: number, months: number): string {
  const year = Number(today.slice(0, 4));
  for (const y of [year - 1, year, year + 1]) {
    const due = monthEnd(monthEnd(`${y}-${String(closingMonth).padStart(2, '0')}-01`), months);
    if (due >= today) return due;
  }
  return today;
}

export interface Deadline {
  id: string;
  title: string;
  due: string;
  /** 근거 규칙(DEADLINE_RULES key) */
  ruleKey: string;
  /** 맡는 사람: 대표 · 경영지원 */
  owner: 'ceo' | 'admin';
}

/** days일 안의 법정 기한. 기한 규칙과 처음 설정 값으로 계산한다 */
export function deadlinesFor(setup: OnboardingSetup, today = TODAY, days = 30): Deadline[] {
  const limit = addDays(today, days);
  const employees = setup.people.filter((p) => !p.error).length;
  const out: Deadline[] = [];
  if (employees > 0) {
    out.push({
      id: 'withholding',
      title: '원천세 신고 · 납부(근로소득)',
      due: nextMonthly(today, ruleNumber('withholding')),
      ruleKey: 'withholding',
      owner: 'admin',
    });
    out.push({
      id: 'insurance',
      title: `4대보험 취득 신고(${employees}명)`,
      due: nextMonthly(today, ruleNumber('insurance')),
      ruleKey: 'insurance',
      owner: 'admin',
    });
  }
  const vatMonths = ruleOf('vat-months')?.value;
  const vatDay = ruleNumber('vat-day');
  for (let n = 0; n < 3; n += 1) {
    const end = monthEnd(today, n);
    const due = `${end.slice(0, 8)}${String(vatDay).padStart(2, '0')}`;
    if (Array.isArray(vatMonths) && vatMonths.includes(Number(end.slice(5, 7))) && due >= today) {
      out.push({ id: 'vat', title: '부가세 신고 · 납부', due, ruleKey: 'vat-day', owner: 'admin' });
      break;
    }
  }
  const corporate = nextCorporate(today, setup.closingMonth, ruleNumber('corporate'));
  out.push({
    id: 'corporate',
    title: `법인세 신고(${setup.closingMonth}월 결산)`,
    due: corporate,
    ruleKey: 'corporate',
    owner: 'ceo',
  });
  if (setup.taxRelief)
    out.push({
      id: 'relief',
      title: '창업중소기업 세액감면 신청서 함께 제출',
      due: corporate,
      ruleKey: 'corporate',
      owner: 'ceo',
    });
  return out.filter((d) => d.due <= limit).sort((a, b) => a.due.localeCompare(b.due));
}
