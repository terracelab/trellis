import { defineContract, type ContractBase } from '../_base.js';

/** 12열 중 차지하는 칸. 좁은 폭에서는 반(6) · 한 줄(12)로 접힌다 */
export const DASHBOARD_SPANS = [2, 3, 4, 5, 6, 7, 8, 9, 12] as const;
export type DashboardSpan = (typeof DASHBOARD_SPANS)[number];

/** 위젯 하나. 순서 · 숨김은 layout이 정하고, 위젯은 내용과 크기만 정한다 */
export interface DashboardWidget {
  /** 저장되는 값. 바꾸면 저장한 배치에서 빠진다 */
  id: string;
  /** 위젯 이름(명사). 편집 모드 손잡이 글자이자 읽어 주는 이름. 카드 제목과 같게 */
  title: string;
  /** 12열 중 칸 수. 기본 4 */
  span?: DashboardSpan;
  /** 세로 두 줄(옆 칸 두 개 높이) */
  rows?: 1 | 2;
  /** false면 숨길 수 없다(요약 숫자처럼 화면의 기준이 되는 위젯). 기본 true */
  hideable?: boolean;
  /** 웹: ReactNode */
  content: unknown;
}

/** 배치 한 칸. 배열 순서가 화면 순서다 */
export interface DashboardLayoutItem {
  id: string;
  hidden?: boolean;
}

/** 저장하는 배치(JSON으로 그대로 저장한다). 모든 위젯이 한 번씩 들어 있다 */
export type DashboardLayout = readonly DashboardLayoutItem[];

/**
 * 저장한 배치 + 지금 위젯 → 화면에 쓸 배치. 저장한 순서를 지키고, 없어진 위젯은 빼고, 새 위젯은 뒤에 붙인다.
 * 숨길 수 없는 위젯(hideable: false)은 저장값이 숨김이어도 보인다
 */
export function dashboardLayoutOf(
  widgets: readonly Pick<DashboardWidget, 'id' | 'hideable'>[],
  layout?: DashboardLayout | null,
): DashboardLayoutItem[] {
  const byId = new Map(widgets.map((w) => [w.id, w]));
  const seen = new Set<string>();
  const out: DashboardLayoutItem[] = [];
  for (const item of layout ?? []) {
    const w = byId.get(item.id);
    if (!w || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item.hidden && w.hideable !== false ? { id: item.id, hidden: true } : { id: item.id });
  }
  for (const w of widgets) if (!seen.has(w.id)) out.push({ id: w.id });
  return out;
}

/** id 위젯을 to번째(0부터)로 옮긴 새 배치. 범위 밖 to는 처음 · 끝으로 */
export function moveDashboardWidget(
  layout: DashboardLayout,
  id: string,
  to: number,
): DashboardLayoutItem[] {
  const from = layout.findIndex((i) => i.id === id);
  if (from < 0) return [...layout];
  const next = [...layout];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item!);
  return next;
}

/** id 위젯의 숨김을 바꾼 새 배치 */
export function setDashboardWidgetHidden(
  layout: DashboardLayout,
  id: string,
  hidden: boolean,
): DashboardLayoutItem[] {
  return layout.map((i) => (i.id === id ? (hidden ? { id, hidden: true } : { id }) : i));
}

export interface DashboardGridProps extends ContractBase {
  /** 위젯 목록. 주면 children 대신 이것을 layout 순서로 그린다(편집 모드를 쓸 수 있다) */
  widgets?: readonly DashboardWidget[];
  /** 배치(제어). 앱이 저장해 둔 값 */
  layout?: DashboardLayout;
  /** 처음 배치(비제어) */
  defaultLayout?: DashboardLayout;
  /** 순서를 바꾸거나 숨기면 전체 배치로 알린다. 앱은 이 값을 저장한다 */
  onLayoutChange?: (layout: DashboardLayout) => void;
  /** 편집 모드: 위젯마다 옮기기 손잡이 · 앞뒤 단추 · 숨기기. 숨긴 위젯도 접힌 칸으로 보인다 */
  editing?: boolean;
  /** 칸 사이: gutter = density.gutter, tight = space.12 */
  gap?: 'gutter' | 'tight';
  /** 격자 이름(편집 모드 목록의 이름). 화면 제목과 같게 */
  label?: string;
  /** widgets가 없을 때: DashboardGridItem들(고정 배치) */
  children?: unknown;
}

export const DashboardGridContract = defineContract<DashboardGridProps>({
  name: 'DashboardGrid',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    widgets: {
      type: 'DashboardWidget[]',
      description:
        '위젯(id · title · span · rows · hideable · content). 주면 편집 모드를 쓸 수 있다',
    },
    layout: { type: 'DashboardLayout', description: '배치(제어): { id, hidden? }[] 순서대로' },
    defaultLayout: { type: 'DashboardLayout', description: '처음 배치(비제어)' },
    onLayoutChange: {
      type: '(layout: DashboardLayout) => void',
      description: '순서 · 숨김을 바꿀 때 전체 배치로(앱이 저장)',
    },
    editing: { type: 'boolean', default: false, description: '편집 모드(옮기기 · 숨기기)' },
    gap: {
      type: "'gutter' | 'tight'",
      default: 'gutter',
      values: ['gutter', 'tight'],
      description: '칸 사이 간격',
    },
    label: { type: 'string', description: '격자 이름(편집 모드 목록 이름). 화면 제목과 같게' },
    children: { type: 'ReactNode', description: 'widgets가 없을 때 DashboardGridItem들' },
  },
  states: ['default', 'hover', 'focus'],
  a11y: {
    role: 'list',
    keyboard: [
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Enter',
      'Space',
    ],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
