import { defineContract, type ContractBase } from '../_base.js';
import type { ValueFormatter } from '../charts/_shared.js';

export interface HeatCellProps extends ContractBase {
  value: number | null | undefined;
  /** 표 전체의 최댓값(행 × 열 어디서나 같은 진하기 척도) */
  max: number;
  format?: ValueFormatter;
  unit?: string;
  align?: 'left' | 'right' | 'center';
  /** 값이 없을 때 글자 */
  empty?: string;
}

export const HeatCellContract = defineContract<HeatCellProps>({
  name: 'HeatCell',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    value: { type: 'number | null', required: true, description: '값. null이면 빈 칸' },
    max: { type: 'number', required: true, description: '표 전체 최댓값' },
    format: { type: '(v: number) => string', description: '값 서식' },
    unit: { type: 'string', description: '단위' },
    align: {
      type: "'left' | 'right' | 'center'",
      default: 'right',
      values: ['left', 'right', 'center'],
      description: '글자 정렬',
    },
    empty: { type: 'string', default: '–', description: '빈 칸 글자' },
  },
  states: ['default'],
  a11y: { keyboard: [], labelling: 'children' },
  platforms: { web: true, native: true },
});
