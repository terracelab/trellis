// 인사 샘플 데이터(PR-27): 인사 마스터(인사기록카드) · 조직도 · 오늘 근무 상태 · 팀 일정 · 임금명세서.
// 사람은 erp.ts EMPLOYEES(인사 기록 · 급여 대장과 같은 14명), 팀 일정은 groupware.ts(근태 블록과 같은 24명)를 쓴다.
// 주민등록번호 · 계좌번호는 가상 값이다. 화면은 가려 보이고, 인사 권한이 있을 때만 연다(블록이 useCan으로 확인).
import type {
  AppointmentKind,
  EmploymentStatus,
  EmploymentType,
  HrMasterRecord,
  OrgChartNode,
  PayItem,
  PresenceState,
  TeamScheduleEvent,
} from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import { annualLeave, EMPLOYEES as ERP_EMPLOYEES, payslipOf, type Employee } from './erp.js';
import { ATTENDANCE, EMPLOYEES as GW_EMPLOYEES } from './groupware.js';
import { PROFILE } from './profile.js';

/* ── 값 바꾸기(erp.ts 글자 → 인사 어휘) ─────────────────── */

export const statusOf = (e: Employee): EmploymentStatus =>
  e.status === 'retired' ? 'resigned' : e.status === 'leave' ? 'leave' : 'active';
export const typeOf = (e: Employee): EmploymentType =>
  e.employment === '계약직' ? 'contract' : 'regular';
const KIND: Record<Employee['history'][number]['kind'], AppointmentKind> = {
  입사: 'hire',
  승진: 'promotion',
  전보: 'transfer',
  직책: 'assignment',
  휴직: 'leave',
  복직: 'reinstatement',
  퇴직: 'resignation',
};

/** 직급 높은 순(조직장 고르기). 직책이 있는 사람이 앞선다 */
const RANK = ['대표', '이사', '팀장', '차장', '과장', '반장', '대리', '주임', '사원'];
const rankOf = (e: Employee) => {
  const i = RANK.indexOf(e.title);
  return i < 0 ? RANK.length : i;
};

/** 부서 → 직군 */
const JOB_FAMILY: Record<string, string> = {
  경영: '경영',
  경영지원팀: '경영지원',
  구매팀: '구매',
  영업팀: '영업',
  물류팀: '물류',
  생산팀: '생산',
};

/* ── 오늘 근무 상태(TODAY 기준) ───────────────────────────── */

/** 오늘 근무 상태. 휴직 · 퇴직자는 없다(재직 상태 Badge가 대신 말한다) */
export const PRESENCE: Readonly<Record<string, PresenceState>> = {
  '2015001': 'working',
  '2017002': 'working',
  '2018003': 'working',
  '2019005': 'fieldwork',
  '2020002': 'working',
  '2021004': 'remote',
  '2022001': 'working',
  '2022006': 'leave',
  '2024002': 'working',
  '2025001': 'working',
  '2026002': 'off',
};

/* ── 인사기록카드 ───────────────────────────────────────── */

interface Extra {
  nameHanja?: string;
  nameEn: string;
  birth: string;
  gender: 'male' | 'female';
  address: string;
  emergency: { name: string; relation: string; phone: string };
  grade: string;
  position?: string;
  role?: string;
  step?: number;
  workSchedule?: string;
  probationEnd?: string;
  record?: Partial<Omit<HrMasterRecord, 'personal' | 'employment' | 'pay'>>;
}

const SERVED = (from: string, to: string, branch = '육군', rank = '병장') =>
  ({ status: 'served', branch, rank, from, to }) as const;

