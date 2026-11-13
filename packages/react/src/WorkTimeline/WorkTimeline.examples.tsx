import { type WorkTimelineDay } from '@terracelab/trellis-contracts';
import { WorkTimeline } from './WorkTimeline.js';

const SCHEDULE = { start: '09:00', end: '18:00', breakMinutes: 60 };

const WEEK: WorkTimelineDay[] = [
  {
    date: '2026-11-02',
    clockIn: '08:52',
    clockOut: '18:40',
    status: { tone: 'success', label: '정상' },
  },
  {
    date: '2026-11-03',
    clockIn: '09:14',
    clockOut: '18:05',
    status: { tone: 'warning', label: '지각' },
  },
  { date: '2026-11-04', off: '연차', status: { tone: 'neutral', label: '연차' } },
  {
    date: '2026-11-05',
    clockIn: '08:41',
    clockOut: '21:20',
    status: { tone: 'success', label: '정상' },
  },
  { date: '2026-11-06', clockIn: '08:55' },
];

/** 이번 주 — 소정 09~18시 점선 틀 위에 출근 ~ 퇴근 막대. 18시를 넘은 만큼은 연장, 오늘은 지금까지 근무 중 */
export function ThisWeek() {
  return (
    <WorkTimeline
      label="이번 주 출퇴근"
      days={WEEK}
      schedule={SCHEDULE}
      today="2026-11-06"
      now="15:20"
    />
  );
}

/** 주말 · 범위 — 토 · 일은 막대 대신 휴일 글자. 상태가 없으면 상태 칸이 없고, 눈금은 06~24시로 넓혔다 */
export function Weekend() {
  return (
    <WorkTimeline
      label="교대 근무 주간"
      schedule={{ start: '08:00', end: '17:00', breakMinutes: 60 }}
      range={{ start: '06:00', end: '24:00' }}
      legend={false}
      days={[
        { date: '2026-11-02', clockIn: '07:48', clockOut: '17:02' },
        { date: '2026-11-03', clockIn: '07:55', clockOut: '19:30' },
        { date: '2026-11-04', clockIn: '07:50', clockOut: '17:10' },
        { date: '2026-11-05', clockIn: '07:58', clockOut: '22:45' },
        { date: '2026-11-06', clockIn: '07:46', clockOut: '17:00' },
        { date: '2026-11-07', off: '휴일' },
        { date: '2026-11-08', off: '휴일' },
      ]}
    />
  );
}
