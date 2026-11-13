// 왼쪽 메뉴. id는 라우트 경로와 같다. 화면을 더하면 App.tsx의 router에 라우트를 넣고 여기에도 넣는다
import type { SideNavSection } from '@terracelab/trellis-contracts';

export const NAV: readonly SideNavSection[] = [
  {
    id: 'main',
    items: [{ id: '/', label: '홈', icon: 'layout-grid' }],
  },
  {
    id: 'admin',
    label: '관리',
    items: [{ id: '/settings', label: '화면 설정', icon: 'settings' }],
  },
];
