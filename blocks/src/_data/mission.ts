// 임무 샘플(블록 groupware/mission/list, R-03). 임무는 기한이 있는 개인 할 일이다. 법정 · 정기 기한은 규칙이,
// 수시 임무는 사람이나 에이전트가 만든다. 완료 조건은 증빙 첨부 또는 시스템 확인(관련 화면에서 일을 마치면 완료).
// 숫자 기준(관리자 데모 사용자): 당일 기한 4건(완료 1) · 이번 주 9건 · 기한 지남 1건 · 연속 12일 · 전월 48건 중 46건 정시.
// - 당일 · 연속 일수 · 정시 완수율은 "내" 임무로 센다(개인 기록). 목록은 데이터 범위(본인 · 부서 · 전사)로 거른다
// - 연속 일수와 달력은 STREAK_HISTORY(지난 달들의 요약)와 MISSIONS(이번 주부터)를 날짜별로 합쳐 계산한다
// - 보류한 임무는 그날 건수에서 빠진다(연속을 끊지 않는다). 휴일 · 주말은 건너뛴다
// 날짜는 TODAY에서 계산한다. 다른 회사 데이터로 바꿔 끼우면 사람 id(EMPLOYEES)와 화면 id만 맞추면 된다.
import { addDays, monthStart, weekStart } from '../_ui/dates.js';
import { TODAY } from './trade.js';

export interface MissionFile {
  name: string;
  size: number;
}

export interface MissionLogEntry {
  /** MM-DD HH:MM */
  time: string;
  title: string;
  actor: string;
}

export interface Mission {
  id: string;
  title: string;
  /** 법정 · 정기 · 수시 */
  kind: 'legal' | 'regular' | 'adhoc';
  /** modules.json 모듈 id */
  module: string;
  /** 담당(EMPLOYEES id) */
  ownerId: string;
  due: string;
  status: 'pending' | 'doing' | 'done' | 'blocked';
  /** ISO 시각. 날짜가 due 안이면 정시 완수 */
  doneAt?: string;
  condition: 'evidence' | 'system';
  evidence?: readonly MissionFile[];
  /** 관련 화면(블록 id, ?k=v 붙일 수 있다) */
  link?: string;
  source: 'rule' | 'agent' | 'person';
  /** 만든 에이전트(AGENT_NAMES 키) */
  agentId?: string;
  blockedReason?: string;
  /** 하위 단계 */
  steps?: readonly { id: string; title: string; done: boolean }[];
  /** 이력(최근 것이 앞) */
  log?: readonly MissionLogEntry[];
}

export interface StreakDay {
  date: string;
  onTime: number;
  total: number;
}

export type MissionKind = Mission['kind'];
export type MissionStatus = Mission['status'];
export type MissionCondition = Mission['condition'];

export const KIND_LABELS: Record<MissionKind, string> = {
  legal: '법정',
  regular: '정기',
  adhoc: '수시',
};
export const STATUS_LABELS: Record<MissionStatus, string> = {
  pending: '대기',
  doing: '진행',
  done: '완료',
  blocked: '보류',
};
export const CONDITION_LABELS: Record<MissionCondition, string> = {
  evidence: '증빙 첨부',
  system: '시스템 확인',
};
export const SOURCE_LABELS: Record<Mission['source'], string> = {
  rule: '기한 규칙',
  agent: '에이전트',
  person: '사람',
};

/** 임무를 만드는 에이전트 이름 */
export const AGENT_NAMES: Record<string, string> = {
  tax: '세무 담당',
  accounting: '회계 담당',
  labor: '노무 담당',
  logistics: '물류 담당',
};

