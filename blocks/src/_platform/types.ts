// 테라스원 플랫폼 기본 기능의 데이터 모양(docs/spec/platform.md). 화면 블록은 이 타입만 본다.
// 실제 백엔드(테라스원 플랫폼)는 PlatformAdapter를 구현하고, 데모는 mock.ts로 같은 모양을 채운다.
import type { CurrencyCode, JobState } from '@terracelab/trellis-contracts';

export type ModuleId = string;

/** 권한 동작. 화면 버튼은 이 여섯 가지로만 막는다 */
export const ACTIONS = ['read', 'create', 'update', 'delete', 'approve', 'export'] as const;
export type Action = (typeof ACTIONS)[number];
export const ACTION_LABELS: Record<Action, string> = {
  read: '조회',
  create: '등록',
  update: '수정',
  delete: '삭제',
  approve: '승인 · 발행',
  export: '다운로드',
};

/** 데이터 범위: 같은 권한이라도 어디까지 보이는지 */
export type DataScope = 'company' | 'division' | 'department' | 'self';
export const SCOPE_LABELS: Record<DataScope, string> = {
  company: '전사',
  division: '본부',
  department: '부서',
  self: '본인',
};

export interface Company {
  id: string;
  name: string;
  bizNo: string;
  ceo: string;
  address: string;
  /** 기능 통화와 거래 통화 */
  currency: CurrencyCode;
  tradeCurrencies: readonly CurrencyCode[];
  /** 켜진 모듈(맞춤 구축 범위) */
  modules: readonly ModuleId[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  scope: DataScope;
  /** 모듈별 허용 동작 */
  permissions: Readonly<Record<ModuleId, readonly Action[]>>;
}

export interface User {
  id: string;
  name: string;
  title: string;
  department: string;
  /** 본부. 범위가 division인 역할이 쓴다. 없으면 부서로 본다 */
  division?: string;
  email: string;
  roleIds: readonly string[];
  status: 'active' | 'invited' | 'locked';
  mfa: boolean;
  lastLoginAt?: string;
}

export interface Session {
  user: User;
  company: Company;
  roles: readonly Role[];
}

export type NotificationChannel = 'app' | 'email' | 'sms' | 'kakao';
export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  app: '앱',
  email: '메일',
  sms: '문자',
  kakao: '알림톡',
};

export interface NotificationEvent {
  id: string;
  module: ModuleId;
  /** 이벤트 종류(NotificationRule.event) */
  event: string;
  title: string;
  body?: string;
  createdAt: string;
  read: boolean;
  /** 지연 · 오류만 danger(D-35) */
  tone: 'neutral' | 'danger';
  count?: number;
  /**
   * 누르면 갈 화면. 블록 id 하나로 정한다(경로 · 주소를 넣지 않는다): 'groupware/approval/inbox'.
   * 화면 값이 있으면 같은 줄에 쿼리로 붙인다: 'groupware/approval/document?id=AP-2611-014'.
   * 블록 · 알림 서랍은 linkTarget(link)으로 나눠 screens.has · href · go에 넘긴다.
   * 앱 경로(/approval/doc)는 PlatformProvider screenHref가 만든다
   */
  link?: string;
}

/** 알림 link('블록 id?k=v')를 화면 id와 값으로 나눈다. screens.go(t.id, t.params) */
export function linkTarget(link: string): {
  id: string;
  params?: Readonly<Record<string, string>>;
} {
  const [id = '', query] = link.split('?');
  if (!query) return { id };
  return { id, params: Object.fromEntries(new URLSearchParams(query)) };
}

export interface NotificationRule {
  event: string;
  module: ModuleId;
  label: string;
  description: string;
  channels: Readonly<Record<NotificationChannel, boolean>>;
}

