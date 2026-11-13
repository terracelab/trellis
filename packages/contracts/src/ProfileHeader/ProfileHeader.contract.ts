import { defineContract, type ContractBase } from '../_base.js';
import type { EmploymentStatus, EmploymentType, PresenceState } from '../_shared/hr.js';

export interface ProfileFact {
  /** 명사 라벨(사번 · 입사일) */
  label: string;
  value: unknown;
}

export interface ProfileHeaderProps extends ContractBase {
  /** 성명(한글) */
  name: string;
  /** 영문 이름 */
  nameEn?: string;
  /** 한자 이름 */
  nameHanja?: string;
  src?: string;
  /** 소속(부서 · 팀) */
  department?: string;
  /** 직책(팀장) */
  role?: string;
  /** 직위(책임) */
  position?: string;
  /** 직급(G3). 직위와 같으면 한 번만 */
  grade?: string;
  /** 재직 상태 → Badge(재직 · 휴직 · 퇴사 예정 · 퇴사) */
  status?: EmploymentStatus;
  /** 오늘 근무 상태 → 점 + 글자 */
  presence?: PresenceState;
  /** 사번 */
  employeeNo?: string;
  /** 입사일 YYYY-MM-DD. 있으면 근속도 보인다 */
  hireDate?: string;
  employmentType?: EmploymentType;
  /** 근속을 셀 오늘(YYYY-MM-DD). 기본은 오늘 */
  today?: string;
  /** 요약 줄 뒤에 더 붙일 항목 */
  facts?: readonly ProfileFact[];
  /** 오른쪽 행동(수정 · 발령 · 증명서 발급) */
  actions?: unknown;
  /** 이름 제목 단계(기본 2. 화면 맨 위면 1) */
  headingLevel?: 1 | 2 | 3;
}

export const ProfileHeaderContract = defineContract<ProfileHeaderProps>({
  name: 'ProfileHeader',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    name: { type: 'string', required: true, description: '성명' },
    nameEn: { type: 'string', description: '영문 이름' },
    nameHanja: { type: 'string', description: '한자 이름' },
    src: { type: 'string', description: '사진 주소' },
    department: { type: 'string', description: '소속' },
    role: { type: 'string', description: '직책' },
    position: { type: 'string', description: '직위' },
    grade: { type: 'string', description: '직급(직위와 같으면 생략)' },
    status: {
      type: "'active' | 'leave' | 'leaving' | 'resigned'",
      values: ['active', 'leave', 'leaving', 'resigned'],
      description: '재직 상태(Badge)',
    },
    presence: {
      type: "'working' | 'remote' | 'fieldwork' | 'leave' | 'off'",
      values: ['working', 'remote', 'fieldwork', 'leave', 'off'],
      description: '오늘 근무 상태',
    },
    employeeNo: { type: 'string', description: '사번' },
    hireDate: { type: 'string', description: '입사일(근속 계산)' },
    employmentType: {
      type: "'regular' | 'contract' | 'intern' | 'dispatch' | 'daily' | 'freelance'",
      values: ['regular', 'contract', 'intern', 'dispatch', 'daily', 'freelance'],
      description: '고용 형태',
    },
    today: { type: 'string', description: '근속 기준일(기본 오늘)' },
    facts: { type: '{ label: string; value: ReactNode }[]', description: '더 붙일 요약 항목' },
    actions: { type: 'ReactNode', description: '오른쪽 행동' },
    headingLevel: {
      type: '1 | 2 | 3',
      default: 2,
      values: ['1', '2', '3'],
      description: '이름 제목 단계',
    },
  },
  states: ['default'],
  a11y: { keyboard: [], labelling: 'children' },
  slots: ['actions'],
  platforms: { web: true, native: true },
});
