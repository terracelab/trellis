import { defineContract, type ContractBase } from '../_base.js';

export interface ActionBarProps extends ContractBase {
  /** 버튼들. 주 동작(primary)이 맨 오른쪽, 취소는 그 왼쪽 */
  children?: unknown;
  /** 왼쪽 요약(3건 선택 · 합계) */
  summary?: unknown;
  /** 스크롤 영역 아래에 붙는다(위 구분선 + bg.surface) */
  sticky?: boolean;
  /** 생략하면 summary가 있을 때 between, 없을 때 end */
  align?: 'end' | 'between';
}

export const ActionBarContract = defineContract<ActionBarProps>({
  name: 'ActionBar',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    children: { type: 'ReactNode', description: '버튼들(주 동작이 맨 오른쪽)' },
    summary: { type: 'ReactNode', description: '왼쪽 요약' },
    sticky: { type: 'boolean', default: false, description: '아래 고정' },
    align: {
      type: "'end' | 'between'",
      values: ['end', 'between'],
      description: '정렬(summary가 있으면 between, 없으면 end)',
    },
  },
  states: ['default'],
  a11y: { role: 'group', keyboard: ['Tab'], labelling: 'children' },
  slots: ['summary'],
  platforms: { web: true, native: true },
});
