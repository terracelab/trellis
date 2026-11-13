import { defineContract, type ContractBase } from '../_base.js';

export type SkeletonShape = 'text' | 'rect' | 'circle' | 'list' | 'table' | 'kpi' | 'card';

export interface SkeletonProps extends ContractBase {
  /** text = 글자 줄, rect = 블록(차트 · 이미지), circle = 아바타 · 아이콘.
   *  모양 묶음(PR-27): list = 아바타 + 두 줄 행, table = 머리 + 행 · 열, kpi = 이름 · 큰 숫자 · 비교, card = 제목 + 글줄 */
  shape?: SkeletonShape;
  /** CSS 길이(100% · var(--tl-space-64)). 기본 text · rect 100%, circle 32 */
  width?: string;
  /** CSS 길이. 기본 text 한 줄 높이, rect 64, circle = width */
  height?: string;
  /** text · card = 글줄 수(마지막 줄 60%), list · table = 행 수 */
  lines?: number;
  /** table 열 수(기본 5) */
  columns?: number;
  /** 바로 보이기. 기본은 normal(150ms) 뒤 나타나 빠른 응답에 깜빡이지 않는다 */
  immediate?: boolean;
}

export const SkeletonContract = defineContract<SkeletonProps>({
  name: 'Skeleton',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    shape: {
      type: "'text' | 'rect' | 'circle' | 'list' | 'table' | 'kpi' | 'card'",
      default: 'text',
      values: ['text', 'rect', 'circle', 'list', 'table', 'kpi', 'card'],
      description: '모양(낱개 3 · 묶음 4)',
    },
    width: { type: 'string', description: '폭(CSS 길이)' },
    height: { type: 'string', description: '높이(CSS 길이)' },
    lines: { type: 'number', default: 1, description: '글줄 수 · 행 수(list · table 기본 5)' },
    columns: { type: 'number', default: 5, description: 'table 열 수' },
    immediate: { type: 'boolean', default: false, description: '지연 없이 바로 보이기' },
  },
  states: ['loading'],
  a11y: { keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
