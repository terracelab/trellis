import { defineContract, type ContractBase } from '../_base.js';
import { CHART_PROP_META, type Slice, type ValueFormatter } from '../charts/_shared.js';

export interface SegmentedBarProps extends ContractBase {
  data: readonly Slice[];
  unit?: string;
  /** tall: 값·비율 글자가 들어가는 한 줄 막대. thin: 순위 트랙처럼 얇게(범례 없이) */
  size?: 'tall' | 'thin';
  legend?: boolean;
  format?: ValueFormatter;
  ariaLabel: string;
}

export const SegmentedBarContract = defineContract<SegmentedBarProps>({
  name: 'SegmentedBar',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    data: {
      type: 'Slice[]',
      required: true,
      description: '부분(합 = 전체). 색은 항목 고정 맵에서',
    },
    unit: CHART_PROP_META.unit,
    size: {
      type: "'tall' | 'thin'",
      default: 'tall',
      values: ['tall', 'thin'],
      description: '두께',
    },
    legend: { type: 'boolean', default: true, description: '아래 범례(값·비율)' },
    format: CHART_PROP_META.format,
    ariaLabel: CHART_PROP_META.ariaLabel,
  },
  states: ['default', 'hover'],
  a11y: { role: 'img', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
