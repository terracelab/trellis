// 팀 근태(InventoryMatrix): 두 보기. 팀 일정 = 사람 × 날짜 일정표(휴가 · 반차 · 재택 · 외근 · 출장 · 교육, PR-27),
// 근무 시간 = 사람 × 이번 주 요일(상태 점 + 출퇴근 시각, 주 근무 시간 열지도와 52시간 위험).
// 사람은 데이터 범위(Role.scope) 안만: 팀장 = 자기 부서, 구성원 = 본인. 범위 안 팀이 하나면 팀 고르기를 뺀다
import {
  formatAmount,
  formatDate,
  SCHEDULE_KINDS,
  type TeamScheduleEvent,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Banner,
  Button,
  DataGrid,
  DataGridLines,
  DescriptionList,
  Drawer,
  FilterBar,
  HeatCell,
  Input,
  KpiCard,
  PageHeader,
  PersonLabel,
  SegmentedControl,
  Select,
  StatusDot,
  Tabs,
  TeamSchedule,
  Timeline,
  useToast,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  ATTENDANCE,
  attendanceStateOf,
  empById,
  formatDuration,
  GW_NOW,
  limitTime,
  overtimeMinutes,
  projectedMinutes,
  RISK,
  riskOf,
  TEAMS,
  weekMinutes,
  WEEK,
  type AttendanceDay,
  type AttendanceRow,
  type Employee,
} from '../../../_data/groupware.js';
import { TEAM_EVENTS, TEAM_PEOPLE } from '../../../_data/hr.js';
import { TODAY } from '../../../_data/index.js';
import { useCan, useScope, useScreens } from '../../../_platform/index.js';
import {
  addDays,
  Col,
  ExportButton,
  Grid,
  josa,
  Page,
  type CsvColumn,
} from '../../../_ui/index.js';
import './style.css';

type Row = AttendanceRow & {
  emp: Employee;
  name: string;
  hours: number;
  overtime: number;
  projected: number;
  risk: keyof typeof RISK;
};

const ROWS: Row[] = ATTENDANCE.map((r) => ({
  ...r,
  emp: empById(r.empId),
  name: empById(r.empId).name,
  hours: Math.round((weekMinutes(r) / 60) * 10) / 10,
  overtime: Math.round((overtimeMinutes(r) / 60) * 10) / 10,
  projected: Math.round((projectedMinutes(r) / 60) * 10) / 10,
  risk: riskOf(r),
}));
// slot: filters — 팀 목록은 데이터(TEAMS)에서. 대표가 속한 경영진은 빼고, 이름 끝 '팀'은 줄여 보인다
const EXEC_TEAM = ROWS.find((r) => r.emp.title === '대표')?.emp.team;
const teamOptions = (rows: readonly Row[]) => [
  { value: 'all', label: '전체' },
  ...TEAMS.filter((t) => t !== EXEC_TEAM && rows.some((r) => r.emp.team === t)).map((t) => ({
    value: t,
    label: t.replace(/팀$/, ''),
  })),
];
// slot: filters end

// slot: states — 근무 시간 보기의 상태 거르기(이름 · 조건)
const STATE_FILTERS: readonly { value: string; label: string; test: (r: Row) => boolean }[] = [
  { value: 'all', label: '상태 전체', test: () => true },
  { value: 'risk', label: '52시간 주의 이상', test: (r) => r.risk !== 'ok' },
  { value: 'late', label: '지각 있음', test: (r) => r.days.some((d) => d.state === 'late') },
  {
    value: 'away',
    label: '휴가 · 외근 있음',
    test: (r) => r.days.some((d) => d.state === 'leave' || d.state === 'field'),
  },
];
// slot: states end

// slot: schedule — 팀 일정표 기간(주 단위 고르기)
const WEEKS = [
  { value: 'this', label: '이번 주', start: WEEK[0].date },
  { value: 'next', label: '다음 주', start: addDays(WEEK[0].date, 7) },
];
// slot: schedule end

