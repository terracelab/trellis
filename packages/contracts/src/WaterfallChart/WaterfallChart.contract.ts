import { defineContract, type ContractBase } from '../_base.js';
import { CHART_PROP_META, type ValueFormatter, type WaterfallStep } from '../charts/_shared.js';

export interface WaterfallChartProps extends ContractBase {
  steps: readonly WaterfallStep[];
  unit?: string;
  height?: number;
  format?: ValueFormatter;
  /** updown: 증가 finance.income(빨강)·감소 finance.expense(파랑). neutral: 가격 구성처럼 모두 series-1 */
  polarity?: 'updown' | 'neutral';
  /** 기준선(예산·전년) */
  reference?: { value: number; label: string };
  ariaLabel: string;
}

export const WaterfallChartContract = defineContract<WaterfallChartProps>({
  name: 'WaterfallChart',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    steps: {
      type: 'WaterfallStep[]',
      required: true,
      description: 'start → delta… → total. 라벨은 2~4자',
    },
    unit: CHART_PROP_META.unit,
    height: { ...CHART_PROP_META.height, default: 220 },
    format: CHART_PROP_META.format,
    polarity: {
      type: "'updown' | 'neutral'",
      default: 'updown',
      values: ['updown', 'neutral'],
      description: '증감 색 규칙',
    },
    reference: { type: '{ value; label }', description: '기준선' },
    ariaLabel: CHART_PROP_META.ariaLabel,
  },
  states: ['default', 'hover'],
  a11y: { role: 'img', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
