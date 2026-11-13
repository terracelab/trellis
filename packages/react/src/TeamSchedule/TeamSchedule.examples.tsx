import { TeamSchedule } from './TeamSchedule.js';

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

/** 한 주 — 이름 칸은 고정, 오늘 열은 연한 브랜드, 반차는 하루 칸의 반만. 겹친 일정은 줄을 나눈다 */
export function Week() {
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

/** 한 달 — 칸이 좁아지면 글자는 줄이고 아이콘이 남는다. 공휴일은 주말처럼 칠한다 */
export function Month() {
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

/** 교대 근무 — 주간 · 야간 · 휴무 2주 근무표(4조 2교대) */
export function Shifts() {
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