/** 임무를 등록할 때 고르는 관련 화면. 앱에 없는 화면은 블록이 뺀다 */
export const MISSION_SCREENS: readonly { id: string; title: string; module: string }[] = [
  { id: 'erp/accounting/journal', title: '전표', module: 'accounting' },
  { id: 'erp/accounting/trial-balance', title: '시산표', module: 'accounting' },
  { id: 'erp/tax/vat-return', title: '부가세 신고', module: 'tax' },
  { id: 'erp/tax/withholding', title: '원천세 신고', module: 'tax' },
  { id: 'erp/treasury/daily-cash', title: '자금 일보', module: 'treasury' },
  { id: 'erp/hr-payroll/payroll', title: '급여', module: 'hr-payroll' },
  { id: 'groupware/approval/draft', title: '기안 작성', module: 'approval' },
  { id: 'groupware/attendance/team', title: '팀 근태', module: 'attendance' },
  { id: 'scm/trade/shipments', title: '수입 선적', module: 'trade' },
  { id: 'scm/warehouse/receiving', title: '입고', module: 'warehouse' },
  { id: 'platform/import/excel', title: '자료 올리기', module: 'platform' },
];

/* ── 날짜 ─────────────────────────────────────────────── */

/** 샘플 공휴일. 연속 일수 · 영업일 계산이 건너뛴다 */
export const HOLIDAYS: readonly string[] = [
  '2026-08-17',
  '2026-09-24',
  '2026-09-25',
  '2026-10-05',
  '2026-10-09',
  '2026-12-25',
  '2027-01-01',
];
const weekday = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();
export const isBusinessDay = (date: string) =>
  weekday(date) !== 0 && weekday(date) !== 6 && !HOLIDAYS.includes(date);
/** 기한이 토 · 일 · 공휴일이면 다음 영업일 */
export function businessDay(date: string): string {
  let d = date;
  while (!isBusinessDay(d)) d = addDays(d, 1);
  return d;
}

const T = TODAY;
const at = (date: string, hhmm: string) => `${date}T${hhmm}:00+09:00`;
const WEEK0 = weekStart(T);
/** 전월에 연속이 끊긴 날(기한 지난 임무 m10의 기한)과 늦게 끝낸 날 */
const BROKE = addDays(monthStart(T, -1), 19);
const LATE = addDays(monthStart(T, -1), 12);
const file = (name: string, size = 184_320): MissionFile => ({ name, size });

/* ── 임무 31건(법정 9 · 정기 11 · 수시 11) ───────────────── */

type Seed = Omit<Mission, 'status'> & { status?: MissionStatus };
const m = (x: Seed): Mission => ({ status: 'pending', ...x });
const done = (due: string, hhmm: string, name: string) => ({
  status: 'done' as const,
  doneAt: at(due, hhmm),
  evidence: [file(name)],
});

