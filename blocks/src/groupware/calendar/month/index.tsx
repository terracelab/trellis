// 일정(Dashboard): 달력(MonthCalendar 월 · 주 · 일 보기 · 캘린더 색 점 · 오늘) + 고른 날의 일정 + 오늘 회의실 예약
import {
  formatDate,
  type ChartColor,
  type MonthCalendarEvent,
} from '@terracelab/trellis-contracts';
import {
  Button,
  Card,
  CheckboxGroup,
  DateField,
  Dialog,
  DialogClose,
  EmptyState,
  Field,
  Input,
  MonthCalendar,
  PageHeader,
  Select,
  TimeField,
  useToast,
} from '@terracelab/trellis-react';
import { useState, type CSSProperties } from 'react';
import {
  BOOKINGS,
  CALENDARS,
  empLabel,
  EVENTS,
  GW_NOW,
  meOf,
  ROOMS,
  toHhmm,
  toMin,
  type CalendarEvent,
  type CalendarId,
  type RoomBooking,
} from '../../../_data/groupware.js';
import { TODAY } from '../../../_data/index.js';
import { usePlatform } from '../../../_platform/index.js';
import { Col, Grid, Lines, monthLabel, Page } from '../../../_ui/index.js';
import './style.css';

const CAL_IDS = Object.keys(CALENDARS) as CalendarId[];
/** 캘린더 색: 범주 색(chart.series) 다섯 슬롯. 필터 점(CheckboxGroup color) · 일정 목록의 점(style.css)과 같은 순서 */
const CAL_COLOR: Record<CalendarId, ChartColor> = {
  mine: 'series-1',
  team: 'series-2',
  company: 'series-3',
  leave: 'series-4',
  deadline: 'series-5',
};
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** 보이는 달 격자(일요일 시작 주)에 걸치는 날 */
function monthDates(ym: string): string[] {
  const [y, m] = ym.split('-').map(Number) as [number, number];
  const first = new Date(y, m - 1, 1);
  const weeks = Math.ceil((first.getDay() + new Date(y, m, 0).getDate()) / 7);
  return Array.from({ length: weeks * 7 }, (_, i) =>
    iso(new Date(y, m - 1, 1 - first.getDay() + i)),
  );
}
/** 회의실 띠: 09~18시 */
const DAY_FROM = 9 * 60;
const DAY_SPAN = 9 * 60;
const roomPos = (hhmm: string) =>
  Math.min(100, Math.max(0, ((toMin(hhmm) - DAY_FROM) / DAY_SPAN) * 100));

/** 다른 달에도 보이도록 주간 팀장 회의(월요일)를 만든다. 11월은 데이터에 있다 */
function weeklyFor(dates: string[]): CalendarEvent[] {
  return dates
    .filter((d) => !d.startsWith(TODAY.slice(0, 7)) && new Date(`${d}T00:00:00`).getDay() === 1)
    .map((d) => ({
      id: `wk-${d}`,
      date: d,
      calendar: 'company' as const,
      title: '주간 팀장 회의',
      start: '09:30',
      end: '10:30',
      place: ROOMS[0]?.name ?? '',
    }));
}

const covers = (e: CalendarEvent, date: string) =>
  e.date === date || (!!e.endDate && e.date <= date && date <= e.endDate);
const toCalendarEvent = (e: CalendarEvent): MonthCalendarEvent => ({
  id: e.id,
  date: e.date,
  title: e.title,
  color: CAL_COLOR[e.calendar],
  meta: [CALENDARS[e.calendar].label, e.place, e.owner].filter(Boolean).join(' · '),
  ...(e.endDate ? { endDate: e.endDate } : {}),
  ...(e.start ? { start: e.start } : {}),
  ...(e.end ? { end: e.end } : {}),
});
const sortEvents = (a: CalendarEvent, b: CalendarEvent) =>
  (a.start ? 1 : 0) - (b.start ? 1 : 0) || (a.start ?? '').localeCompare(b.start ?? '');

/** 오늘이 든 달(m은 0부터) */

