// 데모 틀: 테라스원 AppShell + 메뉴 + 바(소개 사이트 링크 · 검색 · 프리셋 · 역할 · 테마 · 밀도 · 접근성 · 업무 도우미 · 알림)
import {
  ASSISTANT_CONVERSATIONS,
  ASSISTANT_NAME,
  useAssistantRuns,
} from '@terracelab/trellis-blocks/data/assistant';
import { ROLES, usePlatform } from '@terracelab/trellis-blocks/platform';
import { DEFAULT_THEME, useThemeChoice } from '@terracelab/trellis-blocks/ui';
import type { AppShellTab, SideNavItem } from '@terracelab/trellis-contracts';
import {
  AppShell,
  Badge,
  BREAKPOINTS,
  Icon,
  IconButton,
  Input,
  Menu,
  SideNav,
  useBreakpoint,
} from '@terracelab/trellis-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { A11yDrawer } from './A11yDrawer.js';
import { AssistantAside, AssistantToggle } from './AssistantAside.js';
import { buildNav } from './nav.js';
import type { Preset } from './presets.js';
import { PRESETS } from './presets.js';
import { go } from './router.js';
import { NotificationsDrawer } from './NotificationsDrawer.js';
import { a11yCount, HOME_HREF, saveTheme, store, type A11ySettings } from './settings.js';
import { ThemeDrawer } from './ThemeDrawer.js';

/** 옆 칸을 스스로 쓰는 화면(AppShellAside) · 전체 화면 대화. 틀의 업무 도우미 옆 칸은 여기서 빼 둔다(한 번에 하나만) */
const OWN_ASSISTANT = new Set(['ecm/my-docs/ask', 'platform/assistant/chat']);
const ASIDE_WIDTH_KEY = 'tl-demo-aside-width';
const storedAsideWidth = () => {
  const n = Number(store.get(ASIDE_WIDTH_KEY));
  return Number.isFinite(n) && n >= 320 && n <= 720 ? n : 400;
};