export const MISSIONS: readonly Mission[] = [
  // 경영지원팀장 · 이번 주(월~목, 모두 정시 완수)
  m({
    id: 'm01',
    title: '전월 법인카드 사용내역 확인',
    kind: 'regular',
    module: 'expense',
    ownerId: 'u02',
    due: WEEK0,
    condition: 'evidence',
    source: 'rule',
    ...done(WEEK0, '17:20', '법인카드 사용내역 확인.pdf'),
  }),
  m({
    id: 'm02',
    title: '거래처 공급 계약서 원본 보관',
    kind: 'adhoc',
    module: 'contract',
    ownerId: 'u02',
    due: addDays(WEEK0, 1),
    condition: 'evidence',
    source: 'person',
    ...done(addDays(WEEK0, 1), '15:05', '공급계약서_스캔.pdf'),
  }),
  m({
    id: 'm14',
    title: '법인 등기부등본 발급',
    kind: 'adhoc',
    module: 'contract',
    ownerId: 'u02',
    due: addDays(WEEK0, 1),
    condition: 'evidence',
    source: 'person',
    status: 'blocked',
    blockedReason: '인터넷등기소 점검으로 발급이 멈췄습니다(다음 주 재개)',
  }),
  m({
    id: 'm03',
    title: '자금 일보 확인',
    kind: 'regular',
    module: 'treasury',
    ownerId: 'u02',
    due: addDays(WEEK0, 2),
    condition: 'system',
    link: 'erp/treasury/daily-cash',
    source: 'rule',
    status: 'done',
    doneAt: at(addDays(WEEK0, 2), '09:12'),
  }),
  m({
    id: 'm04',
    title: '쓰지 않는 구독 2개 해지 검토',
    kind: 'adhoc',
    module: 'subscription',
    ownerId: 'u02',
    due: addDays(WEEK0, 3),
    condition: 'evidence',
    source: 'agent',
    agentId: 'accounting',
    ...done(addDays(WEEK0, 3), '11:40', '구독 해지 확인.png'),
  }),
  m({
    id: 'm05',
    title: '전월 경비 최종 승인',
    kind: 'regular',
    module: 'expense',
    ownerId: 'u02',
    due: addDays(WEEK0, 3),
    condition: 'system',
    source: 'rule',
    status: 'done',
    doneAt: at(addDays(WEEK0, 3), '16:30'),
  }),
  // 경영지원팀장 · 당일 4건(1건 완료)
  m({
    id: 'm06',
    title: '원천세 신고 전 급여 대장 확인',
    kind: 'legal',
    module: 'hr-payroll',
    ownerId: 'u02',
    due: T,
    condition: 'evidence',
    link: 'erp/hr-payroll/payroll',
    source: 'rule',
    agentId: 'tax',
    steps: [
      { id: 's1', title: '급여 지급액 확인', done: true },
      { id: 's2', title: '원천징수액 확인', done: false },
    ],
  }),
  m({
    id: 'm07',
    title: '전월 마감 점검 3건 처리',
    kind: 'regular',
    module: 'accounting',
    ownerId: 'u02',
    due: T,
    condition: 'system',
    link: 'erp/accounting/trial-balance',
    source: 'rule',
    status: 'doing',
  }),
  m({
    id: 'm08',
    title: '분류하지 않은 거래 검토',
    kind: 'adhoc',
    module: 'accounting',
    ownerId: 'u02',
    due: T,
    condition: 'system',
    link: 'erp/accounting/journal',
    source: 'agent',
    agentId: 'accounting',
  }),
  m({
    id: 'm09',
    title: '거래처 대금 지급 일정 공유',
    kind: 'adhoc',
    module: 'treasury',
    ownerId: 'u02',
    due: T,
    condition: 'evidence',
    source: 'person',
    ...done(T, '09:20', '대금 지급 일정표.xlsx'),
  }),
  // 경영지원팀장 · 기한 지남 1건(전월)
  m({
    id: 'm10',
    title: '법인카드 증빙 2건 보완',
    kind: 'adhoc',
    module: 'expense',
    ownerId: 'u02',
    due: BROKE,
    condition: 'evidence',
    source: 'agent',
    agentId: 'accounting',
  }),
  // 경영지원팀장 · 앞으로
  m({
    id: 'm11',
    title: '원천세 신고 · 납부',
    kind: 'legal',
    module: 'tax',
    ownerId: 'u02',
    due: businessDay(addDays(T, 4)),
    condition: 'evidence',
    link: 'erp/tax/withholding',
    source: 'rule',
    agentId: 'tax',
  }),
  m({
    id: 'm12',
    title: '당월 급여 확정',
    kind: 'regular',
    module: 'hr-payroll',
    ownerId: 'u02',
    due: businessDay(addDays(T, 19)),
    condition: 'system',
    link: 'erp/hr-payroll/payroll',
    source: 'rule',
  }),
  m({
    id: 'm13',
    title: '간이지급명세서 제출(사업소득)',
    kind: 'legal',
    module: 'tax',
    ownerId: 'u02',
    due: businessDay(addDays(T, 24)),
    condition: 'evidence',
    link: 'erp/tax/withholding',
    source: 'rule',
    agentId: 'tax',
  }),
  m({
    id: 'm15',
    title: '자금 주간 점검',
    kind: 'regular',
    module: 'treasury',
    ownerId: 'u02',
    due: addDays(T, 7),
    condition: 'system',
    link: 'erp/treasury/daily-cash',
    source: 'rule',
  }),
  // 경영지원팀(회계 · 세무)
  m({
    id: 'm16',
    title: '원천세 신고서 작성',
    kind: 'legal',
    module: 'tax',
    ownerId: 'u03',
    due: businessDay(addDays(T, 3)),
    condition: 'evidence',
    link: 'erp/tax/withholding',
    source: 'rule',
    agentId: 'tax',
  }),
  m({
    id: 'm17',
    title: '전월 구독 증빙 올리기',
    kind: 'regular',
    module: 'accounting',
    ownerId: 'u03',
    due: T,
    condition: 'system',
    link: 'platform/import/excel',
    source: 'agent',
    agentId: 'accounting',
  }),
  m({
    id: 'm18',
    title: '증빙 누락 6건 요청',
    kind: 'adhoc',
    module: 'accounting',
    ownerId: 'u03',
    due: addDays(T, -2),
    condition: 'evidence',
    source: 'agent',
    agentId: 'accounting',
    status: 'done',
    doneAt: at(addDays(T, -1), '10:15'),
    evidence: [file('증빙 요청 메일.pdf', 42_000)],
  }),
  m({
    id: 'm19',
    title: '4대보험 보험료 납부',
    kind: 'legal',
    module: 'hr-payroll',
    ownerId: 'e06',
    due: businessDay(addDays(T, 4)),
    condition: 'evidence',
    source: 'rule',
  }),
  m({
    id: 'm20',
    title: '지방소득세(특별징수) 신고 · 납부',
    kind: 'legal',
    module: 'tax',
    ownerId: 'u03',
    due: businessDay(addDays(T, 4)),
    condition: 'evidence',
    link: 'erp/tax/withholding',
    source: 'rule',
    agentId: 'tax',
  }),
  m({
    id: 'm21',
    title: '다음 달 원천세 신고 · 납부',
    kind: 'legal',
    module: 'tax',
    ownerId: 'u03',
    due: businessDay(addDays(T, 34)),
    condition: 'evidence',
    link: 'erp/tax/withholding',
    source: 'rule',
    agentId: 'tax',
  }),
  m({
    id: 'm29',
    title: '구독 갱신 2건 확인',
    kind: 'regular',
    module: 'subscription',
    ownerId: 'e05',
    due: businessDay(addDays(T, 5)),
    condition: 'system',
    source: 'rule',
  }),
  m({
    id: 'm30',
    title: '연차 사용 촉진 통지(1명)',
    kind: 'legal',
    module: 'hr-payroll',
    ownerId: 'e06',
    due: businessDay(addDays(T, 18)),
    condition: 'evidence',
    source: 'rule',
    agentId: 'labor',
  }),
  // 구매팀(팀장 · 구성원)
  m({
    id: 'm22',
    title: '팀 주간 근태 확인',
    kind: 'regular',
    module: 'attendance',
    ownerId: 'e08',
    due: T,
    condition: 'system',
    link: 'groupware/attendance/team',
    source: 'rule',
  }),
  m({
    id: 'm23',
    title: '팀 주간 업무 보고',
    kind: 'regular',
    module: 'approval',
    ownerId: 'e08',
    due: businessDay(addDays(T, 3)),
    condition: 'evidence',
    link: 'groupware/approval/draft',
    source: 'rule',
  }),
  m({
    id: 'm24',
    title: '전월 팀 경비 승인',
    kind: 'regular',
    module: 'expense',
    ownerId: 'e08',
    due: addDays(T, -2),
    condition: 'system',
    source: 'rule',
    status: 'done',
    doneAt: at(addDays(T, -2), '14:00'),
  }),
  m({
    id: 'm25',
    title: '수입 통관 비용 증빙 첨부',
    kind: 'adhoc',
    module: 'expense',
    ownerId: 'u04',
    due: T,
    condition: 'evidence',
    source: 'agent',
    agentId: 'accounting',
  }),
  m({
    id: 'm26',
    title: '다음 달 수입 일정표 제출',
    kind: 'regular',
    module: 'trade',
    ownerId: 'u04',
    due: businessDay(addDays(T, 4)),
    condition: 'evidence',
    link: 'scm/trade/shipments',
    source: 'rule',
  }),
  m({
    id: 'm27',
    title: '새 노트북 수령 확인',
    kind: 'adhoc',
    module: 'asset',
    ownerId: 'u04',
    due: addDays(T, -3),
    condition: 'evidence',
    source: 'person',
    ...done(addDays(T, -3), '13:30', '노트북 수령증.jpg'),
  }),
  // 물류팀 · 영업팀
  m({
    id: 'm28',
    title: '입고 검수 대기 3건 확인',
    kind: 'adhoc',
    module: 'warehouse',
    ownerId: 'u05',
    due: T,
    condition: 'system',
    link: 'scm/warehouse/receiving',
    source: 'agent',
    agentId: 'logistics',
  }),
  m({
    id: 'm31',
    title: '거래처 계약 갱신 서류 회수',
    kind: 'adhoc',
    module: 'contract',
    ownerId: 'u06',
    due: businessDay(addDays(T, 2)),
    condition: 'evidence',
    source: 'person',
  }),
];

