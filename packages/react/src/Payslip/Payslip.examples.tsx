import { Payslip } from './Payslip.js';

const EARNINGS = [
  { code: 'basePay', amount: 3200000, basis: '월 소정근로 209시간' },
  { code: 'overtimePay', amount: 137799, basis: '6시간 × 통상시급 15,311원 × 1.5' },
  { code: 'mealAllowance', amount: 200000, taxFree: true },
] as const;

const DEDUCTIONS = [
  { code: 'nationalPension', amount: 158500, basis: '기준소득월액 3,337,000원 × 4.75%' },
  { code: 'healthInsurance', amount: 119990, basis: '보수월액 × 3.595%' },
  { code: 'longTermCare', amount: 15760, basis: '건강보험료 × 13.14%' },
  { code: 'employmentInsurance', amount: 30040, basis: '보수 × 0.9%' },
  { code: 'incomeTax', amount: 105540, basis: '간이세액표 · 부양가족 1명' },
  { code: 'localIncomeTax', amount: 10550, basis: '소득세 × 10%' },
] as const;

/** 월급제 — 근로자 특정 정보 · 근로 시간 · 항목별 계산 방법 · 공제 · 실지급액(임금명세서 법정 기재 사항) */
export function Monthly() {
  return (
    <Payslip
      company="테라트레이딩"
      period="2026-10"
      payDate="2026-10-23"
      employee={{
        name: '박서연',
        employeeNo: 'E-2024-031',
        department: '경영지원팀',
        position: '대리',
        grade: 'G2',
      }}
      work={{ days: 20, hours: 166, overtimeHours: 6 }}
      earnings={EARNINGS}
      deductions={DEDUCTIONS}
      note="급여 문의는 경영지원팀 내선 204로 연락해 주세요."
    />
  );
}

/** 시급제 단시간 근로자 — 사번 대신 생년월일, 주휴수당 계산 방법을 적는다 */
export function Hourly() {
  return (
    <Payslip
      company="테라트레이딩"
      period="2026-10"
      payDate="2026-11-05"
      employee={{
        name: '정하늘',
        birthDate: '2003-04-17',
        department: '물류센터',
        position: '사원',
      }}
      work={{ days: 16, hours: 96 }}
      earnings={[
        { code: 'basePay', label: '기본급(시급)', amount: 990720, basis: '96시간 × 10,320원' },
        { label: '주휴수당', amount: 198144, basis: '4주 × 4.8시간 × 10,320원' },
      ]}
      deductions={[
        { code: 'nationalPension', amount: 56470 },
        { code: 'healthInsurance', amount: 42730 },
        { code: 'longTermCare', amount: 5610 },
        { code: 'employmentInsurance', amount: 10690 },
      ]}
    />
  );
}
