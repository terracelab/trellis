import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';
import type { MenuEntry } from '../Menu/Menu.contract.js';

/** 휴대폰 아래 탭 하나. 4개까지, 마지막 "전체"는 틀이 붙인다 */
export interface AppShellTab {
  id: string;
  label: string;
  icon: IconName;
  count?: number;
  /** 지연 · 오류만 danger(D-35) */
  countTone?: 'neutral' | 'danger';
}

export interface AppShellProps extends ContractBase {
  /** 왼쪽 위 제품 이름 · 로고(고객 테마의 로고 슬롯) */
  brand: unknown;
  /** 사이드바가 접혔을 때(64) 맨 위에 보일 짧은 로고 · 이름. 없으면 brand를 그대로 두고 넘치는 부분이 잘린다(R-41) */
  brandCollapsed?: unknown;
  /** 사이드바(보통 SideNav) */
  sidebar?: unknown;
  /** 글로벌 바 brand 오른쪽: 지금 보고 있는 범위(법인 · 지사 · 회사 스위처). 사이드바가 아니라 여기 둔다(PR-26) */
  scope?: unknown;
  /** 글로벌 바 가운데(통합검색) */
  search?: unknown;
  /** 글로벌 바 오른쪽(알림 · 보기 설정 같은 아이콘 동작) */
  actions?: unknown;
  /** 글로벌 바 맨 오른쪽: 사용자(이름 · 역할 · 메뉴). 사이드바 아래가 아니라 여기 둔다(PR-26) */
  user?: unknown;
  /**
   * 사용자 이름. 주면 휴대폰 폭(breakpoint.sm 미만)에서 user 칸이 이 이름의 아바타 단추 하나로 준다
   * (접근성 이름 = 이름). user가 없으면 넓은 화면에서도 아바타 + 이름을 틀이 그린다
   */
  userName?: string;
  /** 사용자 메뉴(역할 바꾸기 · 로그아웃). 아바타 단추 · 이름 단추가 이 메뉴를 연다. 없으면 아바타 단추는 user 칸을 아래 시트로 연다 */
  userMenu?: readonly MenuEntry[];
  /** 화면을 불러오는 중: 글로벌 바 아래 2px 진행 줄 + 본문 aria-busy. 짧은 로딩은 깜빡이지 않게 늦게 보인다 */
  busy?: boolean;
  /** 사이드바 접힘(64, 제어). 틀이 사이드바 안 SideNav에 collapsed를 넘긴다(SideNav에 collapsed를 따로 주면 그것이 이긴다) */
  sidebarCollapsed?: boolean;
  /** 처음 접힘(비제어). 주면 사이드바 아래에 접기 단추가 생긴다 */
  defaultSidebarCollapsed?: boolean;
  /** 접기 단추를 누를 때. 주면 사이드바 아래에 접기 단추가 생긴다(R-41) */
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  /**
   * 옆 칸이 본문 옆 열로 열렸는데(breakpoint.xl 이상) 본문이 layout.desktop.minWidth(1024)보다 좁아지면
   * 사이드바를 저절로 접는다. 옆 칸을 닫으면 돌아온다. 기본 true(R-41)
   */
  autoCollapseSidebar?: boolean;
  /** 1024 미만에서 사이드바 열림 */
  mobileNavOpen?: boolean;
  onMobileNavOpenChange?: (open: boolean) => void;
  /** 휴대폰(breakpoint.sm 미만) 아래 탭바. 자주 가는 곳 4개까지 + 전체 메뉴. 없으면 탭바 없음 */
  tabs?: readonly AppShellTab[];
  activeTabId?: string;
  onTabPress?: (id: string) => void;
  /** viewport = 화면 전체 높이(앱), contained = 부모 높이(문서 예시 · 데모 액자) */
  fill?: 'viewport' | 'contained';
  /**
   * 옆 칸(PG-33): 본문 오른쪽에 붙는 칸(업무 도우미 대화 · 상세). 모달이 아니라 본문을 계속 쓴다.
   * 1024 미만에서는 아래 시트로 열린다. 없으면 틀은 지금 모양 그대로다. 본문 안 블록은 AppShellAside로 채운다
   */
  aside?: unknown;
  /** 옆 칸 머리 제목이자 랜드마크 이름(업무 도우미). 없으면 "옆 칸" */
  asideTitle?: string;
  /** 옆 칸 머리 오른쪽 동작(닫기 앞, 새 대화 같은 IconButton) */
  asideActions?: unknown;
  /** 옆 칸 열림(제어) */
  asideOpen?: boolean;
  /** 처음 열림(비제어). 기본 false */
  defaultAsideOpen?: boolean;
  onAsideOpenChange?: (open: boolean) => void;
  /**
   * 옆 칸 폭(px, 제어). 옆 칸 왼쪽 가장자리 손잡이로 끌거나 화살표로 바꾼다. 범위는 space.40 × 8(320) ~ × 18(720)이고
   * 본문 열은 space.40 × 14(560) 아래로 줄지 않는다. 없으면 기본 폭(space.40 × 10 = 400)
   */
  asideWidth?: number;
  /** 처음 폭(비제어). 기본 400. 두 번 누르기 · Enter로 이 폭으로 돌아간다 */
  defaultAsideWidth?: number;
  /** 폭을 바꿀 때(끄는 중에는 손을 뗄 때 한 번, 키보드는 누를 때마다). 기억할지는 앱이 정한다 */
  onAsideWidthChange?: (width: number) => void;
  children?: unknown;
}

