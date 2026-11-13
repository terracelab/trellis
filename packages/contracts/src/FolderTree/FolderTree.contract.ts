import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';

/** 폴더 하나 */
export interface FolderTreeNode {
  id: string;
  /** 폴더 이름 */
  label: string;
  /** 아이콘(기본 folder) */
  icon?: IconName;
  /** 오른쪽 흐린 숫자(문서 수 · 안 읽은 메일 수) */
  count?: number;
  /** 하위 폴더 */
  children?: readonly FolderTreeNode[];
  disabled?: boolean;
}

export interface FolderTreeProps extends ContractBase {
  nodes: readonly FolderTreeNode[];
  /** 고른 폴더(제어) */
  selected?: string | null;
  /** 처음 고른 폴더 */
  defaultSelected?: string | null;
  onSelect?: (id: string) => void;
  /** 펼친 폴더 id(제어) */
  expanded?: readonly string[];
  /** 처음 펼친 폴더 id */
  defaultExpanded?: readonly string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** 트리 이름(접근성). 없으면 "폴더" */
  label?: string;
}

export const FolderTreeContract = defineContract<FolderTreeProps>({
  name: 'FolderTree',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    nodes: { type: 'FolderTreeNode[]', required: true, description: '폴더(하위는 children)' },
    selected: { type: 'string | null', description: '고른 폴더(제어)' },
    defaultSelected: { type: 'string | null', description: '처음 고른 폴더' },
    onSelect: { type: '(id: string) => void', description: '폴더를 고를 때' },
    expanded: { type: 'string[]', description: '펼친 폴더(제어)' },
    defaultExpanded: { type: 'string[]', default: [], description: '처음 펼친 폴더' },
    onExpandedChange: { type: '(expanded: string[]) => void', description: '펼침이 바뀔 때' },
    label: { type: 'string', description: '트리 이름(기본 "폴더")' },
  },
  states: ['default', 'hover', 'focus', 'disabled'],
  a11y: {
    role: 'tree',
    keyboard: [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'Enter',
      'Space',
      '글자 입력(찾기)',
    ],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
