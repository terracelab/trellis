import { defineContract, type ContractBase } from '../_base.js';
import type { PayItem } from '../_shared/worktime.js';

/** 근로자 특정 정보(성명 + 생년월일 또는 사번은 법정 기재 사항) */
export interface PayslipEmployee {
  name: string;
  employeeNo?: string;
  /** 'YYYY-MM-DD'. 사번이 없을 때 */
  birthDate?: string;
  department?: string;
  /** 직위(책임 · 과장). "직위"로 적는다 */
  position?: string;
  /** 직급(G3). "직급"으로 적고, 직위와 같으면 한 번만 */
  grade?: string;
}

/** 근로 정보(연장 · 야간 · 휴일 근로 시간 수는 법정 기재 사항) */
export interface PayslipWork {
  days?: number;
  hours?: number;
  overtimeHours?: number;
  nightHours?: number;
  holidayHours?: number;
}

export interface PayslipProps extends ContractBase {
  /** 귀속 연월 'YYYY-MM' */
  period: string;
  /** 지급일 'YYYY-MM-DD' */
  payDate: string;
  /** 회사 이름(제목 위 작은 글자) */
  company?: string;
  employee: PayslipEmployee;
  work?: PayslipWork;
  /** 지급 항목(기본급 · 수당 · 상여). 출근 일수 · 시간에 따라 달라지는 항목은 basis(계산 방법)를 적는다 */
  earnings: readonly PayItem[];
  /** 공제 항목(4대보험 근로자 부담 · 소득세 · 지방소득세) */
  deductions: readonly PayItem[];
  /** 아래 안내(문의처 · 발급 근거). 웹: ReactNode */
  note?: unknown;
  /** 제목 단계. 기본 2 */
  headingLevel?: 1 | 2 | 3;
  loading?: boolean;
}

export const PayslipContract = defineContract<PayslipProps>({
  name: 'Payslip',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    period: { type: 'string', required: true, description: "귀속 연월 'YYYY-MM'" },
    payDate: { type: 'string', required: true, description: "지급일 'YYYY-MM-DD'" },
    company: { type: 'string', description: '회사 이름' },
    employee: {
      type: 'PayslipEmployee',
      required: true,
      description: '근로자(성명 + 사번 또는 생년월일 · 소속 · 직위 · 직급)',
    },
    work: {
      type: 'PayslipWork',
      description: '근로일수 · 시간(연장 · 야간 · 휴일)',
    },
    earnings: { type: 'PayItem[]', required: true, description: '지급 항목' },
    deductions: { type: 'PayItem[]', required: true, description: '공제 항목' },
    note: { type: 'ReactNode', description: '아래 안내' },
    headingLevel: { type: '1 | 2 | 3', default: 2, description: '제목 단계' },
    loading: { type: 'boolean', default: false, description: '불러오는 중(스켈레톤)' },
  },
  states: ['default', 'loading'],
  a11y: { role: 'article', keyboard: [], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
