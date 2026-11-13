// 쇼케이스 화면 조각. 실제 @terracelab/trellis-react 컴포넌트로 지금 화면을 다시 조립한다
// (역할별 홈 · 인사 기록 · 휴대폰 홈 · 모듈 런처 · 결재선 · 임금명세서 · 달력 · 알림 카드 · 근태 · 자금 일보 ·
// 전표 · 재고 · 메신저 · 에이전트 대화). showcase.ts의 판은 자리(data-sc)만 두고, mountShowcase가 그 자리에 붙인다.
// 숫자와 이름은 data.ts 하나에서 온다. 색 · 간격은 컴포넌트와 --tl-* 변수만 쓴다.
import type { ModuleId, SideNavSection } from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import {
  ApprovalLine,
  Badge,
  Button,
  Card,
  Composer,
  DueBadge,
  Icon,
  KpiCard,
  MessageThread,
  ModuleIcon,
  MonthCalendar,
  NotificationCard,
  PageHeader,
  Payslip,
  PersonLabel,
  ProposalCard,
  RunSteps,
  SelectableList,
  SideNav,
  StatusDot,
  TimeClock,
  type MessageThreadWebItem,
} from '@terracelab/trellis-react';
import { DataBar, SegmentedBar, Sparkline } from '@terracelab/trellis-react/charts';
import modules from '@terracelab/trellis-tokens/modules';
import type { ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  AGENT,
  APPROVAL_PENDING,
  ATTENDANCE_KINDS,
  ATTENDANCE_WEEK,
  CASH,
  CHAT,
  CHAT_CHANNELS,
  COMPANY,
  HR_TASKS,
  JOURNAL,
  JOURNAL_RECENT,
  LEAVE_PENDING,
  MONTH_EVENTS,
  MY_DAY,
  MY_TASKS,
  ONBOARDING,
  PAYSLIP,
  PEOPLE,
  PURCHASE_DOC,
  QUICK,
  STOCK,
  TERM_ENDS,
  TODAY,
  UNREAD,
  USER,
  WAREHOUSES,
  tenure,
  won,
} from '../data';

const noop = () => undefined;
const mod = (id: string) => modules.modules.find((m) => m.id === id)!;
const navItem = (id: string, extra: { count?: number; countTone?: 'danger' } = {}) => ({
  id,
  label: mod(id).label,
  icon: mod(id).icon as IconName,
  ...extra,
});
const md = (iso: string) => `${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일`;

/* ── 앱 껍데기: 짙은 사이드바(실제 SideNav) · 글로벌 바 · 본문 ───────────── */
const NAV: SideNavSection[] = [
  { id: 'top', items: [{ id: 'home', label: '홈', icon: 'house' }] },
  {
    id: 'erp',
    label: modules.groups.erp.label,
    group: 'erp',
    collapsible: true,
    defaultOpen: true,
    items: [
      navItem('accounting'),
      navItem('treasury'),
      navItem('purchasing', { count: 4 }),
      {
        ...navItem('hr-payroll'),
        children: [
          { id: 'employees', label: '인사 기록' },
          { id: 'payslip', label: '임금명세서' },
        ],
      },
    ],
  },
  {
    id: 'groupware',
    label: modules.groups.groupware.label,
    group: 'groupware',
    collapsible: true,
    defaultOpen: true,
    items: [
      navItem('approval', { count: APPROVAL_PENDING.total, countTone: 'danger' }),
      navItem('attendance'),
      navItem('calendar'),
      navItem('messenger', { count: 3 }),
    ],
  },
  {
    id: 'scm',
    label: modules.groups.scm.label,
    group: 'scm',
    collapsible: true,
    defaultOpen: true,
    items: [navItem('inventory'), navItem('warehouse')],
  },
  {
    id: 'crm',
    label: modules.groups.crm.label,
    group: 'crm',
    collapsible: true,
    defaultOpen: false,
    items: [navItem('customers')],
  },
];