/* ── 연속 일수 기록(지난 달 요약) ─────────────────────────── */

/**
 * 이번 주 전까지의 날짜별 요약. 경영지원팀장은 전월 20일이 끊긴 날(기한 지난 임무 m10이 그날 몫)이고 다음 날부터 정시다.
 * 전월: 근무일 × 2~3건 = 47건(13일 1건 늦음) + m10 = 48건 중 46건 정시
 */
function historyFor(userId: string): StreakDay[] {
  const out: StreakDay[] = [];
  const last = monthStart(T, -1).slice(0, 7);
  let i = 0;
  for (let d = addDays(T, -95); d < WEEK0; d = addDays(d, 1)) {
    if (!isBusinessDay(d)) continue;
    const inLast = d.startsWith(last);
    const lastIndex = inLast ? out.filter((x) => x.date.startsWith(last)).length : -1;
    let total: number;
    let onTime: number;
    if (userId === 'u02') {
      total = inLast ? (lastIndex % 3 === 0 ? 3 : 2) : 2 + (i % 2);
      onTime = total;
      if (d === LATE) onTime = total - 1;
      if (!inLast && i % 9 === 4) onTime = total - 1;
      if (d === BROKE) {
        total = 2;
        onTime = 2;
      }
    } else {
      total = 1 + ((i + userId.length) % 2);
      onTime = (i + userId.charCodeAt(userId.length - 1)) % 7 === 3 ? total - 1 : total;
    }
    out.push({ date: d, onTime, total });
    i += 1;
  }
  return out;
}

