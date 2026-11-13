// 역할별 홈(Dashboard): 제목 줄 오른쪽 보기 스위치로 같은 홈을 역할마다 다르게 본다.
// 대표 = 인원 · 퇴사율 · 인건비 · 조직 요약, 인사 담당 = 처리할 일 · 계약 만료 · 입사 준비,
// 팀장 = 오늘 팀 근태 · 결재할 문서 · 팀 일정, 구성원 = 출퇴근 · 주 근무 시간 · 연차 · 내 신청.
// 처음 보기는 로그인한 사람의 역할이고 주소 ?role=ceo|hr|lead|member로 바꿀 수 있다. 권한이 없는 보기는 고를 수 없다.
// 보기마다 필요한 데이터 범위(Role.scope)가 있다: 대표 · 인사 담당 = 전사, 팀장 = 부서 이상, 구성원 = 본인.
// 보기를 바꾸면 그 역할의 데이터를 불러오는 동안 같은 모양의 Skeleton을 그린다(components.md §8 불러오는 중)
import {
  formatAmount,
  formatDate,
  formatPercent,
  type PresenceState,
  type SkeletonShape,
  type WorkDay,
  type WorkStatus,
} from '@terracelab/trellis-contracts';
import {
  Badge,
  BarList,
  Button,
  Card,
  DataGrid,
  DataGridLines,
  DueBadge,
  EmptyState,
  Icon,
  KpiCard,
  LeaveBalance,
  PageHeader,
  PersonLabel,
  Progress,
  SegmentedBar,
  SegmentedControl,
  Skeleton,
  StatusDot,
  TeamSchedule,
  TimeClock,
  useToast,
  WorkHoursMeter,
} from '@terracelab/trellis-react';
import { useEffect, useState } from 'react';
import {
  EMPLOYEES as STAFF,
  PAY_DAY,
  PAYROLL_PREV,
  PAYROLL_TOTAL,
  tenure,
  type Employee as StaffRecord,
} from '../../../_data/erp.js';
import {
  ATTENDANCE,
  currentStep,
  EMPLOYEES,
  empById,
  FORM_LABELS,
  formatDuration,
  GW_NOW,
  LEAVE_BALANCE,
  meOf,
  MY_REQUESTS,
  projectedMinutes,
  RISK,
  riskOf,
  useApprovalDocs,
  WEEK,
  type ApprovalDoc,
  type Employee,
} from '../../../_data/groupware.js';
import {
  erpLabel,
  HOLIDAYS,
  HR_TASKS,
  MY_LEAVE_TYPES,
  ONBOARDING,
  ORG_CHART,
  scheduleOn,
  TEAM_EVENTS,
  TEAM_PEOPLE,
  TERM_ENDS,
} from '../../../_data/hr.js';
import { TODAY } from '../../../_data/index.js';
import { PROFILE } from '../../../_data/profile.js';
import {
  scopeAtLeast,
  useOpenLink,
  usePlatform,
  useScope,
  useScreenParams,
  useScreens,
  type DataScope,
} from '../../../_platform/index.js';
import {
  addDays,
  Col,
  Grid,
  Lines,
  monthEnd,
  monthLabel,
  Page,
  weekStart,
} from '../../../_ui/index.js';
import './style.css';

type RoleId = 'ceo' | 'hr' | 'lead' | 'member';
type Can = (module: string, action: 'read' | 'update' | 'approve') => boolean;

// slot: roles — 보기 이름 · 순서 · 볼 수 있는 권한과 데이터 범위(서버가 같은 판정을 다시 한다)
const ROLES: readonly {
  value: RoleId;
  label: string;
  allowed: (can: Can) => boolean;
  /** 이 보기가 보여 주는 사람의 범위. 역할 범위가 이보다 좁으면 고를 수 없다 */
  scope: DataScope;
}[] = [
  { value: 'ceo', label: '대표', allowed: (can) => can('hr-payroll', 'read'), scope: 'company' },
  {
    value: 'hr',
    label: '인사 담당',
    allowed: (can) => can('hr-payroll', 'update'),
    scope: 'company',
  },
  {
    value: 'lead',
    label: '팀장',
    allowed: (can) => can('approval', 'approve'),
    scope: 'department',
  },
  { value: 'member', label: '구성원', allowed: () => true, scope: 'self' },
];
// slot: roles end
/** 데모: 보기 데이터를 불러오는 시간. 실제 앱은 API 훅의 불러오는 중 값을 쓴다 */
const LOAD_MS = 450;