const EXTRA: Readonly<Record<string, Extra>> = {
  '2015001': {
    nameHanja: '尹智浩',
    nameEn: 'Jiho Yoon',
    birth: '1978-05-14',
    gender: 'male',
    address: '서울특별시 종로구 평창문화로 41',
    emergency: { name: '윤서아', relation: '배우자', phone: '010-2201-5520' },
    grade: '대표',
    role: '대표이사',
    record: {
      military: SERVED('1998-03-02', '2000-05-01'),
      education: [
        {
          school: '한국대학교',
          major: '무역학',
          degree: '학사',
          state: '졸업',
          from: '1997-03-02',
          to: '2004-02-20',
        },
      ],
      careers: [
        {
          company: '대한상사',
          title: '과장',
          duty: '수산물 수입',
          from: '2004-01-05',
          to: '2015-01-31',
        },
      ],
      family: [
        { relation: '배우자', name: '윤서아', birthDate: '1980-09-02', dependent: true },
        { relation: '자녀', name: '윤하준', birthDate: '2012-03-18', dependent: true },
      ],
    },
  },
  '2016004': {
    nameEn: 'Taesik Oh',
    birth: '1986-11-03',
    gender: 'male',
    address: '경기도 이천시 증포로 210',
    emergency: { name: '오민경', relation: '배우자', phone: '010-4418-7712' },
    grade: '과장',
    step: 9,
    workSchedule: '고정 근무(08:00~17:00)',
    record: {
      military: SERVED('2006-04-10', '2008-03-09'),
      education: [
        {
          school: '경기과학대학',
          major: '유통물류',
          degree: '전문학사',
          state: '졸업',
          to: '2011-02-18',
        },
      ],
      licenses: [{ name: '물류관리사', issuer: '한국산업인력공단', acquiredOn: '2015-12-24' }],
    },
  },
  '2017002': {
    nameEn: 'Terra Kim',
    birth: '1985-02-21',
    gender: 'female',
    address: '서울특별시 마포구 월드컵북로 58길 9',
    emergency: { name: '김정우', relation: '배우자', phone: '010-3392-1145' },
    grade: '차장',
    position: '차장',
    role: '경영지원팀장',
    step: 12,
    workSchedule: '시차출퇴근(08~10시 출근)',
    probationEnd: '2017-04-08',
    record: {
      military: { status: 'notApplicable' },
      education: [
        {
          school: '한국대학교',
          major: '경영학',
          degree: '학사',
          state: '졸업',
          from: '2004-03-02',
          to: '2008-02-22',
        },
        {
          school: '한국대학교 경영대학원',
          major: '회계학',
          degree: '석사',
          state: '수료',
          from: '2014-03-03',
          to: '2016-02-19',
        },
      ],
      careers: [
        {
          company: '한빛회계법인',
          title: '시니어',
          duty: '감사 · 세무 조정',
          from: '2008-03-03',
          to: '2012-08-31',
        },
        {
          company: '누리유통',
          title: '대리',
          duty: '결산 · 자금',
          from: '2012-09-17',
          to: '2016-12-30',
        },
      ],
      licenses: [
        {
          name: '전산세무 1급',
          issuer: '한국세무사회',
          acquiredOn: '2010-06-25',
          number: '10-1-04412',
        },
        { name: '재경관리사', issuer: '삼일회계법인', acquiredOn: '2013-11-15' },
      ],
      languages: [{ language: '영어', test: 'TOEIC', score: '905', takenOn: '2025-08-23' }],
      family: [
        { relation: '배우자', name: '김정우', birthDate: '1984-07-11', dependent: false },
        { relation: '자녀', name: '김서윤', birthDate: '2016-05-30', dependent: true },
        { relation: '모', name: '최영숙', birthDate: '1958-12-04', dependent: true },
      ],
      rewards: [
        {
          date: '2023-12-29',
          kind: 'reward',
          title: '우수 사원 표창',
          detail: '결산 기간 단축(D+10 → D+5)',
        },
        { date: '2020-12-30', kind: 'reward', title: '장기 근속 포상(3년)' },
      ],
    },
  },
  '2018003': {
    nameEn: 'Haeun Lee',
    birth: '1989-08-09',
    gender: 'female',
    address: '서울특별시 송파구 오금로 201',
    emergency: { name: '이정민', relation: '부', phone: '010-5521-0948' },
    grade: '과장',
    step: 10,
    record: {
      military: { status: 'notApplicable' },
      education: [
        {
          school: '한국외국어대학',
          major: '중국어',
          degree: '학사',
          state: '졸업',
          to: '2012-02-17',
        },
      ],
      languages: [{ language: '중국어', test: 'HSK', score: '6급', takenOn: '2021-05-16' }],
      licenses: [{ name: '국제무역사 1급', issuer: '한국무역협회', acquiredOn: '2017-10-21' }],
    },
  },
  '2019005': {
    nameEn: 'Dohyun Kang',
    birth: '1984-01-27',
    gender: 'male',
    address: '경기도 성남시 분당구 정자일로 95',
    emergency: { name: '강수진', relation: '배우자', phone: '010-7720-3381' },
    grade: '차장',
    position: '차장',
    role: '영업팀장',
    step: 11,
    record: {
      military: SERVED('2003-07-14', '2005-07-13', '공군', '병장'),
      education: [
        {
          school: '한국대학교',
          major: '식품공학',
          degree: '학사',
          state: '졸업',
          to: '2010-02-19',
        },
      ],
      careers: [
        {
          company: '대양푸드',
          title: '과장',
          duty: '외식 · 급식 영업',
          from: '2010-03-02',
          to: '2019-09-27',
        },
      ],
      family: [{ relation: '배우자', name: '강수진', birthDate: '1986-04-19', dependent: true }],
      rewards: [{ date: '2025-12-30', kind: 'reward', title: '연간 매출 목표 달성 포상' }],
    },
  },
  '2020002': {
    nameEn: 'Doyun Kim',
    birth: '1990-06-02',
    gender: 'male',
    address: '경기도 평택시 포승읍 평택항로 87',
    emergency: { name: '김순자', relation: '모', phone: '010-5531-2280' },
    grade: '주임',
    role: '생산 반장',
    workSchedule: '교대 근무(주간 · 야간 2교대)',
    record: {
      military: SERVED('2010-01-11', '2011-10-10'),
      education: [{ school: '평택고등학교', state: '졸업', to: '2009-02-12' }],
      licenses: [
        { name: '지게차운전기능사', issuer: '한국산업인력공단', acquiredOn: '2018-04-13' },
        { name: '식품위생관리사', acquiredOn: '2021-09-30' },
      ],
    },
  },
  '2020007': {
    nameEn: 'Yerin Han',
    birth: '1994-10-17',
    gender: 'female',
    address: '서울특별시 강서구 공항대로 247',
    emergency: { name: '한상철', relation: '부', phone: '010-8812-3304' },
    grade: '대리',
    record: { military: { status: 'notApplicable' } },
  },
  '2021004': {
    nameEn: 'Seoyeon Park',
    birth: '1993-03-08',
    gender: 'female',
    address: '서울특별시 동작구 상도로 133',
    emergency: { name: '박민호', relation: '부', phone: '010-2384-8803' },
    grade: '대리',
    step: 5,
    workSchedule: '시차출퇴근(08~10시 출근)',
    probationEnd: '2021-10-04',
    record: {
      military: { status: 'notApplicable' },
      education: [
        { school: '한국대학교', major: '회계학', degree: '학사', state: '졸업', to: '2016-02-19' },
      ],
      careers: [
        {
          company: '한빛회계법인',
          title: '어소시에이트',
          duty: '세무 신고',
          from: '2016-03-02',
          to: '2021-06-30',
        },
      ],
      licenses: [{ name: '전산회계 1급', issuer: '한국세무사회', acquiredOn: '2015-08-21' }],
    },
  },
  '2022001': {
    nameEn: 'Woojin Jung',
    birth: '1995-12-12',
    gender: 'male',
    address: '경기도 평택시 서정로 312',
    emergency: { name: '정현숙', relation: '모', phone: '010-1174-0029' },
    grade: '주임',
    step: 3,
    workSchedule: '고정 근무(08:00~17:00)',
    record: {
      military: SERVED('2015-05-04', '2017-02-03'),
      education: [
        {
          school: '경기과학대학',
          major: '유통물류',
          degree: '전문학사',
          state: '졸업',
          to: '2020-02-14',
        },
      ],
      licenses: [
        { name: '지게차운전기능사', issuer: '한국산업인력공단', acquiredOn: '2021-11-26' },
      ],
    },
  },
  '2022006': {
    nameEn: 'Jimin Seo',
    birth: '1994-04-25',
    gender: 'female',
    address: '서울특별시 성동구 왕십리로 222',
    emergency: { name: '서동현', relation: '부', phone: '010-3318-5562' },
    grade: '대리',
    step: 4,
    record: {
      military: { status: 'notApplicable' },
      education: [
        { school: '한국대학교', major: '경영학', degree: '학사', state: '졸업', to: '2018-02-23' },
      ],
    },
  },
  '2023003': {
    nameEn: 'Haneul Jang',
    birth: '1997-07-30',
    gender: 'female',
    address: '서울특별시 은평구 통일로 684',
    emergency: { name: '장미영', relation: '모', phone: '010-6630-9184' },
    grade: '주임',
    record: { military: { status: 'notApplicable' } },
  },
  '2024002': {
    nameEn: 'Minjun Choi',
    birth: '1999-02-14',
    gender: 'male',
    address: '서울특별시 관악구 관악로 145',
    emergency: { name: '최은정', relation: '모', phone: '010-0552-7731' },
    grade: '사원',
    step: 1,
    probationEnd: '2024-12-01',
    record: {
      military: SERVED('2019-03-11', '2020-09-10'),
      education: [
        {
          school: '한국대학교',
          major: '국제통상',
          degree: '학사',
          state: '졸업',
          to: '2024-08-23',
        },
      ],
      languages: [{ language: '영어', test: 'OPIc', score: 'IH', takenOn: '2024-04-06' }],
    },
  },
  '2025001': {
    nameEn: 'Gayoung Moon',
    birth: '2000-09-21',
    gender: 'female',
    address: '경기도 고양시 일산동구 중앙로 1191',
    emergency: { name: '문재석', relation: '부', phone: '010-0921-4410' },
    grade: '사원',
    step: 1,
    probationEnd: '2025-06-03',
    record: {
      military: { status: 'notApplicable' },
      education: [
        {
          school: '한국외국어대학',
          major: '베트남어',
          degree: '학사',
          state: '졸업',
          to: '2025-02-21',
        },
      ],
    },
  },
  '2026002': {
    nameEn: 'Subin Lee',
    birth: '2001-05-05',
    gender: 'female',
    address: '경기도 평택시 포승읍 만호로 55',
    emergency: { name: '이경호', relation: '부', phone: '010-4471-2068' },
    grade: '사원',
    workSchedule: '교대 근무(주간 · 야간 2교대)',
    probationEnd: '2026-06-30',
    record: { military: { status: 'notApplicable' } },
  },
};