function Shell({ active, children }: { active: string; children: ReactNode }) {
  return (
    <div className="tl-sc-shell">
      <div className="tl-sc-shell__nav">
        <div className="tl-sc-shell__brand">
          테라스원<span>{COMPANY.name}</span>
        </div>
        <SideNav sections={NAV} activeId={active} label="주 메뉴" />
      </div>
      <div className="tl-sc-shell__bar">
        <span className="tl-sc-shell__search">
          <Icon name="search" size={16} />
          거래처 · 품목 · 전표 번호
        </span>
        <span className="tl-sc-shell__bar-end">
          <span className="tl-sc-shell__bell">
            <Icon name="bell" size={20} />
            <span className="tl-sc-shell__dot">{UNREAD.total}</span>
          </span>
          <span className="tl-sc-shell__me">
            {USER.name} {USER.title}
          </span>
        </span>
      </div>
      <div className="tl-sc-shell__main">{children}</div>
    </div>
  );
}

/** 보기 바꾸기 줄(SegmentedControl 모양). 그림 안이라 누르지 않는다 */
function Segments({ options, current }: { options: readonly string[]; current: string }) {
  return (
    <span className="tl-sc-segments">
      {options.map((o) => (
        <span key={o} className="tl-sc-segments__item" data-current={o === current || undefined}>
          {o}
        </span>
      ))}
    </span>
  );
}

/** 탭 줄(Tabs 모양). 밑줄은 border.selected = 회사 색 */
function TabLine({ items }: { items: readonly [string, number][] }) {
  return (
    <span className="tl-sc-tabs">
      {items.map(([label, n], i) => (
        <span key={label} className="tl-sc-tabs__item" data-current={i === 0 || undefined}>
          {label}
          <span className="tl-sc-tabs__count">{n}</span>
        </span>
      ))}
    </span>
  );
}

