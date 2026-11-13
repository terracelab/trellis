# AppShell

> `@terracelab/trellis-react` · CSS `.tl-app-shell` · 안정 · 웹 · 네이티브(같은 props)

```ts
import { AppShell } from '@terracelab/trellis-react';
```

## 용도

업무 앱의 틀: 글로벌 바 · 사이드바 · 본문. 테라스원의 모든 화면이 이 안에 들어간다.

## 해부(Anatomy)

skip link · bar(높이 `layout.global-bar-height` 48. 바 안 컨트롤 `density.control-height-md`가 더 크면 그 높이(글자 크기 모드에서 앱이 컨트롤을 키울 때, R-37). 기본 값에서는 늘 48, `bg.surface`, 아래 `border.divider`: 메뉴 버튼(모바일) · brand · scope(법인 · 지사 스위처) · search · actions · user(세로 `border.divider` 뒤 이름 · 역할 · 메뉴, 휴대폰 폭은 아바타 단추 하나), busy면 바 아래 2px `brand.default` 진행 줄) · sidebar(폭 `layout.sidebar-width` 240, 접힘 64, 바 높이까지 세운 열, `bg.nav`(브랜드 950) 면, 맨 위에 brand(`nav.fgActive`, 바 높이, 접히면 brandCollapsed), 오른쪽 선 없음, 접기 단추를 켜면 맨 아래 nav-foot(`nav.border` 위 선, 단추 `density.control-height-sm` · panel-left-close 20 + "메뉴 접기" `nav.fgMuted`, 가리킴 `nav.hover` + `nav.fgActive`, 접히면 panel-left-open 아이콘만)) · main(`bg.canvas`, 안에서 스크롤, 여백 `density.gutter`. 안의 absolute 요소는 본문을 기준으로 놓인다) · tabs(휴대폰만: 아래 탭바 `bg.surface` 위 `border.divider`, 높이 56 + 안전 영역, 탭 = 아이콘 24 + `type.caption` 라벨(높이는 최소 56이고 글자 · 아이콘이 커지면 따라 커진다), 지금 탭 `fg.link`, 건수는 알약 없이 아이콘 오른쪽 위 작은 숫자, 마지막 "전체"가 사이드바 덮개를 연다) · aside(옆 칸, PG-33: 본문 오른쪽 열, 폭 `space.40` × 10 = 400(토큰 제안 `layout.aside.width`), `bg.surface`, 왼쪽 `border.divider` 1px(구조 선), 머리 = 바 높이 48의 제목(`type.h3`) · 동작 · 닫기 IconButton sm, 아래 `border.divider`, 몸통은 세로 flex라 MessageThread fill + Composer가 남은 높이를 쓴다, 왼쪽 가장자리 폭 손잡이 `space.8` 폭 separator: 가리킴 · 포커스 · 끄는 중 `border.focus` 2px 선).

모양 규칙: 앱 전체의 스크롤바는 `_internal/scrollbar.css`가 정한다(R-37). 손잡이 `border.strong` · 홈 투명 · Trellis 요소는 thin, 사이드바 스크롤은 `nav.hover`(가리키거나 키보드로 들어오면 `nav.fgMuted`) · `scrollbar-gutter: stable`. 브라우저 기본 스크롤바 · 컨트롤은 tokens.css의 `color-scheme`(라이트 · 다크)을 따른다. Safari는 기본 그대로다.

## Props