/** 가상 주민등록번호: 생년월일 + 성별 자리(1900년대 1 · 2, 2000년대 3 · 4) + 사번 끝 여섯 자리 */
function rrnOf(birth: string, gender: 'male' | 'female', id: string): string {
  const [y, m, d] = birth.split('-') as [string, string, string];
  const g = Number(y) >= 2000 ? (gender === 'male' ? 3 : 4) : gender === 'male' ? 1 : 2;
  return `${y.slice(2)}${m}${d}${g}${id.slice(-6)}`;
}

/** erp.ts 계좌(가린 값)를 가상 전체 번호로: * 자리는 사번 숫자로 채운다 */
function accountOf(e: Employee) {
  if (!e.bank) return undefined;
  const [bank, masked = ''] = e.bank.split(' ') as [string, string];
  let i = 0;
  const number = masked.replace(/\*/g, () => e.id[i++ % e.id.length]!);
  return { bank, number, holder: e.name };
}

/** 발령 이력: 입사(부서 직급)부터 승진(A → B) · 전보(A → B)를 따라가며 그때의 소속 · 직위를 채운다 */
function appointmentsOf(e: Employee) {
  let department = e.department;
  let position = e.title;
  return e.history.map((h) => {
    const to = h.detail.split('→')[1]?.trim();
    if (h.kind === '입사') {
      const words = h.detail.split(' ');
      const last = words.at(-1) ?? '';
      if (RANK.includes(last) && words.length > 1) {
        position = last;
        department = words.slice(0, -1).join(' ');
      }
    } else if (h.kind === '승진' && to) position = to;
    else if (h.kind === '전보' && to) department = to;
    return { date: h.date, kind: KIND[h.kind], detail: h.detail, department, position };
  });
}

