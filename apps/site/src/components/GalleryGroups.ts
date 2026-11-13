// 컴포넌트 목록 페이지의 묶음. 어느 컴포넌트가 어느 묶음인지는 손으로 적지 않고 react 패키지의 묶음 파일
// (packages/react/src/core/*.ts · charts/index.ts)이 무엇을 내보내는지 읽어 정한다. 새 컴포넌트는 묶음 파일에
// 들어가면 이 페이지에도 나타나고, 새 묶음 파일이 생기면 아래 GROUPS에 넣을 때까지 빌드가 실패한다.
import manifest from '@terracelab/trellis-react/docs/manifest.json';

const coreFiles = import.meta.glob<string>('../../../../packages/react/src/core/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const chartFiles = import.meta.glob<string>('../../../../packages/react/src/charts/index.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** 화면에 보이는 묶음과 순서. bundles는 묶음 파일 이름(core/<이름>.ts, 차트는 charts) */
export const GROUPS = [
  { id: 'core', label: '기본', bundles: ['index', 'basics'] },
  { id: 'inputs', label: '입력', bundles: ['inputs'] },
  {
    id: 'display',
    label: '표시',
    bundles: ['display', 'surface', 'dashboard', 'files', 'operations'],
  },
  { id: 'menus', label: '메뉴 · 탐색', bundles: ['overlays'] },
  { id: 'review', label: '검토 · 편집', bundles: ['review', 'schedule'] },
  { id: 'people', label: '인사 · 근태', bundles: ['people', 'worktime'] },
  { id: 'agent', label: '에이전트', bundles: ['agent'] },
  { id: 'charts', label: '차트', bundles: ['charts'] },
] as const;

export type GroupId = (typeof GROUPS)[number]['id'];

/** 묶음 파일의 자리와 화면에서 찾을 자리가 다른 것만 옮긴다(결재선은 결재선 편집 옆, 첨부는 표시) */
const MOVED: Record<string, GroupId> = {
  ApprovalLine: 'review',
  Attachment: 'display',
};

const namesIn = (source: string) =>
  [...source.matchAll(/from '\.\.\/([A-Z][A-Za-z0-9]*)\//g)].map((m) => m[1]!);

const bundleOf = new Map<string, string>();
const bundles = [
  ...Object.entries(coreFiles).map(([path, source]) => [/\/([a-z]+)\.ts$/.exec(path)![1]!, source]),
  ...Object.values(chartFiles).map((source) => ['charts', source]),
] as [string, string][];
for (const [bundle, source] of bundles) {
  if (!GROUPS.some((g) => (g.bundles as readonly string[]).includes(bundle)))
    throw new Error(
      `묶음 파일 ${bundle}이 컴포넌트 목록의 어느 묶음에도 없다(GalleryGroups.ts GROUPS)`,
    );
  for (const name of namesIn(source)) {
    const seen = bundleOf.get(name);
    if (seen && seen !== bundle)
      throw new Error(`${name}이 묶음 두 곳에 있다: ${seen} · ${bundle}`);
    bundleOf.set(name, bundle);
  }
}

export interface GalleryItem {
  name: string;
  summary: string;
  examples: readonly string[];
}

const groupIdOf = (name: string): GroupId => {
  const moved = MOVED[name];
  if (moved) return moved;
  const bundle = bundleOf.get(name);
  const group = GROUPS.find((g) => (g.bundles as readonly string[]).includes(bundle ?? ''));
  if (!group) throw new Error(`${name}이 어느 묶음 파일에도 없다(packages/react/src/core/*.ts)`);
  return group.id;
};

/** 묶음마다 컴포넌트(이름순). manifest의 컴포넌트는 전부 정확히 한 번 들어간다 */
export const GALLERY = GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  items: manifest.components
    .filter((c) => groupIdOf(c.name) === group.id)
    .map<GalleryItem>((c) => ({
      name: c.name,
      summary: c.summary,
      examples: c.examples.map((e) => e.name),
    })),
}));

const total = GALLERY.reduce((sum, g) => sum + g.items.length, 0);
if (total !== manifest.components.length)
  throw new Error(
    `컴포넌트 목록이 맞지 않는다: 묶음 합 ${total} · manifest ${manifest.components.length}`,
  );
