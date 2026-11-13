import { defineContract, type ContractBase } from '../_base.js';

export interface SwitchProps extends ContractBase {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** 라벨. 켜면 무엇이 되는지를 명사로(자동 발행 · 메일 알림) */
  children?: unknown;
  /** 라벨 아래 한 줄 설명 */
  description?: string;
  disabled?: boolean;
  /** lg는 손가락 크기(track 48 × 28). touch 밀도에서 size를 주지 않으면 lg로 그린다 */
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}

export const SwitchContract = defineContract<SwitchProps>({
  name: 'Switch',
  props: {
    id: { type: 'string', description: '숨은 input id(Field 안이면 자동)' },
    testID: { type: 'string', description: '테스트 식별자' },
    checked: { type: 'boolean', description: '켬(제어)' },
    defaultChecked: { type: 'boolean', default: false, description: '처음 켬(비제어)' },
    onChange: { type: '(checked: boolean) => void', description: '바뀔 때(즉시 적용)' },
    children: { type: 'ReactNode', description: '라벨' },
    description: { type: 'string', description: '라벨 아래 설명' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    size: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      values: ['sm', 'md', 'lg'],
      description: '크기(touch 밀도 기본 lg)',
    },
    name: { type: 'string', description: '폼 이름' },
  },
  states: ['default', 'hover', 'focus', 'disabled'],
  a11y: { role: 'switch', keyboard: ['Space', 'Enter'], labelling: 'children' },
  platforms: { web: true, native: true },
});
