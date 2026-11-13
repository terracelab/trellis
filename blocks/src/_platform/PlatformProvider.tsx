// 플랫폼 문맥: 지금 사용자 · 역할 · 권한 계산 · 데이터 범위 · 알림 읽음 · 앱의 화면 목록 · 지금 화면 주소 값.
// 데모는 샘플, 실제 서비스는 session · notifications · screens · params props로 채운다.
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { COMPANY, NOTIFICATIONS, ROLES, USERS } from './mock.js';
import {
  can as canFor,
  inScope,
  linkTarget,
  SCOPE_LABELS,
  scopeOf,
  type Action,
  type DataScope,
  type ModuleId,
  type NotificationEvent,
  type ScopeSubject,
  type ScreenLinks,
  type ScreenParams,
  type Session,
} from './types.js';

interface PlatformValue {
  session: Session;
  /** 데모: 역할 바꿔 보기(권한 시연) */
  setRole: (roleId: string) => void;
  can: (module: ModuleId, action: Action) => boolean;
  notifications: readonly NotificationEvent[];
  markRead: (ids: readonly string[]) => void;
  screens: ScreenLinks;
}

const Ctx = createContext<PlatformValue | null>(null);

type Params = Readonly<Record<string, string>>;
/** 앱이 넘기는 화면 값: 객체(useParams처럼 값이 빈 칸이 있어도 된다) 또는 URLSearchParams */
type ParamsInput = Readonly<Record<string, string | undefined>> | URLSearchParams;
/** 지금 화면 주소 값. ScreenParamsProvider(또는 PlatformProvider params)가 없으면 null = 해시에서 읽는다 */
const ParamsCtx = createContext<ScreenParams | null>(null);

const subscribeHash = (on: () => void) => {
  window.addEventListener('hashchange', on);
  return () => window.removeEventListener('hashchange', on);
};
const hashQuery = () => window.location.hash.split('?')[1] ?? '';
const toParams = (q: string): ScreenParams => Object.fromEntries(new URLSearchParams(q));
/** 받은 값을 정렬한 쿼리 글자로. 앱이 렌더마다 새 객체를 넘겨도 블록이 다시 그려지지 않게 한다 */
const keyOf = (p: ParamsInput) => {
  const q = new URLSearchParams(
    p instanceof URLSearchParams
      ? p
      : Object.entries(p).filter((e): e is [string, string] => typeof e[1] === 'string'),
  );
  q.sort();
  return q.toString();
};

/**
 * 지금 화면 주소 값을 블록에 넘긴다. 라우터가 PlatformProvider 안에 있으면(브라우저 라우터의 흔한 배치)
 * 레이아웃 경로에서 이것으로 감싼다:
 *   const [search] = useSearchParams(); <ScreenParamsProvider params={search}><Outlet /></ScreenParamsProvider>
 * 경로 값(/people/:id)도 같이 넘길 수 있다: params={{ ...Object.fromEntries(search), ...useParams() }}
 */
export function ScreenParamsProvider({
  params,
  children,
}: {
  params: ParamsInput;
  children: ReactNode;
}) {
  const key = keyOf(params);
  const value = useMemo(() => toParams(key), [key]);
  return <ParamsCtx.Provider value={value}>{children}</ParamsCtx.Provider>;
}

/** 역할별 데모 사용자(김테라 팀장이 관리자 겸 경영지원) */
const PERSONA: Record<string, string> = {
  admin: 'u02',
  finance: 'u03',
  purchase: 'u04',
  logistics: 'u05',
  auditor: 'u06',
};

const query = (params?: Params) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return q ? `?${q}` : '';
};
/** 기본 주소: 해시 라우터. 정적 호스팅에서 새로 고쳐도 같은 화면이 열린다 */
const hashHref = (id: string, params?: Params) => `#/${id}${query(params)}`;

/**
 * 데모는 props 없이 샘플 회사 · 사용자로 돈다.
 * 실제 서비스는 로그인 뒤 받은 session과 알림을 넘긴다(PlatformAdapter가 돌려준 값).
 */