export const STREAK_HISTORY: Readonly<Record<string, readonly StreakDay[]>> = Object.fromEntries(
  [...new Set(MISSIONS.map((x) => x.ownerId))].map((u) => [u, historyFor(u)]),
);

/* ── 계산(순수 함수) ──────────────────────────────────── */

export const isOnTime = (x: Mission) =>
  x.status === 'done' && !!x.doneAt && x.doneAt.slice(0, 10) <= x.due;
export const isOverdue = (x: Mission, today = T) =>
  x.status !== 'done' && x.status !== 'blocked' && x.due < today;
export const mine = (all: readonly Mission[], userId: string) =>
  all.filter((x) => x.ownerId === userId);

export type MissionTab = 'today' | 'week' | 'overdue' | 'blocked' | 'done';
export const TAB_LABELS: Record<MissionTab, string> = {
  today: '당일',
  week: '이번 주',
  overdue: '기한 지남',
  blocked: '보류',
  done: '완료',
};

export function inTab(x: Mission, tab: MissionTab, today = T): boolean {
  switch (tab) {
    case 'today':
      return x.due === today && x.status !== 'blocked';
    case 'week':
      return (
        x.due >= weekStart(today) && x.due <= addDays(weekStart(today), 6) && x.status !== 'blocked'
      );
    case 'overdue':
      return isOverdue(x, today);
    case 'blocked':
      return x.status === 'blocked';
    case 'done':
      return x.status === 'done';
  }
}