| 이름 | 타입 | 기본값 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
| `brand` | `ReactNode` |  | 필수 | 제품 이름 · 로고 |
| `brandCollapsed` | `ReactNode` |  |  | 사이드바가 접혔을 때 맨 위 짧은 로고 |
| `sidebar` | `ReactNode` |  |  | 사이드바 |
| `scope` | `ReactNode` |  |  | 범위 스위처(법인 · 지사), brand 오른쪽 |
| `search` | `ReactNode` |  |  | 통합검색 |
| `actions` | `ReactNode` |  |  | 오른쪽 아이콘 동작 |
| `user` | `ReactNode` |  |  | 사용자(이름 · 역할 · 메뉴), 맨 오른쪽 |
| `userName` | `string` |  |  | 사용자 이름(휴대폰 폭 아바타 단추의 이름, user가 없으면 기본 표시) |
| `userMenu` | `MenuEntry[]` |  |  | 사용자 메뉴(아바타 · 이름 단추가 연다) |
| `busy` | `boolean` | `false` |  | 화면 불러오는 중(바 아래 진행 줄) |
| `sidebarCollapsed` | `boolean` | `false` |  | 사이드바 접힘(64, 제어) |
| `defaultSidebarCollapsed` | `boolean` |  |  | 사이드바 처음 접힘(비제어, 주면 접기 단추가 생긴다) |
| `onSidebarCollapsedChange` | `(collapsed: boolean) => void` |  |  | 접기 단추를 누를 때(주면 접기 단추가 생긴다) |
| `autoCollapseSidebar` | `boolean` | `true` |  | 옆 칸 열로 본문이 1024보다 좁아지면 사이드바를 저절로 접는다 |
| `mobileNavOpen` | `boolean` |  |  | 모바일 사이드바 열림(제어) |
| `onMobileNavOpenChange` | `(open: boolean) => void` |  |  | 모바일 사이드바 열림이 바뀔 때 |
| `tabs` | `AppShellTab[]` |  |  | 휴대폰 아래 탭바(4개까지 + 전체) |
| `activeTabId` | `string` |  |  | 지금 탭 |
| `onTabPress` | `(id: string) => void` |  |  | 탭을 누를 때 |
| `fill` | `'viewport' \| 'contained'` | `"viewport"` |  | 높이 기준 |
| `aside` | `ReactNode` |  |  | 옆 칸 내용(본문 오른쪽, 1024 미만은 아래 시트) |
| `asideTitle` | `string` |  |  | 옆 칸 제목 · 랜드마크 이름 |
| `asideActions` | `ReactNode` |  |  | 옆 칸 머리 동작(닫기 앞) |
| `asideOpen` | `boolean` |  |  | 옆 칸 열림(제어) |
| `defaultAsideOpen` | `boolean` | `false` |  | 옆 칸 처음 열림 |
| `onAsideOpenChange` | `(open: boolean) => void` |  |  | 옆 칸 열림이 바뀔 때(닫기 단추 · Escape) |
| `asideWidth` | `number` |  |  | 옆 칸 폭(px, 제어). 320 ~ 720, 본문 560 이상 |
| `defaultAsideWidth` | `number` | `400` |  | 옆 칸 처음 폭(비제어) |
| `onAsideWidthChange` | `(width: number) => void` |  |  | 옆 칸 폭을 바꿀 때(손잡이 끌기 · 화살표 · Home · End · Enter) |
| `children` | `ReactNode` |  |  | 본문 |

## Variants

fill viewport · contained, 사이드바 접힘(접기 단추 있음 · 없음, brandCollapsed), tabs 있음 · 없음, scope · user 있음 · 없음, aside 있음 · 없음(없으면 지금 모양 그대로, 자리 요소는 `display: contents`라 격자에 칸을 만들지 않는다). 사용자는 셋 중 하나로 준다. user(직접 그린 내용) · userName + userMenu(틀이 아바타 + 이름 단추와 메뉴를 그린다) · user + userName(넓은 화면은 user, 휴대폰 폭은 아바타 단추).

## States

지원 상태: `default` · `loading`

default · loading(busy: 바 아래 진행 줄, 본문 `aria-busy`).

## 동작

