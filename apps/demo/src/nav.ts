// 사이드바 메뉴 = 프리셋 모듈 × 등록된 블록. 블록이 없는 모듈은 메뉴에 나오지 않는다.
import type { SideNavItem, SideNavSection } from '@terracelab/trellis-contracts';
import type { IconName } from '@terracelab/trellis-icons';
import modules from '@terracelab/trellis-tokens/modules';
import type { Preset } from './presets.js';
import { BLOCKS, blockById, blocksOfModule } from './registry.js';

type Group = keyof typeof modules.groups;

export function buildNav(preset: Preset): SideNavSection[] {
  // 업무 도우미(전체 화면 대화, PG-34)는 모든 프리셋의 대시보드 바로 아래
  const assistant = BLOCKS.filter((b) => b.id.startsWith('platform/assistant/'));
  const home: SideNavSection = {
    id: 'home',
    items: [
      { id: preset.home, label: '대시보드', icon: 'layout-dashboard' },
      // 업종 대시보드 예시(수요 예측 · 가맹점 · 역할별 홈). 등록되지 않은 블록은 뺀다
      ...(preset.dashboards ?? [])
        .map((id) => blockById(id))
        .filter((b) => b !== undefined)
        .map((b) => ({ id: b.id, label: b.title, icon: dashboardIcon(b.id) })),
      ...assistant.map((b) => ({ id: b.id, label: b.title, icon: 'bot' as const })),
      { id: 'blocks', label: '화면 블록 목록', icon: 'layout-grid' },
    ],
  };
  const groups = (Object.keys(modules.groups) as Group[])
    .map((g): SideNavSection | null => {
      const items = modules.modules
        .filter((m) => m.group === g && preset.modules.includes(m.id))
        .map((m): SideNavItem | null => {
          const blocks = blocksOfModule(m.id);
          if (blocks.length === 0) return null;
          const icon = m.icon as IconName;
          return blocks.length === 1
            ? { id: blocks[0]!.id, label: m.label, icon }
            : {
                id: `module:${m.id}`,
                label: m.label,
                icon,
                children: blocks.map((b) => ({ id: b.id, label: b.title })),
              };
        })
        .filter((x): x is SideNavItem => x !== null);
      return items.length
        ? { id: g, label: modules.groups[g].label, group: g, collapsible: true, items }
        : null;
    })
    .filter((x): x is SideNavSection => x !== null);
  // 로그인 · 오류 화면(Auth · ErrorPage)은 메뉴에 두지 않는다. 화면 블록 목록과 주소로 연다
  const platform = BLOCKS.filter(
    (b) =>
      b.module === 'platform' &&
      !b.pattern.startsWith('Auth') &&
      b.pattern !== 'ErrorPage' &&
      !assistant.includes(b),
  );
  const admin: SideNavSection | null = platform.length
    ? {
        id: 'platform',
        label: '관리',
        collapsible: true,
        items: platform.map((b) => ({ id: b.id, label: b.title, icon: adminIcon(b.id) })),
      }
    : null;
  return [home, ...groups, ...(admin ? [admin] : [])];
}

function dashboardIcon(id: string): IconName {
  if (id.endsWith('/forecast')) return 'chart-line';
  if (id.endsWith('/franchise')) return 'store';
  if (id.endsWith('/people')) return 'users';
  return 'layout-dashboard';
}

function adminIcon(id: string): IconName {
  if (id.includes('users')) return 'users';
  if (id.includes('roles')) return 'shield-check';
  if (id.includes('notification')) return 'bell';
  if (id.includes('jobs')) return 'timer';
  if (id.includes('audit')) return 'history';
  if (id.includes('import')) return 'file-up';
  return 'settings';
}
