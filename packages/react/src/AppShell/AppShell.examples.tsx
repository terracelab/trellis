import { useState } from 'react';
import { Avatar } from '../Avatar/Avatar.js';
import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Input } from '../Input/Input.js';
import { SideNav } from '../SideNav/SideNav.js';
import { AppShell } from './AppShell.js';

/** 틀 — 글로벌 바 · 사이드바 · 본문(문서 안에서는 contained) */
export function Frame() {
  return (
    <div
      style={{
        height: 'calc(var(--tl-space-64) * 6)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
        borderRadius: 'var(--tl-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <AppShell
        fill="contained"
        brand="테라스원"
        scope={
          <Button variant="ghost" size="sm" iconEnd="chevron-down">
            테라트레이딩 본사
          </Button>
        }
        search={<Input type="search" icon="search" placeholder="통합검색" size="sm" />}
        actions={<IconButton icon="bell" label="알림" count={7} />}
        user={
          <>
            <Avatar name="김테라" size={24} decorative />
            <span>김테라 · 관리자</span>
          </>
        }
        userName="김테라"
        sidebar={
          <SideNav
            activeId="dashboard"
            sections={[
              {
                id: 'main',
                items: [
                  { id: 'dashboard', label: '대시보드', icon: 'layout-dashboard' },
                  { id: 'po', label: '발주', icon: 'file-text', count: 4 },
                ],
              },
            ]}
          />
        }
      >
        <div style={{ padding: 'var(--tl-density-gutter)' }}>본문</div>
      </AppShell>
    </div>
  );
}

/** 화면 불러오는 중 — 바 아래 진행 줄(busy). 라우터의 불러오기 상태를 그대로 넘긴다 */
export function Busy() {
  return (
    <div
      style={{
        height: 'calc(var(--tl-space-64) * 3)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
        borderRadius: 'var(--tl-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <AppShell fill="contained" brand="테라스원" busy>
        <div style={{ padding: 'var(--tl-density-gutter)' }}>거래 내역을 불러오는 중</div>
      </AppShell>
    </div>
  );
}

/** 사용자 메뉴 — userName · userMenu만 주면 틀이 아바타 + 이름 단추를 그린다. 휴대폰 폭(640 미만)에서는 아바타 단추 하나로 줄고 같은 메뉴를 아래 시트로 연다 */
export function UserMenu() {
  return (
    <div
      style={{
        height: 'calc(var(--tl-space-64) * 3)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
        borderRadius: 'var(--tl-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <AppShell
        fill="contained"
        brand="테라스원 인사"
        actions={
          <>
            <IconButton icon="sliders-horizontal" label="보기 설정" />
            <IconButton icon="bell" label="알림" count={3} />
          </>
        }
        userName="김재희"
        userMenu={[
          { type: 'label', label: '역할 바꾸기' },
          { id: 'role:lead', label: '팀장', icon: 'check' },
          { id: 'role:member', label: '구성원', icon: 'user' },
          { type: 'separator' },
          { id: 'logout', label: '로그아웃', icon: 'log-out' },
        ]}
      >
        <div style={{ padding: 'var(--tl-density-gutter)' }}>본문</div>
      </AppShell>
    </div>
  );
}

const tradeSections = [
  {
    id: 'main',
    items: [
      { id: 'dashboard', label: '대시보드', icon: 'layout-dashboard' as const },
      { id: 'po', label: '발주', icon: 'file-text' as const, count: 4 },
      { id: 'tax', label: '세금계산서', icon: 'receipt' as const },
    ],
  },
];

/** 사이드바 접기 — onSidebarCollapsedChange를 주면 사이드바 아래에 접기 단추가 생긴다. 접히면 틀이 SideNav에 collapsed를 넘기고 맨 위는 brandCollapsed(짧은 이름)로 바뀐다 */
export function CollapsibleSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      style={{
        height: 'calc(var(--tl-space-64) * 5)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
        borderRadius: 'var(--tl-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <AppShell
        fill="contained"
        brand="테라스원"
        brandCollapsed="TO"
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebar={<SideNav activeId="po" sections={tradeSections} />}
      >
        <div style={{ padding: 'var(--tl-density-gutter)' }}>본문</div>
      </AppShell>
    </div>
  );
}

/** 옆 칸 폭 — 옆 칸 왼쪽 가장자리 손잡이를 끌거나 ← → · Home · End로 폭을 바꾼다(320 ~ 720, 본문 560 이상). 두 번 누르거나 Enter면 기본 폭. 본문이 1024보다 좁아지면 사이드바가 저절로 접힌다 */
export function AsideWidth() {
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(480);
  return (
    <div
      style={{
        height: 'calc(var(--tl-space-64) * 6)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
        borderRadius: 'var(--tl-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <AppShell
        fill="contained"
        brand="테라스원"
        brandCollapsed="TO"
        defaultSidebarCollapsed={false}
        sidebar={<SideNav activeId="tax" sections={tradeSections} />}
        asideTitle="업무 도우미"
        asideOpen={open}
        onAsideOpenChange={setOpen}
        asideWidth={width}
        onAsideWidthChange={setWidth}
        aside={
          <p
            style={{
              margin: 0,
              padding: 'var(--tl-space-16)',
              color: 'var(--tl-color-fg-secondary)',
            }}
          >
            옆 칸 폭 {width}
          </p>
        }
      >
        <div style={{ padding: 'var(--tl-density-gutter)' }}>
          <Button
            icon="panel-right-open"
            aria-expanded={open}
            aria-controls="tl-app-aside"
            onPress={() => setOpen(!open)}
          >
            업무 도우미
          </Button>
        </div>
      </AppShell>
    </div>
  );
}

/** 옆 칸 — 본문 오른쪽에 붙는 칸이다. 모달이 아니라 본문을 계속 쓴다. 1024 미만에서는 아래 시트로 열린다. 블록처럼 본문 안에서 채울 때는 AppShellAside를 쓴다 */
export function Aside() {
  const [open, setOpen] = useState(true);
  return (
    <div
      style={{
        height: 'calc(var(--tl-space-64) * 6)',
        border: 'var(--tl-border-width-1) solid var(--tl-color-border-divider)',
        borderRadius: 'var(--tl-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <AppShell
        fill="contained"
        brand="테라스원"
        asideTitle="업무 도우미"
        asideOpen={open}
        onAsideOpenChange={setOpen}
        asideActions={<IconButton icon="plus" size="sm" label="새 대화" />}
        aside={
          <p
            style={{
              margin: 0,
              padding: 'var(--tl-space-16)',
              color: 'var(--tl-color-fg-secondary)',
            }}
          >
            보고 있는 문서 3건에 대해 묻습니다
          </p>
        }
      >
        <div style={{ padding: 'var(--tl-density-gutter)' }}>
          <Button
            icon="panel-right-open"
            aria-expanded={open}
            aria-controls="tl-app-aside"
            onPress={() => setOpen(!open)}
          >
            업무 도우미
          </Button>
        </div>
      </AppShell>
    </div>
  );
}