사이드바가 있으면 brand는 넓은 화면에서 사이드바 맨 위, 1024 미만에서는 바 왼쪽에 보인다. 1024 미만에서 사이드바는 메뉴 버튼으로 여는 덮개(brand 포함, 화면 높이)가 되고, 바깥을 누르거나 Escape로 닫힌다. tabs를 주면 `breakpoint.sm` 미만에서 아래 탭바가 보이고(4개까지 + 전체) 바의 메뉴 버튼은 숨는다. 탭을 누르면 onTabPress(id), 전체를 누르면 사이드바 덮개. busy가 켜지면 진행 줄은 `duration.normal` 뒤에 나타나(짧은 로딩은 깜빡이지 않는다) `duration.pulse` 주기로 왼쪽에서 오른쪽으로 지난다. 움직임 줄이기에서는 가만히 선 줄. 라우터의 화면 불러오기 상태(React Router `useNavigation().state !== 'idle'`)를 그대로 넘긴다(PR-26).

휴대폰 폭의 바(R-T12): `breakpoint.sm` 미만에서 userName이 있으면 user 칸은 아바타 단추 하나(`density.control-height-sm`, 아바타 32)로 준다. 단추는 userMenu가 있으면 그 메뉴를(좁은 화면이라 아래 시트, 제목 = 이름), 없으면 user 칸 내용을 아래 시트로 연다. user도 userMenu도 없으면 아바타만 보인다. 바 간격은 `space.8`, 동작 사이는 `space.4`로 줄고 brand가 먼저 줄어들어 잘린다. 동작 · 사용자 단추는 줄지 않는다. 그래서 344 폭에서 brand + 아이콘 단추 둘 + 메뉴 단추 + 사용자 단추가 바 안에 들어간다. userName 없이 user만 주면 휴대폰 폭에서도 user를 그대로 그린다. 앱이 폭에 따라 직접 바꿔야 하면 `useBreakpoint()`(`@terracelab/trellis-react`)가 지금 폭 단계(`base` · `sm` · `md` · `lg` · `xl` · `2xl`, base = sm 미만)를 돌려준다. 토큰 `breakpoint.*`를 읽고 폭이 바뀌면 다시 그린다. 서버 렌더는 `xl`로 본다.

옆 칸(PG-33): `aside`(틀에서 직접) 또는 본문 안 `AppShellAside`(블록)로 채운다. 둘 다 같은 자리에 그려지고 한 번에 하나만 쓴다. 모달이 아니라 옆 칸을 연 채 본문의 표 · 입력을 계속 쓴다. 폭에 따라 모양이 바뀐다.

| 폭 | 모양 |
| --- | --- |
| `breakpoint.xl`(1280) 이상 | 본문 오른쪽 열. 본문 폭이 줄고 겹치지 않는다. 바는 위 전체 폭 그대로 |
| `breakpoint.lg`(1024) ~ xl | 본문 오른쪽 위에 겹친다(`shadow.lg`). 모달이 아니라 본문 왼쪽은 그대로 쓴다 |
| lg 미만 | 아래 시트(좁은 화면 고르기와 같은 `_internal/sheet.tsx`, 높이 85%). 시트는 모달이고 아래로 쓸어 닫는다 |

열고 닫는 단추는 쓰는 쪽이 둔다(PageHeader 동작 · 바 actions). 단추는 `aria-expanded`와 `aria-controls`(`useAppShellAsideId()`)를 가진다. 닫기는 머리의 닫기 단추와 옆 칸 안 Escape다(안의 메뉴 · 고르는 목록이 먼저 처리한 Escape는 빼고). 넓은 화면에서 닫으면 내용은 숨긴 채 남아(`hidden`) 쓰던 글 · 스크롤이 그대로이고, 다시 열면 이어진다. 열림은 제어(`asideOpen` · `open`) · 비제어(`defaultAsideOpen` · `defaultOpen`, 기본 닫힘) 둘 다 된다.

블록은 틀(AppShell) 밖에서 그려져 틀의 aside prop을 쓸 수 없다. 그래서 본문 안에 `AppShellAside`를 두면 가장 가까운 AppShell의 옆 칸 자리에 그려진다(포털). 틀이 없으면 제자리에 그린다.

