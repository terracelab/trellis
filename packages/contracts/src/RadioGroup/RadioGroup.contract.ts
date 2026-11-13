import { defineContract, type ContractBase } from '../_base.js';

export interface RadioOption {
  value: string;
  label: string;
  /** 라벨 아래 한 줄 설명 */
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends ContractBase {
  options: readonly RadioOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** vertical = 한 줄에 하나(설명이 있을 때), horizontal = 한 줄에 나란히(3개 이하) */
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
  name?: string;
  /** Field 밖에서 쓸 때의 접근성 이름. Field 안이면 Field 라벨이 이름이 된다 */
  label?: string;
}

export const RadioGroupContract = defineContract<RadioGroupProps>({
  name: 'RadioGroup',
  props: {
    id: { type: 'string', description: '그룹 id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    options: { type: 'RadioOption[]', required: true, description: '선택지' },
    value: { type: 'string | null', description: '값(제어)' },
    defaultValue: { type: 'string | null', description: '처음 값(비제어)' },
    onChange: { type: '(value: string) => void', description: '바뀔 때' },
    orientation: {
      type: "'vertical' | 'horizontal'",
      default: 'vertical',
      values: ['vertical', 'horizontal'],
      description: '배치 방향',
    },
    disabled: { type: 'boolean', default: false, description: '전체 비활성' },
    name: { type: 'string', description: '폼 이름' },
    label: { type: 'string', description: '접근성 이름(Field 밖)' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: {
    role: 'radiogroup',
    keyboard: ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
