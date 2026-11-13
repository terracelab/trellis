# HrRecord

> `@terracelab/trellis-react` · CSS `.tl-hr-record` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { HrRecord } from '@terracelab/trellis-react';
```

## 용도

한국형 인사기록카드(인사 마스터)를 한 화면에 보일 때 쓴다. 인적 사항 · 재직 정보 · 급여 · 보험 · 병역 · 학력 · 경력 · 자격 · 면허 · 어학 · 가족 · 인사 발령 · 상벌을 항목별로 라벨 · 값(DescriptionList)이나 작은 표로 그린다. 항목 값과 타입은 `@terracelab/trellis-contracts`의 `HrMasterRecord`. 입력은 FormSection.

## 해부(Anatomy)

bar(항목 이동 링크 줄 + 가린 정보 단추) · section(제목 `type.h3` 700 + 내용, 항목 사이 `border.divider`) · DescriptionList(2열) · table(머리 `fg.tertiary` · 줄 사이 가는 선) · empty(`fg.tertiary` 한 줄).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `record` | `HrMasterRecord` |  | 필수 | 인사기록카드 내용 |
| `sections` | `HrRecordSection[]` |  |  | 보일 항목 · 순서(기본 전부) |
| `revealed` | `boolean` | `false` |  | 가린 정보 보임(주민등록번호 · 계좌번호) |
| `onRevealChange` | `(revealed: boolean) => void` |  |  | 가린 정보 보기 단추를 누를 때(없으면 단추 없음) |
| `onRevealField` | `(field: 'rrn' \| 'bankAccount', reason: string) => Promise<string \| void>` |  |  | 칸별 보기(사유 → 권한 확인 · 기록은 앱, MaskedValue) |
| `nav` | `boolean` | `true` |  | 항목 이동 링크 줄 |
| `today` | `string` |  |  | 근속 기준일(기본 오늘) |
| `headingLevel` | `2 \| 3 \| 4` | `2` |  | 항목 제목 단계 |

## Variants

sections로 항목 · 순서를 고른다(기본 `HR_RECORD_SECTIONS` 전부). nav false면 링크 줄을 숨긴다. onRevealChange가 없으면 가린 정보 단추도 없다. onRevealField가 있으면 주민등록번호 · 계좌번호 칸마다 MaskedValue 보기 단추가 생긴다.

## States

지원 상태: `default` · `focus`

default · focus(링크 · 단추 · 이동한 제목).

## 동작

주민등록번호는 `formatRrn`으로 뒷자리 첫 숫자만, 계좌번호는 `maskAccount`로 끝 네 자리만 보인다. 두 칸은 MaskedValue로 그린다. revealed면 전부 보인다(권한 확인은 앱). onRevealField가 있으면 칸마다 보기 단추를 누르고 사유(ReasonDialog)를 넣은 뒤 `onRevealField(칸, 사유)`를 부른다. 앱이 권한을 확인하고 열람을 기록한 뒤 원문을 돌려주면 그것을, 아무것도 돌려주지 않으면 record의 값을 60초 동안 보인다. 거절하면(Promise 실패) 대화 상자에 오류 문구가 남는다. 근속은 입사일부터 퇴사일 또는 today까지. 인사 발령 · 상벌은 최근 것이 위. 내용이 없는 항목은 "등록된 내용이 없습니다". 링크를 누르면 그 항목 제목으로 옮기고 포커스를 둔다.

## 접근성

root는 "인사기록카드" 이름의 group, 링크 줄은 nav. 항목 제목은 headingLevel(기본 h2). 표는 숨긴 caption(항목 이름)과 `th scope=col`. 가린 글자 ●는 읽히는 그대로다.

## 밀도

항목 위아래 `space.24`, 표 칸 위아래 `space.12`. 휴대폰은 DescriptionList 1열, 표 칸은 줄바꿈.

## 플랫폼 차이

네이티브는 링크 줄 대신 항목 접기.

## 금지 사항

가린 정보를 기본으로 보이기 · 항목마다 색 바탕 카드 · 제목 왼쪽 색 띠(D-56) · 주민등록번호를 칸 하나에 숫자 13자리로 → 리뷰.

## 예시

### 인사기록카드

위 링크로 항목을 옮겨 다니고, 가린 정보(주민등록번호 · 계좌)는 단추로 연다

```tsx
import type { HrMasterRecord } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { HrRecord } from '@terracelab/trellis-react';

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

function Full() {
  const [revealed, setRevealed] = useState(false);
  return (
    <HrRecord record={RECORD} today="2026-11-06" revealed={revealed} onRevealChange={setRevealed} />
  );
}
```

### 입사 첫 주

아직 없는 항목은 빈 줄. 항목은 sections로 고른다

```tsx
import { HrRecord } from '@terracelab/trellis-react';

function NewHire() {
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
```

### 칸별 보기

주민등록번호 · 계좌번호 옆 보기 단추가 사유를 받고, 앱이 권한을 확인한 뒤 원문을 60초 동안 보인다

```tsx
import type { HrMasterRecord } from '@terracelab/trellis-contracts';
import { HrRecord } from '@terracelab/trellis-react';

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

function RevealField() {
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
```
