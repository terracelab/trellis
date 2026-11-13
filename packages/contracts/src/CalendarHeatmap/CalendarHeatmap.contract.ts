import { defineContract, type ContractBase } from '../_base.js';
import { CHART_PROP_META, type HeatDatum, type ValueFormatter } from '../charts/_shared.js';

export interface CalendarHeatmapProps extends ContractBase {
  data: readonly HeatDatum[];
  unit?: string;
  format?: ValueFormatter;
  /** auto: 6주 이하면 달력(월), 더 길면 연간(주 × 요일) */
  layout?: 'auto' | 'month' | 'year';
  ariaLabel: string;
}

export const CalendarHeatmapContract = defineContract<CalendarHeatmapProps>({
  name: 'CalendarHeatmap',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    data: { type: 'HeatDatum[]', required: true, description: '날짜별 값. 0·없음은 빈 칸' },
    unit: CHART_PROP_META.unit,
    format: CHART_PROP_META.format,
    layout: {
      type: "'auto' | 'month' | 'year'",
      default: 'auto',
      values: ['auto', 'month', 'year'],
      description: '모양',
    },
    ariaLabel: CHART_PROP_META.ariaLabel,
  },
  states: ['default', 'hover'],
  a11y: { role: 'img', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