/**
 * 본문 안에서 틀의 옆 칸을 채우는 부품(AppShellAside). 블록은 AppShell 밖에서 그려지므로
 * 틀의 aside prop 대신 이것을 쓴다. 가장 가까운 AppShell의 옆 칸 자리에 그려지고, 틀이 없으면 제자리에 그린다
 */
export interface AppShellAsideProps extends ContractBase {
  /** 머리 제목이자 랜드마크 이름(업무 도우미) */
  title: string;
  open?: boolean;
  /** 처음 열림(비제어). 기본 false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 머리 오른쪽 동작(닫기 앞) */
  actions?: unknown;
  children?: unknown;
}

export const AppShellContract = defineContract<AppShellProps>({
  name: 'AppShell',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    brand: { type: 'ReactNode', required: true, description: '제품 이름 · 로고' },
    brandCollapsed: { type: 'ReactNode', description: '사이드바가 접혔을 때 맨 위 짧은 로고' },
    sidebar: { type: 'ReactNode', description: '사이드바' },
    scope: { type: 'ReactNode', description: '범위 스위처(법인 · 지사), brand 오른쪽' },
    search: { type: 'ReactNode', description: '통합검색' },
    actions: { type: 'ReactNode', description: '오른쪽 아이콘 동작' },
    user: { type: 'ReactNode', description: '사용자(이름 · 역할 · 메뉴), 맨 오른쪽' },
    userName: {
      type: 'string',
      description: '사용자 이름(휴대폰 폭 아바타 단추의 이름, user가 없으면 기본 표시)',
    },
    userMenu: {
      type: 'MenuEntry[]',
      description: '사용자 메뉴(아바타 · 이름 단추가 연다)',
    },
    busy: { type: 'boolean', default: false, description: '화면 불러오는 중(바 아래 진행 줄)' },
    sidebarCollapsed: { type: 'boolean', default: false, description: '사이드바 접힘(64, 제어)' },
    defaultSidebarCollapsed: {
      type: 'boolean',
      description: '사이드바 처음 접힘(비제어, 주면 접기 단추가 생긴다)',
    },
    onSidebarCollapsedChange: {
      type: '(collapsed: boolean) => void',
      description: '접기 단추를 누를 때(주면 접기 단추가 생긴다)',
    },
    autoCollapseSidebar: {
      type: 'boolean',
      default: true,
      description: '옆 칸 열로 본문이 1024보다 좁아지면 사이드바를 저절로 접는다',
    },
    mobileNavOpen: { type: 'boolean', description: '모바일 사이드바 열림(제어)' },
    onMobileNavOpenChange: {
      type: '(open: boolean) => void',
      description: '모바일 사이드바 열림이 바뀔 때',
    },
    tabs: { type: 'AppShellTab[]', description: '휴대폰 아래 탭바(4개까지 + 전체)' },
    activeTabId: { type: 'string', description: '지금 탭' },
    onTabPress: { type: '(id: string) => void', description: '탭을 누를 때' },
    fill: {
      type: "'viewport' | 'contained'",
      default: 'viewport',
      values: ['viewport', 'contained'],
      description: '높이 기준',
    },
    aside: { type: 'ReactNode', description: '옆 칸 내용(본문 오른쪽, 1024 미만은 아래 시트)' },
    asideTitle: { type: 'string', description: '옆 칸 제목 · 랜드마크 이름' },
    asideActions: { type: 'ReactNode', description: '옆 칸 머리 동작(닫기 앞)' },
    asideOpen: { type: 'boolean', description: '옆 칸 열림(제어)' },
    defaultAsideOpen: { type: 'boolean', default: false, description: '옆 칸 처음 열림' },
    onAsideOpenChange: {
      type: '(open: boolean) => void',
      description: '옆 칸 열림이 바뀔 때(닫기 단추 · Escape)',
    },
    asideWidth: { type: 'number', description: '옆 칸 폭(px, 제어). 320 ~ 720, 본문 560 이상' },
    defaultAsideWidth: { type: 'number', default: 400, description: '옆 칸 처음 폭(비제어)' },
    onAsideWidthChange: {
      type: '(width: number) => void',
      description: '옆 칸 폭을 바꿀 때(손잡이 끌기 · 화살표 · Home · End · Enter)',
    },
    children: { type: 'ReactNode', description: '본문' },
  },
  states: ['default', 'loading'],
  a11y: {
    keyboard: [
      'Tab(본문으로 건너뛰기)',
      'Escape(옆 칸 닫기, 옆 칸 안에서)',
      '← →(옆 칸 폭 손잡이: 넓히기 · 좁히기)',
      'Home · End(옆 칸 폭 최소 · 최대)',
      'Enter(옆 칸 폭 기본으로)',
    ],
    labelling: 'children',
  },
  slots: [
    'brand',
    'brandCollapsed',
    'scope',
    'sidebar',
    'search',
    'actions',
    'user',
    'aside',
    'asideActions',
  ],
  platforms: { web: true, native: true },
});
