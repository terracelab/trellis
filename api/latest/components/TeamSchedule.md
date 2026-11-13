# TeamSchedule

> `@terracelab/trellis-react` · CSS `.tl-team-schedule` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { TeamSchedule } from '@terracelab/trellis-react';
```

## 용도

팀원의 휴가 · 재택 · 출장 · 교육과 교대 근무를 날짜 칸에 펼쳐 볼 때 쓴다(팀 근태 · 휴가 관리 · 근무표). 한 사람의 한 달은 MonthCalendar.

## 해부(Anatomy)

범례(쓰인 종류만, 아이콘 + 글자) · 가로 스크롤 틀(`border.divider`, `radius.lg`) · 표: 이름 칸(고정, Avatar 24(이니셜은 Avatar 규칙의 두 글자) + 이름 + 보조 글자) · 날짜 머리(요일 · 날짜, 오늘 = `fg.strong` 원 + `fg.inverse` 글자(중립색, D-146 제안)) · 칸(주말 · 공휴일 연한 회색, 오늘 열 연한 회색(`fg.primary` 8%, 주말 4%보다 한 단계 짙게)) · 일정(`module.*.subtle` 바탕 + 종류 아이콘 `module.*.default` + 글자, `radius.sm`).

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `people` | `TeamScheduleMember[]` |  | 필수 | 행(사람) |
| `events` | `TeamScheduleEvent[]` |  | 필수 | 일정(휴가 · 근무 형태 · 교대) |
| `start` | `string` |  | 필수 | 첫날 'YYYY-MM-DD' |
| `days` | `number` | `7` |  | 날 수(7 · 14 · 28~31) |
| `today` | `string` |  |  | 오늘(열 강조) |
| `holidays` | `{ date: string; label: string }[]` |  |  | 공휴일 |
| `caption` | `string` |  | 필수 | 표 이름(접근성) |
| `onEventPress` | `(event) => void` |  |  | 일정을 누를 때(있으면 단추) |
| `renderPerson` | `(person) => ReactNode` |  |  | 이름 칸 바꾸기 |
| `legend` | `boolean` | `true` |  | 범례(쓰인 종류만) |
| `loading` | `boolean` | `false` |  | 불러오는 중(스켈레톤 행) |
| `empty` | `ReactNode` |  |  | 사람이 없을 때 |

## Variants

days 7 · 14 · 28~31(칸 폭 96 · 64 · 40) × onEventPress 있음(단추) · 없음.

## States

지원 상태: `default` · `hover` · `focus` · `loading`

default · hover(단추 일정 안쪽 1px 테두리) · focus(링) · loading(스켈레톤 행).

## 동작

여러 날 일정은 칸을 합친다(colSpan). 범위 밖으로 이어지는 일정은 그쪽 모서리를 각지게 한다. 한 사람의 일정이 겹치면 줄을 나누고 이름 칸이 그 줄을 함께 덮는다. 오전 반차는 하루 칸의 앞 반, 오후 반차는 뒤 반. 색이 같은 종류는 아이콘과 글자로 가른다(연차 · 보상 휴가 brand, 병가 red, 재택 teal, 출장 · 야간 violet, 외근 green, 교육 · 주간 amber, 휴무 · 기타 회색).

## 접근성

`<table>` + 숨은 caption, 날짜 머리는 "11월 6일 금요일 · 오늘"(칸 안 숨은 글자. 보이는 요일 · 날짜는 aria-hidden. aria-label만 두면 빈 머리 칸으로 잡힌다, R-37 9), 이름 칸은 `th scope="row"`. 단추 일정의 이름은 "이수민 · 연차 · 11월 5일(목)~11월 6일(금) · 사유". 스크롤 틀은 Tab으로 가서 화살표로 민다.

## 밀도

칸 높이 `density.row-height`.

## 플랫폼 차이

네이티브는 가로 스크롤 목록, 이름 칸 고정.

## 금지 사항

일정 왼쪽에 색 띠, 일정마다 알약 배지, 주말을 진한 색으로 칠하기 → 리뷰.

## 예시

### 한 주

이름 칸은 고정, 오늘 열은 연한 브랜드, 반차는 하루 칸의 반만. 겹친 일정은 줄을 나눈다

```tsx
import { TeamSchedule } from '@terracelab/trellis-react';

const TEAM = [
  { id: 'u1', name: '김지훈', meta: '팀장 · 영업1팀' },
  { id: 'u2', name: '이수민', meta: '과장 · 영업1팀' },
  { id: 'u3', name: '박서연', meta: '대리 · 영업1팀' },
  { id: 'u4', name: '최하늘', meta: '사원 · 영업1팀' },
  { id: 'u5', name: '한도윤', meta: '사원 · 영업1팀' },
] as const;

