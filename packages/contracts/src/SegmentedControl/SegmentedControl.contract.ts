import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, type ContractBase } from '../_base.js';

export interface SegmentedOption {
  value: string;
  /** 명사 2~6자(전체 · 진행 · 승인) */
  label: string;
  icon?: IconName;
  /** 라벨 뒤 건수(99+) */
  count?: number;
}

export interface SegmentedControlProps extends ContractBase {
  options: readonly SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  /** 부모 폭을 채우고 칸을 같은 폭으로 나눈다 */
  fullWidth?: boolean;
  disabled?: boolean;
  name?: string;
  /** Field 밖에서 쓸 때의 접근성 이름 */
  label?: string;
}

export const SegmentedControlContract = defineContract<SegmentedControlProps>({
  name: 'SegmentedControl',
  props: {
    id: { type: 'string', description: '그룹 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    options: { type: 'SegmentedOption[]', required: true, description: '칸(2~5개)' },
    value: { type: 'string', description: '값(제어)' },
    defaultValue: { type: 'string', description: '처음 값(없으면 첫 칸)' },
    onChange: { type: '(value: string) => void', description: '바뀔 때' },
    size: { type: "'sm' | 'md'", default: 'md', values: ['sm', 'md'], description: '높이' },
    fullWidth: { type: 'boolean', default: false, description: '부모 폭 전체' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    name: { type: 'string', description: '폼 이름' },
    label: { type: 'string', description: '접근성 이름(Field 밖)' },
  },
  states: ['default', 'hover', 'focus', 'disabled'],
  a11y: {
    role: 'radiogroup',
    keyboard: ['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