/** 사원 한 명의 인사기록카드 */
export function hrRecordOf(e: Employee): HrMasterRecord {
  const x = EXTRA[e.id];
  const retiredAt = e.status === 'retired' ? e.history.at(-1)?.date : undefined;
  return {
    personal: {
      name: e.name,
      ...(x?.nameHanja ? { nameHanja: x.nameHanja } : {}),
      ...(x ? { nameEn: x.nameEn, birthDate: x.birth, gender: x.gender } : {}),
      ...(x ? { rrn: rrnOf(x.birth, x.gender, e.id), birthCalendar: 'solar' as const } : {}),
      nationality: '대한민국',
      mobile: e.phone,
      email: e.email,
      ...(x ? { address: x.address, emergencyContact: x.emergency } : {}),
    },
    employment: {
      employeeNo: e.id,
      company: PROFILE.name,
      department: e.department,
      jobFamily: JOB_FAMILY[e.department] ?? e.department,
      grade: x?.grade ?? e.title,
      position: x?.position ?? e.title,
      ...(x?.role ? { role: x.role } : {}),
      ...(x?.step ? { step: x.step } : {}),
      employmentType: typeOf(e),
      workSchedule: x?.workSchedule ?? `고정 근무(${PROFILE.work.start}~${PROFILE.work.end})`,
      status: statusOf(e),
      hireDate: e.hiredAt,
      ...(x?.probationEnd ? { probationEnd: x.probationEnd } : {}),
      ...(retiredAt ? { resignDate: retiredAt } : {}),
    },
    pay: {
      payType: e.employment === '계약직' ? 'monthly' : 'annual',
      ...(accountOf(e) ? { bankAccount: accountOf(e)! } : {}),
      insurance: {
        pension: e.hiredAt,
        health: e.hiredAt,
        // 대표이사는 고용 · 산재보험 적용 제외
        ...(e.title === '대표' ? {} : { employment: e.hiredAt, industrial: e.hiredAt }),
      },
    },
    ...x?.record,
    appointments: appointmentsOf(e),
  };
}

