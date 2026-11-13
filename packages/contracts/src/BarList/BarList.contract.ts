import { defineContract, type ContractBase } from '../_base.js';
import {
  CHART_PROP_META,
  type ChartColor,
  type Slice,
  type ValueFormatter,
} from '../charts/_shared.js';

export interface BarListProps extends ContractBase {
  /** 범주(요일·지사·분류)별 값. 명목 범주는 같은 색 한 가지 */
  data: readonly Slice[];
  unit?: string;
  /** 이름이 길거나 6개를 넘으면 horizontal */
  layout?: 'vertical' | 'horizontal';
  height?: number;
  showValues?: boolean;
  format?: ValueFormatter;
  /** 축 최댓값(열 간 비교를 맞출 때) */
  max?: number;
  color?: ChartColor;
  /** 최고 · 최저 막대에만 값 글자(많은 막대 중 끝만 읽게). showValues보다 앞선다 */
  extremes?: boolean;
  /** 막대를 누르면(그 범주 목록으로). 주면 막대가 단추가 되어 Tab · Enter로도 누른다 */
  onBarPress?: (item: Slice) => void;
  ariaLabel: string;
}

export const BarListContract = defineContract<BarListProps>({
  name: 'BarList',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    data: { type: 'Slice[]', required: true, description: '범주별 값' },
    unit: CHART_PROP_META.unit,
    layout: {
      type: "'vertical' | 'horizontal'",
      default: 'vertical',
      values: ['vertical', 'horizontal'],
      description: '막대 방향',
    },
    height: { ...CHART_PROP_META.height, default: 240 },
    showValues: { type: 'boolean', default: false, description: '막대 끝에 값 글자' },
    format: CHART_PROP_META.format,
    max: { type: 'number', description: '축 최댓값 고정' },
    color: { type: 'ChartColor', default: 'series-1', description: '막대 색(한 가지)' },
    extremes: {
      type: 'boolean',
      default: false,
      description: '최고 · 최저 막대에만 값 글자',
    },
    onBarPress: {
      type: '(item: Slice) => void',
      description: '막대를 누를 때. 주면 막대가 단추(Tab · Enter · Space)',
    },
    ariaLabel: CHART_PROP_META.ariaLabel,
  },
  states: ['default', 'hover'],
  // onBarPress가 있으면 루트는 group, 막대는 button(Tab · Enter · Space)
  a11y: {
    role: 'img',
    keyboard: ['Tab(onBarPress일 때 막대)', 'Enter', 'Space'],
    labelling: 'aria-label',
  },
  platforms: { web: true, native: true },
});
