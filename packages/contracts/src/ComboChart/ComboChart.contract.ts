import { defineContract, type ContractBase } from '../_base.js';
import { CHART_PROP_META, type SeriesDef, type ValueFormatter } from '../charts/_shared.js';

export interface ComboChartLower {
  series: readonly SeriesDef[];
  unit?: string;
  height?: number;
  yFormat?: ValueFormatter;
}

export interface ComboChartProps<T extends object = Record<string, unknown>> extends ContractBase {
  data: readonly T[];
  x: string;
  /**
   * 막대 계열(양). 나란히는 1~2개, stacked면 3개 이상도 된다(구성 추이).
   * 6개 이상이면 앞 5개를 남기고 나머지를 "기타"(compare 회색) 하나로 접는다
   */
  bars: readonly SeriesDef[];
  /** 선은 비교(점선)·목표만 */
  lines?: readonly SeriesDef[];
  stacked?: boolean;
  unit?: string;
  height?: number;
  xFormat?: (value: string | number) => string;
  yFormat?: ValueFormatter;
  /** 단위가 다른 보조 지표는 이중 축 대신 아래 작은 차트로 */
  lower?: ComboChartLower;
  ariaLabel: string;
}

export const ComboChartContract = defineContract<ComboChartProps>({
  name: 'ComboChart',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    data: { type: 'T[]', required: true, description: '행 배열' },
    x: { type: 'keyof T', required: true, description: 'x축 필드' },
    bars: {
      type: 'SeriesDef[]',
      required: true,
      description:
        '막대 계열. 나란히 1~2개, stacked는 3개 이상도. 6개부터 다섯 뒤는 "기타"로 접는다',
    },
    lines: { type: 'SeriesDef[]', default: [], description: '선 계열(비교 점선·목표)' },
    stacked: {
      type: 'boolean',
      default: false,
      description: '막대를 쌓는다(구성 추이). 툴팁에 합계 줄',
    },
    unit: CHART_PROP_META.unit,
    height: { ...CHART_PROP_META.height, default: 240 },
    xFormat: { type: '(v) => string', description: 'x 라벨 서식' },
    yFormat: { type: '(v: number) => string', description: 'y 라벨 서식' },
    lower: { type: 'ComboChartLower', description: '아래 보조 차트(다른 단위). 이중 축의 대체' },
    ariaLabel: CHART_PROP_META.ariaLabel,
  },
  states: ['default', 'hover'],
  a11y: { role: 'img', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
