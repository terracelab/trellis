import { defineContract, type ContractBase } from '../_base.js';

/** 조직 하나 */
export interface OrgChartNode {
  id: string;
  /** 조직 이름(개발팀) */
  name: string;
  /** 조직장 */
  head?: { name: string; title?: string; src?: string };
  /** 인원(하위 조직 포함 여부는 앱이 정한다) */
  headcount?: number;
  children?: readonly OrgChartNode[];
}

export interface OrgChartProps extends ContractBase {
  /** 최상위 조직(보통 회사 하나) */
  nodes: readonly OrgChartNode[];
  /** 고른 조직(제어) */
  selected?: string | null;
  defaultSelected?: string | null;
  onSelect?: (id: string) => void;
  /** 펼친 조직 id(제어) */
  expanded?: readonly string[];
  /** 처음 펼친 조직. 'all' = 전부(기본) */
  defaultExpanded?: readonly string[] | 'all';
  onExpandedChange?: (expanded: string[]) => void;
  /** 트리 이름(기본 "조직도") */
  label?: string;
}

export const OrgChartContract = defineContract<OrgChartProps>({
  name: 'OrgChart',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    nodes: { type: 'OrgChartNode[]', required: true, description: '조직(하위는 children)' },
    selected: { type: 'string | null', description: '고른 조직(제어)' },
    defaultSelected: { type: 'string | null', description: '처음 고른 조직' },
    onSelect: { type: '(id: string) => void', description: '조직을 고를 때' },
    expanded: { type: 'string[]', description: '펼친 조직(제어)' },
    defaultExpanded: {
      type: "string[] | 'all'",
      default: 'all',
      description: "처음 펼친 조직('all' = 전부)",
    },
    onExpandedChange: { type: '(expanded: string[]) => void', description: '펼침이 바뀔 때' },
    label: { type: 'string', description: '트리 이름(기본 "조직도")' },
  },
  states: ['default', 'hover', 'focus'],
  a11y: {
    role: 'tree',
    keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Space'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