/** 사람 표시 보조 줄: 직급 · 부서 */
export const metaOf = (e: Employee) => `${e.title} · ${e.department}`;

/** 인사 마스터 목록 순서: 재직 → 휴직 → 퇴직, 같은 상태는 직급 높은 순 */
export const HR_PEOPLE: readonly Employee[] = [...ERP_EMPLOYEES].sort((a, b) => {
  const s = { active: 0, leave: 1, retired: 2 } as const;
  return s[a.status] - s[b.status] || rankOf(a) - rankOf(b) || a.hiredAt.localeCompare(b.hiredAt);
});

/* ── 조직도 ─────────────────────────────────────────────── */

const inOffice = (e: Employee) => e.status !== 'retired';
const headOfTeam = (team: string) =>
  ERP_EMPLOYEES.filter((e) => e.department === team && inOffice(e)).sort(
    (a, b) => rankOf(a) - rankOf(b),
  )[0];

/** 조직 구성원(퇴직 제외): 조직장 먼저, 그다음 직급 높은 순 */
export function membersOf(orgId: string): Employee[] {
  const list = ERP_EMPLOYEES.filter(inOffice).filter(
    (e) => orgId === ORG_ROOT_ID || e.department === orgId,
  );
  return list.sort((a, b) => rankOf(a) - rankOf(b) || a.hiredAt.localeCompare(b.hiredAt));
}

export const ORG_ROOT_ID = 'company';
const CEO = headOfTeam('경영');
const TEAM_ORDER = ['경영지원팀', '구매팀', '영업팀', '물류팀', '생산팀'];

/** 회사 → 팀 두 단계. 조직장은 그 팀에서 직급이 가장 높은 사람 */
export const ORG_CHART: readonly OrgChartNode[] = [
  {
    id: ORG_ROOT_ID,
    name: PROFILE.name,
    ...(CEO ? { head: { name: CEO.name, title: CEO.title } } : {}),
    headcount: ERP_EMPLOYEES.filter(inOffice).length,
    children: TEAM_ORDER.map((team) => {
      const head = headOfTeam(team);
      return {
        id: team,
        name: team,
        ...(head ? { head: { name: head.name, title: head.title } } : {}),
        headcount: ERP_EMPLOYEES.filter((e) => e.department === team && inOffice(e)).length,
      };
    }),
  },
];
export const orgName = (id: string) =>
  id === ORG_ROOT_ID
    ? PROFILE.name
    : (ORG_CHART[0]!.children!.find((c) => c.id === id)?.name ?? id);

