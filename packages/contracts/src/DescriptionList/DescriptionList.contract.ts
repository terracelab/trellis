import { defineContract, type ContractBase } from '../_base.js';

export interface DescriptionItem {
  /** 명사, 콜론 없음(거래처 · 사업자등록번호) */
  label: string;
  value: unknown;
  /** 차지할 칸 수(columns를 넘으면 columns로 줄인다) */
  span?: 1 | 2 | 3;
  /** 복사 버튼(계좌번호 · 사업자등록번호 · 송장번호) */
  copyable?: boolean;
  /** 복사할 글자. 없으면 value가 글자 · 숫자일 때 그것 */
  copyText?: string;
}

export interface DescriptionListProps extends ContractBase {
  items: readonly DescriptionItem[];
  columns?: 1 | 2 | 3;
  /** horizontal = 라벨 왼쪽(120, compact), vertical = 라벨 위 */
  layout?: 'horizontal' | 'vertical';
}

export const DescriptionListContract = defineContract<DescriptionListProps>({
  name: 'DescriptionList',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    items: {
      type: '{ label: string; value: ReactNode; span?: 1 | 2 | 3; copyable?: boolean; copyText?: string }[]',
      required: true,
      description: '라벨 · 값 쌍',
    },
    columns: {
      type: '1 | 2 | 3',
      default: 2,
      values: ['1', '2', '3'],
      description: '열 수',
    },
    layout: {
      type: "'horizontal' | 'vertical'",
      default: 'horizontal',
      values: ['horizontal', 'vertical'],
      description: '라벨 위치',
    },
  },
  states: ['default', 'hover', 'focus'],
  a11y: { keyboard: ['Tab', 'Enter', 'Space'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
