import { defineContract, type ContractBase } from '../_base.js';
import type { ChartColor, ValueFormatter } from '../charts/_shared.js';

export interface DataBarProps extends ContractBase {
  value: number;
  /** 같은 열의 최댓값. 다른 열과 견주지 않는다 */
  max: number;
  width?: number;
  /** 기준선(안전재고 같은) 표식 */
  marker?: number;
  /** 이 값 아래면 danger 색 + 경고 아이콘 */
  warnBelow?: number;
  format?: ValueFormatter;
  unit?: string;
  color?: ChartColor;
  /** 접근성 이름(열 이름). 없으면 값만 읽힌다 */
  label?: string;
}

export const DataBarContract = defineContract<DataBarProps>({
  name: 'DataBar',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'number', required: true, description: '값' },
    max: { type: 'number', required: true, description: '열 최댓값' },
    width: { type: 'number', default: 64, description: '막대 너비' },
    marker: { type: 'number', description: '기준선' },
    warnBelow: { type: 'number', description: '경고 경계' },
    format: { type: '(v: number) => string', description: '값 서식' },
    unit: { type: 'string', description: '단위' },
    color: { type: 'ChartColor', default: 'series-1', description: '막대 색' },
    label: { type: 'string', description: '접근성 이름' },
  },
  states: ['default', 'error'],
  a11y: { role: 'img', keyboard: [], labelling: 'aria-label' },
  platforms: { web: true, native: true },
});
