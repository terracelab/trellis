// 화면 블록 등록부: blocks/src/<group>/<module>/<screen>/{block.json,index.tsx}를 빌드 때 모은다.
// 새 블록은 폴더만 추가하면 메뉴 · 목록 · 라우트에 나타난다.
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export interface BlockMeta {
  id: string;
  title: string;
  intent: string;
  module: string;
  pattern: string;
  industries: string[];
  components: string[];
  sizes: number[];
  slots?: string[];
  status?: 'preview' | 'stable';
  order?: number;
}

const metas = import.meta.glob<BlockMeta>('../../../blocks/src/*/*/*/block.json', {
  eager: true,
  import: 'default',
});
const screens = import.meta.glob<{ default: ComponentType }>('../../../blocks/src/*/*/*/index.tsx');

const idOf = (path: string) =>
  path.replace('../../../blocks/src/', '').replace(/\/(block\.json|index\.tsx)$/, '');

export const BLOCKS: readonly BlockMeta[] = Object.entries(metas)
  .map(([, m]) => m)
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.id.localeCompare(b.id));

const loaders = new Map(Object.entries(screens).map(([path, load]) => [idOf(path), load]));
const cache = new Map<string, LazyExoticComponent<ComponentType>>();

export function screenOf(id: string): LazyExoticComponent<ComponentType> | null {
  const load = loaders.get(id);
  if (!load) return null;
  if (!cache.has(id)) cache.set(id, lazy(load));
  return cache.get(id)!;
}

export const blockById = (id: string) => BLOCKS.find((b) => b.id === id);
/** 데모에 있는 화면 id. PlatformProvider screens로 넘겨 블록이 없는 화면으로 링크하지 않게 한다 */
export const SCREEN_IDS: readonly string[] = BLOCKS.map((b) => b.id);
export const blocksOfModule = (module: string) => BLOCKS.filter((b) => b.module === module);