/* ── 팀 일정(근태 블록 · groupware.ts 사람) ──────────────── */

/** 근태 기록에서 나온 일정(휴가 · 반차 · 외근) + 앞으로 잡힌 일정 */
const PLANNED: readonly Omit<TeamScheduleEvent, 'id'>[] = [
  { personId: 'u03', kind: 'remote', start: '2026-11-06', note: '부가세 신고 자료 정리' },
  {
    personId: 'e13',
    kind: 'trip',
    start: '2026-11-09',
    end: '2026-11-10',
    label: '부산 출장',
    note: '물류센터 점검',
  },
  {
    personId: 'e06',
    kind: 'education',
    start: '2026-11-10',
    label: '노무 교육',
    note: '개정 근로기준법',
  },
  { personId: 'e12', kind: 'halfPm', start: '2026-11-10', label: '반차', note: '오후 반차' },
  { personId: 'e18', kind: 'remote', start: '2026-11-11' },
  { personId: 'e22', kind: 'sick', start: '2026-11-09' },
  { personId: 'e20', kind: 'annual', start: '2026-11-12', end: '2026-11-13' },
  {
    personId: 'e07',
    kind: 'education',
    start: '2026-11-12',
    end: '2026-11-13',
    label: '전산세무 교육',
  },
  { personId: 'u02', kind: 'annual', start: '2026-11-20', note: '결재 대기' },
];

export const TEAM_EVENTS: readonly TeamScheduleEvent[] = [
  ...ATTENDANCE.flatMap((r) =>
    r.days.flatMap((d): Omit<TeamScheduleEvent, 'id'>[] => {
      if (d.state === 'leave' && !d.in)
        return [{ personId: r.empId, kind: 'annual', start: d.date, label: d.note ?? '연차' }];
      if (d.state === 'leave' && d.note?.includes('반차'))
        return [
          // 반차는 하루 칸의 반이라 짧은 글자(오전 · 오후는 칸 위치와 범례가 말한다)
          {
            personId: r.empId,
            kind: d.note.includes('오전') ? 'halfAm' : 'halfPm',
            start: d.date,
            label: '반차',
            note: d.note,
          },
        ];
      if (d.state === 'field')
        return [{ personId: r.empId, kind: 'field', start: d.date, label: '외근', note: d.note }];
      return [];
    }),
  ),
  ...PLANNED,
].map((e, i) => ({ ...e, id: `ev-${String(i + 1).padStart(3, '0')}` }));

/** 팀 일정 사람(대표 제외, 근태 블록과 같은 순서) */
export const TEAM_PEOPLE = GW_EMPLOYEES.filter((e) => e.title !== '대표').map((e) => ({
  id: e.id,
  name: e.name,
  meta: `${e.title} · ${e.team}`,
  team: e.team,
}));

/* ── 임금명세서 ─────────────────────────────────────────── */

/** 지급이 끝난 달(귀속 연월 · 지급일). 25일이 휴일이면 앞 영업일. overtime = 11월 대장 대비 연장 비율, extraHours = 대장에 연장이 없는 사람의 연장 시간 */
export const PAYSLIP_MONTHS = [
  { period: '2026-10', payDate: '2026-10-23', overtime: 1, extraHours: 0 },
  { period: '2026-09', payDate: '2026-09-25', overtime: 0.6, extraHours: 4 },
  { period: '2026-08', payDate: '2026-08-25', overtime: 1.25, extraHours: 6 },
] as const;

/** 월 소정근로시간(주 40시간 · 주휴 포함) */
const MONTH_HOURS = 209;
const won = (n: number) => n.toLocaleString('ko-KR');