function Lines({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return (
    <span className="tl-sc-lines">
      <span className="tl-sc-lines__primary">{primary}</span>
      {secondary ? <span className="tl-sc-lines__secondary">{secondary}</span> : null}
    </span>
  );
}

/* ── 1440 역할별 홈(인사 담당 보기) ─────────────────────────── */
export function RoleHome() {
  const week = '2026-11-13';
  const sorted = [...HR_TASKS].sort((a, b) => a.due.localeCompare(b.due));
  return (
    <Shell active="home">
      <PageHeader
        title={TODAY.mdw}
        description={`${COMPANY.legal} · ${USER.team} ${USER.name} ${USER.title}`}
        actions={<Segments options={['대표', '인사 담당', '팀장', '구성원']} current="인사 담당" />}
      />
      <div className="tl-sc-grid">
        <KpiCard
          className="tl-sc-span-3"
          label="처리할 인사 업무"
          value={HR_TASKS.length}
          unit="건"
          caption={`7일 안 마감 ${HR_TASKS.filter((t) => t.due <= week).length}건`}
        />
        <KpiCard
          className="tl-sc-span-3"
          label="휴가 결재 진행"
          value={LEAVE_PENDING}
          unit="건"
          caption="팀장 승인 대기"
        />
        <KpiCard
          className="tl-sc-span-3"
          label="입사 예정"
          value={ONBOARDING.length}
          unit="명"
          caption="첫 입사 11월 16일(월)"
        />
        <KpiCard
          className="tl-sc-span-3"
          label="계약 · 휴직 만료"
          value={TERM_ENDS.length}
          unit="건"
          caption="90일 안 1건"
        />
        <Card
          className="tl-sc-span-7"
          title="처리할 일"
          subtitle={`${HR_TASKS.length}건 · 기한 순`}
          padding="none"
        >
          <ul className="tl-sc-rows">
            {sorted.map((t) => (
              <li key={t.title} className="tl-sc-row">
                <span className="tl-sc-row__icon">
                  <Icon name={t.icon as IconName} size={20} />
                </span>
                <Lines primary={<strong>{t.title}</strong>} secondary={t.detail} />
                <DueBadge due={t.due} today={TODAY.iso} warnDays={3} size="sm" />
              </li>
            ))}
          </ul>
        </Card>
        <Card
          className="tl-sc-span-5"
          title="계약 · 휴직 만료"
          subtitle="끝나는 날 순 · 30일 안이면 주의"
          padding="none"
        >
          <ul className="tl-sc-rows">
            {TERM_ENDS.map((t) => (
              <li key={t.name} className="tl-sc-row" data-cols="3">
                <PersonLabel name={t.name} meta={t.meta} />
                <Lines primary={`${t.label} ${md(t.end)}`} secondary={t.next} />
                <DueBadge due={t.end} today={TODAY.iso} warnDays={30} size="sm" />
              </li>
            ))}
          </ul>
        </Card>
        <Card
          className="tl-sc-span-12"
          title="입사 준비"
          subtitle={`${ONBOARDING.length}명 · 입사일 전에 계정 · 장비 · 교육을 끝냅니다`}
          padding="none"
        >
          <table className="tl-sc-table">
            <thead>
              <tr>
                <th>입사자</th>
                <th>입사일</th>
                <th>고용 형태</th>
                <th>멘토</th>
                <th>준비</th>
              </tr>
            </thead>
            <tbody>
              {ONBOARDING.map((o) => (
                <tr key={o.name}>
                  <td>
                    <PersonLabel size="sm" name={o.name} meta={o.meta} />
                  </td>
                  <td>
                    <span className="tl-sc-inline">
                      {md(o.start)}
                      <DueBadge due={o.start} today={TODAY.iso} warnDays={10} size="sm" />
                    </span>
                  </td>
                  <td>{o.employment}</td>
                  <td>{o.mentor}</td>
                  <td>
                    <span className="tl-sc-inline">
                      <span className="tl-sc-steps" aria-hidden="true">
                        {Array.from({ length: o.steps }, (_, i) => (
                          <i key={i} data-done={i < o.done || undefined} />
                        ))}
                      </span>
                      {o.done} / {o.steps}단계
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}

/* ── 1024 인사 기록(구성원 목록) ───────────────────────────── */
export function PeopleList({ selected = '2017002' }: { selected?: string }) {
  const active = PEOPLE.filter((p) => p.status === 'active').length;
  const leave = PEOPLE.filter((p) => p.status === 'leave').length;
  const retired = PEOPLE.filter((p) => p.status === 'retired').length;
  return (
    <Shell active="employees">
      <PageHeader
        breadcrumbs={[{ label: mod('hr-payroll').label }, { label: '인사 기록' }]}
        title="인사 기록"
        siblings={[
          { label: '인사 기록', href: '#people', current: true },
          { label: '인사 마스터', href: '#people' },
          { label: '조직도', href: '#people' },
        ]}
        description={`${TODAY.mdw} 기준 · 재직 ${active}명 · 휴직 ${leave}명`}
        actions={
          <>
            <Button variant="secondary" icon="download">
              엑셀 다운로드
            </Button>
            <Button variant="primary" icon="plus">
              발령 등록
            </Button>
          </>
        }
        tabs={
          <TabLine
            items={[
              ['전체', PEOPLE.length],
              ['재직', active],
              ['휴직', leave],
              ['퇴직', retired],
            ]}
          />
        }
      />
      <div className="tl-sc-filter">
        <span className="tl-sc-input">
          <Icon name="search" size={16} />
          이름 · 사번
        </span>
        <span className="tl-sc-input" data-select>
          부서 전체
          <Icon name="chevron-down" size={16} />
        </span>
        <span className="tl-sc-filter__count">검색 결과 {PEOPLE.length}건</span>
      </div>
      <div className="tl-sc-table-wrap">
        <table className="tl-sc-table">
          <thead>
            <tr>
              <th>사원</th>
              <th>사번</th>
              <th>부서</th>
              <th>직급</th>
              <th>입사일</th>
              <th className="tl-sc-num">근속</th>
              <th>고용 형태</th>
            </tr>
          </thead>
          <tbody>
            {PEOPLE.map((p) => (
              <tr key={p.id} data-selected={p.id === selected || undefined}>
                <td>
                  <PersonLabel
                    size="sm"
                    name={p.name}
                    {...(p.presence ? { presence: p.presence } : {})}
                    {...(p.status === 'leave'
                      ? { meta: '휴직' }
                      : p.status === 'retired'
                        ? { meta: '퇴직' }
                        : {})}
                  />
                </td>
                <td className="tl-sc-code">{p.id}</td>
                <td>{p.department}</td>
                <td>{p.title}</td>
                <td className="tl-sc-code">{p.hiredAt}</td>
                <td className="tl-sc-num">{tenure(p.hiredAt)}</td>
                <td>{p.employment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

/* ── 휴대폰 껍데기 ─────────────────────────────────────────── */
function Phone({
  title,
  end,
  children,
  tabs = true,
}: {
  title: ReactNode;
  end?: ReactNode;
  children: ReactNode;
  tabs?: boolean;
}) {
  return (
    <div className="tl-sc-phone" data-density="touch">
      <div className="tl-sc-phone__bar">
        <strong>{title}</strong>
        {end}
      </div>
      <div className="tl-sc-phone__body">{children}</div>
      {tabs ? (
        <div className="tl-sc-tabbar">
          {(
            [
              ['house', '홈', true],
              ['calculator', '회계', false],
              ['pen-line', '전자결재', false],
              ['contact', '고객', false],
              ['menu', '전체', false],
            ] as const
          ).map(([icon, label, on]) => (
            <span key={label} className="tl-sc-tabbar__item" data-current={on || undefined}>
              <Icon name={icon} size={20} />
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ── 390 휴대폰 홈(출퇴근) ─────────────────────────────────── */
export function PhoneHome() {
  return (
    <Phone
      title="테라스원"
      end={
        <span className="tl-sc-shell__bell">
          <Icon name="bell" size={20} />
          <span className="tl-sc-shell__dot">{UNREAD.total}</span>
        </span>
      }
    >
      <PageHeader title={TODAY.mdw} description={`${USER.name} ${USER.title} · ${USER.team}`} />
      <TimeClock
        status="working"
        now={`${TODAY.iso}T${TODAY.now}`}
        clockIn={MY_DAY.clockIn}
        schedule={MY_DAY.schedule}
        place="office"
        workType={MY_DAY.workType}
        onClockOut={noop}
      />
      <ul className="tl-sc-quick">
        {QUICK.map((q) => (
          <li key={q.module} className="tl-sc-quick__item">
            <ModuleIcon module={q.module as ModuleId} size={40} decorative />
            <span>{q.label}</span>
          </li>
        ))}
      </ul>
      <Card
        title="오늘 할 일"
        subtitle={`${MY_TASKS.length}건 · 결재 ${MY_TASKS.filter((t) => t.due).length} · 일정 ${MY_TASKS.filter((t) => t.time).length}`}
        padding="none"
      >
        <ul className="tl-sc-rows">
          {MY_TASKS.map((t) => (
            <li key={t.title} className="tl-sc-row">
              <span className="tl-sc-row__icon">
                <Icon name={t.icon as IconName} size={20} />
              </span>
              <Lines primary={<strong>{t.title}</strong>} secondary={t.meta} />
              {t.due ? (
                <DueBadge due={t.due} today={TODAY.iso} warnDays={1} size="sm" />
              ) : (
                <StatusDot size="sm" tone="neutral">
                  {t.time}
                </StatusDot>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </Phone>
  );
}

/* ── 다크 모듈 런처 ────────────────────────────────────────── */
const FAVORITES = ['approval', 'attendance', 'treasury', 'messenger'];
export function Launcher() {
  const groups = Object.keys(modules.groups) as (keyof typeof modules.groups)[];
  const tile = (id: string) => (
    <li key={id} className="tl-sc-launcher__tile">
      <ModuleIcon module={id as ModuleId} size={40} decorative />
      <span>{mod(id).label}</span>
    </li>
  );
  return (
    <div className="tl-sc-launcher" data-theme="dark">
      <Phone
        title="전체 메뉴"
        end={<span className="tl-sc-meta">모듈 {modules.modules.length}종</span>}
        tabs={false}
      >
        <span className="tl-sc-input">
          <Icon name="search" size={16} />
          모듈 이름 · 초성
        </span>
        <section className="tl-sc-launcher__group">
          <h4>
            <Icon name="star" size={16} />
            즐겨찾기
          </h4>
          <ul>{FAVORITES.map(tile)}</ul>
        </section>
        {groups.map((g) => {
          const items = modules.modules.filter((m) => m.group === g);
          return (
            <section key={g} className="tl-sc-launcher__group">
              <h4>
                <i style={{ background: `var(--tl-color-module-${g}-default)` }} />
                {modules.groups[g].label}
                <span className="tl-sc-meta">{items.length}</span>
              </h4>
              <ul>{items.map((m) => tile(m.id))}</ul>
            </section>
          );
        })}
      </Phone>
    </div>
  );
}

/* ── 결재선 · 임금명세서 · 달력 ────────────────────────────── */
export function ApprovalPiece() {
  return (
    <Card
      title={PURCHASE_DOC.title}
      subtitle={`${PURCHASE_DOC.no} · ${won(PURCHASE_DOC.amount)}원`}
      action={<Badge approval="pending" />}
    >
      <ApprovalLine approvers={PURCHASE_DOC.line} />
    </Card>
  );
}

export function PayslipPiece() {
  return (
    <Payslip
      company={COMPANY.legal}
      period={PAYSLIP.period}
      payDate={PAYSLIP.payDate}
      employee={PAYSLIP.employee}
      work={PAYSLIP.work}
      earnings={PAYSLIP.earnings}
      deductions={PAYSLIP.deductions}
      headingLevel={3}
    />
  );
}

export function CalendarPiece() {
  return (
    <Card padding="none">
      <MonthCalendar
        events={MONTH_EVENTS}
        today={TODAY.iso}
        defaultMonth="2026-11"
        defaultSelected={TODAY.iso}
        maxEvents={2}
        agenda={false}
        label="내 일정"
      />
    </Card>
  );
}

/* ── 알림 카드 월: 실제 NotificationCard · SegmentedBar · WaterfallChart ── */
type Notice = Parameters<typeof NotificationCard>[0];
/** 숫자 하나는 상태 줄 안에 쓴다(content.md §5 "결재 대기 12건"). 배지는 지연(danger)만 */
export const WALL_NOTICES: Record<string, Notice> = {
  a: {
    module: 'purchasing',
    title: '발주 승인 대기 4건',
    description: '누리식품 외 3곳',
    time: '08:40',
  },
  b: {
    module: 'accounting',
    title: '11월 부가세 신고서 검토 완료',
    description: '담당 박서연 대리',
    time: '3일 전',
  },
  c: {
    module: 'messenger',
    title: '이하은 과장',
    description: '누리식품 11월 2차 발주서 올렸습니다',
    time: '10:12',
    unread: true,
  },
  d: {
    module: 'mail',
    title: `읽지 않은 메일 ${UNREAD.mail}통`,
    description: '누리식품 발주 확인 외',
    time: '09:12',
    unread: true,
  },
  g: { module: 'customers', title: '고객 정보 120건 갱신', time: '어제' },
  h: {
    module: 'sales',
    title: '이번 주 마감 견적 2건',
    description: '누리식품 · 한결물산',
    time: '07:30',
  },
  i: {
    module: 'inventory',
    title: '안전재고 미달 3품목',
    description: '냉동 오징어 1kg 외 2개',
    time: '07:00',
  },
  j: {
    module: 'approval',
    title: `${APPROVAL_PENDING.overdueDays}일 넘은 결재`,
    description: '지출결의 2건 · 구매품의 1건',
    count: APPROVAL_PENDING.overdue,
    tone: 'danger',
    time: '어제',
  },
};

function TileHead({
  id,
  title,
  meta,
  line,
}: {
  id: string;
  title: string;
  meta: string;
  line: string;
}) {
  return (
    <header className="tl-sc-tilehead">
      <ModuleIcon module={id as ModuleId} size={48} decorative />
      <span className="tl-sc-tilehead__text">
        <span className="tl-sc-tilehead__row">
          <strong>{title}</strong>
          <span className="tl-sc-meta">{meta}</span>
        </span>
        <span className="tl-sc-tilehead__line">{line}</span>
      </span>
    </header>
  );
}

const ATT_COLOR = {
  normal: 'series-1',
  overtime: 'series-2',
  night: 'warning',
  abnormal: 'danger',
} as const;

export function AttendancePiece() {
  const total = (d: (typeof ATTENDANCE_WEEK)[number]) =>
    d.normal + d.overtime + d.night + d.abnormal;
  const max = Math.max(...ATTENDANCE_WEEK.map(total));
  return (
    <article className="tl-sc-card">
      <TileHead id="attendance" title="근태" meta={TODAY.week} line={`${USER.team} 근무 현황`} />
      <ul className="tl-sc-stack">
        {ATTENDANCE_WEEK.map((d, i) => (
          <li key={d.date} data-today={i === ATTENDANCE_WEEK.length - 1 || undefined}>
            <span className="tl-sc-stack__date">{d.date}</span>
            <span className="tl-sc-stack__bar" style={{ width: `${(total(d) / max) * 100}%` }}>
              <SegmentedBar
                size="thin"
                legend={false}
                unit="명"
                data={ATTENDANCE_KINDS.filter((k) => d[k.key] > 0).map((k) => ({
                  label: k.label,
                  value: d[k.key],
                  color: ATT_COLOR[k.key],
                }))}
                ariaLabel={`${d.date} ${ATTENDANCE_KINDS.map((k) => `${k.label} ${d[k.key]}명`).join(', ')}`}
              />
            </span>
          </li>
        ))}
      </ul>
      <dl className="tl-sc-legend">
        {ATTENDANCE_KINDS.map((k) => (
          <div key={k.key}>
            <dt>
              <i data-color={ATT_COLOR[k.key]} />
              {k.label}
            </dt>
            <dd>
              {ATTENDANCE_WEEK.reduce((s, d) => s + d[k.key], 0)}
              <span className="tl-sc-unit">명</span>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

const Money = ({ n }: { n: number }) => (
  <span className="tl-sc-money">
    {won(n)}
    <span className="tl-sc-unit">원</span>
  </span>
);
export function CashPiece() {
  return (
    <article className="tl-sc-card">
      <TileHead
        id="treasury"
        title="자금 일보"
        meta={TODAY.mdw}
        line={`${USER.team} · 본사 외 1`}
      />
      <div className="tl-sc-spark">
        <span className="tl-sc-meta">최근 30일 시재</span>
        <Sparkline
          data={CASH.series}
          width={280}
          height={56}
          area
          color="series-1"
          ariaLabel={`최근 30일 시재. ${won(CASH.series[0]!)}원에서 ${won(CASH.today)}원으로`}
        />
      </div>
      <ul className="tl-sc-cash">
        <li>
          <span>전일 시재</span>
          <Money n={CASH.previous} />
        </li>
        <li data-tone="income">
          <span>수입</span>
          <Money n={CASH.income} />
        </li>
        <li data-tone="expense">
          <span>지출</span>
          <Money n={CASH.expense} />
        </li>
        <li data-total>
          <span>당일 시재</span>
          <Money n={CASH.today} />
        </li>
      </ul>
    </article>
  );
}

/* ── 업무 영역 화면: 전표 · 재고 · 메신저 ───────────────────── */
export function JournalScreen() {
  const debit = JOURNAL.lines.reduce((s, l) => s + l.debit, 0);
  const credit = JOURNAL.lines.reduce((s, l) => s + l.credit, 0);
  return (
    <Shell active="accounting">
      <PageHeader
        breadcrumbs={[{ label: mod('accounting').label }, { label: '전표 입력' }]}
        title="전표 입력"
        meta={<Badge tone="success">대차 일치</Badge>}
        description={`${JOURNAL.no} · ${JOURNAL.date} · ${JOURNAL.memo}`}
        actions={
          <>
            <Button variant="secondary">이달 전표</Button>
            <Button variant="primary" icon="check">
              저장
            </Button>
          </>
        }
      />
      <Card title="분개" subtitle="원 · 차변 왼쪽 · 대변 오른쪽" padding="none">
        <table className="tl-sc-table">
          <thead>
            <tr>
              <th>계정과목</th>
              <th>거래처</th>
              <th className="tl-sc-num">차변</th>
              <th className="tl-sc-num">대변</th>
            </tr>
          </thead>
          <tbody>
            {JOURNAL.lines.map((l) => (
              <tr key={l.account}>
                <td>{l.account}</td>
                <td>{l.partner}</td>
                <td className="tl-sc-num">{l.debit ? won(l.debit) : ''}</td>
                <td className="tl-sc-num">{l.credit ? won(l.credit) : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={2}>합계</th>
              <td className="tl-sc-num">{won(debit)}</td>
              <td className="tl-sc-num">{won(credit)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>
      <div className="tl-sc-grid">
        <KpiCard
          className="tl-sc-span-4"
          label="11월 전표"
          value={42}
          unit="건"
          caption="11월 1일~6일 · 승인 38건"
        />
        <KpiCard
          className="tl-sc-span-4"
          label="당일 시재"
          value={CASH.today}
          format="amount"
          unit="원"
          caption="본사 외 1"
        />
        <KpiCard
          className="tl-sc-span-4"
          label="부가세 예정신고"
          value="D-19"
          caption="11월 25일 마감"
        />
      </div>
      <Card title="이달 전표" subtitle="원 · 최근 순 · 금액은 차변 합계" padding="none">
        <table className="tl-sc-table">
          <thead>
            <tr>
              <th>전표 번호</th>
              <th>일자</th>
              <th>적요</th>
              <th className="tl-sc-num">금액</th>
            </tr>
          </thead>
          <tbody>
            {JOURNAL_RECENT.map((j) => (
              <tr key={j.no}>
                <td className="tl-sc-code">{j.no}</td>
                <td className="tl-sc-code">{j.date}</td>
                <td>{j.memo}</td>
                <td className="tl-sc-num">{won(j.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}

export function StockScreen() {
  const totals = STOCK.map((s) => s.qty.reduce((a, b) => a + b, 0));
  const max = Math.max(...totals);
  const short = STOCK.filter((s, i) => totals[i]! < s.safety);
  return (
    <Shell active="inventory">
      <PageHeader
        breadcrumbs={[{ label: mod('inventory').label }, { label: '재고 현황' }]}
        title="재고 현황"
        description={`${TODAY.mdw} ${TODAY.now} 기준 · 창고 ${WAREHOUSES.length}곳 · 품목 ${STOCK.length}개`}
        actions={
          <Button variant="primary" icon="shopping-cart">
            발주로 넘기기
          </Button>
        }
      />
      <div className="tl-sc-grid">
        <KpiCard
          className="tl-sc-span-4"
          label="안전재고 미만"
          value={short.length}
          unit="품목"
          caption={short.map((s) => s.name).join(' · ')}
        />
        <KpiCard
          className="tl-sc-span-4"
          label="유통기한 30일 안"
          value={2}
          unit="로트"
          caption="평택 냉동센터"
        />
        <KpiCard
          className="tl-sc-span-4"
          label="입고 예정"
          value={3}
          unit="건"
          caption="11월 10일 누리식품 외"
        />
      </div>
      <Card title="품목 × 창고" subtitle="EA · 안전재고 미만은 주의" padding="none">
        <table className="tl-sc-table">
          <thead>
            <tr>
              <th>품목</th>
              {WAREHOUSES.map((w) => (
                <th key={w} className="tl-sc-num">
                  {w}
                </th>
              ))}
              <th className="tl-sc-num">합계</th>
              <th>안전재고 대비</th>
            </tr>
          </thead>
          <tbody>
            {STOCK.map((s, i) => (
              <tr key={s.code}>
                <td>
                  <Lines primary={s.name} secondary={s.code} />
                </td>
                {s.qty.map((q, k) => (
                  <td key={k} className="tl-sc-num" data-zero={q === 0 || undefined}>
                    {q ? won(q) : '–'}
                  </td>
                ))}
                <td className="tl-sc-num">{won(totals[i]!)}</td>
                <td>
                  <span className="tl-sc-inline">
                    <DataBar value={totals[i]!} max={max} width={96} label={`${s.name} 합계`} />
                    {totals[i]! < s.safety ? (
                      <StatusDot size="sm" tone="warning">
                        {won(s.safety - totals[i]!)} 부족
                      </StatusDot>
                    ) : null}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Shell>
  );
}

const chatMessages = CHAT.map((m) => ({
  id: m.id,
  at: m.at,
  ...(m.author ? { author: m.author } : {}),
  ...(m.own ? { own: true } : {}),
  ...(m.kind ? { kind: m.kind } : {}),
  ...(m.text ? { text: m.text } : {}),
  ...(m.file ? { files: [m.file] } : {}),
  ...(m.unread !== undefined ? { unread: m.unread } : {}),
}));

export function ChatScreen() {
  return (
    <Shell active="messenger">
      <div className="tl-sc-chat">
        <div className="tl-sc-chat__list">
          <PageHeader title="메신저" />
          <ul className="tl-sc-rows">
            {CHAT_CHANNELS.map((c, i) => (
              <li key={c.name} className="tl-sc-row" data-selected={i === 0 || undefined}>
                <Lines primary={<strong>{c.name}</strong>} secondary={c.last} />
                <span className="tl-sc-chat__end">
                  <span className="tl-sc-meta">{c.time}</span>
                  {c.unread ? (
                    <Badge variant="solid" tone="neutral" size="sm">
                      {c.unread}
                    </Badge>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="tl-sc-chat__thread">
          <div className="tl-sc-chat__head">
            <strong>구매팀</strong>
            <span className="tl-sc-meta">5명</span>
          </div>
          <MessageThread
            messages={chatMessages}
            label="구매팀 메시지"
            today={TODAY.iso}
            height="fill"
          />
          <Composer label="구매팀에 메시지" onSend={noop} attachable />
        </div>
      </div>
    </Shell>
  );
}

export function ChatPhone() {
  return (
    <Phone title="구매팀" end={<span className="tl-sc-meta">5명</span>} tabs={false}>
      <div className="tl-sc-phone-chat">
        <MessageThread
          messages={chatMessages}
          label="구매팀 메시지"
          today={TODAY.iso}
          height="fill"
        />
        <Composer label="구매팀에 메시지" onSend={noop} />
      </div>
    </Phone>
  );
}

/* ── 에이전트 대화: 업무 도우미(platform/assistant/chat 구성) · 변경 제안 카드 ──── */
const agentItems: MessageThreadWebItem[] = [
  {
    id: 'q1',
    author: { id: 'me', name: `${USER.name} ${USER.title}` },
    own: true,
    at: AGENT.askedAt,
    text: AGENT.question,
  },
  {
    id: 'a1',
    kind: 'answer',
    author: { id: 'agent', name: AGENT.name },
    at: AGENT.askedAt,
    text: AGENT.answer,
    citations: AGENT.sources,
    // 제안을 만든 마지막 단계는 사람의 확인을 기다린다(블록과 같은 규칙)
    steps: (
      <RunSteps
        collapsible
        steps={AGENT.steps.map((step, i) => ({
          ...step,
          state: i === AGENT.steps.length - 1 ? ('waiting' as const) : ('succeeded' as const),
        }))}
      />
    ),
  },
];

export function AgentScreen() {
  const [current] = AGENT.conversations;
  return (
    <Shell active="assistant">
      <div className="tl-sc-chat" data-agent>
        <div className="tl-sc-chat__list">
          <PageHeader title={AGENT.name} />
          <SelectableList
            label="대화"
            items={AGENT.conversations.map((c) => ({ ...c, icon: 'bot' as const }))}
            selected={current!.id}
            onSelect={noop}
          />
        </div>
        <div className="tl-sc-chat__thread">
          <div className="tl-sc-chat__head">
            <strong>{current!.title}</strong>
            <span className="tl-sc-meta">질문 1개 · 확인 대기</span>
          </div>
          <MessageThread
            messages={agentItems}
            label={`${current!.title} 대화`}
            today={TODAY.iso}
            height="fill"
          />
          <Composer
            label={`${AGENT.name}에게 질문`}
            placeholder="문서 · 전표 · 재고를 묻습니다 · /로 범위"
            sendLabel="질문"
            attachable={false}
            suggestions={AGENT.suggestions}
            onSend={noop}
          />
        </div>
      </div>
    </Shell>
  );
}

export function ProposalPiece() {
  const p = AGENT.proposal;
  return (
    <ProposalCard
      title={p.title}
      summary={p.summary}
      changes={p.changes}
      status="waiting"
      approveLabel={p.approveLabel}
      headingLevel={4}
      onApprove={noop}
      onReject={noop}
    />
  );
}

/* ── 자리(data-sc) → 화면 ─────────────────────────────────── */
const SCREENS: Record<string, () => ReactNode> = {
  'role-home': () => <RoleHome />,
  people: () => <PeopleList />,
  'phone-home': () => <PhoneHome />,
  launcher: () => <Launcher />,
  approval: () => <ApprovalPiece />,
  payslip: () => <PayslipPiece />,
  calendar: () => <CalendarPiece />,
  attendance: () => <AttendancePiece />,
  cash: () => <CashPiece />,
  journal: () => <JournalScreen />,
  stock: () => <StockScreen />,
  chat: () => <ChatScreen />,
  'chat-phone': () => <ChatPhone />,
  agent: () => <AgentScreen />,
  proposal: () => <ProposalPiece />,
};
for (const [key, notice] of Object.entries(WALL_NOTICES))
  SCREENS[`notice-${key}`] = () => <NotificationCard {...notice} />;

/** 쇼케이스 자리 이름 목록(showcase.ts가 쓰는 data-sc 값) */
export const SHOWCASE_SCREENS = Object.keys(SCREENS);

const roots = new WeakMap<Element, Root>();
/** root 안의 [data-sc] 자리에 화면을 붙인다. 두 번 불러도 한 번만 붙는다 */
export function mountShowcase(root: ParentNode): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-sc]')) {
    if (roots.has(el)) continue;
    const render = SCREENS[el.dataset['sc']!];
    if (!render) throw new Error(`쇼케이스 자리 ${el.dataset['sc']}에 맞는 화면이 없다`);
    const r = createRoot(el);
    r.render(render());
    roots.set(el, r);
  }
}