| AppShellAside prop | 타입 | 설명 |
| --- | --- | --- |
| title | string | 머리 제목이자 랜드마크 이름(업무 도우미) |
| open · defaultOpen · onOpenChange | boolean · boolean · (open) => void | 열림(제어 · 비제어, 기본 닫힘) |
| actions | ReactNode | 머리 오른쪽 동작(닫기 앞) |
| children | ReactNode | 옆 칸 내용 |

`useAppShellAsideId()`는 옆 칸의 DOM id를 돌려준다(여는 단추의 `aria-controls`). 틀 밖이면 undefined.

옆 칸 폭(R-41): 넓은 화면(lg 이상)에서 옆 칸 왼쪽 가장자리 손잡이를 끌면 폭이 바뀐다. 왼쪽으로 끌면 넓어진다. 범위는 `space.40` × 8(320) ~ × 18(720)이고, 본문 옆 열(xl 이상)이면 본문이 `space.40` × 14(560) 아래로 줄지 않는다. 겹치는 패널(lg ~ xl)이면 본문 폭까지. 키보드는 ← 넓히기 · → 좁히기(`space.16`씩) · Home 최소 · End 최대 · Enter 기본 폭, 마우스는 두 번 누르면 기본 폭. 끄는 동안은 화면만 바뀌고 손을 떼면 `onAsideWidthChange(폭)`을 한 번 부른다. 폭은 제어(`asideWidth`) · 비제어(`defaultAsideWidth`, 기본 400) 둘 다 되고, 기억할지는 앱이 정한다. AppShellAside(본문 안 블록)도 같은 손잡이를 쓴다. 좁은 화면 시트에는 손잡이가 없다.

사이드바 접기(R-41): `onSidebarCollapsedChange` 또는 `defaultSidebarCollapsed`를 주면 사이드바 맨 아래에 접기 단추가 생긴다. 틀은 접힘을 사이드바 안 SideNav에 넘긴다(SideNav에 `collapsed`를 따로 주면 그것이 이긴다). 그래서 앱이 틀과 SideNav에 같은 값을 따로 넘기지 않아도 된다. 1024 미만 덮개 사이드바는 늘 펼친 모양이고 접기 단추가 없다. 접힌 사이드바 맨 위에는 `brandCollapsed`(짧은 로고 · 이름)를 보이고, 없으면 brand가 잘린다.

사이드바 저절로 접힘(R-41): 옆 칸이 본문 옆 열(xl 이상)로 열려 본문이 `layout.desktop.minWidth`(1024)보다 좁아지면(틀 폭 < 사이드바 240 + 옆 칸 폭 + 1024) 사이드바를 접는다. 옆 칸 폭 400이면 틀 폭 1664 미만이다. 옆 칸을 닫거나 틀이 넓어지면 돌아온다. 저절로 접힌 동안 접기 단추로 다시 펴면 옆 칸을 닫을 때까지 펼친 채 둔다. `autoCollapseSidebar={false}`로 끈다. 저절로 접힘은 `onSidebarCollapsedChange`를 부르지 않는다(앱이 기억한 값은 그대로).

## 접근성

`<header>` · `<nav>`(사이드바 안) · `<main id>`, 첫 Tab은 "본문으로 건너뛰기". busy 진행 줄은 값 없는 `role="progressbar"`(이름 "불러오는 중"), 본문은 `aria-busy`. 탭바는 `<nav aria-label="주요 메뉴">`, 지금 탭 `aria-current="page"`, 전체는 `aria-expanded`. 휴대폰 폭의 아바타 단추는 접근성 이름이 사용자 이름(userName)이고 `aria-haspopup="dialog"` · `aria-expanded`를 가진다. 아바타는 꾸밈이라 이름을 두 번 읽지 않는다. 옆 칸은 `<aside>`(complementary) 랜드마크이고 이름은 제목(`aria-labelledby`, 없으면 "옆 칸")이다. 열면(처음 그릴 때 말고) 포커스가 제목(h2)으로 가고, 닫으면 연 단추로 돌아온다. 포커스가 본문에 있던 채로 닫히면 그대로 둔다. 닫기 단추 이름은 "업무 도우미 닫기". 좁은 화면의 시트는 다른 시트와 같이 제목이 이름인 모달 대화상자다. 옆 칸 폭 손잡이는 `role="separator"` `aria-orientation="vertical"`, 이름 "{제목} 폭", `aria-valuenow`(지금 폭) · `aria-valuemin` 320 · `aria-valuemax`(지금 화면에서 넓힐 수 있는 끝, 720 이하), `aria-controls`(옆 칸)이고 Tab으로 닿는다. 사이드바 접기 단추는 펼쳤을 때 보이는 글 "메뉴 접기"가 이름이고, 접혔을 때는 아이콘만이라 이름 "메뉴 펴기"(`aria-label` · `title`)다.

