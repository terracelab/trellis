// 내 근태(Dashboard): 오늘 출근 · 퇴근(TimeClock) → 이번 주 근무 시간 40 · 52시간(WorkHoursMeter)
// → 연차(LeaveBalance) · 이번 주 출퇴근 시각 막대 → 연장 · 휴가 신청
import {
  formatAmount,
  formatDate,
  type ApprovalState,
  type WorkDay,
  type WorkStatus,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  Button,
  Card,
  DataGrid,
  DataGridLines,
  Dialog,
  DialogClose,
  LeaveBalance,
  PageHeader,
  TimeClock,
  useToast,
  WorkHoursMeter,
  WorkTimeline,
} from '@terracelab/trellis-react';
import { useState } from 'react';
import {
  ATTENDANCE,
  attendanceStateOf,
  empLabel,
  formatDuration,
  GW_NOW,
  leaderOf,
  LEAVE_BALANCE,
  meOf,
  MY_REQUESTS,
  projectedMinutes,
  WEEK,
  type MyRequest,
} from '../../../_data/groupware.js';
import { MY_LEAVE_TYPES } from '../../../_data/hr.js';
import { TODAY } from '../../../_data/index.js';
import { PROFILE } from '../../../_data/profile.js';
import { usePlatform, useScreens } from '../../../_platform/index.js';
import { addDays, Col, Grid, Page, Stack } from '../../../_ui/index.js';
import './style.css';

const hours = (v: number) => formatAmount(v, { digits: Number.isInteger(v) ? 0 : 1 });
// slot: workRule — 근무제(출근 · 퇴근 시각 · 하루 소정 근로). 값은 회사 설정 PROFILE.work
/** 근무제 시각(회사 설정) */
const { start: WORK_START, end: WORK_END } = PROFILE.work;
/** 이번 주 월~일. 토 · 일은 휴일 */
const WEEK_END = addDays(WEEK[0].date, 6);
const DAY_MINUTES = 8 * 60;
// slot: workRule end

