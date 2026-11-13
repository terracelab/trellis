import { defineContract, type ContractBase } from '../_base.js';
import type { LegendItem } from '../charts/_shared.js';

export interface LegendProps extends ContractBase {
  items: readonly LegendItem[];
}

export const LegendContract = defineContract<LegendProps>({
  name: 'Legend',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    items: {
      type: 'LegendItem[]',
      required: true,
      description: '계열 순서대로. 모양은 차트와 같게',
    },
  },
  states: ['default'],
  a11y: { role: 'list', keyboard: [], labelling: 'children' },
  platforms: { web: true, native: true },
});