/** 한 사람 한 달 명세서 값. 연장근로수당은 그 달 연장 시간에 따라 달라진다 */
export function payslipFor(e: Employee, period: string) {
  const m = PAYSLIP_MONTHS.find((p) => p.period === period) ?? PAYSLIP_MONTHS[0];
  const p = e.pay!;
  const hourly = Math.round((p.base + p.position) / MONTH_HOURS);
  // 연장 시간: 그 달 대장 비율. 대장에 연장이 없는 사람도 결산 · 신고 달에는 몇 시간 생긴다(대표 제외)
  const otHours = p.overtime
    ? Math.round(((p.overtime * m.overtime) / (hourly * 1.5)) * 2) / 2
    : e.title === '대표'
      ? 0
      : m.extraHours;
  const overtime = Math.round(otHours * hourly * 1.5);
  const s = payslipOf({ ...e, pay: { ...p, overtime } });
  const earnings: PayItem[] = [
    { code: 'basePay', amount: p.base, basis: `월 소정근로 ${MONTH_HOURS}시간` },
    ...(p.position ? [{ label: '직책수당', amount: p.position }] : []),
    ...(overtime
      ? [
          {
            code: 'overtimePay' as const,
            amount: overtime,
            basis: `${otHours}시간 × 통상시급 ${won(hourly)}원 × 1.5`,
          },
        ]
      : []),
    { code: 'mealAllowance', amount: p.meal, taxFree: true },
    ...(p.car ? [{ code: 'carAllowance' as const, amount: p.car, taxFree: true }] : []),
  ];
  const deductions: PayItem[] = [
    { code: 'nationalPension', amount: s.pension, basis: '기준소득월액 × 4.75%' },
    { code: 'healthInsurance', amount: s.health, basis: '보수월액 × 3.595%' },
    { code: 'longTermCare', amount: s.care, basis: '건강보험료 × 13.14%' },
    ...(s.employment
      ? [{ code: 'employmentInsurance' as const, amount: s.employment, basis: '보수 × 0.9%' }]
      : []),
    { code: 'incomeTax', amount: s.incomeTax, basis: `간이세액표 · 공제대상가족 ${p.family}명` },
    { code: 'localIncomeTax', amount: s.localTax, basis: '소득세 × 10%' },
  ];
  return {
    period: m.period,
    payDate: m.payDate,
    earnings,
    deductions,
    net: s.net,
    work: {
      days: period === '2026-09' ? 20 : period === '2026-08' ? 20 : 21,
      hours: MONTH_HOURS + otHours,
      overtimeHours: otHours,
      nightHours: 0,
      holidayHours: 0,
    },
  };
}

/** 급여를 받는 사람(명세서 대상) */
export const PAYEES = HR_PEOPLE.filter((e) => e.pay && e.status === 'active');

/* ── 내 연차(근태 블록 · groupware.ts LEAVE_BALANCE와 같은 사람) ── */

/** 종류별 휴가: 연차는 LEAVE_BALANCE와 같은 값, 보상 휴가는 연장근로 대신 받은 날 */
export const MY_LEAVE_TYPES = [
  { kind: 'annual', granted: 17, used: 11.5 },
  { kind: 'compensatory', granted: 2, used: 1 },
  { kind: 'family', used: 0 },
] as const;

/* ── 역할별 홈 · 휴가 신청(P2-12) ───────────────────────────── */

/** 사번 → 이름 직급(erp.ts 사람). 없으면 빈 값 */
export const erpLabel = (id: string) => {
  const e = ERP_EMPLOYEES.find((x) => x.id === id);
  return e ? `${e.name} ${e.title}` : '';
};

/** 공휴일(휴가 일수 계산 · 팀 일정 머리). 회사 지정 휴일도 여기에 더한다 */
export const HOLIDAYS: readonly { date: string; label: string }[] = [
  { date: '2026-12-25', label: '성탄절' },
  { date: '2027-01-01', label: '신정' },
];

/** 입사 예정자(아직 인사 기록에 없다). steps = 입사 준비 항목과 끝냈는지. mentorId는 erp.ts 사번 */
export interface Onboarding {
  id: string;
  name: string;
  title: string;
  department: string;
  start: string;
  employment: '정규직' | '계약직';
  mentorId: string;
  steps: readonly { label: string; done: boolean }[];
}

export const ONBOARDING: readonly Onboarding[] = [
  {
    id: 'ob-2611-01',
    name: '정다온',
    title: '사원',
    department: '물류팀',
    start: '2026-11-16',
    employment: '정규직',
    mentorId: '2022001',
    steps: [
      { label: '근로계약서', done: true },
      { label: '입사 서류', done: true },
      { label: '계정 · 메일', done: false },
      { label: '장비', done: false },
      { label: '입문 교육', done: false },
    ],
  },
  {
    id: 'ob-2612-01',
    name: '백승우',
    title: '대리',
    department: '영업팀',
    start: '2026-12-01',
    employment: '정규직',
    mentorId: '2022006',
    steps: [
      { label: '근로계약서', done: true },
      { label: '입사 서류', done: false },
      { label: '계정 · 메일', done: false },
      { label: '장비', done: false },
      { label: '입문 교육', done: false },
    ],
  },
];