const WEEK_EVENTS = [
  {
    id: 'e1',
    personId: 'u1',
    kind: 'trip',
    start: '2026-11-03',
    end: '2026-11-05',
    label: '부산 출장',
    note: '거래처 방문',
  },
  { id: 'e2', personId: 'u2', kind: 'annual', start: '2026-11-05', end: '2026-11-06' },
  { id: 'e3', personId: 'u2', kind: 'remote', start: '2026-11-02' },
  { id: 'e4', personId: 'u3', kind: 'halfAm', start: '2026-11-04' },
  { id: 'e5', personId: 'u3', kind: 'field', start: '2026-11-06', label: '외근 · 판교' },
  {
    id: 'e6',
    personId: 'u4',
    kind: 'education',
    start: '2026-11-02',
    end: '2026-11-03',
    label: '신입 교육',
  },
  { id: 'e7', personId: 'u4', kind: 'halfPm', start: '2026-11-06' },
  { id: 'e8', personId: 'u5', kind: 'sick', start: '2026-11-04' },
  { id: 'e9', personId: 'u5', kind: 'remote', start: '2026-11-04', end: '2026-11-05' },
] as const;

function Week() {
  return (
    <TeamSchedule
      caption="영업1팀 이번 주 일정"
      people={TEAM}
      events={WEEK_EVENTS}
      start="2026-11-02"
      days={7}
      today="2026-11-06"
      onEventPress={() => {}}
    />
  );
}
```

### 한 달

칸이 좁아지면 글자는 줄이고 아이콘이 남는다. 공휴일은 주말처럼 칠한다

```tsx
import { TeamSchedule } from '@terracelab/trellis-react';

const TEAM = [
  { id: 'u1', name: '김지훈', meta: '팀장 · 영업1팀' },
  { id: 'u2', name: '이수민', meta: '과장 · 영업1팀' },
  { id: 'u3', name: '박서연', meta: '대리 · 영업1팀' },
  { id: 'u4', name: '최하늘', meta: '사원 · 영업1팀' },
  { id: 'u5', name: '한도윤', meta: '사원 · 영업1팀' },
] as const;

const MONTH_EVENTS = [
  {
    id: 'm1',
    personId: 'u1',
    kind: 'annual',
    start: '2026-12-24',
    end: '2026-12-31',
    label: '연말 휴가',
  },
  {
    id: 'm2',
    personId: 'u2',
    kind: 'trip',
    start: '2026-12-08',
    end: '2026-12-11',
    label: '상하이 출장',
  },
  {
    id: 'm3',
    personId: 'u3',
    kind: 'family',
    start: '2026-12-14',
    end: '2026-12-16',
    label: '결혼 휴가',
  },
  { id: 'm4', personId: 'u4', kind: 'education', start: '2026-12-02', end: '2026-12-03' },
  { id: 'm5', personId: 'u5', kind: 'remote', start: '2026-12-21', end: '2026-12-23' },
  { id: 'm6', personId: 'u3', kind: 'quarter', start: '2026-12-29' },
] as const;

function Month() {
  return (
    <TeamSchedule
      caption="영업1팀 12월 일정"
      people={TEAM}
      events={MONTH_EVENTS}
      start="2026-12-01"
      days={31}
      holidays={[{ date: '2026-12-25', label: '성탄절' }]}
    />
  );
}
```

### 교대 근무

주간 · 야간 · 휴무 2주 근무표(4조 2교대)

```tsx
import { TeamSchedule } from '@terracelab/trellis-react';

const CREW = [
  { id: 'n1', name: '오세린', meta: '1조' },
  { id: 'n2', name: '문태오', meta: '1조' },
  { id: 'n3', name: '서지아', meta: '2조' },
  { id: 'n4', name: '강민재', meta: '2조' },
] as const;

const PATTERN = [
  'shiftDay',
  'shiftDay',
  'shiftNight',
  'shiftNight',
  'shiftOff',
  'shiftOff',
] as const;

const SHIFT_EVENTS = CREW.flatMap((p, row) =>
  Array.from({ length: 14 }, (_, i) => {
    const day = String(2 + i).padStart(2, '0');
    return {
      id: `${p.id}-${i}`,
      personId: p.id,
      kind: PATTERN[(i + row * 3) % PATTERN.length]!,
      start: `2026-11-${day}`,
    };
  }),
);

function Shifts() {
  return (
    <TeamSchedule
      caption="물류센터 2주 근무표"
      people={CREW}
      events={SHIFT_EVENTS}
      start="2026-11-02"
      days={14}
      today="2026-11-06"
    />
  );
}
```