export function Shell({
  route,
  preset,
  onPreset,
  a11y,
  onA11y,
  children,
}: {
  route: string;
  preset: Preset;
  onPreset: (id: string) => void;
  a11y: A11ySettings;
  onA11y: (next: A11ySettings) => void;
  children: ReactNode;
}) {
  const { session, setRole, notifications } = usePlatform();
  const [theme, setTheme] = useState(() => document.documentElement.dataset['theme'] ?? 'light');
  const [density, setDensity] = useState(
    () => document.documentElement.dataset['density'] ?? 'compact',
  );
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const { choice, setChoice } = useThemeChoice('tl-demo-brand');
  const [mobileNav, setMobileNav] = useState(false);
  // 넓은 화면은 테마 · 접근성 단추를 바에 꺼내 둔다. 휴대폰은 바가 좁아 데모 설정 메뉴에만 둔다
  const wide = BREAKPOINTS.indexOf(useBreakpoint()) >= BREAKPOINTS.indexOf('lg');
  // 업무 도우미 옆 칸: 처음 대화 하나를 채워 둔다. 폭은 끌어서 바꾸고 이 브라우저에 남긴다
  const me = `${session.user.name} ${session.user.title}`;
  const runs = useAssistantRuns([ASSISTANT_CONVERSATIONS[0]!], me);
  const [convId, setConvId] = useState<string | null>(ASSISTANT_CONVERSATIONS[0]!.id);
  const [aiOpen, setAiOpen] = useState(false);
  const [asideWidth] = useState(storedAsideWidth);
  const assistant = !OWN_ASSISTANT.has(route);
  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;
  }, [theme]);
  // 고른 테마만 저장한다(처음 들어올 때 기기 설정을 따른 값은 적지 않는다). 소개 사이트와 같은 키에도 적는다
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveTheme(next);
  };
  const a11yOn = a11yCount(a11y);
  const a11yLabel = a11yOn ? `접근성 · ${a11yOn}개 켬` : '접근성';
  useEffect(() => {
    document.documentElement.dataset['density'] = density;
    store.set('tl-demo-density', density);
  }, [density]);
  const nav = useMemo(() => buildNav(preset), [preset]);
  // 휴대폰 아래 탭: 대시보드 + 모듈 묶음 첫 화면 셋. 하위 화면이 있는 메뉴는 첫 화면으로 간다
  const tabs = useMemo<AppShellTab[]>(() => {
    const leaf = (i: SideNavItem) => i.children?.[0]?.id ?? i.id;
    const firsts = nav
      .slice(1)
      .flatMap((s) => s.items.slice(0, 1))
      .slice(0, 3)
      .map((i) => ({ id: leaf(i), label: i.label, icon: i.icon ?? ('layout-grid' as const) }));
    return [{ id: preset.home, label: '홈', icon: 'house' }, ...firsts];
  }, [nav, preset.home]);
  const unread = notifications.filter((n) => !n.read).length;
  const danger = notifications.some((n) => !n.read && n.tone === 'danger');
  return (
    <AppShell
      brand={
        <span className="tl-demo-brand">
          테라스원
          <Badge size="sm" tone="neutral" dot={false}>
            데모
          </Badge>
        </span>
      }
      mobileNavOpen={mobileNav}
      onMobileNavOpenChange={setMobileNav}
      tabs={tabs}
      activeTabId={route || preset.home}
      onTabPress={go}
      scope={
        <a className="tl-demo-home tl-focusable" href={HOME_HREF} aria-label="소개 사이트">
          <Icon name="arrow-left" size={16} />
          <span className="tl-demo-home__text">소개 사이트</span>
        </a>
      }
      {...(assistant
        ? {
            aside: <AssistantAside runs={runs} convId={convId} onConv={setConvId} me={me} />,
            asideTitle: ASSISTANT_NAME,
            asideActions: (
              <IconButton
                icon="plus"
                size="sm"
                label="새 대화"
                onPress={() => {
                  if (convId) runs.clear(convId);
                }}
              />
            ),
            asideOpen: aiOpen,
            onAsideOpenChange: setAiOpen,
            defaultAsideWidth: asideWidth,
            onAsideWidthChange: (w: number) => store.set(ASIDE_WIDTH_KEY, String(Math.round(w))),
          }
        : {})}
      search={
        <Input
          type="search"
          icon="search"
          label="검색"
          placeholder="거래처 · 품목 · 문서 번호"
          size="sm"
        />
      }
      actions={
        <>
          <Menu
            align="end"
            trigger={<IconButton icon="sliders-horizontal" label="데모 설정" />}
            items={[
              { type: 'label', label: '업종 프리셋' },
              ...PRESETS.map((p) => ({
                id: `preset:${p.id}`,
                label: p.label,
                icon: p.id === preset.id ? ('check' as const) : undefined,
                onSelect: () => onPreset(p.id),
              })),
              { type: 'separator' },
              { type: 'label', label: '역할 바꿔 보기' },
              ...ROLES.map((r) => ({
                id: `role:${r.id}`,
                label: r.name,
                icon: r.id === session.roles[0]?.id ? ('check' as const) : undefined,
                onSelect: () => setRole(r.id),
              })),
              { type: 'separator' },
              { type: 'label', label: '보기' },
              {
                id: 'density',
                label: density === 'compact' ? '넓게 보기' : '촘촘하게 보기',
                icon: density === 'compact' ? ('list' as const) : ('table' as const),
                onSelect: () => setDensity(density === 'compact' ? 'comfortable' : 'compact'),
              },
              {
                id: 'brand',
                label: '테마 색',
                icon: 'palette',
                onSelect: () => setThemeOpen(true),
              },
              {
                id: 'theme',
                label: theme === 'dark' ? '라이트 테마' : '다크 테마',
                icon: theme === 'dark' ? ('sun' as const) : ('moon' as const),
                onSelect: toggleTheme,
              },
              {
                id: 'a11y',
                label: a11yLabel,
                icon: 'eye',
                onSelect: () => setA11yOpen(true),
              },
            ]}
          />
          {wide && (
            <>
              <IconButton
                icon={theme === 'dark' ? 'sun' : 'moon'}
                label={theme === 'dark' ? '라이트 테마로' : '다크 테마로'}
                onPress={toggleTheme}
              />
              <IconButton icon="eye" label={a11yLabel} onPress={() => setA11yOpen(true)} />
            </>
          )}
          {assistant && <AssistantToggle open={aiOpen} onToggle={() => setAiOpen(!aiOpen)} />}
          <IconButton
            icon="bell"
            label="알림"
            count={unread}
            countTone={danger ? 'danger' : 'neutral'}
            onPress={() => setOpen(true)}
          />
          <span
            className="tl-demo-user"
            title={`${session.user.department} · ${session.roles[0]?.name ?? ''}`}
          >
            {session.user.name} {session.user.title}
          </span>
        </>
      }
      sidebar={
        <SideNav
          sections={nav}
          activeId={route || preset.home}
          onNavigate={(id) => {
            setMobileNav(false);
            go(id);
          }}
          footer={<span className="tl-demo-nav-foot">{session.company.name} · 샘플 데이터</span>}
        />
      }
    >
      {children}
      <NotificationsDrawer open={open} onOpenChange={setOpen} />
      <ThemeDrawer
        open={themeOpen}
        onOpenChange={setThemeOpen}
        value={choice}
        onChange={setChoice}
        onReset={() => setChoice(DEFAULT_THEME)}
      />
      <A11yDrawer open={a11yOpen} onOpenChange={setA11yOpen} value={a11y} onChange={onA11y} />
    </AppShell>
  );
}
