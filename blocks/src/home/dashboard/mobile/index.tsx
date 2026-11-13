// 휴대폰 홈(NotificationHome · 한 열): 출퇴근(TimeClock) → 바로 가기 넷(엄지 크기) → 오늘 할 일 → 남은 연차.
// 390 폭을 기준으로 그리고, 넓은 화면에서는 같은 한 열을 가운데에 둔다. 밀도는 폭과 관계없이 touch(행 48 · 컨트롤 48)
import { formatDate, type ModuleId, type WorkStatus } from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import {
  Badge,
  Card,
  DueBadge,
  EmptyState,
  Icon,
  LeaveBalance,
  ModuleIcon,
  PageHeader,
  StatusDot,
  TimeClock,
  useToast,
} from '@terracelab/trellis-react';
import { useState, type ReactNode } from 'react';
import {
  ATTENDANCE,
  currentStep,
  empById,
  EVENTS,
  GW_NOW,
  LEAVE_BALANCE,
  meOf,
  MY_REQUESTS,
  toMin,
  useApprovalDocs,
} from '../../../_data/groupware.js';
import { TODAY } from '../../../_data/index.js';
import { PROFILE } from '../../../_data/profile.js';
import { usePlatform, useScreens } from '../../../_platform/index.js';
import { Lines, Page } from '../../../_ui/index.js';
import './style.css';

// slot: quickActions — 바로 가기 넷(모듈 타일 · 이름 · 여는 화면). 화면이 앱에 없으면 빠진다
const QUICK: readonly { module: ModuleId; label: string; screen: string }[] = [
  { module: 'attendance', label: '휴가 신청', screen: 'groupware/attendance/leave-request' },
  { module: 'approval', label: '결재함', screen: 'groupware/approval/inbox' },
  { module: 'hr-payroll', label: '임금명세서', screen: 'erp/hr-payroll/payslip' },
  { module: 'calendar', label: '일정', screen: 'groupware/calendar/month' },
];
// slot: quickActions end
// slot: tasks — 오늘 할 일에 넣는 것(결재 차례 · 오늘 내 일정 · 결재 요청 전 신청), 최대 개수
const TASK_LIMIT = 6;
const MY_CALENDARS = new Set(['mine', 'team', 'company']);
// slot: tasks end

interface Task {
  key: string;
  icon: IconName;
  title: string;
  meta: string;
  end: ReactNode;
  screen?: string;
  params?: Record<string, string>;
}