const present = (d: AttendanceDay) => (d.in ? 1 : 0);
/** 엑셀 다운로드 열: 사람마다 요일별 상태 · 출근 · 퇴근, 시간은 서식 없는 숫자 */
const CSV: CsvColumn<Row>[] = [
  { label: '사번', value: (r) => r.emp.empNo },
  { label: '이름', value: 'name' },
  { label: '직위', value: (r) => r.emp.title },
  { label: '팀', value: (r) => r.emp.team },
  ...WEEK.flatMap((w, i): CsvColumn<Row>[] => [
    { label: `${w.date} 상태`, value: (r) => attendanceStateOf(r.days[i]!.state).label },
    { label: `${w.date} 출근`, value: (r) => r.days[i]!.in ?? '' },
    { label: `${w.date} 퇴근`, value: (r) => r.days[i]!.out ?? '' },
  ]),
  { label: '주 근무(시간)', value: 'hours' },
  { label: '연장(시간)', value: 'overtime' },
  { label: '예상(시간)', value: 'projected' },
  { label: '52시간', value: (r) => RISK[r.risk].label },
];
/** 그날 걸친 일정 */
const onDay = (e: TeamScheduleEvent, day: string) => e.start <= day && (e.end ?? e.start) >= day;
const h1 = (v: number) => formatAmount(v, { digits: 1 });

/** 요일 칸: 상태 점 + 출퇴근 시각 두 줄(DataGridLines) */
function DayCell({ d }: { d: AttendanceDay }) {
  const live = d.date === TODAY && !!d.in && !d.out;
  const s = attendanceStateOf(d.state);
  return (
    <DataGridLines
      primary={
        <StatusDot size="sm" tone={s.tone}>
          {s.label}
        </StatusDot>
      }
      secondary={
        <span className="tl-block-code">
          {d.in ? (live ? `${d.in} · 근무 중` : `${d.in}~${d.out ?? ''}`) : d.note}
          {d.in && d.note && d.state !== 'normal' ? ` · ${d.note}` : ''}
        </span>
      }
    />
  );
}