/** 당일 기한(보류 빼고)과 그중 완료 */
export function todayOf(all: readonly Mission[], userId: string, today = T) {
  const list = mine(all, userId).filter((x) => inTab(x, 'today', today));
  return { list, total: list.length, done: list.filter((x) => x.status === 'done').length };
}

/** 날짜별 정시 완수 = 지난 요약 + 이번 주부터의 임무(보류는 빼고) */
export function streakDays(all: readonly Mission[], userId: string, today = T): StreakDay[] {
  const map = new Map<string, StreakDay>();
  for (const d of STREAK_HISTORY[userId] ?? []) map.set(d.date, { ...d });
  for (const x of mine(all, userId)) {
    if (x.status === 'blocked' || x.due > today) continue;
    const cur = map.get(x.due) ?? { date: x.due, onTime: 0, total: 0 };
    map.set(x.due, {
      ...cur,
      total: cur.total + 1,
      onTime: cur.onTime + (isOnTime(x) ? 1 : 0),
    });
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 연속 일수: 어제부터 거꾸로, 그날 기한인 임무를 모두 정시에 끝낸 근무일을 센다.
 * 오늘은 다 끝냈을 때만 더한다. 건수가 0인 날 · 휴일은 건너뛴다
 */
export function streakCount(days: readonly StreakDay[], today = T): number {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const t = byDate.get(today);
  let n = t && t.total > 0 && t.onTime === t.total ? 1 : 0;
  const first = days[0]?.date ?? today;
  for (let d = addDays(today, -1); d >= first; d = addDays(d, -1)) {
    const day = byDate.get(d);
    if (!isBusinessDay(d) || !day || day.total === 0) continue;
    if (day.onTime !== day.total) break;
    n += 1;
  }
  return n;
}

/** 한 달의 정시 완수(monthOffset 0 = 당월, -1 = 전월). 당월은 기한이 오늘까지인 것만 */
export function monthRate(days: readonly StreakDay[], monthOffset = 0, today = T) {
  const from = monthStart(today, monthOffset);
  const to = monthOffset === 0 ? today : addDays(monthStart(today, monthOffset + 1), -1);
  // 오늘 아직 끝내지 않은 임무는 늦은 것이 아니라서 세지 않는다
  const ds = days
    .filter((d) => d.date >= from && d.date <= to)
    .map((d) => (d.date === today ? { ...d, total: d.onTime } : d));
  const total = ds.reduce((a, d) => a + d.total, 0);
  const onTime = ds.reduce((a, d) => a + d.onTime, 0);
  return { total, onTime, rate: total ? Math.round((onTime / total) * 100) : 0 };
}

/** 완료할 수 없으면 그 이유. 증빙 조건은 파일이 하나 이상이어야 하고, 시스템 확인은 화면이 스스로 완료한다 */
export function completeBlock(x: Mission): string | null {
  if (x.status === 'done') return '이미 완료했습니다';
  if (x.status === 'blocked') return '보류를 풀어야 완료할 수 있습니다';
  if (x.condition === 'system') return '관련 화면에서 일을 마치면 저절로 완료됩니다';
  if (!x.evidence?.length) return '증빙을 첨부하면 완료할 수 있습니다';
  return null;
}

/** 임무 완료 시각(ISO). 블록이 완료할 때 쓴다 */
export const missionAt = at;