export default function MobileHome() {
  const toast = useToast();
  const screens = useScreens();
  const { session } = usePlatform();
  const me = meOf(session.user.id);
  const docs = useApprovalDocs();
  const day = ATTENDANCE.find((r) => r.empId === me.id)?.days.find((d) => d.date === TODAY);
  const [out, setOut] = useState<string | null>(null);
  const clockOut = out ?? day?.out;
  const status: WorkStatus = !day?.in ? 'before' : clockOut ? 'done' : 'working';

  const myTurn = docs
    .filter((d) => d.state === 'pending' && currentStep(d)?.empId === me.id)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const now = toMin(GW_NOW);
  const events = EVENTS.filter(
    (e) => e.date === TODAY && MY_CALENDARS.has(e.calendar) && e.end && toMin(e.end) > now,
  ).sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
  const drafts = MY_REQUESTS.filter((r) => r.state === 'draft');

  const tasks: Task[] = [
    ...myTurn.map((d): Task => ({
      key: d.id,
      icon: 'stamp',
      title: d.title,
      meta: `결재 차례 · 기안 ${empById(d.drafterId).name} ${empById(d.drafterId).title}`,
      end: <DueBadge due={d.dueDate} today={TODAY} warnDays={1} size="sm" />,
      screen: 'groupware/approval/document',
      params: { id: d.id },
    })),
    ...events.map((e): Task => {
      const live = !!e.start && toMin(e.start) <= now;
      return {
        key: e.id,
        icon: 'calendar',
        title: e.title,
        meta: `${e.start}~${e.end}${e.place ? ` · ${e.place}` : ''}`,
        end: (
          <StatusDot size="sm" tone={live ? 'info' : 'neutral'} pulse={live}>
            {live ? '진행 중' : e.start}
          </StatusDot>
        ),
        screen: 'groupware/calendar/month',
      };
    }),
    ...drafts.map((r): Task => ({
      key: r.id,
      icon: 'file-pen',
      title: `${r.kind} ${formatDate(r.date, 'md')} ${r.range}`,
      meta: `결재 요청 전 · ${r.reason}`,
      end: <Badge approval="draft" size="sm" />,
      screen: 'groupware/attendance/my',
    })),
  ].slice(0, TASK_LIMIT);

  return (
    <Page>
      <div className="tl-block-mobile" data-density="touch">
        <PageHeader
          title={formatDate(TODAY, 'mdw')}
          description={`${me.name} ${me.title} · ${me.team}`}
        />
        <TimeClock
          status={status}
          now={`${TODAY}T${GW_NOW}`}
          {...(day?.in ? { clockIn: day.in } : {})}
          {...(clockOut ? { clockOut } : {})}
          schedule={{ start: PROFILE.work.start, end: PROFILE.work.end, breakMinutes: 60 }}
          place="office"
          workType={`고정 근무 · ${PROFILE.work.place}`}
          {...(day ? { workedMinutes: day.minutes } : {})}
          {...(status === 'working'
            ? {
                onClockOut: () => {
                  setOut(GW_NOW);
                  toast.show({
                    title: `${GW_NOW} 퇴근을 기록했습니다`,
                    description: `근무제 퇴근은 ${PROFILE.work.end}입니다. 조퇴로 남습니다`,
                    tone: 'warning',
                  });
                },
              }
            : {})}
        />

        <nav aria-label="바로 가기">
          <ul className="tl-block-mobile-quick">
            {QUICK.filter((q) => screens.has(q.screen)).map((q) => (
              <li key={q.screen}>
                <a
                  href={screens.href(q.screen)}
                  className="tl-block-mobile-quick__item tl-focusable"
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                    e.preventDefault();
                    screens.go(q.screen);
                  }}
                >
                  <ModuleIcon module={q.module} size={40} decorative />
                  <span>{q.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Card
          title="오늘 할 일"
          subtitle={`${tasks.length}건 · 결재 ${myTurn.length} · 일정 ${events.length} · 요청 전 ${drafts.length}`}
          padding="none"
        >
          {tasks.length ? (
            <ul className="tl-block-mobile-tasks">
              {tasks.map((t) => {
                const body = (
                  <>
                    <span className="tl-block-mobile-tasks__icon">
                      <Icon name={t.icon} size={20} />
                    </span>
                    <Lines
                      primary={<span className="tl-block-mobile-tasks__title">{t.title}</span>}
                      secondary={t.meta}
                    />
                    <span className="tl-block-mobile-tasks__end">{t.end}</span>
                  </>
                );
                return (
                  <li key={t.key}>
                    {t.screen && screens.has(t.screen) ? (
                      <a
                        href={screens.href(t.screen, t.params)}
                        className="tl-block-mobile-tasks__row tl-focusable"
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                          e.preventDefault();
                          screens.go(t.screen!, t.params);
                        }}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="tl-block-mobile-tasks__row">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              size="sm"
              icon="circle-check"
              title="오늘 할 일을 모두 끝냈습니다"
              description="새 결재가 오면 알림으로 알려 드립니다"
            />
          )}
        </Card>

        {/* slot: leave — 연차 카드(회계연도 기준 · 소멸일) */}
        <LeaveBalance
          granted={LEAVE_BALANCE.granted}
          used={LEAVE_BALANCE.used}
          basis="fiscal"
          expiresOn={LEAVE_BALANCE.expiresAt}
        />
        {LEAVE_BALANCE.pending > 0 && (
          <p className="tl-block-mobile-note">
            신청 중 {LEAVE_BALANCE.pending}일
            {LEAVE_BALANCE.pendingAt ? `(${formatDate(LEAVE_BALANCE.pendingAt, 'md')})` : ''}이
            승인되면 남은 연차는{' '}
            {LEAVE_BALANCE.granted - LEAVE_BALANCE.used - LEAVE_BALANCE.pending}
            일입니다.
          </p>
        )}
        {/* slot: leave end */}
      </div>
    </Page>
  );
}
