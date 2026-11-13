import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

export interface ButtonProps extends ContractBase {
  /** primary = 화면의 주 동작 하나, secondary = 기본, ghost = 표 · 툴바 안, danger = 되돌릴 수 없는 동작 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: Size;
  /** 앞 아이콘 */
  icon?: IconName;
  /** 뒤 아이콘(드롭다운 · 다음 단계) */
  iconEnd?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /**
   * 비활성 이유(권한 없음 · 마감 지남). disabled와 함께 주면 포커스가 닿는 aria-disabled 단추가 되고,
   * 이유를 툴팁(가리킴 · 키보드 포커스)과 aria-describedby로 알린다
   */
  disabledReason?: string;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onPress?: () => void;
  /** 라벨. 동사 어간 또는 명사 2~5자(content.md §5) */
  children?: unknown;
}

export const ButtonContract = defineContract<ButtonProps>({
  name: 'Button',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    variant: {
      type: "'primary' | 'secondary' | 'ghost' | 'danger'",
      default: 'secondary',
      values: ['primary', 'secondary', 'ghost', 'danger'],
      description: '역할',
    },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '높이(밀도 토큰)',
    },
    icon: { type: 'IconName', description: '앞 아이콘' },
    iconEnd: { type: 'IconName', description: '뒤 아이콘' },
    loading: { type: 'boolean', default: false, description: '진행 중(누를 수 없고 스피너)' },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    disabledReason: {
      type: 'string',
      description: '비활성 이유(disabled와 함께. 포커스 유지 · 툴팁 · aria-describedby)',
    },
    fullWidth: { type: 'boolean', default: false, description: '부모 폭 전체' },
    type: { type: "'button' | 'submit' | 'reset'", default: 'button', description: '폼 동작' },
    onPress: { type: '() => void', description: '눌렀을 때' },
    children: { type: 'ReactNode', description: '라벨' },
  },
  states: ['default', 'hover', 'active', 'focus', 'disabled', 'loading'],
  a11y: { role: 'button', keyboard: ['Enter', 'Space'], labelling: 'children' },
  platforms: { web: true, native: true },
});