export default function MyAttendance() {
  const toast = useToast();
  const { session } = usePlatform();
  const me = meOf(session.user.id);
  const screens = useScreens();
  /** 휴가 신청 화면: 전용 화면이 있으면 그것, 없으면 기안 작성 */
  const leaveScreen = ['groupware/attendance/leave-request', 'groupware/approval/draft'].find(
    (id) => screens.has(id),
  );
  /** 연장 · 휴가 결재자: 팀장(팀장이면 그 위) */
  const approver = empLabel(leaderOf(me).id);
  const base = ATTENDANCE.find((r) => r.empId === me.id) ?? ATTENDANCE[2]!;
  const [out, setOut] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [requests, setRequests] = useState<MyRequest[]>(() => [...MY_REQUESTS]);

  const row = {
    ...base,
    days: base.days.map((d) =>
      d.date === TODAY && out && d.in ? { ...d, out, minutes: d.minutes } : d,
    ),
  };
  const today = row.days[row.days.length - 1]!;
  const working = !!today.in && !today.out;
  const projected = projectedMinutes(row) / 60;
  const leaveLeft = LEAVE_BALANCE.granted - LEAVE_BALANCE.used;
  const status: WorkStatus = working ? 'working' : today.out ? 'done' : 'before';
  // 요일 막대: 8시간까지 소정, 넘는 만큼 연장. 종일 휴가는 막대 대신 휴가 이름, 주말은 휴일
  const days: WorkDay[] = [
    ...row.days.map((d) => ({
      date: d.date,
      regularMinutes: Math.min(d.minutes, DAY_MINUTES),
      overtimeMinutes: Math.max(0, d.minutes - DAY_MINUTES),
      ...(d.state === 'leave' && !d.in ? { leave: 'annual' as const } : {}),
    })),
    { date: addDays(WEEK[0].date, 5), regularMinutes: 0, holiday: true },
    { date: WEEK_END, regularMinutes: 0, holiday: true },
  ];

  const leave = () => {
    setOut(GW_NOW);
    toast.show({
      title: `${GW_NOW} 퇴근을 기록했습니다`,
      description: `오늘 근무 ${formatDuration(today.minutes)} · 조퇴로 남습니다`,
      tone: 'warning',
    });
  };
  const submit = (id: string) => {
    setRequests((rs) =>
      rs.map((r) => (r.id === id ? { ...r, state: 'pending' as ApprovalState } : r)),
    );
    toast.show({
      title: '결재를 요청했습니다',
      description: `${approver}에게 알림을 보냈습니다`,
      tone: 'success',
    });
  };

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={[{ label: '근태' }, { label: '내 근태' }]}
          title="내 근태"
          description={`${me.name} ${me.title} · ${me.team} · 근무제 ${WORK_START}~${WORK_END}(점심 1시간)`}
          actions={<Button icon="timer">연장 신청</Button>}
        />
      }
    >
      <Grid>
        <Col span={4}>
          <TimeClock
            status={status}
            now={`${TODAY}T${GW_NOW}`}
            {...(today.in ? { clockIn: today.in } : {})}
            {...(today.out ? { clockOut: today.out } : {})}
            schedule={{ start: WORK_START, end: WORK_END, breakMinutes: 60 }}
            place="office"
            workType={`고정 근무 · ${PROFILE.work.place}`}
            workedMinutes={today.minutes}
            {...(working ? { onClockOut: () => setConfirm(true) } : {})}
          />
        </Col>
        <Col span={8}>
          <WorkHoursMeter days={days} period={{ from: WEEK[0].date, to: WEEK_END }} today={TODAY} />
        </Col>
        {/* slot: leaveBalance — 연차 카드(종류 · 기준일) */}
        <Col span={4}>
          <Stack gap="sm">
            <LeaveBalance
              granted={LEAVE_BALANCE.granted}
              used={LEAVE_BALANCE.used}
              basis="fiscal"
              period={{ from: `${TODAY.slice(0, 4)}-01-01`, to: LEAVE_BALANCE.expiresAt }}
              expiresOn={LEAVE_BALANCE.expiresAt}
              types={MY_LEAVE_TYPES}
              {...(leaveScreen
                ? {
                    action: (
                      <Button
                        size="sm"
                        icon="calendar-plus"
                        onPress={() => screens.go(leaveScreen)}
                      >
                        휴가 신청
                      </Button>
                    ),
                  }
                : {})}
            />
            {LEAVE_BALANCE.pending > 0 && (
              <p className="tl-block-att-note">
                신청 중 {hours(LEAVE_BALANCE.pending)}일
                {LEAVE_BALANCE.pendingAt && `(${formatDate(LEAVE_BALANCE.pendingAt, 'md')})`}이
                승인되면 남은 연차는 {hours(leaveLeft - LEAVE_BALANCE.pending)}일입니다.
              </p>
            )}
          </Stack>
        </Col>
        {/* slot: leaveBalance end */}
        {/* slot: weekChart — 이번 주 출퇴근 시각 막대(눈금 07~23시) */}
        <Col span={8}>
          <Card
            title="이번 주 출퇴근"
            subtitle={`${formatDate(WEEK[0].date, 'md')}~${WEEK[4].date.slice(8)}일 · ${row.plannedOut}에 퇴근하면 주 ${formatDuration(projected * 60)}`}
          >
            <WorkTimeline
              label="이번 주 출퇴근"
              schedule={{ start: WORK_START, end: WORK_END, breakMinutes: 60 }}
              today={TODAY}
              now={GW_NOW}
              days={row.days.map((d) => {
                const live = d.date === TODAY && !!d.in && !d.out;
                const s = attendanceStateOf(d.state);
                return {
                  date: d.date,
                  ...(d.in ? { clockIn: d.in } : { off: d.note ?? '휴가' }),
                  ...(d.out ? { clockOut: d.out } : {}),
                  ...(d.minutes ? { minutes: d.minutes } : {}),
                  // 근무 중인 오늘은 컴포넌트가 "근무 중"을 단다
                  ...(live ? {} : { status: { tone: s.tone, label: s.label } }),
                };
              })}
            />
          </Card>
        </Col>
        {/* slot: weekChart end */}
        {/* slot: requests — 내 신청 목록(종류 · 날짜 · 사유 · 결재) */}
        <Col span={12}>
          <Card
            title="연장 · 휴가 신청"
            subtitle={`최근 ${requests.length}건 · 결재 ${approver}`}
            padding="none"
          >
            <DataGrid
              caption="연장 · 휴가 신청"
              rows={requests}
              rowKey="id"
              className="tl-block-att-grid"
              columns={[
                {
                  key: 'kind',
                  header: '종류',
                  width: 'md',
                  render: (r) => (
                    <DataGridLines
                      primary={r.kind}
                      secondary={<span className="tl-block-code">{r.id}</span>}
                    />
                  ),
                },
                {
                  key: 'date',
                  header: '일자',
                  width: 'lg',
                  render: (r) => (
                    <DataGridLines
                      primary={formatDate(r.date, 'mdw')}
                      secondary={
                        <>
                          {r.range}
                          {r.minutes
                            ? ` · ${formatDuration(r.minutes)}`
                            : r.days
                              ? ` · ${hours(r.days)}일`
                              : ''}
                        </>
                      }
                    />
                  ),
                },
                {
                  key: 'reason',
                  header: '사유',
                  render: (r) =>
                    r.comment ? (
                      <DataGridLines primary={r.reason} secondary={<>반려 사유 · {r.comment}</>} />
                    ) : (
                      r.reason
                    ),
                },
                {
                  key: 'state',
                  header: '결재',
                  width: 'lg',
                  render: (r) =>
                    r.state === 'draft' ? (
                      <span className="tl-block-att-act">
                        <Badge approval="draft" />
                        <Button size="sm" variant="ghost" onPress={() => submit(r.id)}>
                          결재 요청
                        </Button>
                      </span>
                    ) : (
                      <Badge approval={r.state} />
                    ),
                },
              ]}
            />
          </Card>
        </Col>
        {/* slot: requests end */}
      </Grid>
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        title="지금 퇴근하면 조퇴로 남습니다"
        description={`근무제 퇴근 시각은 ${WORK_END}입니다. ${GW_NOW}에 퇴근을 기록하면 오늘 근무는 ${formatDuration(today.minutes)}입니다.`}
        footer={
          <>
            <DialogClose render={<Button>취소</Button>} />
            <DialogClose
              render={
                <Button variant="primary" icon="log-out" onPress={leave}>
                  퇴근
                </Button>
              }
            />
          </>
        }
      />
    </Page>
  );
}
