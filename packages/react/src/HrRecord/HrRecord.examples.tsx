import type { HrMasterRecord } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { HrRecord } from './HrRecord.js';

const RECORD: HrMasterRecord = {
  personal: {
    name: '한서연',
    nameHanja: '韓瑞延',
    nameEn: 'Seoyeon Han',
    rrn: '9204152345678',
    birthDate: '1992-04-15',
    birthCalendar: 'solar',
    gender: 'female',
    nationality: '대한민국',
    mobile: '010-4821-0932',
    email: 'seoyeon.han@terra-trading.example',
    address: '서울특별시 마포구 월드컵북로 396 누리꿈스퀘어 비즈니스타워 12층',
    emergencyContact: { name: '한도윤', relation: '부', phone: '010-2231-7780' },
  },
  employment: {
    employeeNo: 'E-0012',
    company: '테라트레이딩',
    department: '인사팀',
    jobFamily: '경영지원',
    grade: 'G4',
    position: '매니저',
    role: '파트장',
    step: 7,
    employmentType: 'regular',
    workSchedule: '시차출퇴근(08~10시 출근)',
    status: 'active',
    hireDate: '2022-03-02',
    groupHireDate: '2019-07-01',
    probationEnd: '2022-05-31',
  },
  pay: {
    payType: 'annual',
    bankAccount: { bank: '국민은행', number: '482-21-0193-847', holder: '한서연' },
    insurance: {
      pension: '2022-03-02',
      health: '2022-03-02',
      employment: '2022-03-02',
      industrial: '2022-03-02',
    },
  },
  military: { status: 'notApplicable' },
  education: [
    {
      school: '한국대학교',
      major: '경영학',
      degree: '학사',
      state: '졸업',
      from: '2011-03-02',
      to: '2015-02-20',
    },
  ],
  careers: [
    {
      company: '테라물산',
      title: '사원',
      duty: '급여 · 4대보험',
      from: '2019-07-01',
      to: '2022-02-28',
    },
  ],
  licenses: [
    { name: '공인노무사', issuer: '한국산업인력공단', acquiredOn: '2021-12-08', number: '21-0482' },
    { name: '컴퓨터활용능력 1급', issuer: '대한상공회의소', acquiredOn: '2014-08-22' },
  ],
  languages: [{ language: '영어', test: 'TOEIC', score: '905', takenOn: '2025-05-24' }],
  family: [
    { relation: '부', name: '한도윤', birthDate: '1961-09-03', dependent: true },
    { relation: '모', name: '김미경', birthDate: '1964-02-11', dependent: true },
  ],
  appointments: [
    {
      date: '2022-03-02',
      kind: 'hire',
      detail: '경력 입사',
      department: '인사팀',
      position: '선임',
    },
    {
      date: '2024-01-01',
      kind: 'promotion',
      detail: '매니저 승진',
      department: '인사팀',
      position: '매니저',
    },
    {
      date: '2025-07-01',
      kind: 'assignment',
      detail: '급여 파트장 보직',
      department: '인사팀',
      position: '매니저',
    },
  ],
  rewards: [{ date: '2025-12-30', kind: 'reward', title: '우수사원', detail: '연말정산 자동화' }],
};

/** 인사기록카드 — 위 링크로 항목을 옮겨 다니고, 가린 정보(주민등록번호 · 계좌)는 단추로 연다 */
export function Full() {
  const [revealed, setRevealed] = useState(false);
  return (
    <HrRecord record={RECORD} today="2026-11-06" revealed={revealed} onRevealChange={setRevealed} />
  );
}

/** 입사 첫 주 — 아직 없는 항목은 빈 줄. 항목은 sections로 고른다 */
export function NewHire() {
  return (
    <HrRecord
      nav={false}
      today="2026-11-06"
      sections={['employment', 'education', 'careers', 'family']}
      record={{
        personal: { name: '서다은' },
        employment: {
          employeeNo: 'E-0058',
          company: '테라트레이딩',
          department: '데이터팀',
          position: '사원',
          employmentType: 'intern',
          workSchedule: '고정(09~18시)',
          hireDate: '2026-11-02',
          probationEnd: '2027-01-31',
        },
      }}
    />
  );
}

/** 칸별 보기 — 주민등록번호 · 계좌번호 옆 보기 단추가 사유를 받고, 앱이 권한을 확인한 뒤 원문을 60초 동안 보인다 */
export function RevealField() {
  return (
    <HrRecord
      record={RECORD}
      today="2026-11-06"
      nav={false}
      sections={['personal', 'pay']}
      onRevealField={async () => {
        // 앱이 여기서 권한을 확인하고 열람 기록을 남긴다. 아무것도 돌려주지 않으면 record의 값을 보인다
      }}
    />
  );
}
