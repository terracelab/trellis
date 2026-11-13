import { defineContract, type ContractBase } from '../_base.js';
import { CHART_PROP_META, type ChartColor } from '../charts/_shared.js';

export interface SparklineProps extends ContractBase {
  data: readonly number[];
  width?: number;
  height?: number;
  area?: boolean;
  color?: ChartColor;
  ariaLabel: string;
}

export const SparklineContract = defineContract<SparklineProps>({
  name: 'Sparkline',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    data: {
      type: 'number[]',
      required: true,
      description: '값만. 축·라벨 없음 — 모양만 보여 준다',
    },
    width: { type: 'number', default: 112, description: '너비' },
    height: { type: 'number', default: 32, description: '높이' },
    area: { type: 'boolean', default: true, description: '선 아래 옅은 영역' },
    color: { type: 'ChartColor', default: 'series-1', description: '선 색' },
    ariaLabel: CHART_PROP_META.ariaLabel,
  },
  states: ['default'],
  a11y: { role: 'img', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
