// 화면 블록 목록: blocks/src/<group>/<module>/<screen>/block.json을 빌드 때 모은다(데모의 등록부와 같은 출처).
import modules from '@terracelab/trellis-tokens/modules';

export interface BlockMeta {
  id: string;
  title: string;
  intent: string;
  module: string;
  pattern: string;
  industries: string[];
  components: string[];
  sizes: number[];
  order?: number;
}

const metas = import.meta.glob<BlockMeta>('../../../../blocks/src/*/*/*/block.json', {
  eager: true,
  import: 'default',
});

export const BLOCKS: readonly BlockMeta[] = Object.values(metas).sort(
  (a, b) => (a.order ?? 100) - (b.order ?? 100) || a.id.localeCompare(b.id),
);

export const groupOf = (id: string) => id.split('/')[0]!;

/** 묶음 이름. 업무 모듈 묶음은 토큰 패키지의 모듈 등록부에서, 홈 · 플랫폼 기본은 블록에만 있다 */
const MODULE_GROUPS: Record<string, { label: string }> = modules.groups;
export const GROUP_LABEL: Record<string, string> = {
  home: '홈',
  platform: '플랫폼 기본',
  ...Object.fromEntries(Object.entries(MODULE_GROUPS).map(([id, g]) => [id, g.label])),
};

/** 목록에 보이는 묶음 순서 */
export const GROUPS = [
  'home',
  'erp',
  'groupware',
  'scm',
  'commerce',
  'mes',
  'crm',
  'ecm',
  'platform',
]
  .filter((g) => BLOCKS.some((b) => groupOf(b.id) === g))
  .map((id) => ({
    id,
    label: GROUP_LABEL[id] ?? id,
    count: BLOCKS.filter((b) => groupOf(b.id) === id).length,
  }));

export const blockById = (id: string) => {
  const found = BLOCKS.find((b) => b.id === id);
  if (!found) throw new Error(`블록이 없다: ${id}`);
  return found;
};

export const isPhone = (b: BlockMeta) => !b.sizes.includes(1440);
/** public/blocks/ 아래 그림 파일 이름(scripts/shots.mjs와 같은 규칙) */
export const shotFile = (id: string) => id.replaceAll('/', '--');