export default function TeamAttendance() {
  const toast = useToast();
  const canManage = useCan('attendance', 'approve');
  const screens = useScreens();
  const { canSee } = useScope();
  const [team, setTeam] = useState('all');
  const [state, setState] = useState<string | null>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Row | null>(null);
  const [view, setView] = useState('schedule');
  const [week, setWeek] = useState('this');

  // 데이터 범위 밖 사람은 표 · 일정 · 숫자에 넣지 않는다(서버가 같은 판정을 다시 한다)
  const visible = ROWS.filter((r) =>
    canSee({ userId: r.emp.id, name: r.name, department: r.emp.team }),
  );
  const teams = teamOptions(visible);
  const stateTest = STATE_FILTERS.find((f) => f.value === state)?.test ?? (() => true);
  const scoped = visible.filter((r) => team === 'all' || r.emp.team === team);
  const rows = scoped.filter((r) => stateTest(r) && (!q || `${r.name}${r.emp.empNo}`.includes(q)));
  const risky = scoped.filter((r) => r.risk !== 'ok').sort((a, b) => b.projected - a.projected);
  const todayIdx = WEEK.length - 1;
  const inToday = scoped.filter((r) => r.days[todayIdx]!.in).length;
  const lateWeek = scoped.reduce((a, r) => a + r.days.filter((d) => d.state === 'late').length, 0);
  const awayToday = scoped.filter((r) => {
    const d = r.days[todayIdx]!;
    return d.state === 'leave' || d.state === 'field';
  }).length;
  // 팀 일정(대표 제외): 팀 · 이름 검색을 같이 쓴다
  const people = TEAM_PEOPLE.filter(
    (p) =>
      canSee({ userId: p.id, name: p.name, department: p.team }) &&
      (team === 'all' || p.team === team) &&
      (!q || p.name.includes(q)),
  );
  const ids = new Set(people.map((p) => p.id));
  const events = TEAM_EVENTS.filter((e) => ids.has(e.personId));
  const todayEvents = events.filter((e) => onDay(e, TODAY));
  const leaveToday = todayEvents.filter((e) => SCHEDULE_KINDS[e.kind].group === 'leave');
  const awayWorkToday = todayEvents.filter((e) => SCHEDULE_KINDS[e.kind].group === 'work');
  const start = WEEKS.find((w) => w.value === week)?.start ?? WEEK[0].date;

  const notify = (targets: Row[]) =>
    toast.show({
      title: `근무 조정을 요청했습니다`,
      description: `${targets.map((r) => `${r.name} ${r.emp.title}`).join(' · ')}에게 메신저로 보냈습니다`,
      tone: 'success',
    });

  return (
    <Page
      fill
      header={
        <PageHeader
          breadcrumbs={[{ label: '근태' }, { label: '팀 근태' }]}
          title="팀 근태"
          description={`${formatDate(WEEK[0].date, 'md')}~${WEEK[4].date.slice(8)}일 · ${scoped.length}명 · 오늘 ${GW_NOW} 기준`}
          actions={
            <>
              <ExportButton module="attendance" name="팀 근태" rows={rows} columns={CSV}>
                엑셀 다운로드
              </ExportButton>
              <Button
                variant="primary"
                icon="send"
                disabled={!canManage || risky.length === 0}
                onPress={() => notify(risky)}
              >
                근무 조정 요청
              </Button>
            </>
          }
        />
      }
    >
      <Grid gap="tight">
        <Col span={3}>
          <KpiCard
            label="오늘 출근"
            value={`${inToday} / ${scoped.length}`}
            unit="명"
            caption={`휴가 · 외근 ${awayToday}명`}
            icon="log-in"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="오늘 휴가"
            value={leaveToday.length}
            unit="명"
            caption={`연차 · 반차 · 병가 · 이번 주 지각 ${lateWeek}회`}
            icon="calendar-days"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="재택 · 외근 · 출장"
            value={awayWorkToday.length}
            unit="명"
            caption="오늘 사무실 밖에서 일하는 사람"
            icon="map-pin"
          />
        </Col>
        <Col span={3}>
          <KpiCard
            label="52시간 위험"
            value={risky.length}
            unit="명"
            caption="오늘 예정 퇴근 기준 48시간 이상"
            icon="triangle-alert"
            onPress={() => {
              setView('hours');
              setState('risk');
            }}
          />
        </Col>
      </Grid>
      <Tabs
        label="보기"
        value={view}
        onChange={setView}
        items={[
          { value: 'schedule', label: '팀 일정' },
          { value: 'hours', label: '근무 시간', count: risky.length || undefined },
        ]}
      />
      {/* slot: riskRule — 52시간 위험 안내(기준 48 · 52시간은 데이터 RISK · riskOf) */}
      {view === 'hours' && risky.length > 0 && (
        <Banner
          tone="danger"
          title={`52시간 위험 ${risky.length}명`}
          action={
            <Button size="sm" onPress={() => setState('risk')}>
              위험 인원만 보기
            </Button>
          }
        >
          {risky
            .map((r) =>
              r.risk === 'over'
                ? `${r.name} ${josa(r.emp.title, '은/는')} 오늘 ${limitTime(r)} 넘어 근무하면 주 52시간을 넘습니다.`
                : `${r.name} ${josa(r.emp.title, '은/는')} ${r.plannedOut}에 퇴근하면 주 ${formatDuration(projectedMinutes(r))}입니다.`,
            )
            .join(' ')}
        </Banner>
      )}
      {/* slot: riskRule end */}
      <FilterBar
        search={
          <Input
            type="search"
            icon="search"
            size="sm"
            label="사람 검색"
            placeholder="이름 · 사번"
            value={q}
            onChange={setQ}
            clearable
          />
        }
        resultCount={view === 'hours' ? rows.length : people.length}
        onReset={() => {
          setTeam('all');
          setState('all');
          setQ('');
        }}
      >
        {teams.length > 2 && (
          <SegmentedControl size="sm" label="팀" value={team} onChange={setTeam} options={teams} />
        )}
        {view === 'schedule' ? (
          <SegmentedControl
            size="sm"
            label="주"
            value={week}
            onChange={setWeek}
            options={WEEKS.map((w) => ({ value: w.value, label: w.label }))}
          />
        ) : (
          <Select
            size="sm"
            width="auto"
            label="상태"
            value={state}
            onChange={setState}
            options={STATE_FILTERS.map((f) => ({ value: f.value, label: f.label }))}
          />
        )}
      </FilterBar>
      {view === 'schedule' && (
        <TeamSchedule
          caption={`팀 일정 · ${formatDate(start, 'md')}~${formatDate(addDays(start, 6), 'md')}`}
          people={people}
          events={events}
          start={start}
          days={7}
          today={TODAY}
          empty="이 조건의 사람이 없습니다. 팀이나 이름을 바꿔 보세요"
        />
      )}
      {view === 'hours' && (
        <DataGrid
          caption="팀 근태"
          className="tl-block-team-grid"
          height="fill"
          rows={rows}
          rowKey="empId"
          summary
          summaryLabel="출근 인원 · 합계"
          defaultSort={{ key: 'risk', direction: 'desc' }}
          onRowPress={setOpen}
          activeRowKey={open?.empId ?? null}
          rowTone={(r) =>
            r.risk === 'over' ? 'danger' : r.risk === 'watch' ? 'warning' : undefined
          }
          empty="이 조건의 사람이 없습니다. 팀이나 상태를 바꿔 보세요"
          // slot: columns — 열 이름 · 폭. 요일 칸(auto)이 남는 폭을 나눠 쓴다
          columns={[
            {
              key: 'name',
              header: '이름',
              width: 'lg',
              sticky: true,
              sortable: true,
              render: (r) => <PersonLabel name={`${r.name} ${r.emp.title}`} meta={r.emp.team} />,
            },
            ...WEEK.map((w, i) => ({
              key: w.date,
              header: `${w.label} ${w.date.slice(5).replace('-', '/')}${w.date === TODAY ? ' 오늘' : ''}`,
              width: 'auto' as const,
              unit: '명',
              total: 'sum' as const,
              value: (r: Row) => present(r.days[i]!),
              render: (r: Row) => <DayCell d={r.days[i]!} />,
            })),
            {
              key: 'hours',
              header: '주 근무',
              width: 'sm',
              format: 'number',
              sortable: true,
              align: 'right',
              render: (r) => <HeatCell value={r.hours} max={52} format={h1} unit="시간" />,
            },
            {
              key: 'overtime',
              header: '연장',
              width: 'sm',
              format: 'number',
              unit: '시간',
              sortable: true,
            },
            {
              key: 'projected',
              header: '예상',
              width: 'sm',
              format: 'number',
              unit: '시간',
              sortable: true,
            },
            {
              key: 'risk',
              header: '52시간',
              width: 'sm',
              value: (r) => r.projected,
              sortable: true,
              render: (r) => <StatusDot tone={RISK[r.risk].tone}>{RISK[r.risk].label}</StatusDot>,
            },
          ]}
          // slot: columns end
        />
      )}
      <Drawer
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open ? `${open.name} ${open.emp.title}` : ''}
        description={open ? `${open.emp.team} · ${open.emp.duty} · 사번 ${open.emp.empNo}` : ''}
        width="md"
        actions={open && <Badge tone={RISK[open.risk].tone}>{RISK[open.risk].label}</Badge>}
        footer={
          open && (
            <>
              {screens.has('groupware/messenger/chat') && (
                <Button
                  icon="message-circle"
                  onPress={() => screens.go('groupware/messenger/chat')}
                >
                  메시지
                </Button>
              )}
              <Button
                variant="primary"
                icon="send"
                disabled={!canManage || open.risk === 'ok'}
                onPress={() => {
                  notify([open]);
                  setOpen(null);
                }}
              >
                근무 조정 요청
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="tl-block-drawer-stack">
            <DescriptionList
              columns={2}
              items={[
                { label: '주 근무', value: formatDuration(weekMinutes(open)) },
                { label: '연장', value: formatDuration(overtimeMinutes(open)) },
                { label: '오늘 예정 퇴근', value: open.plannedOut },
                { label: '예상 주 근무', value: formatDuration(projectedMinutes(open)) },
                { label: '내선', value: open.emp.ext },
                { label: '메일', value: open.emp.email, copyable: true },
              ]}
            />
            <Timeline
              ariaLabel="이번 주 출퇴근"
              items={open.days.map((d, i) => ({
                id: d.date,
                title: `${WEEK[i]!.label}요일 · ${attendanceStateOf(d.state).label}`,
                time: d.in ? `${d.in}~${d.out ?? '근무 중'}` : formatDate(d.date, 'md'),
                ...(d.note || d.minutes
                  ? {
                      description: [d.note, d.minutes ? formatDuration(d.minutes) : null]
                        .filter(Boolean)
                        .join(' · '),
                    }
                  : {}),
                tone: attendanceStateOf(d.state).tone,
              }))}
            />
          </div>
        )}
      </Drawer>
    </Page>
  );
}
