import {
  AppShellContract,
  formatCount,
  type AppShellAsideProps,
  type AppShellProps,
} from '@terracelab/trellis-contracts';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { useBottomInset } from '../_internal/bottom-inset.js';
import { BREAKPOINTS, useBreakpoint } from '../_internal/breakpoint.js';
import { cx } from '../_internal/cx.js';
import { Sheet } from '../_internal/sheet.js';
import { Avatar } from '../Avatar/Avatar.js';
import { Icon } from '../Icon/Icon.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Menu } from '../Menu/Menu.js';
import { useMessages } from '../_internal/locale.js';
import { ShellSidebarCollapsedContext } from '../_internal/shell-context.js';

export type AppShellWebProps = Omit<
  AppShellProps,
  | 'brand'
  | 'scope'
  | 'sidebar'
  | 'search'
  | 'actions'
  | 'user'
  | 'children'
  | 'aside'
  | 'asideActions'
  | 'brandCollapsed'
> & {
  brand: ReactNode;
  brandCollapsed?: ReactNode;
  scope?: ReactNode;
  sidebar?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  user?: ReactNode;
  aside?: ReactNode;
  asideActions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export type AppShellAsideWebProps = Omit<AppShellAsideProps, 'actions' | 'children'> & {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/* 옆 칸 폭(R-41). 토큰 단계로만: 최소 space.40 × 8(320) · 기본 × 10(400) · 최대 × 18(720), 본문 열 최소 × 14(560).
   화살표 한 번에 space.16. 사이드바 저절로 접힘 기준은 본문이 layout.desktop.minWidth(1024)보다 좁아질 때.
   값은 틀 요소의 CSS 변수(tokens.css)에서 읽는다. 토큰 CSS가 없는 환경(jsdom · 서버)은 기본 토큰 값으로 본다 */
function shellUnits(el: Element | null) {
  const style = el && typeof getComputedStyle === 'function' ? getComputedStyle(el) : null;
  const read = (name: string, fallback: number) =>
    Number.parseFloat(style?.getPropertyValue(name) ?? '') || fallback;
  const space40 = read('--tl-space-40', 40);
  return {
    min: space40 * 8,
    initial: space40 * 10,
    max: space40 * 18,
    mainMin: space40 * 14,
    step: read('--tl-space-16', 16),
    sidebar: read('--tl-layout-sidebar-width', 240),
    desktop: read('--tl-layout-desktop-min-width', 1024),
  };
}

/** 옆 칸 폭 손잡이가 쓰는 것 */
interface AsideResize {
  /** 지금 폭(끄는 중이면 끄는 폭). 정하지 않았으면 undefined(기본 폭) */
  width: number | undefined;
  /** 기본 폭(두 번 누르기 · Enter) */
  initial: number;
  /** 화살표 한 번에 바뀌는 폭 */
  step: number;
  /** 끄는 동안 미리 보기(폭을 알리지 않는다). undefined면 미리 보기를 걷는다 */
  preview: (width: number | undefined) => void;
  /** 폭을 정하고 알린다 */
  commit: (width: number) => void;
  /** 지금 화면에서 고를 수 있는 범위(separator의 aria-valuemin · max도 이것) */
  limits: () => { min: number; max: number };
}

/** 틀의 옆 칸 자리. 본문 안 AppShellAside가 여기에 그려진다(블록은 틀 밖에서 그려지므로) */
const AsideSlotContext = createContext<{
  slot: HTMLElement | null;
  id: string;
  resize: AsideResize;
  /** 본문 안 AppShellAside의 열림을 틀에 알린다(사이드바 저절로 접힘) */
  reportOpen: (open: boolean) => void;
} | null>(null);

/** 제어 · 비제어 열림 */
function useOpenState(
  open: boolean | undefined,
  defaultOpen: boolean | undefined,
  onChange: ((open: boolean) => void) | undefined,
) {
  const [inner, setInner] = useState(defaultOpen ?? false);
  const value = open ?? inner;
  const set = (next: boolean) => {
    if (open === undefined) setInner(next);
    onChange?.(next);
  };
  return [value, set] as const;
}

export function AppShell({
  brand,
  brandCollapsed,
  scope,
  sidebar,
  search,
  actions,
  user,
  userName,
  userMenu,
  busy = false,
  sidebarCollapsed,
  defaultSidebarCollapsed,
  onSidebarCollapsedChange,
  autoCollapseSidebar = true,
  mobileNavOpen,
  onMobileNavOpenChange,
  tabs,
  activeTabId,
  onTabPress,
  fill = 'viewport',
  aside,
  asideTitle,
  asideActions,
  asideOpen,
  defaultAsideOpen,
  onAsideOpenChange,
  asideWidth,
  defaultAsideWidth,
  onAsideWidthChange,
  children,
  id,
  testID,
  className,
}: AppShellWebProps) {
  const tr = useMessages();
  const rootRef = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [asideShown, setAsideShown] = useOpenState(asideOpen, defaultAsideOpen, onAsideOpenChange);
  const asideId = `${id ?? 'tl-app'}-aside`;
  const bp = BREAKPOINTS.indexOf(useBreakpoint());
  const wide = bp >= BREAKPOINTS.indexOf('lg');
  const dock = bp >= BREAKPOINTS.indexOf('xl');

  // ── 옆 칸 폭(R-41): 제어 · 비제어. 끄는 동안은 미리 보기 폭만 바꾸고 손을 떼면 한 번 알린다
  const [innerWidth, setInnerWidth] = useState<number | undefined>(defaultAsideWidth);
  const [dragWidth, setDragWidth] = useState<number | undefined>(undefined);
  const width = dragWidth ?? asideWidth ?? innerWidth;
  const units = shellUnits(rootRef.current);
  const resize: AsideResize = {
    width,
    initial: defaultAsideWidth ?? units.initial,
    step: units.step,
    preview: setDragWidth,
    commit: (w) => {
      setDragWidth(undefined);
      if (asideWidth === undefined) setInnerWidth(w);
      onAsideWidthChange?.(w);
    },
    limits: () => {
      const root = rootRef.current;
      const nav = root?.querySelector<HTMLElement>(':scope > .tl-app-shell__sidebar');
      const u = shellUnits(root ?? null);
      // 폭을 잴 수 없으면(jsdom) 범위 끝까지
      const free = root?.clientWidth
        ? root.clientWidth - (wide ? (nav?.offsetWidth ?? 0) : 0)
        : u.max + u.mainMin;
      // 본문 옆 열이면 본문 560을 남기고, 겹치는 패널이면 본문 위로 덮을 수 있는 만큼
      const max = Math.min(u.max, dock ? free - u.mainMin : free);
      return { min: u.min, max: Math.max(u.min, max) };
    },
  };

  // ── 사이드바 접기(R-41): 제어 · 비제어 + 옆 칸 열로 본문이 좁아지면 저절로 접힘
  const [innerCollapsed, setInnerCollapsed] = useState(defaultSidebarCollapsed ?? false);
  const userCollapsed = sidebarCollapsed ?? innerCollapsed;
  const [portalOpen, setPortalOpen] = useState(false);
  const shellWidth = useElementWidth(rootRef);
  const asideDocked = dock && ((aside != null && asideShown) || portalOpen);
  const crowded =
    shellWidth !== undefined &&
    shellWidth < units.sidebar + (width ?? units.initial) + units.desktop;
  const auto = autoCollapseSidebar && sidebar != null && asideDocked && crowded;
  // 저절로 접힌 사이드바를 사용자가 다시 펴면 옆 칸을 닫을 때까지 그대로 둔다
  const [keepOpen, setKeepOpen] = useState(false);
  useEffect(() => {
    if (!auto) setKeepOpen(false);
  }, [auto]);
  const collapsed = userCollapsed || (auto && !keepOpen);
  const collapsible = onSidebarCollapsedChange != null || defaultSidebarCollapsed !== undefined;
  const setCollapsed = (next: boolean) => {
    if (sidebarCollapsed === undefined) setInnerCollapsed(next);
    onSidebarCollapsedChange?.(next);
  };
  const toggleCollapsed = () => {
    if (!collapsed) setCollapsed(true);
    else if (auto && !userCollapsed) setKeepOpen(true);
    else setCollapsed(false);
  };
  // 휴대폰 아래 탭바 위로 토스트를 올린다(PR-19). 넓은 화면에서는 탭바가 숨어 높이 0이라 빠진다
  const tabsRef = useBottomInset<HTMLElement>(true);
  const [innerOpen, setInnerOpen] = useState(false);
  const open = mobileNavOpen ?? innerOpen;
  const setOpen = (v: boolean) => {
    if (mobileNavOpen === undefined) setInnerOpen(v);
    onMobileNavOpenChange?.(v);
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const mainId = `${id ?? 'tl-app'}-main`;
  // 휴대폰 폭(breakpoint.sm 미만)에서는 user 칸을 아바타 단추 하나로 줄인다(R-T12). 344에서도 바가 넘치지 않는다
  const narrow = useBreakpoint() === 'base';
  const userNode = <UserSlot narrow={narrow} user={user} userName={userName} userMenu={userMenu} />;
  const hasUser = user != null || Boolean(userName);
  const style =
    width === undefined
      ? undefined
      : ({ ['--tl-app-shell-aside-width' as string]: `${width}px` } as CSSProperties);
  return (
    <div
      ref={rootRef}
      className={cx('tl-app-shell', className)}
      id={id}
      data-testid={testID}
      data-fill={fill}
      data-collapsed={collapsed || undefined}
      data-mobile-open={open || undefined}
      data-resizing={dragWidth !== undefined || undefined}
      data-state={busy ? 'loading' : undefined}
      style={style}
    >
      <a className="tl-app-shell__skip tl-focusable" href={`#${mainId}`}>
        {tr('appShell.skip')}
      </a>
      {sidebar != null && (
        <>
          {/* 사이드바는 바 높이까지 세운 브랜드 짙은 열(PR-27). 로고는 사이드바 맨 위에 놓는다 */}
          <aside className="tl-app-shell__sidebar">
            <div className="tl-app-shell__nav-brand">
              {collapsed && wide && brandCollapsed != null ? brandCollapsed : brand}
            </div>
            {/* 사이드바 안 SideNav는 collapsed를 주지 않으면 틀의 접힘을 따른다. 1024 미만 덮개는 늘 펼친다 */}
            <ShellSidebarCollapsedContext.Provider value={wide ? collapsed : false}>
              <div className="tl-app-shell__nav-body">{sidebar}</div>
            </ShellSidebarCollapsedContext.Provider>
            {collapsible && (
              <div className="tl-app-shell__nav-foot">
                <button
                  type="button"
                  className="tl-app-shell__nav-toggle tl-focusable"
                  aria-label={collapsed ? tr('appShell.expandNav') : undefined}
                  title={collapsed ? tr('appShell.expandNav') : undefined}
                  onClick={toggleCollapsed}
                >
                  <Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size={20} />
                  {!collapsed && (
                    <span className="tl-app-shell__nav-toggle-label">
                      {tr('appShell.collapseNav')}
                    </span>
                  )}
                </button>
              </div>
            )}
          </aside>
          <div className="tl-app-shell__scrim" aria-hidden onClick={() => setOpen(false)} />
        </>
      )}
      <header className="tl-app-shell__bar">
        {sidebar != null && (
          <IconButton
            className="tl-app-shell__menu"
            icon="menu"
            label={tr('appShell.menu')}
            pressed={open}
            onPress={() => setOpen(!open)}
          />
        )}
        {/* 사이드바가 없거나 좁은 화면(사이드바가 덮개)일 때만 바에 로고가 보인다 */}
        <div className="tl-app-shell__brand">{brand}</div>
        {scope != null && <div className="tl-app-shell__scope">{scope}</div>}
        {search != null && <div className="tl-app-shell__search">{search}</div>}
        {(actions != null || hasUser) && (
          <div className="tl-app-shell__actions">
            {actions}
            {hasUser && <div className="tl-app-shell__user">{userNode}</div>}
          </div>
        )}
        {busy && (
          // 화면을 불러오는 동안 바 아래 진행 줄. 끝을 모르니 값 없는 progressbar
          <div
            className="tl-app-shell__progress"
            role="progressbar"
            aria-label={tr('common.loading')}
          />
        )}
      </header>
      <main className="tl-app-shell__main" id={mainId} tabIndex={-1} aria-busy={busy || undefined}>
        <AsideSlotContext.Provider value={{ slot, id: asideId, resize, reportOpen: setPortalOpen }}>
          {children}
        </AsideSlotContext.Provider>
      </main>
      {/* 옆 칸 자리(PG-33). display: contents라 비어 있으면 격자에 칸을 만들지 않는다(지금 모양 그대로) */}
      <div className="tl-app-shell__aside-slot" ref={setSlot}>
        {aside != null && (
          <AsideRegion
            id={asideId}
            title={asideTitle ?? tr('appShell.aside')}
            actions={asideActions}
            open={asideShown}
            onOpenChange={setAsideShown}
            mainId={mainId}
            resize={resize}
          >
            {aside}
          </AsideRegion>
        )}
      </div>
      {tabs && tabs.length > 0 && (
        // 휴대폰 아래 탭바(D-61). 자주 가는 곳 4개 + 전체 메뉴(사이드바 덮개)
        <nav className="tl-app-shell__tabs" aria-label={tr('appShell.tabs')} ref={tabsRef}>
          {tabs.slice(0, 4).map((t) => {
            const active = t.id === activeTabId;
            return (
              <button
                key={t.id}
                type="button"
                className="tl-app-shell__tab tl-focusable"
                aria-current={active ? 'page' : undefined}
                onClick={() => onTabPress?.(t.id)}
              >
                <span className="tl-app-shell__tab-icon">
                  <Icon name={t.icon} size={24} />
                  {t.count ? (
                    <span
                      className="tl-app-shell__tab-count"
                      data-tone={t.countTone ?? 'neutral'}
                      aria-label={tr('common.itemsSr', { count: formatCount(t.count, 99) })}
                    >
                      {formatCount(t.count, 99)}
                    </span>
                  ) : null}
                </span>
                <span className="tl-app-shell__tab-label">{t.label}</span>
              </button>
            );
          })}
          {sidebar != null && (
            <button
              type="button"
              className="tl-app-shell__tab tl-focusable"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span className="tl-app-shell__tab-icon">
                <Icon name="menu" size={24} />
              </span>
              <span className="tl-app-shell__tab-label">{tr('appShell.more')}</span>
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
AppShell.displayName = AppShellContract.name;

/**
 * 본문 안(블록)에서 틀의 옆 칸을 채운다. 가장 가까운 AppShell의 옆 칸 자리에 그려지고,
 * 틀이 없으면 제자리에 그린다. 열고 닫는 단추는 쓰는 쪽이 두고 `aria-expanded` · `aria-controls`(useAppShellAsideId)를 붙인다
 */
export function AppShellAside({
  title,
  open,
  defaultOpen,
  onOpenChange,
  actions,
  children,
  id,
  testID,
  className,
}: AppShellAsideWebProps) {
  const ctx = useContext(AsideSlotContext);
  const [shown, setShown] = useOpenState(open, defaultOpen, onOpenChange);
  // 틀이 사이드바를 저절로 접을지 알 수 있게 열림을 알린다
  const reportOpen = ctx?.reportOpen;
  useEffect(() => {
    if (!reportOpen) return;
    reportOpen(shown);
    return () => reportOpen(false);
  }, [reportOpen, shown]);
  const region = (
    <AsideRegion
      id={id ?? ctx?.id ?? 'tl-app-aside'}
      title={title}
      actions={actions}
      open={shown}
      onOpenChange={setShown}
      testID={testID}
      className={className}
      {...(ctx ? { resize: ctx.resize } : {})}
    >
      {children}
    </AsideRegion>
  );
  if (!ctx) return region;
  // 틀의 자리가 붙은 뒤(첫 그리기 다음)에 그린다
  return ctx.slot ? createPortal(region, ctx.slot) : null;
}
AppShellAside.displayName = `${AppShellContract.name}Aside`;

/** 옆 칸의 DOM id. 여는 단추의 aria-controls에 쓴다. 틀 밖이면 undefined */
export function useAppShellAsideId(): string | undefined {
  return useContext(AsideSlotContext)?.id;
}

/**
 * 옆 칸 본체. 넓은 화면(breakpoint.lg 이상)은 본문 오른쪽 칸(모달 아님, 본문을 계속 쓴다),
 * 그보다 좁으면 아래 시트(모달). 닫혀 있어도 넓은 화면에서는 숨긴 채 남겨 안의 입력 · 스크롤을 지킨다
 */
function AsideRegion({
  id,
  title,
  actions,
  open,
  onOpenChange,
  mainId,
  resize,
  testID,
  className,
  children,
}: {
  id: string;
  title: string;
  actions?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainId?: string;
  resize?: AsideResize;
  testID?: string;
  className?: string;
  children?: ReactNode;
}) {
  const tr = useMessages();
  const titleId = useId();
  const sheet = BREAKPOINTS.indexOf(useBreakpoint()) < BREAKPOINTS.indexOf('lg');
  const rootRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const was = useRef(open);

  // 포커스: 열리면(처음 그릴 때 말고) 제목으로 옮기고, 닫히면 연 자리(여는 단추)로 돌려준다.
  // 포커스가 옆 칸 밖(본문)에 있던 채로 닫히면 그대로 둔다
  useEffect(() => {
    if (open === was.current) return;
    was.current = open;
    if (sheet) return; // 시트는 Base UI가 포커스를 옮기고 돌려준다
    if (open) {
      const active = document.activeElement;
      returnTo.current = active instanceof HTMLElement && active !== document.body ? active : null;
      headRef.current?.focus();
      return;
    }
    const active = document.activeElement;
    const lost = !active || active === document.body || rootRef.current?.contains(active);
    if (!lost) return;
    const back =
      returnTo.current?.isConnected === true
        ? returnTo.current
        : mainId
          ? document.getElementById(mainId)
          : null;
    back?.focus();
  }, [open, sheet, mainId]);

  const close = () => onOpenChange(false);
  const head = (
    <div className="tl-app-shell__aside-head">
      <h2 className="tl-app-shell__aside-title" id={titleId} ref={headRef} tabIndex={-1}>
        {title}
      </h2>
      {actions != null && <div className="tl-app-shell__aside-actions">{actions}</div>}
      <IconButton icon="x" size="sm" label={tr('appShell.asideClose', { title })} onPress={close} />
    </div>
  );

  if (sheet)
    return (
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        className={cx('tl-app-shell__aside-sheet', className)}
        {...(actions != null ? { actions } : {})}
        {...(testID ? { testID } : {})}
      >
        <div className="tl-app-shell__aside-body" id={id}>
          {children}
        </div>
      </Sheet>
    );

  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    // 안의 팝업(메뉴 · 고르는 목록)이 먼저 처리한 Escape와 포털로 그린 팝업의 Escape는 빼고 닫는다
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (!(e.target instanceof Node) || !rootRef.current?.contains(e.target)) return;
    e.preventDefault();
    close();
  };

  return (
    <aside
      ref={rootRef}
      id={id}
      className={cx('tl-app-shell__aside', className)}
      data-testid={testID}
      aria-labelledby={titleId}
      hidden={!open}
      onKeyDown={onKeyDown}
    >
      {resize && (
        <AsideResizeHandle
          resize={resize}
          asideRef={rootRef}
          controls={id}
          label={tr('appShell.asideResize', { title })}
        />
      )}
      {head}
      <div className="tl-app-shell__aside-body">{children}</div>
    </aside>
  );
}

/**
 * 옆 칸 폭 손잡이(R-41): 옆 칸 왼쪽 가장자리의 세로 separator. 끌기 · ← →(space.16씩) · Home · End,
 * 두 번 누르기 · Enter는 기본 폭. 왼쪽으로 끌면(←) 넓어진다
 */
function AsideResizeHandle({
  resize,
  asideRef,
  controls,
  label,
}: {
  resize: AsideResize;
  asideRef: RefObject<HTMLElement | null>;
  controls: string;
  label: string;
}) {
  const now = () =>
    asideRef.current?.getBoundingClientRect().width || resize.width || resize.initial;
  const clamp = (w: number) => {
    const { min, max } = resize.limits();
    return Math.round(Math.min(max, Math.max(min, w)));
  };
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const { min, max } = resize.limits();
    const next =
      e.key === 'ArrowLeft'
        ? now() + resize.step
        : e.key === 'ArrowRight'
          ? now() - resize.step
          : e.key === 'Home'
            ? min
            : e.key === 'End'
              ? max
              : e.key === 'Enter'
                ? resize.initial
                : null;
    if (next === null) return;
    e.preventDefault();
    resize.commit(clamp(next));
  };
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const handle = e.currentTarget;
    const startX = e.clientX;
    const startWidth = now();
    let last = startWidth;
    handle.setPointerCapture?.(e.pointerId);
    handle.focus();
    const move = (ev: PointerEvent) => {
      last = clamp(startWidth + startX - ev.clientX);
      resize.preview(last);
    };
    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      if (last === startWidth) resize.preview(undefined);
      else resize.commit(last);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  };
  const limits = resize.limits();
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-controls={controls}
      aria-valuemin={limits.min}
      aria-valuemax={limits.max}
      aria-valuenow={Math.round(resize.width ?? resize.initial)}
      tabIndex={0}
      className="tl-app-shell__aside-resize tl-focusable"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onDoubleClick={() => resize.commit(clamp(resize.initial))}
    />
  );
}

/** 요소 폭(ResizeObserver). 없는 환경(jsdom · 서버)은 undefined */
function useElementWidth(ref: RefObject<HTMLElement | null>): number | undefined {
  const [width, setWidth] = useState<number | undefined>(undefined);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

/**
 * user 칸. 넓은 화면은 user(없으면 아바타 + 이름, userMenu가 있으면 그 메뉴를 여는 단추),
 * 휴대폰 폭은 userName이 있으면 아바타 단추 하나(접근성 이름 = 이름). 단추는 userMenu를 열고,
 * userMenu가 없으면 user 칸 내용을 아래 시트로 연다
 */
function UserSlot({
  narrow,
  user,
  userName,
  userMenu,
}: {
  narrow: boolean;
  user?: ReactNode;
  userName?: string;
  userMenu?: AppShellProps['userMenu'];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasMenu = !!userMenu && userMenu.length > 0;
  if (!userName) return <>{user}</>;
  if (narrow) {
    const avatar = <Avatar name={userName} size={32} decorative />;
    if (hasMenu)
      return (
        <Menu
          align="end"
          title={userName}
          items={userMenu}
          trigger={
            <button
              type="button"
              className="tl-app-shell__user-button tl-focusable"
              aria-label={userName}
            >
              {avatar}
            </button>
          }
        />
      );
    if (user == null) return <Avatar name={userName} size={32} />;
    return (
      <>
        <button
          type="button"
          className="tl-app-shell__user-button tl-focusable"
          aria-label={userName}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen(true)}
        >
          {avatar}
        </button>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen} title={userName}>
          <div className="tl-app-shell__user-sheet">{user}</div>
        </Sheet>
      </>
    );
  }
  if (user != null) return <>{user}</>;
  const face = (
    <>
      <Avatar name={userName} size={24} decorative />
      <span className="tl-app-shell__user-name">{userName}</span>
    </>
  );
  if (!hasMenu) return face;
  return (
    <Menu
      align="end"
      title={userName}
      items={userMenu}
      trigger={
        <button type="button" className="tl-app-shell__user-trigger tl-focusable">
          {face}
          <Icon name="chevron-down" className="tl-app-shell__user-chevron" />
        </button>
      }
    />
  );
}
