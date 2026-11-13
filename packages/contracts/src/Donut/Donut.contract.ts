import { defineContract, type ContractBase } from '../_base.js';
import { CHART_PROP_META, type Slice, type ValueFormatter } from '../charts/_shared.js';

export interface DonutProps extends ContractBase {
  /** 5조각 이하. 넘치면 호출자가 "기타"로 접는다 */
  data: readonly Slice[];
  unit?: string;
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  legend?: boolean;
  format?: ValueFormatter;
  ariaLabel: string;
}

export const DonutContract = defineContract<DonutProps>({
  name: 'Donut',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    data: { type: 'Slice[]', required: true, description: '조각(≤ 5 + 기타)' },
    unit: CHART_PROP_META.unit,
    height: { ...CHART_PROP_META.height, default: 200 },
    centerLabel: { type: 'string', description: '가운데 작은 라벨' },
    centerValue: { type: 'string', description: '가운데 큰 값' },
    legend: { type: 'boolean', default: true, description: '옆 범례(값·비율 포함)' },
    format: CHART_PROP_META.format,
    ariaLabel: CHART_PROP_META.ariaLabel,
  },
  states: ['default', 'hover'],
  a11y: { role: 'img', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