/** 로그인한 사람의 기본 보기: 대표 → 대표, 인사 권한 → 인사 담당, 팀장 → 팀장, 그 밖 → 구성원 */
const roleOf = (title: string, can: Can): RoleId =>
  title === '대표'
    ? 'ceo'
    : can('hr-payroll', 'update')
      ? 'hr'
      : title === '팀장'
        ? 'lead'
        : 'member';

/* ── 회사 숫자(인사 기록 · 급여 대장) ─────────────────────── */

const YEAR = TODAY.slice(0, 4);
const retiredOn = (e: StaffRecord) => e.history.find((h) => h.kind === '퇴직')?.date;
/** 그날 재직 중(휴직 포함). 퇴사일까지 재직으로 센다 */
const onRoll = (e: StaffRecord, day: string) => {
  const out = retiredOn(e);
  return e.hiredAt <= day && (!out || out >= day);
};
const headcount = (day: string) => STAFF.filter((e) => onRoll(e, day)).length;
const NOW_COUNT = STAFF.filter((e) => e.status !== 'retired').length;
const ON_LEAVE = STAFF.filter((e) => e.status === 'leave').length;
const PREV_END = monthEnd(TODAY, -1);
const YEAR_START_COUNT = headcount(`${YEAR}-01-01`);
const HIRED = STAFF.filter((e) => e.hiredAt.startsWith(YEAR)).length;
const LEFT = STAFF.filter((e) => retiredOn(e)?.startsWith(YEAR)).length;
const TURNOVER = (LEFT / ((YEAR_START_COUNT + NOW_COUNT) / 2)) * 100;
const AVG_TENURE =
  STAFF.filter((e) => e.status !== 'retired')
    .map((e) => tenure(e.hiredAt))
    .reduce((a, t) => a + t.years + t.months / 12, 0) / NOW_COUNT;
const PAY_DELTA = ((PAYROLL_TOTAL.gross - PAYROLL_PREV.gross) / PAYROLL_PREV.gross) * 100;
const TEAMS_ORG = ORG_CHART[0]?.children ?? [];
/** 고용 형태(재직 · 휴직 포함): 정규직 · 계약직 */
const EMPLOYMENT_MIX = (['정규직', '계약직'] as const)
  .map((k, i) => ({
    label: k,
    value: STAFF.filter((e) => e.status !== 'retired' && e.employment === k).length,
    color: i === 0 ? ('series-1' as const) : ('series-2' as const),
  }))
  .filter((m) => m.value > 0);

/** 올해 인원 변동(입사 · 퇴사 · 휴직 · 복직) + 입사 예정. 최근 것이 위 */
const CHANGE_TONE = { 입사: 'success', 퇴직: 'neutral', 휴직: 'info', 복직: 'success' } as const;
type ChangeKind = keyof typeof CHANGE_TONE;
const CHANGES = [
  ...STAFF.flatMap((e) =>
    e.history
      .filter((h) => h.date.startsWith(YEAR) && h.kind in CHANGE_TONE)
      .map((h) => ({
        key: `${e.id}-${h.date}-${h.kind}`,
        date: h.date,
        name: e.name,
        meta: `${e.department} · ${e.title}`,
        kind: h.kind as ChangeKind,
        planned: false,
      })),
  ),
  ...ONBOARDING.map((o) => ({
    key: o.id,
    date: o.start,
    name: o.name,
    meta: `${o.department} · ${o.title}`,
    kind: '입사' as ChangeKind,
    planned: true,
  })),
].sort((a, b) => b.date.localeCompare(a.date));
const changeLabel = (k: ChangeKind) => (k === '퇴직' ? '퇴사' : k);

/* ── 근태(그룹웨어 사람) ─────────────────────────────────── */

/** 이번 주 예상 근무 상위(주의 · 초과 위험이 먼저 보이고, 나머지는 정상으로) */
const BY_HOURS = [...ATTENDANCE].sort((a, b) => projectedMinutes(b) - projectedMinutes(a));
const RISKY = BY_HOURS.filter((r) => riskOf(r) !== 'ok');
const TOP_HOURS = 5;
const hours = (minutes: number) => `${formatAmount(minutes / 60, { digits: 1 })}시간`;
const dayOf = (empId: string) =>
  ATTENDANCE.find((r) => r.empId === empId)?.days.find((d) => d.date === TODAY);
