import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase, type ModuleGroup } from '../_base.js';

export interface SideNavItem {
  id: string;
  label: string;
  icon?: IconName;
  href?: string;
  count?: number;
  /** 지연 · 오류만 danger(D-35) */
  countTone?: 'neutral' | 'danger';
  children?: readonly SideNavItem[];
}

export interface SideNavSection {
  id: string;
  label?: string;
  /** 모듈 그룹 색 점 */
  group?: ModuleGroup;
  collapsible?: boolean;
  /** 처음 열림(비제어). 지금 화면(activeId)이 든 묶음은 revealActive면 이 값과 상관없이 열린 채 시작한다 */
  defaultOpen?: boolean;
  /** 열림(제어, R-42). 주면 SideNav는 이 값을 그리고, 머리를 누르면 onSectionOpenChange만 부른다 */
  open?: boolean;
  items: readonly SideNavItem[];
}

export interface SideNavProps extends ContractBase {
  sections: readonly SideNavSection[];
  activeId?: string;
  onNavigate?: (id: string) => void;
  /** 아이콘만(접힌 사이드바). 없으면 AppShell의 접힘을 따른다 */
  collapsed?: boolean;
  /** 묶음 머리를 누르거나, 지금 화면이 접힌 묶음 안으로 바뀌어 열 때(R-42). 제어 · 비제어 둘 다 부른다 */
  onSectionOpenChange?: (id: string, open: boolean) => void;
  /** activeId가 접힌 묶음 · 하위 메뉴 안으로 바뀌면 연다. 기본 true(R-42) */
  revealActive?: boolean;
  /** 위(프로필 · 빠른 실행) */
  header?: unknown;
  /** 아래(근무 시간 · 설정) */
  footer?: unknown;
  label?: string;
}

export const SideNavContract = defineContract<SideNavProps>({
  name: 'SideNav',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    sections: { type: 'SideNavSection[]', required: true, description: '메뉴 묶음' },
    activeId: { type: 'string', description: '지금 화면' },
    onNavigate: { type: '(id: string) => void', description: '항목을 누를 때' },
    collapsed: { type: 'boolean', default: false, description: '아이콘만(없으면 AppShell 접힘)' },
    onSectionOpenChange: {
      type: '(id: string, open: boolean) => void',
      description: '묶음 열림이 바뀔 때(머리 누름 · 지금 화면 드러내기)',
    },
    revealActive: {
      type: 'boolean',
      default: true,
      description: '지금 화면이 접힌 묶음 안이면 연다',
    },
    header: { type: 'ReactNode', description: '위 영역' },
    footer: { type: 'ReactNode', description: '아래 영역' },
    label: { type: 'string', default: '주 메뉴', description: '내비게이션 이름' },
  },
  states: ['default', 'hover', 'active', 'focus'],
  a11y: {
    role: 'navigation',
    keyboard: ['Tab', 'Enter', 'Space(묶음 접기)'],
    labelling: 'label-prop',
  },
  slots: ['header', 'footer'],
  platforms: { web: true, native: false },
});