export default function CalendarMonth() {
  const toast = useToast();
  const { session } = usePlatform();
  const me = meOf(session.user.id);
  const [month, setMonth] = useState(TODAY.slice(0, 7));
  const [selected, setSelected] = useState(TODAY);
  const [shown, setShown] = useState<CalendarId[]>(CAL_IDS);
  const [events, setEvents] = useState<CalendarEvent[]>(() => [...EVENTS]);
  const [bookings, setBookings] = useState<RoomBooking[]>(() => [...BOOKINGS]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    title: '',
    date: TODAY as string | null,
    start: '16:00' as string | null,
    end: '17:00' as string | null,
    calendar: 'mine' as string | null,
    room: 'r3' as string | null,
  });

  const all = [...events, ...weeklyFor(monthDates(month))].filter((e) =>
    shown.includes(e.calendar),
  );
  const dayEvents = all.filter((e) => covers(e, selected)).sort(sortEvents);
  const book = (roomId: string) => {
    const mine = bookings
      .filter((b) => b.roomId === roomId)
      .sort((a, b) => a.start.localeCompare(b.start));
    let start = Math.max(toMin(GW_NOW), DAY_FROM);
    start = Math.ceil(start / 30) * 30;
    for (const b of mine)
      if (toMin(b.start) < start + 60 && toMin(b.end) > start) start = toMin(b.end);
    const room = ROOMS.find((r) => r.id === roomId)!;
    if (start + 60 > DAY_FROM + DAY_SPAN) {
      toast.show({ title: `${room.name}은 오늘 빈 시간이 없습니다`, tone: 'warning' });
      return;
    }
    const nb = {
      id: `nb${Date.now()}`,
      roomId,
      start: toHhmm(start),
      end: toHhmm(start + 60),
      title: '회의',
      owner: me.id,
    };
    setBookings((bs) => [...bs, nb]);
    toast.show({
      title: `${room.name} ${nb.start}~${nb.end}을 예약했습니다`,
      description: '참석자에게 일정 초대를 보내려면 일정 등록에서 고릅니다',
      tone: 'success',
    });
  };
  const save = () => {
    if (!draft.title.trim() || !draft.date) return;
    const room = ROOMS.find((r) => r.id === draft.room);
    setEvents((es) => [
      ...es,
      {
        id: `new${Date.now()}`,
        date: draft.date!,
        calendar: (draft.calendar ?? 'mine') as CalendarId,
        title: draft.title.trim(),
        ...(draft.start ? { start: draft.start } : {}),
        ...(draft.end ? { end: draft.end } : {}),
        ...(room ? { place: room.name } : {}),
        owner: `${me.name} ${me.title}`,
      },
    ]);
    setSelected(draft.date);
    setAdding(false);
    toast.show({
      title: '일정을 등록했습니다',
      description: `${formatDate(draft.date, 'mdw')} ${draft.start ?? ''} ${draft.title.trim()}`,
      tone: 'success',
    });
    setDraft((d) => ({ ...d, title: '' }));
  };

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '일정' }, { label: '월간' }]}
          title="일정"
          description={`${me.name} ${me.title} · ${me.team} · 캘린더 ${shown.length}개 표시`}
          actions={
            <Button variant="primary" icon="calendar-plus" onPress={() => setAdding(true)}>
              일정 등록
            </Button>
          }
        />
      }
    >
      <Grid>
        <Col span={8}>
          <MonthCalendar
            label="내 일정"
            events={all.map(toCalendarEvent)}
            today={TODAY}
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelectDay={setSelected}
            views={['month', 'week', 'day']}
            now={GW_NOW}
            agenda={false}
            actions={
              <CheckboxGroup
                label="캘린더"
                orientation="horizontal"
                value={shown}
                onChange={(v) => setShown(v as CalendarId[])}
                options={CAL_IDS.map((c) => ({
                  value: c,
                  label: CALENDARS[c].label,
                  color: CAL_COLOR[c],
                }))}
              />
            }
          />
        </Col>
        <Col span={4}>
          <div className="tl-block-cal-side">
            <Card
              title={`${formatDate(selected, 'mdw')}${selected === TODAY ? ' · 오늘' : ''}`}
              subtitle={dayEvents.length ? `일정 ${dayEvents.length}건` : '일정 없음'}
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  icon="plus"
                  onPress={() => {
                    setDraft((d) => ({ ...d, date: selected }));
                    setAdding(true);
                  }}
                >
                  추가
                </Button>
              }
            >
              {dayEvents.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon="calendar"
                  title="이날은 일정이 없습니다"
                  description="추가를 눌러 일정을 등록하세요"
                />
              ) : (
                <ul className="tl-block-cal-agenda">
                  {dayEvents.map((e) => {
                    const now =
                      selected === TODAY && e.start && e.end && e.start <= GW_NOW && GW_NOW < e.end;
                    const past = selected === TODAY && e.end && e.end <= GW_NOW;
                    return (
                      <li
                        key={e.id}
                        className="tl-block-cal-agenda__item"
                        data-cal={e.calendar}
                        data-past={past || undefined}
                      >
                        <span className="tl-block-cal-agenda__time">
                          {e.start ? (
                            <>
                              <span>{e.start}</span>
                              <span>{e.end}</span>
                            </>
                          ) : (
                            <span>종일</span>
                          )}
                        </span>
                        <Lines
                          primary={
                            <>
                              {e.title}
                              {now && <span className="tl-block-cal-agenda__now"> · 진행 중</span>}
                            </>
                          }
                          secondary={[CALENDARS[e.calendar].label, e.place, e.owner]
                            .filter(Boolean)
                            .join(' · ')}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
            <Card title="회의실 예약" subtitle={`오늘 · 09~18시 · 지금 ${GW_NOW}`}>
              <ul className="tl-block-rooms">
                {ROOMS.map((r) => {
                  const list = bookings
                    .filter((b) => b.roomId === r.id)
                    .sort((a, b) => a.start.localeCompare(b.start));
                  const busy = list.some((b) => b.start <= GW_NOW && GW_NOW < b.end);
                  return (
                    <li key={r.id} className="tl-block-rooms__room">
                      <div className="tl-block-rooms__head">
                        <Lines
                          primary={r.name}
                          secondary={
                            <>
                              {r.seats}인 · {r.equipment} · {busy ? '사용 중' : '비어 있음'}
                            </>
                          }
                        />
                        <Button size="sm" onPress={() => book(r.id)}>
                          예약
                        </Button>
                      </div>
                      <div className="tl-block-rooms__strip" aria-hidden="true">
                        {list.map((b) => (
                          <span
                            key={b.id}
                            className="tl-block-rooms__slot"
                            data-mine={b.owner === me.id || undefined}
                            style={
                              { '--s': roomPos(b.start), '--e': roomPos(b.end) } as CSSProperties
                            }
                          />
                        ))}
                        <span
                          className="tl-block-rooms__now"
                          style={{ '--s': roomPos(GW_NOW) } as CSSProperties}
                        />
                      </div>
                      <ul className="tl-block-rooms__list">
                        {list.map((b) => (
                          <li key={b.id} data-past={b.end <= GW_NOW || undefined}>
                            <span className="tl-block-code">
                              {b.start}~{b.end}
                            </span>
                            <span>{b.title}</span>
                            <span>{empLabel(b.owner).split(' ')[0]}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        </Col>
      </Grid>
      <Dialog
        open={adding}
        onOpenChange={setAdding}
        title="일정 등록"
        description="회의실을 고르면 같은 시간에 회의실도 예약합니다"
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <Button variant="primary" disabled={!draft.title.trim() || !draft.date} onPress={save}>
              등록
            </Button>
          </>
        }
      >
        <div className="tl-block-cal-form">
          <Field label="제목" required>
            <Input
              value={draft.title}
              onChange={(v) => setDraft((d) => ({ ...d, title: v }))}
              placeholder={`${monthLabel(TODAY, 1)} 자금 계획 사전 검토`}
            />
          </Field>
          <Field label="날짜" required>
            <DateField
              today={TODAY}
              value={draft.date}
              onChange={(v) => setDraft((d) => ({ ...d, date: v }))}
            />
          </Field>
          <Field label="캘린더">
            <Select
              value={draft.calendar}
              onChange={(v) => setDraft((d) => ({ ...d, calendar: v }))}
              options={CAL_IDS.map((c) => ({ value: c, label: CALENDARS[c].label }))}
            />
          </Field>
          <Field label="시작">
            <TimeField
              value={draft.start}
              min="07:00"
              max="22:00"
              onChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  start: v,
                  // 시작이 종료를 넘으면 종료를 한 시간 뒤로
                  end: v && d.end && toMin(d.end) <= toMin(v) ? toHhmm(toMin(v) + 60) : d.end,
                }))
              }
            />
          </Field>
          <Field label="종료">
            <TimeField
              value={draft.end}
              min={draft.start ?? '07:00'}
              max="23:00"
              {...(draft.start ? { durationFrom: draft.start } : {})}
              onChange={(v) => setDraft((d) => ({ ...d, end: v }))}
            />
          </Field>
          <Field label="회의실">
            <Select
              value={draft.room}
              onChange={(v) => setDraft((d) => ({ ...d, room: v }))}
              options={[
                { value: 'none', label: '고르지 않음' },
                ...ROOMS.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
          </Field>
        </div>
      </Dialog>
    </Page>
  );
}
