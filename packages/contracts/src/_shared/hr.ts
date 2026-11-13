// 한국형 인사 마스터 어휘 · 타입(PR-27): 고용 형태 · 직급 체계 · 인사기록카드 항목.
// 화면에 보이는 라벨은 messages.ts(hr.*)에 있다. 여기에는 값(키) · 톤 · 계산만 둔다.
// 직급 · 직위 · 직책 · 직군 · 호봉은 회사마다 다르므로 글자로 받는다(코드 마스터는 앱이 가진다).
import type { StatusTone } from './vocab.js';
import { parseDate, RRN_MASK_CHAR } from './format.js';

/** 고용 형태: 정규직 · 계약직 · 인턴 · 파견 · 일용 · 프리랜서 */
export const EMPLOYMENT_TYPES = [
  'regular',
  'contract',
  'intern',
  'dispatch',
  'daily',
  'freelance',
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

/** 재직 상태: 재직 · 휴직 · 퇴사 예정 · 퇴사 */
export const EMPLOYMENT_STATUSES = ['active', 'leave', 'leaving', 'resigned'] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];
export const EMPLOYMENT_STATUS_TONES: Record<EmploymentStatus, StatusTone> = {
  active: 'success',
  leave: 'info',
  leaving: 'warning',
  resigned: 'neutral',
};

/** 오늘 근무 상태: 근무 중 · 재택 · 외근 · 휴가 · 퇴근 */
export const PRESENCE_STATES = ['working', 'remote', 'fieldwork', 'leave', 'off'] as const;
export type PresenceState = (typeof PRESENCE_STATES)[number];
export const PRESENCE_TONES: Record<PresenceState, StatusTone> = {
  working: 'success',
  remote: 'info',
  fieldwork: 'info',
  leave: 'warning',
  off: 'neutral',
};

/** 급여 형태: 연봉 · 월급 · 시급 · 일급 */
export const PAY_TYPES = ['annual', 'monthly', 'hourly', 'daily'] as const;
export type PayType = (typeof PAY_TYPES)[number];

/** 병역 구분: 군필 · 복무 중 · 미필 · 면제 · 해당 없음 */
export const MILITARY_STATUSES = [
  'served',
  'serving',
  'notYet',
  'exempt',
  'notApplicable',
] as const;
export type MilitaryStatus = (typeof MILITARY_STATUSES)[number];

/** 인사 발령 구분: 입사 · 승진 · 전보 · 보직 · 휴직 · 복직 · 퇴사 · 기타 */
export const APPOINTMENT_KINDS = [
  'hire',
  'promotion',
  'transfer',
  'assignment',
  'leave',
  'reinstatement',
  'resignation',
  'other',
] as const;
export type AppointmentKind = (typeof APPOINTMENT_KINDS)[number];

export type Gender = 'male' | 'female';
/** 생일 달력: 양력 · 음력 */
export type BirthCalendar = 'solar' | 'lunar';

/** 직급 체계. 회사가 정한 글자 그대로(사원 · 대리 · 과장, G1 · G2, 팀장 · 본부장) */
export interface RankSystem {
  /** 직군(개발 · 경영지원) */
  jobFamily?: string;
  /** 직급(G3 · 과장). 보상 · 승진의 단계 */
  grade?: string;
  /** 직위(책임 · 선임). 부르는 이름 */
  position?: string;
  /** 직책(팀장 · 파트장). 맡은 자리 */
  role?: string;
  /** 호봉 */
  step?: string | number;
}

/** 인적 사항 */
export interface HrPersonal {
  /** 성명(한글) */
  name: string;
  nameHanja?: string;
  nameEn?: string;
  /** 주민등록번호 · 외국인등록번호 13자리. 화면은 가려 보인다(formatRrn) */
  rrn?: string;
  /** YYYY-MM-DD */
  birthDate?: string;
  birthCalendar?: BirthCalendar;
  gender?: Gender;
  nationality?: string;
  mobile?: string;
  email?: string;
  address?: string;
  emergencyContact?: { name: string; relation: string; phone: string };
}