/** 계약 · 휴직이 끝나는 사람(erp.ts 사번). next = 그 전에 할 일 */
export interface TermEnd {
  empId: string;
  kind: 'contract' | 'leave' | 'probation';
  label: string;
  end: string;
  next: string;
}

export const TERM_ENDS: readonly TermEnd[] = [
  {
    empId: '2016004',
    kind: 'leave',
    label: '병가 휴직 종료',
    end: '2027-01-21',
    next: '복직 면담 1월 14일',
  },
  {
    empId: '2026002',
    kind: 'contract',
    label: '계약직 근로계약 만료',
    end: '2027-03-31',
    next: '갱신 여부 2월 28일까지 통보',
  },
  {
    empId: '2023003',
    kind: 'leave',
    label: '육아휴직 종료',
    end: '2027-05-31',
    next: '복직 의사 4월 30일까지 확인',
  },
];

/** 인사 담당이 처리할 일. module = modules.json id, icon = 행 아이콘, link = 처리하는 화면(블록 id) */
export interface HrTask {
  id: string;
  title: string;
  detail: string;
  due: string;
  module: string;
  icon: IconName;
  link?: string;
}

/** 남은 연차가 5일 이상인 재직자 수(연차 사용 계획 확인 대상) */
const LEAVE_LEFT_5 = ERP_EMPLOYEES.filter(
  (e) => e.status === 'active' && annualLeave(e.hiredAt) - e.leaveUsed >= 5,
).length;
const RETIREE = ERP_EMPLOYEES.find((e) => e.status === 'retired');
const NEWCOMER = ONBOARDING[0]!;

export const HR_TASKS: readonly HrTask[] = [
  {
    id: 'hr-01',
    title: '입사 서류 확인',
    detail: `${NEWCOMER.name} ${NEWCOMER.title} · ${NEWCOMER.department} · 11월 16일 입사`,
    due: '2026-11-12',
    module: 'hr-payroll',
    icon: 'file-check',
    link: 'erp/hr-payroll/employees',
  },
  {
    id: 'hr-02',
    title: '연차 사용 계획 확인',
    detail: `남은 연차 5일 이상 ${LEAVE_LEFT_5}명 · 12월 31일 소멸`,
    due: '2026-11-13',
    module: 'attendance',
    icon: 'calendar-days',
    link: 'groupware/attendance/team',
  },
  {
    id: 'hr-03',
    title: '퇴직금 정산',
    detail: RETIREE ? `${erpLabel(RETIREE.id)} · 10월 31일 퇴사` : '10월 퇴사자',
    due: '2026-11-14',
    module: 'hr-payroll',
    icon: 'wallet',
    link: 'erp/hr-payroll/payroll',
  },
  {
    id: 'hr-04',
    title: '11월 근태 마감',
    detail: '연장 · 휴가 결재를 급여에 반영',
    due: '2026-11-20',
    module: 'attendance',
    icon: 'clock',
    link: 'groupware/attendance/team',
  },
  {
    id: 'hr-05',
    title: '11월 급여 대장 확정',
    detail: '지급일 11월 25일',
    due: '2026-11-23',
    module: 'hr-payroll',
    icon: 'receipt',
    link: 'erp/hr-payroll/payroll',
  },
  {
    id: 'hr-06',
    title: '4대보험 취득 신고',
    detail: `${NEWCOMER.name} ${NEWCOMER.title} · 입사일부터 14일 안`,
    due: '2026-11-30',
    module: 'hr-payroll',
    icon: 'shield-check',
  },
];

/** 그날 걸친 팀 일정(재택 · 외근 · 출장 · 교육 · 휴가). 없으면 undefined */
export const scheduleOn = (personId: string, day: string) =>
  TEAM_EVENTS.find((e) => e.personId === personId && e.start <= day && (e.end ?? e.start) >= day);
