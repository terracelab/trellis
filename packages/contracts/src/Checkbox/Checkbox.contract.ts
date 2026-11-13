import { defineContract, type ContractBase } from '../_base.js';

export interface CheckboxProps extends ContractBase {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** 일부만 고른 상태(목록 머리의 전체 선택) */
  indeterminate?: boolean;
  /** 라벨. 명사 또는 짧은 평서문 */
  children?: unknown;
  /** 라벨 아래 한 줄 설명 */
  description?: string;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  /** 폼 제출 값(없으면 on) */
  value?: string;
}

export const CheckboxContract = defineContract<CheckboxProps>({
  name: 'Checkbox',
  props: {
    id: { type: 'string', description: '숨은 input id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    checked: { type: 'boolean', description: '선택(제어)' },
    defaultChecked: { type: 'boolean', default: false, description: '처음 선택(비제어)' },
    onChange: { type: '(checked: boolean) => void', description: '선택이 바뀔 때' },
    indeterminate: { type: 'boolean', default: false, description: '일부 선택' },
    children: { type: 'ReactNode', description: '라벨' },
    description: { type: 'string', description: '라벨 아래 설명' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    invalid: { type: 'boolean', default: false, description: '오류' },
    name: { type: 'string', description: '폼 이름' },
    value: { type: 'string', description: '폼 제출 값' },
  },
  states: ['default', 'hover', 'focus', 'disabled', 'error'],
  a11y: { role: 'checkbox', keyboard: ['Space'], labelling: 'children' },
  platforms: { web: true, native: true },
});