/** 재직 정보 */
export interface HrEmployment extends RankSystem {
  /** 사번 */
  employeeNo: string;
  /** 법인 */
  company?: string;
  /** 소속(부서 · 팀) */
  department?: string;
  employmentType?: EmploymentType;
  /** 근무 형태 글자(고정 · 시차출퇴근 · 선택근무 · 교대). 근무 유형 마스터의 이름 */
  workSchedule?: string;
  status?: EmploymentStatus;
  /** 입사일 YYYY-MM-DD */
  hireDate: string;
  /** 그룹 입사일(계열사 경력 통산) */
  groupHireDate?: string;
  /** 수습 종료일 */
  probationEnd?: string;
  /** 퇴사일 */
  resignDate?: string;
}

/** 급여 · 4대보험 */
export interface HrPay {
  payType?: PayType;
  bankAccount?: { bank: string; number: string; holder?: string };
  /** 4대보험 취득일 YYYY-MM-DD */
  insurance?: { pension?: string; health?: string; employment?: string; industrial?: string };
}

export interface HrMilitary {
  status: MilitaryStatus;
  /** 군별(육군 · 해군 · 공군 · 해병대 · 사회복무) */
  branch?: string;
  /** 전역 계급 */
  rank?: string;
  from?: string;
  to?: string;
  note?: string;
}

export interface HrEducation {
  school: string;
  major?: string;
  /** 학위(학사 · 석사) */
  degree?: string;
  /** 구분(졸업 · 수료 · 중퇴 · 재학) */
  state?: string;
  from?: string;
  to?: string;
}

export interface HrCareer {
  company: string;
  title?: string;
  duty?: string;
  from: string;
  to?: string;
}

export interface HrLicense {
  name: string;
  issuer?: string;
  acquiredOn?: string;
  number?: string;
}

export interface HrLanguage {
  language: string;
  test?: string;
  score?: string;
  takenOn?: string;
}

export interface HrFamily {
  /** 관계(배우자 · 자녀 · 부 · 모) */
  relation: string;
  name: string;
  birthDate?: string;
  /** 부양가족(연말정산 기본공제) */
  dependent?: boolean;
}

export interface HrAppointment {
  /** 발령일 */
  date: string;
  kind: AppointmentKind;
  /** 발령 내용(개발팀 책임 승진) */
  detail: string;
  department?: string;
  position?: string;
}

export interface HrRewardPenalty {
  date: string;
  kind: 'reward' | 'penalty';
  title: string;
  detail?: string;
}

/** 인사기록카드 한 장(인사 마스터) */
export interface HrMasterRecord {
  personal: HrPersonal;
  employment: HrEmployment;
  pay?: HrPay;
  military?: HrMilitary;
  education?: readonly HrEducation[];
  careers?: readonly HrCareer[];
  licenses?: readonly HrLicense[];
  languages?: readonly HrLanguage[];
  family?: readonly HrFamily[];
  appointments?: readonly HrAppointment[];
  rewards?: readonly HrRewardPenalty[];
}

/** 인사기록카드 항목(순서 = 기본 순서) */
export const HR_RECORD_SECTIONS = [
  'personal',
  'employment',
  'pay',
  'military',
  'education',
  'careers',
  'licenses',
  'languages',
  'family',
  'appointments',
  'rewards',
] as const;
export type HrRecordSection = (typeof HR_RECORD_SECTIONS)[number];

/** 근속: 입사일부터 today까지 만 년 · 개월(입사일 당일 = 0개월). today가 앞이면 0 */
export function serviceLength(
  hireDate: string | Date,
  today: string | Date = new Date(),
): { years: number; months: number } {
  const a = parseDate(hireDate);
  const b = parseDate(today);
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  if (months < 0 || Number.isNaN(months)) months = 0;
  return { years: Math.floor(months / 12), months: months % 12 };
}

/** 계좌번호 가림: 끝 네 자리만 보이고 나머지 숫자는 ●(110-●●●-●●6789). 하이픈은 그대로 */
export function maskAccount(value: string): string {
  const total = value.replace(/\D/g, '').length;
  let seen = 0;
  return value.replace(/\d/g, (d) => {
    seen += 1;
    return seen > total - 4 ? d : RRN_MASK_CHAR;
  });
}
