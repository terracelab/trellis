// 앱 틀: AppShell + 왼쪽 메뉴 + 위 바(검색 · 보기 설정 · 알림 · 사용자)
import { usePlatform } from '@terracelab/trellis-blocks/platform';
import { AppShell, IconButton, Input, Menu, SideNav } from '@terracelab/trellis-react';
import { useState } from 'react';
import { ScreenParamsProvider } from '@terracelab/trellis-blocks/platform';
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { NAV } from './nav.js';
import { NotificationsDrawer } from './NotificationsDrawer.js';
import { SERVICE } from './service.js';
import { useDensity, useTheme } from './view.js';

export function Shell() {
  const { session, notifications } = usePlatform();
  const [theme, setTheme] = useTheme();
  const [density, setDensity] = useDensity();
  const [notesOpen, setNotesOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const params = useParams();
  const { pathname } = useLocation();
  const unread = notifications.filter((n) => !n.read).length;
  const danger = notifications.some((n) => !n.read && n.tone === 'danger');
  return (
    <AppShell
      brand={<span className="app-brand">{SERVICE.title}</span>}
      mobileNavOpen={mobileNav}
      onMobileNavOpenChange={setMobileNav}
      search={<Input type="search" icon="search" label="검색" placeholder="검색" size="sm" />}
      actions={
        <>
          <Menu
            align="end"
            trigger={<IconButton icon="sliders-horizontal" label="보기 설정" />}
            items={[
              {
                id: 'density',
                label: density === 'compact' ? '넓게 보기' : '촘촘하게 보기',
                icon: density === 'compact' ? 'list' : 'table',
                onSelect: () => setDensity(density === 'compact' ? 'comfortable' : 'compact'),
              },
              {
                id: 'theme',
                label: theme === 'dark' ? '라이트 테마' : '다크 테마',
                icon: theme === 'dark' ? 'sun' : 'moon',
                onSelect: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
              },
            ]}
          />
          <IconButton
            icon="bell"
            label="알림"
            count={unread}
            countTone={danger ? 'danger' : 'neutral'}
            onPress={() => setNotesOpen(true)}
          />
        </>
      }
      user={
        <span className="app-user">
          {session.user.name} {session.user.title}
        </span>
      }
      sidebar={
        <SideNav
          sections={NAV}
          activeId={pathname}
          onNavigate={(id) => {
            setMobileNav(false);
            navigate(id);
          }}
          footer={<span className="app-nav-foot">{session.company.name}</span>}
        />
      }
    >
      {/* 블록이 화면 주소 값(?id= · :id)을 읽는다(useScreenParams, R-T08) */}
      <ScreenParamsProvider params={{ ...Object.fromEntries(search), ...params }}>
        <Outlet />
      </ScreenParamsProvider>
      <NotificationsDrawer open={notesOpen} onOpenChange={setNotesOpen} />
    </AppShell>
  );
}