export interface JobLog {
  time: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface JobRun {
  id: string;
  jobId: string;
  state: JobState;
  startedAt: string;
  finishedAt?: string;
  durationSec?: number;
  processed?: number;
  failed?: number;
  trigger: 'schedule' | 'manual' | 'retry';
  log: readonly JobLog[];
}

export interface BatchJob {
  id: string;
  name: string;
  module: ModuleId;
  description: string;
  /** cron 식 */
  schedule: string;
  /** 사람이 읽는 주기(매일 18:00) */
  scheduleLabel: string;
  enabled: boolean;
  owner: string;
  nextRunAt?: string;
  runs: readonly JobRun[];
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  module: ModuleId;
  ip: string;
}

/**
 * 앱에 들어 있는 화면(블록 id). 블록은 복사해 고르는 것이라 앱마다 화면이 다르다.
 * 블록은 다른 화면으로 가는 링크 · 버튼을 그 화면이 있을 때만 그린다(PR-11)
 */
export interface ScreenLinks {
  /** 이 앱에 그 화면이 있는지 */
  has(id: string): boolean;
  /** 화면 주소. 기본은 해시 라우터(#/erp/tax/invoice-list?id=…) */
  href(id: string, params?: Readonly<Record<string, string>>): string;
  /** 그 화면으로 이동. 없는 화면이면 아무것도 하지 않는다 */
  go(id: string, params?: Readonly<Record<string, string>>): void;
}

/**
 * 지금 화면 주소 값(?id=…&tab=…, 경로 값). 블록은 useScreenParams()로 읽고 window.location을 보지 않는다.
 * 해시 라우터(데모)는 PlatformProvider가 해시에서 읽고, 브라우저 라우터는 앱이 ScreenParamsProvider로 넘긴다
 */
export type ScreenParams = Readonly<Record<string, string>>;

/**
 * 데이터 범위로 거를 대상(사람 · 사람에 딸린 기록). 있는 값만 본다.
 * 블록은 const { canSee } = useScope(); rows.filter((r) => canSee({ name: r.name, department: r.department }))
 */
export interface ScopeSubject {
  /** 그 사람의 로그인 계정 id. 있으면 본인 판정에 먼저 쓴다 */
  userId?: string;
  /** 사람 이름. userId가 없을 때 본인 판정(샘플 데이터는 사원과 계정을 이름으로 잇는다) */
  name?: string;
  /** 부서(팀) 이름. User.department와 같은 값 */
  department?: string;
  /** 본부. 둘 중 하나라도 없으면 부서로 비교한다 */
  division?: string;
}

const SCOPE_RANK: Record<DataScope, number> = { self: 0, department: 1, division: 2, company: 3 };

/** 역할이 여럿이면 가장 넓은 범위(권한 합집합과 같은 규칙). 역할이 없으면 본인 */
export function scopeOf(session: Session): DataScope {
  return session.roles.reduce<DataScope>(
    (wide, r) => (SCOPE_RANK[r.scope] > SCOPE_RANK[wide] ? r.scope : wide),
    'self',
  );
}

/** 범위가 그 단계 이상인지(대표 보기 = company 이상) */
export function scopeAtLeast(scope: DataScope, min: DataScope): boolean {
  return SCOPE_RANK[scope] >= SCOPE_RANK[min];
}

/** 이 사람(기록)이 로그인한 사람의 데이터 범위 안인지. 본인은 언제나 보인다 */
export function inScope(session: Session, subject: ScopeSubject): boolean {
  const u = session.user;
  const self = subject.userId ? subject.userId === u.id : !!subject.name && subject.name === u.name;
  if (self) return true;
  switch (scopeOf(session)) {
    case 'company':
      return true;
    case 'division':
      return subject.division && u.division
        ? subject.division === u.division
        : subject.department === u.department;
    case 'department':
      return subject.department === u.department;
    default:
      return false;
  }
}

/** 백엔드가 구현할 경계. 데모는 mock, 실제 서비스는 API 클라이언트 */
export interface PlatformAdapter {
  auth: {
    signIn(input: {
      companyCode: string;
      loginId: string;
      password: string;
    }): Promise<{ mfaRequired: boolean }>;
    verifyMfa(code: string): Promise<Session>;
    signOut(): Promise<void>;
  };
  permissions: {
    can(session: Session, module: ModuleId, action: Action): boolean;
  };
  notifications: {
    list(params: {
      unreadOnly?: boolean;
      module?: ModuleId;
    }): Promise<readonly NotificationEvent[]>;
    markRead(ids: readonly string[]): Promise<void>;
    rules(): Promise<readonly NotificationRule[]>;
    saveRules(rules: readonly NotificationRule[]): Promise<void>;
  };
  jobs: {
    list(): Promise<readonly BatchJob[]>;
    runNow(jobId: string): Promise<JobRun>;
    setEnabled(jobId: string, enabled: boolean): Promise<void>;
  };
  audit: {
    list(params: { from: string; to: string; actor?: string }): Promise<readonly AuditEntry[]>;
  };
  /** 앱의 화면 목록. 백엔드가 아니라 앱이 채운다(PlatformProvider screens) */
  screens?: Pick<ScreenLinks, 'has'>;
}

/** 권한 계산: 역할 여럿이면 합집합 */
export function can(session: Session, module: ModuleId, action: Action): boolean {
  return session.roles.some(
    (r) => r.permissions[module]?.includes(action) || r.permissions['*']?.includes(action),
  );
}