/** 오늘 근무 상태: 팀 일정(휴가 · 재택 · 외근 · 출장)이 먼저, 없으면 출퇴근 기록 */
function presenceOf(empId: string): PresenceState {
  const ev = scheduleOn(empId, TODAY);
  const d = dayOf(empId);
  if (ev?.kind === 'remote') return 'remote';
  if (ev && (ev.kind === 'field' || ev.kind === 'trip' || ev.kind === 'education'))
    return 'fieldwork';
  if (d?.state === 'field') return 'fieldwork';
  if (!d?.in) return 'leave';
  return d.out ? 'off' : 'working';
}
const LEAVE_KINDS = new Set(['annual', 'halfAm', 'halfPm', 'quarter', 'compensatory', 'family']);

/* ── 공통 조각 ───────────────────────────────────────────── */

// 보기마다 첫 화면과 같은 칸 · 같은 모양의 뼈대(KPI 줄 · 카드 · 목록 · 표)
type Bone = { span: 3 | 4 | 5 | 7 | 8 | 12; shape: SkeletonShape; lines?: number };
const KPI_ROW: Bone[] = [3, 3, 3, 3].map(() => ({ span: 3, shape: 'kpi' }) as Bone);
const BONES: Record<RoleId, Bone[]> = {
  ceo: [...KPI_ROW, ...[4, 4, 4].map((s) => ({ span: s, shape: 'list', lines: 5 }) as Bone)],
  hr: [
    ...KPI_ROW,
    { span: 7, shape: 'list', lines: 6 },
    { span: 5, shape: 'list', lines: 3 },
    { span: 12, shape: 'table', lines: 2 },
  ],
  lead: [
    ...KPI_ROW,
    { span: 5, shape: 'list', lines: 4 },
    { span: 7, shape: 'list', lines: 4 },
    { span: 12, shape: 'table', lines: 5 },
  ],
  member: [
    { span: 4, shape: 'card', lines: 5 },
    { span: 8, shape: 'card', lines: 5 },
    { span: 4, shape: 'card', lines: 4 },
    { span: 8, shape: 'table', lines: 5 },
  ],
};

function RoleSkeleton({ role, label }: { role: RoleId; label: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={`${label} 보기 불러오는 중`}>
      <Grid>
        {BONES[role].map((b, i) => (
          <Col key={i} span={b.span}>
            {b.shape === 'list' || b.shape === 'table' ? (
              <div className="tl-block-people-bone">
                <Skeleton shape="text" width="40%" />
                <Skeleton shape={b.shape} {...(b.lines ? { lines: b.lines } : {})} />
              </div>
            ) : (
              <Skeleton shape={b.shape} {...(b.lines ? { lines: b.lines } : {})} />
            )}
          </Col>
        ))}
      </Grid>
    </div>
  );
}

/** 카드 오른쪽 위 이동 단추(그 화면이 앱에 있을 때만) */
function useMore() {
  const screens = useScreens();
  return (id: string, label: string) =>
    screens.has(id) ? (
      <Button size="sm" variant="ghost" iconEnd="chevron-right" onPress={() => screens.go(id)}>
        {label}
      </Button>
    ) : null;
}

/* ── 대표 ────────────────────────────────────────────────── */