export function PlatformProvider({
  children,
  initialRole = 'admin',
  session: given,
  notifications: givenNotifications,
  onMarkRead,
  screens,
  screenHref = hashHref,
  navigate,
  params,
}: {
  children: ReactNode;
  initialRole?: string;
  /** 서비스: 로그인한 사용자 · 회사 · 역할. 없으면 샘플 */
  session?: Session;
  /** 서비스: 알림 목록. 없으면 session이 없을 때만 샘플 */
  notifications?: readonly NotificationEvent[];
  /** 서비스: 읽음 처리를 서버에 보낸다 */
  onMarkRead?: (ids: readonly string[]) => void;
  /**
   * 앱에 들어 있는 화면(블록 id 목록 또는 판정 함수). 블록은 여기 없는 화면으로 링크하지 않는다.
   * 없으면 모든 화면이 있다고 본다(예전 동작)
   */
  screens?: readonly string[] | ((id: string) => boolean);
  /** 화면 주소 만들기. 기본은 해시(#/id?k=v). 앱 라우터를 쓰면 바꾼다 */
  screenHref?: (id: string, params?: Params) => string;
  /** 화면 이동. 기본은 screenHref 주소로 해시를 바꾼다 */
  navigate?: (id: string, params?: Params) => void;
  /**
   * 지금 화면 주소 값(블록의 useScreenParams). 없으면 해시(#/id?k=v)에서 읽는다(데모).
   * 브라우저 라우터가 이 Provider 안에 있으면 여기 대신 레이아웃 경로에서 ScreenParamsProvider로 넘긴다
   */
  params?: ParamsInput;
}) {
  const [roleId, setRole] = useState(initialRole);
  const [readIds, setReadIds] = useState<readonly string[]>([]);
  const links = useMemo<ScreenLinks>(() => {
    const has =
      screens === undefined
        ? () => true
        : typeof screens === 'function'
          ? screens
          : (id: string) => screens.includes(id);
    return {
      has,
      href: screenHref,
      go: (id, params) => {
        if (!has(id)) return;
        if (navigate) navigate(id, params);
        else window.location.hash = screenHref(id, params).replace(/^#/, '');
      },
    };
  }, [screens, screenHref, navigate]);
  const value = useMemo<PlatformValue>(() => {
    let session: Session;
    if (given) {
      // 역할이 여럿이면 setRole로 그 안에서 고른다(전부 합친 권한이 기본)
      const picked = given.roles.find((r) => r.id === roleId);
      session = picked ? { ...given, roles: [picked] } : given;
    } else {
      const role = ROLES.find((r) => r.id === roleId) ?? ROLES[0]!;
      const user = USERS.find((u) => u.id === PERSONA[role.id]) ?? USERS[1]!;
      session = { user, company: COMPANY, roles: [role] };
    }
    const source = givenNotifications ?? (given ? [] : NOTIFICATIONS);
    return {
      session,
      setRole,
      can: (module, action) => canFor(session, module, action),
      notifications: source.map((n) => (readIds.includes(n.id) ? { ...n, read: true } : n)),
      markRead: (ids) => {
        setReadIds((prev) => [...new Set([...prev, ...ids])]);
        onMarkRead?.(ids);
      },
      screens: links,
    };
  }, [roleId, readIds, given, givenNotifications, onMarkRead, links]);
  return (
    <Ctx.Provider value={value}>
      {params ? <ScreenParamsProvider params={params}>{children}</ScreenParamsProvider> : children}
    </Ctx.Provider>
  );
}

export function usePlatform(): PlatformValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePlatform: PlatformProvider 안에서 쓴다');
  return v;
}

/** 버튼을 권한으로 막을 때: const canIssue = useCan('tax', 'approve') */
export function useCan(module: ModuleId, action: Action): boolean {
  return usePlatform().can(module, action);
}

/**
 * 다른 화면으로 가는 링크: const screens = useScreens()
 * {screens.has('erp/purchasing/po-form') && <Button onPress={() => screens.go('erp/purchasing/po-form')}>…}
 */
export function useScreens(): ScreenLinks {
  return usePlatform().screens;
}

/** 그 화면이 앱에 있는지(블록 id) */
export function useScreenExists(id: string): boolean {
  return usePlatform().screens.has(id);
}

/**
 * 알림 link('블록 id' 또는 '블록 id?k=v', NotificationEvent.link)를 누르는 함수로.
 * 앱에 그 화면이 없거나 link가 없으면 undefined라 누를 수 없는 카드가 된다:
 *   const openLink = useOpenLink(); <NotificationCard onPress={openLink(n.link)} />
 */
export function useOpenLink(): (link?: string) => (() => void) | undefined {
  const screens = usePlatform().screens;
  return (link) => {
    if (!link) return undefined;
    const t = linkTarget(link);
    return screens.has(t.id) ? () => screens.go(t.id, t.params) : undefined;
  };
}

/**
 * 지금 화면 주소 값: const { id, tab } = useScreenParams()
 * 블록은 window.location을 읽지 않는다. 값이 바뀌면(알림 링크 · 뒤로) 다시 그린다.
 * 앱이 ScreenParamsProvider · PlatformProvider params로 넘긴 값, 없으면 해시(#/id?k=v)의 쿼리
 */
export function useScreenParams(): ScreenParams {
  const given = useContext(ParamsCtx);
  const q = useSyncExternalStore(subscribeHash, hashQuery, () => '');
  const fromHash = useMemo(() => toParams(q), [q]);
  return given ?? fromHash;
}

/**
 * 데이터 범위(Role.scope): const { scope, canSee } = useScope()
 * 전사 = 모두, 본부 · 부서 = 같은 본부 · 부서, 본인 = 자기만. 역할이 여럿이면 가장 넓은 범위.
 * 목록은 canSee로 거르고, 범위 밖 사람으로 가는 링크는 그리지 않는다. 서버가 같은 판정을 다시 한다
 */
export function useScope(): {
  scope: DataScope;
  /** 전사 · 본부 · 부서 · 본인 */
  label: string;
  canSee: (subject: ScopeSubject) => boolean;
} {
  const { session } = usePlatform();
  return useMemo(() => {
    const scope = scopeOf(session);
    return {
      scope,
      label: SCOPE_LABELS[scope],
      canSee: (subject) => inScope(session, subject),
    };
  }, [session]);
}
