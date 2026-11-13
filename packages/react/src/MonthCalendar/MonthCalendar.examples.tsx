import { type MonthCalendarEvent } from '@terracelab/trellis-contracts';
import { useState } from 'react';
import { MonthCalendar } from './MonthCalendar.js';

const EVENTS: MonthCalendarEvent[] = [
  { id: 'e01', date: '2026-11-02', title: '주간 팀장 회의', start: '09:30', color: 'series-3' },
  { id: 'e02', date: '2026-11-03', title: '단가 협의', start: '16:00', color: 'series-1' },
  // 같은 일정이 법인 세 곳에 걸치면 칩 하나에 점 세 개 · 유형 아이콘 · 끝남(흐림 + 취소선)
  {
    id: 'e15',
    date: '2026-11-03',
    title: '10월분 급여 지급',
    colors: ['series-1', 'series-2', 'series-3'],
    icon: 'wallet',
    state: 'done',
  },
  // 지연: 경고 아이콘(위험 색) + 숨은 글자 "지연"
  {
    id: 'e16',
    date: '2026-11-05',
    title: '신규 입사자 4대보험 취득신고',
    icon: 'file-text',
    color: 'series-2',
    state: 'late',
  },
  { id: 'e03', date: '2026-11-04', endDate: '2026-11-05', title: '과장 연차', color: 'series-4' },
  {
    id: 'e04',
    date: '2026-11-06',
    title: '주간 회의',
    start: '09:00',
    end: '10:00',
    color: 'series-2',
  },
  {
    id: 'e05',
    date: '2026-11-06',
    title: '운송 계약 검토',
    start: '10:30',
    end: '11:30',
    color: 'series-1',
  },
  {
    id: 'e06',
    date: '2026-11-06',
    title: '오후 반차',
    start: '13:00',
    end: '18:00',
    color: 'series-4',
  },
  {
    id: 'e07',
    date: '2026-11-06',
    title: '자금 계획 보고',
    start: '14:00',
    end: '15:00',
    color: 'series-1',
  },
  {
    id: 'e08',
    date: '2026-11-06',
    title: '보안 교육',
    start: '16:00',
    end: '17:00',
    color: 'series-3',
  },
  {
    id: 'e09',
    date: '2026-11-10',
    title: '원천세 신고 마감',
    colors: ['series-1', 'series-2'],
    icon: 'receipt',
  },
  { id: 'e10', date: '2026-11-13', title: '기말 잔액 확인', start: '15:00', color: 'series-1' },
  {
    id: 'e11',
    date: '2026-11-18',
    endDate: '2026-11-20',
    title: '물류센터 출장',
    color: 'series-4',
  },
  { id: 'e12', date: '2026-11-23', title: '주간 팀장 회의', start: '09:30', color: 'series-3' },
  { id: 'e13', date: '2026-11-25', title: '부가세 예정신고 마감', color: 'series-5' },
  { id: 'e14', date: '2026-11-27', title: '사업계획 보고', start: '17:00', color: 'series-1' },
];

/** 팀 일정 — 칸마다 일정 세 건까지 보이고 넘치면 "N건 더". 오늘은 채운 원, 고른 날은 바탕 한 단계 */
export function TeamSchedule() {
  const [selected, setSelected] = useState('2026-11-06');
  return (
    <MonthCalendar
      label="팀 일정"
      events={EVENTS}
      today="2026-11-06"
      selected={selected}
      onSelectDay={setSelected}
    />
  );
}

/** 주 보기 — views로 월 · 주 · 일을 바꾼다. 7일 시간표에 종일 줄 · 시간 일정 · 겹친 일정은 나란히, 오늘 칸에 지금 선 */
export function WeekView() {
  const [selected, setSelected] = useState('2026-11-06');
  return (
    <MonthCalendar
      label="팀 일정"
      events={EVENTS}
      today="2026-11-06"
      now="13:40"
      selected={selected}
      onSelectDay={setSelected}
      views={['month', 'week', 'day']}
      defaultView="week"
    />
  );
}

/** 일 보기 · 일정 누르기 — 하루 시간표는 장소 같은 보조 글자까지 보인다. 화살표로 날을 옮기고 Tab으로 그날 일정에 간다 */
export function DayView() {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)' }}>
      <MonthCalendar
        label="내 일정"
        events={EVENTS.map((e) => (e.start ? { ...e, meta: '본사 3층 회의실' } : e))}
        today="2026-11-06"
        now="13:40"
        defaultSelected="2026-11-06"
        views={['day', 'week', 'month']}
        defaultView="day"
        timeRange={{ start: '09:00', end: '18:00' }}
        onEventPress={(e) => setOpened(e.title)}
      />
      <p style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }} aria-live="polite">
        {opened ? `${opened} 일정을 열었습니다` : '일정을 누르면 이름이 여기에 보입니다'}
      </p>
    </div>
  );
}

/** 일정 누르기 — onEventPress가 있으면 칩이 버튼이 된다. 고른 날의 칩까지 Tab으로 가고 Esc로 날에 돌아온다 */
export function PressEvents() {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 'var(--tl-space-8)' }}>
      <MonthCalendar
        label="내 일정"
        events={EVENTS}
        today="2026-11-06"
        defaultSelected="2026-11-06"
        maxEvents={2}
        onEventPress={(e) => setOpened(e.title)}
      />
      <p style={{ margin: 0, color: 'var(--tl-color-fg-secondary)' }} aria-live="polite">
        {opened ? `${opened} 일정을 열었습니다` : '일정을 누르면 이름이 여기에 보입니다'}
      </p>
    </div>
  );
}

/** 작은 달력 · 옆 목록 — size="sm"은 낮은 칸에 점과 건수만 둔다. 날을 누르면 onDayPress로 그날 일정을 받아 옆 목록에 보인다 */
export function SmallWithList() {
  const [day, setDay] = useState<{ date: string; events: MonthCalendarEvent[] }>({
    date: '2026-11-06',
    events: EVENTS.filter((e) => e.date === '2026-11-06'),
  });
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--tl-space-64) * 5), 1fr))',
        gap: 'var(--tl-space-16)',
        alignItems: 'start',
      }}
    >
      <MonthCalendar
        label="세무 일정"
        size="sm"
        events={EVENTS}
        today="2026-11-06"
        defaultSelected="2026-11-06"
        agenda={false}
        onDayPress={(date, events) => setDay({ date, events })}
      />
      <section aria-live="polite">
        <h3 style={{ margin: 0, fontSize: 'var(--tl-type-label-font-size)' }}>
          {day.date} 일정 {day.events.length}건
        </h3>
        <ul style={{ margin: 0, paddingLeft: 'var(--tl-space-16)' }}>
          {day.events.map((e) => (
            <li key={e.id}>
              {e.start ? `${e.start} ` : ''}
              {e.title}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