function CeoView() {
  const screens = useScreens();
  const more = useMore();
  const pressTo = (id: string) => (screens.has(id) ? { onPress: () => screens.go(id) } : {});
  return (
    <Grid>
      {/* slot: ceoKpis — 대표가 보는 숫자 넷 */}
      <Col span={3}>
        <KpiCard
          label="재직 인원"
          value={NOW_COUNT}
          unit="명"
          delta={{
            value: NOW_COUNT - headcount(PREV_END),
            label: '전월 말 대비',
            format: 'number',
            polarity: 'up-good',
          }}
          caption={`휴직 ${ON_LEAVE}명 포함`}
          {...pressTo('erp/hr-payroll/employees')}
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label={`${YEAR}년 퇴사율`}
          value={formatPercent(TURNOVER)}
          caption={`퇴사 ${LEFT}명 · 입사 ${HIRED}명 · 연초 ${YEAR_START_COUNT}명`}
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label={`${monthLabel(TODAY)} 인건비`}
          value={PAYROLL_TOTAL.gross}
          format="amount"
          unit="원"
          delta={{ value: PAY_DELTA, label: '전월 대비', format: 'percent', polarity: 'finance' }}
          caption={`지급 ${formatDate(PAY_DAY, 'md')} · ${PAYROLL_TOTAL.headcount}명`}
          {...pressTo('erp/hr-payroll/payroll')}
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label="평균 근속"
          value={formatAmount(AVG_TENURE, { digits: 1 })}
          unit="년"
          caption={`재직 ${NOW_COUNT}명 기준`}
        />
      </Col>
      {/* slot: ceoKpis end */}
      <Col span={4}>
        <Card
          title="부서별 인원"
          subtitle={`명 · 휴직 포함 · ${TEAMS_ORG.length}개 팀 ${TEAMS_ORG.reduce((n, t) => n + (t.headcount ?? 0), 0)}명`}
          action={more('erp/hr-payroll/org-chart', '조직도')}
        >
          <div className="tl-block-people-org">
            <BarList
              data={TEAMS_ORG.map((t) => ({ label: t.name, value: t.headcount ?? 0 }))}
              layout="horizontal"
              unit="명"
              height={TEAMS_ORG.length * 32 + 16}
              showValues
              ariaLabel={`부서별 인원. ${TEAMS_ORG.map((t) => `${t.name} ${t.headcount ?? 0}명`).join(', ')}`}
            />
            <div className="tl-block-people-org__mix">
              <span className="tl-block-people-org__label">고용 형태 · 재직 {NOW_COUNT}명</span>
              <SegmentedBar
                unit="명"
                legend
                data={EMPLOYMENT_MIX}
                ariaLabel={`고용 형태. ${EMPLOYMENT_MIX.map((m) => `${m.label} ${m.value}명`).join(', ')}`}
              />
            </div>
          </div>
        </Card>
      </Col>
      <Col span={4}>
        <Card
          title="올해 인원 변동"
          subtitle={`입사 · 퇴사 · 휴직 ${CHANGES.length}건 · 예정 포함`}
          padding="none"
          action={more('erp/hr-payroll/employees', '인사 기록')}
        >
          <ul className="tl-block-people-list">
            {CHANGES.map((c) => (
              <li key={c.key} className="tl-block-people-row">
                <PersonLabel name={c.name} meta={c.meta} />
                <span className="tl-block-people-end">
                  <StatusDot size="sm" tone={c.planned ? 'info' : CHANGE_TONE[c.kind]}>
                    {changeLabel(c.kind)}
                    {c.planned ? ' 예정' : ''}
                  </StatusDot>
                  <span className="tl-block-people-date">{formatDate(c.date, 'md')}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </Col>
      <Col span={4}>
        <Card
          title="주 52시간 주의"
          subtitle={`주의 이상 ${RISKY.length}명 · 이번 주 예상 근무 상위 ${TOP_HOURS}명`}
          padding="none"
          action={more('groupware/attendance/team', '팀 근태')}
        >
          {BY_HOURS.length ? (
            <ul className="tl-block-people-list">
              {BY_HOURS.slice(0, TOP_HOURS).map((r) => {
                const e = empById(r.empId);
                return (
                  <li key={r.empId} className="tl-block-people-row">
                    <PersonLabel name={e.name} meta={`${e.team} · ${e.title}`} />
                    <span className="tl-block-people-end">
                      <StatusDot size="sm" tone={RISK[riskOf(r)].tone}>
                        {RISK[riskOf(r)].label}
                      </StatusDot>
                      <span className="tl-block-people-date">
                        예상 {hours(projectedMinutes(r))}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              size="sm"
              icon="clock"
              title="이번 주 근태 기록이 없습니다"
              description="출퇴근을 기록하면 예상 근무 시간이 보입니다"
            />
          )}
        </Card>
      </Col>
    </Grid>
  );
}

/* ── 인사 담당 ───────────────────────────────────────────── */

function HrView({ docs }: { docs: readonly ApprovalDoc[] }) {
  const screens = useScreens();
  const openLink = useOpenLink();
  const more = useMore();
  const week = addDays(TODAY, 7);
  const leavePending = docs.filter((d) => d.form === 'leave' && d.state === 'pending');
  const soonEnds = TERM_ENDS.filter((t) => t.end <= addDays(TODAY, 90));
  const firstStart = [...ONBOARDING].sort((a, b) => a.start.localeCompare(b.start))[0];
  return (
    <Grid>
      <Col span={3}>
        <KpiCard
          label="처리할 인사 업무"
          value={HR_TASKS.length}
          unit="건"
          caption={`7일 안 마감 ${HR_TASKS.filter((t) => t.due <= week).length}건`}
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label="휴가 결재 진행"
          value={leavePending.length}
          unit="건"
          caption="팀장 승인 대기"
          {...(screens.has('groupware/approval/inbox')
            ? { onPress: () => screens.go('groupware/approval/inbox') }
            : {})}
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label="입사 예정"
          value={ONBOARDING.length}
          unit="명"
          caption={firstStart ? `첫 입사 ${formatDate(firstStart.start, 'mdw')}` : '예정 없음'}
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label="계약 · 휴직 만료"
          value={TERM_ENDS.length}
          unit="건"
          caption={`90일 안 ${soonEnds.length}건`}
        />
      </Col>
      <Col span={7}>
        {/* slot: hrTasks — 회사 인사 일정(급여 마감 · 신고 기한)은 데이터 HR_TASKS에서 */}
        <Card title="처리할 일" subtitle={`${HR_TASKS.length}건 · 기한 순`} padding="none">
          <ul className="tl-block-people-list">
            {[...HR_TASKS]
              .sort((a, b) => a.due.localeCompare(b.due))
              .map((t) => {
                const body = (
                  <>
                    <span className="tl-block-people-icon">
                      <Icon name={t.icon} size={20} />
                    </span>
                    <Lines
                      primary={<span className="tl-block-people-strong">{t.title}</span>}
                      secondary={t.detail}
                    />
                    <DueBadge due={t.due} today={TODAY} warnDays={3} size="sm" />
                  </>
                );
                const open = openLink(t.link);
                return (
                  <li key={t.id}>
                    {open ? (
                      <button
                        type="button"
                        className="tl-block-people-task tl-focusable"
                        onClick={open}
                      >
                        {body}
                      </button>
                    ) : (
                      <div className="tl-block-people-task">{body}</div>
                    )}
                  </li>
                );
              })}
          </ul>
        </Card>
        {/* slot: hrTasks end */}
      </Col>
      <Col span={5}>
        <Card
          title="계약 · 휴직 만료"
          subtitle="끝나는 날 순 · 30일 안이면 주의"
          padding="none"
          action={more('erp/hr-payroll/employees', '인사 기록')}
        >
          <ul className="tl-block-people-list">
            {TERM_ENDS.map((t) => {
              const e = STAFF.find((x) => x.id === t.empId);
              return (
                <li key={`${t.empId}-${t.end}`} className="tl-block-people-row" data-wrap>
                  <PersonLabel
                    name={e?.name ?? t.empId}
                    meta={e ? `${e.department} · ${e.title}` : ''}
                  />
                  <span className="tl-block-people-term">
                    <Lines primary={`${t.label} ${formatDate(t.end, 'md')}`} secondary={t.next} />
                  </span>
                  <DueBadge due={t.end} today={TODAY} warnDays={30} size="sm" />
                </li>
              );
            })}
          </ul>
        </Card>
      </Col>
      <Col span={12}>
        <Card
          title="입사 준비"
          subtitle={`${ONBOARDING.length}명 · 입사일 전에 계정 · 장비 · 교육을 끝냅니다`}
          padding="none"
        >
          <DataGrid
            caption="입사 준비"
            className="tl-block-flat-grid tl-block-people-grid"
            rows={ONBOARDING}
            rowKey="id"
            columns={[
              {
                key: 'name',
                header: '입사자',
                width: 'lg',
                render: (o) => (
                  <PersonLabel size="sm" name={o.name} meta={`${o.department} · ${o.title}`} />
                ),
              },
              {
                key: 'start',
                header: '입사일',
                width: 'md',
                render: (o) => (
                  <DataGridLines
                    primary={<span className="tl-block-code">{formatDate(o.start, 'mdw')}</span>}
                    secondary={<DueBadge due={o.start} today={TODAY} warnDays={10} size="sm" />}
                  />
                ),
              },
              { key: 'employment', header: '고용 형태', width: 'sm' },
              {
                key: 'mentor',
                header: '멘토',
                width: 'md',
                render: (o) => erpLabel(o.mentorId),
              },
              {
                key: 'steps',
                header: '준비',
                width: 'lg',
                render: (o) => (
                  <Progress
                    size="sm"
                    label={`${o.name} 입사 준비`}
                    value={o.steps.filter((s) => s.done).length}
                    max={o.steps.length}
                    unit="항목"
                    showValue
                  />
                ),
              },
              {
                key: 'left',
                header: '남은 항목',
                render: (o) =>
                  o.steps
                    .filter((s) => !s.done)
                    .map((s) => s.label)
                    .join(' · ') || '모두 끝냈습니다',
              },
            ]}
          />
        </Card>
      </Col>
    </Grid>
  );
}

/* ── 팀장 ────────────────────────────────────────────────── */

function LeadView({ me, docs }: { me: Employee; docs: readonly ApprovalDoc[] }) {
  const screens = useScreens();
  const more = useMore();
  const members = EMPLOYEES.filter((e) => e.team === me.team && e.id !== me.id);
  const rows = members.map((e) => ({ e, day: dayOf(e.id), presence: presenceOf(e.id) }));
  const inToday = rows.filter((r) => r.day?.in).length;
  const late = rows.filter((r) => r.day?.state === 'late').length;
  const away = rows.filter((r) => r.presence !== 'working' && r.presence !== 'off');
  const mine = docs.filter((d) => d.state === 'pending' && currentStep(d)?.empId === me.id);
  const overdue = mine.filter((d) => d.dueDate < TODAY).length;
  const teamRisk = ATTENDANCE.filter(
    (r) => members.some((m) => m.id === r.empId) && riskOf(r) !== 'ok',
  );
  const people = TEAM_PEOPLE.filter((p) => p.team === me.team);
  const start = weekStart(TODAY);
  const docHref = (id: string) =>
    screens.has('groupware/approval/document')
      ? () => screens.go('groupware/approval/document', { id })
      : undefined;
  return (
    <Grid>
      {/* slot: teamWidgets — 팀장이 보는 숫자 넷과 아래 카드 */}
      <Col span={3}>
        <KpiCard
          label="오늘 출근"
          value={inToday}
          unit={`/ ${members.length}명`}
          caption={`${GW_NOW} 기준 · 지각 ${late}명`}
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label="휴가 · 재택 · 외근"
          value={away.length}
          unit="명"
          caption={
            away.length
              ? away.map((r) => `${r.e.name} ${presenceWord(r.presence)}`).join(' · ')
              : '모두 사무실 근무'
          }
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label="결재할 문서"
          value={mine.length}
          unit="건"
          caption={`기한 지남 ${overdue}건`}
          {...(screens.has('groupware/approval/inbox')
            ? { onPress: () => screens.go('groupware/approval/inbox') }
            : {})}
        />
      </Col>
      <Col span={3}>
        <KpiCard
          label="주 52시간 주의"
          value={teamRisk.length}
          unit="명"
          caption={
            teamRisk.length
              ? `예상 최대 ${hours(Math.max(...teamRisk.map(projectedMinutes)))}`
              : '이번 주 모두 48시간 아래'
          }
        />
      </Col>
      <Col span={5}>
        <Card
          title="오늘 팀 근태"
          subtitle={`${me.team} ${members.length}명 · ${formatDate(TODAY, 'mdw')}`}
          padding="none"
          action={more('groupware/attendance/team', '팀 근태')}
        >
          <ul className="tl-block-people-list">
            {rows.map(({ e, day, presence }) => {
              const ev = scheduleOn(e.id, TODAY);
              return (
                <li key={e.id} className="tl-block-people-row">
                  <PersonLabel name={e.name} meta={`${e.title} · ${e.duty}`} presence={presence} />
                  <span className="tl-block-people-num">
                    <Lines
                      align="end"
                      primary={day?.in ? `${day.in} 출근` : '–'}
                      secondary={
                        ev?.note ??
                        (day?.state === 'late' ? '지각' : day ? formatDuration(day.minutes) : '')
                      }
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </Col>
      <Col span={7}>
        <Card
          title="결재할 문서"
          subtitle={`${mine.length}건 · 내 차례 · 기한 순`}
          padding="none"
          action={more('groupware/approval/inbox', '결재함')}
        >
          {mine.length ? (
            <ul className="tl-block-people-list">
              {[...mine]
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map((d) => {
                  const open = docHref(d.id);
                  const drafter = empById(d.drafterId);
                  const body = (
                    <>
                      <Lines
                        primary={<span className="tl-block-people-strong">{d.title}</span>}
                        secondary={
                          <>
                            {FORM_LABELS[d.form]} · {drafter.name} {drafter.title} ·{' '}
                            {d.draftedAt.slice(5)}
                          </>
                        }
                      />
                      <span className="tl-block-people-end">
                        <Badge approval={d.state} size="sm" />
                        <DueBadge due={d.dueDate} today={TODAY} warnDays={1} size="sm" />
                      </span>
                    </>
                  );
                  return (
                    <li key={d.id}>
                      {open ? (
                        <button
                          type="button"
                          className="tl-block-people-task tl-focusable"
                          data-cols="2"
                          onClick={open}
                        >
                          {body}
                        </button>
                      ) : (
                        <div className="tl-block-people-task" data-cols="2">
                          {body}
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          ) : (
            <EmptyState
              size="sm"
              icon="stamp"
              title="결재할 문서가 없습니다"
              description="새 결재가 오면 알림으로 알려 드립니다"
            />
          )}
        </Card>
      </Col>
      <Col span={12}>
        <Card
          title="팀 일정"
          subtitle={`${formatDate(start, 'md')}~${formatDate(addDays(start, 13), 'md')} · 휴가 · 재택 · 외근 · 교육`}
          padding="none"
          action={more('groupware/calendar/month', '일정')}
        >
          <div className="tl-block-people-schedule">
            <TeamSchedule
              caption="팀 일정"
              people={people}
              events={TEAM_EVENTS.filter((ev) => people.some((p) => p.id === ev.personId))}
              start={start}
              days={14}
              today={TODAY}
              holidays={HOLIDAYS}
              empty="이 팀에 사람이 없습니다"
            />
          </div>
        </Card>
      </Col>
      {/* slot: teamWidgets end */}
    </Grid>
  );
}

const presenceWord = (p: PresenceState) =>
  p === 'remote' ? '재택' : p === 'fieldwork' ? '외근' : p === 'leave' ? '휴가' : '';

/* ── 구성원 ──────────────────────────────────────────────── */

const DAY_MINUTES = 8 * 60;
const WEEK_END = addDays(WEEK[0].date, 6);

function MemberView({ me }: { me: Employee }) {
  const toast = useToast();
  const screens = useScreens();
  const base = ATTENDANCE.find((r) => r.empId === me.id) ?? ATTENDANCE[0]!;
  const [out, setOut] = useState<string | null>(null);
  const today = base.days.find((d) => d.date === TODAY);
  const clockOut = out ?? today?.out;
  const status: WorkStatus = !today?.in ? 'before' : clockOut ? 'done' : 'working';
  const leaveScreen = ['groupware/attendance/leave-request', 'groupware/approval/draft'].find(
    (id) => screens.has(id),
  );
  const days: WorkDay[] = [
    ...base.days.map((d) => ({
      date: d.date,
      regularMinutes: Math.min(d.minutes, DAY_MINUTES),
      overtimeMinutes: Math.max(0, d.minutes - DAY_MINUTES),
      ...(d.state === 'leave' && !d.in ? { leave: 'annual' as const } : {}),
    })),
    { date: addDays(WEEK[0].date, 5), regularMinutes: 0, holiday: true },
    { date: WEEK_END, regularMinutes: 0, holiday: true },
  ];
  return (
    <Grid>
      {/* slot: memberWidgets — 출퇴근 · 주 근무 · 연차 · 내 신청 */}
      <Col span={4}>
        <TimeClock
          status={status}
          now={`${TODAY}T${GW_NOW}`}
          {...(today?.in ? { clockIn: today.in } : {})}
          {...(clockOut ? { clockOut } : {})}
          schedule={{ start: PROFILE.work.start, end: PROFILE.work.end, breakMinutes: 60 }}
          place="office"
          workType={`고정 근무 · ${PROFILE.work.place}`}
          {...(today ? { workedMinutes: today.minutes } : {})}
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
      </Col>
      <Col span={8}>
        <WorkHoursMeter days={days} period={{ from: WEEK[0].date, to: WEEK_END }} today={TODAY} />
      </Col>
      <Col span={4}>
        <LeaveBalance
          granted={LEAVE_BALANCE.granted}
          used={LEAVE_BALANCE.used}
          basis="fiscal"
          expiresOn={LEAVE_BALANCE.expiresAt}
          types={MY_LEAVE_TYPES}
          {...(leaveScreen
            ? {
                action: (
                  <Button size="sm" icon="calendar-plus" onPress={() => screens.go(leaveScreen)}>
                    휴가 신청
                  </Button>
                ),
              }
            : {})}
        />
      </Col>
      <Col span={8}>
        <Card
          title="내 신청"
          subtitle={`연장 · 휴가 ${MY_REQUESTS.length}건 · 결재 ${MY_REQUESTS.filter((r) => r.state === 'pending').length}건 진행`}
          padding="none"
          action={
            screens.has('groupware/attendance/my') ? (
              <Button
                size="sm"
                variant="ghost"
                iconEnd="chevron-right"
                onPress={() => screens.go('groupware/attendance/my')}
              >
                내 근태
              </Button>
            ) : null
          }
        >
          <DataGrid
            caption="내 신청"
            className="tl-block-flat-grid tl-block-people-grid"
            rows={MY_REQUESTS}
            rowKey="id"
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
                  <DataGridLines primary={formatDate(r.date, 'mdw')} secondary={r.range} />
                ),
              },
              { key: 'reason', header: '사유' },
              {
                key: 'state',
                header: '결재',
                width: 'sm',
                render: (r) => <Badge approval={r.state} />,
              },
            ]}
          />
        </Card>
      </Col>
      {/* slot: memberWidgets end */}
    </Grid>
  );
}

/* ── 화면 ────────────────────────────────────────────────── */

export default function PeopleHome() {
  const { session, can } = usePlatform();
  const { scope } = useScope();
  const { role: paramRole } = useScreenParams();
  const me = meOf(session.user.id);
  const docs = useApprovalDocs();
  // 권한과 데이터 범위가 모두 맞는 보기만 고를 수 있다
  const allowed = ROLES.filter((r) => r.allowed(can as Can) && scopeAtLeast(scope, r.scope));
  const pick = (r: string | undefined) =>
    allowed.find((x) => x.value === r)?.value ??
    allowed.find((x) => x.value === roleOf(me.title, can as Can))?.value ??
    'member';
  const [chosen, setChosen] = useState<RoleId>(() => pick(paramRole));
  // 역할이 바뀌어 고른 보기가 막히면 기본 보기로
  const role = allowed.some((x) => x.value === chosen) ? chosen : pick(undefined);
  const [loading, setLoading] = useState(false);
  const current = ROLES.find((r) => r.value === role)!;

  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setLoading(false), LOAD_MS);
    return () => window.clearTimeout(t);
  }, [loading, role]);
  // 주소의 보기가 바뀌면 따라간다(알림 링크 · 뒤로)
  useEffect(() => {
    // pick은 렌더마다 새로 만들어진다. 주소 값이 바뀔 때만 따라간다
    if (paramRole) setChosen(pick(paramRole));
  }, [paramRole]);

  const leave = LEAVE_KINDS.has(scheduleOn(me.id, TODAY)?.kind ?? '');
  return (
    <Page
      header={
        <PageHeader
          title={formatDate(TODAY, 'mdw')}
          description={`${session.company.name} · ${me.team} ${me.name} ${me.title}${leave ? ' · 오늘 휴가' : ''}`}
          actions={
            allowed.length > 1 ? (
              <div className="tl-block-people-roles">
                <SegmentedControl
                  label="보기"
                  fullWidth
                  value={role}
                  onChange={(v) => {
                    if (v === role) return;
                    setChosen(v as RoleId);
                    setLoading(true);
                  }}
                  options={allowed.map((r) => ({ value: r.value, label: r.label }))}
                />
              </div>
            ) : null
          }
        />
      }
    >
      <section aria-label={`${current.label} 보기`}>
        {loading ? (
          <RoleSkeleton role={role} label={current.label} />
        ) : role === 'ceo' ? (
          <CeoView />
        ) : role === 'hr' ? (
          <HrView docs={docs} />
        ) : role === 'lead' ? (
          <LeadView me={me} docs={docs} />
        ) : (
          <MemberView me={me} />
        )}
      </section>
    </Page>
  );
}
