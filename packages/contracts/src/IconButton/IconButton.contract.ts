import type { IconName } from '@terracelab/trellis-icons';
import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

export interface IconButtonProps extends ContractBase {
  icon: IconName;
  /** 접근성 이름이자 툴팁. 동사 어간(알림 · 설정 · 닫기) */
  label: string;
  variant?: 'ghost' | 'secondary' | 'primary';
  size?: Size;
  /** 우상단 카운트(알림 벨). 0이면 숨김 */
  count?: number;
  /** count를 위험 색으로(지연 · 오류, D-35) */
  countTone?: 'neutral' | 'danger';
  disabled?: boolean;
  pressed?: boolean;
  onPress?: () => void;
}

export const IconButtonContract = defineContract<IconButtonProps>({
  name: 'IconButton',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    icon: { type: 'IconName', required: true, description: '아이콘' },
    label: { type: 'string', required: true, description: '접근성 이름 · 툴팁' },
    variant: {
      type: "'ghost' | 'secondary' | 'primary'",
      default: 'ghost',
      values: ['ghost', 'secondary', 'primary'],
      description: '역할',
    },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '정사각 크기',
    },
    count: { type: 'number', description: '카운트 배지(99+)' },
    countTone: {
      type: "'neutral' | 'danger'",
      default: 'danger',
      values: ['neutral', 'danger'],
      description: '카운트 색',
    },
    disabled: { type: 'boolean', default: false, description: '비활성' },
    pressed: { type: 'boolean', description: '토글 상태(aria-pressed)' },
    onPress: { type: '() => void', description: '눌렀을 때' },
  },
  states: ['default', 'hover', 'active', 'focus', 'disabled'],
  a11y: { role: 'button', keyboard: ['Enter', 'Space'], labelling: 'label-prop' },
  platforms: { web: true, native: true },
});