## 밀도

바 높이 48(바 안 컨트롤이 더 크면 그 높이), 본문 여백 `density.gutter`.

## 플랫폼 차이

네이티브는 탭바 + 스택(components.md §9). 화면을 props로 받는다. 웹 휴대폰의 tabs와 같은 어휘다.

## 금지 사항

본문 폭을 1440으로 가두기(업무 화면은 넓게) · 바에 primary 버튼 · 범위 스위처 · 사용자를 사이드바 맨 아래에 두기(지금 누구로 어느 범위를 보는지는 바에서 늘 보인다, PR-26) · 옆 칸 대신 Drawer로 업무 화면 옆 대화 열기(Drawer는 모달이라 본문을 못 쓴다) · 옆 칸 두 개 · 옆 칸에 왼쪽 굵은 색 띠(D-57) · 틀과 SideNav에 접힘을 따로 넘겨 어긋나게 두기 · 옆 칸 폭을 px 아무 값으로 고정하기(손잡이 범위 320 ~ 720).

## 예시

### 틀

글로벌 바 · 사이드바 · 본문(문서 안에서는 contained)

```tsx
import { Avatar, Button, IconButton, Input, SideNav, AppShell } from '@terracelab/trellis-react';

function Frame() {
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
```

### 화면 불러오는 중

바 아래 진행 줄(busy). 라우터의 불러오기 상태를 그대로 넘긴다

```tsx
import { AppShell } from '@terracelab/trellis-react';

function Busy() {
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
```

### 사용자 메뉴

userName · userMenu만 주면 틀이 아바타 + 이름 단추를 그린다. 휴대폰 폭(640 미만)에서는 아바타 단추 하나로 줄고 같은 메뉴를 아래 시트로 연다

```tsx
import { IconButton, AppShell } from '@terracelab/trellis-react';

function UserMenu() {
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
```

### 사이드바 접기

onSidebarCollapsedChange를 주면 사이드바 아래에 접기 단추가 생긴다. 접히면 틀이 SideNav에 collapsed를 넘기고 맨 위는 brandCollapsed(짧은 이름)로 바뀐다

```tsx
import { useState } from 'react';
import { SideNav, AppShell } from '@terracelab/trellis-react';

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

function CollapsibleSidebar() {
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
```

### 옆 칸 폭

옆 칸 왼쪽 가장자리 손잡이를 끌거나 ← → · Home · End로 폭을 바꾼다(320 ~ 720, 본문 560 이상). 두 번 누르거나 Enter면 기본 폭. 본문이 1024보다 좁아지면 사이드바가 저절로 접힌다

```tsx
import { useState } from 'react';
import { Button, SideNav, AppShell } from '@terracelab/trellis-react';

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

function AsideWidth() {
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
```

### 옆 칸

본문 오른쪽에 붙는 칸이다. 모달이 아니라 본문을 계속 쓴다. 1024 미만에서는 아래 시트로 열린다. 블록처럼 본문 안에서 채울 때는 AppShellAside를 쓴다

```tsx
import { useState } from 'react';
import { Button, IconButton, AppShell } from '@terracelab/trellis-react';

function Aside() {
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
```
