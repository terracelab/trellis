import { defineContract, SIZES, type ContractBase, type Size } from '../_base.js';

export interface TabItem {
  value: string;
  label: string;
  /** 건수(99+) */
  count?: number;
  disabled?: boolean;
  /** 패널 내용. 없으면 탭 목록만(필터로 쓸 때) */
  content?: unknown;
}

export interface TabsProps extends ContractBase {
  items: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: Size;
  /** 접근성 이름(탭 목록) */
  label?: string;
}

export const TabsContract = defineContract<TabsProps>({
  name: 'Tabs',
  props: {
    id: { type: 'string', description: 'DOM id' },
    testID: { type: 'string', description: '테스트 식별자' },
    items: { type: 'TabItem[]', required: true, description: '탭' },
    value: { type: 'string', description: '선택(제어)' },
    defaultValue: { type: 'string', description: '처음 선택(기본 첫 탭)' },
    onChange: { type: '(value: string) => void', description: '바뀔 때' },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      values: SIZES,
      description: '높이',
    },
    label: { type: 'string', description: '탭 목록 이름' },
  },
  states: ['default', 'hover', 'active', 'focus', 'disabled'],
  a11y: {
    role: 'tablist',
    keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
    labelling: 'label-prop',
  },
  platforms: { web: true, native: true },
});
